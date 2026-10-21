import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/unauthorized' && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    else if (role === 'AGENT') navigate('/agent/dashboard', { replace: true });
    else navigate('/user/dashboard', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success && res.user) {
        redirectAfterLogin(res.user.role);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Header */}
            <div className="card-header bg-dark-navy text-white text-center py-4 px-4 border-0">
              <div className="bg-primary text-white rounded-3 p-2 d-inline-flex mb-2 shadow-sm">
                <ShieldCheck size={30} />
              </div>
              <h4 className="fw-bold mb-1 text-white">Sign In to GrievanceHub</h4>
              <p className="text-white-50 small mb-0">
                Centralized Grievance Registration &amp; Management Portal
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
                {/* Email Address */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Registered Email Address
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold text-secondary">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control bg-light border-start-0 border-end-0 ps-0"
                      placeholder="Enter your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="input-group-text bg-light border-start-0 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-muted small mt-4 pt-3 border-top">
                Don't have an account yet?{' '}
                <Link to="/register" className="fw-semibold text-primary text-decoration-none">
                  Register as a New User
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
