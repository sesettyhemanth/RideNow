const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
// const seedVehicles = require('./utils/seedVehicles'); // Commented out to prevent restart loops

const vehicleRoutes = require('./routes/vehicles');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/bookings');
const licenseRoutes = require('./routes/licenses');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).send('RideNow API is running');
});

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
async function startServer() {
  try {
    console.log('Starting RideNow backend...');

    await connectDB();
    console.log('MongoDB connection completed');

    // Prevent auto-seeding on every server boot to stop the restart loop
    // await seedVehicles();
    // console.log('Vehicle seeding completed');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`RideNow server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start RideNow server:');
    console.error(error);
    process.exit(1);
  }
}

startServer();