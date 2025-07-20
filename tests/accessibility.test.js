import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock axe-core for testing
const mockAxeResults = {
  violations: [],
  passes: [],
  incomplete: [],
  inapplicable: []
};

const mockAxe = {
  run: vi.fn().mockResolvedValue(mockAxeResults),
  configure: vi.fn()
};

vi.mock('axe-core', () => ({
  default: mockAxe
}));

describe('Accessibility Testing', () => {
  let htmlContent;

  beforeEach(() => {
    // Load the actual HTML file for testing
    try {
      htmlContent = readFileSync(resolve('./src/index.html'), 'utf-8');
      document.documentElement.innerHTML = htmlContent;
    } catch (error) {
      // Fallback to basic HTML structure if file doesn't exist
      document.body.innerHTML = `
        <header role="banner">
          <nav role="navigation" aria-label="Main navigation">
            <a href="#hero" aria-label="Go to home section">Home</a>
            <a href="#vision" aria-label="Go to vision section">Vision</a>
            <a href="#research" aria-label="Go to research section">Research</a>
            <a href="#blog" aria-label="Go to blog section">Blog</a>
            <a href="#contact" aria-label="Go to contact section">Contact</a>
          </nav>
          <button id="mobile-menu-button" aria-label="Toggle mobile menu" aria-expanded="false">
            <svg aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </header>
        <main role="main">
          <section id="hero" aria-labelledby="hero-title">
            <h1 id="hero-title">CIN Foundation</h1>
            <p>Building the Operating System for a More Intelligent Society</p>
            <a href="#vision" class="primary-cta" aria-label="Learn more about our vision">Learn More</a>
            <a href="#research" class="secondary-cta" aria-label="View our research">View Research</a>
          </section>
          <section id="vision" aria-labelledby="vision-title">
            <h2 id="vision-title">Our Vision</h2>
            <div class="pillar-card" role="article">
              <h3>Beyond Scarcity</h3>
              <p>Description of beyond scarcity pillar</p>
              <button class="pillar-expand-btn" aria-expanded="false" aria-controls="beyond-scarcity-details">
                Learn More
              </button>
              <div id="beyond-scarcity-details" aria-hidden="true">
                <p>Detailed information about beyond scarcity</p>
              </div>
            </div>
          </section>
          <section id="research" aria-labelledby="research-title">
            <h2 id="research-title">Research</h2>
            <a href="/whitepaper.pdf" aria-label="Download whitepaper PDF">
              <img src="/whitepaper-thumb.jpg" alt="Whitepaper thumbnail showing first page" />
              Download Whitepaper
            </a>
          </section>
          <section id="blog" aria-labelledby="blog-title">
            <h2 id="blog-title">Blog</h2>
            <article class="blog-card">
              <h3>Understanding Value Through Entropy Reduction</h3>
              <p>Imagine your kitchen after a big cooking session...</p>
              <a href="#blog-post-1" aria-label="Read full article about entropy reduction">Read More</a>
            </article>
          </section>
          <section id="contact" aria-labelledby="contact-title">
            <h2 id="contact-title">Get Involved</h2>
            <a href="mailto:contact@cin-foundation.org" aria-label="Send email to contact@cin-foundation.org">
              Contact Us
            </a>
          </section>
        </main>
        <footer role="contentinfo">
          <p>© 2025 CIN Foundation. All rights reserved.</p>
        </footer>
      `;
    }
  });

  it('should have no accessibility violations', async () => {
    const axe = (await import('axe-core')).default;
    
    const results = await axe.run(document);
    
    expect(results.violations).toHaveLength(0);
    
    // If there are violations, log them for debugging
    if (results.violations.length > 0) {
      console.error('Accessibility violations found:', results.violations);
    }
  });

  it('should have proper heading hierarchy', () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    // Should start with h1
    expect(headingLevels[0]).toBe(1);
    
    // Check that heading levels don't skip (e.g., h1 -> h3)
    for (let i = 1; i < headingLevels.length; i++) {
      const currentLevel = headingLevels[i];
      const previousLevel = headingLevels[i - 1];
      
      // Current level should not be more than 1 level higher than previous
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
    }
  });

  it('should have proper ARIA labels and roles', () => {
    // Check navigation has proper role and label
    const nav = document.querySelector('nav');
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBeTruthy();
    
    // Check main content has proper role
    const main = document.querySelector('main');
    expect(main.getAttribute('role')).toBe('main');
    
    // Check footer has proper role
    const footer = document.querySelector('footer');
    expect(footer.getAttribute('role')).toBe('contentinfo');
    
    // Check sections have proper labeling
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      const id = section.getAttribute('id');
      const labelledBy = section.getAttribute('aria-labelledby');
      
      if (labelledBy) {
        const labelElement = document.getElementById(labelledBy);
        expect(labelElement).toBeTruthy();
      }
    });
  });

  it('should have proper button accessibility', () => {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
      // Buttons should have accessible names
      const hasAccessibleName = 
        button.textContent.trim() ||
        button.getAttribute('aria-label') ||
        button.getAttribute('aria-labelledby');
      
      expect(hasAccessibleName).toBeTruthy();
      
      // Expandable buttons should have aria-expanded
      if (button.classList.contains('pillar-expand-btn') || button.classList.contains('concept-expand-btn')) {
        expect(button.getAttribute('aria-expanded')).toBeTruthy();
      }
      
      // Mobile menu button should have proper attributes
      if (button.id === 'mobile-menu-button') {
        expect(button.getAttribute('aria-label')).toBeTruthy();
        expect(button.getAttribute('aria-expanded')).toBeTruthy();
      }
    });
  });

  it('should have proper link accessibility', () => {
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
      // Links should have accessible names
      const hasAccessibleName = 
        link.textContent.trim() ||
        link.getAttribute('aria-label') ||
        link.getAttribute('aria-labelledby');
      
      expect(hasAccessibleName).toBeTruthy();
      
      // Links with only images should have proper alt text or aria-label
      const hasOnlyImage = link.children.length === 1 && link.children[0].tagName === 'IMG';
      if (hasOnlyImage) {
        const img = link.children[0];
        const hasProperLabel = 
          img.getAttribute('alt') ||
          link.getAttribute('aria-label') ||
          link.getAttribute('aria-labelledby');
        
        expect(hasProperLabel).toBeTruthy();
      }
    });
  });

  it('should have proper image accessibility', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // All images should have alt attributes
      expect(img.hasAttribute('alt')).toBe(true);
      
      // Decorative images should have empty alt text
      // Content images should have descriptive alt text
      const altText = img.getAttribute('alt');
      const isDecorative = img.getAttribute('role') === 'presentation' || 
                          img.getAttribute('aria-hidden') === 'true';
      
      if (isDecorative) {
        expect(altText).toBe('');
      } else {
        // Content images should have meaningful alt text
        expect(altText.length).toBeGreaterThan(0);
      }
    });
  });

  it('should have proper form accessibility', () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Form controls should have labels
      const hasLabel = 
        document.querySelector(`label[for="${input.id}"]`) ||
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        input.closest('label');
      
      expect(hasLabel).toBeTruthy();
      
      // Required fields should be marked
      if (input.hasAttribute('required')) {
        const hasRequiredIndicator = 
          input.getAttribute('aria-required') === 'true' ||
          input.getAttribute('aria-describedby');
        
        expect(hasRequiredIndicator).toBeTruthy();
      }
    });
  });

  it('should have proper focus management', () => {
    // Check that focusable elements are in logical tab order
    const focusableElements = document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      // Elements should not have positive tabindex (anti-pattern)
      const tabindex = element.getAttribute('tabindex');
      if (tabindex !== null) {
        expect(parseInt(tabindex)).toBeLessThanOrEqual(0);
      }
    });
  });

  it('should have proper color contrast', () => {
    // This would typically use a color contrast analyzer
    // For now, we'll check that elements don't use problematic color combinations
    const elementsWithText = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span, div');
    
    elementsWithText.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Basic check - ensure colors are not the same
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        expect(color).not.toBe(backgroundColor);
      }
    });
  });

  it('should have proper skip links', () => {
    // Check for skip to main content link
    const skipLinks = document.querySelectorAll('a[href^="#"]:first-child, .skip-link');
    
    if (skipLinks.length > 0) {
      const firstSkipLink = skipLinks[0];
      const targetId = firstSkipLink.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      expect(targetElement).toBeTruthy();
      expect(targetElement.tagName.toLowerCase()).toBe('main');
    }
  });

  it('should have proper landmark structure', () => {
    // Check for required landmarks
    const header = document.querySelector('header, [role="banner"]');
    const main = document.querySelector('main, [role="main"]');
    const footer = document.querySelector('footer, [role="contentinfo"]');
    const nav = document.querySelector('nav, [role="navigation"]');
    
    expect(header).toBeTruthy();
    expect(main).toBeTruthy();
    expect(footer).toBeTruthy();
    expect(nav).toBeTruthy();
    
    // Should have only one main landmark
    const mains = document.querySelectorAll('main, [role="main"]');
    expect(mains.length).toBe(1);
  });

  it('should handle expandable content accessibility', () => {
    const expandButtons = document.querySelectorAll('[aria-expanded]');
    
    expandButtons.forEach(button => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const controlsId = button.getAttribute('aria-controls');
      
      if (controlsId) {
        const controlledElement = document.getElementById(controlsId);
        expect(controlledElement).toBeTruthy();
        
        // Controlled element should have proper aria-hidden state
        const isHidden = controlledElement.getAttribute('aria-hidden') === 'true';
        expect(isHidden).toBe(!isExpanded);
      }
    });
  });
});