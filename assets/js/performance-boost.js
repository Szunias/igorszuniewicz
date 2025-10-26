/**
 * Performance Boost Script
 * Professional optimizations for faster page loading and smoother experience
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.__performanceBoostInitialized) return;
  window.__performanceBoostInitialized = true;

  /**
   * Optimize video loading - lazy load sources and autoplay when visible
   */
  function optimizeVideoLoading() {
    const videos = document.querySelectorAll('video[data-autoplay]');

    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;

          if (entry.isIntersecting) {
            // Load video sources if not already loaded
            if (!video.classList.contains('loaded')) {
              const sources = video.querySelectorAll('source[data-src]');
              sources.forEach(source => {
                source.src = source.getAttribute('data-src');
                source.removeAttribute('data-src');
              });

              video.load();
              video.classList.add('loaded');

              // Play when loaded
              video.addEventListener('loadeddata', () => {
                video.play().catch(() => {
                  // Autoplay prevented by browser
                });
              }, { once: true });
            } else if (video.paused) {
              // Already loaded, just play
              video.play().catch(() => {});
            }

            // Stop observing this video after loading
            videoObserver.unobserve(video);
          }
        });
      }, {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.01
      });

      videos.forEach(video => videoObserver.observe(video));
    } else {
      // Fallback for browsers without IntersectionObserver
      videos.forEach(video => {
        const sources = video.querySelectorAll('source[data-src]');
        sources.forEach(source => {
          source.src = source.getAttribute('data-src');
        });
        video.load();
        video.play().catch(() => {});
      });
    }
  }

  /**
   * Debounce function for performance-critical events
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Optimize scroll event listeners
   */
  function optimizeScrollListeners() {
    // Add passive flag to all scroll listeners for better performance
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'scroll' || type === 'wheel' || type === 'touchmove') {
        if (typeof options === 'object' && options.passive === undefined) {
          options.passive = true;
        } else if (typeof options === 'undefined' || typeof options === 'boolean') {
          options = { passive: true, capture: options || false };
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  /**
   * Prefetch links on hover for instant navigation
   */
  function setupLinkPrefetch() {
    const prefetched = new Set();

    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || prefetched.has(href)) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.hasAttribute('target')) return;

      // Prefetch the page
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = href;
      document.head.appendChild(prefetchLink);

      prefetched.add(href);
    }, { passive: true });
  }

  /**
   * Reduce animation during scroll for better performance
   */
  function reduceMotionDuringScroll() {
    let scrollTimeout;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add('is-scrolling');
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * Optimize images - lazy load with IntersectionObserver
   */
  function optimizeImages() {
    const lazyImages = document.querySelectorAll('img.lazy-img[data-src]');

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');

            if (src && !img.classList.contains('loaded')) {
              img.src = src;
              img.removeAttribute('data-src');

              img.addEventListener('load', () => {
                img.classList.add('loaded');
              }, { once: true });

              // Mark as loading to prevent duplicate loads
              img.classList.add('loading');
            }

            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '100px',
        threshold: 0.01
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach(img => {
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.classList.add('loaded');
        }
      });
    }

    // Ensure all other images have proper attributes
    const regularImages = document.querySelectorAll('img:not(.lazy-img):not([loading])');
    regularImages.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  /**
   * Initialize all optimizations
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runOptimizations);
    } else {
      // DOM already loaded, run after a small delay to not block initial render
      requestAnimationFrame(runOptimizations);
    }
  }

  function runOptimizations() {
    // Run critical optimizations immediately
    optimizeScrollListeners();

    // Video loading is critical for UX - run earlier
    optimizeVideoLoading();

    // Defer non-critical optimizations
    requestIdleCallback(() => {
      optimizeImages();
      setupLinkPrefetch();
      reduceMotionDuringScroll();
    }, { timeout: 2000 });
  }

  // Polyfill for requestIdleCallback
  window.requestIdleCallback = window.requestIdleCallback || function(cb, options) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50.0 - (Date.now() - start));
        }
      });
    }, options?.timeout || 1);
  };

  // Start initialization
  init();
})();
