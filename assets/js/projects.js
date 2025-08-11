document.addEventListener('DOMContentLoaded', function() {
  const list = document.getElementById('projects-list');
  if (!list) return;

  const cards = Array.from(list.querySelectorAll('.project-card'));
  const filterButtons = document.querySelectorAll('[data-filter]');
  const sortSelect = document.getElementById('sort-select');

  function applyFilter(type) {
    cards.forEach(card => {
      const cardType = card.getAttribute('data-type');
      const show = type === 'all' || type === cardType;
      card.style.display = show ? '' : 'none';
      if (show) {
        const img = card.querySelector('img[data-src]');
        if (img && !img.src) { img.src = img.getAttribute('data-src'); }
      }
    });
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
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('primary'));
      btn.classList.add('primary');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  sortSelect && sortSelect.addEventListener('change', () => applySort(sortSelect.value));

  // Initial state
  applyFilter('all');
  sortSelect && applySort(sortSelect.value);

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
});

