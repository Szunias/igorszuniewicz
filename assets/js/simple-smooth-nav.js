// Prosty system płynnej nawigacji - nie interferuje z istniejącym kodem
(function() {
  'use strict';
  
  // Konfiguracja
  const CONFIG = {
    enablePreload: true
  };
  
  // Cache dla stron
  const pageCache = new Map();
  let isNavigating = false;
  
  // Dodaj style CSS (minimalny - tylko dla zapobiegania flashowi)
  function addStyles() {
    if (document.getElementById('simple-smooth-nav-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'simple-smooth-nav-styles';
    styles.textContent = `
      /* Zapobieganie białemu flashowi */
      html {
        background: #000 !important;
      }
      
      body {
        background: #000;
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  // Sprawdź czy link powinien być przechwycony
  function shouldInterceptLink(href, link) {
    if (!href) return false;
    if (href.startsWith('#')) return false;
    if (href.startsWith('mailto:')) return false;
    if (href.startsWith('tel:')) return false;
    if (href.startsWith('http') && !href.includes(window.location.hostname)) return false;
    if (link.hasAttribute('target')) return false;
    if (link.hasAttribute('download')) return false;
    if (href === window.location.pathname) return false;
    
    return true;
  }
  
  // Główna funkcja nawigacji
  function navigateToPage(url) {
    if (isNavigating) return;
    
    isNavigating = true;
    
    // Przejdź NATYCHMIAST bez żadnych animacji
    window.location.href = url;
  }
  
  // Preload strony
  function preloadPage(url) {
    if (pageCache.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    
    pageCache.set(url, true);
  }
  
  // Event listenery
  function setupEventListeners() {
    // Przechwytuj kliknięcia w linki
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!shouldInterceptLink(href, link)) return;
      
      event.preventDefault();
      navigateToPage(href);
    }, true);
    
    // Preload przy hover
    if (CONFIG.enablePreload) {
      document.addEventListener('mouseover', (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (shouldInterceptLink(href, link)) {
          setTimeout(() => preloadPage(href), 50);
        }
      });
    }
  }
  
  // Inicjalizacja
  function init() {
    // Dodaj style (tylko dla preload)
    addStyles();
    
    // Setup event listeners
    if (document.body) {
      setupEventListeners();
    } else {
      document.addEventListener('DOMContentLoaded', setupEventListeners);
    }
  }
  
  // Uruchom NATYCHMIAST
  init();
  
  // Export dla debugowania
  window.simpleSmoothNav = {
    navigateToPage,
    preloadPage,
    CONFIG
  };
})();