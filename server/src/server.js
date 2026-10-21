require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { initSocket } = require('./utils/socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB (or embedded MongoMemoryServer fallback if needed)
    await connectDB();

    // 2. Create HTTP server wrap
    const server = http.createServer(app);

    // 3. Attach Socket.IO
    initSocket(server, process.env.CLIENT_URL);

    // 4. Start listening
    server.listen(PORT, () => {
      console.log('====================================================');
      console.log(`[Server] Complaint Management API running on PORT: ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Health Check: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server Fatal Error] Failed to initialize server:', error.message);
    process.exit(1);
  }
};

startServer();
