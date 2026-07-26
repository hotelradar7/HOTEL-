/* ============================================================
   HOTELRADAR MOTION SYSTEM v3 — MEGA (append to app.js end)
   index.html untouched · React-safe · double-load guarded
   ============================================================ */
(function () {
  "use strict";
  if (window.__hrMotionLoaded) return;
  window.__hrMotionLoaded = true;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var GUESTS = ["Aarav","Priya","Rohan","Sanya","Vikram","Meera","Arjun","Kavya","Rahul","Neha","Aditya","Pooja","Ishaan","Divya"];
  var CITIES = ["Mumbai","Delhi","Ahmedabad","Jaipur","Pune","Kolkata","Surat","Lucknow","Chandigarh","Indore"];
  var TEMPLATES = [
    function (n, g, c) { return "🔔 <b>" + g + "</b> from " + c + " just viewed <b>" + n + "</b>"; },
    function (n) { return "📞 <b>" + n + "</b> received a direct call · zero commission"; },
    function (n, g) { return "✅ " + g + " confirmed a photo-verified stay at <b>" + n + "</b>"; },
    function (n, g, c) { return "❤️ <b>" + g + "</b> from " + c + " saved <b>" + n + "</b> to wishlist"; },
    function (n) { return "⭐ New genuine review posted at <b>" + n + "</b>"; }
  ];
  var SEARCH_PHRASES = ["Ganga View hotels in Haridwar…","Ashrams near Rishikesh…","Budget stays under ₹1,500…","Family hotels in Mussoorie…","Couple-friendly stays in Delhi…","Resorts with mountain view…"];
  var MARQUEE_CITIES = ["Haridwar","Rishikesh","Mussoorie","Dehradun","Delhi","Agra","Jaipur","Goa","Mumbai","Varanasi","Ujjain","Amritsar","Kedarnath","Puri"];
  var FLOATERS = ["🏨","📍","⛰️","🛕","🎈","🧭"];
  var FALLBACK_HOTELS = ["Ganga Darshan Palace","Himalayan Retreat & Spa","Shanti Kunj Dharamshala","Mussoorie Heights Resort","Taj View Imperial","Anand Yoga Ashram"];
  var HEARTS = ["❤️","🧡","💛","💚"];
  var SPARKS = ["✨","⭐","💫","🌟"];

  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function byText(sel, txt) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (els[i].textContent.trim().indexOf(txt) === 0) return els[i];
    return null;
  }
  function poll(fn, tries, gap) {
    tries = tries || 40; gap = gap || 250;
    var n = 0;
    (function tick() { if (fn()) return; if (++n < tries) setTimeout(tick, gap); })();
  }

  /* ---------- 1 · ambient + fireflies + comets ---------- */
  function injectAmbient() {
    var amb = document.createElement("div");
    amb.className = "hr-ambient";
    amb.setAttribute("aria-hidden", "true");
    var html = '<div class="hr-spot"></div><div class="hr-radar"></div><div class="hr-glow"></div>';
    [[18,22],[70,14],[84,62],[10,74]].forEach(function (p, i) {
      html += '<div class="hr-ping" style="left:' + p[0] + '%;top:' + p[1] + '%;--dl:' + (i * .85) + 's"><i></i></div>';
    });
    for (var i = 0; i < 6; i++) {
      html += '<span class="hr-float" style="left:' + (6 + Math.random() * 88) + '%;top:' + (8 + Math.random() * 80) + '%;--fs:' + (16 + Math.random() * 14) + 'px;--d:' + (7 + Math.random() * 6) + 's;--dl:-' + (Math.random() * 8) + 's">' + FLOATERS[i] + "</span>";
    }
    for (var f = 0; f < 7; f++) {
      html += '<span class="hr-fly" style="left:' + (Math.random() * 96) + '%;--d:' + (11 + Math.random() * 9) + 's;--dl:-' + (Math.random() * 14) + 's"></span>';
    }
    amb.innerHTML = html;
    document.body.prepend(amb);

    /* comets */
    setInterval(function () {
      if (document.hidden) return;
      var c = document.createElement("i");
      c.className = "hr-comet";
      c.style.top = (5 + Math.random() * 45) + "%";
      c.style.animationDuration = (2.4 + Math.random() * 1.6) + "s";
      amb.appendChild(c);
      setTimeout(function () { c.remove(); }, 4200);
    }, 6500);

    /* mouse parallax + spotlight */
    var raf = null;
    addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        amb.style.setProperty("--px", (e.clientX / innerWidth - .5) * 2);
        amb.style.setProperty("--py", (e.clientY / innerHeight - .5) * 2);
        amb.style.setProperty("--mx", e.clientX + "px");
        amb.style.setProperty("--my", e.clientY + "px");
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- 2 · progress + header + back-to-top ring ---------- */
  function injectProgress() {
    var bar = document.createElement("div");
    bar.className = "hr-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var raf = null;
    addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - innerHeight;
        var p = max > 0 ? scrollY / max : 0;
        bar.style.transform = "scaleX(" + p + ")";
        var header = document.querySelector("header");
        if (header) header.classList.toggle("m-scrolled", scrollY > 10);
        var btt = document.querySelector('[aria-label="Back to top"]');
        if (btt) btt.style.setProperty("--sp", p);
        parallaxTick();
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- 3 · LIVE ticker ---------- */
  function hotelNames() {
    var names = [];
    document.querySelectorAll('[id^="hotel-card-"] h3').forEach(function (h) { if (h.textContent.trim()) names.push(h.textContent.trim()); });
    return names.length ? names : FALLBACK_HOTELS;
  }
  function tickerGroupHTML() {
    var names = hotelNames(), items = [];
    for (var i = 0; i < 8; i++) {
      items.push('<span class="hr-ticker-item">' + rnd(TEMPLATES)(rnd(names), rnd(GUESTS), rnd(CITIES)) + '</span><span class="hr-ticker-sep">✦</span>');
    }
    return '<div class="hr-ticker-group">' + items.join("") + "</div>";
  }
  function injectTicker() {
    poll(function () {
      var header = document.querySelector("header");
      if (!header) return false;
      var ticker = document.createElement("div");
      ticker.className = "hr-ticker";
      ticker.setAttribute("aria-hidden", "true");
      ticker.innerHTML = '<div class="hr-live">LIVE</div><div class="hr-ticker-viewport"><div class="hr-ticker-track"></div></div>';
      header.insertAdjacentElement("afterend", ticker);
      var track = ticker.querySelector(".hr-ticker-track");
      var fill = function () { var g = tickerGroupHTML(); track.innerHTML = g + g; };
      fill();
      setInterval(fill, 30000);
      return true;
    });
  }

  /* ---------- 4 · cities marquee ---------- */
  function injectCitiesMarquee() {
    poll(function () {
      var footer = document.querySelector("footer");
      if (!footer) return false;
      var strip = document.createElement("div");
      strip.className = "hr-cities";
      strip.setAttribute("aria-hidden", "true");
      var items = MARQUEE_CITIES.map(function (c) { return "<span>📍 " + c + "</span>"; }).join("");
      strip.innerHTML = '<div class="hr-cities-track">' + items + items + "</div>";
      footer.insertAdjacentElement("beforebegin", strip);
      return true;
    });
  }

  /* ---------- 5 · reveals + tagging ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("m-in"); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });

  function tagReveal(el, delay, variant) {
    if (!el || el.classList.contains("m-reveal")) return;
    el.classList.add("m-reveal");
    if (variant) el.classList.add(variant);
    el.style.setProperty("--m-delay", (delay || 0) + "ms");
    io.observe(el);
  }

  var plx = [];
  function parallaxTick() {
    for (var i = 0; i < plx.length; i++) {
      var el = plx[i];
      var r = el.getBoundingClientRect();
      var c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.setProperty("--py", (c * -30 * parseFloat(el.dataset.pf)) + "px");
    }
  }

  function tagPage() {
    /* cards: reveal + book pill + spotlight */
    document.querySelectorAll('[id^="hotel-card-"]:not(.m-card-done)').forEach(function (card, i) {
      tagReveal(card, (i % 4) * 80);
      var divs = card.querySelectorAll("div");
      for (var d = 0; d < divs.length; d++) {
        if (divs[d].textContent.trim() === "Book Now") { divs[d].classList.add("m-book-pill"); break; }
      }
      if (card.querySelector('[class*="bg-amber-500"]')) card.classList.add("m-spotlight");
      card.classList.add("m-card-done");
    });
    /* headings */
    document.querySelectorAll("main h2:not(.m-heading)").forEach(function (h) { h.classList.add("m-heading"); tagReveal(h); });
    document.querySelectorAll(".eyebrow:not(.m-reveal), .stat-item-polish:not(.m-reveal)").forEach(function (el, i) {
      tagReveal(el, (i % 6) * 60, el.classList.contains("stat-item-polish") ? "m-zoom" : "");
    });
    document.querySelectorAll(".chip-polish:not(.m-chip-i)").forEach(function (el, i) {
      el.classList.add("m-chip-i");
      el.style.setProperty("--i", i % 8);
      tagReveal(el, i * 45);
    });
    /* verified sonar (first 6) */
    document.querySelectorAll('[id^="hotel-card-"] [class*="bg-emerald-500"]:not(.m-verified)').forEach(function (b, i) {
      if (i < 6) b.classList.add("m-verified");
    });
    /* pulsing CTAs */
    document.querySelectorAll("button:not(.m-cta-scanned)").forEach(function (btn) {
      btn.classList.add("m-cta-scanned");
      if (/Book Now|List Your Hotel|Compare Now|Send Message|Confirm Booking/i.test(btn.textContent || "")) btn.classList.add("m-cta-live");
    });
    /* logo ring */
    var logo = document.querySelector('header a[href="index.html"] > div');
    if (logo) logo.classList.add("m-logo");

    /* trust bar */
    var secs = document.querySelectorAll("section");
    for (var s = 0; s < secs.length; s++) {
      if (secs[s].textContent.indexOf("Photo-verified listings") > -1 && !secs[s].classList.contains("m-trust")) {
        secs[s].classList.add("m-trust"); tagReveal(secs[s]);
      }
    }
    /* cities */
    var cityH = byText("h2", "Popular Cities");
    if (cityH) {
      var sec = cityH.closest("section");
      sec.querySelectorAll("button").forEach(function (b, i) {
        if (!b.classList.contains("m-city")) {
          b.classList.add("m-city");
          b.style.setProperty("--dl", (i * .7) + "s");
          tagReveal(b, (i % 6) * 70);
          var em = b.querySelector('span[class*="text-3xl"]');
          if (em && !em.classList.contains("m-parallax")) {
            em.classList.add("m-parallax");
            em.dataset.pf = (0.1 + Math.random() * 0.12).toFixed(2);
            plx.push(em);
          }
        }
      });
    }
    /* why cards */
    var whyH = byText("h2", "Why HotelRadar");
    if (whyH) {
      whyH.closest("section").querySelectorAll(".grid > div").forEach(function (c, i) {
        if (!c.classList.contains("m-why")) { c.classList.add("m-why"); tagReveal(c, i * 90); }
      });
    }
    /* testimonials */
    var testiH = byText("h2", "What travelers say");
    if (testiH) {
      var tsec = testiH.closest("section");
      tsec.querySelectorAll(".w-64").forEach(function (c, i) {
        if (!c.classList.contains("m-testi")) { c.classList.add("m-testi"); tagReveal(c, i * 80); }
      });
      startTestimonialDrift(tsec.querySelector(".overflow-x-auto"));
    }
    /* LIVE badge on Featured */
    var featH = byText("h2", "Featured Hotels");
    if (featH && !featH.parentElement.querySelector(".m-live-mini")) {
      var badge = document.createElement("span");
      badge.className = "m-live-mini";
      badge.textContent = "Live";
      featH.insertAdjacentElement("afterend", badge);
    }
    /* flame on Trending */
    var trendH = byText("h2", "Trending stays");
    if (trendH && !trendH.querySelector(".m-flame")) {
      var fl = document.createElement("span");
      fl.className = "m-flame";
      fl.textContent = "🔥";
      trendH.appendChild(fl);
    }
    /* List-Your-Hotel band */
    var listH = byText("h2", "List Your Hotel on HotelRadar");
    if (listH) {
      var lsec = listH.closest("section");
      if (lsec && !lsec.classList.contains("m-cta-band")) lsec.classList.add("m-cta-band");
    }
    /* scroll hint */
    var stats = document.querySelector(".stats-row-polish");
    if (stats && !document.querySelector(".hr-scroll-hint")) {
      var hint = document.createElement("div");
      hint.className = "hr-scroll-hint";
      hint.setAttribute("aria-hidden", "true");
      hint.innerHTML = '<span>Scroll<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>';
      stats.insertAdjacentElement("afterend", hint);
    }
  }

  /* ---------- 6 · testimonial auto-drift ---------- */
  var drifting = new WeakSet();
  function startTestimonialDrift(el) {
    if (!el || drifting.has(el)) return;
    drifting.add(el);
    var hover = false, visible = false;
    el.addEventListener("pointerenter", function () { hover = true; }, { passive: true });
    el.addEventListener("pointerleave", function () { hover = false; }, { passive: true });
    el.addEventListener("touchstart", function () { hover = true; setTimeout(function () { hover = false; }, 4000); }, { passive: true });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: .2 }).observe(el);
    var last = performance.now();
    (function loop(now) {
      var dt = now - last; last = now;
      if (visible && !hover) {
        el.scrollLeft += dt * .02;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) el.scrollLeft = 0;
      }
      requestAnimationFrame(loop);
    })(last);
  }

  /* ---------- 7 · typewriter ---------- */
  function startTypewriter(input) {
    if (input.dataset.tw) return;
    input.dataset.tw = "1";
    var pi = 0, ci = 0, del = false;
    (function tick() {
      if (!input.isConnected) return;
      var full = SEARCH_PHRASES[pi];
      ci += del ? -1 : 1;
      input.setAttribute("placeholder", full.slice(0, ci));
      var wait = del ? 24 : 50;
      if (!del && ci === full.length) { wait = 2300; del = true; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % SEARCH_PHRASES.length; wait = 420; }
      setTimeout(tick, wait);
    })();
  }

  /* ---------- 8 · page transitions ---------- */
  function pageEnter() {
    var main = document.querySelector("main");
    if (!main) return;
    main.classList.remove("m-page-in");
    void main.offsetWidth;
    main.classList.add("m-page-in");
  }
  addEventListener("popstate", function () { setTimeout(pageEnter, 30); });

  /* ---------- 9 · drawer stagger ---------- */
  function tagDrawer() {
    document.querySelectorAll(".animate-slide-left nav a, .animate-slide-left nav button").forEach(function (el, i) {
      el.style.setProperty("--i", i);
    });
  }

  /* ---------- 10 · ripple ---------- */
  document.addEventListener("pointerdown", function (e) {
    var host = e.target.closest("button, .chip-polish");
    if (!host) return;
    var r = host.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 1.1;
    var s = document.createElement("span");
    s.className = "m-ripple";
    s.style.cssText = "width:" + size + "px;height:" + size + "px;left:" + (e.clientX - r.left - size / 2) + "px;top:" + (e.clientY - r.top - size / 2) + "px";
    host.classList.add("m-rip-host");
    host.appendChild(s);
    setTimeout(function () { s.remove(); }, 650);
  });

  /* ---------- 11 · 3D tilt on category icons ---------- */
  if (matchMedia("(pointer: fine)").matches) {
    document.addEventListener("pointermove", function (e) {
      var icon = e.target.closest(".cat-icon-polish");
      if (!icon) return;
      var r = icon.getBoundingClientRect();
      icon.style.setProperty("--tx", ((e.clientX - r.left) / r.width - .5) * 14 + "deg");
      icon.style.setProperty("--ty", -((e.clientY - r.top) / r.height - .5) * 14 + "deg");
    }, { passive: true });
    document.addEventListener("pointerout", function (e) {
      var icon = e.target.closest(".cat-icon-polish");
      if (!icon) return;
      icon.style.setProperty("--tx", "0deg");
      icon.style.setProperty("--ty", "0deg");
    }, { passive: true });
  }

  /* ---------- 12 · NEW: card cursor glow ---------- */
  document.addEventListener("pointermove", function (e) {
    var card = e.target.closest('[id^="hotel-card-"]');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty("--cx", (e.clientX - r.left) + "px");
    card.style.setProperty("--cy", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* ---------- 13 · NEW: emoji particle bursts ---------- */
  function burst(x, y, glyphs) {
    for (var i = 0; i < 8; i++) {
      var s = document.createElement("span");
      s.className = "hr-burst";
      s.textContent = rnd(glyphs);
      var a = (Math.PI * 2 * i) / 8 + Math.random() * .5;
      var d = 34 + Math.random() * 32;
      s.style.setProperty("--dx", Math.cos(a) * d + "px");
      s.style.setProperty("--dy", (Math.sin(a) * d - 22) + "px");
      s.style.left = x + "px";
      s.style.top = y + "px";
      document.body.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 750); })(s);
    }
  }
  document.addEventListener("pointerdown", function (e) {
    var w = e.target.closest('[id^="wishlist-btn-"]');
    if (w) { var r = w.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, HEARTS); return; }
    var b = e.target.closest("button");
    if (b && /Book Now|Confirm Booking|Send Message/i.test(b.textContent || "")) {
      var r2 = b.getBoundingClientRect();
      burst(r2.left + r2.width / 2, r2.top + r2.height / 2, SPARKS);
    }
  });

  /* ---------- 14 · MutationObserver (React re-render safe) ---------- */
  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      tagPage();
      tagDrawer();
      document.querySelectorAll('input[placeholder*="Search hotel"], .search-input-polish').forEach(startTypewriter);
    });
  }
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) if (muts[i].addedNodes.length) { schedule(); break; }
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------- boot ---------- */
  function boot() {
    injectAmbient();
    injectProgress();
    injectTicker();
    injectCitiesMarquee();
    schedule();
    pageEnter();
  }
  document.body ? boot() : document.addEventListener("DOMContentLoaded", boot);
})();