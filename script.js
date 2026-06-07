/* =====================================================
   GEMANI SUPPLIES — script.js
   Handles: sticky header, mobile nav, hero slider,
   count-up, scroll reveal, contact form, back-to-top,
   shop search
   ===================================================== */
(function () {
  'use strict';

  /* ── STICKY HEADER ───────────────────────────────── */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 50);
    }, { passive: true });
  }




  /* ── HERO SLIDER ─────────────────────────────────── */
  var slides   = document.querySelectorAll('.hero-slider__slide');
  var dotsWrap = document.querySelector('.hero-slider__dots');
  var prevBtn  = document.querySelector('.hero-slider__prev');
  var nextBtn  = document.querySelector('.hero-slider__next');
  var current  = 0;
  var autoPlay = null;

  if (slides.length > 1 && dotsWrap) {
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'hero-slider__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    });

    function goTo(n) {
      slides[current].classList.remove('is-active');
      dotsWrap.children[current].classList.remove('is-active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dotsWrap.children[current].classList.add('is-active');
    }
    function startAuto() { autoPlay = setInterval(function () { goTo(current + 1); }, 5000); }
    function resetAuto() { clearInterval(autoPlay); startAuto(); }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetAuto(); });
    startAuto();
  }

  /* ── COUNT-UP ─────────────────────────────────────── */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.target._counted) return;
        entry.target._counted = true;
        var target = parseInt(entry.target.getAttribute('data-count'), 10);
        var dur = 1800, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          entry.target.textContent = Math.floor(eased * target).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
          else entry.target.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObs.observe(el); });
  }

  /* ── SCROLL REVEAL ────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  /* ── BACK TO TOP ──────────────────────────────────── */
  var backTop = document.querySelector('.back-to-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });
    backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ── CONTACT FORM ─────────────────────────────────── */
  var cform  = document.getElementById('contactForm');
  var cstatus = document.getElementById('formStatus');
  if (cform && cstatus) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var name    = (cform.elements['name']    || {}).value || '';
      var phone   = (cform.elements['phone']   || {}).value || '';
      var message = (cform.elements['message'] || {}).value || '';
      if (!name.trim() || !phone.trim() || !message.trim()) {
        cstatus.className = 'cform__status error';
        cstatus.textContent = 'Please fill in all required fields (Name, Phone, Message).';
        return;
      }
      var service = ((cform.elements['service'] || {}).value) || 'General Enquiry';
      var email   = ((cform.elements['email']   || {}).value) || '';
      var text = 'Hello Gemani Supplies!\n\nName: ' + name.trim()
        + '\nPhone: ' + phone.trim()
        + (email.trim() ? '\nEmail: ' + email.trim() : '')
        + '\nService: ' + service
        + '\n\nMessage:\n' + message.trim();
      var btn = cform.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      setTimeout(function () {
        cstatus.className = 'cform__status success';
        cstatus.textContent = '✓ Message sent! Opening WhatsApp…';
        if (btn) { btn.disabled = false; btn.textContent = 'Send Enquiry'; }
        setTimeout(function () {
          window.open('https://wa.me/254721620637?text=' + encodeURIComponent(text), '_blank');
          cform.reset();
          cstatus.className = 'cform__status';
          cstatus.textContent = '';
        }, 1000);
      }, 600);
    });
  }

  /* ── SHOP SEARCH ──────────────────────────────────── */
  var shopInput = document.getElementById('shopSearchInput');
  var shopBtn   = document.getElementById('shopSearchBtn');
  if (shopInput && shopBtn) {
    function runSearch() {
      var q = shopInput.value.trim().toLowerCase();
      var prodCards = document.querySelectorAll('.prod-card');
      var shopSections = document.querySelectorAll('.shop-section');
      if (!q) {
        prodCards.forEach(function (c) { c.style.display = ''; });
        shopSections.forEach(function (s) { s.style.display = ''; });
        var nr = document.getElementById('shopNoResults');
        if (nr) nr.parentNode.removeChild(nr);
        return;
      }
      prodCards.forEach(function (c) {
        c.style.display = c.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
      });
      shopSections.forEach(function (s) {
        var visible = s.querySelectorAll('.prod-card:not([style*="display: none"])');
        s.style.display = (visible.length === 0 && s.querySelector('.prod-card')) ? 'none' : '';
      });
    }
    shopBtn.addEventListener('click', runSearch);
    shopInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') runSearch(); });
  }

  document.querySelectorAll('.main-nav__link').forEach(function (a) {
    if ((a.getAttribute('href') || '').split('#')[0] === (window.location.pathname.split('/').pop() || 'index.html')) a.classList.add('is-active');
  });

  /* ── SMOOTH ANCHOR SCROLL ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
      }
    });
  });

  // Note: hamburger/mobile-nav logic intentionally removed in this project.
  /* ── MOBILE NAV ──────────────────────────────────── */
  // Hamburger/mobile navigation
  var hamburger = document.getElementById('hamburger');
  var mainNav = document.getElementById('mainNav');

  function toggleNav(open) {
    if (!mainNav) return;
    var isOpen = typeof open === 'boolean' ? open : !mainNav.classList.contains('is-open');
    if (isOpen) mainNav.classList.add('is-open');
    else mainNav.classList.remove('is-open');
    if (hamburger) hamburger.classList.toggle('is-open', !!isOpen);
  }

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      toggleNav();
    });

    // Close when clicking any nav link
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggleNav(false);
      });
    });

    // Close on escape and when resizing to desktop
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggleNav(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) toggleNav(false);
    }, { passive: true });

    // If page loads with a hash, keep nav closed
    toggleNav(false);
  }
})();


