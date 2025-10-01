/**
 * Service Worker for Igor Szuniewicz Portfolio
 * Implements intelligent caching strategies for optimal performance
 */

const CACHE_NAME = 'igor-portfolio-v2025.3';
const STATIC_CACHE = 'static-assets-v2025.3';
const DYNAMIC_CACHE = 'dynamic-content-v2025.3';
const IMAGE_CACHE = 'images-v2025.3';
const AUDIO_CACHE = 'audio-v2025.3';

// Cache durations (in milliseconds)
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60 * 1000,    // 7 days
  dynamic: 24 * 60 * 60 * 1000,       // 1 day
  images: 30 * 24 * 60 * 60 * 1000,   // 30 days
  audio: 7 * 24 * 60 * 60 * 1000      // 7 days
};

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/music.html',
  '/contact.html',
  '/projects/index.html',
  '/assets/css/critical.css',
  '/assets/css/main.css',
  '/assets/js/performance.js',
  '/assets/js/main.js',
  '/assets/js/resource-optimizer.js',
  '/assets/js/image-optimizer.js',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png'
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  '/assets/audio/tracks.json',
  '/contact.html',
  '/api/'
];

// Cache-first resources (serve from cache if available)
const CACHE_FIRST = [
  '/assets/css/',
  '/assets/js/',
  '/assets/webfonts/',
  '/images/',
  '/songs/'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS);
      }),

      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!isCurrentCache(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Skip external requests (except fonts)
  if (url.origin !== self.location.origin && !isFontRequest(request)) return;

  event.respondWith(handleRequest(request));
});

// Handle different types of requests with appropriate strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // HTML pages - Network first with cache fallback
    if (isHTMLRequest(request)) {
      return await networkFirstStrategy(request, DYNAMIC_CACHE);
    }

    // Network-first resources
    if (NETWORK_FIRST.some(pattern => pathname.includes(pattern))) {
      return await networkFirstStrategy(request, DYNAMIC_CACHE);
    }

    // Images - Cache first with network fallback
    if (isImageRequest(request)) {
      return await cacheFirstStrategy(request, IMAGE_CACHE);
    }

    // Audio files - Cache first with network fallback
    if (isAudioRequest(request)) {
      return await cacheFirstStrategy(request, AUDIO_CACHE);
    }

    // Static assets - Cache first
    if (CACHE_FIRST.some(pattern => pathname.includes(pattern))) {
      return await cacheFirstStrategy(request, STATIC_CACHE);
    }

    // Fonts - Cache first
    if (isFontRequest(request)) {
      return await cacheFirstStrategy(request, STATIC_CACHE);
    }

    // Default: Network first
    return await networkFirstStrategy(request, DYNAMIC_CACHE);

  } catch (error) {
    console.error('Fetch error:', error);
    return await handleFailedRequest(request);
  }
}

// Network-first strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request, cacheName) {
  // Try cache first
  const cachedResponse = await caches.match(request);

  if (cachedResponse && !isExpired(cachedResponse, cacheName)) {
    return cachedResponse;
  }

  try {
    // Cache miss or expired, fetch from network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, return stale cache if available
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Handle failed requests with appropriate fallbacks
async function handleFailedRequest(request) {
  // HTML pages - return offline page
  if (isHTMLRequest(request)) {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;
  }

  // Images - return placeholder
  if (isImageRequest(request)) {
    const placeholder = await caches.match('/images/placeholder.svg');
    if (placeholder) return placeholder;
  }

  // Return a basic error response
  return new Response('Network error', {
    status: 408,
    statusText: 'Network error'
  });
}

// Utility functions
function isCurrentCache(cacheName) {
  const currentCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, AUDIO_CACHE];
  return currentCaches.includes(cacheName);
}

function isHTMLRequest(request) {
  return request.destination === 'document' ||
         request.headers.get('Accept')?.includes('text/html');
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(new URL(request.url).pathname);
}

function isAudioRequest(request) {
  return request.destination === 'audio' ||
         /\.(mp3|wav|m4a|ogg|flac)$/i.test(new URL(request.url).pathname);
}

function isFontRequest(request) {
  return request.destination === 'font' ||
         /\.(woff|woff2|ttf|eot)$/i.test(new URL(request.url).pathname) ||
         request.url.includes('fonts.googleapis.com') ||
         request.url.includes('fonts.gstatic.com');
}

function isExpired(response, cacheName) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;

  const cacheDate = new Date(dateHeader);
  const now = new Date();
  const duration = getCacheDuration(cacheName);

  return (now - cacheDate) > duration;
}

function getCacheDuration(cacheName) {
  if (cacheName.includes('static')) return CACHE_DURATION.static;
  if (cacheName.includes('dynamic')) return CACHE_DURATION.dynamic;
  if (cacheName.includes('images')) return CACHE_DURATION.images;
  if (cacheName.includes('audio')) return CACHE_DURATION.audio;
  return CACHE_DURATION.dynamic;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  // Handle offline contact form submissions
  const requests = await getStoredRequests('contact-form');

  for (const request of requests) {
    try {
      await fetch(request.url, request.options);
      await removeStoredRequest('contact-form', request.id);
    } catch (error) {
      console.error('Failed to sync contact form:', error);
    }
  }
}

// IndexedDB helpers for offline storage
async function getStoredRequests(tag) {
  // Simplified for this example - would use IndexedDB in production
  return [];
}

async function removeStoredRequest(tag, id) {
  // Simplified for this example - would use IndexedDB in production
}

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_REPORT') {
    console.log('Performance data from client:', event.data.data);
  }
});

console.log('Service Worker loaded successfully');