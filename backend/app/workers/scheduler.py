import logging
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import date, datetime, timedelta
from app.database.session import SessionLocal
from app.models.source import Source
from app.models.route import Route
from app.scrapers.adapters import get_adapter
from app.index_engine.calculator import IndexEngine

logger = logging.getLogger("airindex.scheduler")
logger.setLevel(logging.INFO)

scheduler = BackgroundScheduler()

def scheduled_airfare_collection():
    """
    Automated background worker that collects observations from enabled sources
    without requiring Redis or external task brokers.
    """
    db = SessionLocal()
    try:
        sources = db.query(Source).filter(Source.enabled == True).all()
        routes = db.query(Route).filter(Route.active == True).limit(5).all()
        today = date.today()

        for src in sources:
            adapter = get_adapter(src.name)
            for r in routes:
                for bw in ["T+1", "T+7", "T+15"]:
                    travel_d = today + timedelta(days=7)
                    adapter.run_pipeline(db, r.origin, r.destination, travel_d, bw)

        # Recalculate daily index for today
        IndexEngine.recompute_and_store_daily(db, today, base_period="2026-01")
        logger.info("Scheduled background airfare collection completed successfully.")
    except Exception as e:
        logger.error(f"Error during scheduled airfare collection: {e}")
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        # Run every 6 hours in production or configurable
        scheduler.add_job(
            scheduled_airfare_collection,
            "interval",
            hours=6,
            id="airfare_scraper_job",
            replace_existing=True
        )
        scheduler.start()
        logger.info("APScheduler initialized for AirIndex background jobs (Redis-Free).")

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler shut down successfully.")
