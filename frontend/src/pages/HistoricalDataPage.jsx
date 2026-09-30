import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plane
} from 'lucide-react';
import { historicalApi, routeApi, airlineApi } from '../services/api';

export default function HistoricalDataPage() {
  const [observations, setObservations] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Filters
  const [search, setSearch] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [airline, setAirline] = useState('');
  const [bookingWindow, setBookingWindow] = useState('');
  const [sortBy, setSortBy] = useState('travel_date');
  const [order, setOrder] = useState('desc');

  const [loading, setLoading] = useState(true);
  const [airlines, setAirlines] = useState([]);

  useEffect(() => {
    airlineApi.getAirlines().then((res) => setAirlines(res.data)).catch((e) => console.log(e));
  }, []);

  const loadData = () => {
    setLoading(true);
    const params = {
      page,
      limit,
      search: search || undefined,
      origin: origin || undefined,
      destination: destination || undefined,
      airline: airline || undefined,
      booking_window: bookingWindow || undefined,
      sort_by: sortBy,
      order: order,
    };

    historicalApi.getObservations(params)
      .then((res) => {
        setObservations(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.total_pages);
      })
      .catch((e) => console.error('Historical data error:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, limit, origin, destination, airline, bookingWindow, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const exportCsv = () => {
    const url = historicalApi.exportCsvUrl({
      origin: origin || undefined,
      destination: destination || undefined,
      airline: airline || undefined,
      booking_window: bookingWindow || undefined,
    });
    window.open(url, '_blank');
  };

  const exportJson = () => {
    const url = historicalApi.exportJsonUrl({
      origin: origin || undefined,
      destination: destination || undefined,
      airline: airline || undefined,
      booking_window: bookingWindow || undefined,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">SQL Historical Airfare Observations</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Searchable relational repository of raw & cleaned airfare observations with automated audit flags
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJson}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search flight number, airline, origin, dest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={airline}
            onChange={(e) => { setAirline(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="">All Airlines</option>
            {airlines.map((a) => (
              <option key={a.code} value={a.airline}>{a.airline}</option>
            ))}
          </select>

          <select
            value={bookingWindow}
            onChange={(e) => { setBookingWindow(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="">All Windows</option>
            <option value="T+1">T+1</option>
            <option value="T+7">T+7</option>
            <option value="T+15">T+15</option>
            <option value="T+30">T+30</option>
            <option value="T+45">T+45</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Observations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Flight / Airline</th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('travel_date')}>
                  <div className="flex items-center gap-1">
                    <span>Travel Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-3">Window</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Base (₹)</th>
                <th className="py-3 px-3">Taxes (₹)</th>
                <th className="py-3 px-3 cursor-pointer" onClick={() => handleSort('total_fare')}>
                  <div className="flex items-center gap-1">
                    <span>Total Fare</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-4">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading records from PostgreSQL...
                  </td>
                </tr>
              ) : observations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No airfare observations match the current filter criteria.
                  </td>
                </tr>
              ) : (
                observations.map((obs) => (
                  <tr key={obs.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-slate-900">{obs.flight_number}</p>
                      <p className="text-[10px] text-slate-400">{obs.airline}</p>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{obs.travel_date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {obs.origin} &rarr; {obs.destination}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800">
                        {obs.booking_window}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{obs.fare_class}</td>
                    <td className="py-2.5 px-3 text-slate-600">₹{Math.round(obs.base_fare).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-400">₹{Math.round(obs.taxes + obs.fees).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">
                      ₹{Math.round(obs.total_fare).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500">{obs.source}</td>
                    <td className="py-2.5 px-4">
                      {obs.is_synthetic ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          DEMO DATA
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                          PERMITTED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-800">{observations.length}</strong> of{' '}
            <strong className="text-slate-800">{total.toLocaleString()}</strong> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
