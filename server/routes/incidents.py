from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from server.auth_utils import require_roles
from server.common import oid, to_doc, utcnow
from server.database import get_db
from server.models.incident import IncidentCreate, IncidentStatusUpdate
from server.socket_manager import emit_incident_new


router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.post("")
async def create_incident(payload: IncidentCreate, _=Depends(require_roles("operator", "manager"))):
    db = get_db()
    doc = payload.model_dump()
    doc["created_at"] = utcnow()
    doc["resolved_at"] = None
    result = await db.incidents.insert_one(doc)
    incident = await db.incidents.find_one({"_id": result.inserted_id})
    output = to_doc(incident)
    await emit_incident_new(output)
    return output


@router.get("")
async def list_incidents(
    infra_type: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    status: str | None = Query(default=None),
    _=Depends(require_roles("operator", "manager", "engineer")),
):
    db = get_db()
    query = {}
    if infra_type:
        query["infra_type"] = infra_type
    if severity:
        query["severity"] = severity
    if status:
        query["status"] = status

    data = [to_doc(item) async for item in db.incidents.find(query).sort("created_at", -1)]
    return {"items": data}


@router.get("/{incident_id}")
async def get_incident(incident_id: str, _=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    incident = await db.incidents.find_one({"_id": oid(incident_id)})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return to_doc(incident)


@router.patch("/{incident_id}/status")
async def update_incident_status(incident_id: str, payload: IncidentStatusUpdate, _=Depends(require_roles("operator", "manager"))):
    db = get_db()
    updates = {"status": payload.status}
    if payload.status == "resolved":
        updates["resolved_at"] = utcnow()

    await db.incidents.update_one({"_id": oid(incident_id)}, {"$set": updates})
    incident = await db.incidents.find_one({"_id": oid(incident_id)})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return to_doc(incident)
