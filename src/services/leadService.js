const { z } = require('zod');
const leadRepository = require('../repositories/leadRepository');
const { insertHistory } = require('../repositories/leadHistoryRepository');
const { logActivity } = require('./activityService');

const createLeadSchema = z.object({
  full_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .min(0)
    .max(50)
    .regex(/^\+?[0-9\s\-()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  company_name: z.string().max(200).optional().or(z.literal('')),
  source: z.enum(['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Other']),
  budget_range: z
    .enum(['<$5k', '$5k-$25k', '$25k-$100k', '$100k+', 'Not Disclosed'])
    .optional()
    .or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal(''))
});

const statusSchema = z.enum([
  'unassigned',
  'assigned',
  'contacted',
  'qualified',
  'converted',
  'lost'
]);

async function listLeads(user, query = {}) {
  const filters = {
    status: query.status,
    unassigned: query.unassigned === 'true',
    assignedToMe: query.assigned_to === 'me',
    q: query.q,
    createdFrom: query.created_from,
    createdTo: query.created_to
  };
  return leadRepository.findAll({ role: user.role, userId: user.id, filters });
}

async function createLeadService(user, data) {
  const parsed = createLeadSchema.parse(data);

  const existing = await leadRepository.findByEmail(parsed.email);
  if (existing) {
    throw new Error('A lead with this email already exists');
  }

  const lead = await leadRepository.createLead({
    full_name: parsed.full_name,
    email: parsed.email,
    phone: parsed.phone || null,
    company_name: parsed.company_name || null,
    source: parsed.source,
    budget_range: parsed.budget_range || null,
    notes: parsed.notes || null,
    status: 'unassigned',
    assigned_to: null,
    created_by: user.id
  });
  await logActivity(user.id, 'lead_created', lead.id);
  return lead;
}

async function updateLeadService(user, id, data) {
  const existing = await leadRepository.findById(id);
  if (!existing) {
    throw new Error('Lead not found');
  }
  if (user.role === 'sales' && existing.assigned_to !== user.id) {
    throw new Error('Forbidden');
  }

  const updatable = {};
  if (data.full_name) updatable.full_name = data.full_name;
  if (data.phone !== undefined) updatable.phone = data.phone;
  if (data.email !== undefined) updatable.email = data.email;
  if (data.company_name !== undefined) updatable.company_name = data.company_name;
  if (data.source !== undefined) updatable.source = data.source;
  if (data.budget_range !== undefined) updatable.budget_range = data.budget_range;
  if (data.notes !== undefined) updatable.notes = data.notes;
  if (data.follow_up_date !== undefined) updatable.follow_up_date = data.follow_up_date;

  const updated = await leadRepository.updateLead(id, updatable);
  await logActivity(user.id, 'lead_updated', id);
  return updated;
}

async function assignLeadService(adminUser, id, assigned_to) {
  const existing = await leadRepository.findById(id);
  if (!existing) {
    throw new Error('Lead not found');
  }

  const updated = await leadRepository.updateLead(id, { assigned_to, status: 'assigned' });
  await insertHistory({
    leadId: id,
    changedBy: adminUser.id,
    oldStatus: existing.status,
    newStatus: 'assigned',
    oldAssignedTo: existing.assigned_to,
    newAssignedTo: assigned_to
  });
  await logActivity(adminUser.id, 'lead_assigned', id);
  return updated;
}

async function softDeleteLeadService(adminUser, id) {
  const deleted = await leadRepository.softDeleteLead(id);
  if (!deleted) {
    throw new Error('Lead not found');
  }
  await logActivity(adminUser.id, 'lead_deleted', id);
  return deleted;
}

async function getAdminAnalytics() {
  return leadRepository.getAnalytics();
}

async function getSalesAnalytics(userId) {
  return leadRepository.getSalesAnalytics(userId);
}

async function getLeadByIdService(user, id) {
  const lead = await leadRepository.findById(id);
  if (!lead) {
    throw new Error('Lead not found');
  }
  if (user.role === 'sales' && lead.assigned_to !== user.id) {
    throw new Error('Forbidden');
  }
  return lead;
}

async function updateLeadStatusService(user, id, payload) {
  const parsed = statusSchema.parse(payload.status);

  const existing = await leadRepository.findById(id);
  if (!existing) {
    throw new Error('Lead not found');
  }
  if (user.role === 'sales' && existing.assigned_to !== user.id) {
    throw new Error('Forbidden');
  }

  const updated = await leadRepository.updateLead(id, { status: parsed });
  await insertHistory({
    leadId: id,
    changedBy: user.id,
    oldStatus: existing.status,
    newStatus: parsed,
    oldAssignedTo: existing.assigned_to,
    newAssignedTo: existing.assigned_to
  });
  await logActivity(user.id, 'lead_status_updated', id);
  return updated;
}

module.exports = {
  listLeads,
  createLeadService,
  updateLeadService,
  assignLeadService,
  softDeleteLeadService,
  getAdminAnalytics,
  getSalesAnalytics,
  getLeadByIdService,
  updateLeadStatusService
};

