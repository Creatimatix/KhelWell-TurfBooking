# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create an account with your email

## Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

## Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

## Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

## Step 5: Get Your Connection String

1. Click "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

## Step 6: Update Your Configuration

1. Open `backend/config.env`
2. Replace the MONGODB_URI with your connection string:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/turf-booking?retryWrites=true&w=majority
```

Replace:
- `your-username` with your database username
- `your-password` with your database password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL

## Step 7: Run the Database Setup Script

1. Open `setup-database.js`
2. Update the MONGODB_URI at the top with your connection string
3. Run the script:

```bash
cd backend
node ../setup-database.js
```

## Step 8: Start Your Application

1. Start the backend:
```bash
cd backend
npm start
```

2. Start the frontend:
```bash
cd frontend
npm start
```

## Step 9: Test the Application

1. Go to `http://localhost:3000`
2. Try registering a new user
3. Try logging in with the sample users:
   - Admin: admin@khelwell.com / admin123
   - User: john@example.com / password123
   - Owner: owner@example.com / owner123

## Troubleshooting

### CORS Errors
- Make sure your backend is running on port 5000
- Check that the CORS configuration in `backend/server.js` is correct

### Connection Errors
- Verify your MongoDB Atlas connection string
- Check that your IP address is whitelisted in Network Access
- Ensure your database user has the correct permissions

### Database Setup Errors
- Make sure all required dependencies are installed: `npm install`
- Check that your connection string is correct
- Verify that your cluster is active in MongoDB Atlas

## Sample Data Created

The setup script will create:

### Users:
- **Admin User**: admin@khelwell.com / admin123
- **Regular User**: john@example.com / password123  
- **Turf Owner**: owner@example.com / owner123

### Turfs:
- Premium Football Ground (Mumbai)
- Cricket Academy Ground (Mumbai)

## Next Steps

1. Test user registration and login
2. Browse turfs and test booking functionality
3. Add more turfs through the owner dashboard
4. Customize the application for your needs

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Enable proper authentication and authorization
- Set up proper network access rules
- Use HTTPS in production 