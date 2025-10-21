// Preload language to prevent flicker - runs immediately in <head>
(function() {
  'use strict';
  
  // Get saved language immediately (synchronous)
  const savedLang = localStorage.getItem('language') || 'en';
  
  // Set HTML lang attribute immediately
  document.documentElement.setAttribute('lang', savedLang);
  
  // Store the language for translations.js to use
  window.__preloadedLang = savedLang;
  
  // Add inline style to prevent flicker during translation load
  // This will be removed once translations are applied
  const style = document.createElement('style');
  style.id = 'preload-style';
  style.textContent = `
    html { visibility: hidden; }
    html.translations-ready { visibility: visible; }
  `;
  document.head.appendChild(style);
  
  // Update language button active state immediately when DOM is ready
  function updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === savedLang);
    });
  }
  
  // Run as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLangButtons);
  } else {
    updateLangButtons();
  }
  
  // Fallback: show page after max 300ms even if translations haven't loaded
  setTimeout(() => {
    document.documentElement.classList.add('translations-ready');
    const preloadStyle = document.getElementById('preload-style');
    if (preloadStyle) preloadStyle.remove();
  }, 300);
})();
