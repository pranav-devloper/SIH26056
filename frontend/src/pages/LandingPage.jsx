import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Plane,
  ShieldCheck,
  Calendar,
  Database,
  Search,
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';
import { indexApi } from '../services/api';

export default function LandingPage() {
  const [indexData, setIndexData] = useState({
    current_index: 118.42,
    daily_change_pct: 2.4,
    weekly_change_pct: 3.8,
    monthly_change_pct: 6.8,
    total_observations: 125480,
    active_routes: 12,
    active_sources: 8,
    base_period: '2026-01',
  });

  useEffect(() => {
    indexApi.getCurrent()
      .then((res) => setIndexData(res.data))
      .catch((err) => console.log('Index fetch note:', err));
  }, []);

  return (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              <span>National Aviation Statistical Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Real-Time Airfare <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
                Price Index for India
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              An empirical, SQL-relational platform that automates responsible data collection across permitted Indian airlines and travel aggregators. Stratified across 5 advance-booking windows from <strong>T+1 to T+45</strong> days.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/methodology"
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold text-sm transition-all"
              >
                Explore Methodology
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-slate-700">
              <div>
                <p className="text-2xl font-black text-slate-900">{indexData.total_observations.toLocaleString()}+</p>
                <p className="text-xs text-slate-500 font-medium">Observations Ingested</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{indexData.active_routes} Key Routes</p>
                <p className="text-xs text-slate-500 font-medium">Weighted Corridors</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">SQL Only</p>
                <p className="text-xs text-slate-500 font-medium">PostgreSQL / SQLite</p>
              </div>
            </div>
          </div>

          {/* Real-time Ticker Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-sky-400 -rotate-45" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Composite Price Index</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    Base {indexData.base_period} = 100.0
                  </span>
                </div>

                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-5xl font-black tracking-tight">{indexData.current_index.toFixed(2)}</span>
                  <div className="flex items-center text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{indexData.daily_change_pct}% Daily
                  </div>
                </div>
                <p className="text-xs text-slate-400">Laspeyres weighted domestic airfare aggregation</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Weekly Change</p>
                    <p className="text-lg font-bold text-slate-900">+{indexData.weekly_change_pct}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Monthly Change</p>
                    <p className="text-lg font-bold text-slate-900">+{indexData.monthly_change_pct}%</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between py-1">
                    <span>Advance Booking Windows</span>
                    <span className="font-semibold text-slate-900">T+1, T+7, T+15, T+30, T+45</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Permitted Sources</span>
                    <span className="font-semibold text-slate-900">IndiGo, Air India, Akasa, OTAs</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Data Storage Architecture</span>
                    <span className="font-semibold text-slate-900">PostgreSQL (Zero NoSQL)</span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Launch Analytics Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Highlights */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Key Architectural Capabilities</h2>
            <p className="text-sm text-slate-600 mt-2">
              Designed from first principles to meet rigorous government and statistical research standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Laspeyres Weighted Index</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applies the official index formula: <span className="font-mono text-slate-800 font-semibold">API = Σ(Wi × Pi,t / Pi,base) × 100</span> with database-managed route passenger weights, tracking true inflation rather than raw averages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">5 Advance-Booking Windows</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Separates urgent last-minute fares from planned leisure bookings: T+1 (tomorrow), T+7 (next week), T+15 (fortnight), T+30 (month ahead), and T+45 (advance discount baseline).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Strict SQL Persistence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Built strictly with SQLAlchemy and PostgreSQL. Zero MongoDB, zero Redis database, zero unstructured NoSQL schemas. Clean relational normalization for auditability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advance Booking Window Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Market Microstructure</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Why Advance Booking Stratification Matters
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              In dynamic airline revenue management systems, a single route fluctuates by up to 280% between departure morning and 45 days prior. AirIndex India eliminates booking horizon distortion by measuring independent price baskets.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8 pt-8 border-t border-slate-800">
            {[
              { window: 'T+1', days: '1 Day Ahead', label: 'Last Minute Spike', fare: '₹7,850', color: 'text-rose-400' },
              { window: 'T+7', days: '7 Days Ahead', label: 'Short Horizon', fare: '₹5,620', color: 'text-amber-400' },
              { window: 'T+15', days: '15 Days Ahead', label: 'Mid-Range Standard', fare: '₹4,450', color: 'text-sky-400' },
              { window: 'T+30', days: '30 Days Ahead', label: 'Planned Travel', fare: '₹3,890', color: 'text-emerald-400' },
              { window: 'T+45', days: '45 Days Ahead', label: 'Early Bird Floor', fare: '₹3,340', color: 'text-indigo-400' },
            ].map((item) => (
              <div key={item.window} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="text-xs font-bold text-slate-400">{item.window}</span>
                <p className={`text-xl font-black mt-1 ${item.color}`}>{item.fare}</p>
                <p className="text-[11px] text-slate-300 font-medium mt-1">{item.days}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
