from __future__ import annotations

import random


def generate_grid_reading() -> dict:
    fault_roll = random.random()
    if fault_roll < 0.06:
        return {
            "fault_type": "grid_line_break",
            "is_anomaly": True,
            "voltage": random.uniform(0, 1),
            "current": random.uniform(0, 50),
            "temperature": random.uniform(35, 55),
            "vibration": random.uniform(10, 20),
            "crack_width": 0.0,
            "seepage_flow": 0.0,
        }

    return {
        "fault_type": "normal",
        "is_anomaly": False,
        "voltage": random.uniform(10.5, 11.5),
        "current": random.uniform(120, 260),
        "temperature": random.uniform(35, 55),
        "vibration": random.uniform(8, 20),
        "crack_width": 0.0,
        "seepage_flow": 0.0,
    }
