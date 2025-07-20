const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();

// Production configuration
const config = require('../production-config');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.twilio.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Compression
app.use(compression());

// CORS configuration
app.use(cors(config.cors));

// Trust proxy
app.set('trust proxy', config.server.trustProxy);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/users', require('./routes/users'));
app.use('/api/turfs', require('./routes/turfs'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/events', require('./routes/events'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/owner', require('./routes/owner'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  console.log(`🚀 KhelWell server running on ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 