from __future__ import annotations
import json
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
    text: str


class EmbeddingTool(BaseTool):
    name: str = "embedding_tool"
    description: str = "Generate an embedding vector for text."
    args_schema: Type[BaseModel] = Input

    def _run(self, text: str) -> str:
        vec = _embed(text)
        return json.dumps({"dimensions": len(vec), "preview": vec[:8], "vector": vec})
