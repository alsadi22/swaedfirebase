# SSL Certificate Setup Instructions for Cloudflare

## Step 1: Generate Cloudflare Origin Certificate

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your domain: `swaeduae.ae`

2. **Navigate to SSL/TLS > Origin Server**
   - Click on "SSL/TLS" in the left sidebar
   - Click on "Origin Server" tab

3. **Create Certificate**
   - Click "Create Certificate"
   - Select "Let Cloudflare generate a private key and a CSR"
   - Add hostnames:
     - `swaeduae.ae`
     - `*.swaeduae.ae`
   - Choose certificate validity (15 years recommended)
   - Click "Create"

4. **Download Certificate Files**
   - Copy the "Origin Certificate" content
   - Copy the "Private Key" content

## Step 2: Install Certificates on Server

After getting the certificate content from Cloudflare:

1. **Save the Origin Certificate**:
   ```bash
   sudo nano /etc/ssl/certs/swaeduae.ae.pem
   ```
   Paste the Origin Certificate content

2. **Save the Private Key**:
   ```bash
   sudo nano /etc/ssl/private/swaeduae.ae.key
   ```
   Paste the Private Key content

3. **Set proper permissions**:
   ```bash
   sudo chmod 644 /etc/ssl/certs/swaeduae.ae.pem
   sudo chmod 600 /etc/ssl/private/swaeduae.ae.key
   sudo chown root:root /etc/ssl/certs/swaeduae.ae.pem
   sudo chown root:root /etc/ssl/private/swaeduae.ae.key
   ```

## Step 3: Configure Cloudflare SSL Settings

1. **Set SSL/TLS encryption mode**:
   - In Cloudflare Dashboard > SSL/TLS > Overview
   - Set to "Full (strict)" for maximum security

2. **Enable Always Use HTTPS**:
   - Go to SSL/TLS > Edge Certificates
   - Turn on "Always Use HTTPS"

## Step 4: Verify Configuration

After setting up certificates, restart your application and verify:
- HTTPS works correctly
- No certificate warnings
- Proper SSL grade (A+ recommended)

## Important Notes

- Origin certificates are only valid between Cloudflare and your server
- They provide end-to-end encryption
- Visitors will see Cloudflare's certificate, not your origin certificate
- Origin certificates are free and automatically trusted by Cloudflare