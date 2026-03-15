const cron = require('node-cron');
const db = require('../config/db');
const { logActivity } = require('../services/activityService');

// This cron job runs every day at 8 AM server time
function scheduleFollowUpReminders() {
  cron.schedule('0 8 * * *', async () => {
    try {
      const { rows: leads } = await db.query(
        `SELECT id, assigned_to 
         FROM leads 
         WHERE is_deleted = FALSE 
           AND follow_up_date IS NOT NULL 
           AND DATE(follow_up_date) = CURRENT_DATE`,
        []
      );
      for (const lead of leads) {
        if (lead.assigned_to) {
          await logActivity(lead.assigned_to, 'follow_up_reminder', lead.id);
        }
      }
      // In a real production system you would also send emails/notifications here.
    } catch (err) {
      console.error('Error running follow-up reminder cron', err);
    }
  });
}

module.exports = {
  scheduleFollowUpReminders
};

