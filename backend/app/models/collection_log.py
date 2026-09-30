from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.session import Base

class CollectionLog(Base):
    __tablename__ = "collection_logs"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(100), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False)  # SUCCESS, FAILED, RATE_LIMITED, PARTIAL
    records = Column(Integer, default=0, nullable=False)
    errors = Column(Text, nullable=True)
