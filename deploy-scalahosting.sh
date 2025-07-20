#!/bin/bash

echo "🚀 KhelWell Scalahosting Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting Scalahosting deployment..."

# Step 1: Build frontend
print_status "Building frontend for production..."
cd frontend
npm install
npm run build
cd ..

# Step 2: Install production dependencies
print_status "Installing production dependencies..."
cd backend
npm install --production
cd ..

# Step 3: Create production build
print_status "Creating production build..."
mkdir -p production-build
cp -r backend/* production-build/
cp -r frontend/build production-build/public
cp production-config.js production-build/
cp backend/config.prod.env production-build/config.env

# Step 4: Create package.json for production
cat > production-build/package.json << EOF
{
  "name": "khelwell-production",
  "version": "1.0.0",
  "description": "KhelWell Production Build",
  "main": "server.prod.js",
  "scripts": {
    "start": "node server.prod.js",
    "postinstall": "node setup-mysql.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.14.2",
    "sequelize": "^6.37.7",
    "twilio": "^5.7.3"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

# Step 5: Create .htaccess for Apache (if needed)
cat > production-build/.htaccess << EOF
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
EOF

# Step 6: Create deployment instructions
cat > production-build/DEPLOYMENT_INSTRUCTIONS.md << EOF
# Scalahosting Deployment Instructions

## 1. Upload Files
Upload all files from this directory to your Scalahosting server's public_html folder.

## 2. Database Setup
- Create a MySQL database in your Scalahosting control panel
- Update the database credentials in config.env
- Run the database setup: \`node setup-mysql.js\`

## 3. Environment Configuration
Edit config.env with your production settings:
- Database credentials
- JWT secret
- Twilio credentials
- Domain URL

## 4. Start Application
\`npm start\`

## 5. Domain Configuration
Point your domain to the public_html folder.

## 6. SSL Certificate
Enable SSL certificate in your Scalahosting control panel.

## 7. Monitoring
Check logs in your Scalahosting control panel.
EOF

print_status "Production build created in 'production-build' directory"

# Step 7: Create deployment package
print_status "Creating deployment package..."
tar -czf khelwell-production.tar.gz production-build/

print_status "Deployment package created: khelwell-production.tar.gz"

echo ""
echo "🎉 Deployment package ready!"
echo ""
echo "📋 Next steps:"
echo "1. Upload khelwell-production.tar.gz to your Scalahosting server"
echo "2. Extract the files in your public_html directory"
echo "3. Configure your database in Scalahosting control panel"
echo "4. Update config.env with your production credentials"
echo "5. Run: npm install && npm start"
echo ""
echo "📁 Files created:"
echo "- production-build/ (ready to upload)"
echo "- khelwell-production.tar.gz (compressed package)"
echo "- DEPLOYMENT_INSTRUCTIONS.md (detailed guide)"
echo ""
echo "🔗 For detailed instructions, see: production-build/DEPLOYMENT_INSTRUCTIONS.md" 