/**
 * Analytics and Performance Monitoring
 * Handles Firebase Analytics, Core Web Vitals, and error tracking
 */

// Firebase Analytics configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvOkuAiS1HiMXxrT0k-4R5w6XPML4b8g0",
  authDomain: "cin-foundation.firebaseapp.com",
  projectId: "cin-foundation",
  storageBucket: "cin-foundation.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789",
  measurementId: "G-CIN4FOUNDATION"
};

// Initialize Firebase Analytics
let analytics = null;

async function initializeFirebaseAnalytics() {
  try {
    // Only load Firebase Analytics in production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Analytics disabled in development environment');
      return;
    }

    // Dynamically import Firebase Analytics
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAnalytics, logEvent } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js');
    
    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    
    console.log('Firebase Analytics initialized');
    
    // Track initial page view
    logEvent(analytics, 'page_view', {
      page_title: document.title,
      page_location: window.location.href
    });
    
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
  }
}

// Core Web Vitals monitoring
async function initializeCoreWebVitals() {
  try {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('https://unpkg.com/web-vitals@3/dist/web-vitals.js');
    
    // Largest Contentful Paint (LCP)
    getLCP((metric) => {
      console.log('LCP:', metric);
      trackWebVital('LCP', metric);
    });
    
    // First Input Delay (FID)
    getFID((metric) => {
      console.log('FID:', metric);
      trackWebVital('FID', metric);
    });
    
    // Cumulative Layout Shift (CLS)
    getCLS((metric) => {
      console.log('CLS:', metric);
      trackWebVital('CLS', metric);
    });
    
    // First Contentful Paint (FCP)
    getFCP((metric) => {
      console.log('FCP:', metric);
      trackWebVital('FCP', metric);
    });
    
    // Time to First Byte (TTFB)
    getTTFB((metric) => {
      console.log('TTFB:', metric);
      trackWebVital('TTFB', metric);
    });
    
  } catch (error) {
    console.error('Failed to initialize Core Web Vitals:', error);
  }
}

// Track Web Vitals metrics
function trackWebVital(name, metric) {
  // Send to Firebase Analytics if available
  if (analytics) {
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js')
      .then(({ logEvent }) => {
        // Track as custom event with detailed metrics
        logEvent(analytics, 'web_vital', {
          metric_name: name,
          metric_value: Math.round(metric.value),
          metric_rating: metric.rating,
          metric_delta: Math.round(metric.delta),
          metric_id: metric.id,
          page_url: window.location.pathname
        });
        
        // Also send to Google Analytics 4 as a custom metric
        if (window.gtag) {
          window.gtag('event', name, {
            value: Math.round(metric.value),
            metric_rating: metric.rating,
            custom_parameter_1: name,
            custom_parameter_2: metric.rating
          });
        }
      })
      .catch(console.error);
  }
  
  // Send to gtag directly if available (fallback)
  if (window.gtag && !analytics) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(metric.value),
      custom_map: {
        metric_1: name === 'LCP' ? metric.value : undefined,
        metric_2: name === 'FID' ? metric.value : undefined,
        metric_3: name === 'CLS' ? metric.value : undefined
      }
    });
  }
  
  // Enhanced console logging with performance context
  const rating = metric.rating;
  const ratingIcon = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
  console.log(`${ratingIcon} ${name}: ${metric.value.toFixed(2)} (${rating})`);
  
  // Store in localStorage with enhanced data for debugging
  const vitals = JSON.parse(localStorage.getItem('webVitals') || '{}');
  vitals[name] = {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent.substring(0, 100) // Truncated for storage
  };
  localStorage.setItem('webVitals', JSON.stringify(vitals));
  
  // Check if we should alert on poor performance
  if (rating === 'poor') {
    console.warn(`⚠️ Poor ${name} performance detected:`, {
      value: metric.value,
      threshold: getThresholdForMetric(name),
      recommendations: getRecommendationsForMetric(name)
    });
  }
}

// Helper function to get performance thresholds
function getThresholdForMetric(metricName) {
  const thresholds = {
    'LCP': { good: 2500, poor: 4000 },
    'FID': { good: 100, poor: 300 },
    'CLS': { good: 0.1, poor: 0.25 },
    'FCP': { good: 1800, poor: 3000 },
    'TTFB': { good: 800, poor: 1800 }
  };
  return thresholds[metricName] || { good: 0, poor: 0 };
}

// Helper function to get recommendations for poor metrics
function getRecommendationsForMetric(metricName) {
  const recommendations = {
    'LCP': [
      'Optimize images and use modern formats (WebP, AVIF)',
      'Reduce server response times',
      'Remove render-blocking JavaScript and CSS',
      'Use a CDN for faster content delivery'
    ],
    'FID': [
      'Minimize JavaScript execution time',
      'Remove unused JavaScript',
      'Use code splitting and lazy loading',
      'Optimize third-party scripts'
    ],
    'CLS': [
      'Set explicit dimensions for images and videos',
      'Reserve space for ads and embeds',
      'Avoid inserting content above existing content',
      'Use CSS transform instead of changing layout properties'
    ],
    'FCP': [
      'Eliminate render-blocking resources',
      'Minify CSS and JavaScript',
      'Remove unused CSS',
      'Optimize web fonts'
    ],
    'TTFB': [
      'Optimize server performance',
      'Use a CDN',
      'Enable compression',
      'Optimize database queries'
    ]
  };
  return recommendations[metricName] || [];
}

