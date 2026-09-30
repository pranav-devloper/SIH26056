from datetime import datetime, date, timedelta
import random
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, Base, engine
from app.models.user import User
from app.models.airline import Airline
from app.models.route import Route
from app.models.source import Source
from app.models.observation import FareObservation
from app.models.data_quality import DataQuality
from app.auth.security import get_password_hash
from app.scrapers.adapters import DemoAirfareAdapter
from app.index_engine.calculator import IndexEngine

def seed_database(db: Session = None, days_back: int = 35):
    own_session = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        own_session = True

    try:
        # 1. Seed Users
        users_to_seed = [
            {
                "name": "Statistical Administrator",
                "email": "admin@airindex.in",
                "password": get_password_hash("Admin@12345"),
                "role": "Admin",
                "email_verified": True,
                "auth_provider": "email",
                "is_active": True
            },
            {
                "name": "Senior Aviation Analyst",
                "email": "analyst@airindex.in",
                "password": get_password_hash("Analyst@12345"),
                "role": "Analyst",
                "email_verified": True,
                "auth_provider": "email",
                "is_active": True
            },
            {
                "name": "Public Viewer",
                "email": "viewer@airindex.in",
                "password": get_password_hash("Viewer@12345"),
                "role": "Viewer",
                "email_verified": True,
                "auth_provider": "email",
                "is_active": True
            },
        ]

        for u in users_to_seed:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_u = User(
                    name=u["name"],
                    email=u["email"],
                    password_hash=u["password"],
                    role=u["role"],
                    email_verified=u["email_verified"],
                    auth_provider=u["auth_provider"],
                    is_active=u["is_active"]
                )
                db.add(new_u)
        db.commit()

        # 2. Seed Airlines
        airlines_to_seed = [
            {"name": "IndiGo", "code": "6E", "active": True},
            {"name": "Air India", "code": "AI", "active": True},
            {"name": "Air India Express", "code": "IX", "active": True},
            {"name": "Akasa Air", "code": "QP", "active": True},
            {"name": "SpiceJet", "code": "SG", "active": True},
        ]
        for a in airlines_to_seed:
            if not db.query(Airline).filter(Airline.code == a["code"]).first():
                db.add(Airline(**a))
        db.commit()

        # 3. Seed Sources
        sources_to_seed = [
            {"name": "IndiGo Direct Feed", "type": "AIRLINE_DIRECT", "status": "ACTIVE", "rate_limit": "60 req/min"},
            {"name": "Air India Official API", "type": "AIRLINE_DIRECT", "status": "ACTIVE", "rate_limit": "45 req/min"},
            {"name": "Air India Express Portal", "type": "AIRLINE_DIRECT", "status": "ACTIVE", "rate_limit": "45 req/min"},
            {"name": "Akasa Air Tariff Feed", "type": "AIRLINE_DIRECT", "status": "ACTIVE", "rate_limit": "60 req/min"},
            {"name": "SpiceJet Domestic Channel", "type": "AIRLINE_DIRECT", "status": "ACTIVE", "rate_limit": "30 req/min"},
            {"name": "MakeMyTrip Partner API", "type": "OTA", "status": "ACTIVE", "rate_limit": "120 req/min"},
            {"name": "EaseMyTrip Public Gateway", "type": "OTA", "status": "ACTIVE", "rate_limit": "90 req/min"},
            {"name": "Cleartrip Statistical Stream", "type": "OTA", "status": "ACTIVE", "rate_limit": "60 req/min"},
        ]
        for s in sources_to_seed:
            if not db.query(Source).filter(Source.name == s["name"]).first():
                db.add(Source(**s, enabled=True, last_run=datetime.utcnow() - timedelta(minutes=random.randint(10, 180))))
        db.commit()

        # 4. Seed Routes with weights (Total normalized to 1.0)
        routes_to_seed = [
            {"origin": "DEL", "destination": "BOM", "route_code": "DEL-BOM", "weight": 0.16, "base_fare": 4800.0},
            {"origin": "DEL", "destination": "BLR", "route_code": "DEL-BLR", "weight": 0.13, "base_fare": 5400.0},
            {"origin": "BOM", "destination": "BLR", "route_code": "BOM-BLR", "weight": 0.10, "base_fare": 3600.0},
            {"origin": "DEL", "destination": "CCU", "route_code": "DEL-CCU", "weight": 0.09, "base_fare": 4700.0},
            {"origin": "BLR", "destination": "HYD", "route_code": "BLR-HYD", "weight": 0.08, "base_fare": 2900.0},
            {"origin": "MAA", "destination": "DEL", "route_code": "MAA-DEL", "weight": 0.07, "base_fare": 5100.0},
            {"origin": "DEL", "destination": "HYD", "route_code": "DEL-HYD", "weight": 0.07, "base_fare": 4200.0},
            {"origin": "BOM", "destination": "DEL", "route_code": "BOM-DEL", "weight": 0.07, "base_fare": 4800.0},
            {"origin": "BLR", "destination": "MAA", "route_code": "BLR-MAA", "weight": 0.06, "base_fare": 2200.0},
            {"origin": "HYD", "destination": "DEL", "route_code": "HYD-DEL", "weight": 0.06, "base_fare": 4200.0},
            {"origin": "BOM", "destination": "CCU", "route_code": "BOM-CCU", "weight": 0.05, "base_fare": 5600.0},
            {"origin": "BOM", "destination": "GOI", "route_code": "BOM-GOI", "weight": 0.06, "base_fare": 2800.0},
        ]
        for r in routes_to_seed:
            if not db.query(Route).filter(Route.route_code == r["route_code"]).first():
                db.add(Route(**r, base_date=date(2026, 1, 1), active=True))
        db.commit()

        # 5. Check if observations exist, if not seed historical observations
        existing_obs_count = db.query(FareObservation).count()
        if existing_obs_count < 1000:
            print(f"Generating synthetic domestic airfare data for {days_back} days...")
            demo_adapter = DemoAirfareAdapter()
            active_routes = db.query(Route).filter(Route.active == True).all()

            today = date.today()
            start_date = today - timedelta(days=days_back)

            observations_batch = []
            booking_windows = ["T+1", "T+7", "T+15", "T+30", "T+45"]

            curr_date = start_date
            while curr_date <= today:
                # Add data quality metrics for this date
                dq = db.query(DataQuality).filter(DataQuality.date == curr_date).first()
                if not dq:
                    dq = DataQuality(
                        date=curr_date,
                        total_records=0,
                        valid_records=0,
                        duplicates=random.randint(0, 4),
                        missing_values=random.randint(0, 2),
                        outliers=random.randint(0, 3),
                        sold_out_flights=random.randint(2, 12),
                        parser_errors=0
                    )
                    db.add(dq)

                day_records = 0
                for r in active_routes:
                    for bw in booking_windows:
                        # Raw fetch & normalize
                        raw_flights = demo_adapter.fetch(r.origin, r.destination, curr_date)
                        for it in raw_flights:
                            it["booking_window"] = bw
                        norm_flights = demo_adapter.normalize(raw_flights)

                        for f in norm_flights:
                            obs = FareObservation(
                                collection_timestamp=f["collection_timestamp"] - timedelta(days=(today - curr_date).days),
                                travel_date=f["travel_date"],
                                origin=f["origin"],
                                destination=f["destination"],
                                airline=f["airline"],
                                source="DEMO / SYNTHETIC DATA",
                                flight_number=f["flight_number"],
                                fare_class="Economy",
                                booking_window=f["booking_window"],
                                base_fare=f["base_fare"],
                                taxes=f["taxes"],
                                fees=f["fees"],
                                total_fare=f["total_fare"],
                                availability=f["availability"],
                                is_synthetic=True
                            )
                            observations_batch.append(obs)
                            day_records += 1

                dq.total_records = day_records + dq.duplicates + dq.missing_values
                dq.valid_records = day_records

                # Commit in chunks to avoid memory pressure
                if len(observations_batch) >= 2000:
                    db.bulk_save_objects(observations_batch)
                    db.commit()
                    observations_batch = []

                curr_date += timedelta(days=1)

            if observations_batch:
                db.bulk_save_objects(observations_batch)
                db.commit()

            print(f"Historical observations generated. Calculating Index values...")
            # Compute index values for all generated dates
            IndexEngine.recompute_all(db, start_date, today, base_period="2026-01")
            print("Database initialization and indexing successfully finished!")

    finally:
        if own_session:
            db.close()

if __name__ == "__main__":
    seed_database()
