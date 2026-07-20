"""JSON Storage Tool — persist/load structured JSON blobs (candidate/job/interview)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from tools.tracing import traced_tool

STORE_DIR = Path(__file__).resolve().parent.parent / ".memory" / "json_store"


class JSONStorageInput(BaseModel):
    action: str = Field(..., description="save | load | list")
    namespace: str = Field(..., description="candidate | job | interview | analysis")
    key: str = Field(default="", description="Record key for save/load")
    data_json: str = Field(default="{}", description="JSON string payload when action=save")


class JSONStorageTool(BaseTool):
    name: str = "json_storage_tool"
    description: str = (
        "Save or load structured JSON in HireFlow storage. "
        "Namespaces: candidate, job, interview, analysis. "
        "Use action=save|load|list."
    )
    args_schema: Type[BaseModel] = JSONStorageInput

    @traced_tool("json_storage_tool")
    def _run(self, action: str, namespace: str, key: str = "", data_json: str = "{}") -> str:
        STORE_DIR.mkdir(parents=True, exist_ok=True)
        path = STORE_DIR / f"{namespace}.json"
        store: dict = {}
        if path.exists():
            try:
                store = json.loads(path.read_text(encoding="utf-8"))
            except Exception:  # noqa: BLE001
                store = {}

        action_l = (action or "").lower().strip()
        if action_l == "list":
            return json.dumps({"namespace": namespace, "keys": list(store.keys()), "count": len(store)})

        if action_l == "load":
            if not key:
                return json.dumps({"error": "key required for load"})
            return json.dumps({"key": key, "data": store.get(key), "found": key in store})

        if action_l == "save":
            if not key:
                return json.dumps({"error": "key required for save"})
            try:
                payload = json.loads(data_json) if isinstance(data_json, str) else data_json
            except Exception:  # noqa: BLE001
                payload = {"raw": data_json}
            store[key] = payload
            path.write_text(json.dumps(store, indent=2), encoding="utf-8")
            return json.dumps({"saved": True, "namespace": namespace, "key": key})

        return json.dumps({"error": f"unknown action '{action}'"})
