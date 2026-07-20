from __future__ import annotations

from app.crew_compat import Agent, Task

from app.schemas.interview import ScheduleEntities


def build_scheduler_task(agent: Agent, command: str) -> Task:
    return Task(
        description=(
            "Extract scheduling entities from this recruiter command. Find plausible "
            "matching slots, respect candidate preference, recommend the best interview "
            "time, and identify the interviewer.\n\n"
            f"COMMAND:\n{command}\n\n"
            "Return candidate, interviewer, round, durationMinutes, foundSlots, "
            "candidatePreference, recommendedSlot, scheduledAt, time."
        ),
        expected_output="A ScheduleEntities JSON object ready for interview creation.",
        agent=agent,
        output_pydantic=ScheduleEntities,
    )
