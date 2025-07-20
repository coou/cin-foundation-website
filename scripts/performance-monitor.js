#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Continuous monitoring of Core Web Vitals and performance metrics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance thresholds based on Core Web Vitals
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },   // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  
  // Additional metrics
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
  TBT: { good: 200, poor: 600 },   // Total Blocking Time (ms)
  
  // Performance scores (0-100)
  performanceScore: { good: 90, poor: 50 },
  accessibilityScore: { good: 95, poor: 80 },
  bestPracticesScore: { good: 90, poor: 70 },
  seoScore: { good: 95, poor: 80 }
};

// Monitoring configuration
const MONITORING_CONFIG = {
  reportPath: path.join(__dirname, '..', 'performance-report.json'),
  historyPath: path.join(__dirname, '..', 'performance-history.json'),
  maxHistoryEntries: 100,
  alertThresholds: {
    consecutiveFailures: 3,
    performanceDegradation: 10 // percentage
  }
};

function getRating(value, thresholds) {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

function formatMetric(value, unit = 'ms') {
  if (unit === 'ms') {
    return `${Math.round(value)}ms`;
  } else if (unit === 'score') {
    return `${Math.round(value)}/100`;
  } else if (unit === 'ratio') {
    return value.toFixed(3);
  }
  return value.toString();
}

function loadPerformanceHistory() {
  try {
    if (fs.existsSync(MONITORING_CONFIG.historyPath)) {
      const data = fs.readFileSync(MONITORING_CONFIG.historyPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Could not load performance history:', error.message);
  }
  return [];
}

function savePerformanceHistory(history) {
  try {
    // Keep only the most recent entries
    const trimmedHistory = history.slice(-MONITORING_CONFIG.maxHistoryEntries);
    fs.writeFileSync(MONITORING_CONFIG.historyPath, JSON.stringify(trimmedHistory, null, 2));
  } catch (error) {
    console.error('Could not save performance history:', error.message);
  }
}

function analyzePerformanceReport() {
  const reportPath = MONITORING_CONFIG.reportPath;
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Performance report not found. Run Lighthouse CI first.');
    return null;
  }
  
  try {
    const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    // Extract key metrics from the report
    const analysis = {
      timestamp: new Date().toISOString(),
      url: reportData.url || 'unknown',
      metrics: {},
      scores: {},
      issues: [],
      recommendations: []
    };
    
    // Core Web Vitals analysis
    if (reportData.lcp) {
      analysis.metrics.LCP = {
        value: reportData.lcp,
        rating: getRating(reportData.lcp, PERFORMANCE_THRESHOLDS.LCP),
        threshold: PERFORMANCE_THRESHOLDS.LCP
      };
    }
    
    if (reportData.fid) {
      analysis.metrics.FID = {
        value: reportData.fid,
        rating: getRating(reportData.fid, PERFORMANCE_THRESHOLDS.FID),
        threshold: PERFORMANCE_THRESHOLDS.FID
      };
    }
    
    if (reportData.cls) {
      analysis.metrics.CLS = {
        value: reportData.cls,
        rating: getRating(reportData.cls, PERFORMANCE_THRESHOLDS.CLS),
        threshold: PERFORMANCE_THRESHOLDS.CLS
      };
    }
    
    // Additional metrics
    if (reportData.fcp) {
      analysis.metrics.FCP = {
        value: reportData.fcp,
        rating: getRating(reportData.fcp, PERFORMANCE_THRESHOLDS.FCP),
        threshold: PERFORMANCE_THRESHOLDS.FCP
      };
    }
    
    // Performance scores
    if (reportData.performanceScore) {
      analysis.scores.performance = {
        value: reportData.performanceScore,
        rating: getRating(100 - reportData.performanceScore, { good: 10, poor: 50 }),
        threshold: PERFORMANCE_THRESHOLDS.performanceScore
      };
    }
    
    // Identify issues and recommendations
    Object.entries(analysis.metrics).forEach(([metric, data]) => {
      if (data.rating === 'poor') {
        analysis.issues.push({
          type: 'metric',
          metric: metric,
          value: data.value,
          threshold: data.threshold.poor,
          severity: 'high'
        });
        
        // Add specific recommendations
        switch (metric) {
          case 'LCP':
            analysis.recommendations.push('Optimize largest contentful paint by compressing images and reducing server response times');
            break;
          case 'FID':
            analysis.recommendations.push('Reduce first input delay by minimizing JavaScript execution time');
            break;
          case 'CLS':
            analysis.recommendations.push('Improve cumulative layout shift by setting explicit dimensions for images and ads');
            break;
          case 'FCP':
            analysis.recommendations.push('Optimize first contentful paint by eliminating render-blocking resources');
            break;
        }
      } else if (data.rating === 'needs-improvement') {
        analysis.issues.push({
          type: 'metric',
          metric: metric,
          value: data.value,
          threshold: data.threshold.good,
          severity: 'medium'
        });
      }
    });
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Error analyzing performance report:', error.message);
    return null;
  }
}

function generateMonitoringReport(analysis, history) {
  console.log('\n📊 Performance Monitoring Report');
  console.log('==================================\n');
  
  // Current metrics
  console.log('🎯 Core Web Vitals:');
  Object.entries(analysis.metrics).forEach(([metric, data]) => {
    const icon = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
    const unit = metric === 'CLS' ? 'ratio' : 'ms';
    console.log(`   ${icon} ${metric}: ${formatMetric(data.value, unit)} (${data.rating})`);
  });
  
  console.log('\n📈 Performance Scores:');
  Object.entries(analysis.scores).forEach(([score, data]) => {
    const icon = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`   ${icon} ${score}: ${formatMetric(data.value, 'score')} (${data.rating})`);
  });
  
  // Trend analysis
  if (history.length > 1) {
    console.log('\n📊 Performance Trends:');
    const previous = history[history.length - 2];
    const current = analysis;
    
    Object.entries(current.metrics).forEach(([metric, currentData]) => {
      if (previous.metrics && previous.metrics[metric]) {
        const previousValue = previous.metrics[metric].value;
        const currentValue = currentData.value;
        const change = currentValue - previousValue;
        const changePercent = ((change / previousValue) * 100).toFixed(1);
        
        const trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        const changeText = change > 0 ? `+${formatMetric(Math.abs(change))}` : `-${formatMetric(Math.abs(change))}`;
        
        console.log(`   ${trend} ${metric}: ${changeText} (${changePercent}%)`);
      }
    });
  }
  
  // Issues and recommendations
  if (analysis.issues.length > 0) {
    console.log('\n⚠️  Performance Issues:');
    analysis.issues.forEach(issue => {
      const severity = issue.severity === 'high' ? '🚨' : '⚠️';
      console.log(`   ${severity} ${issue.metric}: ${formatMetric(issue.value)} exceeds threshold of ${formatMetric(issue.threshold)}`);
    });
    
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  } else {
    console.log('\n✅ All performance metrics are within acceptable thresholds!');
  }
  
  // Alert conditions
  const recentFailures = history.slice(-MONITORING_CONFIG.alertThresholds.consecutiveFailures)
    .filter(entry => entry.issues && entry.issues.some(issue => issue.severity === 'high'));
  
  if (recentFailures.length >= MONITORING_CONFIG.alertThresholds.consecutiveFailures) {
    console.log('\n🚨 ALERT: Performance has been degraded for multiple consecutive runs!');
    console.log('   Consider immediate optimization efforts.');
  }
  
  console.log(`\n📄 Report saved to: ${MONITORING_CONFIG.reportPath}`);
  console.log(`📈 History saved to: ${MONITORING_CONFIG.historyPath}\n`);
}

function main() {
  console.log('🔍 Analyzing performance metrics...\n');
  
  try {
    // Load performance history
    const history = loadPerformanceHistory();
    
    // Analyze current performance report
    const analysis = analyzePerformanceReport();
    
    if (!analysis) {
      console.error('❌ Could not analyze performance data');
      process.exit(1);
    }
    
    // Add to history
    history.push(analysis);
    
    // Generate monitoring report
    generateMonitoringReport(analysis, history);
    
    // Save updated history
    savePerformanceHistory(history);
    
    // Exit with appropriate code
    const hasHighSeverityIssues = analysis.issues.some(issue => issue.severity === 'high');
    if (hasHighSeverityIssues) {
      console.log('❌ Performance monitoring detected critical issues!');
      process.exit(1);
    } else {
      console.log('✅ Performance monitoring completed successfully!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Error in performance monitoring:', error.message);
    process.exit(1);
  }
}

// Export for testing
export { analyzePerformanceReport, getRating, formatMetric };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}