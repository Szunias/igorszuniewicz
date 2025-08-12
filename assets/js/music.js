/* Simple, professional tracklist + player */
(function(){
  const isMusic = /\/music\.html(\?|#|$)/.test(location.pathname);
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
  audio.preload = 'auto';
  audio.volume = parseFloat(localStorage.getItem('player-volume') || '0.9');
  pbVol.value = String(audio.volume);
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

  /** Seed demo tracks. Replace with your files in /audio */
  const tracks = [
    // Game/film cues
    { id:'ntd', title:'Not Today, Darling! (Theme)', artist:'Igor Szuniewicz', cover:'images/NotTodayGameLogo.png', url:'audio/ntd-theme.mp3', tags:['game','theme'], length: 122, date:'2024-11-01' },
    { id:'ray', title:'Ray Animation — Credits Theme', artist:'Igor Szuniewicz', cover:'images/project5.png', tags:['film','score'], length: 0, date:'2025-01-10',
      sources:[ { url:'songs/RayCreditsTheme.wav', type:'audio/wav' } ]
    },
    { id:'richter', title:'Richter — Main Theme', artist:'Igor Szuniewicz', cover:'images/richter.png', tags:['film','score'], length: 0, date:'2024-06-01',
      // Drop at least one of these in /songs to enable playback
      sources:[
        { url:'songs/RichterMainTheme.m4a', type:'audio/mp4' },
        { url:'songs/RichterMainTheme.mp3', type:'audio/mpeg' },
        { url:'songs/RichterMainTheme.wav', type:'audio/wav' }
      ]
    },
    // Spotify catalog (provide local copies in /songs for on-site playback)
    { id:'sp_inflow', title:'Inflow', artist:'Igor Szuniewicz', cover:'images/Inflow_track_cover.jpg', tags:['single','electronic'], length: 0, date:'2023-01-01',
      sources:[
        { url:'songs/Inflow.m4a', type:'audio/mp4' },
        { url:'songs/Inflow.mp3', type:'audio/mpeg' },
        { url:'songs/Igor Szuniewicz - Inflow.wav', type:'audio/wav' }
      ]
    },
    { id:'sp_astro', title:'Astrophonic Dance', artist:'Igor Szuniewicz', cover:'images/Astrophonic Dance_track_cover.jpg', tags:['single','electronic'], length: 0, date:'2023-01-01',
      sources:[
        { url:'songs/AstrophonicDance.m4a', type:'audio/mp4' },
        { url:'songs/AstrophonicDance.mp3', type:'audio/mpeg' },
        { url:'songs/Igor Szuniewicz - Astrophonic Dance.wav', type:'audio/wav' }
      ]
    },
    { id:'sp_cathedral', title:'Cathedral Of Time', artist:'Igor Szuniewicz', cover:'images/Cathedral Of Time_track_cover.jpg', tags:['single','electronic'], length: 0, date:'2023-01-01',
      sources:[
        { url:'songs/CathedralOfTime.m4a', type:'audio/mp4' },
        { url:'songs/CathedralOfTime.mp3', type:'audio/mpeg' },
        { url:'songs/Igor Szuniewicz - Cathedral Of Time.wav', type:'audio/wav' }
      ]
    },
    // XianClash entry (film/score)
    { id:'xianclash', title:'Xian Clash — Main Theme', artist:'Igor Szuniewicz', cover:'images/XianClashCover.png', tags:['film','score'], length: 0, date:'2025-02-10',
      sources:[
        { url:'songs/XianClashMainTheme.m4a', type:'audio/mp4' },
        { url:'songs/XianClashMainTheme.mp3', type:'audio/mpeg' },
        { url:'songs/XianClashMainTheme.wav', type:'audio/wav' }
      ]
    },
    // Run (hard rock / metal)
    { id:'run', title:'Run — Main Theme', artist:'Igor Szuniewicz', cover:'images/Run.png', tags:['single','metal'], length: 0, date:'2025-02-11',
      sources:[
        { url:'songs/RunMainTheme.m4a', type:'audio/mp4' },
        { url:'songs/RunMainTheme.mp3', type:'audio/mpeg' },
        { url:'songs/RunMainTheme.wav', type:'audio/wav' }
      ]
    }
  ];

  // View state must be declared before first applyFilters() call
  let view = [...tracks];
  let currentIndex = -1;

  function chooseSource(track){
    const order = track.sources && track.sources.length ? track.sources : (track.url ? [{url:track.url}] : []);
    // Prefer playable types by browser
    const playable = order.filter(s => !s.type || audio.canPlayType(s.type));
    return playable.length ? playable : order;
  }

  // Populate filter chips from tags
  const allTags = Array.from(new Set(tracks.flatMap(t=> t.tags || []))).sort();
  const TAG_ALL = 'all';
  let activeTag = TAG_ALL;
  function renderTagChips(){
    if (!tagsEl) return;
    tagsEl.innerHTML = '';
    const make = (value, label)=>{ const b=document.createElement('button'); b.type='button'; b.className='chip'+(activeTag===value?' active':''); b.dataset.tag=value; b.textContent = label; return b; };
    tagsEl.appendChild(make(TAG_ALL, 'All'));
    allTags.forEach(tag=> { const lbl = tag.charAt(0).toUpperCase()+tag.slice(1); tagsEl.appendChild(make(tag, lbl)); });
  }
  renderTagChips();
  // Ensure default is 'All' and render immediately
  activeTag = TAG_ALL;
  if (tagsEl){ tagsEl.addEventListener('click', (e)=>{ const b=e.target.closest('.chip'); if(!b) return; activeTag=b.dataset.tag||TAG_ALL; renderTagChips(); applyFilters(); }); }
  // Initial render with ALL
  applyFilters();

  function fmtTime(s){ s=Math.max(0,Math.floor(s||0)); const m=Math.floor(s/60); const r=(s%60).toString().padStart(2,'0'); return m+':'+r; }

  

  function render(){
    listEl.innerHTML = '';
    // Group by first tag
    const groups = new Map();
    view.forEach((t)=>{ const key=(t.tags&&t.tags[0])?t.tags[0]:'other'; if(!groups.has(key)) groups.set(key, []); groups.get(key).push(t); });
    let idx = 0;
    groups.forEach((items, group)=>{
      const wrap = document.createElement('div'); wrap.className='music-group';
      const title = document.createElement('div'); title.className='group-title'; title.textContent = group.charAt(0).toUpperCase()+group.slice(1);
      wrap.appendChild(title);
      items.forEach((t)=>{
        const vi = view.indexOf(t);
        const i = idx++;
        const card = document.createElement('div'); card.className='music-item'; card.tabIndex=0; card.dataset.index=String(vi);
        card.innerHTML = `
          <img class="mi-cover" src="${t.cover}" alt="" loading="lazy" decoding="async" />
          <div class="mi-meta">
            <div class="mi-title">${t.title}</div>
            <div class="mi-sub">${t.artist} • ${fmtTime(t.length)}</div>
            <div class="mi-tags">${(t.tags||[]).map(x=>`<span>${x}</span>`).join('')}</div>
          </div>
          <button class="mi-play" aria-label="Play">▶</button>
        `;
        const playBtn = card.querySelector('.mi-play');
        function toggleThis(){ if (currentIndex===vi && !audio.paused){ audio.pause(); pbPlay.textContent='▶'; updateCardPlayButtons(); } else { start(vi); } }
        playBtn.addEventListener('click', toggleThis);
        card.addEventListener('dblclick', toggleThis);
        // Hover preview
        card.addEventListener('mouseenter', (e)=> showPreview(t, e));
        card.addEventListener('mousemove', (e)=> positionPreview(e));
        card.addEventListener('mouseleave', hidePreview);
        wrap.appendChild(card);
        if (!t.length || t.length===0) prefetchDuration(t, vi, card);
      });
      listEl.appendChild(wrap);
    });
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

  // Album cover hover preview
  const preview = document.createElement('div');
  preview.className = 'music-preview';
  preview.innerHTML = '<img alt=""/><div class="title"></div><div class="desc"></div>';
  document.body.appendChild(preview);
  function showPreview(track, ev){
    const img = preview.querySelector('img');
    const tt = preview.querySelector('.title');
    const dd = preview.querySelector('.desc');
    img.src = track.cover || '';
    tt.textContent = track.title || '';
    // Simple generated description by tag
    const style = (track.tags||[]).includes('metal') ? 'Hard rock / metal' : (track.tags||[]).join(', ');
    dd.textContent = `${style} — energetic, punchy and riff‑driven. Ideal for action montages and trailers.`;
    preview.classList.add('visible');
    positionPreview(ev);
  }
  function positionPreview(ev){ if (!preview.classList.contains('visible')) return; const pad=12; const x=Math.min(window.innerWidth-240, ev.clientX+pad); const y=Math.min(window.innerHeight-240, ev.clientY+pad); preview.style.left=x+'px'; preview.style.top=y+'px'; }
  function hidePreview(){ preview.classList.remove('visible'); preview.style.left='-9999px'; preview.style.top='-9999px'; }

  function prefetchDuration(track, index, cardNode){
    try {
      const chosen = chooseSource(track)[0];
      if (!chosen) return;
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
    const q = (searchEl.value||'').trim().toLowerCase();
    const tag = activeTag;
    view = tracks.filter(t => {
      const okTag = tag==='all' || (t.tags||[]).includes(tag);
      if (!okTag) return false;
      if (!q) return true;
      return (t.title+t.artist+(t.tags||[]).join(' ')).toLowerCase().includes(q);
    });
    switch (sortEl.value){
      case 'az': view.sort((a,b)=> a.title.localeCompare(b.title)); break;
      case 'len': view.sort((a,b)=> (a.length||0)-(b.length||0)); break;
      default: view.sort((a,b)=> new Date(b.date)-new Date(a.date));
    }
    render();
  }

  function loadMeta(i){
    const t = view[i]; if (!t) return;
    pbCover.src = t.cover || '';
    pbTitle.textContent = t.title || 'Untitled';
    pbSub.textContent = t.artist || '';
    playerBar.hidden = false;
    playerBar.classList.add('open');
    document.documentElement.style.setProperty('--player-visible','1');
  }

  let fallbackIdx = 0; let fallbackList = [];
  function start(i){
    currentIndex = i;
    const t = view[i]; if (!t) return;
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
    Array.from(document.querySelectorAll('.music-item')).forEach(n=> n.classList.remove('playing'));
    const node = listEl.querySelector(`.music-item[data-index="${i}"]`);
    if (node) node.classList.add('playing');
    // Reset waveform paint
    initWave();
  }

  pbPlay.addEventListener('click', ()=>{
    if (audio.paused) { audio.play().catch(()=>{}); pbPlay.textContent='⏸'; }
    else { audio.pause(); pbPlay.textContent='▶'; }
    updateCardPlayButtons();
  });
  pbPrev.addEventListener('click', ()=>{ if (view.length===0) return; const i=(currentIndex-1+view.length)%view.length; start(i); });
  pbNext.addEventListener('click', ()=>{ if (view.length===0) return; const i=(currentIndex+1)%view.length; start(i); });
  pbVol.addEventListener('input', ()=>{ audio.volume = parseFloat(pbVol.value||'0.9'); localStorage.setItem('player-volume', String(audio.volume)); playerBar.style.setProperty('--vol', Math.round(audio.volume*100)+'%'); });
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
  });
  audio.addEventListener('pause', ()=>{ pbPlay.textContent='▶'; updateCardPlayButtons(); });
  audio.addEventListener('play', ()=>{ pbPlay.textContent='⏸'; updateCardPlayButtons(); });
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

  // Hook filters
  searchEl.addEventListener('input', applyFilters, { passive: true });
  if (sortEl) sortEl.addEventListener('change', applyFilters);

  // Final safety: ensure view is initialized to all
  activeTag = TAG_ALL;
  applyFilters();
})();

