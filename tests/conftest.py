from __future__ import annotations

from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from server.auth_utils import create_token, hash_password
from server.database import close_db, connect_db, get_db
from server.routes.ai import router as ai_router
from server.routes.auth import router as auth_router
from server.routes.dispatch import router as dispatch_router
from server.routes.engineers import router as engineers_router
from server.routes.incidents import router as incidents_router
from server.routes.sensor_readings import router as sensor_router


@pytest_asyncio.fixture(autouse=True)
async def db_connection() -> AsyncIterator[None]:
    await connect_db()
    yield
    await close_db()


@pytest_asyncio.fixture
async def db_cleanup() -> AsyncIterator[None]:
    db = get_db()
    await db.users.delete_many({})
    await db.engineers.delete_many({})
    await db.incidents.delete_many({})
    await db.dispatches.delete_many({})
    await db.sensor_readings.delete_many({})
    yield
    await db.users.delete_many({})
    await db.engineers.delete_many({})
    await db.incidents.delete_many({})
    await db.dispatches.delete_many({})
    await db.sensor_readings.delete_many({})


@pytest.fixture
def test_app() -> FastAPI:
    app = FastAPI(title='GridPulse Test App')
    app.include_router(auth_router)
    app.include_router(incidents_router)
    app.include_router(engineers_router)
    app.include_router(dispatch_router)
    app.include_router(sensor_router)
    app.include_router(ai_router)
    return app


@pytest_asyncio.fixture
async def client(test_app: FastAPI, db_cleanup) -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url='http://testserver') as async_client:
        yield async_client


@pytest_asyncio.fixture
async def auth_headers() -> dict[str, str]:
    db = get_db()
    user_doc = {
        'name': 'Test Manager',
        'email': 'manager.test@gridpulse.ai',
        'password_hash': hash_password('GridPulse@123'),
        'role': 'manager',
    }
    result = await db.users.insert_one(user_doc)
    token = create_token(str(result.inserted_id), user_doc['role'], user_doc['email'])
    return {'Authorization': f'Bearer {token}'}
