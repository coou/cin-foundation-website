# Firebase Hosting Deployment Guide

## Overview

This project is configured for automated deployment to Firebase Hosting using GitHub Actions. The deployment pipeline supports both preview channels for pull requests and production deployment for the main branch.

## Prerequisites

1. **Firebase Project**: Ensure the `cin-foundation` Firebase project exists
2. **Firebase CLI**: Install globally with `npm install -g firebase-tools`
3. **GitHub Secrets**: Configure the following repository secrets:
   - `FIREBASE_SERVICE_ACCOUNT_CIN_FOUNDATION`: Service account key JSON

## Configuration Files

### firebase.json
- Configures hosting settings, headers, and routing
- Sets up security headers (CSP, X-Frame-Options, etc.)
- Optimizes caching for static assets
- Enables clean URLs and removes trailing slashes

### .firebaserc
- Defines the default Firebase project ID
- Allows switching between different environments

## Deployment Workflows

### Automatic Deployment (GitHub Actions)

**Pull Request Deployment:**
- Triggers on PR creation/updates to main branch
- Deploys to preview channel with 7-day expiration
- Comments on PR with preview URL
- Includes build verification and linting

**Production Deployment:**
- Triggers on push to main branch
- Deploys to live hosting
- Includes comprehensive build verification

### Manual Deployment

**Local Development:**
```bash
# Serve locally with Firebase emulator
npm run firebase:serve

# Deploy to production
npm run firebase:deploy

# Deploy to preview channel
npm run firebase:deploy:preview
```

**Firebase CLI Commands:**
```bash
# Login to Firebase
firebase login

# Initialize project (if needed)
firebase init hosting

# Deploy to production
firebase deploy --only hosting

# Create preview channel
firebase hosting:channel:deploy preview --expires 7d

# List active channels
firebase hosting:channel:list

# Delete preview channel
firebase hosting:channel:delete preview
```

## Security Headers

The deployment includes comprehensive security headers:

- **Content Security Policy**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information

## Performance Optimization

- **Asset Caching**: 1-year cache for immutable assets
- **HTML Caching**: No-cache for index.html to ensure updates
- **Compression**: Automatic gzip/brotli compression
- **CDN**: Global Firebase CDN distribution

## Custom Domain Setup

1. **Add Domain in Firebase Console:**
   - Go to Firebase Console > Hosting
   - Click "Add custom domain"
   - Enter your domain (e.g., cin-foundation.org)

2. **DNS Configuration:**
   - Add A records pointing to Firebase IPs
   - Or add CNAME record for subdomain

3. **SSL Certificate:**
   - Firebase automatically provisions SSL certificates
   - Certificate renewal is handled automatically

## Monitoring and Analytics

- **Firebase Analytics**: Integrated for user behavior tracking
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Reporting**: Console error logging
- **Build Verification**: Automated checks in CI/CD

## Troubleshooting

**Common Issues:**

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Deployment Failures:**
   - Verify Firebase service account permissions
   - Check project ID in configuration
   - Ensure GitHub secrets are properly set

3. **Preview Channel Issues:**
   - Channels expire after 7 days by default
   - Use `firebase hosting:channel:list` to check status
   - Recreate channels if needed

**Debug Commands:**
```bash
# Check Firebase project status
firebase projects:list

# Verify hosting configuration
firebase hosting:sites:list

# Test local build
npm run build && npm run preview
```

## Environment Variables

For different environments, you can use:

```bash
# Development
firebase use development

# Production
firebase use production

# Or specify project directly
firebase deploy --project cin-foundation
```

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Firebase Console logs
3. Verify all configuration files
4. Test local build process

## Security Notes

- Never commit service account keys to repository
- Use GitHub secrets for sensitive configuration
- Regularly review and update security headers
- Monitor for unauthorized deployments