import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.endpoint import Endpoint
from app.schemas.endpoint import EndpointStatusResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/status", tags=["status"])


@router.get("", response_model=list[EndpointStatusResponse])
def get_status_page(db: Session = Depends(get_db)):
    endpoints = db.query(Endpoint).order_by(Endpoint.name.asc()).all()
    return [
        EndpointStatusResponse(
            id=str(ep.id),
            name=ep.name,
            url=ep.url,
            status=ep.status if ep.status in ("up", "down", "degraded") else "unknown",
            uptime=ep.uptime,
            latency=ep.average_latency,
        )
        for ep in endpoints
    ]
