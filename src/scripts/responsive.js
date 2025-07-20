// Responsive design and cross-browser compatibility enhancements
class ResponsiveManager {
  constructor() {
    this.breakpoints = {
      xs: 320,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400
    };
    
    this.currentBreakpoint = this.getCurrentBreakpoint();
    this.isTouch = this.detectTouchDevice();
    this.browserInfo = this.detectBrowser();
    
    this.init();
  }
  
  init() {
    this.setupViewportHandler();
    this.setupOrientationHandler();
    this.setupProgressiveEnhancement();
    this.setupCrossBrowserFixes();
    this.setupResponsiveImages();
    this.setupTouchOptimizations();
    this.setupKeyboardNavigation();
  }
  
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width >= this.breakpoints.xxl) return 'xxl';
    if (width >= this.breakpoints.xl) return 'xl';
    if (width >= this.breakpoints.lg) return 'lg';
    if (width >= this.breakpoints.md) return 'md';
    if (width >= this.breakpoints.sm) return 'sm';
    return 'xs';
  }
  
  detectTouchDevice() {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           navigator.msMaxTouchPoints > 0;
  }
  
  detectBrowser() {
    const ua = navigator.userAgent;
    const browsers = {
      chrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
      firefox: /Firefox/.test(ua),
      safari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
      edge: /Edg/.test(ua),
      ie: /MSIE|Trident/.test(ua)
    };
    
    return Object.keys(browsers).find(browser => browsers[browser]) || 'unknown';
  }
  
  setupViewportHandler() {
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newBreakpoint = this.getCurrentBreakpoint();
        
        if (newBreakpoint !== this.currentBreakpoint) {
          this.currentBreakpoint = newBreakpoint;
          this.handleBreakpointChange(newBreakpoint);
        }
        
        this.updateViewportClasses();
        this.adjustLayoutForViewport();
      }, 150);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial setup
    this.updateViewportClasses();
    this.adjustLayoutForViewport();
  }
  
  handleBreakpointChange(breakpoint) {
    document.body.className = document.body.className.replace(/breakpoint-\w+/g, '');
    document.body.classList.add(`breakpoint-${breakpoint}`);
    
    // Emit custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('breakpointChange', {
      detail: { breakpoint, width: window.innerWidth }
    }));
    
    // Adjust navigation for mobile/desktop
    this.adjustNavigation(breakpoint);
    
    // Adjust hero section for different screen sizes
    this.adjustHeroSection(breakpoint);
    
    // Adjust grid layouts
    this.adjustGridLayouts(breakpoint);
  }
  
  updateViewportClasses() {
    const body = document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Add viewport size classes
    body.classList.toggle('viewport-narrow', width < 480);
    body.classList.toggle('viewport-wide', width > 1600);
    body.classList.toggle('viewport-short', height < 600);
    body.classList.toggle('viewport-tall', height > 900);
    
    // Add device orientation classes
    body.classList.toggle('landscape', width > height);
    body.classList.toggle('portrait', height > width);
    
    // Add touch device class
    body.classList.toggle('touch-device', this.isTouch);
    body.classList.toggle('no-touch', !this.isTouch);
    
    // Add browser classes
    body.classList.add(`browser-${this.browserInfo}`);
  }
  
  adjustLayoutForViewport() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Adjust container max-width for ultra-wide screens
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
      if (width > 1600) {
        container.style.maxWidth = '1400px';
      } else {
        container.style.maxWidth = '';
      }
    });
    
    // Adjust hero section height for short screens
    const heroSection = document.getElementById('hero');
    if (heroSection && height < 600) {
      heroSection.style.minHeight = '100vh';
      heroSection.style.paddingTop = '5rem';
      heroSection.style.paddingBottom = '2rem';
    } else if (heroSection) {
      heroSection.style.minHeight = '';
      heroSection.style.paddingTop = '';
      heroSection.style.paddingBottom = '';
    }
  }
  
  adjustNavigation(breakpoint) {
    const mobileMenu = document.getElementById('mobile-menu');
    const desktopNav = document.querySelector('.hidden.md\\:block');
    
    if (breakpoint === 'xs' || breakpoint === 'sm') {
      // Ensure mobile menu is properly hidden by default
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
      
      // Add swipe gesture support for mobile menu
      this.setupMobileMenuSwipe();
    } else {
      // Hide mobile menu on larger screens
      if (mobileMenu) {
        mobileMenu.classList.add('hidden');
      }
    }
  }
  
  adjustHeroSection(breakpoint) {
    const heroHeadline = document.querySelector('.hero-headline');
    const heroCards = document.querySelector('.hero-cards');
    const heroCta = document.querySelector('.hero-cta');
    
    if (!heroHeadline) return;
    
    switch (breakpoint) {
      case 'xs':
        heroHeadline.style.fontSize = '1.875rem';
        heroHeadline.style.lineHeight = '2.25rem';
        if (heroCards) {
          heroCards.style.gridTemplateColumns = '1fr';
          heroCards.style.gap = '1rem';
        }
        if (heroCta) {
          heroCta.style.flexDirection = 'column';
          heroCta.style.gap = '1rem';
        }
        break;
        
      case 'sm':
        heroHeadline.style.fontSize = '2.25rem';
        heroHeadline.style.lineHeight = '2.5rem';
        if (heroCta) {
          heroCta.style.flexDirection = 'row';
          heroCta.style.gap = '1.5rem';
        }
        break;
        
      case 'md':
        heroHeadline.style.fontSize = '3rem';
        heroHeadline.style.lineHeight = '1';
        if (heroCards) {
          heroCards.style.gridTemplateColumns = 'repeat(3, 1fr)';
          heroCards.style.gap = '1.5rem';
        }
        break;
        
      default:
        // Reset to default styles for larger screens
        heroHeadline.style.fontSize = '';
        heroHeadline.style.lineHeight = '';
        if (heroCards) {
          heroCards.style.gridTemplateColumns = '';
          heroCards.style.gap = '';
        }
        if (heroCta) {
          heroCta.style.flexDirection = '';
          heroCta.style.gap = '';
        }
    }
  }
  
  adjustGridLayouts(breakpoint) {
    const grids = document.querySelectorAll('.responsive-grid-2, .responsive-grid-3, .responsive-grid-4');
    
    grids.forEach(grid => {
      if (grid.classList.contains('responsive-grid-2')) {
        this.adjustGrid(grid, breakpoint, 2);
      } else if (grid.classList.contains('responsive-grid-3')) {
        this.adjustGrid(grid, breakpoint, 3);
      } else if (grid.classList.contains('responsive-grid-4')) {
        this.adjustGrid(grid, breakpoint, 4);
      }
    });
  }
  
  adjustGrid(grid, breakpoint, maxColumns) {
    let columns;
    
    switch (breakpoint) {
      case 'xs':
        columns = 1;
        break;
      case 'sm':
        columns = Math.min(2, maxColumns);
        break;
      case 'md':
        columns = Math.min(2, maxColumns);
        break;
      case 'lg':
        columns = maxColumns;
        break;
      default:
        columns = maxColumns;
    }
    
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }
  
  setupOrientationHandler() {
    const handleOrientationChange = () => {
      setTimeout(() => {
        this.updateViewportClasses();
        this.adjustLayoutForViewport();
        
        // Trigger resize event to update other components
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also listen for resize as a fallback
    let orientationTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(orientationTimeout);
      orientationTimeout = setTimeout(handleOrientationChange, 200);
    }, { passive: true });
  }
  
  setupProgressiveEnhancement() {
    // Test for modern CSS features and add classes accordingly
    const features = {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
      clipPath: CSS.supports('clip-path', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'),
      customProperties: CSS.supports('--custom', 'property'),
      objectFit: CSS.supports('object-fit', 'cover'),
      aspectRatio: CSS.supports('aspect-ratio', '16/9')
    };
    
    Object.keys(features).forEach(feature => {
      document.body.classList.toggle(`supports-${feature}`, features[feature]);
      document.body.classList.toggle(`no-${feature}`, !features[feature]);
    });
    
    // Apply progressive enhancements based on feature support
    this.applyProgressiveEnhancements(features);
  }
  
  applyProgressiveEnhancements(features) {
    // Enhanced grid layouts for supported browsers
    if (features.grid) {
      const enhancedGrids = document.querySelectorAll('.enhanced-grid');
      enhancedGrids.forEach(grid => {
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        grid.style.gap = '1.5rem';
      });
    }
    
    // Enhanced backdrop effects for supported browsers
    if (features.backdropFilter) {
      const backdropElements = document.querySelectorAll('.enhanced-backdrop');
      backdropElements.forEach(element => {
        element.style.backdropFilter = 'blur(10px)';
        element.style.webkitBackdropFilter = 'blur(10px)';
      });
    }
    
    // Object-fit for images in supported browsers
    if (features.objectFit) {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.classList.contains('object-cover')) {
          img.style.objectFit = 'cover';
        }
      });
    }
  }
  
  setupCrossBrowserFixes() {
    // Safari-specific fixes
    if (this.browserInfo === 'safari') {
      this.applySafariFixes();
    }
    
    // Firefox-specific fixes
    if (this.browserInfo === 'firefox') {
      this.applyFirefoxFixes();
    }
    
    // Edge/IE-specific fixes
    if (this.browserInfo === 'edge' || this.browserInfo === 'ie') {
      this.applyEdgeFixes();
    }
    
    // Chrome-specific optimizations
    if (this.browserInfo === 'chrome') {
      this.applyChromeFixes();
    }
  }
  
  applySafariFixes() {
    // Fix Safari flexbox bugs
    const flexContainers = document.querySelectorAll('.flex');
    flexContainers.forEach(container => {
      container.style.display = '-webkit-flex';
      container.style.display = 'flex';
    });
    
    // Fix Safari backdrop-filter
    const backdropElements = document.querySelectorAll('.backdrop-blur-md');
    backdropElements.forEach(element => {
      element.style.webkitBackdropFilter = 'blur(12px)';
    });
    
    // Fix Safari smooth scrolling
    document.documentElement.style.webkitScrollBehavior = 'smooth';
  }
  
  applyFirefoxFixes() {
    // Fix Firefox button appearance
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.style.mozAppearance = 'none';
    });
    
    // Fix Firefox flexbox
    const flexContainers = document.querySelectorAll('.flex');
    flexContainers.forEach(container => {
      container.style.display = '-moz-box';
      container.style.display = 'flex';
    });
  }
  
  applyEdgeFixes() {
    // Fix Edge/IE flexbox
    const flexContainers = document.querySelectorAll('.flex');
    flexContainers.forEach(container => {
      container.style.display = '-ms-flexbox';
      container.style.display = 'flex';
    });
    
    // Fix Edge grid fallback
    const gridContainers = document.querySelectorAll('.grid');
    gridContainers.forEach(container => {
      if (!CSS.supports('display', 'grid')) {
        container.style.display = '-ms-grid';
      }
    });
  }
  
  applyChromeFixes() {
    // Chrome-specific optimizations
    const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-gradient');
    animatedElements.forEach(element => {
      element.style.willChange = 'transform, opacity';
    });
  }
  
  setupResponsiveImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add responsive image attributes
      if (!img.hasAttribute('loading') && !img.closest('#hero')) {
        img.setAttribute('loading', 'lazy');
      }
      
      img.setAttribute('decoding', 'async');
      
      // Handle image load events
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
      
      img.addEventListener('error', () => {
        img.classList.add('lazy-error');
        console.warn('Failed to load image:', img.src);
      });
      
      // Add responsive sizing
      this.makeImageResponsive(img);
    });
  }
  
  makeImageResponsive(img) {
    // Add responsive classes based on container
    const container = img.closest('.container, .responsive-card, section');
    if (container) {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      
      // Add object-fit for better aspect ratio handling
      if (CSS.supports('object-fit', 'cover')) {
        img.style.objectFit = 'cover';
      }
    }
  }
  
  setupTouchOptimizations() {
    if (!this.isTouch) return;
    
    // Increase touch targets
    const touchTargets = document.querySelectorAll('button, a, [role="button"]');
    touchTargets.forEach(target => {
      const computedStyle = window.getComputedStyle(target);
      const minSize = 44; // 44px minimum touch target
      
      if (parseInt(computedStyle.height) < minSize) {
        target.style.minHeight = `${minSize}px`;
      }
      
      if (parseInt(computedStyle.width) < minSize) {
        target.style.minWidth = `${minSize}px`;
      }
    });
    
    // Disable hover effects on touch devices
    const hoverElements = document.querySelectorAll('[class*="hover:"]');
    hoverElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });
      
      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      });
    });
    
    // Add touch-friendly scrolling
    const scrollableElements = document.querySelectorAll('.overflow-auto, .overflow-x-auto, .overflow-y-auto');
    scrollableElements.forEach(element => {
      element.style.webkitOverflowScrolling = 'touch';
    });
  }
  
  setupMobileMenuSwipe() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu || !this.isTouch) return;
    
    let startX = 0;
    let startY = 0;
    
    mobileMenu.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    
    mobileMenu.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const diffX = startX - currentX;
      const diffY = startY - currentY;
      
      // Swipe up to close menu
      if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
        mobileMenu.classList.add('hidden');
        
        // Update menu button icon
        const menuButton = document.getElementById('mobile-menu-button');
        const icon = menuButton?.querySelector('svg');
        if (icon) {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          `;
        }
      }
      
      startX = 0;
      startY = 0;
    }, { passive: true });
  }
  
  setupKeyboardNavigation() {
    // Enhanced keyboard navigation
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element, index) => {
      element.addEventListener('keydown', (e) => {
        // Skip to next/previous focusable element with arrow keys
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (index + 1) % focusableElements.length;
          focusableElements[nextIndex].focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (index - 1 + focusableElements.length) % focusableElements.length;
          focusableElements[prevIndex].focus();
        }
      });
    });
    
    // Add visible focus indicators
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }
  
  // Public API methods
  getBreakpoint() {
    return this.currentBreakpoint;
  }
  
  isBreakpoint(breakpoint) {
    return this.currentBreakpoint === breakpoint;
  }
  
  isBreakpointUp(breakpoint) {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }
  
  isBreakpointDown(breakpoint) {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }
  
  isTouchDevice() {
    return this.isTouch;
  }
  
  getBrowser() {
    return this.browserInfo;
  }
}

// Initialize responsive manager
const responsiveManager = new ResponsiveManager();

// Export for use in other modules
export default responsiveManager;