import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.endpoint import Endpoint
from app.schemas.endpoint import EndpointCreate, EndpointResponse, EndpointUpdate, MonitoringResultResponse
from app.models.monitoring_result import MonitoringResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/endpoints", tags=["endpoints"])


def _endpoint_to_response(endpoint: Endpoint) -> EndpointResponse:
    last_checked = None
    if endpoint.updated_at:
        last_checked = endpoint.updated_at.isoformat()
    return EndpointResponse(
        id=str(endpoint.id),
        name=endpoint.name,
        url=endpoint.url,
        status=endpoint.status
        if endpoint.status in ("up", "down", "degraded")
        else "unknown",
        uptime=endpoint.uptime,
        lastChecked=last_checked,
        latency=endpoint.average_latency,
        check_interval_seconds=endpoint.check_interval_seconds,
    )


@router.get("", response_model=list[EndpointResponse])
def list_endpoints(db: Session = Depends(get_db)):
    endpoints = db.query(Endpoint).order_by(Endpoint.created_at.desc()).all()
    return [_endpoint_to_response(ep) for ep in endpoints]


@router.post("", response_model=EndpointResponse, status_code=status.HTTP_201_CREATED)
def create_endpoint(body: EndpointCreate, db: Session = Depends(get_db)):
    existing = db.query(Endpoint).filter(Endpoint.url == body.url).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Endpoint with URL '{body.url}' already exists",
        )
    endpoint = Endpoint(
        name=body.name,
        url=body.url,
        status="unknown",
        uptime=100.0,
        average_latency=0.0,
        check_interval_seconds=body.check_interval_seconds,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(endpoint)
    db.commit()
    db.refresh(endpoint)
    logger.info("Created endpoint: %s (%s)", endpoint.name, endpoint.url)
    return _endpoint_to_response(endpoint)


@router.put("/{endpoint_id}", response_model=EndpointResponse)
def update_endpoint(
    endpoint_id: int, body: EndpointUpdate, db: Session = Depends(get_db)
):
    endpoint = db.query(Endpoint).filter(Endpoint.id == endpoint_id).first()
    if not endpoint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Endpoint with id '{endpoint_id}' not found",
        )
    if body.name is not None:
        endpoint.name = body.name
    if body.url is not None:
        existing = (
            db.query(Endpoint)
            .filter(Endpoint.url == body.url, Endpoint.id != endpoint_id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Endpoint with URL '{body.url}' already exists",
            )
        endpoint.url = body.url
    if body.check_interval_seconds is not None:
        endpoint.check_interval_seconds = body.check_interval_seconds
    endpoint.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(endpoint)
    logger.info("Updated endpoint #%d", endpoint.id)
    return _endpoint_to_response(endpoint)


@router.delete("/{endpoint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_endpoint(endpoint_id: int, db: Session = Depends(get_db)):
    endpoint = db.query(Endpoint).filter(Endpoint.id == endpoint_id).first()
    if not endpoint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Endpoint with id '{endpoint_id}' not found",
        )
    db.delete(endpoint)
    db.commit()
    logger.info("Deleted endpoint #%d", endpoint_id)


@router.get("/{endpoint_id}/results", response_model=list[MonitoringResultResponse])
def list_endpoint_results(endpoint_id: int, db: Session = Depends(get_db)):
    endpoint = db.query(Endpoint).filter(Endpoint.id == endpoint_id).first()
    if not endpoint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Endpoint with id '{endpoint_id}' not found",
        )
    
    results = (
        db.query(MonitoringResult)
        .filter(MonitoringResult.endpoint_id == endpoint_id)
        .order_by(MonitoringResult.checked_at.desc())
        .limit(100)
        .all()
    )
    return results

