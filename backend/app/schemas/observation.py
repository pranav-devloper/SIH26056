from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class FareObservationBase(BaseModel):
    collection_timestamp: datetime
    travel_date: date
    origin: str
    destination: str
    airline: str
    source: str
    flight_number: str
    fare_class: str = "Economy"
    booking_window: str  # T+1, T+7, T+15, T+30, T+45
    base_fare: float
    taxes: float
    fees: float = 0.0
    total_fare: float
    availability: int = 9
    is_synthetic: bool = False

class FareObservationCreate(FareObservationBase):
    pass

class FareObservationResponse(FareObservationBase):
    id: int

    class Config:
        from_attributes = True

class PaginatedObservationsResponse(BaseModel):
    items: List[FareObservationResponse]
    total: int
    page: int
    limit: int
    total_pages: int
