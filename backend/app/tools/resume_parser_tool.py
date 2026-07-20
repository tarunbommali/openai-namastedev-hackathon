"""Heuristic resume pre-parser tool used by the Resume Agent."""

from __future__ import annotations

import json
import re
from typing import Type

from app.crew_compat import BaseTool
from pydantic import BaseModel, Field


KNOWN_SKILLS = [
    "Node.js",
    "Express",
    "Docker",
    "Kafka",
    "Redis",
    "AWS",
    "PostgreSQL",
    "Python",
    "FastAPI",
    "MongoDB",
    "React",
    "GraphQL",
    "Kubernetes",
    "TypeScript",
]


class ResumeParserInput(BaseModel):
    resume_text: str = Field(..., description="Raw resume text to pre-parse")


class ResumeParserTool(BaseTool):
    name: str = "resume_parser_tool"
    description: str = (
        "Extract a first-pass structured resume JSON (skills, years, education hints) "
        "from free-form resume text. Use before final structured extraction."
    )
    args_schema: Type[BaseModel] = ResumeParserInput

    def _run(self, resume_text: str) -> str:
        text = resume_text or ""
        skills = [s for s in KNOWN_SKILLS if s.lower() in text.lower()]
        years_match = re.search(r"(\d+)\s*\+?\s*years?", text, re.I)
        years = float(years_match.group(1)) if years_match else 0
        name_match = re.match(r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", text.strip())
        name = name_match.group(1) if name_match else "Unknown Candidate"
        edu_match = re.search(r"(B\.?Tech|M\.?S\.?|B\.?E\.?|MBA)[^\n.]{0,60}", text, re.I)
        education = edu_match.group(0).strip() if edu_match else ""

        payload = {
            "name": name,
            "skills": skills,
            "experienceYears": years,
            "education": education,
            "technologies": skills,
            "rawLength": len(text),
        }
        return json.dumps(payload)
