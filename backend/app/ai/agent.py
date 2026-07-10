"""AI agent for incident analysis."""

import json
import logging
import time
from typing import List, Optional

from fastapi import HTTPException

from app.ai.groq_client import get_groq_client
from app.ai.memory import IncidentSummary, find_similar_incidents
from app.ai.prompts import SYSTEM_PROMPT, build_incident_prompt
from app.ai.schemas import AIReport, IncidentRequest
from app.core.config import settings
from app.db.database import SessionLocal

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

    Retrieves similar historical incidents from the database and includes
    them as context to improve analysis quality.

    Args:
        request: The incident request containing incident details.

    Returns:
        AIReport: AI-generated incident analysis.

    Raises:
        HTTPException: 503 if the AI service is unavailable.
    """
    similar_incidents = _retrieve_similar_incidents(request)
    user_prompt = build_incident_prompt(request, similar_incidents)

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


def _retrieve_similar_incidents(
    request: IncidentRequest,
) -> Optional[List[IncidentSummary]]:
    """
    Retrieve similar historical incidents from the database.

    Silently returns None on any database error so the analysis
    can proceed without memory context.

    Args:
        request: The current incident request.

    Returns:
        List of similar IncidentSummary objects, or None if retrieval fails.
    """
    db = SessionLocal()
    try:
        return find_similar_incidents(request, db)
    except Exception as exc:
        logger.warning("Memory retrieval failed (continuing without): %s", exc)
        return None
    finally:
        db.close()
