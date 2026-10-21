import React, { useState, useEffect } from 'react';
import { Layers, Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const res = await axiosClient.post('/admin/categories', {
        name: name.trim(),
        description: description.trim(),
      });
      if (res.data.success) {
        setAlert({ type: 'success', text: `Category "${name}" created successfully.` });
        setName('');
        setDescription('');
        fetchCategories();
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to create category.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (cat) => {
    try {
      const res = await axiosClient.patch(`/admin/categories/${cat._id}/toggle`);
      if (res.data.success) {
        fetchCategories();
      }
    } catch (err) {
      setAlert({ type: 'danger', text: 'Failed to toggle category.' });
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Grievance Category Management</h3>
          <p className="text-muted small mb-0">
            Define and manage departments and classification tags available during complaint submission
          </p>
        </div>
        <button
          className="btn btn-outline-secondary rounded-pill btn-sm px-3 d-flex align-items-center gap-1"
          onClick={fetchCategories}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {alert.text && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show small py-2 px-3 rounded-3 mb-4`}>
          {alert.text}
          <button type="button" className="btn-close p-2" onClick={() => setAlert({ type: '', text: '' })} />
        </div>
      )}

      <div className="row g-4">
        {/* Create Category Form */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Plus size={18} className="text-primary" /> Add New Category
            </h5>

            <form onSubmit={handleCreateCategory}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Category Title *</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="e.g. Laboratory Equipment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Description</label>
                <textarea
                  className="form-control bg-light"
                  rows={3}
                  placeholder="Explain scope of complaints under this department..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary rounded-pill w-100 py-2 fw-semibold shadow-sm"
                disabled={submitting || !name.trim()}
              >
                {submitting ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Categories List */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white py-3 px-4 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">Active Categories ({categories.length})</h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="ps-4">Category Name</th>
                    <th>Scope Description</th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        <LoadingSpinner message="Loading categories..." />
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => (
                      <tr key={c._id}>
                        <td className="ps-4 fw-bold text-dark">{c.name}</td>
                        <td className="small text-muted" style={{ maxWidth: '300px' }}>
                          {c.description || '—'}
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              c.isActive ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                            }`}
                          >
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button
                            className={`btn btn-sm rounded-pill px-3 ${
                              c.isActive ? 'btn-outline-danger' : 'btn-outline-success'
                            }`}
                            onClick={() => handleToggle(c)}
                          >
                            {c.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
