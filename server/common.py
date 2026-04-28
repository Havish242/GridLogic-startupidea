from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import HTTPException


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def oid(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail="Invalid id")
    return ObjectId(value)


def to_doc(item: dict[str, Any] | None) -> dict[str, Any] | None:
    if item is None:
        return None
    copy = {**item}
    if "_id" in copy:
        copy["id"] = str(copy.pop("_id"))
    return copy
