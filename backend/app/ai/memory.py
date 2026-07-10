"""Historical incident memory with similarity-based retrieval (RAG-lite)."""

import logging
import re
import time
from dataclasses import dataclass, field
from typing import List, Optional

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.ai.schemas import IncidentRequest
from app.models.endpoint import Endpoint
from app.models.incident import Incident

logger = logging.getLogger(__name__)

# --- Similarity weights (total = 100) ---
_WEIGHT_ENDPOINT = 40
_WEIGHT_STATUS_CODE = 20
_WEIGHT_ERROR_MESSAGE = 15
_WEIGHT_SERVICE = 15
_WEIGHT_LATENCY = 5
_WEIGHT_SEVERITY = 5

_TOP_K = 3
_LATENCY_RANGE_RATIO = 0.5


class IncidentSummary(BaseModel):
    """Concise summary of a historical incident for prompt context."""

    incident_id: str = Field(..., description="Historical incident identifier")
    summary: str = Field(..., description="Brief incident summary")
    root_cause: str = Field(..., description="Known or suspected root cause")
    resolution: str = Field(..., description="How the incident was resolved")
    lessons_learned: str = Field(..., description="Key takeaways from the incident")
    similarity_score: float = Field(
        ..., description="Computed similarity score (0-100)"
    )


@dataclass
class _ScoredIncident:
    """Internal wrapper pairing an incident with its similarity score."""

    incident: Incident
    score: float = 0.0
    breakdown: dict = field(default_factory=dict)


def _tokenize(text: str) -> set[str]:
    """Lowercase and extract alphanumeric tokens from text."""
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def _compute_similarity(
    request: IncidentRequest,
    incident: Incident,
    endpoint_url: str,
) -> _ScoredIncident:
    """
    Compute a weighted similarity score between a request and a stored incident.

    Args:
        request: The incoming incident request.
        incident: A historical incident from the database.
        endpoint_url: The URL of the endpoint for this incident.

    Returns:
        A _ScoredIncident with score and breakdown.
    """
    scored = _ScoredIncident(incident=incident, score=0.0)
    breakdown: dict[str, float] = {}

    # --- Endpoint match ---
    req_endpoint = request.endpoint.rstrip("/").lower()
    hist_endpoint = endpoint_url.rstrip("/").lower()
    if req_endpoint == hist_endpoint:
        breakdown["endpoint"] = _WEIGHT_ENDPOINT
    else:
        # Partial match: check if one is a prefix of the other
        req_parts = req_endpoint.split("/")
        hist_parts = hist_endpoint.split("/")
        common = sum(1 for a, b in zip(req_parts, hist_parts) if a == b)
        if common >= 2:
            breakdown["endpoint"] = _WEIGHT_ENDPOINT * (
                common / max(len(req_parts), len(hist_parts))
            )

    # --- Status code match ---
    hist_status_code = _extract_status_code(incident.description or "")
    if hist_status_code is not None:
        if request.status_code == hist_status_code:
            breakdown["status_code"] = _WEIGHT_STATUS_CODE
        elif request.status_code // 100 == hist_status_code // 100:
            # Same class (e.g. both 5xx)
            breakdown["status_code"] = _WEIGHT_STATUS_CODE * 0.5

    # --- Error message similarity ---
    desc_tokens = _tokenize(incident.description or "")
    err_tokens = _tokenize(request.error_message)
    if err_tokens and desc_tokens:
        overlap = len(err_tokens & desc_tokens)
        union = len(err_tokens | desc_tokens)
        if union > 0:
            jaccard = overlap / union
            breakdown["error_message"] = _WEIGHT_ERROR_MESSAGE * min(jaccard * 2, 1.0)

    # --- Service name match ---
    if request.service_name:
        req_svc = request.service_name.lower()
        hist_title = (incident.title or "").lower()
        hist_desc = (incident.description or "").lower()
        if req_svc in hist_title or req_svc in hist_desc:
            breakdown["service"] = _WEIGHT_SERVICE

    # --- Latency similarity ---
    # Estimate latency from description (e.g. "latency 1234ms")
    hist_latency = _extract_latency(incident.description or "")
    if hist_latency is not None and request.latency > 0:
        ratio = min(request.latency, hist_latency) / max(request.latency, hist_latency)
        if ratio >= (1 - _LATENCY_RANGE_RATIO):
            breakdown["latency"] = _WEIGHT_LATENCY * ratio

    # --- Severity match ---
    severity_map = {
        "critical": ["critical"],
        "high": ["high", "critical"],
        "medium": ["medium", "warning"],
        "low": ["low", "info"],
        "warning": ["warning", "medium"],
    }
    req_severity = _normalize_severity(request.error_message, request.status_code)
    hist_severity = (incident.severity or "").lower()
    if req_severity == hist_severity:
        breakdown["severity"] = _WEIGHT_SEVERITY
    elif hist_severity in severity_map.get(req_severity, []):
        breakdown["severity"] = _WEIGHT_SEVERITY * 0.5

    scored.score = sum(breakdown.values())
    scored.breakdown = breakdown
    return scored


