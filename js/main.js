/* ============================================================
   1841 Bau- und Projektmanagement | main.js
   ============================================================ */

(function () {
  'use strict';

  /* --- Sticky header shadow -------------------------------- */
  const header = document.getElementById('header');

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* --- Mobile hamburger menu ------------------------------ */
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    });

    /* Close on link click */
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Menü öffnen');
      });
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target) && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Counter animation ---------------------------------- */
  function animateCounter(el) {
    const target  = parseInt(el.dataset.counter, 10);
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const duration = 1200;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* ease-out cubic */
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (c) { counterObserver.observe(c); });
  }

  /* --- Active nav link on scroll -------------------------- */
  const sections   = document.querySelectorAll('section[id]');
  const navLinks   = document.querySelectorAll('.nav-menu a[href^="#"]');

  if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* --- Reveal animation on scroll ------------------------- */
  const revealEls = document.querySelectorAll(
    '.service-card, .usp-item, .qual-card, .timeline-item, .about-stats'
  );

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    /* Add initial hidden state via JS (avoids FOUC if JS disabled) */
    revealEls.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.5s ease ' + (i % 4 * 80) + 'ms, transform 0.5s ease ' + (i % 4 * 80) + 'ms';
    });

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* --- Contact form submission ----------------------------- */
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn = contactForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Wird gesendet …';
      btn.disabled = true;

      let feedback = contactForm.querySelector('.form-feedback');
      if (!feedback) {
        feedback = document.createElement('p');
        feedback.className = 'form-feedback';
        contactForm.appendChild(feedback);
      }

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          feedback.textContent = 'Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet. Ich melde mich in Kürze bei Ihnen.';
          feedback.className = 'form-feedback form-feedback--success';
          contactForm.reset();
        } else {
          throw new Error('server');
        }
      } catch {
        feedback.textContent = 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie mich direkt per E-Mail.';
        feedback.className = 'form-feedback form-feedback--error';
      }

      btn.textContent = originalText;
      btn.disabled = false;
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

})();
