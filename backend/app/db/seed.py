import json
import logging
import random
from datetime import datetime, timedelta, timezone

from app.db.database import SessionLocal
from app.models.endpoint import Endpoint
from app.models.incident import Incident, TimelineEvent
from app.models.monitoring_result import MonitoringResult

logger = logging.getLogger(__name__)

DEMO_CHECK_INTERVAL = 86400

DEMO_ENDPOINTS = [
    {
        "name": "Google",
        "url": "https://www.google.com",
        "status": "up",
        "average_latency": 42.0,
        "uptime": 99.99,
    },
    {
        "name": "GitHub API",
        "url": "https://api.github.com",
        "status": "up",
        "average_latency": 68.0,
        "uptime": 99.95,
    },
    {
        "name": "OpenAI",
        "url": "https://openai.com",
        "status": "up",
        "average_latency": 112.0,
        "uptime": 99.90,
    },
    {
        "name": "Cloudflare",
        "url": "https://www.cloudflare.com",
        "status": "up",
        "average_latency": 39.0,
        "uptime": 99.98,
    },
    {
        "name": "JSONPlaceholder",
        "url": "https://jsonplaceholder.typicode.com/posts",
        "status": "up",
        "average_latency": 85.0,
        "uptime": 99.92,
    },
    {
        "name": "Payment Service",
        "url": "https://payment.demo.local",
        "status": "degraded",
        "average_latency": 850.0,
        "uptime": 98.40,
    },
    {
        "name": "Analytics Service",
        "url": "https://analytics.demo.local",
        "status": "degraded",
        "average_latency": 1100.0,
        "uptime": 97.80,
    },
    {
        "name": "Auth Service",
        "url": "https://auth.demo.local",
        "status": "down",
        "average_latency": 10000.0,
        "uptime": 94.50,
    },
]


def seed_demo_data() -> None:
    db = SessionLocal()
    try:
        existing = db.query(Endpoint).first()
        if existing:
            logger.info("Database already has data, skipping seed")
            return

        now = datetime.now(timezone.utc)
        created_endpoints = []

        for ep_data in DEMO_ENDPOINTS:
            endpoint = Endpoint(
                name=ep_data["name"],
                url=ep_data["url"],
                status=ep_data["status"],
                average_latency=ep_data["average_latency"],
                uptime=ep_data["uptime"],
                check_interval_seconds=DEMO_CHECK_INTERVAL,
                created_at=now - timedelta(hours=24),
                updated_at=now - timedelta(seconds=30),
            )
            db.add(endpoint)
            db.flush()
            created_endpoints.append((endpoint, ep_data))

            _create_monitoring_results(db, endpoint, ep_data, now)

        _create_incidents(db, created_endpoints, now)

        db.commit()
        logger.info(
            "Seeded %d demo endpoints with monitoring data", len(DEMO_ENDPOINTS)
        )
    except Exception:
        db.rollback()
        logger.exception("Failed to seed demo data")
    finally:
        db.close()


def _create_monitoring_results(db, endpoint, ep_data, now):
    status = ep_data["status"]
    target_latency = ep_data["average_latency"]

    for i in range(24):
        hours_ago = 23 - i
        checked_at = now - timedelta(hours=hours_ago, minutes=random.randint(0, 5))

        if status == "up":
            latency = target_latency + random.uniform(-10, 10)
            result = MonitoringResult(
                endpoint_id=endpoint.id,
                status_code=200,
                latency=max(1.0, round(latency, 2)),
                success=True,
                checked_at=checked_at,
            )
        elif status == "degraded":
            if i % 5 == 0:
                result = MonitoringResult(
                    endpoint_id=endpoint.id,
                    status_code=503,
                    latency=round(target_latency + random.uniform(-50, 50), 2),
                    success=False,
                    checked_at=checked_at,
                )
            else:
                result = MonitoringResult(
                    endpoint_id=endpoint.id,
                    status_code=200,
                    latency=round(target_latency * random.uniform(0.7, 1.3), 2),
                    success=True,
                    checked_at=checked_at,
                )
        else:
            if i % 3 == 0:
                result = MonitoringResult(
                    endpoint_id=endpoint.id,
                    status_code=200,
                    latency=round(target_latency * 0.05, 2),
                    success=True,
                    checked_at=checked_at,
                )
            else:
                result = MonitoringResult(
                    endpoint_id=endpoint.id,
                    status_code=None,
                    latency=10000.0,
                    success=False,
                    checked_at=checked_at,
                )

        db.add(result)

    if status == "up":
        recent = MonitoringResult(
            endpoint_id=endpoint.id,
            status_code=200,
            latency=target_latency,
            success=True,
            checked_at=now - timedelta(seconds=30),
        )
    elif status == "degraded":
        recent = MonitoringResult(
            endpoint_id=endpoint.id,
            status_code=429,
            latency=target_latency,
            success=False,
            checked_at=now - timedelta(seconds=30),
        )
    else:
        recent = MonitoringResult(
            endpoint_id=endpoint.id,
            status_code=None,
            latency=10000.0,
            success=False,
            checked_at=now - timedelta(seconds=30),
        )
    db.add(recent)


