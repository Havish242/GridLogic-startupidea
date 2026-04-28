from __future__ import annotations

import random


def generate_dam_reading() -> dict:
    fault_roll = random.random()
    if fault_roll < 0.08:
        return {
            "fault_type": "dam_seepage_crack",
            "is_anomaly": True,
            "crack_width": random.uniform(0.5, 1.4),
            "seepage_flow": random.uniform(5, 12),
            "temperature": random.uniform(45, 70),
            "voltage": random.uniform(10.1, 10.8),
            "current": random.uniform(80, 140),
            "vibration": random.uniform(14, 32),
        }

    return {
        "fault_type": "normal",
        "is_anomaly": False,
        "crack_width": random.uniform(0.0, 0.2),
        "seepage_flow": random.uniform(0, 1),
        "temperature": random.uniform(28, 48),
        "voltage": random.uniform(10.8, 11.3),
        "current": random.uniform(60, 120),
        "vibration": random.uniform(10, 25),
    }
