#!/bin/bash

echo "🚀 KhelWell Deployment Script"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Check if config.env exists
if [ ! -f "backend/config.env" ]; then
    echo "⚠️  config.env not found. Creating from example..."
    cp backend/config.env.example backend/config.env
    echo "📝 Please edit backend/config.env with your database and Twilio credentials"
    echo "   Then run this script again."
    exit 1
fi

# Setup database
echo "🗄️  Setting up database..."
npm run setup-db

# Seed database
echo "🌱 Seeding database with sample data..."
npm run seed

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Start the application: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo ""
echo "🔑 Sample login credentials:"
echo "- Admin: admin@khelwell.com / admin123"
echo "- User: john@example.com / password123"
echo "- Owner: owner@example.com / owner123"
echo ""
echo "📱 For OTP login, use phone numbers:"
echo "- +919876543210 (Admin)"
echo "- +919876543211 (User)"
echo "- +919876543212 (Owner)"
echo ""
echo "🚀 Happy coding!" 