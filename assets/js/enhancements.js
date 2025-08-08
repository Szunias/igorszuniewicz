document.addEventListener('DOMContentLoaded', function() {
  // Enable reveal only if JS loads
  document.body.classList.add('reveal-enabled');

  function markVisibleNow() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.9 && rect.bottom > 0) {
        el.classList.add('in-view');
      }
    });
  }
  markVisibleNow();

  // Smooth page fade transitions
  // Intercept internal links and fade out before navigation
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow new tab etc.
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 180);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in-view'));
  }

  window.addEventListener('scroll', markVisibleNow, { passive: true });
});

document.addEventListener('DOMContentLoaded', function() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
  } else {
    // Fallback: show immediately
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in-view'));
  }
});

