const mongoose = require('mongoose');

const historyItemSchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      default: '',
    },
    newStatus: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      default: '',
    },
    actorRole: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'MEDIUM',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'Submitted',
          'Pending',
          'Assigned',
          'In Progress',
          'Resolved',
          'Reopened',
          'Closed',
        ],
        message: '{VALUE} is not a valid complaint status',
      },
      default: 'Submitted',
      index: true,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    contactAddress: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: [attachmentSchema],
    resolutionNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reopenReason: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    history: [historyItemSchema],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast search and filtering
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ user: 1, status: 1 });
complaintSchema.index({ assignedAgent: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
