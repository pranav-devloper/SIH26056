import React, { useState, useEffect } from 'react';
import { Plane, BarChart3, TrendingUp, ShieldCheck, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { airlineApi } from '../services/api';

export default function AirlineAnalyticsPage() {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    airlineApi.getAirlines()
      .then((res) => setAirlines(res.data))
      .catch((e) => console.error('Airline stats load error:', e))
      .finally(() => setLoading(false));
  }, []);

  const chartData = airlines.map((a) => ({
    name: a.airline,
    code: a.code,
    average: Math.round(a.average_fare),
    median: Math.round(a.median_fare),
    volatility: a.volatility,
    coverage: a.route_coverage,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-sky-600 -rotate-45" />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Domestic Carrier Analytics</h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Empirical pricing benchmarks, network coverage, and statistical price dispersion across Indian airlines
        </p>
      </div>

      {/* Main Airline Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {airlines.map((a) => (
          <div key={a.code} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">{a.airline}</span>
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{a.code}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium">Avg Fare</span>
              <p className="text-xl font-black text-slate-900">₹{Math.round(a.average_fare).toLocaleString()}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block text-[9px]">Coverage</span>
                <span className="font-bold text-sky-700">{a.route_coverage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">Volatility</span>
                <span className="font-bold text-slate-800">{a.volatility}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Chart: Average vs Median Fares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Average vs Median Airfares</h3>
            <p className="text-xs text-slate-500">Comparing mean price points and central tendencies across carriers</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name) => [`₹${val.toLocaleString()}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="average" name="Average Fare (₹)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="median" name="Median Fare (₹)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volatility & Coverage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Price Dispersion & Network Coverage</h3>
            <p className="text-xs text-slate-500">Standard deviation percentage (volatility) and domestic route coverage</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name) => [`${val}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="coverage" name="Route Coverage (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="volatility" name="Price Volatility (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Factual Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Carrier Benchmark Statistics Table</h2>
          <p className="text-xs text-slate-500">Summary statistics from relational observation database</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5">Airline</th>
                <th className="py-2.5">Code</th>
                <th className="py-2.5">Average Fare</th>
                <th className="py-2.5">Median Fare</th>
                <th className="py-2.5">Observations</th>
                <th className="py-2.5">Availability</th>
                <th className="py-2.5">Route Coverage</th>
                <th className="py-2.5">Volatility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {airlines.map((a) => (
                <tr key={a.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-bold text-slate-900">{a.airline}</td>
                  <td className="py-2.5 font-mono text-slate-600">{a.code}</td>
                  <td className="py-2.5 font-extrabold text-slate-900">₹{Math.round(a.average_fare).toLocaleString()}</td>
                  <td className="py-2.5 text-slate-700">₹{Math.round(a.median_fare).toLocaleString()}</td>
                  <td className="py-2.5 font-mono text-slate-600">{a.observations.toLocaleString()}</td>
                  <td className="py-2.5 font-semibold text-emerald-600">{a.availability_rate}%</td>
                  <td className="py-2.5 font-semibold text-sky-700">{a.route_coverage}%</td>
                  <td className="py-2.5 font-semibold text-slate-800">{a.volatility}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
