/**
 * Debug Utilities for Performance and Error Monitoring
 * Provides debugging tools and performance insights
 */

// Debug panel HTML template
const DEBUG_PANEL_HTML = `
  <div id="debug-panel" style="
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    max-height: 400px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    z-index: 10000;
    overflow-y: auto;
    display: none;
  ">
    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
      <h3 style="margin: 0; color: #4ade80;">Debug Panel</h3>
      <button id="debug-close" style="
        background: #ef4444;
        color: white;
        border: none;
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
      ">×</button>
    </div>
    <div id="debug-content"></div>
  </div>
`;

// Debug toggle button
const DEBUG_TOGGLE_HTML = `
  <button id="debug-toggle" style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1e40af;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 50px;
    cursor: pointer;
    font-size: 12px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: none;
  " title="Toggle Debug Panel">
    🐛 Debug
  </button>
`;

class DebugUtils {
  constructor() {
    this.isEnabled = false;
    this.panel = null;
    this.toggle = null;
    this.refreshInterval = null;
    
    this.init();
  }
  
  init() {
    // Only enable in development or when debug parameter is present
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const hasDebugParam = new URLSearchParams(window.location.search).has('debug');
    
    if (isDev || hasDebugParam) {
      this.isEnabled = true;
      this.createDebugInterface();
      this.setupEventListeners();
    }
  }
  
  createDebugInterface() {
    // Add debug panel
    document.body.insertAdjacentHTML('beforeend', DEBUG_PANEL_HTML);
    document.body.insertAdjacentHTML('beforeend', DEBUG_TOGGLE_HTML);
    
    this.panel = document.getElementById('debug-panel');
    this.toggle = document.getElementById('debug-toggle');
    
    if (this.isEnabled) {
      this.toggle.style.display = 'block';
    }
  }
  
