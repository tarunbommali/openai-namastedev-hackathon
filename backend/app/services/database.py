"""MongoDB access with in-memory fallback when Mongo is unavailable."""

from __future__ import annotations

import logging
from typing import Any, Optional

from app.config import get_settings
from app.data.seed import seed_candidates, seed_interviews, seed_job

logger = logging.getLogger(__name__)


class MemoryStore:
    def __init__(self) -> None:
        self.job = seed_job()
        self.candidates = seed_candidates()
        self.interviews = seed_interviews()
        self.feedback: list[dict] = []
        self.parsed_resume = self.candidates[0]["parsedResume"]
        self.rankings = list(self.candidates)


class Database:
    def __init__(self) -> None:
        self.memory = MemoryStore()
        self._client = None
        self._db = None
        self.mongo_ready = False

    async def connect(self) -> None:
        settings = get_settings()
        if not settings.mongodb_uri:
            logger.info("MongoDB URI empty — using memory store")
            return
        try:
            from motor.motor_asyncio import AsyncIOMotorClient

            self._client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=1500)
            await self._client.admin.command("ping")
            self._db = self._client[settings.mongodb_db]
            self.mongo_ready = True
            await self._ensure_indexes()
            await self._seed_if_empty()
            logger.info("MongoDB connected: %s", settings.mongodb_db)
        except Exception as exc:  # noqa: BLE001
            logger.warning("MongoDB unavailable, using memory store: %s", exc)
            self.mongo_ready = False
            self._client = None
            self._db = None

    async def close(self) -> None:
        if self._client is not None:
            self._client.close()

    async def _ensure_indexes(self) -> None:
        assert self._db is not None
        await self._db.candidates.create_index("id", unique=True)
        await self._db.interviews.create_index("id", unique=True)
        await self._db.agent_logs.create_index("id")
        await self._db.agent_logs.create_index([("startedAt", -1)])

    async def _seed_if_empty(self) -> None:
        assert self._db is not None
        if await self._db.candidates.count_documents({}) == 0:
            await self._db.candidates.insert_many(seed_candidates())
        if await self._db.jobs.count_documents({}) == 0:
            await self._db.jobs.insert_one(seed_job())
        if await self._db.interviews.count_documents({}) == 0:
            await self._db.interviews.insert_many(seed_interviews())

    async def get_job(self) -> dict:
        if self.mongo_ready and self._db is not None:
            doc = await self._db.jobs.find_one({}, {"_id": 0})
            if doc:
                return doc
        return self.memory.job

    async def get_candidates(self) -> list[dict]:
        if self.mongo_ready and self._db is not None:
            cursor = self._db.candidates.find({}, {"_id": 0})
            docs = await cursor.to_list(length=200)
            if docs:
                return docs
        return self.memory.rankings

    async def save_candidates(self, candidates: list[dict]) -> None:
        self.memory.rankings = candidates
        self.memory.candidates = candidates
        if self.mongo_ready and self._db is not None:
            for cand in candidates:
                await self._db.candidates.update_one({"id": cand["id"]}, {"$set": cand}, upsert=True)

    async def get_interviews(self) -> list[dict]:
        if self.mongo_ready and self._db is not None:
            cursor = self._db.interviews.find({}, {"_id": 0}).sort("id", -1)
            docs = await cursor.to_list(length=200)
            if docs:
                return docs
        return self.memory.interviews

    async def add_interview(self, interview: dict) -> dict:
        self.memory.interviews = [interview, *self.memory.interviews]
        if self.mongo_ready and self._db is not None:
            await self._db.interviews.insert_one(dict(interview))
        return interview

    async def add_feedback(self, record: dict) -> dict:
        self.memory.feedback = [record, *self.memory.feedback]
        if self.mongo_ready and self._db is not None:
            await self._db.feedback.insert_one(dict(record))
        return record

    async def get_feedback(self) -> list[dict]:
        if self.mongo_ready and self._db is not None:
            cursor = self._db.feedback.find({}, {"_id": 0}).sort("id", -1)
            docs = await cursor.to_list(length=200)
            if docs:
                return docs
        return self.memory.feedback

    async def set_parsed_resume(self, parsed: dict) -> None:
        self.memory.parsed_resume = parsed

    def get_parsed_resume(self) -> dict:
        return self.memory.parsed_resume

    async def persist_agent_log(self, trace: dict) -> None:
        if self.mongo_ready and self._db is not None:
            try:
                await self._db.agent_logs.insert_one(dict(trace))
            except Exception as exc:  # noqa: BLE001
                logger.debug("Failed to persist agent log: %s", exc)


db = Database()
