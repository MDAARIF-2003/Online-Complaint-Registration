import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-medium mb-0">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-light"
        style={{ minHeight: '80vh' }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
