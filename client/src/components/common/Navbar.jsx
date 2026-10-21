import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  PlusCircle,
  FileText,
  User,
  LogOut,
  Users,
  Layers,
  Menu,
  X,
  ClipboardList,
  Star,
  Activity,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark-navy sticky-top shadow-sm py-2">
      <div className="container-fluid px-lg-4">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center fw-bold fs-5 text-white">
          <div className="bg-primary text-white rounded-3 p-1 me-2 d-flex align-items-center justify-content-center shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <span className="brand-title">Grievance<span className="text-primary-light">Hub</span></span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none text-white"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Items */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            {isAuthenticated ? (
              <>
                {/* USER NAVIGATION */}
                {user?.role === 'USER' && (
                  <>
                    <li className="nav-item">
                      <Link
                        to="/user/dashboard"
                        className={`nav-link px-3 ${isActive('/user/dashboard') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home size={16} className="me-1 d-inline" /> Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/user/submit-complaint"
                        className={`nav-link px-3 ${isActive('/user/submit-complaint') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <PlusCircle size={16} className="me-1 d-inline" /> Register Complaint
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/user/my-complaints"
                        className={`nav-link px-3 ${isActive('/user/my-complaints') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileText size={16} className="me-1 d-inline" /> My Complaints
                      </Link>
                    </li>
                  </>
                )}

                {/* AGENT NAVIGATION */}
                {user?.role === 'AGENT' && (
                  <>
                    <li className="nav-item">
                      <Link
                        to="/agent/dashboard"
                        className={`nav-link px-3 ${isActive('/agent/dashboard') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home size={16} className="me-1 d-inline" /> Agent Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/agent/complaints"
                        className={`nav-link px-3 ${isActive('/agent/complaints') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ClipboardList size={16} className="me-1 d-inline" /> Assigned Complaints
                      </Link>
                    </li>
                  </>
                )}

                {/* ADMIN NAVIGATION */}
                {user?.role === 'ADMIN' && (
                  <>
                    <li className="nav-item">
                      <Link
                        to="/admin/dashboard"
                        className={`nav-link px-3 ${isActive('/admin/dashboard') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home size={16} className="me-1 d-inline" /> Overview
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/admin/complaints"
                        className={`nav-link px-3 ${isActive('/admin/complaints') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ClipboardList size={16} className="me-1 d-inline" /> Complaints Desk
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/admin/users"
                        className={`nav-link px-3 ${isActive('/admin/users') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Users size={16} className="me-1 d-inline" /> Users & Staff
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/admin/categories"
                        className={`nav-link px-3 ${isActive('/admin/categories') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Layers size={16} className="me-1 d-inline" /> Categories
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/admin/feedback"
                        className={`nav-link px-3 ${isActive('/admin/feedback') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Star size={16} className="me-1 d-inline" /> Reviews
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/admin/audit-logs"
                        className={`nav-link px-3 ${isActive('/admin/audit-logs') ? 'active text-primary-light fw-semibold' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Activity size={16} className="me-1 d-inline" /> Audit Trail
                      </Link>
                    </li>
                  </>
                )}
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/" className={`nav-link px-3 ${isActive('/') ? 'active text-white fw-semibold' : ''}`}>
                    Home
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Right Action Menu */}
          <div className="d-flex align-items-center mt-3 mt-lg-0">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />

                <div className="dropdown me-2">
                  <button
                    className="btn btn-outline-light btn-sm d-flex align-items-center rounded-pill px-3 py-1 dropdown-toggle"
                    data-bs-toggle="dropdown"
                    type="button"
                    id="userDropdown"
                  >
                    <User size={15} className="me-2" />
                    <span className="me-2 text-truncate" style={{ maxWidth: '120px' }}>
                      {user?.name}
                    </span>
                    <span
                      className={`badge rounded-pill ${
                        user?.role === 'ADMIN'
                          ? 'bg-danger text-white'
                          : user?.role === 'AGENT'
                          ? 'bg-info text-dark'
                          : 'bg-primary text-white'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {user?.role}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                    <li>
                      <Link to="/profile" className="dropdown-item py-2">
                        <User size={15} className="me-2" /> My Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                        <LogOut size={15} className="me-2" /> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>

                <button
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 d-none d-lg-inline-flex align-items-center"
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3 rounded-pill fw-semibold shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
