/**
 * Expandable sections functionality
 * Handles the expand/collapse behavior for the pillar and concept sections
 */

document.addEventListener('DOMContentLoaded', () => {
  // Handle pillar expandable sections
  const pillarExpandButtons = document.querySelectorAll('.pillar-expand-btn');
  
  pillarExpandButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      const arrowIcon = button.querySelector('svg');
      
      if (targetElement.classList.contains('hidden')) {
        // Expand the section
        targetElement.classList.remove('hidden');
        arrowIcon.classList.add('rotate-180');
        button.querySelector('span').textContent = 'Show Less';
      } else {
        // Collapse the section
        targetElement.classList.add('hidden');
        arrowIcon.classList.remove('rotate-180');
        button.querySelector('span').textContent = 'Learn More';
      }
    });
  });
  
  // Handle concept expandable sections
  const conceptExpandButtons = document.querySelectorAll('.concept-expand-btn');
  
  conceptExpandButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      const arrowIcon = button.querySelector('svg');
      
      if (targetElement.classList.contains('hidden')) {
        // Expand the section
        targetElement.classList.remove('hidden');
        arrowIcon.classList.add('rotate-180');
        button.querySelector('span').textContent = 'Show Less';
      } else {
        // Collapse the section
        targetElement.classList.add('hidden');
        arrowIcon.classList.remove('rotate-180');
        button.querySelector('span').textContent = 'Learn More';
      }
    });
  });
  
  // Handle blog expandable sections
  const blogExpandButtons = document.querySelectorAll('.blog-expand-btn');
  
  blogExpandButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      const arrowIcon = button.querySelector('svg');
      
      if (targetElement.classList.contains('hidden')) {
        // Expand the section
        targetElement.classList.remove('hidden');
        arrowIcon.classList.add('rotate-180');
        button.querySelector('span').textContent = 'Show Less';
        button.setAttribute('aria-expanded', 'true');
      } else {
        // Collapse the section
        targetElement.classList.add('hidden');
        arrowIcon.classList.remove('rotate-180');
        button.querySelector('span').textContent = 'Read Full Article';
        button.setAttribute('aria-expanded', 'false');
      }
    });
  });
  
  // Handle documentation carousel
  const docCarousel = document.querySelector('.doc-carousel');
  const docSlides = document.querySelectorAll('.doc-slide');
  const prevBtn = document.querySelector('.doc-nav-btn.prev-btn');
  const nextBtn = document.querySelector('.doc-nav-btn.next-btn');
  
  if (docCarousel && docSlides.length > 0) {
    let currentSlideIndex = 0;
    
    // Function to show a specific slide
    const showSlide = (index) => {
      // Hide all slides
      docSlides.forEach(slide => {
        slide.classList.add('hidden');
        slide.classList.remove('active');
      });
      
      // Show the current slide
      docSlides[index].classList.remove('hidden');
      docSlides[index].classList.add('active');
    };
    
    // Previous button click handler
    prevBtn.addEventListener('click', () => {
      currentSlideIndex = (currentSlideIndex - 1 + docSlides.length) % docSlides.length;
      showSlide(currentSlideIndex);
    });
    
    // Next button click handler
    nextBtn.addEventListener('click', () => {
      currentSlideIndex = (currentSlideIndex + 1) % docSlides.length;
      showSlide(currentSlideIndex);
    });
    
    // Initialize the carousel
    showSlide(currentSlideIndex);
  }
});