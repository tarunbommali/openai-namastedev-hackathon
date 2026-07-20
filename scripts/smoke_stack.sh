#!/usr/bin/env bash
set -euo pipefail
API="${1:-http://localhost:4000}"
AI="${2:-http://localhost:8001}"

echo "== AI health =="
curl -sf "$AI/v1/health" | python3 -m json.tool

echo "== Express health =="
curl -sf "$API/api/health" | python3 -m json.tool

echo "== jobs =="
curl -sf "$API/api/jobs" | python3 -c "import sys,json; d=json.load(sys.stdin); assert isinstance(d, list); print('jobs ok', len(d), 'jobs')"

echo "== resumes =="
curl -sf -X POST "$API/api/resumes" -H 'Content-Type: application/json' \
  -d '{"resumeText":"John Doe senior backend Node.js Kafka Redis Docker AWS 6 years"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['parsedResume'] and d['rankings']; print('resumes ok')"

echo "== auth login =="
curl -sf -X POST "$API/api/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"recruiter@hireflow.ai","password":"Recruiter123!"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['accessToken']; print('login ok', d['user']['role'])"

echo "SMOKE OK"
