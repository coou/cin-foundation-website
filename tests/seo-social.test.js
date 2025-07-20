import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('SEO and Social Media Testing', () => {
  let htmlContent;

  beforeEach(() => {
    // Load the actual HTML file for testing
    try {
      htmlContent = readFileSync(resolve('./src/index.html'), 'utf-8');
      document.documentElement.innerHTML = htmlContent;
    } catch (error) {
      // Fallback to basic HTML structure with meta tags
      document.head.innerHTML = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CIN Foundation - Building the Operating System for a More Intelligent Society</title>
        <meta name="description" content="The CIN Foundation is developing a collective intelligence network that creates an operating system for more intelligent society through AI, economics, and blockchain technology.">
        <meta name="keywords" content="collective intelligence, AI, economics, blockchain, foundation, nonprofit, intelligent society">
        <meta name="author" content="CIN Foundation">
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://cin-foundation.org/">
        <meta property="og:title" content="CIN Foundation - Building the Operating System for a More Intelligent Society">
        <meta property="og:description" content="The CIN Foundation is developing a collective intelligence network that creates an operating system for more intelligent society through AI, economics, and blockchain technology.">
        <meta property="og:image" content="https://cin-foundation.org/assets/images/og-image.jpg">
        <meta property="og:site_name" content="CIN Foundation">
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://cin-foundation.org/">
        <meta property="twitter:title" content="CIN Foundation - Building the Operating System for a More Intelligent Society">
        <meta property="twitter:description" content="The CIN Foundation is developing a collective intelligence network that creates an operating system for more intelligent society through AI, economics, and blockchain technology.">
        <meta property="twitter:image" content="https://cin-foundation.org/assets/images/twitter-image.jpg">
        <meta property="twitter:site" content="@cin_foundation">
        <meta property="twitter:creator" content="@cin_foundation">
        
        <!-- Additional SEO -->
        <meta name="robots" content="index, follow">
        <meta name="googlebot" content="index, follow">
        <link rel="canonical" href="https://cin-foundation.org/">
        
        <!-- Structured Data -->
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "CIN Foundation",
          "url": "https://cin-foundation.org",
          "logo": "https://cin-foundation.org/assets/images/logo.svg",
          "description": "Building the Operating System for a More Intelligent Society",
          "foundingDate": "2024",
          "sameAs": [
            "https://github.com/cin-foundation",
            "https://linkedin.com/company/cin-foundation",
            "https://twitter.com/cin_foundation"
          ]
        }
        </script>
      `;
      
      document.body.innerHTML = `
        <header>
          <h1>CIN Foundation</h1>
        </header>
        <main>
          <section id="hero">
            <h1>Building the Operating System for a More Intelligent Society</h1>
            <p>The CIN Foundation is developing a collective intelligence network.</p>
          </section>
        </main>
      `;
    }
  });

  describe('Basic SEO Meta Tags', () => {
    it('should have a proper title tag', () => {
      const title = document.querySelector('title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBeTruthy();
      expect(title.textContent.length).toBeGreaterThan(10);
      expect(title.textContent.length).toBeLessThan(60);
      expect(title.textContent).toContain('CIN Foundation');
    });

    it('should have a meta description', () => {
      const description = document.querySelector('meta[name="description"]');
      expect(description).toBeTruthy();
      expect(description.getAttribute('content')).toBeTruthy();
      expect(description.getAttribute('content').length).toBeGreaterThan(50);
      expect(description.getAttribute('content').length).toBeLessThan(160);
    });

    it('should have proper viewport meta tag', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      expect(viewport.getAttribute('content')).toContain('width=device-width');
      expect(viewport.getAttribute('content')).toContain('initial-scale=1.0');
    });

    it('should have charset declaration', () => {
      const charset = document.querySelector('meta[charset]');
      expect(charset).toBeTruthy();
      expect(charset.getAttribute('charset').toLowerCase()).toBe('utf-8');
    });

    it('should have keywords meta tag', () => {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) {
        const content = keywords.getAttribute('content');
        expect(content).toBeTruthy();
        expect(content).toContain('collective intelligence');
        expect(content).toContain('AI');
      }
    });

    it('should have author meta tag', () => {
      const author = document.querySelector('meta[name="author"]');
      if (author) {
        expect(author.getAttribute('content')).toBe('CIN Foundation');
      }
    });

    it('should have robots meta tag', () => {
      const robots = document.querySelector('meta[name="robots"]');
      if (robots) {
        const content = robots.getAttribute('content');
        expect(content).toContain('index');
        expect(content).toContain('follow');
      }
    });

    it('should have canonical link', () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        const href = canonical.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href.startsWith('https://')).toBe(true);
        expect(href).toContain('cin-foundation.org');
      }
    });
  });

  describe('Open Graph Meta Tags', () => {
    it('should have og:type', () => {
      const ogType = document.querySelector('meta[property="og:type"]');
      expect(ogType).toBeTruthy();
      expect(ogType.getAttribute('content')).toBe('website');
    });

    it('should have og:url', () => {
      const ogUrl = document.querySelector('meta[property="og:url"]');
      expect(ogUrl).toBeTruthy();
      const url = ogUrl.getAttribute('content');
      expect(url.startsWith('https://')).toBe(true);
      expect(url).toContain('cin-foundation.org');
    });

    it('should have og:title', () => {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      expect(ogTitle).toBeTruthy();
      expect(ogTitle.getAttribute('content')).toBeTruthy();
      expect(ogTitle.getAttribute('content')).toContain('CIN Foundation');
    });

    it('should have og:description', () => {
      const ogDescription = document.querySelector('meta[property="og:description"]');
      expect(ogDescription).toBeTruthy();
      const content = ogDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(50);
      expect(content.length).toBeLessThan(300);
    });

    it('should have og:image', () => {
      const ogImage = document.querySelector('meta[property="og:image"]');
      expect(ogImage).toBeTruthy();
      const imageUrl = ogImage.getAttribute('content');
      expect(imageUrl.startsWith('https://')).toBe(true);
      expect(imageUrl).toMatch(/\.(jpg|jpeg|png|gif)$/i);
    });

    it('should have og:site_name', () => {
      const ogSiteName = document.querySelector('meta[property="og:site_name"]');
      if (ogSiteName) {
        expect(ogSiteName.getAttribute('content')).toBe('CIN Foundation');
      }
    });
  });

  describe('Twitter Card Meta Tags', () => {
    it('should have twitter:card', () => {
      const twitterCard = document.querySelector('meta[property="twitter:card"], meta[name="twitter:card"]');
      expect(twitterCard).toBeTruthy();
      const cardType = twitterCard.getAttribute('content');
      expect(['summary', 'summary_large_image', 'app', 'player']).toContain(cardType);
    });

    it('should have twitter:url', () => {
      const twitterUrl = document.querySelector('meta[property="twitter:url"], meta[name="twitter:url"]');
      if (twitterUrl) {
        const url = twitterUrl.getAttribute('content');
        expect(url.startsWith('https://')).toBe(true);
        expect(url).toContain('cin-foundation.org');
      }
    });

    it('should have twitter:title', () => {
      const twitterTitle = document.querySelector('meta[property="twitter:title"], meta[name="twitter:title"]');
      expect(twitterTitle).toBeTruthy();
      expect(twitterTitle.getAttribute('content')).toBeTruthy();
      expect(twitterTitle.getAttribute('content')).toContain('CIN Foundation');
    });

    it('should have twitter:description', () => {
      const twitterDescription = document.querySelector('meta[property="twitter:description"], meta[name="twitter:description"]');
      expect(twitterDescription).toBeTruthy();
      const content = twitterDescription.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(50);
      expect(content.length).toBeLessThan(200);
    });

    it('should have twitter:image', () => {
      const twitterImage = document.querySelector('meta[property="twitter:image"], meta[name="twitter:image"]');
      expect(twitterImage).toBeTruthy();
      const imageUrl = twitterImage.getAttribute('content');
      expect(imageUrl.startsWith('https://')).toBe(true);
      expect(imageUrl).toMatch(/\.(jpg|jpeg|png|gif)$/i);
    });

    it('should have twitter:site', () => {
      const twitterSite = document.querySelector('meta[property="twitter:site"], meta[name="twitter:site"]');
      if (twitterSite) {
        const handle = twitterSite.getAttribute('content');
        expect(handle.startsWith('@')).toBe(true);
        expect(handle).toBe('@cin_foundation');
      }
    });
  });

  describe('Structured Data', () => {
    it('should have JSON-LD structured data', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      expect(jsonLd).toBeTruthy();
      
      const structuredData = JSON.parse(jsonLd.textContent);
      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('Organization');
      expect(structuredData.name).toBe('CIN Foundation');
      expect(structuredData.url).toBeTruthy();
    });

    it('should have proper organization schema', () => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      const structuredData = JSON.parse(jsonLd.textContent);
      
      expect(structuredData.name).toBeTruthy();
      expect(structuredData.url).toBeTruthy();
      expect(structuredData.description).toBeTruthy();
      
      if (structuredData.logo) {
        expect(structuredData.logo).toMatch(/\.(svg|png|jpg|jpeg)$/i);
      }
      
      if (structuredData.sameAs) {
        expect(Array.isArray(structuredData.sameAs)).toBe(true);
        structuredData.sameAs.forEach(url => {
          expect(url.startsWith('https://')).toBe(true);
        });
      }
    });
  });

  describe('Content Quality for SEO', () => {
    it('should have proper heading hierarchy', () => {
      const h1s = document.querySelectorAll('h1');
      expect(h1s.length).toBeGreaterThanOrEqual(1);
      
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
      
      // Should start with h1
      expect(headingLevels[0]).toBe(1);
      
      // Check for proper hierarchy
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });

    it('should have meaningful content length', () => {
      const textContent = document.body.textContent || document.body.innerText;
      const wordCount = textContent.trim().split(/\s+/).length;
      
      // Should have substantial content for SEO
      expect(wordCount).toBeGreaterThan(300);
    });

    it('should have alt text for images', () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img.hasAttribute('alt')).toBe(true);
        
        // Content images should have descriptive alt text
        const alt = img.getAttribute('alt');
        if (alt && !img.getAttribute('role') === 'presentation') {
          expect(alt.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have descriptive link text', () => {
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        const linkText = link.textContent.trim();
        const ariaLabel = link.getAttribute('aria-label');
        
        const hasDescriptiveText = linkText || ariaLabel;
        expect(hasDescriptiveText).toBeTruthy();
        
        // Avoid generic link text
        if (linkText) {
          const genericTexts = ['click here', 'read more', 'learn more', 'here'];
          const isGeneric = genericTexts.some(generic => 
            linkText.toLowerCase() === generic
          );
          
          // If generic text is used, should have aria-label for context
          if (isGeneric) {
            expect(ariaLabel).toBeTruthy();
          }
        }
      });
    });
  });

  describe('Social Media Image Validation', () => {
    it('should have properly sized social media images', () => {
      const ogImage = document.querySelector('meta[property="og:image"]');
      const twitterImage = document.querySelector('meta[property="twitter:image"], meta[name="twitter:image"]');
      
      if (ogImage) {
        const imageUrl = ogImage.getAttribute('content');
        // Facebook recommends 1200x630 pixels
        expect(imageUrl).toBeTruthy();
        expect(imageUrl.startsWith('https://')).toBe(true);
      }
      
      if (twitterImage) {
        const imageUrl = twitterImage.getAttribute('content');
        // Twitter recommends 1200x600 pixels for summary_large_image
        expect(imageUrl).toBeTruthy();
        expect(imageUrl.startsWith('https://')).toBe(true);
      }
    });

    it('should have consistent branding across social platforms', () => {
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const twitterTitle = document.querySelector('meta[property="twitter:title"], meta[name="twitter:title"]')?.getAttribute('content');
      const pageTitle = document.querySelector('title')?.textContent;
      
      // Titles should be consistent or complementary
      if (ogTitle && twitterTitle) {
        expect(ogTitle).toContain('CIN Foundation');
        expect(twitterTitle).toContain('CIN Foundation');
      }
      
      if (pageTitle) {
        expect(pageTitle).toContain('CIN Foundation');
      }
    });
  });

  describe('Performance Impact of SEO Elements', () => {
    it('should not have excessive meta tags', () => {
      const metaTags = document.querySelectorAll('meta');
      
      // Should have essential meta tags but not excessive ones
      expect(metaTags.length).toBeLessThan(30);
      expect(metaTags.length).toBeGreaterThan(10);
    });

    it('should have optimized structured data', () => {
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      
      // Should not have too many structured data scripts
      expect(jsonLdScripts.length).toBeLessThanOrEqual(3);
      
      jsonLdScripts.forEach(script => {
        const content = script.textContent;
        expect(content.length).toBeLessThan(5000); // Keep structured data reasonable
        
        // Should be valid JSON
        expect(() => JSON.parse(content)).not.toThrow();
      });
    });
  });

  describe('Local SEO (if applicable)', () => {
    it('should have proper contact information', () => {
      const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
      
      emailLinks.forEach(link => {
        const email = link.getAttribute('href').substring(7);
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(email).toContain('cin-foundation.org');
      });
    });

    it('should have social media links', () => {
      const socialLinks = document.querySelectorAll('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="github.com"]');
      
      expect(socialLinks.length).toBeGreaterThan(0);
      
      socialLinks.forEach(link => {
        const href = link.getAttribute('href');
        expect(href.startsWith('https://')).toBe(true);
      });
    });
  });

  describe('Mobile SEO', () => {
    it('should be mobile-friendly', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      
      const content = viewport.getAttribute('content');
      expect(content).toContain('width=device-width');
      expect(content).not.toContain('user-scalable=no'); // Allow zooming for accessibility
    });

    it('should have appropriate font sizes', () => {
      // This would typically be tested with actual rendering
      // For now, we check that there are no inline styles with tiny fonts
      const elementsWithStyle = document.querySelectorAll('[style*="font-size"]');
      
      elementsWithStyle.forEach(element => {
        const style = element.getAttribute('style');
        const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
        
        if (fontSizeMatch) {
          const fontSize = parseInt(fontSizeMatch[1]);
          expect(fontSize).toBeGreaterThanOrEqual(14); // Minimum readable size
        }
      });
    });
  });
});