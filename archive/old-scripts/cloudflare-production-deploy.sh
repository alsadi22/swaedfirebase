#!/bin/bash

# SwaedUAE Production Deployment Script - Cloudflare Optimized
# This script deploys the application optimized for Cloudflare proxy

set -e  # Exit on any error

echo "🚀 Starting SwaedUAE Production Deployment (Cloudflare Optimized)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"
# Simple version comparison for major version
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
REQUIRED_MAJOR=$(echo $REQUIRED_VERSION | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt "$REQUIRED_MAJOR" ]; then
    print_error "Node.js version $NODE_VERSION is less than required $REQUIRED_VERSION"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found. Creating from .env.local..."
    if [ -f ".env.local" ]; then
        cp .env.local .env.production
    else
        print_error "No environment file found. Please create .env.production"
        exit 1
    fi
fi

print_success "Pre-deployment checks passed"

# Install dependencies
print_status "Installing production dependencies..."
pnpm install --frozen-lockfile --prod=false

# Build the application
print_status "Building the application..."
NODE_ENV=production pnpm build

print_success "Application built successfully"

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 process manager..."
    npm install -g pm2
fi

# Create PM2 ecosystem file if it doesn't exist
if [ ! -f "ecosystem.config.js" ]; then
    print_status "Creating PM2 ecosystem configuration..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'swaeduae',
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
    node_args: '--max-old-space-size=4096'
  }]
}
EOF
fi

# Create log directory
sudo mkdir -p /var/log/swaeduae
sudo chown $USER:$USER /var/log/swaeduae

# Configure Nginx for Cloudflare
print_status "Configuring Nginx for Cloudflare..."

sudo tee /etc/nginx/sites-available/swaeduae << 'EOF'
# Cloudflare IP ranges for real IP restoration
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;
real_ip_header CF-Connecting-IP;

server {
    listen 80;
    server_name swaeduae.ae www.swaeduae.ae;
    
    # Cloudflare optimization headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: https: blob:; font-src 'self' data: https:;" always;
    
    # Cloudflare caching headers
    add_header Cache-Control "public, max-age=0, must-revalidate" always;
    
    # Gzip compression (Cloudflare will handle additional compression)
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        application/xml
        application/rss+xml
        application/atom+xml
        image/svg+xml;
    
    # Main location
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        proxy_set_header CF-Ray $http_cf_ray;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        
        # Buffer settings for better performance with Cloudflare
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Static files with long cache for Cloudflare
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
        expires 1y;
    }
    
    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        
        # No caching for API routes
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
        add_header Cache-Control "no-cache";
    }
    
    # Robots.txt
    location /robots.txt {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
    
    # Sitemap
    location /sitemap.xml {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/swaeduae /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
if sudo nginx -t; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Reload Nginx
sudo systemctl reload nginx

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 delete swaeduae 2>/dev/null || true

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

print_success "Application started successfully"

# Health check
print_status "Performing health check..."
sleep 5

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Health check passed - Application is responding"
else
    print_warning "Health check failed - Application may still be starting"
fi

# Setup log rotation
print_status "Setting up log rotation..."
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

print_success "🎉 Deployment completed successfully!"

echo ""
echo "📋 Cloudflare Configuration Checklist:"
echo "======================================"
echo "1. ✅ Server is configured to work with Cloudflare proxy"
echo "2. 🔧 Configure your Cloudflare DNS:"
echo "   • A record: swaeduae.ae → Your server IP (Proxied: ON)"
echo "   • CNAME record: www → swaeduae.ae (Proxied: ON)"
echo ""
echo "3. 🔒 Cloudflare SSL/TLS Settings:"
echo "   • SSL/TLS encryption mode: Full (strict) or Flexible"
echo "   • Always Use HTTPS: ON"
echo "   • Automatic HTTPS Rewrites: ON"
echo ""
echo "4. ⚡ Cloudflare Performance Settings:"
echo "   • Auto Minify: CSS, JavaScript, HTML"
echo "   • Brotli: ON"
echo "   • Rocket Loader: ON (optional)"
echo ""
echo "5. 🛡️ Cloudflare Security Settings:"
echo "   • Security Level: Medium"
echo "   • Bot Fight Mode: ON"
echo "   • Browser Integrity Check: ON"
echo ""
echo "📊 Application Information:"
echo "=========================="
echo "• Application URL: http://swaeduae.ae (Cloudflare will handle HTTPS)"
echo "• PM2 Status: pm2 status"
echo "• Application Logs: pm2 logs swaeduae"
echo "• Nginx Status: sudo systemctl status nginx"
echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "• Restart app: pm2 restart swaeduae"
echo "• Stop app: pm2 stop swaeduae"
echo "• View logs: pm2 logs swaeduae --lines 100"
echo "• Monitor: pm2 monit"
echo "• Reload Nginx: sudo systemctl reload nginx"
echo ""
echo "⚠️  Next Steps:"
echo "==============="
echo "1. Configure Cloudflare DNS settings as shown above"
echo "2. Set up Cloudflare SSL/TLS and security settings"
echo "3. Configure Sentry alerts for error monitoring"
echo "4. Set up automated backups"
echo "5. Test the application through Cloudflare proxy"
echo ""