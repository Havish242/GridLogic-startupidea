from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from server.ai.classifier.predict import classify_damage
from server.ai.classifier.train import MODEL_PATH
from server.ai.matcher.engineer_matcher import rank_engineers
from server.ai.router.route_optimizer import optimize_route
from server.auth_utils import require_roles
from server.common import oid
from server.database import get_db


router = APIRouter(prefix="/ai", tags=["ai"])


class ClassifyPayload(BaseModel):
    vibration: float
    temperature: float
    crack_width: float
    seepage_flow: float
    voltage: float
    current: float
    infra_type: str


class MatchPayload(BaseModel):
    incident_id: str
    fault_type: str
    site_location: dict


class RoutePayload(BaseModel):
    engineer_lat: float
    engineer_lng: float
    site_lat: float
    site_lng: float


@router.post("/classify")
async def classify(payload: ClassifyPayload, _=Depends(require_roles("operator", "manager", "engineer"))):
    return classify_damage(payload.model_dump())


@router.post("/match")
async def match(payload: MatchPayload, _=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    incident = await db.incidents.find_one({"_id": oid(payload.incident_id)})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident["fault_type"] = payload.fault_type
    incident["location"] = payload.site_location
    engineers = [e async for e in db.engineers.find({"status": "available"})]
    return {"matches": rank_engineers(incident, engineers)}


@router.post("/route")
async def route(payload: RoutePayload, _=Depends(require_roles("operator", "manager", "engineer"))):
    return optimize_route(
        engineer_lat=payload.engineer_lat,
        engineer_lng=payload.engineer_lng,
        site_lat=payload.site_lat,
        site_lng=payload.site_lng,
    )


@router.get("/health")
async def health(_=Depends(require_roles("operator", "manager", "engineer"))):
    return {"model_ready": MODEL_PATH.exists()}
