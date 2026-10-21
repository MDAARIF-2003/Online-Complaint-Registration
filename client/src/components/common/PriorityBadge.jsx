import React from 'react';
import { AlertTriangle, AlertOctagon, ArrowDown, ArrowUp } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'URGENT':
        return {
          bg: 'bg-danger text-white',
          icon: <AlertOctagon size={13} className="me-1" />,
        };
      case 'HIGH':
        return {
          bg: 'bg-danger-subtle text-danger border border-danger-subtle',
          icon: <ArrowUp size={13} className="me-1" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
          icon: <AlertTriangle size={13} className="me-1" />,
        };
      case 'LOW':
        return {
          bg: 'bg-light text-secondary border',
          icon: <ArrowDown size={13} className="me-1" />,
        };
      default:
        return {
          bg: 'bg-light text-dark',
          icon: null,
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center px-2 py-1 fw-medium ${config.bg}`}
      style={{ fontSize: '0.75rem', letterSpacing: '0.03em' }}
    >
      {config.icon}
      {priority}
    </span>
  );
};

export default PriorityBadge;
