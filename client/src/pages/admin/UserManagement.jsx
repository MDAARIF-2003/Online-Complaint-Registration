import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserCheck,
  Shield,
  ShieldAlert,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit User Role Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('USER');
  const [selectedDept, setSelectedDept] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Create Staff Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    role: 'AGENT',
    department: 'Technical Support',
    phone: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (role !== 'ALL') params.append('role', role);
      if (status !== 'ALL') params.append('status', status);
      if (search.trim()) params.append('search', search.trim());

      const res = await axiosClient.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
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
    fetchUsers();
  }, [page, role, status, search]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await axiosClient.patch(`/admin/users/${user._id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        setAlertMsg({ type: 'success', text: `User ${user.name} is now ${newStatus}.` });
        fetchUsers();
      }
    } catch (err) {
      setAlertMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Could not update user status.',
      });
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setModalLoading(true);
      const res = await axiosClient.patch(`/admin/users/${editingUser._id}/role`, {
        role: selectedRole,
        department: selectedDept,
      });
      if (res.data.success) {
        setAlertMsg({ type: 'success', text: `Role updated for ${editingUser.name}.` });
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setAlertMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update user role.',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      const res = await axiosClient.post('/admin/users/create-staff', newStaff);
      if (res.data.success) {
        setAlertMsg({ type: 'success', text: res.data.message });
        setShowCreateModal(false);
        setNewStaff({
          name: '',
          email: '',
          password: '',
          role: 'AGENT',
          department: 'Technical Support',
          phone: '',
        });
        fetchUsers();
      }
    } catch (err) {
      setAlertMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to create staff account.',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="container-fluid px-lg-5 py-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">User &amp; Agent Administration</h3>
          <p className="text-muted small mb-0">
            Control account activation status, promote users to support agents, and assign department roles ({total} total accounts)
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            className="btn btn-outline-secondary rounded-pill btn-sm px-3 d-flex align-items-center gap-1"
            onClick={fetchUsers}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            className="btn btn-primary rounded-pill btn-sm px-3 d-flex align-items-center gap-1 shadow-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus size={15} /> Add Staff Account
          </button>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show small py-2 px-3 rounded-3 mb-4`}>
          {alertMsg.text}
          <button
            type="button"
            className="btn-close p-2"
            onClick={() => setAlertMsg({ type: '', text: '' })}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 ps-0"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select bg-light text-dark"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Citizens / Users</option>
              <option value="AGENT">Support Agents</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select bg-light text-dark"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Deactivated Accounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Department</th>
                <th>Contact Phone</th>
                <th>Account Status</th>
                <th>Joined</th>
                <th className="pe-4 text-end">Account Controls</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    <LoadingSpinner message="Fetching user directory..." />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <Users size={36} className="text-secondary opacity-50 mb-2" />
                    <p className="mb-0 fw-medium">No users match your criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td className="ps-4 fw-semibold text-dark">{u.name}</td>
                    <td className="small text-muted">{u.email}</td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          u.role === 'ADMIN'
                            ? 'bg-danger text-white'
                            : u.role === 'AGENT'
                            ? 'bg-info-subtle text-info-emphasis'
                            : 'bg-primary-subtle text-primary'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="small text-secondary">{u.department || '—'}</span>
                    </td>
                    <td className="small text-muted">{u.phone || '—'}</td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          u.status === 'ACTIVE'
                            ? 'bg-success-subtle text-success'
                            : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="pe-4 text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-secondary rounded-pill px-2"
                          onClick={() => {
                            setEditingUser(u);
                            setSelectedRole(u.role);
                            setSelectedDept(u.department || 'Technical Support');
                          }}
                        >
                          <Edit size={13} className="me-1 d-inline" /> Edit Role
                        </button>

                        <button
                          className={`btn btn-sm rounded-pill px-2 ${
                            u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'
                          }`}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* Create Staff Account Modal */}
      {showCreateModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1060 }}
        >
          <div className="card border-0 shadow-lg rounded-4 p-4 bg-white" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
              <h5 className="fw-bold mb-0 text-dark">Add New Staff / Agent Account</h5>
              <button className="btn btn-link text-secondary p-0" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="e.g. David Miller"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address *</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  placeholder="staff@organization.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Password *</label>
                <input
                  type="password"
                  className="form-control bg-light"
                  placeholder="Min 6 characters"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Account Role</label>
                  <select
                    className="form-select bg-light"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  >
                    <option value="AGENT">AGENT (Support Specialist)</option>
                    <option value="ADMIN">ADMIN (Full Administrator)</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Department</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    placeholder="e.g. Technical Support"
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Phone Number (Optional)</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  placeholder="e.g. +91 98765 00000"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-pill px-3"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1060 }}
        >
          <div className="card border-0 shadow-lg rounded-4 p-4 bg-white" style={{ maxWidth: '480px', width: '90%' }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
              <h5 className="fw-bold mb-0 text-dark">Modify User Role &amp; Permissions</h5>
              <button className="btn btn-link text-secondary p-0" onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>

            <p className="small text-muted mb-3">
              Editing permissions for: <strong>{editingUser.name}</strong> ({editingUser.email})
            </p>

            <form onSubmit={handleRoleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Target Role</label>
                <select
                  className="form-select bg-light"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="USER">USER - Standard Complainant</option>
                  <option value="AGENT">AGENT - Support Specialist</option>
                  <option value="ADMIN">ADMIN - System Administrator</option>
                </select>
              </div>

              {selectedRole === 'AGENT' && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Assigned Department</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    placeholder="e.g. Technical Support, Billing & Accounts..."
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  />
                </div>
              )}

              <div className="d-flex gap-2 justify-content-end mt-4">
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-pill px-3"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
