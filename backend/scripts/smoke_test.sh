#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:4000}"

echo "== health =="
curl -s "$BASE/api/health" | python -m json.tool

echo "== resume =="
curl -s -X POST "$BASE/api/resumes" \
  -H 'Content-Type: application/json' \
  -d '{"resumeText":"John Doe senior backend Node.js Kafka Redis AWS 6 years"}' \
  | python -m json.tool | head -n 40

echo "== command =="
curl -s -X POST "$BASE/api/command" \
  -H 'Content-Type: application/json' \
  -d '{"intent":"Hire a senior backend engineer with Node.js, Kafka, Redis"}' \
  | python -m json.tool | head -n 60

echo "== schedule =="
curl -s -X POST "$BASE/api/interviews/schedule" \
  -H 'Content-Type: application/json' \
  -d '{"command":"Schedule John tomorrow at 2 PM"}' \
  | python -m json.tool | head -n 40

echo "== feedback =="
curl -s -X POST "$BASE/api/feedback" \
  -H 'Content-Type: application/json' \
  -d '{"feedbackText":"Strong backend fundamentals. Recommend hire."}' \
  | python -m json.tool | head -n 40

echo "OK"
