import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Shield, Clock, RefreshCw } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const ChatWindow = ({ complaintId, complaintNumber, assignedAgent, isClosed }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      setError('');
      const res = await axiosClient.get(`/complaints/${complaintId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Socket.IO real-time event room connection
    if (socket && complaintId) {
      socket.emit('join_complaint', complaintId);

      socket.on('new_message', (msg) => {
        setMessages((prev) => {
          // Avoid duplicate messages if already present
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });
    }

    return () => {
      if (socket && complaintId) {
        socket.emit('leave_complaint', complaintId);
        socket.off('new_message');
      }
    };
  }, [socket, complaintId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const res = await axiosClient.post(`/complaints/${complaintId}/messages`, {
        message: newMessage.trim(),
      });
      if (res.data.success) {
        setNewMessage('');
        // Add directly if socket hasn't fired yet
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.data._id)) return prev;
          return [...prev, res.data.data];
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 h-100 d-flex flex-column">
      {/* Header */}
      <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <div className="bg-primary-subtle text-primary p-2 rounded-circle me-3">
            <MessageSquare size={18} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">Communication Thread</h6>
            <small className="text-muted">
              {assignedAgent ? (
                <>Talking with <span className="fw-semibold text-primary">{assignedAgent.name}</span> ({assignedAgent.department || 'Support'})</>
              ) : (
                'Awaiting agent assignment...'
              )}
            </small>
          </div>
        </div>

        <button
          className="btn btn-sm btn-outline-secondary rounded-pill p-1 px-2"
          onClick={fetchMessages}
          title="Refresh Messages"
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Message List */}
      <div
        className="card-body p-3 overflow-auto flex-grow-1 bg-light bg-opacity-50"
        style={{ minHeight: '320px', maxHeight: '420px' }}
      >
        {loading ? (
          <div className="text-center py-5 text-muted small">Loading conversation...</div>
        ) : error ? (
          <div className="alert alert-warning small p-2 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <MessageSquare size={32} className="text-secondary opacity-50 mb-2" />
            <p className="small mb-1 fw-medium">No messages yet.</p>
            <p className="text-muted" style={{ fontSize: '0.78rem' }}>
              Send an update or question to the assigned agent below.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isSelf = m.sender?._id === user._id || m.sender === user._id;
            return (
              <div
                key={m._id}
                className={`d-flex flex-column mb-3 ${isSelf ? 'align-items-end' : 'align-items-start'}`}
              >
                <div className="d-flex align-items-center mb-1">
                  <span className="small fw-bold text-dark me-1" style={{ fontSize: '0.75rem' }}>
                    {isSelf ? 'You' : m.senderName || m.sender?.name}
                  </span>
                  <span
                    className={`badge ${
                      m.senderRole === 'ADMIN'
                        ? 'bg-danger-subtle text-danger'
                        : m.senderRole === 'AGENT'
                        ? 'bg-info-subtle text-info-emphasis'
                        : 'bg-secondary-subtle text-secondary'
                    }`}
                    style={{ fontSize: '0.62rem' }}
                  >
                    {m.senderRole || m.sender?.role}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-3 shadow-sm ${
                    isSelf
                      ? 'bg-primary text-white'
                      : 'bg-white text-dark border'
                  }`}
                  style={{
                    maxWidth: '80%',
                    borderTopRightRadius: isSelf ? '4px' : '12px',
                    borderTopLeftRadius: !isSelf ? '4px' : '12px',
                  }}
                >
                  <p className="mb-0 text-break" style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>
                    {m.message}
                  </p>
                </div>

                <small className="text-muted mt-1 d-flex align-items-center" style={{ fontSize: '0.68rem' }}>
                  <Clock size={10} className="me-1" />
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="card-footer bg-white border-top p-3">
        {isClosed ? (
          <div className="text-center text-muted small py-2">
            This complaint is closed. Communication is archived.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="d-flex gap-2">
            <input
              type="text"
              className="form-control rounded-pill px-3"
              placeholder="Type your message or inquiry..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <>
                  <Send size={15} />
                  <span className="d-none d-sm-inline">Send</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
