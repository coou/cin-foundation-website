# Connect Custom Domain to Firebase

## Step-by-Step Guide to Connect collectiveintelligencenetwork.org

### 1. Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/cin-foundation/hosting)
2. Click on "Hosting" in the left sidebar
3. You should see your sites:
   - `cin-foundation`
   - `collectiveintelligencenetwork-org`

### 2. Add Custom Domain
1. Click on the site `collectiveintelligencenetwork-org`
2. Click **"Add custom domain"**
3. Enter: `collectiveintelligencenetwork.org`
4. Click **"Continue"**

### 3. Verify Domain Ownership
Firebase will check if the DNS records we set up earlier are correct. If they are, you'll see a verification success message.

### 4. Set Up SSL Certificate
1. Firebase will automatically provision an SSL certificate for your domain
2. This may take up to 24 hours, but usually completes within minutes
3. You'll see a "Provisioning certificate" status

### 5. Add TXT Record in Cloudflare
1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Select `collectiveintelligencenetwork.org`
3. Go to **DNS > Records**
4. Add the TXT record that Firebase provides:
   ```
   Type: TXT
   Name: @
   Content: [verification string provided by Firebase]
   TTL: Auto
   ```

### 6. Wait for Verification
1. Return to Firebase Console
2. Click "Verify" button
3. Wait for verification to complete

### 7. Wait for SSL Certificate
1. Once verified, Firebase will provision an SSL certificate
2. This may take up to 24 hours
3. Status will change to "Connected" when complete

### 8. Test Your Domain
Once complete, test these URLs:
- https://collectiveintelligencenetwork.org
- https://www.collectiveintelligencenetwork.org

## Automated Command

If you need to deploy to the custom domain again:

```bash
npm run deploy:custom
```

## Troubleshooting

### DNS Issues
- Make sure A records point to Firebase IPs: `199.36.158.100` and `199.36.158.101`
- Ensure CNAME for www points to `collectiveintelligencenetwork.org`
- Check that Cloudflare proxy is enabled (orange cloud)

### SSL Certificate Issues
- If certificate provisioning fails, try temporarily disabling Cloudflare proxy (gray cloud)
- Once certificate is provisioned, you can re-enable proxy

### Firebase Console Issues
- If verification fails, wait 5-10 minutes for DNS propagation and try again
- Check for typos in domain name
- Ensure you have proper permissions on the Firebase project