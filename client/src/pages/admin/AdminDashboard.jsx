import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  RefreshCw,
  Star,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError('Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading administrative portal..." />;
  }

  const metrics = data?.metrics || {};
  const status = metrics.statusBreakdown || {};
  const priorities = metrics.priorities || {};
  const categories = metrics.categories || [];
  const workloads = data?.agentWorkloads || [];
  const recentComplaints = data?.recentComplaints || [];
  const recentLogs = data?.recentAuditLogs || [];

  return (
    <div className="container-fluid px-lg-5 py-4">
      {/* Header Banner */}
      <div className="bg-gradient-navy text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-danger text-white rounded-pill px-3 py-1 mb-2">
              System Administration
            </span>
            <h2 className="fw-bold mb-2">Central Grievance Redressal Center</h2>
            <p className="text-white-50 mb-0">
              Live database monitoring of citizen grievances, agent workload allocation, categories, and system-wide resolution metrics.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0 d-flex flex-wrap gap-2 justify-content-lg-end">
            <Link
              to="/admin/complaints"
              className="btn btn-primary rounded-pill px-4 shadow d-inline-flex align-items-center gap-2"
            >
              <FileText size={18} /> Manage All Complaints
            </Link>
            <Link
              to="/admin/users"
              className="btn btn-outline-light rounded-pill px-3"
            >
              User Management
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {/* Top 4 KPI Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Complaints"
            value={metrics.totalComplaints || 0}
            icon={<FileText size={22} />}
            color="primary"
            subtext={`${status.totalUnresolved || 0} awaiting final resolution`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Registered Users"
            value={metrics.totalUsers || 0}
            icon={<Users size={22} />}
            color="info"
            subtext="Complainants & Citizens"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Support Agents"
            value={metrics.totalAgents || 0}
            icon={<UserCheck size={22} />}
            color="warning"
            subtext="Specialist staff handling queues"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Citizen Satisfaction"
            value={`${metrics.averageRating || 5.0} / 5`}
            icon={<Star size={22} />}
            color="success"
            subtext={`Across ${metrics.totalFeedbacks || 0} verified reviews`}
          />
        </div>
      </div>

      {/* Status Breakdown Grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm rounded-3 p-3 text-center bg-white">
            <span className="text-muted small fw-semibold text-uppercase">Submitted</span>
            <h3 className="fw-bold mt-2 mb-0 text-primary">{status.submitted || 0}</h3>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm rounded-3 p-3 text-center bg-white">
            <span className="text-muted small fw-semibold text-uppercase">Assigned</span>
            <h3 className="fw-bold mt-2 mb-0 text-info">{status.assigned || 0}</h3>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm rounded-3 p-3 text-center bg-white">
            <span className="text-muted small fw-semibold text-uppercase">In Progress</span>
            <h3 className="fw-bold mt-2 mb-0 text-primary">{status.inProgress || 0}</h3>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm rounded-3 p-3 text-center bg-white">
            <span className="text-muted small fw-semibold text-uppercase">Resolved</span>
            <h3 className="fw-bold mt-2 mb-0 text-success">{status.resolved || 0}</h3>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm rounded-3 p-3 text-center bg-white">
            <span className="text-muted small fw-semibold text-uppercase">Reopened</span>
            <h3 className="fw-bold mt-2 mb-0 text-danger">{status.reopened || 0}</h3>
          </div>
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm rounded-3 p-3 text-center bg-white">
            <span className="text-muted small fw-semibold text-uppercase">Closed</span>
            <h3 className="fw-bold mt-2 mb-0 text-secondary">{status.closed || 0}</h3>
          </div>
        </div>
      </div>

      {/* Agent Workload Monitor & Priority / Category Distribution */}
      <div className="row g-4 mb-4">
        {/* Agent Workload Card */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
            <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-bottom">
              <div>
                <h5 className="fw-bold mb-0 text-dark">Staff Workload Distribution</h5>
                <small className="text-muted">Active complaints assigned to each specialist</small>
              </div>
              <Link to="/admin/users?role=AGENT" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                Manage Staff
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-4">Agent Name</th>
                    <th>Department</th>
                    <th>Active Assigned</th>
                    <th>Resolved</th>
                    <th className="pe-4 text-end">Workload Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workloads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted small">
                        No active support agents configured.
                      </td>
                    </tr>
                  ) : (
                    workloads.map((agent) => (
                      <tr key={agent.id}>
                        <td className="ps-4">
                          <span className="fw-semibold text-dark d-block">{agent.name}</span>
                          <small className="text-muted">{agent.email}</small>
                        </td>
                        <td>
                          <span className="badge bg-light text-secondary border small">
                            {agent.department || 'General'}
                          </span>
                        </td>
                        <td className="fw-bold text-primary">{agent.activeCount}</td>
                        <td className="text-success fw-medium">{agent.resolvedCount}</td>
                        <td className="pe-4 text-end">
                          <span
                            className={`badge rounded-pill ${
                              agent.activeCount > 5
                                ? 'bg-danger text-white'
                                : agent.activeCount > 2
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-success-subtle text-success'
                            }`}
                          >
                            {agent.activeCount > 5 ? 'Heavy Load' : agent.activeCount > 2 ? 'Moderate' : 'Optimal'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Priority & Category Breakdown */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4">
            <h5 className="fw-bold text-dark mb-3">Priority Distribution</h5>
            <div className="mb-4">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-danger fw-semibold">Urgent</span>
                <span className="fw-bold">{priorities.URGENT || 0}</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-danger"
                  style={{ width: `${((priorities.URGENT || 0) / (metrics.totalComplaints || 1)) * 100}%` }}
                />
              </div>

              <div className="d-flex justify-content-between small mb-1">
                <span className="text-danger-emphasis fw-semibold">High</span>
                <span className="fw-bold">{priorities.HIGH || 0}</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-danger-subtle"
                  style={{ width: `${((priorities.HIGH || 0) / (metrics.totalComplaints || 1)) * 100}%` }}
                />
              </div>

              <div className="d-flex justify-content-between small mb-1">
                <span className="text-warning-emphasis fw-semibold">Medium</span>
                <span className="fw-bold">{priorities.MEDIUM || 0}</span>
              </div>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${((priorities.MEDIUM || 0) / (metrics.totalComplaints || 1)) * 100}%` }}
                />
              </div>

              <div className="d-flex justify-content-between small mb-1">
                <span className="text-secondary fw-semibold">Low</span>
                <span className="fw-bold">{priorities.LOW || 0}</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-secondary"
                  style={{ width: `${((priorities.LOW || 0) / (metrics.totalComplaints || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="border-top pt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold text-dark mb-0 small text-uppercase">Top Categories</h6>
                <Link to="/admin/categories" className="small text-primary text-decoration-none">
                  Manage
                </Link>
              </div>
              <div className="d-flex flex-column gap-2">
                {categories.slice(0, 4).map((c, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center small p-2 bg-light rounded-3">
                    <span className="text-dark fw-medium text-truncate" style={{ maxWidth: '180px' }}>
                      {c.name}
                    </span>
                    <span className="badge bg-primary text-white rounded-pill px-2">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity: Complaints & Audit Logs */}
      <div className="row g-4">
        {/* Recent Complaints */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-bottom">
              <div>
                <h5 className="fw-bold mb-0 text-dark">Recent System Complaints</h5>
                <small className="text-muted">Latest grievance registrations needing supervision</small>
              </div>
              <Link to="/admin/complaints" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                All Complaints
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-4">Ref #</th>
                    <th>Subject</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Assigned Agent</th>
                    <th className="pe-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map((c) => (
                    <tr key={c._id}>
                      <td className="ps-4 fw-bold font-monospace text-primary">{c.complaintNumber}</td>
                      <td>
                        <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: '200px' }}>
                          {c.title}
                        </span>
                      </td>
                      <td className="small text-muted">{c.user?.name}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="small">
                        {c.assignedAgent ? (
                          <span className="fw-medium text-dark">{c.assignedAgent.name}</span>
                        ) : (
                          <span className="text-danger small fw-semibold">Unassigned</span>
                        )}
                      </td>
                      <td className="pe-4 text-end">
                        <Link to={`/complaints/${c._id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Activity size={18} className="text-primary" /> Audit Trail
              </h5>
              <Link to="/admin/audit-logs" className="small text-primary text-decoration-none">
                View All
              </Link>
            </div>
            <div className="d-flex flex-column gap-3">
              {recentLogs.length === 0 ? (
                <div className="text-muted small text-center py-3">No activity logs recorded.</div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log._id} className="p-3 bg-light rounded-3 border-start border-3 border-primary">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-bold text-dark" style={{ fontSize: '0.78rem' }}>
                        {log.action}
                      </span>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                    <small className="text-secondary d-block" style={{ fontSize: '0.75rem' }}>
                      By: {log.actorEmail} ({log.actorRole})
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
