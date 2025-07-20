# MySQL Database Setup Guide

This guide will help you set up MySQL for the KhelWell Turf Booking application.

## Prerequisites

- macOS (for this guide)
- Homebrew (for easy installation)

## Step 1: Install MySQL

### Using Homebrew (Recommended)
```bash
# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Verify installation
mysql --version
```

### Alternative: Download from MySQL Website
1. Visit [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. Download MySQL Community Server for macOS
3. Follow the installation wizard

## Step 2: Secure MySQL Installation

```bash
# Secure the installation (set root password)
mysql_secure_installation
```

Follow the prompts:
- Set a root password (remember this!)
- Remove anonymous users: `Y`
- Disallow root login remotely: `Y`
- Remove test database: `Y`
- Reload privilege tables: `Y`

## Step 3: Create Database

```bash
# Connect to MySQL as root
mysql -u root -p

# Create database
CREATE DATABASE turf_booking;

# Verify database creation
SHOW DATABASES;

# Exit MySQL
EXIT;
```

## Step 4: Update Configuration

Edit `backend/config.env` and update the MySQL credentials:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=turf_booking
DB_USER=root
DB_PASSWORD=your_root_password_here
```

## Step 5: Install Dependencies

```bash
cd backend
npm install mysql2 sequelize
```

## Step 6: Setup Database Schema and Sample Data

```bash
# Run the setup script
node setup-mysql.js
```

This will:
- Create all necessary tables
- Insert sample users and turfs
- Set up proper relationships

## Step 7: Start the Application

```bash
# Start backend
cd backend
npm start

# Start frontend (in another terminal)
cd frontend
npm start
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if MySQL is running
   brew services list
   
   # Start MySQL if not running
   brew services start mysql
   ```

2. **Access Denied**
   ```bash
   # Reset root password if needed
   mysql -u root -p
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   ```

3. **Database Not Found**
   ```bash
   # Connect to MySQL and create database
   mysql -u root -p
   CREATE DATABASE turf_booking;
   ```

4. **Port Already in Use**
   ```bash
   # Check what's using port 3306
   lsof -i :3306
   
   # Kill the process if needed
   kill -9 <PID>
   ```

### Useful MySQL Commands

```bash
# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE turf_booking;

# Show tables
SHOW TABLES;

# Check table structure
DESCRIBE users;
DESCRIBE turfs;

# View sample data
SELECT * FROM users;
SELECT * FROM turfs;
```

## Sample Data

After running the setup script, you'll have:

### Users
- **Admin**: admin@khelwell.com / admin123
- **User**: john@example.com / password123  
- **Owner**: owner@example.com / owner123

### Turfs
- Premium Football Ground (Mumbai)
- Cricket Academy Ground (Mumbai)

## API Endpoints

Once everything is set up, test these endpoints:

```bash
# Health check
curl http://localhost:5001/api/health

# Get turfs
curl http://localhost:5001/api/turfs

# Register user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"9876543210"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Next Steps

1. **Test the application**: Visit http://localhost:3000
2. **Create more turfs**: Use the owner account
3. **Make bookings**: Use the user account
4. **Customize**: Modify the sample data as needed

## Production Considerations

For production deployment:

1. **Create dedicated database user** (don't use root)
2. **Set strong passwords**
3. **Configure proper backups**
4. **Enable SSL connections**
5. **Set up proper firewall rules**

```sql
-- Create dedicated user for production
CREATE USER 'turf_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON turf_booking.* TO 'turf_app'@'localhost';
FLUSH PRIVILEGES;
```

## Support

If you encounter issues:

1. Check MySQL error logs: `/usr/local/var/mysql/`
2. Verify MySQL service status: `brew services list`
3. Test connection: `mysql -u root -p`
4. Check application logs for specific errors

---

**Happy coding! 🚀** 