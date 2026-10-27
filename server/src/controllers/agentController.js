const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { emitNotification, emitComplaintStatusUpdate } = require('../utils/socket');

// Helper to escape regex metacharacters in search queries
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all complaints assigned to logged in agent
// @route   GET /api/agent/complaints
// @access  Private (AGENT)
exports.getAssignedComplaints = async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { assignedAgent: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      query.$or = [{ title: searchRegex }, { complaintNumber: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('user', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update status of assigned complaint
// @route   PATCH /api/agent/complaints/:id/status
// @access  Private (AGENT)
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status: targetStatus, note, resolutionNotes } = req.body;

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: 'Target status is required.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Agent permission check: Must be assigned to this specific complaint
    if (!complaint.assignedAgent || complaint.assignedAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update complaints assigned directly to you.',
      });
    }

    const current = complaint.status;

    // Define permitted agent status transitions
    const validTransitions = {
      Assigned: ['In Progress'],
      'In Progress': ['Resolved', 'Pending'],
      Pending: ['In Progress'],
      Reopened: ['In Progress', 'Resolved'],
    };

    const allowed = validTransitions[current] || [];
    if (!allowed.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${current}' to '${targetStatus}'. Allowed transitions: ${allowed.join(', ') || 'None'}`,
      });
    }

    // If resolving, require resolution notes
    if (targetStatus === 'Resolved') {
      const notes = resolutionNotes || note;
      if (!notes || !notes.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Resolution notes are required when marking a complaint as Resolved.',
        });
      }
      complaint.resolutionNotes = notes.trim();
      complaint.resolvedAt = new Date();
    }

    const previousStatus = complaint.status;
    complaint.status = targetStatus;

    complaint.history.push({
      previousStatus,
      newStatus: targetStatus,
      action: 'STATUS_UPDATED',
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      note: note || (targetStatus === 'Resolved' ? complaint.resolutionNotes : `Status updated to ${targetStatus}`),
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify the user about the status update
    const userNotification = await Notification.create({
      recipient: complaint.user,
      type: 'STATUS_UPDATE',
      title: 'Complaint Status Updated',
      message: `Your complaint #${complaint.complaintNumber} has been updated to "${targetStatus}".`,
      relatedComplaint: complaint._id,
    });
    emitNotification(complaint.user, userNotification);

    emitComplaintStatusUpdate(complaint._id, {
      status: targetStatus,
      complaintNumber: complaint.complaintNumber,
      updatedBy: req.user.name,
    });

    res.status(200).json({
      success: true,
      message: `Complaint status successfully updated to '${targetStatus}'.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add progress note to complaint without changing status
// @route   POST /api/agent/complaints/:id/notes
// @access  Private (AGENT)
exports.addProgressNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note content cannot be empty.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (!complaint.assignedAgent || complaint.assignedAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only add notes to complaints assigned to you.',
      });
    }

    complaint.history.push({
      previousStatus: complaint.status,
      newStatus: complaint.status,
      action: 'NOTE_ADDED',
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      note: note.trim(),
      timestamp: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Progress note added to complaint history.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for assigned agent
// @route   GET /api/agent/dashboard
// @access  Private (AGENT)
exports.getAgentDashboard = async (req, res, next) => {
  try {
    const agentId = req.user._id;

    const [totalAssigned, inProgress, resolved, reopened, pending, recentComplaints] =
      await Promise.all([
        Complaint.countDocuments({ assignedAgent: agentId }),
        Complaint.countDocuments({ assignedAgent: agentId, status: 'In Progress' }),
        Complaint.countDocuments({ assignedAgent: agentId, status: 'Resolved' }),
        Complaint.countDocuments({ assignedAgent: agentId, status: 'Reopened' }),
        Complaint.countDocuments({ assignedAgent: agentId, status: 'Pending' }),
        Complaint.find({ assignedAgent: agentId })
          .populate('user', 'name email phone')
          .sort('-updatedAt')
          .limit(5),
      ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalAssigned,
        inProgress,
        resolved,
        reopened,
        pending,
        activeWorkload: inProgress + reopened + pending,
      },
      recentComplaints,
    });
  } catch (error) {
    next(error);
  }
};
