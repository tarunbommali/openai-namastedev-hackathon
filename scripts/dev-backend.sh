#!/usr/bin/env bash
# Start Express BFF (auto in-memory Mongo if local Mongo is down)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="/opt/homebrew/bin:$PATH"
cd "$ROOT/backend/express"
npm run dev
