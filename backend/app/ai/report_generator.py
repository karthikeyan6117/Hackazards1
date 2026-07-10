"""Report generation utilities."""

from typing import Any, Dict

from app.ai.schemas import AIReport


def generate_report(report: AIReport) -> Dict[str, Any]:
    """
    Generate a formatted report from an AIReport.

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
            "severity": report.severity,
            "confidence": report.confidence,
            "possible_impact": report.possible_impact,
            "evidence": report.evidence,
            "immediate_actions": report.immediate_actions,
            "preventive_actions": report.preventive_actions,
            "estimated_resolution_time": report.estimated_resolution_time,
            "recommendations": report.recommendations,
        },
        "metadata": {
            "generated_by": "Hackazards AI",
            "version": "1.0.0",
            "phase": 1,
        },
    }
