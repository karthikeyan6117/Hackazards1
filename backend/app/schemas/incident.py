from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TimelineEventSchema(BaseModel):
    timestamp: str
    event: str
    type: str

    class Config:
        from_attributes = True


class IncidentResponse(BaseModel):
    id: str
    endpointId: str
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    startTime: str
    endTime: Optional[str] = None
    rootCause: Optional[str] = None
    confidenceScore: Optional[float] = None
    evidence: list[str] = []
    recommendations: list[str] = []
    timeline: list[TimelineEventSchema] = []

    class Config:
        from_attributes = True


class DashboardMetrics(BaseModel):
    totalEndpoints: int
    activeIncidents: int
    upEndpoints: int
    downEndpoints: int
    avgLatency: float
    uptimePercentage: float

    class Config:
        from_attributes = True
