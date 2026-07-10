# Hackazards

A full-stack monitoring platform with AI-powered incident analysis.

## Project Structure

```
Hackazards/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── ai/             # AI incident analysis module
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration and utilities
│   │   ├── db/             # Database setup
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI application
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── monitoring-platform/     # Next.js frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── public/             # Static assets
│   ├── types/              # TypeScript types
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend

```bash
cd monitoring-platform
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### AI Module

- `GET /api/ai/health` - Health check
- `POST /api/ai/analyze` - Analyze incident
- `POST /api/ai/report` - Generate report

### Core API

- `GET /api/health` - API health check
- Dashboard, endpoints, and incidents routes

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic, Groq SDK
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: SQLite (development)

## License

MIT
