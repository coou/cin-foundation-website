// Enhanced Intersection Observer for scroll-triggered animations
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Intersection Observer for scroll-triggered animations
  const createScrollObserver = () => {
    const animateOnScroll = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animationType = element.dataset.animation || 'fade-in';
          
          // Apply different animation types based on data attribute
          switch (animationType) {
            case 'slide-up':
              element.classList.add('animate-slide-up');
              break;
            case 'slide-left':
              element.classList.add('animate-slide-left');
              break;
            case 'slide-right':
              element.classList.add('animate-slide-right');
              break;
            case 'scale-in':
              element.classList.add('animate-scale-in');
              break;
            case 'fade-in':
            default:
              element.classList.add('animate-fade-in');
              break;
          }
          
          element.style.opacity = '1';
          element.style.transform = 'none';
          observer.unobserve(element); // Only animate once
        }
      });
    };
    
    return new IntersectionObserver(animateOnScroll, {
      root: null,
      threshold: 0.1,
      rootMargin: '50px 0px -50px 0px' // Start animation slightly before element is visible
    });
  };

  // Initialize scroll observer
  const scrollObserver = createScrollObserver();
  
  // Elements to animate with different animation types
  const animationConfig = [
    { selector: '.section-title', animation: 'slide-up' },
    { selector: '.section-subtitle', animation: 'fade-in' },
    { selector: '#vision .rounded-xl', animation: 'slide-up' },
    { selector: '#research .rounded-xl', animation: 'slide-up' },
    { selector: '#blog .blog-card', animation: 'scale-in' },
    { selector: '#contact .contact-card', animation: 'slide-left' },
    { selector: '.responsive-card', animation: 'fade-in' },
    { selector: '.value-card', animation: 'scale-in' }
  ];
  
  // Apply animations to elements
  animationConfig.forEach(config => {
    const elements = document.querySelectorAll(config.selector);
    elements.forEach((element, index) => {
      if (!prefersReducedMotion) {
        element.dataset.animation = config.animation;
        element.style.opacity = '0';
        
        // Set initial transform based on animation type
        switch (config.animation) {
          case 'slide-up':
            element.style.transform = 'translateY(30px)';
            break;
          case 'slide-left':
            element.style.transform = 'translateX(-30px)';
            break;
          case 'slide-right':
            element.style.transform = 'translateX(30px)';
            break;
          case 'scale-in':
            element.style.transform = 'scale(0.9)';
            break;
          case 'fade-in':
          default:
            element.style.transform = 'translateY(20px)';
            break;
        }
        
        // Add staggered delay for multiple elements
        element.style.transitionDelay = `${index * 100}ms`;
        scrollObserver.observe(element);
      }
    });
  });

  // Enhanced smooth scrolling for navigation links
  const initializeSmoothScrolling = () => {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('header').offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          // Enhanced smooth scroll with easing
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = Math.min(Math.abs(distance) / 2, 1000); // Max 1 second
          let start = null;
          
          const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
          };
          
          const animateScroll = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + (distance * ease));
            
            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            }
          };
          
          requestAnimationFrame(animateScroll);
        }
      });
    });
  };

  // Enhanced hover effects for buttons and interactive elements
  const initializeHoverEffects = () => {
    // Primary CTA buttons
    const primaryButtons = document.querySelectorAll('.primary-cta, .btn-primary');
    primaryButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        if (!prefersReducedMotion) {
          button.style.transform = 'translateY(-3px) scale(1.02)';
          button.style.boxShadow = '0 15px 35px rgba(30, 58, 138, 0.4)';
        }
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
        button.style.boxShadow = '';
      });
      
      // Add ripple effect on click
      button.addEventListener('click', (e) => {
        if (!prefersReducedMotion) {
          const ripple = document.createElement('span');
          const rect = button.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.classList.add('ripple');
          
          button.appendChild(ripple);
          
          setTimeout(() => {
            ripple.remove();
          }, 600);
        }
      });
    });

    // Secondary CTA buttons
    const secondaryButtons = document.querySelectorAll('.secondary-cta, .btn-secondary');
    secondaryButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        if (!prefersReducedMotion) {
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = '0 10px 25px rgba(30, 58, 138, 0.2)';
        }
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
        button.style.boxShadow = '';
      });
    });

    // Card hover effects
    const cards = document.querySelectorAll('.responsive-card, .value-card, .rounded-xl');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (!prefersReducedMotion) {
          card.style.transform = 'translateY(-5px)';
          card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });

    // Navigation link hover effects
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        if (!prefersReducedMotion) {
          link.style.transform = 'translateY(-1px)';
        }
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.transform = '';
      });
    });
  };

  // Enhanced focus indicators for keyboard navigation
  const initializeFocusIndicators = () => {
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.classList.add('focused');
        if (!prefersReducedMotion) {
          element.style.transform = 'scale(1.02)';
        }
      });
      
      element.addEventListener('blur', () => {
        element.classList.remove('focused');
        element.style.transform = '';
      });
      
      // Enhanced keyboard interaction feedback
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          element.classList.add('active');
          if (!prefersReducedMotion) {
            element.style.transform = 'scale(0.98)';
          }
        }
      });
      
      element.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          element.classList.remove('active');
          element.style.transform = '';
        }
      });
    });
  };

  // Loading animations for content sections
  const initializeLoadingAnimations = () => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach((section, index) => {
      if (!prefersReducedMotion) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          section.style.opacity = '1';
          section.style.transform = 'translateY(0)';
        }, index * 200);
      }
    });
  };

  // Hero section enhanced animations
  const initializeHeroAnimations = () => {
    const heroSection = document.getElementById('hero');
    if (!heroSection || prefersReducedMotion) return;

    // Staggered animation for hero elements
    const heroElements = heroSection.querySelectorAll('h1, .hero-pitch p, .hero-cards .value-card, .hero-cta a');
    heroElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(40px)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 150);
    });

    // Enhanced parallax effect for background elements
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      const scrollProgress = Math.min(scrolled / heroHeight, 1);
      
      const parallaxElements = heroSection.querySelectorAll('.absolute');
      parallaxElements.forEach((element, index) => {
        const speed = 0.3 + (index * 0.1);
        const yPos = scrolled * speed;
        const opacity = 1 - (scrollProgress * 0.5);
        
        element.style.transform = `translateY(${yPos}px)`;
        element.style.opacity = Math.max(opacity, 0.1);
      });

      // Animate particles with different speeds
      const particles = heroSection.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        const speed = 0.2 + (index * 0.05);
        const rotation = scrolled * (0.1 + index * 0.02);
        particle.style.transform = `translateY(${scrolled * speed}px) rotate(${rotation}deg)`;
      });
    };

    // Throttled scroll handler for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
  };

  // Expandable content animations
  const initializeExpandableAnimations = () => {
    const expandButtons = document.querySelectorAll('.pillar-expand-btn, .concept-expand-btn');
    
    expandButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.target;
        const targetElement = document.getElementById(targetId);
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (targetElement) {
          if (!isExpanded) {
            // Expand
            targetElement.style.display = 'block';
            targetElement.style.maxHeight = '0';
            targetElement.style.opacity = '0';
            targetElement.style.transform = 'translateY(-10px)';
            
            requestAnimationFrame(() => {
              targetElement.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              targetElement.style.maxHeight = (targetElement.scrollHeight + 48) + 'px';
              targetElement.style.opacity = '1';
              targetElement.style.transform = 'translateY(0)';
            });
            
            button.setAttribute('aria-expanded', 'true');
            button.querySelector('svg').style.transform = 'rotate(180deg)';
          } else {
            // Collapse
            targetElement.style.maxHeight = '0';
            targetElement.style.opacity = '0';
            targetElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
              targetElement.style.display = 'none';
            }, 400);
            
            button.setAttribute('aria-expanded', 'false');
            button.querySelector('svg').style.transform = 'rotate(0deg)';
          }
        }
      });
    });
  };

  // Initialize all animation systems
  initializeSmoothScrolling();
  initializeHoverEffects();
  initializeFocusIndicators();
  initializeLoadingAnimations();
  initializeHeroAnimations();
  initializeExpandableAnimations();

  // Add scroll indicator functionality
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const visionSection = document.querySelector('#vision');
      if (visionSection) {
        visionSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // Performance optimization: Remove will-change after animations complete
  const optimizePerformance = () => {
    setTimeout(() => {
      const animatedElements = document.querySelectorAll('[style*="will-change"]');
      animatedElements.forEach(element => {
        element.style.willChange = 'auto';
      });
    }, 3000); // Remove after 3 seconds
  };

  // Blog image scroll reveal effect
  const initializeBlogImageScrollEffect = () => {
    if (prefersReducedMotion) return;

    const blogImages = document.querySelectorAll('.blog-scroll-image');
    
    blogImages.forEach(image => {
      // Set initial position to show bottom part of image
      image.style.objectPosition = 'center bottom';
      image.style.transition = 'object-position 0.3s ease-out';
    });

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const image = entry.target;
        const rect = image.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (entry.isIntersecting) {
          // Calculate scroll progress (0 = just entered from bottom, 1 = fully visible)
          let progress = 1 - (rect.bottom - windowHeight) / (rect.height + windowHeight);
          progress = Math.max(0, Math.min(1, progress));
          
          // Smoothly transition from bottom to center as element scrolls up
          const yPosition = 100 - (progress * 50); // Start at bottom (100%), end at center (50%)
          image.style.objectPosition = `center ${yPosition}%`;
        }
      });
    }, {
      threshold: 0,
      rootMargin: '0px 0px -10% 0px'
    });

    blogImages.forEach(image => {
      scrollObserver.observe(image);
    });

    // Additional scroll listener for fine-tuned control
    let ticking = false;
    const updateImagePositions = () => {
      blogImages.forEach(image => {
        const rect = image.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.bottom > 0 && rect.top < windowHeight) {
          // Element is visible, calculate position
          let progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          progress = Math.max(0, Math.min(1, progress));
          
          // Create a smooth reveal effect
          const yPosition = 100 - (progress * 50);
          image.style.objectPosition = `center ${yPosition}%`;
        }
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateImagePositions);
        ticking = true;
      }
    }, { passive: true });
  };

  initializeBlogImageScrollEffect();
  optimizePerformance();
});