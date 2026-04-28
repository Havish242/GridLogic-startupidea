from __future__ import annotations

import math


FAULT_CERT_MAP = {
    "gearbox_failure": ["wind_gearbox"],
    "blade_damage": ["wind_blade"],
    "generator_fault": ["wind_generator"],
    "dam_seepage_crack": ["dam_structural"],
    "dam_gate_fault": ["dam_gate"],
    "dam_structural": ["dam_structural"],
    "dam_turbine": ["dam_turbine"],
    "substation_transformer": ["substation_transformer"],
    "substation_breaker": ["substation_breaker"],
    "grid_line_break": ["grid_line"],
    "grid_relay_fault": ["grid_relay"],
}


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def rank_engineers(incident: dict, engineers: list[dict]) -> list[dict]:
    req = FAULT_CERT_MAP.get(incident.get("fault_type"), [])
    site = incident["location"]

    ranked = []
    for eng in engineers:
        certs = set(eng.get("certifications", []))
        cert_score = 1.0 if any(c in certs for c in req) else 0.3

        dist = haversine(eng["location"]["lat"], eng["location"]["lng"], site["lat"], site["lng"])
        distance_score = max(0.0, 1 - min(dist, 120) / 120)
        rating_score = float(eng.get("rating", 0)) / 5.0
        workload_score = max(0.0, 1 - min(float(eng.get("completed_jobs", 0)), 100) / 100)

        score = (0.40 * cert_score) + (0.35 * distance_score) + (0.15 * rating_score) + (0.10 * workload_score)
        eta = max(2, round((dist / 42) * 60))

        ranked.append(
            {
                "engineer_id": str(eng["_id"]),
                "match_score": round(score * 100, 2),
                "eta_minutes": eta,
                "distance_km": round(dist, 2),
            }
        )

    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked[:3]
