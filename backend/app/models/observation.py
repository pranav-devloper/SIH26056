from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Index
from app.database.session import Base

class FareObservation(Base):
    __tablename__ = "fare_observations"

    id = Column(Integer, primary_key=True, index=True)
    collection_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    travel_date = Column(Date, nullable=False, index=True)
    origin = Column(String(10), nullable=False, index=True)
    destination = Column(String(10), nullable=False, index=True)
    airline = Column(String(100), nullable=False, index=True)
    source = Column(String(100), nullable=False)
    flight_number = Column(String(50), nullable=False)
    fare_class = Column(String(50), default="Economy", nullable=False)
    booking_window = Column(String(20), nullable=False, index=True)  # T+1, T+7, T+15, T+30, T+45
    base_fare = Column(Float, nullable=False)
    taxes = Column(Float, nullable=False)
    fees = Column(Float, default=0.0, nullable=False)
    total_fare = Column(Float, nullable=False)
    availability = Column(Integer, default=9, nullable=False)
    is_synthetic = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        Index("idx_origin_dest_date", "origin", "destination", "travel_date"),
        Index("idx_airline_window", "airline", "booking_window"),
    )
