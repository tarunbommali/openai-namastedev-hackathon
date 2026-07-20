from __future__ import annotations

import json

from app.crew_compat import Agent, Task

from app.schemas.interview import InterviewPlan


def build_question_task(agent: Agent, payload: dict) -> Task:
    return Task(
        description=(
            "Generate an interview plan for this candidate and role. Include Easy, Medium, "
            "Hard, Behavioral, System Design, and Coding questions. Each question must "
            "include difficulty, question text, and the hiring signal it probes.\n\n"
            f"CONTEXT:\n{json.dumps(payload, indent=2)}"
        ),
        expected_output="An InterviewPlan JSON object with candidate, role, and questions.",
        agent=agent,
        output_pydantic=InterviewPlan,
    )
