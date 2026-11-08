/* Lernportal – Bausteine für Stunden-Präsentationen.
   Navigation (Blättern, Bühne skalieren) und Interaktionen. Gehört zu assets/css/stunde.css.
   Es wird nichts gespeichert, alle Eingaben sind beim Neuladen weg. Fachinhalte stehen nie hier, nur im HTML der Stunde.
   Bausteine (alle per Attribut):
   [data-zuordnen]  Wörter ziehen oder antippen: .dg (Wort) .bank (Vorrat) .dz[data-ans] (Ziel, Alternativen mit |) .chk .rst .lsg .fb
   [data-quiz]      ABC-Karten: .opt[data-ok] (mit data-fb als Rückmeldung), .qfb
   [data-zeige]     Knopf: schaltet die Lösung ein (Klasse "zeigt" an der Folie)
   [data-ordnen]    Bilder in Reihenfolge antippen: figure[data-pos], .chk .rst .fb
   [data-wahl]      Tabelle mit Ankreuzfeldern td.w (eine Wahl je Zeile)
   .aufdecken       Karte antippen: Vorderseite (.vorn) wechselt zur Rückseite (.hinten)
   [data-jn]        Tabelle mit td.jn[data-a]: antippen wechselt leer, ja, nein; .chk .rst .lsg .fb
   [data-gv]        Rechner: input.gv-o mal input.gv-k ergibt .gv-e
   [data-strich]    Strichliste: .tc mit .tn (Zahl) und .tm (Strich zurück) */
