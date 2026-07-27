/* ============================================================
   HOTELRADAR MOTION — Animation Logic v1.0
   Vanilla JS only. No external dependencies.
   Double-load guard: window.__hrMotionDone
   MutationObserver: re-tags React-rendered cards
   Prefers-reduced-motion: all effects gated
   Defensive null checks throughout
   ============================================================ */

(function () {
  'use strict';

  /* ── DOUBLE-LOAD GUARD ─────────────────────────────────── */
  if (window.__hrMotionDone) return;
  window.__hrMotionDone = true;

  /* ── REDUCED MOTION CHECK ──────────────────────────────── */
  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = mq && mq.matches;
  if (mq) {
    mq.addEventListener('change', function (e) { reduced = e.matches; });
  }

  /* ── UTILITIES ─────────────────────────────────────────── */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function rnd(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

  function cssVar(name) {
    try {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    } catch (e) { return ''; }
  }

  /* ── SCROLL PROGRESS BAR ───────────────────────────────── */
  function initScrollBar() {
    if (reduced) return;
    var bar = document.createElement('div');
    bar.id = 'hr-scroll-bar';
    document.body.appendChild(bar);

    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      var pct = (h.scrollTop || document.body.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      if (bar) bar.style.width = clamp(pct, 0, 100) + '%';
    }, { passive: true });
  }

  /* ── AMBIENT LAYER ─────────────────────────────────────── */
  function initAmbient() {
    if (reduced) return;

    var wrap = document.createElement('div');
    wrap.id = 'hr-ambient';
    document.body.appendChild(wrap);

    /* Radar sweep */
    var sweep = document.createElement('div');
    sweep.id = 'hr-radar-sweep';
    wrap.appendChild(sweep);

    /* Sonar rings */
    var sonar = document.createElement('div');
    sonar.id = 'hr-sonar-rings';
    for (var i = 0; i < 3; i++) {
      var ring = document.createElement('div');
      ring.className = 'hr-sonar-ring';
      sonar.appendChild(ring);
    }
    wrap.appendChild(sonar);

    /* Dot grid */
    var grid = document.createElement('div');
    grid.id = 'hr-dot-grid';
    wrap.appendChild(grid);

    /* Breathe glow */
    var glow = document.createElement('div');
    glow.id = 'hr-breathe-glow';
    wrap.appendChild(glow);

    /* Floating travel emojis */
    var emojis = ['🏨', '✈️', '🧳', '🗺️', '🛕', '🏔️', '🌊', '🎒', '🛏️', '🏡'];
    for (var j = 0; j < 8; j++) {
      var em = document.createElement('span');
      em.className = 'hr-float-emoji';
      em.textContent = emojis[j % emojis.length];
      em.style.left = rnd(5, 95) + '%';
      em.style.bottom = '-40px';
      em.style.animationDuration = rnd(18, 35) + 's';
      em.style.animationDelay = rnd(0, 20) + 's';
      em.style.fontSize = rnd(14, 26) + 'px';
      wrap.appendChild(em);
    }

    /* Fireflies */
    for (var k = 0; k < 10; k++) {
      var ff = document.createElement('div');
      ff.className = 'hr-firefly';
      ff.style.left = rnd(10, 90) + '%';
      ff.style.top = rnd(10, 90) + '%';
      ff.style.setProperty('--dx', (rnd(-40, 40)) + 'px');
      ff.style.setProperty('--dy', (rnd(-40, 40)) + 'px');
      ff.style.animationDuration = rnd(4, 8) + 's';
      ff.style.animationDelay = rnd(0, 8) + 's';
      wrap.appendChild(ff);
    }

    /* Shooting comets */
    for (var c = 0; c < 4; c++) {
      var comet = document.createElement('div');
      comet.className = 'hr-comet';
      comet.style.top = rnd(10, 60) + '%';
      comet.style.left = rnd(-10, 10) + '%';
      comet.style.transform = 'rotate(' + rnd(20, 40) + 'deg)';
      comet.style.animationDuration = rnd(6, 14) + 's';
      comet.style.animationDelay = rnd(0, 12) + 's';
      wrap.appendChild(comet);
    }
  }

  /* ── CURSOR SPOTLIGHT ──────────────────────────────────── */
  function initCursorSpot() {
    if (reduced) return;
    var spot = document.createElement('div');
    spot.id = 'hr-cursor-spot';
    document.body.appendChild(spot);

    document.addEventListener('mousemove', function (e) {
      if (!spot) return;
      spot.style.left = e.clientX + 'px';
      spot.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  /* ── ACTIVITY TICKER ───────────────────────────────────── */
  var tickerTimeout = null;

  function buildTicker() {
    if (reduced) return;

    /* Scrape hotel names from DOM */
    var cards = qsa('[id^="hotel-card-"]');
    if (cards.length === 0) return;

    var names = [];
    cards.forEach(function (card) {
      var h3 = qs('h3', card);
      if (h3) names.push(h3.textContent.trim());
    });
    if (names.length === 0) return;

    var existing = document.getElementById('hr-activity-ticker');
    if (existing) existing.remove();

    var ticker = document.createElement('div');
    ticker.id = 'hr-activity-ticker';

    var inner = document.createElement('div');
    inner.id = 'hr-ticker-inner';

    var msgs = [];
    names.slice(0, 8).forEach(function (n) {
      msgs.push('🔥 Someone just viewed ' + n);
      msgs.push('✅ ' + n + ' — verified listing');
      msgs.push('📞 Direct contact available at ' + n);
    });

    /* Double for seamless loop */
    var text = msgs.concat(msgs).join('   •   ');
    inner.textContent = text;
    ticker.appendChild(inner);
    document.body.appendChild(ticker);

    /* Show after a short delay */
    if (tickerTimeout) clearTimeout(tickerTimeout);
    tickerTimeout = setTimeout(function () {
      var el = document.getElementById('hr-activity-ticker');
      if (el) el.classList.add('visible');
    }, 2000);
  }

  /* ── HEADER EFFECTS ────────────────────────────────────── */
  function initHeader() {
    var header = qs('header');
    if (!header) return;

    /* Scroll shadow */
    window.addEventListener('scroll', function () {
      if (!header) return;
      if ((document.documentElement.scrollTop || document.body.scrollTop) > 10) {
        header.classList.add('hr-scrolled');
      } else {
        header.classList.remove('hr-scrolled');
      }
    }, { passive: true });

    if (reduced) return;

    /* Logo radar ring — first logo div */
    var logo = qs('header div div', header);
    if (logo) logo.classList.add('hr-logo-radar');

    /* Login/Sign-in button shine */
    var btns = qsa('header button, header a[href*="login"], header a[href*="sign"]', header);
    btns.forEach(function (btn) {
      btn.classList.add('hr-login-shine');
    });
  }

  /* ── SCROLL PROGRESS BAR (back-to-top) ─────────────────── */
  function initBackToTop() {
    if (reduced) return;
    var btn = document.createElement('button');
    btn.id = 'hr-back-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 40 40">' +
      '<circle id="hr-back-top-circle" cx="20" cy="20" r="17.5"/>' +
      '<path id="hr-back-top-arrow" d="M20 26V14M14 20l6-6 6 6" stroke="' +
      (cssVar('--accent') || '#e8631c') + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      '</svg>';
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var circle = document.getElementById('hr-back-top-circle');
    var circumference = 2 * Math.PI * 17.5; /* ≈ 110 */

    window.addEventListener('scroll', function () {
      var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      var offset = circumference * (1 - pct);
      if (circle) circle.style.strokeDashoffset = offset;
      if (btn) {
        if (scrollTop > 300) btn.classList.add('visible');
        else btn.classList.remove('visible');
      }
    }, { passive: true });
  }

  /* ── HERO SECTION ──────────────────────────────────────── */
  function initHero() {
    if (reduced) return;

    /* Title cinematic entry */
    var h1 = qs('section h1');
    if (h1) h1.classList.add('hr-hero-title-reveal');

    /* Search box breathing ring */
    var searchBox = qs('.search-box-polish');
    if (searchBox) searchBox.classList.add('hr-search-breathe');

    /* Chip shimmer — staggered */
    var chips = qsa('.chip-polish');
    chips.forEach(function (chip, i) {
      setTimeout(function () {
        chip.classList.add('hr-chip-shimmer');
        setTimeout(function () { chip.classList.remove('hr-chip-shimmer'); }, 2200);
      }, i * 300);
    });

    /* Stat values glow */
    var stats = qsa('.stat-val-polish');
    stats.forEach(function (s) { s.classList.add('hr-stat-glow'); });

    /* Typewriter placeholder */
    var inp = qs('.search-input-polish');
    if (inp) initTypewriter(inp);

    /* Scroll hint */
    var heroSection = qs('section');
    if (heroSection) {
      heroSection.style.position = 'relative';
      var hint = document.createElement('div');
      hint.id = 'hr-scroll-hint';
      heroSection.appendChild(hint);
    }
  }

  function initTypewriter(inp) {
    var phrases = [
      'Search hotels in Haridwar…',
      'Find ashrams in Rishikesh…',
      'Resorts in Mussoorie…',
      'Budget stays in Delhi…',
      'Dharamshalas in Uttarakhand…'
    ];
    var pi = 0;
    var ci = 0;
    var deleting = false;

    function tick() {
      if (!inp || !inp.isConnected) return;
      var phrase = phrases[pi];
      if (!deleting) {
        inp.setAttribute('placeholder', phrase.slice(0, ci + 1));
        ci++;
        if (ci === phrase.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
        setTimeout(tick, 80);
      } else {
        inp.setAttribute('placeholder', phrase.slice(0, ci - 1));
        ci--;
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 40);
      }
    }
    setTimeout(tick, 1000);
  }

  /* ── HOTEL CARD STAGGER + OBSERVER ────────────────────── */
  var cardObserver = null;
  var taggedCards = new Set();

  function tagCard(card) {
    if (!card || taggedCards.has(card.id)) return;
    taggedCards.add(card.id);

    if (reduced) {
      card.style.opacity = '1';
      card.style.transform = 'none';
      return;
    }

    if (cardObserver) {
      cardObserver.observe(card);
    } else {
      /* Fallback: just show */
      card.classList.add('hr-card-visible');
    }

    /* Book Now shine */
    var bookBtn = qs('.rounded-full.bg-\\[var\\(--accent\\)\\]', card) ||
                  qs('[class*="Book Now"]', card) ||
                  qsa('div[class*="bg-\\[var(--accent)\\]"]', card).pop();
    if (bookBtn) bookBtn.classList.add('hr-book-shine', 'hr-ripple-host');

    /* Verified sonar */
    var verBadge = qs('[class*="emerald"]', card);
    if (verBadge) verBadge.classList.add('hr-verified-sonar');

    /* Featured pulse */
    if (card.querySelector('[class*="amber"]') || card.querySelector('[class*="Featured"]')) {
      card.classList.add('hr-featured-ring');
    }

    /* Wishlist heart burst */
    var wlBtn = document.getElementById('wishlist-btn-' + card.id.replace('hotel-card-', ''));
    if (wlBtn && !wlBtn._hrWired) {
      wlBtn._hrWired = true;
      wlBtn.addEventListener('click', function (e) {
        if (!reduced) spawnHeartBurst(e.clientX, e.clientY);
      });
    }

    /* Compare button ripple */
    var cmpBtn = document.getElementById('compare-btn-' + card.id.replace('hotel-card-', ''));
    if (cmpBtn && !cmpBtn._hrWired) {
      cmpBtn._hrWired = true;
      cmpBtn.addEventListener('click', function (e) {
        if (!reduced) spawnRipple(cmpBtn, e);
      });
    }
  }

  function initCardObserver() {
    if (typeof IntersectionObserver === 'undefined') return;

    var delay = 0;
    cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var card = entry.target;
          setTimeout(function () {
            card.classList.add('hr-card-visible');
          }, delay);
          delay = Math.min(delay + 80, 400);
          cardObserver.unobserve(card);
          setTimeout(function () { delay = 0; }, 600);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    tagAllCards();
  }

  function tagAllCards() {
    var cards = qsa('[id^="hotel-card-"]');
    cards.forEach(tagCard);
  }

  /* MutationObserver to catch React re-renders */
  function initMutationObserver() {
    if (typeof MutationObserver === 'undefined') return;
    var mo = new MutationObserver(function (mutations) {
      var needsRetag = false;
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.id && node.id.indexOf('hotel-card-') === 0) {
            tagCard(node);
          } else {
            var nested = qsa('[id^="hotel-card-"]', node);
            if (nested.length) { needsRetag = true; }
          }
        });
      });
      if (needsRetag) tagAllCards();

      /* Re-build ticker when new cards appear */
      if (mutations.some(function (m) { return m.addedNodes.length > 0; })) {
        clearTimeout(tickerTimeout);
        tickerTimeout = setTimeout(buildTicker, 500);
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ── CATEGORY ICON BOB ─────────────────────────────────── */
  function initCatIcons() {
    if (reduced) return;
    var icons = qsa('.cat-icon-polish');
    icons.forEach(function (icon, i) {
      icon.style.animationDelay = (i * 0.3) + 's';
      icon.classList.add('hr-cat-bob');
    });
  }

  /* ── SECTION HEADING REVEALS ───────────────────────────── */
  function initHeadingReveals() {
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    var headings = qsa('section h2, section h3');
    headings.forEach(function (h) {
      h.classList.add('hr-heading-reveal');
    });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('active');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    headings.forEach(function (h) { obs.observe(h); });
  }

  /* ── HEART BURST ───────────────────────────────────────── */
  function spawnHeartBurst(x, y) {
    var wrap = document.createElement('div');
    wrap.className = 'hr-heart-burst';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    document.body.appendChild(wrap);

    var count = 8;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'hr-heart-particle';
      p.textContent = '❤️';
      var angle = (i / count) * Math.PI * 2;
      var dist = rnd(30, 70);
      p.style.setProperty('--pdx', (Math.cos(angle) * dist) + 'px');
      p.style.setProperty('--pdy', (Math.sin(angle) * dist - 60) + 'px');
      p.style.animationDelay = (i * 0.05) + 's';
      wrap.appendChild(p);
    }

    setTimeout(function () {
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 900);
  }

  /* ── SPARKLE BURST ─────────────────────────────────────── */
  function spawnSparkleBurst(x, y) {
    var wrap = document.createElement('div');
    wrap.className = 'hr-sparkle-burst';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';
    document.body.appendChild(wrap);

    var count = 10;
    for (var i = 0; i < count; i++) {
      var d = document.createElement('div');
      d.className = 'hr-sparkle-dot';
      var angle = (i / count) * Math.PI * 2;
      var dist = rnd(20, 55);
      d.style.setProperty('--sdx', (Math.cos(angle) * dist) + 'px');
      d.style.setProperty('--sdy', (Math.sin(angle) * dist - 40) + 'px');
      d.style.animationDelay = (i * 0.04) + 's';
      wrap.appendChild(d);
    }

    setTimeout(function () {
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 700);
  }

  /* ── BUTTON RIPPLE ─────────────────────────────────────── */
  function spawnRipple(btn, e) {
    if (!btn) return;
    btn.classList.add('hr-ripple-host');
    var rect = btn.getBoundingClientRect();
    var r = document.createElement('span');
    r.className = 'hr-ripple';
    var size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size / 2) + 'px';
    r.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(r);
    setTimeout(function () {
      if (r && r.parentNode) r.parentNode.removeChild(r);
    }, 600);
  }

  /* Wire book-now sparkle globally */
  function wireBookNow() {
    document.addEventListener('click', function (e) {
      if (reduced) return;
      var target = e.target;
      /* Check if it's a Book Now button by its text content */
      if (target && target.textContent && target.textContent.trim() === 'Book Now') {
        spawnSparkleBurst(e.clientX, e.clientY);
        spawnRipple(target, e);
      }
    }, { passive: true });
  }

  /* ── PAGE TRANSITION ───────────────────────────────────── */
  function initPageTransition() {
    if (reduced) return;

    var overlay = document.createElement('div');
    overlay.id = 'hr-page-transition';
    document.body.appendChild(overlay);

    window.addEventListener('popstate', function () {
      if (!overlay) return;
      overlay.classList.add('active');
      setTimeout(function () {
        if (overlay) overlay.classList.remove('active');
      }, 300);
    });
  }

  /* ── BOTTOM SHEET HANDLE WIGGLE ────────────────────────── */
  function wireBottomSheets() {
    if (reduced || typeof MutationObserver === 'undefined') return;

    var bsMo = new MutationObserver(function () {
      var sheets = qsa('.bottom-sheet');
      sheets.forEach(function (sheet) {
        var handle = sheet.querySelector('.bg-\\[var\\(--line\\)\\]') ||
                     sheet.querySelector('[class*="rounded-full"][class*="bg-"]');
        if (handle && !handle._hrWiggle) {
          handle._hrWiggle = true;
          handle.classList.add('hr-handle-wiggle');
        }
      });
    });

    bsMo.observe(document.body, { childList: true, subtree: true });
  }

  /* ── TOAST SPRING ──────────────────────────────────────── */
  function wireToasts() {
    if (reduced || typeof MutationObserver === 'undefined') return;

    var toastMo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          /* Toasts: fixed positioning at bottom, small */
          var style = node.style || {};
          if (style.position === 'fixed' && node.textContent && node.textContent.length < 80) {
            node.classList.add('hr-toast-spring');
          }
        });
      });
    });

    toastMo.observe(document.body, { childList: true });
  }

  /* ── MAIN INIT ─────────────────────────────────────────── */
  function init() {
    try { initScrollBar(); } catch (e) { /* silent */ }
    try { initAmbient(); } catch (e) { /* silent */ }
    try { initCursorSpot(); } catch (e) { /* silent */ }
    try { initHeader(); } catch (e) { /* silent */ }
    try { initBackToTop(); } catch (e) { /* silent */ }
    try { initCardObserver(); } catch (e) { /* silent */ }
    try { initMutationObserver(); } catch (e) { /* silent */ }
    try { initCatIcons(); } catch (e) { /* silent */ }
    try { initHeadingReveals(); } catch (e) { /* silent */ }
    try { initHero(); } catch (e) { /* silent */ }
    try { buildTicker(); } catch (e) { /* silent */ }
    try { wireBookNow(); } catch (e) { /* silent */ }
    try { initPageTransition(); } catch (e) { /* silent */ }
    try { wireBottomSheets(); } catch (e) { /* silent */ }
    try { wireToasts(); } catch (e) { /* silent */ }
  }

  /* ── BOOT ──────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      /* Let React mount first */
      setTimeout(init, 150);
    });
  } else {
    setTimeout(init, 150);
  }

})();

