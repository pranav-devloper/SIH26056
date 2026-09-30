from scrapers.common.base import AirlineLiveAdapter

class EaseMyTripScraper(AirlineLiveAdapter):
    def __init__(self):
        super().__init__("EaseMyTrip", "https://www.easemytrip.com")

if __name__ == "__main__":
    from datetime import date, timedelta
    scraper = EaseMyTripScraper()
    print("Testing EaseMyTrip OTA scraper compliance...")
    print(f"Robots.txt check: {scraper.check_robots_txt()}")
    res = scraper.fetch("DEL", "BLR", date.today() + timedelta(days=15))
    print(f"Fetch response: {res}")
