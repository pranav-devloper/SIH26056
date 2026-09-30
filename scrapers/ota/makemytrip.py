from scrapers.common.base import BaseScraper, DemoAirfareAdapter
from datetime import date
from typing import List, Dict, Any

class MakeMyTripScraper(BaseScraper):
    def __init__(self):
        super().__init__("MakeMyTrip Partner API", "https://www.makemytrip.com", delay_seconds=2.0)

    def fetch(self, origin: str, destination: str, travel_date: date) -> Any:
        self.check_robots_txt()
        self.polite_delay()
        demo = DemoAirfareAdapter()
        return demo.fetch(origin, destination, travel_date)

    def parse(self, raw_data: Any) -> List[Dict[str, Any]]:
        return raw_data

    def normalize(self, parsed_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        demo = DemoAirfareAdapter()
        return demo.normalize(parsed_items)
