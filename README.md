# GridPulse

GridPulse is an AI-powered critical infrastructure repair dispatch platform with:
- FastAPI backend + MongoDB + Redis
- React + Vite frontend (Control Center + Engineer Portal)
- Real-time Socket.IO updates
- AI modules for classification, matching, and routing
- Built-in simulator for live incident generation

## Project Structure

- `server/`: FastAPI API, AI modules, simulator, dispatch services
- `client/`: React frontend (mission-control UI)
- `tests/`: Async pytest suite for core backend flows
- `docker-compose.yml`: one-command local stack

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB
- Redis
- Docker + Docker Compose (optional, recommended for one-command startup)

## Environment Setup

1. Copy the template:

```bash
cp .env.example .env
```

2. Update required values in `.env` (especially `JWT_SECRET`).

## Run Locally (Without Docker)

### 1. Backend API

```bash
cd gridpulse
pip install -r requirements.txt
uvicorn server.main:asgi_app --host 0.0.0.0 --port 8000 --reload
```

Notes:
- The simulator loop starts automatically with backend startup.
- Socket.IO is served from the same backend endpoint.

### 2. Frontend

```bash
cd gridpulse/client
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

### 3. Seed Database

```bash
cd gridpulse
python -m server.seed.seed_db
```

This seeds:
- 20 engineers
- 50 incidents
- 200 sensor readings
- 30 dispatch records

### 4. Celery Worker (optional for notifications)

```bash
cd gridpulse
celery -A server.celery_app.celery_app worker --loglevel=info
```

## Run With Docker Compose (One Command)

From project root:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend/API: `http://localhost:8000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

To seed after containers are up:

```bash
docker compose exec backend python -m server.seed.seed_db
```

Stop stack:

```bash
docker compose down
```

## Health Endpoint

`GET /health` now verifies:
- MongoDB connectivity
- Redis connectivity
- AI model availability

Healthy response:

```json
{
	"service": "GridPulse API",
	"status": "ok",
	"components": {
		"mongodb": true,
		"redis": true,
		"ai_model": true
	}
}
```

If one or more components fail, response status is `503` with `status: "degraded"`.

## Run Tests

```bash
cd gridpulse
pytest -q
```

Current suite includes:
- `tests/test_incidents.py`
- `tests/test_dispatch.py`
- `tests/test_classifier.py`
- `tests/test_matcher.py`
- `tests/test_mttr.py`

## API Surface

- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
- Incidents: `/api/incidents`
- Engineers: `/api/engineers`
- Dispatch: `/api/dispatch`
- Sensor readings: `/api/sensor-readings`
- AI: `/ai/classify`, `/ai/match`, `/ai/route`, `/ai/health`

## Socket Events

Server emits:
- `incident:new`
- `dispatch:update`
- `engineer:location`

## Seed Accounts

- `manager@gridpulse.ai` / `GridPulse@123`
- `operator@gridpulse.ai` / `GridPulse@123`
- `engineer@gridpulse.ai` / `GridPulse@123`
