import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/complaints?limit=5');
        if (res.data.success) {
          setComplaints(res.data.complaints);
        }
      } catch (err) {
        setError('Failed to load dashboard complaints.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics from real complaints data
  const total = complaints.length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const pending = complaints.filter((c) => ['Submitted', 'Pending', 'Assigned'].includes(c.status)).length;
  const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="container py-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-navy text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm position-relative overflow-hidden">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-primary rounded-pill px-3 py-1 mb-2">Complainant Portal</span>
            <h2 className="fw-bold mb-2">Welcome back, {user?.name}!</h2>
            <p className="text-white-50 mb-0" style={{ maxWidth: '600px' }}>
              Track the live progress of your reported grievances, communicate with assigned support specialists, and inspect resolution updates.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <Link
              to="/user/submit-complaint"
              className="btn btn-primary btn-lg rounded-pill px-4 shadow d-inline-flex align-items-center gap-2"
            >
              <PlusCircle size={20} /> Register Complaint
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Total Complaints"
            value={total}
            icon={<FileText size={22} />}
            color="primary"
            subtext="All submissions"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Awaiting Review"
            value={pending}
            icon={<Clock size={22} />}
            color="warning"
            subtext="Submitted or Assigned"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="In Progress"
            value={inProgress}
            icon={<RotateCw size={22} className="spin" />}
            color="info"
            subtext="Under active resolution"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            title="Resolved"
            value={resolved}
            icon={<CheckCircle2 size={22} />}
            color="success"
            subtext="Successfully resolved"
          />
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-bottom">
          <div>
            <h5 className="fw-bold mb-0 text-dark">Recent Complaints</h5>
            <small className="text-muted">Your latest registered grievance tickets</small>
          </div>
          <Link to="/user/my-complaints" className="btn btn-outline-primary btn-sm rounded-pill px-3">
            View All ({total})
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Reference #</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Agent</th>
                <th>Date</th>
                <th className="pe-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <FileText size={36} className="text-secondary opacity-50 mb-2" />
                    <p className="mb-2 fw-medium">You haven't submitted any complaints yet.</p>
                    <Link to="/user/submit-complaint" className="btn btn-sm btn-primary rounded-pill px-3">
                      Submit Your First Complaint
                    </Link>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
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
                      <span className="badge bg-light text-secondary border small">
                        {c.category}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      {c.assignedAgent ? (
                        <span className="small fw-medium text-dark">
                          {c.assignedAgent.name}
                        </span>
                      ) : (
                        <span className="text-muted small fst-italic">Pending assignment</span>
                      )}
                    </td>
                    <td className="small text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 text-end">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 d-inline-flex align-items-center gap-1"
                      >
                        Track <ArrowRight size={13} />
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

export default UserDashboard;
