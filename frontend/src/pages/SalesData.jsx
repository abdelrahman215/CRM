import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

const PROPERTY_OPTIONS = [
  { value: '', label: 'All property types' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Villa', label: 'Villa' }
];

export default function SalesData() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    property_type: '',
    property_details: '',
    phone: '',
    location: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (propertyTypeFilter) params.set('property_type', propertyTypeFilter);
      const qs = params.toString();
      const url = qs ? `/clients?${qs}` : '/clients';
      const res = await api.get(url);
      setClients(res.data);
    } catch (e) {
      // ignore for now, could add toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLabel = useMemo(() => {
    if (!query && !propertyTypeFilter) return 'All client records';
    return 'Filtered client records';
  }, [query, propertyTypeFilter]);

  const openCreate = () => {
    setFormMode('create');
    setEditingId(null);
    setForm({
      full_name: '',
      property_type: '',
      property_details: '',
      phone: '',
      location: '',
      notes: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (client) => {
    setFormMode('edit');
    setEditingId(client.id);
    setForm({
      full_name: client.full_name || '',
      property_type: client.property_type || '',
      property_details: client.property_details || '',
      phone: client.phone || '',
      location: client.location || '',
      notes: client.notes || ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (!submitting) setIsFormOpen(false);
  };

  const validate = () => {
    if (!form.full_name.trim()) return 'Client full name is required.';
    if (!form.property_type) return 'Property type is required.';
    if (!form.phone.trim()) return 'Phone number is required.';
    if (!/^\+?[0-9\s\-()]{7,30}$/.test(form.phone.trim())) return 'Please enter a valid phone number.';
    if (!form.location.trim()) return 'Location is required.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        full_name: form.full_name.trim(),
        property_type: form.property_type,
        property_details: form.property_details.trim() || '',
        phone: form.phone.trim(),
        location: form.location.trim(),
        notes: form.notes.trim() || ''
      };

      if (formMode === 'create') {
        await api.post('/clients', payload);
      } else if (editingId) {
        await api.put(`/clients/${editingId}`, payload);
      }

      setIsFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save client record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Are you sure you want to delete this client record?');
    if (!ok) return;
    try {
      await api.delete(`/clients/${id}`);
      await load();
    } catch {
      // could show error
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const handlePropertyFilterChange = (e) => {
    setPropertyTypeFilter(e.target.value);
    // optionally auto-refresh
    setTimeout(load, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">Client data</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and maintain your Avenue New Cairo client records.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>
          Add Client
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="card flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or location"
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Property type</label>
          <select
            value={propertyTypeFilter}
            onChange={handlePropertyFilterChange}
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {PROPERTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:self-stretch flex items-end">
          <button type="submit" className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-900">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400">{filteredLabel}</p>
          <p className="text-xs text-slate-400">{clients.length} records</p>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Client</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Property</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Phone</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Location</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Last updated</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-slate-800">
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-100">{c.full_name}</div>
                  {c.notes && (
                    <div className="text-xs text-slate-400 truncate max-w-xs">{c.notes}</div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="text-sm text-slate-100">{c.property_type}</div>
                  {c.property_details && (
                    <div className="text-xs text-slate-400">{c.property_details}</div>
                  )}
                </td>
                <td className="px-3 py-2">{c.phone}</td>
                <td className="px-3 py-2">{c.location}</td>
                <td className="px-3 py-2 text-xs text-slate-400">
                  {c.updated_at ? new Date(c.updated_at).toLocaleString() : ''}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    type="button"
                    className="text-xs rounded-md border border-slate-700 px-2 py-1 text-slate-100 hover:bg-slate-900"
                    onClick={() => openEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs rounded-md border border-red-500/40 px-2 py-1 text-red-400 hover:bg-red-950/40"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && !loading && (
              <tr className="border-t border-slate-800">
                <td className="px-3 py-6 text-slate-500 text-sm" colSpan={6}>
                  No client records yet. Use &quot;Add Client&quot; to create your first one.
                </td>
              </tr>
            )}
            {loading && (
              <tr className="border-t border-slate-800">
                <td className="px-3 py-6 text-slate-500 text-sm" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-2xl bg-slate-950 shadow-2xl border border-slate-800">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {formMode === 'create' ? 'Add Client Record' : 'Edit Client Record'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-slate-900"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
              {formError && <div className="text-sm text-red-400">{formError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client full name *</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Property type *</label>
                  <select
                    value={form.property_type}
                    onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Property details</label>
                <input
                  value={form.property_details}
                  onChange={(e) => setForm((f) => ({ ...f, property_details: e.target.value }))}
                  placeholder="Unit number, building name, villa number..."
                  className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone number *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+20 1xx xxx xxxx"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">Include country code where possible.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Area, compound, or address"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Any supplementary information about this client."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : formMode === 'create' ? 'Create Client' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

