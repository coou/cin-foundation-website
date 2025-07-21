# Custom Domain Setup Guide

Setting up `collectiveintelligencenetwork.org` with Firebase Hosting via Cloudflare

## 🚀 Quick Setup (Automated)

If you have your Cloudflare API credentials:

```bash
# Get your API Token and Zone ID from Cloudflare Dashboard
node cloudflare-dns-auto.js YOUR_API_TOKEN YOUR_ZONE_ID
```

## 📋 Manual Setup

### Step 1: Configure DNS in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select `collectiveintelligencenetwork.org`
3. Go to **DNS > Records**
4. Add these A records:

```
Type: A
Name: @
IPv4: 199.36.158.100
Proxy: Proxied (orange cloud)

Type: A  
Name: @
IPv4: 199.36.158.101
Proxy: Proxied (orange cloud)
```

5. Add CNAME for www:

```
Type: CNAME
Name: www
Target: collectiveintelligencenetwork.org
Proxy: Proxied (orange cloud)
```

### Step 2: Configure Firebase Custom Domain

1. Go to [Firebase Console](https://console.firebase.google.com/project/cin-foundation/hosting)
2. Click **"Add custom domain"**
3. Enter: `collectiveintelligencenetwork.org`
4. Follow the verification steps
5. Wait for SSL certificate provisioning

### Step 3: Deploy to Custom Domain

```bash
npm run deploy:custom
```

## 🔧 Getting Cloudflare Credentials

### API Token
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use **"Custom token"** template
4. Set permissions:
   - Zone: Zone Settings: Read
   - Zone: DNS: Edit
5. Set zone resources to include your domain
6. Copy the generated token

### Zone ID
1. Go to your domain overview in Cloudflare Dashboard
2. Scroll down to **"API"** section on the right
3. Copy the **Zone ID**

## 🛠️ Available Commands

```bash
# Show manual setup instructions
npm run setup-dns

# Automated setup (requires API credentials)
npm run setup-dns-auto YOUR_API_TOKEN YOUR_ZONE_ID

# Deploy to main site
npm run deploy

# Deploy to custom domain
npm run deploy:custom

# Local development
npm run dev
```

## ✅ Verification

After setup, your site will be available at:
- https://collectiveintelligencenetwork.org
- https://www.collectiveintelligencenetwork.org
- https://cin-foundation.web.app (original)

## 🔍 Troubleshooting

### DNS Propagation
- Wait 5-10 minutes for DNS changes to propagate
- Check with: `dig collectiveintelligencenetwork.org`

### SSL Certificate Issues
- Firebase automatically provisions SSL certificates
- This can take up to 24 hours for new domains
- Check status in Firebase Console

### Cloudflare Settings
- Ensure SSL/TLS mode is set to "Full (strict)"
- Disable "Always Use HTTPS" initially during setup
- Enable after Firebase SSL is working

## 📞 Support

If you encounter issues:
1. Check Firebase Console for domain status
2. Verify DNS records in Cloudflare
3. Check Cloudflare SSL/TLS settings
4. Wait for propagation (up to 24 hours for SSL)