import urllib.request, json


def api_get(path):
    req = urllib.request.Request(f"http://localhost:8000{path}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


# Dashboard
d = api_get("/api/dashboard")
print("Dashboard API:")
print(f"  Total Endpoints: {d['totalEndpoints']}")
print(f"  Operational: {d['upEndpoints']}")
print(f"  Degraded: {d['degradedEndpoints']}")
print(f"  Down: {d['downEndpoints']}")
print(f"  Active Incidents: {d['activeIncidents']}")
print(f"  Avg Latency: {d['avgLatency']}ms")
print(f"  Uptime: {d['uptimePercentage']}%")
print()

# Status
s = api_get("/api/status")
print("Status API:")
print(f"  Endpoints: {len(s)}")
for ep in s:
    print(
        f"    {ep['name']}: status={ep['status']}, latency={ep['latency']}ms, uptime={ep['uptime']}%"
    )
print()

# Endpoints
e = api_get("/api/endpoints")
print(f"Endpoints API: {len(e)} endpoints")
print()

# Incidents
i = api_get("/api/incidents")
print(f"Incidents API: {len(i)} incidents")
for inc in i:
    print(f"    {inc['title']}: severity={inc['severity']}, status={inc['status']}")
