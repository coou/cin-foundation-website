// Subtle particle animation for hero section
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    
    this.resize();
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  
  init() {
    const particleCount = Math.min(50, Math.floor(this.canvas.offsetWidth / 20));
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.offsetWidth,
        y: Math.random() * this.canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        color: Math.random() > 0.5 ? 'rgba(30, 58, 138, ' : 'rgba(5, 150, 105, '
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.offsetWidth;
      if (particle.x > this.canvas.offsetWidth) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.offsetHeight;
      if (particle.y > this.canvas.offsetHeight) particle.y = 0;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color + particle.opacity + ')';
      this.ctx.fill();
      
      // Draw connections to nearby particles
      this.particles.forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.strokeStyle = particle.color + (0.1 * (1 - distance / 100)) + ')';
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('hero');
  if (heroSection && window.innerWidth > 768) { // Only on desktop for performance
    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    
    // Insert canvas as first child of hero section
    heroSection.insertBefore(canvas, heroSection.firstChild);
    
    // Initialize particle system
    const particleSystem = new ParticleSystem(canvas);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      particleSystem.destroy();
    });
  }
});