// Cross-browser compatibility and responsive design test suite
class ResponsiveTestSuite {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }
  
  runAllTests() {
    console.group('🧪 Responsive Design & Cross-Browser Compatibility Tests');
    
    this.testViewportMeta();
    this.testResponsiveBreakpoints();
    this.testFlexboxSupport();
    this.testGridSupport();
    this.testBackdropFilterSupport();
    this.testTouchDeviceDetection();
    this.testKeyboardNavigation();
    this.testImageResponsiveness();
    this.testFontLoading();
    this.testCSSCustomProperties();
    this.testBrowserSpecificFeatures();
    this.testAccessibilityFeatures();
    
    this.displayResults();
    console.groupEnd();
    
    return this.results;
  }
  
  testViewportMeta() {
    const test = 'Viewport Meta Tag';
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (viewportMeta) {
      const content = viewportMeta.getAttribute('content');
      if (content.includes('width=device-width') && content.includes('initial-scale=1.0')) {
        this.pass(test, 'Viewport meta tag is properly configured');
      } else {
        this.fail(test, 'Viewport meta tag is missing required attributes');
      }
    } else {
      this.fail(test, 'Viewport meta tag is missing');
    }
  }
  
  testResponsiveBreakpoints() {
    const test = 'Responsive Breakpoints';
    const breakpoints = {
      xs: 320,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400
    };
    
    const currentWidth = window.innerWidth;
    let activeBreakpoint = 'xs';
    
    Object.keys(breakpoints).forEach(bp => {
      if (currentWidth >= breakpoints[bp]) {
        activeBreakpoint = bp;
      }
    });
    
    const bodyClasses = document.body.className;
    if (bodyClasses.includes(`breakpoint-${activeBreakpoint}`)) {
      this.pass(test, `Current breakpoint (${activeBreakpoint}) is correctly applied`);
    } else {
      this.warn(test, `Breakpoint class may not be applied yet (current: ${activeBreakpoint})`);
    }
  }
  
  testFlexboxSupport() {
    const test = 'Flexbox Support';
    const supportsFlexbox = CSS.supports('display', 'flex');
    
    if (supportsFlexbox) {
      this.pass(test, 'Flexbox is supported');
      
      // Test flexbox implementation
      const flexElements = document.querySelectorAll('.flex');
      if (flexElements.length > 0) {
        const testElement = flexElements[0];
        const computedStyle = window.getComputedStyle(testElement);
        
        if (computedStyle.display === 'flex' || computedStyle.display === '-webkit-flex') {
          this.pass(test + ' Implementation', 'Flexbox is properly implemented');
        } else {
          this.fail(test + ' Implementation', 'Flexbox classes are not working');
        }
      }
    } else {
      this.warn(test, 'Flexbox is not supported, fallbacks should be active');
    }
  }
  
  testGridSupport() {
    const test = 'CSS Grid Support';
    const supportsGrid = CSS.supports('display', 'grid');
    
    if (supportsGrid) {
      this.pass(test, 'CSS Grid is supported');
      
      // Test grid implementation
      const gridElements = document.querySelectorAll('.grid, .responsive-grid-2, .responsive-grid-3, .responsive-grid-4');
      if (gridElements.length > 0) {
        const testElement = gridElements[0];
        const computedStyle = window.getComputedStyle(testElement);
        
        if (computedStyle.display === 'grid') {
          this.pass(test + ' Implementation', 'CSS Grid is properly implemented');
        } else {
          this.warn(test + ' Implementation', 'Grid fallback may be active');
        }
      }
    } else {
      this.warn(test, 'CSS Grid is not supported, flexbox fallbacks should be active');
    }
  }
  
  testBackdropFilterSupport() {
    const test = 'Backdrop Filter Support';
    const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)') || 
                                   CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
    
    if (supportsBackdropFilter) {
      this.pass(test, 'Backdrop filter is supported');
    } else {
      this.warn(test, 'Backdrop filter is not supported, solid background fallback should be active');
    }
  }
  
  testTouchDeviceDetection() {
    const test = 'Touch Device Detection';
    const isTouch = 'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0 || 
                    navigator.msMaxTouchPoints > 0;
    
    const bodyClasses = document.body.className;
    const hasTouchClass = bodyClasses.includes('touch-device') || bodyClasses.includes('no-touch');
    
    if (hasTouchClass) {
      if (isTouch && bodyClasses.includes('touch-device')) {
        this.pass(test, 'Touch device correctly detected and classified');
      } else if (!isTouch && bodyClasses.includes('no-touch')) {
        this.pass(test, 'Non-touch device correctly detected and classified');
      } else {
        this.fail(test, 'Touch detection mismatch');
      }
    } else {
      this.warn(test, 'Touch device classes not yet applied');
    }
  }
  
  testKeyboardNavigation() {
    const test = 'Keyboard Navigation';
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      let hasTabIndex = true;
      let hasVisibleFocus = true;
      
      focusableElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex) < 0) {
          hasTabIndex = false;
        }
        
        // Check if focus styles are defined
        const computedStyle = window.getComputedStyle(element, ':focus');
        if (!computedStyle.outline && !computedStyle.boxShadow) {
          hasVisibleFocus = false;
        }
      });
      
      if (hasTabIndex && hasVisibleFocus) {
        this.pass(test, 'Keyboard navigation is properly implemented');
      } else {
        this.warn(test, 'Some keyboard navigation issues detected');
      }
    } else {
      this.fail(test, 'No focusable elements found');
    }
  }
  
  testImageResponsiveness() {
    const test = 'Image Responsiveness';
    const images = document.querySelectorAll('img');
    let responsiveImages = 0;
    let lazyImages = 0;
    
    images.forEach(img => {
      const computedStyle = window.getComputedStyle(img);
      
      // Check if image is responsive
      if (computedStyle.maxWidth === '100%' || img.style.maxWidth === '100%') {
        responsiveImages++;
      }
      
      // Check if image has lazy loading
      if (img.getAttribute('loading') === 'lazy') {
        lazyImages++;
      }
    });
    
    if (images.length > 0) {
      const responsivePercentage = (responsiveImages / images.length) * 100;
      const lazyPercentage = (lazyImages / images.length) * 100;
      
      if (responsivePercentage >= 80) {
        this.pass(test, `${responsivePercentage.toFixed(0)}% of images are responsive`);
      } else {
        this.warn(test, `Only ${responsivePercentage.toFixed(0)}% of images are responsive`);
      }
      
      if (lazyPercentage >= 50) {
        this.pass(test + ' Lazy Loading', `${lazyPercentage.toFixed(0)}% of images use lazy loading`);
      } else {
        this.warn(test + ' Lazy Loading', `Only ${lazyPercentage.toFixed(0)}% of images use lazy loading`);
      }
    } else {
      this.warn(test, 'No images found to test');
    }
  }
  
  testFontLoading() {
    const test = 'Font Loading';
    
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        const loadedFonts = Array.from(document.fonts).filter(font => font.status === 'loaded');
        
        if (loadedFonts.length > 0) {
          this.pass(test, `${loadedFonts.length} fonts loaded successfully`);
        } else {
          this.warn(test, 'No custom fonts detected or loaded');
        }
      }).catch(() => {
        this.warn(test, 'Font loading API failed');
      });
    } else {
      this.warn(test, 'Font Loading API not supported');
    }
  }
  
  testCSSCustomProperties() {
    const test = 'CSS Custom Properties';
    const supportsCustomProperties = CSS.supports('--custom', 'property');
    
    if (supportsCustomProperties) {
      this.pass(test, 'CSS Custom Properties are supported');
      
      // Test if custom properties are being used
      const rootStyles = window.getComputedStyle(document.documentElement);
      const customProps = [];
      
      for (let i = 0; i < rootStyles.length; i++) {
        const prop = rootStyles[i];
        if (prop.startsWith('--')) {
          customProps.push(prop);
        }
      }
      
      if (customProps.length > 0) {
        this.pass(test + ' Usage', `${customProps.length} custom properties defined`);
      } else {
        this.warn(test + ' Usage', 'No custom properties found in use');
      }
    } else {
      this.warn(test, 'CSS Custom Properties not supported, fallbacks should be active');
    }
  }
  
  testBrowserSpecificFeatures() {
    const test = 'Browser Detection';
    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    
    if (userAgent.includes('Chrome') && userAgent.includes('Google Inc')) {
      browser = 'chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'firefox';
    } else if (userAgent.includes('Safari') && userAgent.includes('Apple Computer')) {
      browser = 'safari';
    } else if (userAgent.includes('Edg')) {
      browser = 'edge';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      browser = 'ie';
    }
    
    const bodyClasses = document.body.className;
    if (bodyClasses.includes(`browser-${browser}`)) {
      this.pass(test, `Browser correctly detected as ${browser}`);
    } else {
      this.warn(test, `Browser detection may not be complete (detected: ${browser})`);
    }
    
    // Test browser-specific features
    this.testBrowserSpecificCSS(browser);
  }
  
  testBrowserSpecificCSS(browser) {
    const test = `${browser.charAt(0).toUpperCase() + browser.slice(1)} Specific Features`;
    
    switch (browser) {
      case 'safari':
        const supportsWebkitBackdrop = CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
        if (supportsWebkitBackdrop) {
          this.pass(test, 'Safari webkit-backdrop-filter supported');
        } else {
          this.warn(test, 'Safari webkit-backdrop-filter not supported');
        }
        break;
        
      case 'firefox':
        const supportsMozAppearance = CSS.supports('-moz-appearance', 'none');
        if (supportsMozAppearance) {
          this.pass(test, 'Firefox -moz-appearance supported');
        } else {
          this.warn(test, 'Firefox -moz-appearance not supported');
        }
        break;
        
      case 'chrome':
        const supportsWebkitFlex = CSS.supports('display', '-webkit-flex');
        if (supportsWebkitFlex) {
          this.pass(test, 'Chrome webkit-flex supported');
        } else {
          this.warn(test, 'Chrome webkit-flex not supported');
        }
        break;
        
      default:
        this.warn(test, `No specific tests for ${browser}`);
    }
  }
  
  testAccessibilityFeatures() {
    const test = 'Accessibility Features';
    
    // Test skip link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      this.pass(test + ' Skip Link', 'Skip to main content link found');
    } else {
      this.fail(test + ' Skip Link', 'Skip to main content link missing');
    }
    
    // Test ARIA labels
    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
    if (ariaElements.length > 0) {
      this.pass(test + ' ARIA Labels', `${ariaElements.length} elements with ARIA labels found`);
    } else {
      this.warn(test + ' ARIA Labels', 'No ARIA labels found');
    }
    
    // Test semantic HTML
    const semanticElements = document.querySelectorAll('main, nav, header, footer, section, article, aside');
    if (semanticElements.length >= 3) {
      this.pass(test + ' Semantic HTML', 'Good use of semantic HTML elements');
    } else {
      this.warn(test + ' Semantic HTML', 'Limited use of semantic HTML elements');
    }
    
    // Test color contrast (basic check)
    this.testColorContrast();
  }
  
  testColorContrast() {
    const test = 'Color Contrast';
    
    // This is a simplified contrast test
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
    let contrastIssues = 0;
    
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Simple check for very light text on light backgrounds or very dark on dark
      if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
        contrastIssues++;
      } else if (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(0, 0, 0)') {
        contrastIssues++;
      }
    });
    
    if (contrastIssues === 0) {
      this.pass(test, 'No obvious color contrast issues detected');
    } else {
      this.warn(test, `${contrastIssues} potential color contrast issues detected`);
    }
  }
  
  pass(testName, message) {
    console.log(`✅ ${testName}: ${message}`);
    this.results.passed++;
  }
  
  fail(testName, message) {
    console.error(`❌ ${testName}: ${message}`);
    this.results.failed++;
  }
  
  warn(testName, message) {
    console.warn(`⚠️ ${testName}: ${message}`);
    this.results.warnings++;
  }
  
  displayResults() {
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️ Warnings: ${this.results.warnings}`);
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = ((this.results.passed / total) * 100).toFixed(1);
    
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (this.results.failed === 0) {
      console.log('🎉 All critical tests passed!');
    } else {
      console.log('🔧 Some issues need attention.');
    }
  }
}

// Auto-run tests when DOM is loaded (for development)
if (window.location.search.includes('test=responsive')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const testSuite = new ResponsiveTestSuite();
      testSuite.runAllTests();
    }, 1000); // Wait for other scripts to initialize
  });
}

// Export for manual testing
window.ResponsiveTestSuite = ResponsiveTestSuite;