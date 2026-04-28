from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from server.config import settings


class Database:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


database = Database()


async def connect_db() -> None:
    database.client = AsyncIOMotorClient(settings.mongo_uri)
    database.db = database.client[settings.mongo_db]
    await ensure_indexes()


async def close_db() -> None:
    if database.client:
        database.client.close()


def get_db() -> AsyncIOMotorDatabase:
    if database.db is None:
        raise RuntimeError("Database is not connected")
    return database.db


async def ensure_indexes() -> None:
    db = database.db
    if db is None:
        return

    await db.engineers.create_index("email", unique=True)
    await db.engineers.create_index("status")
    await db.engineers.create_index([("location.lat", 1), ("location.lng", 1)])

    await db.incidents.create_index("infra_type")
    await db.incidents.create_index("severity")
    await db.incidents.create_index("status")
    await db.incidents.create_index([("status", 1), ("severity", 1)])

    await db.dispatches.create_index("incident_id")
    await db.dispatches.create_index("engineer_id")
    await db.dispatches.create_index([("incident_id", 1), ("engineer_id", 1)])
    await db.dispatches.create_index("status")

    await db.sensor_readings.create_index("asset_id")
    await db.sensor_readings.create_index("timestamp")
    await db.sensor_readings.create_index("is_anomaly")
    await db.sensor_readings.create_index([("asset_id", 1), ("timestamp", -1)])

    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
