# SwaedUAE Production Deployment Guide

This guide covers deploying the SwaedUAE platform to production with PostgreSQL database.

## 🚀 Quick Production Checklist

- [ ] PostgreSQL server setup and secured
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] SSL certificates configured
- [ ] Application built and deployed
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented

## 🗄️ Database Setup

### 1. PostgreSQL Server Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Secure PostgreSQL installation
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_secure_password';"
```

### 2. Create Production Database

```bash
# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE swaeduae_prod;
CREATE USER swaeduae_prod_user WITH PASSWORD 'your_secure_production_password';
GRANT ALL PRIVILEGES ON DATABASE swaeduae_prod TO swaeduae_prod_user;
ALTER USER swaeduae_prod_user CREATEDB;
\q
EOF
```

### 3. Configure PostgreSQL for Production

Edit `/etc/postgresql/14/main/postgresql.conf`:

```conf
# Connection settings
listen_addresses = 'localhost'  # or specific IPs
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

# Security settings
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'

# Logging
log_statement = 'mod'
log_min_duration_statement = 1000
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:

```conf
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=swaeduae_prod_user
POSTGRES_PASSWORD=your_secure_production_password
POSTGRES_DB=swaeduae_prod
DATABASE_URL=postgresql://swaeduae_prod_user:your_secure_production_password@localhost:5432/swaeduae_prod

# Connection Pool Settings
DB_POOL_MIN=5
DB_POOL_MAX=20

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security
NEXTAUTH_SECRET=your_very_secure_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.com

# Email Configuration (if using)
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password

# File Upload (if using cloud storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket
```

## 🏗️ Application Deployment

### 1. Build the Application

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build for production
pnpm build

# Test the build
pnpm start
```

### 2. Initialize Production Database

```bash
# Run database initialization
NODE_ENV=production node scripts/init-postgres.js

# Verify database connection
NODE_ENV=production node scripts/test-db-connection.js
```

### 3. Process Manager Setup (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'swaeduae',
    script: 'pnpm',
    args: 'start',
    cwd: '/path/to/swaeduae',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔒 Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 2. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

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

## 📊 Monitoring & Logging

### 1. Database Monitoring

```sql
-- Create monitoring user
CREATE USER monitor WITH PASSWORD 'monitor_password';
GRANT CONNECT ON DATABASE swaeduae_prod TO monitor;
GRANT USAGE ON SCHEMA public TO monitor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitor;
```

### 2. Application Monitoring

```bash
# Install monitoring tools
npm install -g @pm2/io

# Monitor with PM2
pm2 install pm2-server-monit
```

### 3. Log Rotation

```bash
# Configure logrotate
sudo tee /etc/logrotate.d/swaeduae << EOF
/path/to/swaeduae/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## 💾 Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/var/backups/swaeduae"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="swaeduae_prod"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U swaeduae_prod_user -d $DB_NAME > $BACKUP_DIR/swaeduae_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/swaeduae_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: swaeduae_$DATE.sql.gz"
```

### 2. Automated Backups

```bash
# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /path/to/backup-db.sh
```

## 🔄 Deployment Automation

### 1. Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting SwaedUAE deployment..."

# Pull latest code
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Run tests
pnpm test

# Build application
pnpm build

# Restart application
pm2 restart swaeduae

# Run health check
sleep 10
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Deployment completed successfully!"
```

### 2. Health Check Endpoint

Create `pages/api/health.js`:

```javascript
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check logs
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   ```

2. **Application Not Starting**
   ```bash
   # Check PM2 logs
   pm2 logs swaeduae
   
   # Check system resources
   free -h
   df -h
   ```

3. **SSL Certificate Issues**
   ```bash
   # Test SSL
   sudo certbot certificates
   
   # Renew if needed
   sudo certbot renew --dry-run
   ```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM events WHERE start_date >= CURRENT_DATE;
   
   -- Update statistics
   ANALYZE;
   
   -- Vacuum database
   VACUUM ANALYZE;
   ```

2. **Application Optimization**
   ```bash
   # Enable compression in Nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   
   # Cache static assets
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## 📋 Production Checklist

- [ ] Database server secured and optimized
- [ ] Application built and deployed
- [ ] SSL certificates installed and auto-renewal configured
- [ ] Firewall configured
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented and tested
- [ ] Health checks configured
- [ ] Performance optimization applied
- [ ] Security headers configured
- [ ] Error tracking setup (optional: Sentry)
- [ ] CDN configured (optional)
- [ ] Load balancer setup (if multiple instances)

## 🆘 Emergency Procedures

### Database Recovery

```bash
# Restore from backup
gunzip /var/backups/swaeduae/swaeduae_YYYYMMDD_HHMMSS.sql.gz
sudo -u postgres psql -d swaeduae_prod < /var/backups/swaeduae/swaeduae_YYYYMMDD_HHMMSS.sql
```

### Application Rollback

```bash
# Rollback to previous version
git checkout previous-stable-tag
pnpm install --frozen-lockfile
pnpm build
pm2 restart swaeduae
```

---

**Note**: Replace all placeholder values (passwords, domains, paths) with your actual production values. Always test deployment procedures in a staging environment first.