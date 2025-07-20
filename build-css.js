#!/usr/bin/env node

/**
 * Simple CSS build script for CIN Foundation website
 * This script combines our custom CSS with Tailwind classes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the input CSS file
const inputCssPath = path.join(__dirname, 'src/styles/input.css');
const outputCssPath = path.join(__dirname, 'src/styles/main.css');

// For now, just copy the input CSS to output
// In the future, this could be enhanced with proper Tailwind compilation
try {
  const inputCss = fs.readFileSync(inputCssPath, 'utf8');
  
  // Add a comment indicating this is a built file
  const outputCss = `/* Built CSS for CIN Foundation Website */\n/* Generated: ${new Date().toISOString()} */\n\n${inputCss}`;
  
  fs.writeFileSync(outputCssPath, outputCss);
  console.log('✅ CSS built successfully!');
  console.log(`📁 Output: ${outputCssPath}`);
} catch (error) {
  console.error('❌ Error building CSS:', error.message);
  process.exit(1);
}