// Navigation Component - centralized header for all pages
// Usage: Include this script in your HTML and call loadNavigation()

function loadNavigation() {
  console.log('🚀 Loading navigation...');
  const nav = `
    <!-- Header -->
    <header class="header" id="header">
      <div class="container">
        <nav class="nav">
          <a href="${getRelativePath()}index.html" class="logo">Igor Szuniewicz</a>
          <ul class="nav-links">
            <li><a href="${getRelativePath()}index.html" data-i18n="nav_home">Home</a></li>
            <li><a href="${getRelativePath()}about.html" data-i18n="nav_about">About</a></li>
            <li><a href="${getRelativePath()}projects/index.html" data-i18n="nav_projects">Projects</a></li>
            <li><a href="${getRelativePath()}music.html" data-i18n="nav_music">Music</a></li>
            <li><a href="${getRelativePath()}contact.html" data-i18n="nav_contact">Contact</a></li>
            <li class="lang-switcher">
              <button class="lang-btn active" data-lang="en">EN</button>
              <button class="lang-btn" data-lang="pl">PL</button>
              <button class="lang-btn" data-lang="nl">NL</button>
            </li>
          </ul>
          <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay"></div>

    <!-- Mobile Menu -->
    <div class="mobile-menu">
      <ul class="mobile-nav-links">
        <li><a href="${getRelativePath()}index.html" data-i18n="nav_home">Home</a></li>
        <li><a href="${getRelativePath()}about.html" data-i18n="nav_about">About</a></li>
        <li><a href="${getRelativePath()}projects/index.html" data-i18n="nav_projects">Projects</a></li>
        <li><a href="${getRelativePath()}music.html" data-i18n="nav_music">Music</a></li>
        <li><a href="${getRelativePath()}contact.html" data-i18n="nav_contact">Contact</a></li>
      </ul>
      <div class="mobile-lang-switcher">
        <button class="lang-btn active" data-lang="en">EN</button>
        <button class="lang-btn" data-lang="pl">PL</button>
        <button class="lang-btn" data-lang="nl">NL</button>
      </div>
    </div>
  `;

  // Insert navigation at the beginning of body
  if (!document.body) {
    console.error('❌ document.body is null! Cannot load navigation.');
    return;
  }
  
  document.body.insertAdjacentHTML('afterbegin', nav);
  console.log('✅ Navigation HTML inserted');

  // Set active link based on current page
  setActiveLink();
  console.log('✅ Active link set');

  // Initialize mobile menu
  initMobileMenu();
  console.log('✅ Mobile menu initialized');

  // Initialize scroll effect
  initScrollEffect();
  console.log('✅ Scroll effect initialized');
  console.log('🎉 Navigation fully loaded!');
}

// Determine relative path based on current location
function getRelativePath() {
  const path = window.location.pathname;
  // If in projects folder, go up one level
  if (path.includes('/projects/')) {
    return '../';
  }
  return '';
}

// Set active class on current page link
function setActiveLink() {
  const path = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.includes(href.replace('../', ''))) {
      link.classList.add('active');
    }
  });
}

// Initialize mobile menu toggle
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');

  if (!toggle || !menu || !overlay) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  overlay.addEventListener('click', () => {
    toggle.classList.remove('active');
    menu.classList.remove('active');
    overlay.classList.remove('active');
  });
}

// Add scrolled class to header
function initScrollEffect() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Auto-load - always wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadNavigation, 0); // Small delay to ensure body exists
  });
} else {
  // DOM already loaded
  setTimeout(loadNavigation, 0);
}
