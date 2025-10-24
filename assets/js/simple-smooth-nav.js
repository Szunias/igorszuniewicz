// Prosty system płynnej nawigacji - nie interferuje z istniejącym kodem
(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.__simpleSmoothNavInitialized) {
    console.log('Simple smooth nav already initialized, skipping');
    return;
  }
  window.__simpleSmoothNavInitialized = true;
  
  // Konfiguracja
  const CONFIG = {
    enablePreload: true
  };
  
  // Cache dla stron
  const pageCache = new Map();
  let isNavigating = false;
  
  // Store event handlers so we can remove them if needed
  let clickHandler = null;
  let hoverHandler = null;
  
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
    // Remove existing handlers if they exist
    if (clickHandler) {
      document.removeEventListener('click', clickHandler, true);
    }
    if (hoverHandler) {
      document.removeEventListener('mouseover', hoverHandler);
    }
    
    // Przechwytuj kliknięcia w linki
    clickHandler = (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!shouldInterceptLink(href, link)) return;
      
      event.preventDefault();
      event.stopPropagation();
      navigateToPage(href);
    };
    
    document.addEventListener('click', clickHandler, true);
    
    // Preload przy hover
    if (CONFIG.enablePreload) {
      hoverHandler = (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (shouldInterceptLink(href, link)) {
          setTimeout(() => preloadPage(href), 50);
        }
      };
      
      document.addEventListener('mouseover', hoverHandler);
    }
    
    console.log('Simple smooth nav event listeners attached');
  }
  
  // Inicjalizacja
  function init() {
    // Dodaj style (tylko dla preload)
    addStyles();
    
    // Setup event listeners only once
    if (document.body) {
      setupEventListeners();
    } else {
      document.addEventListener('DOMContentLoaded', setupEventListeners, { once: true });
    }
  }
  
  // Uruchom NATYCHMIAST
  init();
  
  // Export dla debugowania
  window.simpleSmoothNav = {
    navigateToPage,
    preloadPage,
    CONFIG,
    reinit: setupEventListeners
  };
})();