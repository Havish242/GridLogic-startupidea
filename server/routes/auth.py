from fastapi import APIRouter, Depends, HTTPException

from server.auth_utils import create_token, current_user, hash_password, verify_password
from server.common import to_doc, utcnow
from server.database import get_db
from server.models.auth import UserCreate, UserLogin


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(payload: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")

    doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "role": payload.role,
        "created_at": utcnow(),
    }
    result = await db.users.insert_one(doc)
    user = await db.users.find_one({"_id": result.inserted_id})
    token = create_token(str(user["_id"]), user["role"], user["email"])
    data = to_doc(user)
    data.pop("password_hash", None)
    return {"token": token, "user": data}


@router.post("/login")
async def login(payload: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(str(user["_id"]), user["role"], user["email"])
    data = to_doc(user)
    data.pop("password_hash", None)
    return {"token": token, "user": data}


@router.post("/refresh")
async def refresh(user: dict = Depends(current_user)):
    token = create_token(str(user["_id"]), user["role"], user["email"])
    data = to_doc(user)
    data.pop("password_hash", None)
    return {"token": token, "user": data}
