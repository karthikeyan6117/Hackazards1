import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.incident import Incident, TimelineEvent
from app.schemas.incident import IncidentResponse, TimelineEventSchema

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def _incident_to_response(incident: Incident) -> IncidentResponse:
    timeline = []
    for te in incident.timeline_events or []:
        timeline.append(
            TimelineEventSchema(
                timestamp=te.timestamp.isoformat() if te.timestamp else "",
                event=te.event,
                type=te.type,
            )
        )

    evidence: list[str] = []
    if incident.evidence:
        try:
            evidence = json.loads(incident.evidence)
        except (json.JSONDecodeError, TypeError):
            evidence = [incident.evidence] if incident.evidence else []

    recommendations: list[str] = []
    if incident.recommendations:
        try:
            recommendations = json.loads(incident.recommendations)
        except (json.JSONDecodeError, TypeError):
            recommendations = (
                [incident.recommendations] if incident.recommendations else []
            )

    return IncidentResponse(
        id=str(incident.id),
        endpointId=str(incident.endpoint_id),
        title=incident.title,
        description=incident.description,
        severity=incident.severity,
        status=incident.status,
        startTime=incident.started_at.isoformat() if incident.started_at else "",
        endTime=incident.resolved_at.isoformat() if incident.resolved_at else None,
        rootCause=incident.root_cause,
        confidenceScore=incident.confidence_score,
        evidence=evidence,
        recommendations=recommendations,
        timeline=timeline,
    )


@router.get("", response_model=list[IncidentResponse])
def list_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).order_by(Incident.started_at.desc()).all()
    return [_incident_to_response(inc) for inc in incidents]


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with id '{incident_id}' not found",
        )
    return _incident_to_response(incident)
