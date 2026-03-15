import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

const STATUS_BADGES = {
  unassigned: 'bg-slate-100 text-slate-700',
  assigned: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-emerald-100 text-emerald-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700'
};

const SOURCE_OPTIONS = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Other'];
const BUDGET_OPTIONS = ['<$5k', '$5k-$25k', '$25k-$100k', '$100k+', 'Not Disclosed'];

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | unassigned | assigned
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingLead, setEditingLead] = useState(null);
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    source: '',
    budget_range: '',
    notes: ''
  });
  const [createError, setCreateError] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const [assignLead, setAssignLead] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, usersRes] = await Promise.all([
        api.get('/leads'),
        api.get('/users/sales')
      ]);
      setLeads(leadsRes.data);
      setSalesUsers(usersRes.data);
    } catch {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLeads = useMemo(() => {
    let data = leads;
    if (activeTab === 'unassigned') {
      data = data.filter((l) => !l.assigned_to);
    } else if (activeTab === 'assigned') {
      data = data.filter((l) => !!l.assigned_to);
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
  }, [leads, activeTab, search]);

  const openCreate = () => {
    setFormMode('create');
    setEditingLead(null);
    setCreateForm({
      full_name: '',
      email: '',
      phone: '',
      company_name: '',
      source: '',
      budget_range: '',
      notes: ''
    });
    setCreateError('');
    setIsFormOpen(true);
  };

  const openEdit = (lead) => {
    setFormMode('edit');
    setEditingLead(lead);
    setCreateForm({
      full_name: lead.full_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company_name: lead.company_name || '',
      source: lead.source || '',
      budget_range: lead.budget_range || '',
      notes: lead.notes || ''
    });
    setCreateError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (!submittingCreate) setIsFormOpen(false);
  };

  const validateCreate = () => {
    if (!createForm.full_name.trim()) return 'Full name is required.';
    if (createForm.full_name.trim().length > 100) return 'Full name must be at most 100 characters.';
    if (!createForm.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim()))
      return 'Please enter a valid email address.';
    if (createForm.company_name && createForm.company_name.length > 200)
      return 'Company name must be at most 200 characters.';
    if (!createForm.source) return 'Lead source is required.';
    if (createForm.notes && createForm.notes.length > 1000)
      return 'Notes must be at most 1000 characters.';
    if (
      createForm.phone &&
      !/^\+?[0-9\s\-()]{7,30}$/.test(createForm.phone.trim())
    )
      return 'Please enter a valid phone number.';
    return '';
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    const v = validateCreate();
    if (v) {
      setCreateError(v);
      return;
    }
    setSubmittingCreate(true);
    setCreateError('');
    try {
      const payload = {
        ...createForm,
        full_name: createForm.full_name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim() || '',
        company_name: createForm.company_name.trim() || '',
        notes: createForm.notes.trim() || ''
      };

      if (formMode === 'create') {
        await api.post('/leads', payload);
      } else if (editingLead) {
        await api.put(`/leads/${editingLead.id}`, payload);
      }

      setIsFormOpen(false);
      await loadData();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to save lead.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openAssignModal = (lead) => {
    setAssignLead(lead);
    setAssignUserId(lead.assigned_to || '');
    setAssignError('');
  };

  const closeAssignModal = () => {
    if (!assignSubmitting) {
      setAssignLead(null);
      setAssignUserId('');
      setAssignError('');
    }
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    if (!assignUserId) {
      setAssignError('Please select a sales user to assign.');
      return;
    }
    setAssignSubmitting(true);
    setAssignError('');
    try {
      await api.put(`/leads/${assignLead.id}/assign`, { assigned_to: assignUserId });
      closeAssignModal();
      await loadData();
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign lead.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const updateStatus = async (leadId, status) => {
    try {
      await api.put(`/leads/${leadId}/status`, { status });
      await loadData();
    } catch {
      // ignore for now
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">Leads</h1>
          <p className="text-xs text-slate-400 mt-1">Create, route, and manage all incoming leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by name, email, or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button type="button" className="btn-primary" onClick={openCreate}>
            Add Leads
          </button>
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        {[
          { id: 'all', label: 'All Leads' },
          { id: 'unassigned', label: 'Unassigned' },
          { id: 'assigned', label: 'Assigned' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-3 py-1 border text-xs transition ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'border-slate-700 text-slate-300 hover:bg-slate-900/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Assigned To</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Created</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">Actions</th>
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
                    {Object.keys(STATUS_BADGES).map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  {lead.assigned_to
                    ? salesUsers.find((u) => u.id === lead.assigned_to)?.name || 'Assigned'
                    : 'Unassigned'}
                </td>
                <td className="px-3 py-2 text-xs text-slate-400">
                  {lead.created_at ? new Date(lead.created_at).toLocaleString() : ''}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <button
                    type="button"
                    className="text-xs rounded-md border border-slate-700 px-2 py-1 text-slate-100 hover:bg-slate-900/70"
                    onClick={() => openEdit(lead)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs rounded-md border border-slate-700 px-2 py-1 text-slate-100 hover:bg-slate-900/70"
                    onClick={() => openAssignModal(lead)}
                  >
                    {lead.assigned_to ? 'Reassign' : 'Assign'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && !loading && (
              <tr className="border-t border-slate-800">
                <td className="px-3 py-6 text-center text-slate-500 text-sm" colSpan={8}>
                  No leads found.
                </td>
              </tr>
            )}
            {loading && (
              <tr className="border-t border-slate-800">
                <td className="px-3 py-6 text-center text-slate-500 text-sm" colSpan={8}>
                  Loading leads...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 shadow-2xl border border-slate-800">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {formMode === 'create' ? 'Add Lead' : 'Edit Lead'}
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
            <form onSubmit={submitCreate} className="px-5 py-4 space-y-4">
              {createError && <div className="text-sm text-red-400">{createError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full name *</label>
                  <input
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+20 1xx xxx xxxx"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company name</label>
                  <input
                    value={createForm.company_name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, company_name: e.target.value }))
                    }
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lead source *</label>
                  <select
                    value={createForm.source}
                    onChange={(e) => setCreateForm((f) => ({ ...f, source: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select source</option>
                    {SOURCE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Budget range</label>
                  <select
                    value={createForm.budget_range}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, budget_range: e.target.value }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Not set</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Additional information about this lead (max 1000 characters)."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
                  disabled={submittingCreate}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submittingCreate}>
                  {submittingCreate ? 'Saving...' : formMode === 'create' ? 'Create Lead' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignLead && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 shadow-2xl border border-slate-800">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Assign Lead</h2>
              <button
                type="button"
                onClick={closeAssignModal}
                className="rounded-md px-2 py-1 text-sm text-slate-300 hover:bg-slate-900"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitAssign} className="px-5 py-4 space-y-4">
              {assignError && <div className="text-sm text-red-400">{assignError}</div>}

              <div className="text-sm">
                <p className="font-medium">{assignLead.full_name}</p>
                <p className="text-slate-400 text-xs">{assignLead.email}</p>
                <p className="text-slate-500 text-xs mt-1">
                  Current status:{' '}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      STATUS_BADGES[assignLead.status] || 'bg-slate-900 text-slate-200'
                    }`}
                  >
                    {assignLead.status}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assign to sales user</label>
                {salesUsers.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No sales users available for assignment.
                  </p>
                ) : (
                  <select
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select sales user</option>
                    {salesUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAssignModal}
                  className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
                  disabled={assignSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary disabled:opacity-50"
                  disabled={assignSubmitting || salesUsers.length === 0}
                >
                  {assignSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

