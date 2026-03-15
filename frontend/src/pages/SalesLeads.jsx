import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

const STATUS_LABELS = {
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost'
};

export default function SalesLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads', {
        params: { assigned_to: 'me' }
      });
      setLeads(res.data);
    } catch {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredLeads = useMemo(() => {
    let data = leads;
    if (statusFilter !== 'all') {
      data = data.filter((l) => l.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((l) =>
        [l.full_name, l.email, l.company_name].some((field) =>
          (field || '').toLowerCase().includes(q)
        )
      );
    }
    return data;
  }, [leads, statusFilter, search]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/leads/${id}/status`, { status });
      await load();
    } catch {
      // could show toast
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">My assigned leads</h1>
          <p className="text-xs text-slate-400 mt-1">Filter and update the status of your pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, email, or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All statuses</option>
            {Object.keys(STATUS_LABELS).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Name</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Email</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Phone</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Company</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Source</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Status</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-t border-slate-800">
                <td className="px-3 py-2 text-slate-100">{lead.full_name}</td>
                <td className="px-3 py-2 text-slate-200">{lead.email}</td>
                <td className="px-3 py-2">{lead.phone || '-'}</td>
                <td className="px-3 py-2">{lead.company_name || '-'}</td>
                <td className="px-3 py-2">{lead.source}</td>
                <td className="px-3 py-2">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    className="rounded border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {Object.keys(STATUS_LABELS).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-xs text-slate-400">
                  {lead.created_at ? new Date(lead.created_at).toLocaleString() : ''}
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && !loading && (
              <tr className="border-t border-slate-800">
                <td className="px-3 py-6 text-center text-slate-500 text-sm" colSpan={6}>
                  You have no assigned leads yet.
                </td>
              </tr>
            )}
            {loading && (
              <tr className="border-t border-slate-800">
                <td className="px-3 py-6 text-center text-slate-500 text-sm" colSpan={6}>
                  Loading leads...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

