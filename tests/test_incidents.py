from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_incident_create_list_and_status_update(client, auth_headers):
    payload = {
        'infra_type': 'dam',
        'fault_type': 'dam_structural',
        'severity': 'critical',
        'location': {
            'lat': 30.7426,
            'lng': 79.4930,
            'address': 'Tehri Dam, Uttarakhand',
        },
        'sensor_readings': {
            'vibration': 28,
            'temperature': 58,
            'crack_width': 1.1,
            'seepage_flow': 8.4,
        },
        'classifier_score': 0.94,
        'status': 'open',
    }

    create_response = await client.post('/api/incidents', json=payload, headers=auth_headers)
    assert create_response.status_code == 200
    created = create_response.json()
    assert created['infra_type'] == payload['infra_type']
    assert created['status'] == 'open'

    list_response = await client.get('/api/incidents', headers=auth_headers)
    assert list_response.status_code == 200
    items = list_response.json()['items']
    assert any(item['id'] == created['id'] for item in items)

    patch_response = await client.patch(
        f"/api/incidents/{created['id']}/status",
        json={'status': 'resolved'},
        headers=auth_headers,
    )
    assert patch_response.status_code == 200
    patched = patch_response.json()
    assert patched['status'] == 'resolved'
    assert patched['resolved_at'] is not None
