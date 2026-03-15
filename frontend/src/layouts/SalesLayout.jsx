import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export default function SalesLayout() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/sales/dashboard', label: 'Dashboard' },
    { to: '/sales/leads', label: 'My Leads' },
    { to: '/sales/follow-ups', label: 'Follow-ups' },
    { to: '/sales/performance', label: 'Performance' },
    { to: '/sales/data', label: 'Data' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800 flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <Link to="/sales/dashboard" className="text-lg font-semibold tracking-tight">
            Avenue CRM
          </Link>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/70 text-emerald-200">
            Sales
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span>{item.label}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500/60" />
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 px-4 py-3 text-xs flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-medium truncate">{user?.name}</span>
            <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center rounded-md border border-slate-600 px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-500 transition"
          >
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/60 backdrop-blur-md">
          <h1 className="text-sm font-medium text-slate-100">Sales workspace</h1>
          <span className="text-xs text-slate-400">
            Avenue New Cairo CRM
          </span>
        </header>
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

