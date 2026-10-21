import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    return '/user/dashboard';
  };

  return (
    <div className="container py-5 text-center my-auto">
      <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto" style={{ maxWidth: '520px' }}>
        <div className="bg-danger-subtle text-danger rounded-circle p-3 d-inline-flex mx-auto mb-3">
          <ShieldAlert size={48} />
        </div>
        <h3 className="fw-bold text-dark mb-2">403 &bull; Access Denied</h3>
        <p className="text-muted small mb-4">
          You do not have the required role permissions to view or perform operations on this resource.
        </p>
        <div>
          <Link to={getHomePath()} className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2">
            <ArrowLeft size={16} /> Return to Your Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
