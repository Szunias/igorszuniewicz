document.addEventListener('DOMContentLoaded', function() {
  // Enable reveal only if JS loads
  document.body.classList.add('reveal-enabled');
  document.body.classList.add('page-enter');
  setTimeout(() => document.body.classList.remove('page-enter'), 420);

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
      setTimeout(() => { window.location.href = href; }, 340);
    });
  });
  // Interactive background glow tracking cursor
  const glow = document.createElement('div');
  glow.className = 'bg-glow';
  const grad = document.createElement('div');
  grad.className = 'bg-gradient';
  const orbs = document.createElement('div');
  orbs.className = 'bg-orbs';
  orbs.innerHTML = '<div class="orb blue" style="top:10%;left:8%"></div>'+
                   '<div class="orb cyan" style="top:60%;left:75%"></div>'+
                   '<div class="orb teal" style="top:75%;left:15%"></div>';
  // SVG waves
  const waves = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  waves.setAttribute('class', 'bg-waves');
  waves.setAttribute('viewBox', '0 0 1200 600');
  waves.setAttribute('preserveAspectRatio', 'none');
  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path1.setAttribute('fill', 'url(#gradWave1)');
  path1.setAttribute('opacity', '0.75');
  const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path2.setAttribute('fill', 'url(#gradWave2)');
  path2.setAttribute('opacity', '0.55');
  const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path3.setAttribute('fill', 'url(#gradWave3)');
  path3.setAttribute('opacity', '0.40');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const makeGrad = (id, c1, c2) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    g.setAttribute('id', id);
    g.setAttribute('x1', '0%'); g.setAttribute('x2', '100%'); g.setAttribute('y1', '0%'); g.setAttribute('y2', '0%');
    const a = document.createElementNS('http://www.w3.org/2000/svg', 'stop'); a.setAttribute('offset','0%'); a.setAttribute('stop-color', c1); a.setAttribute('stop-opacity','0.9');
    const b = document.createElementNS('http://www.w3.org/2000/svg', 'stop'); b.setAttribute('offset','100%'); b.setAttribute('stop-color', c2); b.setAttribute('stop-opacity','0.4');
    g.appendChild(a); g.appendChild(b); return g;
  };
  defs.appendChild(makeGrad('gradWave1', '#18bfef', '#58b6ff'));
  defs.appendChild(makeGrad('gradWave2', '#9a6cff', '#18bfef'));
  defs.appendChild(makeGrad('gradWave3', '#ff6ea9', '#9a6cff'));
  waves.appendChild(defs); waves.appendChild(path1); waves.appendChild(path2); waves.appendChild(path3);
  document.body.appendChild(grad);
  document.body.appendChild(orbs);
  document.body.appendChild(waves);
  // Equalizer bars
  const eq = document.createElement('canvas');
  eq.className = 'bg-eq';
  document.body.appendChild(eq);
  document.body.appendChild(glow);

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
        <div class="intro-title">IGOR SZUNIEWICZ</div>
        <div class="items">
          <img src="images/maxresdefault.jpg" style="top:2%;left:41%"/>
          <img src="images/project4.png" style="top:18%;left:74%"/>
          <img src="images/amorak.png" style="top:46%;left:80%"/>
          <img src="images/plugins.jpg" style="top:76%;left:62%"/>
          <img src="images/richter.png" style="top:78%;left:25%"/>
          <img src="images/project5.png" style="top:46%;left:10%"/>
          <img src="images/nottodaydar.png" style="top:16%;left:12%"/>
        </div>
        <div class="intro-sub">
          <span>Composer</span>
          <span>|</span>
          <span>Audio Engineer</span>
          <span>|</span>
          <span>Game Developer</span>
        </div>
      `;
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
  const ctx = eq.getContext('2d');
  function resizeCanvas(){ eq.width = window.innerWidth; eq.height = window.innerHeight; }
  resizeCanvas(); window.addEventListener('resize', resizeCanvas);

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
        const yy = 300 + Math.sin((i/1200)*Math.PI*freq + t*1.2 + phase)*amp;
        d += `L ${i} ${yy} `;
      }
      d += 'L 1200 600 L 0 600 Z';
      return d;
    }
    path1.setAttribute('d', build(amp1, 0, 4));
    path2.setAttribute('d', build(amp2, Math.PI/2, 5));
    path3.setAttribute('d', build(amp3, Math.PI, 6));
  }, { passive: true });

  // Render equalizer bars
  function renderEQ(){
    const t = performance.now() / 1000;
    const w = eq.width, h = eq.height;
    ctx.clearRect(0,0,w,h);
    const bars = Math.min(64, Math.floor(w / 20));
    const gap = Math.max(6, w/(bars*10));
    const bw = Math.max(8, (w - (bars-1)*gap) / bars);
    for(let i=0;i<bars;i++){
      const f = i/bars;
      const amp = 0.35 + 0.65*Math.abs(Math.sin(t*1.4 + f*4 + mouseX/20));
      const bh = (h*0.15) + (h*0.4)*amp + (mouseY/100)*20;
      const x = i*(bw+gap);
      const y = h - bh - 10;
      const grd = ctx.createLinearGradient(x, y, x, y+bh);
      grd.addColorStop(0, 'rgba(255,110,169,0.55)');
      grd.addColorStop(0.5,'rgba(154,108,255,0.55)');
      grd.addColorStop(1, 'rgba(24,191,239,0.55)');
      ctx.fillStyle = grd;
      ctx.fillRect(x, y, bw, bh);
      // reflection glow
      ctx.fillStyle = 'rgba(24,191,239,0.08)';
      ctx.fillRect(x, h-10, bw, 6);
    }
    requestAnimationFrame(renderEQ);
  }
  renderEQ();

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

