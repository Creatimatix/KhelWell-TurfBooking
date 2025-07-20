# 🚀 Quick Start Guide

Get KhelWell running in 5 minutes!

## Prerequisites
- Node.js (v16+)
- npm (v8+)
- MySQL (v8.0+)

## Option 1: Automatic Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd KhelWell/WebApp

# Run the deployment script
./deploy.sh
```

## Option 2: Manual Setup

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Database
```bash
# Copy environment file
cp backend/config.env.example backend/config.env

# Edit the file with your database credentials
nano backend/config.env
```

### 3. Setup Database
```bash
npm run setup-db
npm run seed
```

### 4. Start Application
```bash
npm run dev
```

## Option 3: Docker Setup

```bash
# Start with Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t khelwell .
docker run -p 5001:5001 khelwell
```

## 🎯 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 🔑 Sample Login Credentials

### Email/Password Login
- **Admin**: admin@khelwell.com / admin123
- **User**: john@example.com / password123
- **Owner**: owner@example.com / owner123

### OTP Login (Phone Numbers)
- **Admin**: +919876543210
- **User**: +919876543211
- **Owner**: +919876543212

## 📱 Features to Test

1. **User Registration/Login** (OTP or Email)
2. **Browse Turfs** with ratings and pricing
3. **Book Turfs** with slot selection
4. **View Events** and register
5. **Submit Reviews** for turfs
6. **Admin Dashboard** (create events, manage users)
7. **Owner Dashboard** (manage turfs, view bookings)

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql
```

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

### Permission Issues
```bash
# Make deploy script executable
chmod +x deploy.sh
```

## 📞 Support

- **Email**: support@khelwell.com
- **Phone**: +91 99999 99999
- **Documentation**: See README.md for detailed guide

---

**Happy coding! 🎉** 