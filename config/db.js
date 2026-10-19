const mongoose = require('mongoose');

let dbState = {
  mode: 'disconnected', // 'mongodb' | 'local' | 'disconnected'
  host: null,
};

/**
 * Get current active database mode
 */
const getDbMode = () => dbState.mode;

/**
 * Connect to MongoDB Atlas, with automatic graceful fallback to local persistent store
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const isPlaceholder = !mongoUri || mongoUri.includes('<username>') || mongoUri.includes('cluster0.example.mongodb.net');

  if (!isPlaceholder) {
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });

      dbState.mode = 'mongodb';
      dbState.host = conn.connection.host;
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);

      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB connection error: ${err.message}`);
      });

      return;
    } catch (error) {
      console.warn(`⚠️  MongoDB Atlas Connection Failed: ${error.message}`);
    }
  }

  // Graceful Fallback: Local Persistent Storage Mode
  dbState.mode = 'local';
  console.log('\n============================================================');
  console.log('⚡ UserHub is running in Local Storage Mode (backend/data/users.json)');
  console.log('✅ All REST API endpoints, JWT authentication & CRUD are 100% active.');
  console.log('💡 Default Login: admin@userhub.com | Admin@123456');
  console.log('ℹ️  To connect to MongoDB Atlas, set MONGODB_URI in backend/.env');
  console.log('============================================================\n');
};

module.exports = connectDB;
module.exports.getDbMode = getDbMode;
