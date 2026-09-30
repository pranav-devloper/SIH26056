from sqlalchemy import Column, Integer, Date
from app.database.session import Base

class DataQuality(Base):
    __tablename__ = "data_quality"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True, index=True)
    total_records = Column(Integer, default=0, nullable=False)
    valid_records = Column(Integer, default=0, nullable=False)
    duplicates = Column(Integer, default=0, nullable=False)
    missing_values = Column(Integer, default=0, nullable=False)
    outliers = Column(Integer, default=0, nullable=False)
    sold_out_flights = Column(Integer, default=0, nullable=False)
    parser_errors = Column(Integer, default=0, nullable=False)
