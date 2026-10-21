const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { emitNotification } = require('../utils/socket');

// @desc    Submit feedback and rating for a resolved complaint
// @route   POST /api/complaints/:id/feedback
// @access  Private (Owner USER only)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comments } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Ownership check
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your own complaints.',
      });
    }

    // Complaint must be Resolved or Closed to receive feedback
    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message: `Feedback can only be provided for resolved or closed complaints. Current status: ${complaint.status}`,
      });
    }

    // Check if feedback already submitted (one feedback per complaint)
    const existingFeedback = await Feedback.findOne({ complaint: complaint._id });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this complaint.',
      });
    }

    const feedback = await Feedback.create({
      complaint: complaint._id,
      user: req.user._id,
      rating: numRating,
      comments: comments ? comments.trim() : '',
    });

    // Record feedback event in complaint history
    complaint.history.push({
      previousStatus: complaint.status,
      newStatus: complaint.status,
      action: 'FEEDBACK_SUBMITTED',
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      note: `User rated ${numRating}/5 stars. ${comments ? `Review: "${comments.trim()}"` : ''}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // If an agent was assigned, notify them of the feedback
    if (complaint.assignedAgent) {
      const agentNotif = await Notification.create({
        recipient: complaint.assignedAgent,
        type: 'FEEDBACK',
        title: 'Feedback Received',
        message: `User submitted a ${numRating}-star rating for complaint #${complaint.complaintNumber}.`,
        relatedComplaint: complaint._id,
      });
      emitNotification(complaint.assignedAgent, agentNotif);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a specific complaint
// @route   GET /api/complaints/:id/feedback
// @access  Private (Owner USER, Assigned AGENT, or ADMIN)
exports.getComplaintFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ complaint: req.params.id }).populate(
      'user',
      'name email'
    );

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback records for reports
// @route   GET /api/admin/feedback
// @access  Private (ADMIN)
exports.getAllFeedback = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [feedbacks, total] = await Promise.all([
      Feedback.find()
        .populate('user', 'name email')
        .populate('complaint', 'complaintNumber title category status assignedAgent')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Feedback.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
