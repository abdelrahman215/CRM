import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function SalesFollowUps() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get('/leads').then((res) => {
      const today = new Date().toISOString().slice(0, 10);
      setLeads(
        res.data.filter((l) => l.follow_up_date && l.follow_up_date.slice(0, 10) === today)
      );
    });
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-50">Today's follow‑ups</h1>
        <p className="text-xs text-slate-400 mt-1">
          A focused list of who you need to speak to today.
        </p>
      </div>
      <div className="card">
        {leads.length === 0 ? (
          <p className="text-sm text-slate-400">
            No follow‑ups scheduled for today. You’re all caught up.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {leads.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between border-b border-slate-800 last:border-b-0 pb-2"
              >
                <div>
                  <p className="font-semibold text-slate-100">{l.full_name}</p>
                  <p className="text-xs text-slate-400">{l.phone}</p>
                </div>
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  {l.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

