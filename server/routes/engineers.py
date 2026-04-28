from fastapi import APIRouter, Depends

from server.auth_utils import require_roles
from server.common import oid, to_doc
from server.database import get_db
from server.models.engineer import EngineerUpdate, Location
from server.socket_manager import emit_engineer_location


router = APIRouter(prefix="/api/engineers", tags=["engineers"])


@router.get("")
async def list_engineers(_=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    rows = [to_doc(item) async for item in db.engineers.find({}).sort("rating", -1)]
    return {"items": rows}


@router.get("/available")
async def available_engineers(_=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    rows = [to_doc(item) async for item in db.engineers.find({"status": "available"}).sort("rating", -1)]
    return {"items": rows}


@router.patch("/{engineer_id}/location")
async def update_engineer_location(engineer_id: str, payload: Location, _=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    await db.engineers.update_one({"_id": oid(engineer_id)}, {"$set": {"location": payload.model_dump()}})
    engineer = await db.engineers.find_one({"_id": oid(engineer_id)})
    data = to_doc(engineer)
    await emit_engineer_location(data)
    return data


@router.patch("/{engineer_id}/status")
async def update_engineer_status(engineer_id: str, payload: EngineerUpdate, _=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    updates = payload.model_dump(exclude_none=True)
    await db.engineers.update_one({"_id": oid(engineer_id)}, {"$set": updates})
    engineer = await db.engineers.find_one({"_id": oid(engineer_id)})
    return to_doc(engineer)
