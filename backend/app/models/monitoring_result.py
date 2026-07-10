from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class MonitoringResult(Base):
    __tablename__ = "monitoring_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    endpoint_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("endpoints.id", ondelete="CASCADE"), nullable=False
    )
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    latency: Mapped[float] = mapped_column(Float, default=0.0)
    success: Mapped[bool] = mapped_column(Boolean, default=False)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), server_default=func.now()
    )

    endpoint = relationship("Endpoint", back_populates="monitoring_results")
