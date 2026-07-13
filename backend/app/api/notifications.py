import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
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


class CreateChannelRequest(BaseModel):
    type: str = Field(..., description="Channel type: email, slack, or discord")
    target: str = Field(
        ...,
        min_length=1,
        description="Channel target (email address, channel name, etc.)",
    )
    enabled: bool = Field(default=True)
    conditions: Optional[Dict[str, Any]] = Field(default=None)


class UpdateChannelRequest(BaseModel):
    type: Optional[str] = Field(default=None)
    target: Optional[str] = Field(default=None)
    enabled: Optional[bool] = Field(default=None)
    conditions: Optional[Dict[str, Any]] = Field(default=None)


settings_store: NotificationSettings = NotificationSettings(
    channels=[
        {
            "id": "ch-1",
            "name": "email",
            "type": "email",
            "enabled": True,
            "target": "ops@example.com",
            "conditions": {
                "severity": "critical",
                "incidentType": ["outage", "performance"],
            },
        },
        {
            "id": "ch-2",
            "name": "slack",
            "type": "slack",
            "enabled": True,
            "target": "#incidents",
            "conditions": {
                "severity": "all",
                "incidentType": ["all"],
            },
        },
        {
            "id": "ch-3",
            "name": "discord",
            "type": "discord",
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


@router.get("", response_model=List[Dict[str, Any]])
def list_channels() -> List[Dict[str, Any]]:
    return settings_store.channels


@router.post("", response_model=Dict[str, Any], status_code=201)
def create_channel(payload: CreateChannelRequest) -> Dict[str, Any]:
    if payload.type not in ("email", "slack", "discord"):
        raise HTTPException(
            status_code=400, detail="Type must be email, slack, or discord"
        )

    new_channel = {
        "id": f"ch-{uuid.uuid4().hex[:8]}",
        "name": payload.type,
        "type": payload.type,
        "enabled": payload.enabled,
        "target": payload.target,
        "conditions": payload.conditions
        or {
            "severity": "all",
            "incidentType": ["all"],
        },
    }
    settings_store.channels.append(new_channel)
    return new_channel


@router.put("/{channel_id}", response_model=Dict[str, Any])
def update_channel(channel_id: str, payload: UpdateChannelRequest) -> Dict[str, Any]:
    for ch in settings_store.channels:
        if ch.get("id") == channel_id:
            if payload.type is not None:
                if payload.type not in ("email", "slack", "discord"):
                    raise HTTPException(
                        status_code=400, detail="Type must be email, slack, or discord"
                    )
                ch["type"] = payload.type
                ch["name"] = payload.type
            if payload.target is not None:
                ch["target"] = payload.target
            if payload.enabled is not None:
                ch["enabled"] = payload.enabled
            if payload.conditions is not None:
                ch["conditions"] = payload.conditions
            return ch

    raise HTTPException(status_code=404, detail="Channel not found")


@router.delete("/{channel_id}", status_code=204)
def delete_channel(channel_id: str) -> None:
    for i, ch in enumerate(settings_store.channels):
        if ch.get("id") == channel_id:
            settings_store.channels.pop(i)
            return

    raise HTTPException(status_code=404, detail="Channel not found")


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
    active_channels = [ch for ch in settings_store.channels if ch.get("enabled", True)]
    channel_names = [
        ch.get("name", ch.get("type", "email")) for ch in active_channels
    ] or ["email", "slack", "discord"]

    for channel in channel_names:
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
