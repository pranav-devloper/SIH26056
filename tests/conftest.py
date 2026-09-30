import pytest
from app.database.session import Base, engine, SessionLocal
from app.services.seed_data import seed_database
import os

@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db, days_back=35)
    finally:
        db.close()
    yield
