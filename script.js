gsap.registerPlugin(ScrollTrigger);

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

/* ---------- nav recolors over dark (navy) sections ---------- */
document.querySelectorAll('[data-dark-nav]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 90px',
    end: 'bottom 90px',
    onToggle: (self) => nav.classList.toggle('on-dark', self.isActive),
  });
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

/* ---------- active nav link + sliding pill ---------- */
const navLinks = document.querySelectorAll('[data-nav]');
const pillNav = document.getElementById('pillNav');
const navGlow = document.getElementById('navPillGlow');

function moveGlowTo(link) {
  if (!link || !pillNav || !navGlow) return;
  const navRect = pillNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  navGlow.style.opacity = '1';
  navGlow.style.width = linkRect.width + 'px';
  navGlow.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
}

document.querySelectorAll('section[id]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 40%',
    end: 'bottom 40%',
    onToggle: (self) => {
      if (!self.isActive) return;
      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${section.id}`;
        link.classList.toggle('active', isActive);
        if (isActive && link.classList.contains('pill-link')) moveGlowTo(link);
      });
    }
  });
});

window.addEventListener('resize', () => {
  const active = document.querySelector('.pill-link.active');
  if (active) moveGlowTo(active);
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

/* ---------- animated counters ---------- */
gsap.utils.toArray('.stat-num').forEach((el) => {
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

/* ---------- text scramble on scroll into view ---------- */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function scrambleInto(el, finalText, duration = 600) {
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const revealCount = Math.floor(progress * finalText.length);
    let out = '';
    for (let i = 0; i < finalText.length; i++) {
      if (i < revealCount) out += finalText[i];
      else if (finalText[i] === ' ') out += ' ';
      else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  requestAnimationFrame(frame);
}
document.querySelectorAll('[data-scramble]').forEach((el) => {
  const finalText = el.dataset.scramble;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => scrambleInto(el, finalText),
  });
});

/* ---------- hero illustration gentle mouse parallax ---------- */
const illusPanel = document.querySelector('.illus-panel');
if (window.matchMedia('(min-width: 768px)').matches && illusPanel) {
  illusPanel.addEventListener('mousemove', (e) => {
    const rect = illusPanel.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(illusPanel, { rotateY: x * 4, rotateX: -y * 4, duration: 0.6, ease: 'power2.out', transformPerspective: 800 });
  });
  illusPanel.addEventListener('mouseleave', () => {
    gsap.to(illusPanel, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power2.out' });
  });
}
