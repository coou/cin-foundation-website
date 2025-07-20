/**
 * Performance Dashboard
 * Real-time performance monitoring dashboard for debugging
 */

class PerformanceDashboard {
  constructor() {
    this.metrics = {};
    this.isVisible = false;
    this.updateInterval = null;
    this.dashboard = null;
    
    // Initialize dashboard if in development mode
    if (this.isDevelopmentMode()) {
      this.init();
    }
  }
  
  isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.search.includes('debug=true');
  }
  
  init() {
    // Create dashboard UI
    this.createDashboard();
    
    // Set up keyboard shortcut (Ctrl+Shift+P)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.toggle();
      }
    });
    
    // Start monitoring
    this.startMonitoring();
    
    console.log('🎛️ Performance Dashboard initialized. Press Ctrl+Shift+P to toggle.');
  }
  
  createDashboard() {
    // Create dashboard container
    this.dashboard = document.createElement('div');
    this.dashboard.id = 'performance-dashboard';
    this.dashboard.innerHTML = `
      <div class="dashboard-header">
        <h3>🎛️ Performance Dashboard</h3>
        <button class="dashboard-close" onclick="window.performanceDashboard.hide()">×</button>
      </div>
      <div class="dashboard-content">
        <div class="metrics-section">
          <h4>Core Web Vitals</h4>
          <div id="core-web-vitals"></div>
        </div>
        <div class="metrics-section">
          <h4>Resource Usage</h4>
          <div id="resource-usage"></div>
        </div>
        <div class="metrics-section">
          <h4>Performance Timing</h4>
          <div id="performance-timing"></div>
        </div>
        <div class="metrics-section">
          <h4>Budget Status</h4>
          <div id="budget-status"></div>
        </div>
        <div class="metrics-section">
          <h4>Recent Errors</h4>
          <div id="recent-errors"></div>
        </div>
      </div>
    `;
    
    // Add styles
    const styles = `
      #performance-dashboard {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 80vh;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        overflow: hidden;
        display: none;
        backdrop-filter: blur(10px);
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: rgba(59, 130, 246, 0.2);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .dashboard-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .dashboard-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
      
      .dashboard-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .dashboard-content {
        max-height: calc(80vh - 60px);
        overflow-y: auto;
        padding: 16px;
      }
      
      .metrics-section {
        margin-bottom: 20px;
      }
      
      .metrics-section h4 {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #60a5fa;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 4px;
      }
      
      .metric-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .metric-label {
        color: #d1d5db;
      }
      
      .metric-value {
        font-weight: 600;
      }
      
      .metric-good { color: #10b981; }
      .metric-warning { color: #f59e0b; }
      .metric-poor { color: #ef4444; }
      
      .error-item {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 8px;
        font-size: 11px;
      }
      
      .error-time {
        color: #9ca3af;
        font-size: 10px;
      }
    `;
    
    // Add styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Add dashboard to document
    document.body.appendChild(this.dashboard);
  }
  
  startMonitoring() {
    // Update dashboard every 2 seconds
    this.updateInterval = setInterval(() => {
      if (this.isVisible) {
        this.updateMetrics();
      }
    }, 2000);
    
    // Initial update
    setTimeout(() => this.updateMetrics(), 1000);
  }
  
  updateMetrics() {
    this.updateCoreWebVitals();
    this.updateResourceUsage();
    this.updatePerformanceTiming();
    this.updateBudgetStatus();
    this.updateRecentErrors();
  }
  
  updateCoreWebVitals() {
    const container = document.getElementById('core-web-vitals');
    if (!container) return;
    
    const vitals = JSON.parse(localStorage.getItem('webVitals') || '{}');
    
    let html = '';
    Object.entries(vitals).forEach(([metric, data]) => {
      const ratingClass = `metric-${data.rating === 'good' ? 'good' : data.rating === 'needs-improvement' ? 'warning' : 'poor'}`;
      const value = metric === 'CLS' ? data.value.toFixed(3) : Math.round(data.value);
      const unit = metric === 'CLS' ? '' : 'ms';
      
      html += `
        <div class="metric-item">
          <span class="metric-label">${metric}</span>
          <span class="metric-value ${ratingClass}">${value}${unit}</span>
        </div>
      `;
    });
    
    container.innerHTML = html || '<div class="metric-item"><span class="metric-label">No data yet</span></div>';
  }
  
  updateResourceUsage() {
    const container = document.getElementById('resource-usage');
    if (!container) return;
    
    let html = '';
    
    // Memory usage (if available)
    if (performance.memory) {
      const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
      const percentage = Math.round((used / total) * 100);
      
      html += `
        <div class="metric-item">
          <span class="metric-label">Memory</span>
          <span class="metric-value">${used}MB / ${total}MB (${percentage}%)</span>
        </div>
      `;
    }
    
    // Resource count
    const resources = performance.getEntriesByType('resource');
    html += `
      <div class="metric-item">
        <span class="metric-label">Resources</span>
        <span class="metric-value">${resources.length}</span>
      </div>
    `;
    
    // Connection info (if available)
    if (navigator.connection) {
      const conn = navigator.connection;
      html += `
        <div class="metric-item">
          <span class="metric-label">Connection</span>
          <span class="metric-value">${conn.effectiveType} (${conn.downlink}Mbps)</span>
        </div>
      `;
    }
    
    container.innerHTML = html;
  }
  
  updatePerformanceTiming() {
    const container = document.getElementById('performance-timing');
    if (!container) return;
    
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;
    
    const metrics = {
      'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
      'TCP Connect': navigation.connectEnd - navigation.connectStart,
      'Request/Response': navigation.responseEnd - navigation.requestStart,
      'DOM Processing': navigation.domContentLoadedEventEnd - navigation.responseEnd,
      'Load Complete': navigation.loadEventEnd - navigation.navigationStart
    };
    
    let html = '';
    Object.entries(metrics).forEach(([label, value]) => {
      const roundedValue = Math.round(value);
      const ratingClass = roundedValue > 1000 ? 'metric-poor' : roundedValue > 500 ? 'metric-warning' : 'metric-good';
      
      html += `
        <div class="metric-item">
          <span class="metric-label">${label}</span>
          <span class="metric-value ${ratingClass}">${roundedValue}ms</span>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  updateBudgetStatus() {
    const container = document.getElementById('budget-status');
    if (!container) return;
    
    const violations = window.getBudgetViolations ? window.getBudgetViolations() : [];
    
    if (violations.length === 0) {
      container.innerHTML = '<div class="metric-item"><span class="metric-label metric-good">All budgets OK</span></div>';
      return;
    }
    
    let html = '';
    violations.slice(-5).forEach(violation => {
      html += `
        <div class="metric-item">
          <span class="metric-label">${violation.name}</span>
          <span class="metric-value metric-poor">+${violation.percentage}%</span>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  updateRecentErrors() {
    const container = document.getElementById('recent-errors');
    if (!container) return;
    
    const errors = JSON.parse(localStorage.getItem('jsErrors') || '[]');
    
    if (errors.length === 0) {
      container.innerHTML = '<div class="metric-item"><span class="metric-label metric-good">No recent errors</span></div>';
      return;
    }
    
    let html = '';
    errors.slice(-3).forEach(error => {
      const time = new Date(error.timestamp).toLocaleTimeString();
      html += `
        <div class="error-item">
          <div>${error.message}</div>
          <div class="error-time">${time} - ${error.filename}:${error.lineno}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  show() {
    this.dashboard.style.display = 'block';
    this.isVisible = true;
    this.updateMetrics();
  }
  
  hide() {
    this.dashboard.style.display = 'none';
    this.isVisible = false;
  }
  
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.dashboard) {
      this.dashboard.remove();
    }
  }
}

// Initialize dashboard
const performanceDashboard = new PerformanceDashboard();

// Export for global access
window.performanceDashboard = performanceDashboard;

export { PerformanceDashboard };