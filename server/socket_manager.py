import socketio


sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


@sio.event
async def connect(sid, environ, auth):
    return True


@sio.event
async def disconnect(sid):
    return None


async def emit_incident_new(payload: dict) -> None:
    await sio.emit("incident:new", payload)


async def emit_dispatch_update(payload: dict) -> None:
    await sio.emit("dispatch:update", payload)


async def emit_engineer_location(payload: dict) -> None:
    await sio.emit("engineer:location", payload)
