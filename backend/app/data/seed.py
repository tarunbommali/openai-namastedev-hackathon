"""Deterministic demo seed — same IDs/shapes the React client already expects."""

from __future__ import annotations

from copy import deepcopy

JOB = {
    "id": "job-backend-node-distributed",
    "title": "Senior Backend Engineer",
    "location": "Bengaluru / Remote",
    "team": "Platform Engineering",
    "summary": (
        "Build reliable Node.js services, queue-backed workflows, and distributed "
        "systems for high-volume recruiting automation."
    ),
    "requirements": [
        "Node.js and Express APIs",
        "Distributed systems fundamentals",
        "Docker and cloud deployment",
        "Kafka or event-driven architecture",
        "AWS production services",
    ],
}

CANDIDATES = [
    {
        "id": "cand-john",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "status": "Parsed and ranked",
        "resumeText": (
            "John Doe is a senior backend engineer with 6 years of experience building "
            "Node.js APIs, Express services, Dockerized deployments, Kafka pipelines, "
            "Redis caching, AWS infrastructure, and PostgreSQL data models for distributed systems."
        ),
        "parsedResume": {
            "name": "John Doe",
            "skills": ["Node.js", "Express", "Docker", "Kafka", "Redis", "AWS", "PostgreSQL"],
            "experienceYears": 6,
            "seniority": "Senior",
            "domain": "Backend Engineering",
            "education": "B.Tech Computer Science",
            "achievements": [
                "Reduced API latency by 38%",
                "Scaled event pipeline to 2M messages/day",
            ],
            "roleSignals": [
                "distributed systems",
                "backend engineering",
                "production Docker deployments",
                "event-driven architecture",
            ],
            "relevantProjects": [
                "Kafka order pipeline",
                "Redis-backed API gateway",
                "AWS service migration",
            ],
            "technologies": ["Node.js", "Kafka", "Redis", "Docker", "AWS"],
            "leadership": ["Mentored 3 junior engineers"],
        },
        "matchScore": 92,
        "confidence": 95,
        "explanation": (
            "Strong backend engineering experience, distributed systems background, "
            "production Docker deployments, and direct Kafka experience. "
            "Limited Kubernetes exposure is the main gap."
        ),
        "strengths": [
            "Distributed systems experience",
            "Docker expertise",
            "Node.js backend development",
            "Kafka event pipelines",
        ],
        "gaps": ["Kubernetes"],
    },
    {
        "id": "cand-aisha",
        "name": "Aisha Mehta",
        "email": "aisha.mehta@example.com",
        "status": "Ranked",
        "resumeText": (
            "Aisha Mehta is a backend engineer with 5 years building Python FastAPI services, "
            "PostgreSQL models, Docker deployments, and AWS cloud platforms."
        ),
        "parsedResume": {
            "name": "Aisha Mehta",
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
            "experienceYears": 5,
            "seniority": "Mid-Senior",
            "domain": "Backend Engineering",
            "education": "M.S. Computer Science",
            "achievements": ["Migrated analytics APIs with zero downtime"],
            "roleSignals": ["backend engineering", "cloud services", "data APIs"],
            "relevantProjects": ["analytics API migration", "cloud deployment platform"],
            "technologies": ["Python", "FastAPI", "Docker", "AWS"],
            "leadership": [],
        },
        "matchScore": 84,
        "confidence": 87,
        "explanation": (
            "Excellent backend and deployment background with strong API fundamentals. "
            "Slightly less direct Node.js and Kafka experience than John."
        ),
        "strengths": ["Backend API design", "Docker deployment", "AWS services"],
        "gaps": ["Node.js production depth", "Kafka"],
    },
    {
        "id": "cand-priya",
        "name": "Priya Nair",
        "email": "priya.nair@example.com",
        "status": "Ranked",
        "resumeText": (
            "Priya Nair is a full-stack engineer with 3 years of React, Node.js, GraphQL, "
            "and MongoDB experience building candidate-facing product features."
        ),
        "parsedResume": {
            "name": "Priya Nair",
            "skills": ["React", "Node.js", "GraphQL", "MongoDB"],
            "experienceYears": 3,
            "seniority": "Mid",
            "domain": "Full-Stack Engineering",
            "education": "B.E. Information Technology",
            "achievements": ["Shipped candidate portal used by 4 recruiting teams"],
            "roleSignals": ["full-stack development", "frontend-heavy product work"],
            "relevantProjects": ["candidate portal", "GraphQL profile service"],
            "technologies": ["React", "Node.js", "GraphQL", "MongoDB"],
            "leadership": [],
        },
        "matchScore": 78,
        "confidence": 81,
        "explanation": (
            "Good Node.js overlap, but experience is more full-stack than senior "
            "distributed backend systems."
        ),
        "strengths": ["Node.js familiarity", "product engineering", "API integration"],
        "gaps": ["distributed systems", "Docker", "Kafka", "AWS depth"],
    },
]

INTERVIEWERS = [
    {
        "id": "int-rahul",
        "name": "Rahul Sharma",
        "role": "Senior Staff Engineer",
        "focus": "Technical Round 1 and distributed systems",
    }
]

INTERVIEWS = [
    {
        "id": "iv-001",
        "candidateId": "cand-john",
        "candidate": "John Doe",
        "interviewer": "Rahul Sharma",
        "round": "Technical Round 1",
        "time": "Tomorrow, 2:00 PM",
        "status": "Created",
    }
]


def seed_job() -> dict:
    return deepcopy(JOB)


def seed_candidates() -> list[dict]:
    return deepcopy(CANDIDATES)


def seed_interviewers() -> list[dict]:
    return deepcopy(INTERVIEWERS)


def seed_interviews() -> list[dict]:
    return deepcopy(INTERVIEWS)
