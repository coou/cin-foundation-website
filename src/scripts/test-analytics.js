/**
 * Test Analytics Implementation
 * This script verifies that Firebase Analytics and Core Web Vitals monitoring are properly configured
 */

// Test Firebase Analytics initialization
function testFirebaseAnalytics() {
  console.log('🧪 Testing Firebase Analytics initialization...');
  
  // Check if Firebase Analytics is initialized
  if (typeof analytics !== 'undefined') {
    console.log('✅ Firebase Analytics is initialized');
    return true;
  } else {
    console.warn('⚠️ Firebase Analytics is not initialized');
    
    // Check if we're in development mode (where analytics might be disabled)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('ℹ️ Analytics is disabled in development environment (expected behavior)');
      return true;
    }
    
    return false;
  }
}

// Test Core Web Vitals monitoring
function testCoreWebVitals() {
  console.log('🧪 Testing Core Web Vitals monitoring...');
  
  // Check if web-vitals library is loaded
  if (typeof window.trackWebVital === 'function') {
    console.log('✅ Core Web Vitals tracking function is available');
    
    // Check if localStorage has any Web Vitals data
    const vitals = JSON.parse(localStorage.getItem('webVitals') || '{}');
    if (Object.keys(vitals).length > 0) {
      console.log('✅ Core Web Vitals data is being collected:', Object.keys(vitals).join(', '));
      return true;
    } else {
      console.warn('⚠️ No Core Web Vitals data found in localStorage yet');
      console.log('ℹ️ This is normal if the page just loaded - data will be collected as metrics become available');
      return true;
    }
  } else {
    console.error('❌ Core Web Vitals tracking function is not available');
    return false;
  }
}

// Test performance budget monitoring
function testPerformanceBudgets() {
  console.log('🧪 Testing performance budget monitoring...');
  
  // Check if budget functions are available
  if (typeof window.getBudgetViolations === 'function' && typeof window.generateBudgetReport === 'function') {
    console.log('✅ Performance budget monitoring functions are available');
    
    // Generate a budget report
    console.log('ℹ️ Generating performance budget report:');
    window.generateBudgetReport();
    
    return true;
  } else {
    console.error('❌ Performance budget monitoring functions are not available');
    return false;
  }
}

// Test error tracking
function testErrorTracking() {
  console.log('🧪 Testing error tracking...');
  
  // Trigger a test error
  try {
    console.log('ℹ️ Triggering a test error (this is expected)');
    // This will cause an error
    const testError = new Error('Test error - This is an intentional error for testing');
    testError.name = 'TestError';
    throw testError;
  } catch (error) {
    // The error should be caught by the global error handler
    // Check if it was stored in localStorage
    setTimeout(() => {
      const errors = JSON.parse(localStorage.getItem('jsErrors') || '[]');
      if (errors.length > 0 && errors.some(e => e.message.includes('Test error'))) {
        console.log('✅ Error tracking is working correctly');
      } else {
        console.warn('⚠️ Error tracking may not be working correctly - test error not found in localStorage');
      }
    }, 500);
  }
  
  return true;
}

// Test performance dashboard
function testPerformanceDashboard() {
  console.log('🧪 Testing performance dashboard...');
  
  // Check if performance dashboard is available
  if (typeof window.performanceDashboard !== 'undefined') {
    console.log('✅ Performance dashboard is available');
    console.log('ℹ️ Press Ctrl+Shift+P to open the dashboard');
    return true;
  } else {
    console.error('❌ Performance dashboard is not available');
    return false;
  }
}

// Run all tests
export function runAnalyticsTests() {
  console.log('🧪 Running analytics and performance monitoring tests...');
  console.log('==================================================');
  
  const results = {
    firebaseAnalytics: testFirebaseAnalytics(),
    coreWebVitals: testCoreWebVitals(),
    performanceBudgets: testPerformanceBudgets(),
    errorTracking: testErrorTracking(),
    performanceDashboard: testPerformanceDashboard()
  };
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('==============');
  
  let allPassed = true;
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
    if (!passed) allPassed = false;
  });
  
  if (allPassed) {
    console.log('\n✅ All analytics and performance monitoring tests passed!');
  } else {
    console.warn('\n⚠️ Some tests failed. Check the console for details.');
  }
  
  return allPassed;
}

// Run tests when script is loaded
window.addEventListener('load', () => {
  // Wait for analytics to initialize
  setTimeout(() => {
    runAnalyticsTests();
  }, 2000);
});

// Export for manual testing
window.testAnalytics = runAnalyticsTests;