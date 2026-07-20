from __future__ import annotations

from app.crew_compat import Agent, Task

from app.schemas.resume import ParsedResume


def build_resume_task(agent: Agent, resume_text: str) -> Task:
    return Task(
        description=(
            "Parse the following resume into structured recruiting JSON.\n\n"
            f"RESUME:\n{resume_text}\n\n"
            "Extract: name, skills, experienceYears, seniority, domain, education, "
            "achievements, roleSignals, relevantProjects, technologies, leadership. "
            "Infer conservatively when text is incomplete. Do not invent employers."
        ),
        expected_output="A ParsedResume JSON object with all required fields populated.",
        agent=agent,
        output_pydantic=ParsedResume,
    )
