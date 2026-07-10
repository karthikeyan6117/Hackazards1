"""API routes for AI incident analysis."""

from fastapi import APIRouter

from app.ai.agent import analyze_incident
from app.ai.postmortem import generate_postmortem
from app.ai.report_generator import generate_report
from app.ai.schemas import AIReport, IncidentRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/health")
def health_check() -> dict:
    """
    Health check endpoint for AI service.

    Returns:
        dict: Status message indicating AI service is running.
    """
    return {"status": "AI Service Running"}


@router.post("/analyze", response_model=AIReport)
def analyze(request: IncidentRequest) -> AIReport:
    """
    Analyze an incident and return AI-generated report.

    Args:
        request: Incident details for analysis.

    Returns:
        AIReport: AI-generated incident analysis.
    """
    report = analyze_incident(request)
    return report


@router.post("/report")
def get_report(request: IncidentRequest) -> dict:
    """
    Generate a formatted report from incident analysis.

    Args:
        request: Incident details for analysis.

    Returns:
        dict: Formatted report data.
    """
    report = analyze_incident(request)
    return generate_report(report)


@router.post("/postmortem")
def postmortem(request: IncidentRequest) -> dict:
    """
    Generate a professional postmortem document after incident analysis.

    Analyzes the incident, then produces a comprehensive Markdown postmortem.

    Args:
        request: Incident details for analysis.

    Returns:
        dict: Postmortem document with markdown key.
    """
    analysis = analyze_incident(request)
    markdown = generate_postmortem(request, analysis)
    return {"markdown": markdown}
