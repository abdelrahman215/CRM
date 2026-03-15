const {
  listLeads,
  createLeadService,
  updateLeadService,
  assignLeadService,
  softDeleteLeadService,
  getAdminAnalytics,
  getSalesAnalytics,
  getLeadByIdService,
  updateLeadStatusService
} = require('../services/leadService');

async function getLeadsHandler(req, res) {
  try {
    const leads = await listLeads(req.user, req.query);
    res.json(leads);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to fetch leads' });
  }
}

async function createLeadHandler(req, res) {
  try {
    const lead = await createLeadService(req.user, req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create lead' });
  }
}

async function getLeadByIdHandler(req, res) {
  try {
    const lead = await getLeadByIdService(req.user, req.params.id);
    res.json(lead);
  } catch (err) {
    const code = err.message === 'Forbidden' ? 403 : err.message === 'Lead not found' ? 404 : 400;
    res.status(code).json({ message: err.message || 'Failed to fetch lead' });
  }
}

async function updateLeadHandler(req, res) {
  try {
    const lead = await updateLeadService(req.user, req.params.id, req.body);
    res.json(lead);
  } catch (err) {
    const code = err.message === 'Forbidden' ? 403 : err.message === 'Lead not found' ? 404 : 400;
    res.status(code).json({ message: err.message || 'Failed to update lead' });
  }
}

async function deleteLeadHandler(req, res) {
  try {
    const lead = await softDeleteLeadService(req.user, req.params.id);
    res.json(lead);
  } catch (err) {
    const code = err.message === 'Lead not found' ? 404 : 400;
    res.status(code).json({ message: err.message || 'Failed to delete lead' });
  }
}

async function assignLeadHandler(req, res) {
  try {
    const { assigned_to } = req.body;
    const lead = await assignLeadService(req.user, req.params.id, assigned_to);
    res.json(lead);
  } catch (err) {
    const code = err.message === 'Lead not found' ? 404 : 400;
    res.status(code).json({ message: err.message || 'Failed to assign lead' });
  }
}

async function updateLeadStatusHandler(req, res) {
  try {
    const lead = await updateLeadStatusService(req.user, req.params.id, req.body);
    res.json(lead);
  } catch (err) {
    const code = err.message === 'Forbidden' ? 403 : err.message === 'Lead not found' ? 404 : 400;
    res.status(code).json({ message: err.message || 'Failed to update lead status' });
  }
}

async function adminAnalyticsHandler(req, res) {
  try {
    const data = await getAdminAnalytics();
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: 'Failed to load analytics' });
  }
}

async function salesAnalyticsHandler(req, res) {
  try {
    const data = await getSalesAnalytics(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: 'Failed to load analytics' });
  }
}

module.exports = {
  getLeadsHandler,
  createLeadHandler,
  getLeadByIdHandler,
  updateLeadHandler,
  deleteLeadHandler,
  assignLeadHandler,
  updateLeadStatusHandler,
  adminAnalyticsHandler,
  salesAnalyticsHandler
};

