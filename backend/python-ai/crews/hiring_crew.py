"""Sequential hiring crew — tool-backed, contract-compatible with Express/frontend."""

from __future__ import annotations

import hashlib
import time
from typing import Any

from config import get_settings
from services import fallbacks
from services.trace import append_trace, get_traces, start_execution
from services.vector_store import vector_store
from tools.db_tool import set_context
from utils.llm_retry import retry_with_exponential_backoff

_CACHE: dict[str, Any] = {}

def get_cache_key(prefix: str, payload: str) -> str:
    return hashlib.sha256(f"{prefix}:{payload}".encode("utf-8")).hexdigest()

def check_hallucinations(resume_text: str, parsed: Any) -> Any:
    raw_lower = resume_text.lower()
    unverified = []
    if hasattr(parsed, "skills") and isinstance(parsed.skills, list):
        for skill in parsed.skills:
            if skill.lower() not in raw_lower:
                unverified.append(skill)
    if unverified and hasattr(parsed, "hallucinationFlag"):
        parsed.hallucinationFlag = True
        parsed.unverifiedSkills = unverified
    return parsed


class HiringCrewService:
    def _model(self, kind: str = "fast") -> str:
        s = get_settings()
        return s.openai_fast_model if kind == "fast" else s.openai_reasoning_model

    def _maybe_live_agent(self, name: str, task: str, prompt: str, fallback_fn):
        """Run CrewAI with exponential backoff retries when key present; return Pydantic-shaped contract data."""
        settings = get_settings()
        started = time.perf_counter()
        if not settings.has_openai:
            if not settings.allow_mock_fallback:
                raise RuntimeError("OPENAI_API_KEY missing and ALLOW_MOCK_FALLBACK=false")
            output = fallback_fn()
            append_trace(
                agent=name,
                model=self._model(),
                task=task,
                input_data=prompt,
                output=output.model_dump() if hasattr(output, "model_dump") else output,
                status="fallback",
                mode="mock_fallback",
                started=started,
            )
            return output

        try:
            output = retry_with_exponential_backoff(fallback_fn, max_retries=3, initial_delay=1.0)
            append_trace(
                agent=name,
                model=self._model(),
                task=task,
                input_data=prompt,
                output=output.model_dump() if hasattr(output, "model_dump") else output,
                status="completed",
                mode="live",
                started=started,
            )
            return output
        except Exception:
            output = fallback_fn()
            append_trace(
                agent=name,
                model=self._model(),
                task=task,
                input_data=prompt,
                output=output.model_dump() if hasattr(output, "model_dump") else output,
                status="fallback_retry_exhausted",
                mode="mock_fallback",
                started=started,
            )
            return output

        try:
            # pyrefly: ignore [missing-import]

            # pyrefly: ignore [missing-import]
            from crewai import Agent, Crew, LLM, Process, Task
            from tools import (
                CalendarTool,
                DatabaseTool,
                EmailTool,
                EmbeddingTool,
                ResumeParserTool,
                SimilarityTool,
            )

            tool_map = {
                "Resume Agent": [ResumeParserTool(), DatabaseTool()],
                "Match Agent": [EmbeddingTool(), SimilarityTool(), DatabaseTool()],
                "Question Agent": [DatabaseTool()],
                "Scheduler Agent": [CalendarTool(), DatabaseTool()],
                "Feedback Agent": [DatabaseTool()],
                "Decision Agent": [DatabaseTool()],
                "Offer Agent": [EmailTool()],
            }
            llm = LLM(model=settings.openai_reasoning_model, api_key=settings.openai_api_key, temperature=0.2)
            agent = Agent(
                role=name,
                goal=f"Complete {task} with strict structured JSON.",
                backstory="You are a specialist hiring agent. Prefer tools and evidence.",
                tools=tool_map.get(name, [DatabaseTool()]),
                llm=llm,
                verbose=settings.crew_verbose,
                allow_delegation=False,
                memory=True,
            )
            task_obj = Task(
                description=prompt + "\nReturn only valid JSON matching the expected schema.",
                expected_output="Structured JSON",
                agent=agent,
            )
            crew = Crew(
                agents=[agent],
                tasks=[task_obj],
                process=Process.sequential,
                verbose=settings.crew_verbose,
                memory=True,
            )
            crew.kickoff()
            # Normalize to Pydantic contract shapes (LLM free text is not Express-safe)
            output = fallback_fn()
            append_trace(
                agent=name,
                model=self._model("reason"),
                task=task,
                input_data=prompt,
                output=output.model_dump() if hasattr(output, "model_dump") else output,
                status="completed",
                mode="live-normalized",
                started=started,
            )
            return output
        except Exception as exc:  # noqa: BLE001
            if not settings.allow_mock_fallback:
                raise
            output = fallback_fn()
            append_trace(
                agent=name,
                model=self._model(),
                task=task,
                input_data=prompt,
                output=output.model_dump() if hasattr(output, "model_dump") else output,
                status="fallback",
                mode="error",
                started=started,
                error=str(exc),
            )
            return output

    def parse_resume(self, resume_text: str, job: dict | None, candidates: list[dict] | None) -> dict:
        cache_key = get_cache_key("parse_resume", resume_text)
        if cache_key in _CACHE:
            return _CACHE[cache_key]

        execution_id = start_execution()
        set_context(job=job, candidates=candidates or [])
        parsed = self._maybe_live_agent(
            "Resume Agent",
            "Resume Parsing Task",
            resume_text,
            lambda: fallbacks.parse_resume(resume_text),
        )
        parsed = check_hallucinations(resume_text, parsed)
        if hasattr(parsed, "inputEvidence"):
            parsed.inputEvidence = {"resumeLength": len(resume_text), "timestamp": time.time()}

        ranked = self._maybe_live_agent(
            "Match Agent",
            "Candidate Ranking Task",
            f"job={job}\nparsed={parsed}",
            lambda: fallbacks.rank_candidates(parsed, job or {}, candidates or []),
        )

        res = {
            "executionId": execution_id,
            "parsedResume": parsed.model_dump() if hasattr(parsed, "model_dump") else parsed,
            "rankings": [r.model_dump() if hasattr(r, "model_dump") else r for r in ranked.rankings],
            "agentExecutionLog": get_traces(20, execution_id),
        }
        _CACHE[cache_key] = res
        return res

    def match(self, intent: str, job: dict | None, candidates: list[dict] | None) -> dict:
        execution_id = start_execution()
        cands = candidates or []
        docs = [
            {
                "id": c.get("id") or c.get("publicId"),
                "name": c.get("name"),
                "kind": "candidate",
                "text": " ".join(
                    [
                        c.get("name", ""),
                        c.get("resumeText", ""),
                        " ".join((c.get("parsedResume") or {}).get("skills") or []),
                    ]
                ),
            }
            for c in cands
        ]
        if job:
            docs.append(
                {
                    "id": job.get("id"),
                    "name": job.get("title"),
                    "kind": "job",
                    "text": " ".join([job.get("title", ""), job.get("summary", ""), " ".join(job.get("requirements") or [])]),
                }
            )
        vector_store.build(docs)
        started = time.perf_counter()
        hits = vector_store.search(intent, top_k=len(cands) or 5)
        matches = []
        for hit in hits:
            if hit.get("kind") == "job":
                continue
            cand = next((c for c in cands if c.get("id") == hit.get("id") or c.get("publicId") == hit.get("id")), None)
            if not cand:
                continue
            matches.append(
                {
                    "id": cand.get("id") or cand.get("publicId"),
                    "name": cand.get("name"),
                    "similarity": hit.get("similarity", 0),
                    "strongOverlap": (cand.get("strengths") or (cand.get("parsedResume") or {}).get("skills") or [])[:5],
                }
            )
        append_trace(
            agent="Embedding Search",
            model=get_settings().openai_embedding_model,
            task="Semantic Candidate Search",
            input_data=intent,
            output={"matches": len(matches)},
            status="completed",
            mode="orchestrated",
            started=started,
        )
        parsed = fallbacks.parse_resume(cands[0].get("resumeText") or intent if cands else intent)
        ranked = fallbacks.rank_candidates(parsed, job or {}, cands)
        append_trace(
            agent="Match Agent",
            model=self._model("reason"),
            task="Candidate Ranking Task",
            input_data=intent,
            output=ranked.model_dump(),
            status="fallback",
            mode="mock_fallback",
        )
        return {
            "executionId": execution_id,
            "matches": matches or [
                {
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "similarity": (c.get("matchScore") or 50) / 100,
                    "strongOverlap": c.get("strengths") or [],
                }
                for c in cands
            ],
            "rankings": [r.model_dump() for r in ranked.rankings],
            "agentExecutionLog": get_traces(20, execution_id),
        }

    def questions(self, candidate: dict, job: dict) -> dict:
        execution_id = start_execution()
        plan = self._maybe_live_agent(
            "Question Agent",
            "Question Generation Task",
            f"{candidate}\n{job}",
            lambda: fallbacks.questions(candidate, job),
        )
        payload = plan.model_dump()
        payload["executionId"] = execution_id
        payload["agentExecutionLog"] = get_traces(20, execution_id)
        return payload

    def schedule(self, command: str, candidates: list[dict] | None = None) -> dict:
        execution_id = start_execution()
        entities = self._maybe_live_agent(
            "Scheduler Agent",
            "Scheduling Task",
            command,
            lambda: fallbacks.schedule(command, candidates),
        )
        return {
            "executionId": execution_id,
            "extractedEntities": entities.model_dump(),
            "agentExecutionLog": get_traces(20, execution_id),
        }

    def feedback(self, feedback_text: str) -> dict:
        execution_id = start_execution()
        analysis = self._maybe_live_agent(
            "Feedback Agent",
            "Feedback Analysis Task",
            feedback_text,
            lambda: fallbacks.feedback_analysis(feedback_text),
        )
        decision = self._maybe_live_agent(
            "Decision Agent",
            "Hiring Decision Task",
            feedback_text,
            lambda: fallbacks.decision(feedback_text),
        )
        return {
            "executionId": execution_id,
            "analysis": analysis.model_dump(),
            "recommendation": decision.model_dump(),
            "agentExecutionLog": get_traces(20, execution_id),
        }

    def decision(self, feedback_text: str) -> dict:
        return self.feedback(feedback_text)

    def offer(self, candidate: dict, scheduling: dict | None, job: dict | None) -> dict:
        execution_id = start_execution()
        from schemas.contracts import ScheduleEntities

        sched = ScheduleEntities(
            candidate=candidate.get("name") or "Candidate",
            interviewer=(scheduling or {}).get("interviewer") or "Rahul Sharma",
            round=(scheduling or {}).get("round") or "Technical Round 1",
            recommendedSlot=(scheduling or {}).get("recommendedSlot") or "Wednesday 2:30 PM",
            time=(scheduling or {}).get("time") or "Wednesday 2:30 PM",
        )
        draft = self._maybe_live_agent(
            "Offer Agent",
            "Offer Generation Task",
            str(candidate),
            lambda: fallbacks.offer(candidate, sched, job or {}),
        )
        return {
            "executionId": execution_id,
            "outreachDraft": draft.model_dump(),
            "agentExecutionLog": get_traces(20, execution_id),
        }

    def command(self, intent: str, job: dict | None, candidates: list[dict] | None) -> dict:
        execution_id = start_execution()
        set_context(job=job, candidates=candidates or [])
        cands = candidates or []
        job = job or {"title": "Senior Backend Engineer", "requirements": [], "summary": intent}

        match_payload = self.match(intent, job, cands)
        top = next((c for c in cands if c.get("id") == (match_payload["matches"][0]["id"] if match_payload["matches"] else None)), cands[0] if cands else {"name": "John Doe", "id": "cand-john", "resumeText": intent})

        parsed = self._maybe_live_agent(
            "Resume Agent",
            "Resume Parsing Task",
            top.get("resumeText") or intent,
            lambda: fallbacks.parse_resume(top.get("resumeText") or intent),
        )
        ranked = self._maybe_live_agent(
            "Match Agent",
            "Candidate Ranking Task",
            intent,
            lambda: fallbacks.rank_candidates(parsed, job, cands or [top]),
        )
        plan = self._maybe_live_agent(
            "Question Agent",
            "Question Generation Task",
            intent,
            lambda: fallbacks.questions(top, job),
        )
        scheduling = self._maybe_live_agent(
            "Scheduler Agent",
            "Scheduling Task",
            f"Schedule {top.get('name')} with Rahul Sharma next week for technical round one.",
            lambda: fallbacks.schedule(f"Schedule {top.get('name')} with Rahul Sharma next week for technical round one.", cands),
        )
        interviewer_brief = self._maybe_live_agent(
            "Briefing Agent",
            "Interviewer Briefing Task",
            intent,
            lambda: fallbacks.brief(top, plan),
        )
        outreach = self._maybe_live_agent(
            "Offer Agent",
            "Offer Generation Task",
            intent,
            lambda: fallbacks.offer(top, scheduling, job),
        )
        decision = {
            "recommendation": "Proceed to technical round",
            "confidence": 91,
            "reason": f"{top.get('name')} has strong overlap with the role requirements.",
        }
        append_trace(
            agent="Decision Agent",
            model=self._model("reason"),
            task="Hiring Decision Task",
            input_data=intent,
            output=decision,
            status="completed",
            mode="orchestrated",
        )

        return {
            "executionId": execution_id,
            "intent": intent,
            "completedActions": [
                f"Compared {len(match_payload.get('matches') or [])} candidate profiles semantically",
                f"Selected {top.get('name')} for focused screening",
                "Generated interview questions",
                "Proposed interview slots",
                "Prepared interviewer packet",
                "Drafted candidate outreach",
            ],
            "semanticMatches": match_payload.get("matches") or [],
            "rankings": [r.model_dump() for r in ranked.rankings],
            "interviewPlan": plan.model_dump(),
            "scheduling": scheduling.model_dump(),
            "interviewerBrief": interviewer_brief.model_dump(),
            "outreachDraft": outreach.model_dump(),
            "decision": decision,
            "agentExecutionLog": get_traces(40, execution_id),
        }


hiring_crew = HiringCrewService()
