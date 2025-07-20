/**
 * Accessibility utilities and enhancements
 */

/**
 * Initialize accessibility features
 */
export function initializeAccessibility() {
  setupKeyboardNavigation();
  setupARIALabels();
  setupFocusManagement();
  setupSkipLinks();
  setupReducedMotion();
  announcePageLoad();
}

/**
 * Setup keyboard navigation for interactive elements
 */
function setupKeyboardNavigation() {
  // Handle keyboard navigation for custom interactive elements
  const interactiveElements = document.querySelectorAll(
    'button, [role="button"], [tabindex="0"], .pillar-expand-btn, .concept-expand-btn'
  );

  interactiveElements.forEach(element => {
    element.addEventListener('keydown', (e) => {
      // Handle Enter and Space key presses
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        element.click();
      }
    });
  });

  // Setup roving tabindex for navigation menu
  setupRovingTabindex('.nav-link', 'horizontal');
  
  // Setup escape key handling for mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeExpandedSections();
    }
  });
}

/**
 * Setup roving tabindex for keyboard navigation
 * @param {string} selector - CSS selector for elements
 * @param {string} direction - 'horizontal' or 'vertical'
 */
function setupRovingTabindex(selector, direction = 'horizontal') {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return;

  let currentIndex = 0;
  
  // Set initial tabindex
  elements.forEach((element, index) => {
    element.tabIndex = index === 0 ? 0 : -1;
  });

  elements.forEach((element, index) => {
    element.addEventListener('keydown', (e) => {
      let nextIndex = currentIndex;
      
      if (direction === 'horizontal') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % elements.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + elements.length) % elements.length;
        }
      }
      
      if (nextIndex !== currentIndex) {
        e.preventDefault();
        elements[currentIndex].tabIndex = -1;
        elements[nextIndex].tabIndex = 0;
        elements[nextIndex].focus();
        currentIndex = nextIndex;
      }
    });

    element.addEventListener('focus', () => {
      currentIndex = index;
    });
  });
}

/**
 * Setup proper ARIA labels and roles
 */
function setupARIALabels() {
  // Add ARIA labels to navigation
  const nav = document.querySelector('nav');
  if (nav && !nav.getAttribute('aria-label')) {
    nav.setAttribute('aria-label', 'Main navigation');
  }

  // Add ARIA labels to sections
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    const heading = section.querySelector('h1, h2, h3');
    if (heading && !section.getAttribute('aria-labelledby')) {
      if (!heading.id) {
        heading.id = `${section.id}-heading`;
      }
      section.setAttribute('aria-labelledby', heading.id);
    }
  });

  // Add ARIA expanded states to expandable elements
  const expandButtons = document.querySelectorAll('.pillar-expand-btn, .concept-expand-btn');
  expandButtons.forEach(button => {
    const target = button.getAttribute('data-target');
    if (target) {
      const targetElement = document.getElementById(target);
      if (targetElement) {
        button.setAttribute('aria-expanded', targetElement.classList.contains('hidden') ? 'false' : 'true');
        button.setAttribute('aria-controls', target);
        
        if (!targetElement.getAttribute('role')) {
          targetElement.setAttribute('role', 'region');
        }
      }
    }
  });

  // Add ARIA labels to form elements
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
      const placeholder = input.getAttribute('placeholder');
      if (placeholder) {
        input.setAttribute('aria-label', placeholder);
      }
    }
  });

  // Add ARIA labels to buttons without text content
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
      const icon = button.querySelector('svg');
      if (icon) {
        button.setAttribute('aria-label', 'Toggle menu');
      }
    }
  });
}

/**
 * Setup focus management
 */
function setupFocusManagement() {
  // Create focus trap for mobile menu
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  
  if (mobileMenu && mobileMenuButton) {
    const focusableElements = mobileMenu.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      
      mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              e.preventDefault();
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              e.preventDefault();
              firstFocusable.focus();
            }
          }
        }
      });
    }
  }

  // Manage focus for expandable sections
  document.addEventListener('click', (e) => {
    if (e.target.matches('.pillar-expand-btn, .concept-expand-btn')) {
      const target = e.target.getAttribute('data-target');
      if (target) {
        const targetElement = document.getElementById(target);
        if (targetElement) {
          const isExpanded = !targetElement.classList.contains('hidden');
          e.target.setAttribute('aria-expanded', isExpanded.toString());
          
          if (isExpanded) {
            // Focus the first focusable element in the expanded section
            const firstFocusable = targetElement.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
              setTimeout(() => firstFocusable.focus(), 100);
            }
          }
        }
      }
    }
  });
}

/**
 * Setup skip links for keyboard users
 */
function setupSkipLinks() {
  // Create skip link if it doesn't exist
  let skipLink = document.querySelector('.skip-link');
  if (!skipLink) {
    skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-900 focus:text-white focus:rounded-md';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Ensure main content has proper ID
  const main = document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main';
  }
}

/**
 * Setup reduced motion preferences
 */
function setupReducedMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  function handleReducedMotion(mediaQuery) {
    if (mediaQuery.matches) {
      document.documentElement.classList.add('reduce-motion');
      
      // Disable animations
      const style = document.createElement('style');
      style.textContent = `
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }
  
  handleReducedMotion(prefersReducedMotion);
  prefersReducedMotion.addEventListener('change', handleReducedMotion);
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  
  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.add('hidden');
    mobileMenuButton.focus();
    
    // Reset menu button icon
    const icon = mobileMenuButton.querySelector('svg');
    if (icon) {
      icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      `;
    }
  }
}

/**
 * Close all expanded sections
 */
function closeExpandedSections() {
  const expandedSections = document.querySelectorAll('[id$="-details"]:not(.hidden)');
  expandedSections.forEach(section => {
    section.classList.add('hidden');
    
    // Update corresponding button
    const button = document.querySelector(`[data-target="${section.id}"]`);
    if (button) {
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Announce page load to screen readers
 */
function announcePageLoad() {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = 'CIN Foundation website loaded successfully';
  document.body.appendChild(announcement);
  
  // Remove announcement after screen readers have processed it
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

/**
 * Announce dynamic content changes
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}