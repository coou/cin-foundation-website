#!/usr/bin/env node

/**
 * Cloudflare DNS Setup Script for Firebase Hosting
 * This script helps configure DNS records for collectiveintelligencenetwork.org
 */

import https from 'https';

const DOMAIN = 'collectiveintelligencenetwork.org';
const FIREBASE_IPS = [
  '199.36.158.100',
  '199.36.158.101'
];

console.log('🌐 Cloudflare DNS Setup for Firebase Hosting');
console.log('='.repeat(50));
console.log(`Domain: ${DOMAIN}`);
console.log(`Target: Firebase Hosting`);
console.log('');

console.log('📋 Manual DNS Configuration Steps:');
console.log('');
console.log('1. Go to Cloudflare Dashboard: https://dash.cloudflare.com');
console.log(`2. Select your domain: ${DOMAIN}`);
console.log('3. Go to DNS > Records');
console.log('4. Add the following A records:');
console.log('');

FIREBASE_IPS.forEach((ip, index) => {
  console.log(`   A Record ${index + 1}:`);
  console.log(`   - Name: @`);
  console.log(`   - IPv4 address: ${ip}`);
  console.log(`   - Proxy status: Proxied (orange cloud)`);
  console.log('');
});

console.log('5. Add CNAME record for www:');
console.log('   - Name: www');
console.log(`   - Target: ${DOMAIN}`);
console.log('   - Proxy status: Proxied (orange cloud)');
console.log('');

console.log('6. In Firebase Console:');
console.log('   - Go to: https://console.firebase.google.com/project/cin-foundation/hosting');
console.log('   - Click "Add custom domain"');
console.log(`   - Enter: ${DOMAIN}`);
console.log('   - Follow the verification steps');
console.log('');

console.log('🚀 After DNS propagation (5-10 minutes), run:');
console.log('   firebase deploy --only hosting:custom-domain');
console.log('');

console.log('✅ Your site will be available at:');
console.log(`   - https://${DOMAIN}`);
console.log(`   - https://www.${DOMAIN}`);
console.log('');

// Optional: Check if we can make API calls
console.log('💡 For automated setup, you would need:');
console.log('   - Cloudflare API Token with Zone:Edit permissions');
console.log('   - Zone ID for your domain');
console.log('');
console.log('   You can get these from:');
console.log('   - API Token: https://dash.cloudflare.com/profile/api-tokens');
console.log('   - Zone ID: In your domain overview in Cloudflare dashboard');