/* ─────────────────────────────────────────────────────────────
   main.js  —  Portfolio Interactive Layer
   Handles: theme, nav, scroll reveal, active links,
            contact form, project modals, scroll-to-top
   ───────────────────────────────────────────────────────────── */

'use strict';

/* ── 1. Theme Toggle ─────────────────────────────────────── */
(function initTheme() {
  const html        = document.documentElement;
  const btn         = document.getElementById('themeToggle');
  const STORAGE_KEY = 'portfolio-theme';

  // Restore saved preference or respect OS setting
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  html.setAttribute('data-theme', initial);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  });
})();


/* ── 2. Navbar: scroll class + mobile toggle ────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar) return;

  // Scrolled shadow/blur
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Mobile menu
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();


/* ── 3. Active Nav Link (Intersection Observer) ─────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(s => observer.observe(s));
})();


/* ── 4. Scroll Reveal ────────────────────────────────────── */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach(el => observer.observe(el));
})();


/* ── 5. Contact Form ─────────────────────────────────────── */
(function initContactForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn      = form.querySelector('button[type="submit"]');
    const btnText  = btn.querySelector('.btn-text');
    const name     = form.name.value.trim();
    const email    = form.email.value.trim();
    const subject  = form.subject.value.trim();
    const message  = form.message.value.trim();

    // Basic validation
    if (!name || !email || !subject || !message) {
      showStatus('Please fill in all fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Loading state
    btn.disabled  = true;
    btnText.textContent = 'Sending…';
    status.textContent  = '';
    status.className    = 'form-note';

    try {
      // ── Option A: Formspree (replace YOUR_FORM_ID) ──────────
      // Uncomment and add your Formspree form ID to activate:
      //
      // const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      //   method: 'POST',
      //   headers: { 'Accept': 'application/json' },
      //   body: new FormData(form)
      // });
      // if (!res.ok) throw new Error('Send failed');

      // ── Option B: mailto fallback (works without a backend) ─
      const mailto =
        `mailto:alex@example.com` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;

      window.location.href = mailto;

      form.reset();
      showStatus('✓ Your message is ready to send in your mail client.', 'success');
    } catch {
      showStatus('Something went wrong. Please email me directly.', 'error');
    } finally {
      btn.disabled        = false;
      btnText.textContent = 'Send Message';
    }
  });

  function showStatus(msg, type) {
    status.textContent  = msg;
    status.className    = `form-note ${type}`;
  }
})();


