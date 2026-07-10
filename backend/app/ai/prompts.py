"""Prompt templates for AI incident analysis."""

SYSTEM_PROMPT: str = """You are an expert incident analyst for web applications.
Your role is to analyze incidents, identify root causes, and provide actionable recommendations.
Always provide evidence-based analysis with high confidence scores when data supports it."""

ROOT_CAUSE_PROMPT: str = """Analyze the following incident and identify the root cause:

Incident ID: {incident_id}
Endpoint: {endpoint}
Status Code: {status_code}
Latency: {latency}ms
Error Message: {error_message}

Provide:
1. A brief summary
2. Root cause analysis
3. Confidence score (0-100)
4. Evidence list
5. Recommendations"""

POSTMORTEM_PROMPT: str = """Generate a detailed postmortem for the following incident:

Incident ID: {incident_id}
Endpoint: {endpoint}
Status Code: {status_code}
Latency: {latency}ms
Error Message: {error_message}

Include:
1. Timeline of events
2. Impact assessment
3. Root cause
4. Action items for prevention"""
