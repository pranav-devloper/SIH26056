import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import DemoBanner from '../components/DemoBanner';
import { Plane, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PublicLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DemoBanner />

      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
                <Plane className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">AirIndex</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">INDIA</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Aviation Price Intelligence</p>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <Link to="/" className={`hover:text-slate-900 transition-colors ${location.pathname === '/' ? 'text-sky-600 font-bold' : ''}`}>
                Home
              </Link>
              <Link to="/about" className={`hover:text-slate-900 transition-colors ${location.pathname === '/about' ? 'text-sky-600 font-bold' : ''}`}>
                About
              </Link>
              <Link to="/methodology" className={`hover:text-slate-900 transition-colors ${location.pathname === '/methodology' ? 'text-sky-600 font-bold' : ''}`}>
                Methodology
              </Link>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Public Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded bg-sky-600 flex items-center justify-center text-white">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-extrabold text-base text-slate-900">AirIndex India</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                An automated real-time domestic airfare statistical intelligence and price index monitoring system.
                Tracks advance booking windows (T+1 to T+45) across all key Indian aviation corridors using SQL-relational architectures.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/" className="hover:text-slate-900">Home</Link></li>
                <li><Link to="/about" className="hover:text-slate-900">About Platform</Link></li>
                <li><Link to="/methodology" className="hover:text-slate-900">Laspeyres Methodology</Link></li>
                <li><Link to="/dashboard" className="hover:text-slate-900">Live Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Compliance & Developer</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a href="/docs" target="_blank" rel="noreferrer" className="hover:text-slate-900">FastAPI Swagger UI</a></li>
                <li><a href="/redoc" target="_blank" rel="noreferrer" className="hover:text-slate-900">ReDoc API Specs</a></li>
                <li><span className="text-slate-400">Database: SQL Only (PostgreSQL / SQLite)</span></li>
                <li><span className="text-slate-400">Zero Redis Dependency</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
            <p>© 2026 AirIndex India Platform. Developed for National Aviation Price Intelligence.</p>
            <p className="mt-2 sm:mt-0 font-medium">Independent Empirical Tracker | Non-CPI Benchmark</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
