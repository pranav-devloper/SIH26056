import React, { useState, useEffect } from 'react';
import {
  Plane,
  TrendingUp,
  Activity,
  DollarSign,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { routeApi, bookingWindowApi } from '../services/api';

export default function RouteAnalyticsPage() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM');
  const [priceStats, setPriceStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [windowData, setWindowData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all routes on mount
  useEffect(() => {
    routeApi.getRoutes(true)
      .then((res) => {
        setRoutes(res.data);
        if (res.data.length > 0) {
          setSelectedRoute(res.data[0].route_code);
        }
      })
      .catch((e) => console.error('Routes load error:', e));
  }, []);

  // When selected route changes, load stats, trend, and windows
  useEffect(() => {
    if (!selectedRoute) return;
    setLoading(true);

    Promise.all([
      routeApi.getPrices(selectedRoute),
      routeApi.getTrend(selectedRoute, 30),
      bookingWindowApi.getBookingWindows(selectedRoute),
    ])
      .then(([priceRes, trendRes, bwRes]) => {
        setPriceStats(priceRes.data);
        const pts = trendRes.data.points.map((p) => ({
          date: p.date.substring(5),
          fullDate: p.date,
          avg: p.avg_fare,
          min: p.min_fare,
          max: p.max_fare,
          base: p.base_fare,
          taxes: p.taxes,
        }));
        setTrendData(pts);
        setWindowData(bwRes.data);
      })
      .catch((e) => console.error('Route stats error:', e))
      .finally(() => setLoading(false));
  }, [selectedRoute]);

  return (
    <div className="space-y-6">
      {/* Route Selector Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-600 -rotate-45" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Route-Wise Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Micro-level airfare distributions, advance pricing tiers, and tax structures
          </p>
        </div>

        {/* Route Dropdown Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Select Corridor:</span>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {routes.map((r) => (
              <option key={r.route_code} value={r.route_code}>
                {r.origin} &rarr; {r.destination} ({r.route_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Fare</span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{Math.round(priceStats?.average_fare || 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across all dates</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Median Fare</span>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{Math.round(priceStats?.median_fare || 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">50th percentile</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Fare Floor</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{Math.round(priceStats?.min_fare || 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Promotional base</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Fare Ceiling</span>
          <p className="text-2xl font-black text-rose-600 mt-1">₹{Math.round(priceStats?.max_fare || 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Peak surge price</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volatility Index</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{priceStats?.volatility || 12.5}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Coefficient of var</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Availability</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{priceStats?.availability_rate || 94.5}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Seat inventory rate</p>
        </div>
      </div>

      {/* Main Fare Trend Chart with Min/Max Bounds */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">{selectedRoute} 30-Day Fare Progression</h2>
          <p className="text-xs text-slate-500">Average, minimum floor, and maximum surge bounds</p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="fareGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val, name) => [`₹${Math.round(val).toLocaleString()}`, name.toUpperCase()]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="avg" name="Average Fare" stroke="#0284c7" strokeWidth={2.5} fill="url(#fareGrad)" />
              <Line type="monotone" dataKey="min" name="Min Fare" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="max" name="Max Fare" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column: Base Fare vs Taxes & Booking Window Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Fare vs Taxes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Fare Component Breakdown</h3>
            <p className="text-xs text-slate-500">Base fare vs taxes & regulatory airport fees (UDF/PSF)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData.slice(-10)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name) => [`₹${Math.round(val).toLocaleString()}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="base" name="Base Airline Fare" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
                <Bar dataKey="taxes" name="Taxes & Surcharges" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Window Profile for Selected Route */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Advance Booking Windows for {selectedRoute}</h3>
            <p className="text-xs text-slate-500">Lead time curve showing dynamic pricing escalation</p>
          </div>

          <div className="space-y-2.5">
            {windowData.map((w) => (
              <div key={w.window} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    {w.window}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{w.lead_days} Days Lead</span>
                    <span className="text-[10px] text-slate-400 block">{w.observations} observations</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 block text-sm">₹{Math.round(w.average_fare).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">Spread: ₹{Math.round(w.min_fare).toLocaleString()} - ₹{Math.round(w.max_fare).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
