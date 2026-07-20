"""
Import CrewAI when available; otherwise provide a minimal structural shim.

Production/Docker uses Python 3.11 + real CrewAI.
Local machines on unsupported Python versions can still run demo fallbacks
and keep the Agent/Task/Tool architecture intact.
"""

from __future__ import annotations

from typing import Any

try:
    from crewai import Agent, Crew, LLM, Process, Task
    from crewai.tools import BaseTool

    CREWAI_AVAILABLE = True
except Exception:  # noqa: BLE001
    CREWAI_AVAILABLE = False

    class Process:  # type: ignore[no-redef]
        sequential = "sequential"
        hierarchical = "hierarchical"

    class LLM:  # type: ignore[no-redef]
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            self.kwargs = kwargs

    class BaseTool:  # type: ignore[no-redef]
        name: str = "tool"
        description: str = ""
        args_schema: Any = None

        def __init__(self, **kwargs: Any) -> None:
            for key, value in kwargs.items():
                setattr(self, key, value)

        def run(self, *args: Any, **kwargs: Any) -> str:
            return self._run(*args, **kwargs)

        def _run(self, *args: Any, **kwargs: Any) -> str:
            raise NotImplementedError

    class Agent:  # type: ignore[no-redef]
        def __init__(self, **kwargs: Any) -> None:
            self.__dict__.update(kwargs)

    class Task:  # type: ignore[no-redef]
        def __init__(self, **kwargs: Any) -> None:
            self.__dict__.update(kwargs)
            self.context = kwargs.get("context")
            self.output = None

    class Crew:  # type: ignore[no-redef]
        def __init__(self, **kwargs: Any) -> None:
            self.kwargs = kwargs

        def kickoff(self, *args: Any, **kwargs: Any) -> Any:
            raise RuntimeError(
                "CrewAI is not installed for this Python version. "
                "Use Python 3.11–3.13, or run without OPENAI_API_KEY (demo fallbacks)."
            )


__all__ = [
    "CREWAI_AVAILABLE",
    "Agent",
    "Crew",
    "LLM",
    "Process",
    "Task",
    "BaseTool",
]
