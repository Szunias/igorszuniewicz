/* Simple, professional tracklist + player */
(function(){
  const isMusic = !!document.getElementById('music-list');
  if (!isMusic) return;

  const listEl = document.getElementById('music-list');
  const searchEl = document.getElementById('music-search');
  const tagsEl = document.getElementById('music-tags');
  const sortEl = document.getElementById('music-sort');

  const playerBar = document.getElementById('player-bar');
  const pbCover = playerBar.querySelector('.pb-cover');
  const pbTitle = playerBar.querySelector('.pb-title');
  const pbSub = playerBar.querySelector('.pb-sub');
  const pbPrev = playerBar.querySelector('.pb-prev');
  const pbPlay = playerBar.querySelector('.pb-play');
  const pbNext = playerBar.querySelector('.pb-next');
  const pbSeek = playerBar.querySelector('.pb-seek');
  const pbVol = playerBar.querySelector('.pb-vol');
  const pbCurrent = playerBar.querySelector('.pb-current');
  const pbDuration = playerBar.querySelector('.pb-duration');
  const pbWave = playerBar.querySelector('.pb-wave');
  let waveCtx = null, waveWidth = 0, waveHeight = 0, waveData = null;

  const audio = new Audio();
  audio.preload = 'metadata';
  const savedVol = parseFloat(localStorage.getItem('player-volume') || '');
  const safeVol = (isFinite(savedVol) ? Math.min(1, Math.max(0, savedVol)) : 0.9);
  audio.volume = safeVol;
  pbVol.value = String(safeVol);
  // initial CSS vars for sliders
  try { playerBar.style.setProperty('--vol', Math.round(audio.volume*100)+'%'); } catch(_){}

  function showPlayerToast(msg){
    let t = document.querySelector('.player-toast');
    if (!t){
      t = document.createElement('div');
      t.className='player-toast';
      t.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:14px;bottom:auto;background:rgba(12,18,24,0.96);color:#eaf7ff;border:1px solid rgba(255,255,255,0.14);padding:8px 12px;border-radius:10px;font-weight:700;z-index:3000;opacity:0;transition:opacity .18s;pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(()=>{
      t.style.opacity='1';
      setTimeout(()=>{ t.style.opacity='0'; }, 1000);
    });
  }

  let tracks = [];
  let view = [];
  let currentIndex = -1;
  let currentTrackId = null;

  function initPlayer(tracks){
    // expose tracks for i18n translation hooks
    try { window.__tracks__ = tracks; } catch(_){ }
    // View state must be declared before first applyFilters() call
    view = tracks.slice();
    // Populate filter chips from tags
    let allTags = Array.from(new Set([].concat.apply([], tracks.map(function(t){ return t.tags || []; })))).filter(function(tag){ return tag !== 'all'; }).sort();
    renderTagChips(allTags);
    // Ensure default is 'All' and render immediately
    activeTag = TAG_ALL;
    applyFilters();
    // Hook filters
    searchEl.addEventListener('input', applyFilters, { passive: true });
    if (sortEl) sortEl.addEventListener('change', applyFilters);
    // Final safety: ensure view is initialized to all, even if select/search are null
    try { activeTag = TAG_ALL; } catch(_) {}
    try { applyFilters(); } catch(_){ try { render(); } catch(__){} }
    try { layoutAlbumWall(); } catch(_){}
  }

  function chooseSource(track){
    const order = (track.sources && track.sources.length) ? track.sources : (track.url ? [{ url: track.url }] : []);
    function inferType(u){
      try { const url = String(u||'').toLowerCase();
        if (url.endsWith('.mp3')) return 'audio/mpeg';
        if (url.endsWith('.m4a') || url.endsWith('.mp4')) return 'audio/mp4';
        if (url.endsWith('.ogg') || url.endsWith('.oga')) return 'audio/ogg';
        if (url.endsWith('.wav')) return 'audio/wav';
      } catch(_){}
      return '';
    }
    const scored = order.map(function(s){
      const t = s.type || inferType(s.url);
      let score = 3;
      if (t==='audio/mpeg' || t==='audio/mp4' || t==='audio/ogg') score = 0; // prefer compressed
      else if (t==='audio/wav') score = 2; // avoid heavy unless only option
      else score = 1;
      return { src: s, type: t, score };
    });
    const playable = scored.filter(p => !p.type || audio.canPlayType(p.type)).sort((a,b)=> a.score - b.score).map(p=> p.src);
    return playable.length ? playable : order;
  }

  // Populate filter chips from tags
  const TAG_ALL = 'all';
  let activeTag = TAG_ALL;
  function renderTagChips(allTags){
    if (!tagsEl) return;
    tagsEl.innerHTML = '';
    const make = (value, label)=>{ const b=document.createElement('button'); b.type='button'; b.className='chip'+(activeTag===value?' active':''); b.dataset.tag=value; b.textContent = label; return b; };
    tagsEl.appendChild(make(TAG_ALL, 'All'));
    allTags.forEach(tag=> { const lbl = tag.charAt(0).toUpperCase()+tag.slice(1); tagsEl.appendChild(make(tag, lbl)); });
  }
  if (tagsEl){ tagsEl.addEventListener('click', (e)=>{ const b=e.target.closest('.chip'); if(!b || !b.dataset) return; activeTag=(b.dataset.tag||TAG_ALL); renderTagChips(Array.from(new Set([].concat.apply([], tracks.map(function(t){ return t.tags || []; })))).filter(function(tag){ return tag !== 'all'; }).sort()); applyFilters(); }); }
  // Genre wheel clicks map to the same tag system
  document.addEventListener('click', (e)=>{
    const g = e.target.closest('.genre-wheel .gw-node'); if (!g) return;
    const tag = g.getAttribute('data-tag') || TAG_ALL; activeTag = tag; renderTagChips(Array.from(new Set([].concat.apply([], tracks.map(function(t){ return t.tags || []; })))).filter(function(tag){ return tag !== 'all'; }).sort()); applyFilters();
  });
  // Toggle tag chips visibility (wheel stays visible)
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.gw-toggle'); if (!btn) return;
    const chips = document.querySelector('.music-finder .music-tags'); if (!chips) return;
    chips.classList.toggle('open');
  });

  fetch('assets/js/tracks.json')
    .then(response => response.json())
    .then(data => {
      tracks = data;
      // Ensure every track is matchable by the "All" filter and normalize tags
      tracks.forEach(function(t){
        const baseTags = Array.isArray(t.tags) ? t.tags : [];
        t.tags = Array.from(new Set(['all'].concat(baseTags)));
      });
      initPlayer(tracks);
    })
    .catch(error => {
      console.error('Error loading track data:', error);
      // Fallback: use embedded track data for local development
      const fallbackTracks = [
        { id:'ray', title:'Ray Animation — Credits Theme', artist:'Igor Szuniewicz', cover:'images/project5.png', tags:['film','score'], length: 0, date:'2024-01-10', year: 2024, desc:{ pl:'Funkowo zabarwiony cue do animacji. Lekki groove i figury basu prowadzą do świetlistej kadencji domykającej ujęcie. Brzmienie klarowne, z wyraźnym motywem i sprężystą sekcją.', en:'Funk‑tinged cue for animation. A light groove and bass figures steer the piece towards a luminous cadence that closes the shot. Clean tone with a recognisable motif and elastic rhythm section.', nl:'Funk‑getinte cue voor animatie. Lichte groove en basfiguren bouwen naar een lichtvolle cadens die de scène afrondt. Helder klankbeeld met herkenbaar motief en veerkrachtige ritmesectie.' }, sources:[ { url:'songs/RayCreditsTheme.wav', type:'audio/wav' } ] },
        { id:'richter', title:'Richter — Main Theme', artist:'Igor Szuniewicz', cover:'images/richter.png', tags:['film','score'], length: 0, date:'2024-06-01', year: 2024, desc:{ pl:'Sekwencja suspensu do etiudy filmowej: warstwowe smyczki i perkusja akcji wymuszają stałe narastanie, zakończone zdecydowanym, filmowym cięciem.', en:'Suspense sequence for a short film: layered strings and action percussion drive a continuous escalation, resolved with a decisive cinematic cutoff.', nl:'Suspense‑cue voor een korte film: gelaagde strijkers en actiedrums stuwen een constante opbouw, afgesloten met een beslissende filmische stop.' }, sources:[ { url:'songs/RichterMainTheme.m4a', type:'audio/mp4' }, { url:'songs/RichterMainTheme.mp3', type:'audio/mpeg' }, { url:'songs/RichterMainTheme.wav', type:'audio/wav' } ] },
        { id:'sp_inflow', title:'Inflow', artist:'Igor Szuniewicz', cover:'images/Inflow_track_cover.jpg', tags:['single','electronic'], length: 0, date:'2023-01-01', year: 2023, desc:{ pl:'Kameralny temat fortepianowy, który organicznie rozszerza się do pełnej orkiestracji smyczkowej. Delikatna ekspozycja motywu prowadzi do szerokiej, filmowej kulminacji.', en:'A chamber piano theme that expands organically into full string orchestration. A delicate exposition evolves towards a broad, cinematic climax.', nl:'Een kamerpianothema dat organisch uitgroeit tot volledige strijkerorkestratie. Een fragiele expositie groeit naar een brede, filmische climax.' }, sources:[ { url:'songs/Inflow.m4a', type:'audio/mp4' }, { url:'songs/Inflow.mp3', type:'audio/mpeg' }, { url:'songs/Igor Szuniewicz - Inflow.wav', type:'audio/wav' } ] },
        { id:'sp_astro', title:'Astrophonic Dance', artist:'Igor Szuniewicz', cover:'images/Astrophonic Dance_track_cover.jpg', tags:['single','electronic'], length: 0, date:'2023-01-01', year: 2023, desc:{ pl:'Uptempo elektronika z arpeggiowanymi leadami i szeroką sceną stereo. Syntetyczne faktury łączą się z taneczną pulsacją i lekką, przestrzenną produkcją.', en:'Uptempo electronica with arpeggiated leads and a wide stereo image. Synthetic textures meet a dance‑oriented pulse and spacious production.', nl:'Uptempo electronica met arpeggio‑leads en breed stereobeeld. Synthetische texturen combineren met een dansgerichte puls en luchtige productie.' }, sources:[ { url:'songs/AstrophonicDance.m4a', type:'audio/mp4' }, { url:'songs/AstrophonicDance.mp3', type:'audio/mpeg' }, { url:'songs/Igor Szuniewicz - Astrophonic Dance.wav', type:'audio/wav' } ] },
        { id:'sp_cathedral', title:'Cathedral Of Time', artist:'Igor Szuniewicz', cover:'images/Cathedral Of Time_track_cover.jpg', tags:['single','electronic'], length: 0, date:'2023-01-01', year: 2023, desc:{ pl:'Wolnorozwijające się, filmowo‑elektroniczne pejzaże: ciepłe harmonie, duża przestrzeń i kontemplacyjny nastrój podtrzymywany stabilnym pulsem.', en:'Slow‑bloom cinematic‑electronic soundscapes: warm harmonies, generous space and a contemplative mood sustained by a steady pulse.', nl:'Langzaam ontvouwende filmisch‑elektronische landschappen: warme harmonieën, veel ruimte en een contemplatieve sfeer met constante puls.' }, sources:[ { url:'songs/CathedralOfTime.m4a', type:'audio/mp4' }, { url:'songs/CathedralOfTime.mp3', type:'audio/mpeg' }, { url:'songs/Igor Szuniewicz - Cathedral Of Time.wav', type:'audio/wav' } ] },
        { id:'xianclash', title:'Xian Clash — Main Theme', artist:'Igor Szuniewicz', cover:'images/XianClashCover.png', tags:['film','score'], length: 0, date:'2024-02-10', year: 2024, desc:{ pl:'Temat do strategicznej gry planszowej: marszowa perkusja, modalne melodie i orkiestracyjna skala budują ceremoniálną potęgę i poczucie taktycznej koncentracji.', en:'Main theme for a strategy title: martial percussion, modal melodies and orchestral scale to convey ceremonial power and tactical focus.', nl:'Hoofdthema voor een strategiespel: marspercussie, modale melodieën en orkestrale schaal voor ceremoniële kracht en tactische focus.' }, sources:[ { url:'songs/XianClashMainTheme.m4a', type:'audio/mp4' }, { url:'songs/XianClashMainTheme.mp3', type:'audio/mpeg' }, { url:'songs/XianClashMainTheme.wav', type:'audio/wav' } ] },
        { id:'run', title:'Run — Main Theme', artist:'Igor Szuniewicz', cover:'images/Run.png', tags:['single','metal'], length: 0, date:'2025-02-11', year: 2025, desc:{ pl:'Energetyczny rock oparty na ciężkich, nisko strojonych riffach i zwartym groove\'u sekcji rytmicznej. Produkcja nastawiona na impakt i nieprzerwany pęd.', en:'High‑energy rock built on down‑tuned riffs and a tight rhythmic groove. Production focuses on impact and sustained forward momentum.', nl:'Energieke rock op basis van laag gestemde riffs en strakke ritmische groove. Productie gericht op impact en aanhoudende vaart.' }, sources:[ { url:'songs/RunMainTheme.m4a', type:'audio/mp4' }, { url:'songs/RunMainTheme.mp3', type:'audio/mpeg' }, { url:'songs/RunMainTheme.wav', type:'audio/wav' } ] },
        { id:'edgeoflife', title:'Edge Of Life', artist:'Igor Szuniewicz', cover:'images/EdgeOfLife.png', tags:['single','electronic','playful'], length: 0, date:'2024-06-01', year: 2024, sources:[ { url:'songs/EdgeOfLife.wav', type:'audio/wav' } ], desc:{ pl:'Uplifting indie‑electronica: jasne pianino, pulsujące syntezatory i afirmacyjna progresja. Czyste, przestrzenne brzmienie akcentuje pozytywną energię utworu.', en:'Uplifting indie‑electronic piece: bright piano, pulsing synths and an affirmative progression. Clean, spacious mix emphasises the track\'s positive energy.', nl:'Opbeurende indie‑electronica: helder piano, pulserende synths en affirmatieve progressie. Een heldere, ruimtelijke mix benadrukt de positieve energie.' } },
        { id:'cage', title:'Cage', artist:'Igor Szuniewicz', cover:'images/Cage.png', tags:['single','metal'], length: 0, date:'2025-02-15', year: 2025, sources:[ { url:'songs/Cage.wav', type:'audio/wav' } ], desc:{ pl:'Jeden z moich najmocniejszych utworów — industrial metal / hard rock: ciężkie gitary, masywny groove i surowa energia.', en:'One of my heaviest tracks — industrial metal / hard rock: heavy guitars, massive groove and raw energy.', nl:'Een van mijn hardste tracks — industrial metal / hard rock: zware gitaren, massieve groove en rauwe energie.' } }
      ];
      tracks = fallbackTracks;
      // Ensure every track is matchable by the "All" filter and normalize tags
      tracks.forEach(function(t){
        const baseTags = Array.isArray(t.tags) ? t.tags : [];
        t.tags = Array.from(new Set(['all'].concat(baseTags)));
      });
      initPlayer(tracks);
    });

  function fmtTime(s){ s=Math.max(0,Math.floor(s||0)); const m=Math.floor(s/60); const r=(s%60).toString().padStart(2,'0'); return m+':'+r; }

  

  function render(){
    try {
      if (!listEl) return;
      listEl.innerHTML = '';
      const wrap = document.createElement('div'); wrap.className='music-group';
      const title = document.createElement('div'); title.className='group-title';
      const group = (activeTag && activeTag !== 'all') ? activeTag : 'all';
      const pretty = group==='all' ? 'All' : (group.charAt(0).toUpperCase()+group.slice(1));
      const badgeClass = (group==='electronic')?'badge-electronic':(group==='game')?'badge-game':(group==='film')?'badge-film':(group==='metal')?'badge-metal':(group==='playful')?'badge-playful':(group==='score')?'badge-score':(group==='single')?'badge-single':'';
      const emoji = (group==='electronic')?'🎛️':(group==='game')?'🎮':(group==='film')?'🎬':(group==='metal')?'🎸':'🎵';
      if (badgeClass) title.classList.add(badgeClass);
      title.innerHTML = '<span class="emoji" aria-hidden="true">'+emoji+'</span><span>'+pretty+'</span>';
      wrap.appendChild(title);
      listEl.appendChild(wrap);
      let idx = 0;
      view.forEach(function(t){
        const vi = view.indexOf(t);
        const i = idx++;
        const card = document.createElement('div'); card.className='music-item'; card.tabIndex=0; card.dataset.index=String(vi); if (t.id) card.dataset.id = String(t.id);
        const tagsHtml = (Array.isArray(t.tags)?t.tags:[]).map(function(x){ return '<span>'+x+'</span>'; }).join('');
        card.innerHTML = `
          <img class="mi-cover" src="${t.cover||''}" alt="" loading="lazy" decoding="async" />
          <div class="mi-meta">
            <div class="mi-title">${t.title||'Untitled'}</div>
            <div class="mi-sub">${t.artist||''} • ${fmtTime(t.length)}</div>
            <div class="mi-tags">${tagsHtml}</div>
          </div>
          <div class="mi-year">${t.year ? String(t.year) : ''}</div>
          <button class="mi-play" aria-label="Play">▶</button>
        `;
        const playBtn = card.querySelector('.mi-play');
        function toggleThis(ev){ if (ev) ev.stopPropagation(); if (currentIndex===vi && !audio.paused){ audio.pause(); pbPlay.textContent='▶'; updateCardPlayButtons(); } else { start(vi); } }
        if (playBtn) playBtn.addEventListener('click', toggleThis);
        card.addEventListener('dblclick', toggleThis);
        // Non-intrusive hint on hover
        const hint = document.createElement('div'); hint.className='mi-hint';
        try {
          const lang = document.documentElement.getAttribute('lang') || document.documentElement.dataset.lang || 'en';
          const I = (window.I18N_PUBLIC||{});
          const txt = (I.music_hint_click && I.music_hint_click[lang]) || 'Click for details';
          hint.textContent = txt;
        } catch(_) { hint.textContent = 'Click for details'; }
        card.appendChild(hint);
        // Hover preview like projects: show album bubble on hover and follow cursor
        // Preview only when hovering the cover image (not the entire row)
        const coverEl = card.querySelector('.mi-cover');
        if (coverEl){
          coverEl.addEventListener('pointerenter', function(ev){ try { showPreview(t, ev); } catch(_){ } });
          coverEl.addEventListener('pointermove', function(ev){ try { positionPreview(ev); } catch(_){ } });
          coverEl.addEventListener('pointerleave', function(){ try { hidePreview(); } catch(_){ } });
        }
        // Open large modal with details on click
        card.addEventListener('click', function(e){
          e.preventDefault();
          openTrackModal(t, vi);
        });
        wrap.appendChild(card);
        if (!t.length || t.length===0) prefetchDuration(t, vi, card);
      });
      // Re-apply playing highlight after rebuild
      markPlayingCard();
    } catch(_e) {
      try {
        listEl.innerHTML='';
        view.forEach(function(t, vi){
          const card = document.createElement('div'); card.className='music-item'; card.tabIndex=0; card.dataset.index=String(vi);
          card.innerHTML = '<div class="mi-meta"><div class="mi-title">'+(t.title||'Untitled')+'</div><div class="mi-sub">'+(t.artist||'')+'</div></div><button class="mi-play" aria-label="Play">▶</button>';
          listEl.appendChild(card);
        });
      } catch(__) {}
    }
  }

  function updateCardPlayButtons(){
    const items = Array.from(listEl.querySelectorAll('.music-item'));
    items.forEach((node)=>{
      const btn = node.querySelector('.mi-play');
      if (!btn) return;
      const vi = parseInt(node.dataset.index||'-1',10);
      btn.textContent = (vi===currentIndex && !audio.paused) ? '⏸' : '▶';
    });
  }

  // Right-side sliding panel API
  let sidePanel = null; let sideCard = null;
  function closeSidePanel(){ if (!sidePanel) return; sidePanel.classList.remove('open'); window.removeEventListener('scroll', syncPanelToCard); window.removeEventListener('resize', syncPanelToCard); const sp=sidePanel; sidePanel=null; sideCard=null; setTimeout(()=> sp.remove(), 240); }
  function openSidePanel(track, cardNode, index){
    if (sidePanel && sideCard===cardNode){ closeSidePanel(); return; }
    if (sidePanel) closeSidePanel();
    sideCard = cardNode;
    sidePanel = document.createElement('div'); sidePanel.className='music-sidepanel';
    // Attach within the music list container so it overlays from right edge of the list
    const host = document.getElementById('music-list');
    const rect = cardNode.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const offsetTop = rect.top - hostRect.top; // relative to list container
    sidePanel.style.top = offsetTop + 'px';
    sidePanel.style.height = Math.max(rect.height, 120) + 'px';
    sidePanel.innerHTML = '<div class="msp-inner">'+
      '<div class="msp-cover"><img src="'+(track.cover||'')+'" alt=""/></div>'+
      '<div class="msp-meta">'+
        '<div class="msp-title">'+(track.title||'Untitled')+'</div>'+
        '<div class="msp-artist">'+(track.artist||'')+'</div>'+
        '<div class="msp-tags">'+((track.tags||[]).join(' • '))+'</div>'+
        '<div class="msp-actions"><button class="button small msp-play">Play</button><button class="button small msp-close">Close</button></div>'+
      '</div>'+
    '</div>';
    host.appendChild(sidePanel);
    // Panel slides in from the right edge of the list container
    requestAnimationFrame(()=>{
      const rect2 = cardNode.getBoundingClientRect();
      const hostRect2 = host.getBoundingClientRect();
      sidePanel.style.top = (rect2.top - hostRect2.top) + 'px';
      sidePanel.style.height = Math.max(rect2.height, 120) + 'px';
      sidePanel.classList.add('open');
    });
    sidePanel.querySelector('.msp-close').addEventListener('click', (ev)=>{ ev.stopPropagation(); closeSidePanel(); });
    sidePanel.querySelector('.msp-play').addEventListener('click', (ev)=>{ ev.stopPropagation(); start(index); });
    window.addEventListener('scroll', syncPanelToCard, { passive:true });
    window.addEventListener('resize', syncPanelToCard, { passive:true });
  }
  
  // Large modal window for track details
  let modalNode = null;
  // no temporary descriptions

  function openTrackModal(track, index){
    closeSidePanel();
    if (modalNode){ closeTrackModal(); }
    modalNode = document.createElement('div');
    modalNode.className = 'music-modal';
    const currentLang = (document.documentElement.getAttribute('lang') || document.documentElement.dataset.lang || 'en');
    const desc = (typeof track.desc === 'string') ? track.desc : (track.desc ? (track.desc[currentLang] || track.desc['en'] || '') : '');
    modalNode.innerHTML = '<div class="mm-backdrop"></div>'+
      '<div class="mm-dialog">'+
        '<button class="mm-close" aria-label="Close">×</button>'+
        '<div class="mm-left"><img src="'+(track.cover||'')+'" alt=""/></div>'+
        '<div class="mm-right">'+
          '<div class="mm-banner" style="display:none"><span class="mm-banner-text"></span><button class="mm-banner-btn" type="button"></button></div>'+
          '<h3 class="mm-title">'+(track.title||'Untitled')+'</h3>'+
          '<div class="mm-artist">'+(track.artist||'')+'</div>'+
          '<div class="mm-tags">'+((track.tags||[]).join(' • '))+'</div>'+
          (desc?'<p class="mm-desc">'+desc+'</p>':'')+
          '<div class="mm-timeline">\
             <span class="mm-time mm-cur">0:00</span>\
             <input type="range" class="mm-seek" min="0" max="1000" value="0" aria-label="Seek"/>\
             <span class="mm-time mm-dur">0:00</span>\
           </div>'+
          '<div class="mm-actions">\
             <button class="mm-prev" aria-label="Previous">⏮</button>\
             <button class="mm-play" aria-label="Play"><span class="mm-play-label">Play</span></button>\
             <button class="mm-next" aria-label="Next">⏭</button>\
           </div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(modalNode);
    requestAnimationFrame(()=> modalNode.classList.add('open'));
    modalNode.querySelector('.mm-close').addEventListener('click', closeTrackModal);
    modalNode.querySelector('.mm-backdrop').addEventListener('click', closeTrackModal);
    modalNode.querySelector('.mm-play').addEventListener('click', (ev)=>{ ev.stopPropagation();
      // toggle play/pause for the current track displayed in modal
      if (currentIndex===index && !audio.paused){
        audio.pause();
      } else {
        start(index);
      }
      updateModalPlayLabel();
      updateModalTimeline();
    });
    const mmSeek = modalNode.querySelector('.mm-seek');
    const mmTimeline = modalNode.querySelector('.mm-timeline');
    // Tooltip for exact time on hover
    let mmTip = null;
    if (mmTimeline){ mmTip = document.createElement('div'); mmTip.className='mm-tooltip'; mmTimeline.appendChild(mmTip); }
    if (mmSeek) mmSeek.addEventListener('input', (ev)=>{
      if (!isFinite(audio.duration) || audio.duration<=0) return;
      const ratio = parseFloat(mmSeek.value)/parseFloat(mmSeek.max||'1000');
      audio.currentTime = ratio * audio.duration;
    });
    if (mmSeek) mmSeek.addEventListener('mousemove', (ev)=>{
      try {
        if (!mmTip || !mmTimeline) return;
        const sRect = mmSeek.getBoundingClientRect();
        const tRect = mmTimeline.getBoundingClientRect();
        const x = Math.min(Math.max(ev.clientX - sRect.left, 0), sRect.width);
        const ratio = sRect.width>0 ? (x/sRect.width) : 0;
        const secs = isFinite(audio.duration) ? Math.round(ratio * audio.duration) : 0;
        mmTip.textContent = fmtTime(secs);
        mmTip.style.left = ((sRect.left - tRect.left) + x) + 'px';
        mmTip.style.top = ((sRect.top - tRect.top) - 28) + 'px';
        mmTip.classList.add('show');
      } catch(_){}
    });
    if (mmSeek) mmSeek.addEventListener('mouseleave', ()=>{ if (mmTip) mmTip.classList.remove('show'); });
    modalNode.querySelector('.mm-prev').addEventListener('click', (ev)=>{ ev.stopPropagation(); navigateModal(-1); });
    modalNode.querySelector('.mm-next').addEventListener('click', (ev)=>{ ev.stopPropagation(); navigateModal(1); });
    document.addEventListener('keydown', escClose, { capture:true });

    function navigateModal(dir){
      if (!Array.isArray(view) || view.length===0) return;
      const nextIndex = (index + dir + view.length) % view.length;
      const nextTrack = view[nextIndex]; if (!nextTrack) return;
      index = nextIndex; // update local index reference
      updateModalContent(nextTrack);
      start(nextIndex);
      updateModalPlayLabel();
    }
    function updateModalContent(tk){
      const lang = (document.documentElement.getAttribute('lang') || document.documentElement.dataset.lang || 'en');
      const d = (typeof tk.desc==='string') ? tk.desc : (tk.desc ? (tk.desc[lang]||tk.desc['en']||'') : '');
      const img = modalNode.querySelector('.mm-left img'); if (img) { img.src = tk.cover||''; }
      const tt = modalNode.querySelector('.mm-title'); if (tt) tt.textContent = tk.title||'Untitled';
      const ar = modalNode.querySelector('.mm-artist'); if (ar) ar.textContent = tk.artist||'';
      const tg = modalNode.querySelector('.mm-tags'); if (tg) tg.textContent = (tk.tags||[]).join(' • ');
      const de = modalNode.querySelector('.mm-desc');
      if (de) de.textContent = d; else if (d){ const p=document.createElement('p'); p.className='mm-desc'; p.textContent=d; modalNode.querySelector('.mm-right').insertBefore(p, modalNode.querySelector('.mm-actions')); }
      // reset timeline fill; will update if this track is the one playing
      const seek = modalNode.querySelector('.mm-seek'); if (seek){ seek.value='0'; seek.style.setProperty('--mmseek','0%'); }
      updateModalTimeline();
      updateModalPlayLabel();
      // Show info banner if different track is currently playing
      try {
        const banner = modalNode.querySelector('.mm-banner');
        const txt = modalNode.querySelector('.mm-banner-text');
        const btn = modalNode.querySelector('.mm-banner-btn');
        const cur = view[currentIndex];
        if (banner && cur){
          const same = (tk && cur && tk.title===cur.title);
          if (!audio.paused && !same){
            banner.style.display='flex';
            txt.textContent = 'Currently playing: '+(cur.title||'');
            btn.textContent = 'Switch here';
            btn.onclick = ()=>{ try { start(index); updateModalPlayLabel(); updateModalTimeline(); } catch(_){ } };
          } else {
            banner.style.display='none';
          }
        }
      } catch(_){ }
    }

    function updateModalPlayLabel(){
      const btn = modalNode && modalNode.querySelector('.mm-play'); if (!btn) return;
      const isPlayingThis = (currentIndex === index) && !audio.paused;
      const label = btn.querySelector('.mm-play-label');
      if (label) label.textContent = isPlayingThis ? 'Pause' : 'Play';
      btn.classList.toggle('is-playing', isPlayingThis);
    }
    // keep modal controls synced with global audio
    const onPlay = updateModalPlayLabel;
    const onPause = updateModalPlayLabel;
    function onEnded(){ updateModalPlayLabel(); updateModalTimeline(); }
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    modalNode._onPlay = onPlay; modalNode._onPause = onPause; modalNode._onEnded = onEnded;
  }
  function escClose(e){ if (e.key==='Escape'){ closeTrackModal(); } }
  function closeTrackModal(){ if (!modalNode) return; modalNode.classList.remove('open'); if (modalNode._onPlay){ try { audio.removeEventListener('play', modalNode._onPlay); } catch(_){ } } if (modalNode._onPause){ try { audio.removeEventListener('pause', modalNode._onPause); } catch(_){ } } if (modalNode._onEnded){ try { audio.removeEventListener('ended', modalNode._onEnded); } catch(_){ } } const n=modalNode; modalNode=null; setTimeout(()=> n.remove(), 220); document.removeEventListener('keydown', escClose, true); }
  function syncPanelToCard(){
    if (!sidePanel || !sideCard) return;
    const host = document.getElementById('music-list');
    const rect = sideCard.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    sidePanel.style.top = (rect.top - hostRect.top) + 'px';
    sidePanel.style.height = Math.max(rect.height, 120) + 'px';
  }

  // Album cover hover preview
  const preview = document.createElement('div');
  preview.className = 'music-preview';
  preview.innerHTML = '<img alt=""/><div class="title"></div><div class="desc"></div>';
  try { document.body.appendChild(preview); } catch(_) {}
  let previewReq = 0; // increasing token to avoid race conditions
  function showPreview(track, ev){
    const myToken = ++previewReq;
    const tt = preview.querySelector('.title');
    const dd = preview.querySelector('.desc');
    tt.textContent = track.title || '';
    // Prefer localized short description if available, else build from tags
    try {
      const lang = document.documentElement.getAttribute('lang') || document.documentElement.dataset.lang || 'en';
      let descText = '';
      if (track.desc){
        descText = (typeof track.desc === 'string') ? track.desc : (track.desc[lang] || track.desc['en'] || '');
      }
      if (!descText || descText.length === 0){
        const style = (track.tags||[]).join(', ').replace(/all,?\s*/i,'');
        descText = style ? style : '';
      }
      // Trim to a concise preview length
      if (descText && descText.length > 160){ descText = descText.slice(0, 157) + '…'; }
      dd.textContent = descText || '';
    } catch(_){
      const style = (track.tags||[]).join(', ');
      dd.textContent = style || '';
    }
    // Preload cover image to avoid flashing previous artwork
    const loader = new Image();
    loader.onload = function(){
      if (myToken !== previewReq) return; // a newer hover started
      const img = preview.querySelector('img');
      img.src = loader.src;
      preview.classList.add('visible');
      positionPreview(ev);
    };
    loader.src = track.cover || '';
  }
  function positionPreview(ev){
    if (!preview.classList.contains('visible')) return;
    const pad = 12;
    // Measure actual bubble size for accurate clamping
    const pw = Math.max(1, preview.offsetWidth || 240);
    const ph = Math.max(1, preview.offsetHeight || 220);
    const x = Math.min(window.innerWidth - pw - 4, (ev.clientX || 0) + pad);
    const y = Math.min(window.innerHeight - ph - 4, (ev.clientY || 0) + pad);
    preview.style.left = x + 'px';
    preview.style.top = y + 'px';
  }
  function hidePreview(){ previewReq++; preview.classList.remove('visible'); preview.style.left='-9999px'; preview.style.top='-9999px'; }

  function prefetchDuration(track, index, cardNode){
    try {
      const chosen = chooseSource(track)[0];
      if (!chosen) return;
      // Skip heavy WAV sources to avoid large network usage on page load
      const isWav = (chosen.type && /audio\/wav/i.test(chosen.type)) || /\.(wav)(\?|$)/i.test(String(chosen.url||''));
      if (isWav) return;
      const cacheKey = 'dur:'+chosen.url;
      const cached = localStorage.getItem(cacheKey);
      if (cached){
        const sec = parseInt(cached,10); if (isFinite(sec) && sec>0){ track.length = sec; updateCardDuration(index, cardNode); return; }
      }
      const a = new Audio(); a.preload = 'metadata'; a.src = new URL(chosen.url, location.href).toString();
      a.addEventListener('loadedmetadata', ()=>{
        if (isFinite(a.duration) && a.duration>0){
          track.length = Math.round(a.duration);
          try { localStorage.setItem(cacheKey, String(track.length)); } catch(_){ }
          updateCardDuration(index, cardNode);
        }
      }, { once: true });
      a.load();
    } catch(_){}
  }

  function updateCardDuration(index, cardNode){
    try {
      const node = cardNode || listEl.querySelector(`.music-item[data-index="${index}"]`);
      if (!node) return;
      const t = view[index]; if (!t) return;
      const sub = node.querySelector('.mi-sub');
      if (sub) sub.textContent = `${t.artist} • ${fmtTime(t.length)}`;
    } catch(_){}
  }

  function applyFilters(){
    const q = (searchEl && searchEl.value ? searchEl.value : '').trim().toLowerCase();
    const tag = (typeof activeTag === 'string' && activeTag) ? activeTag : 'all';
    let results = tracks.filter(function(t){
      const okTag = tag==='all' || (Array.isArray(t.tags) && t.tags.includes(tag));
      if (!okTag) return false;
      if (!q) return true;
      return (String(t.title||'')+String(t.artist||'')+(Array.isArray(t.tags)?t.tags.join(' '):'')).toLowerCase().includes(q);
    });
    if (!results || results.length===0) {
      // Hard fallback: always show full list rather than empty
      results = tracks.slice();
    }
    view = results;
    const sortVal = (sortEl && sortEl.value) ? sortEl.value : 'new';
    switch (sortVal){
      case 'az': view.sort((a,b)=> a.title.localeCompare(b.title)); break;
      case 'len': view.sort((a,b)=> (a.length||0)-(b.length||0)); break;
      default: view.sort((a,b)=> new Date(b.date)-new Date(a.date));
    }
    render();
    // Recompute currentIndex from stable id after view changed
    if (currentTrackId){
      const idx = view.findIndex(t=> t && t.id===currentTrackId);
      currentIndex = idx;
    }
    markPlayingCard();
    layoutAlbumWall();
  }

  function loadMeta(i){
    const t = view[i]; if (!t) return;
    pbCover.src = t.cover || '';
    pbTitle.textContent = t.title || 'Untitled';
    pbSub.textContent = t.artist || '';
    playerBar.hidden = false;
    playerBar.classList.add('open');
    document.documentElement.style.setProperty('--player-visible','1');
    // update mini timelines fill/labels
    try {
      document.querySelectorAll('.music-item .mi-mini-timeline .mi-fill').forEach(f=> f.style.width='0%');
      const node = listEl.querySelector(`.music-item[data-index="${i}"] .mi-mini-timeline`);
      if (node){
        const cur = node.querySelector('.mi-cur'); const dur = node.querySelector('.mi-dur');
        if (cur) cur.textContent = '0:00'; if (dur && isFinite(t.length)) dur.textContent = fmtTime(t.length);
      }
    } catch(_){ }
  }

  let fallbackIdx = 0; let fallbackList = [];
  function start(i){
    currentIndex = i;
    const t = view[i]; if (!t) return;
    currentTrackId = t && t.id ? t.id : null;
    try { audio.pause(); } catch(_){}
    // Build fallback list and pick first
    fallbackList = chooseSource(t);
    fallbackIdx = 0;
    const first = fallbackList[0]; if (!first) return;
    audio.src = new URL(first.url, location.href).toString();
    audio.load();
    loadMeta(i);
    const playNow = ()=> audio.play().catch((err)=>{ showPlayerToast('Cannot play audio'); console.error(err); });
    if (audio.readyState >= 2) playNow();
    else {
      const onCanPlay = ()=>{ audio.removeEventListener('canplay', onCanPlay); playNow(); };
      audio.addEventListener('canplay', onCanPlay, { once: true });
    }
    pbPlay.textContent = '⏸';
    // Mark playing item for visual accent
    markPlayingCard();
    // Reset waveform paint
    initWave();
  }

  function markPlayingCard(){
    try {
      Array.from(document.querySelectorAll('.music-item')).forEach(n=> n.classList.remove('playing'));
      if (currentTrackId){
        const node = listEl.querySelector(`.music-item[data-id="${CSS.escape(String(currentTrackId))}"]`);
        if (node){
          node.classList.add('playing');
          try {
            const lang = document.documentElement.getAttribute('lang') || document.documentElement.dataset.lang || 'en';
            const I = (window.I18N_PUBLIC||{});
            const badge = (I.music_now_playing && I.music_now_playing[lang]) || 'Now playing';
            node.setAttribute('data-nowplaying', badge);
          } catch(_){ node.setAttribute('data-nowplaying','Now playing'); }
        }
      } else if (currentIndex>=0){
        const node = listEl.querySelector(`.music-item[data-index="${currentIndex}"]`);
        if (node) node.classList.add('playing');
      }
    } catch(_){ }
  }

  pbPlay.addEventListener('click', ()=>{
    if (audio.paused) { audio.play().catch(()=>{}); pbPlay.textContent='⏸'; markPlayingCard(); }
    else { audio.pause(); pbPlay.textContent='▶'; markPlayingCard(); }
    updateCardPlayButtons();
  });
  pbPrev.addEventListener('click', ()=>{ if (view.length===0) return; const i=(currentIndex-1+view.length)%view.length; start(i); });
  pbNext.addEventListener('click', ()=>{ if (view.length===0) return; const i=(currentIndex+1)%view.length; start(i); });
  pbVol.addEventListener('input', ()=>{ const v=parseFloat(pbVol.value||'0.9'); const clamped=isFinite(v)?Math.min(1,Math.max(0,v)):0.9; audio.volume = clamped; localStorage.setItem('player-volume', String(clamped)); playerBar.style.setProperty('--vol', Math.round(clamped*100)+'%'); });
  pbSeek.addEventListener('input', ()=>{
    if (!isFinite(audio.duration)) return;
    const ratio = parseFloat(pbSeek.value)/parseFloat(pbSeek.max||'1000');
    audio.currentTime = ratio * audio.duration;
  });
  audio.addEventListener('timeupdate', ()=>{
    pbCurrent.textContent = fmtTime(audio.currentTime);
    pbDuration.textContent = isFinite(audio.duration) ? fmtTime(audio.duration) : '0:00';
    if (isFinite(audio.duration) && audio.duration>0) {
      const v = Math.floor((audio.currentTime/audio.duration)*1000);
      pbSeek.value = String(v);
      const perc = Math.round((v/1000)*100);
      playerBar.style.setProperty('--seek', perc+'%');
    }
    drawWaveProgress();
    updateModalTimeline();
    // update mini timeline for currently playing card
    try {
      const node = listEl.querySelector(`.music-item[data-index="${currentIndex}"] .mi-mini-timeline`);
      if (node && isFinite(audio.duration) && audio.duration>0){
        const fill = node.querySelector('.mi-fill'); const cur = node.querySelector('.mi-cur'); const dur = node.querySelector('.mi-dur');
        const ratio = audio.currentTime/audio.duration; const perc = Math.max(0, Math.min(100, Math.round(ratio*100)));
        if (fill) fill.style.width = perc+'%'; if (cur) cur.textContent = fmtTime(audio.currentTime); if (dur) dur.textContent = fmtTime(audio.duration);
      }
    } catch(_){ }
  });
  audio.addEventListener('pause', ()=>{ pbPlay.textContent='▶'; updateCardPlayButtons(); markPlayingCard(); });
  audio.addEventListener('play', ()=>{ pbPlay.textContent='⏸'; updateCardPlayButtons(); markPlayingCard(); });
  audio.addEventListener('loadedmetadata', ()=>{
    // If length is unknown (0), fill it from metadata
    try {
      const cur = view[currentIndex];
      if (cur && (!cur.length || cur.length===0) && isFinite(audio.duration)) cur.length = Math.round(audio.duration);
      // Refresh list item subtitle
      render();
    } catch(_){}
  });
  audio.addEventListener('error', ()=>{
    // Try next fallback source if available
    if (fallbackList && fallbackIdx < fallbackList.length - 1){
      fallbackIdx += 1;
      const s = fallbackList[fallbackIdx];
      try { audio.pause(); } catch(_){}
      audio.src = new URL(s.url, location.href).toString();
      audio.load();
      const playNow = ()=> audio.play().catch(()=>{});
      const onCanPlay = ()=>{ audio.removeEventListener('canplay', onCanPlay); playNow(); };
      audio.addEventListener('canplay', onCanPlay, { once: true });
      showPlayerToast('Trying alternate format…');
      return;
    }
    showPlayerToast('Audio error');
  });

  function initWave(){
    if (!pbWave) return;
    const dpr = window.devicePixelRatio || 1;
    waveWidth = pbWave.clientWidth;
    waveHeight = pbWave.clientHeight;
    pbWave.width = Math.max(1, Math.floor(waveWidth * dpr));
    pbWave.height = Math.max(1, Math.floor(waveHeight * dpr));
    waveCtx = pbWave.getContext('2d');
    waveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Lightweight synthetic waveform (no decoding): use Perlin-like random bars
    const bars = Math.floor(waveWidth / 3);
    waveData = new Array(bars).fill(0).map((_,i)=> 0.35 + 0.65*Math.abs(Math.sin(i*0.37)) * (0.6 + 0.4*Math.sin(i*0.11)));
    drawWaveProgress();
  }

  function updateModalTimeline(){
    try {
      const modal = document.querySelector('.music-modal.open'); if (!modal) return;
      const cur = modal.querySelector('.mm-cur'); const dur = modal.querySelector('.mm-dur'); const seek = modal.querySelector('.mm-seek');
      const isModalTrack = (()=>{
        try { const title = modal.querySelector('.mm-title')?.textContent || ''; const t = view[currentIndex]; return t && t.title===title; } catch(_){ return false; }
      })();
      if (isModalTrack){
        if (cur) cur.textContent = fmtTime(audio.currentTime||0);
        if (dur) dur.textContent = isFinite(audio.duration) ? fmtTime(audio.duration) : '0:00';
        if (seek && isFinite(audio.duration) && audio.duration>0){
          const val = Math.floor((audio.currentTime/audio.duration)*1000);
          seek.value = String(val);
          const perc = Math.round((val/1000)*100);
          modal.querySelector('.mm-timeline .mm-seek').style.setProperty('--mmseek', perc+'%');
        }
      } else {
        // show reset timeline for non-playing track to avoid confusion
        if (cur) cur.textContent = '0:00';
        if (dur) dur.textContent = '0:00';
        if (seek){ seek.value='0'; seek.style.setProperty('--mmseek','0%'); }
      }
    } catch(_){ }
  }

  function drawWaveProgress(){
    if (!waveCtx || !waveData) return;
    const w = waveWidth; const h = waveHeight; if (w<=0 || h<=0) return;
    waveCtx.clearRect(0,0,w,h);
    const filledRatio = (isFinite(audio.duration) && audio.duration>0) ? (audio.currentTime / audio.duration) : 0;
    const bars = waveData.length; const barW = 2; const gap = 1; const totalW = bars*(barW+gap)-gap; const startX = (w-totalW)/2;
    for (let i=0;i<bars;i++){
      const amp = waveData[i];
      const x = startX + i*(barW+gap);
      const y = h*(1-amp);
      const isFilled = (i/bars) <= filledRatio;
      waveCtx.fillStyle = isFilled ? '#18bfef' : 'rgba(255,255,255,0.18)';
      waveCtx.globalAlpha = isFilled ? 0.95 : 0.65;
      waveCtx.fillRect(x, y, barW, h - y);
    }
  }

  window.addEventListener('resize', ()=>{ initWave(); }, { passive: true });
  audio.addEventListener('ended', ()=>{ pbNext.click(); });

  // (removed) global dim overlay control

  // Hook filters
  searchEl.addEventListener('input', applyFilters, { passive: true });
  if (sortEl) sortEl.addEventListener('change', applyFilters);

  // Final safety: ensure view is initialized to all, even if select/search are null
  try { activeTag = TAG_ALL; } catch(_) {}
  try { layoutAlbumWall(); } catch(_){}
    function layoutAlbumWall(){
      const wall = document.querySelector('.album-wall'); if (!wall) return;
      const r1 = wall.querySelector('.album-row.r1 .strip'); const r2 = wall.querySelector('.album-row.r2 .strip');
    // Populate from tracks if available
      try {
        const srcs = Array.from(new Set((window.__tracks__||[]).map(t=> t.cover).filter(Boolean)));
      function fill(strip, start){ if (!strip) return; const tiles=strip.querySelectorAll('.set'); tiles.forEach((setNode,setIdx)=>{ const imgs=setNode.querySelectorAll('img'); imgs.forEach((img,idx)=>{ const s=srcs[(start+setIdx*imgs.length+idx)%srcs.length]; if (s) img.src=s; }); }); }
      if (srcs.length){ fill(r1,0); fill(r2,5); }
      } catch(_){ }
    // JS-driven marquee: translateX resets exactly at half width
    function startMarquee(strip, dir){
        if (!strip) return;
      // duplicate sets already present; assume two .set children side by side
      let x = 0; const speed = dir > 0 ? 0.25 : -0.25; // px per frame approx (60fps)
        function step(){
        x += speed; strip.style.transform = 'translateX(' + x + 'px)';
        const set = strip.querySelector('.set'); if (set){ const setW = set.getBoundingClientRect().width + 40; // gap 40
          if (dir > 0 && x >= 0) x = -setW;
          if (dir < 0 && x <= -setW) x = 0;
          }
          requestAnimationFrame(step);
        }
        step();
      }
    startMarquee(r1, -1); startMarquee(r2, 1);
    }
})();

