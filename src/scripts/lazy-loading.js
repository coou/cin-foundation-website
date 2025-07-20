/**
 * Lazy loading implementation for images and non-critical resources
 */

/**
 * Initialize lazy loading for images
 */
export function initializeLazyLoading() {
  // Check if Intersection Observer is supported
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });

    // Observe background images
    const lazyBackgrounds = document.querySelectorAll('[data-bg]');
    lazyBackgrounds.forEach(element => {
      imageObserver.observe(element);
    });
  } else {
    // Fallback for browsers without Intersection Observer
    loadAllImages();
  }
}

/**
 * Load a single image
 * @param {HTMLImageElement} img - The image element to load
 */
function loadImage(img) {
  if (img.dataset.src) {
    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Image loaded successfully
      img.src = img.dataset.src;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      
      // Remove data-src attribute
      delete img.dataset.src;
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('imageLoaded', {
        detail: { src: img.src }
      }));
    };
    
    imageLoader.onerror = () => {
      // Handle image load error
      img.classList.add('lazy-error');
      console.warn('Failed to load image:', img.dataset.src);
    };
    
    // Start loading
    imageLoader.src = img.dataset.src;
  }
  
  // Handle background images
  if (img.dataset.bg) {
    img.style.backgroundImage = `url(${img.dataset.bg})`;
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
    delete img.dataset.bg;
  }
}

/**
 * Fallback function to load all images immediately
 */
function loadAllImages() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(loadImage);
  
  const lazyBackgrounds = document.querySelectorAll('[data-bg]');
  lazyBackgrounds.forEach(loadImage);
}

/**
 * Lazy load non-critical CSS
 * @param {string} href - The CSS file URL
 * @param {string} media - Media query for the CSS (optional)
 */
export function loadCSS(href, media = 'all') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = media;
  
  // Add to head
  document.head.appendChild(link);
  
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
  });
}

/**
 * Lazy load JavaScript modules
 * @param {string} src - The JavaScript file URL
 * @returns {Promise} - Promise that resolves when script is loaded
 */
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource objects with type and href
 */
export function preloadResources(resources) {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.type;
    
    if (resource.type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}