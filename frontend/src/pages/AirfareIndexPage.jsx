import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Calculator,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
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
import { indexApi, routeApi, heatmapApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AirfareIndexPage() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(null);
  const [frequency, setFrequency] = useState('DAILY');
  const [trendData, setTrendData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [curRes, hmRes] = await Promise.all([
        indexApi.getCurrent(),
        heatmapApi.getHeatmap(),
      ]);
      setCurrentIndex(curRes.data);
      setHeatmapData(hmRes.data);
      await fetchTrend(frequency);
    } catch (e) {
      console.error('AirfareIndex page load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async (freq) => {
    try {
      let res;
      if (freq === 'DAILY') res = await indexApi.getDaily(45);
      else if (freq === 'WEEKLY') res = await indexApi.getWeekly(20);
      else res = await indexApi.getMonthly(12);

      const pts = res.data.points.map((p) => ({
        date: p.date,
        shortDate: p.date.substring(5),
        index: p.index_value,
      }));
      setTrendData(pts);
    } catch (err) {
      console.error('Index series load error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFrequency = async (f) => {
    setFrequency(f);
    await fetchTrend(f);
  };

  const handleRecalculate = async () => {
    if (user?.role !== 'Admin') {
      setStatusMsg('Only users with Admin role can trigger index recalculation.');
      return;
    }
    setRecalculating(true);
    setStatusMsg('');
    try {
      const res = await indexApi.recalculate(35);
      setStatusMsg(res.data?.message || 'Recalculation successful.');
      await loadData();
    } catch (e) {
      setStatusMsg('Error during recalculation.');
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Airfare Price Index Explorer</h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">APIx</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula: API(t) = &Sigma; [ W<sub>i</sub> &times; ( P<sub>i,t</sub> / P<sub>i,base</sub> ) ] &times; 100
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'Admin' && (
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              <span>{recalculating ? 'Recalculating...' : 'Recalculate All'}</span>
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-xs text-sky-800 rounded-xl">
          {statusMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Index</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{currentIndex?.current_index?.toFixed(2) || '118.42'}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+{currentIndex?.daily_change_pct}% Daily Shift</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Base Period</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{currentIndex?.base_period || '2026-01'}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Normalized Benchmark = 100.0</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">7-Day Change</span>
          <p className="text-2xl font-black text-slate-900 mt-1">+{currentIndex?.weekly_change_pct || 3.8}%</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Weekly Rolling Shift</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">30-Day Change</span>
          <p className="text-2xl font-black text-slate-900 mt-1">+{currentIndex?.monthly_change_pct || 6.8}%</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Monthly Horizon Trend</p>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Historical Index Trajectory</h2>
            <p className="text-xs text-slate-500">Tracking aggregate domestic airline fare movements over time</p>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            {['DAILY', 'WEEKLY', 'MONTHLY'].map((f) => (
              <button
                key={f}
                onClick={() => handleFrequency(f)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  frequency === f ? 'bg-white text-slate-950 font-bold shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#38bdf8' }}
                formatter={(val) => [`${Number(val).toFixed(2)}`, 'Index Value']}
              />
              <Line type="monotone" dataKey="index" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route Contribution Breakdown Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Route Weight & Contribution Breakdown</h2>
          <p className="text-xs text-slate-500">Live contribution of each corridor to the total national index score</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5">Corridor</th>
                <th className="py-2.5">Current Avg Fare</th>
                <th className="py-2.5">Change vs Base</th>
                <th className="py-2.5">Index Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {heatmapData.map((cell) => (
                <tr key={cell.route_code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-bold text-slate-800">
                    {cell.origin} &rarr; {cell.destination}
                    <span className="text-[10px] font-mono text-slate-400 font-normal ml-1.5">({cell.route_code})</span>
                  </td>
                  <td className="py-2.5 font-extrabold text-slate-900">₹{Math.round(cell.avg_fare).toLocaleString()}</td>
                  <td className="py-2.5">
                    <span className={`font-bold ${cell.change_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {cell.change_pct > 0 ? `+${cell.change_pct}` : cell.change_pct}%
                    </span>
                  </td>
                  <td className="py-2.5 font-mono font-bold text-sky-700">
                    {cell.index_contribution.toFixed(2)} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
