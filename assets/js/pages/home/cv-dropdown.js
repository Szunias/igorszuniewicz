export function initCvDropdown() {
  const setup = () => {
    const dropdown = document.querySelector('.cv-dropdown');
    const toggle = dropdown?.querySelector('.cv-dropdown-toggle');
    if (!dropdown || !toggle) return;

    const closeDropdown = () => {
      dropdown.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isActive = dropdown.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('.cv-dropdown-item')) {
        closeDropdown();
        return;
      }
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && dropdown.classList.contains('active')) {
        closeDropdown();
      }
    });

    window.addEventListener(
      'scroll',
      () => {
        if (dropdown.classList.contains('active')) {
          closeDropdown();
        }
      },
      { passive: true }
    );
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}
