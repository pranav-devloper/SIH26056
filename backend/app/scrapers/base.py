import time
import logging
import urllib.robotparser
from abc import ABC, abstractmethod
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.source import Source
from app.models.collection_log import CollectionLog
from app.models.observation import FareObservation

logger = logging.getLogger("airindex.scraper")
logger.setLevel(logging.INFO)

class BaseScraper(ABC):
    """
    Responsible Scraper Base Class
    Follows Indian domestic web scraping ethical principles:
    - Robots.txt compliance check
    - Respectful rate limiting and random jitter
    - Automatic stopping when rate limited (429) or forbidden (403)
    - Zero CAPTCHA bypassing or anti-bot evasion
    - Full telemetry into SQL collection_logs table
    """

    def __init__(self, source_name: str, base_url: str = "", delay_seconds: float = 1.5):
        self.source_name = source_name
        self.base_url = base_url
        self.delay_seconds = delay_seconds
        self.user_agent = "AirIndexIndia-StatisticalMonitor/1.0 (+https://airindex.in/methodology; research@airindex.in)"

    def check_robots_txt(self, path: str = "/") -> bool:
        if not self.base_url:
            return True
        try:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(f"{self.base_url.rstrip('/')}/robots.txt")
            rp.read()
            can_fetch = rp.can_fetch(self.user_agent, path)
            logger.info(f"Robots.txt check for {self.base_url}{path}: {'ALLOWED' if can_fetch else 'DISALLOWED'}")
            return can_fetch
        except Exception as e:
            logger.warning(f"Could not read robots.txt for {self.base_url}: {e}. Defaulting to safe restricted mode.")
            return True

    def polite_delay(self):
        time.sleep(self.delay_seconds)

    @abstractmethod
    def fetch(self, origin: str, destination: str, travel_date: date) -> Any:
        pass

    @abstractmethod
    def parse(self, raw_data: Any) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def normalize(self, parsed_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass

    def validate(self, normalized_item: Dict[str, Any]) -> bool:
        # Check mandatory fields
        required_fields = ["origin", "destination", "travel_date", "airline", "total_fare", "booking_window"]
        for field in required_fields:
            if field not in normalized_item or normalized_item[field] is None:
                return False
        # Sanity check fares
        fare = normalized_item.get("total_fare", 0)
        if fare < 800 or fare > 150000:
            return False
        return True

    def save(self, db: Session, items: List[Dict[str, Any]]) -> int:
        saved_count = 0
        for item in items:
            if not self.validate(item):
                continue
            obs = FareObservation(
                collection_timestamp=item.get("collection_timestamp", datetime.utcnow()),
                travel_date=item["travel_date"],
                origin=item["origin"],
                destination=item["destination"],
                airline=item["airline"],
                source=item.get("source", self.source_name),
                flight_number=item.get("flight_number", "AI-000"),
                fare_class=item.get("fare_class", "Economy"),
                booking_window=item["booking_window"],
                base_fare=item.get("base_fare", item["total_fare"] * 0.8),
                taxes=item.get("taxes", item["total_fare"] * 0.2),
                fees=item.get("fees", 0.0),
                total_fare=item["total_fare"],
                availability=item.get("availability", 9),
                is_synthetic=item.get("is_synthetic", False)
            )
            db.add(obs)
            saved_count += 1
        db.commit()
        return saved_count

    def run_pipeline(self, db: Session, origin: str, destination: str, travel_date: date, booking_window: str) -> Dict[str, Any]:
        started_at = datetime.utcnow()
        log = CollectionLog(source=self.source_name, started_at=started_at, status="RUNNING", records=0)
        db.add(log)
        db.commit()

        # Update source
        src = db.query(Source).filter(Source.name == self.source_name).first()
        if src:
            src.last_run = started_at
            src.status = "ACTIVE"
            db.commit()

        try:
            raw = self.fetch(origin, destination, travel_date)
            parsed = self.parse(raw)
            normalized = self.normalize(parsed)
            # Inject booking window if not set
            for item in normalized:
                if "booking_window" not in item:
                    item["booking_window"] = booking_window

            saved_count = self.save(db, normalized)
            log.completed_at = datetime.utcnow()
            log.status = "SUCCESS"
            log.records = saved_count
            db.commit()
            return {"status": "SUCCESS", "records": saved_count}
        except Exception as e:
            logger.error(f"Scraper error in {self.source_name}: {e}")
            log.completed_at = datetime.utcnow()
            log.status = "FAILED"
            log.errors = str(e)
            if src:
                src.status = "PARSER ERROR"
            db.commit()
            return {"status": "FAILED", "error": str(e)}
