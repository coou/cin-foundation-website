/**
 * Color contrast utilities for WCAG 2.1 AA compliance
 */

/**
 * Initialize color contrast checking and fixes
 */
export function initializeColorContrast() {
  if (process.env.NODE_ENV === 'development') {
    checkColorContrast();
  }
  applyContrastFixes();
}

/**
 * Check color contrast ratios for WCAG compliance
 */
function checkColorContrast() {
  const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6, li, td, th, label');
  const issues = [];

  textElements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const textColor = styles.color;
    const backgroundColor = getBackgroundColor(element);
    
    if (textColor && backgroundColor) {
      const contrast = calculateContrastRatio(textColor, backgroundColor);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      // Determine if text is large (18pt+ or 14pt+ bold)
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
      
      // WCAG AA requirements: 4.5:1 for normal text, 3:1 for large text
      const requiredRatio = isLargeText ? 3 : 4.5;
      
      if (contrast < requiredRatio) {
        issues.push({
          element,
          contrast: contrast.toFixed(2),
          required: requiredRatio,
          textColor,
          backgroundColor,
          isLargeText
        });
      }
    }
  });

  if (issues.length > 0) {
    console.warn('Color contrast issues found:', issues);
    // In development, you could highlight these elements
    issues.forEach(issue => {
      issue.element.style.outline = '2px solid red';
      issue.element.title = `Contrast ratio: ${issue.contrast}:1 (required: ${issue.required}:1)`;
    });
  }
}

/**
 * Apply contrast fixes for known issues
 */
function applyContrastFixes() {
  // Ensure sufficient contrast for navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.style.setProperty('--tw-text-opacity', '1');
  });

  // Ensure sufficient contrast for secondary text
  const secondaryText = document.querySelectorAll('.text-gray-600, .text-gray-500');
  secondaryText.forEach(element => {
    // Check if the element has sufficient contrast
    const styles = window.getComputedStyle(element);
    const textColor = styles.color;
    const backgroundColor = getBackgroundColor(element);
    
    if (textColor && backgroundColor) {
      const contrast = calculateContrastRatio(textColor, backgroundColor);
      if (contrast < 4.5) {
        // Darken the text color for better contrast
        element.classList.remove('text-gray-600', 'text-gray-500');
        element.classList.add('text-gray-700');
      }
    }
  });

  // Ensure button contrast
  const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
  buttons.forEach(button => {
    const styles = window.getComputedStyle(button);
    const textColor = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    if (textColor && backgroundColor) {
      const contrast = calculateContrastRatio(textColor, backgroundColor);
      if (contrast < 4.5) {
        // Apply high contrast styles
        button.classList.add('high-contrast');
      }
    }
  });
}

/**
 * Get the effective background color of an element
 * @param {HTMLElement} element - The element to check
 * @returns {string|null} - The background color or null
 */
function getBackgroundColor(element) {
  let current = element;
  
  while (current && current !== document.body) {
    const styles = window.getComputedStyle(current);
    const bgColor = styles.backgroundColor;
    
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return bgColor;
    }
    
    current = current.parentElement;
  }
  
  // Default to white background
  return 'rgb(255, 255, 255)';
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (CSS color string)
 * @param {string} color2 - Second color (CSS color string)
 * @returns {number} - Contrast ratio
 */
function calculateContrastRatio(color1, color2) {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Get relative luminance of a color
 * @param {string} color - CSS color string
 * @returns {number} - Relative luminance
 */
function getRelativeLuminance(color) {
  const rgb = parseColor(color);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Parse CSS color string to RGB values
 * @param {string} color - CSS color string
 * @returns {number[]|null} - RGB values or null
 */
function parseColor(color) {
  // Create a temporary element to parse the color
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  
  const computed = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);
  
  // Parse rgb() or rgba() format
  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  
  return null;
}

/**
 * Get WCAG compliance level for a contrast ratio
 * @param {number} ratio - Contrast ratio
 * @param {boolean} isLargeText - Whether the text is considered large
 * @returns {string} - Compliance level ('AAA', 'AA', 'A', or 'Fail')
 */
export function getComplianceLevel(ratio, isLargeText = false) {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA';
    return 'Fail';
  } else {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'Fail';
  }
}