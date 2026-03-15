const {
  listClientsForSalesUser,
  createClientForSalesUser,
  updateClientForSalesUser,
  deleteClientForSalesUser
} = require('../services/clientService');

async function listClientsHandler(req, res) {
  try {
    const clients = await listClientsForSalesUser(req.user.id, req.query);
    res.json(clients);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to fetch clients' });
  }
}

async function createClientHandler(req, res) {
  try {
    const client = await createClientForSalesUser(req.user.id, req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create client' });
  }
}

async function updateClientHandler(req, res) {
  try {
    const client = await updateClientForSalesUser(req.params.id, req.user.id, req.body);
    res.json(client);
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json({ message: err.message || 'Failed to update client' });
  }
}

async function deleteClientHandler(req, res) {
  try {
    await deleteClientForSalesUser(req.params.id, req.user.id);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    const status = err.statusCode || 400;
    res.status(status).json({ message: err.message || 'Failed to delete client' });
  }
}

module.exports = {
  listClientsHandler,
  createClientHandler,
  updateClientHandler,
  deleteClientHandler
};

