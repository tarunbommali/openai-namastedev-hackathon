from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    res = client.get("/v1/health")
    assert res.status_code == 200
    assert res.json()["ok"] is True


def test_parse_resume_contract():
    res = client.post(
        "/v1/parse-resume",
        json={
            "resumeText": "John Doe senior backend Node.js Kafka Redis Docker AWS 6 years",
            "candidates": [
                {
                    "id": "cand-john",
                    "name": "John Doe",
                    "matchScore": 90,
                    "confidence": 90,
                    "strengths": ["Node.js"],
                    "gaps": [],
                    "explanation": "fit",
                    "parsedResume": {"skills": ["Node.js"]},
                }
            ],
            "job": {
                "id": "job-1",
                "title": "Senior Backend Engineer",
                "summary": "Node Kafka",
                "requirements": ["Node.js", "Kafka"],
            },
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert "parsedResume" in body
    assert "rankings" in body
    assert "agentExecutionLog" in body


def test_command_contract():
    res = client.post(
        "/v1/command",
        json={
            "intent": "Hire a senior backend engineer with Node.js, Kafka, Redis",
            "candidates": [
                {
                    "id": "cand-john",
                    "name": "John Doe",
                    "resumeText": "Node.js Kafka Redis Docker",
                    "matchScore": 92,
                    "confidence": 95,
                    "strengths": ["Node.js", "Kafka"],
                    "gaps": [],
                    "explanation": "strong",
                    "parsedResume": {"skills": ["Node.js", "Kafka", "Redis", "Docker"]},
                }
            ],
            "job": {
                "id": "job-1",
                "title": "Senior Backend Engineer",
                "summary": "distributed backend",
                "requirements": ["Node.js", "Kafka", "Redis", "Docker"],
            },
        },
    )
    assert res.status_code == 200
    body = res.json()
    for key in [
        "completedActions",
        "semanticMatches",
        "rankings",
        "interviewPlan",
        "scheduling",
        "interviewerBrief",
        "outreachDraft",
        "decision",
        "agentExecutionLog",
    ]:
        assert key in body
