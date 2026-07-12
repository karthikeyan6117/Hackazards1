import logging

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.endpoint import Endpoint
from app.models.incident import Incident
from app.schemas.incident import DashboardMetrics

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total = db.query(func.count(Endpoint.id)).scalar() or 0
    up = db.query(func.count(Endpoint.id)).filter(Endpoint.status == "up").scalar() or 0
    degraded = (
        db.query(func.count(Endpoint.id)).filter(Endpoint.status == "degraded").scalar()
        or 0
    )
    down = (
        db.query(func.count(Endpoint.id)).filter(Endpoint.status == "down").scalar()
        or 0
    )
    active = (
        db.query(func.count(Incident.id))
        .filter(Incident.status.in_(["open", "investigating"]))
        .scalar()
        or 0
    )

    avg_latency = (
        db.query(func.avg(Endpoint.average_latency))
        .filter(Endpoint.average_latency > 0)
        .scalar()
        or 0.0
    )

    total_endpoints_for_uptime = up + degraded + down
    uptime_pct = 100.0
    if total_endpoints_for_uptime > 0:
        uptime_pct = round((up / total_endpoints_for_uptime) * 100, 2)

    return DashboardMetrics(
        totalEndpoints=total,
        activeIncidents=active,
        upEndpoints=up,
        downEndpoints=down,
        avgLatency=round(avg_latency, 2),
        uptimePercentage=uptime_pct,
    )
