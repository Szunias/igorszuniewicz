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
      const showByFilter = activeFilter === 'all' || activeFilter === cardType;
      const showByQuery = !q || title.includes(q);
      const show = showByFilter && showByQuery;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible++;
        const img = card.querySelector('img[data-src]');
        if (img && !img.src) { img.src = img.getAttribute('data-src'); }
      }
    });
    if (countEl) countEl.textContent = visible + ' shown';
  }

  function applySort(mode) {
    const sorted = cards.slice().sort((a, b) => {
      const at = a.getAttribute('data-title').toLowerCase();
      const bt = b.getAttribute('data-title').toLowerCase();
      const ad = a.getAttribute('data-date');
      const bd = b.getAttribute('data-date');
      switch (mode) {
        case 'title-asc': return at.localeCompare(bt);
        case 'title-desc': return bt.localeCompare(at);
        case 'date-asc': return ad.localeCompare(bd);
        case 'date-desc':
        default: return bd.localeCompare(ad);
      }
    });
    sorted.forEach(el => list.appendChild(el));
    applyAll();
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('primary'));
      btn.classList.add('primary');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      applyAll();
    });
  });

  sortSelect && sortSelect.addEventListener('change', () => applySort(sortSelect.value));

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      activeQuery = searchInput.value || '';
      applyAll();
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

  // View switcher (grid/list)
  function setView(mode){
    const wrapper = document.querySelector('.projects-grid');
    if (!wrapper) return;
    viewButtons.forEach(b => b.classList.remove('primary'));
    const btn = document.querySelector(`[data-view="${mode}"]`);
    if (btn) btn.classList.add('primary');
    if (mode === 'list'){
      wrapper.classList.add('projects-list');
    } else {
      wrapper.classList.remove('projects-list');
    }
  }
  viewButtons.forEach(b=> b.addEventListener('click', ()=> setView(b.getAttribute('data-view')||'grid')));
  setView('grid');
});

