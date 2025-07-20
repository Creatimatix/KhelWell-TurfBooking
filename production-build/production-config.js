// Production configuration for Scalahosting
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 5001,
    host: '0.0.0.0', // Listen on all interfaces
    trustProxy: true // Trust proxy headers
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'turf_booking',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false // Disable SQL logging in production
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-production-jwt-secret',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // File upload configuration
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // Security headers
  security: {
    helmet: true,
    hsts: true,
    contentSecurityPolicy: true
  }
}; 