  setupEventListeners() {
    // Toggle panel visibility
    this.toggle?.addEventListener('click', () => {
      const isVisible = this.panel.style.display !== 'none';
      this.panel.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        this.updateDebugInfo();
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    });
    
    // Close panel
    document.getElementById('debug-close')?.addEventListener('click', () => {
      this.panel.style.display = 'none';
      this.stopAutoRefresh();
    });
    
    // Keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle?.click();
      }
    });
  }
  
  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.updateDebugInfo();
    }, 2000);
  }
  
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
  
  updateDebugInfo() {
    if (!this.panel) return;
    
    const content = document.getElementById('debug-content');
    if (!content) return;
    
    const info = this.gatherDebugInfo();
    content.innerHTML = this.formatDebugInfo(info);
  }
  
  gatherDebugInfo() {
    const info = {
      timestamp: new Date().toLocaleTimeString(),
      performance: this.getPerformanceInfo(),
      webVitals: this.getWebVitalsInfo(),
      errors: this.getErrorInfo(),
      network: this.getNetworkInfo(),
      memory: this.getMemoryInfo(),
      viewport: this.getViewportInfo()
    };
    
    return info;
  }
  
  getPerformanceInfo() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      loadTime: Math.round(navigation?.loadEventEnd - navigation?.navigationStart) || 0,
      domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd - navigation?.navigationStart) || 0,
      firstPaint: Math.round(paint.find(p => p.name === 'first-paint')?.startTime) || 0,
      firstContentfulPaint: Math.round(paint.find(p => p.name === 'first-contentful-paint')?.startTime) || 0,
      resourceCount: performance.getEntriesByType('resource').length
    };
  }
  
  getWebVitalsInfo() {
    const vitals = JSON.parse(localStorage.getItem('webVitals') || '{}');
    return {
      lcp: vitals.LCP ? `${Math.round(vitals.LCP.value)}ms (${vitals.LCP.rating})` : 'Not measured',
      fid: vitals.FID ? `${Math.round(vitals.FID.value)}ms (${vitals.FID.rating})` : 'Not measured',
      cls: vitals.CLS ? `${vitals.CLS.value.toFixed(3)} (${vitals.CLS.rating})` : 'Not measured',
      fcp: vitals.FCP ? `${Math.round(vitals.FCP.value)}ms (${vitals.FCP.rating})` : 'Not measured'
    };
  }
  
  getErrorInfo() {
    const errors = JSON.parse(localStorage.getItem('jsErrors') || '[]');
    return {
      count: errors.length,
      recent: errors.slice(-3).map(error => ({
        message: error.message.substring(0, 50) + '...',
        time: new Date(error.timestamp).toLocaleTimeString()
      }))
    };
  }
  
  getNetworkInfo() {
    return {
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink + ' Mbps',
        rtt: navigator.connection.rtt + 'ms'
      } : 'Not available',
      online: navigator.onLine
    };
  }
  
  getMemoryInfo() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
      };
    }
    return 'Not available';
  }
  
  getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      orientation: screen.orientation?.type || 'unknown'
    };
  }
  
  formatDebugInfo(info) {
    return `
      <div style="margin-bottom: 10px;">
        <strong style="color: #60a5fa;">⏰ ${info.timestamp}</strong>
      </div>
      
      <div style="margin-bottom: 8px;">
        <strong style="color: #34d399;">🚀 Performance</strong><br>
        Load: ${info.performance.loadTime}ms<br>
        DOMContentLoaded: ${info.performance.domContentLoaded}ms<br>
        First Paint: ${info.performance.firstPaint}ms<br>
        FCP: ${info.performance.firstContentfulPaint}ms<br>
        Resources: ${info.performance.resourceCount}
      </div>
      
      <div style="margin-bottom: 8px;">
        <strong style="color: #fbbf24;">📊 Core Web Vitals</strong><br>
        LCP: ${info.webVitals.lcp}<br>
        FID: ${info.webVitals.fid}<br>
        CLS: ${info.webVitals.cls}<br>
        FCP: ${info.webVitals.fcp}
      </div>
      
      <div style="margin-bottom: 8px;">
        <strong style="color: #f87171;">🐛 Errors (${info.errors.count})</strong><br>
        ${info.errors.recent.map(error => 
          `${error.time}: ${error.message}`
        ).join('<br>') || 'No recent errors'}
      </div>
      
      <div style="margin-bottom: 8px;">
        <strong style="color: #a78bfa;">🌐 Network</strong><br>
        Online: ${info.network.online ? '✅' : '❌'}<br>
        ${typeof info.network.connection === 'object' ? 
          `Type: ${info.network.connection.effectiveType}<br>Speed: ${info.network.connection.downlink}<br>RTT: ${info.network.connection.rtt}` :
          'Connection info not available'
        }
      </div>
      
      <div style="margin-bottom: 8px;">
        <strong style="color: #fb7185;">💾 Memory</strong><br>
        ${typeof info.memory === 'object' ? 
          `Used: ${info.memory.used}<br>Total: ${info.memory.total}<br>Limit: ${info.memory.limit}` :
          'Memory info not available'
        }
      </div>
      
      <div>
        <strong style="color: #06d6a0;">📱 Viewport</strong><br>
        Size: ${info.viewport.width}×${info.viewport.height}<br>
        DPR: ${info.viewport.devicePixelRatio}<br>
        Orientation: ${info.viewport.orientation}
      </div>
    `;
  }
  
  // Public methods for external use
  logPerformance() {
    console.group('🚀 Performance Debug Info');
    console.log('Performance Metrics:', this.getPerformanceInfo());
    console.log('Web Vitals:', this.getWebVitalsInfo());
    console.log('Memory Usage:', this.getMemoryInfo());
    console.groupEnd();
  }
  
  exportDebugData() {
    const data = this.gatherDebugInfo();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  clearStoredData() {
    localStorage.removeItem('webVitals');
    localStorage.removeItem('jsErrors');
    console.log('Debug data cleared');
  }
}

// Initialize debug utils
let debugUtils = null;

document.addEventListener('DOMContentLoaded', () => {
  debugUtils = new DebugUtils();
  
  // Expose to global scope for console access
  window.debugUtils = debugUtils;
  
  // Add console commands
  console.log('%c🐛 Debug Utils Loaded', 'color: #4ade80; font-weight: bold;');
  console.log('Available commands:');
  console.log('- debugUtils.logPerformance() - Log performance info');
  console.log('- debugUtils.exportDebugData() - Export debug data as JSON');
  console.log('- debugUtils.clearStoredData() - Clear stored debug data');
  console.log('- Press Ctrl+Shift+D to toggle debug panel');
});

export { DebugUtils };