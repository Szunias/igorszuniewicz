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
  if (!isMobile) {
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

  // Intro overlay on first visit (session-based)
  try {
    const seen = sessionStorage.getItem('intro-seen');
    if (!seen) {
      document.body.classList.add('intro-lock');
      const overlay = document.createElement('div');
      overlay.className = 'intro-overlay';
      const ring = document.createElement('div');
      ring.className = 'intro-ring';
      ring.innerHTML = `
        <div class=\"intro-title\">IGOR SZUNIEWICZ</div>
        <div class=\"items icons\">
          <i class=\"icon solid fa-music\" style=\"top:2%;left:41%\"></i>
          <i class=\"icon solid fa-headphones\" style=\"top:18%;left:74%\"></i>
          <i class=\"icon solid fa-wave-square\" style=\"top:46%;left:80%\"></i>
          <i class=\"icon solid fa-sliders-h\" style=\"top:76%;left:62%\"></i>
          <i class=\"icon solid fa-microphone\" style=\"top:78%;left:25%\"></i>
          <i class=\"icon solid fa-compact-disc\" style=\"top:46%;left:10%\"></i>
          <i class=\"icon solid fa-guitar\" style=\"top:16%;left:12%\"></i>
        </div>
        <div class=\"intro-sub\">
          <span>Composer</span>
          <span>|</span>
          <span>Audio Engineer</span>
          <span>|</span>
          <span>Game Developer</span>
        </div>`;
      overlay.appendChild(ring);
      // During intro, temporarily elevate gradient behind overlay
      const introGrad = grad.cloneNode(true);
      introGrad.style.zIndex = '1000';
      document.body.appendChild(introGrad);
      document.body.appendChild(overlay);
      setTimeout(() => {
        overlay.classList.add('intro-fade');
        sessionStorage.setItem('intro-seen','1');
        setTimeout(() => { overlay.remove(); introGrad.remove(); document.body.classList.remove('intro-lock'); }, 900);
      }, 2200);
    }
  } catch(_) {}
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

  // Render equalizer bars (suspend when tab hidden or idle)
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
    const bars = Math.min(36, Math.floor(w / 32));
    const gap = Math.max(12, w/(bars*7));
    const bw = Math.max(4, (w - (bars-1)*gap) / bars);
    for(let i=0;i<bars;i++){
      const f = i/bars;
      const amp = 0.14 + 0.24*Math.abs(Math.sin(t*0.9 + f*3.0 + mouseX/40));
      const bh = (h*0.08) + (h*0.20)*amp + (mouseY/150)*10;
      const x = i*(bw+gap);
      const y = h - bh - 10;
      const grd = ctx.createLinearGradient(x, y, x, y+bh);
      grd.addColorStop(0, 'rgba(24,60,92,0.24)');
      grd.addColorStop(0.5,'rgba(18,50,82,0.20)');
      grd.addColorStop(1, 'rgba(12,36,68,0.16)');
      ctx.fillStyle = grd;
      ctx.fillRect(x, y, bw, bh);
      // subtle base line
      ctx.fillStyle = 'rgba(12,28,46,0.06)';
      ctx.fillRect(x, h-10, bw, 3);
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

  // Force all elements to be visible immediately (debugging CV images)
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in-view'));

  // Also force CV section specifically
  const cvSection = document.querySelector('#cv-section');
  if (cvSection) {
    cvSection.classList.add('in-view');
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
  // Persistent language badge in top-right
  const badgeWrap = document.querySelector('.lang-badge-wrap') || (()=>{ const w=document.createElement('div'); w.className='lang-badge-wrap'; document.body.appendChild(w); return w; })();
  const langBadge = document.querySelector('.lang-badge') || (()=>{ const b=document.createElement('div'); b.className='lang-badge'; badgeWrap.appendChild(b); return b; })();
  const badgeMenu = document.querySelector('.lang-badge-menu') || (()=>{ const m=document.createElement('div'); m.className='lang-badge-menu'; badgeWrap.appendChild(m); return m; })();
  // Do not reorder nav items dynamically to avoid confusing order changes
  // Fixed always-visible switcher (separate from old dropdown CSS)
  const fixedLang = document.getElementById('lang-fixed') || (function(){
    const box = document.createElement('div');
    box.id = 'lang-fixed';
    box.style.cssText = 'position:fixed;top:14px;right:14px;z-index:2147483647;display:flex;gap:8px;background:rgba(10,16,22,.92);border:1px solid rgba(255,255,255,.14);padding:6px;border-radius:999px;backdrop-filter:saturate(1.2) blur(4px)';
    const langs = ['en','pl','nl'];
    langs.forEach(l=>{
      const btn = document.createElement('button');
      btn.type='button'; btn.setAttribute('data-lang', l);
      const flagWrap = document.createElement('span');
      flagWrap.style.cssText='width:24px;height:16px;display:inline-flex;align-items:center;justify-content:center;';
      flagWrap.innerHTML = flagSvg(l);
      const label = document.createElement('span');
      label.textContent = l.toUpperCase();
      label.style.cssText='margin-left:6px;font-weight:800;letter-spacing:.2px;line-height:1;color:#e9f7ff;display:inline-block;';
      btn.appendChild(flagWrap);
      btn.appendChild(label);
      btn.style.cssText='display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:transparent;border:0;border-radius:999px;cursor:pointer;line-height:1;';
      box.appendChild(btn);
    });
    document.body.appendChild(box); return box; })();
  try { fixedLang.style.display='flex'; } catch(_){}

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
    // Capabilities (homepage)
    cap_title: { pl: 'Kompetencje', nl: 'Competenties', en: 'Capabilities' },
    cap_lead: { pl: 'Gotowe do produkcji audio i systemy interaktywne do gier i mediów.', nl: 'Productierijp audio en interactieve systemen voor games en media.', en: 'Production-ready audio and interactive systems for games and media.' },
    cap_game_h: { pl: 'Audio w grach', nl: 'Game‑audio', en: 'Game Audio' },
    cap_game_p: { pl: 'End‑to‑end: sound design, implementacja, miks. UE5/Unity, Wwise, FMOD.', nl: 'End‑to‑end: sounddesign, implementatie, mix. UE5/Unity, Wwise, FMOD.', en: 'End-to-end: sound design, implementation, mixing. UE5/Unity, Wwise, FMOD.' },
    cap_music_h: { pl: 'Muzyka interaktywna', nl: 'Interactieve muziek', en: 'Interactive Music' },
    cap_music_p: { pl: 'Adaptacyjne partytury, przejścia w czasie rzeczywistym, warstwy sterowane parametrami.', nl: 'Adaptieve scores, realtime overgangen, parameter‑gestuurde lagen.', en: 'Adaptive scores, real-time transitions, parameter-driven layers.' },
    cap_tools_h: { pl: 'Narzędzia audio', nl: 'Audio‑tools', en: 'Audio Tools' },
    cap_tools_p: { pl: 'DSP, wtyczki, narzędzia pipeline. C++/JUCE, C#, Python.', nl: 'DSP, plug‑ins, pipeline‑tools. C++/JUCE, C#, Python.', en: 'DSP, plug‑ins, pipeline utilities. C++/JUCE, C#, Python.' },
    cap_collab_h: { pl: 'Współpraca', nl: 'Samenwerking', en: 'Collaboration' },
    cap_collab_p: { pl: 'Jasna komunikacja, szybka iteracja, mierzalne rezultaty w produkcji.', nl: 'Heldere comms, snelle iteratie, meetbare resultaten onder productiedruk.', en: 'Clear comms, fast iteration, measurable results under production constraints.' },
    footer_location: { pl: 'Lokalizacja', nl: 'Locatie', en: 'Location' },
    footer_email: { pl: 'Email', nl: 'E-mail', en: 'Email' },
    footer_social: { pl: 'Linki społecznościowe i zawodowe', nl: 'Sociale & professionele links', en: 'Social & Professional Links' },
    footer_qr_title: { pl: 'Szybki dostęp (QR kod)', nl: 'Snelle toegang (QR-code)', en: 'Quick Access (QR Code)' },
    footer_qr_hint: { pl: 'Zeskanuj, aby szybko otworzyć to portfolio.', nl: 'Scan voor snelle toegang tot dit portfolio.', en: 'Scan for quick access to this portfolio.' },
    // Music page
    music_title: { en: 'Music Listening Room', pl: 'Muzyka — Pokój odsłuchowy', nl: 'Muziek — Luisterkamer' },
    music_lead: { en: 'Stream curated tracks, preview stems, and explore catalog.', pl: 'Słuchaj wybranych utworów, podglądaj stemsy i przeglądaj katalog.', nl: 'Stream geselecteerde tracks, bekijk stems en verken de catalogus.' },
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
    learn_more: { pl: 'Więcej →', nl: 'Meer →', en: 'Learn more →' },
    more_label: { pl: 'Więcej', nl: 'Meer', en: 'More' },
    // Extras page
    extras_title: { pl: 'Dodatkowe aktywności i muzyka', nl: 'Extra-curriculaire & Muziek', en: 'Extra-Curricular & Music' },
    extras_lead: { pl: 'Projekty pasji, wydania muzyczne i współprace.', nl: 'Passieprojecten, muziekuitgaven en samenwerkingen.', en: 'Passion projects, music releases, and collaborations.' },
    extras_spotify_title: { pl: 'Moja muzyka na Spotify', nl: 'Mijn muziek op Spotify', en: 'My Music on Spotify' },
    extras_spotify_lead: { pl: 'Wybrane utwory i wydania odzwierciedlające mój styl i kierunek brzmieniowy.', nl: 'Geselecteerde tracks en releases die mijn esthetiek en soundrichting weerspiegelen.', en: 'Selected tracks and releases reflecting my aesthetic and sound direction.' },
    // Contact page
    contact_title: { pl: 'Kontakt', nl: 'Contact', en: 'Contact' },
    contact_lead: { pl: 'Współpracujmy. Jestem otwarty na projekty i staże.', nl: 'Laten we samenwerken. Ik sta open voor projecten en stages.', en: 'Let’s collaborate. I’m open to project opportunities and internships.' },
    contact_email_label: { pl: 'Email:', nl: 'E‑mail:', en: 'Email:' },
    contact_location_label: { pl: 'Lokalizacja:', nl: 'Locatie:', en: 'Location:' },
    contact_reachout: { pl: 'Śmiało napisz z krótkim opisem. Lubię projekty łączące kreatywną wizję z rozwiązywaniem problemów technicznych.', nl: 'Stuur gerust een korte briefing. Ik werk graag aan projecten die creatieve intentie combineren met technische probleemoplossing.', en: 'Feel free to reach out with a short brief. I enjoy projects that combine creative intent with technical problem‑solving.' },
    // Not Today Darling page translations
    ntd_trailer_title: { pl: 'Trailer', nl: 'Trailer', en: 'Trailer' },
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
    ntd_grandma5_desc: { pl: 'Sroga ale sprawiedliwa', nl: 'Streng maar eerlijk', en: 'Stern but fair' }
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
    // Capabilities (homepage)
    (function translateCapabilities(){
      const capSection = document.getElementById('capabilities') || Array.from(document.querySelectorAll('section.post'))
        .find(s => /capabilities|kompetencje|competenties/i.test((s.querySelector('header.major h2')?.textContent||'')));
      if (!capSection) return;
      const h2 = capSection.querySelector('header.major h2'); if (h2) h2.textContent = I18N.cap_title[lang];
      const lead = capSection.querySelector('header.major p'); if (lead) lead.textContent = I18N.cap_lead[lang];
      const cards = capSection.querySelectorAll('.project-card');
      if (cards[0]) { const h=cards[0].querySelector('h3'); const p=cards[0].querySelector('p'); if (h) h.innerHTML = '<span class="icon solid fa-gamepad" aria-hidden="true"></span> '+I18N.cap_game_h[lang]; if (p) p.textContent = I18N.cap_game_p[lang]; }
      if (cards[1]) { const h=cards[1].querySelector('h3'); const p=cards[1].querySelector('p'); if (h) h.innerHTML = '<span class="icon solid fa-music" aria-hidden="true"></span> '+I18N.cap_music_h[lang]; if (p) p.textContent = I18N.cap_music_p[lang]; }
      if (cards[2]) { const h=cards[2].querySelector('h3'); const p=cards[2].querySelector('p'); if (h) h.innerHTML = '<span class="icon solid fa-tools" aria-hidden="true"></span> '+I18N.cap_tools_h[lang]; if (p) p.textContent = I18N.cap_tools_p[lang]; }
      if (cards[3]) { const h=cards[3].querySelector('h3'); const p=cards[3].querySelector('p'); if (h) h.innerHTML = '<span class="icon solid fa-users" aria-hidden="true"></span> '+I18N.cap_collab_h[lang]; if (p) p.textContent = I18N.cap_collab_p[lang]; }
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
      const labels = document.querySelectorAll('.row strong');
      if (labels[0]) labels[0].textContent = I18N.label_filter[lang];
      if (labels[1]) labels[1].textContent = I18N.label_sort[lang];
      const b = (sel,val)=>{ const el=document.querySelector(sel); if (el) el.textContent=val; };
      b('button[data-filter="all"]', I18N.filter_all[lang]);
      b('button[data-filter="music"]', I18N.filter_music[lang]);
      b('button[data-filter="sound-design"]', I18N.filter_sound[lang]);
      b('button[data-filter="game-audio"]', I18N.filter_gameaudio[lang]);
      const sel = document.getElementById('sort-select');
      if (sel){
        const opts = sel.options;
        if (opts[0]) opts[0].textContent = I18N.opt_newest[lang];
        if (opts[1]) opts[1].textContent = I18N.opt_oldest[lang];
        if (opts[2]) opts[2].textContent = I18N.opt_title_az[lang];
        if (opts[3]) opts[3].textContent = I18N.opt_title_za[lang];
      }

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
        // Ensure NTD logo image is used
        if (key==='NotTodayDarling'){
          const img = card.querySelector('img'); if (img) { img.setAttribute('data-src','../images/NotTodayGameLogo.png'); img.src = '../images/NotTodayGameLogo.png'; img.alt='Not Today, Darling!'; }
        }
      });
    }

    // Individual project pages (title/lead/sections)
    if (location.pathname.includes('/projects/')){
      const P = {
        amorak: {
          title: { en:'Amorak — Sound Design', pl:'Amorak — Sound design', nl:'Amorak — Sounddesign' },
          lead: { en:'Complete sound design for the 3D animation "Amorak".', pl:'Kompletny sound design do animacji 3D „Amorak”.', nl:'Volledig sounddesign voor de 3D‑animatie “Amorak”.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
        },
        'not-today-darling': {
          title: { en:'Not Today, Darling! — Game Audio', pl:'Not Today, Darling! — Audio do gry', nl:'Not Today, Darling! — Game‑audio' },
          lead: { en:'Retro‑inspired audio design and implementation for a narrative game.', pl:'Retro‑inspirowany sound design i implementacja do gry narracyjnej.', nl:'Retro‑geïnspireerd sounddesign en implementatie voor een verhalende game.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
        },
        akantilado: {
          title: { en:'Akantilado — Sound Design', pl:'Akantilado — Sound design', nl:'Akantilado — Sounddesign' },
          lead: { en:'Complete foley and ambience for 3D animation.', pl:'Kompletny foley i ambience do animacji 3D.', nl:'Complete foley en ambience voor 3D‑animatie.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
        },
        ray: {
          title: { en:'Ray — Music Composition', pl:'Ray — Kompozycja muzyki', nl:'Ray — Muziekcompositie' },
          lead: { en:'Original score supporting narrative beats.', pl:'Oryginalna muzyka wspierająca narrację.', nl:'Originele score die de narratieve beats ondersteunt.' },
          overview: { en:'Overview', pl:'Przegląd', nl:'Overzicht' },
          gallery: { en:'Gallery', pl:'Galeria', nl:'Galerij' },
          showcase: { en:'Showcase', pl:'Prezentacja', nl:'Showcase' }
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
        }
      };
      const path = location.pathname.split('/').pop().replace('.html','');
      const M = P[path];
      if (M){
        const h2 = document.querySelector('#main header.major h2'); if (h2) h2.textContent = M.title[lang] || M.title.en;
        const lead = document.querySelector('#main header.major p'); if (lead) lead.textContent = M.lead[lang] || M.lead.en;
        const labels = Array.from(document.querySelectorAll('#main h3#bgColor'));
        const order = ['overview','showcase','gallery'];
        labels.forEach((h3,idx)=>{ const key = order[idx]; if (key && M[key]) h3.textContent = M[key][lang] || M[key].en; });
        // Specific assets tweaks
        if (path==='not-today-darling'){
          const hero = document.querySelector('.image.main img'); if (hero){ hero.src='../images/NotTodayGameLogo.png'; hero.alt='Not Today, Darling!'; }
        }
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
        about_paragraph: { en:'I am an ambitious student at the intersection of audio and technology. My work combines composition, technical sound design, and real‑time systems. I strive to build tools and music systems that are expressive, robust, and production‑ready. I value clear communication, iterative prototyping, and measurable impact in games and media.', pl:'Jestem ambitnym studentem na styku audio i technologii. Łączę kompozycję, techniczny sound design i systemy czasu rzeczywistego. Tworzę narzędzia i systemy muzyczne, które są ekspresyjne, niezawodne i gotowe do produkcji. Cenię jasną komunikację, iteracyjne prototypowanie i mierzalny efekt w grach i mediach.', nl:'Ik ben een ambitieuze student op het snijvlak van audio en technologie. Ik combineer compositie, technisch sounddesign en real-time systemen. Ik bouw tools en muzieksystemen die expressief, robuust en production‑ready zijn. Ik hecht waarde aan duidelijke communicatie, iteratief prototypen en meetbare impact in games en media.' },
        about_edu_title: { en:'Education', pl:'Edukacja', nl:'Opleiding' },
        about_edu_1: { en:'<strong>Howest — Digital Arts and Entertainment</strong>: Game Development — Game Sound Integration (ongoing)', pl:'<strong>Howest — Digital Arts and Entertainment</strong>: Game Development — Game Sound Integration (w trakcie)', nl:'<strong>Howest — Digital Arts and Entertainment</strong>: Game Development — Game Sound Integration (lopend)' },
        about_edu_2: { en:'<strong>Bilingual Copernicus Highschool</strong>: Maths & Physics (graduated)', pl:'<strong>Bilingual Copernicus Highschool</strong>: Matematyka i Fizyka (ukończone)', nl:'<strong>Bilingual Copernicus Highschool</strong>: Wiskunde & Natuurkunde (afgestudeerd)' },
        about_comp_title: { en:'Competencies', pl:'Kompetencje', nl:'Competenties' },
        about_comp_1: { en:'Wwise / FMOD, Unreal Engine / Unity', pl:'Wwise / FMOD, Unreal Engine / Unity', nl:'Wwise / FMOD, Unreal Engine / Unity' },
        about_comp_2: { en:'DSP and VST development in C++', pl:'DSP i rozwój VST w C++', nl:'DSP en VST-ontwikkeling in C++' },
        about_comp_3: { en:'Music composition and production (Reaper, Pro Tools, Logic)', pl:'Kompozycja i produkcja muzyki (Reaper, Pro Tools, Logic)', nl:'Muziekcompositie en -productie (Reaper, Pro Tools, Logic)' },
        about_comp_4: { en:'Python and C# for tooling and pipelines', pl:'Python i C# do narzędzi i pipeline’ów', nl:'Python en C# voor tooling en pipelines' }
      };
      document.querySelectorAll('[data-i18n]').forEach(el=>{ const key=el.getAttribute('data-i18n'); const map=A[key]; if (!map) return; const val=map[lang]||map['en']; if (/^<.*>/.test(val)) el.innerHTML=val; else el.textContent=val; });
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
      // Replace NTD image to logo
      const ntdImg = document.querySelector('a[href="projects/not-today-darling.html"] img');
      if (ntdImg) { ntdImg.src = 'images/NotTodayGameLogo.png'; ntdImg.alt='Not Today, Darling!'; }
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
    // Contact page translations (current markup)
    if (location.pathname.endsWith('/contact.html') || /contact\.html$/i.test(location.pathname)){
      const h1 = document.querySelector('#main header.major h1'); if (h1) h1.textContent = (lang==='pl'?'Porozmawiajmy': lang==='nl'?'Laten we praten':'Let\u2019s Connect');
      const lead = document.querySelector('#main header.major p'); if (lead) lead.textContent = (lang==='pl'?'Napisz krótko, odpowiem w 24\u201348h.': lang==='nl'?'Stuur een bericht, ik antwoord binnen 24\u201348u.':'Drop a message, I reply within 24\u201348h.');
      const formCard = document.getElementById('contact-form-card');
      if (formCard){
        const h3 = formCard.querySelector('h3'); if (h3) h3.textContent = (lang==='pl'?'Szybka wiadomość': lang==='nl'?'Kort bericht':'Quick Message');
        const n = document.getElementById('cf-name'); if (n) n.setAttribute('placeholder', (lang==='pl'?'Twoje imię': lang==='nl'?'Je naam':'Your name'));
        const e = document.getElementById('cf-email'); if (e) e.setAttribute('placeholder', (lang==='pl'?'Email': lang==='nl'?'E‑mail':'Email'));
        const s = document.getElementById('cf-subject'); if (s) s.setAttribute('placeholder', (lang==='pl'?'Temat': lang==='nl'?'Onderwerp':'Subject'));
        const m = document.getElementById('cf-message'); if (m) m.setAttribute('placeholder', (lang==='pl'?'Twoja wiadomość': lang==='nl'?'Je bericht':'Your message'));
        const send = document.getElementById('cf-send'); if (send) send.textContent = (lang==='pl'?'Wyślij': lang==='nl'?'Versturen':'Send');
      }
      const direct = document.getElementById('contact-direct');
      if (direct){
        const h3 = direct.querySelector('h3'); if (h3) h3.textContent = (lang==='pl'?'Bezpośrednio': lang==='nl'?'Direct':'Direct');
        const labels = direct.querySelectorAll('p strong');
        if (labels[0]) labels[0].textContent = (lang==='pl'?'Email': lang==='nl'?'E‑mail':'Email');
        if (labels[1]) labels[1].textContent = (lang==='pl'?'Lokalizacja': lang==='nl'?'Locatie':'Location');
      }
      try { document.title = (lang==='pl'?'Kontakt — Igor Szuniewicz': lang==='nl'?'Contact — Igor Szuniewicz':'Contact — Igor Szuniewicz'); } catch(_){ }
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
      // Slider (titles + descriptions)
      const sliderTexts = [
        { h:{en:'Most Recent Single', pl:'Najnowszy singiel', nl:'Meest recente single'}, d:{en:'My latest musical release. Click to listen.', pl:'Mój najnowszy utwór. Kliknij, aby posłuchać.', nl:'Mijn nieuwste release. Klik om te luisteren.'}},
        { h:{en:'Ray Animation Music Composition', pl:'Ray Animation — kompozycja muzyki', nl:'Ray Animation — muziekcompositie'}, d:{en:'Original score for a dreamy character journey.', pl:'Oryginalna muzyka do onirycznej podróży bohatera.', nl:'Originele score voor een dromerige personagereis.'}},
        { h:{en:'Akantilado Animation Sound Design', pl:'Akantilado — sound design', nl:'Akantilado — sounddesign'}, d:{en:'Collaborative sound design for a 3D animation.', pl:'Współtworzony sound design do animacji 3D.', nl:'Samenwerking aan sounddesign voor een 3D‑animatie.'}},
        { h:{en:'Amorak Sound Design', pl:'Amorak — sound design', nl:'Amorak — sounddesign'}, d:{en:'Complete sound design for the 3D animation "Amorak".', pl:'Kompletny sound design do animacji 3D „Amorak”.', nl:'Volledig sounddesign voor de 3D‑animatie “Amorak”.'}},
        { h:{en:'Not Today, Darling! — Game Audio', pl:'Not Today, Darling! — audio do gry', nl:'Not Today, Darling! — game‑audio'}, d:{en:'Local‑multiplayer side‑scroller. Click to view on itch.io.', pl:'Lokalny multiplayer side‑scroller. Kliknij, aby zobaczyć na itch.io.', nl:'Lokale multiplayer side‑scroller. Klik om te bekijken op itch.io.'}},
        { h:{en:'Pause & Deserve Horror Game', pl:'Pause & Deserve — gra grozy', nl:'Pause & Deserve — horror game'}, d:{en:'Solo horror game development project.', pl:'Solowy projekt tworzenia gry grozy.', nl:'Solo‑project: ontwikkeling van een horror game.'}},
        { h:{en:'Richter Animation Sound Design', pl:'Richter — sound design', nl:'Richter — sounddesign'}, d:{en:'Sound Design for 3D animation using minimal recording gear.', pl:'Sound design do animacji 3D z użyciem minimalnego sprzętu.', nl:'Sounddesign voor 3D‑animatie met minimale opname‑gear.'}}
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
        const h = m1.querySelector('h3'); if (h) h.textContent = (lang==='pl'?'System muzyki dynamicznej (Wwise & UE5)': lang==='nl'?'Dynamisch muzieksysteem (Wwise & UE5)':'Dynamic Music System (Wwise & UE5)');
        const p = m1.querySelector('p'); if (p) p.textContent = (lang==='pl'?'Wwise + UE5: adaptacyjna muzyka z płynnymi przejściami i warstwami.': lang==='nl'?'Wwise + UE5: adaptieve muziek met soepele overgangen en lagen.':'Wwise + UE5: adaptive music with smooth transitions and layers.');
        const b = m1.querySelector('.actions .button.small'); if (b) b.textContent = (lang==='pl'?'Szczegóły': lang==='nl'?'Details':'Details');
      }
      const m2 = document.querySelector('#projects-showcase .projects-grid article:nth-of-type(2)');
      if (m2){
        const h = m2.querySelector('h3'); if (h) h.textContent = (lang==='pl'?'Zestaw wtyczek 3D Audio (VST)': lang==='nl'?'3D Audio Plugin Suite (VST)':'3D Audio Plugin Suite (VST Development)');
        const p = m2.querySelector('p'); if (p) p.textContent = (lang==='pl'?'Własne VST do audio 3D: HRTF, konwolucja, UI i C++.': lang==='nl'?'Eigen VST voor 3D-audio: HRTF, convolutie, UI en C++.':'Custom VST plugins for 3D audio: HRTF, convolution, UI, C++.');
        const b = m2.querySelector('.actions .button.small'); if (b) b.textContent = (lang==='pl'?'Szczegóły': lang==='nl'?'Details':'Details');
      }
    }

    // Explore More section on index
    if (document.querySelector('.explore-more')){
      const exH2 = document.querySelector('.explore-more header.major h2');
      if (exH2) exH2.textContent = lang==='pl' ? 'Zobacz więcej' : lang==='nl' ? 'Ontdek meer' : 'Explore More';
      const exLead = document.querySelector('.explore-more header.major p');
      if (exLead) exLead.textContent = I18N.explore_lead[lang];
      document.querySelectorAll('.explore-more a.button.primary').forEach(a=>{
        a.textContent = lang==='pl' ? 'Zobacz więcej' : lang==='nl' ? 'Ontdek meer' : 'Explore More';
      });
      document.querySelectorAll('.explore-more a .label, .explore-more a span').forEach(s=>{
        const t = s.textContent.trim().toLowerCase();
        if (/all|wszystkie|alle/.test(t)) s.textContent = lang==='pl' ? 'Wszystkie projekty' : lang==='nl' ? 'Alle projecten' : 'All Projects';
        if (/scholarly|naukowe|wetenschappelijk/.test(t)) s.textContent = lang==='pl' ? 'Naukowe' : lang==='nl' ? 'Wetenschappelijk' : 'Scholarly';
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
    badgeMenu.querySelectorAll('button').forEach(btn=>{ const on = btn.getAttribute('data-lang')===current; btn.classList.toggle('active', on); btn.style.background = on ? 'rgba(24,191,239,0.18)' : 'transparent'; });
    // fixed switcher
    const fixed = document.getElementById('lang-fixed');
    if (fixed){
      fixed.querySelectorAll('button').forEach(btn=>{
        const on = btn.getAttribute('data-lang')===current;
        btn.style.background = on ? 'rgba(24,191,239,0.22)' : 'transparent';
        btn.style.outline = on ? '1px solid rgba(24,191,239,0.45)' : 'none';
      });
    }
  }
  badgeMenu.addEventListener('click', (e)=>{ if(!e.target || !e.target.closest) return; const b=e.target.closest('button[data-lang]'); if (!b) return; setLang(b.getAttribute('data-lang')); syncActive(); });
  const fixed = document.getElementById('lang-fixed');
  if (fixed){ fixed.addEventListener('click', (e)=>{ if(!e.target || !e.target.closest) return; const b=e.target.closest('button[data-lang]'); if (!b) return; setLang(b.getAttribute('data-lang')); syncActive(); }); }
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

