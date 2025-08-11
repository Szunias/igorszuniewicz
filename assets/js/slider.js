document.addEventListener("DOMContentLoaded", function() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.slider-nav.prev');
  const nextBtn = slider.querySelector('.slider-nav.next');
  let currentSlide = 0;
  // Ensure single active slide at start
  slides.forEach((s,i)=>{ s.classList.toggle('active', i===0); });

  function goToSlide(index) {
    // guard
    if (!slides.length) return;
    // fade out current and force reflow to avoid caption overlap
    slides[currentSlide].classList.remove('active');
    void slides[currentSlide].offsetWidth;
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  let autoTimer = setInterval(() => {
    goToSlide(currentSlide + 1);
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
