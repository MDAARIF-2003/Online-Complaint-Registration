const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All agent routes require authentication and AGENT role
router.use(authenticate, authorize('AGENT'));

router.get('/dashboard', agentController.getAgentDashboard);
router.get('/complaints', agentController.getAssignedComplaints);
router.patch('/complaints/:id/status', agentController.updateComplaintStatus);
router.post('/complaints/:id/notes', agentController.addProgressNote);

module.exports = router;
