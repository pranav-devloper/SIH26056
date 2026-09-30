from scrapers.common.base import AirlineLiveAdapter

class IndigoScraper(AirlineLiveAdapter):
    def __init__(self):
        super().__init__("IndiGo", "https://www.goindigo.in")

if __name__ == "__main__":
    from datetime import date, timedelta
    scraper = IndigoScraper()
    print("Testing IndiGo scraper compliance...")
    print(f"Robots.txt check: {scraper.check_robots_txt()}")
    res = scraper.fetch("DEL", "BOM", date.today() + timedelta(days=7))
    print(f"Fetch response: {res}")
