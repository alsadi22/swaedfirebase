# Cloudflare Tunnel Setup Guide for SwaedUAE Platform

## Overview
This guide will help you set up Cloudflare Tunnel to connect your tasjeel.ae domain to the SwaedUAE platform running on your server.

## Prerequisites
- Domain registered with tasjeel.ae
- Cloudflare account
- SwaedUAE platform running on port 3001 (✅ Currently running)
- Server access with sudo privileges

## Step 1: Add Domain to Cloudflare

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Click "Add a Site"
   - Enter your domain (e.g., `swaeduae.ae` or your actual domain)
   - Select the Free plan
   - Click "Add Site"

2. **DNS Records Setup**
   Cloudflare will scan your existing DNS records. You'll need to add/verify:
   ```
   Type: A
   Name: @
   Content: Your server IP (will be replaced by tunnel)
   Proxy: Orange cloud (Proxied)
   
   Type: CNAME
   Name: www
   Content: your-domain.com
   Proxy: Orange cloud (Proxied)
   ```

## Step 2: Update Nameservers at tasjeel.ae

1. **Get Cloudflare Nameservers**
   - In Cloudflare dashboard, go to DNS tab
   - Note the nameservers (usually something like):
     - `ns1.cloudflare.com`
     - `ns2.cloudflare.com`

2. **Update at tasjeel.ae**
   - Login to your tasjeel.ae account
   - Go to Domain Management
   - Find your domain and click "Manage DNS" or "Nameservers"
   - Replace existing nameservers with Cloudflare nameservers
   - Save changes (may take 24-48 hours to propagate)

## Step 3: Install Cloudflare Tunnel (cloudflared)

Run these commands on your server:

```bash
# Download and install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Verify installation
cloudflared --version
```

## Step 4: Authenticate with Cloudflare

```bash
# This will open a browser window for authentication
cloudflared tunnel login
```

## Step 5: Create and Configure Tunnel

```bash
# Create a tunnel (replace 'swaeduae-tunnel' with your preferred name)
cloudflared tunnel create swaeduae-tunnel

# This will create a tunnel and give you a UUID - save this!
# Example output: Created tunnel swaeduae-tunnel with id: 12345678-1234-1234-1234-123456789abc
```

## Step 6: Create Tunnel Configuration

Create the config file:
```bash
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

Add this configuration (replace with your tunnel ID and domain):
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/swaeduae/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: your-domain.com
    service: http://localhost:3001
  - hostname: www.your-domain.com
    service: http://localhost:3001
  - service: http_status:404
```

## Step 7: Create DNS Records for Tunnel

```bash
# Replace YOUR_TUNNEL_ID and your-domain.com with actual values
cloudflared tunnel route dns YOUR_TUNNEL_ID your-domain.com
cloudflared tunnel route dns YOUR_TUNNEL_ID www.your-domain.com
```

## Step 8: Test the Tunnel

```bash
# Test the tunnel
cloudflared tunnel run swaeduae-tunnel
```

## Step 9: Install as System Service

```bash
# Install the tunnel as a system service
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

## Step 10: Cloudflare Dashboard Configuration

1. **SSL/TLS Settings**
   - Go to SSL/TLS tab in Cloudflare
   - Set encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"

2. **Security Settings**
   - Go to Security tab
   - Set Security Level to "Medium" or "High"
   - Enable "Bot Fight Mode"

3. **Speed Settings**
   - Go to Speed tab
   - Enable "Auto Minify" for HTML, CSS, JS
   - Enable "Brotli" compression

## Current Server Status
✅ SwaedUAE platform running on port 3001
✅ PM2 managing 2 instances
✅ Nginx proxy configured
✅ PostgreSQL database connected
✅ SSL certificates ready for Cloudflare

## Verification Steps

After setup, verify:
1. `curl -I https://your-domain.com` returns 200 OK
2. `curl -I https://www.your-domain.com` returns 200 OK
3. Check Cloudflare Analytics for traffic
4. Test SSL rating at https://www.ssllabs.com/ssltest/

## Troubleshooting

**Common Issues:**
- DNS propagation takes time (up to 48 hours)
- Ensure port 3001 is accessible locally
- Check cloudflared logs: `sudo journalctl -u cloudflared -f`
- Verify tunnel status in Cloudflare dashboard

**Useful Commands:**
```bash
# Check tunnel status
cloudflared tunnel list

# View tunnel logs
sudo journalctl -u cloudflared -f

# Restart tunnel service
sudo systemctl restart cloudflared
```

## Next Steps After Setup
1. Configure Cloudflare Page Rules for caching
2. Set up Cloudflare Analytics
3. Configure Sentry notifications
4. Set up monitoring and alerts