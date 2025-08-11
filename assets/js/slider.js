document.addEventListener("DOMContentLoaded", function() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.slider-nav.prev');
  const nextBtn = slider.querySelector('.slider-nav.next');
  let currentSlide = 0;
  let isTransitioning = false;
  // Ensure single active slide at start
  slides.forEach((s,i)=>{ s.classList.toggle('active', i===0); });

  function goToSlide(index) {
    // guard
    if (!slides.length) return;
    if (isTransitioning) return;
    if (index === currentSlide) return;
    isTransitioning = true;
    // hide previous fully before showing next
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].style.transition = 'opacity 350ms ease-in-out';
    // ensure only one visible at a time
    slides.forEach((s,i)=>{ if (i!==currentSlide) { s.style.opacity = '0'; s.style.visibility='hidden'; s.style.pointerEvents='none'; }});
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    slides[currentSlide].style.opacity='1'; slides[currentSlide].style.visibility='visible'; slides[currentSlide].style.pointerEvents='auto';
    setTimeout(()=>{ isTransitioning = false; }, 420);
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
