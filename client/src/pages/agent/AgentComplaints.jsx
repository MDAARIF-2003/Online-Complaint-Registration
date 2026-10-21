import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, RefreshCw, Search } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AgentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
      });

      if (status !== 'ALL') params.append('status', status);
      if (priority !== 'ALL') params.append('priority', priority);
      if (search.trim()) params.append('search', search.trim());

      const res = await axiosClient.get(`/agent/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [page, status, priority, search]);

  const handleReset = () => {
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setPage(1);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Assigned Queue</h3>
          <p className="text-muted small mb-0">
            Complaints delegated to your desk for investigation and resolution ({total} total)
          </p>
        </div>
        <button
          className="btn btn-outline-secondary rounded-pill btn-sm px-3 d-flex align-items-center gap-1"
          onClick={fetchAssigned}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Queue
        </button>
      </div>

      {/* Filter Controls */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search reference # or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select bg-light text-dark"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Assigned">Assigned (New)</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending Info</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select bg-light text-dark"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="col-12 col-md-1 text-end">
            <button className="btn btn-outline-secondary w-100 p-2" onClick={handleReset} title="Reset">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Reference #</th>
                <th>Subject</th>
                <th>Complainant</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date Assigned</th>
                <th className="pe-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <LoadingSpinner message="Loading assigned queue..." />
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <ClipboardList size={36} className="text-secondary opacity-50 mb-2" />
                    <p className="mb-0 fw-medium">No complaints found in this filter.</p>
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
                        Action <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-top py-3 px-4 d-flex align-items-center justify-content-between">
            <span className="text-muted small">
              Page {page} of {totalPages}
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentComplaints;
