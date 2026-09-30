import React, { useState, useEffect } from 'react';
import { Grid3X3, Filter, Plane, Layers } from 'lucide-react';
import { heatmapApi, airlineApi } from '../services/api';

export default function HeatmapPage() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    airlineApi.getAirlines()
      .then((res) => setAirlines(res.data))
      .catch((e) => console.log(e));
  }, []);

  const loadHeatmap = () => {
    setLoading(true);
    heatmapApi.getHeatmap(selectedWindow || undefined, selectedAirline || undefined)
      .then((res) => setHeatmapData(res.data))
      .catch((e) => console.error('Heatmap load error:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHeatmap();
  }, [selectedWindow, selectedAirline]);

  // Compute color based on change percentage
  const getCellColor = (changePct) => {
    if (changePct > 15) return 'bg-rose-100 text-rose-900 border-rose-200';
    if (changePct > 5) return 'bg-amber-100 text-amber-900 border-amber-200';
    if (changePct > -5) return 'bg-sky-50 text-sky-900 border-sky-200';
    return 'bg-emerald-100 text-emerald-900 border-emerald-200';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Route Airfare Heatmap Matrix</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial price intensity and percentage deviation relative to base-period benchmarks across corridors
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Window:</span>
            <select
              value={selectedWindow}
              onChange={(e) => setSelectedWindow(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="">All Windows</option>
              <option value="T+1">T+1 (1 Day)</option>
              <option value="T+7">T+7 (7 Days)</option>
              <option value="T+15">T+15 (15 Days)</option>
              <option value="T+30">T+30 (30 Days)</option>
              <option value="T+45">T+45 (45 Days)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">Airline:</span>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="">All Airlines</option>
              {airlines.map((a) => (
                <option key={a.code} value={a.airline}>{a.airline}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
        <span className="font-semibold text-slate-700">Price Deviation vs Base Period:</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span> Discount (&lt; -5%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-50 border border-sky-300"></span> Neutral (-5% to +5%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></span> Moderate Surge (+5% to +15%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-100 border border-rose-300"></span> High Surge (&gt; +15%)</span>
        </div>
      </div>

      {/* Heatmap Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {heatmapData.map((cell) => (
          <div
            key={cell.route_code}
            className={`p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md ${getCellColor(cell.change_pct)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm">{cell.origin} &rarr; {cell.destination}</span>
              <span className="font-mono text-[11px] font-bold opacity-75">{cell.route_code}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-semibold opacity-75">Avg Fare:</span>
                <span className="font-black text-lg">₹{Math.round(cell.avg_fare).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase font-semibold opacity-75">Change vs Base:</span>
                <span className="font-bold text-xs">
                  {cell.change_pct >= 0 ? `+${cell.change_pct}` : cell.change_pct}%
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-current/10">
                <span className="text-[10px] uppercase font-semibold opacity-75">Index Contribution:</span>
                <span className="font-mono font-bold text-xs">{cell.index_contribution.toFixed(2)} pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
