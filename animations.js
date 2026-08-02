/* ============================================================
   HotelRadar — animations.js  v3.1
   1. Nav scroll glow (passive)
   2. Ripple on buttons (delegated)
   3. DOM fixes: hide Stay Niche badge, remove Call Direct
   4. Sticky search bar on home page (IntersectionObserver)
   ============================================================ */
(function () {
  'use strict';

  /* ── RIPPLE KEYFRAMES (inject once) ──────────────────────── */
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
      if (window.scrollY > 8) {
        nav.classList.add('hr-scrolled');
      } else {
        nav.classList.remove('hr-scrolled');
      }
    });
  }, { passive: true });

  /* ── 2. RIPPLE (delegated — 1 listener total) ─────────────── */
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
    var ps = getComputedStyle(btn).position;
    if (ps === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(el);
    setTimeout(function () { el.remove(); }, 500);
  }, { passive: true });

  /* ── 3. DOM FIXES ─────────────────────────────────────────── */
  function applyFixes() {
    /* Hide "Stay Niche:" badge */
    var all = document.querySelectorAll('[class*="mb-2"]');
    for (var i = 0; i < all.length; i++) {
      if (all[i].textContent && all[i].textContent.indexOf('Stay Niche:') !== -1) {
        all[i].style.display = 'none';
      }
    }
    /* Remove "Call Direct" buttons */
    var btns = document.querySelectorAll('button');
    for (var j = 0; j < btns.length; j++) {
      if ((btns[j].textContent || '').trim() === 'Call Direct') {
        var td = btns[j].closest('td');
        if (td) td.innerHTML = '<span style="font-size:11px;color:var(--ink-faint)">—</span>';
      }
    }
  }

  /* ── 4. HOME PAGE STICKY SEARCH BAR ──────────────────────── */
  /* Injects a floating pill that appears when the home search
     box scrolls off screen. Clicking it opens the search modal. */
  function initStickySearch() {
    /* Only on home page — no search pill already in sticky bar */
    var path = window.location.pathname + window.location.search;
    var isHome = !path.includes('hotels') && !path.includes('detail') &&
                 !path.includes('wishlist') && !path.includes('about') &&
                 !path.includes('contact') && !path.includes('account');
    if (!isHome) return;

    /* Find the home page search box */
    var searchBox = document.querySelector('.search-box-polish');
    if (!searchBox) return;

    /* Build the sticky pill */
    var pill = document.createElement('div');
    pill.id = 'hr-sticky-search';
    pill.innerHTML =
      '<button id="hr-sticky-search-btn" type="button" aria-label="Open search">' +
        '<svg class="hr-sticky-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
        '</svg>' +
        '<span class="hr-sticky-text">Search hotels, cities or states…</span>' +
        '<span class="hr-sticky-kbd">Search</span>' +
      '</button>';
    document.body.appendChild(pill);

    /* Click → open the search overlay (same as clicking the real search box) */
    document.getElementById('hr-sticky-search-btn').addEventListener('click', function () {
      /* Trigger click on the real search box to open the modal */
      var realSearch = document.querySelector('.search-box-polish');
      if (realSearch) realSearch.click();
    });

    /* IntersectionObserver — show pill when search box is NOT visible */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          pill.classList.add('hr-visible');
        } else {
          pill.classList.remove('hr-visible');
        }
      });
    }, {
      root: null,
      rootMargin: '-56px 0px 0px 0px', /* account for sticky nav height */
      threshold: 0
    });

    observer.observe(searchBox);
  }

  /* ── MutationObserver for React re-renders ────────────────── */
  var fixTimer;
  var stickyDone = false;
  var mo = new MutationObserver(function () {
    clearTimeout(fixTimer);
    fixTimer = setTimeout(function () {
      applyFixes();
      if (!stickyDone) {
        var box = document.querySelector('.search-box-polish');
        if (box) {
          stickyDone = true;
          initStickySearch();
        }
      }
    }, 150);
  });

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    nav = document.querySelector('header');
    applyFixes();
    /* Try sticky immediately */
    if (document.querySelector('.search-box-polish')) {
      stickyDone = true;
      initStickySearch();
    }
    mo.observe(document.getElementById('root') || document.body, {
      childList: true,
      subtree: true
    });

    /* Re-init sticky search on SPA navigation */
    window.addEventListener('popstate', function () {
      stickyDone = false;
      var old = document.getElementById('hr-sticky-search');
      if (old) old.remove();
      setTimeout(function () {
        if (!stickyDone && document.querySelector('.search-box-polish')) {
          stickyDone = true;
          initStickySearch();
        }
      }, 300);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 80);
  }

}());
