import pytest
import pytest_asyncio
import httpx
from datetime import date, timedelta
from app.main import app
from app.database.session import SessionLocal
from app.models.route import Route
from app.models.observation import FareObservation
from app.models.index_value import IndexValue
from app.index_engine.calculator import IndexEngine
from app.scrapers.adapters import DemoAirfareAdapter

@pytest_asyncio.fixture
async def client():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

def test_laspeyres_index_formula():
    db = SessionLocal()
    try:
        today = date.today()
        result = IndexEngine.calculate_for_date(db, today, base_period="2026-01")
        assert result is not None
        idx_val, meta = result
        assert isinstance(idx_val, float)
        assert 50.0 <= idx_val <= 300.0
        assert "contributions" in meta
        assert len(meta["contributions"]) > 0
    finally:
        db.close()

@pytest.mark.asyncio
async def test_index_endpoints(client: httpx.AsyncClient):
    res = await client.get("/api/index/current")
    assert res.status_code == 200
    data = res.json()
    assert "current_index" in data
    assert "daily_change_pct" in data
    assert data["is_demo"] is True

    daily_res = await client.get("/api/index/daily")
    assert daily_res.status_code == 200
    assert "points" in daily_res.json()

    weekly_res = await client.get("/api/index/weekly")
    assert weekly_res.status_code == 200

    monthly_res = await client.get("/api/index/monthly")
    assert monthly_res.status_code == 200

@pytest.mark.asyncio
async def test_route_and_airline_analytics(client: httpx.AsyncClient):
    routes_res = await client.get("/api/routes")
    assert routes_res.status_code == 200
    routes = routes_res.json()
    assert len(routes) > 0

    route_code = routes[0]["route_code"]
    price_res = await client.get(f"/api/routes/{route_code}/prices")
    assert price_res.status_code == 200
    assert "average_fare" in price_res.json()
    assert "volatility" in price_res.json()

    airlines_res = await client.get("/api/airlines")
    assert airlines_res.status_code == 200
    airlines = airlines_res.json()
    assert any(a["airline"] == "IndiGo" for a in airlines)

@pytest.mark.asyncio
async def test_booking_windows_and_heatmap(client: httpx.AsyncClient):
    bw_res = await client.get("/api/booking-windows")
    assert bw_res.status_code == 200
    windows = bw_res.json()
    assert len(windows) == 5
    assert [w["window"] for w in windows] == ["T+1", "T+7", "T+15", "T+30", "T+45"]

    t1 = next(w for w in windows if w["window"] == "T+1")
    t45 = next(w for w in windows if w["window"] == "T+45")
    assert t1["average_fare"] > t45["average_fare"]

    heatmap_res = await client.get("/api/heatmap")
    assert heatmap_res.status_code == 200
    assert len(heatmap_res.json()) > 0

@pytest.mark.asyncio
async def test_backtesting_and_data_quality(client: httpx.AsyncClient):
    bt_res = await client.get("/api/backtesting?days=30")
    assert bt_res.status_code == 200
    bt = bt_res.json()
    assert "mae" in bt["metrics"]
    assert "rmse" in bt["metrics"]
    assert "correlation" in bt["metrics"]
    assert "disclaimer" in bt

    dq_res = await client.get("/api/data-quality")
    assert dq_res.status_code == 200
    assert "validity_rate_pct" in dq_res.json()["summary"]

def test_scraper_adapters_and_validation():
    adapter = DemoAirfareAdapter()
    assert adapter.validate({"origin": "DEL", "destination": "BOM", "travel_date": date.today(), "airline": "IndiGo", "total_fare": 4500, "booking_window": "T+7"}) is True
    assert adapter.validate({"origin": "DEL", "destination": "BOM", "travel_date": date.today(), "airline": "IndiGo", "total_fare": 50, "booking_window": "T+7"}) is False