// Error tracking and logging
function initializeErrorTracking() {
  // Global error handler
  window.addEventListener('error', (event) => {
    const errorInfo = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('JavaScript Error:', errorInfo);
    
    // Track error in Firebase Analytics
    if (analytics) {
      import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js')
        .then(({ logEvent }) => {
          logEvent(analytics, 'exception', {
            description: errorInfo.message,
            fatal: false,
            custom_parameters: {
              filename: errorInfo.filename,
              line: errorInfo.lineno,
              column: errorInfo.colno
            }
          });
        })
        .catch(console.error);
    }
    
    // Store error for debugging
    const errors = JSON.parse(localStorage.getItem('jsErrors') || '[]');
    errors.push(errorInfo);
    // Keep only last 10 errors
    if (errors.length > 10) {
      errors.shift();
    }
    localStorage.setItem('jsErrors', JSON.stringify(errors));
  });
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = {
      reason: event.reason?.toString() || 'Unknown promise rejection',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Unhandled Promise Rejection:', errorInfo);
    
    // Track in Firebase Analytics
    if (analytics) {
      import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js')
        .then(({ logEvent }) => {
          logEvent(analytics, 'exception', {
            description: `Promise Rejection: ${errorInfo.reason}`,
            fatal: false
          });
        })
        .catch(console.error);
    }
  });
}

// Track user interactions
function trackUserInteraction(action, element, additionalData = {}) {
  if (analytics) {
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js')
      .then(({ logEvent }) => {
        logEvent(analytics, 'user_interaction', {
          action: action,
          element_id: element?.id || 'unknown',
          element_class: element?.className || 'unknown',
          ...additionalData
        });
      })
      .catch(console.error);
  }
  
  console.log('User Interaction:', { action, element: element?.tagName, ...additionalData });
}

// Track section visibility (scroll tracking)
function initializeScrollTracking() {
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -20% 0px'
  };
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        trackUserInteraction('section_view', entry.target, {
          section_id: sectionId,
          section_name: sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
        });
      }
    });
  }, observerOptions);
  
  sections.forEach(section => {
    sectionObserver.observe(section);
  });
}

// Track CTA button clicks
function initializeCTATracking() {
  // Track primary CTA clicks
  const primaryCTAs = document.querySelectorAll('.primary-cta, .secondary-cta');
  primaryCTAs.forEach(cta => {
    cta.addEventListener('click', (event) => {
      const ctaText = event.target.textContent.trim();
      const ctaHref = event.target.getAttribute('href');
      
      trackUserInteraction('cta_click', event.target, {
        cta_text: ctaText,
        cta_destination: ctaHref,
        cta_type: event.target.classList.contains('primary-cta') ? 'primary' : 'secondary'
      });
    });
  });
  
  // Track navigation clicks
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const linkText = event.target.textContent.trim();
      const linkHref = event.target.getAttribute('href');
      
      trackUserInteraction('navigation_click', event.target, {
        nav_text: linkText,
        nav_destination: linkHref
      });
    });
  });
  
  // Track external links
  const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="mailto:"]');
  externalLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const linkHref = event.target.getAttribute('href');
      const linkText = event.target.textContent.trim();
      
      trackUserInteraction('external_link_click', event.target, {
        link_url: linkHref,
        link_text: linkText,
        link_type: linkHref.startsWith('mailto:') ? 'email' : 'external'
      });
    });
  });
}

// Performance monitoring utilities
function getPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  
  const metrics = {
    // Navigation timing
    dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp_connect: navigation.connectEnd - navigation.connectStart,
    request_response: navigation.responseEnd - navigation.requestStart,
    dom_processing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
    load_complete: navigation.loadEventEnd - navigation.navigationStart,
    
    // Paint timing
    first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    
    // Resource timing
    total_resources: performance.getEntriesByType('resource').length,
    
    // Memory usage (if available)
    memory_used: performance.memory?.usedJSHeapSize || 0,
    memory_total: performance.memory?.totalJSHeapSize || 0
  };
  
  return metrics;
}

// Initialize all analytics and monitoring
export function initializeAnalytics() {
  console.log('Initializing analytics and performance monitoring...');
  
  // Initialize Firebase Analytics
  initializeFirebaseAnalytics();
  
  // Initialize Core Web Vitals monitoring
  initializeCoreWebVitals();
  
  // Initialize error tracking
  initializeErrorTracking();
  
  // Initialize user interaction tracking
  initializeScrollTracking();
  initializeCTATracking();
  
  // Log initial performance metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPerformanceMetrics();
      console.log('Performance Metrics:', metrics);
      
      // Track performance metrics in analytics
      if (analytics) {
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js')
          .then(({ logEvent }) => {
            logEvent(analytics, 'performance_metrics', {
              dns_lookup_time: Math.round(metrics.dns_lookup),
              tcp_connect_time: Math.round(metrics.tcp_connect),
              request_response_time: Math.round(metrics.request_response),
              dom_processing_time: Math.round(metrics.dom_processing),
              total_load_time: Math.round(metrics.load_complete),
              total_resources: metrics.total_resources
            });
          })
          .catch(console.error);
      }
    }, 1000);
  });
}

// Export for debugging
window.getPerformanceMetrics = getPerformanceMetrics;
window.trackUserInteraction = trackUserInteraction;