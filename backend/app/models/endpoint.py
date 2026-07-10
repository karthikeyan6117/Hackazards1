from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Endpoint(Base):
    __tablename__ = "endpoints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False, unique=True)
    status: Mapped[str] = mapped_column(String(50), default="unknown")
    uptime: Mapped[float] = mapped_column(Float, default=100.0)
    average_latency: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    monitoring_results = relationship(
        "MonitoringResult", back_populates="endpoint", cascade="all, delete-orphan"
    )
    incidents = relationship(
        "Incident", back_populates="endpoint", cascade="all, delete-orphan"
    )
