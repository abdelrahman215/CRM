import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api
      .get('/analytics/admin')
      .then((res) => setMetrics(res.data))
      .catch(() => {});
  }, []);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const conversionData = {
    labels: metrics.monthlyConversion.map((m) => new Date(m.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })),
    datasets: [
      {
        label: 'Conversions',
        data: metrics.monthlyConversion.map((m) => m.conversions),
        backgroundColor: '#2563eb'
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">Admin dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Overview of pipeline health and team load.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-slate-400">Total leads</p>
          <p className="text-2xl font-semibold mt-1 text-slate-50">{metrics.totalLeads}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">New this month</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-400">{metrics.newLeads}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Converted (closed won)</p>
          <p className="text-2xl font-semibold mt-1 text-primary-400">{metrics.convertedLeads}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Lost (closed lost)</p>
          <p className="text-2xl font-semibold mt-1 text-red-400">{metrics.lostLeads}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold mb-3 text-slate-100">Monthly conversion</h2>
          <div className="h-72">
            <Bar data={conversionData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold mb-3 text-slate-100">Leads per sales rep</h2>
          <ul className="space-y-2 text-sm">
            {metrics.leadsPerSales.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span className="text-slate-200">{s.name}</span>
                <span className="inline-flex items-center rounded-full bg-slate-900/60 px-2 py-0.5 text-xs text-slate-100">
                  {s.lead_count} leads
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

