from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["app"] == "HireFlow AI"


def test_demo_shape():
    response = client.get("/api/demo")
    assert response.status_code == 200
    body = response.json()
    assert "job" in body
    assert "candidates" in body
    assert "agentModelPlan" in body
    assert "agentExecutionLog" in body
