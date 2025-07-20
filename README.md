# ⚽ KhelWell - Your Game. Your Journey. All in One Place

A comprehensive sports platform for booking turfs, joining events, and connecting with sports enthusiasts. Built with React, Node.js, MySQL, and Sequelize.

## 🎯 About KhelWell

**KhelWell** is more than just a turf booking platform. It's a complete sports ecosystem where players, turf owners, and event organizers come together to create an active sports community.

### Our Mission
To make sports accessible to everyone by providing a seamless platform for booking turfs, discovering events, and building a vibrant sports community.

## 🚀 Features

### For Sports Enthusiasts
- **Turf Booking**: Browse and book sports turfs with real-time availability
- **Event Discovery**: View and register for sports events and tournaments
- **Review System**: Rate and review turfs with detailed feedback
- **Personal Dashboard**: Track bookings, spending, and favorite sports
- **Profile Management**: Update personal information and preferences
- **OTP Authentication**: Secure login with SMS verification

### For Turf Owners
- **Turf Management**: Add and manage multiple turfs
- **Booking Management**: View and manage all bookings
- **Revenue Tracking**: Monitor earnings and booking statistics
- **Profile Management**: Update turf information and pricing

### For Admins
- **Event Management**: Create, edit, and manage sports events
- **User Management**: Monitor and manage all users
- **System Overview**: Complete platform statistics and analytics
- **Content Moderation**: Manage reviews and content

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI** for UI components
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **Sequelize ORM** with MySQL
- **JWT** for authentication
- **Twilio** for SMS OTP
- **Express Validator** for input validation
- **Bcrypt** for password hashing

### Database
- **MySQL** for data persistence
- **Sequelize** for database operations

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd KhelWell/WebApp
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE turf_booking;
CREATE USER 'turf_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON turf_booking.* TO 'turf_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Update Environment Variables
Copy the example environment file and update it:
```bash
cd backend
cp config.env.example config.env
```

Edit `backend/config.env`:
```env
PORT=5001

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=turf_booking
DB_USER=turf_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Environment
NODE_ENV=development

# Twilio Configuration (for OTP)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4. Initialize Database
```bash
npm run setup-db
npm run seed
```

### 5. Start the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start backend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📁 Project Structure

```
WebApp/
├── backend/                 # Backend API
│   ├── config.env          # Environment variables
│   ├── server.js           # Express server
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── utils/              # Utility functions
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
├── package.json            # Root package.json
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/config.env`)
- `PORT`: Server port (default: 5001)
- `DB_HOST`: MySQL host
- `DB_PORT`: MySQL port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT secret key
- `JWT_EXPIRE`: JWT expiration time
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

### Frontend Configuration
The frontend is configured to connect to the backend API at `http://localhost:5001`. If you change the backend port, update the API URLs in the frontend code.

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and profiles
- **turfs**: Turf information and details
- **bookings**: Turf booking records
- **events**: Sports events and tournaments
- **reviews**: Turf reviews and ratings
- **otps**: OTP verification codes

### Relationships
- Users can have multiple bookings
- Turfs can have multiple bookings and reviews
- Events are created by users (admins)
- Reviews are linked to users and turfs

## 🔐 Authentication & Authorization

### User Roles
- **user**: Regular users who can book turfs and view events
- **owner**: Turf owners who can manage their turfs
- **admin**: Administrators with full system access

### Authentication Flow
1. User enters phone number
2. OTP is sent via SMS (Twilio)
3. User enters OTP to verify
4. JWT token is issued for session management

## 📱 API Endpoints

### Authentication
- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP and login
- `POST /api/auth/register` - Register new user

### Users
- `GET /api/users/dashboard` - Get user dashboard data
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/favorite-sports` - Get user's favorite sports

### Turfs
- `GET /api/turfs` - Get all turfs
- `GET /api/turfs/nearby` - Get nearby turfs
- `GET /api/turfs/:id` - Get turf details
- `POST /api/turfs` - Create turf (owner only)
- `PUT /api/turfs/:id` - Update turf (owner only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Reviews
- `GET /api/reviews/turf/:id` - Get turf reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

#### 1. Build Frontend
```bash
npm run build
```

#### 2. Set Production Environment
```bash
export NODE_ENV=production
```

#### 3. Start Backend
```bash
npm start
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ .
EXPOSE 5001
CMD ["npm", "start"]
```

## 🧪 Testing

### API Testing
```bash
# Test OTP sending
curl -X POST http://localhost:5001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91 99999 99999"}'

# Test events API
curl -X GET http://localhost:5001/api/events
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📊 Sample Data

The application includes sample data for testing:
- Sample users (admin, owner, regular users)
- Sample turfs with images and pricing
- Sample events and bookings
- Sample reviews and ratings

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
- Verify MySQL is running
- Check database credentials in `config.env`
- Ensure database exists

#### 2. OTP Not Sending
- Verify Twilio credentials
- Check phone number format (+91XXXXXXXXXX)
- Ensure sufficient Twilio credits

#### 3. Frontend Not Loading
- Check if backend is running on port 5001
- Verify API URLs in frontend code
- Check browser console for errors

#### 4. Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@khelwell.com
- Phone: +91 99999 99999
- Documentation: [Link to docs]

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Payment gateway integration
- [ ] Real-time booking notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration

---

**Made with ❤️ by the KhelWell Team** 