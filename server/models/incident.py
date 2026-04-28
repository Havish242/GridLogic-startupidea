from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class IncidentLocation(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    address: str


class IncidentBase(BaseModel):
    infra_type: Literal["wind", "dam", "substation", "grid"]
    fault_type: str
    severity: Literal["low", "medium", "high", "critical"]
    location: IncidentLocation
    sensor_readings: dict[str, Any] = Field(default_factory=dict)
    classifier_score: float = Field(ge=0.0, le=1.0)
    status: Literal["open", "dispatched", "in_progress", "resolved"] = "open"


class IncidentCreate(IncidentBase):
    pass


class IncidentStatusUpdate(BaseModel):
    status: Literal["open", "dispatched", "in_progress", "resolved"]


class IncidentResponse(IncidentBase):
    id: str
    created_at: datetime
    resolved_at: datetime | None = None
