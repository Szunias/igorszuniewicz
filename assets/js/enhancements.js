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
  path1.setAttribute('fill', 'url(#gradWave)');
  path1.setAttribute('opacity', '0.6');
  const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path2.setAttribute('fill', 'url(#gradWave)');
  path2.setAttribute('opacity', '0.35');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const lg = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  lg.setAttribute('id', 'gradWave');
  lg.setAttribute('x1', '0%'); lg.setAttribute('x2', '100%'); lg.setAttribute('y1', '0%'); lg.setAttribute('y2', '0%');
  const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop'); s1.setAttribute('offset','0%'); s1.setAttribute('stop-color','#18bfef'); s1.setAttribute('stop-opacity','0.6');
  const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop'); s2.setAttribute('offset','100%'); s2.setAttribute('stop-color','#58b6ff'); s2.setAttribute('stop-opacity','0.2');
  lg.appendChild(s1); lg.appendChild(s2); defs.appendChild(lg);
  waves.appendChild(defs); waves.appendChild(path1); waves.appendChild(path2);
  document.body.appendChild(grad);
  document.body.appendChild(orbs);
  document.body.appendChild(waves);
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
  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    glow.style.setProperty('--mx', x + '%');
    glow.style.setProperty('--my', y + '%');
    // animate waves like audio oscillation
    const t = performance.now() / 1000;
    const amp1 = 18 + (y/100)*8, amp2 = 26 + (x/100)*10;
    const build = (amp, phase) => {
      let d = 'M 0 300 ';
      for (let i=0;i<=1200;i+=20){
        const yy = 300 + Math.sin((i/1200)*Math.PI*4 + t*1.2 + phase)*amp;
        d += `L ${i} ${yy} `;
      }
      d += 'L 1200 600 L 0 600 Z';
      return d;
    }
    path1.setAttribute('d', build(amp1, 0));
    path2.setAttribute('d', build(amp2, Math.PI/2));
  }, { passive: true });

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

