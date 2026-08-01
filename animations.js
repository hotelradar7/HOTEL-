/* ============================================================
   HotelRadar — animations.js  v3.0 (MINIMAL + FAST)
   Only does what CSS cannot do:
   1. Nav scroll class toggle (passive listener)
   2. Remove "Direct Call" buttons after React renders
   3. Hide double "Stay Niche" badge
   4. Ripple on accent buttons (delegated — 1 listener total)
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. NAV SCROLL GLOW (1 passive listener) ─────────────── */
  var nav = document.querySelector('header');
  var scrollY = 0;
  var rafPending = false;

  function onScroll() {
    scrollY = window.scrollY;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(function () {
        rafPending = false;
        if (!nav) return;
        if (scrollY > 8) {
          nav.classList.add('hr-scrolled');
        } else {
          nav.classList.remove('hr-scrolled');
        }
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── 2. RIPPLE — 1 delegated listener on document ────────── */
  var style = document.createElement('style');
  style.textContent =
    '@keyframes _hr_rpl{0%{transform:scale(0);opacity:.55}100%{transform:scale(1);opacity:0}}' +
    '._hr_rpl{position:absolute;border-radius:50%;background:rgba(255,255,255,.28);' +
    'pointer-events:none;z-index:99;animation:_hr_rpl .5s linear forwards}';
  document.head.appendChild(style);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button:not([disabled])');
    if (!btn) return;
    // Only ripple accent-colored buttons
    var cl = btn.className || '';
    if (!cl.includes('bg-[var(--accent)]') && !cl.includes('bg-emerald') &&
        !cl.includes('bg-amber') && !cl.includes('bg-[var(--ink)]')) return;

    var old = btn.querySelector('._hr_rpl');
    if (old) old.remove();

    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 2.1;
    var x = e.clientX - r.left - size / 2;
    var y = e.clientY - r.top - size / 2;
    var el = document.createElement('span');
    el.className = '_hr_rpl';
    el.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px';

    var ps = btn.style.position;
    if (!ps || ps === '' || ps === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(el);
    setTimeout(function () { el.remove(); }, 520);
  }, { passive: true });

  /* ── 3. DOM FIXES after React renders ────────────────────── */
  function applyFixes() {
    /* 3a. Hide "Stay Niche:" badge in hotel card body */
    var els = document.querySelectorAll('[class*="mb-2.5"]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].textContent && els[i].textContent.indexOf('Stay Niche:') !== -1) {
        els[i].style.display = 'none';
      }
    }

    /* 3b. Remove "Call Direct" buttons in compare modal */
    var btns = document.querySelectorAll('button');
    for (var j = 0; j < btns.length; j++) {
      var txt = (btns[j].textContent || '').trim();
      if (txt === 'Call Direct') {
        var td = btns[j].closest('td');
        if (td) td.innerHTML = '<span style="font-size:11px;color:var(--ink-faint)">—</span>';
      }
    }

    /* 3c. Hide tel: links inside table cells */
    var telLinks = document.querySelectorAll('td a[href^="tel:"]');
    for (var k = 0; k < telLinks.length; k++) {
      telLinks[k].style.display = 'none';
    }
  }

  /* ── 4. RUN ON REACT RENDER (debounced MutationObserver) ─── */
  var timer;
  var observer = new MutationObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(applyFixes, 150);
  });

  function init() {
    /* Update nav reference after React mounts */
    nav = document.querySelector('header') || nav;
    applyFixes();
    observer.observe(document.getElementById('root') || document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 80);
  }

}());
