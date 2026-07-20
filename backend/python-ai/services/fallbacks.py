from __future__ import annotations
import re
from datetime import datetime, timezone
from schemas.contracts import (
    FeedbackAnalysis,
    HiringDecision,
    InterviewPlan,
    InterviewQuestion,
    InterviewerBrief,
    OfferDraft,
    ParsedResume,
    RankingResult,
    CandidateRanking,
    ScheduleEntities,
)

SKILLS = [
    "Node.js", "Express", "Docker", "Kafka", "Redis", "AWS", "PostgreSQL",
    "Python", "FastAPI", "MongoDB", "React", "Kubernetes", "TypeScript", "Java",
]


def parse_resume(text: str) -> ParsedResume:
    lower = text.lower()
    skills = [s for s in SKILLS if s.lower() in lower]
    years = re.search(r"(\d+)\s*\+?\s*years?", text, re.I)
    name_m = re.match(r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", text.strip())
    return ParsedResume(
        name=name_m.group(1) if name_m else "Candidate",
        skills=skills or ["Backend engineering"],
        experienceYears=float(years.group(1)) if years else 0,
        seniority="Senior" if years and int(years.group(1)) >= 5 else "Mid",
        domain="Backend Engineering",
        education="",
        achievements=[],
        roleSignals=skills[:4],
        relevantProjects=[],
    )


def rank_candidates(parsed: ParsedResume, job: dict, candidates: list[dict]) -> RankingResult:
    reqs = " ".join(job.get("requirements") or []).lower() + " " + (job.get("summary") or "").lower()
    rankings = []
    for c in candidates:
        skills = (c.get("parsedResume") or {}).get("skills") or c.get("strengths") or []
        if c.get("name") == parsed.name:
            skills = list({*skills, *parsed.skills})
        strengths = [s for s in skills if s.lower() in reqs]
        gaps = [r for r in (job.get("requirements") or []) if not any(tok.lower() in r.lower() for tok in skills)]
        score = min(98.0, 55 + len(strengths) * 8)
        rankings.append(
            CandidateRanking(
                id=c.get("id") or c.get("publicId") or f"cand-{c.get('name','x').lower().replace(' ','-')}",
                name=c.get("name") or "Unknown",
                matchScore=score,
                confidence=min(98.0, score + 3),
                strengths=strengths[:5] or c.get("strengths") or [],
                explanation=c.get("explanation") or f"Matched {len(strengths)} overlapping skills.",
                gaps=(gaps[:3] if gaps else c.get("gaps") or []),
            )
        )
    rankings.sort(key=lambda r: r.matchScore, reverse=True)
    return RankingResult(rankings=rankings)


def questions(candidate: dict, job: dict) -> InterviewPlan:
    name = candidate.get("name") or "Candidate"
    role = job.get("title") or "Role"
    return InterviewPlan(
        candidate=name,
        role=role,
        questions=[
            InterviewQuestion(difficulty="Easy", question="How do you structure a production Node.js service for reliability?", signal="Node.js fundamentals"),
            InterviewQuestion(difficulty="Medium", question="Design an idempotent Kafka consumer with safe retries.", signal="Kafka"),
            InterviewQuestion(difficulty="Hard", question="Design a Redis-backed rate limiter. What fails first?", signal="System design"),
            InterviewQuestion(difficulty="Behavioral", question="Tell me about a production incident you owned end-to-end.", signal="Ownership"),
            InterviewQuestion(difficulty="System Design", question="Design a queue-backed interview scheduling service.", signal="Architecture"),
        ],
    )


def schedule(command: str, candidates: list[dict] | None = None) -> ScheduleEntities:
    normalized = command.lower()
    candidates = candidates or []
    matched = next((c for c in candidates if c.get("name", "").split(" ")[0].lower() in normalized), None)
    explicit = re.search(r"(tomorrow|monday|tuesday|wednesday|thursday|friday)\s*(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)", normalized, re.I)
    slots = ["Tuesday 11:00 AM", "Wednesday 2:30 PM", "Thursday 10:00 AM"]
    if explicit:
        recommended = f"{explicit.group(1).capitalize()} {explicit.group(2)}:{explicit.group(3) or '00'} {explicit.group(4).upper()}"
        found = [recommended, *slots]
    else:
        recommended = slots[1]
        found = slots
    return ScheduleEntities(
        candidate=(matched or {}).get("name") or "John Doe",
        interviewer="Rahul Sharma",
        round="HR Round" if "hr" in normalized else "Technical Round 1",
        durationMinutes=int(re.search(r"(\d+)\s*min", normalized).group(1)) if re.search(r"(\d+)\s*min", normalized) else 45,
        foundSlots=found,
        candidatePreference="Requested time" if explicit else "Candidate prefers afternoons",
        recommendedSlot=recommended,
        scheduledAt=datetime.now(timezone.utc).isoformat(),
        time=recommended,
    )


def feedback_analysis(text: str) -> FeedbackAnalysis:
    strong = bool(re.search(r"strong|excellent|great|recommend|impressed", text, re.I))
    return FeedbackAnalysis(
        strengths=["Technical fundamentals", "Communication"] if strong else ["Partial evidence"],
        weaknesses=[] if strong else ["Needs deeper validation"],
        cultureFit="Appears collaborative",
        technicalScore=8.5 if strong else 6.5,
        communicationScore=8.0 if strong else 7.0,
        summary=text[:240],
    )


def decision(text: str) -> HiringDecision:
    bad = bool(re.search(r"no hire|reject|weak|concern|poor", text, re.I))
    good = bool(re.search(r"strong|excellent|great|recommend|impressed", text, re.I))
    if bad:
        return HiringDecision(recommendation="Hold for recruiter review", reason="Concerns in feedback", confidence=68, decision="Hold")
    if good:
        return HiringDecision(recommendation="Proceed with offer", reason="Strong technical and communication signals", confidence=91, decision="Hire")
    return HiringDecision(recommendation="Proceed to next interview round", reason="Need one more focused signal", confidence=76, decision="Hold")


def brief(candidate: dict, plan: InterviewPlan) -> InterviewerBrief:
    return InterviewerBrief(
        candidate=candidate.get("name") or "Candidate",
        strengths=candidate.get("strengths") or (candidate.get("parsedResume") or {}).get("skills", [])[:4],
        potentialConcerns=candidate.get("gaps") or ["Validate production ownership"],
        recommendedFocusAreas=[q.signal for q in plan.questions[:3]],
    )


def offer(candidate: dict, scheduling: ScheduleEntities, job: dict) -> OfferDraft:
    name = candidate.get("name") or scheduling.candidate
    title = job.get("title") or "the role"
    return OfferDraft(
        subject=f"Technical interview invitation for {title}",
        body=f"Hi {name}, {scheduling.interviewer} would like to meet you for {scheduling.round} on {scheduling.recommendedSlot}. Please confirm.",
    )
