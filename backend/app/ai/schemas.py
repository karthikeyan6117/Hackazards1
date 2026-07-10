"""Pydantic models for AI incident analysis."""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class IncidentRequest(BaseModel):
    """Request model for incident analysis."""

    incident_id: str = Field(..., description="Unique identifier for the incident")
    endpoint: str = Field(..., description="API endpoint that triggered the incident")
    status_code: int = Field(..., ge=100, le=599, description="HTTP status code")
    latency: float = Field(..., ge=0, description="Response latency in milliseconds")
    error_message: str = Field(..., description="Error message from the incident")
    logs: List[str] = Field(
        default_factory=list,
        description="Relevant log lines from the incident timeframe",
    )
    recent_incidents: List[str] = Field(
        default_factory=list, description="Descriptions of recent related incidents"
    )
    deployment_info: Optional[str] = Field(
        default=None,
        description="Deployment information (version, commit, deploy time)",
    )
    system_metrics: Dict[str, float] = Field(
        default_factory=dict,
        description="System metrics like CPU, memory, disk, network",
    )
    service_name: Optional[str] = Field(
        default=None, description="Name of the affected service"
    )
    environment: Optional[str] = Field(
        default=None, description="Deployment environment (production, staging, etc.)"
    )
    timestamp: Optional[datetime] = Field(
        default=None, description="When the incident occurred"
    )


class AIReport(BaseModel):
    """Response model for AI-generated incident report."""

    summary: str = Field(..., description="Brief summary of the incident")
    root_cause: str = Field(..., description="Probable root cause analysis")
    severity: str = Field(
        ..., description="Severity level (Critical, High, Medium, Low)"
    )
    confidence: int = Field(..., ge=0, le=100, description="Confidence score (0-100)")
    possible_impact: str = Field(
        ..., description="Description of the possible business/technical impact"
    )
    evidence: List[str] = Field(
        ..., description="List of evidence supporting the analysis"
    )
    immediate_actions: List[str] = Field(
        ..., description="Immediate remediation steps to take"
    )
    preventive_actions: List[str] = Field(
        ..., description="Long-term preventive measures"
    )
    estimated_resolution_time: str = Field(..., description="Estimated time to resolve")
    recommendations: List[str] = Field(..., description="List of recommended actions")
