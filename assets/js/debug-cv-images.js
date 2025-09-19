/**
 * Debug script for CV images - helps identify why school logos aren't showing
 */

(function() {
  'use strict';

  function debugCVImages() {
    console.group('🔍 CV Images Debug Report [REVEAL-FIX VERSION]');

    // First check if CV section exists at all
    const cvSection = document.querySelector('#cv-section');
    console.log('CV Section exists:', !!cvSection);

    if (cvSection) {
      console.log('CV Section has in-view class:', cvSection.classList.contains('in-view'));

      // Force the reveal animation if not already revealed
      if (!cvSection.classList.contains('in-view')) {
        console.log('🔧 Adding in-view class to trigger reveal animation...');
        cvSection.classList.add('in-view');

        // Wait a moment for CSS transitions to take effect
        setTimeout(() => {
          console.log('✅ Reveal animation triggered, re-running debug...');
          continueDebug();
        }, 500);
        return;
      }

      continueDebug();
    }
  }

  function continueDebug() {
    const cvSection = document.querySelector('#cv-section');
    if (cvSection) {
      console.log('CV Section HTML:', cvSection.innerHTML.substring(0, 500) + '...');
    }

    // Check for cv-title elements
    const cvTitles = document.querySelectorAll('.cv-title');
    console.log('Found .cv-title elements:', cvTitles.length);

    // Find all CV images with more specific selectors
    const cvLogos = document.querySelectorAll('.cv-logo');
    const cvTitleImgs = document.querySelectorAll('.cv-title img');
    const allCvImgs = document.querySelectorAll('#cv-section img');
    const allImgs = document.querySelectorAll('img');

    console.log('Found .cv-logo images:', cvLogos.length);
    console.log('Found .cv-title img images:', cvTitleImgs.length);
    console.log('Found all #cv-section img:', allCvImgs.length);
    console.log('Found all img elements on page:', allImgs.length);

    // List all images on the page with their sources
    allImgs.forEach((img, i) => {
      if (img.src.includes('dae.jpg') || img.src.includes('koperas.png') || img.src.includes('muzyczna.png')) {
        console.log(`School image ${i}:`, img.src, 'Classes:', img.className);
      }
    });

    const cvImages = cvLogos.length > 0 ? cvLogos : (cvTitleImgs.length > 0 ? cvTitleImgs : allCvImgs);
    console.log('Using images:', cvImages.length);

    cvImages.forEach((img, index) => {
      console.group(`Image ${index + 1}:`);
      console.log('Element:', img);
      console.log('Source:', img.src);
      console.log('Alt text:', img.alt);
      console.log('Classes:', img.className);
      console.log('Complete:', img.complete);
      console.log('Natural width:', img.naturalWidth);
      console.log('Natural height:', img.naturalHeight);

      // Check computed styles
      const computed = window.getComputedStyle(img);
      console.log('Computed display:', computed.display);
      console.log('Computed visibility:', computed.visibility);
      console.log('Computed opacity:', computed.opacity);
      console.log('Computed width:', computed.width);
      console.log('Computed height:', computed.height);
      console.log('Computed position:', computed.position);

      // Check if image loads
      if (!img.complete) {
        img.onload = () => {
          console.log(`✅ Image ${index + 1} loaded successfully`);
        };
        img.onerror = () => {
          console.error(`❌ Image ${index + 1} failed to load`);
        };
      }

      console.groupEnd();
    });

    // Check image files directly
    const imageFiles = ['dae.jpg', 'koperas.png', 'muzyczna.png'];
    imageFiles.forEach(filename => {
      const testImg = new Image();
      testImg.onload = () => {
        console.log(`✅ ${filename} is accessible and valid`);
      };
      testImg.onerror = () => {
        console.error(`❌ ${filename} failed to load or is not accessible`);
      };
      testImg.src = `images/${filename}?v=${Date.now()}`;
    });

    console.groupEnd();
  }

  // Run debug when DOM is ready with multiple attempts
  function runDebugWithDelay() {
    console.log('Document ready state:', document.readyState);
    setTimeout(() => {
      debugCVImages();
      // Try again after 5 seconds if no images found
      setTimeout(() => {
        if (document.querySelectorAll('.cv-logo').length === 0) {
          console.log('🔍 Second attempt after 5s delay...');
          debugCVImages();
        }
      }, 5000);
    }, 3000); // 3 second initial delay
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDebugWithDelay);
  } else {
    runDebugWithDelay();
  }

  // Also expose globally for manual debugging
  window.debugCVImages = debugCVImages;
  window.findCVImagesNow = function() {
    console.log('🔍 Manual CV images search triggered...');
    debugCVImages();

    // Also try to force images visible
    if (window.forceCVImages) {
      window.forceCVImages();
    }
  };

})();