import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Download,
  PlusCircle,
  MessageSquare,
  RefreshCw,
  Save,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import ChatWindow from '../../components/chat/ChatWindow';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AgentComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [complaint, setComplaint] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Agent action state
  const [progressNote, setProgressNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosClient.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      }

      try {
        const fRes = await axiosClient.get(`/complaints/${id}/feedback`);
        if (fRes.data.success && fRes.data.feedback) {
          setFeedback(fRes.data.feedback);
        }
      } catch (fErr) {
        // ignore
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();

    if (socket && id) {
      socket.emit('join_complaint', id);
      socket.on('status_updated', (payload) => {
        setComplaint((prev) => (prev ? { ...prev, status: payload.status } : prev));
        setSuccessMsg(`Status updated to "${payload.status}".`);
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

  // Transition status: Assigned -> In Progress
  const handleStartProgress = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await axiosClient.patch(`/agent/complaints/${id}/status`, {
        status: 'In Progress',
        note: `Technician ${user?.name} commenced diagnostic and resolution work.`,
      });
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setSuccessMsg('Complaint status moved to In Progress.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add intermediate progress note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!progressNote.trim()) return;

    try {
      setActionLoading(true);
      setError('');
      const res = await axiosClient.post(`/agent/complaints/${id}/notes`, {
        note: progressNote.trim(),
      });
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setProgressNote('');
        setSuccessMsg('Progress note logged to complaint history.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add progress note.');
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve complaint with resolution notes
  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError('Please provide resolution notes explaining what actions were performed.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const res = await axiosClient.patch(`/agent/complaints/${id}/status`, {
        status: 'Resolved',
        resolutionNotes: resolutionNotes.trim(),
      });
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setShowResolveModal(false);
        setResolutionNotes('');
        setSuccessMsg('Complaint marked as Resolved. Complainant notified.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading ticket..." />;
  }

  if (error && !complaint) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
          {error}
        </div>
        <Link to="/agent/complaints" className="btn btn-primary rounded-pill px-4">
          Back to Queue
        </Link>
      </div>
    );
  }

  const canStart = complaint.status === 'Assigned';
  const canResolve = ['In Progress', 'Reopened'].includes(complaint.status);

  return (
    <div className="container py-4">
      {/* Top Bar */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link
          to="/agent/complaints"
          className="btn btn-outline-secondary btn-sm rounded-pill d-inline-flex align-items-center gap-1"
        >
          <ArrowLeft size={15} /> Back to Assigned Queue
        </Link>
        <button
          className="btn btn-outline-secondary btn-sm rounded-pill d-inline-flex align-items-center gap-1"
          onClick={fetchComplaintDetails}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show small py-2 px-3 rounded-3 mb-3">
          {successMsg}
          <button
            type="button"
            className="btn-close p-2"
            onClick={() => setSuccessMsg('')}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 px-3 rounded-3 mb-3">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Complaint Details & Agent Action Panel */}
        <div className="col-12 col-lg-7">
          {/* Main Info Card */}
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
                <span>Category: <strong>{complaint.category}</strong></span>
                <span>Logged: {new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h6 className="fw-bold text-secondary text-uppercase small" style={{ fontSize: '0.75rem' }}>
                  Complainant Grievance Statement
                </h6>
                <p className="text-dark bg-light p-3 rounded-3 mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {complaint.description}
                </p>
              </div>

              {/* Complainant Contact & Address */}
              <div className="row g-3 p-3 bg-light rounded-3 mb-4">
                <div className="col-12 col-sm-6">
                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Complainant Name</small>
                  <span className="fw-semibold text-dark small d-flex align-items-center gap-1">
                    <User size={13} className="text-primary" /> {complaint.user?.name}
                  </span>
                  <span className="text-muted small d-block">{complaint.user?.email}</span>
                </div>

                <div className="col-12 col-sm-6">
                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Callback Phone</small>
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

              {/* Attachments */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-secondary text-uppercase small mb-2" style={{ fontSize: '0.75rem' }}>
                    Uploaded Evidence ({complaint.attachments.length})
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {complaint.attachments.map((att, i) => (
                      <a
                        key={att._id || i}
                        href={`http://localhost:5000${att.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-secondary btn-sm rounded-3 d-inline-flex align-items-center gap-2 p-2 bg-white"
                      >
                        <Paperclip size={14} className="text-primary" />
                        <span className="text-truncate" style={{ maxWidth: '180px' }}>{att.originalName}</span>
                        <Download size={13} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Reopen notice if present */}
              {complaint.reopenReason && (
                <div className="p-3 bg-danger-subtle border border-danger-subtle rounded-3 mb-4">
                  <h6 className="fw-bold text-danger mb-1 small">Reopened by Citizen:</h6>
                  <p className="small text-danger-emphasis mb-0">{complaint.reopenReason}</p>
                </div>
              )}

              {/* Existing Resolution Notes */}
              {complaint.resolutionNotes && (
                <div className="p-3 bg-success-subtle border border-success-subtle rounded-3 mb-4">
                  <h6 className="fw-bold text-success mb-1 small">Resolution Summary:</h6>
                  <p className="small text-success-emphasis mb-0">{complaint.resolutionNotes}</p>
                  <small className="text-muted d-block mt-1">
                    Resolved at: {new Date(complaint.resolvedAt).toLocaleString()}
                  </small>
                </div>
              )}

              {/* AGENT ACTION CONTROLS */}
              <div className="p-4 bg-light rounded-4 border">
                <h6 className="fw-bold text-dark mb-3">Agent Resolution Controls</h6>

                {canStart && (
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <p className="small text-dark fw-medium mb-0">Ready to begin diagnostic or on-site work?</p>
                      <small className="text-muted">Transition status from Assigned to In Progress</small>
                    </div>
                    <button
                      className="btn btn-primary rounded-pill px-4 shadow-sm"
                      onClick={handleStartProgress}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Updating...' : 'Start Progress'}
                    </button>
                  </div>
                )}

                {canResolve && (
                  <div>
                    {!showResolveModal ? (
                      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                        <span className="small text-muted">Issue diagnosis active. Ready to close?</span>
                        <button
                          className="btn btn-success rounded-pill px-4 fw-semibold shadow-sm"
                          onClick={() => setShowResolveModal(true)}
                        >
                          <CheckCircle2 size={16} className="me-1 d-inline" /> Mark as Resolved
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleResolveComplaint} className="mt-2">
                        <label className="form-label small fw-semibold text-dark">
                          Official Resolution Report <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control mb-2 small"
                          rows={4}
                          placeholder="Detail the remedial steps taken, parts replaced, software patches deployed, or verification conducted..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          required
                        />
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-light rounded-pill px-3"
                            onClick={() => setShowResolveModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-sm btn-success rounded-pill px-4 fw-semibold"
                            disabled={actionLoading || !resolutionNotes.trim()}
                          >
                            {actionLoading ? 'Saving...' : 'Submit Resolution'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Add Progress Note */}
                {['In Progress', 'Assigned', 'Reopened'].includes(complaint.status) && (
                  <form onSubmit={handleAddNote} className="mt-4 pt-3 border-top">
                    <label className="form-label small fw-semibold text-secondary">
                      Log Progress Note (Internal Audit Milestone)
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Technician dispatched, waiting on spare parts..."
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="btn btn-outline-secondary btn-sm px-3"
                        disabled={actionLoading || !progressNote.trim()}
                      >
                        Add Note
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold text-dark mb-1">Grievance History &amp; Audit Trail</h5>
            <ComplaintTimeline history={complaint.history} />
          </div>
        </div>

        {/* Right Column: Live Chat with Complainant */}
        <div className="col-12 col-lg-5">
          <ChatWindow
            complaintId={complaint._id}
            complaintNumber={complaint.complaintNumber}
            assignedAgent={{ name: user?.name, department: user?.department }}
            isClosed={complaint.status === 'Closed'}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentComplaintDetails;
