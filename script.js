/* ==========================================================================
   Kenya Tech Blog — script.js
   Modular ES6+. No dependencies.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initSearchToggle();
  initCategoryFilter();
  initNewsletterForm();
  initHeroTerminal();
});

/* ---------- Theme toggle (persisted) ---------- */
function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const stored = safeGet('ktb-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = stored || (prefersLight ? 'light' : 'dark');
  applyTheme(initial);

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    safeSet('ktb-theme', next);
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-pressed', String(theme === 'light'));
    toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }
}

/* localStorage can throw in some sandboxed contexts; fail quietly */
function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* no-op */ }
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('main-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close menu when a nav link is chosen (mobile UX)
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
    }
  });
}

/* ---------- Search toggle ---------- */
function initSearchToggle() {
  const wrap = document.querySelector('.search-wrap');
  const btn = document.getElementById('search-toggle');
  const input = document.getElementById('search-input');
  if (!wrap || !btn || !input) return;

  btn.addEventListener('click', () => {
    const isOpen = wrap.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) input.focus();
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target) && wrap.classList.contains('is-open')) {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
}

/* ---------- Category filtering ---------- */
function initCategoryFilter() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.card[data-category]');
  const noResults = document.getElementById('no-results');
  const navLinks = document.querySelectorAll('[data-nav-category]');

  if (!pills.length || !cards.length) return;

  function applyFilter(category) {
    let visibleCount = 0;
    cards.forEach((card) => {
      const match = category === 'all' || card.dataset.category === category;
      card.hidden = !match;
      if (match) visibleCount += 1;
    });

    pills.forEach((p) => {
      const active = p.dataset.filter === category;
      p.classList.toggle('is-active', active);
      p.setAttribute('aria-pressed', String(active));
    });

    if (noResults) noResults.hidden = visibleCount !== 0;
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => applyFilter(pill.dataset.filter));
  });

  // Header nav category links also drive the filter + scroll to grid
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.navCategory;
      applyFilter(category);
      document.getElementById('article-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------- Newsletter form validation ---------- */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const status = document.getElementById('newsletter-status');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('#newsletter-email');
    const value = email.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!isValid) {
      status.textContent = 'Enter a valid email address to subscribe.';
      status.className = 'form-status is-error';
      email.focus();
      return;
    }

    status.textContent = `Subscribed — check ${value} to confirm.`;
    status.className = 'form-status is-success';
    form.reset();
  });
}

/* ---------- Hero terminal typing animation (single load-time moment) ---------- */
function initHeroTerminal() {
  const commandEl = document.getElementById('term-command');
  const outputEl = document.getElementById('term-output');
  if (!commandEl || !outputEl) return;

  const command = 'curl ktb.dev/news --latest';
  const output = 'Fetched 6 stories · 3 categories · updated 4 min ago';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    commandEl.textContent = command;
    outputEl.textContent = output;
    return;
  }

  let i = 0;
  const typeSpeed = 38;

  (function typeCommand() {
    if (i <= command.length) {
      commandEl.textContent = command.slice(0, i);
      i += 1;
      setTimeout(typeCommand, typeSpeed);
    } else {
      setTimeout(() => { outputEl.textContent = output; }, 300);
    }
  })();
}
