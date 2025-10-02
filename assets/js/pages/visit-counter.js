/**
 * Visit Counter
 * Tracks and displays page visit count using CountAPI
 */

(function() {
  'use strict';

  const NAMESPACE = 'igorszuniewicz';
  const KEY = 'portfolio_views';
  const BASE_COUNT = 2533; // Starting count
  const API_URL = `https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`;
  const FALLBACK_KEY = 'last_known_count';

  // Fetch visit count from CountAPI
  async function getVisitCount() {
    try {
      // Try to get count from CountAPI
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const totalCount = BASE_COUNT + (data.value || 0);

      // Cache the result
      localStorage.setItem(FALLBACK_KEY, totalCount.toString());
      return totalCount;
    } catch (error) {
      console.log('Using cached count');
      // Fallback to last known count
      const cached = localStorage.getItem(FALLBACK_KEY);
      return cached ? parseInt(cached, 10) : BASE_COUNT;
    }
  }

  // Format visit count for display
  function formatCount(count) {
    return count.toLocaleString('en-US');
  }

  // Animate counter number
  function animateCount(element, targetCount) {
    const duration = 1500;
    const startCount = Math.max(0, targetCount - 10);
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOut cubic

      const currentCount = Math.floor(startCount + (targetCount - startCount) * easeProgress);
      element.textContent = formatCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = formatCount(targetCount);
      }
    }

    requestAnimationFrame(update);
  }

  // Show visit counter
  async function showVisitCounter() {
    const counter = document.getElementById('visit-counter');
    const countSpan = document.getElementById('visit-count');

    if (!counter || !countSpan) return;

    try {
      const currentCount = await getVisitCount();

      // Start animation after delay
      setTimeout(() => {
        counter.style.display = 'flex';
        counter.style.opacity = '0';
        counter.style.transform = 'translateY(10px)';

        setTimeout(() => {
          counter.style.opacity = '1';
          counter.style.transform = 'translateY(0)';
          animateCount(countSpan, currentCount);
        }, 100);
      }, 2500);

    } catch (error) {
      console.error('Failed to load visit count:', error);
      countSpan.textContent = formatCount(BASE_COUNT);
      counter.style.display = 'flex';
    }
  }

  // Initialize when page loads
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showVisitCounter);
    } else {
      showVisitCounter();
    }
  }

  // Start only if not a bot
  function shouldShowCounter() {
    // Don't show for bots
    const botPattern = /bot|crawler|spider|scraper|headless/i;
    if (botPattern.test(navigator.userAgent)) return false;

    return true;
  }

  if (shouldShowCounter()) {
    init();
  }

})();