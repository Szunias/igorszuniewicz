/**
 * Modern Slide Transition
 * Szybkie przesunięcie z blur efektem
 */

(function() {
  'use strict';
  
  const config = {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  };
  
  const style = document.createElement('style');
  style.textContent = `
    body {
      transition: all ${config.duration}ms ${config.easing};
    }
    body.page-transitioning {
      opacity: 0;
      transform: translateX(-20px);
      filter: blur(4px);
    }
    body.page-entering {
      opacity: 0;
      transform: translateX(20px);
      filter: blur(4px);
    }
  `;
  document.head.appendChild(style);
  
  // Wejście na stronę
  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-entering');
    
    requestAnimationFrame(() => {
      document.body.classList.remove('page-entering');
    });
  });
  
  // Kliknięcia
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
    
    e.preventDefault();
    document.body.classList.add('page-transitioning');
    
    setTimeout(() => {
      window.location.href = href;
    }, config.duration);
  });
  
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.body.classList.remove('page-transitioning', 'page-entering');
    }
  });
})();
