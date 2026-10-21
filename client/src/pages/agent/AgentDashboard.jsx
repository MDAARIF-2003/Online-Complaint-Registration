import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  RotateCw,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAgentDashboard = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/agent/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError('Failed to load agent dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading agent workspace..." />;
  }

  const metrics = data?.metrics || {
    totalAssigned: 0,
    inProgress: 0,
    resolved: 0,
    reopened: 0,
    pending: 0,
    activeWorkload: 0,
  };

  const recent = data?.recentComplaints || [];

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="bg-gradient-navy text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-info text-dark rounded-pill px-3 py-1 mb-2 fw-semibold">
              Support Staff Workspace
            </span>
            <h2 className="fw-bold mb-2">Agent Portal &bull; {user?.name}</h2>
            <p className="text-white-50 mb-0">
              Department: <strong>{user?.department || 'Support Desk'}</strong> &bull; Manage assigned grievance tickets, update operational milestones, and respond to complainants.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <Link
              to="/agent/complaints"
              className="btn btn-primary btn-lg rounded-pill px-4 shadow d-inline-flex align-items-center gap-2"
            >
              <ClipboardList size={18} /> View Assigned Queue
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Active Workload"
            value={metrics.activeWorkload}
            icon={<ClipboardList size={22} />}
            color="primary"
            subtext="Assigned + In Progress"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="In Progress"
            value={metrics.inProgress}
            icon={<RotateCw size={22} className="spin" />}
            color="info"
            subtext="Under active diagnosis"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Reopened"
            value={metrics.reopened}
            icon={<RefreshCw size={22} />}
            color="danger"
            subtext="Needs re-examination"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Resolved"
            value={metrics.resolved}
            icon={<CheckCircle2 size={22} />}
            color="success"
            subtext="Total completed"
          />
        </div>
      </div>

      {/* Recent Assigned Complaints */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-bottom">
          <div>
            <h5 className="fw-bold mb-0 text-dark">Recent Assigned Grievances</h5>
            <small className="text-muted">Tickets assigned directly to you</small>
          </div>
          <Link to="/agent/complaints" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            Open Full Queue ({metrics.totalAssigned})
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Reference #</th>
                <th>Subject</th>
                <th>Complainant</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Update</th>
                <th className="pe-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <UserCheck size={36} className="text-secondary opacity-50 mb-2" />
                    <p className="mb-0 fw-medium">No complaints currently assigned to you.</p>
                  </td>
                </tr>
              ) : (
                recent.map((c) => (
                  <tr key={c._id}>
                    <td className="ps-4 fw-bold font-monospace text-primary">
                      {c.complaintNumber}
                    </td>
                    <td>
                      <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </span>
                    </td>
                    <td>
                      <span className="small text-dark fw-medium d-block">
                        {c.user?.name}
                      </span>
                      <small className="text-muted">{c.user?.phone || c.user?.email}</small>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="small text-muted">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 text-end">
                      <Link
                        to={`/agent/complaints/${c._id}`}
                        className="btn btn-sm btn-primary rounded-pill px-3 d-inline-flex align-items-center gap-1 shadow-xs"
                      >
                        Manage <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
