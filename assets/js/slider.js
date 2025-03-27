document.addEventListener("DOMContentLoaded", function() {
  const slides = document.querySelectorAll('.slider .slide');
  let currentSlide = 0;
  
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 5000); // zmiana co 5 sekund
});
