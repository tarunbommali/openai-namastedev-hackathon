"""Mongo / memory DB lookup tool for agents."""

from __future__ import annotations

import asyncio
import json
from typing import Type

from app.crew_compat import BaseTool
from pydantic import BaseModel, Field

from app.data.seed import seed_candidates, seed_job, seed_interviewers
from app.services.database import db


class MongoInput(BaseModel):
    collection: str = Field(..., description="candidates | job | interviewers | interviews")
    query: str = Field(default="", description="Optional name/id filter")


class MongoTool(BaseTool):
    name: str = "mongo_tool"
    description: str = "Fetch hiring records from MongoDB (or memory fallback)."
    args_schema: Type[BaseModel] = MongoInput

    def _run(self, collection: str, query: str = "") -> str:
        try:
            return asyncio.run(self._async_run(collection, query))
        except RuntimeError:
            # Already inside an event loop — use seed snapshots
            return self._sync_fallback(collection, query)

    async def _async_run(self, collection: str, query: str) -> str:
        q = (query or "").lower()
        if collection == "job":
            return json.dumps(await db.get_job())
        if collection == "candidates":
            candidates = await db.get_candidates()
            if q:
                candidates = [
                    c
                    for c in candidates
                    if q in c.get("id", "").lower() or q in c.get("name", "").lower()
                ]
            return json.dumps(candidates)
        if collection == "interviewers":
            return json.dumps(seed_interviewers())
        if collection == "interviews":
            interviews = await db.get_interviews()
            return json.dumps(interviews)
        return json.dumps({"error": f"unknown collection {collection}"})

    def _sync_fallback(self, collection: str, query: str) -> str:
        q = (query or "").lower()
        if collection == "job":
            return json.dumps(seed_job())
        if collection == "candidates":
            candidates = seed_candidates()
            if q:
                candidates = [
                    c
                    for c in candidates
                    if q in c.get("id", "").lower() or q in c.get("name", "").lower()
                ]
            return json.dumps(candidates)
        if collection == "interviewers":
            return json.dumps(seed_interviewers())
        return json.dumps([])
