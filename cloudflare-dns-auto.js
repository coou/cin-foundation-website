#!/usr/bin/env node

/**
 * Automated Cloudflare DNS Setup for Firebase Hosting
 * Usage: node cloudflare-dns-auto.js <API_TOKEN> <ZONE_ID>
 */

import https from 'https';

const DOMAIN = 'collectiveintelligencenetwork.org';
const FIREBASE_IPS = [
  '199.36.158.100',
  '199.36.158.101'
];

const API_TOKEN = process.argv[2];
const ZONE_ID = process.argv[3];

if (!API_TOKEN || !ZONE_ID) {
  console.log('❌ Usage: node cloudflare-dns-auto.js <API_TOKEN> <ZONE_ID>');
  console.log('');
  console.log('Get your credentials from:');
  console.log('- API Token: https://dash.cloudflare.com/profile/api-tokens');
  console.log('- Zone ID: In your domain overview in Cloudflare dashboard');
  process.exit(1);
}

function makeCloudflareRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4${path}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.success) {
            resolve(parsed.result);
          } else {
            reject(new Error(parsed.errors?.[0]?.message || 'API request failed'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function setupDNS() {
  console.log('🌐 Setting up DNS records for Firebase Hosting...');
  console.log('');

  try {
    // Get existing DNS records
    console.log('📋 Fetching existing DNS records...');
    const records = await makeCloudflareRequest('GET', `/zones/${ZONE_ID}/dns_records`);
    
    // Delete existing A records for root domain
    const existingARecords = records.filter(r => r.name === DOMAIN && r.type === 'A');
    for (const record of existingARecords) {
      console.log(`🗑️  Deleting existing A record: ${record.content}`);
      await makeCloudflareRequest('DELETE', `/zones/${ZONE_ID}/dns_records/${record.id}`);
    }

    // Add new A records
    for (const ip of FIREBASE_IPS) {
      console.log(`➕ Adding A record: @ -> ${ip}`);
      await makeCloudflareRequest('POST', `/zones/${ZONE_ID}/dns_records`, {
        type: 'A',
        name: '@',
        content: ip,
        ttl: 1, // Auto
        proxied: true
      });
    }

    // Check for www CNAME
    const existingCNAME = records.find(r => r.name === `www.${DOMAIN}` && r.type === 'CNAME');
    if (existingCNAME) {
      console.log('🔄 Updating existing www CNAME record...');
      await makeCloudflareRequest('PUT', `/zones/${ZONE_ID}/dns_records/${existingCNAME.id}`, {
        type: 'CNAME',
        name: 'www',
        content: DOMAIN,
        ttl: 1,
        proxied: true
      });
    } else {
      console.log('➕ Adding www CNAME record...');
      await makeCloudflareRequest('POST', `/zones/${ZONE_ID}/dns_records`, {
        type: 'CNAME',
        name: 'www',
        content: DOMAIN,
        ttl: 1,
        proxied: true
      });
    }

    console.log('');
    console.log('✅ DNS records configured successfully!');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('1. Wait 5-10 minutes for DNS propagation');
    console.log('2. Go to Firebase Console and add custom domain');
    console.log('3. Run: firebase deploy --only hosting:custom-domain');
    console.log('');
    console.log('🌐 Your site will be available at:');
    console.log(`   - https://${DOMAIN}`);
    console.log(`   - https://www.${DOMAIN}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDNS();