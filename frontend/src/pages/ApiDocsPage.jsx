import React, { useState } from 'react';
import { FileCode2, ExternalLink, Copy, Check, Terminal } from 'lucide-react';

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeLang, setActiveLang] = useState('curl'); // curl, python, js

  const endpoints = [
    {
      method: 'GET',
      path: '/api/index/current',
      desc: 'Retrieve latest composite airfare index, percentage shifts, and observation tally.',
      curl: `curl -X GET "${window.location.origin}/api/index/current"`,
      python: `import requests\nres = requests.get("${window.location.origin}/api/index/current")\nprint(res.json())`,
      js: `fetch("${window.location.origin}/api/index/current")\n  .then(r => r.json())\n  .then(console.log);`,
    },
    {
      method: 'GET',
      path: '/api/index/daily?limit=45',
      desc: 'Retrieve daily historical index time-series up to specified record limit.',
      curl: `curl -X GET "${window.location.origin}/api/index/daily?limit=45"`,
      python: `import requests\nres = requests.get("${window.location.origin}/api/index/daily?limit=45")\nprint(res.json())`,
      js: `fetch("${window.location.origin}/api/index/daily?limit=45")\n  .then(r => r.json())\n  .then(console.log);`,
    },
    {
      method: 'GET',
      path: '/api/routes/{route_code}/prices',
      desc: 'Retrieve statistical airfare distribution (mean, median, min, max, volatility) for corridor (e.g. DEL-BOM).',
      curl: `curl -X GET "${window.location.origin}/api/routes/DEL-BOM/prices"`,
      python: `import requests\nres = requests.get("${window.location.origin}/api/routes/DEL-BOM/prices")\nprint(res.json())`,
      js: `fetch("${window.location.origin}/api/routes/DEL-BOM/prices")\n  .then(r => r.json())\n  .then(console.log);`,
    },
    {
      method: 'GET',
      path: '/api/booking-windows',
      desc: 'Retrieve advance booking stratification summary across T+1, T+7, T+15, T+30, T+45.',
      curl: `curl -X GET "${window.location.origin}/api/booking-windows"`,
      python: `import requests\nres = requests.get("${window.location.origin}/api/booking-windows")\nprint(res.json())`,
      js: `fetch("${window.location.origin}/api/booking-windows")\n  .then(r => r.json())\n  .then(console.log);`,
    },
    {
      method: 'GET',
      path: '/api/airlines',
      desc: 'Retrieve carrier-level pricing benchmarks, volatility, and route network coverage statistics.',
      curl: `curl -X GET "${window.location.origin}/api/airlines"`,
      python: `import requests\nres = requests.get("${window.location.origin}/api/airlines")\nprint(res.json())`,
      js: `fetch("${window.location.origin}/api/airlines")\n  .then(r => r.json())\n  .then(console.log);`,
    },
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AirIndex India REST API Documentation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrate national airfare price index metrics and historical time-series into econometric workflows
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>Swagger OpenAPI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="/redoc"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>ReDoc Specs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Code Language Selector */}
      <div className="flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-700">Select Integration Syntax:</span>
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          {['curl', 'python', 'js'].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[11px] font-bold transition-all ${
                activeLang === lang ? 'bg-white text-slate-950 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.map((ep, idx) => {
          const codeSnippet = activeLang === 'curl' ? ep.curl : activeLang === 'python' ? ep.python : ep.js;
          return (
            <div key={ep.path} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded font-mono font-black text-xs bg-emerald-100 text-emerald-800">
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">{ep.path}</span>
                </div>
                <p className="text-xs text-slate-500">{ep.desc}</p>
              </div>

              <div className="bg-slate-950 p-4 relative group">
                <button
                  onClick={() => handleCopy(codeSnippet, idx)}
                  className="absolute right-3 top-3 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-all"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <pre className="font-mono text-xs text-sky-400 overflow-x-auto pr-16 leading-relaxed">
                  {codeSnippet}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
