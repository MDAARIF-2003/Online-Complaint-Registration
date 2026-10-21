import React from 'react';
import {
  CheckCircle,
  Clock,
  UserCheck,
  RotateCw,
  RefreshCw,
  MessageCircle,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export const ComplaintTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <div className="text-muted small p-3">No history events recorded yet.</div>;
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'COMPLAINT_SUBMITTED':
        return <FileCheck size={16} className="text-primary" />;
      case 'AGENT_ASSIGNED':
      case 'AGENT_REASSIGNED':
        return <UserCheck size={16} className="text-info" />;
      case 'STATUS_UPDATED':
        return <RotateCw size={16} className="text-primary" />;
      case 'NOTE_ADDED':
        return <MessageCircle size={16} className="text-secondary" />;
      case 'FEEDBACK_SUBMITTED':
        return <CheckCircle size={16} className="text-success" />;
      case 'COMPLAINT_REOPENED':
        return <RefreshCw size={16} className="text-danger" />;
      default:
        return <Clock size={16} className="text-muted" />;
    }
  };

  return (
    <div className="timeline position-relative ps-3 my-2">
      {history.map((event, index) => (
        <div key={event._id || index} className="timeline-item position-relative pb-4 ps-4">
          {/* Connector Dot */}
          <div
            className="position-absolute start-0 top-0 translate-middle-x bg-white border border-2 border-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '32px', height: '32px', zIndex: 2 }}
          >
            {getActionIcon(event.action)}
          </div>

          {/* Vertical line connecting to next */}
          {index < history.length - 1 && (
            <div
              className="position-absolute border-start border-2 border-primary-subtle"
              style={{ left: 0, top: '24px', bottom: 0, zIndex: 1 }}
            />
          )}

          <div className="card border-0 bg-light rounded-3 p-3 shadow-xs">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-1">
              <span className="fw-bold text-dark small">
                {event.action.replace(/_/g, ' ')}
              </span>
              <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.72rem' }}>
                <Clock size={11} className="me-1" />
                {new Date(event.timestamp).toLocaleString()}
              </small>
            </div>

            <div className="d-flex align-items-center mb-2">
              <span className="text-muted small me-2">By:</span>
              <span className="badge bg-white text-dark border me-1 small">
                {event.actorName || 'System'}
              </span>
              {event.actorRole && (
                <span className="badge bg-secondary-subtle text-secondary small" style={{ fontSize: '0.65rem' }}>
                  {event.actorRole}
                </span>
              )}
            </div>

            {event.previousStatus && event.newStatus && event.previousStatus !== event.newStatus && (
              <div className="small text-secondary mb-1">
                Status transitioned: <span className="fw-semibold">{event.previousStatus}</span> &rarr; <span className="fw-semibold text-primary">{event.newStatus}</span>
              </div>
            )}

            {event.note && (
              <div className="p-2 bg-white rounded border border-light small text-secondary fst-italic">
                &ldquo;{event.note}&rdquo;
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintTimeline;
