// Preload language to prevent flicker - runs immediately in <head>
(function() {
  'use strict';
  
  // Get saved language immediately (synchronous)
  const savedLang = localStorage.getItem('language') || 'en';
  
  // Set HTML lang attribute immediately
  document.documentElement.setAttribute('lang', savedLang);
  
  // Store the language for translations.js to use
  window.__preloadedLang = savedLang;
  
  // Inject critical inline CSS to hide content until translations load
  // Using opacity instead of visibility for smoother transition
  const style = document.createElement('style');
  style.id = 'preload-style';
  style.textContent = `
    html:not(.translations-ready) {
      opacity: 0 !important;
    }
    html.translations-ready {
      opacity: 1 !important;
      transition: opacity 0.1s ease-in !important;
    }
    /* Prevent FOUC for language buttons */
    .lang-btn:not(.active) {
      opacity: 0.6;
    }
  `;
  
  // Insert style as first child of head for highest priority
  if (document.head.firstChild) {
    document.head.insertBefore(style, document.head.firstChild);
  } else {
    document.head.appendChild(style);
  }
  
  // Update language button active state immediately when DOM is ready
  function updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.dataset.lang === savedLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  // Run as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLangButtons);
  } else {
    updateLangButtons();
  }
  
  // Aggressive fallback: show page after max 200ms even if translations haven't loaded
  setTimeout(() => {
    if (!document.documentElement.classList.contains('translations-ready')) {
      document.documentElement.classList.add('translations-ready');
      console.warn('Translations timeout - showing page anyway');
    }
  }, 200);
})();
