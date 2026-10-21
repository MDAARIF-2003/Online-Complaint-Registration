import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, PlusCircle, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ComplaintFilterBar from '../../components/complaints/ComplaintFilterBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
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
    fetchCategories();
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

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Registered Complaints</h3>
          <p className="text-muted small mb-0">
            View, filter, and track all your logged grievances ({total} total tickets)
          </p>
        </div>
        <div className="mt-3 mt-md-0 d-flex gap-2">
          <button
            className="btn btn-outline-secondary rounded-pill btn-sm px-3 d-flex align-items-center gap-1"
            onClick={fetchComplaints}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <Link
            to="/user/submit-complaint"
            className="btn btn-primary rounded-pill btn-sm px-3 d-flex align-items-center gap-1 shadow-sm"
          >
            <PlusCircle size={15} /> Submit New
          </Link>
        </div>
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
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Agent</th>
                <th>Submitted On</th>
                <th className="pe-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <LoadingSpinner message="Filtering complaints..." />
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <FileText size={36} className="text-secondary opacity-50 mb-2" />
                    <p className="mb-2 fw-medium">No complaints match your criteria.</p>
                    <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={handleReset}>
                      Clear Filters
                    </button>
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
                        Details <ArrowRight size={13} />
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

export default MyComplaints;
