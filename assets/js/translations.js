// Standalone translation system - loads from JSON
(function() {
  'use strict';
  
  // Initialize empty translations object
  window.translations = {};
  let currentLang = window.__preloadedLang || localStorage.getItem('language') || 'en';

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
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Mark translations as ready and show page
    document.documentElement.classList.add('translations-ready');
    const preloadStyle = document.getElementById('preload-style');
    if (preloadStyle) preloadStyle.remove();
  }

  // Detect which JSON file to load based on current page
  function getTranslationFile() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    // Map HTML files to their JSON translation files
    const fileMap = {
      'index.html': 'index.json',
      'about.html': 'about.json',
      'contact.html': 'contact.json',
      'music.html': 'music.json',
      '': 'index.json', // root path
      '/': 'index.json'
    };

    // For projects/index.html
    if (path.includes('projects/')) {
      return 'projects.json';
    }

    return fileMap[filename] || 'shared.json';
  }

  // Load translations from JSON file
  async function loadTranslations() {
    try {
      const translationFile = getTranslationFile();

      // Try different paths based on current location
      let response;
      const basePaths = ['locales/', '../locales/', '../../locales/'];

      for (const basePath of basePaths) {
        try {
          response = await fetch(basePath + translationFile);
          if (response.ok) break;
        } catch (e) {
          continue;
        }
      }

      if (!response?.ok) {
        throw new Error(`Failed to load translations from ${translationFile}`);
      }

      window.translations = await response.json();
      setLanguage(currentLang);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  // Start loading translations immediately (don't wait for DOMContentLoaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslations);
  } else {
    initTranslations();
  }
  
  function initTranslations() {
    loadTranslations();
    
    // Add click handlers to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  }
})();
