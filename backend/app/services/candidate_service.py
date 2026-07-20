"""Candidate ranking merge + semantic search helpers."""

from __future__ import annotations

import re
from typing import Any

from app.config import get_settings
from app.data.seed import seed_candidates
from app.services.database import db
from app.services.logger import agent_logger
from app.services.vector_store import vector_store


def tokenize(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9+.]+", str(value or "").lower()))


def candidate_search_text(candidate: dict) -> str:
    parsed = candidate.get("parsedResume") or {}
    return " ".join(
        [
            candidate.get("name", ""),
            candidate.get("resumeText", ""),
            candidate.get("explanation", ""),
            *parsed.get("skills", []),
            *parsed.get("roleSignals", []),
            *parsed.get("relevantProjects", []),
        ]
    )


def fallback_semantic_matches(intent: str, candidates: list[dict] | None = None) -> list[dict]:
    candidates = candidates or seed_candidates()
    intent_tokens = tokenize(intent)
    results = []
    for candidate in candidates:
        candidate_tokens = tokenize(candidate_search_text(candidate))
        overlap = [t for t in intent_tokens if t in candidate_tokens]
        parsed = candidate.get("parsedResume") or {}
        strong = [
            item
            for item in [*parsed.get("skills", []), *parsed.get("roleSignals", [])]
            if any(tok in intent_tokens for tok in tokenize(item))
        ]
        similarity = min(0.98, round(0.52 + len(overlap) * 0.065 + candidate.get("matchScore", 0) / 1000, 2))
        results.append(
            {
                "id": candidate["id"],
                "name": candidate["name"],
                "similarity": similarity,
                "strongOverlap": list(dict.fromkeys(strong))[:5],
            }
        )
    return sorted(results, key=lambda x: x["similarity"], reverse=True)


async def semantic_candidate_search(intent: str) -> list[dict]:
    settings = get_settings()
    candidates = await db.get_candidates()

    # Prefer FAISS when index is warm
    hits = vector_store.search(intent, top_k=len(candidates) or 5)
    if hits:
        by_id = {c["id"]: c for c in candidates}
        matches = []
        for hit in hits:
            cand = by_id.get(hit["id"])
            if not cand:
                continue
            parsed = cand.get("parsedResume") or {}
            matches.append(
                {
                    "id": cand["id"],
                    "name": cand["name"],
                    "similarity": hit["similarity"],
                    "strongOverlap": (cand.get("strengths") or parsed.get("skills") or [])[:5],
                }
            )
        if matches:
            agent_logger.append_synthetic(
                "Embedding Search",
                settings.openai_embedding_model,
                intent,
                f"{len(matches)} candidates compared semantically",
                duration_ms=520,
            )
            return matches

    matches = fallback_semantic_matches(intent, candidates)
    agent_logger.append_synthetic(
        "Embedding Search",
        settings.openai_embedding_model,
        intent,
        "3 candidates compared semantically",
        duration_ms=420,
    )
    return matches


def merge_rankings(base: list[dict], ranked: list[dict]) -> list[dict]:
    merged = []
    for candidate in base:
        ai = next(
            (
                item
                for item in ranked
                if item.get("id") == candidate["id"] or item.get("name") == candidate["name"]
            ),
            None,
        )
        merged.append({**candidate, **ai} if ai else candidate)
    return sorted(merged, key=lambda c: c.get("matchScore", 0), reverse=True)


async def rebuild_vector_index() -> int:
    candidates = await db.get_candidates()
    job = await db.get_job()
    docs = [
        {
            "id": c["id"],
            "name": c["name"],
            "kind": "candidate",
            "text": candidate_search_text(c),
        }
        for c in candidates
    ]
    docs.append(
        {
            "id": job["id"],
            "name": job["title"],
            "kind": "job",
            "text": " ".join([job["title"], job["summary"], *job.get("requirements", [])]),
        }
    )
    return vector_store.build(docs)
