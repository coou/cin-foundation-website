// Enhanced hero section animations and interactions
document.addEventListener('DOMContentLoaded', () => {
  // Enhanced geometric pattern animation
  const geometricPattern = document.querySelector('.geometric-pattern');
  if (geometricPattern) {
    // Add subtle rotation to the pattern
    let rotation = 0;
    const animatePattern = () => {
      rotation += 0.01;
      geometricPattern.style.backgroundPosition = `${rotation}px ${rotation}px, ${-rotation}px ${rotation}px, ${rotation * 2}px ${-rotation * 2}px, ${-rotation * 2}px ${-rotation * 2}px`;
      requestAnimationFrame(animatePattern);
    };
    animatePattern();
  }

  // Enhanced hover effects for value proposition cards with 3D effect
  const valueCards = document.querySelectorAll('.value-card');
  valueCards.forEach(card => {
    const icon = card.querySelector('div');
    
    // 3D tilt effect
    card.addEventListener('mousemove', (e) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      const mouseX = e.clientX - cardCenterX;
      const mouseY = e.clientY - cardCenterY;
      
      // Calculate rotation based on mouse position
      const rotateX = mouseY * -0.05;
      const rotateY = mouseX * 0.05;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      
      if (icon) {
        icon.style.transform = 'scale(1.1) translateZ(20px)';
      }
    });
    
    // Reset on mouse leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      if (icon) {
        icon.style.transform = 'scale(1) translateZ(0)';
      }
    });
  });

  // Animated highlight effect for strong text elements
  const highlightElements = document.querySelectorAll('.highlight-text');
  highlightElements.forEach((element) => {
    // Add pulsing glow effect
    let glowIntensity = 0;
    let increasing = true;
    
    const pulseGlow = () => {
      if (increasing) {
        glowIntensity += 0.01;
        if (glowIntensity >= 1) increasing = false;
      } else {
        glowIntensity -= 0.01;
        if (glowIntensity <= 0) increasing = true;
      }
      
      element.style.textShadow = `0 0 ${5 + glowIntensity * 5}px rgba(30, 58, 138, ${0.2 + glowIntensity * 0.1})`;
      requestAnimationFrame(pulseGlow);
    };
    
    // Start the animation with a random delay
    setTimeout(() => {
      pulseGlow();
    }, Math.random() * 2000);
  });

  // Enhanced CTA button effects with ripple animation
  const primaryCta = document.querySelector('.primary-cta');
  if (primaryCta) {
    primaryCta.addEventListener('click', (e) => {
      // Create ripple effect
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      primaryCta.appendChild(ripple);
      
      const rect = primaryCta.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      
      ripple.classList.add('active');
      
      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }
  
  // Add floating animation to particles
  const particles = document.querySelectorAll('.particle');
  particles.forEach((particle, index) => {
    // Randomize starting position slightly
    const randomX = (Math.random() - 0.5) * 20;
    const randomY = (Math.random() - 0.5) * 20;
    particle.style.transform = `translate(${randomX}px, ${randomY}px)`;
    
    // Add subtle scale animation
    let scale = 1;
    let scaleIncreasing = true;
    
    const animateParticle = () => {
      if (scaleIncreasing) {
        scale += 0.001;
        if (scale >= 1.1) scaleIncreasing = false;
      } else {
        scale -= 0.001;
        if (scale <= 0.9) scaleIncreasing = true;
      }
      
      particle.style.transform = `translate(${randomX}px, ${randomY}px) scale(${scale})`;
      requestAnimationFrame(animateParticle);
    };
    
    // Start animation with staggered delay
    setTimeout(() => {
      animateParticle();
    }, index * 200);
  });
});