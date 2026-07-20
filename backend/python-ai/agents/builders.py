"""CrewAI agent factory — used when live OpenAI mode is enabled."""

from __future__ import annotations
from config import get_settings
from tools import (
    CalendarTool,
    DatabaseTool,
    EmailTool,
    EmbeddingTool,
    ResumeParserTool,
    SimilarityTool,
)


def _llm(kind: str = "fast"):
    from crewai import LLM

    s = get_settings()
    return LLM(
        model=s.openai_fast_model if kind == "fast" else s.openai_reasoning_model,
        api_key=s.openai_api_key,
        temperature=0.2,
    )


def build_all_agents():
    from crewai import Agent

    s = get_settings()
    common = dict(verbose=s.crew_verbose, allow_delegation=False, memory=True)
    return {
        "resume": Agent(
            role="Resume Intelligence Specialist",
            goal="Extract structured resume JSON via tools.",
            backstory="Senior technical recruiter.",
            tools=[ResumeParserTool(), DatabaseTool()],
            llm=_llm("fast"),
            **common,
        ),
        "match": Agent(
            role="Semantic Matching Specialist",
            goal="Rank candidates with embeddings and similarity tools.",
            backstory="Talent intelligence analyst.",
            tools=[EmbeddingTool(), SimilarityTool(), DatabaseTool()],
            llm=_llm("reason"),
            **common,
        ),
        "question": Agent(
            role="Interview Question Designer",
            goal="Generate interview questions tied to hiring signals.",
            backstory="Interview loop designer.",
            tools=[DatabaseTool()],
            llm=_llm("reason"),
            **common,
        ),
        "scheduler": Agent(
            role="Interview Scheduling Coordinator",
            goal="Extract scheduling entities with calendar tool.",
            backstory="Calendar coordinator.",
            tools=[CalendarTool(), DatabaseTool()],
            llm=_llm("fast"),
            **common,
        ),
        "feedback": Agent(
            role="Interview Feedback Analyst",
            goal="Extract strengths, weaknesses, and scores from feedback.",
            backstory="Calibration specialist.",
            tools=[DatabaseTool()],
            llm=_llm("reason"),
            **common,
        ),
        "decision": Agent(
            role="Hiring Decision Strategist",
            goal="Recommend Hire, Reject, or Hold with confidence.",
            backstory="Hiring committee chair.",
            tools=[DatabaseTool()],
            llm=_llm("reason"),
            **common,
        ),
        "offer": Agent(
            role="Candidate Outreach Specialist",
            goal="Draft personalized outreach without overpromising.",
            backstory="Recruiting communications lead.",
            tools=[EmailTool()],
            llm=_llm("fast"),
            **common,
        ),
    }
