import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useSocket } from '../../context/SocketContext';

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      socket.on('new_notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      if (socket) {
        socket.off('new_notification');
      }
    };
  }, [socket]);

  const markAllAsRead = async () => {
    try {
      await axiosClient.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      // ignore
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await axiosClient.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setIsOpen(false);
      if (notif.relatedComplaint) {
        const id = notif.relatedComplaint._id || notif.relatedComplaint;
        navigate(`/complaints/${id}`);
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="position-relative me-3">
      <button
        className="btn btn-light rounded-circle position-relative p-2 border-0 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={19} className="text-secondary" />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1040 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="card shadow-lg border-0 position-absolute end-0 mt-2 rounded-3"
            style={{ width: '340px', zIndex: 1050, maxHeight: '420px' }}
          >
            <div className="card-header bg-white py-2 px-3 d-flex align-items-center justify-content-between border-bottom">
              <span className="fw-bold text-dark small">Notifications ({unreadCount} new)</span>
              {unreadCount > 0 && (
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0 small text-primary"
                  onClick={markAllAsRead}
                >
                  <Check size={14} className="me-1" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="card-body p-0 overflow-auto" style={{ maxHeight: '340px' }}>
              {loading ? (
                <div className="p-3 text-center text-muted small">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted small">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 border-bottom cursor-pointer notification-item ${
                      !n.read ? 'bg-primary-subtle bg-opacity-25' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="d-flex align-items-start justify-content-between">
                      <p className="fw-semibold mb-1 text-dark small">{n.title}</p>
                      {!n.read && (
                        <span className="badge bg-primary rounded-circle p-1" style={{ width: '6px', height: '6px' }} />
                      )}
                    </div>
                    <p className="text-secondary small mb-1" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                      {n.message}
                    </p>
                    <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                      <Clock size={11} className="me-1" />
                      {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
