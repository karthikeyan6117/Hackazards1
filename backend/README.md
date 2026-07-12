# Hackazards Backend

AI-powered Monitoring and Incident Intelligence Platform — Backend API.

## Tech Stack

- **FastAPI** — Web framework
- **SQLAlchemy 2.0** — ORM
- **Pydantic v2** — Validation
- **SQLite** — Development database
- **APScheduler** — Periodic monitoring
- **httpx** — Async HTTP health checks

## Quick Start

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment file
cp .env.example .env

# 5. Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

Interactive docs: `http://localhost:8000/docs`

## API Endpoints

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/endpoints` | List all endpoints |
| POST | `/api/endpoints` | Create an endpoint |
| PUT | `/api/endpoints/{id}` | Update an endpoint |
| DELETE | `/api/endpoints/{id}` | Delete an endpoint |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Live metrics summary |

### Incidents

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/incidents` | List all incidents |
| GET | `/api/incidents/{id}` | Get incident details |

### Status

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Public status page data |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

## Sample API Requests

```bash
# Add an endpoint
curl -X POST "http://localhost:8000/api/endpoints" \
  -H "Content-Type: application/json" \
  -d '{"name": "Example Site", "url": "https://example.com"}'

# List all endpoints
curl "http://localhost:8000/api/endpoints"

# Get dashboard metrics
curl "http://localhost:8000/api/dashboard"

# List incidents
curl "http://localhost:8000/api/incidents"

# Get status page
curl "http://localhost:8000/api/status"
```

## How It Works

1. **Add endpoints** via `POST /api/endpoints`
2. **Scheduler** runs every 60 seconds and checks each endpoint via HTTP GET
3. **Monitoring results** (status code, latency, success) are stored in SQLite
4. **If a check fails** (status >= 500, timeout, or request error), an **Incident** is auto-created
5. **When the endpoint recovers**, the incident is auto-resolved
6. **Dashboard** returns live aggregated metrics
7. **Uptime** and **average latency** are computed from the last 24 hours of monitoring data

## Status Rules

| Condition | Status |
|-----------|--------|
| HTTP 200-399 | `up` |
| HTTP 400-499 | `degraded` |
| HTTP >= 500 | `down` |
| Timeout | `down` |
| Request failure | `down` |

## Database Schema

```
┌──────────────────┐       ┌────────────────────────┐
│    endpoints      │       │   monitoring_results    │
├──────────────────┤       ├────────────────────────┤
│ id (PK)          │◄──────│ endpoint_id (FK)        │
│ name              │       │ id (PK)                 │
│ url               │       │ status_code             │
│ status            │       │ latency (ms)            │
│ uptime (%)        │       │ success (bool)          │
│ average_latency   │       │ checked_at              │
│ created_at        │       └────────────────────────┘
│ updated_at        │
└────────┬─────────┘
         │
         │
         │
         ▼
┌──────────────────┐
│    incidents      │
├──────────────────┤
│ id (PK)          │
│ endpoint_id (FK) │
│ title             │
│ description       │
│ severity          │
│ status            │
│ started_at        │
│ resolved_at       │
│ root_cause        │
│ confidence_score  │
│ evidence          │
│ recommendations   │
└────────┬─────────┘
         │
         │
         ▼
┌──────────────────┐
│  timeline_events  │
├──────────────────┤
│ id (PK)          │
│ incident_id (FK) │
│ timestamp         │
│ event             │
│ type              │
└──────────────────┘
```

## Configuration

All settings are controlled via environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./hackazards.db` | Database connection string |
| `SCHEDULER_INTERVAL_SECONDS` | `60` | How often to check endpoints |
| `REQUEST_TIMEOUT_SECONDS` | `10` | HTTP request timeout |
| `UPTIME_WINDOW_HOURS` | `24` | Window for uptime calculation |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins |

## Frontend

The Next.js frontend lives in `../Hackazards1/monitoring-platform/`. Run it alongside the backend:

```bash
cd ../Hackazards1/monitoring-platform
npm run dev
```

The frontend expects the backend at `http://localhost:8000`.

## Next Phase

This backend is designed for the AI incident investigation layer:

- `Incident.root_cause` — AI-generated root cause analysis (populated by AI agent)
- `Incident.confidence_score` — AI confidence score
- `Incident.evidence` — Supporting evidence (time-series, logs)
- `Incident.recommendations` — Auto-generated remediation steps
- `TimelineEvent` — Investigation timeline with AI reasoning steps
