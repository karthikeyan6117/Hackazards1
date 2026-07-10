"""Groq client configuration and initialization."""

from typing import Optional

from groq import Groq

from app.core.config import settings

_client: Optional[Groq] = None


def get_groq_client() -> Groq:
    """
    Get or create a singleton Groq client instance.

    Returns:
        Groq: Initialized Groq client.

    Raises:
        ValueError: If GROQ_API_KEY is not configured.
    """
    global _client

    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)

    return _client
