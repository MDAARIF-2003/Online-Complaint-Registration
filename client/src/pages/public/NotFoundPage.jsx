import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center my-auto">
      <div className="card border-0 shadow-sm rounded-4 p-5 mx-auto" style={{ maxWidth: '520px' }}>
        <div className="bg-warning-subtle text-warning-emphasis rounded-circle p-3 d-inline-flex mx-auto mb-3">
          <FileQuestion size={48} />
        </div>
        <h3 className="fw-bold text-dark mb-2">404 &bull; Page Not Found</h3>
        <p className="text-muted small mb-4">
          The page or endpoint you are looking for does not exist or may have been relocated.
        </p>
        <div>
          <Link to="/" className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2">
            <ArrowLeft size={16} /> Back to Portal Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
