# GitHub Actions Firebase Deployment Setup

## Overview

This document provides step-by-step instructions for setting up automated Firebase deployment using GitHub Actions.

## Required GitHub Secrets

### FIREBASE_SERVICE_ACCOUNT_CIN_FOUNDATION

This secret contains the Firebase service account key that allows GitHub Actions to deploy to Firebase Hosting.

**To create this secret:**

1. **Generate Service Account Key:**
   ```bash
   # Login to Firebase CLI
   firebase login
   
   # Generate service account key
   firebase init hosting:github
   ```
   
   Or manually in Firebase Console:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT_CIN_FOUNDATION`
   - Value: Paste the entire JSON content from the service account key file

## Workflow Features

### Automatic Deployment Triggers

- **Pull Requests:** Deploy to preview channel with 7-day expiration
- **Main Branch Push:** Deploy to production hosting

### Build Verification

- Dependency installation with npm ci
- Code linting (continues on error)
- Build process verification
- Output validation (checks for dist directory and index.html)

### Preview Channel Management

- Automatic preview URL commenting on PRs
- 7-day expiration for preview channels
- Automatic cleanup of expired channels

### Error Handling

- Build verification steps
- Deployment status reporting
- Comprehensive logging for troubleshooting

## Workflow Configuration

### Environment Variables

```yaml
env:
  NODE_VERSION: '20'
  FIREBASE_PROJECT_ID: 'cin-foundation'
```

### Job Steps

1. **Checkout:** Get repository code
2. **Setup Node.js:** Install Node.js with npm cache
3. **Install Dependencies:** Run npm ci for clean install
4. **Lint Code:** Run ESLint (continues on error)
5. **Build Project:** Run Vite build process
6. **Verify Build:** Check build output integrity
7. **Deploy:** Deploy to appropriate Firebase channel

## Testing the Workflow

### Manual Trigger

You can manually test the deployment workflow:

1. Create a test branch
2. Make a small change
3. Create a pull request to main
4. Check the Actions tab for workflow execution
5. Verify preview deployment URL in PR comments

### Local Testing

Before pushing changes, test locally:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Build project
npm run build

# Verify Firebase configuration
npm run firebase:setup

# Test local serving (requires Firebase CLI)
npm run firebase:serve
```

## Troubleshooting

### Common Issues

1. **Service Account Permissions:**
   - Ensure service account has "Firebase Hosting Admin" role
   - Verify project ID matches in all configuration files

2. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are properly installed
   - Review build logs for specific errors

3. **Deployment Failures:**
   - Check Firebase project exists and is active
   - Verify service account key is valid and properly formatted
   - Ensure GitHub secret is correctly named

### Debug Steps

1. **Check Workflow Logs:**
   - Go to Actions tab in GitHub repository
   - Click on failed workflow run
   - Review step-by-step logs

2. **Verify Configuration:**
   ```bash
   # Check Firebase project
   firebase projects:list
   
   # Verify hosting sites
   firebase hosting:sites:list --project cin-foundation
   ```

3. **Test Local Build:**
   ```bash
   # Clean install and build
   rm -rf node_modules dist
   npm ci
   npm run build
   ```

## Security Considerations

- Service account keys are sensitive - never commit to repository
- Use GitHub secrets for all sensitive configuration
- Regularly rotate service account keys
- Monitor deployment logs for unauthorized access

## Monitoring

### Deployment Status

- GitHub Actions provides deployment status
- Firebase Console shows deployment history
- Preview channels are listed in Firebase Hosting

### Performance Monitoring

- Firebase Hosting provides analytics
- Core Web Vitals monitoring available
- Custom analytics can be added to the application

## Maintenance

### Regular Tasks

- Update Node.js version in workflow
- Rotate service account keys annually
- Review and update security headers
- Monitor for deprecated GitHub Actions

### Scaling Considerations

- Preview channels have limits (10 active channels per site)
- Consider cleanup automation for old preview channels
- Monitor Firebase Hosting usage and quotas