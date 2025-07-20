// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      
      // Change the icon to X when menu is open
      const icon = mobileMenuButton.querySelector('svg');
      if (icon) {
        if (mobileMenu.classList.contains('hidden')) {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          `;
        } else {
          icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          `;
        }
      }
    });
  }
  
  // Close mobile menu when clicking on a link
  const mobileMenuLinks = mobileMenu?.querySelectorAll('a');
  mobileMenuLinks?.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      
      // Reset the icon
      const icon = mobileMenuButton.querySelector('svg');
      if (icon) {
        icon.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        `;
      }
    });
  });
  
  // Handle active navigation state
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('header nav a');
  
  const observerOptions = {
    rootMargin: '-20% 0px -80% 0px',
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Update navigation active state
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('text-blue-700', 'font-medium');
            link.classList.remove('text-gray-700');
          } else {
            link.classList.remove('text-blue-700', 'font-medium');
            link.classList.add('text-gray-700');
          }
        });
      }
    });
  }, observerOptions);
  
  sections.forEach(section => {
    observer.observe(section);
  });
});