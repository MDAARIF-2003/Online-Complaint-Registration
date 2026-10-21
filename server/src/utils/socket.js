let io = null;

const initSocket = (server, clientUrl) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: clientUrl || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join personal user room for direct notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join specific complaint room for live chat & status updates
    socket.on('join_complaint', (complaintId) => {
      if (complaintId) {
        socket.join(`complaint_${complaintId}`);
      }
    });

    // Leave complaint room
    socket.on('leave_complaint', (complaintId) => {
      if (complaintId) {
        socket.leave(`complaint_${complaintId}`);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  console.log('[Socket.IO] Real-time engine initialized.');
  return io;
};

const getIO = () => io;

const emitNotification = (recipientId, notification) => {
  if (io && recipientId) {
    io.to(`user_${recipientId}`).emit('new_notification', notification);
  }
};

const emitComplaintMessage = (complaintId, message) => {
  if (io && complaintId) {
    io.to(`complaint_${complaintId}`).emit('new_message', message);
  }
};

const emitComplaintStatusUpdate = (complaintId, payload) => {
  if (io && complaintId) {
    io.to(`complaint_${complaintId}`).emit('status_updated', payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNotification,
  emitComplaintMessage,
  emitComplaintStatusUpdate,
};
