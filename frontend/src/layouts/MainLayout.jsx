import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DemoBanner from '../components/DemoBanner';
import {
  Plane,
  LayoutDashboard,
  TrendingUp,
  GitCommit,
  Calendar,
  Grid3X3,
  Database,
  CheckCircle2,
  Cpu,
  BarChart2,
  FileCode2,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Airfare Index', path: '/index-explorer', icon: TrendingUp },
    { name: 'Route Analytics', path: '/routes', icon: GitCommit },
    { name: 'Airline Analytics', path: '/airlines', icon: BarChart2 },
    { name: 'Booking Windows', path: '/booking-windows', icon: Calendar },
    { name: 'Route Heatmap', path: '/heatmap', icon: Grid3X3 },
    { name: 'Historical Data', path: '/historical', icon: Database },
    { name: 'Data Quality', path: '/data-quality', icon: CheckCircle2 },
    { name: 'Data Collection', path: '/data-collection', icon: Cpu },
    { name: 'Backtesting', path: '/backtesting', icon: TrendingUp },
    { name: 'API Docs', path: '/api-docs', icon: FileCode2 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DemoBanner />

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-2.5">
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
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side: Secondary items & User */}
            <div className="hidden xl:flex items-center gap-2">
              <Link
                to="/historical"
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
                  location.pathname === '/historical' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Historical
              </Link>
              <Link
                to="/backtesting"
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
                  location.pathname === '/backtesting' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Backtesting
              </Link>
              <Link
                to="/data-collection"
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
                  location.pathname === '/data-collection' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Collection
              </Link>

              {/* User Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Evaluator'}</p>
                    <span className="inline-block text-[10px] font-bold text-sky-600 uppercase tracking-wider">{user?.role || 'Viewer'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" /> Account Profile
                    </Link>
                    <Link
                      to="/api-docs"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FileCode2 className="w-4 h-4 text-slate-400" /> API Documentation
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex xl:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AirIndex India</span>
            <span>— Real-Time Aviation Price Index & Statistical Intelligence Platform</span>
          </div>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-slate-800">About</Link>
            <Link to="/methodology" className="hover:text-slate-800">Methodology</Link>
            <Link to="/api-docs" className="hover:text-slate-800">API Documentation</Link>
            <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-slate-800">Swagger OpenAPI</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
