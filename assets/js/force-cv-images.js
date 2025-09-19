/**
 * Force CV images to display - emergency fix
 */

(function() {
  'use strict';

  function forceCVImages() {
    console.log('🔧 Forcing CV images to display [REVEAL-FIX VERSION]...');

    // Wait for DOM to be ready
    setTimeout(() => {
      // First ensure CV section is revealed
      const cvSection = document.querySelector('#cv-section');
      if (cvSection && !cvSection.classList.contains('in-view')) {
        console.log('🔧 CV section not revealed yet, adding in-view class...');
        cvSection.classList.add('in-view');

        // Wait for reveal animation before proceeding
        setTimeout(() => {
          console.log('✅ CV section revealed, now forcing images...');
          forceImagesVisible();
        }, 600);
        return;
      }

      forceImagesVisible();
    }, 4000); // Further increased timeout
  }

  function forceImagesVisible() {
    // Find CV images directly and ensure they are visible
    const cvLogos = document.querySelectorAll('.cv-logo');
    const cvTitleImgs = document.querySelectorAll('.cv-title img');
    const allCvImgs = document.querySelectorAll('#cv-section img');

      console.log('Found .cv-logo images:', cvLogos.length);
      console.log('Found .cv-title img images:', cvTitleImgs.length);
      console.log('Found all #cv-section img:', allCvImgs.length);

      const cvImages = cvLogos.length > 0 ? cvLogos : (cvTitleImgs.length > 0 ? cvTitleImgs : allCvImgs);
      console.log('Forcing visibility for', cvImages.length, 'images');

      cvImages.forEach((img, index) => {
        if (img) {
          console.log(`Found image ${index + 1}:`, img.src);

          // Force all style properties
          img.style.cssText = `
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 28px !important;
            height: 28px !important;
            margin-right: 8px !important;
            padding: 2px !important;
            background: rgba(255,255,255,0.06) !important;
            border: 1px solid rgba(255,255,255,0.12) !important;
            border-radius: 4px !important;
            object-fit: contain !important;
            vertical-align: middle !important;
            position: static !important;
            z-index: auto !important;
            transform: none !important;
            filter: none !important;
          `;

          // Also add a class for identification
          img.classList.add('forced-visible');

          console.log(`✅ Forced image ${index + 1} to be visible`);
        }
      });

      // Test image loading by creating new image elements
      const schools = [
        { name: 'Howest DAE', file: 'dae.jpg' },
        { name: 'Copernicus', file: 'koperas.png' },
        { name: 'Music School', file: 'muzyczna.png' }
      ];

      schools.forEach(school => {
        const testImg = new Image();
        testImg.onload = () => {
          console.log(`✅ ${school.name} image (${school.file}) loads successfully`);
        };
        testImg.onerror = () => {
          console.error(`❌ ${school.name} image (${school.file}) failed to load`);
        };
        testImg.src = `images/${school.file}?t=${Date.now()}`;
      });
  }

  // Run the force function with extended delays
  function runForceWithDelay() {
    console.log('🔧 Starting force CV images with extended delay...');
    setTimeout(() => {
      forceCVImages();
      // Try again after 6 seconds if still no images found
      setTimeout(() => {
        const found = document.querySelectorAll('.cv-logo, .cv-title img, #cv-section img').length;
        if (found === 0) {
          console.log('🔧 Second force attempt after 6s delay...');
          forceCVImages();
        }
      }, 6000);
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runForceWithDelay);
  } else {
    runForceWithDelay();
  }

  // Expose globally
  window.forceCVImages = forceCVImages;

})();