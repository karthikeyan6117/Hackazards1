from typing import Any, Dict, List

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class AISummary(BaseModel):
    root_cause: str = Field(default="")
    confidence: float = Field(default=0.0)
    evidence: List[str] = Field(default_factory=list)
    recommended_fixes: List[str] = Field(default_factory=list)


class PostmortemSummary(BaseModel):
    summary: str = Field(default="")
    owner: str = Field(default="")


class NotificationPayload(BaseModel):
    incident_id: str
    title: str
    severity: str
    summary: str
    ai_analysis: AISummary | None = None
    postmortem: PostmortemSummary | None = None


class DeliveryResult(BaseModel):
    channel: str
    status: str
    message: str


class NotificationSettings(BaseModel):
    channels: List[Dict[str, Any]]
    alert_delay_seconds: int = Field(default=30)
    mute_hours: List[str] = Field(default_factory=list)


settings_store: NotificationSettings = NotificationSettings(
    channels=[
        {
            "name": "email",
            "enabled": True,
            "target": "ops@example.com",
            "conditions": {
                "severity": "critical",
                "incidentType": ["outage", "performance"],
            },
        },
        {
            "name": "slack",
            "enabled": True,
            "target": "#incidents",
            "conditions": {
                "severity": "all",
                "incidentType": ["all"],
            },
        },
        {
            "name": "discord",
            "enabled": True,
            "target": "incident-bot",
            "conditions": {
                "severity": "warning",
                "incidentType": ["degradation"],
            },
        },
    ],
    alert_delay_seconds=30,
    mute_hours=["22:00-06:00"],
)


@router.get("/settings", response_model=NotificationSettings)
def get_notification_settings() -> NotificationSettings:
    return settings_store


@router.put("/settings", response_model=NotificationSettings)
def update_notification_settings(payload: NotificationSettings) -> NotificationSettings:
    global settings_store
    settings_store = payload
    return settings_store


@router.post("/send")
def send_notification(payload: NotificationPayload) -> Dict[str, Any]:
    deliveries: List[DeliveryResult] = []
    channels = ["email", "slack", "discord"]

    for channel in channels:
        deliveries.append(
            DeliveryResult(
                channel=channel,
                status="queued",
                message=f"{payload.title} notified via {channel}",
            )
        )

    ai_context = payload.ai_analysis.model_dump() if payload.ai_analysis else {}
    postmortem_context = payload.postmortem.model_dump() if payload.postmortem else {}

    return {
        "status": "queued",
        "incident_id": payload.incident_id,
        "deliveries": [item.model_dump() for item in deliveries],
        "ai_context": ai_context,
        "postmortem_context": postmortem_context,
    }
