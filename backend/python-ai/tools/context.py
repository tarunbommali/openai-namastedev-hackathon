"""Track which agent is invoking a tool (for observability)."""

from __future__ import annotations

from contextvars import ContextVar
from typing import Optional

_current_agent: ContextVar[Optional[str]] = ContextVar("current_agent", default=None)


def set_current_agent(name: str | None) -> None:
    _current_agent.set(name)


def get_current_agent() -> Optional[str]:
    return _current_agent.get()
