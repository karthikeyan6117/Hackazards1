"""AI-powered Incident Postmortem Generator."""

import logging
import time

from fastapi import HTTPException

from app.ai.groq_client import get_groq_client
from app.ai.schemas import AIReport, IncidentRequest
from app.core.config import settings

logger = logging.getLogger(__name__)

POSTMORTEM_SYSTEM_PROMPT: str = (
    "You are a Senior Site Reliability Engineer writing a professional "
    "engineering postmortem document.\n\n"
    "Using the incident data, logs, metrics, deployment information, "
    "and AI analysis provided, produce a comprehensive postmortem in "
    "Markdown format.\n\n"
    "You MUST return ONLY the Markdown postmortem document. "
    "Do NOT wrap it in code fences. Do NOT include any text outside the "
    "Markdown document.\n\n"
    "The postmortem MUST follow this exact structure:\n\n"
    "# Incident Postmortem\n\n"
    "## Incident Summary\n"
    "A concise 2-3 sentence overview of what happened, when, and the "
    "overall impact.\n\n"
    "## Timeline\n"
    "A chronological list of key events from detection to resolution. "
    "Use the timestamp, logs, and any deployment info to construct this. "
    "Format each entry as a bullet with a time reference.\n\n"
    "## Root Cause\n"
    "A detailed technical explanation of the root cause, referencing the "
    "AI analysis and supporting evidence.\n\n"
    "## Customer Impact\n"
    "Describe the impact on end users, including affected services, "
    "duration of impact, and any degraded functionality.\n\n"
    "## Evidence\n"
    "Bullet list of all evidence used in this analysis: log excerpts, "
    "metric readings, error messages, and deployment details.\n\n"
    "## Immediate Actions Taken\n"
    "Numbered list of immediate remediation steps taken during the incident.\n\n"
    "## Long-Term Preventive Actions\n"
    "Numbered list of systemic fixes to prevent recurrence.\n\n"
    "## Estimated Resolution Time\n"
    "The estimated time for full resolution and any remaining work.\n\n"
    "## Lessons Learned\n"
    "Key takeaways from this incident. What went well, what could be "
    "improved in the incident response process.\n\n"
    "## Future Improvements\n"
    "Actionable recommendations for improving system reliability, "
    "monitoring, alerting, and runbooks.\n\n"
    "Rules:\n"
    "- Use professional engineering language throughout.\n"
    "- Reference specific log lines, metrics, and errors where possible.\n"
    "- Be factual and objective — avoid speculation without caveats.\n"
    "- Keep the document between 500 and 2000 words.\n"
    "- Return ONLY the Markdown document, nothing else."
)


def _build_postmortem_prompt(request: IncidentRequest, analysis: AIReport) -> str:
    """
    Build a context-rich user prompt for postmortem generation.

    Args:
        request: The original incident request.
        analysis: The AI-generated incident analysis.

    Returns:
        A formatted prompt string for the LLM.
    """
    lines: list[str] = []

    lines.append("## Incident Details")
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
        lines.append("\n## Deployment Information")
        lines.append(request.deployment_info)

    if request.system_metrics:
        lines.append("\n## System Metrics")
        for key, val in request.system_metrics.items():
            lines.append(f"- {key}: {val}")

    if request.recent_incidents:
        lines.append("\n## Related Previous Incidents")
        for i, inc in enumerate(request.recent_incidents, 1):
            lines.append(f"{i}. {inc}")

    lines.append("\n## AI Analysis Results")
    lines.append(f"- Summary: {analysis.summary}")
    lines.append(f"- Root Cause: {analysis.root_cause}")
    lines.append(f"- Severity: {analysis.severity}")
    lines.append(f"- Confidence: {analysis.confidence}%")
    lines.append(f"- Possible Impact: {analysis.possible_impact}")
    if analysis.evidence:
        lines.append("- Evidence:")
        for e in analysis.evidence:
            lines.append(f"  - {e}")
    if analysis.immediate_actions:
        lines.append("- Immediate Actions:")
        for a in analysis.immediate_actions:
            lines.append(f"  - {a}")
    if analysis.preventive_actions:
        lines.append("- Preventive Actions:")
        for a in analysis.preventive_actions:
            lines.append(f"  - {a}")
    lines.append(f"- Estimated Resolution Time: {analysis.estimated_resolution_time}")
    if analysis.recommendations:
        lines.append("- Recommendations:")
        for r in analysis.recommendations:
            lines.append(f"  - {r}")

    lines.append(
        "\n\nUsing all the above context, generate a comprehensive "
        "professional postmortem document in Markdown format following "
        "the structure specified in the system prompt."
    )

    return "\n".join(lines)


def generate_postmortem(request: IncidentRequest, analysis: AIReport) -> str:
    """
    Generate a professional postmortem document using the Groq LLM.

    Args:
        request: The original incident request.
        analysis: The AI-generated incident analysis.

    Returns:
        A Markdown-formatted postmortem document.

    Raises:
        HTTPException: 503 if the AI service is unavailable.
    """
    user_prompt = _build_postmortem_prompt(request, analysis)
    prompt_size = len(user_prompt)

    logger.info(
        "Generating postmortem: incident_id=%s prompt_size=%d",
        request.incident_id,
        prompt_size,
    )

    start_time = time.monotonic()

    try:
        markdown = _call_groq_postmortem(user_prompt)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Postmortem Groq API call failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Postmortem generation service temporarily unavailable.",
        ) from exc

    elapsed = time.monotonic() - start_time
    logger.info(
        "Postmortem generated: model=%s latency=%.2fs prompt_size=%d",
        settings.MODEL_NAME,
        elapsed,
        prompt_size,
    )

    return markdown


def _call_groq_postmortem(user_prompt: str) -> str:
    """
    Call the Groq API for postmortem generation with one retry.

    Args:
        user_prompt: The formatted user prompt.

    Returns:
        The raw Markdown response from the LLM.

    Raises:
        HTTPException: 503 if both attempts fail.
    """
    client = get_groq_client()

    try:
        return _make_groq_call(client, user_prompt)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Postmortem Groq call failed, retrying once: %s", exc)
        try:
            return _make_groq_call(client, user_prompt)
        except HTTPException:
            raise
        except Exception as retry_exc:
            logger.exception("Postmortem retry failed: %s", retry_exc)
            raise HTTPException(
                status_code=503,
                detail="Postmortem generation service temporarily unavailable.",
            ) from retry_exc


def _make_groq_call(client: object, user_prompt: str) -> str:
    """
    Execute a single Groq chat completion call for postmortem.

    Args:
        client: The Groq client instance.
        user_prompt: The formatted user prompt.

    Returns:
        The response text from the LLM.

    Raises:
        ValueError: If the response is empty.
    """
    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[
            {"role": "system", "content": POSTMORTEM_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=4096,
    )
    response_text = response.choices[0].message.content
    if response_text is None:
        raise ValueError("Empty response from Groq API")
    return response_text.strip()
