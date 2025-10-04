document.addEventListener('DOMContentLoaded', function() {
  // Guard against stuck transition classes on reload/back-forward (BFCache)
  try {
    document.body.classList.remove('page-exit');
    document.body.classList.remove('page-enter');
    document.body.classList.remove('is-preload');
  } catch(_) {}
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.innerWidth <= 736);
  // Enable reveal only if JS loads
  document.body.classList.add('reveal-enabled');

  // Only add page-enter fade on first visit or navigation from other pages
  // Skip on F5/reload to avoid annoying black screen
  const isReload = performance.navigation && performance.navigation.type === 1;
  const isBackForward = performance.navigation && performance.navigation.type === 2;

  if (!isMobile && !isReload && !isBackForward) {
    document.body.classList.add('page-enter');
    setTimeout(() => document.body.classList.remove('page-enter'), 180);
  }
  // Lightweight pointer-follow background glow
  try {
    window.addEventListener('pointermove', (e)=>{
      document.documentElement.style.setProperty('--mx', (e.clientX||0)+'px');
      document.documentElement.style.setProperty('--my', (e.clientY||0)+'px');
    }, { passive: true });
  } catch(_){ }
  // Ensure template preload overlay goes away even without theme JS
  setTimeout(() => {
    document.body.classList.remove('is-preload');
  }, 100);

  // Connection/motion heuristics for slow networks/devices (with manual override)
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(conn && conn.saveData);
  const slowNet = !!(conn && /(^2g$|^slow-2g$)/i.test(conn.effectiveType || ''));
  const prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Manual override via URL (?perf=high|lite) or localStorage('perf-mode')
  let perfOverride = '';
  try { perfOverride = (new URLSearchParams(location.search).get('perf') || localStorage.getItem('perf-mode') || '').toLowerCase(); } catch(_) {}
  let perfLite = saveData || slowNet || prefersReduced || isMobile;
  if (perfOverride === 'high') perfLite = false;
  if (perfOverride === 'lite' || perfOverride === 'low') perfLite = true;
  // Explicit FX kill switch (?fx=off)
  let fxOff = false; try { fxOff = (new URLSearchParams(location.search).get('fx')||'').toLowerCase()==='off'; } catch(_) {}
  if (fxOff) perfLite = true;
  const shouldRenderHeavy = !perfLite;
  document.body.classList.toggle('perf-lite', perfLite);
  if (fxOff) document.body.classList.add('fx-off');
  // Expose a simple switcher for debugging: setPerfMode('high'|'lite'|'auto')
  try { window.setPerfMode = function(mode){ if (mode==='auto') localStorage.removeItem('perf-mode'); else localStorage.setItem('perf-mode', String(mode)); location.reload(); }; } catch(_){ }

  // Auto-detect low FPS and enable fps-boost (lighter effects)
  (function autoDetectFPS(){
    try {
      let frames = 0; let last = performance.now(); let acc = 0;
      const sampleN = 24;
      const tick = (ts)=>{ acc += (ts - last); last = ts; frames++; if (frames < sampleN) return requestAnimationFrame(tick);
        const avgMs = acc / frames; if (avgMs > 22) { document.body.classList.add('fps-boost'); document.body.classList.add('perf-lite'); }
      };
      requestAnimationFrame(tick);
    } catch(_){ }
  })();

  // Cross-page persistent zoom (Ctrl + / Ctrl - / Ctrl 0, and Ctrl + wheel)
  (function persistentZoom(){
    try {
      const Z_KEY = 'site-zoom-factor';
      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
      const apply = (z) => { try { document.body.style.zoom = String(z); } catch(_) {} };
      let z = parseFloat(localStorage.getItem(Z_KEY) || '1') || 1;
      z = clamp(z, 0.5, 2.0); apply(z);
      function save(zv){ z = clamp(parseFloat(zv)||1, 0.5, 2.0); localStorage.setItem(Z_KEY, String(z)); apply(z); }
      // Keyboard shortcuts
      document.addEventListener('keydown', (e)=>{
        if (!e.ctrlKey) return;
        const k = e.key;
        if (k === '+' || k === '=' || k === 'Add') { e.preventDefault(); save(z + 0.1); }
        else if (k === '-' || k === 'Subtract' || k === '_') { e.preventDefault(); save(z - 0.1); }
        else if (k === '0' || k === ')') { e.preventDefault(); save(1); }
      }, { capture: true });
      // Ctrl + wheel
      document.addEventListener('wheel', (e)=>{
        if (!e.ctrlKey) return; e.preventDefault();
        const delta = e.deltaY || 0;
        save(z + (delta < 0 ? 0.1 : -0.1));
      }, { passive: false, capture: true });
      // If pageshow (bfcache) returns, re-apply
      window.addEventListener('pageshow', ()=> apply(parseFloat(localStorage.getItem(Z_KEY)||'1')||1));
    } catch(_){ /* ignore */ }
  })();

  function markVisibleNow() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.9 && rect.bottom > 0) {
        el.classList.add('in-view');
      }
    });
  }
  markVisibleNow();

  // Kill theme background that may be injected by template (#wrapper > .bg)
  function removeTemplateBackground() {
    document.querySelectorAll('#wrapper > .bg, #wrapper > .bg.fixed').forEach((el) => {
      try { el.remove(); } catch(_) { try { el.style.setProperty('display','none','important'); } catch(_) {} }
    });
    try { document.body.style.background = 'transparent'; } catch(_) {}
  }
  // removed floating hero name (reverted)
  removeTemplateBackground();
  // Observe dynamic insertions from template scripts
  const wrap = document.getElementById('wrapper');
  if (wrap && 'MutationObserver' in window) {
    const mo = new MutationObserver(removeTemplateBackground);
    mo.observe(wrap, { childList: true, subtree: false });
    // safety: run a few times after load
    setTimeout(removeTemplateBackground, 300);
    setTimeout(removeTemplateBackground, 1200);
    setTimeout(removeTemplateBackground, 3000);
  }

  // Smooth page fade transitions (hardened: ensure completion and no stuck state)
  // Intercept internal links and fade out before navigation
  if (!isMobile) {
    const progress = document.createElement('div');
    progress.className = 'page-progress';
    document.body.appendChild(progress);
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      const lower = href.trim().toLowerCase();
      const isHash = lower.startsWith('#');
      const isExternal = lower.startsWith('http') || lower.startsWith('//') || lower.startsWith('mailto:') || lower.startsWith('tel:');
      const isUnsafeScheme = lower.startsWith('javascript:') || lower.startsWith('data:');
      if (!href || isHash || isExternal || isUnsafeScheme) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow new tab etc.
        if (a.target === '_blank') return;
        const h = a.getAttribute('href') || '';
        const l = h.trim().toLowerCase();
        if (!h || l.startsWith('javascript:') || l.startsWith('data:')) return;
        e.preventDefault();
        progress.style.width = '35%';
        document.body.classList.add('page-exit');
        setTimeout(() => { progress.style.width = '70%'; }, 100);
        const nav = () => { try { window.location.href = h; } catch(_) { location.assign(h); } };
        // Force navigation even if previous timers are throttled
        setTimeout(nav, 120);
        setTimeout(nav, 220);
      });
    });
  } else {
    // On mobile, hard-disable template parallax scroll handler to prevent flicker
    try { if (window.jQuery) { jQuery(window).off('scroll._parallax'); } } catch(_) {}
  }
  // Allow external links to open normally (no intercept)
  // Background layers (reuse if present to avoid duplicates)
  const glow = document.querySelector('.bg-glow') || (()=>{ const d=document.createElement('div'); d.className='bg-glow'; return d; })();
  const grad = document.querySelector('.bg-gradient') || (()=>{ const d=document.createElement('div'); d.className='bg-gradient'; return d; })();
  const orbs = document.querySelector('.bg-orbs') || (()=>{ const d=document.createElement('div'); d.className='bg-orbs'; d.innerHTML='<div class="orb blue" style="top:10%;left:8%"></div><div class="orb cyan" style="top:60%;left:75%"></div><div class="orb teal" style="top:75%;left:15%"></div>'; return d; })();
  // SVG waves
  const waves = document.querySelector('svg.bg-waves') || (function(){ const s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('class','bg-waves'); s.setAttribute('viewBox','0 0 1200 600'); s.setAttribute('preserveAspectRatio','none'); return s; })();
  const path1 = waves.querySelector('path:nth-of-type(1)') || document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path1.setAttribute('fill', 'url(#gradWave1)');
  path1.setAttribute('opacity', '0.75');
  const path2 = waves.querySelector('path:nth-of-type(2)') || document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path2.setAttribute('fill', 'url(#gradWave2)');
  path2.setAttribute('opacity', '0.55');
  const path3 = waves.querySelector('path:nth-of-type(3)') || document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path3.setAttribute('fill', 'url(#gradWave3)');
  path3.setAttribute('opacity', '0.40');
  const defs = waves.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const makeGrad = (id, c1, c2) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    g.setAttribute('id', id);
    g.setAttribute('x1', '0%'); g.setAttribute('x2', '100%'); g.setAttribute('y1', '0%'); g.setAttribute('y2', '0%');
    const a = document.createElementNS('http://www.w3.org/2000/svg', 'stop'); a.setAttribute('offset','0%'); a.setAttribute('stop-color', c1); a.setAttribute('stop-opacity','0.9');
    const b = document.createElementNS('http://www.w3.org/2000/svg', 'stop'); b.setAttribute('offset','100%'); b.setAttribute('stop-color', c2); b.setAttribute('stop-opacity','0.4');
    g.appendChild(a); g.appendChild(b); return g;
  };
  if (!waves.querySelector('#gradWave1')) defs.appendChild(makeGrad('gradWave1', '#18bfef', '#58b6ff'));
  if (!waves.querySelector('#gradWave2')) defs.appendChild(makeGrad('gradWave2', '#9a6cff', '#18bfef'));
  if (!waves.querySelector('#gradWave3')) defs.appendChild(makeGrad('gradWave3', '#ff6ea9', '#9a6cff'));
  if (!waves.querySelector('defs')) waves.appendChild(defs);
  if (!path1.parentNode) waves.appendChild(path1);
  if (!path2.parentNode) waves.appendChild(path2);
  if (!path3.parentNode) waves.appendChild(path3);
  if (!grad.parentNode) document.body.appendChild(grad);
  if (shouldRenderHeavy && !fxOff && !orbs.parentNode) document.body.appendChild(orbs);
  if (!fxOff && !waves.parentNode) document.body.appendChild(waves); // keep waves (very light)
  // Initialize wave paths so they are visible even before any pointer movement
  (function initWaves(){
    try {
      const t = performance.now() / 1000;
      const build = (amp, phase, freq) => {
        let d = 'M 0 300 ';
        for (let i=0;i<=1200;i+=20){
          const yy = 300 + Math.sin((i/1200)*Math.PI*freq + t*1.2 + phase)*amp + Math.sin((i/1200)*Math.PI*2 + t*0.4)*6;
          d += `L ${i} ${yy} `;
        }
        d += 'L 1200 600 L 0 600 Z';
        return d;
      };
      const amp1 = 22, amp2 = 30, amp3 = 16;
      path1.setAttribute('d', build(amp1, 0, 4));
      path2.setAttribute('d', build(amp2, Math.PI/2, 5));
      path3.setAttribute('d', build(amp3, Math.PI, 6));
    } catch(_){}
  })();
  // Equalizer bars
  let eq = document.querySelector('canvas.bg-eq'), ctx;
  if (shouldRenderHeavy && !fxOff && !eq) {
    eq = document.createElement('canvas');
    eq.className = 'bg-eq';
    document.body.appendChild(eq);
  }
  document.body.appendChild(glow);

  // On BFCache restore or hard reload, ensure wrapper is visible and transitions are cleared
  window.addEventListener('pageshow', function(ev){
    try {
      document.body.classList.remove('page-exit');
      document.body.classList.remove('page-enter');
      document.body.classList.remove('is-preload');
      var prog = document.querySelector('.page-progress');
      if (prog) prog.style.width = '100%';
      setTimeout(()=>{ if (prog) prog.style.width = '0'; }, 150);
    } catch(_) {}
  });
  window.addEventListener('popstate', function(){
    try {
      document.body.classList.remove('page-exit');
      document.body.classList.remove('page-enter');
      var prog = document.querySelector('.page-progress');
      if (prog) prog.style.width = '0';
    } catch(_) {}
  });
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden){
      try {
        document.body.classList.remove('page-exit');
        var prog = document.querySelector('.page-progress');
        if (prog) prog.style.width = '0';
      } catch(_) {}
    }
  });

  // Lightweight UI sounds (click/hover) – gentle and subtle
  (function(){
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) return;
    let ctx; const getCtx=()=>{ if (!ctx) { try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(_){} } return ctx; };
    function blip(freq, dur=0.08, vol=0.06){
      const c=getCtx(); if(!c) return; const t=c.currentTime; const o=c.createOscillator(); const g=c.createGain();
      o.type='sine'; o.frequency.value=freq; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+0.02);
    }
    const isInMusic = (node)=> !!(node && node.closest && (node.closest('.music-page') || node.closest('#player-bar') || node.closest('#music-list')));
    // Click feedback
    document.addEventListener('click',(e)=>{
      if(!e.target || !e.target.closest) return;
      const el=e.target.closest('a,button,.button,select,[role="button"],.slider-nav'); if(!el) return;
      if (isInMusic(el) || (el.closest && (el.closest('.mi-play') || el.closest('.pb-btn')))) return;
      blip(880,0.07,0.05);
    },{passive:true});
    // Toggle/select change
    document.addEventListener('change',(e)=>{ if(!e.target) return; if (isInMusic(e.target)) return; if(e.target.matches('select')||e.target.matches('input[type="checkbox"],input[type="radio"]')) blip(660,0.06,0.05); },{passive:true});
    // Hover subtle hint
    document.addEventListener('pointerenter',(e)=>{ if(!e.target || !e.target.closest) return; const el=e.target.closest('a.button, .button, .slider-nav'); if(!el) return; if (isInMusic(el)) return; blip(1200,0.04,0.035); },true);
  })();

  // Contact ambient pointer tracking
  (function(){
    const root = document.querySelector('.contact-modern'); if(!root) return;
    function onMove(e){ const x = (e.clientX||0)/window.innerWidth; root.style.setProperty('--mx', (x*100)+'%'); }
    window.addEventListener('pointermove', onMove, { passive:true });
  })();

  // Visual audio-like ripple on clicks
  // Click ripple (forced on all pages, independent of perfLite)
  const clickFx = document.querySelector('.click-fx') || (()=>{ const d=document.createElement('div'); d.className='click-fx'; document.body.appendChild(d); return d; })();
  window.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    // Use viewport coordinates directly so ripples align with the cursor
    const zoom = (function(){
      try { const z = parseFloat(getComputedStyle(document.body).zoom||'1'); return isFinite(z)&&z>0?z:1; } catch(_){ return 1; }
    })();
    const baseX = (e.clientX||0) / zoom;
    const baseY = (e.clientY||0) / zoom;
    for (let i=0;i<3;i++){
      const node = document.createElement('span');
      node.className = 'ripple ' + (i===1?'r2': i===2?'r3':'');
      node.style.left = baseX + 'px';
      node.style.top = baseY + 'px';
      clickFx.appendChild(node);
      setTimeout(() => node.remove(), 900);
    }
  }, { passive: true });

  // Feature flag: disable interactive piano for a more professional look
  const ENABLE_LOGO_PIANO = false;

  // Neo-piano banner was here, but removed as it was disabled by a feature flag.

  // Abstract aurora banner (replacement for piano) — artistic, subtle ribbons
  if (!isMobile && !ENABLE_LOGO_PIANO) (function(){
    try {
      const wrap = document.querySelector('.logo-audio') || (()=>{ const d=document.createElement('div'); d.className='logo-audio'; document.body.appendChild(d); return d; })();
      const cvs=document.createElement('canvas'); wrap.innerHTML=''; wrap.appendChild(cvs);
      const ctx=cvs.getContext('2d');
      function resize(){ cvs.width = Math.min(window.innerWidth*0.96, 1280); cvs.height = 200; }
      resize(); window.addEventListener('resize', resize);
      let t=0; let lastTs = performance.now();
      function ribbon(yBase, amp, hueA, hueB, speed, freq){
        const w=cvs.width; const h=cvs.height;
        const g=ctx.createLinearGradient(0,0,w,0);
        g.addColorStop(0, `hsla(${hueA}, 90%, 60%, .65)`);
        g.addColorStop(1, `hsla(${hueB}, 90%, 65%, .65)`);
        ctx.beginPath();
        for(let x=0;x<=w;x+=4){
          const yy = yBase + Math.sin(x*freq + t*speed)*amp*0.8 + Math.sin(x*freq*0.37 + t*speed*0.6)*amp*0.4;
          if (x===0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle=g; ctx.lineWidth=22; ctx.lineCap='round'; ctx.lineJoin='round';
        ctx.shadowColor='rgba(24,191,239,0.35)'; ctx.shadowBlur=20; ctx.globalCompositeOperation='lighter';
        ctx.stroke(); ctx.globalCompositeOperation='source-over';
      }
      function draw(ts){
        if(!cvs.isConnected) return; ctx.clearRect(0,0,cvs.width,cvs.height);
        // Advance time based on real frame delta so motion feels smooth at any FPS
        if (typeof ts === 'number') {
          const frameEq = Math.min(3, Math.max(0.25, (ts - lastTs) / (1000/60)));
          t += frameEq;
          lastTs = ts;
        } else {
          t += 1;
        }
        const h=cvs.height; // layered ribbons
        ribbon(h*0.55, 28, 195, 265, 0.020, 0.012);
        ribbon(h*0.68, 20, 285, 205, 0.016, 0.015);
        ribbon(h*0.42, 18, 168, 320, 0.014, 0.010);
        requestAnimationFrame(draw);
      }
      requestAnimationFrame(draw);
      function onScroll(){ const y=window.scrollY||document.documentElement.scrollTop; const onHome=!!document.getElementById('projects-showcase'); wrap.classList.toggle('visible', onHome && y<140); }
      onScroll(); window.addEventListener('scroll', onScroll, {passive:true}); window.addEventListener('pageshow', onScroll);
    } catch(_){}
  })();

  // Intro overlay moved to inline script in index.html for instant loading
  if (!perfLite && eq) {
    ctx = eq.getContext('2d');
    function resizeCanvas(){ eq.width = Math.floor(window.innerWidth * 0.6); eq.height = Math.floor(window.innerHeight * 0.5); }
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);
  }

  // Throttled interactive background (waves + glow) for better mobile performance
  let mouseX = 50, mouseY = 50;
  let needsWaveUpdate = false;
  window.addEventListener('pointermove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 100;
    mouseY = (e.clientY / window.innerHeight) * 100;
    needsWaveUpdate = true; // mark dirty; rAF loop will update
  }, { passive: true });

  // The wave animation was moved to CSS for performance.
  // This loop now only updates the follower glow effect.
  function glowLoop() {
    glow.style.setProperty('--mx', mouseX + '%');
    glow.style.setProperty('--my', mouseY + '%');
    requestAnimationFrame(glowLoop);
  }
  requestAnimationFrame(glowLoop);

  // Render equalizer bars - Premium Professional version
  let rafId = null;
  let lastActivity = performance.now();
  ['pointermove','scroll','keydown','click'].forEach(evt=>window.addEventListener(evt,()=>{ lastActivity = performance.now(); },{passive:true}));

  function renderEQ(){
    if (!eq || !ctx) { return; }
    if (document.hidden) { rafId = requestAnimationFrame(renderEQ); return; }
    if (performance.now() - lastActivity > 20000) { // idle > 20s, skip heavy draw
      rafId = requestAnimationFrame(renderEQ); return;
    }
    const t = performance.now() / 1000;
    const w = eq.width, h = eq.height;
    ctx.clearRect(0,0,w,h);

    // More bars, thinner for modern look
    const bars = Math.min(60, Math.floor(w / 20));
    const gap = Math.max(8, w/(bars*8));
    const bw = Math.max(3, (w - (bars-1)*gap) / bars);

    for(let i=0;i<bars;i++){
      const f = i/bars;
      // Smoother, more musical wave pattern
      const wave1 = Math.sin(t*1.2 + f*4.0);
      const wave2 = Math.sin(t*0.8 - f*2.5 + mouseX/50);
      const wave3 = Math.sin(t*1.5 + f*6.0 - mouseY/80);
      const amp = 0.15 + 0.35 * Math.abs(wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2);

      const bh = (h*0.12) + (h*0.35)*amp;
      const x = i*(bw+gap);
      const y = h - bh;

      // Modern gradient with cyan/purple theme
      const grd = ctx.createLinearGradient(x, y, x, y+bh);
      const intensity = amp * 0.6;

      // Cyan to purple gradient based on position
      if (f < 0.33) {
        // Left side - cyan tones
        grd.addColorStop(0, `rgba(24, 191, 239, ${intensity * 0.4})`);
        grd.addColorStop(0.5, `rgba(24, 191, 239, ${intensity * 0.25})`);
        grd.addColorStop(1, `rgba(58, 134, 255, ${intensity * 0.15})`);
      } else if (f < 0.66) {
        // Middle - purple tones
        grd.addColorStop(0, `rgba(154, 108, 255, ${intensity * 0.4})`);
        grd.addColorStop(0.5, `rgba(154, 108, 255, ${intensity * 0.25})`);
        grd.addColorStop(1, `rgba(120, 81, 169, ${intensity * 0.15})`);
      } else {
        // Right side - pink/purple tones
        grd.addColorStop(0, `rgba(255, 110, 169, ${intensity * 0.4})`);
        grd.addColorStop(0.5, `rgba(200, 100, 180, ${intensity * 0.25})`);
        grd.addColorStop(1, `rgba(154, 108, 255, ${intensity * 0.15})`);
      }

      ctx.fillStyle = grd;
      ctx.fillRect(x, y, bw, bh);

      // Subtle glow effect on top of each bar
      if (amp > 0.5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(amp - 0.5) * 0.15})`;
        ctx.fillRect(x, y, bw, 3);
      }

      // Minimalist base indicator
      ctx.fillStyle = 'rgba(24, 191, 239, 0.06)';
      ctx.fillRect(x, h-2, bw, 1);
    }
    rafId = requestAnimationFrame(renderEQ);
  }
  if (!perfLite && !document.body.classList.contains('fx-off')) renderEQ();

  document.addEventListener('visibilitychange', ()=>{
    if (document.hidden && rafId){ cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId && !perfLite) { renderEQ(); }
  });

  // Guard: avoid double init of backgrounds/previews on PJAX-like reloads
  if (window.__ui_initialized__) return; window.__ui_initialized__ = true;

  // Floating popover for CV tooltips (positioned via icon click)
  const enableCvHoverPopovers = false; // hard-disable hover popovers to prevent glitches
  const pop = document.createElement('div'); pop.className='tip-popover';
  const popContent = document.createElement('div'); pop.appendChild(popContent);
  if (enableCvHoverPopovers && window.innerWidth > 980) document.body.appendChild(pop);

  let popPinned = false; let lastPos={x:0,y:0};

  function isSafeHttpUrl(value){
    try {
      const u = new URL(value, location.origin);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch(_){
      return false;
    }
  }
  function showTip(target, x, y){
    const text = target.getAttribute('data-tip');
    const url = target.getAttribute('data-tip-url');
    if (!text){ hideTip(); return; }
    popContent.innerHTML = '';
    const span = document.createElement('div'); span.textContent = text; popContent.appendChild(span);
    if (url && isSafeHttpUrl(url)){ const a = document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener noreferrer'; a.className='tip-action'; a.textContent='Learn more →'; popContent.appendChild(a); }
    const pad = 14; const vw = window.innerWidth; const vh = window.innerHeight;
    let px = x + pad, py = y + pad;
    const bw = pop.offsetWidth || 260; const bh = pop.offsetHeight || 80;
    if (px + bw > vw - 8) px = vw - bw - 8;
    if (py + bh > vh - 8) py = y - bh - pad;
    if (py < 8) py = 8;
    pop.style.left = px + 'px'; pop.style.top = py + 'px';
    pop.classList.add('visible');
    lastPos={x:px,y:py};
  }
  function hideTip(){ if (popPinned) return; pop.classList.remove('visible'); pop.style.left='-9999px'; pop.style.top='-9999px'; }

  // Ensure CV chips exist even before i18n runs, and enable hover tooltips
  function ensureCvChips(){
    document.querySelectorAll('#cv-section .box [data-tip]').forEach((el)=>{
      if (!el.querySelector('.cv-more-chip')){
        const chip = document.createElement('button');
        chip.type='button'; chip.className='cv-more-chip';
        chip.innerHTML = '<span class="label">More</span><span class="chev">▾</span>';
        el.appendChild(chip);
      }
      if (!el.nextElementSibling || !el.nextElementSibling.classList.contains('cv-drawer')){
        const drawer = document.createElement('div');
        drawer.className='cv-drawer';
        const text = el.getAttribute('data-tip') || '';
        const url = el.getAttribute('data-tip-url');
        const inner = document.createElement('div'); inner.className='cv-drawer-inner';
        const textDiv = document.createElement('div'); textDiv.className='cv-drawer-text'; textDiv.textContent = text;
        inner.appendChild(textDiv);
        if (url && isSafeHttpUrl(url)){
          const a = document.createElement('a'); a.className='cv-drawer-link'; a.target='_blank'; a.rel='noopener noreferrer'; a.href = url; a.textContent='Learn more →'; inner.appendChild(a);
        }
        drawer.appendChild(inner);
        el.parentNode.insertBefore(drawer, el.nextSibling);
      }
    });
  }
  ensureCvChips();
  // Hover tooltips for CV items (desktop / non perf-lite)
  if (enableCvHoverPopovers && !document.body.classList.contains('perf-lite')){
    document.addEventListener('pointerenter', (e)=>{
      if(!e.target || !e.target.closest) return;
      const host = e.target.closest('#cv-section .box [data-tip]');
      if (!host) return; const p = e;
      showTip(host, p.clientX||0, p.clientY||0);
    }, true);
    document.addEventListener('pointermove', (e)=>{
      if (!pop.classList.contains('visible')) return;
      if(!e.target || !e.target.closest) return;
      const host = e.target.closest('#cv-section .box [data-tip]');
      if (!host) return; showTip(host, e.clientX||0, e.clientY||0);
    }, true);
    document.addEventListener('pointerleave', (e)=>{
      if(!e.target || !e.target.closest) return;
      if (!e.target.closest('#cv-section .box [data-tip]')) return; hideTip();
    }, true);
  }

  // New concept: remove drawers and interactive handlers in CV section
  document.querySelectorAll('#cv-section .cv-drawer').forEach(d=> d.remove());

  // Interactive education hover pop: show extra details from data-detail
  (function(){
    const list = document.querySelector('#cv-section .cv-timeline');
    if (!list) return;
    const pop = document.createElement('div');
    pop.className = 'cv-pop';
    document.body.appendChild(pop);
    function show(host, x, y){
      const txt = host.getAttribute('data-detail')||'';
      if (!txt) return hide();
      const [a,b] = txt.split('|');
      pop.innerHTML = `<h6>${host.querySelector('.cv-title')?.textContent||''}</h6><ul><li>${a||''}</li>${b?`<li>${b}</li>`:''}</ul>`;
      const pad=12, vw=window.innerWidth, vh=window.innerHeight;
      const bw = pop.offsetWidth||280, bh = pop.offsetHeight||120;
      let px=x+pad, py=y+pad; if (px+bw>vw-8) px=vw-bw-8; if (py+bh>vh-8) py=y-bh-pad; if (py<8) py=8;
      pop.style.left=px+'px'; pop.style.top=py+'px';
      pop.classList.add('visible');
    }
    function hide(){ pop.classList.remove('visible'); pop.style.left='-9999px'; pop.style.top='-9999px'; }
    list.addEventListener('pointerenter', (e)=>{
      if(!e.target || !e.target.closest) return;
      const li=e.target.closest('.cv-timeline li'); if(!li) return; show(li, e.clientX||0, e.clientY||0);
    }, true);
    list.addEventListener('pointermove', (e)=>{
      if(!pop.classList.contains('visible')) return;
      if(!e.target || !e.target.closest) return;
      const li=e.target.closest('.cv-timeline li'); if(!li) return hide();
      show(li, e.clientX||0, e.clientY||0);
    }, true);
    list.addEventListener('pointerleave', (e)=>{ if(!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest('.cv-pop')) hide(); }, true);
  })();

  // Nav previews disabled per request
  const base = location.pathname.includes('/projects/') ? '../' : '';
  // Candidate covers
  const PROJECT_COVERS = [
    `${base}images/maxresdefault.jpg`,
    `${base}images/project4.png`,
    `${base}images/amorak.png`,
    `${base}images/richter.png`,
    `${base}images/plugins.jpg`,
    `${base}images/project5.png`
  ];
  function sampleUnique(arr, n){
    const a = arr.slice();
    for (let i=a.length-1; i>0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a.slice(0, Math.max(0, Math.min(n, a.length)));
  }
  function setPreviewImages(container, urls){ container.innerHTML = urls.map(u=> `<img src="${u}" alt="">`).join(''); }
  const projectsLink = document.querySelector('#nav ul.links a[href*="projects/index.html"]');
  const navEl = document.getElementById('nav');
  let navAbsBottom = 0;
  function computeNavAbsBottom(){
    try {
      const nav = document.getElementById('nav');
      if (!nav) { navAbsBottom = 0; return; }
      const rect = nav.getBoundingClientRect();
      navAbsBottom = Math.round(rect.top + window.scrollY + nav.offsetHeight);
    } catch(_){ navAbsBottom = 0; }
  }
  computeNavAbsBottom();
  window.addEventListener('resize', computeNavAbsBottom, { passive:true });
  const HOVER_DELAY = 220;
  let prevTimer=null; function showNavPrev(){} function hideNavPrev(){}
  if (projectsLink){
    projectsLink.addEventListener('pointerenter', ()=>{});
    projectsLink.addEventListener('pointerleave', ()=>{});
  }
  if (navEl){ navEl.addEventListener('pointerleave', ()=>{}, true); }

  // Nav: small preview for Music link (albums) — subtle grid below nav
  // Fallback static covers; can be replaced by tracks later if available
  const MUSIC_FALLBACK_COVERS = [
    `${base}images/EdgeOfLife.png`,
    `${base}images/Astrophonic Dance_track_cover.jpg`,
    `${base}images/Inflow_track_cover.jpg`,
    `${base}images/Cathedral Of Time_track_cover.jpg`,
    `${base}images/Run.png`,
    `${base}images/richter.png`
  ];
  const musicLink = document.querySelector('#nav ul.links a[href$="music.html"]');
  let musicTimer=null; function showNavPrevMusic(){} function hideNavPrevMusic(){}
  if (musicLink){
    musicLink.addEventListener('pointerenter', ()=>{});
    musicLink.addEventListener('pointerleave', ()=>{});
  }
  // (removed) eager hydration — previews are filled just-in-time on hover with random picks

  // Only enable debug-only DOM changes when explicitly requested
  const DEBUG_MODE = /[?&]debug=1(?:&|$)/.test(location.search) || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (DEBUG_MODE) {
    // Force all elements to be visible immediately (debugging CV images)
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in-view'));
    const cvSection = document.querySelector('#cv-section');
    if (cvSection) {
      cvSection.classList.add('in-view');
    }
  }


  window.addEventListener('scroll', markVisibleNow, { passive: true });

  // Language switcher (PL/NL/EN) + lightweight i18n + toast
  const LANG_KEY='site-lang';
  const toggleBtn = document.getElementById('lang-toggle');
  const menu = document.querySelector('.lang-switch .lang-menu');
  const label = document.getElementById('lang-label');
  // Toast element
  const toast = document.createElement('div');
  toast.className = 'lang-toast';
  document.body.appendChild(toast);
  // The "Click to switch language" hint was removed as it was redundant.
  // Language badge creation removed - but keep existing #lang-fixed functionality
  const badgeWrap = document.querySelector('.lang-badge-wrap') || (()=>{ const w=document.createElement('div'); w.className='lang-badge-wrap'; document.body.appendChild(w); return w; })();
  const langBadge = document.querySelector('.lang-badge') || (()=>{ const b=document.createElement('div'); b.className='lang-badge'; badgeWrap.appendChild(b); return b; })();
  const badgeMenu = document.querySelector('.lang-badge-menu') || (()=>{ const m=document.createElement('div'); m.className='lang-badge-menu'; badgeWrap.appendChild(m); return m; })();
  const fixedLang = document.getElementById('lang-fixed');

  function flagSvg(lang){
    // Use width/height 100% so parent spans can size the flag
    if (lang==='pl') return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 3 2"><rect width="3" height="1" fill="#fff"/><rect y="1" width="3" height="1" fill="#dc143c"/></svg>';
    if (lang==='nl') return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 3 2"><rect width="3" height="2" fill="#21468B"/><rect width="3" height="1.333" fill="#fff"/><rect width="3" height="0.666" fill="#AE1C28"/></svg>';
    // UK flag (Union Jack) simplified with diagonals
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 12">\
      <rect width="18" height="12" fill="#012169"/>\
      <path d="M0,0 L18,12 M18,0 L0,12" stroke="#fff" stroke-width="3"/>\
      <path d="M0,0 L18,12 M18,0 L0,12" stroke="#C8102E" stroke-width="1.2"/>\
      <rect x="0" y="5" width="18" height="2" fill="#fff"/>\
      <rect x="8" y="0" width="2" height="12" fill="#fff"/>\
      <rect x="0" y="5.5" width="18" height="1" fill="#C8102E"/>\
      <rect x="8.5" y="0" width="1" height="12" fill="#C8102E"/>\
    </svg>';
  }

  // Minimal i18n map for common UI strings (extend as needed)
  const I18N = {
    nav_home: { pl: 'Główna', nl: 'Home', en: 'Home' },
    nav_about: { pl: 'O mnie', nl: 'Over mij', en: 'About' },
    nav_projects: { pl: 'Projekty', nl: 'Projecten', en: 'Projects' },
    nav_all: { pl: 'Wszystkie', nl: 'Alle', en: 'All' },
    nav_all_projects: { pl: 'Wszystkie projekty', nl: 'Alle projecten', en: 'All Projects' },
    nav_scholarly: { pl: 'Naukowe', nl: 'Wetenschappelijk', en: 'Scholarly' },
    nav_extra: { pl: 'Dodatkowe', nl: 'Extra', en: 'Extra' },
    nav_contact: { pl: 'Kontakt', nl: 'Contact', en: 'Contact' },
    nav_music: { pl: 'Muzyka', nl: 'Muziek', en: 'Music' },
    intro_title: { pl: 'Wprowadzenie', nl: 'Introductie', en: 'Introduction' },
    intro_lead: {
      pl: 'Krótki wgląd w to, kim jestem i moja pasja do dźwięku oraz technologii.',
      nl: 'Een korte blik op wie ik ben en mijn passie voor audio en technologie.',
      en: 'A brief insight into who I am and my passion for audio and technology.'
    },
    cv_title: { pl: 'O mnie / CV', nl: 'Over mij / CV', en: 'About Me / Curriculum Vitae' },
    cv_lead: {
      pl: 'Pół-chronologiczny przegląd mojego życia, edukacji i pracy zawodowej.',
      nl: 'Een quasi-chronologisch overzicht van mijn leven, opleiding en werk.',
      en: 'A quasi-chronological overview of my life, education, and professional work.'
    },
    intro_paragraph: {
      pl: 'Cześć! Nazywam się Igor Szuniewicz. Jestem kompozytorem, inżynierem dźwięku i programistą, skoncentrowanym na tworzeniu immersyjnych doświadczeń audio. Moja praca obejmuje techniczny sound design, rozwój interaktywnych systemów muzycznych oraz kompleksowe rozwiązania audio do gier. Łączę twórczą wrażliwość z precyzją techniczną, aby projekty ożywały. To portfolio prezentuje moją drogę, umiejętności i projekty, z których jestem najbardziej dumny.',
      nl: 'Hallo! Ik ben Igor Szuniewicz. Ik ben componist, audio-engineer en softwareontwikkelaar met focus op meeslepende audio-ervaringen. Mijn werk omvat technisch sounddesign, de ontwikkeling van interactieve muzieksystemen en complete game-audio oplossingen. Ik combineer creativiteit met technische precisie om projecten tot leven te brengen. Dit portfolio toont mijn traject, vaardigheden en projecten waar ik het meest trots op ben.',
      en: 'Hello! I am Igor Szuniewicz, a dedicated Composer, Audio Engineer, and Software Developer with a strong focus on creating immersive auditory experiences. My work spans technical sound design, the development of interactive music systems, and comprehensive game audio solutions. I thrive on blending creative artistry with technical precision to bring projects to life. This portfolio showcases my journey, skills, and the projects I am most proud of.'
    },
    showcase_title: { pl: 'Przegląd projektów', nl: 'Projectoverzicht', en: 'Projects Showcase' },
    showcase_lead: { pl: 'Wybrane najważniejsze projekty i mój wkład.', nl: 'Een selectie van mijn belangrijkste projecten met mijn rol.', en: 'A selection of my most important projects, highlighting my involvement and key contributions.' },
    explore_lead: { pl: 'Przeglądaj pełne portfolio lub dowiedz się więcej o mnie.', nl: 'Bekijk het volledige portfolio of lees meer over mijn achtergrond.', en: 'Browse the full portfolio or learn more about my background.' },
    // Metrics section (homepage)
    metrics_title: { pl: 'W liczbach', nl: 'In cijfers', en: 'By the Numbers' },
    metrics_lead: { pl: 'Wymierne doświadczenie w produkcji audio i systemach interaktywnych.', nl: 'Kwantificeerbare ervaring in audioproductie en interactieve systemen.', en: 'Quantifiable experience across audio production and interactive systems.' },
    metrics_projects_label: { pl: 'Ukończone projekty', nl: 'Voltooide projecten', en: 'Completed Projects' },
    metrics_projects_desc: { pl: 'Gry, animacje, media interaktywne', nl: 'Games, animaties, interactieve media', en: 'Games, animations, interactive media' },
    metrics_tracks_label: { pl: 'Oryginalne kompozycje', nl: 'Originele composities', en: 'Original Compositions' },
    metrics_tracks_desc: { pl: 'Stworzone utwory muzyczne i ścieżki', nl: 'Muziek tracks en scores gemaakt', en: 'Music tracks and scores created' },
    metrics_tools_label: { pl: 'Zbudowane narzędzia audio', nl: 'Gebouwde audio-tools', en: 'Audio Tools Built' },
    metrics_tools_desc: { pl: 'Wtyczki VST i narzędzia pipeline', nl: 'VST-plug-ins en pipeline-tools', en: 'VST plugins and pipeline utilities' },
    metrics_hours_label: { pl: 'Godzin w produkcji', nl: 'Uur in productie', en: 'Hours in Production' },
    metrics_hours_desc: { pl: 'Sound design, miksowanie, implementacja', nl: 'Sounddesign, mixen, implementatie', en: 'Sound design, mixing, implementation' },
    // Unified CTA section (homepage)
    cta_contact_title: { pl: 'Współpracujmy razem', nl: 'Laten we samenwerken', en: 'Let\'s Work Together' },
    cta_contact_desc: { pl: 'Zainteresowany współpracą lub masz pytania? Skontaktuj się, aby omówić swój projekt.', nl: 'Geïnteresseerd in samenwerking of vragen over mijn werk? Neem contact op om je project te bespreken.', en: 'Interested in collaboration or have questions about my work? Get in touch to discuss your project.' },
    cta_explore_title: { pl: 'Odkryj więcej', nl: 'Ontdek meer', en: 'Explore More' },
    cta_projects: { pl: 'Wszystkie projekty', nl: 'Alle projecten', en: 'All Projects' },
    cta_about: { pl: 'O mnie', nl: 'Over mij', en: 'About Me' },
    cta_music: { pl: 'Muzyka', nl: 'Muziek', en: 'Music' },
    cta_scholarly: { pl: 'Naukowe', nl: 'Academisch', en: 'Scholarly' },
    footer_location: { pl: 'Lokalizacja', nl: 'Locatie', en: 'Location' },
    footer_email: { pl: 'Email', nl: 'E-mail', en: 'Email' },
    footer_social: { pl: 'Linki społecznościowe i zawodowe', nl: 'Sociale & professionele links', en: 'Social & Professional Links' },
    footer_qr_title: { pl: 'Szybki dostęp (QR kod)', nl: 'Snelle toegang (QR-code)', en: 'Quick Access (QR Code)' },
    footer_qr_hint: { pl: 'Zeskanuj, aby szybko otworzyć to portfolio.', nl: 'Scan voor snelle toegang tot dit portfolio.', en: 'Scan for quick access to this portfolio.' },
    // Music page
    music_title: { en: 'Music Listening Room', pl: 'Pokój odsłuchowy — Muzyka', nl: 'Luisterkamer — Muziek' },
    music_lead: { en: 'Listen to curated tracks and explore the catalog.', pl: 'Słuchaj wybranych utworów i eksploruj katalog.', nl: 'Luister naar geselecteerde tracks en verken de catalogus.' },
    music_quality_info: { en: 'Use the <strong>STREAM</strong> button next to each track to switch between fast-loading compressed audio and high-quality original files.', pl: 'Użyj przycisku <strong>STREAM</strong> obok każdego utworu, aby przełączać między szybko ładującym się skompresowanym dźwiękiem a wysokiej jakości oryginalnymi plikami.', nl: 'Gebruik de <strong>STREAM</strong> knop naast elke track om te schakelen tussen snel ladende gecomprimeerde audio en hoogwaardige originele bestanden.' },
    music_sort: { en: 'Sort', pl: 'Sortuj', nl: 'Sorteren' },
    music_hint_click: { en: 'Click for details', pl: 'Kliknij, aby zobaczyć szczegóły', nl: 'Klik voor details' },
    music_now_playing: { en:'Now playing', pl:'Teraz odtwarzane', nl:'Nu speelt' },
    music_vol_label: { en:'Volume', pl:'Głośność', nl:'Volume' },
    music_search: { en:'Search…', pl:'Szukaj…', nl:'Zoeken…' },
    music_finder: { en:'Browse by style', pl:'Przeglądaj wg stylu', nl:'Bladeren op stijl' },
    music_gw_toggle: { en:'Browse by tag', pl:'Przeglądaj wg tagu', nl:'Bladeren op tag' },
    music_sort_new: { en:'Newest', pl:'Najnowsze', nl:'Nieuwste' },
    music_sort_az: { en:'A → Z', pl:'A → Z', nl:'A → Z' },
    music_sort_len: { en:'Length', pl:'Długość', nl:'Lengte' },
    tag_all: { en:'All', pl:'Wszystkie', nl:'Alle' },
    tag_electronic: { en:'Electronic', pl:'Electronic', nl:'Electronic' },
    tag_film: { en:'Film', pl:'Film', nl:'Film' },
    tag_metal: { en:'Metal', pl:'Metal', nl:'Metal' },
    tag_playful: { en:'Playful', pl:'Playful', nl:'Speels' },
    tag_score: { en:'Score', pl:'Score', nl:'Score' },
    tag_single: { en:'Single', pl:'Singiel', nl:'Single' },
    toast_switched: { pl: 'Przełączono na polski', nl: 'Gewisseld naar Nederlands', en: 'Switched to English' },
    all_projects_title: { pl: 'Wszystkie projekty', nl: 'Alle projecten', en: 'All Projects' },
    all_projects_lead: { pl: 'Filtruj i sortuj, aby przeglądać prace.', nl: 'Filter en sorteer om werk te verkennen.', en: 'Filter and sort to explore selected works.' },
    label_filter: { pl: 'Filtr:', nl: 'Filter:', en: 'Filter:' },
    label_sort: { pl: 'Sortuj:', nl: 'Sorteer:', en: 'Sort:' },
    opt_newest: { pl: 'Najnowsze', nl: 'Nieuwste', en: 'Newest' },
    opt_oldest: { pl: 'Najstarsze', nl: 'Oudste', en: 'Oldest' },
    opt_title_az: { pl: 'Tytuł A–Z', nl: 'Titel A–Z', en: 'Title A–Z' },
    opt_title_za: { pl: 'Tytuł Z–A', nl: 'Titel Z–A', en: 'Title Z–A' },
    filter_all: { pl: 'Wszystkie', nl: 'Alle', en: 'All' },
    filter_music: { pl: 'Muzyka', nl: 'Muziek', en: 'Music' },
    filter_sound: { pl: 'Sound Design', nl: 'Sounddesign', en: 'Sound Design' },
    filter_gameaudio: { pl: 'Audio w grach', nl: 'Game-audio', en: 'Game Audio' },
    filter_3d: { pl: '3D Design', nl: '3D Design', en: '3D Design' },
    label_view: { pl: 'Widok:', nl: 'Weergave:', en: 'View:' },
    view_grid: { pl: 'Siatka', nl: 'Raster', en: 'Grid' },
    view_list: { pl: 'Lista', nl: 'Lijst', en: 'List' },
    search_projects: { pl: 'Szukaj projektów…', nl: 'Zoek projecten…', en: 'Search projects…' },
    projects_shown: { pl: 'pokazane', nl: 'getoond', en: 'shown' },
    projects_no_match: { pl: 'Brak projektów spełniających kryteria', nl: 'Geen projecten voldoen aan criteria', en: 'No projects match your criteria' },
    learn_more: { pl: 'Więcej →', nl: 'Meer →', en: 'Learn more →' },
    more_label: { pl: 'Więcej', nl: 'Meer', en: 'More' },
    // Extras page
    extras_title: { pl: 'Dodatkowe aktywności i muzyka', nl: 'Extra-curriculaire & Muziek', en: 'Extra-Curricular & Music' },
    extras_lead: { pl: 'Projekty pasji, wydania muzyczne i współprace.', nl: 'Passieprojecten, muziekuitgaven en samenwerkingen.', en: 'Passion projects, music releases, and collaborations.' },
    extras_spotify_title: { pl: 'Moja muzyka na Spotify', nl: 'Mijn muziek op Spotify', en: 'My Music on Spotify' },
    extras_spotify_lead: { pl: 'Wybrane utwory i wydania odzwierciedlające mój styl i kierunek brzmieniowy.', nl: 'Geselecteerde tracks en releases die mijn esthetiek en soundrichting weerspiegelen.', en: 'Selected tracks and releases reflecting my aesthetic and sound direction.' },
    // Contact page
    contact_title: { pl: 'Kontakt', nl: 'Contact', en: 'Contact' },
    contact_lead: { pl: 'Współpracujmy. Jestem otwarty na projekty i staże.', nl: 'Laten we samenwerken. Ik sta open voor projecten en stages.', en: 'Let's collaborate. I'm open to project opportunities and internships.' },
    contact_email_label: { pl: 'Email:', nl: 'E‑mail:', en: 'Email:' },
    contact_location_label: { pl: 'Lokalizacja:', nl: 'Locatie:', en: 'Location:' },
    contact_reachout: { pl: 'Śmiało napisz z krótkim opisem. Lubię projekty łączące kreatywną wizję z rozwiązywaniem problemów technicznych.', nl: 'Stuur gerust een korte briefing. Ik werk graag aan projecten die creative intentie combineren met technische probleemoplossing.', en: 'Feel free to reach out with a short brief. I enjoy projects that combine creative intent with technical problem‑solving.' },
    // New Contact Page Professional
    contact_badge_available: { pl: 'Dostępny do projektów', nl: 'Beschikbaar voor projecten', en: 'Available for Projects' },
    contact_hero_title: { pl: 'Twórzmy razem', nl: 'Laten we samen creëren', en: 'Let\'s Create Together' },
    contact_hero_subtitle: { pl: 'Zazwyczaj odpowiadam w ciągu 24–48 godzin. Porozmawiajmy o Twoim projekcie.', nl: 'Ik reageer meestal binnen 24-48 uur. Laten we je project bespreken.', en: 'I typically respond within 24–48 hours. Let\'s discuss your project.' },
    contact_section_message: { pl: 'Wyślij wiadomość', nl: 'Stuur een bericht', en: 'Send a Message' },
    contact_section_direct: { pl: 'Bezpośredni kontakt', nl: 'Direct contact', en: 'Direct Contact' },
    contact_section_social: { pl: 'Połącz się online', nl: 'Verbind online', en: 'Connect Online' },
    contact_form_name_label: { pl: 'Twoje imię', nl: 'Je naam', en: 'Your Name' },
    contact_form_name_placeholder: { pl: 'Jan Kowalski', nl: 'Jan Janssen', en: 'John Doe' },
    contact_form_email_label: { pl: 'Adres email', nl: 'E-mailadres', en: 'Email Address' },
    contact_form_email_placeholder: { pl: 'jan@przyklad.pl', nl: 'jan@voorbeeld.nl', en: 'john@example.com' },
    contact_form_subject_label: { pl: 'Temat', nl: 'Onderwerp', en: 'Subject' },
    contact_form_subject_placeholder: { pl: 'Zapytanie o projekt', nl: 'Projectaanvraag', en: 'Project Inquiry' },
    contact_form_message_label: { pl: 'Twoja wiadomość', nl: 'Je bericht', en: 'Your Message' },
    contact_form_message_placeholder: { pl: 'Opowiedz mi o swoim projekcie...', nl: 'Vertel me over je project...', en: 'Tell me about your project...' },
    contact_form_submit: { pl: 'Wyślij wiadomość', nl: 'Verzend bericht', en: 'Send Message' },
    contact_info_email: { pl: 'Email', nl: 'E-mail', en: 'Email' },
    contact_info_location: { pl: 'Lokalizacja', nl: 'Locatie', en: 'Location' },
    contact_info_location_value: { pl: 'Belgia, Zachodnia Flandria', nl: 'België, West-Vlaanderen', en: 'Belgium, West Flanders' },
    contact_info_response: { pl: 'Czas odpowiedzi', nl: 'Reactietijd', en: 'Response Time' },
    contact_info_response_value: { pl: '24–48 godzin', nl: '24-48 uur', en: '24–48 hours' },
    contact_social_github: { pl: 'GitHub', nl: 'GitHub', en: 'GitHub' },
    contact_social_github_handle: { pl: '@Szunias', nl: '@Szunias', en: '@Szunias' },
    contact_social_linkedin: { pl: 'LinkedIn', nl: 'LinkedIn', en: 'LinkedIn' },
    contact_social_linkedin_handle: { pl: 'Igor Szuniewicz', nl: 'Igor Szuniewicz', en: 'Igor Szuniewicz' },
    contact_social_spotify: { pl: 'Spotify', nl: 'Spotify', en: 'Spotify' },
    contact_social_spotify_handle: { pl: 'Portfolio muzyczne', nl: 'Muziekportfolio', en: 'Music Portfolio' },
    contact_social_itch: { pl: 'Itch.io', nl: 'Itch.io', en: 'Itch.io' },
    contact_social_itch_handle: { pl: 'Projekty gier', nl: 'Gameprojecten', en: 'Game Projects' },
    // Contact form validation messages
    contact_validation_required: { pl: 'Proszę wypełnić wszystkie wymagane pola.', nl: 'Vul alle verplichte velden in.', en: 'Please fill in all required fields.' },
    contact_validation_email: { pl: 'Proszę podać prawidłowy adres email.', nl: 'Voer een geldig e-mailadres in.', en: 'Please enter a valid email address.' },
    contact_validation_name: { pl: 'Imię musi mieć co najmniej 2 znaki', nl: 'Naam moet minimaal 2 tekens bevatten', en: 'Name must be at least 2 characters' },
    contact_validation_message: { pl: 'Wiadomość musi mieć co najmniej 10 znaków', nl: 'Bericht moet minimaal 10 tekens bevatten', en: 'Message must be at least 10 characters' },
    contact_status_sending: { pl: 'Wysyłanie wiadomości...', nl: 'Bericht verzenden...', en: 'Sending your message...' },
    contact_status_success: { pl: 'Wiadomość wysłana pomyślnie! Odpowiem wkrótce.', nl: 'Bericht succesvol verzonden! Ik reageer binnenkort.', en: 'Message sent successfully! I\'ll respond soon.' },
    contact_status_error: { pl: 'Wystąpił błąd podczas wysyłania. Spróbuj ponownie później.', nl: 'Er is een fout opgetreden. Probeer het later opnieuw.', en: 'An error occurred while sending. Please try again later.' },
    contact_btn_sending: { pl: 'Wysyłanie...', nl: 'Verzenden...', en: 'Sending...' },
    // Not Today Darling page translations
    ntd_trailer_title: { pl: 'Trailer', nl: 'Trailer', en: 'Trailer' },
    ntd_trailer_hint: { pl: '🎬 Obejrzyj trailer', nl: '🎬 Bekijk de trailer', en: '🎬 Watch the trailer' },
    ntd_role_title: { pl: 'Rola — Audio', nl: 'Rol — Audio', en: 'Role — Audio' },
    ntd_role_desc: { pl: 'Odpowiadałem za sound effects, implementację i miks: paleta SFX gameplayu, UI, warstwy crowd/ambience oraz integrację i miks w silniku dla czytelności przy szybkiej akcji. System reaguje na stany wyścigu i zdarzenia gracza.', nl: 'SFX‑ontwerp, implementatie en mix: gameplaypalet, UI, crowd/ambience, met engine‑integratie en mix voor leesbaarheid bij hoge snelheid. Systeem reageert op racestaten en events.', en: 'Handled SFX design, implementation and mixing: gameplay palette, UI, crowd/ambience, plus in‑engine integration and mix for clarity at speed. System reacts to race states and player events.' },
    ntd_hi_title: { pl: 'Gameplay Highlights', nl: 'Gameplay Highlights', en: 'Gameplay Highlights' },
    ntd_hi_1: { pl: 'Responsywne SFX powiązane z akcjami gracza i przeszkodami', nl: 'Responsieve SFX gekoppeld aan acties en hazards', en: 'Responsive SFX tied to actions and hazards' },
    ntd_hi_2: { pl: 'Hierarchia miksu zoptymalizowana pod czytelność (1–4 graczy)', nl: 'Mixhiërarchie geoptimaliseerd (1–4 spelers)', en: 'Mix hierarchy optimized for readability (1–4 players)' },
    ntd_hi_3: { pl: 'Niewchodzące w drogę warstwy dynamiczne przy intensywnych momentach', nl: 'Niet‑opdringerige dynamische lagen bij intense momenten', en: 'Non‑intrusive dynamic layers for intense moments' },
    ntd_impl_title: { pl: 'Implementacja', nl: 'Implementatie', en: 'Implementation' },
    ntd_impl_1: { pl: 'Parametry/stany dla cooldownów i burstów', nl: 'Parameters/states voor cooldowns en bursts', en: 'Parameters/states for cooldowns and bursts' },
    ntd_impl_2: { pl: 'Oszczędna organizacja assetów, spójne poziomy głośności', nl: 'Geheugenvriendelijke assets, consistente loudnessdoelen', en: 'Memory‑friendly assets, consistent loudness targets' },
    ntd_impl_3: { pl: 'Szybkie iteracje z zespołem gameplay', nl: 'Snelle iteraties met gameplayteam', en: 'Fast iteration loops with gameplay team' },
    ntd_team_title: { pl: 'Zespół', nl: 'Team', en: 'Team' },
    ntd_gallery_title: { pl: 'Galeria', nl: 'Galerij', en: 'Gallery' },
    ntd_download_title: { pl: 'Pobierz', nl: 'Downloaden', en: 'Download' },
    ntd_download_desc: { pl: 'Pobierz grę na itch.io:', nl: 'Download de game op itch.io:', en: 'Get the game on itch.io:' },
    ntd_sample_title: { pl: 'Próbka Audio', nl: 'Audio Sample', en: 'Audio Sample' },
    ntd_sample_note: { pl: 'Jeden przykład dźwięku z gry. Użyj odtwarzacza poniżej.', nl: 'Eén in‑game voorbeeld. Gebruik de speler hieronder.', en: 'Single in‑game example. Use the player below.' },
    ntd_weeks_title: { pl: 'Postępy Audio — Tygodnie', nl: 'Audio‑voortgang — Wekelijks', en: 'Audio Progress — Weekly' },
    ntd_tagline: { pl: 'Szybki, lokalny wyścig side‑scrolling. Chaos i frajda.', nl: 'Snelle lokale side‑scroll race. Chaotisch en leuk.', en: 'Fast local side‑scrolling race. Chaotic and fun.' },
    ntd_meta_school: { pl: 'Digital Arts and Entertainment', nl: 'Digital Arts and Entertainment', en: 'Digital Arts and Entertainment' },
    ntd_meta_released: { pl: 'Wydano: 25 maja 2025', nl: 'Uitgebracht: 25 mei 2025', en: 'Released: May 25, 2025' },
    ntd_meta_platforms: { pl: 'Platformy: Windows, Linux', nl: 'Platforms: Windows, Linux', en: 'Platforms: Windows, Linux' },
    ntd_meta_engine: { pl: 'Silnik: Unreal Engine', nl: 'Engine: Unreal Engine', en: 'Engine: Unreal Engine' },
    ntd_meta_modes: { pl: 'Tryby: Multiplayer lokalny (1–4)', nl: 'Modi: Lokale multiplayer (1–4)', en: 'Modes: Local multiplayer (1–4)' },
    ntd_download_sizes: { pl: 'Build Windows (1.0 GB), build Linux (967 MB)', nl: 'Windows build (1.0 GB), Linux build (967 MB)', en: 'Windows build (1.0 GB), Linux build (967 MB)' },
    ntd_all_projects: { pl: 'Wszystkie Projekty', nl: 'Alle Projecten', en: 'All Projects' },
    // Weekly progress translations
    ntd_week02_title: { pl: 'Tydzień 02 — Prototypowanie & Research', nl: 'Week 02 — Prototyping & Onderzoek', en: 'Week 02 — Prototyping & Research' },
    ntd_week02_desc: { pl: 'Badanie stylu dźwiękowego i referencji, plan SFX/UI, testy pipeline\'u.', nl: 'Onderzoek naar audiostijl en referenties, SFX/UI‑planning, pipeline‑testen.', en: 'Researching audio style and references, SFX/UI planning, pipeline testing.' },
    ntd_week03_title: { pl: 'Tydzień 03 — Start prototypu', nl: 'Week 03 — Start van prototype', en: 'Week 03 — Start of prototype' },
    ntd_week03_desc: { pl: 'Dokumentacja systemu audio, backlog SFX, założenia miksu i czytelności.', nl: 'Audiosysteem documentatie, SFX‑backlog, mix‑ en duidelijkheidsveronderstellingen.', en: 'Audio system documentation, SFX backlog, mix and clarity assumptions.' },
    ntd_week04_title: { pl: 'Tydzień 04 — Łączenie elementów', nl: 'Week 04 — Samenkomen', en: 'Week 04 — Coming together' },
    ntd_week04_desc: { pl: 'Mapowanie zdarzeń do RTPC/states, eksperymenty z warstwami tła.', nl: 'Events mappen naar RTPC/states, experimenten met achtergrondlagen.', en: 'Mapping events to RTPC/states, experiments with background layers.' },
    ntd_week05_title: { pl: 'Tydzień 05 — Shaping Up Our Vision', nl: 'Week 05 — Onze Visie Vormgeven', en: 'Week 05 — Shaping Up Our Vision' },
    ntd_week05_desc: { pl: 'Projekt miksu pod wyścig 1–4 graczy, selektywna głośność i priorytety.', nl: 'Mix‑ontwerp voor 1–4 speler racing, selectief volume en prioriteiten.', en: 'Mix design for 1–4 player racing, selective volume and priorities.' },
    ntd_week06_title: { pl: 'Tydzień 06 — 3, 2, 1, START!', nl: 'Week 06 — 3, 2, 1, START!', en: 'Week 06 — 3, 2, 1, START!' },
    ntd_week06_desc: { pl: 'Implementacja podstawowych zdarzeń SFX, sygnałów start/meta, UI.', nl: 'Implementatie van basis SFX‑events, start/meta‑signalen, UI.', en: 'Implementation of basic SFX events, start/meta signals, UI.' },
    ntd_week07_title: { pl: 'Tydzień 07 — Pit stop finished', nl: 'Week 07 — Pitstop voltooid', en: 'Week 07 — Pit stop finished' },
    ntd_week07_desc: { pl: 'Optymalizacja pamięci SFX, porządki w bankach, ujednolicenie namingów.', nl: 'SFX‑geheugenoptimalisatie, bank‑opruiming, naamgevingsstandardisatie.', en: 'SFX memory optimization, bank cleanup, naming standardization.' },
    ntd_week08_title: { pl: 'Tydzień 08 — These grannies are bussin', nl: 'Week 08 — Deze oma\'s zijn bussin', en: 'Week 08 — These grannies are bussin' },
    ntd_week08_desc: { pl: 'Warstwy crowd/ambience, krótkie loopy tła, kontrola transjentów.', nl: 'Crowd/ambience‑lagen, korte achtergrondloops, transiëntcontrole.', en: 'Crowd/ambience layers, short background loops, transient control.' },
    ntd_week09_title: { pl: 'Tydzień 09 — Lights, FX, Action!', nl: 'Week 09 — Lights, FX, Action!', en: 'Week 09 — Lights, FX, Action!' },
    ntd_week09_desc: { pl: 'Soundy kolizji/hazardów, dopasowanie do FX/światła, czytelność.', nl: 'Botsing/gevaargeluiden, aanpassing aan FX/verlichting, duidelijkheid.', en: 'Collision/hazard sounds, adaptation to FX/lighting, clarity.' },
    ntd_week10_title: { pl: 'Tydzień 10 — Production‑Ready Race', nl: 'Week 10 — Productie‑Klare Race', en: 'Week 10 — Production‑Ready Race' },
    ntd_week10_desc: { pl: 'Stabilizacja miksu, bus processing, limiter na masterze gry.', nl: 'Mix‑stabilisatie, busverwerking, game‑masterlimiter.', en: 'Mix stabilization, bus processing, game master limiter.' },
    ntd_week11_title: { pl: 'Tydzień 11 — Polish & Refinement', nl: 'Week 11 — Polijsten & Verfijning', en: 'Week 11 — Polish & Refinement' },
    ntd_week11_desc: { pl: 'Balans UI vs. gameplay, fine‑tuning envelope\'ów, final pass.', nl: 'UI vs. gameplay‑balans, fine‑tuning enveloppen, laatste doorgang.', en: 'UI vs. gameplay balance, fine‑tuning envelopes, final pass.' },
    ntd_week12_title: { pl: 'Tydzień 12 — Start, Journey and now the End', nl: 'Week 12 — Start, Reis en nu het Einde', en: 'Week 12 — Start, Journey and now the End' },
    ntd_week12_desc: { pl: 'Finalne renderingi, QA audio, checklisty, eksport buildów.', nl: 'Finale renders, audio‑QA, checklists, build‑exports.', en: 'Final renders, audio QA, checklists, build exports.' },
    // Team tooltips
    ntd_team_tooltip: { pl: 'Kliknij aby odwiedzić portfolio', nl: 'Klik om portfolio te bezoeken', en: 'Click to visit portfolio' },
    ntd_team_no_portfolio: { pl: 'Portfolio niedostępne', nl: 'Portfolio niet beschikbaar', en: 'Portfolio unavailable' },
    // Collaboration section
    ntd_collaboration_title: { pl: 'Współpraca zespołu', nl: 'Teamsamenwerking', en: 'Team Collaboration' },
    ntd_collaboration_desc: { pl: 'Mój zespół to wspaniali ludzie! Pracowaliśmy tak dobrze razem, że postanowiliśmy dodać dodatkowy element do gry — nagraliśmy oryginalne voiceline\'y dla postaci babć. Każda babcia ma swój unikalny charakter i głos, co dodaje uroku i humoru do rozgrywki.', nl: 'Mijn team bestaat uit geweldige mensen! We werkten zo goed samen dat we besloten een extra element aan de game toe te voegen — we hebben originele voicelines opgenomen voor de oma-personages. Elke oma heeft haar unieke karakter en stem, wat charme en humor toevoegt aan de gameplay.', en: 'My team consists of amazing people! We worked so well together that we decided to add an extra element to the game — we recorded original voicelines for the grandma characters. Each grandma has her unique character and voice, adding charm and humor to the gameplay.' },
    ntd_voicelines_title: { pl: 'Voiceline\'y Babć', nl: 'Oma Voicelines', en: 'Grandma Voicelines' },
    ntd_voicelines_desc: { pl: 'Posłuchaj oryginalnych nagrań głosowych naszych postaci:', nl: 'Luister naar de originele voice-opnames van onze personages:', en: 'Listen to the original voice recordings of our characters:' },
    // Grandma characters
    ntd_grandma1_title: { pl: 'Grandma 1', nl: 'Oma 1', en: 'Grandma 1' },
    ntd_grandma1_desc: { pl: 'Energiczna i pewna siebie', nl: 'Energiek en zelfverzekerd', en: 'Energetic and confident' },
    ntd_grandma2_title: { pl: 'Grandma 2', nl: 'Oma 2', en: 'Grandma 2' },
    ntd_grandma2_desc: { pl: 'Mądra i doświadczona', nl: 'Wijs en ervaren', en: 'Wise and experienced' },
    ntd_grandma3_title: { pl: 'Grandma 3', nl: 'Oma 3', en: 'Grandma 3' },
    ntd_grandma3_desc: { pl: 'Wesoła i żartobliwa', nl: 'Vrolijk en speels', en: 'Cheerful and playful' },
    ntd_grandma4_title: { pl: 'Grandma 4', nl: 'Oma 4', en: 'Grandma 4' },
    ntd_grandma4_desc: { pl: 'Spokojna i skupiona', nl: 'Kalm en gefocust', en: 'Calm and focused' },
    ntd_grandma5_title: { pl: 'Grandma 5', nl: 'Oma 5', en: 'Grandma 5' },
    ntd_grandma5_desc: { pl: 'Sroga ale sprawiedliwa', nl: 'Streng maar eerlijk', en: 'Stern but fair' },
    // AudioLab page translations
    audiolab_title: { pl: 'Transientica: AudioLab', nl: 'Transientica: AudioLab', en: 'Transientica: AudioLab' },
    audiolab_subtitle: { pl: 'Gra rytmiczna sterowana beatboxem do beatboxu wokalnego', nl: 'Beatbox-gestuurd ritme spel voor vocale percussie gameplay', en: 'Beatbox-Controlled Rhythm Game for Vocal Percussion Gameplay' },
    // MusicForGames page translations
    // legacy label kept for other pages; ensure music page uses Listening Room
    music_subtitle: { pl: 'Muzyka do Gier — Adaptacyjne systemy audio z Wwise', nl: 'Muziek voor Games — Adaptieve audiosystemen met Wwise', en: 'Music for Games — Adaptive Audio Systems with Wwise' },
    // Common project page translations
    project_overview: { pl: 'Przegląd Projektu', nl: 'Projectoverzicht', en: 'Project Overview' },
    technical_implementation: { pl: 'Implementacja Techniczna', nl: 'Technische Implementatie', en: 'Technical Implementation' },
    performance_results: { pl: 'Wyniki Wydajności', nl: 'Prestatie Resultaten', en: 'Performance Results' },
    research_contributions: { pl: 'Wkład Badawczy', nl: 'Onderzoeksbijdragen', en: 'Research Contributions' },
    interactive_techniques: { pl: 'Techniki Interaktywne', nl: 'Interactieve Technieken', en: 'Interactive Techniques' },
    implementation_details: { pl: 'Szczegóły Implementacji', nl: 'Implementatie Details', en: 'Implementation Details' },
    back_to_projects: { pl: '← Powrót do Projektów', nl: '← Terug naar Projecten', en: '← Back to Projects' },
    get_in_touch: { pl: 'Skontaktuj się', nl: 'Neem Contact Op', en: 'Get in Touch' },
    // AudioLab additional translations
    audio_processing: { pl: 'Przetwarzanie Audio', nl: 'Audio Verwerking', en: 'Audio Processing' },
    machine_learning: { pl: 'Uczenie Maszynowe', nl: 'Machine Learning', en: 'Machine Learning' },
    osc_communication: { pl: 'Komunikacja OSC', nl: 'OSC Communicatie', en: 'OSC Communication' },
    game_engine: { pl: 'Silnik Gry', nl: 'Game Engine', en: 'Game Engine' },
    median_latency: { pl: 'Mediana Opóźnienia', nl: 'Mediaan Latentie', en: 'Median Latency' },
    percentile_90: { pl: '90. Percentyl', nl: '90e Percentiel', en: '90th Percentile' },
    hit_accuracy: { pl: 'Celność Trafień', nl: 'Hit Nauwkeurigheid', en: 'Hit Accuracy' },
    f1_score: { pl: 'Wynik F1', nl: 'F1 Score', en: 'F1 Score' },
    video_demonstration: { pl: 'Demonstracja Video', nl: 'Video Demonstratie', en: 'Video Demonstration' },
    video_unsupported: { pl: 'Twoja przeglądarka nie obsługuje tagu video.', nl: 'Je browser ondersteunt de video tag niet.', en: 'Your browser does not support the video tag.' },
    low_latency_vocal: { pl: 'Interfejs wokalny o niskim opóźnieniu:', nl: 'Lage latentie vocale interface:', en: 'Low-latency vocal interface:' },
    achieved_sub60ms: { pl: 'Osiągnięto opóźnienie poniżej 60ms odpowiednie dla gier rytmicznych', nl: 'Sub-60ms latentie geschikt voor ritmegames bereikt', en: 'Achieved sub-60ms end-to-end latency suitable for rhythm gaming' },
    realtime_beatbox: { pl: 'Klasyfikacja beatboxu w czasie rzeczywistym:', nl: 'Realtime beatbox classificatie:', en: 'Real-time beatbox classification:' },
    user_trained_ml: { pl: 'Modele ML trenowane przez użytkownika z dokładnością 80%+ na dźwięki kick, snare, hi-hat', nl: 'Door gebruiker getrainde ML-modellen met 80%+ nauwkeurigheid op kick, snare, hi-hat geluiden', en: 'User-trained ML models with 80%+ accuracy on kick, snare, hi-hat sounds' },
    osc_architecture: { pl: 'Architektura oparta na OSC:', nl: 'OSC-gebaseerde architectuur:', en: 'OSC-based architecture:' },
    modular_system: { pl: 'Modularny projekt systemu umożliwiający integrację z DAW, oświetleniem i systemami haptycznymi', nl: 'Modulair systeemontwerp dat integratie met DAWs, verlichting en haptische systemen mogelijk maakt', en: 'Modular system design enabling integration with DAWs, lighting, and haptic systems' },
    personalized_training: { pl: 'Spersonalizowane szkolenie:', nl: 'Gepersonaliseerde training:', en: 'Personalized training:' },
    local_ml_training: { pl: 'Lokalne szkolenie ML unikające problemów prywatności i opóźnień chmury', nl: 'Lokale ML-training die privacy- en cloud-latentieproblemen vermijdt', en: 'Local ML training avoiding privacy and cloud latency issues' },
    documentation_resources: { pl: 'Dokumentacja i Zasoby', nl: 'Documentatie & Bronnen', en: 'Documentation & Resources' },
    technical_documentation: { pl: 'Dokumentacja Techniczna', nl: 'Technische Documentatie', en: 'Technical Documentation' },
    video_demo: { pl: 'Demo Video', nl: 'Video Demo', en: 'Video Demo' },
    // MusicForGames additional translations
    wwise_implementation: { pl: 'Implementacja Wwise', nl: 'Wwise Implementatie', en: 'Wwise Implementation' },
    vertical_layering: { pl: 'Warstwowość Wertykalna', nl: 'Verticale Lagen', en: 'Vertical Layering' },
    horizontal_resequencing: { pl: 'Ponowne Sekwencjonowanie Horyzontalne', nl: 'Horizontale Hersequencing', en: 'Horizontal Re-sequencing' },
    rtpc_controls: { pl: 'Kontrole RTPC', nl: 'RTPC Besturing', en: 'RTPC Controls' },
    adaptive_music: { pl: 'Muzyka Adaptacyjna', nl: 'Adaptieve Muziek', en: 'Adaptive Music' },
    interactive_audio: { pl: 'Audio Interaktywne', nl: 'Interactieve Audio', en: 'Interactive Audio' },
    chase_concept: { pl: 'Nieustępliwy pościg przez pięć surrealistycznych krain z narastającymi elementami horroru.', nl: 'Meedogenloze achtervolging door vijf surrealistische rijken met escalerende horror-elementen.', en: 'Relentless pursuit through five surreal realms with escalating horror elements.' },
    race_concept: { pl: 'Wyścigi na wysokiej prędkości na unoszących się egipskich piramidach, ścigani przez siły niebiańskie.', nl: 'Snelle races op zwevende Egyptische piramides, achtervolgd door hemelse krachten.', en: 'High-speed racing atop floating Egyptian pyramids, chased by celestial forces.' },
    elimination_concept: { pl: 'Strategiczne eliminacje przeciwników w cyberpunkowej arenie z zaawansowanymi systemami RTPC.', nl: 'Strategische eliminatie van tegenstanders in cyberpunk arena met geavanceerde RTPC-systemen.', en: 'Strategic opponent elimination in cyberpunk arena with advanced RTPC systems.' },
    forest_prelude: { pl: 'Preludium Lasu', nl: 'Bos Prelude', en: 'Forest Prelude' },
    mechanical_catacombs: { pl: 'Mechaniczne Katakumby', nl: 'Mechanische Catacomben', en: 'Mechanical Catacombs' },
    haunted_cathedral: { pl: 'Nawiedzony Kościół', nl: 'Spookkathedraal', en: 'Haunted Cathedral' },
    techno_labyrinth: { pl: 'Techno-Labirynt', nl: 'Techno-Labyrint', en: 'Techno-Labyrinth' },
    liminal_zone: { pl: 'Strefa Liminalna', nl: 'Liminale Zone', en: 'Liminal Zone' },
    gate_prep: { pl: 'Przygotowanie Bramy', nl: 'Poort Voorbereiding', en: 'Gate Prep' },
    first_lap: { pl: 'Pierwsze Okrążenie', nl: 'Eerste Ronde', en: 'First Lap' },
    ambush_in_sky: { pl: 'Zasadzka w Niebie', nl: 'Hinderlaag in de Lucht', en: 'Ambush in the Sky' },
    final_sprint: { pl: 'Finisz', nl: 'Eindspurt', en: 'Final Sprint' },
    arena_entrance: { pl: 'Wejście do Areny', nl: 'Arena Ingang', en: 'Arena Entrance' },
    combat_escalation: { pl: 'Eskalacja Walki', nl: 'Gevecht Escalatie', en: 'Combat Escalation' },
    last_stand: { pl: 'Ostatni Bastion', nl: 'Laatste Stand', en: 'Last Stand' },
    victory_march: { pl: 'Marsz Zwycięstwa', nl: 'Overwinning Mars', en: 'Victory March' },
    // Additional AudioLab translations
    realtime_ml_classification: { pl: 'Klasyfikacja ML w Czasie Rzeczywistym', nl: 'Realtime ML Classificatie', en: 'Real-time ML Classification' },
    low_latency_osc: { pl: 'Kontrola OSC o Niskim Opóźnieniu', nl: 'Lage Latentie OSC Besturing', en: 'Low-latency OSC Control' },
    python_unity: { pl: 'Python + Unity', nl: 'Python + Unity', en: 'Python + Unity' },
    beatbox_recognition: { pl: 'Rozpoznawanie Beatboxu', nl: 'Beatbox Herkenning', en: 'Beatbox Recognition' },
    spectral_flux_analysis: { pl: 'Analiza Strumienia Spektralnego', nl: 'Spectrale Flux Analyse', en: 'Spectral Flux Analysis' },
    median_latency_45ms: { pl: '45ms Mediana Opóźnienia', nl: '45ms Mediaan Latentie', en: '45ms Median Latency' },
    audiolab_desc1: { pl: 'Transientica zastępuje tradycyjne naciśnięcia przycisków beatboxem w grach rytmicznych. Używając analizy audio w czasie rzeczywistym, klasyfikacji uczenia maszynowego i sieci OSC, system osiąga opóźnienie poniżej 60ms przy zachowaniu 82% celności trafień w rozgrywce perkusji wokalnej.', nl: 'Transientica vervangt traditionele toetsaanslagen door beatboxing in ritmespellen. Met realtime audio-analyse, machine learning classificatie en OSC-netwerken bereikt het systeem sub-60ms latentie terwijl het 82% trefnauwkeurigheid behoudt voor vocale percussie gameplay.', en: 'Transientica replaces traditional button presses with beatboxing in rhythm games. Using real-time audio analysis, machine learning classification, and OSC networking, the system achieves sub-60ms latency while maintaining 82% hit accuracy for vocal percussion gameplay.' },
    audiolab_desc2: { pl: 'To badanie eksploruje, czy samo beatboxowanie może spełnić ścisłe wymagania czasowe konkurencyjnych gier rytmicznych, łącząc detekcję początku strumienia spektralnego z klasyfikacją RBF-SVM trenowaną przez użytkownika dla dźwięków kick, snare i hi-hat.', nl: 'Dit onderzoek verkent of beatboxing alleen kan voldoen aan de strakke timing-eisen van competitieve ritmespellen, door spectrale-flux onset detectie te combineren met door gebruikers getrainde RBF-SVM classificatie voor kick, snare en hi-hat geluiden.', en: 'This research explores whether beatboxing alone can satisfy the tight timing requirements of competitive rhythm games, combining spectral-flux onset detection with user-trained RBF-SVM classification for kick, snare, and hi-hat sounds.' },
    system_description: { pl: 'System używa backendu Python do przetwarzania audio i frontendu Unity do rozgrywki, połączonych przez komunikaty OSC.', nl: 'Het systeem gebruikt een Python backend voor audioverwerking en een Unity frontend voor gameplay, verbonden via OSC-berichten.', en: 'The system uses a Python backend for audio processing and a Unity frontend for gameplay, connected via OSC messaging.' },
    audio_processing_desc: { pl: 'Próbkowanie 44.1 kHz, bloki 2048 próbek z detekcją początku strumienia spektralnego i ekstrakcją cech MFCC (wektory 39-wymiarowe)', nl: '44.1 kHz sampling, 2048-sample blokken met spectrale flux onset detectie en MFCC feature extractie (39-dimensionale vectoren)', en: '44.1 kHz sampling, 2048-sample blocks with spectral flux onset detection and MFCC feature extraction (39-dimensional vectors)' },
    machine_learning_desc: { pl: 'Klasyfikator RBF-SVM trenowany przez użytkownika (C=10, γ=0.01) do rozpoznawania dźwięków beatboxu w czasie rzeczywistym z czasem wnioskowania 0.16ms', nl: 'Door gebruiker getrainde RBF-SVM classifier (C=10, γ=0.01) voor realtime beatbox geluidherkenning met 0.16ms inference tijd', en: 'User-trained RBF-SVM classifier (C=10, γ=0.01) for real-time beatbox sound recognition with 0.16ms inference time' },
    osc_communication_desc: { pl: 'Komunikaty UDP między backendem Python a frontendem Unity z wydarzeniami znaczonymi czasem do pomiaru opóźnienia', nl: 'UDP-berichten tussen Python backend en Unity frontend met getimestampte events voor latentiemeting', en: 'UDP messaging between Python backend and Unity frontend with timestamped events for latency measurement' },
    game_engine_desc: { pl: 'Gra rytmiczna oparta na Unity z beatmapami JSON, oknami detekcji trafień (±70ms) i systemami informacji zwrotnej w czasie rzeczywistym', nl: 'Unity-gebaseerd ritmespel met JSON beatmaps, hit detectie vensters (±70ms) en realtime feedback systemen', en: 'Unity-based rhythm game with JSON beatmaps, hit detection windows (±70ms), and real-time feedback systems' },
    // Additional MusicForGames translations
    music_overview_desc1: { pl: 'Ta kolekcja prezentuje trzy różne interaktywne systemy muzyczne opracowane na egzamin końcowy z Music for Games. Każdy prototyp demonstruje różne podejścia do projektowania adaptacyjnego audio, zawierając warstwowość wertykalną między stanami Spokoju i Intensywności, ponowne sekwencjonowanie horyzontalne dla odmiany oraz rozległe systemy kontroli RTPC.', nl: 'Deze collectie toont drie verschillende interactieve muzieksystemen ontwikkeld voor het Music for Games eindexamen. Elk prototype demonstreert verschillende benaderingen van adaptief audiodesign, met verticale lagen tussen Rustige en Intense toestanden, horizontale hersequencing voor variatie, en uitgebreide RTPC-controlesystemen.', en: 'This collection showcases three distinct interactive music systems developed for the Music for Games final exam. Each prototype demonstrates different approaches to adaptive audio design, featuring vertical layering between Calm and Intense states, horizontal re-sequencing for variation, and extensive RTPC control systems.' },
    music_overview_desc2: { pl: 'Wszystkie zasoby muzyczne zostały skomponowane, edytowane i wyeksportowane specjalnie do implementacji Wwise, równoważąc wymagania kursu z kreatywną eksploracją technik muzyki interaktywnej.', nl: 'Alle muzikale assets werden gecomponeerd, bewerkt en geëxporteerd specifiek voor Wwise-implementatie, waarbij de eisen van het curriculum werden gebalanceerd met creatieve verkenning van interactieve muziektechnieken.', en: 'All musical assets were composed, edited, and exported specifically for Wwise implementation, balancing coursework demands with creative exploration of interactive music techniques.' },
    vertical_layering_desc: { pl: 'Dynamiczne przejście między stanami Spokoju (podstawowe ścieżki) a Intensywnymi (pełna orkiestracja) z 0.5s przejściami fade', nl: 'Dynamische overgang tussen Rustige (fundamentele stems) en Intense (volledige orkestratie) toestanden met 0.5s fade overgangen', en: 'Dynamic transition between Calm (foundational stems) and Intense (full orchestration) states with 0.5s fade transitions' },
    horizontal_resequencing_desc: { pl: 'Naprzemienne wariacje pętli co 8 taktów dla kluczowych ścieżek, tworząc organiczną ewolucję muzyczną bez powtórzeń', nl: 'Wisselende loop variaties elke 8 maten voor belangrijke stems, waardoor organische muzikale evolutie ontstaat zonder herhaling', en: 'Alternating loop variations every 8 bars for key stems, creating organic musical evolution without repetition' },
    rtpc_controls_desc: { pl: 'Kontrola parametrów w czasie rzeczywistym dla GameState, LevelStep, stanów Victory/Defeat i audio przestrzennego (DistanceReverb w ELIMINATION)', nl: 'Realtime parametercontrole voor GameState, LevelStep, Victory/Defeat toestanden, en ruimtelijke audio (DistanceReverb in ELIMINATION)', en: 'Real-time parameter control for GameState, LevelStep, Victory/Defeat states, and spatial audio (DistanceReverb in ELIMINATION)' },
    seamless_transitions: { pl: 'Płynne Przejścia', nl: 'Naadloze Overgangen', en: 'Seamless Transitions' },
    seamless_transitions_desc: { pl: 'Niestandardowe audio przejściowe między sekcjami: risery, smary brass i efekty granularnych glitchy dla ciągłości narracyjnej', nl: 'Aangepaste overgangsaudio tussen secties: risers, brass smears en granulaire glitch-effecten voor narratieve continuïteit', en: 'Custom transition audio between sections: risers, brass smears, and granular glitch effects for narrative continuity' },
    design_documentation: { pl: 'Dokumentacja Projektowa', nl: 'Ontwerpsdocumentatie', en: 'Design Documentation' },
    // Ray Animation project translations
    ray_title: { en: 'Ray Animation — Music Composition', pl: 'Animacja Ray — Kompozycja muzyki', nl: 'Ray Animation — Muziekcompositie' },
    ray_lead: { en: 'Complete musical composition for 3D animation project.', pl: 'Kompletna kompozycja muzyczna dla projektu animacji 3D.', nl: 'Complete muziekcompositie voor 3D animatieproject.' },
    ray_overview: { en: 'Overview', pl: 'Przegląd', nl: 'Overzicht' },
    ray_overview_desc: {
      en: 'As the replacement composer for this Ghent-based animation team, I created a complete disco-inspired soundtrack that drives the narrative forward. The music features layered synthesis, dynamic transitions, and carefully crafted tempo changes that enhance the visual storytelling.',
      pl: 'Jako kompozytor zastępujący dla tego zespołu animatorów z Gandawy, stworzyłem kompletną ścieżkę dźwiękową inspirowaną disco, która napędza narrację. Muzyka zawiera warstwową syntezę, dynamiczne przejścia i starannie opracowane zmiany tempa, które wzmacniają wizualne opowiadanie.',
      nl: 'Als vervangingscomponist voor dit animatieteam uit Gent creëerde ik een complete disco-geïnspireerde soundtrack die het verhaal vooruitdrijft. De muziek bevat gelaagde synthese, dynamische overgangen en zorgvuldig uitgewerkte tempowisselingen die het visuele verhaal versterken.'
    },
    ray_showcase: { en: 'Showcase', pl: 'Prezentacja', nl: 'Showcase' },
    ray_gallery: { en: 'Gallery', pl: 'Galeria', nl: 'Galerij' },
    ray_all_projects: { en: 'All Projects', pl: 'Wszystkie Projekty', nl: 'Alle Projecten' },
    ray_meta_role: { en: 'Role', pl: 'Rola', nl: 'Rol' },
    ray_meta_role_value: { en: 'Music Composer', pl: 'Kompozytor muzyki', nl: 'Muziekcomponist' },
    ray_meta_style: { en: 'Style', pl: 'Styl', nl: 'Stijl' },
    ray_meta_style_value: { en: 'Disco / Electronic', pl: 'Disco / Elektroniczna', nl: 'Disco / Elektronisch' },
    ray_meta_location: { en: 'Location', pl: 'Lokalizacja', nl: 'Locatie' },
    ray_meta_location_value: { en: 'Ghent, Belgium', pl: 'Gandawa, Belgia', nl: 'Gent, België' },
    ray_meta_scope: { en: 'Scope', pl: 'Zakres', nl: 'Omvang' },
    ray_meta_scope_value: { en: 'Full Soundtrack', pl: 'Pełna ścieżka dźwiękowa', nl: 'Volledige soundtrack' },
    ray_music_composition: { en: 'Music Composition', pl: 'Kompozycja muzyczna', nl: 'Muziekcompositie' },
    ray_music_composition_desc: {
      en: 'The soundtrack was designed to capture the disco era\'s energy while supporting the animation\'s pacing. I used vintage synthesizer emulations, classic disco drums, and layered bass lines to create an authentic retro sound that enhances the visual narrative.',
      pl: 'Ścieżka dźwiękowa została zaprojektowana, aby uchwycić energię ery disco, jednocześnie wspierając tempo animacji. Użyłem emulacji vintage\'owych syntezatorów, klasycznych perkusji disco i warstwowych linii basu, aby stworzyć autentyczne retro brzmienie, które wzmacnia wizualną narrację.',
      nl: 'De soundtrack werd ontworpen om de energie van het disco-tijdperk vast te leggen terwijl deze het tempo van de animatie ondersteunt. Ik gebruikte vintage synthesizer-emulaties, klassieke disco-drums en gelaagde baslijnen om een authentiek retro-geluid te creëren dat het visuele verhaal versterkt.'
    },
    ray_creative_process: { en: 'Creative Process', pl: 'Proces twórczy', nl: 'Creatief proces' },
    ray_creative_process_desc: {
      en: 'Working closely with the animation team from Ghent, I developed the musical themes through iterative collaboration. The composition process involved analyzing the visual pacing, identifying key emotional beats, and crafting musical transitions that seamlessly flow with the animated sequences.',
      pl: 'Pracując blisko z zespołem animatorów z Gandawy, opracowałem tematy muzyczne poprzez iteracyjną współpracę. Proces kompozycji obejmował analizę wizualnego tempa, identyfikację kluczowych momentów emocjonalnych i tworzenie muzycznych przejść, które płynnie przepływają z animowanymi sekwencjami.',
      nl: 'In nauwe samenwerking met het animatieteam uit Gent ontwikkelde ik de muzikale thema\'s door iteratieve samenwerking. Het compositieproces omvatte het analyseren van het visuele tempo, het identificeren van belangrijke emotionele momenten, en het creëren van muzikale overgangen die naadloos meevloeien met de geanimeerde sequenties.'
    },
    ray_technical_approach: { en: 'Technical Approach', pl: 'Podejście techniczne', nl: 'Technische benadering' },
    ray_technical_approach_desc: {
      en: 'The technical execution involved precise timing synchronization with the animation frames, dynamic range management for various playback systems, and careful frequency balancing to ensure the music complements rather than competes with dialogue and sound effects.',
      pl: 'Wykonanie techniczne obejmowało precyzyjną synchronizację czasową z klatkami animacji, zarządzanie dynamiką dla różnych systemów odtwarzania i staranne balansowanie częstotliwości, aby zapewnić, że muzyka uzupełnia, a nie konkuruje z dialogiem i efektami dźwiękowymi.',
      nl: 'De technische uitvoering omvatte precieze timing-synchronisatie met de animatieframes, dynamiekbeheer voor verschillende afspeelsystemen, en zorgvuldige frequentiebalancering om ervoor te zorgen dat de muziek dialoog en geluidseffecten aanvult in plaats van ermee te concurreren.'
    },
    ray_gallery_title: { en: 'Title Sequence', pl: 'Sekwencja tytułowa', nl: 'Titelsequentie' },
    ray_gallery_character: { en: 'Character Design', pl: 'Design postaci', nl: 'Karakterontwerp' },
    ray_gallery_environment: { en: 'Environment Shot', pl: 'Ujęcie środowiska', nl: 'Omgevingsbeeld' },
    ray_gallery_action: { en: 'Action Sequence', pl: 'Sekwencja akcji', nl: 'Actiesequentie' },
    ray_gallery_finale: { en: 'Finale Scene', pl: 'Scena finałowa', nl: 'Finale scene' },

    // Pause & Deserve project translations
    pausedeserve_wip_badge: { en: 'Work in Progress', pl: 'W trakcie realizacji', nl: 'Work in uitvoering' },
    pausedeserve_title: { en: 'Pause & Deserve — Singleplayer Horror Game', pl: 'Pause & Deserve — Gra grozy jednoosobowa', nl: 'Pause & Deserve — Singleplayer horrorgame' },
    pausedeserve_subtitle: { en: 'First-person survival game with psychological horror elements and strategic pause mechanics.', pl: 'Gra survivalowa w pierwszej osobie z elementami grozy psychologicznej i strategicznymi mechanikami pauzy.', nl: 'First-person survival game met psychologische horror-elementen en strategische pauzemechaniek.' },
    pausedeserve_overview: { en: 'Game Overview', pl: 'Przegląd gry', nl: 'Game overzicht' },
    pausedeserve_overview_desc: { en: 'You play as a sinner trying to escape eternal punishment. Death chases you relentlessly through a surreal, nightmarish landscape. Using your \'pause\' power, you can freeze Death momentarily to find better escape routes. Death becomes faster over time and every time you pause him, challenging your reflexes and strategy.', pl: 'Grasz jako grzesznik próbujący uciec od wiecznej kary. Śmierć ściga cię nieustannie przez surrealistyczny, koszmarny krajobraz. Używając swojej mocy \'pauzy\', możesz na chwilę zamrozić Śmierć, aby znaleźć lepsze drogi ucieczki. Śmierć staje się szybsza z czasem i za każdym razem, gdy ją wstrzymujesz, rzucając wyzwanie twoim refleksom i strategii.', nl: 'Je speelt als een zondaar die probeert te ontsnappen aan eeuwige straf. De Dood achtervolgt je meedogenloos door een surrealistisch, nachtmerrieachtig landschap. Met je \'pauze\' kracht kun je de Dood tijdelijk bevriezen om betere ontsnappingsroutes te vinden. De Dood wordt sneller na verloop van tijd en elke keer dat je hem pauzeert, uitdagend voor je reflexen en strategie.' },
    pausedeserve_chase_title: { en: 'Relentless Chase', pl: 'Nieustający pościg', nl: 'Meedogenloze achtervolging' },
    pausedeserve_chase_desc: { en: 'Death uses advanced pathfinding to navigate obstacles and adapts to your movements, creating an ever-present threat.', pl: 'Śmierć używa zaawansowanego pathfinding do nawigacji przez przeszkody i dostosowuje się do twoich ruchów, tworząc ciągle obecne zagrożenie.', nl: 'De Dood gebruikt geavanceerde pathfinding om obstakels te navigeren en past zich aan je bewegingen aan, wat een altijd aanwezige bedreiging creëert.' },
    pausedeserve_pause_title: { en: 'Strategic Pause', pl: 'Strategiczna pauza', nl: 'Strategische pauze' },
    pausedeserve_pause_desc: { en: 'Temporarily freeze Death\'s movement to create escape opportunities. Each use has a cooldown and makes Death faster.', pl: 'Tymczasowo zamroź ruch Śmierci, aby stworzyć możliwości ucieczki. Każde użycie ma czas odnowienia i sprawia, że Śmierć staje się szybsza.', nl: 'Bevries tijdelijk de beweging van de Dood om ontsnappingsmogelijkheden te creëren. Elk gebruik heeft een cooldown en maakt de Dood sneller.' },
    pausedeserve_world_title: { en: 'Dynamic Environment', pl: 'Dynamiczne środowisko', nl: 'Dynamische omgeving' },
    pausedeserve_world_desc: { en: 'The nightmare landscape shifts as time progresses—walls close in, pathways change, and lighting dims.', pl: 'Koszmarny krajobraz zmienia się w miarę upływu czasu—ściany się zaciskają, ścieżki się zmieniają, a oświetlenie przygasa.', nl: 'Het nachtmerrieachtige landschap verschuift naarmate de tijd vordert—muren sluiten zich, paden veranderen en verlichting wordt zwakker.' },
    pausedeserve_score_title: { en: 'Survival Challenge', pl: 'Wyzwanie przetrwania', nl: 'Overlevingsuitdaging' },
    pausedeserve_score_desc: { en: 'Endless survival game that tracks your best times and tests both reflexes and strategic thinking.', pl: 'Nieskończona gra survivalowa, która śledzi twoje najlepsze czasy i testuje zarówno refleksy, jak i myślenie strategiczne.', nl: 'Eindeloze survival game die je beste tijden bijhoudt en zowel reflexen als strategisch denken test.' },
    pausedeserve_design: { en: 'Design Philosophy', pl: 'Filozofia projektowania', nl: 'Ontwerpfilosofie' },
    pausedeserve_design_desc: { en: 'This project focuses on creating immersive tension through first-person perspective, intelligent AI behavior, and audio design that enhances the psychological horror atmosphere. The development emphasizes rapid prototyping and iterative design based on playtesting feedback.', pl: 'Ten projekt skupia się na tworzeniu wciągającego napięcia poprzez perspektywę pierwszej osoby, inteligentne zachowanie AI i design dźwięku, który wzmacnia atmosferę grozy psychologicznej. Rozwój kładzie nacisk na szybkie prototypowanie i iteracyjny design oparty na feedbacku z playtestów.', nl: 'Dit project richt zich op het creëren van immersieve spanning door first-person perspectief, intelligent AI-gedrag en audiodesign dat de psychologische horror-sfeer versterkt. De ontwikkeling benadrukt snelle prototyping en iteratief ontwerp gebaseerd op playtesting feedback.' },
    pausedeserve_tech: { en: 'Technology Stack', pl: 'Stos technologiczny', nl: 'Technologie stack' },
    pausedeserve_gameplay: { en: 'Gameplay Preview', pl: 'Podgląd rozgrywki', nl: 'Gameplay vooruitblik' },
    pausedeserve_gallery: { en: 'Development Gallery', pl: 'Galeria rozwoju', nl: 'Ontwikkelingsgalerij' },
    pausedeserve_gallery_death: { en: 'Death Approaches', pl: 'Śmierć się zbliża', nl: 'De Dood nadert' },
    pausedeserve_gallery_bushes: { en: 'Nightmare Landscape', pl: 'Koszmarny krajobraz', nl: 'Nachtmerrieachtig landschap' },
    pausedeserve_gallery_corridor: { en: 'The Red Corridor', pl: 'Czerwony korytarz', nl: 'De rode gang' },
    pausedeserve_gallery_key: { en: 'Interactive Elements', pl: 'Elementy interaktywne', nl: 'Interactieve elementen' },

    // Richter project translations
    richter_title: { en: 'Richter — Sound Design', pl: 'Richter — Sound Design', nl: 'Richter — Sounddesign' },
    richter_subtitle: { en: 'Complete soundscape designed with original recordings and synthesis for short film.', pl: 'Kompletny soundscape zaprojektowany z oryginalnymi nagraniami i syntezą dla filmu krótkometrażowego.', nl: 'Complete soundscape ontworpen met originele opnames en synthese voor korte film.' },
    richter_video: { en: 'Project Showcase', pl: 'Prezentacja projektu', nl: 'Project showcase' },
    richter_video_fallback: { en: 'Your browser doesn\'t support HTML5 video.', pl: 'Twoja przeglądarka nie obsługuje HTML5 video.', nl: 'Je browser ondersteunt geen HTML5 video.' },
    richter_overview: { en: 'Project Overview', pl: 'Przegląd projektu', nl: 'Project overzicht' },
    richter_overview_desc: { en: 'For my DAW 2 exam assignment, I created the complete soundscape for the short film \'Richter\'. The focus was on original sound design without relying on existing sound libraries. I combined field recordings, synthesizer-based design, and creative layering to build a dynamic and immersive audio world.', pl: 'W ramach egzaminu DAW 2 stworzyłem kompletny soundscape dla filmu krótkometrażowego \'Richter\'. Skupiłem się na oryginalnym sound designie bez polegania na istniejących bibliotekach dźwięków. Połączyłem nagrania terenowe, syntezę i kreatywne warstwowanie, aby zbudować dynamiczny i immersyjny świat audio.', nl: 'Voor mijn DAW 2 examenopdracht creëerde ik de complete soundscape voor de korte film \'Richter\'. De focus lag op origineel geluidsontwerp zonder te vertrouwen op bestaande geluidsbibliotheken. Ik combineerde veldopnames, synthesizer-gebaseerd ontwerp en creatieve gelaagdheid om een dynamische en meeslepende audiowereld te bouwen.' },
    richter_process_field: { en: 'Field Recording', pl: 'Nagrania terenowe', nl: 'Veldopnames' },
    richter_process_field_desc: { en: 'Captured unique ambiences and environmental textures using Zoom H6 recorder while walking through the city.', pl: 'Nagrałem unikalne ambience i tekstury środowiskowe używając rekorders Zoom H6 podczas spacerów po mieście.', nl: 'Legde unieke sferen en omgevingstexturen vast met Zoom H6 recorder tijdens het wandelen door de stad.' },
    richter_process_synthesis: { en: 'Sound Synthesis', pl: 'Synteza dźwięku', nl: 'Geluidssynthese' },
    richter_process_synthesis_desc: { en: 'Used Vital, ReaSynth, and TAL Noisemaker to create drones, risers, and alarms.', pl: 'Użyłem Vital, ReaSynth i TAL Noisemaker do tworzenia drone\'ów, riserów i alarmów.', nl: 'Gebruikte Vital, ReaSynth en TAL Noisemaker om drones, risers en alarmen te creëren.' },
    richter_process_design: { en: 'Sound Design', pl: 'Sound Design', nl: 'Geluidsontwerp' },
    richter_process_design_desc: { en: 'Designed vehicle engines, earthquake rumbles, whooshes, and environmental effects.', pl: 'Zaprojektowałem silniki pojazdów, dudnienie trzęsień ziemi, whooshe i efekty środowiskowe.', nl: 'Ontwierp voertuigmotoren, aardbeving gerommel, whooshes en omgevingseffecten.' },
    richter_process_mixing: { en: 'Mixing & Processing', pl: 'Miksowanie i obróbka', nl: 'Mixen & verwerking' },
    richter_process_mixing_desc: { en: 'Applied EQ, distortion, pitch shifting, and spatial effects with parameter automation.', pl: 'Zastosowałem EQ, distortion, pitch shifting i efekty przestrzenne z automatyzacją parametrów.', nl: 'Paste EQ, vervorming, toonhoogteverschuiving en ruimtelijke effecten toe met parameterautomatisering.' },
    richter_technical: { en: 'Technical Approach', pl: 'Podejście techniczne', nl: 'Technische aanpak' },
    richter_technical_desc: { en: 'Each sound was carefully layered, processed, and mixed with attention to detail. I automated parameters such as volume, panning, and reverb sends to enhance realism and movement, including recreating the Doppler effect. The project used a 48kHz/24-bit setup with loudness metering to maintain professional standards.', pl: 'Każdy dźwięk był starannie warstwowany, przetwarzany i miksowany z dbałością o szczegóły. Automatyzowałem parametry takie jak głośność, panoramowanie i reverb sendy, aby zwiększyć realizm i ruch, włącznie z odtworzeniem efektu Dopplera. Projekt używał setupu 48kHz/24-bit z loudness meteringiem dla zachowania profesjonalnych standardów.', nl: 'Elk geluid werd zorgvuldig gelaagd, verwerkt en gemixt met aandacht voor detail. Ik automatiseerde parameters zoals volume, panning en reverb sends om realisme en beweging te verbeteren, inclusief het recreëren van het Doppler-effect. Het project gebruikte een 48kHz/24-bit setup met loudness metering om professionele standaarden te handhaven.' },
    richter_tools: { en: 'Tools & Technology', pl: 'Narzędzia i technologie', nl: 'Tools & technologie' },
    richter_gallery: { en: 'Development Gallery', pl: 'Galeria rozwoju', nl: 'Ontwikkelingsgalerij' },
    richter_gallery_scene1: { en: 'Opening Sequence', pl: 'Sekwencja otwierająca', nl: 'Openingssequentie' },
    richter_gallery_scene2: { en: 'Environmental Design', pl: 'Design środowiskowy', nl: 'Omgevingsontwerp' },
    richter_gallery_scene3: { en: 'Action Sequence', pl: 'Sekwencja akcji', nl: 'Actiesequentie' },
    richter_gallery_scene4: { en: 'Climax Scene', pl: 'Scena kulminacyjna', nl: 'Climax scene' },
    richter_all_projects: { en: 'All Projects', pl: 'Wszystkie Projekty', nl: 'Alle Projecten' },

    // Akantilado project translations
    akantilado_title: { en: 'Akantilado — Sound Design', pl: 'Akantilado — Sound Design', nl: 'Akantilado — Sounddesign' },
    akantilado_tagline: { en: 'A heartwarming jungle adventure where love triumphs over greed through immersive audio storytelling.', pl: 'Wzruszająca przygoda w dżungli, gdzie miłość triumfuje nad chciwością poprzez immersyjne opowiadanie audio.', nl: 'Een hartverwarmend jungle-avontuur waarbij liefde triomfeert over hebzucht door immersieve audio-verhalen.' },
    akantilado_meta_role: { en: 'Role', pl: 'Rola', nl: 'Rol' },
    akantilado_meta_role_value: { en: 'Sound Designer', pl: 'Sound Designer', nl: 'Geluidsontwerper' },
    akantilado_meta_setting: { en: 'Setting', pl: 'Sceneria', nl: 'Setting' },
    akantilado_meta_setting_value: { en: 'Jungle Adventure', pl: 'Przygoda w Dżungli', nl: 'Jungle Avontuur' },
    akantilado_meta_characters: { en: 'Characters', pl: 'Postacie', nl: 'Karakters' },
    akantilado_meta_characters_value: { en: 'Two Cat Creatures', pl: 'Dwa Stworzenia Kotopodobne', nl: 'Twee Katachtige Wezens' },
    akantilado_meta_theme: { en: 'Theme', pl: 'Temat', nl: 'Thema' },
    akantilado_meta_theme_value: { en: 'Love vs Greed', pl: 'Miłość vs Chciwość', nl: 'Liefde vs Hebzucht' },
    akantilado_overview: { en: 'Story Overview', pl: 'Przegląd Historii', nl: 'Verhaaloverzicht' },
    akantilado_story_desc: {
      en: 'Akantilado tells the enchanting story of two cat-like creatures racing through a lush jungle, driven by their desire to claim a mystical golden orb. What begins as a competitive chase transforms into a profound tale of love and sacrifice when one creature must choose between the coveted treasure and saving their companion from a deadly fall. The story culminates in a heartwarming ending where love conquers greed.',
      pl: 'Akantilado opowiada czarującą historię dwóch kotopodobnych stworzeń ścigających się przez bujną dżunglę, kierowanych pragnieniem zdobycia mistycznej złotej kuli. To, co zaczyna się jako konkurencyjny pościg, przekształca się w głęboką opowieść o miłości i poświęceniu, gdy jedno stworzenie musi wybierać między pożądanym skarbem a ratowaniem towarzysza przed śmiertelnym upadkiem. Historia kończy się wzruszającym zakończeniem, gdzie miłość pokonuje chciwość.',
      nl: 'Akantilado vertelt het betoverende verhaal van twee katachtige wezens die door een weelderige jungle racen, gedreven door hun verlangen om een mystieke gouden bol te claimen. Wat begint als een competitieve achtervolging transformeert in een diepgaand verhaal van liefde en opoffering wanneer een wezen moet kiezen tussen de begeerde schat en het redden van hun metgezel van een dodelijke val. Het verhaal culmineert in een hartverwarmend einde waar liefde hebzucht overwint.'
    },
    akantilado_sound_philosophy: { en: 'Sound Design Philosophy', pl: 'Filozofia Sound Designu', nl: 'Geluidsontwerp Filosofie' },
    akantilado_emotional_journey: { en: 'Emotional Journey', pl: 'Podróż Emocjonalna', nl: 'Emotionele Reis' },
    akantilado_emotional_journey_desc: {
      en: 'The audio design mirrors the characters\' emotional arc, starting with playful competitive energy and evolving into suspenseful tension before resolving in tender, heartfelt moments. Each phase is supported by carefully crafted soundscapes that guide the audience through the narrative transformation.',
      pl: 'Design audio odzwierciedla emocjonalną ścieżkę postaci, zaczynając od zabawnej energii konkurencji i ewoluując w napięcie pełne suspensu, zanim zostanie rozwiązane w czułych, szczerych momentach. Każda faza jest wspierana przez starannie wykonane krajobrazy dźwiękowe, które prowadzą publiczność przez transformację narracyjną.',
      nl: 'Het audiodesign spiegelt de emotionele boog van de karakters, beginnend met speelse competitieve energie en evoluerend naar spannende spanning voordat het wordt opgelost in tedere, hartelijke momenten. Elke fase wordt ondersteund door zorgvuldig vervaardigde soundscapes die het publiek door de narratieve transformatie leiden.'
    },
    akantilado_jungle_immersion: { en: 'Jungle Immersion', pl: 'Immersja Dżungli', nl: 'Jungle Onderdompeling' },
    akantilado_jungle_immersion_desc: {
      en: 'The lush jungle environment comes alive through layered natural recordings - rustling leaves, distant animal calls, flowing water, and wind through canopy. These elements create a rich, organic backdrop that makes the audience feel present in this magical world.',
      pl: 'Bujne środowisko dżungli ożywa poprzez warstwowe naturalne nagrania - szelest liści, odległe wołania zwierząt, płynąca woda i wiatr przez korony drzew. Te elementy tworzą bogate, organiczne tło, które sprawia, że publiczność czuje się obecna w tym magicznym świecie.',
      nl: 'De weelderige jungle-omgeving komt tot leven door gelaagde natuurlijke opnames - ritselende bladeren, verre dierengeluiden, stromend water en wind door de boomtoppen. Deze elementen creëren een rijke, organische achtergrond die het publiek het gevoel geeft aanwezig te zijn in deze magische wereld.'
    },
    akantilado_character_voices: { en: 'Character Expression', pl: 'Ekspresja Postaci', nl: 'Karakter Expressie' },
    akantilado_character_voices_desc: {
      en: 'Each cat creature has distinct vocal characteristics and movement sounds that reflect their personality. The orange creature\'s determined footsteps contrast with the pink creature\'s more graceful movements, while their vocalizations evolve from competitive calls to expressions of genuine care and love.',
      pl: 'Każde kotopodobne stworzenie ma odrębne charakterystyki głosowe i dźwięki ruchu, które odzwierciedlają jego osobowość. Zdeterminowane kroki pomarańczowego stworzenia kontrastują z bardziej gracjalnymi ruchami różowego stworzenia, podczas gdy ich wokalizacje ewoluują od konkurencyjnych wołań do wyrażeń prawdziwej troski i miłości.',
      nl: 'Elk katachtig wezen heeft verschillende vocale kenmerken en bewegingsgeluiden die hun persoonlijkheid weerspiegelen. De vastberaden voetstappen van het oranje wezen contrasteren met de meer gracieuze bewegingen van het roze wezen, terwijl hun vocalisaties evolueren van competitieve roepen naar uitingen van oprechte zorg en liefde.'
    },
    akantilado_technical_approach: { en: 'Technical Implementation', pl: 'Implementacja Techniczna', nl: 'Technische Implementatie' },
    akantilado_foley_library: { en: 'Custom Foley Library', pl: 'Niestandardowa Biblioteka Foley', nl: 'Aangepaste Foley Bibliotheek' },
    akantilado_foley_library_desc: {
      en: 'Built a comprehensive foley library specifically for cat-like creature movements, including paw steps on various jungle surfaces, climbing sounds, and interaction with vegetation. Each sound was recorded and processed to match the animated characters\' unique physiology and movement style.',
      pl: 'Zbudowałem kompleksową bibliotekę foley specjalnie dla ruchów kotopodobnych stworzeń, włączając kroki łap na różnych powierzchniach dżungli, dźwięki wspinania i interakcję z roślinnością. Każdy dźwięk był nagrywany i przetwarzany, aby pasować do unikalnej fizjologii i stylu ruchu animowanych postaci.',
      nl: 'Bouwde een uitgebreide foley-bibliotheek specifiek voor katachtige wezenbewegingen, inclusief pootstappen op verschillende jungle-oppervlakken, klimgeluiden en interactie met vegetatie. Elk geluid werd opgenomen en bewerkt om te passen bij de unieke fysiologie en bewegingsstijl van de geanimeerde karakters.'
    },
    akantilado_environmental_layers: { en: 'Environmental Layering', pl: 'Warstwowanie Środowiskowe', nl: 'Omgevingsgelaagdheid' },
    akantilado_environmental_layers_desc: {
      en: 'Created multi-layered jungle ambiences with distinct zones - canopy sounds, ground-level activity, and distance perspectives. The mix dynamically shifts based on camera movement and story pacing, ensuring the environment supports rather than overwhelms the narrative focus.',
      pl: 'Stworzyłem wielowarstwowe ambience dżungli z odrębnymi strefami - dźwięki koron drzew, aktywność na poziomie gruntu i perspektywy odległości. Miks dynamicznie zmienia się w oparciu o ruch kamery i tempo historii, zapewniając, że środowisko wspiera, a nie przytłacza narracyjny fokus.',
      nl: 'Creëerde meerlagige jungle-ambiances met verschillende zones - kroongeluiden, activiteit op grondniveau en afstandsperspectieven. De mix verschuift dynamisch gebaseerd op camerabeweging en verhaaltempo, wat ervoor zorgt dat de omgeving de narratieve focus ondersteunt in plaats van overweldigt.'
    },
    akantilado_emotional_scoring: { en: 'Emotional Sound Scoring', pl: 'Emocjonalne Scorowanie Dźwięku', nl: 'Emotionele Geluidsscore' },
    akantilado_emotional_scoring_desc: {
      en: 'Developed a sound palette that transitions seamlessly between playful chase sequences, intense cliff-hanger moments, and tender emotional resolution. The golden orb itself has a distinctive magical shimmer that represents both temptation and the characters\' goals.',
      pl: 'Opracowałem paletę dźwiękową, która płynnie przechodzi między zabawnymi sekwencjami pogoni, intensywnymi momentami cliffhanger i czułą emocjonalną rozdzielczością. Sama złota kula ma charakterystyczny magiczny blask, który reprezentuje zarówno pokusę, jak i cele postaci.',
      nl: 'Ontwikkelde een geluidspaletdat naadloos overgaat tussen speelse achtervolging sequenties, intense cliffhanger-momenten en tedere emotionele resolutie. De gouden bol zelf heeft een onderscheidende magische glinstering die zowel verleiding als de doelen van de karakters vertegenwoordigt.'
    },
    akantilado_key_scenes: { en: 'Key Audio Moments', pl: 'Kluczowe Momenty Audio', nl: 'Belangrijke Audio Momenten' },
    akantilado_chase_sequence: { en: 'The Great Chase', pl: 'Wielki Pościg', nl: 'De Grote Achtervolging' },
    akantilado_chase_sequence_desc: {
      en: 'Fast-paced sequence featuring rhythmic paw steps, heavy breathing, and dynamic jungle sounds that build excitement. The golden orb\'s magical resonance guides the audio rhythm, creating a musical quality to the competitive pursuit.',
      pl: 'Szybka sekwencja z rytmicznymi krokami łap, ciężkim oddechem i dynamicznymi dźwiękami dżungli, które budują emocje. Magiczna rezonancja złotej kuli kieruje rytmem audio, tworząc muzyczną jakość w konkurencyjnym pościgu.',
      nl: 'Snelle sequentie met ritmische pootstappen, zwaar ademhalen en dynamische jungle-geluiden die opwinding opbouwen. De magische resonantie van de gouden bol stuurt het audioритme, wat een muzikale kwaliteit creëert in de competitieve achtervolging.'
    },
    akantilado_cliff_moment: { en: 'The Cliff Edge Crisis', pl: 'Kryzys na Krawędzi Urwiska', nl: 'De Klif Rand Crisis' },
    akantilado_cliff_moment_desc: {
      en: 'Tension peaks with wind effects, distant echoes from the chasm, and the contrast between the falling creature\'s desperate calls and the choice-making creature\'s internal struggle. The golden orb\'s shine intensifies, representing the magnitude of the decision.',
      pl: 'Napięcie osiąga szczyt z efektami wiatru, odległymi echami z przepaści i kontrastem między rozpaczliwymi wołaniami spadającego stworzenia a wewnętrzną walką stworzenia podejmującego wybór. Blask złotej kuli intensyfikuje się, reprezentując wagę decyzji.',
      nl: 'Spanning piekt met windeffecten, verre echo\'s van de kloof, en het contrast tussen de wanhopige roepen van het vallende wezen en de interne strijd van het keuze-makende wezen. De glans van de gouden bol intensifieert, wat de magnitude van de beslissing vertegenwoordigt.'
    },
    akantilado_love_triumph: { en: 'Love\'s Triumph', pl: 'Triumf Miłości', nl: 'Liefde\'s Triomf' },
    akantilado_love_triumph_desc: {
      en: 'The climactic moment where the creature chooses love over treasure is marked by a gentle musical sting, soft vocalizations of relief and affection, and the gradual return of peaceful jungle ambience as harmony is restored.',
      pl: 'Kulminacyjny moment, w którym stworzenie wybiera miłość nad skarb, jest oznaczony delikatnym muzycznym akcentem, miękkimi wokalizacjami ulgi i czułości, oraz stopniowym powrotem spokojnego ambientu dżungli, gdy harmonia zostaje przywrócona.',
      nl: 'Het climactische moment waar het wezen liefde kiest boven schat wordt gemarkeerd door een zachte muzikale sting, zachte vocalisaties van opluchting en genegenheid, en de geleidelijke terugkeer van vredige jungle-ambiance terwijl harmonie wordt hersteld.'
    },
    akantilado_gallery: { en: 'Visual Journey', pl: 'Podróż Wizualna', nl: 'Visuele Reis' },
    akantilado_gallery_jungle_top: { en: 'Jungle Canopy View', pl: 'Widok Koron Drzew Dżungli', nl: 'Jungle Bladerdak Zicht' },
    akantilado_gallery_jungle_ground: { en: 'Ground Level Perspective', pl: 'Perspektywa z Poziomu Gruntu', nl: 'Grondniveau Perspectief' },
    akantilado_gallery_orange_ball: { en: 'Orange Creature\'s Quest', pl: 'Poszukiwania Pomarańczowego Stworzenia', nl: 'Oranje Wezen\'s Zoektocht' },
    akantilado_gallery_pink_creature: { en: 'Pink Creature Character', pl: 'Postać Różowego Stworzenia', nl: 'Roze Wezen Karakter' },
    akantilado_showcase: { en: 'Audio Showcase', pl: 'Prezentacja Audio', nl: 'Audio Showcase' },
    akantilado_video_desc: { en: 'Watch how sound design enhances every moment of this jungle adventure, from playful competition to heartfelt resolution. Notice how the audio guides emotional transitions and supports character development.', pl: 'Zobacz jak sound design wzmacnia każdy moment tej przygody w dżungli, od zabawnej konkurencji do szczerych rozwiązań. Zwróć uwagę jak audio kieruje przejściami emocjonalnymi i wspiera rozwój postaci.', nl: 'Kijk hoe geluidsontwerp elk moment van dit jungle-avontuur versterkt, van speelse competitie tot hartelijke resolutie. Merk op hoe de audio emotionele overgangen leidt en karakterontwikkeling ondersteunt.' },
    akantilado_overview_desc: {
      en: 'In Akantilado I owned the complete sound pass. I built a small foley library, recorded textures, and layered synthesized elements for clarity. Regular reviews with the animation team helped me calibrate timing and avoid masking.',
      pl: 'W Akantilado odpowiadałem za kompletną ścieżkę dźwiękową. Zbudowałem małą bibliotekę foley, nagrałem tekstury i nakładałem zsyntetyzowane elementy dla przejrzystości. Regularne recenzje z zespołem animacji pomogły mi skalibrować timing i uniknąć maskowania.',
      nl: 'In Akantilado was ik verantwoordelijk voor de complete geluidspass. Ik bouwde een kleine foley-bibliotheek, nam texturen op en laagde gesynthetiseerde elementen voor duidelijkheid. Regelmatige reviews met het animatieteam hielpen me timing te kalibreren en maskering te vermijden.'
    },
    akantilado_all_projects: { en: 'All Projects', pl: 'Wszystkie Projekty', nl: 'Alle Projecten' },
    // Amorak project translations
    amorak_title: { en: 'Amorak — Sound Design', pl: 'Amorak — Sound Design', nl: 'Amorak — Sounddesign' },
    amorak_tagline: { en: 'World-building through immersive audio design and character sound signatures.', pl: 'Budowanie świata poprzez immersyjny design dźwięku i sygnatury postaci.', nl: 'Wereldopbouw door immersief audiodesign en karaktergeluidshandtekeningen.' },
    amorak_meta_role: { en: 'Role', pl: 'Rola', nl: 'Rol' },
    amorak_meta_role_value: { en: 'Sound Designer', pl: 'Sound Designer', nl: 'Geluidsontwerper' },
    amorak_meta_style: { en: 'Style', pl: 'Styl', nl: 'Stijl' },
    amorak_meta_style_value: { en: 'Atmospheric / Horror', pl: 'Atmosferyczny / Horror', nl: 'Atmospherisch / Horror' },
    amorak_meta_team: { en: 'Team', pl: 'Zespół', nl: 'Team' },
    amorak_meta_team_value: { en: '3D Animation Studio', pl: 'Studio Animacji 3D', nl: '3D Animatiestudio' },
    amorak_meta_scope: { en: 'Scope', pl: 'Zakres', nl: 'Omvang' },
    amorak_meta_scope_value: { en: 'Complete Audio Pass', pl: 'Kompletna ścieżka audio', nl: 'Complete audiodoorgang' },
    amorak_overview: { en: 'Overview', pl: 'Przegląd', nl: 'Overzicht' },
    amorak_overview_desc: {
      en: 'Amorak was an exercise in world‑building through sound. I created character signatures and environmental layers that scale with camera proximity, keeping the mix readable while reinforcing the story tone.',
      pl: 'Amorak było ćwiczeniem w budowaniu świata poprzez dźwięk. Stworzyłem sygnatury postaci i warstwy środowiskowe, które skalują się z bliskością kamery, utrzymując czytelność miksu przy jednoczesnym wzmacnianiu tonu opowieści.',
      nl: 'Amorak was een oefening in wereldopbouw door geluid. Ik creëerde karaktersignaturen en omgevingslagen die schalen met camera-nabijheid, waarbij de mix leesbaar blijft terwijl de verhaaltoon wordt versterkt.'
    },
    amorak_sound_design: { en: 'Sound Design Approach', pl: 'Podejście do Sound Designu', nl: 'Geluidsontwerp Benadering' },
    amorak_creature_signatures: { en: 'Creature Signatures', pl: 'Sygnatury Stworzeń', nl: 'Wezen Handtekeningen' },
    amorak_creature_signatures_desc: {
      en: 'Each creature in Amorak has a unique sonic identity built from organic textures, processed animal vocalizations, and synthesized sub-frequencies. The beast\'s presence is felt through low-frequency rumbles that scale with proximity, creating an unsettling atmosphere even when off-screen.',
      pl: 'Każde stworzenie w Amorak ma unikalną tożsamość dźwiękową zbudowaną z organicznych tekstur, przetworzonych wokalizacji zwierząt i zsyntetyzowanych podczęstotliwości. Obecność bestii jest odczuwalna poprzez niskofrequencyjne pomruki, które skalują się z bliskością, tworząc niepokojącą atmosferę nawet gdy jest poza ekranem.',
      nl: 'Elk wezen in Amorak heeft een unieke sonische identiteit opgebouwd uit organische texturen, bewerkte dierenvocalisaties en gesynthetiseerde subfrequenties. De aanwezigheid van het beest wordt gevoeld door laagfrequente rommelingen die schalen met nabijheid, wat een verontrustende sfeer creëert zelfs wanneer het buiten beeld is.'
    },
    amorak_environmental_layers: { en: 'Environmental Layers', pl: 'Warstwy Środowiskowe', nl: 'Omgevingslagen' },
    amorak_environmental_layers_desc: {
      en: 'The basement environment uses layered ambient textures - dripping water, creaking wood, distant echoes, and subtle electrical hums. These elements dynamically respond to the camera position, creating depth and spatial awareness that guides the viewer\'s attention.',
      pl: 'Środowisko piwnicy wykorzystuje warstwowe tekstury ambientowe - kapiącą wodę, skrzypiące drewno, odległe echa i subtelne brzęczenie elektryczne. Te elementy dynamicznie reagują na pozycję kamery, tworząc głębię i świadomość przestrzenną, która kieruje uwagę widza.',
      nl: 'De kelderomgeving gebruikt gelaagde ambiënte texturen - druppelend water, krakend hout, verre echo\'s en subtiele elektrische zoemgeluiden. Deze elementen reageren dynamisch op de camerapositie, wat diepte en ruimtelijk bewustzijn creëert dat de aandacht van de kijker leidt.'
    },
    amorak_narrative_support: { en: 'Narrative Support', pl: 'Wsparcie Narracyjne', nl: 'Narratieve Ondersteuning' },
    amorak_narrative_support_desc: {
      en: 'Sound design reinforces the story\'s emotional beats through careful frequency manipulation and dynamic range control. Tension builds through gradual introduction of discordant elements, while release moments use natural reverb and space to provide breathing room.',
      pl: 'Sound design wzmacnia emocjonalne momenty opowieści poprzez staranne manipulowanie częstotliwościami i kontrolę zakresu dynamicznego. Napięcie buduje się poprzez stopniowe wprowadzanie dysonansowych elementów, podczas gdy momenty ulgi wykorzystują naturalny reverb i przestrzeń, aby zapewnić chwilę oddechu.',
      nl: 'Geluidsontwerp versterkt de emotionele beats van het verhaal door zorgvuldige frequentiemanipulatie en dynamiekbereikcontrole. Spanning bouwt op door geleidelijke introductie van dissonante elementen, terwijl ontspanningsmomenten natuurlijke reverb en ruimte gebruiken om ademruimte te bieden.'
    },
    amorak_technical_implementation: { en: 'Technical Implementation', pl: 'Implementacja Techniczna', nl: 'Technische Implementatie' },
    amorak_proximity_system: { en: 'Proximity-Based Mixing', pl: 'Miksowanie Oparte na Bliskości', nl: 'Nabijheid-Gebaseerd Mixen' },
    amorak_proximity_system_desc: {
      en: 'Implemented a 3D spatial audio system where sound elements adjust based on camera distance and angle. Close-up shots emphasize intimate details like breathing and footsteps, while wide shots focus on environmental ambience and creature calls.',
      pl: 'Zaimplementowano system dźwięku przestrzennego 3D, gdzie elementy dźwiękowe dostosowują się w oparciu o odległość i kąt kamery. Zbliżenia podkreślają intymne detale jak oddech i kroki, podczas gdy szerokie ujęcia skupiają się na ambiencie środowiskowym i wołaniach stworzeń.',
      nl: 'Een 3D ruimtelijk audiosysteem geïmplementeerd waarbij geluidselementen zich aanpassen op basis van camera-afstand en -hoek. Close-up shots benadrukken intieme details zoals ademhaling en voetstappen, terwijl wide shots zich richten op omgevingsambiance en wezengeroep.'
    },
    amorak_frequency_design: { en: 'Frequency Design Strategy', pl: 'Strategia Designu Częstotliwości', nl: 'Frequentieontwerp Strategie' },
    amorak_frequency_design_desc: {
      en: 'Careful frequency allocation ensures clarity across all elements. Creature sounds occupy the 40-200Hz range for body and presence, while environmental details fill the mid-range. High frequencies are reserved for tension-building textures and detail work.',
      pl: 'Staranne przydzielenie częstotliwości zapewnia przejrzystość wszystkich elementów. Dźwięki stworzeń zajmują zakres 40-200Hz dla ciała i obecności, podczas gdy detale środowiskowe wypełniają średni zakres. Wysokie częstotliwości są zarezerwowane dla tekstur budujących napięcie i pracy nad detalami.',
      nl: 'Zorgvuldige frequentietoewijzing zorgt voor duidelijkheid over alle elementen. Wezenggeluiden bezetten het 40-200Hz bereik voor lichaam en aanwezigheid, terwijl omgevingsdetails het middenbereik vullen. Hoge frequenties zijn gereserveerd voor spanningsopbouwende texturen en detailwerk.'
    },
    amorak_dynamic_layering: { en: 'Dynamic Layering', pl: 'Dynamiczne Warstwowanie', nl: 'Dynamische Gelaagdheid' },
    amorak_dynamic_layering_desc: {
      en: 'Audio layers build progressively throughout scenes, starting with minimal ambience and adding complexity as tension increases. This approach maintains listener engagement while avoiding overwhelming the mix during critical dialogue moments.',
      pl: 'Warstwy audio budują się stopniowo przez sceny, zaczynając od minimalnego ambientu i dodając złożoność w miarę wzrostu napięcia. To podejście utrzymuje zaangażowanie słuchacza jednocześnie unikając przeciążenia miksu podczas krytycznych momentów dialogu.',
      nl: 'Audiolagen bouwen geleidelijk op gedurende scènes, beginnend met minimale ambiance en complexiteit toevoegend naarmate spanning toeneemt. Deze benadering houdt luisteraarsbetrokkenheid vast terwijl het vermijdt de mix te overweldigen tijdens kritieke dialoogmomenten.'
    },
    amorak_gallery: { en: 'Visual Showcase', pl: 'Prezentacja Wizualna', nl: 'Visuele Showcase' },
    amorak_gallery_basement: { en: 'Basement Environment', pl: 'Środowisko Piwnicy', nl: 'Kelderomgeving' },
    amorak_gallery_beast: { en: 'Beast Roar Sequence', pl: 'Sekwencja Ryku Bestii', nl: 'Beest Gebrul Sequentie' },
    amorak_gallery_chimney: { en: 'Chimney Tension Scene', pl: 'Scena Napięcia przy Kominie', nl: 'Schoorsteen Spanningsscène' },
    amorak_gallery_creature: { en: 'Creature Perspective', pl: 'Perspektywa Stworzenia', nl: 'Wezen Perspectief' },
    amorak_gallery_character: { en: 'Character Focus Shot', pl: 'Ujęcie Skupione na Postaci', nl: 'Karakter Focus Shot' },
    amorak_showcase: { en: 'Audio Showcase', pl: 'Prezentacja Audio', nl: 'Audio Showcase' },
    amorak_video_desc: { en: 'Experience the complete audio design in context with the animation. Notice how sound elements respond to visual cues and support the narrative progression.', pl: 'Doświadcz kompletnego designu audio w kontekście z animacją. Zwróć uwagę jak elementy dźwiękowe reagują na wizualne wskazówki i wspierają progresję narracyjną.', nl: 'Ervaar het complete audiodesign in context met de animatie. Merk op hoe geluidselementen reageren op visuele aanwijzingen en de narratieve progressie ondersteunen.' },
    amorak_all_projects: { en: 'All Projects', pl: 'Wszystkie Projekty', nl: 'Alle Projecten' },

    // AudioQ project translations
    audioq_title: { en: 'AudioQ Professional Audio Engine', pl: 'AudioQ Profesjonalny Silnik Audio', nl: 'AudioQ Professionele Audio Engine' },
    audioq_brand_main: { en: 'Audio', pl: 'Audio', nl: 'Audio' },
    audioq_brand_tagline: { en: 'Professional Audio Engine', pl: 'Profesjonalny Silnik Audio', nl: 'Professionele Audio Engine' },
    audioq_lead: { en: 'Advanced real-time audio processing with granular synthesis, intelligent DSP effects, and seamless workflow integration', pl: 'Zaawansowane przetwarzanie audio w czasie rzeczywistym z syntezą granularną, inteligentnymi efektami DSP i płynną integracją workflow', nl: 'Geavanceerde realtime audioverwerking met granulaire synthese, intelligente DSP-effecten en naadloze workflow-integratie' },
    audioq_overview: { en: 'Overview', pl: 'Przegląd', nl: 'Overzicht' },
    audioq_overview_desc: { en: 'AudioQ is a comprehensive audio plugin built with the JUCE framework, designed as both a mini-sampler and effects processor. The plugin allows real-time loading and manipulation of audio files with various controllable parameters including gain, tempo, filtering, and custom effects. It features an intuitive interface with drag & drop functionality, real-time waveform visualization, and advanced processing modes.', pl: 'AudioQ to kompleksowa wtyczka audio zbudowana z frameworkiem JUCE, zaprojektowana zarówno jako mini-sampler, jak i procesor efektów. Wtyczka umożliwia ładowanie i manipulację plików audio w czasie rzeczywistym z różnymi kontrolowanymi parametrami, w tym wzmocnieniem, tempem, filtrowaniem i niestandardowymi efektami. Posiada intuicyjny interfejs z funkcją przeciągnij i upuść, wizualizacją kształtu fali w czasie rzeczywistym i zaawansowanymi trybami przetwarzania.', nl: 'AudioQ is een uitgebreide audio-plugin gebouwd met het JUCE-framework, ontworpen als zowel een mini-sampler als effectprocessor. De plugin maakt real-time laden en manipulatie van audiobestanden mogelijk met verschillende controleerbare parameters waaronder gain, tempo, filtering en aangepaste effecten. Het heeft een intuïtieve interface met drag & drop-functionaliteit, real-time golfvormvisualisatie en geavanceerde verwerkingsmodi.' },
    audioq_features: { en: 'Key Features', pl: 'Kluczowe funkcje', nl: 'Belangrijkste kenmerken' },
    audioq_feature_1: { en: 'Drag & drop audio file loading (WAV, AIFF, MP3)', pl: 'Ładowanie plików audio metodą przeciągnij i upuść (WAV, AIFF, MP3)', nl: 'Drag & drop audio bestand laden (WAV, AIFF, MP3)' },
    audioq_feature_2: { en: 'Real-time playback control with tempo adjustment', pl: 'Kontrola odtwarzania w czasie rzeczywistym z regulacją tempa', nl: 'Real-time afspeelcontrole met tempo-aanpassing' },
    audioq_feature_3: { en: 'Advanced looping with user-defined regions', pl: 'Zaawansowane zapętlanie z regionami definiowanymi przez użytkownika', nl: 'Geavanceerd loopen met door gebruiker gedefinieerde regio\'s' },
    audioq_feature_4: { en: 'Granular synthesis mode for textural manipulation', pl: 'Tryb syntezy granularnej do manipulacji teksturalnej', nl: 'Granulaire synthese modus voor texturale manipulatie' },
    audioq_feature_5: { en: 'Custom tremolo effect with manual DSP implementation', pl: 'Niestandardowy efekt tremolo z ręczną implementacją DSP', nl: 'Aangepast tremolo-effect met handmatige DSP-implementatie' },
    audioq_feature_6: { en: 'High/Low-pass filtering with real-time parameter control', pl: 'Filtrowanie górnoprzepustowe/dolnoprzepustowe z kontrolą parametrów w czasie rzeczywistym', nl: 'High/Low-pass filtering met real-time parametercontrole' },
    audioq_feature_7: { en: 'Built-in compressor with full parameter automation', pl: 'Wbudowany kompresor z pełną automatyzacją parametrów', nl: 'Ingebouwde compressor met volledige parameter-automatisering' },
    audioq_feature_8: { en: 'Volume safety system with peak protection', pl: 'System bezpieczeństwa głośności z ochroną przed pikami', nl: 'Volume veiligheidssysteem met piekbescherming' },
    audioq_feature_9: { en: 'Dual waveform display (offline and real-time)', pl: 'Podwójny wyświetlacz kształtu fali (offline i w czasie rzeczywistym)', nl: 'Dubbele golfvormweergave (offline en real-time)' },
    audioq_feature_10: { en: 'Full state preservation via AudioProcessorValueTreeState', pl: 'Pełne zachowanie stanu przez AudioProcessorValueTreeState', nl: 'Volledige toestandsbehoud via AudioProcessorValueTreeState' },
    audioq_technical: { en: 'Technical Implementation', pl: 'Implementacja techniczna', nl: 'Technische implementatie' },
    audioq_technical_desc: { en: 'The plugin utilizes JUCE\'s AudioProcessorValueTreeState for complete parameter automation, supporting up to +10dB gain control, tempo ranges from 20-300 BPM, and comprehensive filter controls from 20Hz to 20kHz. The custom tremolo effect uses manual LFO calculation with per-sample amplitude modulation, while the granular mode employs automatic region selection with crossfade transitions. All DSP processing includes denormal protection and thread-safe buffer access through critical sections.', pl: 'Wtyczka wykorzystuje AudioProcessorValueTreeState JUCE do pełnej automatyzacji parametrów, obsługując kontrolę wzmocnienia do +10dB, zakresy tempa od 20-300 BPM i kompleksowe kontrole filtrów od 20Hz do 20kHz. Niestandardowy efekt tremolo używa ręcznego obliczania LFO z modulacją amplitudy na próbkę, podczas gdy tryb granularny wykorzystuje automatyczny wybór regionów z przejściami crossfade. Wszystkie przetwarzanie DSP obejmuje ochronę przed denormalizacją i bezpieczny dostęp do bufora przez sekcje krytyczne.', nl: 'De plugin maakt gebruik van JUCE\'s AudioProcessorValueTreeState voor volledige parameter-automatisering, met ondersteuning voor tot +10dB gain-controle, tempo-bereiken van 20-300 BPM, en uitgebreide filtercontroles van 20Hz tot 20kHz. Het aangepaste tremolo-effect gebruikt handmatige LFO-berekening met per-sample amplitude-modulatie, terwijl de granulaire modus automatische regioselectie gebruikt met crossfade-overgangen. Alle DSP-verwerking omvat denormal bescherming en thread-safe buffertoegang door kritieke secties.' },
    audioq_showcase: { en: 'Showcase Video', pl: 'Wideo pokazowe', nl: 'Showcase Video' },
    audioq_demo: { en: 'Interactive Demo', pl: 'Interaktywne demo', nl: 'Interactieve demo' },
    audioq_gallery: { en: 'Interface Gallery', pl: 'Galeria interfejsu', nl: 'Interface Galerij' },
    audioq_back: { en: 'Back to Projects', pl: 'Powrót do projektów', nl: 'Terug naar projecten' },

    // Middleware 2
    mw2_title: { en: 'Middleware 2 — Wwise Implementation', pl: 'Middleware 2 — Implementacja Wwise', nl: 'Middleware 2 — Wwise Implementatie' },
    mw2_lead: { en: 'Complete audio implementation for a game level mimicking real-world production workflow', pl: 'Kompletna implementacja audio dla poziomu gry naśladująca rzeczywisty przepływ pracy produkcyjnej', nl: 'Volledige audio-implementatie voor een spelniveau die real-world productie workflow nabootst' },
    mw2_meta_school: { en: 'Digital Arts and Entertainment', pl: 'Digital Arts and Entertainment', nl: 'Digital Arts and Entertainment' },
    mw2_meta_type: { en: 'Type: Exam Assignment', pl: 'Typ: Zadanie egzaminacyjne', nl: 'Type: Examenopdracht' },
    mw2_meta_engine: { en: 'Engine: Wwise & Unreal Engine', pl: 'Silnik: Wwise i Unreal Engine', nl: 'Engine: Wwise & Unreal Engine' },
    mw2_meta_role: { en: 'Role: Audio Implementation', pl: 'Rola: Implementacja audio', nl: 'Rol: Audio Implementatie' },
    mw2_overview_title: { en: 'Overview', pl: 'Przegląd', nl: 'Overzicht' },
    mw2_overview_desc: { en: 'The goal of this exam assignment was to mimic a real-world implementation scenario. I was provided with a working game build that included a Menu and the First Level, with all events and game parameter changes already implemented. My task was to implement all audio needed to create a fully finished gameplay experience.', pl: 'Celem tego zadania egzaminacyjnego było naśladowanie scenariusza implementacji ze świata rzeczywistego. Otrzymałem działający build gry, który zawierał Menu i Pierwszy Poziom, ze wszystkimi zdarzeniami i zmianami parametrów gry już zaimplementowanymi. Moim zadaniem było zaimplementowanie całego audio potrzebnego do stworzenia w pełni ukończonego doświadczenia rozgrywki.', nl: 'Het doel van deze examenopdracht was om een real-world implementatiescenario na te bootsen. Ik kreeg een werkende game build met een Menu en het Eerste Level, met alle events en game parameter wijzigingen al geïmplementeerd. Mijn taak was om alle audio te implementeren die nodig was om een volledig afgewerkte gameplay-ervaring te creëren.' },
    mw2_objectives_title: { en: 'Project Objectives', pl: 'Cele projektu', nl: 'Projectdoelen' },
    mw2_obj1_title: { en: 'Clean Project', pl: 'Czysty projekt', nl: 'Schoon Project' },
    mw2_obj1_1: { en: 'Follow best practices for Wwise project structure', pl: 'Przestrzeganie najlepszych praktyk struktury projektu Wwise', nl: 'Best practices volgen voor Wwise projectstructuur' },
    mw2_obj1_2: { en: 'Optimize memory and CPU usage', pl: 'Optymalizacja użycia pamięci i procesora', nl: 'Geheugen en CPU gebruik optimaliseren' },
    mw2_obj1_3: { en: 'Maintain organized asset hierarchy', pl: 'Utrzymanie zorganizowanej hierarchii assetów', nl: 'Georganiseerde asset hiërarchie onderhouden' },
    mw2_obj2_title: { en: 'Implementation', pl: 'Implementacja', nl: 'Implementatie' },
    mw2_obj2_1: { en: 'Implement all provided events', pl: 'Implementacja wszystkich dostarczonych zdarzeń', nl: 'Alle verstrekte events implementeren' },
    mw2_obj2_2: { en: 'Setup correct spatialization for in-world sounds', pl: 'Ustawienie prawidłowej spacjalizacji dla dźwięków w świecie gry', nl: 'Correcte spatialisatie instellen voor in-world geluiden' },
    mw2_obj2_3: { en: 'Configure orientation and attenuation settings', pl: 'Konfiguracja ustawień orientacji i tłumienia', nl: 'Oriëntatie en attenuatie instellingen configureren' },
    mw2_obj2_4: { en: 'Apply reverb using provided Game Syncs', pl: 'Zastosowanie reverbu przy użyciu dostarczonych Game Syncs', nl: 'Reverb toepassen met verstrekte Game Syncs' },
    mw2_obj3_title: { en: 'Audio Design', pl: 'Design audio', nl: 'Audio Design' },
    mw2_obj3_1: { en: 'Create a cohesive sound palette', pl: 'Stworzenie spójnej palety dźwiękowej', nl: 'Een samenhangende klankpalet creëren' },
    mw2_obj3_2: { en: 'Ensure correctness and loop sounds where needed', pl: 'Zapewnienie poprawności i zapętlenie dźwięków tam, gdzie to potrzebne', nl: 'Correctheid waarborgen en geluiden loopen waar nodig' },
    mw2_obj3_3: { en: 'Avoid sync issues and cut-off sounds', pl: 'Unikanie problemów z synchronizacją i ucięciami dźwięków', nl: 'Sync problemen en afgesneden geluiden vermijden' },
    mw2_obj3_4: { en: 'Prevent repetitive sounds through variation', pl: 'Zapobieganie powtarzalności dźwięków poprzez wariacje', nl: 'Repetitieve geluiden voorkomen door variatie' },
    mw2_features_title: { en: 'Key Features', pl: 'Kluczowe funkcje', nl: 'Belangrijkste kenmerken' },
    mw2_feat1_title: { en: '🎯 Spatial Audio', pl: '🎯 Audio przestrzenne', nl: '🎯 Ruimtelijke Audio' },
    mw2_feat1_desc: { en: '3D spatialization with proper attenuation curves and orientation settings for immersive audio positioning.', pl: 'Spacjalizacja 3D z odpowiednimi krzywymi tłumienia i ustawieniami orientacji dla immersyjnego pozycjonowania audio.', nl: '3D spatialisatie met juiste attenuatiecurves en oriëntatie-instellingen voor immersieve audio positionering.' },
    mw2_feat2_title: { en: '🔊 Dynamic Mix', pl: '🔊 Dynamiczny miks', nl: '🔊 Dynamische Mix' },
    mw2_feat2_desc: { en: 'Cohesive mix that adapts to gameplay, ensuring clarity and balance across all audio elements.', pl: 'Spójny miks dostosowujący się do rozgrywki, zapewniający klarowność i równowagę wszystkich elementów audio.', nl: 'Samenhangende mix die zich aanpast aan gameplay, waardoor helderheid en balans over alle audio-elementen wordt gegarandeerd.' },
    mw2_feat3_title: { en: '🎮 Game Syncs', pl: '🎮 Game Syncs', nl: '🎮 Game Syncs' },
    mw2_feat3_desc: { en: 'Integration of Game Syncs for reverb zones and parameter-driven audio changes.', pl: 'Integracja Game Syncs dla stref reverbu i zmian audio sterowanych parametrami.', nl: 'Integratie van Game Syncs voor reverb zones en parameter-gestuurde audio veranderingen.' },
    mw2_gallery_title: { en: 'Gallery', pl: 'Galeria', nl: 'Galerij' },
    mw2_technical_title: { en: 'Technical Details', pl: 'Szczegóły techniczne', nl: 'Technische Details' },
    mw2_technical_desc: { en: 'This project demonstrates professional Wwise implementation skills including event management, Game Sync integration, 3D audio positioning, and mix optimization. The implementation follows industry best practices for memory management and CPU efficiency.', pl: 'Ten projekt demonstruje profesjonalne umiejętności implementacji Wwise, w tym zarządzanie zdarzeniami, integrację Game Sync, pozycjonowanie audio 3D i optymalizację miksu. Implementacja przestrzega najlepszych praktyk branżowych w zakresie zarządzania pamięcią i wydajności procesora.', nl: 'Dit project demonstreert professionele Wwise implementatievaardigheden, inclusief event management, Game Sync integratie, 3D audio positionering en mix optimalisatie. De implementatie volgt industriële best practices voor geheugenbeheer en CPU-efficiëntie.' }
  };

  // Expose minimal public i18n for other scripts (read-only)
  try { window.I18N_PUBLIC = Object.freeze({ music_hint_click: I18N.music_hint_click, music_now_playing: I18N.music_now_playing }); } catch(_){ }

  function translatePage(lang){
    // Nav links by href
    document.querySelectorAll('#nav a[href$="index.html"], #nav a[href$="../index.html"]').forEach(a=> a.textContent = I18N.nav_home[lang]);
    document.querySelectorAll('#nav a[href$="about.html"]').forEach(a=> a.textContent = I18N.nav_about[lang]);
    document.querySelectorAll('#nav a[href*="projects/index.html"]').forEach((a) => {
      const text = a.textContent.trim().toLowerCase();
      const isAll = /all|wszystkie|alle|projecten/.test(text) || a.closest('.links')?.children?.length<=2;
      a.textContent = isAll ? I18N.nav_all[lang] : I18N.nav_projects[lang];
    });
    document.querySelectorAll('#nav a[href$="scholarly.html"]').forEach(a=> a.textContent = I18N.nav_scholarly[lang]);
    document.querySelectorAll('#nav a[href$="extras.html"]').forEach(a=> a.textContent = I18N.nav_extra[lang]);
    document.querySelectorAll('#nav a[href$="contact.html"]').forEach(a=> a.textContent = I18N.nav_contact[lang]);
    document.querySelectorAll('#nav a[href$="music.html"]').forEach(a=> a.textContent = (I18N.nav_music && I18N.nav_music[lang]) ? I18N.nav_music[lang] : 'Music');
    document.querySelectorAll('#nav a[href*="#projects-showcase"]').forEach(a=> a.textContent = I18N.nav_projects[lang]);

    // Index-specific headers
    // Music page
    if (location.pathname.endsWith('/music.html') || location.pathname.endsWith('music.html')){
      const h = document.querySelector('[data-i18n="music.title"], .music-page header.major h2');
      const p = document.querySelector('[data-i18n="music.lead"], .music-page header.major p');
      const sort = document.querySelector('#music-sort')?.previousElementSibling?.querySelector('span');
      if (h) h.textContent = I18N.music_title[lang];
      if (p) p.textContent = I18N.music_lead[lang];
      const qualityInfo = document.querySelector('.music-quality-info');
      if (qualityInfo) qualityInfo.innerHTML = I18N.music_quality_info[lang];
      if (sort) sort.textContent = I18N.music_sort[lang];
      const mf = document.querySelector('.music-finder .mf-label'); if (mf) mf.textContent = I18N.music_finder[lang];
      const tg = document.querySelector('.music-finder .gw-toggle'); if (tg) tg.textContent = I18N.music_gw_toggle[lang];
      // Translate subtle card hints
      document.querySelectorAll('#music-list .music-item .mi-hint').forEach(el=>{ el.textContent = I18N.music_hint_click[lang]; });
      // Set Now playing badge text via data attribute for CSS content
      document.querySelectorAll('#music-list .music-item.playing').forEach(el=>{ el.setAttribute('data-nowplaying', I18N.music_now_playing[lang]); });
      // Volume label in player bar
      const vr = document.querySelector('#player-bar .pb-vol-label'); if (vr) vr.textContent = I18N.music_vol_label[lang];
      // Search placeholder
      const se = document.getElementById('music-search'); if (se) se.setAttribute('placeholder', I18N.music_search[lang]);
      // Sort options
      const sel = document.getElementById('music-sort');
      if (sel && sel.options){
        if (sel.options[0]) sel.options[0].textContent = I18N.music_sort_new[lang];
        if (sel.options[1]) sel.options[1].textContent = I18N.music_sort_az[lang];
        if (sel.options[2]) sel.options[2].textContent = I18N.music_sort_len[lang];
      }
      // Tag chips text
      const LABELS = {
        all: I18N.tag_all[lang], electronic: I18N.tag_electronic[lang], film: I18N.tag_film[lang], metal: I18N.tag_metal[lang],
        playful: I18N.tag_playful[lang], score: I18N.tag_score[lang], single: I18N.tag_single[lang]
      };
      document.querySelectorAll('#music-tags .chip').forEach(ch=>{ const t=ch.getAttribute('data-tag'); if (t && LABELS[t]) ch.textContent = LABELS[t]; });
      // Also translate open track modal description if present
      try {
        const modal = document.querySelector('.music-modal.open');
        if (modal){
          const title = modal.querySelector('.mm-title')?.textContent || '';
          const tracks = window.__tracks__ || [];
          const t = tracks.find(x=> x && x.title===title);
          const descEl = modal.querySelector('.mm-desc');
          if (t && t.desc && descEl){ const d = typeof t.desc==='string'? t.desc : (t.desc[lang]||t.desc['en']||''); if (d) descEl.textContent = d; }
        }
      } catch(_){ }
    }

    // Hero pills (homepage): translate pill labels
    document.querySelectorAll('.section-pills a[href$="music.html"] span').forEach(el=> el.textContent = I18N.nav_music[lang]);
    document.querySelectorAll('.section-pills a[href*="projects/index.html"] span').forEach(el=> el.textContent = I18N.nav_all[lang] + ' ' + I18N.nav_projects[lang]);
    document.querySelectorAll('.section-pills a[href$="scholarly.html"] span').forEach(el=> el.textContent = I18N.nav_scholarly[lang]);
    document.querySelectorAll('.section-pills a[href$="about.html"] span').forEach(el=> el.textContent = I18N.nav_about[lang]);
    document.querySelectorAll('.section-pills a[href$="contact.html"] span').forEach(el=> el.textContent = I18N.nav_contact[lang]);
    // Intro block translations – apply only on homepage (has projects-showcase)
    if (document.getElementById('projects-showcase')){
      const introH2 = document.querySelector('#main > section.post header.major h2');
      if (introH2) introH2.textContent = I18N.intro_title[lang];
      const introLead = document.querySelector('#main > section.post header.major p');
      if (introLead) introLead.textContent = I18N.intro_lead[lang];
      // New minimal hero copy
      const hi = document.querySelector('.intro-hi');
      if (hi){ hi.innerHTML = ({
        en:'<i class="fas fa-hand-peace" aria-hidden="true"></i> Hi, I’m Igor.',
        pl:'<i class="fas fa-hand-peace" aria-hidden="true"></i> Cześć, jestem Igor.',
        nl:'<i class="fas fa-hand-peace" aria-hidden="true"></i> Hoi, ik ben Igor.'
      })[lang]; }
      const h = document.querySelector('.intro-headline');
      if (h){ h.textContent = ({
        en:'I make game sound and music.',
        pl:'Robię dźwięk do gier i muzykę.',
        nl:'Ik maak game‑audio en muziek.'
      })[lang]; }
      const pillMap = {
        ga: { en:'Game sound', pl:'Dźwięk do gier', nl:'Game‑audio' },
        im: { en:'Music for games', pl:'Muzyka do gier', nl:'Muziek voor games' },
        at: { en:'Tools when needed', pl:'Narzędzia gdy trzeba', nl:'Tools indien nodig' }
      };
      document.querySelectorAll('.intro-pills span').forEach(p=>{ const k=p.getAttribute('data-pill'); if (pillMap[k]) p.innerHTML = `<i class="${p.querySelector('i')?.className||'fas fa-circle'}"></i> ${pillMap[k][lang]}`; });
      // Intro CTAs
      const explore = document.querySelector('[data-i18n-cta="intro.explore"]');
      if (explore) explore.textContent = ({en:'Explore work', pl:'Zobacz projekty', nl:'Bekijk werk'})[lang];
      const listen = document.querySelector('[data-i18n-cta="intro.listen"]');
      if (listen) listen.textContent = ({en:'Listen', pl:'Posłuchaj', nl:'Luister'})[lang];
      // Done
    }
    // Metrics section (homepage)
    (function translateMetrics(){
      const metricsSection = document.getElementById('key-metrics');
      if (!metricsSection) return;
      const h2 = metricsSection.querySelector('header.major h2');
      if (h2) h2.textContent = I18N.metrics_title[lang];
      const lead = metricsSection.querySelector('header.major p');
      if (lead) lead.textContent = I18N.metrics_lead[lang];
      const cards = metricsSection.querySelectorAll('.metric-card');
      if (cards[0]) {
        const label = cards[0].querySelector('.metric-label');
        const desc = cards[0].querySelector('.metric-desc');
        if (label) label.textContent = I18N.metrics_projects_label[lang];
        if (desc) desc.textContent = I18N.metrics_projects_desc[lang];
      }
      if (cards[1]) {
        const label = cards[1].querySelector('.metric-label');
        const desc = cards[1].querySelector('.metric-desc');
        if (label) label.textContent = I18N.metrics_tracks_label[lang];
        if (desc) desc.textContent = I18N.metrics_tracks_desc[lang];
      }
      if (cards[2]) {
        const label = cards[2].querySelector('.metric-label');
        const desc = cards[2].querySelector('.metric-desc');
        if (label) label.textContent = I18N.metrics_tools_label[lang];
        if (desc) desc.textContent = I18N.metrics_tools_desc[lang];
      }
      if (cards[3]) {
        const label = cards[3].querySelector('.metric-label');
        const desc = cards[3].querySelector('.metric-desc');
        if (label) label.textContent = I18N.metrics_hours_label[lang];
        if (desc) desc.textContent = I18N.metrics_hours_desc[lang];
      }
    })();
    const cvH2 = document.querySelector('#cv-section header.major h2');
    if (cvH2) cvH2.textContent = I18N.cv_title[lang];
    const cvLead = document.querySelector('#cv-section header.major p');
    if (cvLead) cvLead.textContent = I18N.cv_lead[lang];
    // Translate labels inside new CV layout
    const skillsTitle = document.querySelector('#cv-section .skills-title');
    if (skillsTitle) skillsTitle.textContent = (lang==='pl'?'Kluczowe umiejętności': lang==='nl'?'Belangrijkste vaardigheden':'Key Skills');
    // Education timeline titles/subtitles kept as static text; can be made dynamic if needed

    // Tooltip CTA and chips
    document.querySelectorAll('.tip-popover .tip-action').forEach(a=> a.textContent = I18N.learn_more[lang]);
    document.querySelectorAll('.cv-more-chip .label').forEach(el=> el.textContent = I18N.more_label[lang]);

    // All Projects page UI
    if (location.pathname.endsWith('/projects/index.html') || document.querySelector('#projects-list')){
      const h2 = document.querySelector('header.major h2'); if (h2) h2.textContent = I18N.all_projects_title[lang];
      const lead = document.querySelector('header.major p'); if (lead) lead.textContent = I18N.all_projects_lead[lang];
      const filterStrong = Array.from(document.querySelectorAll('strong')).find(s=>/filter|filtr|sorteer/i.test(s.textContent));
      const labels = document.querySelectorAll('.projects-controls strong');
      if (labels[0]) labels[0].textContent = I18N.label_filter[lang];
      if (labels[1]) labels[1].textContent = I18N.label_sort[lang];
      if (labels[2]) labels[2].textContent = I18N.label_view[lang];
      const b = (sel,val)=>{ const el=document.querySelector(sel); if (el) el.textContent=val; };
      b('button[data-filter="all"]', I18N.filter_all[lang]);
      b('button[data-filter="music"]', I18N.filter_music[lang]);
      b('button[data-filter="sound-design"]', I18N.filter_sound[lang]);
      b('button[data-filter="game-audio"]', I18N.filter_gameaudio[lang]);
      b('button[data-filter="3d-design"]', I18N.filter_3d[lang]);
      const sel = document.getElementById('sort-select');
      if (sel){
        const opts = sel.options;
        if (opts[0]) opts[0].textContent = I18N.opt_newest[lang];
        if (opts[1]) opts[1].textContent = I18N.opt_oldest[lang];
        if (opts[2]) opts[2].textContent = I18N.opt_title_az[lang];
        if (opts[3]) opts[3].textContent = I18N.opt_title_za[lang];
      }

      // Handle View controls and Search
      b('button[data-view="grid"]', I18N.view_grid[lang]);
      b('button[data-view="list"]', I18N.view_list[lang]);
      const searchInput = document.getElementById('projects-search');
      if (searchInput) searchInput.placeholder = I18N.search_projects[lang];

      // Translate individual project cards (titles + blurbs)
      const CARDS = {
        'Dynamic Music System': {
          h: { en:'Dynamic Music System (Wwise & UE5)', pl:'System muzyki dynamicznej (Wwise & UE5)', nl:'Dynamisch muzieksysteem (Wwise & UE5)' },
          p: { en:'Adaptive music with states, layers, and beat-accurate transitions.', pl:'Adaptacyjna muzyka ze stanami, warstwami i przejściami w takcie.', nl:'Adaptieve muziek met states, lagen en beat‑nauwkeurige overgangen.' }
        },
        'Akantilado': {
          h: { en:'Akantilado — Sound Design', pl:'Akantilado — Sound design', nl:'Akantilado — Sounddesign' },
          p: { en:'Complete foley and ambience for 3D animation.', pl:'Kompletny foley i ambience do animacji 3D.', nl:'Complete foley en ambience voor 3D‑animatie.' }
        },
        'Amorak': {
          h: { en:'Amorak — Sound Design', pl:'Amorak — Sound design', nl:'Amorak — Sounddesign' },
          p: { en:'Soundscapes and character audio for animation.', pl:'Soundscapes i audio postaci do animacji.', nl:'Soundscapes en character‑audio voor animatie.' }
        },
        'Ray': {
          h: { en:'Ray — Music Composition', pl:'Ray — Kompozycja muzyki', nl:'Ray — Muziekcompositie' },
          p: { en:'Original score supporting narrative beats.', pl:'Oryginalna muzyka wspierająca rytm narracji.', nl:'Originele score die de narratieve beats ondersteunt.' }
        },
        'NotTodayDarling': {
          h: { en:'Not Today, Darling! — Game Audio', pl:'Not Today, Darling! — Audio do gry', nl:'Not Today, Darling! — Game‑audio' },
          p: { en:'Retro-inspired audio implementation.', pl:'Retro‑inspirowana implementacja audio.', nl:'Retro‑geïnspireerde audio‑implementatie.' }
        },
        'Pause & Deserve': {
          h: { en:'Pause & Deserve — Solo Game', pl:'Pause & Deserve — Gra solo', nl:'Pause & Deserve — Solo game' },
          p: { en:'Horror game concept and audio design.', pl:'Koncept gry grozy i sound design.', nl:'Horrorgame‑concept en sounddesign.' }
        },
        'Richter': {
          h: { en:'Richter — Sound Design', pl:'Richter — Sound design', nl:'Richter — Sounddesign' },
          p: { en:'Sound design with minimal recording gear.', pl:'Sound design przy minimalnym sprzęcie nagraniowym.', nl:'Sounddesign met minimale opname‑gear.' }
        },
        '3D Audio Plugin Suite': {
          h: { en:'3D Audio Plugin Suite', pl:'Zestaw wtyczek 3D Audio', nl:'3D Audio Plugin Suite' },
          p: { en:'HRTF spatialization and convolution reverb plugins.', pl:'Wtyczki: HRTF i pogłos splotowy.', nl:'Plug‑ins voor HRTF‑spatialisatie en convolution‑reverb.' }
        }
      };
      document.querySelectorAll('#projects-list .project-card').forEach(card=>{
        const key = card.getAttribute('data-title');
        const map = key && CARDS[key]; if (!map) return;
        const h = card.querySelector('h3'); if (h) h.textContent = map.h[lang] || map.h.en;
        const p = card.querySelector('p'); if (p) p.textContent = map.p[lang] || map.p.en;
        // Keep GIF images for projects (updated paths under assets/images/projects)
        if (key==='NotTodayDarling'){
          const img = card.querySelector('img'); if (img) { img.setAttribute('data-src','../assets/images/projects/NotTodayGIF.gif'); img.src = '../assets/images/projects/NotTodayGIF.gif'; img.alt='Not Today, Darling!'; }
        }
        if (key==='Transientica AudioLab'){
          const img = card.querySelector('img'); if (img) { img.setAttribute('data-src','../assets/images/projects/AudioLabGif.gif'); img.src = '../assets/images/projects/AudioLabGif.gif'; img.alt='Transientica AudioLab'; }
        }
        if (key==='Akantilado'){
          const img = card.querySelector('img'); if (img) { img.setAttribute('data-src','../assets/images/projects/AkantiladoGIF.gif'); img.src = '../assets/images/projects/AkantiladoGIF.gif'; img.alt='Akantilado'; }
        }
        if (key==='Amorak'){
          const img = card.querySelector('img'); if (img) { img.setAttribute('data-src','../assets/images/projects/AmorakGIF.gif'); img.src = '../assets/images/projects/AmorakGIF.gif'; img.alt='Amorak'; }
        }
        if (key==='Ray'){
          const img = card.querySelector('img'); if (img) { img.setAttribute('data-src','../assets/images/projects/RayGIF.gif'); img.src = '../assets/images/projects/RayGIF.gif'; img.alt='Ray'; }
        }
      });
    }

    // Individual project pages (title/lead/sections)
    if (location.pathname.includes('/projects/')){
      const P = {
        amorak: {
          title: { en:'Amorak — Sound Design', pl:'Amorak — Sound design', nl:'Amorak — Sounddesign' },
          lead: { en:'Complete sound design for the 3D animation "Amorak".', pl:'Kompletny sound design do animacji 3D „Amorak".', nl:'Volledig sounddesign voor de 3D‑animatie "Amorak".' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          overview_desc: {
            en:'Amorak was an exercise in world‑building through sound. I created character signatures and environmental layers that scale with camera proximity, keeping the mix readable while reinforcing the story tone.',
            pl:'Amorak był ćwiczeniem w budowaniu świata przez dźwięk. Stworzyłem sygnatury postaci i warstwy środowiskowe, które skalują się z bliskością kamery, utrzymując czytelność miksu jednocześnie wzmacniając ton opowieści.',
            nl:'Amorak was een oefening in wereldopbouw door geluid. Ik creëerde karaktersignaturen en omgevingslagen die schalen met de cameranabijheid, waarbij de mix leesbaar bleef terwijl de verhaaltoon werd versterkt.'
          },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' },
          all_projects: { en:'All Projects', pl:'Wszystkie projekty', nl:'Alle projecten' }
        },
        'audio-plugin-suite': {
          title: { en:'3D Audio Plugin Suite (VST Development)', pl:'Zestaw wtyczek audio 3D (Rozwój VST)', nl:'3D Audio Plugin Suite (VST‑ontwikkeling)' },
          lead: { en:'Custom DSP for HRTF spatialization, real-time convolution, and UI design.', pl:'Niestandardowe DSP do spacjalizacji HRTF, konwolucji czasu rzeczywistego i projektowania UI.', nl:'Aangepaste DSP voor HRTF‑spatialisatie, realtime convolutie en UI‑ontwerp.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
        },
        audioq: {
          title: { en:'AudioQ Professional Audio Engine', pl:'AudioQ Profesjonalny Silnik Audio', nl:'AudioQ Professionele Audio Engine' },
          lead: { en:'Advanced real-time audio processing with granular synthesis, intelligent DSP effects, and seamless workflow integration', pl:'Zaawansowane przetwarzanie audio w czasie rzeczywistym z syntezą granularną, inteligentnymi efektami DSP i płynną integracją workflow', nl:'Geavanceerde realtime audioverwerking met granulaire synthese, intelligente DSP-effecten en naadloze workflow-integratie' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Interface Gallery', pl:'Galeria interfejsu', nl:'Interface Galerij' },
          showcase: { en:'Showcase Video', pl:'Wideo pokazowe', nl:'Showcase Video' }
        },
        'not-today-darling': {
          title: { en:'Not Today, Darling! — Game Audio', pl:'Not Today, Darling! — Audio do gry', nl:'Not Today, Darling! — Game‑audio' },
          lead: { en:'Retro‑inspired audio design and implementation for a narrative game.', pl:'Retro‑inspirowany sound design i implementacja do gry narracyjnej.', nl:'Retro‑geïnspireerd sounddesign en implementatie voor een verhalende game.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
        },
        middleware2: {
          title: { en:'Middleware 2 — Wwise Implementation', pl:'Middleware 2 — Implementacja Wwise', nl:'Middleware 2 — Wwise Implementatie' },
          lead: { en:'Complete audio implementation for a game level mimicking real-world production workflow', pl:'Kompletna implementacja audio dla poziomu gry naśladująca rzeczywisty przepływ pracy produkcyjnej', nl:'Volledige audio-implementatie voor een spelniveau die real-world productie workflow nabootst' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' }
        },
        akantilado: {
          title: { en:'Akantilado — Sound Design', pl:'Akantilado — Sound design', nl:'Akantilado — Sounddesign' },
          lead: { en:'Complete sound design for a 3D animation project.', pl:'Kompletny sound design do projektu animacji 3D.', nl:'Volledig sounddesign voor een 3D-animatieproject.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          overview_desc: {
            en:'In Akantilado I owned the complete sound pass. I built a small foley library, recorded textures, and layered synthesized elements for clarity. Regular reviews with the animation team helped me calibrate timing and avoid masking.',
            pl:'W Akantilado prowadziłem kompletny proces dźwiękowy. Zbudowałem małą bibliotekę foley, nagrałem tekstury i nałożyłem syntetyzowane elementy dla przejrzystości. Regularne recenzje z zespołem animatorów pomogły mi skalibrować timing i uniknąć maskowania.',
            nl:'In Akantilado verzorgde ik de complete soundpass. Ik bouwde een kleine foley-bibliotheek, nam texturen op en laagde gesynthetiseerde elementen voor helderheid. Regelmatige reviews met het animatieteam hielpen me de timing te kalibreren en maskering te vermijden.'
          },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' },
          all_projects: { en:'All Projects', pl:'Wszystkie projekty', nl:'Alle projecten' }
        },
        'pause-and-deserve': {
          title: { en:'Pause & Deserve — Solo Game', pl:'Pause & Deserve — Gra solo', nl:'Pause & Deserve — Solo game' },
          lead: { en:'Horror game concept and audio design.', pl:'Koncept gry grozy i sound design.', nl:'Horrorgame‑concept en sounddesign.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
        },
        richter: {
          title: { en:'Richter — Sound Design', pl:'Richter — Sound design', nl:'Richter — Sounddesign' },
          lead: { en:'Sound design with minimal recording gear.', pl:'Sound design przy minimalnym sprzęcie.', nl:'Sounddesign met minimale opname‑gear.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
        },
        'dynamic-music-system': {
          title: { en:'Dynamic Music System (Wwise & UE5)', pl:'System muzyki dynamicznej (Wwise & UE5)', nl:'Dynamisch muzieksysteem (Wwise & UE5)' },
          lead: { en:'Adaptive music system with transitions, interactive layers, and game‑state reactivity.', pl:'Adaptacyjny system muzyki z przejściami, warstwami i reakcją na stan gry.', nl:'Adaptief muzieksysteem met overgangen, interactieve lagen en game‑state‑reacties.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase Video', pl:'Wideo pokazowe', nl:'Showcase‑video' }
        },
        'ray-animation': {
          title: { en:'Ray Animation — Music Composition', pl:'Animacja Ray — Kompozycja muzyki', nl:'Ray Animation — Muziekcompositie' },
          lead: { en:'Complete musical composition for 3D animation project.', pl:'Kompletna kompozycja muzyczna dla projektu animacji 3D.', nl:'Complete muziekcompositie voor 3D animatieproject.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' },
          all_projects: { en:'All Projects', pl:'Wszystkie Projekty', nl:'Alle Projecten' }
        }
      };
      const path = location.pathname.split('/').pop().replace('.html','');
      const M = P[path];
      if (M){
        const h2 = document.querySelector('#main header.major h2');
        if (h2 && !h2.querySelector('.audioq-brand')) {
          h2.textContent = M.title[lang] || M.title.en;
        }
        const lead = document.querySelector('#main header.major p'); if (lead) lead.textContent = M.lead[lang] || M.lead.en;
        const labels = Array.from(document.querySelectorAll('#main h3#bgColor'));
        const order = ['overview','showcase','gallery'];
        labels.forEach((h3,idx)=>{ const key = order[idx]; if (key && M[key]) h3.textContent = M[key][lang] || M[key].en; });
      }
    }

    // Hero roles & pills (index)
    if (document.getElementById('intro')){
      const roles = document.querySelector('#intro p');
      if (roles){
        roles.textContent = lang==='pl' ? 'Kompozytor | Inżynier dźwięku | Programista' : lang==='nl' ? 'Componist | Audio Engineer | Softwareontwikkelaar' : 'Composer | Audio Engineer | Software Developer';
      }
      document.querySelectorAll('#intro .section-pills a span').forEach(s=>{
        const t=s.textContent.toLowerCase();
        if (/all projects|wszystkie|alle/.test(t)) s.textContent = lang==='pl'?'Wszystkie projekty': lang==='nl'?'Alle projecten':'All Projects';
        else if (/scholarly|naukowe|wetenschappelijk/.test(t)) s.textContent = lang==='pl'?'Naukowe': lang==='nl'?'Wetenschappelijk':'Scholarly';
        else if (/about|o mnie|over/.test(t)) s.textContent = lang==='pl'?'O mnie': lang==='nl'?'Over mij':'About';
        else if (/contact|kontakt/.test(t)) s.textContent = lang==='pl'?'Kontakt': lang==='nl'?'Contact':'Contact';
      });
    }

    // About page translations (minimal)
    if (location.pathname.endsWith('/about.html') || document.querySelector('.about-hero')){
      const A = {
        about_title: { en:'About Me', pl:'O mnie', nl:'Over mij' },
        about_roles: { en:'Composer, Audio Engineer, and Software Developer focused on interactive sound.', pl:'Kompozytor, Inżynier dźwięku i Programista — dźwięk interaktywny', nl:'Componist, Audio Engineer en Softwareontwikkelaar — interactieve audio' },
        about_paragraph: {
          en:'My passion for audio started with my dad blasting rock classics at home — that\'s where I first fell in love with music. My parents signed me up for music school, and for 6 years I was often forced to practice piano. The school was brutal, like something from the communist era — strict teachers, impossible standards. I nearly had a mental breakdown from the pressure, but it taught me discipline. In high school, I discovered my love for games while studying math, physics, and computer science. I always tried to find exploits and bugs in games, and that\'s how I learned to peek under the hood and experiment with reverse engineering (though that\'s a big word — I was more just experimenting). I loved automating things with Python and Lua scripts. Then I found this amazing video by Dr. Alexander Deweppe about the Game Sound Integration program in Belgium. I decided to risk everything and travel 1400 km from Poland to West Flanders. Best decision ever.',
          pl:'Moja pasja do audio zaczęła się od tego, że tata puszczał mi rockowe klasyki — wtedy po raz pierwszy zakochałem się w muzyce. Rodzice zapisali mnie do szkoły muzycznej i przez 6 lat często byłem zmuszany do gry na fortepianie. Szkoła była brutalna, jak z czasów PRL-u — surowi nauczyciele, niemożliwe wymagania. Prawie załamałem się psychicznie od tej presji, ale nauczyło mnie to dyscypliny. W liceum odkryłem miłość do gier studiując matematykę, fizykę i informatykę. Zawsze próbowałem znaleźć exploity i błędy w grach i w ten sposób nauczyłem się trochę do nich zaglądać i reverse engineerować (chociaż to duże słowo — bardziej eksperymentowałem). Uwielbiałem automatyzować rzeczy skryptami w Pythonie i Lua. Potem znalazłem niesamowity film Dr. Aleksandra Deweppe o kierunku Game Sound Integration w Belgii. Postanowiłem zaryzykować i przejechać 1400 km z Polski do Zachodniej Flandrii. Najlepsza decyzja w życiu.',
          nl:'Mijn passie voor audio begon toen mijn vader thuis rockklassiekers draaide — daar werd ik voor het eerst verliefd op muziek. Mijn ouders schreven me in voor muziekschool en 6 jaar lang werd ik vaak gedwongen om piano te spelen. De school was brute, zoals iets uit het communistische tijdperk — strenge leraren, onmogelijke eisen. Ik had bijna een zenuwinzinking van de druk, maar het leerde me discipline. Op de middelbare school ontdekte ik mijn liefde voor games tijdens het studeren van wiskunde, natuurkunde en informatica. Ik probeerde altijd exploits en bugs in games te vinden, en zo leerde ik een beetje onder de motorkap te kijken en te experimenteren met reverse engineering (hoewel dat een groot woord is — ik experimenteerde meer gewoon). Ik hield van het automatiseren van dingen met Python en Lua scripts. Toen vond ik deze geweldige video van Dr. Alexander Deweppe over het Game Sound Integration programma in België. Ik besloot alles te riskeren en 1400 km te reizen van Polen naar West-Vlaanderen. Beste beslissing ooit.'
        },
        about_journey_title: { en:'From Gaming Scripts to Game Audio', pl:'Od Skryptów w Grach do Game Audio', nl:'Van Gaming Scripts naar Game Audio' },
        about_journey_text: {
          en:'Looking back, everything makes sense now. Those years of being forced to practice piano gave me a solid musical foundation, even though I hated it at the time. My gaming obsession in high school — hunting for exploits and bugs, experimenting with how games worked — that was actually me learning to think like a programmer without realizing it. I was just a curious kid who wanted to understand how things ticked, but I was accidentally developing a technical mindset. I went through a long journey in music production too — probably learned about every VST plugin creator that exists, started making music with absolutely no idea about mixing and mastering, and it took me about 4 years of learning from my own mistakes to get decent at mixing. When I found Dr. Deweppe\'s video about studying game audio in Belgium, it all clicked. Here was a way to combine everything I loved: music, games, and code. The 1400 km journey from Poland felt scary but necessary. In Belgium, they taught me everything from 3D environments and dioramas to creating my own VST plugins in JUCE and C++, building games in Unreal Engine and Unity, and proper team collaboration in game development with defined roles.',
          pl:'Patrząc wstecz, wszystko teraz ma sens. Te lata zmuszania do gry na fortepianie dały mi solidne fundamenty muzyczne, chociaż wtedy tego nienawidziłem. Moja obsesja na punkcie gier w liceum — szukanie exploitów i błędów, eksperymentowanie z tym jak gry działają — to właściwie nieuświadomiona nauka myślenia jak programista. Byłem tylko ciekawskim dzieciakiem, który chciał zrozumieć jak rzeczy działają, ale przypadkowo rozwijałem techniczne podejście. Przeszedłem też długą drogę w produkcji muzycznej — poznałem chyba wszystkich możliwych twórców pluginów VST, zacząłem tworzyć muzykę kompletnie nie mając pojęcia o mixie i masteringu, i zajęło mi z 4 lata uczenia się na własnych błędach żeby porządnie nauczyć się mixować. Kiedy znalazłem film Dr. Deweppe o studiowaniu game audio w Belgii, wszystko się złożyło. To był sposób na połączenie wszystkiego co kocham: muzyki, gier i kodu. Ta podróż 1400 km z Polski wydawała się straszna, ale konieczna. W Belgii nauczyli mnie wszystkiego od 3D environments i 3D diorama po tworzenie własnych pluginów VST w JUCE i C++, budowanie gier w Unreal Engine i Unity, i odpowiednią współpracę w zespołach tworzących gry z określonymi rolami.',
          nl:'Terugkijkend slaat alles nu wel op. Die jaren van gedwongen pianospelen gaven me een solide muzikale basis, ook al haatte ik het destijds. Mijn gaming obsessie op de middelbare school — jagen op exploits en bugs, experimenteren met hoe games werkten — dat was eigenlijk onbewust leren denken als een programmeur. Ik was gewoon een nieuwsgierig kind dat wilde begrijpen hoe dingen werkten, maar ontwikkelde per ongeluk een technische mindset. Ik heb ook een lange reis doorgemaakt in muziekproductie — leerde waarschijnlijk elke VST plugin maker kennen die bestaat, begon muziek te maken zonder enig idee over mixing en mastering, en het kostte me ongeveer 4 jaar van leren van mijn eigen fouten om goed te worden in mixen. Toen ik Dr. Deweppe\'s video vond over game audio studeren in België, viel alles op zijn plaats. Dit was een manier om alles wat ik liefhad te combineren: muziek, games en code. De 1400 km reis vanuit Polen voelde eng maar noodzakelijk. In België leerden ze me alles van 3D omgevingen en diorama\'s tot het creëren van mijn eigen VST plugins in JUCE en C++, games bouwen in Unreal Engine en Unity, en goede teamcollaboratie in game development met gedefinieerde rollen.'
        },
        about_philosophy_title: { en:'What Keeps Me Going', pl:'Co Mnie Napędza', nl:'Wat Mij Gaande Houdt' },
        about_philosophy_text: {
          en:'I\'m driven by the same thing that made me write those game scripts — I want to create something that makes people\'s experience better. Back then it was giving myself an edge in CS:GO, now it\'s about making game audio that pulls players deeper into the world. The school in Belgium also helped a lot with my mixing skills, and I learned tons about spatial mixing — Dolby Atmos, Ambisonics, Wwise Spatial Audio, all that stuff. They taught me proper collaboration with people using Perforce and GitHub for source control, writing tech docs, bibliographies, proper project documentation, and most importantly — game design. I love the technical challenges, but what really gets me excited is when someone plays a game and doesn\'t even notice the audio because it feels so natural and perfect. That\'s the goal — invisible magic.',
          pl:'Napędza mnie to samo, co kazało mi pisać tamte skrypty do gier — chcę tworzyć coś, co poprawia doświadczenie ludzi. Wtedy chodziło o przewagę w CS:GO, teraz o audio w grach, które wciąga graczy głębiej w świat. Szkoła tu w Belgii też trochę mi pomogła z umiejętnościami mixowania, i dużo się dowiedziałem o mixie przestrzennym — Dolby Atmos, Ambisonics, Wwise Spatial Audio, i tak dalej. Dużo mnie też nauczono o współpracy z ludźmi w Perforce i GitHub czyli source control, pisanie tech doc, bibliografii, odpowiedniej dokumentacji projektów, i najważniejsze — game design. Uwielbiam wyzwania techniczne, ale naprawdę ekscytuje mnie to, gdy ktoś gra w grę i nawet nie zauważa audio, bo brzmi tak naturalnie i idealnie. To jest cel — niewidzialna magia.',
          nl:'Ik word gedreven door hetzelfde wat me die game scripts deed schrijven — ik wil iets creëren dat mensen\'s ervaring beter maakt. Toen ging het om mezelf een voorsprong geven in CS:GO, nu gaat het om game audio die spelers dieper de wereld in trekt. De school hier in België hielp ook veel met mijn mixing vaardigheden, en ik leerde veel over spatial mixing — Dolby Atmos, Ambisonics, Wwise Spatial Audio, al dat soort dingen. Ze leerden me goede samenwerking met mensen door Perforce en GitHub voor source control, tech docs schrijven, bibliografieën, goede projectdocumentatie, en het belangrijkste — game design. Ik hou van de technische uitdagingen, maar wat me echt opwindt is wanneer iemand een game speelt en de audio niet eens opmerkt omdat het zo natuurlijk en perfect aanvoelt. Dat is het doel — onzichtbare magie.'
        },
        about_edu_title: { en:'Education', pl:'Edukacja', nl:'Opleiding' },
        about_edu_1: { en:'<strong>Howest — Digital Arts and Entertainment</strong>: Game Development — Game Sound Integration (ongoing)', pl:'<strong>Howest — Digital Arts and Entertainment</strong>: Game Development — Game Sound Integration (w trakcie)', nl:'<strong>Howest — Digital Arts and Entertainment</strong>: Game Development — Game Sound Integration (lopend)' },
        about_edu_2: { en:'<strong>Bilingual Copernicus Highschool</strong>: Maths & Physics (graduated)', pl:'<strong>Bilingual Copernicus Highschool</strong>: Matematyka i Fizyka (ukończone)', nl:'<strong>Bilingual Copernicus Highschool</strong>: Wiskunde & Natuurkunde (afgestudeerd)' },
        about_edu_3: { en:'<strong>State Music School in Kołobrzeg</strong>: Classical Piano & Music Theory (graduated)', pl:'<strong>Państwowa Szkoła Muzyczna w Kołobrzegu</strong>: Fortepian klasyczny i teoria muzyki (ukończona)', nl:'<strong>Staatsmuziekschool in Kołobrzeg</strong>: Klassieke piano & muziektheorie (afgestudeerd)' },
        about_comp_title: { en:'Technical Expertise', pl:'Ekspertyza Techniczna', nl:'Technische Expertise' },
        about_comp_1: { en:'<strong>Game Audio:</strong> Wwise, FMOD, Unreal Engine, Unity — Professional implementation', pl:'<strong>Audio w grach:</strong> Wwise, FMOD, Unreal Engine, Unity — Profesjonalna implementacja', nl:'<strong>Game Audio:</strong> Wwise, FMOD, Unreal Engine, Unity — Professionele implementatie' },
        about_comp_2: { en:'<strong>DSP & Programming:</strong> C++/JUCE for VST development, real-time audio processing', pl:'<strong>DSP i Programowanie:</strong> C++/JUCE do rozwoju VST, przetwarzanie audio w czasie rzeczywistym', nl:'<strong>DSP & Programmeren:</strong> C++/JUCE voor VST ontwikkeling, real-time audioverwerking' },
        about_comp_3: { en:'<strong>Machine Learning:</strong> Real-time classification, 45ms latency beatbox recognition', pl:'<strong>Uczenie maszynowe:</strong> Klasyfikacja w czasie rzeczywistym, rozpoznawanie beatboxu z 45ms opóźnieniem', nl:'<strong>Machine Learning:</strong> Real-time classificatie, 45ms latentie beatbox herkenning' },
        about_comp_4: { en:'<strong>Production Tools:</strong> Reaper, Pro Tools, Logic Pro, Studio One — Professional workflows', pl:'<strong>Narzędzia produkcyjne:</strong> Reaper, Pro Tools, Logic Pro, Studio One — Profesjonalne workflow', nl:'<strong>Productietools:</strong> Reaper, Pro Tools, Logic Pro, Studio One — Professionele workflows' }
      };
      document.querySelectorAll('[data-i18n]').forEach(el=>{ const key=el.getAttribute('data-i18n'); const map=A[key]; if (!map) return; const val=map[lang]||map['en']; if (/^<.*>/.test(val)) el.innerHTML=val; else el.textContent=val; });
    }

    // Professional Profile section translations (index)
    if (document.getElementById('cv-section')){
      const P = {
        profile_title: { en:'Professional Profile', pl:'Profil Zawodowy', nl:'Professioneel Profiel' },
        profile_desc: { en:'Audio engineer and composer specializing in interactive sound design and game audio implementation.', pl:'Inżynier dźwięku i kompozytor specjalizujący się w interaktywnym sound designie i implementacji audio w grach.', nl:'Audio-engineer en componist gespecialiseerd in interactief sounddesign en game audio-implementatie.' },
        education_title: { en:'Education & Training', pl:'Edukacja i Szkolenia', nl:'Opleiding & Training' },
        edu_dae_title: { en:'Game Audio Integration', pl:'Integracja Audio w Grach', nl:'Game Audio Integratie' },
        present: { en:'Present', pl:'Obecnie', nl:'Huidig' },
        edu_dae_desc: { en:'Advanced game audio techniques, Wwise/FMOD implementation, real-time audio systems', pl:'Zaawansowane techniki audio w grach, implementacja Wwise/FMOD, systemy audio czasu rzeczywistego', nl:'Geavanceerde game audio-technieken, Wwise/FMOD implementatie, real-time audiosystemen' },
        edu_hs_title: { en:'Mathematics & Physics', pl:'Matematyka i Fizyka', nl:'Wiskunde & Natuurkunde' },
        edu_hs_desc: { en:'Advanced mathematics, physics, and analytical thinking foundations', pl:'Zaawansowana matematyka, fizyka i podstawy myślenia analitycznego', nl:'Geavanceerde wiskunde, natuurkunde en analytisch denken' },
        edu_music_title: { en:'Classical Piano & Music Theory', pl:'Fortepian Klasyczny i Teoria Muzyki', nl:'Klassieke Piano & Muziektheorie' },
        edu_music_school: { en:'State Music School', pl:'Państwowa Szkoła Muzyczna', nl:'Staatsmuziekschool' },
        edu_music_desc: { en:'Classical piano performance, music theory, composition, and ensemble training', pl:'Wykonawstwo fortepianu klasycznego, teoria muzyki, kompozycja i szkolenie zespołowe', nl:'Klassieke piano-uitvoering, muziektheorie, compositie en ensemble-training' },
        competencies_title: { en:'Core Competencies', pl:'Kluczowe Kompetencje', nl:'Kerncompetenties' },
        comp_audio_title: { en:'Audio Production', pl:'Produkcja Audio', nl:'Audioproductie' },
        comp_game_title: { en:'Game Development', pl:'Rozwój Gier', nl:'Game Development' },
        comp_prog_title: { en:'Programming', pl:'Programowanie', nl:'Programmeren' },
        comp_tools_title: { en:'Tools & Workflow', pl:'Narzędzia i Przepływ Pracy', nl:'Tools & Workflow' },
        spec_title: { en:'Specializations', pl:'Specjalizacje', nl:'Specialisaties' },
        spec_interactive_title: { en:'Interactive Audio Systems', pl:'Interaktywne Systemy Audio', nl:'Interactieve Audiosystemen' },
        spec_interactive_desc: { en:'Dynamic music systems, adaptive soundscapes, and real-time audio processing for games', pl:'Dynamiczne systemy muzyczne, adaptacyjne krajobrazy dźwiękowe i przetwarzanie audio w czasie rzeczywistym dla gier', nl:'Dynamische muzieksystemen, adaptieve soundscapes en real-time audioverwerking voor games' },
        spec_dsp_title: { en:'DSP & Plugin Development', pl:'DSP i Rozwój Wtyczek', nl:'DSP & Plugin Ontwikkeling' },
        spec_dsp_desc: { en:'Custom audio effects, 3D spatial audio, and performance-optimized real-time processing', pl:'Niestandardowe efekty audio, przestrzenne audio 3D i zoptymalizowane pod kątem wydajności przetwarzanie w czasie rzeczywistym', nl:'Custom audio-effecten, 3D ruimtelijke audio en performance-geoptimaliseerde real-time processing' },
        spec_media_title: { en:'Media Composition', pl:'Kompozycja Medialna', nl:'Mediacompositie' },
        spec_media_desc: { en:'Original scoring for games, animations, and interactive media with technical precision', pl:'Oryginalne kompozycje do gier, animacji i mediów interaktywnych z techniczną precyzją', nl:'Originele muziek voor games, animaties en interactieve media met technische precisie' },
        contact_prompt: { en:'Interested in collaboration or have questions about my work?', pl:'Zainteresowany współpracą lub masz pytania o moją pracę?', nl:'Geïnteresseerd in samenwerking of heb je vragen over mijn werk?' },
        contact_button: { en:'Get In Touch', pl:'Skontaktuj się', nl:'Neem Contact Op' }
      };
      document.querySelectorAll('[data-i18n]').forEach(el=>{ const key=el.getAttribute('data-i18n'); const map=P[key]; if (!map) return; const val=map[lang]||map['en']; if (/^<.*>/.test(val)) el.innerHTML=val; else el.textContent=val; });
    }

    // Scholarly page translations
    if (location.pathname.endsWith('/scholarly.html')){
      const H = {
        title: { en:'Scholarly Output', pl:'Prace naukowe', nl:'Wetenschappelijke output' },
        lead: { en:'Selected coursework and academic projects with technical notes.', pl:'Wybrane prace i projekty akademickie z notatkami technicznymi.', nl:'Geselecteerde cursussen en academische projecten met technische notities.' },
        ray: { en:'Ray — Music Composition', pl:'Ray — Kompozycja muzyki', nl:'Ray — Muziekcompositie' },
        ak: { en:'Akantilado — Sound Design', pl:'Akantilado — Sound design', nl:'Akantilado — Sounddesign' },
        am: { en:'Amorak — Sound Design', pl:'Amorak — Sound design', nl:'Amorak — Sounddesign' },
        ntd: { en:'Not Today, Darling! — Game Audio', pl:'Not Today, Darling! — Audio do gry', nl:'Not Today, Darling! — Game‑audio' },
        pd: { en:'Pause & Deserve — Solo Game', pl:'Pause & Deserve — Gra solo', nl:'Pause & Deserve — Solo game' },
        ri: { en:'Richter — Sound Design', pl:'Richter — Sound design', nl:'Richter — Sounddesign' },
      };
      const h2 = document.querySelector('#main header.major h2'); if (h2) h2.textContent = H.title[lang];
      const lead = document.querySelector('#main header.major p'); if (lead) lead.textContent = H.lead[lang];
      // Update article headings and NTD image/link
      const map = [
        ['a[href="projects/ray-animation.html"]','ray'],
        ['a[href="projects/akantilado.html"]','ak'],
        ['a[href="projects/amorak.html"]','am'],
        ['a[href="projects/not-today-darling.html"]','ntd'],
        ['a[href="projects/pause-and-deserve.html"]','pd'],
        ['a[href="projects/richter.html"]','ri']
      ];
      map.forEach(([sel,key])=>{
        const a = document.querySelector(sel);
        if (!a) return;
        const h = a.closest('article')?.querySelector('header h3 a'); if (h && H[key]) h.textContent = H[key][lang];
      });
    }

    // Extras page translations
    if (location.pathname.endsWith('/extras.html') || /extras\.html$/i.test(location.pathname)){
      const h2 = document.querySelector('#main header.major h2'); if (h2) h2.textContent = I18N.extras_title[lang];
      const lead = document.querySelector('#main header.major p'); if (lead) lead.textContent = I18N.extras_lead[lang];
      const a = document.querySelector('#main article h4 a'); if (a) a.textContent = I18N.extras_spotify_title[lang];
      const p2 = document.querySelector('#main article p'); if (p2) p2.textContent = I18N.extras_spotify_lead[lang];
      // Page <title>
      try { document.title = (lang==='pl'?'Aktywności dodatkowe — Igor Szuniewicz': lang==='nl'?'Extra‑curriculair — Igor Szuniewicz':'Extra-Curricular — Igor Szuniewicz'); } catch(_){}
    }

    // Not Today Darling page translations
    if (location.pathname.endsWith('/not-today-darling.html') || /not-today-darling\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        let i18nKey = 'ntd_' + key.replace(/[^a-zA-Z0-9_]/g, '_');

        // Handle special cases for team tooltips
        if (key === 'team_tooltip') i18nKey = 'ntd_team_tooltip';
        if (key === 'team_no_portfolio') i18nKey = 'ntd_team_no_portfolio';

        if (I18N[i18nKey]) {
          el.textContent = I18N[i18nKey][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Not Today, Darling! — Audio do gry — Igor Szuniewicz': lang==='nl'?'Not Today, Darling! — Game‑audio — Igor Szuniewicz':'Not Today, Darling! — Game Audio — Igor Szuniewicz'); } catch(_){}
    }

    // Middleware 2 page translations
    if (location.pathname.endsWith('/middleware2.html') || /middleware2\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Middleware 2 — Implementacja Wwise — Igor Szuniewicz': lang==='nl'?'Middleware 2 — Wwise Implementatie — Igor Szuniewicz':'Middleware 2 — Wwise Implementation — Igor Szuniewicz'); } catch(_){}
    }

    // AudioLab page translations
    if (location.pathname.endsWith('/audiolab.html') || /audiolab\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Transientica: AudioLab — Gra rytmiczna beatbox — Igor Szuniewicz': lang==='nl'?'Transientica: AudioLab — Beatbox rytme game — Igor Szuniewicz':'Transientica: AudioLab — Beatbox Rhythm Game — Igor Szuniewicz'); } catch(_){}
    }

    // MusicForGames page translations
    if (location.pathname.endsWith('/musicforgames.html') || /musicforgames\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Interaktywny Design Muzyczny — Muzyka do gier — Igor Szuniewicz': lang==='nl'?'Interactief Muziekontwerp — Muziek voor games — Igor Szuniewicz':'Interactive Music Design — Music for Games — Igor Szuniewicz'); } catch(_){}
    }

    // AudioQ page translations
    if (location.pathname.endsWith('/audioq.html') || /audioq\.html$/i.test(location.pathname)){
      // Handle special brand structure
      const brandMain = document.querySelector('.brand-main');
      const brandTagline = document.querySelector('.brand-tagline');

      if (brandMain) {
        const qLetter = brandMain.querySelector('.letter-q');
        if (qLetter) {
          brandMain.innerHTML = I18N.audioq_brand_main[lang] + qLetter.outerHTML;
        }
      }
      if (brandTagline && I18N.audioq_brand_tagline) {
        brandTagline.textContent = I18N.audioq_brand_tagline[lang];
      }

      // Handle other data-i18n elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key] && !el.classList.contains('brand-main') && !el.classList.contains('brand-tagline')) {
          el.textContent = I18N[key][lang];
        }
      });

      // Page <title>
      try { document.title = (lang==='pl'?'AudioQ — Profesjonalny Silnik Audio — Igor Szuniewicz': lang==='nl'?'AudioQ — Professionele Audio Engine — Igor Szuniewicz':'AudioQ — Professional Audio Engine — Igor Szuniewicz'); } catch(_){}
    }
    // Contact page translations (new professional design)
    if (location.pathname.endsWith('/contact.html') || /contact\.html$/i.test(location.pathname)){
      // Translate all data-i18n elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });

      // Translate placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (I18N[key]) {
          el.setAttribute('placeholder', I18N[key][lang]);
        }
      });

      // Update page title
      try {
        document.title = (lang==='pl'?'Kontakt — Igor Szuniewicz': lang==='nl'?'Contact — Igor Szuniewicz':'Contact — Igor Szuniewicz');
      } catch(_){ }
    }

    // CV section on homepage translations
    if (document.querySelector('#cv-section')){
      const CV = {
        edu_title: { en:'Education', pl:'Edukacja', nl:'Opleiding' },
        skills_title: { en:'Key Skills', pl:'Kluczowe umiejętności', nl:'Belangrijkste vaardigheden' },
        // concise labels to avoid a wall of text
        edu_1: { en:'<strong>Howest DAE</strong> — Game Sound Integration (ongoing)', pl:'<strong>Howest DAE</strong> — Integracja dźwięku w grach (w trakcie)', nl:'<strong>Howest DAE</strong> — Game Sound Integration (lopend)' },
        edu_2: { en:'<strong>Copernicus High School</strong> — Maths & Physics (graduated)', pl:'<strong>LO Kopernika</strong> — Matematyka i Fizyka (ukończone)', nl:'<strong>Copernicus Lyceum</strong> — Wiskunde & Natuurkunde (afgestudeerd)' },
        edu_3: { en:'<strong>State Music School (First Degree)</strong> — Theory & Performance (graduated)', pl:'<strong>PSM I st.</strong> — Teoria i wykonawstwo (ukończone)', nl:'<strong>Stedelijke Muziekschool (eerste graad)</strong> — Theorie & Uitvoering (afgestudeerd)' },
        s1: { en:'Sound Design', pl:'Sound design', nl:'Sounddesign' },
        s2: { en:'Music Composition', pl:'Kompozycja muzyki', nl:'Muziekcompositie' },
        s3: { en:'Middleware (Wwise, FMOD)', pl:'Middleware (Wwise, FMOD)', nl:'Middleware (Wwise, FMOD)' },
        s4: { en:'Engines (UE, Unity)', pl:'Silniki (UE, Unity)', nl:'Engines (UE, Unity)' },
        s5: { en:'Programming (C++, Python, C#)', pl:'Programowanie (C++, Python, C#)', nl:'Programmeren (C++, Python, C#)' },
        s6: { en:'DAWs (Reaper, Pro Tools, Logic)', pl:'DAW‑y (Reaper, Pro Tools, Logic)', nl:'DAW’s (Reaper, Pro Tools, Logic)' },
        s7: { en:'VST/Audio Plugins', pl:'Wtyczki VST/Audio', nl:'VST/Audio‑plug‑ins' }
      };
      // Tooltip text per item
      const CV_TIPS = {
        // Skills (right column)
        t1: { en:'Designing cohesive SFX palettes, mixing, and implementation across engines.', pl:'Projektowanie spójnych palet SFX, miks i implementacja w silnikach.', nl:'Ontwerp van samenhangende SFX‑paletten, mix en implementatie in engines.' },
        t2: { en:'Writing, arranging, and producing music for media.', pl:'Pisanie, aranżacja i produkcja muzyki do mediów.', nl:'Schrijven, arrangeren en produceren van muziek voor media.' },
        t3: { en:'Middleware bridges audio authoring with game engines. Wwise/FMOD expose runtime control for mixing, states, parameters.', pl:'Middleware łączy autorstwo audio z silnikami gier. Wwise/FMOD dają sterowanie w runtime: miks, stany, parametry.', nl:'Middleware verbindt audio‑authoring met game‑engines. Wwise/FMOD bieden runtime‑sturing voor mix, states en parameters.' },
        t4: { en:'Experience with Blueprints/C++ in UE, and C# scripting in Unity.', pl:'Doświadczenie w Blueprints/C++ w UE oraz skrypty C# w Unity.', nl:'Ervaring met Blueprints/C++ in UE en C#‑scripting in Unity.' },
        t5: { en:'Practical C++ for DSP/tools, Python for pipelines, C# for tooling.', pl:'Praktyczne C++ do DSP/narzędzi, Python do pipeline’ów, C# do narzędzi.', nl:'Praktische C++ voor DSP/tools, Python voor pipelines, C# voor tooling.' },
        t6: { en:'Efficient workflows in DAWs for sound design and music.', pl:'Efektywne workflow w DAW‑ach dla sound designu i muzyki.', nl:'Efficiënte workflows in DAW’s voor sounddesign en muziek.' },
        t7: { en:'DSP, GUI, and performance optimization for real‑time audio.', pl:'DSP, GUI i optymalizacja wydajności dla dźwięku czasu rzeczywistego.', nl:'DSP, GUI en prestatie‑optimalisatie voor real‑time audio.' },
        // Education (left column)
        e1: { en:'Howest DAE — world‑class program in game development, with audio integration track.', pl:'Howest DAE — światowej klasy program z tworzenia gier ze ścieżką integracji audio.', nl:'Howest DAE — toonaangevend gamedevelopment‑programma met audio‑integratietrack.' },
        e2: { en:'Bilingual curriculum with emphasis on mathematics and physics.', pl:'Program dwujęzyczny z naciskiem na matematykę i fizykę.', nl:'Tweetalig curriculum met nadruk op wiskunde en natuurkunde.' },
        e3: { en:'Music theory and performance education in the first‑degree state music school.', pl:'Edukacja z teorii muzyki i wykonawstwa w państwowej szkole muzycznej I stopnia.', nl:'Opleiding in muziektheorie en uitvoering aan de stedelijke muziekschool (eerste graad).' }
      };
      const map = {
        edu_title: '#cv-section .col-6:nth-of-type(1) h4',
        skills_title: '#cv-section .col-6:nth-of-type(2) h4',
        edu_1: '#cv-section .col-6:nth-of-type(1) ul li:nth-of-type(1)',
        edu_2: '#cv-section .col-6:nth-of-type(1) ul li:nth-of-type(2)',
        edu_3: '#cv-section .col-6:nth-of-type(1) ul li:nth-of-type(3)',
        s1: '#cv-section .col-6:nth-of-type(2) ul li:nth-of-type(1)',
        s2: '#cv-section .col-6:nth-of-type(2) ul li:nth-of-type(2)',
        s3: '#cv-section .col-6:nth-of-type(2) ul li:nth-of-type(3)',
        s4: '#cv-section .col-6:nth-of-type(2) ul li:nth-of-type(4)',
        s5: '#cv-section .col-6:nth-of-type(2) ul li:nth-of-type(5)',
        s6: '#cv-section .col-6:nth-of-type(2) ul li:nth-of-type(6)',
        s7: '#cv-section .col-6:nth-of-type(2) ul li:nth-of-type(7)'
      };
      Object.entries(map).forEach(([key, sel])=>{
        const el=document.querySelector(sel); if(!el) return; const val=(CV[key]||{})[lang]; if(!val) return; if(/^<.*>/.test(val)) el.innerHTML=val; else el.textContent=val;
      });

      // Ensure "More" chips exist after innerHTML replacements
      document.querySelectorAll('#cv-section .box [data-tip]').forEach((el)=>{
        // Translate tooltips (data-tip) and update opened drawer text
        const liIndex = (function(){
          const listItems = Array.from(el.parentNode.querySelectorAll(':scope > li'));
          return listItems.indexOf(el) + 1;
        })();
        if (el.closest('.col-6:nth-of-type(2)')){ // skills column (right)
          const mapTips = {1:'t1',2:'t2',3:'t3',4:'t4',5:'t5',6:'t6',7:'t7'};
          const key = mapTips[liIndex];
          if (key && CV_TIPS[key]) el.setAttribute('data-tip', CV_TIPS[key][lang] || CV_TIPS[key].en);
        } else if (el.closest('.col-6:nth-of-type(1)')) { // education (left)
          const mapEdu = {1:'e1',2:'e2',3:'e3'};
          const key = mapEdu[liIndex];
          if (key && CV_TIPS[key]) el.setAttribute('data-tip', CV_TIPS[key][lang] || CV_TIPS[key].en);
        }
        if (!el.querySelector('.cv-more-chip')){
          const chip = document.createElement('button'); chip.type='button'; chip.className='cv-more-chip';
          chip.innerHTML = '<span class="label">'+(I18N.more_label[lang]||'More')+'</span><span class="chev">▾</span>';
          el.appendChild(chip);
        }
        if (!el.nextElementSibling || !el.nextElementSibling.classList.contains('cv-drawer')){
          const drawer = document.createElement('div'); drawer.className='cv-drawer';
          const text = el.getAttribute('data-tip') || '';
          const url = el.getAttribute('data-tip-url');
          const inner = document.createElement('div'); inner.className='cv-drawer-inner';
          const textDiv = document.createElement('div'); textDiv.className='cv-drawer-text'; textDiv.textContent = text; inner.appendChild(textDiv);
          if (url && isSafeHttpUrl(url)){
            const a = document.createElement('a'); a.className='cv-drawer-link'; a.target='_blank'; a.rel='noopener noreferrer'; a.href = url; a.textContent = (I18N.learn_more[lang]||'Learn more →'); inner.appendChild(a);
          }
          drawer.appendChild(inner);
          el.parentNode.insertBefore(drawer, el.nextSibling);
        } else {
          // Update existing drawer content and link label
          const d = el.nextElementSibling;
          const t = d.querySelector('.cv-drawer-text'); if (t) t.textContent = el.getAttribute('data-tip')||'';
          const a = d.querySelector('.cv-drawer-link'); if (a) a.textContent = I18N.learn_more[lang]||'Learn more →';
        }
      });
    }

    // Projects Showcase (index)
    if (document.getElementById('projects-showcase')){
      // Home page title per language
      try { document.title = (lang==='pl'?'Igor Szuniewicz — Portfolio': lang==='nl'?'Igor Szuniewicz — Portfolio':'Igor Szuniewicz - Professional Portfolio'); } catch(_){ }
      const sh2 = document.querySelector('#projects-showcase h2'); if (sh2) sh2.textContent = I18N.showcase_title[lang];
      const sLead = document.querySelector('#projects-showcase header.major p');
      if (sLead) sLead.textContent = I18N.showcase_lead[lang];
      // Slider (titles + descriptions) - ORDER MUST MATCH HTML
      const sliderTexts = [
        { h:{en:'Not Today, Darling! — Game Audio', pl:'Not Today, Darling! — audio do gry', nl:'Not Today, Darling! — game‑audio'}, d:{en:'Retro-inspired audio implementation.', pl:'Retro-inspirowana implementacja audio.', nl:'Retro‑geïnspireerde audio‑implementatie.'}},
        { h:{en:'Most Recent Single', pl:'Najnowszy singiel', nl:'Meest recente single'}, d:{en:'Latest musical release.', pl:'Najnowsze wydawnictwo muzyczne.', nl:'Nieuwste muzikale release.'}},
        { h:{en:'Ray Animation Music Composition', pl:'Ray Animation — kompozycja muzyki', nl:'Ray Animation — muziekcompositie'}, d:{en:'Original score supporting narrative beats.', pl:'Oryginalna muzyka wspierająca narrację.', nl:'Originele score die het verhaal ondersteunt.'}},
        { h:{en:'Akantilado Animation Sound Design', pl:'Akantilado — sound design', nl:'Akantilado — sounddesign'}, d:{en:'Complete foley and ambience for 3D animation.', pl:'Kompletny foley i ambience do animacji 3D.', nl:'Volledige foley en sfeer voor 3D‑animatie.'}},
        { h:{en:'Amorak Sound Design', pl:'Amorak — sound design', nl:'Amorak — sounddesign'}, d:{en:'Soundscapes and character audio for animation.', pl:'Soundscapes i audio postaci do animacji.', nl:'Soundscapes en personage‑audio voor animatie.'}},
        { h:{en:'Pause & Deserve Horror Game', pl:'Pause & Deserve — gra grozy', nl:'Pause & Deserve — horror game'}, d:{en:'Horror game concept and audio design.', pl:'Koncepcja gry grozy i audio design.', nl:'Horror game concept en audio design.'}},
        { h:{en:'Richter Animation Sound Design', pl:'Richter — sound design', nl:'Richter — sounddesign'}, d:{en:'Sound design with minimal recording gear.', pl:'Sound design z minimalnym sprzętem nagraniowym.', nl:'Sounddesign met minimale opname‑apparatuur.'}},
        { h:{en:'Transientica: Beatbox-Controlled Rhythm Game', pl:'Transientica: Gra rytmiczna sterowana beatboxem', nl:'Transientica: Beatbox-gestuurde ritme game'}, d:{en:'Real-time ML classification with 45ms latency.', pl:'Klasyfikacja ML w czasie rzeczywistym z opóźnieniem 45ms.', nl:'Real-time ML classificatie met 45ms latentie.'}},
        { h:{en:'Interactive Music Design — Wwise Projects', pl:'Interaktywny design muzyki — projekty Wwise', nl:'Interactief muziekdesign — Wwise projecten'}, d:{en:'Adaptive audio systems with vertical layering.', pl:'Adaptacyjne systemy audio z warstwowaniem wertykalnym.', nl:'Adaptieve audiosystemen met verticale lagen.'}}
      ];
      const slides = document.querySelectorAll('#projects-showcase .slider .slide');
      slides.forEach((slide, i)=>{
        const t = sliderTexts[i]; if (!t) return;
        const h = slide.querySelector('h3'); if (h) h.textContent = (t.h[lang]||t.h.en);
        const p = slide.querySelector('.slide-description'); if (p) p.textContent = (t.d[lang]||t.d.en);
      });
      // Translate two highlighted project cards
      const m1 = document.querySelector('#projects-showcase .projects-grid article:nth-of-type(1)');
      if (m1){
        const h = m1.querySelector('h3'); if (h) h.textContent = (lang==='pl'?'Interactive Music Design — Projekty Wwise': lang==='nl'?'Interactive Music Design — Wwise-projecten':'Interactive Music Design — Wwise Projects');
        const p = m1.querySelector('p'); if (p) p.textContent = (lang==='pl'?'Adaptacyjne systemy audio z warstwowaniem wertykalnym, re-sekwencjonowaniem horyzontalnym i kontrolą parametrów w czasie rzeczywistym.': lang==='nl'?'Adaptieve audiosystemen met verticale gelaagdheid, horizontale resequencing en realtime parametercontrole.':'Adaptive audio systems with vertical layering, horizontal re-sequencing, and real-time parameter control.');
        const b = m1.querySelector('.actions .button.small'); if (b) b.textContent = (lang==='pl'?'Szczegóły': lang==='nl'?'Details':'Details');
      }
      const m2 = document.querySelector('#projects-showcase .projects-grid article:nth-of-type(2)');
      if (m2){
        const h = m2.querySelector('h3'); if (h) h.textContent = (lang==='pl'?'AudioQ — Profesjonalna wtyczka EQ': lang==='nl'?'AudioQ — Professionele EQ-plugin':'AudioQ — Professional EQ Plugin');
        const p = m2.querySelector('p'); if (p) p.textContent = (lang==='pl'?'Wysokiej jakości 8-pasmowy parametryczny EQ z analizatorem spektrum, zbudowany w C++ i frameworku JUCE.': lang==='nl'?'Hoogwaardige 8-bands parametrische EQ met spectrumanalyzer, gebouwd met C++ en JUCE-framework.':'High-quality 8-band parametric EQ with spectrum analyzer, built with C++ and JUCE framework.');
        const b = m2.querySelector('.actions .button.small'); if (b) b.textContent = (lang==='pl'?'Szczegóły': lang==='nl'?'Details':'Details');
      }
    }

    // Unified CTA section on index
    if (document.querySelector('.cta-unified')){
      const ctaH2 = document.querySelector('.cta-primary h2');
      if (ctaH2) ctaH2.textContent = I18N.cta_contact_title[lang];
      const ctaDesc = document.querySelector('.cta-primary p');
      if (ctaDesc) ctaDesc.textContent = I18N.cta_contact_desc[lang];
      const ctaExploreH3 = document.querySelector('.cta-links h3');
      if (ctaExploreH3) ctaExploreH3.textContent = I18N.cta_explore_title[lang];

      // Translate divider "or"
      const dividerSpan = document.querySelector('.cta-divider span');
      if (dividerSpan) dividerSpan.textContent = (lang==='pl' ? 'lub' : lang==='nl' ? 'of' : 'or');

      // Translate CTA cards
      document.querySelectorAll('.cta-card span').forEach(s => {
        const parent = s.closest('a');
        if (!parent) return;
        const href = parent.getAttribute('href');
        if (href.includes('projects')) s.textContent = I18N.cta_projects[lang];
        else if (href.includes('about')) s.textContent = I18N.cta_about[lang];
        else if (href.includes('music')) s.textContent = I18N.cta_music[lang];
        else if (href.includes('scholarly')) s.textContent = I18N.cta_scholarly[lang];
      });
    }

    // Footer
    const f = document.getElementById('footer');
    if (f){
      const heads = f.querySelectorAll('h3');
      heads.forEach(h=>{
        const t=h.textContent.trim().toLowerCase();
        if (/location|lokalizacja|locatie/.test(t)) h.textContent = I18N.footer_location[lang];
        if (/email|e-mail/.test(t)) h.textContent = I18N.footer_email[lang];
        if (/social/.test(t)) h.textContent = I18N.footer_social[lang];
        if (/quick access|qr/.test(t)) h.textContent = I18N.footer_qr_title[lang];
      });
      const qrHint = f.querySelector('#qr-code-container p'); if (qrHint) qrHint.textContent = I18N.footer_qr_hint[lang];
    }

    // 3D Environments project page translations
    if (location.pathname.endsWith('/environments.html') || location.pathname.endsWith('environments.html')){
      const ENV = {
        env_title: { en: '3D Environments', pl: 'Środowiska 3D', nl: '3D-omgevingen' },
        env_tagline: { en: 'Interior design, architectural modeling and realistic material creation.', pl: 'Projektowanie wnętrz, modelowanie architektoniczne i tworzenie realistycznych materiałów.', nl: 'Interieurontwerp, architecturale modellering en realistische materiaalontwikkeling.' },
        env_meta_software: { en: 'Software: Blender 3D', pl: 'Oprogramowanie: Blender 3D', nl: 'Software: Blender 3D' },
        env_meta_type: { en: 'Type: Interior Architecture', pl: 'Typ: Architektura wnętrz', nl: 'Type: Interieurarchitectuur' },
        env_meta_year: { en: 'Year: 2024', pl: 'Rok: 2024', nl: 'Jaar: 2024' },
        env_meta_style: { en: 'Style: Modern Realistic', pl: 'Styl: Nowoczesny realistyczny', nl: 'Stijl: Modern realistisch' },
        env_showcase_title: { en: 'Video Showcase', pl: 'Prezentacja wideo', nl: 'Video showcase' },
        env_video_hint: { en: '🎬 Watch showcase', pl: '🎬 Obejrzyj prezentację', nl: '🎬 Bekijk showcase' },
        env_about_title: { en: 'About the Project', pl: 'O projekcie', nl: 'Over het project' },
        env_about_desc: { en: 'This project showcases a modern interior design with realistic lighting and materials. Created in Blender 3D, the environment features detailed architectural elements, custom materials, and atmospheric lighting that brings the space to life.', pl: 'Ten projekt prezentuje nowoczesne wnętrze z realistycznym oświetleniem i materiałami. Stworzony w Blenderze 3D, środowisko charakteryzuje się szczegółowymi elementami architektonicznymi, niestandardowymi materiałami i atmosferycznym oświetleniem, które ożywia przestrzeń.', nl: 'Dit project toont een modern interieurontwerp met realistische verlichting en materialen. Gemaakt in Blender 3D, heeft de omgeving gedetailleerde architecturale elementen, aangepaste materialen en atmosferische verlichting die de ruimte tot leven brengt.' },
        env_modeling_title: { en: '3D Modeling', pl: 'Modelowanie 3D', nl: '3D-modellering' },
        env_modeling_1: { en: 'Architectural layout and structure design', pl: 'Układ architektoniczny i projektowanie struktury', nl: 'Architecturale indeling en structuurontwerp' },
        env_modeling_2: { en: 'Detailed furniture and decoration modeling', pl: 'Szczegółowe modelowanie mebli i dekoracji', nl: 'Gedetailleerde meubel- en decoratiemodellering' },
        env_modeling_3: { en: 'Optimized topology for rendering efficiency', pl: 'Zoptymalizowana topologia dla wydajności renderowania', nl: 'Geoptimaliseerde topologie voor renderingsefficiëntie' },
        env_materials_title: { en: 'Material Design', pl: 'Projektowanie materiałów', nl: 'Materiaalontwerp' },
        env_materials_1: { en: 'Realistic PBR materials with proper roughness', pl: 'Realistyczne materiały PBR z odpowiednią szorstkością', nl: 'Realistische PBR-materialen met juiste ruwheid' },
        env_materials_2: { en: 'Custom node setups for complex surfaces', pl: 'Niestandardowe konfiguracje węzłów dla złożonych powierzchni', nl: 'Aangepaste knooppuntinstellingen voor complexe oppervlakken' },
        env_materials_3: { en: 'Attention to detail in texture mapping', pl: 'Dbałość o szczegóły w mapowaniu tekstur', nl: 'Aandacht voor detail in textuurmapping' },
        env_lighting_title: { en: 'Lighting & Atmosphere', pl: 'Oświetlenie i atmosfera', nl: 'Verlichting en sfeer' },
        env_lighting_1: { en: 'Natural and artificial light balance', pl: 'Równowaga światła naturalnego i sztucznego', nl: 'Balans tussen natuurlijk en kunstlicht' },
        env_lighting_2: { en: 'Volumetric lighting effects', pl: 'Efekty oświetlenia wolumetrycznego', nl: 'Volumetrische verlichtingseffecten' },
        env_lighting_3: { en: 'Mood and atmosphere creation', pl: 'Tworzenie nastroju i atmosfery', nl: 'Creëren van sfeer en atmosfeer' },
        env_gallery_title: { en: 'Project Gallery', pl: 'Galeria projektu', nl: 'Projectgalerij' },
        env_node_badge: { en: 'Material Node', pl: 'Węzeł materiału', nl: 'Materiaalknoop' },
        env_all_projects: { en: 'All Projects', pl: 'Wszystkie projekty', nl: 'Alle projecten' }
      };
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (ENV[key] && ENV[key][lang]) {
          el.textContent = ENV[key][lang];
        }
      });
    }

    // Ray Animation page translations
    if (location.pathname.endsWith('/ray-animation.html') || /ray-animation\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Animacja Ray — Kompozycja muzyki — Igor Szuniewicz': lang==='nl'?'Ray Animation — Muziekcompositie — Igor Szuniewicz':'Ray Animation — Music Composition — Igor Szuniewicz'); } catch(_){}
    }

    // Amorak page translations
    if (location.pathname.endsWith('/amorak.html') || /amorak\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Amorak — Sound Design — Igor Szuniewicz': lang==='nl'?'Amorak — Sounddesign — Igor Szuniewicz':'Amorak — Sound Design — Igor Szuniewicz'); } catch(_){}
    }

    // Akantilado page translations
    if (location.pathname.endsWith('/akantilado.html') || /akantilado\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Akantilado — Sound Design — Igor Szuniewicz': lang==='nl'?'Akantilado — Sounddesign — Igor Szuniewicz':'Akantilado — Sound Design — Igor Szuniewicz'); } catch(_){}
    }

    // Pause & Deserve page translations
    if (location.pathname.endsWith('/pause-and-deserve.html') || /pause-and-deserve\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Pause & Deserve — Gra grozy solo — Igor Szuniewicz': lang==='nl'?'Pause & Deserve — Solo horrorgame — Igor Szuniewicz':'Pause & Deserve — Solo Horror Game — Igor Szuniewicz'); } catch(_){}
    }

    // Richter page translations
    if (location.pathname.endsWith('/richter.html') || /richter\.html$/i.test(location.pathname)){
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (I18N[key]) {
          el.textContent = I18N[key][lang];
        }
      });
      // Page <title>
      try { document.title = (lang==='pl'?'Richter — Sound Design — Igor Szuniewicz': lang==='nl'?'Richter — Sounddesign — Igor Szuniewicz':'Richter — Sound Design — Igor Szuniewicz'); } catch(_){}
    }
  }

  // (removed) duplicate contact translations block that referenced undefined 'lang'

  function showLangToast(lang){
    const text = { pl: I18N.toast_switched.pl, nl: I18N.toast_switched.nl, en: I18N.toast_switched.en }[lang] || 'Language changed';
    toast.textContent = text;
    toast.classList.add('visible');
    setTimeout(()=> toast.classList.remove('visible'), 1600);
  }
  function setLang(l, opts){
    const silent = opts && opts.silent;
    localStorage.setItem(LANG_KEY,l);
    if (label) label.textContent = l.toUpperCase();
    if (toggleBtn) {
      const lf = toggleBtn.querySelector('.lang-flag');
      if (lf) lf.textContent = (l==='nl'?'🇧🇪': l==='en'?'🇬🇧':'🇵🇱');
    }
    document.documentElement.setAttribute('lang', l);
    document.documentElement.dataset.lang = l;
    translatePage(l);
    if (!silent) showLangToast(l);
    // update badge
    const c = l.toUpperCase();
    langBadge.innerHTML = '<span class="flag" style="display:inline-block;vertical-align:middle">'+flagSvg(l)+'</span><span class="code">'+c+'</span>';
    syncActive();
  }
  {
    const current = localStorage.getItem(LANG_KEY) || 'en';
    setLang(current, { silent: true });
  }
  if (toggleBtn && menu){
    toggleBtn.addEventListener('click', (e)=>{ e.preventDefault(); document.querySelector('.lang-switch').classList.toggle('open'); menu.style.display = menu.style.display==='block'?'none':'block'; });
    menu.addEventListener('click', (e)=>{
      if(!e.target || !e.target.closest) return;
      const btn = e.target.closest('button[data-lang]'); if (!btn) return; setLang(btn.getAttribute('data-lang')); document.querySelector('.lang-switch').classList.remove('open');
      menu.style.display='none';
    });
    document.addEventListener('click', (e)=>{ if(!e.target || !e.target.closest) return; if (!e.target.closest('.lang-switch')){ document.querySelector('.lang-switch').classList.remove('open'); menu.style.display='none'; } });
  }

  // Inline menu: highlight active and switch directly
  function syncActive(){
    const current=localStorage.getItem(LANG_KEY)||'en';
    // old dropdown (if exists)
    badgeMenu.querySelectorAll('button').forEach(btn=>{
      const on = btn.getAttribute('data-lang')===current;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    // fixed switcher
    const fixed = document.getElementById('lang-fixed');
    if (fixed){
      fixed.querySelectorAll('button').forEach(btn=>{
        const on = btn.getAttribute('data-lang')===current;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
  }
  badgeMenu.addEventListener('click', (e)=>{ if(!e.target || !e.target.closest) return; const b=e.target.closest('button[data-lang]'); if (!b) return; setLang(b.getAttribute('data-lang')); });
  const fixed = document.getElementById('lang-fixed');
  if (fixed){ fixed.addEventListener('click', (e)=>{ if(!e.target || !e.target.closest) return; const b=e.target.closest('button[data-lang]'); if (!b) return; setLang(b.getAttribute('data-lang')); }); }
  syncActive();
  // no dropdown behavior anymore

  // Social icons hover preview / tooltip (GitHub, LinkedIn, Spotify)
  (function(){
    const iconLinks = Array.from(document.querySelectorAll('#nav .icons a, #footer .icons a'));
    if (!iconLinks.length) return;
    const tip = document.createElement('div');
    tip.className='nav-tip';
    tip.style.cssText='position:fixed;z-index:2147483600;background:rgba(10,16,22,0.95);color:#e9f7ff;border:1px solid rgba(255,255,255,0.14);padding:6px 8px;border-radius:8px;font-size:.85rem;pointer-events:none;opacity:0;transform:translateY(-4px);transition:opacity .16s ease, transform .16s ease;box-shadow:0 8px 22px rgba(0,0,0,0.35)';
    document.body.appendChild(tip);
    function show(text, x, y){ tip.textContent=text; tip.style.left=(x+10)+'px'; tip.style.top=(y+12)+'px'; tip.style.opacity='1'; tip.style.transform='translateY(0)'; }
    function hide(){ tip.style.opacity='0'; tip.style.transform='translateY(-4px)'; }
    iconLinks.forEach(a=>{
      let label='';
      if (/github\.com/i.test(a.href)) label='GitHub — code & repos';
      else if (/linkedin\.com/i.test(a.href)) label='LinkedIn — profile & network';
      else if (/spotify\.com/i.test(a.href)) label='Spotify — artist page';
      if (!label) return;
      a.addEventListener('mouseenter', (e)=> show(label, e.clientX, e.clientY));
      a.addEventListener('mousemove', (e)=> show(label, e.clientX, e.clientY));
      a.addEventListener('mouseleave', hide);
    });
  })();

  // The "Different language?" nudge was removed as it was redundant.

  // Geo/locale based language suggestion (privacy‑friendly, fast, one‑time)
  (function(){
    const SUGG_KEY = 'lang-suggest-seen-v2';
    const force = /[?&]forceLangPrompt=1/i.test(location.search);
    if (!force && localStorage.getItem(SUGG_KEY)==='1') return;
    const current = localStorage.getItem(LANG_KEY) || 'en';
    // Decide preferred by browser first
    const navPref = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    const navLang = /^pl/i.test(navPref) ? 'pl' : /^nl|^nl-BE|^nl-NL/i.test(navPref) ? 'nl' : /^en/i.test(navPref) ? 'en' : '';
    const timeout = (ms, p)=> Promise.race([p, new Promise((_,rej)=> setTimeout(()=>rej(new Error('timeout')), ms))]);
    function fetchCountry(){
      try {
        return timeout(1200, fetch('https://ipapi.co/json/').then(r=> r.ok ? r.json() : null).then(j=> j && j.country_code ? j.country_code : null));
      } catch(_) { return Promise.resolve(null); }
    }
    function timeZoneCountry(){
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (/Europe\/Warsaw/i.test(tz)) return 'PL';
        if (/Europe\/(Brussels|Amsterdam|Luxembourg)/i.test(tz)) return 'BE';
        if (/Europe\/Amsterdam/i.test(tz)) return 'NL';
      } catch(_){}
      return null;
    }
    function decideTarget(country, nav){
      if (nav && nav!==current) return nav; // trust browser preference first
      const cc = (country||'').toUpperCase();
      if (cc==='PL') return 'pl';
      if (cc==='NL' || cc==='BE') return 'nl';
      return 'en';
    }
    const STR = {
      pl: { q:'Wykryto polskie ustawienia. Przełączyć na polski?', yes:'Tak', no:'Nie' },
      nl: { q:'Gedetecteerde NL/BE instellingen. Overschakelen naar Nederlands?', yes:'Ja', no:'Nee' },
      en: { q:'Detected your locale. Switch language?', yes:'Yes', no:'No thanks' }
    };
    function showPrompt(target){
      if (!target || target===current) return;
      // Compact glassy toast under fixed switcher
      const box = document.createElement('div');
      box.style.cssText='position:fixed;right:14px;top:104px;z-index:2147483647;background:rgba(10,16,22,0.88);backdrop-filter: blur(6px) saturate(1.2);color:#e9f7ff;border:1px solid rgba(255,255,255,0.14);padding:8px 10px;border-radius:12px;display:flex;gap:8px;align-items:center;box-shadow:0 10px 24px rgba(0,0,0,0.35);max-width:min(86vw,380px);font-size:.92rem;opacity:0;transform:translateY(-4px);transition:opacity .22s ease, transform .22s ease';
      const ico=document.createElement('span'); ico.textContent='🌐'; ico.style.cssText='font-size:1rem;opacity:.95'; box.appendChild(ico);
      const span=document.createElement('span'); span.textContent = STR[target]?.q || STR.en.q; span.style.cssText='font-weight:700;letter-spacing:.2px;'; box.appendChild(span);
      const yes=document.createElement('button'); yes.textContent=STR[target]?.yes||'Yes'; yes.style.cssText='margin-left:4px;background:#18bfef;color:#041018;border:0;border-radius:10px;padding:6px 10px;font-weight:800;cursor:pointer;'; box.appendChild(yes);
      const no=document.createElement('button'); no.textContent=STR[target]?.no||'No'; no.style.cssText='background:transparent;color:#e9f7ff;border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:6px 10px;font-weight:700;cursor:pointer;'; box.appendChild(no);
      document.body.appendChild(box);
      requestAnimationFrame(()=>{ box.style.opacity='1'; box.style.transform='translateY(0)'; });
      let hideT = setTimeout(fadeOut, 2400);
      function fadeOut(){ if (!box.isConnected) return; box.style.opacity='0'; box.style.transform='translateY(-4px)'; setTimeout(()=>{ box.remove(); }, 220); }
      box.addEventListener('mouseenter', ()=>{ if (hideT){ clearTimeout(hideT); hideT=null; } });
      box.addEventListener('mouseleave', ()=>{ if (!hideT) hideT=setTimeout(fadeOut, 1400); });
      const done=()=>{ localStorage.setItem(SUGG_KEY,'1'); fadeOut(); }
      yes.addEventListener('click', ()=>{ setLang(target); try{ if (typeof syncActive==='function') syncActive(); }catch(_){} done(); });
      no.addEventListener('click', done);
    }
    // Try browser first, then IP country quick check
    if (navLang && navLang!==current) { showPrompt(navLang); return; }
    fetchCountry().then(cc=>{
      const target = decideTarget(cc, navLang);
      if (target && target!==current){ showPrompt(target); }
    }).catch(()=>{
      const tz = timeZoneCountry();
      const target = decideTarget(tz, navLang);
      if (target && target!==current) showPrompt(target);
    });
  })();
});

// Desktop keyboard click sounds removed per request

