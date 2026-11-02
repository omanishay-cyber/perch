/* Perch site: plain JS, no framework. Motion uses transform and opacity only, and stops for reduced motion. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  var $ = function (s, el) { return (el || doc).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };

  /* ---------- theme switch (the first paint is set in <head>) ---------- */
  var toggle = $("[data-theme-toggle]");
  function syncThemeUi() {
    var dark = root.classList.contains("dark");
    if (toggle) toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    $$('meta[name="theme-color"]').forEach(function (m) { m.setAttribute("content", dark ? "#080f1f" : "#f2f5f9"); });
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var dark = root.classList.toggle("dark");
      try { localStorage.setItem("perch-theme", dark ? "dark" : "light"); } catch (e) {}
      syncThemeUi();
    });
  }
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    var saved = null;
    try { saved = localStorage.getItem("perch-theme"); } catch (err) {}
    if (saved) return;
    root.classList.toggle("dark", e.matches);
    syncThemeUi();
  });
  syncThemeUi();

  /* ---------- clocks: the visitor's real time ---------- */
  var fmtLocal = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  function fmtZone(tz) {
    try { return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: tz }); }
    catch (e) { return null; }
  }
  var zoneFmts = {};
  function tick() {
    var now = new Date();
    $$("[data-clock]").forEach(function (el) { el.textContent = fmtLocal.format(now); });
    $$("[data-clock-tz]").forEach(function (el) {
      var tz = el.getAttribute("data-clock-tz");
      if (!(tz in zoneFmts)) zoneFmts[tz] = fmtZone(tz);
      if (zoneFmts[tz]) el.textContent = zoneFmts[tz].format(now);
    });
  }
  tick();
  setTimeout(function () { tick(); setInterval(tick, 60000); }, (60 - new Date().getSeconds()) * 1000 + 50);

  /* ---------- hero: the notch opens as you scroll ---------- */
  var hero = $("[data-hero]");
  var heroQueued = false;
  function heroFrame() {
    heroQueued = false;
    if (!hero || reduce.matches) return;
    var r = hero.getBoundingClientRect();
    var span = hero.offsetHeight - innerHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, -r.top / (span * 0.62))) : 1;
    hero.style.setProperty("--p", p.toFixed(4));
  }
  function onScroll() { if (!heroQueued) { heroQueued = true; requestAnimationFrame(heroFrame); } }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  reduce.addEventListener("change", function () { if (hero) hero.style.removeProperty("--p"); onScroll(); });
  heroFrame();

  /* ---------- acts: the pinned stage follows the chapter in view ---------- */
  var stage = $("[data-stage]");
  var acts = $$("[data-act]");
  if (stage && acts.length && "IntersectionObserver" in window) {
    var actIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) stage.setAttribute("data-scene", en.target.getAttribute("data-act"));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    acts.forEach(function (a) { actIo.observe(a); });
  }

  /* ---------- dock: magnification under the cursor (transform only) ---------- */
  $$("[data-magnify]").forEach(function (dock) {
    var bg = $(".dock-bg", dock);
    var parts = $$(".dock-item, .dock-sep", dock);
    var raf = 0, px = null;
    function visible() { return parts.filter(function (el) { return el.offsetParent !== null; }); }
    function apply() {
      raf = 0;
      var list = visible();
      if (!list.length) return;
      var dockRect = dock.getBoundingClientRect();
      var base = list[0].offsetWidth;
      var reach = base * 2.7, max = 0.78;
      var extras = list.map(function (el) {
        if (px === null || el.classList.contains("dock-sep")) return 0;
        var c = dockRect.left + el.offsetLeft + el.offsetWidth / 2;
        var d = Math.abs(px - c);
        var f = d < reach ? (Math.cos(Math.PI * d / reach) + 1) / 2 : 0;
        return base * max * f;
      });
      var total = extras.reduce(function (a, b) { return a + b; }, 0);
      var run = 0;
      list.forEach(function (el, i) {
        var shift = run + extras[i] / 2 - total / 2;
        run += extras[i];
        var s = 1 + extras[i] / base;
        el.style.transform = "translateX(" + shift.toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      });
      if (bg) bg.style.transform = "scaleX(" + ((dock.offsetWidth + total) / dock.offsetWidth).toFixed(4) + ")";
    }
    function queue() { if (!raf) raf = requestAnimationFrame(apply); }
    dock.addEventListener("pointermove", function (e) {
      if (reduce.matches) return;
      if (e.pointerType === "mouse" && !finePointer.matches) return;
      dock.classList.add("is-mag");
      px = e.clientX; queue();
    });
    dock.addEventListener("pointerleave", function () {
      dock.classList.remove("is-mag");
      px = null; queue();
    });
    dock.addEventListener("pointerup", function (e) {
      if (e.pointerType !== "mouse") { dock.classList.remove("is-mag"); px = null; queue(); }
    });
  });

  /* ---------- Start menu design chips ---------- */
  var sm = $(".sm");
  $$("[data-chips] button").forEach(function (b, _, all) {
    b.addEventListener("click", function () {
      all.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      if (sm) sm.setAttribute("data-design", b.getAttribute("data-design"));
    });
  });
  var suggHead = $("[data-sugg-head]");
  if (suggHead) {
    var h = new Date().getHours();
    var part = h < 12 ? "this morning" : h < 18 ? "this afternoon" : "this evening";
    suggHead.firstChild.nodeValue = "Suggested " + part;
  }

  /* ---------- notch looks ---------- */
  var looks = $("[data-looks]");
  $$("[data-seg] button").forEach(function (b, _, all) {
    b.addEventListener("click", function () {
      all.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      if (looks) looks.setAttribute("data-look", b.getAttribute("data-look"));
    });
  });

  /* ---------- living weather: the sky follows the visitor's clock ---------- */
  var sky = $("[data-sky]");
  function todOf(hour) { return hour >= 5 && hour < 8 ? "dawn" : hour >= 8 && hour < 17 ? "day" : hour >= 17 && hour < 20 ? "dusk" : "night"; }
  function tempAt(hour) { return Math.round(14 + 7 * Math.sin(((hour - 9) / 24) * 2 * Math.PI)); }
  function iconAt(hour, i) {
    var t = todOf(hour);
    if (i === 4) return "w-rain";
    if (t === "night") return i === 2 ? "w-cloud" : "w-moon";
    if (t === "dawn" || t === "dusk") return "w-part";
    return i % 3 === 1 ? "w-part" : "w-sun";
  }
  function paintSky() {
    if (!sky) return;
    var now = new Date(), hour = now.getHours() + now.getMinutes() / 60;
    var tod = todOf(now.getHours());
    sky.setAttribute("data-tod", tod);
    var isDay = hour >= 6 && hour < 18;
    var arc = isDay ? (hour - 6) / 12 : ((hour + 6) % 24) / 12;
    var orb = $("[data-orb]", sky);
    if (orb) orb.style.setProperty("--orb-rot", (-70 + arc * 140).toFixed(1) + "deg");
    var labels = { dawn: "Clearing at sunrise", day: "Partly cloudy", dusk: "Clear at sunset", night: "Clear tonight" };
    var temps = [];
    for (var k = 0; k < 24; k++) temps.push(tempAt(k));
    var hi = Math.max.apply(null, temps), lo = Math.min.apply(null, temps);
    $("[data-wx-temp]", sky).textContent = tempAt(now.getHours()) + "°";
    $("[data-wx-label]", sky).textContent = labels[tod] + " · H " + hi + "° L " + lo + "°";
    var strip = $("[data-hourly]");
    if (strip) {
      var hourFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric" });
      var html = "";
      for (var i = 0; i < 8; i++) {
        var d = new Date(now.getTime() + i * 3600000), hh = d.getHours();
        html += '<div class="' + (i === 0 ? "now" : "") + '">' + (i === 0 ? "Now" : hourFmt.format(d)) +
          '<svg aria-hidden="true"><use href="#' + iconAt(hh, i) + '"/></svg><b>' + tempAt(hh) + "°</b></div>";
      }
      strip.innerHTML = html;
    }
  }
  paintSky();
  setInterval(paintSky, 300000);

  /* ---------- reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -12% 0px" });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- real screenshots: list a file in assets/shots/shots.json and it replaces the recreation ---------- */
  if (location.protocol !== "file:") {
    fetch("assets/shots/shots.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) {
      if (!m || !Array.isArray(m.ready)) return;
      $$("[data-shot]").forEach(function (scene) {
        var name = scene.getAttribute("data-shot");
        if (m.ready.indexOf(name) === -1) return;
        var img = new Image();
        img.className = "shot-img"; img.alt = ""; img.decoding = "async"; img.loading = "lazy";
        img.src = "assets/shots/" + name;
        scene.appendChild(img);
      });
    }).catch(function () {});
  }
})();
