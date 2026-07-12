from typing import Any, Dict

from fastapi import APIRouter

router = APIRouter(prefix="/api/integrations", tags=["integrations"])


@router.get("/github/recent-activity")
def get_github_recent_activity() -> Dict[str, Any]:
    return {
        "items": [
            {
                "type": "pull_request",
                "title": "Add incident notification template",
                "author": "person3",
                "merged_at": "2026-07-10T10:00:00Z",
            },
            {
                "type": "commit",
                "title": "Wire AI incident context into alert payloads",
                "author": "person3",
                "committed_at": "2026-07-10T09:30:00Z",
            },
        ]
    }


@router.get("/vercel/status")
def get_vercel_status() -> Dict[str, Any]:
    return {"status": "healthy", "deployments": 2}


@router.get("/railway/status")
def get_railway_status() -> Dict[str, Any]:
    return {"status": "healthy", "services": 3}


@router.get("/slack/status")
def get_slack_status() -> Dict[str, Any]:
    return {"status": "healthy", "channel": "#incidents"}


@router.get("/discord/status")
def get_discord_status() -> Dict[str, Any]:
    return {"status": "healthy", "channel": "incident-bot"}


@router.get("/email/status")
def get_email_status() -> Dict[str, Any]:
    return {"status": "healthy", "recipient": "ops@example.com"}
