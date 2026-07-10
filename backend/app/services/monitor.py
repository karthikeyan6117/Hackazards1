import logging
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.endpoint import Endpoint
from app.models.incident import Incident, TimelineEvent
from app.models.monitoring_result import MonitoringResult

logger = logging.getLogger(__name__)


def determine_endpoint_status(status_code: int | None, success: bool) -> str:
    if not success:
        return "down"
    if status_code is None:
        return "down"
    if 200 <= status_code <= 399:
        return "up"
    if 400 <= status_code <= 499:
        return "degraded"
    if status_code >= 500:
        return "down"
    return "unknown"


def compute_uptime(db: Session, endpoint_id: int, window_hours: int = 24) -> float:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=window_hours)
    total = (
        db.query(func.count(MonitoringResult.id))
        .filter(
            MonitoringResult.endpoint_id == endpoint_id,
            MonitoringResult.checked_at >= cutoff,
        )
        .scalar()
        or 0
    )
    if total == 0:
        return 100.0
    successful = (
        db.query(func.count(MonitoringResult.id))
        .filter(
            MonitoringResult.endpoint_id == endpoint_id,
            MonitoringResult.success == True,
            MonitoringResult.checked_at >= cutoff,
        )
        .scalar()
        or 0
    )
    return round((successful / total) * 100, 2)


def compute_average_latency(
    db: Session, endpoint_id: int, window_hours: int = 24
) -> float:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=window_hours)
    result = (
        db.query(func.avg(MonitoringResult.latency))
        .filter(
            MonitoringResult.endpoint_id == endpoint_id,
            MonitoringResult.checked_at >= cutoff,
        )
        .scalar()
    )
    return round(result, 2) if result else 0.0


async def check_endpoint(db: Session, endpoint: Endpoint) -> MonitoringResult:
    latency = 0.0
    status_code = None
    success = False

    try:
        async with httpx.AsyncClient(
            timeout=settings.REQUEST_TIMEOUT_SECONDS
        ) as client:
            start = datetime.now(timezone.utc)
            response = await client.get(endpoint.url, follow_redirects=True)
            end = datetime.now(timezone.utc)
            latency = round((end - start).total_seconds() * 1000, 2)
            status_code = response.status_code
            success = 200 <= status_code <= 399
    except httpx.TimeoutException:
        logger.warning("Timeout checking endpoint %s (%s)", endpoint.name, endpoint.url)
        latency = settings.REQUEST_TIMEOUT_SECONDS * 1000.0
    except httpx.RequestError as e:
        logger.error(
            "Request failed for endpoint %s (%s): %s",
            endpoint.name,
            endpoint.url,
            str(e),
        )
    except Exception as e:
        logger.exception(
            "Unexpected error checking endpoint %s: %s", endpoint.name, str(e)
        )

    result = MonitoringResult(
        endpoint_id=endpoint.id,
        status_code=status_code,
        latency=latency,
        success=success,
        checked_at=datetime.now(timezone.utc),
    )
    db.add(result)

    new_status = determine_endpoint_status(status_code, success)
    endpoint.status = new_status
    endpoint.average_latency = compute_average_latency(db, endpoint.id)
    endpoint.uptime = compute_uptime(db, endpoint.id)
    endpoint.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(result)
    return result


def get_latest_monitoring_result(
    db: Session, endpoint_id: int
) -> MonitoringResult | None:
    return (
        db.query(MonitoringResult)
        .filter(MonitoringResult.endpoint_id == endpoint_id)
        .order_by(MonitoringResult.checked_at.desc())
        .first()
    )


async def monitor_all_endpoints(db: Session) -> None:
    endpoints = db.query(Endpoint).all()
    for endpoint in endpoints:
        try:
            result = await check_endpoint(db, endpoint)
            logger.info(
                "Checked %s (%s): status=%s, latency=%sms",
                endpoint.name,
                endpoint.url,
                result.status_code,
                result.latency,
            )
        except Exception as e:
            logger.exception("Failed to check endpoint %s: %s", endpoint.name, str(e))
