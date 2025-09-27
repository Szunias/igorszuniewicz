// Global Lightbox System for Project Galleries
(function() {
  'use strict';

  let currentGalleryImages = [];
  let currentImageIndex = 0;
  let lightboxInitialized = false;

  // Create lightbox HTML structure
  function createLightbox() {
    if (document.getElementById('global-lightbox')) return;

    const lightboxHTML = `
      <div class="global-lightbox" id="global-lightbox">
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
          <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#8249;</button>
          <button class="lightbox-nav lightbox-next" aria-label="Next image">&#8250;</button>
          <img id="lightbox-img" src="" alt="" />
          <div class="lightbox-counter">
            <span id="lightbox-current">1</span> / <span id="lightbox-total">1</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    addLightboxStyles();
    bindLightboxEvents();
  }

  // Add CSS styles for lightbox
  function addLightboxStyles() {
    if (document.getElementById('lightbox-styles')) return;

    const styles = `
      <style id="lightbox-styles">
        .global-lightbox {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.95);
          z-index: 100000;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .global-lightbox.active {
          display: flex;
          opacity: 1;
        }

        .global-lightbox .lightbox-content {
          max-width: 80%;
          max-height: 80%;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .global-lightbox .lightbox-content img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        }

        .global-lightbox .lightbox-close {
          position: absolute;
          top: -60px;
          right: -60px;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          font-size: 2.5rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          line-height: 1;
        }

        .global-lightbox .lightbox-close:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.1);
        }

        .global-lightbox .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          font-size: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          line-height: 1;
        }

        .global-lightbox .lightbox-nav:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-50%) scale(1.1);
        }

        .global-lightbox .lightbox-prev {
          left: -100px;
        }

        .global-lightbox .lightbox-next {
          right: -100px;
        }

        .global-lightbox .lightbox-counter {
          position: absolute;
          bottom: -60px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        /* Hide navigation if only one image */
        .global-lightbox.single-image .lightbox-nav,
        .global-lightbox.single-image .lightbox-counter {
          display: none;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .global-lightbox .lightbox-content {
            max-width: 90%;
            max-height: 85%;
          }

          .global-lightbox .lightbox-close {
            top: -50px;
            right: -50px;
            width: 50px;
            height: 50px;
            font-size: 2rem;
          }

          .global-lightbox .lightbox-nav {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
          }

          .global-lightbox .lightbox-prev {
            left: -70px;
          }

          .global-lightbox .lightbox-next {
            right: -70px;
          }

          .global-lightbox .lightbox-counter {
            bottom: -50px;
            padding: 8px 16px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .global-lightbox .lightbox-content {
            max-width: 95%;
            max-height: 80%;
          }

          .global-lightbox .lightbox-close {
            top: 20px;
            right: 20px;
            width: 45px;
            height: 45px;
            font-size: 1.8rem;
          }

          .global-lightbox .lightbox-nav {
            width: 45px;
            height: 45px;
            font-size: 1.3rem;
          }

          .global-lightbox .lightbox-prev {
            left: 20px;
          }

          .global-lightbox .lightbox-next {
            right: 20px;
          }

          .global-lightbox .lightbox-counter {
            bottom: 20px;
            padding: 6px 12px;
            font-size: 0.8rem;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Bind lightbox events
  function bindLightboxEvents() {
    const lightbox = document.getElementById('global-lightbox');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => changeLightboxImage(-1));
    nextBtn.addEventListener('click', () => changeLightboxImage(1));

    // Close on background click
    lightbox.addEventListener('click', function(e) {
      if (e.target === this) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('active')) return;

      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          changeLightboxImage(-1);
          break;
        case 'ArrowRight':
          changeLightboxImage(1);
          break;
      }
    });
  }

  // Open lightbox with image
  function openLightbox(imageSrc, galleryImages, imageIndex) {
    currentGalleryImages = galleryImages;
    currentImageIndex = imageIndex;

    const lightbox = document.getElementById('global-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const currentSpan = document.getElementById('lightbox-current');
    const totalSpan = document.getElementById('lightbox-total');

    lightboxImg.src = imageSrc;
    currentSpan.textContent = imageIndex + 1;
    totalSpan.textContent = galleryImages.length;

    // Add single-image class if only one image
    if (galleryImages.length === 1) {
      lightbox.classList.add('single-image');
    } else {
      lightbox.classList.remove('single-image');
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close lightbox
  function closeLightbox() {
    const lightbox = document.getElementById('global-lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Change lightbox image
  function changeLightboxImage(direction) {
    if (currentGalleryImages.length <= 1) return;

    currentImageIndex += direction;

    if (currentImageIndex < 0) {
      currentImageIndex = currentGalleryImages.length - 1;
    } else if (currentImageIndex >= currentGalleryImages.length) {
      currentImageIndex = 0;
    }

    const lightboxImg = document.getElementById('lightbox-img');
    const currentSpan = document.getElementById('lightbox-current');

    lightboxImg.src = currentGalleryImages[currentImageIndex];
    currentSpan.textContent = currentImageIndex + 1;
  }

  // Initialize lightbox for all gallery items on the page
  function initializeGalleries() {
    if (lightboxInitialized) return;

    createLightbox();

    // Find all gallery containers
    const gallerySelectors = [
      '.projects-grid',
      '.ray-gallery',
      '.env-grid img',
      '.gallery-grid',
      '.project-gallery',
      '.pausedeserve-gallery',
      '.akantilado-gallery',
      '.amorak-gallery',
      '.richter-gallery'
    ];

    gallerySelectors.forEach(selector => {
      const containers = document.querySelectorAll(selector);

      containers.forEach(container => {
        const images = container.querySelectorAll('img');
        if (images.length === 0) return;

        const galleryImages = Array.from(images).map(img => {
          // Try to get high-res version or fall back to src
          return img.getAttribute('data-full') ||
                 img.getAttribute('data-src') ||
                 img.src;
        });

        images.forEach((img, index) => {
          // Skip if already has lightbox
          if (img.hasAttribute('data-lightbox-init')) return;

          img.setAttribute('data-lightbox-init', 'true');
          img.style.cursor = 'pointer';

          // Add click handler to parent or image
          const clickTarget = img.closest('.gallery-item') || img.closest('.image') || img;

          clickTarget.addEventListener('click', function(e) {
            e.preventDefault();
            const imageSrc = img.getAttribute('data-full') ||
                           img.getAttribute('data-src') ||
                           img.src;
            openLightbox(imageSrc, galleryImages, index);
          });
        });
      });
    });

    lightboxInitialized = true;
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGalleries);
  } else {
    initializeGalleries();
  }

  // Re-initialize if new content is added dynamically
  window.initializeLightbox = initializeGalleries;

})();