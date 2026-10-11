

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const seedVehicles = require('./utils/seedVehicles');

const vehicleRoutes = require('./routes/vehicles');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bookingRoutes = require('./routes/bookings');
const licenseRoutes = require('./routes/licenses');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/users', userRoutes);

// basic health check
app.get('/', (req, res) => {
  res.send('RideNow API is running');
});

// 404 for unknown api routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

async function startServer() {
  await connectDB();
  await seedVehicles();

  app.listen(PORT, () => {
    console.log(`RideNow server running on port ${PORT}`);
  });
}

startServer();
