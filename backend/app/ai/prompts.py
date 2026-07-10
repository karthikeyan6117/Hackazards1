"""Prompt templates for AI incident analysis."""

from typing import List, Optional

from app.ai.memory import IncidentSummary
from app.ai.schemas import IncidentRequest

SYSTEM_PROMPT: str = (
    "You are a Senior Site Reliability Engineer, DevOps Engineer, "
    "and Cloud Infrastructure Expert.\n\n"
    "Your task is to analyze production incidents using ALL available evidence "
    "including logs, system metrics, deployment history, and previous incidents. "
    "Determine the most probable root cause, explain your reasoning, "
    "and provide actionable remediation steps.\n\n"
    "If similar previous incidents are provided, compare the current incident "
    "with them. Reference whether the current incident follows a known pattern, "
    "and whether previous resolutions or root causes are relevant. Use this "
    "historical context to improve your analysis confidence and recommendations.\n\n"
    "You MUST return ONLY valid JSON with no additional text, markdown, or "
    "code fences. The JSON must match this exact schema:\n"
    "{\n"
    '    "summary": "",\n'
    '    "root_cause": "",\n'
    '    "severity": "",\n'
    '    "confidence": 0,\n'
    '    "possible_impact": "",\n'
    '    "evidence": [],\n'
    '    "immediate_actions": [],\n'
    '    "preventive_actions": [],\n'
    '    "estimated_resolution_time": "",\n'
    '    "recommendations": []\n'
    "}\n\n"
    "Rules:\n"
    "- summary: one or two sentence overview of the incident.\n"
    "- root_cause: the most probable root cause based on ALL data provided.\n"
    "- severity: one of Critical, High, Medium, or Low.\n"
    "- confidence: an integer 0-100 representing your confidence in the root cause.\n"
    "- possible_impact: describe the business or technical impact this incident could cause.\n"
    "- evidence: list of specific evidence strings that support your analysis (reference logs, metrics, etc.).\n"
    "- immediate_actions: concrete steps the on-call engineer should take RIGHT NOW.\n"
    "- preventive_actions: long-term fixes to prevent recurrence.\n"
    "- estimated_resolution_time: realistic estimate like '15-30 minutes', '1-2 hours', etc.\n"
    "- recommendations: list of actionable next-steps for the team."
)


def build_similar_incidents_section(
    similar_incidents: List[IncidentSummary],
) -> str:
    """
    Format similar historical incidents into a prompt section.

    Args:
        similar_incidents: List of IncidentSummary objects from memory retrieval.

    Returns:
        A formatted string section, or empty string if no incidents.
    """
    if not similar_incidents:
        return ""

    lines: list[str] = []
    lines.append("## Similar Previous Incidents")
    lines.append(
        "The following historical incidents are similar to the current one. "
        "Use them to identify patterns, reuse known root causes, and "
        "reference previous resolutions.\n"
    )

    for i, inc in enumerate(similar_incidents, 1):
        lines.append(
            f"### Incident {i} (ID: {inc.incident_id}, similarity: {inc.similarity_score}%)"
        )
        lines.append(f"- **Summary:** {inc.summary}")
        lines.append(f"- **Root Cause:** {inc.root_cause}")
        lines.append(f"- **Resolution:** {inc.resolution}")
        lines.append(f"- **Lessons Learned:** {inc.lessons_learned}")
        lines.append("")

    lines.append(
        "Compare the current incident with the above. If a similar root cause "
        "or resolution pattern exists, reference it explicitly in your analysis."
    )

    return "\n".join(lines)


def build_incident_prompt(
    request: IncidentRequest,
    similar_incidents: Optional[List[IncidentSummary]] = None,
) -> str:
    """
    Convert an IncidentRequest into a detailed, context-rich user prompt.

    Args:
        request: The incident details to analyze.
        similar_incidents: Optional list of similar historical incidents.

    Returns:
        A formatted prompt string ready to send to the LLM.
    """
    lines: list[str] = []

    lines.append("## Incident")
    lines.append(f"- Incident ID: {request.incident_id}")
    lines.append(f"- Service: {request.service_name or 'N/A'}")
    lines.append(f"- Environment: {request.environment or 'N/A'}")
    lines.append(f"- Timestamp: {request.timestamp or 'N/A'}")
    lines.append(f"- Endpoint: {request.endpoint}")
    lines.append(f"- Status Code: {request.status_code}")
    lines.append(f"- Latency: {request.latency}ms")
    lines.append(f"- Error Message: {request.error_message}")

    if request.logs:
        lines.append("\n## Logs")
        for i, log in enumerate(request.logs, 1):
            lines.append(f"{i}. {log}")

    if request.deployment_info:
        lines.append("\n## Deployment")
        lines.append(request.deployment_info)

    if request.system_metrics:
        lines.append("\n## Metrics")
        metrics = request.system_metrics
        if "cpu" in metrics:
            lines.append(f"- CPU: {metrics['cpu']}%")
        if "memory" in metrics:
            lines.append(f"- Memory: {metrics['memory']}%")
        if "disk" in metrics:
            lines.append(f"- Disk: {metrics['disk']}%")
        if "network" in metrics:
            lines.append(
                f"- Network: {metrics['network']} {'MB/s' if isinstance(metrics['network'], float) else ''}"
            )
        for key, val in metrics.items():
            if key not in ("cpu", "memory", "disk", "network"):
                lines.append(f"- {key}: {val}")

    if request.recent_incidents:
        lines.append("\n## Previous Incidents")
        for i, inc in enumerate(request.recent_incidents, 1):
            lines.append(f"{i}. {inc}")

    # Inject similar historical incidents from memory
    if similar_incidents:
        section = build_similar_incidents_section(similar_incidents)
        if section:
            lines.append(f"\n{section}")

    lines.append(
        "\n\nAnalyze the above incident using all available evidence. "
        "Determine the root cause, severity, impact, and provide "
        "immediate and preventive actions. Return your JSON response."
    )

    return "\n".join(lines)
