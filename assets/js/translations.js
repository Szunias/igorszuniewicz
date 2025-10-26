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
    
    // Update all elements with data-i18n-aria-label attribute
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      const translation = getNestedTranslation(window.translations[lang], key) || window.translations[lang]?.[key];
      
      if (translation) {
        el.setAttribute('aria-label', translation);
      }
    });
    
    // Update active state of language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Update modal content if it exists and is open
    if (window.TrackInfoModal && typeof window.TrackInfoModal.updateLanguage === 'function') {
      window.TrackInfoModal.updateLanguage();
    }
    
    // Refresh music list if present
    if (typeof window.refreshMusicList === 'function') {
      window.refreshMusicList();
    }
    
    // Mark translations as ready and show page smoothly
    requestAnimationFrame(() => {
      document.documentElement.classList.add('translations-ready');
      
      // Remove preload style after transition completes (tylko jeśli nie ma smooth navigation)
      if (!document.documentElement.classList.contains('smooth-nav-ready')) {
        setTimeout(() => {
          const preloadStyle = document.getElementById('preload-style');
          if (preloadStyle) preloadStyle.remove();
        }, 150);
      }
    });
  }
  
  // Helper function to apply translations to all elements
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = getNestedTranslation(window.translations[currentLang], key) || window.translations[currentLang]?.[key];
      
      if (translation) {
        if (key.includes('.title') && translation.includes('<br>')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });
    
    // Apply aria-label translations
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      const translation = getNestedTranslation(window.translations[currentLang], key) || window.translations[currentLang]?.[key];
      
      if (translation) {
        el.setAttribute('aria-label', translation);
      }
    });
  }
  
  // Export dla smooth navigation
  window.setLanguage = setLanguage;
  window.applyTranslations = applyTranslations;

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

      const translationData = await response.json();
      
      // Validate translation data structure
      if (!translationData || typeof translationData !== 'object') {
        throw new Error('Invalid translation data format');
      }

      window.translations = translationData;
      setLanguage(currentLang);
    } catch (error) {
      console.error('Failed to load translations:', error);
      
      // Fallback: create minimal translation structure
      window.translations = {
        en: { error: 'Translation loading failed' },
        pl: { error: 'Błąd ładowania tłumaczeń' },
        nl: { error: 'Vertaling laden mislukt' }
      };
      
      // Still try to set the language with fallback
      try {
        setLanguage(currentLang);
      } catch (fallbackError) {
        console.error('Failed to set fallback language:', fallbackError);
      }
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
    
    // Use event delegation for language buttons (works even if buttons are added dynamically)
    document.addEventListener('click', (event) => {
      // Check if clicked element or its parent is a language button
      const langBtn = event.target.closest('.lang-btn');
      if (langBtn && langBtn.dataset.lang) {
        setLanguage(langBtn.dataset.lang);
      }
    });
  }
})();
