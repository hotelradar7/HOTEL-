/* ============================================================
   HotelRadar — animations.js  v3.2
   Works with new app.js where:
   - Non-home pages already have built-in sticky search bar
     (sticky top-[56px] z-40) rendered by React
   - Home page has search-box-polish that scrolls away
     → we inject a floating pill for HOME PAGE ONLY

   What this file does:
   1. Nav scroll glow (1 passive RAF listener)
   2. Ripple on accent buttons (1 delegated listener)
   3. DOM fixes: hide Stay Niche badge, remove Call Direct
   4. HOME PAGE: floating search pill via IntersectionObserver
   ============================================================ */
(function () {
  'use strict';

  /* ── RIPPLE KEYFRAMES ─────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent =
    '@keyframes _rpl{0%{transform:scale(0);opacity:.5}100%{transform:scale(1);opacity:0}}' +
    '._rpl{position:absolute;border-radius:50%;background:rgba(255,255,255,.26);' +
    'pointer-events:none;z-index:99;animation:_rpl .48s linear forwards}';
  document.head.appendChild(style);

  /* ── 1. NAV SCROLL GLOW ───────────────────────────────────── */
  var nav = null;
  var rafNav = false;

  window.addEventListener('scroll', function () {
    if (rafNav) return;
    rafNav = true;
    requestAnimationFrame(function () {
      rafNav = false;
      if (!nav) nav = document.querySelector('header');
      if (!nav) return;
      nav.classList.toggle('hr-scrolled', window.scrollY > 8);
    });
  }, { passive: true });

  /* ── 2. RIPPLE (delegated — 1 listener) ──────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button:not([disabled])');
    if (!btn) return;
    var cl = btn.className || '';
    if (!cl.includes('bg-[var(--accent)]') &&
        !cl.includes('bg-emerald') &&
        !cl.includes('bg-amber') &&
        !cl.includes('bg-[var(--ink)]')) return;

    var old = btn.querySelector('._rpl');
    if (old) old.remove();
    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2.1;
    var el = document.createElement('span');
    el.className = '_rpl';
    el.style.cssText =
      'width:' + size + 'px;height:' + size + 'px;' +
      'left:' + (e.clientX - r.left - size / 2) + 'px;' +
      'top:' + (e.clientY - r.top - size / 2) + 'px';
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(el);
    setTimeout(function () { el.remove(); }, 500);
  }, { passive: true });

  /* ── 3. DOM FIXES ─────────────────────────────────────────── */
  function applyFixes() {
    /* No-op: Optimized away to prevent layout thrashing and MutationObserver infinite loops.
       Fixes are now applied natively in app.js. */
  }

  /* ── 4. HOME PAGE FLOATING SEARCH PILL ───────────────────── */
  /*
   * The new app.js already has a sticky search bar on all
   * non-home pages (hotels, wishlist, etc.) via React.
   * On the HOME page, search-box-polish scrolls away.
   * We inject a pill that appears when it's out of view.
   *
   * Clicking the pill → triggers click on .search-box-polish
   * which opens the real search modal.
   */

  var pillEl = null;
  var pillObserver = null;

  function removePill() {
    if (pillEl) {
      pillEl.remove();
      pillEl = null;
    }
    if (pillObserver) {
      pillObserver.disconnect();
      pillObserver = null;
    }
  }

  function initHomePill() {
    /* Only inject on home page */
    var path = window.location.pathname;
    var isHome = path === '/' ||
                 path === '/index.html' ||
                 path.endsWith('/') ||
                 (!path.includes('hotels') &&
                  !path.includes('detail') &&
                  !path.includes('wishlist') &&
                  !path.includes('about') &&
                  !path.includes('contact') &&
                  !path.includes('account'));

    /* Remove any existing pill first */
    removePill();

    if (!isHome) return;

    /* Wait for search box to be in DOM */
    var searchBox = document.querySelector('.search-box-polish');
    if (!searchBox) return;

    /* Build pill */
    pillEl = document.createElement('div');
    pillEl.id = 'hr-sticky-search';
    pillEl.innerHTML =
      '<button id="hr-sticky-search-btn" type="button" aria-label="Search hotels">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" ' +
          'fill="none" stroke="currentColor" stroke-width="2.2" ' +
          'stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:var(--ink-faint)">' +
          '<circle cx="11" cy="11" r="8"/>' +
          '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
        '</svg>' +
        '<span style="flex:1;font-size:13px;font-weight:500;color:var(--ink-faint);' +
          'white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
          'Search hotels, cities or states\u2026' +
        '</span>' +
        '<span style="font-size:10px;font-weight:700;text-transform:uppercase;' +
          'letter-spacing:0.04em;color:var(--ink-faint);background:var(--paper-dim);' +
          'border:1px solid var(--line);border-radius:6px;padding:2px 8px;flex-shrink:0">' +
          'Search' +
        '</span>' +
      '</button>';

    document.body.appendChild(pillEl);

    /* Click → open the real search modal */
    document.getElementById('hr-sticky-search-btn').addEventListener('click', function () {
      var box = document.querySelector('.search-box-polish');
      if (box) box.click();
    });

    /* IntersectionObserver: show pill when search box leaves viewport */
    pillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (pillEl) {
          pillEl.classList.toggle('hr-visible', !entry.isIntersecting);
        }
      });
    }, {
      rootMargin: '-56px 0px 0px 0px', /* offset for 56px sticky nav */
      threshold: 0
    });

    pillObserver.observe(searchBox);
  }

  /* ── MutationObserver — React re-renders ─────────────────── */
  var fixTimer;
  var pillTimer;
  var lastPath = window.location.pathname;

  var mo = new MutationObserver(function () {
    /* DOM fixes */
    clearTimeout(fixTimer);
    fixTimer = setTimeout(applyFixes, 160);

    /* Re-init pill if page changed (SPA navigation) */
    clearTimeout(pillTimer);
    pillTimer = setTimeout(function () {
      var currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        initHomePill();
      } else {
        /* Same page, but maybe search box just appeared in DOM */
        if (!pillEl && !document.getElementById('hr-sticky-search')) {
          initHomePill();
        }
      }
    }, 200);
  });

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    nav = document.querySelector('header');
    applyFixes();
    initHomePill();

    mo.observe(document.getElementById('root') || document.body, {
      childList: true,
      subtree: true
    });

    /* Handle back/forward navigation */
    window.addEventListener('popstate', function () {
      setTimeout(function () {
        lastPath = window.location.pathname;
        initHomePill();
      }, 250);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 80);
  }

}());
