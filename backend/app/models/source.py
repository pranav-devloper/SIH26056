from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database.session import Base

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    type = Column(String(50), nullable=False)  # AIRLINE_DIRECT, OTA, AGGREGATOR
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, RATE LIMITED, UNAVAILABLE, PARSER ERROR, DEMO MODE
    last_run = Column(DateTime, nullable=True)
    next_run = Column(DateTime, nullable=True)
    rate_limit = Column(String(50), default="60 req/min", nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
