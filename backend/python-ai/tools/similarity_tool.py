from __future__ import annotations
import json
import math
from typing import Type
from pydantic import BaseModel, Field

try:
    from crewai.tools import BaseTool
except Exception:  # noqa: BLE001
    class BaseTool:  # type: ignore
        name = ""
        description = ""
        args_schema = None
        def __init__(self, **kwargs): self.__dict__.update(kwargs)

from services.vector_store import _embed


class Input(BaseModel):
    left: str
    right: str


class SimilarityTool(BaseTool):
    name: str = "similarity_tool"
    description: str = "Cosine similarity between two texts."
    args_schema: Type[BaseModel] = Input

    def _run(self, left: str, right: str) -> str:
        a, b = _embed(left), _embed(right)
        n = min(len(a), len(b))
        dot = sum(a[i] * b[i] for i in range(n))
        na = math.sqrt(sum(x * x for x in a[:n])) or 1
        nb = math.sqrt(sum(x * x for x in b[:n])) or 1
        score = round(dot / (na * nb), 4)
        return json.dumps({"similarity": score, "score_100": round(score * 100, 1)})
