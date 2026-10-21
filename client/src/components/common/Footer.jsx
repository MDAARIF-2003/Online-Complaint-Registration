import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-top py-4 mt-auto">
      <div className="container text-center">
        <div className="d-flex align-items-center justify-content-center mb-2">
          <ShieldCheck size={20} className="text-primary me-2" />
          <span className="fw-bold text-dark">GrievanceHub &bull; Online Complaint Registration &amp; Management System</span>
        </div>
        <p className="text-muted small mb-1">
          A centralized, secure online platform connecting Citizens, Support Agents, and Administrators for fast and transparent grievance redressal.
        </p>
        <p className="text-muted small mb-0">
          &copy; {new Date().getFullYear()} GrievanceHub Platform. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
