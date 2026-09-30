from app.models.user import User, OTPVerification, OAuthAccount
from app.models.route import Route
from app.models.airline import Airline
from app.models.source import Source
from app.models.observation import FareObservation
from app.models.index_value import IndexValue
from app.models.collection_log import CollectionLog
from app.models.data_quality import DataQuality

__all__ = [
    "User",
    "OTPVerification",
    "OAuthAccount",
    "Route",
    "Airline",
    "Source",
    "FareObservation",
    "IndexValue",
    "CollectionLog",
    "DataQuality",
]
