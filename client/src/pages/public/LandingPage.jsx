import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  FileText,
  Star,
  ArrowRight,
  UserCheck,
  Award,
  Layers,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    return '/user/dashboard';
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="bg-gradient-navy text-white py-5 py-lg-6">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-pill px-3 py-1 mb-4 text-white small">
                <ShieldCheck size={16} className="text-primary-light" />
                <span>Enterprise Grievance Redressal Architecture</span>
              </div>
              <h1 className="display-4 fw-extrabold mb-3 lh-sm text-white">
                Online Complaint Registration &amp; Management System
              </h1>
              <p className="lead text-white-50 mb-4 fs-5" style={{ maxWidth: '620px' }}>
                A centralized, secure full-stack portal connecting Citizens, Support Agents, and Administrators with real-time lifecycle tracking, secure messaging, and structured resolution workflows.
              </p>

              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link to={getDashboardLink()} className="btn btn-primary btn-lg rounded-pill px-4 shadow d-flex align-items-center gap-2">
                    Go to Your Dashboard <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg rounded-pill px-4 shadow d-flex align-items-center gap-2">
                      Submit a Complaint <ArrowRight size={18} />
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-4">
                      Staff &amp; User Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-lg rounded-4 p-4 bg-white text-dark">
                <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success rounded-pill p-1 px-2 small">System Live</span>
                    <span className="text-muted small">Complaint #CMP-20261021</span>
                  </div>
                  <span className="badge bg-primary text-white rounded-pill px-2 py-1 small">In Progress</span>
                </div>

                <h6 className="fw-bold mb-1">Wi-Fi Router Unreachable in Lab 4</h6>
                <p className="text-muted small mb-3">
                  Category: Technical Support &bull; Priority: High
                </p>

                <div className="bg-light rounded-3 p-3 mb-3 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Assigned Specialist:</span>
                    <span className="fw-semibold text-primary">Technical Support Desk</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Current Workflow:</span>
                    <span className="fw-semibold text-success">Submitted &rarr; In Progress</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted small">
                  <Clock size={14} className="text-primary" />
                  <span>Real-time bidirectional event synchronization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Architecture Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-primary text-uppercase fw-bold small tracking-wider">
              Three-Tier User Roles
            </span>
            <h2 className="fw-bold text-dark mt-1">Built for All Stakeholders</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Separation of concerns enforced by backend authentication, cryptographic passwords, and role authorization middlewares.
            </p>
          </div>

          <div className="row g-4">
            {/* User */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift">
                <div className="bg-primary-subtle text-primary rounded-3 p-3 d-inline-flex mb-3 align-self-start">
                  <FileText size={24} />
                </div>
                <h4 className="fw-bold mb-2">Citizen / Customer</h4>
                <p className="text-muted small mb-4">
                  Register, submit detailed complaints with file attachments, receive unique reference IDs, track step-by-step progress, chat with assigned agents, and submit resolution feedback.
                </p>
                <ul className="list-unstyled small text-secondary mb-0">
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" /> Easy registration &amp; profile management
                  </li>
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" /> Evidence file attachments (Images/PDFs)
                  </li>
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" /> Real-time in-app notifications
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success" /> Reopen complaint if dissatisfied
                  </li>
                </ul>
              </div>
            </div>

            {/* Agent */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift">
                <div className="bg-info-subtle text-info-emphasis rounded-3 p-3 d-inline-flex mb-3 align-self-start">
                  <UserCheck size={24} />
                </div>
                <h4 className="fw-bold mb-2">Support Agent</h4>
                <p className="text-muted small mb-4">
                  Dedicated agent workspace to view assigned queues, update complaint lifecycles through strictly validated transitions, append internal progress notes, and communicate directly with complainants.
                </p>
                <ul className="list-unstyled small text-secondary mb-0">
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-info" /> Filter by urgency &amp; priority
                  </li>
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-info" /> Enforced valid status transitions
                  </li>
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-info" /> Mandatory resolution documentation
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-info" /> Built-in customer chat window
                  </li>
                </ul>
              </div>
            </div>

            {/* Admin */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-lift">
                <div className="bg-danger-subtle text-danger rounded-3 p-3 d-inline-flex mb-3 align-self-start">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="fw-bold mb-2">Administrator</h4>
                <p className="text-muted small mb-4">
                  Full administrative control. Assign and reassign complaints to qualified agents, monitor live staff workloads, toggle user access, manage complaint categories, inspect audit trails and review user feedback ratings.
                </p>
                <ul className="list-unstyled small text-secondary mb-0">
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-danger" /> Live database analytics &amp; charts
                  </li>
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-danger" /> Smart agent workload balancing
                  </li>
                  <li className="mb-2 d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-danger" /> User &amp; agent account lifecycle control
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-danger" /> Full cryptographic audit logging
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Standards & Core Capabilities Section */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container py-3">
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-2">Security &amp; Compliance</span>
              <h3 className="fw-bold text-dark mb-3">Enterprise Grievance Governance</h3>
              <p className="text-muted small mb-3">
                GrievanceHub implements end-to-end auditability and strict access controls. No arbitrary modifications can be performed without accountability records.
              </p>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-white rounded-3 shadow-xs border text-primary">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-dark small">Role-Based Data Isolation</h6>
                    <p className="text-muted small mb-0">
                      Users only view their personal filings; agents only interact with assigned matters; administrators supervise with strict audit records.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-white rounded-3 shadow-xs border text-success">
                    <Award size={18} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-dark small">Quality Assurance &amp; Feedback Loop</h6>
                    <p className="text-muted small mb-0">
                      Mandatory resolution documentation and post-resolution satisfaction scoring to guarantee service standards.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 bg-white rounded-3 shadow-xs border text-info">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1 text-dark small">Automated Staff Load Balancing</h6>
                    <p className="text-muted small mb-0">
                      Live queue monitoring prevents bottle-necking and distributes grievances across specialized department desks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold mb-3 text-dark">Standard Redressal Lifecycle</h5>
                <div className="d-flex flex-column gap-2">
                  <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-primary text-white me-2">1. Submitted</span>
                      <small className="text-muted">Logged with unique reference ID &amp; evidence</small>
                    </div>
                  </div>
                  <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-info text-dark me-2">2. Assigned</span>
                      <small className="text-muted">Delegated to qualified department specialist</small>
                    </div>
                  </div>
                  <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-primary text-white me-2">3. In Progress</span>
                      <small className="text-muted">Active diagnosis with live complainant messaging</small>
                    </div>
                  </div>
                  <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-success text-white me-2">4. Resolved</span>
                      <small className="text-muted">Documented solution report &amp; citizen review</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
