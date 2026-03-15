const { z } = require('zod');
const clientRepository = require('../repositories/clientRepository');

const createUpdateSchema = z.object({
  full_name: z.string().min(1, 'Client full name is required'),
  property_type: z.enum(['Apartment', 'Villa'], { required_error: 'Property type is required' }),
  property_details: z.string().optional(),
  phone: z
    .string()
    .min(5, 'Phone number is required')
    .max(30)
    .regex(/^\+?[0-9\s\-()]{7,30}$/, 'Please enter a valid phone number'),
  location: z.string().min(1, 'Location is required'),
  notes: z.string().optional()
});

const listQuerySchema = z.object({
  q: z.string().optional(),
  property_type: z.enum(['Apartment', 'Villa']).optional()
});

async function listClientsForSalesUser(salesUserId, query) {
  const parsed = listQuerySchema.safeParse(query || {});
  const filters = parsed.success ? parsed.data : {};
  return clientRepository.listBySalesUser(salesUserId, filters);
}

async function createClientForSalesUser(salesUserId, payload) {
  const parsed = createUpdateSchema.parse(payload);
  return clientRepository.createForSalesUser(salesUserId, parsed);
}

async function updateClientForSalesUser(id, salesUserId, payload) {
  const parsed = createUpdateSchema.parse(payload);
  const updated = await clientRepository.updateForSalesUser(id, salesUserId, parsed);
  if (!updated) {
    const err = new Error('Client not found');
    err.statusCode = 404;
    throw err;
  }
  return updated;
}

async function deleteClientForSalesUser(id, salesUserId) {
  const existing = await clientRepository.findByIdForSalesUser(id, salesUserId);
  if (!existing) {
    const err = new Error('Client not found');
    err.statusCode = 404;
    throw err;
  }
  await clientRepository.deleteForSalesUser(id, salesUserId);
}

module.exports = {
  listClientsForSalesUser,
  createClientForSalesUser,
  updateClientForSalesUser,
  deleteClientForSalesUser
};

