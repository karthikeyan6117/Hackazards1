"""AI agent for incident analysis."""

import json
import logging
import time

from fastapi import HTTPException

from app.ai.groq_client import get_groq_client
from app.ai.prompts import SYSTEM_PROMPT, build_incident_prompt
from app.ai.schemas import AIReport, IncidentRequest
from app.core.config import settings

logger = logging.getLogger(__name__)


def _call_groq(user_prompt: str) -> str:
    """Make a single call to Groq and return the response text."""
    client = get_groq_client()
    response = client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=2048,
    )
    response_text = response.choices[0].message.content
    if response_text is None:
        raise ValueError("Empty response from Groq API")
    return response_text


def analyze_incident(request: IncidentRequest) -> AIReport:
    """
    Analyze an incident using the Groq LLM and return a structured report.

    Args:
        request: The incident request containing incident details.

    Returns:
        AIReport: AI-generated incident analysis.

    Raises:
        HTTPException: 503 if the AI service is unavailable.
    """
    user_prompt = build_incident_prompt(request)

    logger.info(
        "Incoming incident: incident_id=%s endpoint=%s status_code=%d latency=%.2fms",
        request.incident_id,
        request.endpoint,
        request.status_code,
        request.latency,
    )
    logger.info("Prompt length: %d characters", len(user_prompt))

    start_time = time.monotonic()

    try:
        response_text = _call_groq(user_prompt)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Groq API call failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="AI analysis service temporarily unavailable.",
        ) from exc

    elapsed = time.monotonic() - start_time
    logger.info("Groq model: %s | Groq latency: %.2fs", settings.MODEL_NAME, elapsed)

    try:
        return AIReport.model_validate_json(response_text)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("Invalid JSON from Groq, retrying once... Error: %s", exc)
        try:
            response_text = _call_groq(user_prompt)
            return AIReport.model_validate_json(response_text)
        except (json.JSONDecodeError, ValueError) as retry_exc:
            logger.exception("Retry also returned invalid JSON: %s", retry_exc)
            raise HTTPException(
                status_code=503,
                detail="AI analysis service returned invalid response.",
            ) from retry_exc
        except HTTPException:
            raise
        except Exception as retry_exc:
            logger.exception("Retry failed: %s", retry_exc)
            raise HTTPException(
                status_code=503,
                detail="AI analysis service temporarily unavailable.",
            ) from retry_exc
