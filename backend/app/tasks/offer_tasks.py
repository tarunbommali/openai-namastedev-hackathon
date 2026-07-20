from __future__ import annotations

import json

from app.crew_compat import Agent, Task

from app.schemas.offer import OfferDraft, InterviewerBrief


def build_offer_task(agent: Agent, payload: dict) -> Task:
    return Task(
        description=(
            "Draft concise, professional candidate outreach for the proposed interview. "
            "Do not promise an offer or make unsupported claims.\n\n"
            f"CONTEXT:\n{json.dumps(payload, indent=2)}"
        ),
        expected_output="An OfferDraft JSON object with subject and body.",
        agent=agent,
        output_pydantic=OfferDraft,
    )


def build_briefing_task(agent: Agent, payload: dict) -> Task:
    return Task(
        description=(
            "Create a concise interviewer brief. Highlight evidence-based strengths, "
            "risks to probe, and focus areas for the interview.\n\n"
            f"CONTEXT:\n{json.dumps(payload, indent=2)}"
        ),
        expected_output="An InterviewerBrief JSON object.",
        agent=agent,
        output_pydantic=InterviewerBrief,
    )
