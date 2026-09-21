gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- nav scroll state ---------- */
const nav = document.getElementById('siteNav');
ScrollTrigger.create({
  start: 'top -80',
  end: 99999,
  onUpdate: (self) => {
    nav.classList.toggle('scrolled', self.scroll() > 80);
  }
});

/* ---------- mobile menu ---------- */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  mobileMenu.classList.toggle('flex');
});
document.querySelectorAll('#mobileMenu a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
  });
});

/* ---------- active nav link on scroll ---------- */
const navLinks = document.querySelectorAll('[data-nav]');
document.querySelectorAll('section[id]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 40%',
    end: 'bottom 40%',
    onToggle: (self) => {
      if (!self.isActive) return;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`);
      });
    }
  });
});

/* ---------- hero entrance ---------- */
gsap.to('.hero-reveal', {
  opacity: 1,
  y: 0,
  duration: 0.9,
  stagger: 0.12,
  ease: 'power3.out',
  delay: 0.2,
});

/* ---------- hero shape parallax (mouse) ---------- */
const heroField = document.querySelector('.hero-field');
const shapes = gsap.utils.toArray('.hero-shape');
if (!reduceMotion && window.matchMedia('(min-width: 768px)').matches && heroField) {
  heroField.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5);
    const y = (e.clientY / innerHeight - 0.5);
    shapes.forEach((shape, i) => {
      const depth = (i + 1) * 18;
      gsap.to(shape, { x: x * depth, y: y * depth, duration: 1.2, ease: 'power2.out' });
    });
  });
}

/* ---------- cursor glow ---------- */
const glow = document.getElementById('cursorGlow');
if (!reduceMotion && window.matchMedia('(min-width: 768px)').matches && glow) {
  window.addEventListener('mousemove', (e) => {
    glow.classList.add('active');
    gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power2.out' });
  });
  window.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

/* ---------- hero shapes slow drift on scroll ---------- */
if (!reduceMotion) {
  gsap.to('.shape-a', { y: 120, scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to('.shape-b', { y: -80, scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.to('.shape-c', { y: 60, scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 } });
}

/* ---------- generic reveal-up for every section ---------- */
gsap.utils.toArray('.reveal-up').forEach((el) => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none reverse',
    },
  });
});

/* ---------- staggered children reveal for grids/lists ---------- */
[
  '#experience .exp-list li',
  '#skills .chip',
  '#projects .project-card',
].forEach((sel) => {
  const items = gsap.utils.toArray(sel);
  if (!items.length) return;
  gsap.set(items, { opacity: 0, y: 14 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }),
    once: true,
  });
});

/* ---------- animated counters (ledger numbers) ---------- */
gsap.utils.toArray('.ledger-num').forEach((el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const obj = { val: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: target,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
      });
    },
  });
});

/* =========================================================
   LIVE CLOCK + STATUS — Asia/Kolkata, updates every second
   ========================================================= */
(function liveClock() {
  const clocks = [document.getElementById('localClock'), document.getElementById('localClock2')];
  const dots = [document.getElementById('statusDot'), document.getElementById('statusDot2')];
  const texts = [document.getElementById('statusText'), document.getElementById('statusText2')];

  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const hourFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false,
  });

  function tick() {
    const now = new Date();
    const timeStr = fmt.format(now);
    const hour = parseInt(hourFmt.format(now), 10);
    const online = hour >= 9 && hour < 21; // typical working/reachable window, IST

    clocks.forEach(c => { if (c) c.textContent = timeStr + ' IST'; });
    dots.forEach(d => { if (d) d.classList.toggle('online', online); });
    texts.forEach(t => { if (t) t.textContent = online ? 'Coimbatore, IN — usually online' : 'Coimbatore, IN — likely asleep'; });
  }

  tick();
  setInterval(tick, 30000);
})();

/* =========================================================
   DYNAMIC GITHUB DATA — profile stats, latest release, last-shipped
   Cached in localStorage (6h TTL) so repeat visits don't refetch,
   and every call degrades silently to the static fallback already
   printed in the HTML if the API is unreachable or rate-limited.
   ========================================================= */
(function githubData() {
  const CACHE_TTL = 6 * 60 * 60 * 1000;

  function readCache(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { t, v } = JSON.parse(raw);
      if (Date.now() - t > CACHE_TTL) return null;
      return v;
    } catch (e) { return null; }
  }

  function writeCache(key, v) {
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch (e) { /* ignore */ }
  }

  async function getJSON(url, cacheKey) {
    const cached = readCache(cacheKey);
    if (cached) return cached;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('gh api ' + res.status);
    const data = await res.json();
    writeCache(cacheKey, data);
    return data;
  }

  function relativeTime(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const day = 86400000;
    const days = Math.floor(diffMs / day);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }

  // profile stats strip
  getJSON('https://api.github.com/users/naveenkumarvaradha', 'gh_user_cache_v1')
    .then((data) => {
      const repos = document.querySelector('[data-gh="repos"]');
      const followers = document.querySelector('[data-gh="followers"]');
      const since = document.querySelector('[data-gh="since"]');
      if (repos) repos.textContent = `${data.public_repos} public repos`;
      if (followers) followers.textContent = `${data.followers} followers`;
      if (since) since.textContent = `on GitHub since ${new Date(data.created_at).getFullYear()}`;
    })
    .catch(() => { /* keep static placeholders */ });

  // latest NaVault release, and repo last-pushed for the footer
  getJSON('https://api.github.com/repos/naveenkumarvaradha/naveenkumarvaradha.github.io', 'gh_repo_cache_v1')
    .then((data) => {
      const footer = document.getElementById('lastShipped');
      if (footer && data.pushed_at) {
        footer.textContent = `Last shipped ${relativeTime(data.pushed_at)}.`;
      }
    })
    .catch(() => { /* keep static footer text */ });

  getJSON('https://api.github.com/repos/naveenkumarvaradha/naveenkumarvaradha.github.io/releases/latest', 'gh_release_cache_v1')
    .then((data) => {
      const badge = document.getElementById('navaultBadge');
      const card = document.getElementById('navaultCard');
      if (badge && data.tag_name) {
        badge.textContent = data.tag_name.replace(/^navault-/, '');
        if (data.published_at) badge.title = `Released ${relativeTime(data.published_at)}`;
      }
      if (card && data.html_url) card.href = data.html_url;
    })
    .catch(() => { /* keep static v0.2.0 badge */ });
})();

/* =========================================================
   COMMAND PALETTE — ⌘K / Ctrl+K / "/" to open, section jump + links
   ========================================================= */
(function commandPalette() {
  const palette = document.getElementById('palette');
  const input = document.getElementById('paletteInput');
  const results = document.getElementById('paletteResults');
  const openBtn = document.getElementById('paletteBtn');
  const closeEls = document.querySelectorAll('[data-palette-close]');

  const items = [
    { label: 'About', hint: 'section', action: () => go('#about') },
    { label: 'Experience', hint: 'section', action: () => go('#experience') },
    { label: 'Skills', hint: 'section', action: () => go('#skills') },
    { label: 'Projects', hint: 'section', action: () => go('#projects') },
    { label: 'Currently building', hint: 'section', action: () => go('#building') },
    { label: 'Education', hint: 'section', action: () => go('#education') },
    { label: 'Contact', hint: 'section', action: () => go('#contact') },
    { label: 'Download résumé', hint: 'pdf', action: () => open('assets/Naveenkumar_Varadharaj_Resume.pdf') },
    { label: 'Email — vnaveenkumar0802@gmail.com', hint: 'mailto', action: () => open('mailto:vnaveenkumar0802@gmail.com') },
    { label: 'GitHub', hint: 'external', action: () => open('https://github.com/naveenkumarvaradha') },
    { label: 'LinkedIn', hint: 'external', action: () => open('https://www.linkedin.com/in/naveenkumarvaradharaj/') },
    { label: 'Call — +91 99435 84370', hint: 'tel', action: () => open('tel:+919943584370') },
  ];

  let activeIndex = 0;
  let filtered = items;

  function go(hash) {
    document.querySelector(hash)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    closePalette();
  }
  function open(url) {
    window.open(url, url.startsWith('http') ? '_blank' : '_self');
    closePalette();
  }

  function render() {
    results.innerHTML = '';
    if (!filtered.length) {
      results.innerHTML = '<div class="palette-empty">No matches</div>';
      return;
    }
    filtered.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'palette-item' + (i === activeIndex ? ' active' : '');
      row.innerHTML = `<span>${item.label}</span><span class="p-hint">${item.hint}</span>`;
      row.addEventListener('click', () => item.action());
      row.addEventListener('mouseenter', () => { activeIndex = i; render(); });
      results.appendChild(row);
    });
  }

  function filter(q) {
    const query = q.trim().toLowerCase();
    filtered = !query ? items : items.filter(i => i.label.toLowerCase().includes(query));
    activeIndex = 0;
    render();
  }

  function openPalette() {
    palette.hidden = false;
    input.value = '';
    filter('');
    setTimeout(() => input.focus(), 10);
  }
  function closePalette() {
    palette.hidden = true;
  }

  openBtn?.addEventListener('click', openPalette);
  closeEls.forEach(el => el.addEventListener('click', closePalette));

  input?.addEventListener('input', (e) => filter(e.target.value));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); render(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
    if (e.key === 'Enter') { e.preventDefault(); filtered[activeIndex]?.action(); }
  });

  document.addEventListener('keydown', (e) => {
    const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
    } else if (e.key === '/' && !isTyping) {
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape' && !palette.hidden) {
      closePalette();
    }
  });
})();