def _create_incidents(db, created_endpoints, now):
    for endpoint, ep_data in created_endpoints:
        if ep_data["status"] == "degraded":
            _create_degraded_incident(db, endpoint, ep_data, now)
        elif ep_data["status"] == "down":
            _create_down_incident(db, endpoint, ep_data, now)


def _create_degraded_incident(db, endpoint, ep_data, now):
    incident = Incident(
        endpoint_id=endpoint.id,
        title=f"{endpoint.name} experiencing high latency",
        description=(
            f"Endpoint {endpoint.name} ({endpoint.url}) is responding with "
            f"elevated latency. Current average: {ep_data['average_latency']}ms."
        ),
        severity="warning",
        status="investigating",
        root_cause="Upstream service degradation causing increased response times",
        confidence_score=0.78,
        evidence=json.dumps(
            [
                f"Average latency elevated to {ep_data['average_latency']}ms (baseline: ~50ms)",
                "Intermittent 503 errors observed",
                "No recent deployment changes detected",
            ]
        ),
        recommendations=json.dumps(
            [
                "Monitor latency trends for further degradation",
                "Contact upstream service provider",
                "Consider implementing circuit breaker pattern",
            ]
        ),
        started_at=now - timedelta(hours=2),
    )
    db.add(incident)
    db.flush()

    events = [
        TimelineEvent(
            incident_id=incident.id,
            timestamp=now - timedelta(hours=2),
            event=f"Latency spike detected on {endpoint.name}: average response time exceeded 800ms",
            type="detection",
        ),
        TimelineEvent(
            incident_id=incident.id,
            timestamp=now - timedelta(hours=1, minutes=45),
            event="Intermittent 503 errors reported by monitoring",
            type="detection",
        ),
        TimelineEvent(
            incident_id=incident.id,
            timestamp=now - timedelta(hours=1, minutes=30),
            event="AI analysis started: investigating upstream service health",
            type="investigation",
        ),
    ]
    for te in events:
        db.add(te)


def _create_down_incident(db, endpoint, ep_data, now):
    incident = Incident(
        endpoint_id=endpoint.id,
        title=f"{endpoint.name} is unreachable",
        description=(
            f"Endpoint {endpoint.name} ({endpoint.url}) is not responding. "
            f"All connection attempts are timing out."
        ),
        severity="critical",
        status="open",
        root_cause="Service completely unreachable - DNS resolution or network connectivity failure",
        confidence_score=0.92,
        evidence=json.dumps(
            [
                "Connection timeout after 10 seconds",
                "DNS resolution failing for auth.demo.local",
                "No health check responses in last 30 minutes",
                "Service last responded 6 hours ago",
            ]
        ),
        recommendations=json.dumps(
            [
                "Verify DNS configuration for auth.demo.local",
                "Check network connectivity to service",
                "Review service deployment logs for crash indicators",
                "Implement automatic failover to backup service",
            ]
        ),
        started_at=now - timedelta(hours=6),
    )
    db.add(incident)
    db.flush()

    events = [
        TimelineEvent(
            incident_id=incident.id,
            timestamp=now - timedelta(hours=6),
            event=f"Service {endpoint.name} became unreachable - all health checks failing",
            type="detection",
        ),
        TimelineEvent(
            incident_id=incident.id,
            timestamp=now - timedelta(hours=5, minutes=45),
            event="Critical alert triggered: 3 consecutive check failures",
            type="detection",
        ),
        TimelineEvent(
            incident_id=incident.id,
            timestamp=now - timedelta(hours=5, minutes=30),
            event="AI investigation initiated: analyzing failure patterns",
            type="investigation",
        ),
        TimelineEvent(
            incident_id=incident.id,
            timestamp=now - timedelta(hours=5, minutes=15),
            event="Root cause identified: DNS resolution failure",
            type="investigation",
        ),
    ]
    for te in events:
        db.add(te)
