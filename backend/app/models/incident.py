from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    endpoint_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("endpoints.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Any] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(50), default="warning")
    status: Mapped[str] = mapped_column(String(50), default="open")
    root_cause: Mapped[Any] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[Any] = mapped_column(Float, nullable=True)
    evidence: Mapped[Any] = mapped_column(Text, nullable=True)
    recommendations: Mapped[Any] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), server_default=func.now()
    )
    resolved_at: Mapped[Any] = mapped_column(DateTime, nullable=True)

    endpoint = relationship("Endpoint", back_populates="incidents")
    timeline_events = relationship(
        "TimelineEvent", back_populates="incident", cascade="all, delete-orphan"
    )


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), server_default=func.now()
    )
    event: Mapped[str] = mapped_column(String(500), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)

    incident = relationship("Incident", back_populates="timeline_events")
