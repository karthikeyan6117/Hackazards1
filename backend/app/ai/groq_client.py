"""Groq client configuration and initialization."""

import os
from typing import Optional

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

_client: Optional[Groq] = None


def get_groq_client() -> Groq:
    """
    Get or create a singleton Groq client instance.

    Returns:
        Groq: Initialized Groq client.

    Raises:
        ValueError: If GROQ_API_KEY environment variable is not set.
    """
    global _client

    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        _client = Groq(api_key=api_key)

    return _client
