document.addEventListener("DOMContentLoaded", function() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.slider-nav.prev');
  const nextBtn = slider.querySelector('.slider-nav.next');
  let currentSlide = 0;
  let isTransitioning = false;

  // Accessibility roles/attributes
  slider.setAttribute('role', 'region');
  slider.setAttribute('aria-roledescription', 'carousel');
  slider.setAttribute('aria-label', slider.getAttribute('data-label') || 'Featured projects slider');
  // Live region for announcements
  let live = slider.querySelector('.slider-live');
  if (!live) {
    live = document.createElement('div');
    live.className = 'visually-hidden slider-live';
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    slider.appendChild(live);
  }

  slides.forEach((s,i)=>{
    s.classList.toggle('active', i===0);
    s.setAttribute('role','group');
    s.setAttribute('aria-roledescription','slide');
    s.setAttribute('aria-label', `Slide ${i+1} of ${slides.length}`);
    if (i!==0){
      s.style.opacity='0'; s.style.visibility='hidden'; s.style.pointerEvents='none';
      s.setAttribute('tabindex','-1');
      s.setAttribute('aria-hidden','true');
    } else {
      s.removeAttribute('aria-hidden');
      s.setAttribute('tabindex','0');
    }
  });

  function announce() {
    const active = slides[currentSlide];
    const heading = active.querySelector('h3,h2,h1,a,span');
    live.textContent = `Slide ${currentSlide+1} of ${slides.length}${heading ? ': '+ heading.textContent.trim():''}`;
  }

  function goToSlide(index) {
    if (!slides.length) return;
    if (isTransitioning) return;
    if (index === currentSlide) return;
    isTransitioning = true;
    const prev = slides[currentSlide];
    prev.classList.remove('active');
    prev.style.transition = 'opacity 250ms ease-in-out';
    prev.style.opacity = '0'; prev.style.visibility='hidden'; prev.style.pointerEvents='none';
    prev.setAttribute('aria-hidden','true');
    prev.setAttribute('tabindex','-1');
    slides.forEach((s,i)=>{ if (i!==currentSlide) { s.style.opacity = '0'; s.style.visibility='hidden'; s.style.pointerEvents='none'; }});
    currentSlide = (index + slides.length) % slides.length;
    const next = slides[currentSlide];
    next.style.transition = 'opacity 250ms ease-in-out';
    next.classList.add('active');
    next.style.opacity='1'; next.style.visibility='visible'; next.style.pointerEvents='auto';
    next.removeAttribute('aria-hidden');
    next.setAttribute('tabindex','0');
    announce();
    // Move focus if navigation was via keyboard
    if (document.activeElement === prevBtn || document.activeElement === nextBtn) {
      next.focus({preventScroll:true});
    }
    setTimeout(()=>{ isTransitioning = false; }, 280);
  }

  let autoTimer = setInterval(() => {
    if (!isTransitioning) goToSlide(currentSlide + 1);
  }, 6000); // slightly slower for readability

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 6000);
  }

  function prev() { goToSlide(currentSlide - 1); resetTimer(); }
  function next() { goToSlide(currentSlide + 1); resetTimer(); }

  if (prevBtn) {
    prevBtn.addEventListener('click', prev);
    prevBtn.addEventListener('keydown', e=>{ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); prev(); } });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', next);
    nextBtn.addEventListener('keydown', e=>{ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); next(); } });
  }

  // Keyboard arrow navigation on slider container
  slider.addEventListener('keydown', e=>{
    if (e.key==='ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key==='ArrowRight') { e.preventDefault(); next(); }
  });

  slider.addEventListener('mouseenter', ()=> clearInterval(autoTimer));
  slider.addEventListener('mouseleave', ()=> resetTimer());

  announce();
});
