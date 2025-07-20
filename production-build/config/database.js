const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './config.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'turf_booking',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
  }
};

module.exports = { sequelize, testConnection }; 