from __future__ import annotations

import asyncio
import random

from server.ai.classifier.predict import classify_damage
from server.common import utcnow
from server.database import get_db
from server.simulator.dam_simulator import generate_dam_reading
from server.simulator.grid_simulator import generate_grid_reading
from server.simulator.wind_simulator import generate_wind_reading
from server.socket_manager import emit_incident_new


ASSETS = [
    {"asset_id": "WND-101", "infra_type": "wind", "lat": 19.12, "lng": 72.91, "address": "Wind Yard A"},
    {"asset_id": "DAM-401", "infra_type": "dam", "lat": 30.7426, "lng": 79.4930, "address": "Tehri Dam, Uttarakhand"},
    {"asset_id": "DAM-402", "infra_type": "dam", "lat": 21.8247, "lng": 73.7469, "address": "Sardar Sarovar Dam, Gujarat"},
    {"asset_id": "DAM-403", "infra_type": "dam", "lat": 16.5726, "lng": 80.3211, "address": "Nagarjuna Sagar Dam, Telangana"},
    {"asset_id": "GRD-301", "infra_type": "grid", "lat": 28.62, "lng": 77.20, "address": "Grid Sector 3"},
    {"asset_id": "SUB-205", "infra_type": "substation", "lat": 13.08, "lng": 80.27, "address": "Substation 2"},
]


def _reading_for_infra(infra_type: str) -> dict:
    if infra_type == "wind":
        return generate_wind_reading()
    if infra_type == "dam":
        return generate_dam_reading()
    return generate_grid_reading()


async def simulator_loop() -> None:
    db = get_db()
    while True:
        await asyncio.sleep(random.randint(5, 10))
        asset = random.choice(ASSETS)
        reading = _reading_for_infra(asset["infra_type"])

        sensor_doc = {
            "asset_id": asset["asset_id"],
            "infra_type": asset["infra_type"],
            "timestamp": utcnow(),
            "vibration": reading.get("vibration", 0.0),
            "temperature": reading.get("temperature", 0.0),
            "crack_width": reading.get("crack_width", 0.0),
            "seepage_flow": reading.get("seepage_flow", 0.0),
            "voltage": reading.get("voltage", 0.0),
            "current": reading.get("current", 0.0),
            "is_anomaly": reading.get("is_anomaly", False),
        }
        await db.sensor_readings.insert_one(sensor_doc)

        if reading.get("is_anomaly"):
            classification = classify_damage({**sensor_doc, "infra_type": asset["infra_type"]})
            incident = {
                "infra_type": asset["infra_type"],
                "fault_type": classification["fault_type"],
                "severity": classification["severity"],
                "location": {"lat": asset["lat"], "lng": asset["lng"], "address": asset["address"]},
                "sensor_readings": sensor_doc,
                "classifier_score": classification["confidence"],
                "status": "open",
                "created_at": utcnow(),
                "resolved_at": None,
            }
            result = await db.incidents.insert_one(incident)
            incident["id"] = str(result.inserted_id)
            await emit_incident_new(incident)
