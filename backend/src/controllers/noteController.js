const { addNote, getNotes } = require('../services/noteService');

async function addNoteHandler(req, res) {
  try {
    const leadId = req.params.id;
    const note = await addNote(req.user, leadId, req.body);
    res.status(201).json(note);
  } catch (err) {
    const code = err.message === 'Forbidden' ? 403 : err.message === 'Lead not found' ? 404 : 400;
    res.status(code).json({ message: err.message || 'Failed to add note' });
  }
}

async function getNotesHandler(req, res) {
  try {
    const leadId = req.params.id;
    const notes = await getNotes(req.user, leadId);
    res.json(notes);
  } catch (err) {
    const code = err.message === 'Forbidden' ? 403 : err.message === 'Lead not found' ? 404 : 400;
    res.status(code).json({ message: err.message || 'Failed to fetch notes' });
  }
}

module.exports = {
  addNoteHandler,
  getNotesHandler
};

