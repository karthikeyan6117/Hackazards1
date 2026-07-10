import json
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.endpoint import Endpoint
from app.models.incident import Incident, TimelineEvent
from app.models.monitoring_result import MonitoringResult

logger = logging.getLogger(__name__)


def create_incident(
    db: Session, endpoint: Endpoint, result: MonitoringResult
) -> Incident:
    status_code_str = str(result.status_code) if result.status_code else "N/A"
    title = f"{endpoint.name} is down"
    description = (
        f"Endpoint {endpoint.name} ({endpoint.url}) returned status "
        f"{status_code_str} with latency {result.latency}ms."
    )
    severity = (
        "critical"
        if result.status_code is None or result.status_code >= 500
        else "warning"
    )

    incident = Incident(
        endpoint_id=endpoint.id,
        title=title,
        description=description,
        severity=severity,
        status="open",
        started_at=datetime.now(timezone.utc),
    )
    db.add(incident)
    db.flush()

    timeline = TimelineEvent(
        incident_id=incident.id,
        timestamp=datetime.now(timezone.utc),
        event=f"Incident detected: {description}",
        type="detection",
    )
    db.add(timeline)
    db.commit()
    db.refresh(incident)
    logger.info("Created incident #%d for endpoint %s", incident.id, endpoint.name)
    return incident


def resolve_incident(db: Session, incident: Incident, endpoint: Endpoint) -> None:
    incident.status = "resolved"
    incident.resolved_at = datetime.now(timezone.utc)
    timeline = TimelineEvent(
        incident_id=incident.id,
        timestamp=datetime.now(timezone.utc),
        event=f"Endpoint {endpoint.name} is back to operational status.",
        type="resolution",
    )
    db.add(timeline)
    db.commit()
    db.refresh(incident)
    logger.info("Resolved incident #%d for endpoint %s", incident.id, endpoint.name)


def get_active_incident_for_endpoint(
    db: Session, endpoint_id: int
) -> Optional[Incident]:
    return (
        db.query(Incident)
        .filter(
            Incident.endpoint_id == endpoint_id,
            Incident.status.in_(["open", "investigating"]),
        )
        .order_by(Incident.started_at.desc())
        .first()
    )


def handle_monitoring_result(
    db: Session, endpoint: Endpoint, result: MonitoringResult
) -> Optional[Incident]:
    is_down = not result.success or (
        result.status_code is not None and result.status_code >= 500
    )
    active_incident = get_active_incident_for_endpoint(db, endpoint.id)

    if is_down:
        if not active_incident:
            incident = create_incident(db, endpoint, result)
            return incident
        return active_incident
    else:
        if active_incident:
            resolve_incident(db, active_incident, endpoint)
        return None