def _normalize_severity(error_message: str, status_code: int) -> str:
    """Infer severity from status code when explicit severity isn't available."""
    if status_code >= 500:
        return "critical"
    if status_code >= 400:
        return "warning"
    return "info"


def _extract_latency(description: str) -> Optional[float]:
    """Extract a latency value in ms from an incident description string."""
    match = re.search(r"latency\s+(\d+(?:\.\d+)?)\s*ms", description, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None


def _extract_status_code(description: str) -> Optional[int]:
    """Extract an HTTP status code from an incident description string."""
    match = re.search(r"status\s+(\d{3})", description)
    if match:
        return int(match.group(1))
    return None


def find_similar_incidents(
    request: IncidentRequest,
    db: Session,
    top_k: int = _TOP_K,
) -> List[IncidentSummary]:
    """
    Search stored incidents and return the most similar ones.

    Uses weighted field matching across endpoint, status code, error message,
    service name, latency range, and severity — no vector embeddings needed.

    Args:
        request: The current incident request.
        db: Active SQLAlchemy session.
        top_k: Maximum number of results to return (default 3).

    Returns:
        List of IncidentSummary objects sorted by similarity descending.
    """
    start_time = time.monotonic()

    # Fetch resolved or old incidents (exclude the current open one if it exists)
    incidents: list[Incident] = (
        db.query(Incident)
        .filter(Incident.status.in_(["resolved", "closed"]))
        .order_by(Incident.started_at.desc())
        .limit(200)
        .all()
    )

    if not incidents:
        logger.info("No historical incidents found in database")
        return []

    # Eagerly load endpoint URLs to avoid N+1
    endpoint_ids = {inc.endpoint_id for inc in incidents}
    endpoints: list[Endpoint] = (
        db.query(Endpoint).filter(Endpoint.id.in_(endpoint_ids)).all()
    )
    endpoint_map = {ep.id: ep.url for ep in endpoints}

    # Score each incident
    scored: list[_ScoredIncident] = []
    for inc in incidents:
        ep_url = endpoint_map.get(inc.endpoint_id, "")
        scored_inc = _compute_similarity(request, inc, ep_url)
        if scored_inc.score > 0:
            scored.append(scored_inc)

    # Sort by score descending, take top_k
    scored.sort(key=lambda s: s.score, reverse=True)
    top = scored[:top_k]

    elapsed = time.monotonic() - start_time

    if top:
        scores = [f"{s.incident.id}={s.score:.1f}" for s in top]
        logger.info(
            "Memory retrieval: found=%d scored=%d top_scores=[%s] time=%.3fs",
            len(incidents),
            len(scored),
            ", ".join(scores),
            elapsed,
        )
    else:
        logger.info(
            "Memory retrieval: found=%d scored=0 time=%.3fs",
            len(incidents),
            elapsed,
        )

    return [_to_summary(s) for s in top]


def _to_summary(scored: _ScoredIncident) -> IncidentSummary:
    """Convert a scored incident into a public IncidentSummary."""
    inc = scored.incident
    return IncidentSummary(
        incident_id=str(inc.id),
        summary=inc.title or "No summary available",
        root_cause=inc.root_cause or "Root cause not yet determined",
        resolution=(
            f"Incident resolved at {inc.resolved_at.isoformat()}"
            if inc.resolved_at
            else "Resolution time not recorded"
        ),
        lessons_learned=inc.recommendations or "No lessons recorded yet",
        similarity_score=round(scored.score, 1),
    )