(function () {
  "use strict";
  var buehne = document.getElementById("buehne"), stage = document.getElementById("stage");
  var slides = [].slice.call(document.querySelectorAll(".slide")), cur = 0, K = 1;
  var balken = document.querySelector("#nav i"), nummer = document.getElementById("nummer");
  var vor = document.getElementById("vor"), zur = document.getElementById("zur");

  function fit() {
    var s = Math.min(buehne.clientWidth / 1280, buehne.clientHeight / 720);
    K = s || 1;
    stage.style.transform = "translate(-50%,-50%) scale(" + s + ")";
  }
  function show(n) {
    cur = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, i) { s.classList.toggle("on", i === cur); });
    if (balken) balken.style.width = ((cur + 1) / slides.length * 100) + "%";
    if (nummer) nummer.textContent = (cur + 1) + " / " + slides.length;
    if (zur) zur.disabled = cur === 0;
    if (vor) vor.disabled = cur === slides.length - 1;
    try { history.replaceState(null, "", "#" + (cur + 1)); } catch (e) { /* ohne Adresszeile */ }
  }
  function tippt(t) { return t && (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName)); }
  document.addEventListener("keydown", function (e) {
    if (tippt(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && e.target.tagName !== "BUTTON")) { e.preventDefault(); show(cur + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { show(cur - 1); }
    else if (e.key === "f" || e.key === "F") { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (x) { /* nicht möglich */ } }
  });
  if (vor) vor.onclick = function () { show(cur + 1); };
  if (zur) zur.onclick = function () { show(cur - 1); };
  window.addEventListener("resize", fit);
  window.addEventListener("load", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(buehne);
  fit();

  /* ---------- Zuordnen: Ziehen mit Maus, Finger, Stift; Antippen geht auch ---------- */
  function zuordnen(root) {
    var bank = root.querySelector(".bank"), items = [].slice.call(root.querySelectorAll(".dg")),
      zones = [].slice.call(root.querySelectorAll(".dz")), fb = root.querySelector(".fb"), sel = null;
    function marks() { zones.forEach(function (z) { z.classList.remove("ok", "bad"); }); if (fb) { fb.textContent = ""; fb.className = "fb"; } }
    function place(it, z) {
      var old = z.querySelector(".dg");
      if (old && old !== it) bank.appendChild(old);
      z.appendChild(it); it.classList.remove("sel"); sel = null;
      items.forEach(function (x) { x.classList.remove("sel"); }); marks();
    }
    function home(it) { bank.appendChild(it); marks(); }
    items.forEach(function (it) {
      var sx, sy, moved = false, id = null;
      it.addEventListener("pointerdown", function (e) {
        if (document.body.classList.contains("penon")) return;
        it.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; moved = false; id = e.pointerId;
        it.classList.add("drag"); e.preventDefault();
      });
      it.addEventListener("pointermove", function (e) {
        if (id !== e.pointerId) return;
        var dx = (e.clientX - sx) / K, dy = (e.clientY - sy) / K;
        if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
        if (moved) it.style.transform = "translate(" + dx + "px," + dy + "px)";
      });
      it.addEventListener("pointerup", function (e) {
        if (id !== e.pointerId) return;
        it.classList.remove("drag"); try { it.releasePointerCapture(id); } catch (x) { /* schon frei */ }
        id = null; it.style.transform = "";
        if (moved) {
          it.style.pointerEvents = "none";
          var t = document.elementFromPoint(e.clientX, e.clientY);
          it.style.pointerEvents = "";
          var z = t && t.closest ? t.closest(".dz") : null;
          if (z && root.contains(z)) place(it, z); else home(it);
        } else {
          var pz = it.parentElement.classList.contains("dz") ? it.parentElement : null;
          if (pz) { if (sel && sel !== it) place(sel, pz); else home(it); }
          else { sel = (sel === it) ? null : it; items.forEach(function (x) { x.classList.toggle("sel", x === sel); }); }
        }
      });
      it.addEventListener("pointercancel", function () { id = null; it.style.transform = ""; it.classList.remove("drag"); });
    });
    zones.forEach(function (z) { z.addEventListener("click", function () { if (sel && !z.querySelector(".dg")) place(sel, z); }); });
    function richtig(z, it) { return !!it && String(z.dataset.ans || "").split("|").indexOf(it.textContent.trim()) >= 0; }
    var rst = root.querySelector(".rst"), chk = root.querySelector(".chk"), lsg = root.querySelector(".lsg");
    if (rst) rst.onclick = function () { items.forEach(function (x) { bank.appendChild(x); }); marks(); };
    if (chk) chk.onclick = function () {
      var ok = 0;
      zones.forEach(function (z) {
        var it = z.querySelector(".dg"); z.classList.remove("ok", "bad");
        if (richtig(z, it)) { z.classList.add("ok"); ok++; } else z.classList.add("bad");
      });
      if (fb) {
        fb.textContent = ok === zones.length ? "✓ Alles richtig!" : ok + " von " + zones.length + " richtig. Rot: noch einmal versuchen.";
        fb.className = "fb " + (ok === zones.length ? "good" : "warn");
      }
    };
    if (lsg) lsg.onclick = function () {
      items.forEach(function (x) { bank.appendChild(x); });      // erst alles zurück, dann jede Karte nur einmal vergeben
      zones.forEach(function (z) {
        var first = String(z.dataset.ans || "").split("|")[0];
        var it = items.filter(function (x) { return x.textContent.trim() === first && !x.parentElement.classList.contains("dz"); })[0];
        if (it) place(it, z);
      });
      if (chk) chk.onclick();
    };
  }
  [].forEach.call(document.querySelectorAll("[data-zuordnen]"), zuordnen);

  /* ---------- ABC-Quiz ---------- */
  [].forEach.call(document.querySelectorAll("[data-quiz]"), function (q) {
    var opts = [].slice.call(q.querySelectorAll(".opt")), fb = q.querySelector(".qfb");
    opts.forEach(function (o) {
      o.addEventListener("click", function () {
        if (q.classList.contains("fertig")) return;
        var ok = o.hasAttribute("data-ok");
        o.classList.add(ok ? "ok" : "bad");
        if (fb) { fb.textContent = o.getAttribute("data-fb") || (ok ? "Richtig." : "Noch nicht. Versuche eine andere Antwort."); fb.className = "qfb " + (ok ? "good" : "warn"); }
        if (ok) { q.classList.add("fertig"); }
      });
    });
  });

  /* ---------- Lösung zeigen (Klasse "zeigt" an der Folie) ---------- */
  [].forEach.call(document.querySelectorAll("[data-zeige]"), function (b) {
    var label = b.textContent;
    b.addEventListener("click", function () {
      var s = b.closest(".slide"), an = s.classList.toggle("zeigt");
      b.textContent = an ? "Lösung verbergen" : label;
    });
  });

  /* ---------- Reihenfolge antippen ---------- */
  [].forEach.call(document.querySelectorAll("[data-ordnen]"), function (root) {
    var figs = [].slice.call(root.querySelectorAll("figure")), folge = [], fb = root.querySelector(".fb");
    function neu() { folge = []; figs.forEach(function (f) { f.classList.remove("gew", "ok", "bad"); f.querySelector(".rang").textContent = ""; }); if (fb) { fb.textContent = ""; fb.className = "fb"; } }
    figs.forEach(function (f) {
      f.addEventListener("click", function () {
        var i = folge.indexOf(f);
        if (i >= 0) { neu(); return; }
        folge.push(f); f.classList.add("gew"); f.classList.remove("ok", "bad");
        f.querySelector(".rang").textContent = folge.length;
      });
    });
    var chk = root.querySelector(".chk"), rst = root.querySelector(".rst");
    if (rst) rst.onclick = neu;
    if (chk) chk.onclick = function () {
      var ok = 0;
      figs.forEach(function (f) {
        var pos = +f.dataset.pos, i = folge.indexOf(f);
        var richtig = i >= 0 && (i + 1) === pos;
        f.classList.remove("ok", "bad"); f.classList.add(richtig ? "ok" : "bad");
        if (richtig) ok++;
      });
      if (fb) {
        fb.textContent = ok === figs.length ? "✓ Richtige Reihenfolge!" : ok + " von " + figs.length + " am richtigen Platz. Tippe die Bilder noch einmal der Reihe nach an.";
        fb.className = "fb " + (ok === figs.length ? "good" : "warn");
      }
    };
  });

  /* ---------- Ankreuz-Tabelle: eine Wahl je Zeile ---------- */
  [].forEach.call(document.querySelectorAll("[data-wahl] tr"), function (tr) {
    var zellen = [].slice.call(tr.querySelectorAll("td.w"));
    zellen.forEach(function (z) {
      z.addEventListener("click", function () {
        var war = z.classList.contains("an");
        zellen.forEach(function (x) { x.classList.remove("an"); });
        if (!war) z.classList.add("an");
      });
    });
  });

  /* ---------- Karten aufdecken ---------- */
  [].forEach.call(document.querySelectorAll(".aufdecken"), function (k) {
    k.setAttribute("tabindex", "0"); k.setAttribute("role", "button");
    function t() { k.classList.toggle("auf"); }
    k.addEventListener("click", t);
    k.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t(); } });
  });


  /* ---------- Ja/Nein-Tabelle: Zelle antippen wechselt leer, ja, nein ---------- */
  [].forEach.call(document.querySelectorAll("[data-jn]"), function (root) {
    var zellen = [].slice.call(root.querySelectorAll("td.jn")), fb = root.querySelector(".fb");
    function marks() { zellen.forEach(function (z) { z.classList.remove("ok", "bad"); }); if (fb) { fb.textContent = ""; fb.className = "fb"; } }
    zellen.forEach(function (z) {
      z.setAttribute("tabindex", "0"); z.setAttribute("role", "button");
      function t() { z.textContent = z.textContent === "" ? "ja" : (z.textContent === "ja" ? "nein" : ""); marks(); }
      z.addEventListener("click", t);
      z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t(); } });
    });
    var chk = root.querySelector(".chk"), rst = root.querySelector(".rst"), lsg = root.querySelector(".lsg");
    if (rst) rst.onclick = function () { zellen.forEach(function (z) { z.textContent = ""; }); marks(); };
    if (lsg) lsg.onclick = function () { zellen.forEach(function (z) { z.textContent = z.dataset.a; }); if (chk) chk.onclick(); };
    if (chk) chk.onclick = function () {
      var ok = 0;
      zellen.forEach(function (z) { var r = z.textContent === z.dataset.a; z.classList.remove("ok", "bad"); z.classList.add(r ? "ok" : "bad"); if (r) ok++; });
      if (fb) { fb.textContent = ok === zellen.length ? "✓ Alles richtig!" : ok + " von " + zellen.length + " richtig. Rot: noch einmal versuchen."; fb.className = "fb " + (ok === zellen.length ? "good" : "warn"); }
    };
  });

  /* ---------- Gesamtvergrößerung: Objektiv mal Okular ---------- */
  [].forEach.call(document.querySelectorAll("[data-gv]"), function (root) {
    var a = root.querySelector(".gv-o"), b = root.querySelector(".gv-k"), out = root.querySelector(".gv-e");
    function rechne() { var x = parseFloat(a.value), y = parseFloat(b.value); out.textContent = (x > 0 && y > 0) ? (x * y) + "-fach" : "?"; }
    a.addEventListener("input", rechne); b.addEventListener("input", rechne); rechne();
  });

  /* ---------- Strichliste: antippen zählt hoch, − zählt zurück ---------- */
  [].forEach.call(document.querySelectorAll("[data-strich] .tc"), function (c) {
    var n = c.querySelector(".tn");
    c.addEventListener("click", function (e) {
      var v = +n.textContent;
      v = e.target.classList.contains("tm") ? Math.max(0, v - 1) : v + 1;
      n.textContent = v;
    });
  });

  var h = parseInt((location.hash || "").replace("#", ""), 10);
  show(isNaN(h) ? 0 : h - 1);
})();
