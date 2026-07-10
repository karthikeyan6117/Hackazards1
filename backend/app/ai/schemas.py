"""Pydantic models for AI incident analysis."""

from typing import List

from pydantic import BaseModel, Field


class IncidentRequest(BaseModel):
    """Request model for incident analysis."""

    incident_id: str = Field(..., description="Unique identifier for the incident")
    endpoint: str = Field(..., description="API endpoint that triggered the incident")
    status_code: int = Field(..., ge=100, le=599, description="HTTP status code")
    latency: float = Field(..., ge=0, description="Response latency in milliseconds")
    error_message: str = Field(..., description="Error message from the incident")


class AIReport(BaseModel):
    """Response model for AI-generated incident report."""

    summary: str = Field(..., description="Brief summary of the incident")
    root_cause: str = Field(..., description="Probable root cause analysis")
    confidence: int = Field(..., ge=0, le=100, description="Confidence score (0-100)")
    evidence: List[str] = Field(
        ..., description="List of evidence supporting the analysis"
    )
    recommendations: List[str] = Field(..., description="List of recommended actions")
