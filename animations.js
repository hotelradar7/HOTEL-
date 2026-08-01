/* ============================================================
   HotelRadar — animations.js
   Runs AFTER React has rendered. Uses MutationObserver to
   watch for new DOM nodes and applies 3D / animation effects
   to the existing site without touching React state or bundle.
   ============================================================ */

(function () {
  "use strict";

  /* ── UTILS ─────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;

  function getAccentRGB() {
    const theme = document.documentElement.dataset.theme || "day";
    if (theme === "night")   return [255, 122, 61];
    if (theme === "emerald") return [13, 122, 74];
    if (theme === "indigo")  return [79, 70, 229];
    return [232, 99, 28];
  }
  function getAccentHex() {
    const [r, g, b] = getAccentRGB();
    return (r << 16) | (g << 8) | b;
  }

  /* ── PAGE FADE-IN ───────────────────────────────────────── */
  function initPageReveal() {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.45s ease";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => { document.body.style.opacity = "1"; })
    );
  }

  /* ── RIPPLE ON BUTTONS ──────────────────────────────────── */
  function addRipple(btn, clientX, clientY) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = clientX - rect.left - size / 2;
    const y = clientY - rect.top  - size / 2;
    const el = document.createElement("span");
    el.className = "hr-ripple-wave";
    el.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }
  function initRipples() {
    document.addEventListener("click", e => {
      const btn = e.target.closest(
        "button, .search-btn-polish, .chip-polish, .cat-icon-polish, .footer-social-btn"
      );
      if (btn) addRipple(btn, e.clientX, e.clientY);
    }, { passive: true });
  }

  /* ── NAVBAR SCROLL GLOW ─────────────────────────────────── */
  function initNavbar() {
    const nav = $("nav, header, [class*='sticky top-0']");
    if (!nav) return;
    nav.classList.add("hr-nav-enhanced");

    const brand = nav.querySelector("[class*='font-serif'], [class*='font-bold']");
    if (brand) {
      const icon = brand.querySelector("span");
      if (icon) icon.classList.add("hr-nav-brand-icon");
    }

    let lastY = 0;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      nav.classList.toggle("scrolled", y > 10);
      const diff = Math.abs(y - lastY);
      if (diff > 25) {
        nav.style.boxShadow = `0 4px 24px rgba(${getAccentRGB().join(",")},0.18), 0 1px 0 var(--line)`;
        clearTimeout(nav._hr_timer);
        nav._hr_timer = setTimeout(() => { nav.style.boxShadow = ""; }, 700);
      }
      lastY = y;
    }, { passive: true });
  }

  /* ── HERO SECTION ───────────────────────────────────────── */
  function initHero() {
    const eyebrow = $(".eyebrow");
    if (!eyebrow) return;
    const heroSection = eyebrow.closest("section, div[class*='py-8'], div[class*='py-12']");
    if (!heroSection) return;

    heroSection.style.position = "relative";
    heroSection.style.overflow = "hidden";
    heroSection.classList.add("hr-hero-wrap");

    // Morphing blobs
    ["hr-blob hr-blob-1", "hr-blob hr-blob-2"].forEach(cls => {
      const key = cls.split(" ")[1];
      if (heroSection.querySelector("." + key)) return;
      const blob = document.createElement("div");
      blob.className = cls;
      heroSection.insertBefore(blob, heroSection.firstChild);
    });

    // Orbit particles
    if (!heroSection.querySelector(".hr-orbit-wrap")) {
      const wrap = document.createElement("div");
      wrap.className = "hr-orbit-wrap";
      wrap.innerHTML = `<div class="hr-orbit-dot"></div>
                        <div class="hr-orbit-dot"></div>
                        <div class="hr-orbit-dot"></div>`;
      heroSection.insertBefore(wrap, heroSection.firstChild);
    }

    eyebrow.classList.add("hr-anim-eyebrow");

    const h1 = heroSection.querySelector("h1");
    if (h1) h1.classList.add("hr-anim-h1");

    const sub = heroSection.querySelector("p");
    if (sub) sub.classList.add("hr-anim-sub");

    if (typeof THREE !== "undefined") injectGlobe(heroSection);
  }

  /* ── THREE.JS GLOBE ─────────────────────────────────────── */
  function injectGlobe(heroSection) {
    if (heroSection.querySelector("#hr-three-canvas-wrap")) return;

    const wrap = document.createElement("div");
    wrap.id = "hr-three-canvas-wrap";
    heroSection.insertBefore(wrap, heroSection.firstChild);

    const W = wrap.clientWidth  || window.innerWidth;
    const H = Math.min(window.innerHeight * 0.7, 500);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
    camera.position.set(0, 0.4, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    wrap.appendChild(renderer.domElement);

    // Globe wireframe
    const globeMat = new THREE.MeshBasicMaterial({
      color: getAccentHex(), wireframe: true, transparent: true, opacity: 0.11
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(2.4, 44, 44), globeMat);
    scene.add(globe);

    // Atmosphere halo
    const haloMat = new THREE.MeshBasicMaterial({
      color: getAccentHex(), transparent: true, opacity: 0.028, side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.65, 32, 32), haloMat));

    // Radar rings
    const rings = [
      { r: 3.0, op: 0.22, speed: 0.0009, dir:  1 },
      { r: 3.55, op: 0.13, speed: 0.0014, dir: -1 },
      { r: 4.1,  op: 0.08, speed: 0.0007, dir:  1 },
    ].map(cfg => {
      const mat = new THREE.MeshBasicMaterial({
        color: getAccentHex(), transparent: true, opacity: cfg.op
      });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, 0.013, 8, 120), mat);
      mesh.rotation.x = Math.PI / 2 + Math.random() * 0.35;
      mesh.rotation.z = Math.random() * 0.6;
      scene.add(mesh);
      return { mesh, mat, speed: cfg.speed, dir: cfg.dir };
    });

    // Radar sweep arm
    const sweepGrp = new THREE.Group();
    const sweepMat = new THREE.MeshBasicMaterial({
      color: getAccentHex(), transparent: true, opacity: 0.5, side: THREE.DoubleSide
    });
    const sweepArm = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.035), sweepMat);
    sweepArm.position.x = 1.6;
    sweepGrp.add(sweepArm);
    for (let t = 1; t <= 5; t++) {
      const tMat = new THREE.MeshBasicMaterial({
        color: getAccentHex(), transparent: true, opacity: 0.045 / t, side: THREE.DoubleSide
      });
      const trail = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.035), tMat);
      trail.rotation.z = -t * 0.2;
      trail.position.x = 1.6;
      sweepGrp.add(trail);
    }
    scene.add(sweepGrp);

    // City pins
    const cities = [
      { lat: 29.9457, lng: 78.1642 }, // Haridwar
      { lat: 30.0869, lng: 78.2676 }, // Rishikesh
      { lat: 30.4598, lng: 78.0644 }, // Mussoorie
      { lat: 28.7041, lng: 77.1025 }, // Delhi
      { lat: 27.1767, lng: 78.0081 }, // Agra
      { lat: 30.3165, lng: 78.0322 }, // Dehradun
    ];
    const pins = [];
    const cityVecs = [];

    cities.forEach(city => {
      const phi   = (90 - city.lat) * (Math.PI / 180);
      const theta = (city.lng + 180) * (Math.PI / 180);
      const x = -2.4 * Math.sin(phi) * Math.cos(theta);
      const y =  2.4 * Math.cos(phi);
      const z =  2.4 * Math.sin(phi) * Math.sin(theta);
      cityVecs.push(new THREE.Vector3(x, y, z));

      const pinMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xff6b35 })
      );
      pinMesh.position.set(x, y, z);
      scene.add(pinMesh);

      const glowMat = new THREE.MeshBasicMaterial({ color: getAccentHex(), transparent: true, opacity: 0.28 });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), glowMat);
      glow.position.set(x, y, z);
      scene.add(glow);

      const outerMat = new THREE.MeshBasicMaterial({ color: getAccentHex(), transparent: true, opacity: 0.08 });
      const outer = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), outerMat);
      outer.position.set(x, y, z);
      scene.add(outer);

      pins.push({ glow, outer, glowMat, outerMat, offset: Math.random() * Math.PI * 2 });
    });

    // Curved city arcs
    const arcMat = new THREE.LineBasicMaterial({ color: getAccentHex(), transparent: true, opacity: 0.1 });
    [[0,1],[1,2],[0,3],[3,4],[2,5],[0,5]].forEach(([a, b]) => {
      if (!cityVecs[a] || !cityVecs[b]) return;
      const pts = [];
      const fromN = cityVecs[a].clone().normalize();
      const toN   = cityVecs[b].clone().normalize();
      for (let s = 0; s <= 22; s++) {
        const t = s / 22;
        pts.push(
          new THREE.Vector3().lerpVectors(fromN, toN, t)
            .normalize().multiplyScalar(2.44 + Math.sin(Math.PI * t) * 0.1)
        );
      }
      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts), arcMat.clone()
      ));
    });

    // Particles
    function makeParticles(count, spread, size, opacity) {
      const pos = new Float32Array(count * 3);
      const vel = [];
      for (let i = 0; i < count; i++) {
        pos[i*3]   = (Math.random()-0.5)*spread;
        pos[i*3+1] = (Math.random()-0.5)*spread;
        pos[i*3+2] = (Math.random()-0.5)*spread;
        vel.push({
          x: (Math.random()-0.5)*0.004,
          y: (Math.random()-0.5)*0.003,
          z: (Math.random()-0.5)*0.004
        });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: getAccentHex(), size, transparent: true, opacity });
      return { pts: new THREE.Points(geo, mat), vel, count, bound: spread/2 };
    }
    const nearPar = makeParticles(180, 16, 0.048, 0.65);
    const farPar  = makeParticles(350, 38, 0.022, 0.3);
    scene.add(nearPar.pts);
    scene.add(farPar.pts);

    // Floating cubes
    const cubes = [
      { pos:[-4.2, 1.4, -3.2], color: 0xe8631c },
      { pos:[ 4.0,-1.0, -2.8], color: 0xf59e0b },
      { pos:[-3.2,-1.8, -3.8], color: 0x10b981 },
      { pos:[ 3.6, 2.2, -3.4], color: 0x6366f1 },
    ].map(({ pos, color }) => {
      const geo  = new THREE.BoxGeometry(0.28, 0.28, 0.28);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.55 }));
      const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe:true, transparent:true, opacity:0.35 }));
      mesh.position.set(...pos);
      wire.position.set(...pos);
      mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
      wire.rotation.copy(mesh.rotation);
      scene.add(mesh); scene.add(wire);
      return { mesh, wire, baseY: pos[1], offset: Math.random()*Math.PI*2 };
    });

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dl = new THREE.DirectionalLight(0xffffff, 0.35);
    dl.position.set(5, 8, 5);
    scene.add(dl);
    const pl = new THREE.PointLight(getAccentHex(), 1.4, 14);
    pl.position.set(0, 0, 5);
    scene.add(pl);

    // Mouse parallax
    let mxT = 0, myT = 0, mxC = 0, myC = 0;
    window.addEventListener("mousemove", e => {
      mxT = (e.clientX / innerWidth  - 0.5) * 2;
      myT = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    // Theme color sync
    window._hrUpdateGlobeColors = function () {
      const c = getAccentHex();
      globeMat.color.setHex(c);
      haloMat.color.setHex(c);
      rings.forEach(r => r.mat.color.setHex(c));
      sweepMat.color.setHex(c);
      nearPar.pts.material.color.setHex(c);
      farPar.pts.material.color.setHex(c);
      pl.color.setHex(c);
      pins.forEach(p => { p.glowMat.color.setHex(c); p.outerMat.color.setHex(c); });
    };

    // Animation loop
    let frame = 0;
    function animate() {
      requestAnimationFrame(animate);
      frame++;
      const t = Date.now() * 0.001;

      mxC = lerp(mxC, mxT, 0.045);
      myC = lerp(myC, myT, 0.045);

      globe.rotation.y += 0.0017;
      globe.rotation.x += 0.0004;
      rings.forEach(r => { r.mesh.rotation.z += r.speed * r.dir; });
      sweepGrp.rotation.z += 0.019;
      sweepMat.opacity = 0.38 + Math.sin(t * 2.8) * 0.14;

      pins.forEach(p => {
        const wave = Math.sin(t * 1.9 + p.offset);
        const s = 1 + wave * 0.35;
        p.glow.scale.set(s, s, s);
        p.glowMat.opacity = 0.15 + wave * 0.18;
        const os = 1 + Math.sin(t * 1.3 + p.offset + 1) * 0.5;
        p.outer.scale.set(os, os, os);
        p.outerMat.opacity = Math.max(0, 0.06 - Math.sin(t * 1.3 + p.offset) * 0.05);
      });

      pl.intensity = 1.2 + Math.sin(t * 2.2) * 0.4;

      cubes.forEach(c => {
        const fy = c.baseY + Math.sin(t * 0.65 + c.offset) * 0.35;
        c.mesh.position.y = fy;
        c.wire.position.y = fy;
        c.mesh.rotation.x += 0.005;
        c.mesh.rotation.y += 0.007;
        c.wire.rotation.copy(c.mesh.rotation);
      });

      function animPar({ pts, vel, count, bound }) {
        const pos = pts.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
          pos[i*3]   += vel[i].x;
          pos[i*3+1] += vel[i].y;
          pos[i*3+2] += vel[i].z;
          if (Math.abs(pos[i*3])   > bound) vel[i].x *= -1;
          if (Math.abs(pos[i*3+1]) > bound) vel[i].y *= -1;
          if (Math.abs(pos[i*3+2]) > bound) vel[i].z *= -1;
        }
        pts.geometry.attributes.position.needsUpdate = true;
      }
      animPar(nearPar);
      if (frame % 2 === 0) animPar(farPar);

      camera.position.x = lerp(camera.position.x, mxC * 0.55, 0.03);
      camera.position.y = lerp(camera.position.y, 0.4 - myC * 0.35, 0.03);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      const nw = wrap.clientWidth || innerWidth;
      const nh = Math.min(innerHeight * 0.7, 500);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  }

  /* ── 3D TILT ON HOTEL CARDS ─────────────────────────────── */
  function initCardTilt(card) {
    if (card._hrTilt) return;
    card._hrTilt = true;
    card.classList.add("hr-card-init");

    if (!card.querySelector(".hr-glare")) {
      const glare = document.createElement("div");
      glare.className = "hr-glare";
      card.style.position = "relative";
      card.appendChild(glare);
    }

    let curX = 0, curY = 0, tarX = 0, tarY = 0, raf = null, hovered = false;

    function smooth() {
      curX = lerp(curX, tarX, 0.1);
      curY = lerp(curY, tarY, 0.1);
      const ty = hovered ? -6 : 0;
      const sc = hovered ? 1.025 : 1;
      card.style.transform =
        `perspective(860px) rotateX(${curY}deg) rotateY(${curX}deg) translateY(${ty}px) scale(${sc})`;
      if (Math.abs(curX - tarX) > 0.01 || Math.abs(curY - tarY) > 0.01) {
        raf = requestAnimationFrame(smooth);
      } else if (!hovered) {
        card.style.transform = "";
        raf = null;
      }
    }

    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      tarX = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) * 13;
      tarY = -((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * 13;
      const glare = card.querySelector(".hr-glare");
      if (glare) {
        glare.style.setProperty("--gx", `${((e.clientX - r.left) / r.width)  * 100}%`);
        glare.style.setProperty("--gy", `${((e.clientY - r.top)  / r.height) * 100}%`);
        glare.style.setProperty("--go", "1");
      }
      if (!raf) raf = requestAnimationFrame(smooth);
    }, { passive: true });

    card.addEventListener("mouseenter", () => { hovered = true; });
    card.addEventListener("mouseleave", () => {
      hovered = false; tarX = 0; tarY = 0;
      const glare = card.querySelector(".hr-glare");
      if (glare) glare.style.setProperty("--go", "0");
      if (!raf) raf = requestAnimationFrame(smooth);
    });
  }

  /* ── CARD IMAGE SHINE ───────────────────────────────────── */
  function initCardImageShine(card) {
    if (card._hrShine) return;
    card._hrShine = true;
    const imgWrap = card.querySelector("[class*='relative w-full overflow-hidden']");
    if (imgWrap) imgWrap.classList.add("hr-card-img-wrap");
    const imgBg = card.querySelector("[class*='absolute inset-0 flex items-center justify-center']");
    if (imgBg) imgBg.classList.add("hr-img-zoom");
  }

  /* ── BADGE GLOW ─────────────────────────────────────────── */
  function initBadges(card) {
    if (card._hrBadge) return;
    card._hrBadge = true;
    card.querySelectorAll("[class*='rounded-full'][class*='text-white'], [class*='rounded-md'][class*='text-white']").forEach(badge => {
      const txt = (badge.textContent || "").trim();
      if (/verified|✓|check/i.test(txt)) badge.classList.add("hr-badge-verified");
      if (/featured|star|★/i.test(txt))   badge.classList.add("hr-badge-featured");
    });
  }

  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const delay = (card._hrRevealIdx || 0) * 65;
      card.style.transition =
        `opacity 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms,
         transform 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms`;
      card.classList.add("hr-card-visible");
      card.classList.remove("hr-card-hidden");
      cardObserver.unobserve(card);
    });
  }, { threshold: 0.06, rootMargin: "0px 0px -20px 0px" });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("hr-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  /* ── STICKY FILTER BAR ──────────────────────────────────── */
  function initFilterBar() {
    const bar = $("[class*='sticky top-[56px]']");
    if (!bar || bar._hrFilter) return;
    bar._hrFilter = true;
    bar.classList.add("hr-filter-bar");
    new IntersectionObserver(([e]) => {
      bar.classList.toggle("elevated", e.intersectionRatio < 1);
    }, { threshold: [1], rootMargin: "-57px 0px 0px 0px" }).observe(bar);
  }

  /* ── FOOTER REVEAL ──────────────────────────────────────── */
  function initFooter() {
    const footer = $("footer") || $("[class*='border-t'][class*='bg-[var(--card)]']:last-of-type");
    if (!footer || footer._hrFooter) return;
    footer._hrFooter = true;
    footer.classList.add("hr-reveal");
    revealObserver.observe(footer);
  }

  /* ── PROCESS HOTEL CARDS ────────────────────────────────── */
  let cardRevealIdx = 0;
  function processCard(card) {
    if (card._hrDone) return;
    card._hrDone = true;
    card._hrRevealIdx = cardRevealIdx++;
    card.classList.add("hr-card-hidden");
    cardObserver.observe(card);
    initCardTilt(card);
    initCardImageShine(card);
    initBadges(card);
  }

  function findAndProcessCards() {
    $$("[class*='group relative flex flex-col overflow-hidden bg-[var(--card)]']").forEach(processCard);
  }

  /* ── STAT COUNTER ANIMATION ─────────────────────────────── */
  function initCounters() {
    $$(".stat-val-polish").forEach(el => {
      if (el._hrCounted) return;
      el._hrCounted = true;
      const text  = el.textContent.trim();
      const match = text.match(/(\d+)/);
      if (!match) return;
      const target = parseInt(match[1]);
      const suffix = text.replace(/\d/g, "").trim();
      let cur = 0;
      const steps = 45;
      const timer = setInterval(() => {
        cur += Math.max(1, Math.ceil(target / steps));
        if (cur >= target) {
          cur = target;
          clearInterval(timer);
          el.style.transition = "transform 0.15s ease";
          el.style.transform  = "scale(1.18)";
          setTimeout(() => {
            el.style.transition = "transform 0.35s cubic-bezier(.2,.8,.2,1)";
            el.style.transform  = "scale(1)";
          }, 150);
        }
        el.textContent = cur + suffix;
      }, 1100 / steps);
    });
  }

  /* ── THEME WATCHER ──────────────────────────────────────── */
  function watchTheme() {
    new MutationObserver(() => {
      if (typeof window._hrUpdateGlobeColors === "function") {
        window._hrUpdateGlobeColors();
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ── MUTATION OBSERVER (React re-renders) ───────────────── */
  function startMutationObserver() {
    let timer = null;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        findAndProcessCards();
        initFilterBar();
        initFooter();
        initCounters();
      }, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ── BOOT ───────────────────────────────────────────────── */
  function initAll() {
    initPageReveal();
    initRipples();
    initNavbar();
    initHero();
    watchTheme();
    findAndProcessCards();
    initFilterBar();
    initFooter();
    initCounters();
    startMutationObserver();
  }

  function loadThreeAndInit() {
    if (typeof THREE !== "undefined") { initAll(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload  = initAll;
    s.onerror = initAll; // fallback: init without globe
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(loadThreeAndInit, 200));
  } else {
    setTimeout(loadThreeAndInit, 200);
  }

})();
