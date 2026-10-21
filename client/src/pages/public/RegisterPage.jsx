import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      if (res.success) {
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Header */}
            <div className="card-header bg-dark-navy text-white text-center py-4 px-4 border-0">
              <div className="bg-primary text-white rounded-3 p-2 d-inline-flex mb-2 shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <h4 className="fw-bold mb-1 text-white">Create an Account</h4>
              <p className="text-white-50 small mb-0">
                Register as a Complainant / Citizen to track and manage grievances
              </p>
            </div>

            <div className="card-body p-4 p-lg-5 bg-white">
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 px-3 rounded-3 mb-4">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      name="name"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Phone Number (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="row g-2 mb-4">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="form-control bg-light border-start-0 border-end-0 ps-0"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text bg-light border-start-0 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="form-control bg-light border-start-0 ps-0"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-muted small mt-4">
                Already have an account?{' '}
                <Link to="/login" className="fw-semibold text-primary text-decoration-none">
                  Sign In here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
