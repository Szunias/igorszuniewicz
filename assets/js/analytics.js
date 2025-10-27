/**
 * Google Analytics 4 - Privacy-Friendly Implementation
 * Igor Szuniewicz Portfolio
 * 
 * Features:
 * - Privacy-first approach (minimal data collection)
 * - GDPR compliant
 * - No personal data tracking
 * - Performance optimized
 */

// Configuration
const GA_CONFIG = {
  measurementId: 'G-36J3DWT6QW', // Google Analytics 4 Measurement ID
  anonymizeIp: true,
  allowGoogleAnalytics: false, // Default to false, user can opt-in
  debug: false // Set to true for development
};

// Check if user has consented to analytics
function hasAnalyticsConsent() {
  // Check localStorage for user preference
  const consent = localStorage.getItem('analytics-consent');
  return consent === 'true';
}

// Set analytics consent
function setAnalyticsConsent(consent) {
  localStorage.setItem('analytics-consent', consent.toString());
  if (consent) {
    initializeAnalytics();
  } else {
    // Disable analytics if user opts out
    window['ga-disable-' + GA_CONFIG.measurementId] = true;
  }
}

// Initialize Google Analytics 4
function initializeAnalytics() {
  if (!GA_CONFIG.allowGoogleAnalytics || !hasAnalyticsConsent()) {
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_CONFIG.measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  
  // Configure GA4 with privacy settings
  gtag('config', GA_CONFIG.measurementId, {
    anonymize_ip: GA_CONFIG.anonymizeIp,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Strict;Secure',
    // Custom parameters for audio portfolio
    custom_map: {
      'custom_parameter_1': 'project_type',
      'custom_parameter_2': 'audio_category'
    }
  });

  if (GA_CONFIG.debug) {
    console.log('Google Analytics 4 initialized with privacy settings');
  }
}

// Track page views (only if consent given)
function trackPageView(pagePath, pageTitle) {
  if (!hasAnalyticsConsent()) return;
  
  if (window.gtag) {
    gtag('config', GA_CONFIG.measurementId, {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
}

// Track custom events (portfolio specific)
function trackPortfolioEvent(eventName, parameters = {}) {
  if (!hasAnalyticsConsent()) return;
  
  if (window.gtag) {
    gtag('event', eventName, {
      event_category: 'portfolio_interaction',
      ...parameters
    });
  }
}

// Track project views
function trackProjectView(projectName, projectType) {
  trackPortfolioEvent('project_view', {
    project_name: projectName,
    project_type: projectType
  });
}

// Track audio interactions
function trackAudioInteraction(audioType, action) {
  trackPortfolioEvent('audio_interaction', {
    audio_type: audioType,
    interaction_action: action
  });
}

// Track CV downloads
function trackCVDownload() {
  trackPortfolioEvent('cv_download', {
    event_category: 'conversion'
  });
}

// Track contact form interactions
function trackContactInteraction(action) {
  trackPortfolioEvent('contact_interaction', {
    contact_action: action
  });
}

// Show analytics consent banner (if not already set)
function showAnalyticsConsentBanner() {
  if (localStorage.getItem('analytics-consent') !== null) {
    return; // User already made a choice
  }

  const banner = document.createElement('div');
  banner.id = 'analytics-consent-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 15px;
    right: 15px;
    max-width: 320px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 8px;
    padding: 12px 16px;
    color: #e0e6ed;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    line-height: 1.4;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;

  banner.innerHTML = `
    <div style="margin-bottom: 8px;">
      <strong>🍪 Analytics</strong>
    </div>
    <div style="margin-bottom: 10px; line-height: 1.3;">
      This site uses analytics to improve user experience. No personal data collected.
    </div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button id="accept-analytics" style="
        background: #60a5fa;
        color: #000;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font-weight: 600;
        cursor: pointer;
        font-size: 11px;
      ">Accept</button>
      <button id="decline-analytics" style="
        background: transparent;
        color: #e0e6ed;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        padding: 6px 12px;
        font-weight: 500;
        cursor: pointer;
        font-size: 11px;
      ">Decline</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Fade in animation
  requestAnimationFrame(() => {
    banner.style.opacity = '1';
    banner.style.transform = 'translateY(0)';
  });

  // Auto-fade after 2.5 seconds
  let hideT = setTimeout(fadeOut, 2500);

  function fadeOut() {
    if (!banner.isConnected) return;
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(10px)';
    setTimeout(() => banner.remove(), 200);
  }

  // Add event listeners
  document.getElementById('accept-analytics').addEventListener('click', () => {
    setAnalyticsConsent(true);
    if (hideT) clearTimeout(hideT);
    fadeOut();
  });

  document.getElementById('decline-analytics').addEventListener('click', () => {
    setAnalyticsConsent(false);
    if (hideT) clearTimeout(hideT);
    fadeOut();
  });

  // Pause auto-hide on hover
  banner.addEventListener('mouseenter', () => {
    if (hideT) {
      clearTimeout(hideT);
      hideT = null;
    }
  });

  banner.addEventListener('mouseleave', () => {
    if (!hideT) {
      hideT = setTimeout(fadeOut, 1500);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    showAnalyticsConsentBanner();
    // Auto-initialize if user previously consented
    if (hasAnalyticsConsent()) {
      initializeAnalytics();
    }
  });
} else {
  showAnalyticsConsentBanner();
  if (hasAnalyticsConsent()) {
    initializeAnalytics();
  }
}

// Export functions for use in other scripts
window.analytics = {
  trackPageView,
  trackProjectView,
  trackAudioInteraction,
  trackCVDownload,
  trackContactInteraction,
  setAnalyticsConsent,
  hasAnalyticsConsent
};
