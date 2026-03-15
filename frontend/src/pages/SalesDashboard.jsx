import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

export default function SalesDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api
      .get('/analytics/sales')
      .then((res) => setMetrics(res.data))
      .catch(() => {});
  }, []);

  if (!metrics)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-400">Loading dashboard...</div>
      </div>
    );

  const performanceData = {
    labels: metrics.performance.map((m) =>
      new Date(m.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    ),
    datasets: [
      {
        label: 'Conversions',
        data: metrics.performance.map((m) => m.conversions),
        borderColor: '#2563eb',
        backgroundColor: '#bfdbfe',
        tension: 0.3
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">My performance</h1>
          <p className="text-xs text-slate-400 mt-1">How your personal pipeline is trending.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-slate-400">Assigned leads</p>
          <p className="text-2xl font-semibold mt-1 text-slate-50">{metrics.assignedLeads}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Today's follow-ups</p>
          <p className="text-2xl font-semibold mt-1 text-emerald-400">{metrics.todaysFollowUps}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Conversion rate</p>
          <p className="text-2xl font-semibold mt-1 text-primary-400">
            {(metrics.personalConversionRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-sm font-semibold mb-3 text-slate-100">Performance over time</h2>
        <div className="h-72">
          <Line data={performanceData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

