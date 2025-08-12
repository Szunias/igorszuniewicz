document.addEventListener('DOMContentLoaded', function() {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.innerWidth <= 736);
  // Enable reveal only if JS loads
  document.body.classList.add('reveal-enabled');
  if (!isMobile) {
    document.body.classList.add('page-enter');
    setTimeout(() => document.body.classList.remove('page-enter'), 180);
  }
  // Ensure template preload overlay goes away even without theme JS
  document.body.classList.remove('is-preload');

  // Connection/motion heuristics for slow networks/devices
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(conn && conn.saveData);
  const slowNet = !!(conn && /(^2g$|^slow-2g$)/i.test(conn.effectiveType || ''));
  const prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const perfLite = saveData || slowNet || prefersReduced;
  const shouldRenderHeavy = !(perfLite || isMobile);
  if (perfLite) document.body.classList.add('perf-lite');
  if (isMobile) document.body.classList.add('perf-lite');

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
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // allow new tab etc.
        e.preventDefault();
        progress.style.width = '35%';
        document.body.classList.add('page-exit');
        setTimeout(() => { progress.style.width = '70%'; }, 100);
        const nav = () => { try { window.location.href = href; } catch(_) { location.assign(href); } };
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
  if (shouldRenderHeavy && !orbs.parentNode) document.body.appendChild(orbs);
  if (!waves.parentNode) document.body.appendChild(waves); // keep waves (very light)
  // Equalizer bars
  let eq = document.querySelector('canvas.bg-eq'), ctx;
  if (shouldRenderHeavy && !eq) {
    eq = document.createElement('canvas');
    eq.className = 'bg-eq';
    document.body.appendChild(eq);
  }
  document.body.appendChild(glow);

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
    const isInMusic = (node)=> !!(node && (node.closest('.music-page') || node.closest('#player-bar') || node.closest('#music-list')));
    // Click feedback
    document.addEventListener('click',(e)=>{
      const el=e.target.closest('a,button,.button,select,[role="button"],.slider-nav'); if(!el) return;
      if (isInMusic(el) || el.closest('.mi-play') || el.closest('.pb-btn')) return;
      blip(880,0.07,0.05);
    },{passive:true});
    // Toggle/select change
    document.addEventListener('change',(e)=>{ if(!e.target) return; if (isInMusic(e.target)) return; if(e.target.matches('select')||e.target.matches('input[type="checkbox"],input[type="radio"]')) blip(660,0.06,0.05); },{passive:true});
    // Hover subtle hint
    document.addEventListener('pointerenter',(e)=>{ const el=e.target.closest('a.button, .button, .slider-nav'); if(!el) return; if (isInMusic(el)) return; blip(1200,0.04,0.035); },true);
  })();

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

  // Neo-piano banner: gradient glass keys with shorter neon accidentals for clear piano feel
  if (!isMobile) (function(){
    try {
      const wrap=document.createElement('div'); wrap.className='logo-audio'; document.body.appendChild(wrap);
      const svgNS='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(svgNS,'svg'); wrap.appendChild(svg);
      let keys=[]; // white/long keys
      let accs=[]; // accidentals (short neon caps)
      let ordered=[]; // all rects ordered left->right (for wave)
      const keyCount=21; // multiple of 7 for proper pattern
      function size(){
        const cssW=Math.min(window.innerWidth*0.98, 1400);
        const cssH=240; svg.style.width=cssW+'px'; svg.style.height=cssH+'px';
        svg.setAttribute('viewBox','0 0 '+cssW+' '+cssH);
        svg.innerHTML=''; keys=[]; accs=[];
        const margin=24; const areaW=cssW - margin*2; const areaH=cssH - 40;
        const kW = areaW / keyCount; const kH = areaH; const yBase = 24;
        // defs
        const defs=document.createElementNS(svgNS,'defs');
        // palette gradients per key (slightly cooler cyan + deeper violet to match theme)
        const colors=['#18bfef','#4fb3ff','#7f6cff','#ff6ea9','#14d4e2'];
        for(let i=0;i<keyCount;i++){
          const g=document.createElementNS(svgNS,'linearGradient'); const id='kp'+i; g.setAttribute('id',id); g.setAttribute('x1','0'); g.setAttribute('y1','0'); g.setAttribute('x2','0'); g.setAttribute('y2','1');
          const c1=colors[i%colors.length]; const c2=colors[(i+2)%colors.length];
          g.innerHTML = '<stop offset="0%" stop-color="'+c1+'" stop-opacity="0.85"/><stop offset="100%" stop-color="'+c2+'" stop-opacity="0.35"/>';
          defs.appendChild(g);
        }
        const shine=document.createElementNS(svgNS,'linearGradient'); shine.setAttribute('id','shine'); shine.setAttribute('x1','0'); shine.setAttribute('y1','0'); shine.setAttribute('x2','1'); shine.setAttribute('y2','0');
        shine.innerHTML='<stop offset="0%" stop-color="#ffffff" stop-opacity="0"/><stop offset="50%" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>';
        const accG=document.createElementNS(svgNS,'linearGradient'); accG.setAttribute('id','acc'); accG.setAttribute('x1','0'); accG.setAttribute('y1','0'); accG.setAttribute('x2','1'); accG.setAttribute('y2','1');
        accG.innerHTML='<stop offset="0%" stop-color="#0fe3ff" stop-opacity="0.9"/><stop offset="100%" stop-color="#c96cff" stop-opacity="0.9"/>';
        const wave=document.createElementNS(svgNS,'linearGradient'); wave.setAttribute('id','wave'); wave.setAttribute('x1','0'); wave.setAttribute('y1','0'); wave.setAttribute('x2','1'); wave.setAttribute('y2','0');
        wave.innerHTML='<stop offset="0%" stop-color="#18bfef"/><stop offset="50%" stop-color="#9a6cff"/><stop offset="100%" stop-color="#ff6ea9"/>';
        defs.appendChild(shine); defs.appendChild(accG); defs.appendChild(wave); svg.appendChild(defs);
        // background glass rail
        const rail=document.createElementNS(svgNS,'rect'); rail.setAttribute('x',String(margin-12)); rail.setAttribute('y',String(yBase-10)); rail.setAttribute('width',String(areaW+24)); rail.setAttribute('height',String(kH+20)); rail.setAttribute('rx','16'); rail.setAttribute('fill','rgba(10,16,22,0.35)'); rail.setAttribute('stroke','rgba(255,255,255,0.08)'); svg.appendChild(rail);
        // keys
        for(let i=0;i<keyCount;i++){
          const x = margin + i*kW + 2; const r=document.createElementNS(svgNS,'rect');
          r.setAttribute('x',String(x)); r.setAttribute('y',String(yBase)); r.setAttribute('width',String(kW-4)); r.setAttribute('height',String(kH)); r.setAttribute('rx','10');
          r.setAttribute('fill','url(#kp'+i+')'); r.setAttribute('stroke','rgba(0,0,0,0.25)'); r.setAttribute('stroke-width','1');
          r.style.transition='transform 120ms ease, filter 200ms ease';
          svg.appendChild(r); keys.push(r); r.dataset.index=String(i);
          // soft hover
          r.addEventListener('pointerenter', ()=>{ r.style.transform='translateY(3px)'; r.style.filter='drop-shadow(0 12px 28px rgba(24,191,239,0.35))'; setTimeout(()=>{ r.style.transform=''; r.style.filter=''; }, 140); });
          // strong click
          r.addEventListener('pointerdown', (e)=>{ strongPress(r, e); });
        }
        // accidentals pattern per octave (after white indices 0,1,3,4,5)
        const pattern=[0,1,3,4,5]; const groups=Math.floor(keyCount/7);
        const bW = kW*0.56; const bH = kH*0.56; const yAcc = yBase + kH*0.08;
        for(let g=0; g<groups; g++){
          pattern.forEach(p=>{
            const base = g*7 + p; if (base>=keyCount-1) return;
            const cx = margin + (base+1)*kW; const x = cx - bW/2;
            const acc=document.createElementNS(svgNS,'rect');
            acc.setAttribute('x', String(x)); acc.setAttribute('y', String(yAcc)); acc.setAttribute('width', String(bW)); acc.setAttribute('height', String(bH)); acc.setAttribute('rx','8');
            acc.setAttribute('fill','url(#acc)'); acc.setAttribute('stroke','rgba(255,255,255,0.09)'); acc.style.transition='transform 120ms ease, filter 200ms ease';
            svg.appendChild(acc); accs.push(acc);
            acc.addEventListener('pointerenter', ()=>{ acc.style.transform='translateY(2px)'; acc.style.filter='drop-shadow(0 10px 22px rgba(24,191,239,0.5))'; setTimeout(()=>{ acc.style.transform=''; acc.style.filter=''; }, 130); });
            acc.addEventListener('pointerdown', (e)=>{ strongPress(acc, e, true); });
          });
        }
        // sweeping holographic shine across all keys
        const bar=document.createElementNS(svgNS,'rect'); bar.setAttribute('x',String(margin-180)); bar.setAttribute('y',String(yBase)); bar.setAttribute('width','180'); bar.setAttribute('height',String(kH)); bar.setAttribute('fill','url(#shine)'); bar.setAttribute('opacity','0.28'); svg.appendChild(bar);
        const anim=document.createElementNS(svgNS,'animate'); anim.setAttribute('attributeName','x'); anim.setAttribute('from',String(margin-180)); anim.setAttribute('to',String(margin+areaW)); anim.setAttribute('dur','6s'); anim.setAttribute('repeatCount','indefinite'); bar.appendChild(anim);

        // build ordered list for wave propagation
        ordered = [...keys, ...accs].sort((a,b)=> (parseFloat(a.getAttribute('x'))+parseFloat(a.getAttribute('width'))/2) - (parseFloat(b.getAttribute('x'))+parseFloat(b.getAttribute('width'))/2));
      }
      // WebAudio electric-piano like tone
      let audioCtx=null; const getCtx=()=>{ if(!audioCtx){ try{ audioCtx=new (window.AudioContext||window.webkitAudioContext)(); }catch(_){} } return audioCtx; };
      let pianoIR=null; function getPianoIR(c){
        if (pianoIR) return pianoIR;
        // Generate lightweight impulse (noise tail) to emulate room reverb
        const len = Math.floor(c.sampleRate * 0.9);
        const ir = c.createBuffer(2, len, c.sampleRate);
        for (let ch=0; ch<2; ch++){
          const data = ir.getChannelData(ch); let amp=1.0; for (let i=0;i<len;i++){ data[i] = (Math.random()*2-1) * amp; amp *= 0.9993; }
        }
        pianoIR = ir; return ir;
      }
      function cinematicPianoTone(freq){
        const c=getCtx(); if(!c) return; if (c.state==='suspended') { try{ c.resume(); }catch(_){} }
        const t=c.currentTime;
        // Sources: fundamental + gentle overtone (saw with lowpass) + click
        const o1=c.createOscillator(); o1.type='triangle'; o1.frequency.value=freq;
        const o2=c.createOscillator(); o2.type='sawtooth'; o2.frequency.value=freq*2;
        const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.setValueAtTime(9500,t); lp.Q.value=0.6;
        const gain=c.createGain(); const gain2=c.createGain();
        // filter sweep (hammer damping)
        lp.frequency.exponentialRampToValueAtTime(2200, t+0.45);
        // amplitude envelope: quick attack, musical decay
        const atk=0.003, dec=0.45, rel=0.35; const peak=0.26;
        gain.gain.setValueAtTime(0.0001,t); gain.gain.linearRampToValueAtTime(peak,t+atk); gain.gain.exponentialRampToValueAtTime(0.0006, t+atk+dec+rel);
        gain2.gain.setValueAtTime(0.09,t); gain2.gain.exponentialRampToValueAtTime(0.0006, t+0.18);
        // Click transient
        const noise=c.createBufferSource(); const nb=c.createBuffer(1, c.sampleRate*0.02, c.sampleRate); const nd=nb.getChannelData(0); for (let i=0;i<nd.length;i++){ nd[i]=(Math.random()*2-1)*Math.exp(-i/500); } noise.buffer=nb; const clickG=c.createGain(); clickG.gain.setValueAtTime(0.08,t); clickG.gain.exponentialRampToValueAtTime(0.0001,t+0.02);
        // Reverb
        const conv=c.createConvolver(); conv.buffer=getPianoIR(c); const revG=c.createGain(); revG.gain.value=0.18;
        // Wire graph
        o1.connect(lp); o2.connect(lp); lp.connect(gain); gain.connect(c.destination); gain.connect(conv).connect(revG).connect(c.destination);
        noise.connect(clickG).connect(c.destination);
        o1.start(t); o2.start(t); noise.start(t); o1.stop(t+atk+dec+rel+0.05); o2.stop(t+atk+dec+rel+0.05); noise.stop(t+0.03);
      }

      function keyIndexToFreq(i){
        // Map left-to-right semitone index to notes starting at C4
        const baseMidi=60; const midi=baseMidi + i;
        return 440*Math.pow(2,(midi-69)/12);
      }

      function strongPress(el, ev, isAcc){
        // minimal press + micro-shake
        el.style.transform='translateY(4px)'; el.style.filter='drop-shadow(0 10px 24px rgba(24,191,239,0.55))';
        setTimeout(()=>{ el.style.transform='translateY(0)'; el.style.filter=''; }, 160);
        // thin underline flash instead of big ring
        const x = parseFloat(el.getAttribute('x')); const y = parseFloat(el.getAttribute('y')); const w = parseFloat(el.getAttribute('width')); const h = parseFloat(el.getAttribute('height'));
        const line = document.createElementNS(svgNS,'rect'); line.setAttribute('x', String(x + w*0.15)); line.setAttribute('y', String(y + h - 6)); line.setAttribute('width', String(w*0.7)); line.setAttribute('height', '3'); line.setAttribute('rx','2'); line.setAttribute('fill','#9a6cff'); line.setAttribute('opacity','0.0'); line.style.pointerEvents='none';
        svg.appendChild(line);
        requestAnimationFrame(()=>{ line.style.transition='opacity 140ms ease, transform 240ms ease'; line.style.opacity='0.85'; line.style.transform='translateY(2px)'; setTimeout(()=>{ line.style.opacity='0'; setTimeout(()=> line.remove(), 200); }, 160); });
        // nudge neighbors subtelnie
        if (!isAcc && el.dataset && el.dataset.index){
          const i = parseInt(el.dataset.index,10); const left = keys[i-1]; const right = keys[i+1];
          [left,right].forEach(k=>{ if(!k) return; k.style.transform='translateY(2px)'; setTimeout(()=>{ k.style.transform=''; }, 120); });
        }
        // play tone for this key
        try{
          const idx = ordered.indexOf(el);
          const f = keyIndexToFreq(Math.max(0, idx)); cinematicPianoTone(f);
        }catch(_){}
        // propagate a soft color wave
        const cx = x + w/2; waveFrom(cx);
      }

      function waveFrom(centerX){
        const speed = 0.25; // ms per px (szybsza fala)
        ordered.forEach((r)=>{
          const rx = parseFloat(r.getAttribute('x')) + parseFloat(r.getAttribute('width'))/2;
          const ry = parseFloat(r.getAttribute('y'));
          const rw = parseFloat(r.getAttribute('width'));
          const rh = parseFloat(r.getAttribute('height'));
          const delay = Math.abs(rx - centerX) * speed;
          // multi-color sweeping gradient bar
          const bar = document.createElementNS(svgNS,'rect');
          bar.setAttribute('x', String(rx - rw/2)); bar.setAttribute('y', String(ry)); bar.setAttribute('width', String(rw)); bar.setAttribute('height', String(rh)); bar.setAttribute('rx', r.getAttribute('rx')||'8');
          bar.setAttribute('fill','url(#wave)'); bar.style.opacity='0'; bar.style.transition='opacity 160ms ease, transform 220ms ease'; bar.style.pointerEvents='none';
          bar.style.transform='translateY(0)'; svg.appendChild(bar);
          setTimeout(()=>{ bar.style.opacity='0.65'; bar.style.transform='translateY(1px)'; setTimeout(()=>{ bar.style.opacity='0'; setTimeout(()=> bar.remove(), 160); }, 140); }, delay);
        });
      }
      size(); window.addEventListener('resize', size);
      function onScroll(){
        const y=window.scrollY||document.documentElement.scrollTop; const onHome=!!document.getElementById('projects-showcase');
        const vis = onHome && y<140; wrap.classList.toggle('visible', vis);
        // ensure no click-blocking when hidden
        try { svg.style.pointerEvents = vis ? 'auto' : 'none'; } catch(_){}
      }
      onScroll(); window.addEventListener('scroll', onScroll, {passive:true}); window.addEventListener('pageshow', onScroll);
    } catch(e){ console && console.warn && console.warn('neo piano disabled', e); }
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
    <img src="${base}images/maxresdefault.jpg" alt="">
    <img src="${base}images/project4.png" alt="">
    <img src="${base}images/amorak.png" alt="">
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
    projectsLink.addEventListener('pointerenter', ()=>{ prevTimer = setTimeout(showNavPrev, 80); });
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
  // Ensure Music link exists in nav
  try {
    const navLinks = document.querySelector('#nav .links');
    if (navLinks && !navLinks.querySelector('a[href$="music.html"]')){
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = (location.pathname.includes('/projects/')?'../':'') + 'music.html';
      a.textContent = 'Music';
      li.appendChild(a);
      const schol = Array.from(navLinks.querySelectorAll('a')).find(x=>/scholarly\.html$/.test(x.getAttribute('href')||''));
      if (schol && schol.parentElement) navLinks.insertBefore(li, schol.parentElement);
      else navLinks.appendChild(li);
    }
  } catch(_){}
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
    footer_location: { pl: 'Lokalizacja', nl: 'Locatie', en: 'Location' },
    footer_email: { pl: 'Email', nl: 'E-mail', en: 'Email' },
    footer_social: { pl: 'Linki społecznościowe i zawodowe', nl: 'Sociale & professionele links', en: 'Social & Professional Links' },
    footer_qr_title: { pl: 'Szybki dostęp (QR kod)', nl: 'Snelle toegang (QR-code)', en: 'Quick Access (QR Code)' },
    footer_qr_hint: { pl: 'Zeskanuj, aby szybko otworzyć to portfolio.', nl: 'Scan voor snelle toegang tot dit portfolio.', en: 'Scan for quick access to this portfolio.' },
    // Music page
    music_title: { en: 'Music Listening Room', pl: 'Muzyka — Pokój odsłuchowy', nl: 'Muziek — Luisterkamer' },
    music_lead: { en: 'Stream curated tracks, preview stems, and explore catalog.', pl: 'Słuchaj wybranych utworów, podglądaj stemsy i przeglądaj katalog.', nl: 'Stream geselecteerde tracks, bekijk stems en verken de catalogus.' },
    music_sort: { en: 'Sort', pl: 'Sortuj', nl: 'Sorteren' },
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

  // One-time post-load nudge pointing to the language switcher (not during intro)
  (function(){
    const show = ()=>{
      if (!document.getElementById('projects-showcase')) return; // tylko na głównej
      // Skip if suggestion system already showed a prompt
      if (localStorage.getItem('lang-suggest-seen')==='1') return;
      const n=document.createElement('div'); n.className='lang-nudge';
      n.innerHTML='<span class="ico">🌍</span><span class="txt">Different language?</span><span class="arrow">↗</span>';
      badgeWrap.appendChild(n);
      requestAnimationFrame(()=> n.classList.add('show'));
      setTimeout(()=>{ n.classList.remove('show'); setTimeout(()=>n.remove(), 400); }, 2200);
    };
    window.addEventListener('load', ()=> setTimeout(show, 800));
  })();

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

// Desktop keyboard click sounds removed per request

