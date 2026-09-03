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
if (window.matchMedia('(min-width: 768px)').matches && heroField) {
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
if (window.matchMedia('(min-width: 768px)').matches && glow) {
  window.addEventListener('mousemove', (e) => {
    glow.classList.add('active');
    gsap.to(glow, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power2.out' });
  });
  window.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

/* ---------- hero shapes slow drift on scroll ---------- */
gsap.to('.shape-a', { y: 120, scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 } });
gsap.to('.shape-b', { y: -80, scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 } });
gsap.to('.shape-c', { y: 60, scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 } });

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
