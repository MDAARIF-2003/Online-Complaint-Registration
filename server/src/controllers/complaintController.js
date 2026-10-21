const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateComplaintNumber = require('../utils/generateComplaintNumber');
const { emitNotification, emitComplaintStatusUpdate } = require('../utils/socket');
const { recordAudit } = require('../utils/audit');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (USER)
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, contactPhone, contactAddress } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complaint title, description, and category.',
      });
    }

    // Process uploaded attachments if present
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
        });
      });
    }

    const complaintNumber = generateComplaintNumber();

    const initialHistory = [
      {
        previousStatus: '',
        newStatus: 'Submitted',
        action: 'COMPLAINT_SUBMITTED',
        actor: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        note: 'Complaint registered in the system.',
        timestamp: new Date(),
      },
    ];

    const complaint = await Complaint.create({
      complaintNumber,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority: priority || 'MEDIUM',
      user: req.user._id,
      contactPhone: contactPhone ? contactPhone.trim() : req.user.phone || '',
      contactAddress: contactAddress ? contactAddress.trim() : '',
      attachments,
      status: 'Submitted',
      history: initialHistory,
    });

    // Send confirmation in-app notification to the complainant
    const notification = await Notification.create({
      recipient: req.user._id,
      type: 'STATUS_UPDATE',
      title: 'Complaint Registered',
      message: `Your complaint #${complaint.complaintNumber} has been received. Our team will review it shortly.`,
      relatedComplaint: complaint._id,
    });
    emitNotification(req.user._id, notification);

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints list with search, filter, and pagination
// @route   GET /api/complaints
// @access  Private (USER, AGENT, ADMIN)
exports.getComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    // Role-based scope enforcement
    if (req.user.role === 'USER') {
      // Ordinary users only ever see their own complaints
      query.user = req.user._id;
    } else if (req.user.role === 'AGENT') {
      // Agents only see complaints assigned to them
      query.assignedAgent = req.user._id;
    }
    // Admins see all complaints by default

    // Filters
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }
    if (category && category !== 'ALL') {
      query.category = category;
    }

    // Search by title or complaintNumber
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { complaintNumber: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('user', 'name email phone')
        .populate('assignedAgent', 'name email phone department')
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

// @desc    Get single complaint details by ID
// @route   GET /api/complaints/:id
// @access  Private (Owner USER, Assigned AGENT, or ADMIN)
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedAgent', 'name email phone department');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Ownership & authorization check
    const isOwner = complaint.user._id.toString() === req.user._id.toString();
    const isAssignedAgent =
      complaint.assignedAgent &&
      complaint.assignedAgent._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this complaint.',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint lifecycle history
// @route   GET /api/complaints/:id/history
// @access  Private
exports.getComplaintHistory = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isAssignedAgent =
      complaint.assignedAgent &&
      complaint.assignedAgent.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view history for this complaint.',
      });
    }

    res.status(200).json({
      success: true,
      complaintNumber: complaint.complaintNumber,
      history: complaint.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reopen a resolved complaint
// @route   POST /api/complaints/:id/reopen
// @access  Private (Owner USER only)
exports.reopenComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid reason for reopening the complaint.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Verify ownership
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only reopen your own complaints.',
      });
    }

    // Verify valid status transition
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: `Only resolved complaints can be reopened. Current status: ${complaint.status}`,
      });
    }

    const previousStatus = complaint.status;
    complaint.status = 'Reopened';
    complaint.reopenReason = reason.trim();

    complaint.history.push({
      previousStatus,
      newStatus: 'Reopened',
      action: 'COMPLAINT_REOPENED',
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      note: `Reopened by user. Reason: ${reason.trim()}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify assigned agent if one exists
    if (complaint.assignedAgent) {
      const agentNotification = await Notification.create({
        recipient: complaint.assignedAgent,
        type: 'REOPENED',
        title: 'Complaint Reopened',
        message: `Complaint #${complaint.complaintNumber} has been reopened by the user: "${reason.trim()}"`,
        relatedComplaint: complaint._id,
      });
      emitNotification(complaint.assignedAgent, agentNotification);
    }

    emitComplaintStatusUpdate(complaint._id, {
      status: 'Reopened',
      complaintNumber: complaint.complaintNumber,
      updatedBy: req.user.name,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint has been reopened.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};
