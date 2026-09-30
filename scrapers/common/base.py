import sys
from pathlib import Path

# Add backend to path so root scrapers can import seamlessly
backend_dir = Path(__file__).resolve().parent.parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.scrapers.base import BaseScraper
from app.scrapers.adapters import DemoAirfareAdapter, AirlineLiveAdapter, ROUTE_BASE_FARES, WINDOW_MULTIPLIERS

__all__ = ["BaseScraper", "DemoAirfareAdapter", "AirlineLiveAdapter", "ROUTE_BASE_FARES", "WINDOW_MULTIPLIERS"]
