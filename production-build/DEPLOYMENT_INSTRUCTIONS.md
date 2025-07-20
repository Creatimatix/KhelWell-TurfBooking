# Scalahosting Deployment Instructions

## 1. Upload Files
Upload all files from this directory to your Scalahosting server's public_html folder.

## 2. Database Setup
- Create a MySQL database in your Scalahosting control panel
- Update the database credentials in config.env
- Run the database setup: `node setup-mysql.js`

## 3. Environment Configuration
Edit config.env with your production settings:
- Database credentials
- JWT secret
- Twilio credentials
- Domain URL

## 4. Start Application
`npm start`

## 5. Domain Configuration
Point your domain to the public_html folder.

## 6. SSL Certificate
Enable SSL certificate in your Scalahosting control panel.

## 7. Monitoring
Check logs in your Scalahosting control panel.
