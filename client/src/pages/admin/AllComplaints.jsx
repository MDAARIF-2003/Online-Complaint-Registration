import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  RotateCw,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintFilterBar from '../../components/complaints/ComplaintFilterBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Assignment Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // Status Override Modal State
  const [statusOverrideComplaint, setStatusOverrideComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const [catRes, agentRes] = await Promise.all([
        axiosClient.get('/admin/categories'),
        axiosClient.get('/admin/agents'),
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (agentRes.data.success) {
        setAgents(agentRes.data.agents);
        if (agentRes.data.agents.length > 0) {
          setSelectedAgentId(agentRes.data.agents[0]._id);
        }
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
      });

      if (status !== 'ALL') params.append('status', status);
      if (priority !== 'ALL') params.append('priority', priority);
      if (category !== 'ALL') params.append('category', category);
      if (search.trim()) params.append('search', search.trim());

      const res = await axiosClient.get(`/complaints?${params.toString()}`);
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
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, status, priority, category, search]);

  const handleReset = () => {
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setCategory('ALL');
    setPage(1);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedAgentId) return;

    try {
      setAssigning(true);
      setModalError('');
      const res = await axiosClient.post(
        `/admin/complaints/${selectedComplaint._id}/assign`,
        {
          agentId: selectedAgentId,
          note: assignNote.trim(),
        }
      );
      if (res.data.success) {
        setModalSuccess('Complaint successfully assigned.');
        setTimeout(() => {
          setSelectedComplaint(null);
          setModalSuccess('');
          setAssignNote('');
          fetchComplaints();
        }, 1200);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!statusOverrideComplaint) return;

    try {
      setStatusLoading(true);
      setModalError('');
      const res = await axiosClient.patch(
        `/admin/complaints/${statusOverrideComplaint._id}/status`,
        {
          status: newStatus,
          note: statusNote.trim(),
        }
      );
      if (res.data.success) {
        setModalSuccess('Status updated.');
        setTimeout(() => {
          setStatusOverrideComplaint(null);
          setModalSuccess('');
          setStatusNote('');
          fetchComplaints();
        }, 1200);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      {/* Title */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Central Complaints Desk</h3>
          <p className="text-muted small mb-0">
            Global grievance registry &bull; Delegated assignments, status monitoring, and audit controls ({total} total tickets)
          </p>
        </div>
        <button
          className="btn btn-outline-secondary rounded-pill btn-sm px-3 d-flex align-items-center gap-1"
          onClick={fetchComplaints}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <ComplaintFilterBar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        category={category}
        setCategory={setCategory}
        categories={categories}
        onReset={handleReset}
      />

      {/* Complaints Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Reference #</th>
                <th>Subject</th>
                <th>Complainant</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Specialist</th>
                <th>Submitted</th>
                <th className="pe-4 text-end">Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <LoadingSpinner message="Querying complaint registry..." />
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <FileText size={36} className="text-secondary opacity-50 mb-2" />
                    <p className="mb-0 fw-medium">No complaints match your filters.</p>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id}>
                    <td className="ps-4 fw-bold font-monospace text-primary">
                      {c.complaintNumber}
                    </td>
                    <td>
                      <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: '200px' }}>
                        {c.title}
                      </span>
                    </td>
                    <td>
                      <span className="small text-dark fw-medium d-block">{c.user?.name}</span>
                      <small className="text-muted">{c.user?.phone || c.user?.email}</small>
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
                        <div>
                          <span className="small fw-semibold text-dark d-block">
                            {c.assignedAgent.name}
                          </span>
                          <small className="text-muted">{c.assignedAgent.department}</small>
                        </div>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="small text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-info rounded-pill px-2"
                          title="Assign to Agent"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setModalError('');
                            setModalSuccess('');
                          }}
                        >
                          <UserCheck size={14} className="me-1 d-inline" /> Assign
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary rounded-pill px-2"
                          title="Override Status"
                          onClick={() => {
                            setStatusOverrideComplaint(c);
                            setNewStatus(c.status);
                            setModalError('');
                            setModalSuccess('');
                          }}
                        >
                          Status
                        </button>

                        <Link
                          to={`/complaints/${c._id}`}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 d-inline-flex align-items-center gap-1"
                        >
                          Review <ArrowRight size={13} />
                        </Link>
                      </div>
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

      {/* Assignment Modal */}
      {selectedComplaint && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1060 }}
        >
          <div className="card border-0 shadow-lg rounded-4 p-4 bg-white" style={{ maxWidth: '520px', width: '90%' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
              <h5 className="fw-bold mb-0 text-dark">Assign Support Specialist</h5>
              <button
                className="btn btn-link text-secondary p-0"
                onClick={() => setSelectedComplaint(null)}
              >
                <X size={20} />
              </button>
            </div>

            <p className="small text-muted mb-3">
              Assign complaint <strong className="text-primary font-monospace">{selectedComplaint.complaintNumber}</strong> ("{selectedComplaint.title}") to an active support agent:
            </p>

            {modalSuccess && (
              <div className="alert alert-success small py-2">{modalSuccess}</div>
            )}
            {modalError && (
              <div className="alert alert-danger small py-2">{modalError}</div>
            )}

            <form onSubmit={handleAssignSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Select Active Agent</label>
                <select
                  className="form-select bg-light"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  required
                >
                  {agents.map((ag) => (
                    <option key={ag._id} value={ag._id}>
                      {ag.name} ({ag.department || 'Support'}) &bull; {ag.activeComplaints || 0} active tickets
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Assignment Note (Optional)</label>
                <textarea
                  className="form-control bg-light small"
                  rows={2}
                  placeholder="Special instructions or priority directions for the specialist..."
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-pill px-3"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold"
                  disabled={assigning}
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Override Modal */}
      {statusOverrideComplaint && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1060 }}
        >
          <div className="card border-0 shadow-lg rounded-4 p-4 bg-white" style={{ maxWidth: '480px', width: '90%' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
              <h5 className="fw-bold mb-0 text-dark">Administrative Status Override</h5>
              <button
                className="btn btn-link text-secondary p-0"
                onClick={() => setStatusOverrideComplaint(null)}
              >
                <X size={20} />
              </button>
            </div>

            <p className="small text-muted mb-3">
              Manually set status for <strong className="text-primary font-monospace">{statusOverrideComplaint.complaintNumber}</strong>. An audit log record will be created.
            </p>

            {modalSuccess && <div className="alert alert-success small py-2">{modalSuccess}</div>}
            {modalError && <div className="alert alert-danger small py-2">{modalError}</div>}

            <form onSubmit={handleStatusOverrideSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Target Status</label>
                <select
                  className="form-select bg-light"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Reopened">Reopened</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Override Reason / Audit Note</label>
                <textarea
                  className="form-control bg-light small"
                  rows={2}
                  placeholder="Explain reason for administrative intervention..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-pill px-3"
                  onClick={() => setStatusOverrideComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold"
                  disabled={statusLoading}
                >
                  {statusLoading ? 'Updating...' : 'Apply Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllComplaints;
