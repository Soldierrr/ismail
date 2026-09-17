/**
 * Ledger — Animations & Micro-interactions
 * Scroll-reveal, stat counters, ripple buttons, header shadow, page transitions
 */
(function () {
  'use strict';

  /* ============================================================
     1. SCROLL REVEAL — IntersectionObserver
     ============================================================ */
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!els.length || !window.IntersectionObserver) {
      // Fallback: make everything visible immediately
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ============================================================
     2. STAT COUNTER — animated number roll-up
     ============================================================ */
  function animateCounter(el, target, duration, prefix, suffix) {
    prefix = prefix || '';
    suffix = suffix || '';
    var start     = 0;
    var startTime = null;
    var isFloat   = target % 1 !== 0;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed  = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var value    = easeOutExpo(progress) * target;
      el.textContent = prefix + (isFloat ? value.toFixed(2) : Math.floor(value).toLocaleString()) + suffix;
      el.classList.add('stat-animated');
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initStatCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el     = entry.target;
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        animateCounter(el, target, 1200, prefix, suffix);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ============================================================
     3. RIPPLE EFFECT on buttons
     ============================================================ */
  function initRipple() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn');
      if (!btn) return;

      var rect   = btn.getBoundingClientRect();
      var x      = e.clientX - rect.left;
      var y      = e.clientY - rect.top;
      var size   = Math.max(rect.width, rect.height) * 2;

      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText =
        'left:' + (x - size / 2) + 'px;' +
        'top:'  + (y - size / 2) + 'px;' +
        'width:' + size + 'px;' +
        'height:' + size + 'px;';

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function () { ripple.remove(); });
    });
  }

  /* ============================================================
     4. HEADER SCROLL SHADOW
     ============================================================ */
  function initHeaderShadow() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var scrolled = false;
    window.addEventListener('scroll', function () {
      var now = window.scrollY > 10;
      if (now !== scrolled) {
        scrolled = now;
        header.classList.toggle('scrolled', scrolled);
      }
    }, { passive: true });
  }

  /* ============================================================
     5. PAGE TRANSITION — fade-out on nav link clicks
     ============================================================ */
  function initPageTransitions() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');

      // Skip: external, anchor-only, download, target=_blank, javascript:
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          href.startsWith('javascript') || link.getAttribute('target') === '_blank' ||
          link.hasAttribute('download') || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }

      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.18s ease';
      setTimeout(function () { window.location.href = href; }, 200);
    });
  }

  /* ============================================================
     6. SMOOTH TAB SWITCHING (generic — works on any .tab-btn/.tab-panel)
     ============================================================ */
  function initTabTransitions() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        var panel  = document.getElementById(target);
        if (panel) {
          panel.style.animation = 'none';
          void panel.offsetHeight; // reflow
          panel.style.animation = '';
        }
      });
    });
  }

  /* ============================================================
     7. AUTO-REVEAL: add .reveal class to common sections
     (so existing HTML gets scroll animations without edits)
     ============================================================ */
  function autoMarkReveal() {
    var selectors = [
      'section > .wrap > h1',
      'section > .wrap > h2',
      '.ledger-card',
      '.faq-item',
      '.data-item',
      '.contact-card',
      '.footer-col'
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.closest('[data-no-reveal]')) {
          el.classList.add('reveal');
        }
      });
    });

    // Stat grid rows — stagger
    document.querySelectorAll('.admin-stat-grid, .dash-stat-cards, .feature-grid').forEach(function (grid) {
      grid.classList.add('reveal-stagger');
    });
  }

  /* ============================================================
     8. FORM FIELD CHARACTER COUNTS (textarea)
     ============================================================ */
  function initCharCounts() {
    document.querySelectorAll('textarea[maxlength]').forEach(function (ta) {
      var max     = parseInt(ta.getAttribute('maxlength'), 10);
      var counter = document.createElement('div');
      counter.className = 'char-count';
      counter.style.cssText = 'font-size:0.75rem;color:var(--ink-soft);text-align:right;margin-top:4px;';
      ta.parentNode.insertBefore(counter, ta.nextSibling);
      function update() {
        var left = max - ta.value.length;
        counter.textContent = left + ' characters remaining';
        counter.style.color = left < 20 ? '#c0392b' : 'var(--ink-soft)';
      }
      ta.addEventListener('input', update);
      update();
    });
  }

  /* ============================================================
     9. TOOLTIP on elements with data-tooltip
     ============================================================ */
  function initTooltips() {
    var tip = null;
    document.addEventListener('mouseenter', function (e) {
      var el = e.target.closest('[data-tooltip]');
      if (!el) return;
      tip = document.createElement('div');
      tip.className = 'tooltip-bubble';
      tip.textContent = el.getAttribute('data-tooltip');
      tip.style.cssText =
        'position:fixed;background:var(--teal-dark);color:var(--paper);' +
        'font-size:0.78rem;padding:5px 10px;border-radius:4px;pointer-events:none;' +
        'z-index:9999;opacity:0;transition:opacity 0.18s ease;white-space:nowrap;';
      document.body.appendChild(tip);

      var rect = el.getBoundingClientRect();
      tip.style.left = (rect.left + rect.width / 2 - tip.offsetWidth / 2) + 'px';
      tip.style.top  = (rect.top - tip.offsetHeight - 8) + 'px';
      requestAnimationFrame(function () { tip.style.opacity = '1'; });
    }, true);

    document.addEventListener('mouseleave', function (e) {
      if (tip && e.target.closest('[data-tooltip]')) {
        tip.style.opacity = '0';
        setTimeout(function () { if (tip) { tip.remove(); tip = null; } }, 200);
      }
    }, true);
  }

  /* ============================================================
     INIT — run after DOM ready
     ============================================================ */
  function init() {
    autoMarkReveal();   // must be before initReveal
    initReveal();
    initStatCounters();
    initRipple();
    initHeaderShadow();
    initPageTransitions();
    initTabTransitions();
    initCharCounts();
    initTooltips();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
