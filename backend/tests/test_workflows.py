from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def test_resume_parse_demo_mode():
    response = client.post(
        "/api/resumes",
        json={
            "resumeText": (
                "John Doe is a senior backend engineer with 6 years of experience "
                "building Node.js APIs, Kafka pipelines, Redis caching, and AWS services."
            )
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "parsedResume" in body
    assert "rankings" in body
    assert "agentExecutionLog" in body
    assert body["parsedResume"]["name"]


def test_command_pipeline():
    response = client.post(
        "/api/command",
        json={
            "intent": "Hire a senior backend engineer with Node.js, Kafka, Redis, and distributed systems experience."
        },
    )
    assert response.status_code == 200
    body = response.json()
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


def test_schedule_and_feedback():
    preview = client.post(
        "/api/interviews/preview",
        json={"command": "Schedule John tomorrow at 2 PM"},
    )
    assert preview.status_code == 200
    assert preview.json()["extractedEntities"]["candidate"]

    schedule = client.post(
        "/api/interviews/schedule",
        json={"command": "Schedule John tomorrow at 2 PM"},
    )
    assert schedule.status_code == 200
    assert schedule.json()["interview"]["status"] == "Created"

    feedback = client.post(
        "/api/feedback",
        json={"feedbackText": "Strong systems thinking and excellent communication. Recommend hire."},
    )
    assert feedback.status_code == 200
    rec = feedback.json()["recommendation"]
    assert "recommendation" in rec
    assert "confidence" in rec


def test_agent_logs_endpoint():
    client.post("/api/questions", json={})
    logs = client.get("/api/agents/logs")
    assert logs.status_code == 200
    assert isinstance(logs.json(), list)


def test_new_clean_routes():
    assert client.get("/health").status_code == 200
    assert client.post("/match", json={"intent": "Node.js Kafka"}).status_code == 200
    assert client.post("/questions", json={}).status_code == 200
    assert client.post("/decision", json={"feedbackText": "Strong hire signal"}).status_code == 200
