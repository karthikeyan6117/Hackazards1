import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ai import ai_router
from app.api.dashboard import router as dashboard_router
from app.api.endpoints import router as endpoints_router
from app.api.incidents import router as incidents_router
from app.api.integrations import router as integrations_router
from app.api.notifications import router as notifications_router
from app.api.status import router as status_router
from app.api.users import router as users_router
from app.core.config import settings
from app.core.scheduler import start_scheduler, stop_scheduler
from app.db.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Hackazards API...")
    init_db()
    start_scheduler()
    yield
    stop_scheduler()
    logger.info("Hackazards API shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints_router)
app.include_router(dashboard_router)
app.include_router(incidents_router)
app.include_router(status_router)
app.include_router(ai_router)
app.include_router(notifications_router)
app.include_router(integrations_router)
app.include_router(users_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}
