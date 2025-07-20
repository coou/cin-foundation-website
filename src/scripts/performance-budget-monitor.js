/**
 * Performance Budget Monitor
 * Real-time monitoring of performance budgets in the browser
 */

// Performance budgets (matching the build-time budgets)
const PERFORMANCE_BUDGETS = {
  // Resource size budgets (in bytes)
  totalJavaScript: 150 * 1024, // 150KB
  totalCSS: 60 * 1024,         // 60KB
  totalImages: 500 * 1024,     // 500KB
  totalFonts: 100 * 1024,      // 100KB
  totalBundle: 1 * 1024 * 1024, // 1MB
  
  // Performance timing budgets (in ms)
  domContentLoaded: 2000,      // 2 seconds
  loadComplete: 4000,          // 4 seconds
  firstPaint: 1000,            // 1 second
  firstContentfulPaint: 1500,  // 1.5 seconds
  
  // Core Web Vitals budgets
  largestContentfulPaint: 2500, // 2.5 seconds
  firstInputDelay: 100,         // 100ms
  cumulativeLayoutShift: 0.1    // 0.1
};

// Budget violation tracking
let budgetViolations = [];

// Monitor resource loading budgets
function monitorResourceBudgets() {
  if (!('performance' in window) || !performance.getEntriesByType) {
    console.warn('Performance API not supported');
    return;
  }
  
  // Wait for page load to complete
  window.addEventListener('load', () => {
    setTimeout(() => {
      const resources = performance.getEntriesByType('resource');
      const resourceSizes = {
        javascript: 0,
        css: 0,
        images: 0,
        fonts: 0,
        total: 0
      };
      
      resources.forEach(resource => {
        const size = resource.transferSize || resource.encodedBodySize || 0;
        resourceSizes.total += size;
        
        // Categorize by resource type
        if (resource.name.includes('.js')) {
          resourceSizes.javascript += size;
        } else if (resource.name.includes('.css')) {
          resourceSizes.css += size;
        } else if (/\.(png|jpg|jpeg|gif|svg|webp|ico)/.test(resource.name)) {
          resourceSizes.images += size;
        } else if (/\.(woff|woff2|ttf|eot)/.test(resource.name)) {
          resourceSizes.fonts += size;
        }
      });
      
      // Check budget violations
      checkResourceBudgets(resourceSizes);
      
      // Log results
      console.log('📊 Resource Budget Analysis:', {
        javascript: `${formatBytes(resourceSizes.javascript)} / ${formatBytes(PERFORMANCE_BUDGETS.totalJavaScript)}`,
        css: `${formatBytes(resourceSizes.css)} / ${formatBytes(PERFORMANCE_BUDGETS.totalCSS)}`,
        images: `${formatBytes(resourceSizes.images)} / ${formatBytes(PERFORMANCE_BUDGETS.totalImages)}`,
        fonts: `${formatBytes(resourceSizes.fonts)} / ${formatBytes(PERFORMANCE_BUDGETS.totalFonts)}`,
        total: `${formatBytes(resourceSizes.total)} / ${formatBytes(PERFORMANCE_BUDGETS.totalBundle)}`
      });
      
    }, 1000); // Wait 1 second after load for all resources
  });
}

