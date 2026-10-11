// Handles the connection to MongoDB. Called once from server.js on startup.
const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    // there's no point running the API without a database, so bail out
    process.exit(1);
  }
}

module.exports = connectDB;
