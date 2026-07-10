"""AI agent for incident analysis."""

from app.ai.schemas import AIReport, IncidentRequest


def analyze_incident(request: IncidentRequest) -> AIReport:
    """
    Analyze an incident and generate a report.

    This is a mock implementation that returns predefined analysis.
    Real Groq API integration will be added in Phase 2.

    Args:
        request: The incident request containing incident details.

    Returns:
        AIReport: Mock AI-generated incident analysis.
    """
    # Mock implementation - returns static analysis
    return AIReport(
        summary="Database service unavailable.",
        root_cause="Possible backend database outage.",
        confidence=91,
        evidence=[
            "HTTP 500 returned",
            "Latency exceeded threshold",
        ],
        recommendations=[
            "Check database health",
            "Restart database service",
        ],
    )
