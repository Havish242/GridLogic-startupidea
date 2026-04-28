from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_classifier_returns_expected_fault_for_known_values(client, auth_headers):
    payload = {
        'vibration': 12.0,
        'temperature': 41.0,
        'crack_width': 0.05,
        'seepage_flow': 0.1,
        'voltage': 0.0,
        'current': 18.0,
        'infra_type': 'grid',
    }

    response = await client.post('/ai/classify', json=payload, headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data['fault_type'] == 'grid_line_break'
    assert data['severity'] == 'critical'
    assert 0 <= data['confidence'] <= 1
