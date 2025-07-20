#!/bin/bash

echo "🚀 KhelWell Turf Booking - Quick Start Guide"
echo "=============================================="
echo ""

echo "📋 Prerequisites:"
echo "1. Node.js and npm installed"
echo "2. MongoDB Atlas account (free)"
echo ""

echo "🔧 Step 1: Install Dependencies"
echo "Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"

echo ""
echo "Installing frontend dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

echo ""
echo "📝 Step 2: MongoDB Atlas Setup"
echo "Please follow the MONGODB_SETUP.md guide to:"
echo "1. Create a MongoDB Atlas account"
echo "2. Create a free cluster"
echo "3. Set up database access"
echo "4. Get your connection string"
echo ""

echo "🔗 Step 3: Update Configuration"
echo "Once you have your MongoDB connection string:"
echo "1. Update backend/config.env with your MONGODB_URI"
echo "2. Update setup-database.js with your MONGODB_URI"
echo ""

echo "🗄️ Step 4: Setup Database"
echo "Run the database setup script:"
echo "cd backend && node ../setup-database.js"
echo ""

echo "🚀 Step 5: Start the Application"
echo "Terminal 1 - Start Backend:"
echo "cd backend && npm start"
echo ""
echo "Terminal 2 - Start Frontend:"
echo "cd frontend && npm start"
echo ""

echo "🌐 Step 6: Access the Application"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5001"
echo ""

echo "🧪 Step 7: Test the Application"
echo "Sample users created:"
echo "- Admin: admin@khelwell.com / admin123"
echo "- User: john@example.com / password123"
echo "- Owner: owner@example.com / owner123"
echo ""

echo "📚 For detailed instructions, see MONGODB_SETUP.md"
echo ""

echo "🎉 Happy coding!" 