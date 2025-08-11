document.addEventListener("DOMContentLoaded", function() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.slider-nav.prev');
  const nextBtn = slider.querySelector('.slider-nav.next');
  let currentSlide = 0;
  let isTransitioning = false;
  // Ensure single active slide at start
  slides.forEach((s,i)=>{
    s.classList.toggle('active', i===0);
    if (i!==0){ s.style.opacity='0'; s.style.visibility='hidden'; s.style.pointerEvents='none'; }
  });

  function goToSlide(index) {
    // guard
    if (!slides.length) return;
    if (isTransitioning) return;
    if (index === currentSlide) return;
    isTransitioning = true;
    // hide previous fully before showing next
    const prev = slides[currentSlide];
    prev.classList.remove('active');
    prev.style.transition = 'opacity 250ms ease-in-out';
    prev.style.opacity = '0'; prev.style.visibility='hidden'; prev.style.pointerEvents='none';
    // ensure only one visible at a time
    slides.forEach((s,i)=>{ if (i!==currentSlide) { s.style.opacity = '0'; s.style.visibility='hidden'; s.style.pointerEvents='none'; }});
    currentSlide = (index + slides.length) % slides.length;
    const next = slides[currentSlide];
    next.style.transition = 'opacity 250ms ease-in-out';
    next.classList.add('active');
    next.style.opacity='1'; next.style.visibility='visible'; next.style.pointerEvents='auto';
    setTimeout(()=>{ isTransitioning = false; }, 280);
  }

  let autoTimer = setInterval(() => {
    if (!isTransitioning) goToSlide(currentSlide + 1);
  }, 5000);

  function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5000);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      resetTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      resetTimer();
    });
  }
  // Pause on hover to reduce rapid transitions
  slider.addEventListener('mouseenter', ()=> clearInterval(autoTimer));
  slider.addEventListener('mouseleave', ()=> resetTimer());
});
