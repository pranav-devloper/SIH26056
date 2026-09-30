from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SourceBase(BaseModel):
    name: str
    type: str  # AIRLINE_DIRECT, OTA, AGGREGATOR
    status: str = "ACTIVE"
    rate_limit: str = "60 req/min"
    enabled: bool = True

class SourceCreate(SourceBase):
    pass

class SourceStatusUpdate(BaseModel):
    status: str
    enabled: Optional[bool] = None

class SourceResponse(SourceBase):
    id: int
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None

    class Config:
        from_attributes = True
