from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import date

class IndexValueResponse(BaseModel):
    id: int
    date: date
    frequency: str  # DAILY, WEEKLY, MONTHLY
    index_value: float
    base_period: str
    calculation_metadata: Optional[str] = None

    class Config:
        from_attributes = True

class CurrentIndexResponse(BaseModel):
    current_index: float
    base_period: str
    last_updated: date
    daily_change_pct: float
    weekly_change_pct: float
    monthly_change_pct: float
    total_observations: int
    active_routes: int
    active_sources: int
    is_demo: bool = True

class IndexTrendPoint(BaseModel):
    date: str
    index_value: float

class IndexTrendResponse(BaseModel):
    frequency: str
    base_period: str
    points: List[IndexTrendPoint]
