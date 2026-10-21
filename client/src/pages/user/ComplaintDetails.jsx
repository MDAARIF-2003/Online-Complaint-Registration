import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Phone,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Download,
  Star,
  RefreshCw,
  Send,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import ChatWindow from '../../components/chat/ChatWindow';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [complaint, setComplaint] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Reopen modal/prompt state
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [submittingReopen, setSubmittingReopen] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosClient.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      }

      // Check feedback
      try {
        const feedRes = await axiosClient.get(`/complaints/${id}/feedback`);
        if (feedRes.data.success && feedRes.data.feedback) {
          setFeedback(feedRes.data.feedback);
        }
      } catch (fErr) {
        // ignore
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();

    // Listen for live status changes on this complaint
    if (socket && id) {
      socket.emit('join_complaint', id);
      socket.on('status_updated', (payload) => {
        setComplaint((prev) => (prev ? { ...prev, status: payload.status } : prev));
        setActionMessage(`Status updated to "${payload.status}" just now.`);
        fetchComplaintDetails();
      });
    }

    return () => {
      if (socket && id) {
        socket.emit('leave_complaint', id);
        socket.off('status_updated');
      }
    };
  }, [id, socket]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      const res = await axiosClient.post(`/complaints/${id}/feedback`, {
        rating,
        comments,
      });
      if (res.data.success) {
        setFeedback(res.data.feedback);
        setActionMessage('Feedback submitted successfully. Thank you!');
        fetchComplaintDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    try {
      setSubmittingReopen(true);
      const res = await axiosClient.post(`/complaints/${id}/reopen`, {
        reason: reopenReason.trim(),
      });
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setShowReopenBox(false);
        setActionMessage('Complaint has been successfully reopened.');
        fetchComplaintDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reopen complaint.');
    } finally {
      setSubmittingReopen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading grievance file..." />;
  }

  if (error || !complaint) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
          {error || 'Complaint not found.'}
        </div>
        <Link to="/user/dashboard" className="btn btn-primary rounded-pill px-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === complaint.user?._id || user?.id === complaint.user?._id;
  const isAgent = user?.role === 'AGENT';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="container py-4">
      {/* Top Navigation */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link
          to={isAgent ? '/agent/complaints' : isAdmin ? '/admin/complaints' : '/user/my-complaints'}
          className="btn btn-outline-secondary btn-sm rounded-pill d-inline-flex align-items-center gap-1"
        >
          <ArrowLeft size={15} /> Back to List
        </Link>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill d-inline-flex align-items-center gap-1"
            onClick={fetchComplaintDetails}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success alert-dismissible fade show small py-2 px-3 rounded-3 mb-3">
          {actionMessage}
          <button
            type="button"
            className="btn-close p-2"
            onClick={() => setActionMessage('')}
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="row g-4">
        {/* Left Column: Complaint Details & Timeline */}
        <div className="col-12 col-lg-7">
          {/* Card: Core Complaint Info */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
            <div className="card-header bg-white py-3 px-4 border-bottom">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <span className="badge bg-light text-primary border font-monospace px-3 py-2 fs-6 fw-bold">
                  {complaint.complaintNumber}
                </span>
                <div className="d-flex gap-2 align-items-center">
                  <PriorityBadge priority={complaint.priority} />
                  <StatusBadge status={complaint.status} />
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              <h4 className="fw-bold text-dark mb-2">{complaint.title}</h4>
              <div className="d-flex flex-wrap gap-3 text-muted small mb-4 pb-3 border-bottom">
                <span className="d-flex align-items-center gap-1">
                  <FileText size={14} className="text-primary" />
                  Category: <strong>{complaint.category}</strong>
                </span>
                <span className="d-flex align-items-center gap-1">
                  <Calendar size={14} className="text-primary" />
                  Registered: {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold text-secondary text-uppercase small" style={{ fontSize: '0.75rem' }}>
                  Detailed Description
                </h6>
                <p className="text-dark bg-light p-3 rounded-3 mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {complaint.description}
                </p>
              </div>

              {/* Resolution Notes Display (if present) */}
              {complaint.resolutionNotes && (
                <div className="mb-4 p-3 bg-success-subtle border border-success-subtle rounded-3">
                  <h6 className="fw-bold text-success d-flex align-items-center gap-2 mb-2">
                    <CheckCircle2 size={18} /> Official Resolution Report
                  </h6>
                  <p className="small text-success-emphasis mb-1" style={{ whiteSpace: 'pre-line' }}>
                    {complaint.resolutionNotes}
                  </p>
                  {complaint.resolvedAt && (
                    <small className="text-muted d-block mt-2">
                      Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
                    </small>
                  )}
                </div>
              )}

              {/* Reopen Reason Display (if reopened) */}
              {complaint.reopenReason && (
                <div className="mb-4 p-3 bg-danger-subtle border border-danger-subtle rounded-3">
                  <h6 className="fw-bold text-danger d-flex align-items-center gap-2 mb-1">
                    <RotateCcw size={18} /> Reopen Notice
                  </h6>
                  <p className="small text-danger-emphasis mb-0">
                    Reason: {complaint.reopenReason}
                  </p>
                </div>
              )}

              {/* Complainant & Location Details */}
              <div className="row g-3 p-3 bg-light rounded-3 mb-4">
                <div className="col-12 col-sm-6">
                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Complainant</small>
                  <span className="fw-semibold text-dark small d-flex align-items-center gap-1">
                    <User size={13} className="text-primary" /> {complaint.user?.name}
                  </span>
                  <span className="text-muted small d-block">{complaint.user?.email}</span>
                </div>

                <div className="col-12 col-sm-6">
                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Contact Phone</small>
                  <span className="fw-semibold text-dark small d-flex align-items-center gap-1">
                    <Phone size={13} className="text-primary" /> {complaint.contactPhone || 'Not specified'}
                  </span>
                </div>

                {complaint.contactAddress && (
                  <div className="col-12 border-top pt-2 mt-2">
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Reported Location</small>
                    <span className="text-dark small d-flex align-items-center gap-1">
                      <MapPin size={13} className="text-danger" /> {complaint.contactAddress}
                    </span>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-secondary text-uppercase small mb-2" style={{ fontSize: '0.75rem' }}>
                    Attached Documents ({complaint.attachments.length})
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {complaint.attachments.map((att, i) => {
                      const fileUrl = `http://localhost:5000${att.path}`;
                      const isImage = att.mimeType?.startsWith('image/');
                      return (
                        <a
                          key={att._id || i}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary btn-sm rounded-3 d-inline-flex align-items-center gap-2 p-2 bg-white"
                        >
                          <Paperclip size={14} className="text-primary" />
                          <span className="text-truncate" style={{ maxWidth: '180px' }}>
                            {att.originalName}
                          </span>
                          <small className="text-muted">({(att.size / 1024).toFixed(0)} KB)</small>
                          <Download size={13} className="text-muted" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reopen Action Button for Owner */}
              {isOwner && complaint.status === 'Resolved' && !showReopenBox && (
                <div className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold mb-0 text-dark small">Still experiencing issues?</h6>
                    <small className="text-muted">You can reopen this grievance if it wasn't resolved satisfactorily.</small>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                    onClick={() => setShowReopenBox(true)}
                  >
                    Reopen Complaint
                  </button>
                </div>
              )}

              {/* Reopen Form Box */}
              {showReopenBox && (
                <form onSubmit={handleReopenSubmit} className="p-3 bg-light rounded-3 border mb-3">
                  <h6 className="fw-bold text-danger mb-2 small">Explain why you are reopening:</h6>
                  <textarea
                    className="form-control mb-2 small"
                    rows={3}
                    placeholder="Provide details on what remains unresolved..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    required
                  />
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-light rounded-pill px-3"
                      onClick={() => setShowReopenBox(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-danger rounded-pill px-3"
                      disabled={submittingReopen || !reopenReason.trim()}
                    >
                      {submittingReopen ? 'Submitting...' : 'Confirm Reopen'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Feedback & Satisfaction Section (for Resolved/Closed) */}
          {['Resolved', 'Closed'].includes(complaint.status) && (
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
              <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <Star size={20} className="text-warning fill-warning" /> Resolution Feedback
              </h5>
              <p className="text-muted small mb-3">
                Complainant feedback helps ensure service accountability and quality.
              </p>

              {feedback ? (
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={18}
                        className={s <= feedback.rating ? 'text-warning fill-warning' : 'text-muted'}
                      />
                    ))}
                    <span className="ms-2 fw-bold text-dark small">{feedback.rating}/5 Stars</span>
                  </div>
                  {feedback.comments && (
                    <p className="small text-secondary mb-0 fst-italic">
                      &ldquo;{feedback.comments}&rdquo;
                    </p>
                  )}
                  <small className="text-muted d-block mt-2">
                    Submitted on: {new Date(feedback.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ) : isOwner ? (
                <form onSubmit={handleFeedbackSubmit} className="p-3 bg-light rounded-3 border">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Rate the resolution quality:
                  </label>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn p-1 border-0"
                        onClick={() => setRating(star)}
                      >
                        <Star
                          size={24}
                          className={star <= rating ? 'text-warning fill-warning' : 'text-secondary'}
                        />
                      </button>
                    ))}
                    <span className="fw-bold small text-primary ms-2">{rating} of 5 Stars</span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">
                      Comments / Experience (Optional):
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      placeholder="Was your problem resolved promptly? How was the agent communication?"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill btn-sm px-4 fw-semibold"
                    disabled={submittingFeedback}
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Rating & Feedback'}
                  </button>
                </form>
              ) : (
                <div className="text-muted small p-3 bg-light rounded-3 text-center">
                  Complainant has not yet submitted feedback for this resolution.
                </div>
              )}
            </div>
          )}

          {/* Audit History Timeline */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold text-dark mb-1">Audit Trail &amp; Status History</h5>
            <p className="text-muted small mb-3">
              Chronological log of all system transitions and agent interactions
            </p>
            <ComplaintTimeline history={complaint.history} />
          </div>
        </div>

        {/* Right Column: Assigned Agent Card & Live Chat */}
        <div className="col-12 col-lg-5">
          {/* Agent Info Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
            <h6 className="fw-bold text-secondary text-uppercase small mb-3" style={{ fontSize: '0.75rem' }}>
              Handling Support Agent
            </h6>

            {complaint.assignedAgent ? (
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center">
                  <User size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">{complaint.assignedAgent.name}</h6>
                  <span className="badge bg-info-subtle text-info-emphasis rounded-pill px-2 py-1 small my-1">
                    {complaint.assignedAgent.department || 'Technical Support'}
                  </span>
                  <p className="text-muted small mb-0">{complaint.assignedAgent.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 text-muted">
                <Clock size={28} className="text-secondary opacity-50 mb-2" />
                <p className="small mb-0 fw-medium">No agent assigned yet.</p>
                <small className="text-muted">Administrator will assign an agent based on workload.</small>
              </div>
            )}
          </div>

          {/* Chat / Communication Component */}
          <ChatWindow
            complaintId={complaint._id}
            complaintNumber={complaint.complaintNumber}
            assignedAgent={complaint.assignedAgent}
            isClosed={complaint.status === 'Closed'}
          />
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
