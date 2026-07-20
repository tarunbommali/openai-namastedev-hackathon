"""Lightweight memory store for candidate / job / interview / conversation context."""

from __future__ import annotations

import json
import threading
from typing import Type

from app.crew_compat import BaseTool
from pydantic import BaseModel, Field


class _MemoryBackend:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.candidate: dict[str, str] = {}
        self.job: dict[str, str] = {}
        self.interview: dict[str, str] = {}
        self.conversation: list[str] = []

    def write(self, namespace: str, key: str, value: str) -> str:
        with self._lock:
            if namespace == "candidate":
                self.candidate[key] = value
            elif namespace == "job":
                self.job[key] = value
            elif namespace == "interview":
                self.interview[key] = value
            else:
                self.conversation.append(f"{key}: {value}")
                self.conversation = self.conversation[-50:]
        return "ok"

    def read(self, namespace: str, key: str = "") -> str:
        with self._lock:
            if namespace == "conversation":
                return json.dumps(self.conversation[-10:])
            store = {
                "candidate": self.candidate,
                "job": self.job,
                "interview": self.interview,
            }.get(namespace, {})
            if key:
                return store.get(key, "")
            return json.dumps(store)


memory_backend = _MemoryBackend()


class MemoryInput(BaseModel):
    action: str = Field(..., description="read or write")
    namespace: str = Field(..., description="candidate | job | interview | conversation")
    key: str = Field(default="", description="Memory key")
    value: str = Field(default="", description="Value when writing")


class MemoryTool(BaseTool):
    name: str = "memory_tool"
    description: str = (
        "Read or write HireFlow memory namespaces: candidate, job, interview, conversation."
    )
    args_schema: Type[BaseModel] = MemoryInput

    def _run(self, action: str, namespace: str, key: str = "", value: str = "") -> str:
        if action == "write":
            return memory_backend.write(namespace, key or "default", value)
        return memory_backend.read(namespace, key)
