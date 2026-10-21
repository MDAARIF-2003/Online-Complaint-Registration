import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  X,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

export const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    contactPhone: user?.phone || '',
    contactAddress: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successComplaint, setSuccessComplaint] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/admin/categories');
        if (res.data.success) {
          const activeCategories = res.data.categories.filter((c) => c.isActive);
          setCategories(activeCategories);
          if (activeCategories.length > 0) {
            setFormData((prev) => ({ ...prev, category: activeCategories[0].name }));
          }
        }
      } catch (err) {
        // Fallback categories if network fails
        const fallback = [
          { name: 'Technical Support' },
          { name: 'Billing & Payments' },
          { name: 'Facilities & Maintenance' },
          { name: 'Academic & Examination' },
        ];
        setCategories(fallback);
        setFormData((prev) => ({ ...prev, category: fallback[0].name }));
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    let err = '';

    selectedFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        err = `File "${file.name}" exceeds the 5MB size limit.`;
      } else {
        validFiles.push(file);
      }
    });

    if (err) setError(err);
    if (files.length + validFiles.length > 5) {
      setError('You can upload a maximum of 5 supporting files.');
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a descriptive complaint title.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }
    if (!formData.category) {
      setError('Please select a complaint category.');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('contactPhone', formData.contactPhone.trim());
      data.append('contactAddress', formData.contactAddress.trim());

      files.forEach((file) => {
        data.append('attachments', file);
      });

      const res = await axiosClient.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.complaint) {
        setSuccessComplaint(res.data.complaint);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit complaint. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (successComplaint) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 text-center p-5 bg-white">
              <div className="bg-success-subtle text-success rounded-circle p-3 d-inline-flex mx-auto mb-3">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="fw-bold text-dark mb-2">Complaint Submitted Successfully!</h3>
              <p className="text-muted small mb-4">
                Your grievance has been safely logged in the system. Our support administration team will review and assign a specialist shortly.
              </p>

              <div className="bg-light rounded-3 p-4 mb-4 text-start border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Unique Reference ID:</span>
                  <span className="fw-bold font-monospace text-primary fs-5">
                    {successComplaint.complaintNumber}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Subject:</span>
                  <span className="fw-semibold text-dark small">{successComplaint.title}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Initial Status:</span>
                  <span className="badge bg-primary text-white rounded-pill px-2 py-1 small">
                    {successComplaint.status}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Timestamp:</span>
                  <span className="text-muted small">
                    {new Date(successComplaint.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <Link
                  to={`/complaints/${successComplaint._id}`}
                  className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2 shadow-sm"
                >
                  Track Complaint Progress <ArrowRight size={16} />
                </Link>
                <button
                  className="btn btn-outline-secondary rounded-pill px-3"
                  onClick={() => {
                    setSuccessComplaint(null);
                    setFormData({
                      title: '',
                      description: '',
                      category: categories[0]?.name || 'Technical Support',
                      priority: 'MEDIUM',
                      contactPhone: user?.phone || '',
                      contactAddress: '',
                    });
                    setFiles([]);
                  }}
                >
                  Submit Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            {/* Header */}
            <div className="card-header bg-dark-navy text-white p-4 border-0">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary text-white p-2 rounded-3 shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1 text-white">Register a New Grievance</h4>
                  <p className="text-white-50 small mb-0">
                    Fill out the form below. Provide clear details to ensure prompt assignment and resolution.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 px-3 rounded-3 mb-4">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">
                    Complaint Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-control bg-light"
                    placeholder="Brief summary of the issue (e.g., Computer Lab 2 Projector flicker)"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Category & Priority */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Department / Category <span className="text-danger">*</span>
                    </label>
                    <select
                      name="category"
                      className="form-select bg-light"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      className="form-select bg-light"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="LOW">Low - Routine issue</option>
                      <option value="MEDIUM">Medium - Normal priority</option>
                      <option value="HIGH">High - Impairing daily activities</option>
                      <option value="URGENT">Urgent - Critical outage / emergency</option>
                    </select>
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">
                    Detailed Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="description"
                    className="form-control bg-light"
                    rows={5}
                    placeholder="Describe exactly what happened, when it started, specific error messages, and steps already attempted..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                  <small className="text-muted">Minimum 10 characters.</small>
                </div>

                {/* Contact Phone & Address */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      name="contactPhone"
                      className="form-control bg-light"
                      placeholder="Best contact number for agent callback"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Location / Room Address
                    </label>
                    <input
                      type="text"
                      name="contactAddress"
                      className="form-control bg-light"
                      placeholder="e.g. Hostel Block B, Room 204 or Lab 3"
                      value={formData.contactAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-secondary">
                    Supporting Documents / Images (Optional, max 5 files, 5MB each)
                  </label>
                  <div className="border border-2 border-dashed rounded-3 p-4 text-center bg-light">
                    <Upload size={28} className="text-primary mb-2" />
                    <p className="small text-muted mb-2">
                      Upload screenshots, receipts, or documents (JPG, PNG, WEBP, PDF, DOC, TXT)
                    </p>
                    <input
                      type="file"
                      id="fileInput"
                      className="d-none"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="fileInput" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                      Browse Files
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-3">
                      <small className="fw-semibold text-secondary d-block mb-1">
                        Attached Files ({files.length}/5):
                      </small>
                      <div className="d-flex flex-wrap gap-2">
                        {files.map((f, index) => (
                          <div
                            key={index}
                            className="badge bg-white text-dark border p-2 d-inline-flex align-items-center gap-2 rounded-3 shadow-xs"
                          >
                            <Paperclip size={13} className="text-primary" />
                            <span className="text-truncate" style={{ maxWidth: '180px' }}>
                              {f.name}
                            </span>
                            <small className="text-muted">({(f.size / 1024).toFixed(0)} KB)</small>
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0 border-0"
                              onClick={() => removeFile(index)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                  <Link to="/user/dashboard" className="btn btn-light rounded-pill px-3">
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Grievance</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;
