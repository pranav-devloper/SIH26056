from scrapers.common.base import AirlineLiveAdapter

class AkasaAirScraper(AirlineLiveAdapter):
    def __init__(self):
        super().__init__("Akasa Air", "https://www.akasaair.com")

if __name__ == "__main__":
    from datetime import date, timedelta
    scraper = AkasaAirScraper()
    print("Testing Akasa Air scraper compliance...")
    print(f"Robots.txt check: {scraper.check_robots_txt()}")
    res = scraper.fetch("DEL", "BOM", date.today() + timedelta(days=7))
    print(f"Fetch response: {res}")
