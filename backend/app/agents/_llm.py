"""Shared LLM factory for CrewAI agents."""

from __future__ import annotations

from typing import Optional

from app.config import get_settings


def llm_for(model: Optional[str] = None):
    """Return a CrewAI LLM wrapper when OpenAI is configured, else None."""
    settings = get_settings()
    if not settings.has_openai:
        return None
    from app.crew_compat import LLM

    return LLM(
        model=model or settings.openai_reasoning_model,
        api_key=settings.openai_api_key,
        temperature=0.2,
    )


def fast_llm():
    return llm_for(get_settings().openai_fast_model)


def reasoning_llm():
    return llm_for(get_settings().openai_reasoning_model)
