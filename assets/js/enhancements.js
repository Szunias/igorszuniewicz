document.addEventListener('DOMContentLoaded', function() {
  // Enable reveal only if JS loads
  document.body.classList.add('reveal-enabled');
  document.body.classList.add('page-enter');
  setTimeout(() => document.body.classList.remove('page-enter'), 180);
  // Ensure template preload overlay goes away even without theme JS
  document.body.classList.remove('is-preload');

  // Connection/motion heuristics for slow networks/devices
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(conn && conn.saveData);
  const slowNet = !!(conn && /(^2g$|^slow-2g$)/i.test(conn.effectiveType || ''));
  const prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const perfLite = saveData || slowNet || prefersReduced;
  if (perfLite) document.body.classList.add('perf-lite');

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
      try { el.style.setProperty('display','none','important'); } catch(_) {}
    });
    try { document.body.style.background = 'transparent'; } catch(_) {}
  }
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

  // Smooth page fade transitions
  // Intercept internal links and fade out before navigation
  const progress = document.createElement('div');
  progress.className = 'page-progress';
  document.body.appendChild(progress);

  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow new tab etc.
      e.preventDefault();
      progress.style.width = '35%';
      document.body.classList.add('page-exit');
      setTimeout(() => { progress.style.width = '70%'; }, 120);
      setTimeout(() => { window.location.href = href; }, 220);
    });
  });
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
  if (!perfLite && !orbs.parentNode) document.body.appendChild(orbs);
  if (!waves.parentNode) document.body.appendChild(waves); // keep waves (very light)
  // Equalizer bars
  let eq = document.querySelector('canvas.bg-eq'), ctx;
  if (!perfLite && !eq) {
    eq = document.createElement('canvas');
    eq.className = 'bg-eq';
    document.body.appendChild(eq);
  }
  document.body.appendChild(glow);

  // Visual audio-like ripple on clicks
  // Click ripple (forced on all pages, independent of perfLite)
  const clickFx = document.querySelector('.click-fx') || (()=>{ const d=document.createElement('div'); d.className='click-fx'; document.body.appendChild(d); return d; })();
  window.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    // Use viewport coordinates directly so ripples align with the cursor
    const baseX = e.clientX;
    const baseY = e.clientY;
    for (let i=0;i<3;i++){
      const node = document.createElement('span');
      node.className = 'ripple ' + (i===1?'r2': i===2?'r3':'');
      node.style.left = baseX + 'px';
      node.style.top = baseY + 'px';
      clickFx.appendChild(node);
      setTimeout(() => node.remove(), 900);
    }
  }, { passive: true });

  // Top piano-keys animation (replaces waveform). Hides on scroll; shows on homepage
  (function(){
    try {
      const wrap=document.createElement('div'); wrap.className='logo-audio'; document.body.appendChild(wrap);
      const svgNS='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(svgNS,'svg'); wrap.appendChild(svg);
      let keysWhite=[]; let keysBlack=[];
      const OCT_WHITE=7; const OCT_BLACK_PATTERN=[0,1,3,4,5];
      const octaves=2;
      function build(){
        const cssW=Math.min(window.innerWidth*0.9, 1400);
        const cssH=180; svg.style.width=cssW+'px'; svg.style.height=cssH+'px';
        svg.setAttribute('viewBox', '0 0 '+cssW+' '+cssH);
        svg.innerHTML=''; keysWhite=[]; keysBlack=[];
        const margin=16; const areaW=cssW - margin*2; const whiteCount=OCT_WHITE*octaves; const wW=areaW/whiteCount; const wH=cssH-26; const bW=wW*0.6; const bH=wH*0.62;
        // defs
        const defs=document.createElementNS(svgNS,'defs');
        const gradW=document.createElementNS(svgNS,'linearGradient'); gradW.setAttribute('id','kw'); gradW.setAttribute('x1','0'); gradW.setAttribute('y1','0'); gradW.setAttribute('x2','0'); gradW.setAttribute('y2','1'); gradW.innerHTML='<stop offset="0%" stop-color="#f7fbff"/><stop offset="100%" stop-color="#cfe6f3"/>';
        const gradB=document.createElementNS(svgNS,'linearGradient'); gradB.setAttribute('id','kb'); gradB.setAttribute('x1','0'); gradB.setAttribute('y1','0'); gradB.setAttribute('x2','0'); gradB.setAttribute('y2','1'); gradB.innerHTML='<stop offset="0%" stop-color="#0e1821"/><stop offset="100%" stop-color="#071018"/>';
        const holoGrad=document.createElementNS(svgNS,'linearGradient'); holoGrad.setAttribute('id','holo'); holoGrad.setAttribute('x1','0'); holoGrad.setAttribute('y1','0'); holoGrad.setAttribute('x2','1'); holoGrad.setAttribute('y2','0');
        holoGrad.innerHTML='<stop offset="0%" stop-color="#18bfef" stop-opacity="0"/><stop offset="50%" stop-color="#9a6cff" stop-opacity="0.55"/><stop offset="100%" stop-color="#ff6ea9" stop-opacity="0"/>';
        defs.appendChild(gradW); defs.appendChild(gradB); defs.appendChild(holoGrad); svg.appendChild(defs);
        // white keys
        for(let i=0;i<whiteCount;i++){
          const x=margin + i*wW; const r=document.createElementNS(svgNS,'rect');
          r.setAttribute('x',x); r.setAttribute('y',26); r.setAttribute('width',wW-2); r.setAttribute('height',wH);
          r.setAttribute('rx','4'); r.setAttribute('fill','url(#kw)'); r.setAttribute('stroke','rgba(17,40,60,0.35)'); r.setAttribute('stroke-width','1');
          r.style.transition='transform 120ms ease, filter 200ms ease';
          svg.appendChild(r); keysWhite.push(r);
      r.addEventListener('pointerenter', ()=> pressKey(r,false));
      r.addEventListener('pointerdown', ()=> pressKeyClick(r,false));
        }
        // black keys
        for(let oc=0; oc<octaves; oc++){
          OCT_BLACK_PATTERN.forEach(bp=>{
            const wi = oc*OCT_WHITE + bp; const x = margin + (wi+1)*wW - bW/2; const r=document.createElementNS(svgNS,'rect');
            r.setAttribute('x',x); r.setAttribute('y',26); r.setAttribute('width',bW); r.setAttribute('height',bH);
            r.setAttribute('rx','3'); r.setAttribute('fill','url(#kb)'); r.setAttribute('stroke','rgba(255,255,255,0.08)'); r.setAttribute('stroke-width','1');
            r.style.transition='transform 120ms ease, filter 200ms ease';
            svg.appendChild(r); keysBlack.push(r);
            r.addEventListener('pointerenter', ()=> pressKey(r,true));
            r.addEventListener('pointerdown', ()=> pressKeyClick(r,true));
          });
        }
        // holographic sweeping shine overlay
        const shine=document.createElementNS(svgNS,'rect');
        shine.setAttribute('x', String(margin-120)); shine.setAttribute('y','26'); shine.setAttribute('width','120'); shine.setAttribute('height', String(wH));
        shine.setAttribute('fill','url(#holo)'); shine.setAttribute('opacity','0.7'); svg.appendChild(shine);
        const anim=document.createElementNS(svgNS,'animate'); anim.setAttribute('attributeName','x'); anim.setAttribute('from', String(margin-120)); anim.setAttribute('to', String(margin+areaW)); anim.setAttribute('dur','6s'); anim.setAttribute('repeatCount','indefinite'); shine.appendChild(anim);
      }
      function pressKey(el, isBlack){
        if (!el) return; el.style.transform='translateY(3px)'; el.style.filter='drop-shadow(0 8px 18px rgba(24,191,239,0.35))';
        setTimeout(()=>{ el.style.transform=''; el.style.filter=''; }, 160);
      }
      function pressKeyClick(el, isBlack){
        if (!el) return;
        // Stronger press + brighter glow
        el.style.transform='translateY(6px)'; el.style.filter='drop-shadow(0 14px 36px rgba(24,191,239,0.75))';
        setTimeout(()=>{ el.style.transform=''; el.style.filter=''; }, 260);
        // Ripple circle
        const cx = parseFloat(el.getAttribute('x')) + parseFloat(el.getAttribute('width'))/2;
        const cy = parseFloat(el.getAttribute('y')) + (isBlack? parseFloat(el.getAttribute('height'))*0.7 : parseFloat(el.getAttribute('height'))*0.9);
        const circ = document.createElementNS(svgNS,'circle');
        circ.setAttribute('cx', String(cx)); circ.setAttribute('cy', String(cy)); circ.setAttribute('r','3');
        circ.setAttribute('fill','none'); circ.setAttribute('stroke','url(#holo)'); circ.setAttribute('stroke-width','3'); circ.setAttribute('opacity','1');
        svg.appendChild(circ);
        const a1=document.createElementNS(svgNS,'animate'); a1.setAttribute('attributeName','r'); a1.setAttribute('from','3'); a1.setAttribute('to','46'); a1.setAttribute('dur','520ms'); a1.setAttribute('fill','freeze');
        const a2=document.createElementNS(svgNS,'animate'); a2.setAttribute('attributeName','opacity'); a2.setAttribute('from','1'); a2.setAttribute('to','0'); a2.setAttribute('dur','520ms'); a2.setAttribute('fill','freeze');
        a2.addEventListener('endEvent', ()=> circ.remove());
        circ.appendChild(a1); circ.appendChild(a2); a1.beginElement(); a2.beginElement();
      }
      build(); window.addEventListener('resize', build);
      // random arpeggio
      let rndTimer=null; function start(){ if (rndTimer) return; rndTimer=setInterval(()=>{
        const pool = Math.random()<0.55 ? keysBlack : keysWhite; const el = pool[Math.floor(Math.random()*pool.length)]; pressKey(el, pool===keysBlack);
      }, 360);} function stop(){ if (rndTimer){ clearInterval(rndTimer); rndTimer=null; } }
      start();
      function onScroll(){ const y=window.scrollY||document.documentElement.scrollTop; const onHome=!!document.getElementById('projects-showcase'); const vis = onHome && y<140; wrap.classList.toggle('visible', vis); if(!vis) stop(); else start(); if (vis) wrap.style.pointerEvents='auto'; }
      onScroll(); window.addEventListener('scroll', onScroll, {passive:true}); window.addEventListener('pageshow', onScroll);
    } catch(e){ console && console.warn && console.warn('piano banner disabled', e); }
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

  let mouseX = 0, mouseY = 0;
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    mouseX = x; mouseY = y;
    glow.style.setProperty('--mx', x + '%');
    glow.style.setProperty('--my', y + '%');
    // animate waves like audio oscillation
    const t = performance.now() / 1000;
    const amp1 = 22 + (y/100)*10, amp2 = 30 + (x/100)*12, amp3 = 16 + ((x+y)/200)*8;
  const build = (amp, phase, freq) => {
      let d = 'M 0 300 ';
      for (let i=0;i<=1200;i+=20){
        const yy = 300 + Math.sin((i/1200)*Math.PI*freq + t*1.2 + phase)*amp + Math.sin((i/1200)*Math.PI*2 + t*0.4)*6;
        d += `L ${i} ${yy} `;
      }
      d += 'L 1200 600 L 0 600 Z';
      return d;
    }
    path1.setAttribute('d', build(amp1, 0, 4));
    path2.setAttribute('d', build(amp2, Math.PI/2, 5));
    path3.setAttribute('d', build(amp3, Math.PI, 6));
  }, { passive: true });

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
  if (!perfLite) renderEQ();

  document.addEventListener('visibilitychange', ()=>{
    if (document.hidden && rafId){ cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId && !perfLite) { renderEQ(); }
  });

  // Guard: avoid double init of backgrounds/previews on PJAX-like reloads
  if (window.__ui_initialized__) return; window.__ui_initialized__ = true;

  // Floating popover for CV tooltips (positioned via icon click)
  const pop = document.createElement('div'); pop.className='tip-popover';
  const popContent = document.createElement('div'); pop.appendChild(popContent);
  document.body.appendChild(pop);

  let popPinned = false; let lastPos={x:0,y:0};
  function showTip(target, x, y){
    const text = target.getAttribute('data-tip');
    const url = target.getAttribute('data-tip-url');
    if (!text){ hideTip(); return; }
    popContent.innerHTML = '';
    const span = document.createElement('div'); span.textContent = text; popContent.appendChild(span);
    if (url){ const a = document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener'; a.className='tip-action'; a.textContent='Learn more →'; popContent.appendChild(a); }
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

  // Replace popovers with smooth inline drawers
  document.querySelectorAll('#cv-section .box [data-tip]').forEach((el)=>{
    // create modern chip button instead of icon
    if (!el.querySelector('.cv-more-chip')){
      const chip = document.createElement('button');
      chip.type='button'; chip.className='cv-more-chip'; chip.setAttribute('aria-label','More info');
      chip.innerHTML = '<span class="label">More</span><span class="chev">▾</span>';
      el.appendChild(chip);
    }
    // create drawer
    if (!el.nextElementSibling || !el.nextElementSibling.classList.contains('cv-drawer')){
      const drawer = document.createElement('div');
      drawer.className='cv-drawer';
      const text = el.getAttribute('data-tip') || '';
      const url = el.getAttribute('data-tip-url');
      drawer.innerHTML = '<div class="cv-drawer-inner">'+
        '<div class="cv-drawer-text">'+ text +'</div>'+
        (url?'<a class="cv-drawer-link" target="_blank" rel="noopener" href="'+url+'">Learn more →</a>':'')+
        '</div>';
      el.parentNode.insertBefore(drawer, el.nextSibling);
    }
  });

  document.body.addEventListener('click', (e)=>{
    const chip = e.target.closest('.cv-more-chip');
    if (chip){
      const host = chip.closest('[data-tip]');
      const drawer = host.nextElementSibling && host.nextElementSibling.classList.contains('cv-drawer') ? host.nextElementSibling : null;
      if (drawer){ drawer.classList.toggle('open'); chip.classList.toggle('expanded'); }
      return;
    }
    if (!e.target.closest('.cv-drawer') && !e.target.closest('.cv-info-icon')){
      document.querySelectorAll('.cv-drawer.open').forEach(d=> d.classList.remove('open'));
    }
  }, true);

  // Nav: small preview for Projects link
  const navPrev = document.createElement('div'); navPrev.className='nav-preview'; navPrev.style.visibility='hidden';
  const base = location.pathname.includes('/projects/') ? '../' : '';
  navPrev.innerHTML = `
    <img src="${base}images/project5.png" alt="">
    <img src="${base}images/project4.png" alt="">
    <img src="${base}images/amorak.png" alt="">
    <img src="${base}images/plugins.jpg" alt="">
    <img src="${base}images/maxresdefault.jpg" alt="">
    <img src="${base}images/nottodaydar.png" alt="">
  `;
  document.body.appendChild(navPrev);
  const projectsLink = document.querySelector('#nav ul.links a[href*="projects/index.html"]');
  let prevTimer=null;
  function showNavPrev(){
    const rect = projectsLink.getBoundingClientRect();
    let x = rect.left; let y = rect.bottom + 10;
    navPrev.style.left = x + 'px'; navPrev.style.top = y + 'px';
    navPrev.style.transform = 'none';
    navPrev.style.visibility='visible';
    navPrev.classList.add('visible');
  }
  function hideNavPrev(){
    navPrev.classList.remove('visible'); navPrev.style.visibility='hidden';
  }
  if (projectsLink){
    projectsLink.addEventListener('pointerenter', ()=>{ prevTimer = setTimeout(showNavPrev, 140); });
    projectsLink.addEventListener('pointerleave', ()=>{ if (prevTimer){ clearTimeout(prevTimer); prevTimer=null; } hideNavPrev(); });
    window.addEventListener('scroll', hideNavPrev, { passive:true });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in-view'));
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
  // Hint near the badge on first visit
  try {
    const seenHint = localStorage.getItem('lang-hint-seen');
    if (!seenHint) {
      const hint = document.createElement('div');
      hint.textContent = 'Click to switch language';
      hint.style.cssText='position:fixed;top:46px;right:16px;background:rgba(12,18,24,.9);color:#e9f7ff;border:1px solid rgba(255,255,255,.14);padding:6px 10px;border-radius:8px;font-size:.85rem;z-index:2147483647;box-shadow:0 8px 18px rgba(0,0,0,.3)';
      document.body.appendChild(hint);
      setTimeout(()=>{ hint.style.opacity='0'; hint.style.transition='opacity .4s'; setTimeout(()=>hint.remove(), 420); }, 2600);
      localStorage.setItem('lang-hint-seen','1');
    }
  } catch(_){}
  // Persistent language badge in top-right
  const badgeWrap = document.querySelector('.lang-badge-wrap') || (()=>{ const w=document.createElement('div'); w.className='lang-badge-wrap'; document.body.appendChild(w); return w; })();
  const langBadge = document.querySelector('.lang-badge') || (()=>{ const b=document.createElement('div'); b.className='lang-badge'; badgeWrap.appendChild(b); return b; })();
  const badgeMenu = document.querySelector('.lang-badge-menu') || (()=>{ const m=document.createElement('div'); m.className='lang-badge-menu'; badgeWrap.appendChild(m); return m; })();
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
    footer_location: { pl: 'Lokalizacja', nl: 'Locatie', en: 'Location' },
    footer_email: { pl: 'Email', nl: 'E-mail', en: 'Email' },
    footer_social: { pl: 'Linki społecznościowe i zawodowe', nl: 'Sociale & professionele links', en: 'Social & Professional Links' },
    footer_qr_title: { pl: 'Szybki dostęp (QR kod)', nl: 'Snelle toegang (QR-code)', en: 'Quick Access (QR Code)' },
    footer_qr_hint: { pl: 'Zeskanuj, aby szybko otworzyć to portfolio.', nl: 'Scan voor snelle toegang tot dit portfolio.', en: 'Scan for quick access to this portfolio.' },
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
    contact_reachout: { pl: 'Śmiało napisz z krótkim opisem. Lubię projekty łączące kreatywną wizję z rozwiązywaniem problemów technicznych.', nl: 'Stuur gerust een korte briefing. Ik werk graag aan projecten die creatieve intentie combineren met technische probleemoplossing.', en: 'Feel free to reach out with a short brief. I enjoy projects that combine creative intent with technical problem‑solving.' }
  };

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
    document.querySelectorAll('#nav a[href*="#projects-showcase"]').forEach(a=> a.textContent = I18N.nav_projects[lang]);

    // Index-specific headers
    // Intro block translations – apply only on homepage (has projects-showcase)
    if (document.getElementById('projects-showcase')){
      const introH2 = document.querySelector('#main > section.post header.major h2');
      if (introH2) introH2.textContent = I18N.intro_title[lang];
      const introLead = document.querySelector('#main > section.post header.major p');
      if (introLead) introLead.textContent = I18N.intro_lead[lang];
      const introP = document.querySelector('#main > section.post p:not(header p)');
      if (introP) introP.textContent = I18N.intro_paragraph[lang];
    }
    const cvH2 = document.querySelector('#cv-section header.major h2');
    if (cvH2) cvH2.textContent = I18N.cv_title[lang];
    const cvLead = document.querySelector('#cv-section header.major p');
    if (cvLead) cvLead.textContent = I18N.cv_lead[lang];

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

    // Extras page translations
    if (location.pathname.endsWith('/extras.html') || /extras\.html$/i.test(location.pathname)){
      const h2 = document.querySelector('#main header.major h2'); if (h2) h2.textContent = I18N.extras_title[lang];
      const lead = document.querySelector('#main header.major p'); if (lead) lead.textContent = I18N.extras_lead[lang];
      const a = document.querySelector('#main article h4 a'); if (a) a.textContent = I18N.extras_spotify_title[lang];
      const p2 = document.querySelector('#main article p'); if (p2) p2.textContent = I18N.extras_spotify_lead[lang];
      // Page <title>
      try { document.title = (lang==='pl'?'Aktywności dodatkowe — Igor Szuniewicz': lang==='nl'?'Extra‑curriculair — Igor Szuniewicz':'Extra-Curricular — Igor Szuniewicz'); } catch(_){}
    }

    // Contact page translations
    if (location.pathname.endsWith('/contact.html') || /contact\.html$/i.test(location.pathname)){
      const h2 = document.querySelector('#main header.major h2'); if (h2) h2.textContent = I18N.contact_title[lang];
      const lead = document.querySelector('#main header.major p'); if (lead) lead.textContent = I18N.contact_lead[lang];
      const box = document.querySelector('#main .box');
      if (box){
        const ps = box.querySelectorAll('p');
        if (ps[0]){ const strong = ps[0].querySelector('strong'); if (strong) strong.textContent = I18N.contact_email_label[lang] + ' '; }
        if (ps[1]){ const strong = ps[1].querySelector('strong'); if (strong) strong.textContent = I18N.contact_location_label[lang] + ' '; }
        if (ps[2]) ps[2].textContent = I18N.contact_reachout[lang];
      }
      // Page <title>
      try { document.title = (lang==='pl'?'Kontakt — Igor Szuniewicz': lang==='nl'?'Contact — Igor Szuniewicz':'Contact — Igor Szuniewicz'); } catch(_){ }
    }

    // CV section on homepage translations
    if (document.querySelector('#cv-section')){
      const CV = {
        edu_title: { en:'Education', pl:'Edukacja', nl:'Opleiding' },
        skills_title: { en:'Key Skills', pl:'Kluczowe umiejętności', nl:'Belangrijkste vaardigheden' },
        edu_1: { en:'<strong>Howest University of Applied Sciences, Digital Arts and Entertainment:</strong> Game Development - Game Sound Integration (Ongoing)', pl:'<strong>Howest University of Applied Sciences, Digital Arts and Entertainment:</strong> Game Development — Game Sound Integration (w trakcie)', nl:'<strong>Howest University of Applied Sciences, Digital Arts and Entertainment:</strong> Game Development — Game Sound Integration (lopend)' },
        edu_2: { en:'<strong>Bilingual Copernicus Highschool:</strong> Profile - Maths & Physics (Graduated)', pl:'<strong>Bilingual Copernicus Highschool:</strong> Profil — Matematyka i Fizyka (ukończone)', nl:'<strong>Bilingual Copernicus Highschool:</strong> Profiel — Wiskunde & Natuurkunde (afgestudeerd)' },
        s1: { en:'Sound Design & Implementation', pl:'Sound design i implementacja', nl:'Sounddesign & Implementatie' },
        s2: { en:'Music Composition & Production', pl:'Kompozycja i produkcja muzyki', nl:'Muziekcompositie & -productie' },
        s3: { en:'Audio Middleware: Wwise, FMOD', pl:'Middleware audio: Wwise, FMOD', nl:'Audio-middleware: Wwise, FMOD' },
        s4: { en:'Game Engines: Unreal Engine, Unity', pl:'Silniki: Unreal Engine, Unity', nl:'Game-engines: Unreal Engine, Unity' },
        s5: { en:'Programming: C++, Python, C#', pl:'Programowanie: C++, Python, C#', nl:'Programmeren: C++, Python, C#' },
        s6: { en:'DAWs: Reaper, Pro Tools, Logic Pro', pl:'DAWy: Reaper, Pro Tools, Logic Pro', nl:'DAW’s: Reaper, Pro Tools, Logic Pro' },
        s7: { en:'VST/Audio Plugin Development', pl:'Rozwój wtyczek VST/Audio', nl:'VST/Audio plug‑in ontwikkeling' }
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
        e2: { en:'Bilingual curriculum with emphasis on mathematics and physics.', pl:'Program dwujęzyczny z naciskiem na matematykę i fizykę.', nl:'Tweetalig curriculum met nadruk op wiskunde en natuurkunde.' }
      };
      const map = {
        edu_title: '#cv-section .col-6:nth-of-type(1) h4',
        skills_title: '#cv-section .col-6:nth-of-type(2) h4',
        edu_1: '#cv-section .col-6:nth-of-type(1) ul li:nth-of-type(1)',
        edu_2: '#cv-section .col-6:nth-of-type(1) ul li:nth-of-type(2)',
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
          const mapEdu = {1:'e1',2:'e2'};
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
          drawer.innerHTML = '<div class="cv-drawer-inner">'+
            '<div class="cv-drawer-text">'+ text +'</div>'+
            (url?'<a class="cv-drawer-link" target="_blank" rel="noopener" href="'+url+'">'+(I18N.learn_more[lang]||'Learn more →')+'</a>':'')+
            '</div>';
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
        { h:{en:'NotTodayDarling Implementation/Code', pl:'NotTodayDarling — implementacja/kod', nl:'NotTodayDarling — implementatie/code'}, d:{en:'Retro-inspired audio implementation for a narrative game.', pl:'Retro‑inspirowana implementacja audio do gry narracyjnej.', nl:'Retro‑geïnspireerde audio‑implementatie voor een verhalende game.'}},
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
      const btn = e.target.closest('button[data-lang]'); if (!btn) return; setLang(btn.getAttribute('data-lang')); document.querySelector('.lang-switch').classList.remove('open');
      menu.style.display='none';
    });
    document.addEventListener('click', (e)=>{ if (!e.target.closest('.lang-switch')){ document.querySelector('.lang-switch').classList.remove('open'); menu.style.display='none'; } });
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
  badgeMenu.addEventListener('click', (e)=>{ const b=e.target.closest('button[data-lang]'); if (!b) return; setLang(b.getAttribute('data-lang')); syncActive(); });
  const fixed = document.getElementById('lang-fixed');
  if (fixed){ fixed.addEventListener('click', (e)=>{ const b=e.target.closest('button[data-lang]'); if (!b) return; setLang(b.getAttribute('data-lang')); syncActive(); }); }
  syncActive();
  // no dropdown behavior anymore

  // One-time post-load nudge pointing to the language switcher (not during intro)
  (function(){
    const show = ()=>{
      if (!document.getElementById('projects-showcase')) return; // tylko na głównej
      const n=document.createElement('div'); n.className='lang-nudge';
      n.innerHTML='<span class="ico">🌍</span><span class="txt">Different language?</span><span class="arrow">↗</span>';
      badgeWrap.appendChild(n);
      requestAnimationFrame(()=> n.classList.add('show'));
      setTimeout(()=>{ n.classList.remove('show'); setTimeout(()=>n.remove(), 400); }, 2600);
    };
    window.addEventListener('load', ()=> setTimeout(show, 800));
  })();
});

document.addEventListener('DOMContentLoaded', function() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
  } else {
    // Fallback: show immediately
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in-view'));
  }
});

