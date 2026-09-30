from scrapers.common.base import AirlineLiveAdapter

class SpiceJetScraper(AirlineLiveAdapter):
    def __init__(self):
        super().__init__("SpiceJet", "https://www.spicejet.com")

if __name__ == "__main__":
    from datetime import date, timedelta
    scraper = SpiceJetScraper()
    print("Testing SpiceJet scraper compliance...")
    print(f"Robots.txt check: {scraper.check_robots_txt()}")
    res = scraper.fetch("DEL", "BOM", date.today() + timedelta(days=7))
    print(f"Fetch response: {res}")
