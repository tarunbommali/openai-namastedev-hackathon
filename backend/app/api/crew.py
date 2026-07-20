from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.orchestrator import orchestrator
from app.services.candidate_service import merge_rankings
from app.services.database import db
from app.data.seed import seed_candidates

router = APIRouter()


class CommandBody(BaseModel):
    intent: str | None = None


@router.post("/command")
@router.post("/api/command")
async def run_command(body: CommandBody | None = None):
    intent = (body.intent if body else None) or (
        "Hire a senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience."
    )
    result = await orchestrator.run_hiring_os(intent)

    rankings = result.get("rankings") or []
    if rankings:
        base = await db.get_candidates()
        # Prefer seeded full profiles as merge base
        merged = merge_rankings(base or seed_candidates(), rankings)
        await db.save_candidates(merged)
        result["rankings"] = [
            {
                "id": c["id"],
                "name": c["name"],
                "matchScore": c.get("matchScore", 0),
                "confidence": c.get("confidence", 0),
                "strengths": c.get("strengths", []),
                "explanation": c.get("explanation", ""),
                "gaps": c.get("gaps", []),
            }
            for c in merged
        ]

    return result
