from __future__ import annotations

from datetime import datetime

import pytest

from server.database import get_db
from server.routes import dispatch as dispatch_route
from server.services.mttr_service import calculate_mttr_minutes


@pytest.mark.asyncio
async def test_dispatch_full_flow_and_mttr(client, auth_headers, monkeypatch):
    monkeypatch.setattr(dispatch_route.notify_engineer, 'delay', lambda *args, **kwargs: None)

    db = get_db()

    engineer = {
        'name': 'Dispatch Engineer',
        'email': 'eng.dispatch@gridpulse.ai',
        'phone': '9123456789',
        'certifications': ['dam_structural', 'dam_gate'],
        'location': {'lat': 30.70, 'lng': 79.41},
        'status': 'available',
        'rating': 4.8,
        'completed_jobs': 14,
    }
    engineer_result = await db.engineers.insert_one(engineer)
    engineer_id = str(engineer_result.inserted_id)

    incident_payload = {
        'infra_type': 'dam',
        'fault_type': 'dam_structural',
        'severity': 'critical',
        'location': {'lat': 30.7426, 'lng': 79.4930, 'address': 'Tehri Dam, Uttarakhand'},
        'sensor_readings': {
            'vibration': 26,
            'temperature': 56,
            'crack_width': 1.0,
            'seepage_flow': 8.0,
        },
        'classifier_score': 0.95,
        'status': 'open',
    }

    incident_response = await client.post('/api/incidents', json=incident_payload, headers=auth_headers)
    assert incident_response.status_code == 200
    incident = incident_response.json()

    match_response = await client.post(
        '/ai/match',
        json={
            'incident_id': incident['id'],
            'fault_type': incident['fault_type'],
            'site_location': incident['location'],
        },
        headers=auth_headers,
    )
    assert match_response.status_code == 200
    matches = match_response.json()['matches']
    assert len(matches) >= 1

    dispatch_response = await client.post(
        '/api/dispatch',
        json={
            'incident_id': incident['id'],
            'engineer_id': engineer_id,
        },
        headers=auth_headers,
    )
    assert dispatch_response.status_code == 200
    dispatch = dispatch_response.json()
    assert dispatch['status'] == 'pending'

    arrived_response = await client.patch(f"/api/dispatch/{dispatch['id']}/arrived", headers=auth_headers)
    assert arrived_response.status_code == 200
    arrived_dispatch = arrived_response.json()
    assert arrived_dispatch['status'] == 'arrived'

    complete_response = await client.patch(
        f"/api/dispatch/{dispatch['id']}/complete",
        json={'notes': 'Leak sealed and structural patch reinforced'},
        headers=auth_headers,
    )
    assert complete_response.status_code == 200
    completed_dispatch = complete_response.json()
    assert completed_dispatch['status'] == 'completed'

    incident_check = await client.get(f"/api/incidents/{incident['id']}", headers=auth_headers)
    assert incident_check.status_code == 200
    resolved_incident = incident_check.json()
    assert resolved_incident['status'] == 'resolved'
    assert resolved_incident['resolved_at'] is not None

    dispatched_at = datetime.fromisoformat(completed_dispatch['dispatched_at'])
    resolved_at = datetime.fromisoformat(resolved_incident['resolved_at'])
    expected_mttr = calculate_mttr_minutes(dispatched_at, resolved_at)
    assert completed_dispatch['actual_mttr'] == expected_mttr
