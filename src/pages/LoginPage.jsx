import React, { useState } from 'react';
import { useAuth } from '../state/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="relative card w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Avenue New Cairo</h1>
            <p className="text-xs text-slate-400 mt-1">CRM access portal</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            Internal
          </span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            Admin demo: admin1@avenue-new-cairo.com / Admin@123
          </p>
        </form>
      </div>
    </div>
  );
}

