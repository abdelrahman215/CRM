import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_LABELS = {
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost'
};

export default function AdminReports() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (fromDate) params.created_from = fromDate;
      if (toDate) params.created_to = toDate;
      if (status !== 'all') params.status = status;
      if (search.trim()) params.q = search.trim();

      const res = await api.get('/leads', { params });
      setLeads(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLeads = useMemo(() => leads, [leads]);

  const statusSummary = useMemo(() => {
    const counts = {
      unassigned: 0,
      assigned: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0
    };
    filteredLeads.forEach((l) => {
      if (counts[l.status] !== undefined) counts[l.status] += 1;
    });
    return counts;
  }, [filteredLeads]);

  const conversionChartData = useMemo(() => {
    const byMonth = new Map();
    filteredLeads
      .filter((l) => l.status === 'converted')
      .forEach((l) => {
        const key = l.updated_at ? l.updated_at.slice(0, 7) : l.created_at?.slice(0, 7);
        if (!key) return;
        byMonth.set(key, (byMonth.get(key) || 0) + 1);
      });

    const labels = Array.from(byMonth.keys()).sort();
    return {
      labels,
      datasets: [
        {
          label: 'Converted leads',
          data: labels.map((k) => byMonth.get(k) || 0),
          backgroundColor: '#2563eb'
        }
      ]
    };
  }, [filteredLeads]);

  const exportCsv = () => {
    if (!filteredLeads.length) return;
    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'Company',
      'Source',
      'Status',
      'Assigned To',
      'Created At',
      'Updated At'
    ];
    const rows = filteredLeads.map((l) => [
      l.id,
      l.full_name,
      l.email,
      l.phone || '',
      l.company_name || '',
      l.source || '',
      l.status || '',
      l.assigned_to || '',
      l.created_at || '',
      l.updated_at || ''
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const safe = String(value ?? '').replace(/"/g, '""');
            return `"${safe}"`;
          })
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'avenue-crm-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze leads by status, time period, and export the results.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-900"
          >
            Export CSV
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="card grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div>
          <label className="block text-xs font-medium mb-1">From date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">To date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, or company"
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Run report'}
          </button>
        </div>
      </form>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold mb-3 text-slate-100">Summary</h2>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-slate-400">Total leads</dt>
              <dd className="text-lg font-semibold text-slate-50">{filteredLeads.length}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Converted</dt>
              <dd className="text-lg font-semibold text-emerald-400">
                {statusSummary.converted}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Qualified</dt>
              <dd className="text-lg font-semibold text-primary-400">
                {statusSummary.qualified}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Lost</dt>
              <dd className="text-lg font-semibold text-red-400">{statusSummary.lost}</dd>
            </div>
          </dl>
        </div>
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold mb-3 text-slate-100">Conversions over time</h2>
          <div className="h-64">
            <Bar data={conversionChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Lead</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Source</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Status</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Assigned to</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Created</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((l) => (
              <tr key={l.id} className="border-t border-slate-800">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-100">{l.full_name}</div>
                  <div className="text-xs text-slate-400">{l.email}</div>
                  {l.company_name && (
                    <div className="text-xs text-slate-500">{l.company_name}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-100">{l.source}</td>
                <td className="px-3 py-2 text-slate-100">
                  {STATUS_LABELS[l.status] || l.status}
                </td>
                <td className="px-3 py-2 text-slate-100">
                  {l.assigned_to ? l.assigned_to : 'Unassigned'}
                </td>
                <td className="px-3 py-2 text-xs text-slate-400">
                  {l.created_at ? new Date(l.created_at).toLocaleString() : ''}
                </td>
                <td className="px-3 py-2 text-xs text-slate-400">
                  {l.updated_at ? new Date(l.updated_at).toLocaleString() : ''}
                </td>
              </tr>
            ))}
            {!loading && filteredLeads.length === 0 && (
              <tr className="border-t border-slate-800">
                <td
                  className="px-3 py-6 text-center text-slate-500 text-sm"
                  colSpan={6}
                >
                  No leads match the selected filters.
                </td>
              </tr>
            )}
            {loading && (
              <tr className="border-t border-slate-800">
                <td
                  className="px-3 py-6 text-center text-slate-500 text-sm"
                  colSpan={6}
                >
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

