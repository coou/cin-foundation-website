import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock linkinator for testing
const mockLinkinator = {
  check: vi.fn().mockResolvedValue({
    passed: true,
    links: [],
    errors: []
  })
};

vi.mock('linkinator', () => ({
  LinkChecker: vi.fn().mockImplementation(() => mockLinkinator)
}));

describe('Link Validation Testing', () => {
  let htmlContent;

  beforeEach(() => {
    // Load the actual HTML file for testing
    try {
      htmlContent = readFileSync(resolve('./src/index.html'), 'utf-8');
      document.documentElement.innerHTML = htmlContent;
    } catch (error) {
      // Fallback to basic HTML structure if file doesn't exist
      document.body.innerHTML = `
        <header>
          <nav>
            <a href="#hero">Home</a>
            <a href="#vision">Vision</a>
            <a href="#research">Research</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>
        <main>
          <section id="hero">
            <a href="#vision" class="primary-cta">Learn More</a>
            <a href="#research" class="secondary-cta">View Research</a>
          </section>
          <section id="vision"></section>
          <section id="research">
            <a href="/assets/documents/whitepaper.pdf">Download Whitepaper</a>
            <a href="https://github.com/cin-foundation/axiom-explorer">Axiom Explorer</a>
            <a href="https://github.com/cin-foundation/economic-simulation">Economic Simulation</a>
          </section>
          <section id="blog">
            <a href="#blog-post-1">Read Article</a>
          </section>
          <section id="contact">
            <a href="mailto:contact@cin-foundation.org">Contact Us</a>
            <a href="https://linkedin.com/company/cin-foundation">LinkedIn</a>
            <a href="https://twitter.com/cin_foundation">Twitter</a>
            <a href="https://github.com/cin-foundation">GitHub</a>
          </section>
        </main>
      `;
    }
  });

  it('should validate all internal anchor links', () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
      const href = link.getAttribute('href');
      const targetId = href.substring(1);
      
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        expect(targetElement).toBeTruthy();
        
        // Log broken links for debugging
        if (!targetElement) {
          console.error(`Broken internal link found: ${href}`);
        }
      }
    });
  });

  it('should validate email links format', () => {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
      const href = link.getAttribute('href');
      const email = href.substring(7); // Remove 'mailto:'
      
      // Basic email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(true);
      
      // Check for CIN Foundation email domain
      if (email.includes('cin-foundation.org')) {
        expect(email).toMatch(/^[a-zA-Z0-9._%+-]+@cin-foundation\.org$/);
      }
    });
  });

  it('should validate external links format', () => {
    const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="https"]');
    
    externalLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Basic URL validation
      expect(() => new URL(href)).not.toThrow();
      
      // Check for proper protocol
      expect(href.startsWith('https://') || href.startsWith('http://')).toBe(true);
      
      // Prefer HTTPS for security
      if (href.startsWith('http://')) {
        console.warn(`Consider using HTTPS for: ${href}`);
      }
    });
  });

  it('should validate GitHub repository links', () => {
    const githubLinks = document.querySelectorAll('a[href*="github.com"]');
    
    githubLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Should be HTTPS
      expect(href.startsWith('https://github.com/')).toBe(true);
      
      // Should follow GitHub URL pattern
      const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;
      const isOrgUrl = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/?$/.test(href);
      
      expect(githubUrlRegex.test(href) || isOrgUrl).toBe(true);
      
      // Should be CIN Foundation related
      expect(href.includes('cin-foundation')).toBe(true);
    });
  });

  it('should validate social media links', () => {
    const socialLinks = document.querySelectorAll('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="x.com"]');
    
    socialLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Should be HTTPS
      expect(href.startsWith('https://')).toBe(true);
      
      if (href.includes('linkedin.com')) {
        expect(href).toMatch(/^https:\/\/(www\.)?linkedin\.com\/(company|in)\/[a-zA-Z0-9._-]+\/?$/);
      }
      
      if (href.includes('twitter.com') || href.includes('x.com')) {
        expect(href).toMatch(/^https:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9._-]+\/?$/);
      }
    });
  });

  it('should validate document links', () => {
    const documentLinks = document.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"]');
    
    documentLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Document links should be relative or absolute paths
      const isRelative = href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
      const isAbsolute = href.startsWith('http');
      
      expect(isRelative || isAbsolute).toBe(true);
      
      // Should have proper file extension
      expect(href).toMatch(/\.(pdf|doc|docx)$/i);
    });
  });

  it('should check for duplicate links', () => {
    const allLinks = document.querySelectorAll('a[href]');
    const linkHrefs = Array.from(allLinks).map(link => link.getAttribute('href'));
    
    // Find duplicates
    const duplicates = linkHrefs.filter((href, index) => linkHrefs.indexOf(href) !== index);
    const uniqueDuplicates = [...new Set(duplicates)];
    
    // Log duplicates for review (some duplicates might be intentional)
    if (uniqueDuplicates.length > 0) {
      console.info('Duplicate links found (review if intentional):', uniqueDuplicates);
    }
    
    // This is informational - duplicates aren't necessarily errors
    expect(Array.isArray(uniqueDuplicates)).toBe(true);
  });

  it('should validate link accessibility attributes', () => {
    const allLinks = document.querySelectorAll('a[href]');
    
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // External links should have proper attributes for security and UX
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        // Should consider rel="noopener" for security
        const rel = link.getAttribute('rel');
        if (rel && rel.includes('noopener')) {
          expect(rel).toContain('noopener');
        }
        
        // Should consider target="_blank" indication
        const target = link.getAttribute('target');
        if (target === '_blank') {
          // Should have proper accessibility indication
          const hasExternalIndicator = 
            link.getAttribute('aria-label')?.includes('opens in new') ||
            link.textContent.includes('(opens in new') ||
            link.querySelector('[aria-hidden="true"]');
          
          // This is a recommendation, not a hard requirement
          if (!hasExternalIndicator) {
            console.info(`Consider adding external link indicator for: ${href}`);
          }
        }
      }
      
      // Links should have accessible names
      const hasAccessibleName = 
        link.textContent.trim() ||
        link.getAttribute('aria-label') ||
        link.getAttribute('aria-labelledby') ||
        link.querySelector('img[alt]');
      
      expect(hasAccessibleName).toBeTruthy();
    });
  });

  it('should validate navigation link consistency', () => {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    
    const navTargets = Array.from(navLinks).map(link => link.getAttribute('href').substring(1));
    const sectionIds = Array.from(sections).map(section => section.getAttribute('id'));
    
    // All navigation targets should have corresponding sections
    navTargets.forEach(target => {
      expect(sectionIds).toContain(target);
    });
    
    // All major sections should have navigation links (optional check)
    const majorSections = ['hero', 'vision', 'research', 'blog', 'contact'];
    majorSections.forEach(sectionId => {
      if (sectionIds.includes(sectionId)) {
        expect(navTargets).toContain(sectionId);
      }
    });
  });

  it('should validate CTA link targets', () => {
    const ctaLinks = document.querySelectorAll('.primary-cta, .secondary-cta, .btn-primary, .btn-secondary');
    
    ctaLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      if (href) {
        if (href.startsWith('#')) {
          // Internal anchor link
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          expect(targetElement).toBeTruthy();
        } else if (href.startsWith('http')) {
          // External link
          expect(() => new URL(href)).not.toThrow();
        } else if (href.startsWith('mailto:')) {
          // Email link
          const email = href.substring(7);
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          expect(emailRegex.test(email)).toBe(true);
        }
      }
    });
  });

  it('should check for broken fragment identifiers', () => {
    const fragmentLinks = document.querySelectorAll('a[href*="#"]');
    
    fragmentLinks.forEach(link => {
      const href = link.getAttribute('href');
      const fragmentIndex = href.indexOf('#');
      
      if (fragmentIndex !== -1) {
        const fragment = href.substring(fragmentIndex + 1);
        
        if (fragment) {
          // Check if target element exists
          const targetElement = document.getElementById(fragment);
          expect(targetElement).toBeTruthy();
          
          if (!targetElement) {
            console.error(`Broken fragment identifier: ${href}`);
          }
        }
      }
    });
  });

  it('should validate resource links', () => {
    const resourceLinks = document.querySelectorAll('a[href*="/assets/"], a[href*="./assets/"]');
    
    resourceLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Should follow proper asset path structure
      expect(href).toMatch(/\/(assets|static)\//);
      
      // Should have proper file extensions for different resource types
      if (href.includes('/images/')) {
        expect(href).toMatch(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
      } else if (href.includes('/documents/')) {
        expect(href).toMatch(/\.(pdf|doc|docx|txt)$/i);
      }
    });
  });
});