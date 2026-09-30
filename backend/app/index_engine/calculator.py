import json
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.route import Route
from app.models.observation import FareObservation
from app.models.index_value import IndexValue

class IndexEngine:
    """
    AirIndex India Statistical Engine
    Implements Laspeyres-type weighted formula:
    APIx(t) = SUM( Wi * (Pi,t / Pi,base) ) * 100
    """

    @classmethod
    def calculate_for_date(cls, db: Session, target_date: date, base_period: str = "2026-01") -> Optional[Tuple[float, Dict]]:
        # Fetch active routes from SQL database
        active_routes: List[Route] = db.query(Route).filter(Route.active == True).all()
        if not active_routes:
            return None

        total_declared_weight = sum(r.weight for r in active_routes)
        if total_declared_weight <= 0:
            total_declared_weight = 1.0

        route_contributions = []
        weighted_sum = 0.0
        used_weight_sum = 0.0

        for r in active_routes:
            # Normalized weight
            norm_weight = r.weight / total_declared_weight

            # Representative fare for route r on target_date
            # We take the median / average total_fare of Economy flights
            fares_query = db.query(FareObservation.total_fare).filter(
                FareObservation.origin == r.origin,
                FareObservation.destination == r.destination,
                FareObservation.travel_date == target_date,
                FareObservation.total_fare > 500  # filter anomalies
            ).all()

            if fares_query:
                fare_list = [f[0] for f in fares_query]
                fare_list.sort()
                n = len(fare_list)
                if n % 2 == 1:
                    rep_fare = fare_list[n // 2]
                else:
                    rep_fare = (fare_list[n // 2 - 1] + fare_list[n // 2]) / 2.0
            else:
                # If no direct observations for that date, fall back to base fare (price ratio 1.0)
                rep_fare = r.base_fare

            base_fare = r.base_fare if r.base_fare > 0 else 4500.0
            price_ratio = rep_fare / base_fare
            route_sub_index = price_ratio * 100.0
            contribution = norm_weight * price_ratio * 100.0

            weighted_sum += contribution
            used_weight_sum += norm_weight

            route_contributions.append({
                "route_code": r.route_code,
                "origin": r.origin,
                "destination": r.destination,
                "weight": round(norm_weight, 4),
                "base_fare": round(base_fare, 2),
                "rep_fare": round(rep_fare, 2),
                "price_ratio": round(price_ratio, 4),
                "sub_index": round(route_sub_index, 2),
                "contribution": round(contribution, 2)
            })

        final_index = round(weighted_sum, 2)
        metadata = {
            "target_date": target_date.isoformat(),
            "base_period": base_period,
            "calculated_at": datetime.utcnow().isoformat(),
            "routes_count": len(active_routes),
            "contributions": route_contributions
        }

        return final_index, metadata

    @classmethod
    def recompute_and_store_daily(cls, db: Session, target_date: date, base_period: str = "2026-01") -> IndexValue:
        result = cls.calculate_for_date(db, target_date, base_period)
        if not result:
            final_index = 100.0
            meta = {}
        else:
            final_index, meta = result

        existing = db.query(IndexValue).filter(
            IndexValue.date == target_date,
            IndexValue.frequency == "DAILY"
        ).first()

        if existing:
            existing.index_value = final_index
            existing.base_period = base_period
            existing.calculation_metadata = json.dumps(meta)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            new_record = IndexValue(
                date=target_date,
                frequency="DAILY",
                index_value=final_index,
                base_period=base_period,
                calculation_metadata=json.dumps(meta)
            )
            db.add(new_record)
            db.commit()
            db.refresh(new_record)
            return new_record

    @classmethod
    def recompute_all(cls, db: Session, start_date: date, end_date: date, base_period: str = "2026-01"):
        curr = start_date
        while curr <= end_date:
            cls.recompute_and_store_daily(db, curr, base_period)
            curr += timedelta(days=1)

        # Also compute WEEKLY and MONTHLY rolling averages
        daily_records = db.query(IndexValue).filter(
            IndexValue.frequency == "DAILY",
            IndexValue.date >= start_date,
            IndexValue.date <= end_date
        ).order_by(IndexValue.date.asc()).all()

        daily_map = {r.date: r.index_value for r in daily_records}

        curr = start_date
        while curr <= end_date:
            # 7-day rolling for weekly
            w_vals = [daily_map[curr - timedelta(days=i)] for i in range(7) if (curr - timedelta(days=i)) in daily_map]
            if w_vals:
                w_avg = round(sum(w_vals) / len(w_vals), 2)
                existing_w = db.query(IndexValue).filter(IndexValue.date == curr, IndexValue.frequency == "WEEKLY").first()
                if existing_w:
                    existing_w.index_value = w_avg
                else:
                    db.add(IndexValue(date=curr, frequency="WEEKLY", index_value=w_avg, base_period=base_period))

            # 30-day rolling for monthly
            m_vals = [daily_map[curr - timedelta(days=i)] for i in range(30) if (curr - timedelta(days=i)) in daily_map]
            if m_vals:
                m_avg = round(sum(m_vals) / len(m_vals), 2)
                existing_m = db.query(IndexValue).filter(IndexValue.date == curr, IndexValue.frequency == "MONTHLY").first()
                if existing_m:
                    existing_m.index_value = m_avg
                else:
                    db.add(IndexValue(date=curr, frequency="MONTHLY", index_value=m_avg, base_period=base_period))

            curr += timedelta(days=1)

        db.commit()
