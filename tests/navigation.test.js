import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Navigation Functionality', () => {
  beforeEach(() => {
    // Setup DOM structure for navigation tests
    document.body.innerHTML = `
      <header>
        <nav>
          <a href="#hero" class="nav-link">Home</a>
          <a href="#vision" class="nav-link">Vision</a>
          <a href="#research" class="nav-link">Research</a>
          <a href="#blog" class="nav-link">Blog</a>
          <a href="#contact" class="nav-link">Contact</a>
        </nav>
        <button id="mobile-menu-button">
          <svg><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div id="mobile-menu" class="hidden">
          <a href="#hero">Home</a>
          <a href="#vision">Vision</a>
          <a href="#research">Research</a>
          <a href="#blog">Blog</a>
          <a href="#contact">Contact</a>
        </div>
      </header>
      <main>
        <section id="hero"></section>
        <section id="vision"></section>
        <section id="research"></section>
        <section id="blog"></section>
        <section id="contact"></section>
      </main>
    `;
  });

  it('should toggle mobile menu visibility', async () => {
    // Import navigation module
    await import('../src/scripts/navigation.js');
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    expect(mobileMenu.classList.contains('hidden')).toBe(true);
    
    // Click to open menu
    mobileMenuButton.click();
    expect(mobileMenu.classList.contains('hidden')).toBe(false);
    
    // Click to close menu
    mobileMenuButton.click();
    expect(mobileMenu.classList.contains('hidden')).toBe(true);
  });

  it('should change hamburger icon to X when menu is open', async () => {
    await import('../src/scripts/navigation.js');
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const icon = mobileMenuButton.querySelector('svg');
    
    // Initial state should be hamburger
    expect(icon.innerHTML).toContain('M4 6h16M4 12h16M4 18h16');
    
    // Open menu
    mobileMenuButton.click();
    expect(icon.innerHTML).toContain('M6 18L18 6M6 6l12 12');
    
    // Close menu
    mobileMenuButton.click();
    expect(icon.innerHTML).toContain('M4 6h16M4 12h16M4 18h16');
  });

  it('should close mobile menu when clicking on a link', async () => {
    await import('../src/scripts/navigation.js');
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLink = mobileMenu.querySelector('a');
    
    // Open menu first
    mobileMenuButton.click();
    expect(mobileMenu.classList.contains('hidden')).toBe(false);
    
    // Click on a link
    mobileMenuLink.click();
    expect(mobileMenu.classList.contains('hidden')).toBe(true);
  });

  it('should update active navigation state based on scroll position', async () => {
    await import('../src/scripts/navigation.js');
    
    const navLinks = document.querySelectorAll('header nav a');
    const visionSection = document.getElementById('vision');
    
    // Mock IntersectionObserver callback
    const observerCallback = global.IntersectionObserver.mock.calls[0][0];
    
    // Simulate vision section coming into view
    observerCallback([{
      target: visionSection,
      isIntersecting: true
    }]);
    
    const visionLink = document.querySelector('a[href="#vision"]');
    expect(visionLink.classList.contains('text-blue-700')).toBe(true);
    expect(visionLink.classList.contains('font-medium')).toBe(true);
  });

  it('should handle navigation without mobile menu elements gracefully', async () => {
    // Remove mobile menu elements
    document.getElementById('mobile-menu-button').remove();
    document.getElementById('mobile-menu').remove();
    
    // Should not throw error
    expect(async () => {
      await import('../src/scripts/navigation.js');
    }).not.toThrow();
  });

  it('should observe all sections with IDs', async () => {
    await import('../src/scripts/navigation.js');
    
    const observeMock = global.IntersectionObserver.mock.results[0].value.observe;
    
    // Should observe all 5 sections
    expect(observeMock).toHaveBeenCalledTimes(5);
  });
});