/**
 * Utility functions for the CIN Foundation website
 */

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait = 100) => {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};

/**
 * Format a date string
 * @param {string|Date} date - The date to format
 * @returns {string} - The formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Create an element with attributes and children
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - The attributes to set on the element
 * @param {Array|string|Node} children - The children to append to the element
 * @returns {HTMLElement} - The created element
 */
export const createElement = (tag, attributes = {}, children = []) => {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Append children
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child) {
          element.append(child);
        }
      });
    } else if (typeof children === 'string') {
      element.textContent = children;
    } else {
      element.append(children);
    }
  }
  
  return element;
};