import React from 'react';
import { Plane, ShieldCheck, Database, Server, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
          <Plane className="w-3.5 h-3.5 text-sky-600" />
          <span>About AirIndex India</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Aviation Price Intelligence & Statistical Monitoring
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          An automated analytical system tracking domestic airfares across key Indian aviation corridors using modern econometric and data engineering standards.
        </p>
      </div>

      {/* Mission & Problem Statement */}
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Problem Statement & Objective</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Indian domestic civil aviation has experienced exponential passenger growth, driven by rapid urbanization and regional connectivity (UDAN). However, dynamic revenue management algorithms cause extreme intraday and horizon-dependent price volatility.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          AirIndex India addresses this informational asymmetry by constructing a reproducible, automated, and tamper-evident Airfare Price Index. The platform scrapes permitted data sources, cleans and normalizes observations, removes statistical outliers, and calculates weighted Laspeyres indices across defined advance-booking windows (T+1 to T+45).
        </p>
      </section>

      {/* Technology Stack & Compliance */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">SQL-Only Architecture</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform strictly stores all transactional observations, user records, OTP tokens, and index histories in an SQL relational database (PostgreSQL with SQLite support for development). No NoSQL (MongoDB, Firestore) or Redis database is required, guaranteeing ACID compliance and strict schema enforcement.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Responsible Data Collection</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Collection adheres to strict ethical data gathering protocols: rate limiting, request throttling, exponential backoff, and adherence to robots.txt guidelines. The system never bypasses security controls or CAPTCHA mechanisms and incorporates a verified synthetic fallback adapter when sources are offline.
          </p>
        </div>
      </section>

      {/* Official Disclaimer */}
      <section className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Non-Affiliation Notice & Statistical Disclaimer</span>
        </div>
        <p className="text-xs leading-relaxed text-amber-800">
          AirIndex India is an independent research platform and statistical intelligence benchmark. It does <strong>not</strong> represent or substitute the official Consumer Price Index (CPI) or Wholesale Price Index (WPI) released by the Ministry of Statistics and Programme Implementation (MoSPI) or the Directorate General of Civil Aviation (DGCA). Synthetic test observations are labeled clearly as <code>DEMO DATA</code>.
        </p>
      </section>
    </div>
  );
}
