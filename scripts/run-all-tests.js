#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}...`, 'cyan');
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} passed`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    log(error.stdout || error.message, 'red');
    return { success: false, error: error.stdout || error.message };
  }
}

function generateTestReport(results) {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    },
    results
  };

  const reportPath = resolve('./test-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\nTest report saved to: ${reportPath}`, 'blue');

  return report;
}

async function main() {
  log('🚀 Running comprehensive test suite for CIN Foundation website', 'bright');
  
  const testSuite = [
    {
      command: 'npm run lint',
      description: 'ESLint code quality check'
    },
    {
      command: 'npm run validate:html',
      description: 'HTML validation'
    },
    {
      command: 'npm run test:coverage',
      description: 'JavaScript unit tests with coverage'
    },
    {
      command: 'npm run test:accessibility',
      description: 'Accessibility compliance tests'
    },
    {
      command: 'npm run test:seo',
      description: 'SEO and social media meta tag tests'
    },
    {
      command: 'npm run test:links',
      description: 'Link validation tests'
    },
    {
      command: 'npm run build',
      description: 'Production build test'
    },
    {
      command: 'npm run validate:links',
      description: 'Live link validation (requires build)'
    },
    {
      command: 'npm run lighthouse',
      description: 'Performance and accessibility audit'
    }
  ];

  const results = [];

  for (const test of testSuite) {
    const result = runCommand(test.command, test.description);
    results.push({
      name: test.description,
      command: test.command,
      ...result
    });
  }

  const report = generateTestReport(results);
  
  log('\n📊 Test Summary:', 'bright');
  log(`Total tests: ${report.summary.total}`, 'blue');
  log(`Passed: ${report.summary.passed}`, 'green');
  log(`Failed: ${report.summary.failed}`, report.summary.failed > 0 ? 'red' : 'green');

  if (report.summary.failed > 0) {
    log('\n❌ Some tests failed. Please review the issues above.', 'red');
    process.exit(1);
  } else {
    log('\n✅ All tests passed! Website is ready for deployment.', 'green');
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`\n💥 Unhandled rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

main().catch((error) => {
  log(`\n💥 Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});