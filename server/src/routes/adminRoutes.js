const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const feedbackController = require('../controllers/feedbackController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Categories can be viewed publicly (or by anyone), but modified only by ADMIN
router.get('/categories', adminController.getCategories);

// All subsequent administrative routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/users', adminController.getUsers);
router.post('/users/create-staff', adminController.createStaffUser);
router.get('/agents', adminController.getAgents);
router.post('/complaints/:id/assign', adminController.assignComplaint);
router.patch('/complaints/:id/status', adminController.adminUpdateComplaintStatus);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id/toggle', adminController.toggleCategory);
router.get('/feedback', feedbackController.getAllFeedback);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
