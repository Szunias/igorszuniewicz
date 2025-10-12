// Standalone translation system - loads from JSON
(function() {
  'use strict';
  
  // Initialize empty translations object
  window.translations = {};
  let currentLang = localStorage.getItem('language') || 'en';

  // Helper function to get nested translation value
  function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = getNestedTranslation(window.translations[lang], key) || window.translations[lang]?.[key];
      
      if (translation) {
        if (key.includes('.title') && translation.includes('<br>')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });
    
    // Update active state of language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // Load translations from JSON file
  async function loadTranslations() {
    try {
      const response = await fetch('../locales/shared.json');
      window.translations = await response.json();
      setLanguage(currentLang);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  // Initialize language on page load
  document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();
    
    // Add click handlers to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  });
})();
