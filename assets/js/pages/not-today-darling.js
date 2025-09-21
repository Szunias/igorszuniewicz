// Page-specific logic for Not Today, Darling!
// - Voiceline mini player
// - Activate retro background

(function(){
  'use strict';

  let currentAudio = null;
  let currentButton = null;

  function stopCurrent(){
    if (currentAudio && !currentAudio.paused) {
      try { currentAudio.pause(); } catch(_){ }
      try { currentAudio.currentTime = 0; } catch(_){ }
    }
    if (currentButton) {
      currentButton.classList.remove('playing');
      currentButton.textContent = '▶';
    }
    currentAudio = null;
    currentButton = null;
  }

  function playVoiceline(button, src){
    // Toggle if same button
    if (currentButton === button) { stopCurrent(); return; }
    stopCurrent();
    currentButton = button;
    currentAudio = new Audio(src);
    button.classList.add('playing');
    button.textContent = '⏸';
    currentAudio.play().catch(()=>{ stopCurrent(); });
    currentAudio.addEventListener('ended', stopCurrent);
    currentAudio.addEventListener('error', stopCurrent);
  }

  function bindVoicelines(){
    document.querySelectorAll('.voiceline-play').forEach(item=>{
      const btn = item.querySelector('.voiceline-button');
      const id = (item.getAttribute('onclick')||'').match(/'(.*?)'/);
      // Allow data-src override in markup later
      const src = item.getAttribute('data-src') || (id && id[1]) || 'grandma1';
      item.removeAttribute('onclick');
      item.addEventListener('click', ()=> playVoiceline(btn, '../songs/placeholder.wav'));
    });
  }

  function setupTrailer(){
    const wrapper = document.querySelector('.video-wrapper[data-video]');
    if (!wrapper) return;
    const thumb = wrapper.querySelector('.video-thumbnail');
    const frame = wrapper.querySelector('iframe');
    if (!thumb || !frame) return;
    const base = frame.getAttribute('data-base') || wrapper.getAttribute('data-video') || '';
    function activate(){
      thumb.style.display = 'none';
      frame.style.display = 'block';
      if (!base) return;
      const autoSrc = base.includes('autoplay=1') ? base : base + (base.includes('?') ? '&autoplay=1' : '?autoplay=1');
      if (frame.dataset.loaded !== '1' || !frame.src || frame.src === 'about:blank'){
        frame.src = autoSrc;
        frame.dataset.loaded = '1';
      } else if (!/autoplay=1/.test(frame.src)){
        frame.src = frame.src + (frame.src.includes('?') ? '&' : '?') + 'autoplay=1';
      }
    }
    thumb.addEventListener('click', activate);
    thumb.addEventListener('keydown', (evt)=>{
      if (evt.key === 'Enter' || evt.key === ' '){
        evt.preventDefault();
        activate();
      }
    });
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    if (!thumb.getAttribute('aria-label')){
      thumb.setAttribute('aria-label', 'Play trailer');
    }
  }

  function enableRetroBackground(){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(function(){ document.body.classList.add('retro-mode'); }, 500);
    });
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ bindVoicelines(); setupTrailer(); enableRetroBackground(); });
  } else {
    bindVoicelines();
    setupTrailer();
    enableRetroBackground();
  }
})();


