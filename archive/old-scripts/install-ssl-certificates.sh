#!/bin/bash

# SSL Certificate Installation Script for Cloudflare Origin Certificates
# Usage: ./install-ssl-certificates.sh

echo "🔐 SSL Certificate Installation for swaeduae.ae"
echo "================================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Create directories if they don't exist
mkdir -p /etc/ssl/certs
mkdir -p /etc/ssl/private

echo "📁 SSL directories created/verified"

# Check if certificate files exist in current directory
if [ ! -f "swaeduae.ae.pem" ]; then
    echo "❌ Certificate file 'swaeduae.ae.pem' not found in current directory"
    echo "   Please download the Origin Certificate from Cloudflare and save as 'swaeduae.ae.pem'"
    exit 1
fi

if [ ! -f "swaeduae.ae.key" ]; then
    echo "❌ Private key file 'swaeduae.ae.key' not found in current directory"
    echo "   Please download the Private Key from Cloudflare and save as 'swaeduae.ae.key'"
    exit 1
fi

# Install certificate files
cp swaeduae.ae.pem /etc/ssl/certs/
cp swaeduae.ae.key /etc/ssl/private/

# Set proper permissions
chmod 644 /etc/ssl/certs/swaeduae.ae.pem
chmod 600 /etc/ssl/private/swaeduae.ae.key
chown root:root /etc/ssl/certs/swaeduae.ae.pem
chown root:root /etc/ssl/private/swaeduae.ae.key

echo "✅ SSL certificates installed successfully!"
echo "�� Certificate location: /etc/ssl/certs/swaeduae.ae.pem"
echo "🔑 Private key location: /etc/ssl/private/swaeduae.ae.key"
echo ""
echo "🔄 Next steps:"
echo "1. Restart your application"
echo "2. Verify HTTPS is working"
echo "3. Test SSL configuration"
echo ""
echo "🧪 Test SSL configuration:"
echo "   openssl x509 -in /etc/ssl/certs/swaeduae.ae.pem -text -noout"
