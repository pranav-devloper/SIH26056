from scrapers.common.base import AirlineLiveAdapter

class AirIndiaScraper(AirlineLiveAdapter):
    def __init__(self):
        super().__init__("Air India", "https://www.airindia.com")

class SpiceJetScraper(AirlineLiveAdapter):
    def __init__(self):
        super().__init__("SpiceJet", "https://www.spicejet.com")

class AkasaScraper(AirlineLiveAdapter):
    def __init__(self):
        super().__init__("Akasa Air", "https://www.akasaair.com")
