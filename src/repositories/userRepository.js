const db = require('../config/db');

async function findByEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = TRUE', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findAll() {
  const { rows } = await db.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC', []);
  return rows;
}

async function findSalesUsers() {
  const { rows } = await db.query(
    "SELECT id, name, email FROM users WHERE role = 'sales' AND is_active = TRUE ORDER BY name",
    []
  );
  return rows;
}

async function createUser({ name, email, password, role }) {
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
    [name, email, password, role]
  );
  return rows[0];
}

async function updateUser(id, { name, email, role, is_active }) {
  const { rows } = await db.query(
    'UPDATE users SET name = $1, email = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, role, is_active, updated_at',
    [name, email, role, is_active, id]
  );
  return rows[0] || null;
}

async function deleteUser(id) {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = {
  findByEmail,
  findById,
  findAll,
  createUser,
  updateUser,
  deleteUser,
  findSalesUsers
};

