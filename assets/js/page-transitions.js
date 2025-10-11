/**
 * Smooth Page Transitions
 * Dodaje płynne przejścia między stronami
 */

(function() {
  'use strict';
  
  // Konfiguracja
  const config = {
    duration: 200, // Czas trwania animacji w ms (bardzo szybkie)
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  };
  
  // Tworzenie elementu overlay
  const overlay = document.createElement('div');
  overlay.id = 'page-transition-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
    z-index: 999999;
    opacity: 0;
    pointer-events: none;
    transition: opacity ${config.duration}ms ${config.easing};
  `;
  document.body.appendChild(overlay);
  
  // Animacja fade-in przy ładowaniu strony
  window.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = `opacity ${config.duration}ms ${config.easing}`;
      document.body.style.opacity = '1';
    });
  });
  
  // Przechwytywanie kliknięć w linki
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    // Sprawdzamy czy to link do innej strony (nie anchor, nie external)
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Ignoruj jeśli:
    // - to anchor link (#)
    // - to external link
    // - ma target="_blank"
    // - to download link
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
    
    // Zapobiegamy domyślnemu zachowaniu
    e.preventDefault();
    
    // Uruchamiamy animację wyjścia
    overlay.style.pointerEvents = 'all';
    overlay.style.opacity = '1';
    
    // Po zakończeniu animacji przechodzimy na nową stronę
    setTimeout(() => {
      window.location.href = href;
    }, config.duration);
  });
  
  // Obsługa przycisku wstecz/do przodu w przeglądarce
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // Strona została załadowana z cache (back/forward)
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      document.body.style.opacity = '1';
    }
  });
})();
