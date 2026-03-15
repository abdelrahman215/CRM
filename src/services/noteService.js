const { z } = require('zod');
const noteRepository = require('../repositories/noteRepository');
const leadRepository = require('../repositories/leadRepository');
const { logActivity } = require('./activityService');

const noteSchema = z.object({
  content: z.string().min(1)
});

async function addNote(user, leadId, data) {
  const existingLead = await leadRepository.findById(leadId);
  if (!existingLead) {
    throw new Error('Lead not found');
  }
  if (user.role === 'sales' && existingLead.assigned_to !== user.id) {
    throw new Error('Forbidden');
  }
  const parsed = noteSchema.parse(data);
  const note = await noteRepository.createNote({
    lead_id: leadId,
    user_id: user.id,
    content: parsed.content
  });
  await logActivity(user.id, 'note_added', leadId);
  return note;
}

async function getNotes(user, leadId) {
  const existingLead = await leadRepository.findById(leadId);
  if (!existingLead) {
    throw new Error('Lead not found');
  }
  if (user.role === 'sales' && existingLead.assigned_to !== user.id) {
    throw new Error('Forbidden');
  }
  return noteRepository.getNotesByLead(leadId);
}

module.exports = {
  addNote,
  getNotes
};

