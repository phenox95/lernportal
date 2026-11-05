/* Präsentation · Steuerung
   - Pfeiltasten, Leertaste, Klicker (Bild auf/ab), Wischen, Knöpfe
   - P: Referentenansicht (Notizen, Uhr, Zeitplan) in neuem Fenster, synchron
   - N: Notizen als Schublade, F: Vollbild, ?: Hilfe
   Tastaturaktionen werden nicht animiert, Zeigereingaben schon (kurz, ease-out). */
(function () {
  "use strict";

  var root = document.documentElement;
  var deck = document.getElementById("deck");
  var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
  var dock = document.getElementById("dock");
  var drawer = document.getElementById("drawer");
  var help = document.getElementById("help");
  var params = new URLSearchParams(location.search);
  var isPresenter = params.has("presenter");
  var cur = 0;
  var presWin = null;
  var chan = null;
  try { chan = new BroadcastChannel("energie-deck-geo9"); } catch (e) { chan = null; }

  root.dataset.input = "pointer";
  document.addEventListener("keydown", function () { root.dataset.input = "key"; }, true);
  document.addEventListener("pointerdown", function () { root.dataset.input = "pointer"; }, true);

  function $(id) { return document.getElementById(id); }
  function clamp(i) { return Math.max(0, Math.min(slides.length - 1, i)); }
  function info(i) {
    var s = slides[i];
    return {
      title: s.dataset.title, phase: s.dataset.phase, start: +s.dataset.start, time: s.dataset.time,
      notes: s.querySelector(".notes").innerHTML
    };
  }

  /* ---------- Navigation ---------- */
  function render() {
    slides.forEach(function (s, i) {
      var on = i === cur;
      s.classList.toggle("active", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
      if (on) s.removeAttribute("inert"); else s.setAttribute("inert", "");
    });
    $("count").textContent = (cur + 1) + " / " + slides.length;
    $("prev").disabled = cur === 0;
    $("next").disabled = cur === slides.length - 1;
    var d = info(cur);
    $("drawerTitle").textContent = d.title;
    $("drawerText").innerHTML = d.notes;
    document.title = d.title + " · Erneuerbare Energien · Geografie 9";
    if (history.replaceState) history.replaceState(null, "", "#" + (cur + 1));
    if (isPresenter) renderPresenter();
  }
  function go(i, remote) {
    i = clamp(i);
    if (i === cur && !remote) return;
    cur = i;
    render();
    slides[cur].scrollTop = 0;
    if (!remote) broadcast();
  }
  function broadcast() {
    var msg = { t: "go", i: cur };
    if (chan) chan.postMessage(msg);
    try { if (presWin && !presWin.closed) presWin.postMessage(msg, "*"); } catch (e) {}
    try { if (window.opener) window.opener.postMessage(msg, "*"); } catch (e) {}
  }
  if (chan) chan.onmessage = function (e) { if (e.data && e.data.t === "go") go(e.data.i, true); };
  window.addEventListener("message", function (e) { if (e.data && e.data.t === "go" && typeof e.data.i === "number") go(e.data.i, true); });

  /* ---------- Dock: blendet sich aus, wenn die Maus ruht ---------- */
  var hideTimer = null;
  function showDock() {
    dock.classList.remove("hide"); deck.classList.remove("cursor-hide");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (!drawer.classList.contains("open") && !help.classList.contains("open")) { dock.classList.add("hide"); deck.classList.add("cursor-hide"); }
    }, 2600);
  }
  ["pointermove", "pointerdown", "touchstart"].forEach(function (ev) { document.addEventListener(ev, showDock, { passive: true }); });
  dock.addEventListener("focusin", showDock);

  $("prev").addEventListener("click", function () { go(cur - 1); });
  $("next").addEventListener("click", function () { go(cur + 1); });
  $("btnNotes").addEventListener("click", toggleNotes);
  $("btnHelp").addEventListener("click", toggleHelp);

  function toggleNotes() { drawer.classList.toggle("open"); drawer.setAttribute("aria-hidden", drawer.classList.contains("open") ? "false" : "true"); showDock(); }
  function toggleHelp() { help.classList.toggle("open"); }
  help.addEventListener("click", function (e) { if (e.target === help) toggleHelp(); });

  /* ---------- Tastatur ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && e.target.matches && e.target.matches("input, textarea")) return;
    var k = e.key;
    if (help.classList.contains("open")) { if (k === "Escape" || k === "?" || k === "Enter") { e.preventDefault(); toggleHelp(); } return; }
    var sl = slides[cur], scrolls = sl.scrollHeight > sl.clientHeight + 4;
    if (k === "ArrowRight" || k === " " || k === "PageDown" || (k === "ArrowDown" && !scrolls)) { e.preventDefault(); if (!e.repeat) go(cur + 1); }
    else if (k === "ArrowLeft" || k === "PageUp" || k === "Backspace" || (k === "ArrowUp" && !scrolls)) { e.preventDefault(); if (!e.repeat) go(cur - 1); }
    else if (k === "Home") go(0);
    else if (k === "End") go(slides.length - 1);
    else if (k === "n" || k === "N") toggleNotes();
    else if (k === "f" || k === "F") { if (document.fullscreenElement) document.exitFullscreen(); else if (root.requestFullscreen) root.requestFullscreen(); }
    else if (k === "p" || k === "P") openPresenter();
    else if (k === "?") toggleHelp();
    else if (k === "Escape" && drawer.classList.contains("open")) toggleNotes();
  });

  /* ---------- Wischen: schneller Wisch zählt, auch bei kurzer Strecke ---------- */
  var sx = 0, sy = 0, st = 0, tracking = false;
  deck.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || tracking) return;
    tracking = true; sx = e.clientX; sy = e.clientY; st = Date.now();
  });
  deck.addEventListener("pointerup", function (e) {
    if (!tracking) return; tracking = false;
    var dx = e.clientX - sx, dy = e.clientY - sy, dt = Math.max(1, Date.now() - st);
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) >= 70 || Math.abs(dx) / dt > 0.11 && Math.abs(dx) > 24) go(cur + (dx < 0 ? 1 : -1));
  });
  deck.addEventListener("pointercancel", function () { tracking = false; });

  /* ---------- QR-Code zum Quiz ---------- */
  (function () {
    var holder = $("qr"); if (!holder || typeof qrcode !== "function") return;
    var url = new URL("../quiz/", location.href).href;
    try {
      var q = qrcode(0, "M"); q.addData(url); q.make();
      holder.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch (e) { holder.textContent = url; }
    $("quizlink").href = url;
    $("quizurl").textContent = url.replace(/^file:\/\//, "");
  })();

  /* ---------- Referentenansicht ---------- */
  function openPresenter() {
    var url = location.pathname + "?presenter=1#" + (cur + 1);
    presWin = window.open(url, "energie-referent", "width=1100,height=800");
  }

  var clockStart = null, clockAcc = 0, clockTimer = null;
  function elapsed() { return clockAcc + (clockStart ? (Date.now() - clockStart) / 1000 : 0); }
  function mmss(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r; }

  function buildPresenter() {
    document.body.classList.add("presenter");
    var rows = slides.map(function (s, i) {
      return '<tr data-row="' + i + '"><td>' + s.dataset.start + ' Min.</td><td>' + (i + 1) + ". " + s.dataset.title + "</td><td>" + s.dataset.time + "</td></tr>";
    }).join("");
    var pv = document.createElement("div");
    pv.className = "pv";
    pv.innerHTML =
      '<div>' +
        '<article class="tile now"><p class="eyebrow" id="pvPhase"></p><h1 id="pvTitle"></h1><div class="notes-text" id="pvNotes" style="margin-top:.9em"></div></article>' +
        '<article class="tile soft next"><p class="eyebrow">Als Nächstes</p><h2 class="headline" id="pvNext"></h2></article>' +
        '<div class="ctl"><button class="btn" id="pvPrev">Zurück</button><button class="btn primary" id="pvNextBtn">Weiter</button></div>' +
      '</div>' +
      '<div><article class="tile">' +
        '<p class="eyebrow">Zeit seit Start</p><div class="clock" id="pvClock">00:00</div><p class="delta" id="pvDelta">Uhr startet mit dem Knopf.</p>' +
        '<div class="ctl"><button class="btn" id="pvStart">Start</button><button class="btn ghost" id="pvReset">Zurücksetzen</button></div>' +
        '<table id="pvTable"><tbody>' + rows + "</tbody></table>" +
        '<p class="fine" style="margin-top:.8em">Die erste Spalte zeigt, wann die Folie laut Plan beginnt. Insgesamt sind 90 Minuten geplant, davon etwa 5 als Puffer für Übergänge.</p>' +
      "</article></div>";
    document.body.appendChild(pv);
    $("pvPrev").addEventListener("click", function () { go(cur - 1); });
    $("pvNextBtn").addEventListener("click", function () { go(cur + 1); });
    $("pvStart").addEventListener("click", function () {
      if (clockStart) { clockAcc = elapsed(); clockStart = null; $("pvStart").textContent = "Weiter"; }
      else { clockStart = Date.now(); $("pvStart").textContent = "Pause"; }
      tick();
    });
    $("pvReset").addEventListener("click", function () { clockStart = null; clockAcc = 0; $("pvStart").textContent = "Start"; tick(); });
    clockTimer = setInterval(tick, 500);
  }
  function tick() {
    var e = elapsed();
    $("pvClock").textContent = mmss(e);
    var planned = info(cur).start * 60;
    var d = $("pvDelta");
    if (!clockStart && clockAcc === 0) { d.className = "delta"; d.textContent = "Uhr startet mit dem Knopf."; return; }
    var diff = Math.round(e - planned);
    var abs = mmss(Math.abs(diff));
    if (diff > 90) { d.className = "delta late"; d.textContent = abs + " hinter dem Plan für diese Folie"; }
    else if (diff < -90) { d.className = "delta ok"; d.textContent = abs + " vor dem Plan für diese Folie"; }
    else { d.className = "delta ok"; d.textContent = "Im Plan"; }
  }
  function renderPresenter() {
    var d = info(cur);
    $("pvPhase").textContent = d.phase + " · " + d.time;
    $("pvTitle").textContent = (cur + 1) + ". " + d.title;
    $("pvNotes").innerHTML = d.notes;
    $("pvNext").textContent = cur + 1 < slides.length ? (cur + 2) + ". " + info(cur + 1).title : "Ende";
    Array.prototype.forEach.call(document.querySelectorAll("#pvTable tr"), function (tr) {
      tr.classList.toggle("cur", +tr.dataset.row === cur);
    });
    tick();
  }

  /* ---------- Start ---------- */
  var h = parseInt((location.hash || "").replace("#", ""), 10);
  if (h >= 1 && h <= slides.length) cur = h - 1;
  if (isPresenter) buildPresenter();
  render();
  if (!isPresenter) showDock();
})();
