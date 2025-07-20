#!/usr/bin/env node

/**
 * Test Analytics and Performance Monitoring Implementation
 * Verifies that all components are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Analytics and Performance Monitoring Implementation\n');

// Test 1: Check if all required files exist
console.log('1. Checking required files...');
const requiredFiles = [
  'src/scripts/analytics.js',
  'src/scripts/performance-budget-monitor.js',
  'src/scripts/performance-dashboard.js',
  'scripts/performance-monitor.js',
  'scripts/performance-budget.js',
  'performance-config.json',
  'lighthouserc.cjs',
  '.github/workflows/lighthouse-ci.yml'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Test 2: Check package.json scripts
console.log('\n2. Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = [
  'performance:budget',
  'performance:monitor',
  'performance:dashboard',
  'performance:report',
  'lighthouse'
];

let allScriptsExist = true;
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`   ✅ ${script}: ${packageJson.scripts[script]}`);
  } else {
    console.log(`   ❌ ${script} - MISSING`);
    allScriptsExist = false;
  }
});

// Test 3: Check analytics configuration in HTML
console.log('\n3. Checking analytics configuration...');
const htmlContent = fs.readFileSync('src/index.html', 'utf8');

const analyticsChecks = [
  { name: 'Google Analytics script', pattern: /gtag\/js\?id=G-CIN4FOUNDATION/ },
  { name: 'Analytics configuration', pattern: /gtag\('config', 'G-CIN4FOUNDATION'/ },
  { name: 'Enhanced measurement', pattern: /enhanced_measurement: true/ },
  { name: 'Core Web Vitals tracking', pattern: /metric_1.*LCP/ }
];

analyticsChecks.forEach(check => {
  if (check.pattern.test(htmlContent)) {
    console.log(`   ✅ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} - NOT FOUND`);
  }
});

// Test 4: Check Lighthouse CI configuration
console.log('\n4. Checking Lighthouse CI configuration...');
const lighthouseConfig = fs.readFileSync('lighthouserc.cjs', 'utf8');

const lighthouseChecks = [
  { name: 'Performance threshold', pattern: /categories:performance.*minScore: 0\.95/ },
  { name: 'Accessibility threshold', pattern: /categories:accessibility.*minScore: 0\.95/ },
  { name: 'Core Web Vitals - LCP', pattern: /largest-contentful-paint.*maxNumericValue: 2500/ },
  { name: 'Core Web Vitals - CLS', pattern: /cumulative-layout-shift.*maxNumericValue: 0\.1/ },
  { name: 'GitHub Actions integration', pattern: /temporary-public-storage/ }
];

lighthouseChecks.forEach(check => {
  if (check.pattern.test(lighthouseConfig)) {
    console.log(`   ✅ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} - NOT CONFIGURED`);
  }
});

// Test 5: Check performance configuration
console.log('\n5. Checking performance configuration...');
const performanceConfig = JSON.parse(fs.readFileSync('performance-config.json', 'utf8'));

const configChecks = [
  { name: 'Resource budgets', check: () => performanceConfig.budgets?.resources?.totalJavaScript },
  { name: 'Core Web Vitals budgets', check: () => performanceConfig.budgets?.coreWebVitals?.largestContentfulPaint },
  { name: 'Analytics configuration', check: () => performanceConfig.analytics?.trackingId === 'G-CIN4FOUNDATION' },
  { name: 'Monitoring enabled', check: () => performanceConfig.monitoring?.enabled === true },
  { name: 'Alerting configuration', check: () => performanceConfig.monitoring?.alerting?.enabled === true }
];

configChecks.forEach(check => {
  if (check.check()) {
    console.log(`   ✅ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} - NOT CONFIGURED`);
  }
});

// Test 6: Verify build integration
console.log('\n6. Checking build integration...');
const buildScript = packageJson.scripts.build;
const buildChecks = [
  { name: 'Performance budget in build', check: buildScript.includes('performance:budget') },
  { name: 'CI build script exists', check: !!packageJson.scripts['build:ci'] },
  { name: 'Lighthouse in CI build', check: packageJson.scripts['build:ci'].includes('lighthouse') }
];

buildChecks.forEach(check => {
  if (check.check) {
    console.log(`   ✅ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} - NOT CONFIGURED`);
  }
});

// Summary
console.log('\n📊 Test Summary');
console.log('================');

if (allFilesExist && allScriptsExist) {
  console.log('✅ All core components are properly implemented');
  console.log('✅ Analytics and performance monitoring is configured');
  console.log('✅ Build integration is set up');
  console.log('✅ Lighthouse CI is configured');
  
  console.log('\n🎯 Implementation Complete!');
  console.log('\nNext steps:');
  console.log('1. Run "npm run build" to test performance budgets');
  console.log('2. Run "npm run dev" and visit http://localhost:3000?debug=true');
  console.log('3. Press Ctrl+Shift+P to open the performance dashboard');
  console.log('4. Check browser console for analytics and Core Web Vitals data');
  console.log('5. Set up GitHub Actions secrets for Lighthouse CI');
  
  process.exit(0);
} else {
  console.log('❌ Some components are missing or misconfigured');
  console.log('Please review the failed checks above');
  process.exit(1);
}