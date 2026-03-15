const db = require('../config/db');

async function findAll({ role, userId, filters = {} }) {
  const conditions = ['is_deleted = FALSE'];
  const params = [];
  let idx = 1;

  if (role === 'sales') {
    conditions.push('assigned_to = $' + idx);
    params.push(userId);
    idx += 1;
  }

  if (filters.status) {
    conditions.push('status = $' + idx);
    params.push(filters.status);
    idx += 1;
  }

  if (filters.assignedToMe && role === 'sales') {
    // already constrained by assigned_to above
  } else if (filters.unassigned) {
    conditions.push('assigned_to IS NULL');
  }

  if (filters.q) {
    conditions.push('(LOWER(full_name) LIKE $' + idx + ' OR LOWER(email) LIKE $' + idx + ' OR LOWER(company_name) LIKE $' + idx + ')');
    params.push(`%${filters.q.toLowerCase()}%`);
    idx += 1;
  }

  if (filters.createdFrom) {
    conditions.push('created_at >= $' + idx);
    params.push(filters.createdFrom);
    idx += 1;
  }

  if (filters.createdTo) {
    conditions.push('created_at <= $' + idx);
    params.push(filters.createdTo);
    idx += 1;
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const { rows } = await db.query(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC`,
    params
  );
  return rows;
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM leads WHERE id = $1 AND is_deleted = FALSE', [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const { rows } = await db.query('SELECT * FROM leads WHERE email = $1 AND is_deleted = FALSE', [email]);
  return rows[0] || null;
}

async function createLead(data) {
  const {
    full_name,
    email,
    phone,
    company_name,
    source,
    budget_range,
    notes,
    status,
    assigned_to,
    created_by
  } = data;
  const { rows } = await db.query(
    `INSERT INTO leads 
    (full_name, email, phone, company_name, source, budget_range, notes, status, assigned_to, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [full_name, email, phone || null, company_name || null, source, budget_range || null, notes || null, status, assigned_to, created_by]
  );
  return rows[0];
}

async function updateLead(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findById(id);

  const setClauses = keys.map((k, idx) => `${k} = $${idx + 1}`);
  const values = Object.values(fields);
  values.push(id);

  const { rows } = await db.query(
    `UPDATE leads SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
      keys.length + 1
    } RETURNING *`,
    values
  );
  return rows[0] || null;
}

async function softDeleteLead(id) {
  const { rows } = await db.query(
    'UPDATE leads SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0] || null;
}

async function getAnalytics() {
  const totalLeadsRes = await db.query('SELECT COUNT(*) AS total FROM leads WHERE is_deleted = FALSE', []);
  const newLeadsRes = await db.query(
    `SELECT COUNT(*) AS total 
     FROM leads 
     WHERE is_deleted = FALSE 
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
    []
  );
  const convertedRes = await db.query(
    "SELECT COUNT(*) AS total FROM leads WHERE status = 'converted' AND is_deleted = FALSE",
    []
  );
  const lostRes = await db.query(
    "SELECT COUNT(*) AS total FROM leads WHERE status = 'lost' AND is_deleted = FALSE",
    []
  );
  const leadsPerSalesRes = await db.query(
    `SELECT u.id, u.name, COUNT(l.*) AS lead_count
     FROM users u
     LEFT JOIN leads l ON l.assigned_to = u.id AND l.is_deleted = FALSE
     WHERE u.role = 'sales'
     GROUP BY u.id, u.name`,
    []
  );
  const monthlyConversionRes = await db.query(
    `SELECT DATE_TRUNC('month', updated_at) AS month, COUNT(*) AS conversions
     FROM leads
     WHERE status = 'converted' AND is_deleted = FALSE
     GROUP BY month
     ORDER BY month`,
    []
  );

  return {
    totalLeads: Number(totalLeadsRes.rows[0]?.total || 0),
    newLeads: Number(newLeadsRes.rows[0]?.total || 0),
    convertedLeads: Number(convertedRes.rows[0]?.total || 0),
    lostLeads: Number(lostRes.rows[0]?.total || 0),
    leadsPerSales: leadsPerSalesRes.rows,
    monthlyConversion: monthlyConversionRes.rows
  };
}

async function getSalesAnalytics(userId) {
  const assignedRes = await db.query(
    'SELECT COUNT(*) AS total FROM leads WHERE assigned_to = $1 AND is_deleted = FALSE',
    [userId]
  );
  const todayFollowUpsRes = await db.query(
    'SELECT COUNT(*) AS total FROM leads WHERE assigned_to = $1 AND is_deleted = FALSE AND DATE(follow_up_date) = CURRENT_DATE',
    [userId]
  );
  const convertedRes = await db.query(
    "SELECT COUNT(*) AS total FROM leads WHERE assigned_to = $1 AND status = 'converted' AND is_deleted = FALSE",
    [userId]
  );
  const totalRes = await db.query(
    'SELECT COUNT(*) AS total FROM leads WHERE assigned_to = $1 AND is_deleted = FALSE',
    [userId]
  );
  const performanceRes = await db.query(
    `SELECT DATE_TRUNC('month', updated_at) AS month, COUNT(*) AS conversions
     FROM leads
     WHERE assigned_to = $1 AND status = 'converted' AND is_deleted = FALSE
     GROUP BY month
     ORDER BY month`,
    [userId]
  );

  const total = Number(totalRes.rows[0]?.total || 0);
  const converted = Number(convertedRes.rows[0]?.total || 0);

  return {
    assignedLeads: Number(assignedRes.rows[0]?.total || 0),
    todaysFollowUps: Number(todayFollowUpsRes.rows[0]?.total || 0),
    personalConversionRate: total ? converted / total : 0,
    performance: performanceRes.rows
  };
}

module.exports = {
  findAll,
  findById,
  findByEmail,
  createLead,
  updateLead,
  softDeleteLead,
  getAnalytics,
  getSalesAnalytics
};

