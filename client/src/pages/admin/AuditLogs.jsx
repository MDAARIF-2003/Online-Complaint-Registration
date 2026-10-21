import React, { useState, useEffect } from 'react';
import { Activity, Clock, RefreshCw, Shield } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/admin/audit-logs?page=${page}&limit=15`);
      if (res.data.success) {
        setLogs(res.data.logs);
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
    fetchLogs();
  }, [page]);

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Administrative Audit Trail</h3>
          <p className="text-muted small mb-0">
            Immutable system activity log recording status overrides, assignments, and account modifications ({total} total logs)
          </p>
        </div>
        <button
          className="btn btn-outline-secondary rounded-pill btn-sm px-3 d-flex align-items-center gap-1"
          onClick={fetchLogs}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Timestamp</th>
                <th>Action Performed</th>
                <th>Actor Email</th>
                <th>Role</th>
                <th>Target Entity</th>
                <th>Metadata Details</th>
                <th className="pe-4 text-end">Origin IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <LoadingSpinner message="Retrieving audit records..." />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <Activity size={36} className="text-secondary opacity-50 mb-2" />
                    <p className="mb-0 fw-medium">No audit logs recorded yet.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className="ps-4 small text-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle small fw-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="small fw-medium text-dark">{log.actorEmail}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary small">
                        {log.actorRole}
                      </span>
                    </td>
                    <td>
                      <span className="small text-secondary">
                        {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                      </span>
                    </td>
                    <td className="small text-muted font-monospace" style={{ maxWidth: '280px' }}>
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="pe-4 text-end small text-muted font-monospace">
                      {log.ipAddress || '127.0.0.1'}
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

export default AuditLogs;
