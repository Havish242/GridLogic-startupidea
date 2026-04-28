from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class SensorReadingBase(BaseModel):
    asset_id: str
    infra_type: Literal["wind", "dam", "substation", "grid"]
    timestamp: datetime
    vibration: float = 0
    temperature: float = 0
    crack_width: float = 0
    seepage_flow: float = 0
    voltage: float = 0
    current: float = 0
    is_anomaly: bool = False


class SensorReadingCreate(BaseModel):
    asset_id: str
    infra_type: Literal["wind", "dam", "substation", "grid"]
    vibration: float = 0
    temperature: float = 0
    crack_width: float = 0
    seepage_flow: float = 0
    voltage: float = 0
    current: float = 0
    is_anomaly: bool = False


class SensorReadingResponse(SensorReadingBase):
    id: str