/* ============================================================
   HOTELRADAR MOTION v2 — Extra Animation Logic
   Appended as IIFE — safe, no conflicts
   ============================================================ */
(function () {
  'use strict';

  if (window.__hrMotionV2Done) return;
  window.__hrMotionV2Done = true;

  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = mq && mq.matches;
  if (mq) mq.addEventListener('change', function(e){ reduced = e.matches; });

  function qs(s,c){ return (c||document).querySelector(s); }
  function qsa(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); }
  function rnd(a,b){ return Math.random()*(b-a)+a; }

  /* ── SPLASH SCREEN ─────────────────────────────────────── */
  function initSplash() {
    if (reduced) return;
    if (sessionStorage.getItem('hr-splash-done')) return;

    var splash = document.createElement('div');
    splash.id = 'hr-splash';
    splash.innerHTML =
      '<div id="hr-splash-logo">🏨</div>' +
      '<div id="hr-splash-text">HotelRadar</div>' +
      '<div id="hr-splash-sub">India\'s Hotel Directory</div>' +
      '<div id="hr-splash-bar"><div id="hr-splash-bar-fill"></div></div>';
    document.body.appendChild(splash);

    setTimeout(function() {
      splash.classList.add('hide');
      setTimeout(function() {
        if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
      }, 550);
      sessionStorage.setItem('hr-splash-done', '1');
    }, 2000);
  }

  /* ── AURORA BACKGROUND ─────────────────────────────────── */
  function initAurora() {
    if (reduced) return;
    var aurora = document.createElement('div');
    aurora.id = 'hr-aurora';
    for (var i = 0; i < 3; i++) {
      var blob = document.createElement('div');
      blob.className = 'hr-aurora-blob';
      aurora.appendChild(blob);
    }
    document.body.appendChild(aurora);
  }

  /* ── GRADIENT MESH ─────────────────────────────────────── */
  function initMesh() {
    if (reduced) return;
    var mesh = document.createElement('div');
    mesh.id = 'hr-mesh';
    document.body.appendChild(mesh);
  }

  /* ── MATRIX CANVAS (hotel names falling) ───────────────── */
  function initMatrix() {
    if (reduced) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'hr-matrix-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var words = ['Hotel', 'Dharmshala', 'Resort', 'Haveli', 'Lodge',
                 'Inn', 'Ashram', 'Homestay', 'Palace', 'Villa',
                 'Mumbai', 'Delhi', 'Jaipur', 'Goa', 'Kerala'];
    var cols = Math.floor(canvas.width / 80);
    var drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -canvas.height;

    var accent = getComputedStyle(document.documentElement)
                   .getPropertyValue('--accent').trim() || '#e8631c';

    function drawMatrix() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = accent;
      ctx.font = '11px monospace';
      for (var j = 0; j < drops.length; j++) {
        var word = words[Math.floor(Math.random() * words.length)];
        ctx.fillText(word, j * 80, drops[j]);
        if (drops[j] > canvas.height && Math.random() > 0.97) drops[j] = 0;
        drops[j] += 14;
      }
    }

    var matrixInterval = setInterval(drawMatrix, 80);

    window.addEventListener('resize', function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    /* Stop matrix after 15s to save perf — subtle intro only */
    setTimeout(function() {
      clearInterval(matrixInterval);
      if (canvas && canvas.parentNode) {
        canvas.style.transition = 'opacity 2s';
        canvas.style.opacity = '0';
        setTimeout(function() {
          if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }, 2100);
      }
    }, 15000);
  }

  /* ── PARALLAX SCROLL ───────────────────────────────────── */
  function initParallax() {
    if (reduced) return;
    var hero = qs('section');
    if (!hero) return;

    var h1 = qs('h1', hero);
    var searchBox = qs('.search-box-polish', hero);
    if (h1) h1.classList.add('hr-parallax-slow');
    if (searchBox) searchBox.classList.add('hr-parallax-fast');

    window.addEventListener('scroll', function() {
      var scrollY = window.pageYOffset;
      if (h1) h1.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
      if (searchBox) searchBox.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
    }, { passive: true });
  }

  /* ── NUMBER COUNTER ANIMATION ──────────────────────────── */
  function initCounters() {
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    var stats = qsa('.stat-val-polish');
    stats.forEach(function(el) {
      var text = el.textContent.trim();
      var num = parseFloat(text.replace(/[^0-9.]/g, ''));
      var suffix = text.replace(/[0-9.]/g, '');
      if (isNaN(num) || num === 0) return;

      el.classList.add('hr-count-up');
      el.setAttribute('data-target', num);
      el.setAttribute('data-suffix', suffix);
      el.textContent = '0' + suffix;

      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          var start = 0;
          var duration = 1500;
          var startTime = null;
          var target = parseFloat(el.getAttribute('data-target'));
          var suf = el.getAttribute('data-suffix');

          function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var val = Math.round(eased * target * 10) / 10;
            el.textContent = (val % 1 === 0 ? val : val.toFixed(1)) + suf;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.5 });

      obs.observe(el);
    });
  }

  /* ── MAGNETIC BUTTONS ──────────────────────────────────── */
  function initMagnetic() {
    if (reduced) return;
    var btns = qsa('header button, .search-btn-polish, [class*="rounded-full"][class*="bg-\\[var(--accent)\\]"]');
    btns.forEach(function(btn) {
      btn.classList.add('hr-magnetic');
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) * 0.25;
        var dy = (e.clientY - cy) * 0.25;
        btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transform = '';
      });
    });
  }

  /* ── SEARCH CONFETTI ───────────────────────────────────── */
  function initSearchConfetti() {
    if (reduced) return;
    var searchBtn = qs('.search-btn-polish');
    if (!searchBtn || searchBtn._hrConfettiWired) return;
    searchBtn._hrConfettiWired = true;

    searchBtn.addEventListener('click', function(e) {
      spawnConfetti(e.clientX, e.clientY, 30);
    });
  }

  function spawnConfetti(x, y, count) {
    var colors = ['var(--accent)', 'var(--good)', '#FFD700', '#FF6B9D', '#7C3AED'];
    for (var i = 0; i < count; i++) {
      (function() {
        var piece = document.createElement('div');
        piece.className = 'hr-confetti-piece';
        var angle = rnd(0, Math.PI * 2);
        var dist = rnd(60, 200);
        piece.style.left = x + 'px';
        piece.style.top = y + 'px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.setProperty('--cx', (Math.cos(angle) * dist) + 'px');
        piece.style.setProperty('--cy', (Math.sin(angle) * dist - rnd(50, 150)) + 'px');
        piece.style.setProperty('--cr', rnd(-360, 360) + 'deg');
        piece.style.animationDuration = rnd(0.6, 1.2) + 's';
        piece.style.animationDelay = rnd(0, 0.2) + 's';
        piece.style.width = rnd(6, 12) + 'px';
        piece.style.height = rnd(6, 12) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(piece);
        setTimeout(function() {
          if (piece && piece.parentNode) piece.parentNode.removeChild(piece);
        }, 1500);
      })();
    }
  }

  /* ── 3D CARD FLIP ON HOVER ─────────────────────────────── */
  function initCardFlip() {
    if (reduced) return;
    var cards = qsa('[id^="hotel-card-"]');
    cards.forEach(function(card) {
      if (card._hrFlipWired) return;
      card._hrFlipWired = true;
      card.classList.add('hr-flip-wrapper');
      var inner = document.createElement('div');
      inner.className = 'hr-flip-inner';
      while (card.firstChild) inner.appendChild(card.firstChild);
      card.appendChild(inner);
    });
  }

  /* ── HEADER MORPH ON SCROLL ────────────────────────────── */
  function initHeaderMorph() {
    var header = qs('header');
    if (!header) return;
    window.addEventListener('scroll', function() {
      var scrollY = window.pageYOffset;
      if (scrollY > 60) header.classList.add('hr-morph-small');
      else header.classList.remove('hr-morph-small');
    }, { passive: true });
  }

  /* ── MENU WAVE ITEMS ───────────────────────────────────── */
  function initMenuWave() {
    if (reduced) return;
    var navItems = qsa('header nav a, header nav button');
    navItems.forEach(function(item, i) {
      item.classList.add('hr-wave-item');
      item.style.animationDelay = (i * 0.15) + 's';
      item.classList.add('hr-nav-stagger');
      item.style.animationDelay = (i * 0.08) + 's';
    });
  }

  /* ── CURSOR TRAIL ──────────────────────────────────────── */
  function initCursorTrail() {
    if (reduced) return;
    var trail = [];
    var trailLen = 8;

    for (var i = 0; i < trailLen; i++) {
      var dot = document.createElement('div');
      dot.style.cssText = [
        'position:fixed',
        'width:' + (8 - i) + 'px',
        'height:' + (8 - i) + 'px',
        'border-radius:50%',
        'background:var(--accent)',
        'pointer-events:none',
        'z-index:9997',
        'opacity:' + ((trailLen - i) / trailLen * 0.4),
        'transform:translate(-50%,-50%)',
        'transition:left ' + (0.05 + i * 0.04) + 's, top ' + (0.05 + i * 0.04) + 's',
        'will-change:left,top'
      ].join(';');
      document.body.appendChild(dot);
      trail.push(dot);
    }

    document.addEventListener('mousemove', function(e) {
      trail.forEach(function(dot) {
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
      });
    }, { passive: true });
  }

  /* ── SECTION REVEAL with stagger ──────────────────────── */
  function initSectionStagger() {
    if (reduced || typeof IntersectionObserver === 'undefined') return;
    var items = qsa('.footer-trust-badge, .stat-item-polish, .footer-link');
    items.forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.5s ' + (i * 0.06) + 's ease-out, transform 0.5s ' + (i * 0.06) + 's ease-out';
    });

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(function(el) { obs.observe(el); });
  }

  /* ── HOVER TILT on cards ───────────────────────────────── */
  function initCardTilt() {
    if (reduced) return;
    document.addEventListener('mousemove', function(e) {
      var card = e.target && e.target.closest && e.target.closest('[id^="hotel-card-"]');
      if (!card) return;
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var rx = ((e.clientY - cy) / rect.height) * 6;
      var ry = -((e.clientX - cx) / rect.width) * 6;
      card.style.transform = 'translateY(-3px) perspective(600px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    }, { passive: true });

    document.addEventListener('mouseleave', function(e) {
      var card = e.target && e.target.closest && e.target.closest('[id^="hotel-card-"]');
      if (!card) return;
      card.style.transform = '';
    }, { passive: true });
  }

  /* ── MAIN INIT v2 ──────────────────────────────────────── */
  function initV2() {
    try { initSplash(); } catch(e) {}
    try { initAurora(); } catch(e) {}
    try { initMesh(); } catch(e) {}
    try { initMatrix(); } catch(e) {}
    try { initParallax(); } catch(e) {}
    try { initCounters(); } catch(e) {}
    try { initMagnetic(); } catch(e) {}
    try { initSearchConfetti(); } catch(e) {}
    try { initCardFlip(); } catch(e) {}
    try { initHeaderMorph(); } catch(e) {}
    try { initMenuWave(); } catch(e) {}
    try { initCursorTrail(); } catch(e) {}
    try { initSectionStagger(); } catch(e) {}
    try { initCardTilt(); } catch(e) {}
  }

  /* Re-run card animations when React re-renders */
  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(function(mutations) {
      var hasCards = mutations.some(function(m) {
        return Array.prototype.some.call(m.addedNodes, function(n) {
          return n.nodeType === 1 && n.id && n.id.indexOf('hotel-card-') === 0;
        });
      });
      if (hasCards) {
        try { initCardFlip(); } catch(e) {}
        try { initMagnetic(); } catch(e) {}
        try { initSearchConfetti(); } catch(e) {}
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* Boot */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(initV2, 200); });
  } else {
    setTimeout(initV2, 200);
  }

})();
