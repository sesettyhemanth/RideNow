
const mongoose = require('mongoose');

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error(
      'MONGODB_URI is missing from the environment variables'
    );
  }

  if (
    mongoURI.includes('localhost') ||
    mongoURI.includes('127.0.0.1')
  ) {
    throw new Error(
      'MONGODB_URI points to localhost. Use your MongoDB Atlas connection string in Render.'
    );
  }

  try {
    const conn = await mongoose.connect(mongoURI);

    console.log(
      `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
}

module.exports = connectDB;
