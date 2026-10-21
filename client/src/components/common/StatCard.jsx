import React from 'react';

export const StatCard = ({ title, value, icon, color = 'primary', subtext = null }) => {
  return (
    <div className="card border-0 shadow-sm rounded-3 h-100 stat-card">
      <div className="card-body p-4 d-flex align-items-center justify-content-between">
        <div>
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h2 className="fw-bold mt-1 mb-0 text-dark">{value}</h2>
          {subtext && <small className="text-muted d-block mt-1">{subtext}</small>}
        </div>
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle bg-${color}-subtle text-${color}`}
          style={{ width: '52px', height: '52px' }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
