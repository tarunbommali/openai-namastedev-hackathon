from __future__ import annotations

import json

from app.crew_compat import Agent, Task

from app.schemas.candidate import RankingResult


def build_matching_task(agent: Agent, payload: dict) -> Task:
    return Task(
        description=(
            "Rank candidates against the job using semantic fit, evidence, strengths, "
            "gaps, and confidence. Prefer explainable reasoning over keyword matching.\n\n"
            f"CONTEXT:\n{json.dumps(payload, indent=2)}\n\n"
            "Return rankings sorted best-first. Each item needs id, name, matchScore, "
            "confidence, strengths, explanation, gaps."
        ),
        expected_output="A RankingResult JSON object with a rankings array.",
        agent=agent,
        output_pydantic=RankingResult,
    )
