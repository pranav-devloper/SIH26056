import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Plane,
  Database,
  Layers,
  Cpu,
  RefreshCw,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { indexApi, routeApi, bookingWindowApi, sourceApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentStats, setCurrentStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [frequency, setFrequency] = useState('DAILY'); // DAILY, WEEKLY, MONTHLY
  const [routes, setRoutes] = useState([]);
  const [bookingWindows, setBookingWindows] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [curRes, rRes, bwRes, sRes] = await Promise.all([
        indexApi.getCurrent(),
        routeApi.getRoutes(true),
        bookingWindowApi.getBookingWindows(),
        sourceApi.getSourcesStatus(),
      ]);

      setCurrentStats(curRes.data);
      setRoutes(rRes.data.slice(0, 6));
      setBookingWindows(bwRes.data);
      setSources(sRes.data);

      await fetchTrend(frequency);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async (freq) => {
    try {
      let res;
      if (freq === 'DAILY') res = await indexApi.getDaily(30);
      else if (freq === 'WEEKLY') res = await indexApi.getWeekly(16);
      else res = await indexApi.getMonthly(12);

      const formatted = res.data.points.map((p) => ({
        date: p.date.length > 10 ? p.date.substring(5, 10) : p.date,
        fullDate: p.date,
        index: p.index_value,
      }));
      setTrendData(formatted);
    } catch (err) {
      console.error('Trend fetch error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFrequencyChange = async (f) => {
    setFrequency(f);
    await fetchTrend(f);
  };

  const handleRecalculate = async () => {
    if (user?.role !== 'Admin') {
      setActionMessage('Only Admin users can trigger system-wide index recalculation.');
      return;
    }
    setRecalculating(true);
    setActionMessage('');
    try {
      const res = await indexApi.recalculate(35);
      setActionMessage(res.data?.message || 'Index recalculation complete.');
      await loadData();
    } catch (err) {
      setActionMessage('Recalculation error. Please try again.');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading && !currentStats) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Aggregating Indian domestic airfare price index...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Demo Data */}
      <div className="bg-sky-950 text-white rounded-2xl p-6 shadow-sm border border-sky-900 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Domestic Aviation Status</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase tracking-wider">
              DEMO / SYNTHETIC DATA
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            AirIndex India Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time Laspeyres Weighted Airfare Price Index tracking key domestic trunk & regional routes.
            Baseline period: <strong className="text-white">2026-01 (100.0)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user?.role === 'Admin' && (
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              <span>{recalculating ? 'Recalculating...' : 'Recalculate Index'}</span>
            </button>
          )}
          <Link
            to="/historical"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-xs text-sky-800 rounded-xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-bold text-sky-900 ml-4">&times;</button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Current Index */}
        <div className="col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Airfare Index</span>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">APIx</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {currentStats?.current_index?.toFixed(2) || '118.42'}
            </span>
            <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded ${
              (currentStats?.daily_change_pct || 0) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {(currentStats?.daily_change_pct || 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {currentStats?.daily_change_pct > 0 ? `+${currentStats.daily_change_pct}` : currentStats?.daily_change_pct}%
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Updated {currentStats?.last_updated || 'Today'} (Base: 2026-01 = 100.0)
          </p>
        </div>

        {/* Weekly Change */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Change</span>
          <p className="text-2xl font-black text-slate-900">
            +{(currentStats?.weekly_change_pct || 3.8).toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400">7-Day price basket shift</p>
        </div>

        {/* Monthly Change */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Change</span>
          <p className="text-2xl font-black text-slate-900">
            +{(currentStats?.monthly_change_pct || 6.8).toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400">30-Day moving horizon</p>
        </div>

        {/* Total Observations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Observations</span>
          <p className="text-2xl font-black text-slate-900">
            {(currentStats?.total_observations || 125480).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">Stored SQL records</p>
        </div>

        {/* Active Routes & Sources */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Pipeline</span>
          <p className="text-2xl font-black text-slate-900">
            {currentStats?.active_routes || 12} <span className="text-xs font-normal text-slate-500">routes</span>
          </p>
          <p className="text-[10px] text-slate-400">{currentStats?.active_sources || 8} permitted sources</p>
        </div>
      </div>

      {/* Main Index Trend Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Airfare Price Index Trend</h2>
            <p className="text-xs text-slate-500">Historical progression of the weighted Laspeyres index</p>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            {['DAILY', 'WEEKLY', 'MONTHLY'].map((f) => (
              <button
                key={f}
                onClick={() => handleFrequencyChange(f)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  frequency === f ? 'bg-white text-slate-950 font-bold shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="indexGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#38bdf8' }}
                formatter={(val) => [`${Number(val).toFixed(2)}`, 'Index Value']}
              />
              <Area type="monotone" dataKey="index" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#indexGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Booking Windows & Top Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking Windows Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Advance-Booking Windows</h3>
              <p className="text-xs text-slate-500">Average fare vs lead time (T+1 to T+45)</p>
            </div>
            <Link to="/booking-windows" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center">
              <span>Detailed</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {bookingWindows.map((bw) => (
              <div key={bw.window} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    {bw.window}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">{bw.lead_days} Days Lead</p>
                    <p className="text-[10px] text-slate-400">{bw.observations.toLocaleString()} observations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-slate-900">₹{Math.round(bw.average_fare).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Min: ₹{Math.round(bw.min_fare).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Key Corridors Snapshot */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Trunk Route Corridors</h3>
              <p className="text-xs text-slate-500">Weights and benchmark price ratios</p>
            </div>
            <Link to="/routes" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center">
              <span>View All Routes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2">Corridor</th>
                  <th className="py-2">Weight (Wi)</th>
                  <th className="py-2">Base Fare</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {routes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                      <Plane className="w-3 h-3 text-sky-500" />
                      <span>{r.origin} &rarr; {r.destination}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">({r.route_code})</span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-700">{(r.weight * 100).toFixed(1)}%</td>
                    <td className="py-2.5 font-bold text-slate-900">₹{Math.round(r.base_fare).toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
