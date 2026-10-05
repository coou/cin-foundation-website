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
// Phrases are limited to what the CIN documents support: information and reasoning for people,
// data ownership, verification and staged testing. No money, economy, hive-mind or abundance claims.
const actionPhrases = [
  "Building the", "Designing the", "Researching the", "Testing the"
];
const creationPhrases = [
  "Information Layer", "Reasoning Tools", "Personal Twin", "Verification Practice", "Decision Support"
];
const visionPhrases = [
  "for Better Decisions", "for Informed Communities", "for Honest Evidence", "for Shared Decisions", "for People and Places"
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
