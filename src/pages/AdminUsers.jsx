import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../state/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get('/users').then((res) => setUsers(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const salesUsers = useMemo(() => users.filter((u) => u.role === 'sales'), [users]);

  const openAdd = () => {
    setForm({ name: '', email: '', password: '' });
    setFormError('');
    setIsAddOpen(true);
  };

  const closeAdd = () => {
    if (!submitting) setIsAddOpen(false);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'sales'
      });
      setIsAddOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create sales user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">Sales team</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage the users who can work on leads in Avenue CRM.
          </p>
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Name</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Email</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Role</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Active</th>
            </tr>
          </thead>
          <tbody>
            {salesUsers.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="px-3 py-2 text-slate-100">{u.name}</td>
                <td className="px-3 py-2 text-slate-200">{u.email}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      u.is_active ? 'bg-emerald-900/70 text-emerald-200' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {salesUsers.length === 0 && (
              <tr className="border-t border-slate-800">
                <td className="px-3 py-6 text-slate-500" colSpan={4}>
                  No sales users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {user?.role === 'admin' && (
          <div className="pt-4 flex justify-end">
            <button type="button" className="btn-primary" onClick={openAdd}>
              Add Sales User
            </button>
          </div>
        )}
      </div>

      {user?.role === 'admin' && isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 shadow-2xl border border-slate-800">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Sales User</h2>
              <button
                type="button"
                onClick={closeAdd}
                className="rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-slate-900"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submit} className="px-5 py-4 space-y-4">
              {formError && <div className="text-sm text-red-400">{formError}</div>}

              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Sales user name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">Required: at least 6 characters.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAdd}
                  className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Sales User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

