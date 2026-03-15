const { z } = require('zod');
const userRepository = require('../repositories/userRepository');
const { hashPassword } = require('../utils/password');
const { logActivity } = require('../services/activityService');

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'sales'])
});

async function listUsersHandler(req, res) {
  try {
    const users = await userRepository.findAll();
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch users' });
  }
}

async function listSalesUsersHandler(req, res) {
  try {
    const users = await userRepository.findSalesUsers();
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch sales users' });
  }
}

async function createUserHandler(req, res) {
  try {
    const parsed = userSchema.parse(req.body);
    const passwordHash = await hashPassword(parsed.password);
    const user = await userRepository.createUser({
      name: parsed.name,
      email: parsed.email,
      password: passwordHash,
      role: parsed.role
    });
    await logActivity(req.user.id, 'user_created', user.id);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create user' });
  }
}

async function updateUserHandler(req, res) {
  try {
    const { name, email, role, is_active } = req.body;
    const updated = await userRepository.updateUser(req.params.id, {
      name,
      email,
      role,
      is_active
    });
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    await logActivity(req.user.id, 'user_updated', req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update user' });
  }
}

async function deleteUserHandler(req, res) {
  try {
    await userRepository.deleteUser(req.params.id);
    await logActivity(req.user.id, 'user_deleted', req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete user' });
  }
}

module.exports = {
  listUsersHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  listSalesUsersHandler
};

