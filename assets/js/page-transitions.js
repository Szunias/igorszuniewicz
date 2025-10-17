/**
 * Page transitions: differentiate NAV swipe vs. generic fade.
 * Swipe reserved for top nav (desktop+mobile), others use subtle fade/scale.
 */

(function() {
  'use strict';

  const DEFAULT_TYPE = 'fade';
  const NAV_SWIPE_SELECTORS = [
    '.nav .nav-links a',
    '.mobile-nav-links a'
  ];

  const config = {
    swipe: { duration: 180, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' },
    fade:  { duration: 130, easing: 'cubic-bezier(0.2, 0.0, 0.0, 1)' },
    scale: { duration: 160, easing: 'cubic-bezier(0.2, 0.7, 0.0, 1)' }
  };

  const style = document.createElement('style');
  style.textContent = `
    /* Base to smooth property changes */
    body { will-change: opacity, transform, filter; }

    /* Swipe */
    body.page-transitioning--swipe { opacity: 0; transform: translateX(-20px); filter: blur(4px); }
    body.page-entering--swipe      { opacity: 0; transform: translateX(20px);  filter: blur(4px); }

    /* Fade (default) */
    body.page-transitioning--fade { opacity: 0; filter: blur(3px); }
    body.page-entering--fade      { opacity: 0; filter: blur(3px); }

    /* Scale */
    body.page-transitioning--scale { opacity: 0; transform: scale(0.98); filter: blur(2px); }
    body.page-entering--scale      { opacity: 0; transform: scale(1.02);  filter: blur(2px); }
  `;
  document.head.appendChild(style);

  // Utility: determine transition type for a link
  function getTransitionType(link) {
    // 1) Explicit override via data-transition
    const explicit = link.getAttribute('data-transition');
    if (explicit === 'none') return null;
    if (explicit === 'swipe' || explicit === 'fade' || explicit === 'scale') return explicit;

    // 2) By selector: nav links => swipe
    for (const sel of NAV_SWIPE_SELECTORS) {
      if (link.matches(sel) || link.closest(sel?.replace(' a',''))) return 'swipe';
    }

    // 3) Project cards => scale
    if (link.classList.contains('project-card') || link.closest('.project-card')) return 'scale';

    // 4) Default
    return DEFAULT_TYPE;
  }

  // Apply entry class based on previous click
  window.addEventListener('DOMContentLoaded', () => {
    const lastType = sessionStorage.getItem('pageTransitionType') || DEFAULT_TYPE;
    const cfg = config[lastType] || config[DEFAULT_TYPE];
    // Temporarily set transition timing for smooth entry
    document.body.style.transition = `all ${cfg.duration}ms ${cfg.easing}`;
    document.body.classList.add(`page-entering--${lastType}`);
    requestAnimationFrame(() => {
      document.body.classList.remove(`page-entering--${lastType}`);
      // cleanup inline style after entry
      setTimeout(() => { document.body.style.transition = ''; }, cfg.duration);
    });
  });

  // Intercept internal navigations
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href ||
        href.startsWith('#') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hasAttribute('download')) {
      return;
    }

    const type = getTransitionType(link);
    if (!type) return; // data-transition="none"

    e.preventDefault();
    const cfg = config[type] || config[DEFAULT_TYPE];

    // set transition timing per type for exit
    document.body.style.transition = `all ${cfg.duration}ms ${cfg.easing}`;
    sessionStorage.setItem('pageTransitionType', type);

    document.body.classList.add(`page-transitioning--${type}`);
    setTimeout(() => { window.location.href = href; }, cfg.duration);
  });

  // bfcache restore: remove classes
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.body.classList.remove('page-transitioning--swipe','page-entering--swipe','page-transitioning--fade','page-entering--fade','page-transitioning--scale','page-entering--scale');
      document.body.style.transition = '';
    }
  });
})();
