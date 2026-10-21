import React from 'react';
import {
  Clock,
  AlertCircle,
  UserCheck,
  RotateCw,
  CheckCircle2,
  RefreshCw,
  Archive,
} from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Submitted':
        return {
          bg: 'bg-primary-subtle text-primary border border-primary-subtle',
          icon: <Clock size={14} className="me-1" />,
        };
      case 'Pending':
        return {
          bg: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
          icon: <AlertCircle size={14} className="me-1" />,
        };
      case 'Assigned':
        return {
          bg: 'bg-info-subtle text-info-emphasis border border-info-subtle',
          icon: <UserCheck size={14} className="me-1" />,
        };
      case 'In Progress':
        return {
          bg: 'bg-primary text-white',
          icon: <RotateCw size={14} className="me-1 spin" />,
        };
      case 'Resolved':
        return {
          bg: 'bg-success text-white',
          icon: <CheckCircle2 size={14} className="me-1" />,
        };
      case 'Reopened':
        return {
          bg: 'bg-danger-subtle text-danger border border-danger-subtle',
          icon: <RefreshCw size={14} className="me-1" />,
        };
      case 'Closed':
        return {
          bg: 'bg-secondary text-white',
          icon: <Archive size={14} className="me-1" />,
        };
      default:
        return {
          bg: 'bg-light text-dark border',
          icon: null,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center px-2 py-1 fw-semibold ${config.bg}`}
      style={{ fontSize: '0.8rem' }}
    >
      {config.icon}
      {status}
    </span>
  );
};

export default StatusBadge;
