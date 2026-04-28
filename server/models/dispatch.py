from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class RoutePoint(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class DispatchBase(BaseModel):
    incident_id: str
    engineer_id: str
    route: list[RoutePoint] = Field(default_factory=list)
    estimated_eta: int = Field(ge=0)
    status: Literal["pending", "en_route", "arrived", "completed"] = "pending"


class DispatchCreate(BaseModel):
    incident_id: str
    engineer_id: str


class DispatchResponse(DispatchBase):
    id: str
    dispatched_at: datetime
    arrived_at: datetime | None = None
    actual_mttr: int | None = None


class DispatchStatusUpdate(BaseModel):
    status: Literal["en_route", "arrived", "completed"]


class DispatchComplete(BaseModel):
    notes: str | None = None
