/**
 * Visit Counter
 * Tracks and displays page visit count using CountAPI
 */

(function() {
  'use strict';

  const NAMESPACE = 'igorszuniewicz';
  const KEY = 'portfolio_views';
  const BASE_COUNT = 2533; // Historical starting count
  const COUNTAPI_URL = `https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`;
  const COUNTAPI_GET_URL = `https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`;
  const COUNTERAPI_URL = `https://counterapi.dev/api/v1/${NAMESPACE}/${KEY}/hit`;
  const FALLBACK_KEY = 'last_known_count';
  const FETCH_TIMEOUT_MS = 3500;
  const INCREMENT_TTL_MS = 24 * 60 * 60 * 1000; // limit one increment per device per 24h
  const STORAGE_LAST_HIT = 'visit_last_hit_at';
  const SESSION_HIT_FLAG = 'visit_hit_session_done';

  // Fallback: try to increment via image beacon if fetch is blocked
  function beaconHit(url) {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        let finished = false;
        const done = (ok) => { if (!finished) { finished = true; resolve(ok); } };
        img.onload = () => done(true);
        img.onerror = () => done(false);
        // Bust caches
        const sep = url.includes('?') ? '&' : '?';
        img.src = `${url}${sep}_=${Date.now()}`;
        // Safety timeout
        setTimeout(() => done(false), FETCH_TIMEOUT_MS);
      } catch (_) {
        resolve(false);
      }
    });
  }

  function withTimeout(promise, ms) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort('timeout'), ms);
    return Promise.race([
      promise(ctrl.signal).finally(() => clearTimeout(timeout)),
    ]);
  }

  async function fetchCountFrom(url) {
    return withTimeout(async (signal) => {
      const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
        redirect: 'follow',
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Try to parse JSON, some providers may respond with text first
      let data;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        // Attempt to parse as JSON regardless
        const text = await res.text();
        try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response'); }
      }

      // Normalize common payload shapes
      // CountAPI -> { value }
      // CounterAPI -> { value } or { count } (be flexible)
      const value = (
        (typeof data.value === 'number' && data.value) ||
        (typeof data.count === 'number' && data.count)
      );
      if (typeof value !== 'number') throw new Error('Invalid payload');
      return value;
    }, FETCH_TIMEOUT_MS);
  }

  // Read current count without increment when possible
  async function readVisitCount() {
    // Prefer CountAPI GET (non-increment)
    try {
      const val = await fetchCountFrom(COUNTAPI_GET_URL);
      const total = BASE_COUNT + val;
      localStorage.setItem(FALLBACK_KEY, String(total));
      return total;
    } catch (_) {}

    // If GET fails, do not try any provider that increments implicitly.
    const cached = localStorage.getItem(FALLBACK_KEY);
    return cached ? parseInt(cached, 10) : BASE_COUNT;
  }

  // Increment counter (limited by local device rules)
  async function incrementVisitCount() {
    // Try primary provider (CountAPI hit)
    try {
      const val = await fetchCountFrom(COUNTAPI_URL);
      const total = BASE_COUNT + val;
      localStorage.setItem(FALLBACK_KEY, String(total));
      return total;
    } catch (_) {}

    // Fallback provider (CounterAPI hit)
    try {
      const val = await fetchCountFrom(COUNTERAPI_URL);
      const total = BASE_COUNT + val;
      localStorage.setItem(FALLBACK_KEY, String(total));
      return total;
    } catch (_) {}

    // Last attempt: image beacon to CountAPI, then try to read current value
    try {
      const ok = await beaconHit(COUNTAPI_URL);
      if (ok) {
        const total = await readVisitCount();
        localStorage.setItem(FALLBACK_KEY, String(total));
        return total;
      }
    } catch (_) {}

    const cached = localStorage.getItem(FALLBACK_KEY);
    return cached ? parseInt(cached, 10) : BASE_COUNT;
  }

  function shouldIncrementNow() {
    try {
      // avoid repeated increments within the same browser session
      if (sessionStorage.getItem(SESSION_HIT_FLAG) === '1') return false;

      const lastHit = parseInt(localStorage.getItem(STORAGE_LAST_HIT) || '0', 10);
      const now = Date.now();
      if (!lastHit || (now - lastHit) > INCREMENT_TTL_MS) return true;
      return false;
    } catch (_) {
      // If storage is blocked, err on the side of not incrementing repeatedly
      return false;
    }
  }

  function markIncremented() {
    try {
      sessionStorage.setItem(SESSION_HIT_FLAG, '1');
      localStorage.setItem(STORAGE_LAST_HIT, String(Date.now()));
    } catch (_) {}
  }

  // Format visit count for display
  function formatCount(count) {
    return count.toLocaleString('en-US');
  }

  // Animate counter number
  function animateCount(element, targetCount) {
    const duration = 1500;
    const startCount = Math.max(0, targetCount - 10);
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOut cubic

      const currentCount = Math.floor(startCount + (targetCount - startCount) * easeProgress);
      element.textContent = formatCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = formatCount(targetCount);
      }
    }

    requestAnimationFrame(update);
  }

  // Show visit counter
  async function showVisitCounter() {
    const counter = document.getElementById('visit-counter');
    const countSpan = document.getElementById('visit-count');

    if (!counter || !countSpan) return;

    try {
      const willIncrement = shouldIncrementNow();
      const currentCount = willIncrement ? await incrementVisitCount() : await readVisitCount();
      if (willIncrement) markIncremented();

      // Start animation after delay
      setTimeout(() => {
        counter.style.display = 'flex';
        counter.style.opacity = '0';
        counter.style.transform = 'translateY(10px)';

        setTimeout(() => {
          counter.style.opacity = '1';
          counter.style.transform = 'translateY(0)';
          animateCount(countSpan, currentCount);
        }, 100);
      }, 2500);

    } catch (error) {
      // Ensure we still show something useful if everything fails
      const cached = localStorage.getItem(FALLBACK_KEY);
      const fallback = cached ? parseInt(cached, 10) : BASE_COUNT;
      countSpan.textContent = formatCount(fallback);
      counter.style.display = 'flex';
    }
  }

  // Initialize when page loads
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showVisitCounter);
    } else {
      showVisitCounter();
    }
  }

  // Start only if not a bot
  function shouldShowCounter() {
    // Don't show for bots
    const botPattern = /bot|crawler|spider|scraper|headless/i;
    if (botPattern.test(navigator.userAgent)) return false;

    return true;
  }

  if (shouldShowCounter()) {
    init();
  }

})();
