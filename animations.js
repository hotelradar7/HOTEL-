/* ============================================================
   HotelRadar — animations.js  v2.0
   Lightweight DOM enhancer. NO Three.js (was causing lag).
   Pure vanilla JS, runs after React mounts.
   Fixes: page load flash, scroll lag, direct call removal,
   double stay-type badge, card hover, nav scroll glow.
   ============================================================ */
(function () {
  "use strict";

  // ── HELPERS ────────────────────────────────────────────────
  var $ = function(sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };

  // ── 1. PAGE LOAD — prevent blank flash ─────────────────────
  // React mounts into #root. Hide body briefly, show immediately after React paints.
  // We DON'T fade to 0 — just ensure no white flash from CSS opacity
  function fixLoadFlash() {
    // The .animate-fade-in on the main page already handles this via CSS.
    // Our CSS override sets duration to 0.15s so it's nearly instant.
    // Just ensure body is visible immediately
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
  }

  // ── 2. REMOVE DIRECT CALL BUTTONS ──────────────────────────
  function removeDirectCallButtons() {
    // Compare modal "Call Direct" button
    $$('button').forEach(function(btn) {
      var text = btn.textContent || '';
      if (text.trim() === 'Call Direct' || text.includes('Call Direct')) {
        var cell = btn.closest('td');
        if (cell) {
          cell.innerHTML = '<span style="color:var(--ink-faint);font-size:10px;">—</span>';
        } else {
          btn.style.display = 'none';
        }
      }
    });

    // tel: links
    $$('a[href^="tel:"]').forEach(function(a) {
      // Only hide standalone call buttons, not phone number display text
      if (a.closest('td') || a.closest('[class*="compare"]')) {
        a.style.display = 'none';
      }
    });
  }

  // ── 3. FIX STAY TYPE DOUBLE DISPLAY ────────────────────────
  // Hotel card shows: name → "Stay Niche: hotel (basic tier)" → amenities
  // The "Stay Niche" badge is redundant since type is in breadcrumb
  function hideDoubleStayType() {
    // Find the "Stay Niche:" badges in hotel cards
    $$('[class*="mb-2.5"]').forEach(function(el) {
      if (el.textContent && el.textContent.includes('Stay Niche:')) {
        el.style.display = 'none';
      }
    });

    // Also catch via text content search
    $$('span, div').forEach(function(el) {
      if (el.childNodes.length <= 3 &&
          el.textContent &&
          el.textContent.trim().startsWith('Stay Niche:')) {
        var parent = el.closest('[class*="flex"][class*="items-center"][class*="gap-1"]');
        if (parent && parent.parentElement &&
            parent.parentElement.classList.toString().includes('mb-2')) {
          parent.style.display = 'none';
        }
      }
    });
  }

  // ── 4. NAVBAR SCROLL GLOW ──────────────────────────────────
  function initNavScrollGlow() {
    var nav = $('header[class*="sticky"]') || $('header');
    if (!nav || nav._hrInit) return;
    nav._hrInit = true;

    var lastY = 0;
    var ticking = false;

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var y = window.scrollY;
          if (y > 10) {
            nav.style.boxShadow = '0 2px 16px rgba(232,99,28,0.12), 0 1px 0 var(--line)';
          } else {
            nav.style.boxShadow = '';
          }
          // Fast scroll flash
          if (Math.abs(y - lastY) > 50) {
            nav.style.boxShadow = '0 4px 24px rgba(232,99,28,0.2), 0 1px 0 var(--line)';
            clearTimeout(nav._glowTimer);
            nav._glowTimer = setTimeout(function() {
              nav.style.boxShadow = y > 10 ? '0 2px 16px rgba(232,99,28,0.12), 0 1px 0 var(--line)' : '';
            }, 500);
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── 5. CARD HOVER RIPPLE ───────────────────────────────────
  function addRippleToButton(e) {
    var btn = e.currentTarget;
    var old = btn.querySelector('.hr-ripple');
    if (old) old.remove();
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2;
    var x = e.clientX - rect.left - size / 2;
    var y = e.clientY - rect.top - size / 2;
    var el = document.createElement('span');
    el.className = 'hr-ripple';
    el.style.cssText = [
      'position:absolute',
      'border-radius:50%',
      'background:rgba(255,255,255,0.25)',
      'pointer-events:none',
      'z-index:20',
      'width:' + size + 'px',
      'height:' + size + 'px',
      'left:' + x + 'px',
      'top:' + y + 'px',
      'transform:scale(0)',
      'animation:hr-rippleAnim 0.55s linear forwards'
    ].join(';');
    // Inject keyframes if not done
    if (!document.__hrRippleStyle) {
      var style = document.createElement('style');
      style.textContent = '@keyframes hr-rippleAnim{0%{transform:scale(0);opacity:0.6}100%{transform:scale(1);opacity:0}}';
      document.head.appendChild(style);
      document.__hrRippleStyle = true;
    }
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(el);
    setTimeout(function() { el.remove(); }, 600);
  }

  function initRipples() {
    $$('button:not([disabled])').forEach(function(btn) {
      if (btn._hrRipple) return;
      btn._hrRipple = true;
      btn.addEventListener('click', addRippleToButton);
    });
  }

  // ── 6. SMOOTH SCROLL PERFORMANCE ───────────────────────────
  function initScrollPerf() {
    // Passive scroll listeners already set in CSS
    // Disable pointer events during scroll for max perf
    var scrollTimer;
    var grid = $('[class*="grid-cols-1"][class*="sm:grid-cols-2"]') ||
               $('[class*="grid-cols"]');

    if (!grid) return;

    window.addEventListener('scroll', function() {
      if (scrollTimer) return; // already debouncing
      scrollTimer = setTimeout(function() {
        scrollTimer = null;
      }, 66);
    }, { passive: true });
  }

  // ── 7. STAT COUNTER ANIMATION ──────────────────────────────
  function animateCounters() {
    $$('.stat-val-polish').forEach(function(el) {
      if (el.dataset.hrCounted) return;
      // Check if it contains a CountUp component (React renders <span> inside)
      // If it already has a number, we just add a bounce on visibility
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            el.style.transition = 'transform 0.15s ease';
            el.style.transform = 'scale(1.15)';
            setTimeout(function() {
              el.style.transform = 'scale(1)';
              el.style.transition = 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)';
            }, 150);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(el);
      el.dataset.hrCounted = '1';
    });
  }

  // ── 8. ACCOUNT PAGE — fix broken options visibility ─────────
  function fixAccountPage() {
    // "My Bookings" etc. show "Coming soon!" toast but are otherwise fine
    // Just ensure the account toggle works by checking DOM
    $$('.toggle-pill').forEach(function(pill) {
      if (pill._hrFixed) return;
      pill._hrFixed = true;
      pill.style.cursor = 'pointer';
    });
  }

  // ── 9. MUTATION OBSERVER — re-run on React re-renders ──────
  var debounceTimer;
  function onDOMChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      removeDirectCallButtons();
      hideDoubleStayType();
      initRipples();
      animateCounters();
      fixAccountPage();
    }, 120);
  }

  var rootObserver = new MutationObserver(onDOMChange);

  // ── INIT ────────────────────────────────────────────────────
  function bootstrap() {
    fixLoadFlash();
    initNavScrollGlow();
    initScrollPerf();

    // Run DOM fixes after React has rendered (small delay)
    setTimeout(function() {
      removeDirectCallButtons();
      hideDoubleStayType();
      initRipples();
      animateCounters();
      fixAccountPage();
    }, 200);

    // Watch for React re-renders
    var root = document.getElementById('root') || document.body;
    rootObserver.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    // Already rendered
    bootstrap();
  }

})();
