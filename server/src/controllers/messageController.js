const Message = require('../models/Message');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { emitComplaintMessage, emitNotification } = require('../utils/socket');

// @desc    Get all messages for a specific complaint conversation
// @route   GET /api/complaints/:id/messages
// @access  Private (Owner USER, Assigned AGENT, or ADMIN)
exports.getMessages = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Access control: Only owner, assigned agent, or admin
    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isAssignedAgent =
      complaint.assignedAgent &&
      complaint.assignedAgent.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You cannot view messages for this complaint.',
      });
    }

    const messages = await Message.find({ complaint: req.params.id })
      .populate('sender', 'name email role')
      .sort('createdAt');

    // Mark messages as read by current user if not already
    await Message.updateMany(
      {
        complaint: req.params.id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message within a complaint conversation
// @route   POST /api/complaints/:id/messages
// @access  Private (Owner USER, Assigned AGENT, or ADMIN)
exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

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
        message: 'Access denied. You cannot send messages for this complaint.',
      });
    }

    const newMessage = await Message.create({
      complaint: complaint._id,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      readBy: [req.user._id],
    });

    const populated = await Message.findById(newMessage._id).populate('sender', 'name email role');

    // Emit live message to Socket room
    emitComplaintMessage(complaint._id, populated);

    // Determine recipient for notification
    let recipientId = null;
    if (isOwner && complaint.assignedAgent) {
      recipientId = complaint.assignedAgent;
    } else if (isAssignedAgent) {
      recipientId = complaint.user;
    }

    if (recipientId) {
      const notif = await Notification.create({
        recipient: recipientId,
        type: 'MESSAGE',
        title: `New message on #${complaint.complaintNumber}`,
        message: `${req.user.name} (${req.user.role}): ${message.slice(0, 80)}${message.length > 80 ? '...' : ''}`,
        relatedComplaint: complaint._id,
      });
      emitNotification(recipientId, notif);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};
