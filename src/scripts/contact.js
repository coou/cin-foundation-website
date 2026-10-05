// Contact section functionality
document.addEventListener('DOMContentLoaded', () => {
  initializeCopyToClipboard();
});

// Copy email to clipboard functionality
function initializeCopyToClipboard() {
  const copyButton = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');
  
  if (copyButton && copyText) {
    copyButton.addEventListener('click', async () => {
      const email = 'contact@collectiveintelligencenetwork.org';
      
      try {
        // Try using the modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          showCopySuccess(copyText);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = email;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            showCopySuccess(copyText);
          } else {
            showCopyError(copyText);
          }
        }
      } catch (err) {
        console.error('Failed to copy email:', err);
        showCopyError(copyText);
      }
    });
  }
}

// Show copy success feedback
function showCopySuccess(copyText) {
  const originalText = copyText.textContent;
  copyText.textContent = 'Copied!';
  copyText.parentElement.classList.add('bg-emerald-100', 'text-emerald-700');
  copyText.parentElement.classList.remove('bg-gray-100', 'text-gray-700');
  
  // Add checkmark icon
  const icon = copyText.parentElement.querySelector('svg');
  if (icon) {
    icon.innerHTML = `
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    `;
  }
  
  setTimeout(() => {
    copyText.textContent = originalText;
    copyText.parentElement.classList.remove('bg-emerald-100', 'text-emerald-700');
    copyText.parentElement.classList.add('bg-gray-100', 'text-gray-700');
    
    // Restore copy icon
    if (icon) {
      icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      `;
    }
  }, 2000);
}

// Show copy error feedback
function showCopyError(copyText) {
  const originalText = copyText.textContent;
  copyText.textContent = 'Failed to copy';
  copyText.parentElement.classList.add('bg-red-100', 'text-red-700');
  copyText.parentElement.classList.remove('bg-gray-100', 'text-gray-700');
  
  setTimeout(() => {
    copyText.textContent = originalText;
    copyText.parentElement.classList.remove('bg-red-100', 'text-red-700');
    copyText.parentElement.classList.add('bg-gray-100', 'text-gray-700');
  }, 2000);
}

// Add hover effects for social media links
document.addEventListener('DOMContentLoaded', () => {
  const socialLinks = document.querySelectorAll('#contact a[target="_blank"]');
  
  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const icon = link.querySelector('div');
      if (icon) {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
      }
    });
    
    link.addEventListener('mouseleave', () => {
      const icon = link.querySelector('div');
      if (icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
      }
    });
  });
});