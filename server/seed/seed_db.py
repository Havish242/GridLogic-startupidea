from __future__ import annotations

import asyncio
import random
from datetime import timedelta

from server.auth_utils import hash_password
from server.common import utcnow
from server.database import close_db, connect_db, get_db


CERT_POOLS = {
    "wind": ["wind_gearbox", "wind_blade", "wind_generator"],
    "dam": ["dam_structural", "dam_gate", "dam_turbine"],
    "electrical": ["substation_transformer", "substation_breaker", "grid_line", "grid_relay"],
    "generalist": ["wind_gearbox", "dam_structural", "grid_relay"],
}

DAM_LOCATIONS = [
    {"lat": 30.7426, "lng": 79.4930, "address": "Tehri Dam, Uttarakhand"},
    {"lat": 21.8247, "lng": 73.7469, "address": "Sardar Sarovar Dam, Gujarat"},
    {"lat": 16.5726, "lng": 80.3211, "address": "Nagarjuna Sagar Dam, Telangana"},
    {"lat": 12.4226, "lng": 76.5720, "address": "Krishna Raja Sagara Dam, Karnataka"},
    {"lat": 24.4730, "lng": 74.7822, "address": "Gandhi Sagar Dam, Madhya Pradesh"},
]


def _random_nearby(lat: float, lng: float, spread: float = 0.25) -> dict:
    return {
        "lat": round(lat + random.uniform(-spread, spread), 6),
        "lng": round(lng + random.uniform(-spread, spread), 6),
    }


def make_engineers() -> list[dict]:
    engineers = []
    groups = ["wind", "dam", "electrical", "generalist"]
    idx = 1
    for group in groups:
        for _ in range(5):
            if group == "dam":
                dam_site = random.choice(DAM_LOCATIONS)
                location = _random_nearby(dam_site["lat"], dam_site["lng"], spread=0.18)
            else:
                location = {"lat": random.uniform(8, 33), "lng": random.uniform(68, 88)}

            engineers.append(
                {
                    "name": f"Engineer {idx}",
                    "email": f"eng{idx}@gridpulse.ai",
                    "phone": f"9{random.randint(10**9, (10**10)-1)}",
                    "certifications": random.sample(CERT_POOLS[group], k=min(2, len(CERT_POOLS[group]))),
                    "location": location,
                    "status": random.choice(["available", "available", "offline"]),
                    "rating": round(random.uniform(3.6, 5.0), 2),
                    "completed_jobs": random.randint(3, 120),
                }
            )
            idx += 1
    return engineers


def make_incidents(count: int = 50) -> list[dict]:
    types = ["wind", "dam", "substation", "grid"]
    severities = ["low", "medium", "high", "critical"]
    faults = ["gearbox_failure", "dam_structural", "substation_transformer", "grid_relay_fault"]
    rows = []
    now = utcnow()
    for i in range(count):
        infra_type = random.choice(types)
        if infra_type == "dam":
            dam_site = random.choice(DAM_LOCATIONS)
            location = {
                **_random_nearby(dam_site["lat"], dam_site["lng"], spread=0.12),
                "address": dam_site["address"],
            }
        else:
            location = {
                "lat": random.uniform(8, 33),
                "lng": random.uniform(68, 88),
                "address": f"Sector {i + 1}",
            }

        rows.append(
            {
                "infra_type": infra_type,
                "fault_type": random.choice(faults),
                "severity": random.choice(severities),
                "location": location,
                "sensor_readings": {"vibration": random.uniform(20, 260), "temperature": random.uniform(40, 110)},
                "classifier_score": round(random.uniform(0.5, 0.99), 3),
                "status": random.choice(["open", "dispatched", "in_progress"]),
                "created_at": now - timedelta(minutes=random.randint(0, 400)),
                "resolved_at": None,
            }
        )
    return rows


def make_sensor_readings(count: int = 200) -> list[dict]:
    infra = ["wind", "dam", "substation", "grid"]
    rows = []
    for i in range(count):
        rows.append(
            {
                "asset_id": f"AST-{1000 + i}",
                "infra_type": random.choice(infra),
                "timestamp": utcnow() - timedelta(minutes=random.randint(0, 240)),
                "vibration": random.uniform(10, 300),
                "temperature": random.uniform(30, 120),
                "crack_width": random.uniform(0.0, 1.5),
                "seepage_flow": random.uniform(0.0, 10),
                "voltage": random.uniform(0.0, 11.8),
                "current": random.uniform(0.0, 420),
                "is_anomaly": random.choice([False, False, True]),
            }
        )
    return rows


async def seed() -> None:
    await connect_db()
    db = get_db()

    await db.engineers.delete_many({})
    await db.incidents.delete_many({})
    await db.sensor_readings.delete_many({})
    await db.dispatches.delete_many({})
    await db.users.delete_many({})

    engineers = make_engineers()
    incidents = make_incidents()
    sensors = make_sensor_readings()

    eng_result = await db.engineers.insert_many(engineers)
    inc_result = await db.incidents.insert_many(incidents)
    await db.sensor_readings.insert_many(sensors)

    dispatch_docs = []
    for _ in range(30):
        incident_id = random.choice(inc_result.inserted_ids)
        engineer_id = random.choice(eng_result.inserted_ids)
        dispatched_at = utcnow() - timedelta(minutes=random.randint(40, 300))
        arrived_at = dispatched_at + timedelta(minutes=random.randint(5, 30))
        actual = random.randint(18, 75)
        dispatch_docs.append(
            {
                "incident_id": incident_id,
                "engineer_id": engineer_id,
                "dispatched_at": dispatched_at,
                "arrived_at": arrived_at,
                "route": [
                    {"lat": random.uniform(8, 33), "lng": random.uniform(68, 88)},
                    {"lat": random.uniform(8, 33), "lng": random.uniform(68, 88)},
                ],
                "estimated_eta": random.randint(8, 35),
                "actual_mttr": actual,
                "status": "completed",
            }
        )

    await db.dispatches.insert_many(dispatch_docs)

    users = [
        {
            "name": "Ops Manager",
            "email": "manager@gridpulse.ai",
            "password_hash": hash_password("GridPulse@123"),
            "role": "manager",
            "created_at": utcnow(),
        },
        {
            "name": "Control Operator",
            "email": "operator@gridpulse.ai",
            "password_hash": hash_password("GridPulse@123"),
            "role": "operator",
            "created_at": utcnow(),
        },
        {
            "name": "Field Engineer",
            "email": "engineer@gridpulse.ai",
            "password_hash": hash_password("GridPulse@123"),
            "role": "engineer",
            "created_at": utcnow(),
        },
    ]
    await db.users.insert_many(users)

    print("Seed completed: 20 engineers, 50 incidents, 200 sensor readings, 30 dispatches")
    await close_db()


if __name__ == "__main__":
    asyncio.run(seed())
