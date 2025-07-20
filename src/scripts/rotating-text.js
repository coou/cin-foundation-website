// Rotating text functionality for the hero section
class RotatingText {
  constructor() {
    this.phrases = [
      // Category 1: Foundational & Technical Metaphors
      "Operating System",
      "Core Protocol",
      "Foundational Layer",
      "Trust Substrate",
      "Coordination Framework",
      "Social Algorithm",
      "Decentralized Kernel",
      "Global Source Code",
      "Public Mainframe",
      "Trust Architecture",
      "Societal Stack",
      
      // Category 2: Economic & Value Metaphors
      "Economic Engine",
      "Value Spectrum",
      "Trust Ledger",
      "Reputation Economy",
      "Comfort Compass",
      "Post-Scarcity Blueprint",
      "Engine of Abundance",
      "Currency of Trust",
      "Public Balance Sheet",
      "Ledger of Contribution",
      
      // Category 3: Cognitive & Intelligence Metaphors
      "Collective Mind",
      "Global Brain",
      "Shared Consciousness",
      "Planetary Nervous System",
      "Public Imagination",
      "Civic Superintelligence",
      "Distributed Mind",
      "Symbiotic Intellect",
      "Networked Mind",
      "Human Exocortex",
      
      // Category 4: Biological & Ecological Metaphors
      "Social Fabric",
      "Digital Mycelium",
      "Human Hive Mind",
      "Economic Ecosystem",
      "Social Genome",
      "Planetary Immune System",
      "Civic Root System",
      "Symbiotic Superorganism",
      "Digital Biosphere",
      "Collective Metabolism",
      
      // Category 5: Navigational & Architectural Metaphors
      "Social Compass",
      "Human Roadmap",
      "Architectural Blueprint",
      "Moral Compass",
      "Star Chart to the Future",
      "Societal Scaffolding",
      "Bridge to a Better World",
      "New Public Square",
      "Civic Architecture",
      "Framework for Flourishing"
    ];
    
    this.currentIndex = 0;
    this.element = document.getElementById('rotating-text');
    this.isAnimating = false;
    this.rotationInterval = null;
    this.typeInterval = null;
    this.eraseInterval = null;
    
    if (this.element) {
      this.init();
    }
  }
  
  init() {
    // Clear any existing intervals first
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
    
    // Start the rotation after a delay
    setTimeout(() => {
      this.startRotation();
    }, 3000); // Wait 3 seconds before starting rotation
  }
  
  startRotation() {
    // Clear any existing interval
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
    
    // Start new interval
    this.rotationInterval = setInterval(() => {
      if (!this.isAnimating) {
        this.rotateText();
      }
    }, 5000); // Change text every 5 seconds (increased for stability)
  }
  
  rotateText() {
    if (!this.element || this.isAnimating) return;
    
    this.isAnimating = true;
    
    // Alternate between effects
    const effects = ['fade', 'typewriter'];
    const effect = effects[this.currentIndex % 2];
    
    if (effect === 'typewriter') {
      this.typewriterTransition();
    } else {
      this.fadeTransition();
    }
  }
  
  typewriterTransition() {
    // Clear any existing intervals
    this.clearIntervals();
    
    const currentText = this.element.textContent;
    let currentLength = currentText.length;
    
    // Erase current text
    this.eraseInterval = setInterval(() => {
      if (currentLength > 0) {
        this.element.textContent = currentText.substring(0, currentLength - 1);
        currentLength--;
      } else {
        clearInterval(this.eraseInterval);
        
        // Start typing new text
        setTimeout(() => {
          this.currentIndex = (this.currentIndex + 1) % this.phrases.length;
          const newText = this.phrases[this.currentIndex];
          let newLength = 0;
          
          this.typeInterval = setInterval(() => {
            if (newLength <= newText.length) {
              this.element.textContent = newText.substring(0, newLength);
              newLength++;
            } else {
              clearInterval(this.typeInterval);
              this.isAnimating = false;
            }
          }, 50); // Type each character every 50ms
          
        }, 200); // Pause between erase and type
      }
    }, 30); // Erase each character every 30ms
  }
  
  clearIntervals() {
    if (this.typeInterval) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }
    if (this.eraseInterval) {
      clearInterval(this.eraseInterval);
      this.eraseInterval = null;
    }
  }
  
  // Alternative: Simple fade transition (more reliable)
  fadeTransition() {
    // Fade out
    this.element.style.opacity = '0';
    this.element.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      // Change text
      this.currentIndex = (this.currentIndex + 1) % this.phrases.length;
      this.element.textContent = this.phrases[this.currentIndex];
      
      // Fade in
      this.element.style.opacity = '1';
      this.element.style.transform = 'translateY(0)';
      
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);
      
    }, 300);
  }
  
  // Method to pause rotation (useful for user interactions)
  pause() {
    this.isPaused = true;
  }
  
  // Method to resume rotation
  resume() {
    this.isPaused = false;
  }
}

// Prevent multiple instances
if (!window.rotatingTextInstance) {
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.rotatingTextInstance = new RotatingText();
    });
  } else {
    window.rotatingTextInstance = new RotatingText();
  }
}