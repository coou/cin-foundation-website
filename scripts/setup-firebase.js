#!/usr/bin/env node

/**
 * Firebase Setup and Validation Script
 * Helps verify Firebase configuration and setup
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const REQUIRED_FILES = [
  'firebase.json',
  '.firebaserc',
  'package.json'
];

function checkRequiredFiles() {
  console.log('🔍 Checking required configuration files...');
  
  for (const file of REQUIRED_FILES) {
    const filePath = join(PROJECT_ROOT, file);
    if (!existsSync(filePath)) {
      console.error(`❌ Missing required file: ${file}`);
      process.exit(1);
    }
    console.log(`✅ Found: ${file}`);
  }
}

function validateFirebaseConfig() {
  console.log('\n🔧 Validating Firebase configuration...');
  
  try {
    const firebaseConfig = JSON.parse(readFileSync('firebase.json', 'utf8'));
    const firebaseRc = JSON.parse(readFileSync('.firebaserc', 'utf8'));
    
    // Check hosting configuration
    if (!firebaseConfig.hosting) {
      throw new Error('Missing hosting configuration in firebase.json');
    }
    
    if (firebaseConfig.hosting.public !== 'dist') {
      throw new Error('Hosting public directory should be "dist"');
    }
    
    // Check project configuration
    if (!firebaseRc.projects || !firebaseRc.projects.default) {
      throw new Error('Missing default project in .firebaserc');
    }
    
    console.log(`✅ Firebase project: ${firebaseRc.projects.default}`);
    console.log(`✅ Hosting public directory: ${firebaseConfig.hosting.public}`);
    console.log('✅ Firebase configuration valid');
    
  } catch (error) {
    console.error(`❌ Firebase configuration error: ${error.message}`);
    process.exit(1);
  }
}

function checkBuildOutput() {
  console.log('\n🏗️  Checking build output...');
  
  if (!existsSync('dist')) {
    console.log('📦 Building project...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Build failed');
      process.exit(1);
    }
  }
  
  if (!existsSync('dist/index.html')) {
    console.error('❌ Build output missing index.html');
    process.exit(1);
  }
  
  console.log('✅ Build output verified');
}

function checkFirebaseCLI() {
  console.log('\n🔥 Checking Firebase CLI...');
  
  try {
    const version = execSync('firebase --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Firebase CLI installed: ${version}`);
  } catch (error) {
    console.log('⚠️  Firebase CLI not found globally');
    console.log('💡 Install with: npm install -g firebase-tools');
    console.log('💡 Or use local version: npx firebase');
  }
}

function showNextSteps() {
  console.log('\n🚀 Next Steps:');
  console.log('1. Ensure Firebase CLI is authenticated: firebase login');
  console.log('2. Test local serving: npm run firebase:serve');
  console.log('3. Deploy to preview: npm run firebase:deploy:preview');
  console.log('4. Deploy to production: npm run firebase:deploy');
  console.log('\n📚 For more details, see DEPLOYMENT.md');
}

function main() {
  console.log('🔥 Firebase Setup Validation\n');
  
  try {
    checkRequiredFiles();
    validateFirebaseConfig();
    checkBuildOutput();
    checkFirebaseCLI();
    
    console.log('\n✅ All checks passed! Firebase deployment is ready.');
    showNextSteps();
    
  } catch (error) {
    console.error(`\n❌ Setup validation failed: ${error.message}`);
    process.exit(1);
  }
}

main();