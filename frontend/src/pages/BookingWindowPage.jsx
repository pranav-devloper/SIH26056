import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Layers, Info, Filter } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { bookingWindowApi, routeApi } from '../services/api';

export default function BookingWindowPage() {
  const [windows, setWindows] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    routeApi.getRoutes(true)
      .then((res) => setRoutes(res.data))
      .catch((e) => console.log(e));
  }, []);

  const loadWindows = (routeCode) => {
    setLoading(true);
    bookingWindowApi.getBookingWindows(routeCode || undefined)
      .then((res) => setWindows(res.data))
      .catch((e) => console.error('Booking window load error:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWindows(selectedRoute);
  }, [selectedRoute]);

  const chartData = windows.map((w) => ({
    name: `${w.window} (${w.lead_days}d)`,
    window: w.window,
    leadDays: w.lead_days,
    average: Math.round(w.average_fare),
    median: Math.round(w.median_fare),
    min: Math.round(w.min_fare),
    max: Math.round(w.max_fare),
    observations: w.observations,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Advance Booking Window Analysis</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal yield curves: Measuring airfare price escalation from 45 days prior down to departure morning (T+1)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Filter Route:</span>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <option value="">All Corridors Aggregate</option>
            {routes.map((r) => (
              <option key={r.route_code} value={r.route_code}>
                {r.origin} &rarr; {r.destination} ({r.route_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Booking Window Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {windows.map((w) => (
          <div key={w.window} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                {w.window}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{w.lead_days}d Lead</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium">Average Fare</span>
              <p className="text-xl font-black text-slate-900">₹{Math.round(w.average_fare).toLocaleString()}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
              <span>Spread:</span>
              <span className="font-semibold text-slate-700">₹{Math.round(w.min_fare).toLocaleString()} - ₹{Math.round(w.max_fare).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Yield Surge Curve */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Advance Booking Surge Curve</h3>
            <p className="text-xs text-slate-500">Airfare trajectory as departure date approaches</p>
          </div>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-medium text-slate-600">
            {selectedRoute ? `Route: ${selectedRoute}` : 'National Aggregate'}
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(val, name) => [`₹${val.toLocaleString()}`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="average" name="Average Fare (₹)" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="median" name="Median Fare (₹)" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="min" name="Minimum Fare Floor" stroke="#10b981" strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stratification Explanation */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Methodological Significance of Lead Time Stratification</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <p>
            Standard price indexing models often fail when applied to airline tickets because a single seat class varies by up to 200% purely due to advance booking time. A flight booked at <strong>T+1</strong> captures business urgency pricing, while <strong>T+45</strong> captures advance promotional discounting.
          </p>
          <p>
            By sampling distinct buckets (T+1, T+7, T+15, T+30, T+45) independently, AirIndex India prevents false inflation signals caused by variations in sample timing, providing clean macroeconomic insight into structural fare changes.
          </p>
        </div>
      </div>
    </div>
  );
}
