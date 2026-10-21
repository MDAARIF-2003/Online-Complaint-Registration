import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, RefreshCw, ArrowRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const FeedbackReports = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/admin/feedback?page=${page}&limit=10`);
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks);
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
    fetchFeedback();
  }, [page]);

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Citizen Resolution Feedback</h3>
          <p className="text-muted small mb-0">
            Ratings and reviews submitted by citizens following complaint resolution ({total} total submissions)
          </p>
        </div>
        <button
          className="btn btn-outline-secondary rounded-pill btn-sm px-3 d-flex align-items-center gap-1"
          onClick={fetchFeedback}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Reference #</th>
                <th>Citizen / Complainant</th>
                <th>Satisfaction Rating</th>
                <th>Citizen Comments</th>
                <th>Date Submitted</th>
                <th className="pe-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <LoadingSpinner message="Loading customer reviews..." />
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    <Star size={36} className="text-secondary opacity-50 mb-2" />
                    <p className="mb-0 fw-medium">No feedback reviews recorded yet.</p>
                  </td>
                </tr>
              ) : (
                feedbacks.map((f) => (
                  <tr key={f._id}>
                    <td className="ps-4 fw-bold font-monospace text-primary">
                      {f.complaint?.complaintNumber || '—'}
                    </td>
                    <td>
                      <span className="small text-dark fw-semibold d-block">{f.user?.name}</span>
                      <small className="text-muted">{f.user?.email}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={15}
                            className={star <= f.rating ? 'text-warning fill-warning' : 'text-secondary opacity-25'}
                          />
                        ))}
                        <span className="ms-1 fw-bold small text-dark">{f.rating}/5</span>
                      </div>
                    </td>
                    <td className="small text-secondary" style={{ maxWidth: '340px' }}>
                      {f.comments ? `"${f.comments}"` : <span className="text-muted fst-italic">No comment provided</span>}
                    </td>
                    <td className="small text-muted">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 text-end">
                      {f.complaint?._id && (
                        <Link
                          to={`/complaints/${f.complaint._id}`}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        >
                          View File <ArrowRight size={13} className="ms-1" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="card-footer bg-white border-top py-3 px-4 d-flex align-items-center justify-content-between">
            <span className="text-muted small">Page {page} of {totalPages}</span>
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

export default FeedbackReports;
