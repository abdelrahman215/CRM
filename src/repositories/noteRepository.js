const db = require('../config/db');

async function createNote({ lead_id, user_id, content }) {
  const { rows } = await db.query(
    'INSERT INTO notes (lead_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
    [lead_id, user_id, content]
  );
  return rows[0];
}

async function getNotesByLead(leadId) {
  const { rows } = await db.query(
    `SELECT n.*, u.name AS user_name
     FROM notes n
     LEFT JOIN users u ON n.user_id = u.id
     WHERE n.lead_id = $1
     ORDER BY n.created_at ASC`,
    [leadId]
  );
  return rows;
}

module.exports = {
  createNote,
  getNotesByLead
};

