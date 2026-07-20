from __future__ import annotations

from app.crew_compat import Agent, Task

from app.schemas.decision import HiringDecision


def build_decision_task(agent: Agent, feedback_text: str, analysis_json: str = "") -> Task:
    return Task(
        description=(
            "Given interviewer feedback (and optional structured analysis), recommend the "
            "next hiring step. Map to Hire / Reject / Hold in the decision field, and also "
            "populate recommendation, reason, confidence, and reasoning for the UI.\n\n"
            f"FEEDBACK:\n{feedback_text}\n\n"
            f"ANALYSIS:\n{analysis_json or 'N/A'}"
        ),
        expected_output="A HiringDecision JSON object with recommendation, reason, confidence.",
        agent=agent,
        output_pydantic=HiringDecision,
    )
