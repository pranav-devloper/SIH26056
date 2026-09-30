from sqlalchemy import Column, Integer, String, Float, Date, Text, Index
from app.database.session import Base

class IndexValue(Base):
    __tablename__ = "index_values"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    frequency = Column(String(20), nullable=False, index=True)  # DAILY, WEEKLY, MONTHLY
    index_value = Column(Float, nullable=False)
    base_period = Column(String(50), nullable=False, default="2026-01")
    calculation_metadata = Column(Text, nullable=True)  # JSON-encoded route weights and sub-indices

    __table_args__ = (
        Index("idx_date_frequency", "date", "frequency", unique=True),
    )
