"""CrewAI task factory for the sequential hiring crew."""

from __future__ import annotations
from typing import Any


def build_hiring_tasks(agents: dict[str, Any], context: dict[str, Any]):
    from crewai import Task

    resume_text = context.get("resumeText") or context.get("intent") or ""
    job = context.get("job") or {}
    candidate = context.get("candidate") or {}
    feedback_text = context.get("feedbackText") or ""

    parse = Task(
        description=f"Parse this resume into structured JSON fields.\n\n{resume_text}",
        expected_output="ParsedResume JSON",
        agent=agents["resume"],
    )
    match = Task(
        description=f"Rank candidates for job {job.get('title')} using tools.",
        expected_output="RankingResult JSON",
        agent=agents["match"],
        context=[parse],
    )
    questions = Task(
        description=f"Generate interview questions for {candidate.get('name')} applying to {job.get('title')}.",
        expected_output="InterviewPlan JSON",
        agent=agents["question"],
        context=[match],
    )
    schedule = Task(
        description=f"Extract scheduling entities for interview of {candidate.get('name')}.",
        expected_output="ScheduleEntities JSON",
        agent=agents["scheduler"],
        context=[questions],
    )
    feedback = Task(
        description=f"Analyze interviewer feedback:\n{feedback_text}",
        expected_output="FeedbackAnalysis JSON",
        agent=agents["feedback"],
    )
    decision = Task(
        description=f"Recommend Hire/Reject/Hold from feedback:\n{feedback_text}",
        expected_output="HiringDecision JSON",
        agent=agents["decision"],
        context=[feedback],
    )
    offer = Task(
        description=f"Draft outreach for {candidate.get('name')} for {job.get('title')}.",
        expected_output="OfferDraft JSON",
        agent=agents["offer"],
        context=[schedule],
    )
    return [parse, match, questions, schedule, feedback, decision, offer]
