import React from 'react';
import { Calculator, CheckCircle2, Filter, Layers, Database, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5 text-indigo-600" />
          <span>Econometric Methodology</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Laspeyres Weighted Airfare Price Index Formula
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          Mathematical formulation, advance booking window stratification, statistical outlier trimming, and SQL-backed weighting system.
        </p>
      </div>

      {/* Primary Mathematical Formula */}
      <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Core Index Calculation</span>
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">Base Period: 2026-01 = 100.0</span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
          <div className="font-mono text-2xl sm:text-3xl font-black text-sky-400 tracking-wide">
            API(t) = &Sigma; [ W<sub>i</sub> &times; ( P<sub>i,t</sub> / P<sub>i,base</sub> ) ] &times; 100
          </div>
          <p className="text-xs text-slate-400 mt-3">Where &Sigma; W<sub>i</sub> = 1.0 (Sum of all active route weights)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="font-bold text-sky-400 font-mono text-sm">W<sub>i</sub></span>
            <p className="font-semibold text-white mt-1">Route Passenger Weight</p>
            <p className="text-slate-400 mt-1">Proportion of national passenger traffic for route <em>i</em> stored in SQL database.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="font-bold text-emerald-400 font-mono text-sm">P<sub>i,t</sub></span>
            <p className="font-semibold text-white mt-1">Representative Fare at t</p>
            <p className="text-slate-400 mt-1">Trimmed median/mean airfare across airlines and booking windows on day <em>t</em>.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
            <span className="font-bold text-amber-400 font-mono text-sm">P<sub>i,base</sub></span>
            <p className="font-semibold text-white mt-1">Base Period Fare</p>
            <p className="text-slate-400 mt-1">Benchmark baseline average fare established in base period (January 2026).</p>
          </div>
        </div>
      </section>

      {/* Advance Booking Window Stratification */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">5-Tier Booking Window Stratification</h2>
            <p className="text-xs text-slate-500">Preventing horizon-mixing bias in time series airfare analysis</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Because airfares vary predictably as flight departure approaches, raw collection without horizon classification creates spurious volatility if sample mixes change. AirIndex India partitions all collections into five advance horizons:
        </p>

        <div className="space-y-3">
          {[
            { tag: 'T+1', name: 'Emergency / Last Minute (1 Day Lead)', desc: 'Captures highest yield pricing, business travel necessity, and dynamic surge pricing.' },
            { tag: 'T+7', name: 'Short Horizon (7 Days Lead)', desc: 'Near-term travel reflecting weekly seat inventory adjustments and peak weekend surges.' },
            { tag: 'T+15', name: 'Standard Medium Horizon (15 Days Lead)', desc: 'The bellwether window reflecting normalized domestic leisure and corporate advance bookings.' },
            { tag: 'T+30', name: 'Planned Horizon (30 Days Lead)', desc: 'Low-fare availability window reflecting airline baseline load-factor filling strategies.' },
            { tag: 'T+45', name: 'Early Bird Horizon (45 Days Lead)', desc: 'Benchmark promotional base pricing across major capacity routes.' },
          ].map((item) => (
            <div key={item.tag} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-sky-600 text-white">{item.tag}</span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Cleaning & Quality Pipeline */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Data Cleansing & Statistical Outlier Trimming</h2>
            <p className="text-xs text-slate-500">Ensuring integrity and robustness against web scraping anomalies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-bold text-slate-800">1. Deduplication</span>
            <p className="text-slate-600">
              Multiple queries within a 4-hour window for identical flight numbers, dates, and fare classes are deduplicated to prevent sampling bias.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-bold text-slate-800">2. IQR Outlier Trimming</span>
            <p className="text-slate-600">
              Fares exceeding 3.5 &times; median (erroneous business class mappings) or below 0.35 &times; median (scraping failures) are flagged and isolated.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="font-bold text-slate-800">3. Relational Verification</span>
            <p className="text-slate-600">
              Every fare satisfies <span className="font-mono text-slate-700">Total Fare = Base Fare + Taxes + Fees</span>. Invalid sums are logged to Data Quality.
            </p>
          </div>
        </div>
      </section>

      <div className="text-center pt-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
        >
          <span>View Live Index Application</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
