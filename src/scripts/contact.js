// Contact section functionality
document.addEventListener('DOMContentLoaded', () => {
  initializeCopyToClipboard();
  initializeGitHubStats();
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

// GitHub organization statistics
async function initializeGitHubStats() {
  const reposElement = document.getElementById('github-repos');
  const contributorsElement = document.getElementById('github-contributors');
  const commitsElement = document.getElementById('github-commits');
  
  if (!reposElement || !contributorsElement || !commitsElement) {
    return;
  }
  
  try {
    // Fetch organization data
    const orgResponse = await fetch('https://api.github.com/orgs/cin-foundation');
    await orgResponse.json(); // We don't use orgData currently
    
    // Fetch repositories
    const reposResponse = await fetch('https://api.github.com/orgs/cin-foundation/repos?per_page=100');
    const reposData = await reposResponse.json();
    
    if (Array.isArray(reposData)) {
      // Update repositories count
      animateNumber(reposElement, reposData.length);
      
      // Calculate total contributors and commits
      const totalContributors = new Set();
      let totalCommits = 0;
      
      // Fetch contributors and commits for each repository
      const repoPromises = reposData.slice(0, 10).map(async (repo) => {
        try {
          // Fetch contributors for this repo
          const contributorsResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/contributors?per_page=100`);
          if (contributorsResponse.ok) {
            const contributors = await contributorsResponse.json();
            if (Array.isArray(contributors)) {
              contributors.forEach(contributor => {
                if (contributor.login) {
                  totalContributors.add(contributor.login);
                }
              });
            }
          }
          
          // Fetch commits count for this repo
          const commitsResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=1`);
          if (commitsResponse.ok) {
            const linkHeader = commitsResponse.headers.get('Link');
            if (linkHeader) {
              const match = linkHeader.match(/page=(\d+)>; rel="last"/);
              if (match) {
                totalCommits += parseInt(match[1]);
              }
            } else {
              // If no pagination, there's likely only one page
              const commits = await commitsResponse.json();
              if (Array.isArray(commits)) {
                totalCommits += commits.length;
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch data for repo ${repo.name}:`, error);
        }
      });
      
      await Promise.all(repoPromises);
      
      // Update the UI with animated numbers
      animateNumber(contributorsElement, totalContributors.size);
      animateNumber(commitsElement, totalCommits);
      
    } else {
      // Fallback to placeholder numbers if API fails
      animateNumber(reposElement, 8);
      animateNumber(contributorsElement, 12);
      animateNumber(commitsElement, 150);
    }
    
  } catch (error) {
    console.warn('Failed to fetch GitHub stats:', error);
    
    // Show placeholder numbers with animation
    animateNumber(reposElement, 8);
    animateNumber(contributorsElement, 12);
    animateNumber(commitsElement, 150);
  }
}

// Animate number counting up
function animateNumber(element, targetNumber) {
  const duration = 2000; // 2 seconds
  const startTime = Date.now();
  const startNumber = 0;
  
  function updateNumber() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Use easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutQuart);
    
    element.textContent = currentNumber.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = targetNumber.toLocaleString();
    }
  }
  
  updateNumber();
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