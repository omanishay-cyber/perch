/* Perch site: plain JS, no framework. Motion uses transform and opacity (plus one clip-path reveal on the
   notch), and stops for reduced motion. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  var $ = function (s, el) { return (el || doc).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };

  /* ---------- theme (the first paint is set in <head>) ---------- */
  var toggle = $("[data-theme-toggle]");
  function syncThemeUi() {
    var dark = root.classList.contains("dark");
    if (toggle) toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    $$('meta[name="theme-color"]').forEach(function (m) { m.setAttribute("content", dark ? "#080f1f" : "#eef2f7"); });
    // the fans carry a light and a dark picture where the app has both
    $$("img[data-light]").forEach(function (im) {
      var next = dark ? im.getAttribute("data-dark") : im.getAttribute("data-light");
      if (im.getAttribute("src") !== next) im.setAttribute("src", next);
    });
  }
  if (toggle) toggle.addEventListener("click", function () {
    var dark = root.classList.toggle("dark");
    try { localStorage.setItem("perch-theme", dark ? "dark" : "light"); } catch (e) {}
    syncThemeUi();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    var saved = null;
    try { saved = localStorage.getItem("perch-theme"); } catch (err) {}
    if (saved) return;
    root.classList.toggle("dark", e.matches);
    syncThemeUi();
  });
  syncThemeUi();

  /* ---------- the visitor's real clock in the notch ---------- */
  var fmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  function tick() { $$("[data-clock]").forEach(function (el) { el.textContent = fmt.format(new Date()); }); }
  tick();
  setTimeout(function () { tick(); setInterval(tick, 60000); }, (60 - new Date().getSeconds()) * 1000 + 50);

  /* ---------- the notch: opens on the hero, closes when you scroll on, opens again on hover ---------- */
  var wrap = $("[data-island]"), hero = $("[data-hero]"), overHero = true, hoverTimer = 0, hovering = false, startOpen = false;
  function syncIsland() { if (wrap) wrap.classList.toggle("is-open", (overHero && !startOpen) || hovering); }
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      overHero = es[0].intersectionRatio > 0.72;
      syncIsland();
    }, { threshold: [0, 0.72, 1] }).observe(hero);
  }
  if (wrap && finePointer.matches) {
    var isl = $(".island", wrap);
    isl.addEventListener("pointerenter", function () { clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { hovering = true; syncIsland(); }, 140); });
    isl.addEventListener("pointerleave", function () { clearTimeout(hoverTimer); hoverTimer = setTimeout(function () { hovering = false; syncIsland(); }, 260); });
  }
  var menuBtn = $("[data-menu]");
  if (menuBtn && wrap) {
    menuBtn.addEventListener("click", function () {
      var on = wrap.classList.toggle("is-menu");
      menuBtn.setAttribute("aria-expanded", String(on));
    });
    $$(".island-menu a", wrap).forEach(function (a) { a.addEventListener("click", function () { wrap.classList.remove("is-menu"); menuBtn.setAttribute("aria-expanded", "false"); }); });
  }
  addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (wrap && wrap.classList.contains("is-menu")) { wrap.classList.remove("is-menu"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
  });

  /* ---------- first paint: the page arrives once ---------- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { if (hero) hero.classList.add("is-in"); }); });

  /* ---------- parallax: slow, transform only ---------- */
  var heroPlate = $("[data-hero-plate]");
  var scrollers = $$("[data-parallax]");
  var mx = 0, my = 0, cx = 0, cy = 0, sy = 0, rafOn = false;
  function frame() {
    rafOn = false;
    if (reduce.matches) return;
    var vh = innerHeight;
    sy = scrollY;
    cx += (mx - cx) * 0.05; cy += (my - cy) * 0.05;
    if (heroPlate && sy < vh * 1.2) heroPlate.style.transform = "translate3d(" + (cx * -14).toFixed(2) + "px," + ((cy * -8) + sy * 0.14).toFixed(2) + "px,0)";
    scrollers.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      var p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
      el.style.setProperty("--p", p.toFixed(4));
    });
    if (Math.abs(mx - cx) > 0.002 || Math.abs(my - cy) > 0.002) ask();
  }
  function ask() { if (!rafOn) { rafOn = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask, { passive: true });
  if (finePointer.matches) addEventListener("pointermove", function (e) {
    if (scrollY > innerHeight) return;
    mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; ask();
  }, { passive: true });
  ask();

  /* ---------- dock: magnification with real icons, the app's cosine falloff, transform only ---------- */
  $$("[data-magnify]").forEach(function (dock) {
    var bg = $(".dock-bg", dock);
    var parts = $$(".dock-item, .dock-sep", dock);
    var raf = 0, px = null;
    function visible() { return parts.filter(function (el) { return el.offsetParent !== null; }); }
    function apply() {
      raf = 0;
      var list = visible();
      if (!list.length) return;
      var left = dock.getBoundingClientRect().left;
      var base = list[0].offsetWidth, reach = base * 3, max = 0.9;
      var extras = list.map(function (el) {
        if (px === null || el.classList.contains("dock-sep")) return 0;
        var c = left + el.offsetLeft + el.offsetWidth / 2;
        var d = Math.abs(px - c);
        var f = d < reach ? (Math.cos(Math.PI * d / reach) + 1) / 2 : 0;
        return base * max * f;
      });
      var total = extras.reduce(function (a, b) { return a + b; }, 0), run = 0;
      list.forEach(function (el, i) {
        var shift = run + extras[i] / 2 - total / 2;
        run += extras[i];
        el.style.transform = "translateX(" + shift.toFixed(2) + "px) scale(" + (1 + extras[i] / base).toFixed(4) + ")";
      });
      if (bg) bg.style.transform = "scaleX(" + ((dock.offsetWidth + total) / dock.offsetWidth).toFixed(4) + ")";
    }
    function queue() { if (!raf) raf = requestAnimationFrame(apply); }
    dock.addEventListener("pointermove", function (e) {
      if (reduce.matches || e.pointerType !== "mouse") return;
      dock.classList.add("is-mag");
      px = e.clientX; queue();
    });
    dock.addEventListener("pointerleave", function () { dock.classList.remove("is-mag"); px = null; queue(); });
    addEventListener("resize", function () { px = null; queue(); }, { passive: true });
  });

  /* ---------- the dock's Start button opens the real Start menu ---------- */
  var startBtn = $("[data-start-btn]"), startPanel = $("[data-start-panel]");
  function setStart(on, refocus) {
    if (!startPanel) return;
    startPanel.classList.toggle("is-open", on);
    startBtn.setAttribute("aria-expanded", String(on));
    if (hero) hero.classList.toggle("is-start", on);
    startOpen = on; syncIsland();
    if (!on && refocus) startBtn.focus();
  }
  if (startBtn && startPanel) {
    startBtn.addEventListener("click", function (e) { e.stopPropagation(); setStart(!startPanel.classList.contains("is-open")); });
    doc.addEventListener("click", function (e) { if (!startPanel.contains(e.target)) setStart(false); });
    addEventListener("keydown", function (e) { if (e.key === "Escape" && startPanel.classList.contains("is-open")) setStart(false, true); });
  }

  /* ---------- scroll reveal, once ---------- */
  var rv = $$(".rv");
  if ("IntersectionObserver" in window && !reduce.matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("is-in"); });

  /* ---------- card stacks: hover or click fans them out; one comes to the front; keyboard works ---------- */
  function setupFan(fan) {
    var stage = $(".fan-stage", fan);
    var cards = $$(".fan-card", fan);
    var names = $$(".fan-names button", fan);
    var capB = $(".fan-caption b", fan), capS = $(".fan-caption span", fan);
    var n = cards.length, sel = 0, spread = false;

    function layout() {
      if (reduce.matches) { fan.classList.add("is-grid"); return; }
      fan.classList.remove("is-grid");
      var w = cards[0].offsetWidth, vw = stage.offsetWidth;
      var open = spread || n <= 3;
      var room = Math.max(0, (vw - w) / 2);
      // how far the nearest and the farthest cards sit from the front one
      var far = Math.max(1, Math.floor((n - 1) / 2));
      var stepOpen = Math.min(w * 0.3, room / far);
      var step = open ? stepOpen : Math.min(w * 0.05, 16);
      var turn = open ? Math.min(3.2, 22 / far) : 1.1;
      cards.forEach(function (c, i) {
        // the signed distance round the ring, so the front one always has cards on both sides
        var d = ((i - sel + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
        var a = Math.abs(d);
        c.style.setProperty("--x", (d * step).toFixed(1) + "px");
        c.style.setProperty("--y", (a * (open ? w * 0.012 : 2) + (i === sel ? 0 : 6)).toFixed(1) + "px");
        c.style.setProperty("--r", (d * turn).toFixed(2) + "deg");
        c.style.setProperty("--s", (1 - a * (open ? 0.018 : 0.012)).toFixed(3));
        c.style.setProperty("--z", String(100 - a));
        c.setAttribute("aria-pressed", String(i === sel));
        c.tabIndex = i === sel ? 0 : -1;
      });
      names.forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === sel)); });
    }
    function pick(i, focus) {
      sel = (i + n) % n;
      if (capB) capB.textContent = cards[sel].getAttribute("data-name");
      if (capS) capS.textContent = cards[sel].getAttribute("data-hint");
      layout();
      if (focus) cards[sel].focus({ preventScroll: true });
    }
    cards.forEach(function (c, i) { c.addEventListener("click", function () { spread = true; pick(i); }); });
    names.forEach(function (b, i) { b.addEventListener("click", function () { spread = true; pick(i); }); });
    fan.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { spread = true; layout(); } });
    fan.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { spread = false; layout(); } });
    fan.addEventListener("focusin", function () { spread = true; layout(); });
    fan.addEventListener("focusout", function (e) { if (!fan.contains(e.relatedTarget)) { spread = false; layout(); } });
    fan.addEventListener("keydown", function (e) {
      if (!e.target.classList.contains("fan-card")) return;
      var k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); pick(sel + 1, true); }
      else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); pick(sel - 1, true); }
      else if (k === "Home") { e.preventDefault(); pick(0, true); }
      else if (k === "End") { e.preventDefault(); pick(n - 1, true); }
    });
    // a swipe on touch
    var sx = null;
    stage.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") sx = e.clientX; });
    stage.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 36) { spread = true; pick(sel + (dx < 0 ? 1 : -1)); }
    });
    reduce.addEventListener("change", layout);
    addEventListener("resize", layout, { passive: true });
    pick(0);
    // the picture fan opens by itself once when it comes into view, then closes back
    if ("IntersectionObserver" in window && !reduce.matches) {
      var once = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { once.disconnect(); spread = true; layout(); setTimeout(function () { if (!fan.matches(":hover") && !fan.contains(doc.activeElement)) { spread = false; layout(); } }, 1700); }
      }, { threshold: 0.55 });
      once.observe(stage);
    }
  }
  $$("[data-fan]").forEach(setupFan);
})();
