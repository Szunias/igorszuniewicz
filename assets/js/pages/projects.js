document.addEventListener('DOMContentLoaded', function() {
  const list = document.getElementById('projects-list');
  if (!list) return;

  const cards = Array.from(list.querySelectorAll('.project-card'));
  const filterButtons = document.querySelectorAll('[data-filter]');
  const sortSelect = document.getElementById('sort-select');
  const searchInput = document.getElementById('projects-search');
  const countEl = document.getElementById('projects-count');
  const viewButtons = document.querySelectorAll('[data-view]');

  let activeFilter = 'all';
  let activeQuery = '';

  function applyAll() {
    const q = (activeQuery||'').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const cardType = card.getAttribute('data-type')||'';
      const title = (card.getAttribute('data-title')||'').toLowerCase();
      const content = (card.textContent||'').toLowerCase();

      // Improved filtering logic
      const showByFilter = activeFilter === 'all' || activeFilter === cardType;

      // Enhanced search with Polish character support and multiple search terms
      let showByQuery = true;
      if (q) {
        // Normalize Polish characters for search
        const normalizeText = (text) => text
          .replace(/[ąĄ]/g, 'a')
          .replace(/[ćĆ]/g, 'c')
          .replace(/[ęĘ]/g, 'e')
          .replace(/[łŁ]/g, 'l')
          .replace(/[ńŃ]/g, 'n')
          .replace(/[óÓ]/g, 'o')
          .replace(/[śŚ]/g, 's')
          .replace(/[żŻźŹ]/g, 'z');

        const normalizedQuery = normalizeText(q);
        const normalizedTitle = normalizeText(title);
        const normalizedContent = normalizeText(content);

        // Split query into words and check if all are found
        const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
        showByQuery = queryWords.every(word =>
          normalizedTitle.includes(word) || normalizedContent.includes(word)
        );
      }

      const show = showByFilter && showByQuery;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible++;
        const img = card.querySelector('img[data-src]');
        if (img && !img.src) { img.src = img.getAttribute('data-src'); }
      }
    });

    // Update count with better messaging
    if (countEl) {
      if (visible === 0 && (activeFilter !== 'all' || activeQuery)) {
        // Get current language and use appropriate text
        const currentLang = getCurrentLanguage();
        const noMatchTexts = {
          en: 'No projects match your criteria',
          pl: 'Brak projektów spełniających kryteria',
          nl: 'Geen projecten voldoen aan criteria'
        };
        countEl.textContent = noMatchTexts[currentLang] || noMatchTexts.en;
      } else {
        const currentLang = getCurrentLanguage();
        const shownTexts = {
          en: 'shown',
          pl: 'pokazane',
          nl: 'getoond'
        };
        countEl.textContent = visible + ' ' + (shownTexts[currentLang] || shownTexts.en);
      }
    }
  }

  // Helper function to get current language
  function getCurrentLanguage() {
    try {
      return localStorage.getItem('site-lang') || 'en';
    } catch(_) {
      return 'en';
    }
  }

  function applySort(mode) {
    // Use requestAnimationFrame for smoother sorting
    requestAnimationFrame(() => {
      const sorted = cards.slice().sort((a, b) => {
        const at = (a.getAttribute('data-title') || '').toLowerCase();
        const bt = (b.getAttribute('data-title') || '').toLowerCase();
        const ad = a.getAttribute('data-date') || '';
        const bd = b.getAttribute('data-date') || '';

        switch (mode) {
          case 'title-asc': return at.localeCompare(bt, undefined, { numeric: true });
          case 'title-desc': return bt.localeCompare(at, undefined, { numeric: true });
          case 'date-asc': return ad.localeCompare(bd);
          case 'date-desc':
          default: return bd.localeCompare(ad);
        }
      });

      // Use DocumentFragment for better performance
      const fragment = document.createDocumentFragment();
      sorted.forEach(el => fragment.appendChild(el));
      list.appendChild(fragment);

      applyAll();
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update button states
      filterButtons.forEach(b => b.classList.remove('primary'));
      btn.classList.add('primary');

      // Update active filter
      const newFilter = btn.getAttribute('data-filter') || 'all';
      if (newFilter !== activeFilter) {
        activeFilter = newFilter;

        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
          applyAll();
        });
      }
    });
  });

  sortSelect && sortSelect.addEventListener('change', () => applySort(sortSelect.value));

  // Search input with debouncing for better performance
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        activeQuery = searchInput.value || '';
        requestAnimationFrame(() => {
          applyAll();
        });
      }, 150); // 150ms delay for smoother typing experience
    });

    // Clear search on escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        activeQuery = '';
        applyAll();
      }
    });
  }

  // Initial state
  activeFilter = 'all';
  applySort(sortSelect ? sortSelect.value : 'date-desc');
  applyAll();

  // Lazy-load any remaining thumbnails that use data-src
  const lazyImgs = Array.from(list.querySelectorAll('img[data-src]'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting) {
          const img = e.target; img.src = img.dataset.src; img.removeAttribute('data-src');
          io.unobserve(img);
        }
      });
    }, { rootMargin: '160px' });
    lazyImgs.forEach(img=> io.observe(img));
  } else {
    lazyImgs.forEach(img=> { img.src = img.dataset.src; img.removeAttribute('data-src'); });
  }

  // View switcher (grid/list) with improved transitions
  function setView(mode) {
    const wrapper = document.querySelector('.projects-grid');
    if (!wrapper) return;

    // Update button states
    viewButtons.forEach(b => b.classList.remove('primary'));
    const btn = document.querySelector(`[data-view="${mode}"]`);
    if (btn) btn.classList.add('primary');

    // Store view preference
    try {
      localStorage.setItem('projects-view', mode);
    } catch(_) {}

    // Apply view changes with smooth transition
    if (mode === 'list') {
      wrapper.classList.add('projects-list');
      wrapper.setAttribute('data-view', 'list');
    } else {
      wrapper.classList.remove('projects-list');
      wrapper.setAttribute('data-view', 'grid');
    }

    // Trigger reflow for any layout animations
    requestAnimationFrame(() => {
      wrapper.offsetHeight; // Force reflow
    });
  }

  viewButtons.forEach(b => {
    b.addEventListener('click', () => {
      const viewMode = b.getAttribute('data-view') || 'grid';
      setView(viewMode);
    });
  });

  // Restore saved view preference or default to grid
  let savedView = 'grid';
  try {
    savedView = localStorage.getItem('projects-view') || 'grid';
  } catch(_) {}
  setView(savedView);
});

