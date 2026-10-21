const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/OnlineComplaintRegistration';
  const allowMemoryFallback = process.env.ALLOW_MEMORY_DB_FALLBACK !== 'false';

  try {
    // 1. Attempt standard connection to the configured MONGODB_URI (Local or Atlas)
    console.log(`[Database] Connecting to MongoDB instance at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 4000,
    });

    console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.warn(`[Database] Standalone MongoDB server not detected at ${uri} (${error.message}).`);

    if (allowMemoryFallback) {
      console.log('[Database] Starting persistent local MongoDB database engine...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        
        // Persistent database storage directory on disk
        const dataDir = path.join(__dirname, '../../data/db');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbPath: dataDir,
            storageEngine: 'wiredTiger',
          },
        });

        const persistentUri = mongodInstance.getUri();
        await mongoose.connect(persistentUri);
        console.log(`[Database] Persistent MongoDB service running at: ${persistentUri}`);
        console.log(`[Database] Data store persisted to disk at: ${dataDir}`);
      } catch (memError) {
        console.error('[Database] Failed to launch local database engine:', memError.message);
        throw error;
      }
    } else {
      throw error;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[Database] Disconnected from MongoDB');
  });
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
