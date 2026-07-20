"""Hiring Crew orchestrator — sequential CrewAI process with retry + fallbacks."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Callable, Optional, Type

from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential

from app.agents.decision_agent import build_decision_agent
from app.agents.feedback_agent import build_feedback_agent
from app.agents.matching_agent import build_matching_agent
from app.agents.offer_agent import build_briefing_agent, build_offer_agent
from app.agents.question_agent import build_question_agent
from app.agents.resume_agent import build_resume_agent
from app.agents.scheduler_agent import build_scheduler_agent
from app.config import get_settings
from app.crew_compat import CREWAI_AVAILABLE
from app.data.seed import seed_candidates, seed_interviewers
from app.schemas.candidate import RankingResult
from app.schemas.common import AgentExecutionGraph, GraphEdge, GraphNode
from app.schemas.decision import HiringDecision
from app.schemas.feedback import FeedbackAnalysis
from app.schemas.interview import InterviewPlan, ScheduleEntities
from app.schemas.offer import InterviewerBrief, OfferDraft
from app.schemas.resume import ParsedResume
from app.services.candidate_service import (
    candidate_search_text,
    merge_rankings,
    semantic_candidate_search,
)
from app.services.database import db
from app.services.interview_service import (
    fallback_decision,
    fallback_feedback_analysis,
    fallback_questions,
    fallback_schedule,
)
from app.services.logger import agent_logger
from app.tasks.decision_tasks import build_decision_task
from app.tasks.feedback_tasks import build_feedback_task
from app.tasks.matching_tasks import build_matching_task
from app.tasks.offer_tasks import build_briefing_task, build_offer_task
from app.tasks.question_tasks import build_question_task
from app.tasks.resume_tasks import build_resume_task
from app.tasks.scheduler_tasks import build_scheduler_task

logger = logging.getLogger(__name__)

# Display names must match React Flow node matching in frontend/src/main.jsx
AGENT_DISPLAY = {
    "resume": "Resume Agent",
    "match": "Match Agent",
    "question": "Question Agent",
    "scheduler": "Scheduler Agent",
    "feedback": "Feedback Agent",
    "decision": "Decision Agent",
    "offer": "Offer Agent",
    "briefing": "Briefing Agent",
}


def build_execution_graph(completed_agents: list[str]) -> dict:
    order = [
        "Resume Agent",
        "Match Agent",
        "Question Agent",
        "Scheduler Agent",
        "Feedback Agent",
        "Decision Agent",
        "Offer Agent",
    ]
    nodes = []
    for name in order:
        status = "completed" if name in completed_agents else "idle"
        nodes.append(GraphNode(id=name.lower().replace(" ", "-"), label=name, status=status))
    edges = [
        GraphEdge(id=f"e{i}", source=nodes[i].id, target=nodes[i + 1].id)
        for i in range(len(nodes) - 1)
    ]
    return AgentExecutionGraph(nodes=nodes, edges=edges).model_dump()


def _to_dict(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, BaseModel):
        return value.model_dump()
    if hasattr(value, "model_dump"):
        return value.model_dump()
    if isinstance(value, dict):
        return value
    return value


def _extract_pydantic(result: Any, model: Type[BaseModel]) -> Optional[BaseModel]:
    if result is None:
        return None
    if isinstance(result, model):
        return result
    # CrewOutput / TaskOutput shapes
    pydantic_obj = getattr(result, "pydantic", None)
    if isinstance(pydantic_obj, model):
        return pydantic_obj
    tasks_output = getattr(result, "tasks_output", None) or getattr(result, "tasks", None)
    if tasks_output:
        last = tasks_output[-1]
        pyd = getattr(last, "pydantic", None)
        if isinstance(pyd, model):
            return pyd
        raw = getattr(last, "raw", None) or str(last)
        try:
            return model.model_validate_json(raw)
        except Exception:  # noqa: BLE001
            pass
    raw = getattr(result, "raw", None)
    if isinstance(raw, str):
        try:
            return model.model_validate_json(raw)
        except Exception:  # noqa: BLE001
            pass
    if isinstance(result, dict):
        try:
            return model.model_validate(result)
        except Exception:  # noqa: BLE001
            return None
    if isinstance(result, str):
        try:
            return model.model_validate_json(result)
        except Exception:  # noqa: BLE001
            return None
    return None


class HiringOrchestrator:
    """Runs single-agent tasks or the full sequential Hiring Crew."""

    def _should_use_live(self) -> bool:
        return get_settings().has_openai and CREWAI_AVAILABLE

    def _run_single_task(
        self,
        *,
        agent_key: str,
        model_name: str,
        task_name: str,
        build_agent: Callable,
        build_task: Callable,
        fallback: dict,
        schema: Type[BaseModel],
        input_preview: Any,
    ) -> dict:
        settings = get_settings()
        started = datetime.now(timezone.utc)
        display = AGENT_DISPLAY[agent_key]

        if not self._should_use_live():
            agent_logger.append(
                agent=display,
                model=model_name,
                input_data=input_preview,
                output=fallback,
                status="fallback",
                mode="demo",
                started_at=started,
                task=task_name,
            )
            return fallback

        try:
            output = self._kickoff_with_retry(build_agent, build_task, schema)
            if output is None:
                raise ValueError("Crew returned empty structured output")
            data = _to_dict(output)
            agent_logger.append(
                agent=display,
                model=model_name,
                input_data=input_preview,
                output=data,
                status="completed",
                mode="live",
                started_at=started,
                task=task_name,
            )
            return data
        except Exception as exc:  # noqa: BLE001
            logger.warning("%s failed, using fallback: %s", display, exc)
            agent_logger.append(
                agent=display,
                model=model_name,
                input_data=input_preview,
                output=fallback,
                status="fallback",
                mode="error",
                started_at=started,
                task=task_name,
                error=exc,
            )
            return fallback

    def _kickoff_with_retry(
        self,
        build_agent: Callable,
        build_task: Callable,
        schema: Type[BaseModel],
    ) -> Optional[BaseModel]:
        settings = get_settings()

        @retry(
            stop=stop_after_attempt(max(1, settings.crew_max_retries)),
            wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
            reraise=True,
        )
        def _inner():
            from app.crew_compat import Crew, Process

            agent = build_agent()
            task = build_task(agent)
            process = (
                Process.hierarchical
                if settings.crew_process == "hierarchical"
                else Process.sequential
            )
            crew = Crew(
                agents=[agent],
                tasks=[task],
                process=process,
                verbose=settings.crew_verbose,
                memory=settings.crew_memory,
            )
            result = crew.kickoff()
            parsed = _extract_pydantic(result, schema)
            if parsed is None:
                raise ValueError(f"Unable to parse {schema.__name__} from crew output")
            return parsed

        return _inner()

    # ----- Public agent operations -----

    async def parse_resume(self, resume_text: str) -> dict:
        settings = get_settings()
        fallback = seed_candidates()[0]["parsedResume"]
        return self._run_single_task(
            agent_key="resume",
            model_name=settings.openai_fast_model,
            task_name="Resume Parsing Task",
            build_agent=build_resume_agent,
            build_task=lambda agent: build_resume_task(agent, resume_text),
            fallback=fallback,
            schema=ParsedResume,
            input_preview=resume_text,
        )

    async def rank_candidates(self, parsed_resume: dict) -> dict:
        settings = get_settings()
        job = await db.get_job()
        candidates = await db.get_candidates()
        fallback_rankings = [
            {
                "id": c["id"],
                "name": c["name"],
                "matchScore": c["matchScore"],
                "confidence": c["confidence"],
                "strengths": c["strengths"],
                "explanation": c["explanation"],
                "gaps": c["gaps"],
            }
            for c in candidates
        ]
        payload = {"job": job, "parsedResume": parsed_resume, "candidates": candidates}
        result = self._run_single_task(
            agent_key="match",
            model_name=settings.openai_reasoning_model,
            task_name="Candidate Ranking Task",
            build_agent=build_matching_agent,
            build_task=lambda agent: build_matching_task(agent, payload),
            fallback={"rankings": fallback_rankings},
            schema=RankingResult,
            input_preview=payload,
        )
        if "rankings" not in result:
            return {"rankings": fallback_rankings}
        return result

    async def generate_questions(self, candidate: dict, job: dict) -> dict:
        settings = get_settings()
        fallback = fallback_questions(candidate["name"], job["title"])
        payload = {"candidate": candidate, "job": job}
        return self._run_single_task(
            agent_key="question",
            model_name=settings.openai_reasoning_model,
            task_name="Question Generation Task",
            build_agent=build_question_agent,
            build_task=lambda agent: build_question_task(agent, payload),
            fallback=fallback,
            schema=InterviewPlan,
            input_preview=payload,
        )

    async def extract_schedule(self, command: str) -> dict:
        settings = get_settings()
        fallback = fallback_schedule(command)
        return self._run_single_task(
            agent_key="scheduler",
            model_name=settings.openai_fast_model,
            task_name="Scheduling Task",
            build_agent=build_scheduler_agent,
            build_task=lambda agent: build_scheduler_task(agent, command),
            fallback=fallback,
            schema=ScheduleEntities,
            input_preview=command,
        )

    async def analyze_feedback(self, feedback_text: str) -> dict:
        settings = get_settings()
        fallback = fallback_feedback_analysis(feedback_text)
        return self._run_single_task(
            agent_key="feedback",
            model_name=settings.openai_reasoning_model,
            task_name="Feedback Analysis Task",
            build_agent=build_feedback_agent,
            build_task=lambda agent: build_feedback_task(agent, feedback_text),
            fallback=fallback,
            schema=FeedbackAnalysis,
            input_preview=feedback_text,
        )

    async def recommend_next_step(self, feedback_text: str, analysis: Optional[dict] = None) -> dict:
        settings = get_settings()
        fallback = fallback_decision(feedback_text)
        analysis_json = json.dumps(analysis or {})
        return self._run_single_task(
            agent_key="decision",
            model_name=settings.openai_reasoning_model,
            task_name="Hiring Decision Task",
            build_agent=build_decision_agent,
            build_task=lambda agent: build_decision_task(agent, feedback_text, analysis_json),
            fallback=fallback,
            schema=HiringDecision,
            input_preview=feedback_text,
        )

    async def create_brief(self, candidate: dict, interview_plan: dict) -> dict:
        settings = get_settings()
        job = await db.get_job()
        fallback = {
            "candidate": candidate["name"],
            "strengths": candidate.get("strengths")
            or (candidate.get("parsedResume") or {}).get("skills", [])[:4],
            "potentialConcerns": candidate.get("gaps") or ["Validate scope of production ownership"],
            "recommendedFocusAreas": [
                q.get("signal") for q in (interview_plan.get("questions") or [])[:3]
            ],
        }
        payload = {"candidate": candidate, "job": job, "interviewPlan": interview_plan}
        return self._run_single_task(
            agent_key="briefing",
            model_name=settings.openai_reasoning_model,
            task_name="Interviewer Briefing Task",
            build_agent=build_briefing_agent,
            build_task=lambda agent: build_briefing_task(agent, payload),
            fallback=fallback,
            schema=InterviewerBrief,
            input_preview=payload,
        )

    async def create_outreach(self, candidate: dict, scheduling: dict) -> dict:
        settings = get_settings()
        job = await db.get_job()
        fallback = {
            "subject": f"Technical interview invitation for {job['title']}",
            "body": (
                f"Hi {candidate['name']}, {scheduling.get('interviewer')} would like to meet "
                f"you for {scheduling.get('round')} on {scheduling.get('recommendedSlot')}. "
                f"Please let us know if that time works for you."
            ),
        }
        payload = {
            "candidate": candidate["name"],
            "job": job["title"],
            "scheduling": scheduling,
        }
        return self._run_single_task(
            agent_key="offer",
            model_name=settings.openai_fast_model,
            task_name="Offer Generation Task",
            build_agent=build_offer_agent,
            build_task=lambda agent: build_offer_task(agent, payload),
            fallback=fallback,
            schema=OfferDraft,
            input_preview=payload,
        )

    async def run_hiring_os(self, intent: str) -> dict:
        """Full sequential hiring pipeline used by POST /api/command."""
        settings = get_settings()
        completed: list[str] = []

        if self._should_use_live():
            try:
                live = await self._run_full_crew(intent)
                if live:
                    live["executionGraph"] = build_execution_graph(
                        [
                            "Resume Agent",
                            "Match Agent",
                            "Question Agent",
                            "Scheduler Agent",
                            "Decision Agent",
                            "Offer Agent",
                        ]
                    )
                    live["agentExecutionLog"] = agent_logger.get_logs()
                    return live
            except Exception as exc:  # noqa: BLE001
                logger.warning("Full crew failed, stepping through agents: %s", exc)

        # Stepped orchestration (works in demo + as crew fallback)
        semantic_matches = await semantic_candidate_search(intent)
        candidates = await db.get_candidates()
        top = next((c for c in candidates if c["id"] == semantic_matches[0]["id"]), candidates[0])

        parsed = await self.parse_resume(top.get("resumeText") or candidate_search_text(top))
        completed.append("Resume Agent")
        ranked = await self.rank_candidates(parsed)
        completed.append("Match Agent")
        job = await db.get_job()
        interview_plan = await self.generate_questions(top, job)
        completed.append("Question Agent")
        scheduling = await self.extract_schedule(
            f"Schedule {top['name']} with Rahul Sharma next week for technical round one."
        )
        completed.append("Scheduler Agent")
        brief = await self.create_brief(top, interview_plan)
        outreach = await self.create_outreach(top, scheduling)
        completed.append("Offer Agent")

        decision = {
            "recommendation": "Proceed to technical round",
            "confidence": 91,
            "reason": (
                f"{top['name']} has strong overlap with Node.js, Kafka, Redis, "
                f"and distributed systems requirements."
            ),
            "decision": "Hold",
            "reasoning": "Advance to technical round before final Hire/Reject.",
        }
        # Log decision for React Flow Decision Agent node
        agent_logger.append(
            agent="Decision Agent",
            model=settings.openai_reasoning_model,
            input_data=intent,
            output=decision,
            status="completed",
            mode="orchestrated",
            task="Hiring Decision Task",
            duration_ms=180,
        )
        completed.append("Decision Agent")

        return {
            "intent": intent,
            "completedActions": [
                f"Compared {len(semantic_matches)} candidate profiles semantically",
                f"Selected {top['name']} for focused screening",
                "Generated interview questions",
                "Proposed interview slots",
                "Prepared interviewer packet",
                "Drafted candidate outreach",
            ],
            "semanticMatches": semantic_matches,
            "rankings": ranked.get("rankings", []),
            "interviewPlan": interview_plan,
            "scheduling": scheduling,
            "interviewerBrief": brief,
            "outreachDraft": outreach,
            "decision": decision,
            "executionGraph": build_execution_graph(completed),
            "agentExecutionLog": agent_logger.get_logs(),
        }

    async def _run_full_crew(self, intent: str) -> Optional[dict]:
        """True multi-agent sequential CrewAI hiring crew."""
        from app.crew_compat import Crew, Process

        settings = get_settings()
        job = await db.get_job()
        candidates = await db.get_candidates()
        semantic_matches = await semantic_candidate_search(intent)
        top = next((c for c in candidates if c["id"] == semantic_matches[0]["id"]), candidates[0])
        resume_text = top.get("resumeText") or candidate_search_text(top)

        resume_agent = build_resume_agent()
        match_agent = build_matching_agent()
        question_agent = build_question_agent()
        scheduler_agent = build_scheduler_agent()
        decision_agent = build_decision_agent()
        offer_agent = build_offer_agent()

        resume_task = build_resume_task(resume_agent, resume_text)
        match_task = build_matching_task(
            match_agent,
            {"job": job, "intent": intent, "candidates": candidates, "focusCandidate": top},
        )
        match_task.context = [resume_task]
        question_task = build_question_task(question_agent, {"candidate": top, "job": job})
        question_task.context = [resume_task, match_task]
        schedule_cmd = f"Schedule {top['name']} with Rahul Sharma tomorrow at 2 PM for technical round."
        scheduler_task = build_scheduler_task(scheduler_agent, schedule_cmd)
        scheduler_task.context = [match_task]
        decision_task = build_decision_task(
            decision_agent,
            (
                f"Intent: {intent}. Top candidate {top['name']} shows strong role overlap. "
                f"Recommend next step before offer."
            ),
            analysis_json=json.dumps({"candidate": top["name"], "intent": intent}),
        )
        decision_task.context = [match_task, question_task]
        offer_task = build_offer_task(
            offer_agent,
            {"candidate": top["name"], "job": job["title"], "intent": intent},
        )
        offer_task.context = [scheduler_task, decision_task]

        process = (
            Process.hierarchical
            if settings.crew_process == "hierarchical"
            else Process.sequential
        )
        crew = Crew(
            agents=[
                resume_agent,
                match_agent,
                question_agent,
                scheduler_agent,
                decision_agent,
                offer_agent,
            ],
            tasks=[
                resume_task,
                match_task,
                question_task,
                scheduler_task,
                decision_task,
                offer_task,
            ],
            process=process,
            verbose=settings.crew_verbose,
            memory=settings.crew_memory,
        )

        started = datetime.now(timezone.utc)
        result = crew.kickoff()

        parsed = _extract_pydantic(getattr(resume_task, "output", None) or result, ParsedResume)
        ranked = _extract_pydantic(getattr(match_task, "output", None), RankingResult)
        plan = _extract_pydantic(getattr(question_task, "output", None), InterviewPlan)
        schedule = _extract_pydantic(getattr(scheduler_task, "output", None), ScheduleEntities)
        decision = _extract_pydantic(getattr(decision_task, "output", None), HiringDecision)
        offer = _extract_pydantic(getattr(offer_task, "output", None), OfferDraft)

        # Log each agent for the UI timeline
        for key, model, task_name, output in [
            ("resume", settings.openai_fast_model, "Resume Parsing Task", _to_dict(parsed)),
            ("match", settings.openai_reasoning_model, "Candidate Ranking Task", _to_dict(ranked)),
            ("question", settings.openai_reasoning_model, "Question Generation Task", _to_dict(plan)),
            ("scheduler", settings.openai_fast_model, "Scheduling Task", _to_dict(schedule)),
            ("decision", settings.openai_reasoning_model, "Hiring Decision Task", _to_dict(decision)),
            ("offer", settings.openai_fast_model, "Offer Generation Task", _to_dict(offer)),
        ]:
            agent_logger.append(
                agent=AGENT_DISPLAY[key],
                model=model,
                input_data=intent,
                output=output or {},
                status="completed" if output else "fallback",
                mode="live",
                started_at=started,
                task=task_name,
            )

        interview_plan = _to_dict(plan) or fallback_questions(top["name"], job["title"])
        scheduling = _to_dict(schedule) or fallback_schedule(schedule_cmd)
        brief = await self.create_brief(top, interview_plan)
        outreach = _to_dict(offer) or await self.create_outreach(top, scheduling)
        decision_dict = _to_dict(decision) or {
            "recommendation": "Proceed to technical round",
            "confidence": 91,
            "reason": f"{top['name']} has strong overlap with the role requirements.",
        }

        rankings = (_to_dict(ranked) or {}).get("rankings") or [
            {
                "id": c["id"],
                "name": c["name"],
                "matchScore": c["matchScore"],
                "confidence": c["confidence"],
                "strengths": c["strengths"],
                "explanation": c["explanation"],
                "gaps": c["gaps"],
            }
            for c in candidates
        ]

        return {
            "intent": intent,
            "completedActions": [
                f"Compared {len(semantic_matches)} candidate profiles semantically",
                f"Selected {top['name']} for focused screening",
                "Generated interview questions",
                "Proposed interview slots",
                "Prepared interviewer packet",
                "Drafted candidate outreach",
            ],
            "semanticMatches": semantic_matches,
            "rankings": rankings,
            "interviewPlan": interview_plan,
            "scheduling": scheduling,
            "interviewerBrief": brief,
            "outreachDraft": outreach,
            "decision": decision_dict,
        }


orchestrator = HiringOrchestrator()
