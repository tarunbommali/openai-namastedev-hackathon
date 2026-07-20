# All-in-One Multi-Service Production Dockerfile for HireFlow AI
# Builds and runs: Frontend (Nginx), Express BFF (Node.js), and Python AI Service (FastAPI)

# ====================================================
# Stage 1: Build Frontend (React + Vite)
# ====================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ====================================================
# Stage 2: Build Express Backend (TypeScript)
# ====================================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend/express

COPY backend/express/package*.json ./
RUN npm install

COPY backend/express/ ./
RUN npm run build

# ====================================================
# Stage 3: Final All-in-One Production Image
# ====================================================
FROM python:3.12-slim

WORKDIR /app

# Install Node.js 20, Nginx, and build essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    nginx \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python AI Service dependencies
COPY backend/python-ai/requirements.txt ./backend/python-ai/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/python-ai/requirements.txt

# Copy Python AI Service source
COPY backend/python-ai/ ./backend/python-ai/
RUN mkdir -p /app/backend/python-ai/.crewai_storage /app/backend/python-ai/data /app/backend/python-ai/logs

# Setup Express Backend
WORKDIR /app/backend/express
COPY backend/express/package*.json ./
RUN npm install --omit=dev
COPY --from=backend-builder /app/backend/express/dist ./dist

# Setup Frontend static distribution files in Nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Configure Nginx Reverse Proxy for single-port deployment
RUN echo 'server {' \
    '    listen 80;' \
    '    server_name _;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '    location /api/ {' \
    '        proxy_pass http://127.0.0.1:4000/api/;' \
    '        proxy_http_version 1.1;' \
    '        proxy_set_header Upgrade $http_upgrade;' \
    '        proxy_set_header Connection "upgrade";' \
    '        proxy_set_header Host $host;' \
    '        proxy_cache_bypass $http_upgrade;' \
    '        proxy_set_header X-Real-IP $remote_addr;' \
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
    '        proxy_set_header X-Forwarded-Proto $scheme;' \
    '    }' \
    '}' > /etc/nginx/sites-available/default

# Create startup orchestrator script
WORKDIR /app
RUN echo '#!/bin/sh\n\
set -e\n\
echo "=== Starting Python AI Service on port 8001 ==="\n\
cd /app/backend/python-ai\n\
export PORT=8001\n\
export ALLOW_MOCK_FALLBACK=true\n\
python3 -m uvicorn main:app --host 127.0.0.1 --port 8001 &\n\
\n\
echo "=== Starting Express BFF on port 4000 ==="\n\
cd /app/backend/express\n\
export NODE_ENV=production\n\
export PORT=4000\n\
export AI_SERVICE_URL=http://127.0.0.1:8001\n\
export MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/hireflow}\n\
export USE_MEMORY_MONGO=true\n\
export JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET:-all-in-one-container-jwt-access-secret-32ch}\n\
export JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-all-in-one-container-jwt-refresh-secret-32ch}\n\
export SEED_ON_BOOT=true\n\
node dist/server.js &\n\
\n\
echo "=== Starting Nginx on port 80 ==="\n\
nginx -g "daemon off;"' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 80 4000 8001

CMD ["/app/start.sh"]
