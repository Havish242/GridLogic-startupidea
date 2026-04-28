from __future__ import annotations

from server.ai.matcher.engineer_matcher import rank_engineers
from server.ai.router.route_optimizer import optimize_route
from server.common import utcnow


async def build_dispatch_plan(db, incident: dict) -> dict:
    engineers = [e async for e in db.engineers.find({"status": "available"})]
    top_matches = rank_engineers(incident, engineers)
    if not top_matches:
        raise ValueError("No available engineers")

    selected = top_matches[0]
    engineer = next(e for e in engineers if str(e["_id"]) == selected["engineer_id"])
    route = optimize_route(
        engineer_lat=engineer["location"]["lat"],
        engineer_lng=engineer["location"]["lng"],
        site_lat=incident["location"]["lat"],
        site_lng=incident["location"]["lng"],
    )

    return {
        "incident_id": incident["_id"],
        "engineer_id": engineer["_id"],
        "dispatched_at": utcnow(),
        "arrived_at": None,
        "route": route["polyline"],
        "estimated_eta": route["eta_minutes"],
        "actual_mttr": None,
        "status": "pending",
    }
