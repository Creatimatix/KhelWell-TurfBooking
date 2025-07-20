const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './config.env' });

async function setupDatabase() {
  console.log('🚀 Setting up KhelWell database...');

  // Create connection to MySQL server (without specifying database)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'turf_booking';
    console.log(`📦 Creating database: ${dbName}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created successfully`);

    // Close the connection
    await connection.end();

    // Create Sequelize instance with the database
    const sequelize = new Sequelize(
      process.env.DB_NAME || 'turf_booking',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
      }
    );

    // Test the connection
    console.log('🔗 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Import models
    console.log('📋 Importing models...');
    require('./models/User');
    require('./models/Turf');
    require('./models/Booking');
    require('./models/Event');
    require('./models/Review');
    require('./models/OTP');

    // Sync all models with database
    console.log('🔄 Syncing models with database...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized successfully');

    // Close Sequelize connection
    await sequelize.close();
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run seed (to add sample data)');
    console.log('2. Run: npm run dev (to start the application)');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 