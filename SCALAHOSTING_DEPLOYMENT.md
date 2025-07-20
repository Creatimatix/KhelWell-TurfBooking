# 🚀 Scalahosting Deployment Guide

Complete guide to deploy KhelWell on Scalahosting servers.

## 📋 Prerequisites

- Scalahosting hosting account with Node.js support
- MySQL database access
- Domain name (optional but recommended)
- SSH access to your server (recommended)

## 🛠️ Step-by-Step Deployment

### **Step 1: Prepare Your Application**

```bash
# Clone your repository
git clone https://github.com/Creatimatix/KhelWell-TurfBooking.git
cd KhelWell-TurfBooking

# Run the Scalahosting deployment script
./deploy-scalahosting.sh
```

This will create:
- `production-build/` directory with optimized files
- `khelwell-production.tar.gz` compressed package
- Deployment instructions

### **Step 2: Scalahosting Control Panel Setup**

#### **A. Create MySQL Database**
1. Login to your Scalahosting control panel
2. Go to **Databases** → **MySQL Databases**
3. Create a new database:
   - Database name: `turf_booking`
   - Username: `khelwell_user`
   - Password: `your_secure_password`
4. Note down the database credentials

#### **B. Enable Node.js (if required)**
1. Go to **Advanced** → **Node.js**
2. Enable Node.js for your domain
3. Set Node.js version to 16 or higher

#### **C. Configure Domain**
1. Go to **Domains** → **Manage Domains**
2. Point your domain to the correct directory
3. Enable SSL certificate

### **Step 3: Upload Files**

#### **Option A: Using File Manager**
1. Go to **Files** → **File Manager**
2. Navigate to your `public_html` directory
3. Upload `khelwell-production.tar.gz`
4. Extract the archive
5. Move all files from `production-build/` to `public_html/`

#### **Option B: Using FTP/SFTP**
```bash
# Upload the compressed file
scp khelwell-production.tar.gz username@your-server:/path/to/public_html/

# SSH into your server
ssh username@your-server

# Navigate to public_html
cd /path/to/public_html/

# Extract the files
tar -xzf khelwell-production.tar.gz
mv production-build/* .
rmdir production-build
```

### **Step 4: Configure Environment**

Edit `config.env` with your production settings:

```env
# Production Environment Configuration
NODE_ENV=production
PORT=5001

# MySQL Database Configuration (Scalahosting)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=turf_booking
DB_USER=khelwell_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your-super-secure-production-jwt-secret-key-change-this
JWT_EXPIRE=7d

# Frontend URL (Update with your domain)
FRONTEND_URL=https://yourdomain.com

# Twilio Configuration (for OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Security
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Step 5: Database Setup**

SSH into your server and run:

```bash
cd /path/to/public_html/

# Install dependencies
npm install

# Setup database
node setup-mysql.js

# Seed with sample data
node seed-data.js
```

### **Step 6: Start Application**

#### **Option A: Using Scalahosting Node.js Manager**
1. Go to **Advanced** → **Node.js**
2. Set the startup file to `server.prod.js`
3. Set the port to `5001`
4. Click **Start Application**

#### **Option B: Using SSH**
```bash
cd /path/to/public_html/
npm start
```

#### **Option C: Using PM2 (Recommended)**
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.prod.js --name khelwell

# Save PM2 configuration
pm2 save
pm2 startup
```

### **Step 7: Configure Web Server**

#### **Apache Configuration (.htaccess)**
The deployment script creates an `.htaccess` file. If you need to modify it:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

#### **Nginx Configuration (if using Nginx)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/public_html/public;
    index index.html;

    # API routes
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

## 🔧 Configuration Details

### **Database Configuration**
- **Host**: Usually `localhost` for shared hosting
- **Port**: `3306` (default MySQL port)
- **Database**: Create via Scalahosting control panel
- **User**: Create via Scalahosting control panel
- **Password**: Use a strong password

### **Domain Configuration**
- Update `FRONTEND_URL` in `config.env`
- Enable SSL certificate
- Configure DNS if using custom domain

### **Twilio Configuration**
1. Sign up for Twilio account
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Update the credentials in `config.env`

## 🚀 Performance Optimization

### **Enable Compression**
The application includes compression middleware for better performance.

### **Static File Caching**
Static assets are cached for 1 year via `.htaccess`.

### **Database Optimization**
- Use connection pooling (configured in production)
- Enable MySQL query cache
- Optimize database indexes

### **CDN Setup (Optional)**
Consider using a CDN for static assets:
1. Upload images to CDN
2. Update image URLs in the application
3. Configure CDN caching rules

## 🔒 Security Configuration

### **Environment Variables**
- Use strong JWT secrets
- Keep database credentials secure
- Never commit `config.env` to Git

### **SSL Certificate**
- Enable SSL in Scalahosting control panel
- Force HTTPS redirects
- Use secure cookies

### **Rate Limiting**
- Configured to 100 requests per 15 minutes per IP
- Adjust in `production-config.js` if needed

### **Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 📊 Monitoring and Maintenance

### **Application Logs**
Check logs in Scalahosting control panel or via SSH:
```bash
# If using PM2
pm2 logs khelwell

# Application logs
tail -f /path/to/logs/app.log
```

### **Database Monitoring**
- Monitor database size and performance
- Set up regular backups
- Optimize queries as needed

### **Performance Monitoring**
- Monitor server resources
- Check application response times
- Monitor error rates

## 🆘 Troubleshooting

### **Common Issues**

#### **1. Application Won't Start**
```bash
# Check Node.js version
node --version

# Check if port is available
netstat -tulpn | grep :5001

# Check logs
tail -f /path/to/logs/error.log
```

#### **2. Database Connection Issues**
```bash
# Test database connection
mysql -u khelwell_user -p turf_booking

# Check database status
systemctl status mysql
```

#### **3. Static Files Not Loading**
- Check file permissions
- Verify `.htaccess` configuration
- Check if files are in correct directory

#### **4. API Endpoints Not Working**
- Check if Node.js application is running
- Verify proxy configuration
- Check CORS settings

### **Support Resources**
- Scalahosting Support: Contact via control panel
- Application Logs: Check in control panel
- Database Issues: Check MySQL error logs

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Health Check**: https://yourdomain.com/api/health

### **Test Your Deployment**
1. Visit your domain
2. Test user registration/login
3. Test turf booking functionality
4. Test admin features
5. Verify SMS OTP (if Twilio configured)

---

**Your KhelWell application is now live on Scalahosting! 🚀** 