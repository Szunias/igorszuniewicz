/**
 * Visit Counter
 * Simple page visit tracker and display
 */

(function() {
  'use strict';

  const API_ENDPOINT = '/api/analytics.php?counter=1';

  // Get visit count from server
  async function getVisitCount() {
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      return data.visits || 0;
    } catch (error) {
      console.log('Visit counter: using fallback');
      // Fallback to localStorage
      return parseInt(localStorage.getItem('fallback_visits') || '0', 10);
    }
  }

  // Format visit count for display
  function formatCount(count) {
    if (count < 1000) return count.toString();
    if (count < 10000) return (count / 1000).toFixed(1) + 'k';
    return Math.floor(count / 1000) + 'k';
  }

  // Show visit counter
  async function showVisitCounter() {
    const counter = document.getElementById('visit-counter');
    const countSpan = document.getElementById('visit-count');

    if (!counter || !countSpan) return;

    try {
      const currentCount = await getVisitCount();

      // Update display
      countSpan.textContent = formatCount(currentCount);
    } catch (error) {
      console.error('Failed to load visit count:', error);
      countSpan.textContent = '—';
    }

    // Show counter with animation
    setTimeout(() => {
      counter.style.display = 'block';
      counter.style.opacity = '0';
      counter.style.transform = 'translateY(20px)';
      counter.style.transition = 'all 0.3s ease';

      setTimeout(() => {
        counter.style.opacity = '1';
        counter.style.transform = 'translateY(0)';
      }, 100);
    }, 2000); // Show after 2 seconds

    // Auto-hide after 10 seconds
    setTimeout(() => {
      counter.style.opacity = '0.6';
    }, 12000);

    // Click to toggle visibility
    counter.addEventListener('click', () => {
      const isVisible = counter.style.opacity !== '0.3';
      counter.style.opacity = isVisible ? '0.3' : '1';
      counter.style.transition = 'opacity 0.2s ease';
    });
  }

  // Initialize when page loads
  function init() {
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showVisitCounter);
    } else {
      showVisitCounter();
    }
  }

  // Start only if not a bot and not localhost
  function shouldShowCounter() {
    // Don't show on localhost
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return false;

    // Don't show for bots
    const botPattern = /bot|crawler|spider|scraper/i;
    if (botPattern.test(navigator.userAgent)) return false;

    return true;
  }

  if (shouldShowCounter()) {
    init();
  }

})();