/* ── 6. Project Modal ────────────────────────────────────── */
(function initProjectModals() {
  // Build modal container
  const overlay = document.createElement('div');
  overlay.id        = 'projectModal';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Project details');
  overlay.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" aria-label="Close modal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="modal-body"></div>
    </div>`;
  document.body.appendChild(overlay);

  const modalBody  = overlay.querySelector('.modal-body');
  const closeBtn   = overlay.querySelector('.modal-close');

  // Enrich project cards with "Details" button
  document.querySelectorAll('.project-card').forEach(card => {
    const details = buildDetails(card);

    const detailsBtn = document.createElement('button');
    detailsBtn.className   = 'btn btn-ghost project-details-btn';
    detailsBtn.textContent = '+ Details';
    detailsBtn.setAttribute('aria-label', `View details for ${details.title}`);
    card.querySelector('.project-body').appendChild(detailsBtn);

    detailsBtn.addEventListener('click', () => openModal(details));
  });

  function buildDetails(card) {
    const title      = card.querySelector('.project-title')?.textContent || '';
    const desc       = card.querySelector('.project-desc')?.textContent || '';
    const features   = [...card.querySelectorAll('.project-features li')].map(li => li.textContent.trim());
    const challenge  = card.querySelector('.project-challenge')?.textContent.trim() || '';
    const stack      = [...card.querySelectorAll('.project-stack span')].map(s => s.textContent.trim());
    const liveLink   = card.querySelector('.icon-link[aria-label*="demo"], .icon-link[aria-label*="Demo"]')?.href || '#';
    const ghLink     = card.querySelector('.icon-link[aria-label*="GitHub"]')?.href || '#';
    return { title, desc, features, challenge, stack, liveLink, ghLink };
  }

  function openModal({ title, desc, features, challenge, stack, liveLink, ghLink }) {
    modalBody.innerHTML = `
      <h2 class="modal-title">${title}</h2>
      <p class="modal-desc">${desc}</p>

      <h4 class="modal-section-label">Key Features</h4>
      <ul class="modal-features">
        ${features.map(f => `<li>${f}</li>`).join('')}
      </ul>

      <h4 class="modal-section-label">Technical Challenge</h4>
      <p class="modal-challenge">${challenge}</p>

      <h4 class="modal-section-label">Tech Stack</h4>
      <div class="modal-stack">
        ${stack.map(s => `<span>${s}</span>`).join('')}
      </div>

      <div class="modal-actions">
        <a href="${liveLink}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>
        <a href="${ghLink}"   class="btn btn-outline" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      </div>`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
})();


/* ── 7. Scroll-to-Top Button ─────────────────────────────── */
(function initScrollTop() {
  const btn = document.createElement('button');
  btn.className   = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <polyline points="18 15 12 9 6 15"/>
  </svg>`;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── 8. Smooth-scroll for anchor links ───────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── 9. Inject Modal + Scroll-Top CSS ────────────────────── */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
[data-theme="light"] .modal-overlay { background: rgba(0,0,0,0.45); }
.modal-overlay.open { opacity: 1; pointer-events: all; }

.modal-box {
  background: var(--bg-2);
  border: 1px solid var(--border-2);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 620px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 40px;
  position: relative;
  transform: translateY(20px);
  transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
}
.modal-overlay.open .modal-box { transform: translateY(0); }

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  border-radius: var(--radius);
  transition: color 0.2s, background 0.2s;
}
.modal-close:hover { color: var(--text); background: var(--bg-4); }
.modal-close svg { width: 18px; height: 18px; }

.modal-title {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: 0.02em;
  margin-bottom: 12px;
  color: var(--text);
}
.modal-desc {
  font-size: 0.92rem;
  color: var(--text-2);
  line-height: 1.7;
  margin-bottom: 24px;
}
.modal-section-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
  margin-top: 20px;
}
.modal-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.modal-features li {
  font-size: 0.88rem;
  color: var(--text-2);
  padding-left: 16px;
  position: relative;
  line-height: 1.55;
}
.modal-features li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-size: 0.75rem;
}
.modal-challenge {
  font-size: 0.87rem;
  color: var(--text-2);
  line-height: 1.65;
  padding: 12px 14px;
  background: var(--bg-3);
  border-left: 2px solid var(--accent);
  border-radius: 0 var(--radius) var(--radius) 0;
}
.modal-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 28px;
}
.modal-stack span {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 4px 12px;
  background: var(--accent-dim);
  border: 1px solid rgba(240,165,0,0.25);
  border-radius: 2px;
  color: var(--accent);
  letter-spacing: 0.04em;
}
.modal-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  margin-top: 8px;
}

/* Details button on cards */
.project-details-btn {
  align-self: flex-start;
  font-size: 0.78rem;
  padding: 6px 0;
  color: var(--accent);
  letter-spacing: 0.05em;
}
.project-details-btn:hover { color: var(--text); }

/* Scroll-to-top */
.scroll-top-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 900;
  width: 44px;
  height: 44px;
  background: var(--bg-3);
  border: 1px solid var(--border-2);
  border-radius: var(--radius);
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition: opacity 0.25s, transform 0.25s, border-color 0.2s, color 0.2s;
  cursor: pointer;
}
.scroll-top-btn.visible {
  opacity: 1;
  pointer-events: all;
  transform: translateY(0);
}
.scroll-top-btn:hover { border-color: var(--accent); color: var(--accent); }
.scroll-top-btn svg { width: 18px; height: 18px; }

@media (max-width: 480px) {
  .modal-box { padding: 28px 20px; }
  .scroll-top-btn { bottom: 16px; right: 16px; }
}
`;
  document.head.appendChild(style);
})();