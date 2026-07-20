"""Deterministic skill-gap ranking helper for Matching Agent."""

from __future__ import annotations

import json
from typing import Type

from app.crew_compat import BaseTool
from pydantic import BaseModel, Field


class RankingInput(BaseModel):
    job_requirements: list[str] = Field(..., description="Job requirement strings")
    candidate_skills: list[str] = Field(..., description="Candidate skill strings")
    candidate_name: str = Field(..., description="Candidate display name")
    candidate_id: str = Field(..., description="Candidate id")


class RankingTool(BaseTool):
    name: str = "ranking_tool"
    description: str = (
        "Compute a baseline match score, strengths, and skill gaps between a candidate "
        "and job requirements. Useful as grounding before LLM ranking."
    )
    args_schema: Type[BaseModel] = RankingInput

    def _run(
        self,
        job_requirements: list[str],
        candidate_skills: list[str],
        candidate_name: str,
        candidate_id: str,
    ) -> str:
        skill_l = {s.lower() for s in candidate_skills}
        strengths = []
        gaps = []
        for req in job_requirements:
            req_l = req.lower()
            hit = any(tok in req_l for tok in skill_l) or any(s in req_l for s in skill_l)
            if hit:
                strengths.append(req)
            else:
                gaps.append(req)

        covered = len(strengths)
        total = max(len(job_requirements), 1)
        match_score = round(55 + (covered / total) * 40, 1)
        confidence = min(98, round(match_score + 3, 1))
        return json.dumps(
            {
                "id": candidate_id,
                "name": candidate_name,
                "matchScore": match_score,
                "confidence": confidence,
                "strengths": strengths[:5],
                "gaps": gaps[:5],
                "explanation": f"Covered {covered}/{total} core requirements.",
            }
        )
