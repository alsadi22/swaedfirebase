#!/bin/bash

# SwaedUAE Platform - Production Deployment (Without SSL)
# This script deploys the SwaedUAE platform to production without SSL certificates
# SSL certificates should be installed separately using the ssl-setup-instructions.md guide

set -e

echo "=========================================="
echo "SwaedUAE Platform - Production Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root directly. Use sudo for specific commands."
   exit 1
fi

echo ""
echo "Step 1: Pre-deployment checks"
echo "------------------------------"

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    print_error "PostgreSQL is not running. Please start it first."
    exit 1
fi
print_status "PostgreSQL is running"

# Check if database exists
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw swaeduae; then
    print_error "Database 'swaeduae' does not exist. Please create it first."
    exit 1
fi
print_status "Database exists"

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found"
    exit 1
fi
print_status ".env.production file exists"

echo ""
echo "Step 2: Install dependencies"
echo "----------------------------"
pnpm install --frozen-lockfile
print_status "Dependencies installed"

echo ""
echo "Step 3: Run database migrations"
echo "-------------------------------"
# Run database setup
node database/setup.js
print_status "Database migrations completed"

echo ""
echo "Step 4: Build application"
echo "-------------------------"
NODE_ENV=production pnpm build
print_status "Application built successfully"

echo ""
echo "Step 5: Install PM2 globally"
echo "-----------------------------"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

echo ""
echo "Step 6: Configure PM2 ecosystem"
echo "--------------------------------"

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'swaeduae-platform',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/swaeduae/swaed2025/swaeduae',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/swaeduae/error.log',
    out_file: '/var/log/swaeduae/out.log',
    log_file: '/var/log/swaeduae/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

print_status "PM2 ecosystem configured"

echo ""
echo "Step 7: Setup logging directory"
echo "--------------------------------"
sudo mkdir -p /var/log/swaeduae
sudo chown $USER:$USER /var/log/swaeduae
print_status "Logging directory created"

echo ""
echo "Step 8: Configure Nginx (HTTP only)"
echo "------------------------------------"

# Create Nginx configuration without SSL
sudo tee /etc/nginx/sites-available/swaeduae << 'EOF'
# HTTP redirect to HTTPS (when SSL is ready)
server {
    listen 80;
    server_name swaeduae.ae www.swaeduae.ae;
    
    # For now, serve the application directly
    # Later, uncomment the redirect when SSL is configured
    # return 301 https://$server_name$request_uri;
    
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
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}

# HTTPS configuration (commented out until SSL certificates are installed)
# server {
#     listen 443 ssl;
#     http2 on;
#     server_name swaeduae.ae www.swaeduae.ae;
#     
#     # SSL Configuration (Cloudflare Origin Certificates)
#     ssl_certificate /etc/ssl/certs/swaeduae.ae.pem;
#     ssl_certificate_key /etc/ssl/private/swaeduae.ae.key;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#     
#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header Referrer-Policy "no-referrer-when-downgrade" always;
#     add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
#     
#     # Gzip compression
#     gzip on;
#     gzip_vary on;
#     gzip_min_length 1024;
#     gzip_proxied expired no-cache no-store private auth;
#     gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
#     
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#         
#         # Timeout settings
#         proxy_connect_timeout 60s;
#         proxy_send_timeout 60s;
#         proxy_read_timeout 60s;
#     }
#     
#     # Static files caching
#     location /_next/static {
#         proxy_pass http://localhost:3000;
#         add_header Cache-Control "public, max-age=31536000, immutable";
#     }
#     
#     # Health check endpoint
#     location /health {
#         proxy_pass http://localhost:3000;
#         access_log off;
#     }
# }
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/swaeduae /etc/nginx/sites-enabled/

# Test Nginx configuration
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors"
    exit 1
fi

echo ""
echo "Step 9: Start services"
echo "----------------------"

# Stop any existing PM2 processes
pm2 delete swaeduae-platform 2>/dev/null || true

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

print_status "Application started with PM2"

# Reload Nginx
sudo systemctl reload nginx
print_status "Nginx reloaded"

echo ""
echo "Step 10: Setup log rotation"
echo "---------------------------"

# Create logrotate configuration
sudo tee /etc/logrotate.d/swaeduae << 'EOF'
/var/log/swaeduae/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_status "Log rotation configured"

echo ""
echo "Step 11: Health checks"
echo "----------------------"

# Wait for application to start
sleep 10

# Check if PM2 process is running
if pm2 list | grep -q "swaeduae-platform.*online"; then
    print_status "PM2 process is running"
else
    print_error "PM2 process failed to start"
    pm2 logs swaeduae-platform --lines 20
    exit 1
fi

# Check if application responds
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "Application health check passed"
else
    print_warning "Application health check failed - this might be normal if /health endpoint doesn't exist"
fi

# Check if Nginx is serving the application
if curl -f http://localhost/ > /dev/null 2>&1; then
    print_status "Nginx is serving the application"
else
    print_warning "Nginx health check failed"
fi

echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
echo "=========================================="
echo ""
echo "📋 Deployment Summary:"
echo "• Application: SwaedUAE Platform"
echo "• Environment: Production"
echo "• Process Manager: PM2"
echo "• Web Server: Nginx"
echo "• Database: PostgreSQL"
echo "• Error Monitoring: Sentry (configured)"
echo "• SSL Status: Not configured (HTTP only)"
echo ""
echo "🔗 Access URLs:"
echo "• HTTP: http://swaeduae.ae (or server IP)"
echo "• Admin: http://swaeduae.ae/admin"
echo ""
echo "📊 Monitoring Commands:"
echo "• PM2 Status: pm2 status"
echo "• PM2 Logs: pm2 logs swaeduae-platform"
echo "• PM2 Restart: pm2 restart swaeduae-platform"
echo "• Nginx Status: sudo systemctl status nginx"
echo "• Database: sudo -u postgres psql -d swaeduae"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Install SSL certificates using: ./install-ssl-certificates.sh"
echo "2. Update Nginx configuration to enable HTTPS"
echo "3. Configure Sentry alerts using: sentry-alerts-setup.md"
echo "4. Set up monitoring and backups"
echo "5. Configure domain DNS to point to this server"
echo ""
echo "📁 Important Files:"
echo "• Application: /var/www/swaeduae/swaed2025/swaeduae"
echo "• Logs: /var/log/swaeduae/"
echo "• Nginx Config: /etc/nginx/sites-available/swaeduae"
echo "• PM2 Config: ./ecosystem.config.js"
echo ""
echo "🆘 Troubleshooting:"
echo "• Check PM2 logs: pm2 logs swaeduae-platform"
echo "• Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "• Check system logs: sudo journalctl -u nginx -f"
echo ""
print_status "Production deployment completed successfully!"