"""Shared decorator helpers for logging tool invocations."""

from __future__ import annotations

import json
import time
from functools import wraps
from typing import Any, Callable

from services.observability import observability
from tools.context import get_current_agent


def traced_tool(tool_name: str) -> Callable:
    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            started = time.perf_counter()
            status = "completed"
            error = None
            output: Any = None
            try:
                output = fn(*args, **kwargs)
                return output
            except Exception as exc:  # noqa: BLE001
                status = "failed"
                error = str(exc)
                raise
            finally:
                duration_ms = int((time.perf_counter() - started) * 1000)
                # Build input dict from kwargs + positional (skip self)
                inputs = dict(kwargs)
                if args:
                    # first arg may be self for bound methods — tools use _run(self, ...)
                    pass
                # CrewAI BaseTool._run passes named args; kwargs usually enough
                if not inputs and len(args) > 1:
                    inputs = {"args": [str(a)[:120] for a in args[1:]]}

                # Prefer serializable preview
                try:
                    parsed_output = json.loads(output) if isinstance(output, str) else output
                except Exception:  # noqa: BLE001
                    parsed_output = output

                observability.log_tool_call(
                    tool_name=tool_name,
                    inputs=inputs,
                    output=parsed_output,
                    duration_ms=duration_ms,
                    status=status,
                    error=error,
                    agent_name=get_current_agent(),
                )

        return wrapper

    return decorator
