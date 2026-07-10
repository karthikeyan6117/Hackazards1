# AI Module

Phase 1 of the Hackazards AI backend for incident analysis and reporting.

## Purpose

This module provides AI-powered incident analysis capabilities using Groq SDK. It analyzes incident data, identifies root causes, and generates actionable recommendations.

## File Responsibilities

| File | Purpose |
|------|---------|
| `__init__.py` | Module exports and initialization |
| `schemas.py` | Pydantic models for request/response validation |
| `groq_client.py` | Groq SDK client configuration and singleton management |
| `prompts.py` | Prompt templates for AI analysis |
| `agent.py` | Incident analysis logic (mock implementation) |
| `report_generator.py` | Report formatting utilities |
| `routes.py` | FastAPI router with API endpoints |

## API Endpoints

### Health Check

```
GET /api/ai/health
```

**Response:**
```json
{
  "status": "AI Service Running"
}
```

### Analyze Incident

```
POST /api/ai/analyze
```

**Request:**
```json
{
  "incident_id": "INC-001",
  "endpoint": "/api/users",
  "status_code": 500,
  "latency": 2500.0,
  "error_message": "Database connection timeout"
}
```

**Response:**
```json
{
  "summary": "Database service unavailable.",
  "root_cause": "Possible backend database outage.",
  "confidence": 91,
  "evidence": [
    "HTTP 500 returned",
    "Latency exceeded threshold"
  ],
  "recommendations": [
    "Check database health",
    "Restart database service"
  ]
}
```

### Generate Report

```
POST /api/ai/report
```

**Request:** Same as `/analyze`

**Response:**
```json
{
  "report_type": "incident_analysis",
  "format": "json",
  "data": {
    "summary": "Database service unavailable.",
    "root_cause": "Possible backend database outage.",
    "confidence": 91,
    "evidence": ["HTTP 500 returned", "Latency exceeded threshold"],
    "recommendations": ["Check database health", "Restart database service"]
  },
  "metadata": {
    "generated_by": "Hackazards AI",
    "version": "1.0.0",
    "phase": 1
  }
}
```

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your GROQ_API_KEY
   ```

3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Phase 1 Notes

- This is a mock implementation returning static analysis
- Real Groq API integration will be added in Phase 2
- No PydanticAI workflows in this phase
