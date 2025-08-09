# PharmaFlow Deployment Guide

This guide covers deploying PharmaFlow to production environments.

## Prerequisites

- Node.js 16+ installed on the server
- MongoDB database (local or cloud like MongoDB Atlas)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- Email service credentials (Gmail App Password recommended)

## Backend Deployment

### 1. Prepare the Server

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Deploy Backend Code

```bash
# Clone or upload your code
git clone <your-repo-url>
cd PharmaFlow/backend

# Install dependencies
npm install --production

# Create production environment file
cp .env.example .env
```

### 3. Configure Production Environment

Edit the `.env` file with production values:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/pharmaflow"

# JWT Configuration
JWT_SECRET="your-super-secure-production-jwt-secret"

# Frontend Configuration
FRONTEND_URL="https://yourdomain.com"
CORS_ORIGIN="https://yourdomain.com"

# Email Configuration
EMAIL_USER="your-business-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### 4. Start Backend with PM2

```bash
# Start the application
pm2 start index.js --name "pharmaflow-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 5. Setup Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Frontend Deployment

### 1. Build for Production

```bash
cd PharmaFlow/frontend

# Install dependencies
npm install

# Create production environment file
cp .env.example .env.production

# Update production environment
echo "VITE_API_BASE_URL=https://api.yourdomain.com/api" > .env.production
echo "VITE_APP_NAME=PharmaFlow" >> .env.production
echo "VITE_ENVIRONMENT=production" >> .env.production

# Build for production
npm run build
```

### 2. Deploy to Web Server

#### Option A: Static Hosting (Netlify, Vercel, etc.)

1. Upload the `dist` folder to your hosting service
2. Configure redirects for SPA routing:

**Netlify (_redirects file):**
```
/*    /index.html   200
```

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Option B: Self-hosted with Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/pharmaflow;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP
5. Get the connection string

### Self-hosted MongoDB

```bash
# Install MongoDB
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
> use pharmaflow
> db.createUser({
    user: "pharmaflow_user",
    pwd: "secure_password",
    roles: ["readWrite"]
  })
```

## SSL Certificate (HTTPS)

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Environment Variables Summary

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
MONGODB_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
FRONTEND_URL="https://yourdomain.com"
CORS_ORIGIN="https://yourdomain.com"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_NAME=PharmaFlow
VITE_ENVIRONMENT=production
```

## Monitoring and Maintenance

### PM2 Monitoring

```bash
# View running processes
pm2 list

# View logs
pm2 logs pharmaflow-backend

# Restart application
pm2 restart pharmaflow-backend

# Monitor resources
pm2 monit
```

### Database Backup

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="your_mongodb_uri" --out="/backups/pharmaflow_$DATE"
```

### Log Rotation

```bash
# Setup log rotation for PM2
sudo pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Security Checklist

- [ ] Use HTTPS for all communications
- [ ] Set strong JWT secret
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Backup database regularly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check FRONTEND_URL and CORS_ORIGIN in backend .env
2. **Database Connection**: Verify MongoDB URL and network access
3. **Email Issues**: Check Gmail App Password and 2FA settings
4. **Build Failures**: Ensure all environment variables are set

### Health Check Endpoints

- Backend: `GET /` - Should return "Retail Medicine Shop API is running..."
- Frontend: Check if the login page loads correctly

## Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Use CDN** for static assets
3. **Database indexing** for frequently queried fields
4. **Implement caching** for API responses
5. **Monitor performance** with tools like New Relic or DataDog

## Scaling Considerations

- Use load balancer for multiple backend instances
- Implement Redis for session storage
- Consider database sharding for large datasets
- Use container orchestration (Docker + Kubernetes)
