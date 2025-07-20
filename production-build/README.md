# Turf Booking Backend API

A comprehensive REST API for a turf booking system built with Express.js, MongoDB, and JWT authentication.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Multi-role System**: Users, Turf Owners, and Admins with different permissions
- **Turf Management**: CRUD operations for turfs with search and filtering
- **Booking System**: Slot booking with availability checks and status management
- **Event Management**: Admin can create and manage upcoming/ongoing events
- **Dashboard Analytics**: Comprehensive analytics for all user types
- **Payment Integration**: Payment status tracking (ready for payment gateway integration)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Password Hashing**: bcryptjs
- **File Upload**: Multer (ready for image uploads)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/turf-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Turfs
- `GET /api/turfs` - Get all turfs (with search/filter)
- `GET /api/turfs/:id` - Get single turf
- `POST /api/turfs` - Create new turf (Owner only)
- `PUT /api/turfs/:id` - Update turf (Owner only)
- `DELETE /api/turfs/:id` - Delete turf (Owner only)
- `GET /api/turfs/owner/my-turfs` - Get owner's turfs

### Bookings
- `POST /api/bookings` - Create new booking (User only)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/turf/:turfId` - Get turf bookings (Owner only)
- `PUT /api/bookings/:id/status` - Update booking status (Owner/Admin)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/ongoing` - Get ongoing events

### User Dashboard
- `GET /api/users/dashboard` - Get user dashboard data
- `GET /api/users/favorite-sports` - Get user's favorite sports
- `GET /api/users/booking-history` - Get booking history
- `GET /api/users/profile-stats` - Get profile statistics

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/turfs` - Get all turfs for admin
- `PUT /api/admin/turfs/:id/verify` - Verify turf
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/analytics/revenue` - Get revenue analytics
- `GET /api/admin/analytics/sports` - Get sport analytics

## User Roles

### User
- Browse and search turfs
- Book turf slots
- View booking history
- Access user dashboard

### Owner
- All user permissions
- Create and manage turfs
- View turf bookings
- Update booking statuses

### Admin
- All permissions
- Manage users and turfs
- Create and manage events
- Access comprehensive analytics
- Verify turfs

## Data Models

### User
- Basic info (name, email, phone)
- Role-based access (user, owner, admin)
- Address information
- Profile image
- Verification status

### Turf
- Basic info (name, description, sport type)
- Location details
- Pricing and operating hours
- Amenities and surface type
- Owner reference
- Verification status

### Booking
- User and turf references
- Date and time slots
- Duration and pricing
- Status tracking
- Payment information

### Event
- Event details (title, description, dates)
- Location and sport type
- Entry fees and participant limits
- Status management
- Admin creation

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `NODE_ENV`: Environment (development/production)

## Development

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS enabled
- Environment variable protection

## Future Enhancements

- Image upload functionality
- Payment gateway integration
- Email notifications
- SMS notifications
- Real-time booking updates
- Rating and review system
- Advanced analytics and reporting 