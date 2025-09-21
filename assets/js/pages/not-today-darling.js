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

  function enableRetroBackground(){
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(function(){ document.body.classList.add('retro-mode'); }, 500);
    });
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ bindVoicelines(); enableRetroBackground(); });
  } else {
    bindVoicelines();
    enableRetroBackground();
  }
})();


