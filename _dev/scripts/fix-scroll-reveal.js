// Fix for all project pages - show content immediately on load
document.addEventListener('DOMContentLoaded', () => {
  // Show all hidden elements immediately
  const hiddenElements = document.querySelectorAll('.row, .stats, .gallery, [style*="opacity: 0"]');
  hiddenElements.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  
  // Then setup scroll reveal for smooth animations on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // Observe elements for scroll animations
  const rows = document.querySelectorAll('.row');
  const stats = document.querySelector('.stats');
  const gallery = document.querySelector('.gallery');
  
  rows.forEach(row => observer.observe(row));
  if (stats) observer.observe(stats);
  if (gallery) observer.observe(gallery);
});
