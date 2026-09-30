from scrapers.common.base import AirlineLiveAdapter

class AirIndiaExpressScraper(AirlineLiveAdapter):
    def __init__(self):
        super().__init__("Air India Express", "https://www.airindiaexpress.com")

if __name__ == "__main__":
    from datetime import date, timedelta
    scraper = AirIndiaExpressScraper()
    print("Testing Air India Express scraper compliance...")
    print(f"Robots.txt check: {scraper.check_robots_txt()}")
    res = scraper.fetch("DEL", "BOM", date.today() + timedelta(days=7))
    print(f"Fetch response: {res}")
