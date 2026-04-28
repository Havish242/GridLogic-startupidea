from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from server.auth_utils import require_roles
from server.common import oid, to_doc, utcnow
from server.database import get_db
from server.models.dispatch import DispatchComplete, DispatchCreate
from server.services.dispatch_service import build_dispatch_plan
from server.services.mttr_service import calculate_mttr_minutes
from server.socket_manager import emit_dispatch_update
from server.tasks import notify_engineer


router = APIRouter(prefix="/api/dispatch", tags=["dispatch"])


def _serialize_dispatch(doc: dict) -> dict:
    output = to_doc(doc)
    if isinstance(output.get("incident_id"), ObjectId):
        output["incident_id"] = str(output["incident_id"])
    if isinstance(output.get("engineer_id"), ObjectId):
        output["engineer_id"] = str(output["engineer_id"])
    return output


@router.post("")
async def create_dispatch(payload: DispatchCreate, _=Depends(require_roles("operator", "manager"))):
    db = get_db()
    incident = await db.incidents.find_one({"_id": oid(payload.incident_id)})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident.get("status") == "resolved":
        raise HTTPException(status_code=400, detail="Incident is already resolved")

    plan = await build_dispatch_plan(db, incident)
    if str(plan["engineer_id"]) != payload.engineer_id:
        plan["engineer_id"] = oid(payload.engineer_id)

    result = await db.dispatches.insert_one(plan)
    await db.incidents.update_one({"_id": incident["_id"]}, {"$set": {"status": "dispatched"}})
    await db.engineers.update_one({"_id": plan["engineer_id"]}, {"$set": {"status": "on_job"}})

    engineer = await db.engineers.find_one({"_id": plan["engineer_id"]})
    if engineer and engineer.get("phone"):
        notify_engineer.delay(engineer["phone"], f"New dispatch assigned for {incident['fault_type']}")

    dispatch = await db.dispatches.find_one({"_id": result.inserted_id})
    output = _serialize_dispatch(dispatch)
    await emit_dispatch_update(output)
    return output


@router.get("")
async def list_dispatches(
    engineer_id: str | None = Query(default=None),
    status: str | None = Query(default=None),
    _=Depends(require_roles("operator", "manager", "engineer")),
):
    db = get_db()
    query = {}
    if engineer_id:
        query["engineer_id"] = oid(engineer_id)
    if status:
        query["status"] = status

    rows = [_serialize_dispatch(item) async for item in db.dispatches.find(query).sort("dispatched_at", -1)]
    return {"items": rows}


@router.get("/{dispatch_id}")
async def get_dispatch(dispatch_id: str, _=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    row = await db.dispatches.find_one({"_id": oid(dispatch_id)})
    if not row:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    return _serialize_dispatch(row)


@router.patch("/{dispatch_id}/arrived")
async def mark_arrived(dispatch_id: str, _=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    await db.dispatches.update_one(
        {"_id": oid(dispatch_id)},
        {"$set": {"arrived_at": utcnow(), "status": "arrived"}},
    )
    dispatch = await db.dispatches.find_one({"_id": oid(dispatch_id)})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    output = _serialize_dispatch(dispatch)
    await emit_dispatch_update(output)
    return output


@router.patch("/{dispatch_id}/complete")
async def complete_dispatch(dispatch_id: str, payload: DispatchComplete, _=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    dispatch = await db.dispatches.find_one({"_id": oid(dispatch_id)})
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")

    completed_at = utcnow()
    mttr = calculate_mttr_minutes(dispatch["dispatched_at"], completed_at)

    await db.dispatches.update_one(
        {"_id": dispatch["_id"]},
        {"$set": {"status": "completed", "actual_mttr": mttr, "completed_notes": payload.notes}},
    )
    await db.incidents.update_one(
        {"_id": dispatch["incident_id"]},
        {"$set": {"status": "resolved", "resolved_at": completed_at}},
    )
    await db.engineers.update_one(
        {"_id": dispatch["engineer_id"]},
        {"$set": {"status": "available"}, "$inc": {"completed_jobs": 1}},
    )

    updated = await db.dispatches.find_one({"_id": dispatch["_id"]})
    output = _serialize_dispatch(updated)
    await emit_dispatch_update(output)
    return output
