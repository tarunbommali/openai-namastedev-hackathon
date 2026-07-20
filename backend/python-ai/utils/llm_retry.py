from __future__ import annotations
import asyncio
import logging
import time
from typing import Any, Callable, TypeVar

T = TypeVar("T")
logger = logging.getLogger(__name__)


def retry_with_exponential_backoff(
    func: Callable[..., T],
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    *args: Any,
    **kwargs: Any
) -> T:
    """
    Executes func with exponential backoff retries (1s, 2s, 4s) to handle transient LLM / API errors.
    """
    delay = initial_delay
    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            return func(*args, **kwargs)
        except Exception as exc:  # noqa: BLE001
            last_exception = exc
            logger.warning(
                f"[LLMRetry] Attempt {attempt}/{max_retries} failed with error: {exc}. Retrying in {delay}s..."
            )
            if attempt < max_retries:
                time.sleep(delay)
                delay *= backoff_factor

    logger.error(f"[LLMRetry] All {max_retries} attempts failed.")
    if last_exception:
        raise last_exception
    raise RuntimeError("LLM operation failed after maximum retries.")