// Check resource budget violations
function checkResourceBudgets(sizes) {
  const checks = [
    { name: 'JavaScript Bundle', actual: sizes.javascript, budget: PERFORMANCE_BUDGETS.totalJavaScript },
    { name: 'CSS Bundle', actual: sizes.css, budget: PERFORMANCE_BUDGETS.totalCSS },
    { name: 'Images Total', actual: sizes.images, budget: PERFORMANCE_BUDGETS.totalImages },
    { name: 'Fonts Total', actual: sizes.fonts, budget: PERFORMANCE_BUDGETS.totalFonts },
    { name: 'Total Bundle', actual: sizes.total, budget: PERFORMANCE_BUDGETS.totalBundle }
  ];
  
  checks.forEach(check => {
    if (check.actual > check.budget) {
      const violation = {
        type: 'resource_budget',
        name: check.name,
        actual: check.actual,
        budget: check.budget,
        overage: check.actual - check.budget,
        percentage: ((check.actual / check.budget - 1) * 100).toFixed(1),
        timestamp: Date.now()
      };
      
      budgetViolations.push(violation);
      
      console.warn(`⚠️ Budget Violation: ${check.name}`, {
        actual: formatBytes(check.actual),
        budget: formatBytes(check.budget),
        overage: formatBytes(violation.overage),
        percentage: `+${violation.percentage}%`
      });
      
      // Track in analytics if available
      if (window.gtag) {
        window.gtag('event', 'performance_budget_violation', {
          event_category: 'Performance',
          event_label: check.name,
          value: Math.round(violation.percentage),
          custom_parameters: {
            budget_type: 'resource',
            actual_size: check.actual,
            budget_size: check.budget
          }
        });
      }
    }
  });
}

// Monitor timing budgets
function monitorTimingBudgets() {
  if (!('performance' in window) || !performance.timing) {
    console.warn('Performance Timing API not supported');
    return;
  }
  
  window.addEventListener('load', () => {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];
    
    const timingMetrics = {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      firstPaint: 0,
      firstContentfulPaint: 0
    };
    
    // Get paint timing if available
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        timingMetrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        timingMetrics.firstContentfulPaint = entry.startTime;
      }
    });
    
    // Check timing budget violations
    checkTimingBudgets(timingMetrics);
    
    // Log results
    console.log('⏱️ Timing Budget Analysis:', {
      domContentLoaded: `${timingMetrics.domContentLoaded}ms / ${PERFORMANCE_BUDGETS.domContentLoaded}ms`,
      loadComplete: `${timingMetrics.loadComplete}ms / ${PERFORMANCE_BUDGETS.loadComplete}ms`,
      firstPaint: `${Math.round(timingMetrics.firstPaint)}ms / ${PERFORMANCE_BUDGETS.firstPaint}ms`,
      firstContentfulPaint: `${Math.round(timingMetrics.firstContentfulPaint)}ms / ${PERFORMANCE_BUDGETS.firstContentfulPaint}ms`
    });
  });
}

// Check timing budget violations
function checkTimingBudgets(metrics) {
  const checks = [
    { name: 'DOM Content Loaded', actual: metrics.domContentLoaded, budget: PERFORMANCE_BUDGETS.domContentLoaded },
    { name: 'Load Complete', actual: metrics.loadComplete, budget: PERFORMANCE_BUDGETS.loadComplete },
    { name: 'First Paint', actual: metrics.firstPaint, budget: PERFORMANCE_BUDGETS.firstPaint },
    { name: 'First Contentful Paint', actual: metrics.firstContentfulPaint, budget: PERFORMANCE_BUDGETS.firstContentfulPaint }
  ];
  
  checks.forEach(check => {
    if (check.actual > check.budget) {
      const violation = {
        type: 'timing_budget',
        name: check.name,
        actual: check.actual,
        budget: check.budget,
        overage: check.actual - check.budget,
        percentage: ((check.actual / check.budget - 1) * 100).toFixed(1),
        timestamp: Date.now()
      };
      
      budgetViolations.push(violation);
      
      console.warn(`⚠️ Timing Budget Violation: ${check.name}`, {
        actual: `${Math.round(check.actual)}ms`,
        budget: `${check.budget}ms`,
        overage: `+${Math.round(violation.overage)}ms`,
        percentage: `+${violation.percentage}%`
      });
      
      // Track in analytics if available
      if (window.gtag) {
        window.gtag('event', 'performance_budget_violation', {
          event_category: 'Performance',
          event_label: check.name,
          value: Math.round(violation.percentage),
          custom_parameters: {
            budget_type: 'timing',
            actual_time: check.actual,
            budget_time: check.budget
          }
        });
      }
    }
  });
}

