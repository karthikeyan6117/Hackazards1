"""Report generation utilities."""

from typing import Any, Dict

from app.ai.schemas import AIReport


def generate_report(report: AIReport) -> Dict[str, Any]:
    """
    Generate a formatted report from an AIReport.

    This is a mock implementation that formats the report as a dictionary.
    Future versions will support JSON and PDF export.

    Args:
        report: The AI-generated incident report.

    Returns:
        Dict containing formatted report data.
    """
    return {
        "report_type": "incident_analysis",
        "format": "json",
        "data": {
            "summary": report.summary,
            "root_cause": report.root_cause,
            "confidence": report.confidence,
            "evidence": report.evidence,
            "recommendations": report.recommendations,
        },
        "metadata": {
            "generated_by": "Hackazards AI",
            "version": "1.0.0",
            "phase": 1,
        },
    }
