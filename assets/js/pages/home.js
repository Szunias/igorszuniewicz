import { initTranslation } from './home/translation.js';
import { initVimeoFallback } from './home/vimeo.js';
import { initHeaderScroll } from './home/header-scroll.js';
import { initScrollReveal } from './home/scroll-reveal.js';
import { initCounters } from './home/counter.js';
import { initSmoothScroll } from './home/smooth-scroll.js';
import { initCursorGlow } from './home/cursor-glow.js';
import { initProjectCardHover } from './home/project-hover.js';
import { initLanguagePrompt } from './home/language-prompt.js';
import { initMobileMenu } from './home/mobile-menu.js';
import { initCvDropdown } from './home/cv-dropdown.js';

const { setLanguage, getCurrentLanguage } = initTranslation();

initVimeoFallback();
initHeaderScroll();
initScrollReveal();
initCounters();
initSmoothScroll();
initCursorGlow();
initProjectCardHover();
initLanguagePrompt({ setLanguage, getCurrentLanguage });
initMobileMenu();
initCvDropdown();
