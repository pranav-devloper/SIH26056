import React, { useState, useEffect } from 'react';
import {
  Cpu,
  RefreshCw,
  Play,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Database
} from 'lucide-react';
import { sourceApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ScraperStatusPage() {
  const { user } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [msg, setMsg] = useState('');

  const loadSources = () => {
    setLoading(true);
    sourceApi.getSourcesStatus()
      .then((res) => setSources(res.data))
      .catch((e) => console.error('Sources error:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleTriggerScrape = async (sourceId, sourceName) => {
    if (user?.role !== 'Admin') {
      setMsg('Only Admin users can manually trigger pipeline scrapes.');
      return;
    }

    setTriggering(sourceId);
    setMsg('');
    try {
      const res = await sourceApi.triggerScrape(sourceId);
      setMsg(res.data?.message || `Pipeline executed for ${sourceName}.`);
      loadSources();
    } catch (e) {
      setMsg(`Execution failed for ${sourceName}.`);
    } finally {
      setTriggering(null);
    }
  };

  const handleGenerateDemo = async () => {
    if (user?.role !== 'Admin') {
      setMsg('Only Admin users can generate demo observations.');
      return;
    }

    setGeneratingDemo(true);
    setMsg('');
    try {
      const res = await sourceApi.generateDemo(14);
      setMsg(res.data?.message || 'Demo observations generated successfully.');
      loadSources();
    } catch (e) {
      setMsg('Demo generation failed.');
    } finally {
      setGeneratingDemo(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>;
      case 'DEMO MODE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">DEMO MODE</span>;
      case 'RATE LIMITED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">RATE LIMITED</span>;
      case 'PARSER ERROR':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">PARSER ERROR</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">UNAVAILABLE</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Permitted Data Sources & Pipeline Status</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated scraper health, rate limits, next scheduled runs, and manual trigger controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'Admin' && (
            <button
              onClick={handleGenerateDemo}
              disabled={generatingDemo}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Database className={`w-3.5 h-3.5 ${generatingDemo ? 'animate-spin' : ''}`} />
              <span>{generatingDemo ? 'Generating...' : 'Seed 14-Day Demo Data'}</span>
            </button>
          )}
          <button
            onClick={loadSources}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-xs text-sky-800 rounded-xl flex justify-between items-center">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="font-bold text-sky-950">&times;</button>
        </div>
      )}

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Source Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Collection</th>
                <th className="py-3 px-3">Next Scheduled</th>
                <th className="py-3 px-3">Rate Limit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span>{s.name}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {s.type}
                    </span>
                  </td>
                  <td className="py-3 px-3">{getStatusBadge(s.status)}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {s.last_run ? new Date(s.last_run).toLocaleString() : 'Recent'}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {s.next_run ? new Date(s.next_run).toLocaleTimeString() : 'In 4 hours'}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{s.rate_limit}</td>
                  <td className="py-3 px-4 text-right">
                    {user?.role === 'Admin' ? (
                      <button
                        onClick={() => handleTriggerScrape(s.id, s.name)}
                        disabled={triggering === s.id}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                      >
                        <Play className={`w-3 h-3 ${triggering === s.id ? 'animate-spin' : ''}`} />
                        <span>{triggering === s.id ? 'Running...' : 'Run Pipeline'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Admin only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsible Scraping Ethical Framework Details */}
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-900 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Responsible Data Gathering & Ethical Scraping Compliance</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          AirIndex India strictly enforces non-invasive data collection policies. All adapters implement exponential backoff upon encountering HTTP 429 status codes, never bypass CAPTCHA systems or web application firewalls (WAF), and respect <code>robots.txt</code> crawl delay parameters. When permitted aggregators throttle requests, the system transitions to <code>RATE LIMITED</code> state and activates <code>DemoAirfareAdapter</code> synthetic estimations.
        </p>
      </div>
    </div>
  );
}
