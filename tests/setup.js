import { beforeEach, afterEach } from 'vitest';

// Mock DOM environment setup
beforeEach(() => {
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Mock window properties
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true
  });
  
  Object.defineProperty(window, 'scrollY', {
    value: 0,
    writable: true
  });
  
  Object.defineProperty(window, 'pageYOffset', {
    value: 0,
    writable: true
  });
  
  Object.defineProperty(window, 'innerHeight', {
    value: 1024,
    writable: true
  });
  
  Object.defineProperty(window, 'innerWidth', {
    value: 1280,
    writable: true
  });
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    callback
  }));
  
  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
  global.cancelAnimationFrame = vi.fn();
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  
  // Mock console methods to avoid noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllTimers();
});