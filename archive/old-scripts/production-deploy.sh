#!/bin/bash

# SwaedUAE Platform - Production Deployment Script
# This script deploys the platform to production with proper monitoring

set -e  # Exit on any error

echo "=========================================="
echo "SwaedUAE Platform - Production Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the swaeduae project directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_info "Please create .env.production with your production configuration"
    exit 1
fi

echo "Step 1: Pre-deployment checks"
echo "------------------------------"

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    print_error "PostgreSQL is not running. Please start it first:"
    echo "sudo systemctl start postgresql"
    exit 1
fi
print_status "PostgreSQL is running"

# Check if database exists
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw swaeduae; then
    print_warning "Database 'swaeduae' not found. Creating it..."
    sudo -u postgres createdb swaeduae
    print_status "Database created"
else
    print_status "Database exists"
fi

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

echo ""
echo "Step 2: Install dependencies"
echo "----------------------------"
pnpm install --frozen-lockfile
print_status "Dependencies installed"

echo ""
echo "Step 3: Run database migrations"
echo "-------------------------------"
# Initialize database if needed
if [ -f "scripts/setup-database.js" ]; then
    node scripts/setup-database.js
    print_status "Database initialized"
fi

echo ""
echo "Step 4: Build production application"
echo "-----------------------------------"
NODE_ENV=production pnpm build
print_status "Production build completed"

echo ""
echo "Step 5: Setup PM2 for process management"
echo "---------------------------------------"

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2..."
    npm install -g pm2
fi

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'swaeduae-platform',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '$(pwd)',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create logs directory
mkdir -p logs

print_status "PM2 configuration created"

echo ""
echo "Step 6: Setup Nginx reverse proxy"
echo "---------------------------------"

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/swaeduae << EOF
server {
    listen 80;
    server_name swaeduae.ae www.swaeduae.ae;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name swaeduae.ae www.swaeduae.ae;
    
    # SSL Configuration (Cloudflare Origin Certificates)
    ssl_certificate /etc/ssl/certs/swaeduae.ae.pem;
    ssl_certificate_key /etc/ssl/private/swaeduae.ae.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
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
echo "Step 7: Start the application"
echo "----------------------------"

# Stop existing PM2 processes
pm2 delete swaeduae-platform 2>/dev/null || true

# Start the application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_status "Application started with PM2"

# Reload Nginx
sudo systemctl reload nginx
print_status "Nginx reloaded"

echo ""
echo "Step 8: Setup monitoring and health checks"
echo "-----------------------------------------"

# Create health check script
cat > scripts/health-check.js << 'EOF'
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✓ Health check passed');
    process.exit(0);
  } else {
    console.log('✗ Health check failed:', res.statusCode);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('✗ Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('✗ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
EOF

# Make health check executable
chmod +x scripts/health-check.js

# Run initial health check
sleep 5
node scripts/health-check.js

print_status "Health check configured and passed"

echo ""
echo "Step 9: Setup log rotation"
echo "-------------------------"

# Create logrotate configuration
sudo tee /etc/logrotate.d/swaeduae << EOF
$(pwd)/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_status "Log rotation configured"

echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo ""
print_info "Application Details:"
echo "• URL: https://swaeduae.ae"
echo "• Process Manager: PM2"
echo "• Web Server: Nginx"
echo "• Database: PostgreSQL"
echo "• Error Monitoring: Sentry"
echo "• Environment: Production"
echo ""
print_info "Useful Commands:"
echo "• Check status: pm2 status"
echo "• View logs: pm2 logs swaeduae-platform"
echo "• Restart app: pm2 restart swaeduae-platform"
echo "• Health check: node scripts/health-check.js"
echo ""
print_warning "Next Steps:"
echo "1. Configure SSL certificates (see ssl-setup-instructions.md)"
echo "2. Set up Sentry alerts (see sentry-setup-instructions.md)"
echo "3. Configure backup schedule"
echo "4. Set up monitoring dashboards"
echo ""
echo "=========================================="