const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import database configuration
const { sequelize, testConnection } = require('./config/database');

// Import models
const User = require('./models/User');
const Turf = require('./models/Turf');
const Booking = require('./models/Booking');
const Event = require('./models/Event');
const Slot = require('./models/Slot');
const Notification = require('./models/Notification');
const OTP = require('./models/OTP');
const Review = require('./models/Review');

// Import routes
const authRoutes = require('./routes/auth');
const turfRoutes = require('./routes/turfs');
const bookingRoutes = require('./routes/bookings');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const slotRoutes = require('./routes/slots');
const notificationRoutes = require('./routes/notifications');
const ownerRoutes = require('./routes/owner');
const otpRoutes = require('./routes/otp');
const reviewRoutes = require('./routes/reviews');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection and sync
const initializeDatabase = async () => {
  try {
    await testConnection();
    
    // Set up model associations
    Turf.hasMany(Review, { foreignKey: 'turf_id', as: 'reviews' });
    Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Review.belongsTo(Turf, { foreignKey: 'turf_id', as: 'turf' });
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    console.log('Please make sure MySQL is running and credentials are correct');
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Turf Booking API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Initialize database and start server
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error); 