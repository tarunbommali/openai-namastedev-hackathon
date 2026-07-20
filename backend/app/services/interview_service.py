"""Interview scheduling helpers + deterministic fallbacks."""

from __future__ import annotations

import re
import time
from typing import Optional

from app.data.seed import seed_candidates


def fallback_schedule(command: str) -> dict:
    normalized = str(command or "").lower()
    candidates = seed_candidates()
    matched = next(
        (
            c
            for c in candidates
            if c["name"].lower() in normalized or c["name"].split()[0].lower() in normalized
        ),
        None,
    )
    duration_match = re.search(r"(\d+)\s*(?:minute|min)", normalized)
    duration = int(duration_match.group(1)) if duration_match else 45
    if "hr" in normalized:
        round_name = "HR Round"
    elif "manager" in normalized:
        round_name = "Hiring Manager Round"
    else:
        round_name = "Technical Round 1"

    slots = ["Tuesday 11:00 AM", "Wednesday 2:30 PM", "Thursday 10:00 AM"]
    explicit = re.search(
        r"(tomorrow|monday|tuesday|wednesday|thursday|friday)\s*(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)",
        normalized,
        re.I,
    )
    if explicit:
        day = explicit.group(1).capitalize()
        hour = explicit.group(2)
        minute = explicit.group(3) or "00"
        meridiem = explicit.group(4).upper()
        recommended = f"{day} {hour}:{minute} {meridiem}"
        found = [recommended, *slots]
        preference = "Requested time detected in recruiter command"
    else:
        recommended = slots[1]
        found = slots
        preference = "Candidate prefers afternoons"

    return {
        "candidate": matched["name"] if matched else "John Doe",
        "interviewer": "Rahul Sharma",
        "round": round_name,
        "durationMinutes": duration,
        "foundSlots": found,
        "candidatePreference": preference,
        "recommendedSlot": recommended,
        "scheduledAt": "2026-07-22T14:30:00+05:30",
        "time": recommended,
    }


def fallback_questions(candidate_name: str, role: str) -> dict:
    return {
        "candidate": candidate_name,
        "role": role,
        "questions": [
            {
                "difficulty": "Easy",
                "question": "How do you structure a production Node.js service for reliability and observability?",
                "signal": "Node.js backend fundamentals",
            },
            {
                "difficulty": "Medium",
                "question": "How would you design an idempotent Kafka consumer that safely handles retries?",
                "signal": "Kafka and distributed systems",
            },
            {
                "difficulty": "Hard",
                "question": (
                    "Design a Redis-backed rate limiter for a high-traffic API. "
                    "What failure modes would you plan for?"
                ),
                "signal": "Redis, scaling, and system design",
            },
            {
                "difficulty": "Behavioral",
                "question": "Tell me about a production incident you owned end-to-end. What did you change afterward?",
                "signal": "Ownership and incident response",
            },
            {
                "difficulty": "System Design",
                "question": "Design a queue-backed interview scheduling service that handles retries and idempotency.",
                "signal": "System design depth",
            },
            {
                "difficulty": "Coding",
                "question": "Implement a sliding-window rate limiter. Walk through complexity and edge cases.",
                "signal": "Coding + concurrency reasoning",
            },
        ],
    }


def fallback_decision(feedback_text: str) -> dict:
    normalized = str(feedback_text or "").lower()
    has_concern = bool(re.search(r"no hire|reject|weak|concern|insufficient|poor", normalized))
    is_strong = bool(re.search(r"strong|excellent|great|recommend|impressed", normalized))
    if has_concern:
        return {
            "recommendation": "Hold for recruiter review",
            "reason": "The feedback contains concerns that should be reviewed before advancing the candidate.",
            "confidence": 68,
            "decision": "Hold",
            "reasoning": "Negative hiring signals detected in interviewer notes.",
        }
    if is_strong:
        return {
            "recommendation": "Proceed with offer",
            "reason": "The feedback indicates strong technical capability and communication.",
            "confidence": 91,
            "decision": "Hire",
            "reasoning": "Strong positive signals across technical and communication dimensions.",
        }
    return {
        "recommendation": "Proceed to next interview round",
        "reason": "The feedback supports collecting one more focused signal before making a final decision.",
        "confidence": 76,
        "decision": "Hold",
        "reasoning": "Mixed or incomplete signal set; gather one more interview round.",
    }


def fallback_feedback_analysis(feedback_text: str) -> dict:
    decision = fallback_decision(feedback_text)
    return {
        "strengths": ["Technical fundamentals", "Communication clarity"]
        if decision["decision"] != "Reject"
        else [],
        "weaknesses": ["Needs deeper distributed systems validation"]
        if decision["decision"] == "Hold"
        else [],
        "cultureFit": "Appears collaborative based on available notes",
        "technicalScore": 8.0 if decision["decision"] == "Hire" else 6.5,
        "communicationScore": 8.0 if decision["decision"] == "Hire" else 7.0,
        "summary": decision["reason"],
    }


def make_interview_id() -> str:
    return f"iv-{int(time.time() * 1000)}"


def make_feedback_id() -> str:
    return f"fb-{int(time.time() * 1000)}"


def find_candidate_by_name(name: str, rankings: list[dict]) -> Optional[dict]:
    needle = (name or "").lower()
    for candidate in rankings:
        if candidate["name"].lower() == needle:
            return candidate
        if candidate["name"].split()[0].lower() in needle:
            return candidate
    return None
