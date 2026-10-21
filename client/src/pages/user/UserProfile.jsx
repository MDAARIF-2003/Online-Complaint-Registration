import React, { useState } from 'react';
import { User, Mail, Phone, Lock, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserProfile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword) {
      if (!currentPassword) {
        setError('Current password is required to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        setSuccess('Profile updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-dark-navy text-white p-4 border-0">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary text-white p-2 rounded-3 shadow-sm">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1 text-white">Account Profile</h4>
                  <p className="text-white-50 small mb-0">Manage your personal information and security credentials</p>
                </div>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 small py-2 px-3 rounded-3 mb-4">
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 px-3 rounded-3 mb-4">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Role & Status Card */}
              <div className="p-3 bg-light rounded-3 mb-4 d-flex align-items-center justify-content-between border">
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Assigned System Role</small>
                  <span className="fw-bold text-dark">{user?.role}</span>
                </div>
                <span className="badge bg-success text-white rounded-pill px-3 py-2 small">
                  Account Active
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 ps-0"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Email Address (Read-only)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0 ps-0 text-muted"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">Contact Phone</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Phone size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Change Sub-section */}
                <div className="border-top pt-4 mb-4">
                  <h6 className="fw-bold text-dark mb-1 small text-uppercase">Change Password</h6>
                  <p className="text-muted small mb-3">Leave blank if you do not wish to update your password.</p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Current Password</label>
                    <input
                      type="password"
                      className="form-control bg-light"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">New Password</label>
                      <input
                        type="password"
                        className="form-control bg-light"
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Confirm New</label>
                      <input
                        type="password"
                        className="form-control bg-light"
                        placeholder="Re-enter new"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 py-2 w-100 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
