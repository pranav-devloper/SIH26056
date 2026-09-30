from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class RouteStats(BaseModel):
    route_code: str
    origin: str
    destination: str
    average_fare: float
    median_fare: float
    min_fare: float
    max_fare: float
    volatility: float
    availability_rate: float
    total_observations: int

class AirlineStats(BaseModel):
    airline: str
    code: str
    average_fare: float
    median_fare: float
    observations: int
    availability_rate: float
    route_coverage: float
    volatility: float

class BookingWindowPoint(BaseModel):
    window: str  # T+1, T+7, T+15, T+30, T+45
    lead_days: int
    average_fare: float
    median_fare: float
    min_fare: float
    max_fare: float

class HeatmapCell(BaseModel):
    origin: str
    destination: str
    route_code: str
    avg_fare: float
    change_pct: float
    index_contribution: float

class BacktestingMetric(BaseModel):
    mae: float
    rmse: float
    mape: float
    correlation: float
    sample_size: int
    date_range: str

class BacktestingPoint(BaseModel):
    date: str
    airindex_value: float
    benchmark_value: float
    diff: float

class BacktestingResponse(BaseModel):
    metrics: BacktestingMetric
    series: List[BacktestingPoint]
    disclaimer: str

class DataQualitySummary(BaseModel):
    total_records: int
    valid_records: int
    duplicates: int
    missing_values: int
    outliers: int
    sold_out_flights: int
    parser_errors: int
    validity_rate_pct: float
