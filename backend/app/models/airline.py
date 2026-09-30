from sqlalchemy import Column, Integer, String, Boolean
from app.database.session import Base

class Airline(Base):
    __tablename__ = "airlines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(10), unique=True, index=True, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
