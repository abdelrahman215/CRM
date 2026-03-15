const express = require('express');
const { loginHandler, refreshHandler, logoutHandler } = require('../controllers/authController');
const {
  listUsersHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  listSalesUsersHandler
} = require('../controllers/userController');
const {
  getLeadsHandler,
  createLeadHandler,
  updateLeadHandler,
  deleteLeadHandler,
  assignLeadHandler,
   getLeadByIdHandler,
   updateLeadStatusHandler,
  adminAnalyticsHandler,
  salesAnalyticsHandler
} = require('../controllers/leadController');
const { addNoteHandler, getNotesHandler } = require('../controllers/noteController');
const {
  listClientsHandler,
  createClientHandler,
  updateClientHandler,
  deleteClientHandler
} = require('../controllers/clientController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Auth
router.post('/auth/login', loginLimiter, loginHandler);
router.post('/auth/refresh', refreshHandler);
router.post('/auth/logout', authMiddleware, logoutHandler);

// Users (Admin only)
router.get('/users', authMiddleware, authorizeRoles('admin'), listUsersHandler);
router.post('/users', authMiddleware, authorizeRoles('admin'), createUserHandler);
router.put('/users/:id', authMiddleware, authorizeRoles('admin'), updateUserHandler);
router.delete('/users/:id', authMiddleware, authorizeRoles('admin'), deleteUserHandler);
router.get('/users/sales', authMiddleware, authorizeRoles('admin'), listSalesUsersHandler);

// Leads
router.get('/leads', authMiddleware, getLeadsHandler);
router.get('/leads/:id', authMiddleware, getLeadByIdHandler);
router.post('/leads', authMiddleware, authorizeRoles('admin'), createLeadHandler);
router.put('/leads/:id', authMiddleware, updateLeadHandler);
router.delete('/leads/:id', authMiddleware, authorizeRoles('admin'), deleteLeadHandler);
router.patch('/leads/:id/assign', authMiddleware, authorizeRoles('admin'), assignLeadHandler);
router.put('/leads/:id/assign', authMiddleware, authorizeRoles('admin'), assignLeadHandler);
router.put('/leads/:id/status', authMiddleware, updateLeadStatusHandler);

// Notes
router.post('/leads/:id/notes', authMiddleware, addNoteHandler);
router.get('/leads/:id/notes', authMiddleware, getNotesHandler);

// Analytics
router.get('/analytics/admin', authMiddleware, authorizeRoles('admin'), adminAnalyticsHandler);
router.get('/analytics/sales', authMiddleware, authorizeRoles('sales'), salesAnalyticsHandler);

// Client data (Sales users)
router.get('/clients', authMiddleware, authorizeRoles('sales'), listClientsHandler);
router.post('/clients', authMiddleware, authorizeRoles('sales'), createClientHandler);
router.put('/clients/:id', authMiddleware, authorizeRoles('sales'), updateClientHandler);
router.delete('/clients/:id', authMiddleware, authorizeRoles('sales'), deleteClientHandler);

module.exports = router;

