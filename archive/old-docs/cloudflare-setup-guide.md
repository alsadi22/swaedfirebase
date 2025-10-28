# Cloudflare Setup Guide for SwaedUAE

This guide will help you configure Cloudflare for your SwaedUAE domain to work optimally with your production deployment.

## Prerequisites

- Domain: `swaeduae.ae` registered and managed through Cloudflare
- Server deployed and running on your VPS/server
- Cloudflare account with access to DNS management

## Step 1: DNS Configuration

### A. Main Domain Record
```
Type: A
Name: swaeduae.ae (or @)
Content: YOUR_SERVER_IP_ADDRESS
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### B. WWW Subdomain Record
```
Type: CNAME
Name: www
Content: swaeduae.ae
Proxy status: Proxied (orange cloud)
TTL: Auto
```

### C. Optional Subdomains (if needed)
```
Type: CNAME
Name: api
Content: swaeduae.ae
Proxy status: Proxied (orange cloud)
TTL: Auto
```

## Step 2: SSL/TLS Configuration

### A. SSL/TLS Encryption Mode
1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to:
   - **Full (strict)** - Recommended if you have SSL certificates on your server
   - **Full** - If you have self-signed certificates
   - **Flexible** - If you don't have SSL certificates (Cloudflare handles SSL)

### B. Edge Certificates
1. Go to **SSL/TLS** → **Edge Certificates**
2. Enable the following:
   - ✅ **Always Use HTTPS**
   - ✅ **HTTP Strict Transport Security (HSTS)**
   - ✅ **Minimum TLS Version**: 1.2
   - ✅ **Opportunistic Encryption**
   - ✅ **TLS 1.3**
   - ✅ **Automatic HTTPS Rewrites**

### C. Origin Server (if using Full/Full Strict)
1. Go to **SSL/TLS** → **Origin Server**
2. Create an Origin Certificate if needed
3. Install the certificate on your server

## Step 3: Speed Optimization

### A. Speed Settings
1. Go to **Speed** → **Optimization**
2. Enable:
   - ✅ **Auto Minify**: CSS, JavaScript, HTML
   - ✅ **Brotli**
   - ✅ **Early Hints**
   - ⚠️ **Rocket Loader**: Test carefully (may break some JavaScript)

### B. Caching
1. Go to **Caching** → **Configuration**
2. Set **Caching Level**: Standard
3. Set **Browser Cache TTL**: 4 hours (or as needed)
4. Enable **Always Online**: ON

### C. Page Rules (Optional)
Create page rules for better caching:

```
Pattern: swaeduae.ae/_next/static/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month
```

```
Pattern: swaeduae.ae/api/*
Settings:
- Cache Level: Bypass
```

## Step 4: Security Configuration

### A. Security Settings
1. Go to **Security** → **Settings**
2. Configure:
   - **Security Level**: Medium
   - **Challenge Passage**: 30 minutes
   - **Browser Integrity Check**: ON
   - **Privacy Pass Support**: ON

### B. Bot Management
1. Go to **Security** → **Bots**
2. Enable:
   - ✅ **Bot Fight Mode**
   - ✅ **Super Bot Fight Mode** (if available)

### C. Firewall Rules (Optional)
Create rules to protect your application:

```
Rule 1: Block known bad bots
Expression: (cf.bot_management.score lt 30)
Action: Block
```

```
Rule 2: Rate limiting for API
Expression: (http.request.uri.path contains "/api/")
Action: Rate Limit (100 requests per minute)
```

## Step 5: Performance Monitoring

### A. Analytics
1. Go to **Analytics & Logs** → **Web Analytics**
2. Enable **Web Analytics** for your domain

### B. Speed Test
1. Go to **Speed** → **Test**
2. Run speed tests to verify performance

## Step 6: Additional Cloudflare Features

### A. Workers (Advanced)
Consider using Cloudflare Workers for:
- Edge computing
- API optimization
- Custom routing logic

### B. Load Balancing (Enterprise)
If you have multiple servers:
- Set up load balancing
- Configure health checks

## Step 7: Verification Checklist

After configuration, verify:

- [ ] Domain resolves to your server IP
- [ ] HTTPS works correctly
- [ ] WWW redirect works
- [ ] Application loads properly
- [ ] Static assets are cached
- [ ] API endpoints work
- [ ] Security headers are present

## Testing Commands

Run these commands to test your setup:

```bash
# Test DNS resolution
dig swaeduae.ae
dig www.swaeduae.ae

# Test HTTP/HTTPS
curl -I http://swaeduae.ae
curl -I https://swaeduae.ae

# Test headers
curl -I https://swaeduae.ae | grep -i cloudflare
```

## Troubleshooting

### Common Issues

1. **522 Connection Timed Out**
   - Check if your server is running
   - Verify firewall settings
   - Ensure port 80/443 are open

2. **525 SSL Handshake Failed**
   - Check SSL/TLS encryption mode
   - Verify server SSL certificate

3. **Too Many Redirects**
   - Check SSL/TLS encryption mode
   - Verify server redirect configuration

4. **Origin Server Error**
   - Check application logs
   - Verify server resources

### Support Resources

- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Status](https://www.cloudflarestatus.com/)

## Security Best Practices

1. **Enable 2FA** on your Cloudflare account
2. **Use API tokens** instead of Global API keys
3. **Regularly review** firewall rules and security settings
4. **Monitor** security events and analytics
5. **Keep** SSL certificates updated

## Performance Tips

1. **Use appropriate caching** for different content types
2. **Optimize images** before uploading
3. **Minimize** the number of external resources
4. **Use** Cloudflare's CDN effectively
5. **Monitor** Core Web Vitals

---

**Note**: This guide assumes you're using Cloudflare as your DNS provider and proxy. Adjust settings based on your specific needs and Cloudflare plan features.