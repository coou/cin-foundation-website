module.exports = {
  ci: {
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000',
        'http://localhost:3000/#vision',
        'http://localhost:3000/#research',
        'http://localhost:3000/#blog',
        'http://localhost:3000/#contact'
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      // Chrome flags for consistent testing
      settings: {
        chromeFlags: '--no-sandbox --headless --disable-gpu --disable-dev-shm-usage'
      }
    },
    assert: {
      // Performance budgets and assertions
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Core Web Vitals thresholds
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxLength: 0 }],
        'unused-javascript': ['warn', { maxLength: 0 }],
        'modern-image-formats': ['warn', { maxLength: 0 }],
        'uses-optimized-images': ['warn', { maxLength: 0 }],
        'uses-text-compression': ['error', { maxLength: 0 }],
        'uses-responsive-images': ['warn', { maxLength: 0 }],
        
        // Network optimization
        'render-blocking-resources': ['warn', { maxLength: 0 }],
        'eliminate-render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        'uses-rel-preconnect': ['warn', { maxLength: 0 }],
        'uses-rel-preload': ['warn', { maxLength: 0 }],
        
        // JavaScript optimization
        'unminified-javascript': ['error', { maxLength: 0 }],
        'unminified-css': ['error', { maxLength: 0 }],
        'legacy-javascript': ['warn', { maxLength: 0 }],
        
        // Accessibility requirements
        'color-contrast': ['error', { maxLength: 0 }],
        'heading-order': ['error', { maxLength: 0 }],
        'link-name': ['error', { maxLength: 0 }],
        'button-name': ['error', { maxLength: 0 }],
        'image-alt': ['error', { maxLength: 0 }],
        'label': ['error', { maxLength: 0 }],
        'aria-valid-attr': ['error', { maxLength: 0 }],
        'aria-valid-attr-value': ['error', { maxLength: 0 }],
        
        // SEO requirements
        'meta-description': ['error', { maxLength: 0 }],
        'document-title': ['error', { maxLength: 0 }],
        'html-has-lang': ['error', { maxLength: 0 }],
        'html-lang-valid': ['error', { maxLength: 0 }],
        'canonical': ['warn', { maxLength: 0 }]
      }
    },
    upload: {
      // Configure where to store results
      target: 'temporary-public-storage',
      // Store results for longer retention
      uploadUrlMap: './lighthouse-urls.json',
      // Include additional metadata
      extraHeaders: {
        'X-Performance-Budget': 'CIN-Foundation-v1.0'
      }
    },
    server: {
      // Local server configuration for testing
      command: 'npm run preview',
      port: 4173,
      wait: 3000
    }
  }
};