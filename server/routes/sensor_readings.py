from fastapi import APIRouter, Depends

from server.auth_utils import require_roles
from server.common import to_doc, utcnow
from server.database import get_db
from server.models.sensor_reading import SensorReadingCreate


router = APIRouter(prefix="/api/sensor-readings", tags=["sensor-readings"])


@router.post("")
async def create_sensor_reading(payload: SensorReadingCreate, _=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    doc = payload.model_dump()
    doc["timestamp"] = utcnow()
    result = await db.sensor_readings.insert_one(doc)
    row = await db.sensor_readings.find_one({"_id": result.inserted_id})
    return to_doc(row)


@router.get("")
async def list_sensor_readings(_=Depends(require_roles("operator", "manager", "engineer"))):
    db = get_db()
    rows = [to_doc(item) async for item in db.sensor_readings.find({}).sort("timestamp", -1).limit(500)]
    return {"items": rows}
