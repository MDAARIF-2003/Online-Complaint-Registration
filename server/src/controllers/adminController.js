const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { emitNotification, emitComplaintStatusUpdate } = require('../utils/socket');
const { recordAudit } = require('../utils/audit');

// Helper to escape regex metacharacters in search queries
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get comprehensive admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (ADMIN)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAgents,
      totalComplaints,
      submitted,
      pending,
      assigned,
      inProgress,
      resolved,
      reopened,
      closed,
      priorityCounts,
      categoryCounts,
      feedbackStats,
      recentComplaints,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'AGENT' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Submitted' }),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'Assigned' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Reopened' }),
      Complaint.countDocuments({ status: 'Closed' }),
      Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalFeedbacks: { $sum: 1 },
          },
        },
      ]),
      Complaint.find()
        .populate('user', 'name email')
        .populate('assignedAgent', 'name email department')
        .sort('-createdAt')
        .limit(6),
      AuditLog.find().sort('-createdAt').limit(6),
    ]);

    // Format priority map
    const priorities = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    priorityCounts.forEach((item) => {
      if (item._id) priorities[item._id] = item.count;
    });

    // Format category distribution
    const categories = categoryCounts.map((c) => ({
      name: c._id || 'Uncategorized',
      count: c.count,
    }));

    // Calculate agent workloads
    const agents = await User.find({ role: 'AGENT', status: 'ACTIVE' }).select('name email department');
    const agentWorkloads = await Promise.all(
      agents.map(async (agent) => {
        const activeCount = await Complaint.countDocuments({
          assignedAgent: agent._id,
          status: { $in: ['Assigned', 'In Progress', 'Pending', 'Reopened'] },
        });
        const resolvedCount = await Complaint.countDocuments({
          assignedAgent: agent._id,
          status: 'Resolved',
        });
        return {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          department: agent.department,
          activeCount,
          resolvedCount,
        };
      })
    );

    const averageRating =
      feedbackStats.length > 0 && feedbackStats[0].avgRating
        ? Number(feedbackStats[0].avgRating.toFixed(1))
        : 5.0;

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalAgents,
        totalComplaints,
        statusBreakdown: {
          submitted,
          pending,
          assigned,
          inProgress,
          resolved,
          reopened,
          closed,
          totalUnresolved: submitted + pending + assigned + inProgress + reopened,
        },
        priorities,
        categories,
        averageRating,
        totalFeedbacks: feedbackStats.length > 0 ? feedbackStats[0].totalFeedbacks : 0,
      },
      agentWorkloads,
      recentComplaints,
      recentAuditLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filtering, search, and pagination