// Monitor Core Web Vitals budgets
function monitorCoreWebVitalsBudgets() {
  // This integrates with the existing Core Web Vitals monitoring
  // We'll add budget checking to the existing trackWebVital function
  const originalTrackWebVital = window.trackWebVital;
  
  if (originalTrackWebVital) {
    window.trackWebVital = function(name, metric) {
      // Call original function
      originalTrackWebVital(name, metric);
      
      // Check against budgets
      let budget;
      switch (name) {
        case 'LCP':
          budget = PERFORMANCE_BUDGETS.largestContentfulPaint;
          break;
        case 'FID':
          budget = PERFORMANCE_BUDGETS.firstInputDelay;
          break;
        case 'CLS':
          budget = PERFORMANCE_BUDGETS.cumulativeLayoutShift;
          break;
        default:
          return; // No budget defined for this metric
      }
      
      if (metric.value > budget) {
        const violation = {
          type: 'core_web_vitals_budget',
          name: name,
          actual: metric.value,
          budget: budget,
          overage: metric.value - budget,
          percentage: ((metric.value / budget - 1) * 100).toFixed(1),
          rating: metric.rating,
          timestamp: Date.now()
        };
        
        budgetViolations.push(violation);
        
        console.warn(`⚠️ Core Web Vitals Budget Violation: ${name}`, {
          actual: metric.value.toFixed(2),
          budget: budget,
          overage: `+${violation.overage.toFixed(2)}`,
          percentage: `+${violation.percentage}%`,
          rating: metric.rating
        });
        
        // Track in analytics
        if (window.gtag) {
          window.gtag('event', 'performance_budget_violation', {
            event_category: 'Core Web Vitals',
            event_label: name,
            value: Math.round(violation.percentage),
            custom_parameters: {
              budget_type: 'core_web_vitals',
              actual_value: metric.value,
              budget_value: budget,
              metric_rating: metric.rating
            }
          });
        }
      }
    };
  }
}

// Generate performance budget report
function generateBudgetReport() {
  if (budgetViolations.length === 0) {
    console.log('✅ All performance budgets are within limits!');
    return;
  }
  
  console.log('\n📊 Performance Budget Violations Report');
  console.log('=======================================\n');
  
  // Group violations by type
  const violationsByType = budgetViolations.reduce((acc, violation) => {
    if (!acc[violation.type]) acc[violation.type] = [];
    acc[violation.type].push(violation);
    return acc;
  }, {});
  
  Object.entries(violationsByType).forEach(([type, violations]) => {
    console.log(`${type.replace(/_/g, ' ').toUpperCase()}:`);
    violations.forEach(violation => {
      console.log(`  ❌ ${violation.name}: +${violation.percentage}% over budget`);
      if (violation.type === 'resource_budget') {
        console.log(`     Actual: ${formatBytes(violation.actual)} | Budget: ${formatBytes(violation.budget)}`);
      } else {
        console.log(`     Actual: ${violation.actual.toFixed(2)} | Budget: ${violation.budget}`);
      }
    });
    console.log('');
  });
  
  // Store violations for debugging
  localStorage.setItem('performanceBudgetViolations', JSON.stringify(budgetViolations));
}

// Utility function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize performance budget monitoring
export function initializePerformanceBudgetMonitoring() {
  console.log('🎯 Initializing performance budget monitoring...');
  
  // Monitor different types of budgets
  monitorResourceBudgets();
  monitorTimingBudgets();
  monitorCoreWebVitalsBudgets();
  
  // Generate report after everything is loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      generateBudgetReport();
    }, 2000); // Wait 2 seconds for all metrics to be collected
  });
}

// Export for debugging
window.getBudgetViolations = () => budgetViolations;
window.generateBudgetReport = generateBudgetReport;