#!/usr/bin/env node

/**
 * Performance Budget Checker
 * Analyzes build output and enforces performance budgets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance budgets (in bytes)
const PERFORMANCE_BUDGETS = {
  // Total bundle size limits
  totalJavaScript: 150 * 1024, // 150KB
  totalCSS: 60 * 1024,         // 60KB
  totalImages: 500 * 1024,     // 500KB
  totalFonts: 100 * 1024,      // 100KB
  
  // Individual file limits
  singleJSFile: 100 * 1024,    // 100KB
  singleCSSFile: 60 * 1024,    // 60KB
  singleImageFile: 200 * 1024, // 200KB
  
  // Total bundle limit
  totalBundle: 1 * 1024 * 1024 // 1MB
};

// MIME type mappings
const FILE_TYPES = {
  '.js': 'javascript',
  '.css': 'css',
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  '.woff': 'font',
  '.woff2': 'font',
  '.ttf': 'font',
  '.eot': 'font'
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDistDirectory() {
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  const analysis = {
    totalJavaScript: 0,
    totalCSS: 0,
    totalImages: 0,
    totalFonts: 0,
    totalBundle: 0,
    files: [],
    violations: []
  };
  
  function analyzeDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeFilePath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(fullPath, relativeFilePath);
      } else {
        const ext = path.extname(item).toLowerCase();
        const fileType = FILE_TYPES[ext] || 'other';
        const size = stat.size;
        
        analysis.files.push({
          path: relativeFilePath,
          size: size,
          type: fileType,
          extension: ext
        });
        
        // Add to totals
        analysis.totalBundle += size;
        
        switch (fileType) {
          case 'javascript':
            analysis.totalJavaScript += size;
            if (size > PERFORMANCE_BUDGETS.singleJSFile) {
              analysis.violations.push({
                type: 'Single JS file too large',
                file: relativeFilePath,
                actual: size,
                budget: PERFORMANCE_BUDGETS.singleJSFile,
                severity: 'error'
              });
            }
            break;
          case 'css':
            analysis.totalCSS += size;
            if (size > PERFORMANCE_BUDGETS.singleCSSFile) {
              analysis.violations.push({
                type: 'Single CSS file too large',
                file: relativeFilePath,
                actual: size,
                budget: PERFORMANCE_BUDGETS.singleCSSFile,
                severity: 'error'
              });
            }
            break;
          case 'image':
            analysis.totalImages += size;
            if (size > PERFORMANCE_BUDGETS.singleImageFile) {
              analysis.violations.push({
                type: 'Single image file too large',
                file: relativeFilePath,
                actual: size,
                budget: PERFORMANCE_BUDGETS.singleImageFile,
                severity: 'warning'
              });
            }
            break;
          case 'font':
            analysis.totalFonts += size;
            break;
        }
      }
    }
  }
  
  analyzeDirectory(distPath);
  
  // Check total budgets
  if (analysis.totalJavaScript > PERFORMANCE_BUDGETS.totalJavaScript) {
    analysis.violations.push({
      type: 'Total JavaScript budget exceeded',
      actual: analysis.totalJavaScript,
      budget: PERFORMANCE_BUDGETS.totalJavaScript,
      severity: 'error'
    });
  }
  
  if (analysis.totalCSS > PERFORMANCE_BUDGETS.totalCSS) {
    analysis.violations.push({
      type: 'Total CSS budget exceeded',
      actual: analysis.totalCSS,
      budget: PERFORMANCE_BUDGETS.totalCSS,
      severity: 'error'
    });
  }
  
  if (analysis.totalImages > PERFORMANCE_BUDGETS.totalImages) {
    analysis.violations.push({
      type: 'Total images budget exceeded',
      actual: analysis.totalImages,
      budget: PERFORMANCE_BUDGETS.totalImages,
      severity: 'warning'
    });
  }
  
  if (analysis.totalFonts > PERFORMANCE_BUDGETS.totalFonts) {
    analysis.violations.push({
      type: 'Total fonts budget exceeded',
      actual: analysis.totalFonts,
      budget: PERFORMANCE_BUDGETS.totalFonts,
      severity: 'warning'
    });
  }
  
  if (analysis.totalBundle > PERFORMANCE_BUDGETS.totalBundle) {
    analysis.violations.push({
      type: 'Total bundle budget exceeded',
      actual: analysis.totalBundle,
      budget: PERFORMANCE_BUDGETS.totalBundle,
      severity: 'error'
    });
  }
  
  return analysis;
}

function generateReport(analysis) {
  console.log('\n📊 Performance Budget Report');
  console.log('================================\n');
  
  // Bundle size summary
  console.log('📦 Bundle Size Summary:');
  console.log(`   JavaScript: ${formatBytes(analysis.totalJavaScript)} / ${formatBytes(PERFORMANCE_BUDGETS.totalJavaScript)}`);
  console.log(`   CSS:        ${formatBytes(analysis.totalCSS)} / ${formatBytes(PERFORMANCE_BUDGETS.totalCSS)}`);
  console.log(`   Images:     ${formatBytes(analysis.totalImages)} / ${formatBytes(PERFORMANCE_BUDGETS.totalImages)}`);
  console.log(`   Fonts:      ${formatBytes(analysis.totalFonts)} / ${formatBytes(PERFORMANCE_BUDGETS.totalFonts)}`);
  console.log(`   Total:      ${formatBytes(analysis.totalBundle)} / ${formatBytes(PERFORMANCE_BUDGETS.totalBundle)}\n`);
  
  // Largest files
  const largestFiles = analysis.files
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  console.log('📋 Largest Files:');
  largestFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.path} (${formatBytes(file.size)})`);
  });
  console.log('');
  
  // Violations
  if (analysis.violations.length > 0) {
    console.log('⚠️  Budget Violations:');
    
    const errors = analysis.violations.filter(v => v.severity === 'error');
    const warnings = analysis.violations.filter(v => v.severity === 'warning');
    
    if (errors.length > 0) {
      console.log('\n   🚨 Errors:');
      errors.forEach(violation => {
        console.log(`      ${violation.type}`);
        if (violation.file) {
          console.log(`      File: ${violation.file}`);
        }
        console.log(`      Actual: ${formatBytes(violation.actual)} | Budget: ${formatBytes(violation.budget)}`);
        console.log('');
      });
    }
    
    if (warnings.length > 0) {
      console.log('   ⚠️  Warnings:');
      warnings.forEach(violation => {
        console.log(`      ${violation.type}`);
        if (violation.file) {
          console.log(`      File: ${violation.file}`);
        }
        console.log(`      Actual: ${formatBytes(violation.actual)} | Budget: ${formatBytes(violation.budget)}`);
        console.log('');
      });
    }
    
    return errors.length > 0;
  } else {
    console.log('✅ All performance budgets are within limits!\n');
    return false;
  }
}

function main() {
  console.log('🔍 Analyzing build output for performance budgets...\n');
  
  try {
    const analysis = analyzeDistDirectory();
    const hasErrors = generateReport(analysis);
    
    // Save detailed report
    const reportPath = path.join(__dirname, '..', 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);
    
    if (hasErrors) {
      console.log('❌ Performance budget check failed!');
      process.exit(1);
    } else {
      console.log('✅ Performance budget check passed!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Error analyzing performance budget:', error.message);
    process.exit(1);
  }
}

main();