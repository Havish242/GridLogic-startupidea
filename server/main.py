import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from redis.asyncio import from_url as redis_from_url
import socketio

from server.ai.classifier.predict import MODEL_PATH
from server.config import settings
from server.database import close_db, connect_db, get_db
from server.routes.ai import router as ai_router
from server.routes.auth import router as auth_router
from server.routes.dispatch import router as dispatch_router
from server.routes.engineers import router as engineers_router
from server.routes.incidents import router as incidents_router
from server.routes.sensor_readings import router as sensor_router
from server.simulator.simulator_runner import simulator_loop
from server.socket_manager import sio


sim_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global sim_task
    await connect_db()
    sim_task = asyncio.create_task(simulator_loop())
    yield
    if sim_task:
        sim_task.cancel()
    await close_db()


app = FastAPI(title=settings.app_name, lifespan=lifespan)


@app.get("/")
async def root():
    return {
        "service": settings.app_name,
        "status": "ok",
        "message": "GridPulse backend is running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    components = {
        "mongodb": False,
        "redis": False,
        "ai_model": MODEL_PATH.exists(),
    }

    try:
        db = get_db()
        mongo_ping = await db.command("ping")
        components["mongodb"] = bool(mongo_ping.get("ok") == 1)
    except Exception:
        components["mongodb"] = False

    redis_client = None
    try:
        redis_client = redis_from_url(settings.redis_url)
        redis_ping = await redis_client.ping()
        components["redis"] = bool(redis_ping)
    except Exception:
        components["redis"] = False
    finally:
        if redis_client is not None:
            await redis_client.aclose()

    overall_status = "ok" if all(components.values()) else "degraded"
    payload = {
        "service": settings.app_name,
        "status": overall_status,
        "components": components,
    }

    if overall_status == "ok":
        return payload

    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=payload)


app.include_router(auth_router)
app.include_router(incidents_router)
app.include_router(engineers_router)
app.include_router(dispatch_router)
app.include_router(sensor_router)
app.include_router(ai_router)


asgi_app = socketio.ASGIApp(sio, app)
