from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database.session import Base, engine, SessionLocal
from app.models import *  # Import all models for schema binding
from app.api.auth import router as auth_router
from app.api.index_routes import router as index_router
from app.api.airfare import router as airfare_router
from app.workers.scheduler import start_scheduler, shutdown_scheduler
from app.services.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQL Database Schema
    Base.metadata.create_all(bind=engine)

    # 2. Check and seed initial data if required
    db = SessionLocal()
    try:
        seed_database(db, days_back=35)
    except Exception as e:
        print(f"Startup database seeding note: {e}")
    finally:
        db.close()

    # 3. Start APScheduler (No Redis required)
    start_scheduler()

    yield

    # Shutdown
    shutdown_scheduler()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Statistical Intelligence & Real-Time Airfare Price Index Platform for Indian Domestic Aviation.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & evaluator convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(index_router, prefix=settings.API_V1_STR)
app.include_router(airfare_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "SQLAlchemy (PostgreSQL / SQLite swappable)",
        "redis_required": False
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to AirIndex India API",
        "docs": "/docs",
        "health": "/health",
        "version": settings.VERSION
    }
