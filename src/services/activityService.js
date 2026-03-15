const db = require('../config/db');

async function logActivity(userId, actionType, targetId = null) {
  await db.query(
    'INSERT INTO activities (user_id, action_type, target_id) VALUES ($1, $2, $3)',
    [userId, actionType, targetId]
  );
}

module.exports = {
  logActivity
};

