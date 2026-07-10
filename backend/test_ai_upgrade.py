"""
Test script to verify the upgraded AI pipeline.

Sends a realistic incident request with logs, metrics,
deployment info, and previous incidents, then prints the RCA.
"""

import json
from datetime import datetime, timezone

from app.ai.agent import analyze_incident
from app.ai.schemas import AIReport, IncidentRequest


def print_report(report: AIReport) -> None:
    """Pretty-print an AIReport."""
    print(json.dumps(report.model_dump(), indent=2))


def test_rich_incident() -> None:
    """Test with a realistic incident containing all context fields."""
    request = IncidentRequest(
        incident_id="INC-2026-07-10-0042",
        endpoint="/api/v2/payments/checkout",
        status_code=504,
        latency=28700.0,
        error_message="upstream connect error or disconnect/reset before headers. reset reason: connection timeout",
        service_name="payment-service",
        environment="production",
        timestamp=datetime(2026, 7, 10, 14, 23, 15, tzinfo=timezone.utc),
        logs=[
            "[2026-07-10T14:22:50Z] WARN  payment-service: upstream health check failed for backend-pool-3",
            "[2026-07-10T14:23:00Z] ERROR payment-service: connection pool exhausted for pool-3, retrying in 500ms",
            "[2026-07-10T14:23:05Z] ERROR payment-service: gateway timeout after 28700ms, returning 504",
            "[2026-07-10T14:23:10Z] INFO  payment-service: circuit breaker opened for backend-pool-3",
            "[2026-07-10T14:23:12Z] WARN  payment-service: fallback to backend-pool-2 degraded (latency 3400ms)",
        ],
        system_metrics={
            "cpu": 94.5,
            "memory": 87.2,
            "disk": 62.0,
            "network": 450.0,
        },
        deployment_info=(
            "Version: 2.14.3-rc1 | Commit: a3f8e2b | Deployed: 2026-07-10T12:00:00Z "
            "| Changed: increased connection pool timeout from 10s to 30s "
            "| Rolling update to 60% of instances complete"
        ),
        recent_incidents=[
            "INC-2026-07-09-0038: 502 errors on /api/v2/payments/checkout, resolved by restarting backend-pool-3 (root cause: memory leak in pool-3 sidecar)",
            "INC-2026-07-08-0021: Latency spike on payment-service, caused by DB connection pool exhaustion during flash sale event",
        ],
    )

    print("=== Sending rich incident for analysis ===\n")
    report = analyze_incident(request)
    print_report(report)


def test_basic_incident() -> None:
    """Test with a basic incident (no extras) to ensure backward compatibility."""
    request = IncidentRequest(
        incident_id="INC-2026-07-10-0001",
        endpoint="/api/v1/users/login",
        status_code=429,
        latency=1200.0,
        error_message="rate limit exceeded for IP 203.0.113.42",
    )

    print("=== Testing basic incident (backward compat) ===\n")
    report = analyze_incident(request)
    print_report(report)


if __name__ == "__main__":
    test_rich_incident()
    print("\n" + "=" * 60 + "\n")
    test_basic_incident()
