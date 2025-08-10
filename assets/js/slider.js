document.addEventListener("DOMContentLoaded", function() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.slider-nav.prev');
  const nextBtn = slider.querySelector('.slider-nav.next');
  let currentSlide = 0;

  function goToSlide(index) {
    // guard
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
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
});
