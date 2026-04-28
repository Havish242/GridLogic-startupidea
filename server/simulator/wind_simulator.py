from __future__ import annotations

import random


def generate_wind_reading() -> dict:
    fault_roll = random.random()
    if fault_roll < 0.08:
        return {
            "fault_type": "gearbox_failure",
            "is_anomaly": True,
            "vibration": random.uniform(150, 300),
            "temperature": random.uniform(90, 110),
            "voltage": random.uniform(8.5, 10.2),
            "current": random.uniform(220, 320),
        }
    if fault_roll < 0.16:
        return {
            "fault_type": "blade_damage",
            "is_anomaly": True,
            "vibration": random.uniform(130, 240),
            "temperature": random.uniform(75, 95),
            "voltage": random.uniform(9.2, 10.4),
            "current": random.uniform(190, 270),
        }

    return {
        "fault_type": "normal",
        "is_anomaly": False,
        "vibration": random.uniform(10, 50),
        "temperature": random.uniform(40, 60),
        "voltage": random.uniform(10.8, 11.3),
        "current": random.uniform(120, 180),
    }
