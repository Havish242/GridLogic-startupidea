from typing import Literal

from pydantic import BaseModel, EmailStr, Field


VALID_CERTS = [
    "wind_gearbox",
    "wind_blade",
    "wind_generator",
    "dam_structural",
    "dam_gate",
    "dam_turbine",
    "substation_transformer",
    "substation_breaker",
    "grid_line",
    "grid_relay",
]


class Location(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class EngineerBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(pattern=r"^\d{10,15}$")
    certifications: list[str] = Field(min_length=1)
    location: Location
    status: Literal["available", "on_job", "offline"] = "available"
    rating: float = Field(default=4.5, ge=0.0, le=5.0)
    completed_jobs: int = Field(default=0, ge=0)


class EngineerCreate(EngineerBase):
    pass


class EngineerUpdate(BaseModel):
    location: Location | None = None
    status: Literal["available", "on_job", "offline"] | None = None
    rating: float | None = Field(default=None, ge=0.0, le=5.0)


class EngineerResponse(EngineerBase):
    id: str
