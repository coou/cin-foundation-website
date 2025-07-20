/**
 * Enhanced Error Tracking and Debugging System
 * Provides comprehensive error logging, reporting, and debugging utilities
 */

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
    this.debugMode = this.isDebugMode();
    this.sessionId = this.generateSessionId();
    
    this.initializeErrorHandlers();
    this.initializePerformanceMonitoring();
    this.initializeConsoleInterception();
  }
  
  isDebugMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.search.includes('debug=true') ||
           localStorage.getItem('cin_debug') === 'true';
  }
  
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  initializeErrorHandlers() {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'promise_rejection',
        message: event.reason?.toString() || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId
      });
    });
    
    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.logError({
          type: 'resource_error',
          message: `Failed to load resource: ${event.target.src || event.target.href}`,
          element: event.target.tagName,
          source: event.target.src || event.target.href,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          sessionId: this.sessionId
        });
      }
    }, true);
  }
  
  initializeConsoleInterception() {
    if (!this.debugMode) return;
    
    // Store original console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };
    
    // Intercept console methods for enhanced logging
    console.log = (...args) => {
      originalConsole.log(...args);
      this.logConsoleMessage('log', args);
    };
    
    console.warn = (...args) => {
      originalConsole.warn(...args);
      this.logConsoleMessage('warn', args);
    };
    
    console.error = (...args) => {
      originalConsole.error(...args);
      this.logConsoleMessage('error', args);
    };
    
    console.info = (...args) => {
      originalConsole.info(...args);
      this.logConsoleMessage('info', args);
    };
  }
  
  logConsoleMessage(level, args) {
    if (!this.debugMode) return;
    
    const message = {
      type: 'console_message',
      level: level,
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      sessionId: this.sessionId
    };
    
    // Store console messages for debugging
    const consoleLogs = JSON.parse(localStorage.getItem('cin_console_logs') || '[]');
    consoleLogs.push(message);
    
    // Keep only last 100 console messages
    if (consoleLogs.length > 100) {
      consoleLogs.shift();
    }
    
    localStorage.setItem('cin_console_logs', JSON.stringify(consoleLogs));
  }
  
  initializePerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.logError({
                type: 'performance_warning',
                message: `Long task detected: ${entry.duration}ms`,
                duration: entry.duration,
                startTime: entry.startTime,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                sessionId: this.sessionId
              });
            }
          });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported:', e);
      }
      
      // Monitor layout shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.value > 0.1) { // CLS threshold
              this.logError({
                type: 'layout_shift_warning',
                message: `Significant layout shift detected: ${entry.value}`,
                value: entry.value,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                sessionId: this.sessionId
              });
            }
          });
        });
        
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout shift observer not supported:', e);
      }
    }
  }
  
  logError(errorInfo) {
    // Add to internal error log
    this.errors.push(errorInfo);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    // Store in localStorage for persistence
    const storedErrors = JSON.parse(localStorage.getItem('cin_errors') || '[]');
    storedErrors.push(errorInfo);
    
    if (storedErrors.length > this.maxErrors) {
      storedErrors.shift();
    }
    
    localStorage.setItem('cin_errors', JSON.stringify(storedErrors));
    
    // Log to console in debug mode
    if (this.debugMode) {
      console.group(`🚨 ${errorInfo.type.toUpperCase()}`);
      console.error('Message:', errorInfo.message);
      console.error('Details:', errorInfo);
      if (errorInfo.stack) {
        console.error('Stack:', errorInfo.stack);
      }
      console.groupEnd();
    }
    
    // Send to analytics if available
    this.sendToAnalytics(errorInfo);
    
    // Send to external error tracking service if configured
    this.sendToExternalService(errorInfo);
  }
  
  sendToAnalytics(errorInfo) {
    // Send to Firebase Analytics if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: errorInfo.message,
        fatal: errorInfo.type === 'javascript_error',
        custom_parameters: {
          error_type: errorInfo.type,
          filename: errorInfo.filename,
          line_number: errorInfo.lineno,
          session_id: errorInfo.sessionId
        }
      });
    }
  }
  
  sendToExternalService(errorInfo) {
    // Placeholder for external error tracking services like Sentry
    // This would be configured based on the chosen service
    if (this.debugMode) {
      console.log('Would send to external error tracking:', errorInfo);
    }
  }
  
  // Public methods for manual error reporting
  reportError(message, details = {}) {
    this.logError({
      type: 'manual_error',
      message: message,
      details: details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId
    });
  }
  
  reportWarning(message, details = {}) {
    this.logError({
      type: 'manual_warning',
      message: message,
      details: details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId
    });
  }
  
  // Debug utilities
  getErrors() {
    return this.errors;
  }
  
  getStoredErrors() {
    return JSON.parse(localStorage.getItem('cin_errors') || '[]');
  }
  
  getConsoleLogs() {
    return JSON.parse(localStorage.getItem('cin_console_logs') || '[]');
  }
  
  clearErrors() {
    this.errors = [];
    localStorage.removeItem('cin_errors');
    localStorage.removeItem('cin_console_logs');
    console.log('Error logs cleared');
  }
  
  exportErrorReport() {
    const report = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errors: this.getStoredErrors(),
      consoleLogs: this.getConsoleLogs(),
      performance: this.getPerformanceSnapshot()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cin-error-report-${this.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  getPerformanceSnapshot() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      navigation: {
        loadComplete: navigation?.loadEventEnd - navigation?.navigationStart || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart || 0,
        firstByte: navigation?.responseStart - navigation?.navigationStart || 0
      },
      paint: {
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      },
      memory: {
        used: performance.memory?.usedJSHeapSize || 0,
        total: performance.memory?.totalJSHeapSize || 0,
        limit: performance.memory?.jsHeapSizeLimit || 0
      }
    };
  }
}

// Initialize error tracker
const errorTracker = new ErrorTracker();

// Export for global access
window.ErrorTracker = errorTracker;

// Debug utilities for development
if (errorTracker.debugMode) {
  window.cinDebug = {
    getErrors: () => errorTracker.getErrors(),
    getStoredErrors: () => errorTracker.getStoredErrors(),
    getConsoleLogs: () => errorTracker.getConsoleLogs(),
    clearErrors: () => errorTracker.clearErrors(),
    exportReport: () => errorTracker.exportErrorReport(),
    reportError: (msg, details) => errorTracker.reportError(msg, details),
    reportWarning: (msg, details) => errorTracker.reportWarning(msg, details)
  };
  
  console.log('🔧 CIN Debug utilities available via window.cinDebug');
  console.log('Available methods:', Object.keys(window.cinDebug));
}

export default errorTracker;