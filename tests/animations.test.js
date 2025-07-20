import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Animation Functionality', () => {
  beforeEach(() => {
    // Setup DOM structure for animation tests
    document.body.innerHTML = `
      <header style="height: 80px;"></header>
      <main>
        <section id="hero">
          <h1>Hero Title</h1>
          <div class="hero-pitch">
            <p>Hero pitch</p>
          </div>
          <div class="hero-cards">
            <div class="value-card">Card 1</div>
            <div class="value-card">Card 2</div>
          </div>
          <div class="hero-cta">
            <a href="#vision" class="primary-cta">Primary CTA</a>
            <a href="#research" class="secondary-cta">Secondary CTA</a>
          </div>
          <div class="absolute particle"></div>
          <div class="scroll-indicator"></div>
        </section>
        <section id="vision">
          <h2 class="section-title">Vision</h2>
          <p class="section-subtitle">Subtitle</p>
          <div class="rounded-xl">Vision card</div>
        </section>
        <section id="research">
          <div class="rounded-xl">Research card</div>
        </section>
        <section id="blog">
          <div class="blog-card">Blog card</div>
        </section>
        <section id="contact">
          <div class="contact-card">Contact card</div>
        </section>
      </main>
      <button class="pillar-expand-btn" data-target="expandable-content" aria-expanded="false">
        <svg></svg>
      </button>
      <div id="expandable-content" style="display: none;"></div>
    `;
  });

  it('should respect reduced motion preferences', async () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await import('../src/scripts/animations.js');
    
    const animatedElements = document.querySelectorAll('.section-title');
    // Elements should not have opacity set to 0 when reduced motion is preferred
    animatedElements.forEach(element => {
      expect(element.style.opacity).not.toBe('0');
    });
  });

  it('should initialize scroll-triggered animations', async () => {
    await import('../src/scripts/animations.js');
    
    const sectionTitle = document.querySelector('.section-title');
    expect(sectionTitle.style.opacity).toBe('0');
    expect(sectionTitle.style.transform).toBe('translateY(30px)');
    expect(sectionTitle.dataset.animation).toBe('slide-up');
  });

  it('should handle smooth scrolling for navigation links', async () => {
    await import('../src/scripts/animations.js');
    
    const ctaLink = document.querySelector('a[href="#vision"]');
    const mockScrollTo = vi.fn();
    window.scrollTo = mockScrollTo;
    
    // Mock getBoundingClientRect and offsetTop
    document.querySelector('header').offsetHeight = 80;
    document.querySelector('#vision').offsetTop = 500;
    
    ctaLink.click();
    
    // Should prevent default behavior and not call window.scrollTo immediately
    // (because it uses requestAnimationFrame for smooth scrolling)
    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('should add hover effects to primary CTA buttons', async () => {
    await import('../src/scripts/animations.js');
    
    const primaryButton = document.querySelector('.primary-cta');
    
    // Trigger mouseenter
    const mouseEnterEvent = new Event('mouseenter');
    primaryButton.dispatchEvent(mouseEnterEvent);
    
    expect(primaryButton.style.transform).toBe('translateY(-3px) scale(1.02)');
    expect(primaryButton.style.boxShadow).toBe('0 15px 35px rgba(30, 58, 138, 0.4)');
    
    // Trigger mouseleave
    const mouseLeaveEvent = new Event('mouseleave');
    primaryButton.dispatchEvent(mouseLeaveEvent);
    
    expect(primaryButton.style.transform).toBe('');
    expect(primaryButton.style.boxShadow).toBe('');
  });

  it('should add hover effects to secondary CTA buttons', async () => {
    await import('../src/scripts/animations.js');
    
    const secondaryButton = document.querySelector('.secondary-cta');
    
    // Trigger mouseenter
    const mouseEnterEvent = new Event('mouseenter');
    secondaryButton.dispatchEvent(mouseEnterEvent);
    
    expect(secondaryButton.style.transform).toBe('translateY(-2px)');
    expect(secondaryButton.style.boxShadow).toBe('0 10px 25px rgba(30, 58, 138, 0.2)');
  });

  it('should handle expandable content animations', async () => {
    await import('../src/scripts/animations.js');
    
    const expandButton = document.querySelector('.pillar-expand-btn');
    const expandableContent = document.getElementById('expandable-content');
    
    // Mock scrollHeight
    Object.defineProperty(expandableContent, 'scrollHeight', {
      value: 200,
      writable: true
    });
    
    expandButton.click();
    
    expect(expandButton.getAttribute('aria-expanded')).toBe('true');
    expect(expandableContent.style.display).toBe('block');
    expect(expandableContent.style.maxHeight).toBe('0');
  });

  it('should handle scroll indicator click', async () => {
    await import('../src/scripts/animations.js');
    
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const visionSection = document.querySelector('#vision');
    
    // Mock scrollIntoView
    visionSection.scrollIntoView = vi.fn();
    
    scrollIndicator.click();
    
    expect(visionSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });
  });

  it('should initialize focus indicators for keyboard navigation', async () => {
    await import('../src/scripts/animations.js');
    
    const focusableElement = document.querySelector('.primary-cta');
    
    // Trigger focus
    const focusEvent = new Event('focus');
    focusableElement.dispatchEvent(focusEvent);
    
    expect(focusableElement.classList.contains('focused')).toBe(true);
    expect(focusableElement.style.transform).toBe('scale(1.02)');
    
    // Trigger blur
    const blurEvent = new Event('blur');
    focusableElement.dispatchEvent(blurEvent);
    
    expect(focusableElement.classList.contains('focused')).toBe(false);
    expect(focusableElement.style.transform).toBe('');
  });

  it('should handle keyboard interactions', async () => {
    await import('../src/scripts/animations.js');
    
    const focusableElement = document.querySelector('.primary-cta');
    
    // Trigger Enter key
    const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    focusableElement.dispatchEvent(keydownEvent);
    
    expect(focusableElement.classList.contains('active')).toBe(true);
    expect(focusableElement.style.transform).toBe('scale(0.98)');
    
    // Trigger keyup
    const keyupEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    focusableElement.dispatchEvent(keyupEvent);
    
    expect(focusableElement.classList.contains('active')).toBe(false);
    expect(focusableElement.style.transform).toBe('');
  });

  it('should observe elements for scroll animations', async () => {
    await import('../src/scripts/animations.js');
    
    const observeMock = global.IntersectionObserver.mock.results[0].value.observe;
    
    // Should observe multiple elements for animations
    expect(observeMock).toHaveBeenCalled();
    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        root: null,
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      })
    );
  });

  it('should handle scroll animations when elements intersect', async () => {
    await import('../src/scripts/animations.js');
    
    const observerCallback = global.IntersectionObserver.mock.calls[0][0];
    const sectionTitle = document.querySelector('.section-title');
    
    // Simulate element coming into view
    observerCallback([{
      target: sectionTitle,
      isIntersecting: true
    }]);
    
    expect(sectionTitle.style.opacity).toBe('1');
    expect(sectionTitle.style.transform).toBe('none');
    expect(sectionTitle.classList.contains('animate-slide-up')).toBe(true);
  });
});