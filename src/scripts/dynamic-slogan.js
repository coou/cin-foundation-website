class DynamicSloganComponent {
  constructor(elementId, phrases, config = {}) {
    this.element = document.getElementById(elementId);
    this.phrases = phrases;
    this.currentIndex = 0;
    this.isAnimating = false;
    
    this.config = {
      minInterval: config.minInterval || 4000,
      maxInterval: config.maxInterval || 8000,
      startDelay: config.startDelay || 0
    };
    
    if (this.element && this.phrases.length > 1) {
      this.init();
    }
  }
  
  init() {
    const startDelay = this.config.startDelay + Math.random() * 2000;
    
    setTimeout(() => {
      this.startRotation();
    }, startDelay);
  }
  
  startRotation() {
    const scheduleNext = () => {
      const interval = this.config.minInterval + 
        Math.random() * (this.config.maxInterval - this.config.minInterval);
      
      setTimeout(() => {
        if (!this.isAnimating) {
          this.rotateText();
        }
        scheduleNext();
      }, interval);
    };
    
    scheduleNext();
  }
  
  rotateText() {
    if (!this.element || this.isAnimating) return;
    
    this.isAnimating = true;
    this.fadeTransition();
  }
  
  fadeTransition() {
    const fadeDuration = 400 + Math.random() * 200;
    
    this.element.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
    this.element.style.opacity = '0';
    
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.phrases.length;
      this.element.textContent = this.phrases[this.currentIndex];
      
      this.element.style.opacity = '1';
      
      setTimeout(() => {
        this.isAnimating = false;
      }, fadeDuration);
      
    }, fadeDuration);
  }
}

// Initialize components
const actionPhrases = [
  "Building the", "Architecting the", "Designing the", "Engineering the", "Forging the", "Crafting the",
  "Assembling the", "Weaving the", "Scaffolding the", "Cultivating the", "Nurturing the", "Seeding the",
  "Growing the", "Fostering the", "Enabling the", "Unlocking the", "Pioneering the", "Imagining the",
  "Bootstrapping the", "Catalyzing the"
];
const creationPhrases = [
  "Operating System", "Core Protocol", "Foundational Layer", "Trust Substrate",
  "Coordination Framework", "Social Algorithm", "Decentralized Kernel", "Global Source Code",
  "Public Mainframe", "Trust Architecture", "Societal Stack", "Economic Engine",
  "Value Spectrum", "Trust Ledger", "Reputation Economy", "Comfort Compass",
  "Post-Scarcity Blueprint", "Engine of Abundance", "Currency of Trust", "Public Balance Sheet",
  "Ledger of Contribution", "Collective Mind", "Global Brain", "Shared Consciousness",
  "Planetary Nervous System", "Public Imagination", "Civic Superintelligence", "Distributed Mind",
  "Symbiotic Intellect", "Networked Mind", "Human Exocortex", "Social Fabric",
  "Digital Mycelium", "Human Hive Mind", "Economic Ecosystem", "Social Genome",
  "Planetary Immune System", "Civic Root System", "Symbiotic Superorganism", "Digital Biosphere",
  "Collective Metabolism", "Social Compass", "Human Roadmap", "Architectural Blueprint",
  "Moral Compass", "Star Chart to the Future", "Societal Scaffolding", "Bridge to a Better World",
  "New Public Square", "Civic Architecture", "Framework for Flourishing"
];
const visionPhrases = [
  "for a More Intelligent Society", "for a More Compassionate World", "for a More Equitable Society",
  "for a More Collaborative Humanity", "for a Society Built on Trust", "for a Just and Humane Future",
  "for a World of Shared Purpose", "for a Comfort-First Society", "for a World Without Scarcity",
  "for an Economy of Purpose", "for a Just and Abundant World", "for a Future of Collective Flourishing",
  "for a World of Effortless Contribution", "for a More Resilient Future", "for a More Adaptive Civilization",
  "for a More Conscious World", "for a Symbiotic Future", "for a Planetary Awakening"
];

new DynamicSloganComponent('rotating-action', actionPhrases, {
  minInterval: 3000, maxInterval: 6000, startDelay: 1000
});

new DynamicSloganComponent('rotating-creation', creationPhrases, {
  minInterval: 2000, maxInterval: 4000, startDelay: 2000
});

new DynamicSloganComponent('rotating-vision', visionPhrases, {
  minInterval: 4000, maxInterval: 8000, startDelay: 3000
});

class FullscreenSloganController {
  constructor() {
    this.sloganElement = document.querySelector('.fullscreen-slogan');
    this.isSloganVisible = true;
    this.init();
  }

  init() {
    if (!this.sloganElement) return;
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    this.handleScroll();
  }

  handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > 20 && this.isSloganVisible) {
      this.hideSlogan();
    } else if (scrollY <= 20 && !this.isSloganVisible) {
      this.showSlogan();
    }
  }

  hideSlogan() {
    this.isSloganVisible = false;
    this.sloganElement.style.opacity = '0';
    this.sloganElement.style.transform = 'scale(0.95)';
    this.sloganElement.style.pointerEvents = 'none';
  }

  showSlogan() {
    this.isSloganVisible = true;
    this.sloganElement.style.opacity = '1';
    this.sloganElement.style.transform = 'scale(1)';
    this.sloganElement.style.pointerEvents = 'auto';
  }
}

new FullscreenSloganController();