// @route   GET /api/admin/users
// @access  Private (ADMIN)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role && role !== 'ALL') query.role = role;
    if (status && status !== 'ALL') query.status = status;
    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const regex = new RegExp(sanitized, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of active agents for assignment dropdowns
// @route   GET /api/admin/agents
// @access  Private (ADMIN)
exports.getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: 'AGENT', status: 'ACTIVE' })
      .select('name email phone department status createdAt')
      .sort('name');

    // Attach active assigned count to each agent
    const agentsWithWorkload = await Promise.all(
      agents.map(async (agent) => {
        const activeComplaints = await Complaint.countDocuments({
          assignedAgent: agent._id,
          status: { $in: ['Assigned', 'In Progress', 'Pending', 'Reopened'] },
        });
        return {
          ...agent.toObject(),
          activeComplaints,
        };
      })
    );

    res.status(200).json({
      success: true,
      agents: agentsWithWorkload,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign or reassign a complaint to an agent
// @route   POST /api/admin/complaints/:id/assign
// @access  Private (ADMIN)
exports.assignComplaint = async (req, res, next) => {
  try {
    const { agentId, note } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID is required for assignment.',
      });
    }

    const [complaint, agent] = await Promise.all([
      Complaint.findById(req.params.id).populate('user', 'name email'),
      User.findById(agentId),
    ]);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (complaint.status === 'Closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign agents to a closed complaint.',
      });
    }

    if (!agent || agent.role !== 'AGENT' || agent.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not an active agent.',
      });
    }

    const previousAgent = complaint.assignedAgent;
    const isReassignment = !!previousAgent;
    const previousStatus = complaint.status;

    complaint.assignedAgent = agent._id;
    // Update status to 'Assigned' if currently 'Submitted' or 'Pending'
    if (complaint.status === 'Submitted' || complaint.status === 'Pending') {
      complaint.status = 'Assigned';
    }

    const assignmentAction = isReassignment ? 'AGENT_REASSIGNED' : 'AGENT_ASSIGNED';
    const logNote = note || `Assigned to Agent ${agent.name} (${agent.department})`;

    complaint.history.push({
      previousStatus,
      newStatus: complaint.status,
      action: assignmentAction,
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      note: logNote,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify the Agent
    const agentNotification = await Notification.create({
      recipient: agent._id,
      type: 'ASSIGNMENT',
      title: 'New Complaint Assigned',
      message: `You have been assigned to handle complaint #${complaint.complaintNumber} ("${complaint.title}").`,
      relatedComplaint: complaint._id,
    });
    emitNotification(agent._id, agentNotification);

    // Notify the User
    const userNotification = await Notification.create({
      recipient: complaint.user._id,
      type: 'STATUS_UPDATE',
      title: 'Agent Assigned to Your Complaint',
      message: `Agent ${agent.name} from ${agent.department} department has been assigned to your complaint #${complaint.complaintNumber}.`,
      relatedComplaint: complaint._id,
    });
    emitNotification(complaint.user._id, userNotification);

    emitComplaintStatusUpdate(complaint._id, {
      status: complaint.status,
      assignedAgent: { id: agent._id, name: agent.name, department: agent.department },
      complaintNumber: complaint.complaintNumber,
    });

    await recordAudit({
      req,
      action: assignmentAction,
      targetType: 'COMPLAINT',
      targetId: complaint._id,
      details: {
        complaintNumber: complaint.complaintNumber,
        agentId: agent._id,
        agentName: agent.name,
        isReassignment,
      },
    });

    res.status(200).json({
      success: true,
      message: `Complaint #${complaint.complaintNumber} successfully assigned to ${agent.name}.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new Agent or Admin account directly from admin panel
// @route   POST /api/admin/users/create-staff
// @access  Private (ADMIN)
exports.createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'AGENT', department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (!['AGENT', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either AGENT or ADMIN.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const newStaff = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      department: department ? department.trim() : 'General Support',
      phone: phone ? phone.trim() : '',
      status: 'ACTIVE',
    });

    await recordAudit({
      req,
      action: 'STAFF_ACCOUNT_CREATED',
      targetType: 'USER',
      targetId: newStaff._id,
      details: { email: newStaff.email, role: newStaff.role, department: newStaff.department },
    });

    res.status(201).json({
      success: true,
      message: `${role} account for "${newStaff.name}" created successfully.`,
      user: newStaff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (ACTIVE / INACTIVE)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (ADMIN)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'ACTIVE' or 'INACTIVE'.",
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot deactivate their own account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.status = status;
    await user.save();

    await recordAudit({
      req,
      action: 'USER_STATUS_UPDATED',
      targetType: 'USER',
      targetId: user._id,
      details: { email: user.email, newStatus: status },
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or department (e.g. promote to AGENT)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (ADMIN)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role, department } = req.body;

    if (role && !['USER', 'AGENT', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.',
      });
    }

    if (req.params.id === req.user._id.toString() && role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own administrator role.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const prevRole = user.role;
    if (role) user.role = role;
    if (department !== undefined) user.department = department.trim();

    await user.save();

    await recordAudit({
      req,
      action: 'USER_ROLE_UPDATED',
      targetType: 'USER',
      targetId: user._id,
      details: { email: user.email, prevRole, newRole: user.role, department: user.department },
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${user.role}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manual complaint status override with audit
// @route   PATCH /api/admin/complaints/:id/status
// @access  Private (ADMIN)
exports.adminUpdateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = [
      'Submitted',
      'Pending',
      'Assigned',
      'In Progress',
      'Resolved',
      'Reopened',
      'Closed',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const previousStatus = complaint.status;
    complaint.status = status;
    if (status === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
      if (note) complaint.resolutionNotes = note;
    }
    if (status === 'Closed') {
      complaint.closedAt = new Date();
    }

    complaint.history.push({
      previousStatus,
      newStatus: status,
      action: 'ADMIN_STATUS_OVERRIDE',
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      note: note || `Status changed to ${status} by Administrator.`,
      timestamp: new Date(),
    });

    await complaint.save();

    emitComplaintStatusUpdate(complaint._id, {
      status,
      complaintNumber: complaint.complaintNumber,
      updatedBy: req.user.name,
    });

    await recordAudit({
      req,
      action: 'COMPLAINT_STATUS_ADMIN_OVERRIDE',
      targetType: 'COMPLAINT',
      targetId: complaint._id,
      details: { previousStatus, newStatus: status, note },
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system categories
// @route   GET /api/admin/categories
// @access  Public / Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new complaint category
// @route   POST /api/admin/categories
// @access  Private (ADMIN)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
    });

    await recordAudit({
      req,
      action: 'CATEGORY_CREATED',
      targetType: 'CATEGORY',
      targetId: category._id,
      details: { name: category.name },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle category active status
// @route   PATCH /api/admin/categories/:id/toggle
// @access  Private (ADMIN)
exports.toggleCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category '${category.name}' is now ${category.isActive ? 'Active' : 'Inactive'}.`,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get administrative activity / audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (ADMIN)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort('-createdAt').skip(skip).limit(limitNum),
      AuditLog.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      logs,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};
