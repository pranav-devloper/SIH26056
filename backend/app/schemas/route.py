from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class RouteBase(BaseModel):
    origin: str = Field(..., min_length=3, max_length=10)
    destination: str = Field(..., min_length=3, max_length=10)
    route_code: str = Field(..., min_length=5, max_length=20)
    weight: float = Field(..., ge=0.0, le=1.0)
    base_fare: float = Field(..., gt=0.0)
    base_date: date = Field(default_factory=lambda: date(2026, 1, 1))
    active: bool = True

class RouteCreate(RouteBase):
    pass

class RouteUpdate(BaseModel):
    weight: Optional[float] = Field(None, ge=0.0, le=1.0)
    base_fare: Optional[float] = Field(None, gt=0.0)
    base_date: Optional[date] = None
    active: Optional[bool] = None

class RouteResponse(RouteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RouteWeightUpdate(BaseModel):
    route_id: int
    weight: float = Field(..., ge=0.0, le=1.0)
