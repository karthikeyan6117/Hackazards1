import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.db.database import SessionLocal

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def scheduled_monitor_job() -> None:
    from app.services.monitor import monitor_all_endpoints
    from app.services.incident_service import handle_monitoring_result

    logger.info("Starting scheduled monitoring cycle")
    db = SessionLocal()
    try:
        from app.models import Endpoint
        from app.services.monitor import check_endpoint, get_latest_monitoring_result
        from datetime import datetime, timezone

        endpoints = db.query(Endpoint).all()
        now = datetime.now(timezone.utc)

        for endpoint in endpoints:
            try:
                last_result = get_latest_monitoring_result(db, endpoint.id)
                last_checked = last_result.checked_at if last_result else endpoint.created_at
                
                # Check if elapsed time is greater than or equal to check_interval_seconds
                if last_checked and (now - last_checked).total_seconds() < endpoint.check_interval_seconds:
                    continue

                result = await check_endpoint(db, endpoint)
                handle_monitoring_result(db, endpoint, result)
                logger.info(
                    "Checked %s (%s): status=%s, latency=%sms",
                    endpoint.name,
                    endpoint.url,
                    result.status_code,
                    result.latency,
                )
            except Exception as e:
                logger.exception(
                    "Failed to check endpoint %s: %s", endpoint.name, str(e)
                )
    finally:
        db.close()
    logger.info("Completed scheduled monitoring cycle")


def start_scheduler() -> None:
    scheduler.add_job(
        scheduled_monitor_job,
        trigger=IntervalTrigger(seconds=settings.SCHEDULER_INTERVAL_SECONDS),
        id="monitor_endpoints",
        name="Check all endpoints",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        "Scheduler started — checking every %d seconds",
        settings.SCHEDULER_INTERVAL_SECONDS,
    )


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")
