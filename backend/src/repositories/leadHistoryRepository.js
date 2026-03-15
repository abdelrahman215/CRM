const db = require('../config/db');

async function insertHistory({
  leadId,
  changedBy,
  oldStatus,
  newStatus,
  oldAssignedTo,
  newAssignedTo
}) {
  await db.query(
    `INSERT INTO lead_status_history
      (lead_id, changed_by, old_status, new_status, old_assigned_to, new_assigned_to)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [leadId, changedBy || null, oldStatus || null, newStatus || null, oldAssignedTo || null, newAssignedTo || null]
  );
}

module.exports = {
  insertHistory
};

