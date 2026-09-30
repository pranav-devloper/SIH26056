import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, ShieldCheck, Mail, Key, Clock, Database, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-xl uppercase shadow-md shadow-sky-600/20">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{user?.name || 'Authorized User'}</h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Credentials & Access Roles</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium">Assigned Role</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span className="font-extrabold text-sm text-slate-900">{user?.role || 'Viewer'}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {user?.role === 'Admin' ? 'Full operational privileges including index recalculation' : 'Standard analytical querying and reporting permissions'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium">Authentication Provider</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <Key className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-sm text-slate-900 uppercase">{user?.auth_provider || 'Email/Password'}</span>
            </div>
            <p className="text-[10px] text-slate-400">Verified identity source</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium">Email Verification</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-sm text-emerald-700">
                {user?.email_verified ? 'Verified via 6-Digit OTP' : 'Unverified'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Cryptographically hashed record in PostgreSQL</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium">Security Architecture</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <Database className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-sm text-slate-900">PostgreSQL (SQL Only)</span>
            </div>
            <p className="text-[10px] text-slate-400">HS256 JWT stateless access authorization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
