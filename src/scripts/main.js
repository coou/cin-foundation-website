import './navigation.js';
import './animations.js';
import './particles.js';
import './expandable.js';
import './hero.js';
import './contact.js';
import './responsive.js';
import { initializeLazyLoading, preloadResources } from './lazy-loading.js';
// import { initializeAccessibility } from './accessibility.js';
// import { initializeColorContrast } from './color-contrast.js';
import { initializeAnalytics } from './analytics.js';
import { initializePerformanceBudgetMonitoring } from './performance-budget-monitor.js';
import './performance-dashboard.js';
import './debug-utils.js';
import './test-analytics.js';

// Site configuration
const siteConfig = {
  title: "CIN Foundation",
  description: "Building the Operating System for a More Intelligent Society",
  contact: {
    email: "contact@collectiveintelligencenetwork.org",
    social: {
      linkedin: "https://linkedin.com/company/cin-foundation",
      twitter: "https://twitter.com/cin_foundation",
      github: "https://github.com/cin-foundation"
    }
  }
};

// Critical resources to preload
const criticalResources = [
  { type: 'image', href: './assets/images/whitepaper-thumbnail.png' },
  { type: 'image', href: './assets/images/favicon.svg' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log(`${siteConfig.title} website initialized`);
  
  // Initialize performance and accessibility features
  // initializeAccessibility();
  // initializeColorContrast();
  initializeLazyLoading();
  
  // Initialize analytics and performance monitoring
  initializeAnalytics();
  initializePerformanceBudgetMonitoring();
  
  // Preload critical resources
  preloadResources(criticalResources);
  
  // Set up any global event listeners or initializations here
  initializeHeroAnimations();
  initializeScrollEffects();
  initializePerformanceOptimizations();
  
  // Update copyright year dynamically
  const currentYear = new Date().getFullYear();
  const copyrightElement = document.querySelector('footer p');
  if (copyrightElement) {
    copyrightElement.textContent = `© ${currentYear} CIN Foundation. All rights reserved.`;
  }
});

// Hero section animations and interactions
function initializeHeroAnimations() {
  // Add staggered animation to hero elements
  const heroElements = document.querySelectorAll('#hero h1, #hero p, #hero .grid > div, #hero .flex');
  
  heroElements.forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * 200);
  });

  // Add parallax effect to background elements
  const backgroundElements = document.querySelectorAll('#hero .absolute');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const rate = scrolled * -0.5;
    
    backgroundElements.forEach((element, index) => {
      const speed = (index + 1) * 0.3;
      element.style.transform = `translateY(${rate * speed}px)`;
    });
  });

  // Add hover effects to value proposition cards
  const valueCards = document.querySelectorAll('#hero .grid > div');
  valueCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Add dynamic text highlighting
  const highlightElements = document.querySelectorAll('#hero strong');
  highlightElements.forEach((element, index) => {
    setTimeout(() => {
      element.style.background = 'linear-gradient(120deg, transparent 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)';
      element.style.backgroundSize = '200% 100%';
      element.style.animation = 'highlight 2s ease-in-out';
    }, 1000 + (index * 500));
  });
}

// Scroll effects for better UX
function initializeScrollEffects() {
  // Smooth scroll for CTA buttons
  const ctaButtons = document.querySelectorAll('a[href^="#"]');
  
  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = button.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Add scroll indicator functionality
  const scrollIndicator = document.querySelector('#hero .animate-bounce');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const visionSection = document.querySelector('#vision');
      if (visionSection) {
        visionSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Performance optimizations
function initializePerformanceOptimizations() {
  // Add will-change properties to elements that will be animated
  const animatedElements = document.querySelectorAll(
    '.hero-content, .value-card, .primary-cta, .secondary-cta, .particle'
  );
  
  animatedElements.forEach(element => {
    element.classList.add('will-change-transform');
  });

  // Optimize scroll performance with throttling
  let ticking = false;
  
  function updateScrollEffects() {
    // Update any scroll-based animations here
    ticking = false;
  }
  
  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });

  // Optimize image loading
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Add loading="lazy" to images that aren't critical
    if (!img.hasAttribute('loading') && !img.closest('#hero')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Add decode="async" for better performance
    img.setAttribute('decoding', 'async');
    
    // Handle image load events
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
    
    img.addEventListener('error', () => {
      img.classList.add('lazy-error');
      console.warn('Failed to load image:', img.src);
    });
  });

  // Optimize font loading
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      document.body.classList.add('fonts-loaded');
    });
  }

  // Add intersection observer for animations
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observe sections for fade-in animations
    const sections = document.querySelectorAll('section:not(#hero)');
    sections.forEach(section => {
      animationObserver.observe(section);
    });
  }

  // Prefetch important pages/resources on hover
  const importantLinks = document.querySelectorAll('a[href^="#"], .primary-cta, .secondary-cta');
  importantLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      // Prefetch any resources that might be needed
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          // Preload any images in the target section
          const images = target.querySelectorAll('img[data-src]');
          images.forEach(img => {
            if (img.dataset.src) {
              const preloadImg = new Image();
              preloadImg.src = img.dataset.src;
            }
          });
        }
      }
    }, { once: true });
  });
}