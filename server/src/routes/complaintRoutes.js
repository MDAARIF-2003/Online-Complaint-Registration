const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const messageController = require('../controllers/messageController');
const feedbackController = require('../controllers/feedbackController');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

// Base complaints routes
router.post('/', authenticate, upload.array('attachments', 5), complaintController.createComplaint);
router.get('/', authenticate, complaintController.getComplaints);
router.get('/:id', authenticate, complaintController.getComplaintById);
router.get('/:id/history', authenticate, complaintController.getComplaintHistory);
router.post('/:id/reopen', authenticate, complaintController.reopenComplaint);

// Complaint messaging routes
router.get('/:id/messages', authenticate, messageController.getMessages);
router.post('/:id/messages', authenticate, messageController.sendMessage);

// Complaint feedback routes
router.post('/:id/feedback', authenticate, feedbackController.submitFeedback);
router.get('/:id/feedback', authenticate, feedbackController.getComplaintFeedback);

module.exports = router;
