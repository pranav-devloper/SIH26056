from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date
from app.database.session import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String(10), nullable=False, index=True)
    destination = Column(String(10), nullable=False, index=True)
    route_code = Column(String(20), unique=True, index=True, nullable=False)
    weight = Column(Float, nullable=False, default=0.1)
    base_fare = Column(Float, nullable=False, default=4500.0)
    base_date = Column(Date, nullable=False, default=date(2026, 1, 1))
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
