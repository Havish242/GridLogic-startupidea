from __future__ import annotations

from bson import ObjectId

from server.ai.matcher.engineer_matcher import rank_engineers


def test_matcher_prioritizes_correct_certification():
    incident = {
        'fault_type': 'dam_structural',
        'location': {'lat': 30.7426, 'lng': 79.4930},
    }

    engineers = [
        {
            '_id': ObjectId(),
            'certifications': ['grid_relay'],
            'location': {'lat': 30.70, 'lng': 79.49},
            'rating': 4.9,
            'completed_jobs': 30,
        },
        {
            '_id': ObjectId(),
            'certifications': ['dam_structural'],
            'location': {'lat': 30.72, 'lng': 79.50},
            'rating': 4.6,
            'completed_jobs': 25,
        },
    ]

    ranked = rank_engineers(incident, engineers)
    top_id = ranked[0]['engineer_id']
    assert top_id == str(engineers[1]['_id'])
