"""Report generation utilities with multi-format support."""

from typing import Any, Dict, Literal

from app.ai.schemas import AIReport

ReportFormat = Literal["json", "markdown", "text"]


def generate_report(report: AIReport, fmt: ReportFormat = "json") -> Dict[str, Any]:
    """
    Generate a formatted report from an AIReport.

    Args:
        report: The AI-generated incident report.
        fmt: Output format — "json", "markdown", or "text".

    Returns:
        Dict containing formatted report data with content and metadata.
    """
    if fmt == "markdown":
        content = _report_to_markdown(report)
    elif fmt == "text":
        content = _report_to_plain_text(report)
    else:
        content = _report_to_json_dict(report)

    return {
        "report_type": "incident_analysis",
        "format": fmt,
        "content": content,
        "metadata": {
            "generated_by": "Hackazards AI",
            "version": "1.0.0",
            "phase": 2,
        },
    }


def _report_to_json_dict(report: AIReport) -> Dict[str, Any]:
    """Convert AIReport to a plain dictionary."""
    return {
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
    }


def _report_to_markdown(report: AIReport) -> str:
    """Convert AIReport to a Markdown-formatted string."""
    lines: list[str] = []

    lines.append("# Incident Analysis Report\n")
    lines.append(f"**Severity:** {report.severity}  ")
    lines.append(f"**Confidence:** {report.confidence}%\n")

    lines.append("## Summary\n")
    lines.append(f"{report.summary}\n")

    lines.append("## Root Cause\n")
    lines.append(f"{report.root_cause}\n")

    lines.append("## Possible Impact\n")
    lines.append(f"{report.possible_impact}\n")

    lines.append("## Evidence\n")
    for item in report.evidence:
        lines.append(f"- {item}")
    lines.append("")

    lines.append("## Immediate Actions\n")
    for i, action in enumerate(report.immediate_actions, 1):
        lines.append(f"{i}. {action}")
    lines.append("")

    lines.append("## Preventive Actions\n")
    for i, action in enumerate(report.preventive_actions, 1):
        lines.append(f"{i}. {action}")
    lines.append("")

    lines.append(f"## Estimated Resolution Time\n")
    lines.append(f"{report.estimated_resolution_time}\n")

    lines.append("## Recommendations\n")
    for i, rec in enumerate(report.recommendations, 1):
        lines.append(f"{i}. {rec}")
    lines.append("")

    return "\n".join(lines)


def _report_to_plain_text(report: AIReport) -> str:
    """Convert AIReport to a plain-text-formatted string."""
    lines: list[str] = []

    lines.append("INCIDENT ANALYSIS REPORT")
    lines.append("=" * 40)
    lines.append(f"Severity:    {report.severity}")
    lines.append(f"Confidence:  {report.confidence}%")
    lines.append("")

    lines.append("SUMMARY")
    lines.append("-" * 40)
    lines.append(report.summary)
    lines.append("")

    lines.append("ROOT CAUSE")
    lines.append("-" * 40)
    lines.append(report.root_cause)
    lines.append("")

    lines.append("POSSIBLE IMPACT")
    lines.append("-" * 40)
    lines.append(report.possible_impact)
    lines.append("")

    lines.append("EVIDENCE")
    lines.append("-" * 40)
    for item in report.evidence:
        lines.append(f"  * {item}")
    lines.append("")

    lines.append("IMMEDIATE ACTIONS")
    lines.append("-" * 40)
    for i, action in enumerate(report.immediate_actions, 1):
        lines.append(f"  {i}. {action}")
    lines.append("")

    lines.append("PREVENTIVE ACTIONS")
    lines.append("-" * 40)
    for i, action in enumerate(report.preventive_actions, 1):
        lines.append(f"  {i}. {action}")
    lines.append("")

    lines.append("ESTIMATED RESOLUTION TIME")
    lines.append("-" * 40)
    lines.append(report.estimated_resolution_time)
    lines.append("")

    lines.append("RECOMMENDATIONS")
    lines.append("-" * 40)
    for i, rec in enumerate(report.recommendations, 1):
        lines.append(f"  {i}. {rec}")
    lines.append("")

    return "\n".join(lines)
