from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_notification_settings_endpoint():
    response = client.get('/api/notifications/settings')
    assert response.status_code == 200
    data = response.json()
    assert 'channels' in data
    assert len(data['channels']) >= 3


def test_notification_send_endpoint_with_ai_payload():
    payload = {
        'incident_id': 'inc-123',
        'title': 'Checkout API is down',
        'severity': 'critical',
        'summary': 'The checkout endpoint returned 502 for 10 minutes.',
        'ai_analysis': {
            'root_cause': 'Database connection pool exhausted',
            'confidence': 0.93,
            'evidence': ['502 responses', 'connection pool saturation'],
            'recommended_fixes': ['Scale pool', 'Investigate DB metrics'],
        },
        'postmortem': {
            'summary': 'Capacity issue during peak traffic',
            'owner': 'Platform team',
        },
    }
    response = client.post('/api/notifications/send', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'queued'
    assert len(data['deliveries']) >= 1


def test_github_activity_endpoint():
    response = client.get('/api/integrations/github/recent-activity')
    assert response.status_code == 200
    data = response.json()
    assert 'items' in data
    assert len(data['items']) >= 1


def test_update_notification_settings_endpoint():
    payload = {
        'channels': [
            {'name': 'email', 'enabled': True, 'target': 'ops@example.com'},
            {'name': 'slack', 'enabled': False, 'target': '#incidents'},
            {'name': 'discord', 'enabled': True, 'target': 'incident-bot'},
        ],
        'alert_delay_seconds': 45,
        'mute_hours': ['22:00-06:00'],
    }
    response = client.put('/api/notifications/settings', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['alert_delay_seconds'] == 45
    assert any(channel['name'] == 'slack' and channel['enabled'] is False for channel in data['channels'])


def test_channel_status_endpoints():
    for path in ['/api/integrations/slack/status', '/api/integrations/discord/status', '/api/integrations/email/status']:
        response = client.get(path)
        assert response.status_code == 200
        data = response.json()
        assert 'status' in data
