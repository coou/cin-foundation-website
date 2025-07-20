/**
 * Core Web Vitals Monitoring
 * Comprehensive monitoring of LCP, FID, CLS, FCP, and TTFB metrics
 */

class CoreWebVitalsMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };
    
    this.initializeMonitoring();
  }
  
  async initializeMonitoring() {
    try {
      // Import web-vitals library
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('https://unpkg.com/web-vitals@3/dist/web-vitals.js');
      
      // Monitor Largest Contentful Paint (LCP)
      getLCP((metric) => {
        this.handleMetric('LCP', metric);
      });
      
      // Monitor First Input Delay (FID)
      getFID((metric) => {
        this.handleMetric('FID', metric);
      });
      
      // Monitor Cumulative Layout Shift (CLS)
      getCLS((metric) => {
        this.handleMetric('CLS', metric);
      });
      
      // Monitor First Contentful Paint (FCP)
      getFCP((metric) => {
        this.handleMetric('FCP', metric);
      });
      
      // Monitor Time to First Byte (TTFB)
      getTTFB((metric) => {
        this.handleMetric('TTFB', metric);
      });
      
      console.log('✅ Core Web Vitals monitoring initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Core Web Vitals monitoring:', error);
    }
  }
  
  handleMetric(name, metric) {
    // Store the metric
    this.metrics[name] = {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now(),
      url: window.location.href
    };
    
    // Determine performance rating
    const rating = this.getRating(name, metric.value);
    
    // Log to console
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} ${name}: ${this.formatValue(name, metric.value)} (${rating})`);
    
    // Send to analytics
    this.sendToAnalytics(name, metric, rating);
    
    // Store in localStorage for debugging
    this.storeMetric(name, metric, rating);
    
    // Check if metric exceeds thresholds
    if (rating === 'poor') {
      this.handlePoorMetric(name, metric);
    }
    
    // Trigger custom events for other parts of the application
    this.dispatchMetricEvent(name, metric, rating);
  }
  
  getRating(metricName, value) {
    const threshold = this.thresholds[metricName];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
  
  formatValue(metricName, value) {
    switch (metricName) {
      case 'CLS':
        return value.toFixed(3);
      case 'LCP':
      case 'FID':
      case 'FCP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  }
  
  sendToAnalytics(name, metric, rating) {
    // Send to Google Analytics 4
    if (window.gtag) {
      window.gtag('event', 'web_vital', {
        metric_name: name,
        metric_value: Math.round(metric.value),
        metric_rating: rating,
        metric_delta: Math.round(metric.delta || 0),
        custom_parameters: {
          metric_id: metric.id,
          page_url: window.location.href
        }
      });
    }
    
    // Send to Firebase Analytics if available
    if (window.analytics && window.logEvent) {
      window.logEvent(window.analytics, 'core_web_vital', {
        metric_name: name,
        metric_value: Math.round(metric.value),
        metric_rating: rating,
        metric_delta: Math.round(metric.delta || 0)
      });
    }
  }
  
  storeMetric(name, metric, rating) {
    const storedMetrics = JSON.parse(localStorage.getItem('cin_web_vitals') || '{}');
    
    if (!storedMetrics[name]) {
      storedMetrics[name] = [];
    }
    
    storedMetrics[name].push({
      value: metric.value,
      rating: rating,
      timestamp: Date.now(),
      url: window.location.href,
      id: metric.id
    });
    
    // Keep only last 10 measurements per metric
    if (storedMetrics[name].length > 10) {
      storedMetrics[name] = storedMetrics[name].slice(-10);
    }
    
    localStorage.setItem('cin_web_vitals', JSON.stringify(storedMetrics));
  }
  
  handlePoorMetric(name, metric) {
    console.warn(`🚨 Poor ${name} detected:`, {
      value: this.formatValue(name, metric.value),
      threshold: this.formatValue(name, this.thresholds[name].poor),
      suggestions: this.getOptimizationSuggestions(name)
    });
    
    // Report to error tracking
    if (window.ErrorTracker) {
      window.ErrorTracker.reportWarning(`Poor ${name} performance`, {
        metric: name,
        value: metric.value,
        threshold: this.thresholds[name].poor,
        url: window.location.href
      });
    }
  }
  
  getOptimizationSuggestions(metricName) {
    const suggestions = {
      LCP: [
        'Optimize images and use modern formats (WebP, AVIF)',
        'Implement lazy loading for non-critical images',
        'Minimize render-blocking resources',
        'Use a CDN for faster content delivery',
        'Optimize server response times'
      ],
      FID: [
        'Minimize JavaScript execution time',
        'Break up long tasks into smaller chunks',
        'Use web workers for heavy computations',
        'Defer non-critical JavaScript',
        'Optimize third-party scripts'
      ],
      CLS: [
        'Set explicit dimensions for images and videos',
        'Reserve space for dynamic content',
        'Avoid inserting content above existing content',
        'Use transform animations instead of layout changes',
        'Preload fonts to prevent layout shifts'
      ],
      FCP: [
        'Minimize render-blocking resources',
        'Optimize critical rendering path',
        'Use resource hints (preload, prefetch)',
        'Minimize CSS and JavaScript',
        'Optimize web fonts loading'
      ],
      TTFB: [
        'Optimize server response times',
        'Use a CDN',
        'Implement server-side caching',
        'Optimize database queries',
        'Use HTTP/2 or HTTP/3'
      ]
    };
    
    return suggestions[metricName] || [];
  }
  
  dispatchMetricEvent(name, metric, rating) {
    const event = new CustomEvent('webVitalMeasured', {
      detail: {
        name,
        value: metric.value,
        rating,
        delta: metric.delta,
        id: metric.id
      }
    });
    
    window.dispatchEvent(event);
  }
  
  // Public methods for accessing metrics
  getMetrics() {
    return this.metrics;
  }
  
  getStoredMetrics() {
    return JSON.parse(localStorage.getItem('cin_web_vitals') || '{}');
  }
  
  getMetricSummary() {
    const stored = this.getStoredMetrics();
    const summary = {};
    
    Object.keys(stored).forEach(metricName => {
      const measurements = stored[metricName];
      if (measurements.length > 0) {
        const latest = measurements[measurements.length - 1];
        const average = measurements.reduce((sum, m) => sum + m.value, 0) / measurements.length;
        
        summary[metricName] = {
          latest: {
            value: latest.value,
            rating: latest.rating,
            formatted: this.formatValue(metricName, latest.value)
          },
          average: {
            value: average,
            rating: this.getRating(metricName, average),
            formatted: this.formatValue(metricName, average)
          },
          measurements: measurements.length
        };
      }
    });
    
    return summary;
  }
  
  exportMetrics() {
    const data = {
      current: this.metrics,
      stored: this.getStoredMetrics(),
      summary: this.getMetricSummary(),
      thresholds: this.thresholds,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cin-web-vitals-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  clearMetrics() {
    this.metrics = {};
    localStorage.removeItem('cin_web_vitals');
    console.log('Web Vitals metrics cleared');
  }
}

// Initialize Core Web Vitals monitoring
const webVitalsMonitor = new CoreWebVitalsMonitor();

// Export for global access
window.WebVitalsMonitor = webVitalsMonitor;

// Add debug utilities
if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
  window.cinWebVitals = {
    getMetrics: () => webVitalsMonitor.getMetrics(),
    getStoredMetrics: () => webVitalsMonitor.getStoredMetrics(),
    getSummary: () => webVitalsMonitor.getMetricSummary(),
    exportMetrics: () => webVitalsMonitor.exportMetrics(),
    clearMetrics: () => webVitalsMonitor.clearMetrics()
  };
  
  console.log('🔧 Web Vitals debug utilities available via window.cinWebVitals');
}

export default webVitalsMonitor;