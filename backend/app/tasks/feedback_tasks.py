from __future__ import annotations

from app.crew_compat import Agent, Task

from app.schemas.feedback import FeedbackAnalysis


def build_feedback_task(agent: Agent, feedback_text: str) -> Task:
    return Task(
        description=(
            "Analyze the interviewer feedback below. Extract strengths, weaknesses, "
            "cultureFit, technicalScore (0-10), communicationScore (0-10), and a short summary.\n\n"
            f"FEEDBACK:\n{feedback_text}"
        ),
        expected_output="A FeedbackAnalysis JSON object with calibrated scores.",
        agent=agent,
        output_pydantic=FeedbackAnalysis,
    )
