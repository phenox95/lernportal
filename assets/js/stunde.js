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
   [data-strich]    Strichliste: .tc mit .tn (Zahl) und .tm (Strich zurück)
   [data-sortieren] Kartenablage: .pool mit .ks (Karten, optional data-ziel) und .zone[data-z] mit .inh; .chk .rst .fb
   [data-zoom]      Regler .zr über .zebene (Ebenen), Beschriftung .zl aus data-labels
   [data-mikro]     Mikroskop-Trainer: .mk-sicht .mk-fokus .mk-obj button[data-o] .mk-gv .mk-fd .mk-hint
   [data-explorer]  Zeichnung mit .hot[data-n][data-t] antippen, Anzeige .ex-name .ex-text .ex-zahl
   [data-schalter]  Schalter .sch button[data-m=tier|pflanze] blendet [data-nur=pflanze] aus
   [data-kette]     Gewebekette: circle.kp und ein Knopf
   [data-matrix]    Tabelle mit td.m (antippen) und .summe
   [data-checkliste] .cp antippen hakt ab, .cz zählt
   [data-selbst]    „Ich kann“: .sb mit drei Knöpfen
   #vl              Vorlesen-Knopf (Taste V), nutzt die Sprachausgabe des Browsers */
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
  var show = function (n) {
    cur = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, i) { s.classList.toggle("on", i === cur); });
    if (balken) balken.style.width = ((cur + 1) / slides.length * 100) + "%";
    if (nummer) nummer.textContent = (cur + 1) + " / " + slides.length;
    if (zur) zur.disabled = cur === 0;
    if (vor) vor.disabled = cur === slides.length - 1;
    try { history.replaceState(null, "", "#" + (cur + 1)); } catch (e) { /* ohne Adresszeile */ }
  };
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


  /* ---------- Kartenablage: Karten in Felder ziehen oder antippen (mehrere je Feld, optional mit Prüfung) ---------- */
  [].forEach.call(document.querySelectorAll("[data-sortieren]"), function (root) {
    var karten = [].slice.call(root.querySelectorAll(".ks")), pool = root.querySelector(".pool"),
      zonen = [].slice.call(root.querySelectorAll(".zone")), fb = root.querySelector(".fb"), sel = null;
    function ziel(z) { return z.querySelector(".inh") || z; }
    function marks() { karten.forEach(function (k) { k.classList.remove("ok", "bad"); }); if (fb) { fb.textContent = ""; fb.className = "fb"; } }
    function setze(k, z) { (z ? ziel(z) : pool).appendChild(k); k.classList.remove("sel"); sel = null; karten.forEach(function (x) { x.classList.remove("sel"); }); marks(); }
    karten.forEach(function (k) {
      var sx, sy, moved = false, id = null;
      k.addEventListener("pointerdown", function (e) {
        if (document.body.classList.contains("penon")) return;
        k.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; moved = false; id = e.pointerId; k.classList.add("drag"); e.preventDefault();
      });
      k.addEventListener("pointermove", function (e) {
        if (id !== e.pointerId) return;
        var dx = (e.clientX - sx) / K, dy = (e.clientY - sy) / K;
        if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
        if (moved) k.style.transform = "translate(" + dx + "px," + dy + "px)";
      });
      k.addEventListener("pointerup", function (e) {
        if (id !== e.pointerId) return;
        k.classList.remove("drag"); try { k.releasePointerCapture(id); } catch (x) { /* frei */ }
        id = null; k.style.transform = "";
        if (moved) {
          k.style.pointerEvents = "none";
          var t = document.elementFromPoint(e.clientX, e.clientY); k.style.pointerEvents = "";
          var z = t && t.closest ? t.closest(".zone") : null;
          if (z && root.contains(z)) setze(k, z); else setze(k, null);
        } else if (k.parentElement.closest(".zone")) {
          if (sel && sel !== k) setze(sel, k.parentElement.closest(".zone")); else setze(k, null);
        }
        else { sel = (sel === k) ? null : k; karten.forEach(function (x) { x.classList.toggle("sel", x === sel); }); }
      });
      k.addEventListener("pointercancel", function () { id = null; k.style.transform = ""; k.classList.remove("drag"); });
    });
    zonen.forEach(function (z) { z.addEventListener("click", function (e) { if (sel && !e.target.closest(".ks")) setze(sel, z); }); });
    var chk = root.querySelector(".chk"), rst = root.querySelector(".rst");
    if (rst) rst.onclick = function () { karten.forEach(function (k) { pool.appendChild(k); k.classList.remove("sel"); }); sel = null; marks(); };
    if (chk) chk.onclick = function () {
      var ok = 0;
      karten.forEach(function (k) {
        var z = k.parentElement.closest(".zone"), r = z && z.dataset.z === k.dataset.ziel;
        k.classList.remove("ok", "bad"); k.classList.add(r ? "ok" : "bad"); if (r) ok++;
      });
      if (fb) { fb.textContent = ok === karten.length ? "✓ Alles richtig!" : ok + " von " + karten.length + " richtig. Rot: noch einmal überlegen."; fb.className = "fb " + (ok === karten.length ? "good" : "warn"); }
    };
  });

  /* ---------- Zoom-Regler: Ebenen blenden mit dem Regler ineinander über ---------- */
  [].forEach.call(document.querySelectorAll("[data-zoom]"), function (root) {
    var ebenen = [].slice.call(root.querySelectorAll(".zebene")), r = root.querySelector("input[type=range]"),
      lab = root.querySelector(".zl"), namen = (root.dataset.labels || "").split("|"), stapel = root.querySelector(".zstapel");
    function upd() {
      var v = +r.value / 100, pos = v * (ebenen.length - 1);
      ebenen.forEach(function (e, i) { e.style.opacity = Math.max(0, Math.min(1, 1.6 - Math.abs(pos - i) * 1.6)); });
      if (stapel) stapel.style.transform = "scale(" + (1 + v * (+root.dataset.skala || 0.25)) + ")";
      if (lab) lab.textContent = namen[Math.round(pos)] || "";
    }
    r.addEventListener("input", upd); upd();
  });

  /* ---------- Mikroskop-Trainer: Objektiv wählen, scharf stellen ---------- */
  [].forEach.call(document.querySelectorAll("[data-mikro]"), function (root) {
    var NS = "http://www.w3.org/2000/svg", W = 420, sicht = root.querySelector(".mk-sicht"), fokus = root.querySelector(".mk-fokus"),
      info = root.querySelector(".mk-info"), gv = root.querySelector(".mk-gv"), fd = root.querySelector(".mk-fd"), hint = root.querySelector(".mk-hint"),
      btn = [].slice.call(root.querySelectorAll(".mk-obj button")), obj = 4, ziel = 40 + Math.round(Math.random() * 40), scharfMal = {}, hatScharf = false;
    var FN = 18000; /* Sichtfeldzahl 18 mm bei Okular 10x, in µm */
    function bild() {
      sicht.innerHTML = "";
      var feld = FN / obj, zw = 300 / feld * W, zh = 100 / feld * W, g = document.createElementNS(NS, "g"), reihen = Math.ceil(W / zh) + 2, spalten = Math.ceil(W / zw) + 2, zz = 0;
      for (var y = 0; y < reihen; y++) for (var x = 0; x < spalten; x++) {
        var ox = (y % 2) * zw * 0.45 - zw * 0.3, cx = x * zw + ox, cy = y * zh - zh * 0.3;
        var r = document.createElementNS(NS, "rect");
        r.setAttribute("x", cx + zw * 0.04); r.setAttribute("y", cy + zh * 0.06); r.setAttribute("width", zw * 0.92); r.setAttribute("height", zh * 0.88);
        r.setAttribute("rx", Math.max(1, zh * 0.05)); r.setAttribute("fill", "#f6d9e6"); r.setAttribute("stroke", "#b24a7d"); r.setAttribute("stroke-width", Math.max(1.2, zh * 0.04));
        g.appendChild(r);
        var vk = document.createElementNS(NS, "rect");
        vk.setAttribute("x", cx + zw * 0.2); vk.setAttribute("y", cy + zh * 0.22); vk.setAttribute("width", zw * 0.7); vk.setAttribute("height", zh * 0.56);
        vk.setAttribute("rx", zh * 0.1); vk.setAttribute("fill", "#fbeaf2"); vk.setAttribute("opacity", obj >= 10 ? 0.9 : 0); g.appendChild(vk);
        var k = document.createElementNS(NS, "circle");
        k.setAttribute("cx", cx + zw * (0.1 + 0.05 * ((x * 7 + y * 3) % 3))); k.setAttribute("cy", cy + zh * (0.35 + 0.1 * ((x + y) % 4))); k.setAttribute("r", Math.max(1.4, zh * 0.09));
        k.setAttribute("fill", "#8e2a5d"); g.appendChild(k); zz++;
      }
      sicht.appendChild(g);
    }
    function unscharf() { var v = +fokus.value, d = Math.abs(v - ziel); sicht.style.filter = "blur(" + Math.min(14, d / 4.5).toFixed(1) + "px)"; return d; }
    function status() {
      var d = unscharf();
      if (d <= 4) { hint.textContent = "✓ Das Bild ist scharf."; hint.className = "mk-hint good"; scharfMal[obj] = true; hatScharf = true; }
      else { hint.textContent = "Drehe am Feintrieb, bis das Bild scharf ist."; hint.className = "mk-hint"; }
    }
    function waehle(o) {
      if (o === 40 && !scharfMal[4]) { hint.textContent = "Tipp: Beginne immer mit dem kleinsten Objektiv (4×), suche dort das Objekt und stelle scharf."; hint.className = "mk-hint warn"; }
      obj = o; ziel = 30 + Math.round(Math.random() * 50); btn.forEach(function (b) { b.classList.toggle("an", +b.dataset.o === o); });
      gv.textContent = (o * 10) + "-fach"; var mm = FN / o / 1000; fd.textContent = (mm >= 1 ? mm.toFixed(1).replace(".", ",") : mm.toFixed(2).replace(".", ",")) + " mm";
      bild(); if (!(o === 40 && !scharfMal[4])) status(); else unscharf();
    }
    btn.forEach(function (b) { b.addEventListener("click", function () { waehle(+b.dataset.o); }); });
    fokus.addEventListener("input", status);
    waehle(4);
  });

  /* ---------- Entdecker: Teile der Zeichnung antippen ---------- */
  [].forEach.call(document.querySelectorAll("[data-explorer]"), function (root) {
    var hot = [].slice.call(root.querySelectorAll(".hot")), name = root.querySelector(".ex-name"), text = root.querySelector(".ex-text"),
      zahl = root.querySelector(".ex-zahl"), gesehen = {}, namen = {};
    hot.forEach(function (h) { namen[h.dataset.n] = 1; });
    var gesamt = Object.keys(namen).length;
    function waehle(h) {
      hot.forEach(function (x) { x.classList.remove("an"); });
      hot.filter(function (x) { return x.dataset.n === h.dataset.n; }).forEach(function (x) { x.classList.add("an", "seen"); });
      gesehen[h.dataset.n] = 1;
      name.textContent = h.dataset.n; text.textContent = h.dataset.t || "";
      if (zahl) zahl.textContent = Object.keys(gesehen).length + " von " + gesamt + " entdeckt";
    }
    hot.forEach(function (h) {
      h.setAttribute("tabindex", "0"); h.setAttribute("role", "button"); h.setAttribute("aria-label", h.dataset.n);
      h.addEventListener("click", function (e) { e.stopPropagation(); waehle(h); });
      h.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); waehle(h); } });
    });
  });

  /* ---------- Schalter: Teile der Zeichnung ein- und ausblenden (Tierzelle / Pflanzenzelle) ---------- */
  [].forEach.call(document.querySelectorAll("[data-schalter]"), function (root) {
    var b = [].slice.call(root.querySelectorAll(".sch button")), liste = root.querySelector(".sch-liste");
    function setze(modus) {
      b.forEach(function (x) { x.classList.toggle("an", x.dataset.m === modus); });
      root.classList.toggle("nur-tier", modus === "tier");
      if (liste) [].forEach.call(liste.querySelectorAll("li"), function (li) { li.classList.toggle("fehlt", modus === "tier" && li.hasAttribute("data-nur-pflanze")); });
    }
    b.forEach(function (x) { x.addEventListener("click", function () { setze(x.dataset.m); }); });
    setze("pflanze");
  });

  /* ---------- Gewebekette: Signal auslösen, Kette zieht sich zusammen ---------- */
  [].forEach.call(document.querySelectorAll("[data-kette]"), function (root) {
    var punkte = [].slice.call(root.querySelectorAll("circle.kp")), knopf = root.querySelector("button"), kurz = false;
    function lege() { punkte.forEach(function (p, i) { p.style.transform = "translateX(" + (kurz ? (i * 26 - i * 46) : 0) + "px)"; }); }
    knopf.addEventListener("click", function () { kurz = !kurz; lege(); knopf.textContent = kurz ? "Zurück zur langen Kette" : "Signal: Arme anwinkeln!"; });
    lege();
  });

  /* ---------- Matrix: Merkmale je Objekt ankreuzen, Summe wird gezählt ---------- */
  [].forEach.call(document.querySelectorAll("[data-matrix]"), function (root) {
    [].forEach.call(root.querySelectorAll("tbody tr"), function (tr) {
      var zellen = [].slice.call(tr.querySelectorAll("td.m")), summe = tr.querySelector(".summe");
      function zaehle() { var n = zellen.filter(function (z) { return z.classList.contains("an"); }).length; summe.textContent = n + " von " + zellen.length; summe.style.setProperty("--p", (n / zellen.length * 100) + "%"); }
      zellen.forEach(function (z) {
        z.setAttribute("tabindex", "0"); z.setAttribute("role", "button");
        function t() { z.classList.toggle("an"); zaehle(); }
        z.addEventListener("click", t);
        z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t(); } });
      });
      zaehle();
    });
  });

  /* ---------- Checkliste: Punkt antippen hakt ab ---------- */
  [].forEach.call(document.querySelectorAll("[data-checkliste]"), function (root) {
    var punkte = [].slice.call(root.querySelectorAll(".cp")), z = root.querySelector(".cz");
    function upd() { if (z) z.textContent = punkte.filter(function (p) { return p.classList.contains("an"); }).length + " von " + punkte.length + " erfüllt"; }
    punkte.forEach(function (p) {
      p.setAttribute("tabindex", "0"); p.setAttribute("role", "checkbox");
      function t() { p.classList.toggle("an"); p.setAttribute("aria-checked", p.classList.contains("an")); upd(); }
      p.addEventListener("click", t);
      p.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t(); } });
    });
    upd();
  });

  /* ---------- „Ich kann“: Selbsteinschätzung in drei Stufen ---------- */
  [].forEach.call(document.querySelectorAll("[data-selbst] .sb"), function (z) {
    [].forEach.call(z.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { [].forEach.call(z.querySelectorAll("button"), function (x) { x.classList.remove("an"); x.setAttribute("aria-pressed", "false"); }); b.classList.add("an"); b.setAttribute("aria-pressed", "true"); });
    });
  });

  /* ---------- Phasenmarke einfärben (aus dem Text der Phasenzeile) ---------- */
  [].forEach.call(document.querySelectorAll(".phase"), function (p) {
    var t = p.textContent.toLowerCase(), k = "x";
    if (/do now/.test(t)) k = "dn"; else if (/impuls|fragen|unsere frage/.test(t)) k = "im"; else if (/erarbeitung|vertiefung|differenzierung/.test(t)) k = "er";
    else if (/sicherung|abschluss/.test(t)) k = "si"; else if (/reflexion|exit|ausblick|selbst/.test(t)) k = "re";
    p.setAttribute("data-ph", k);
  });

  /* ---------- Vorlesen (Sprachausgabe des Browsers, keine Daten verlassen das Gerät) ---------- */
  (function () {
    var knopf = document.getElementById("vl");
    if (!knopf || !("speechSynthesis" in window)) { if (knopf) knopf.style.display = "none"; return; }
    var sprich = false;
    function text() {
      var s = slides[cur], teile = [], gesehen = {};
      [].forEach.call(s.querySelectorAll("h1,p,li,.fragekarte,.opt span,.nl>div,th,td,.wort span,figcaption,.sb .t"), function (e) {
        if (e.closest(".badge,.phase,.tip,.ctl,.fb,[data-fragenfeld]") || e.offsetParent === null) return;
        var t = (e.innerText || "").replace(/\s+/g, " ").trim();
        if (t && !gesehen[t]) { gesehen[t] = 1; teile.push(t); }
      });
      return teile.join(". ");
    }
    function stopp() { try { speechSynthesis.cancel(); } catch (x) { /* nichts */ } sprich = false; knopf.classList.remove("an"); }
    knopf.addEventListener("click", function () {
      if (sprich) { stopp(); return; }
      var u = new SpeechSynthesisUtterance(text()); u.lang = "de-DE"; u.rate = 0.92;
      u.onend = u.onerror = function () { sprich = false; knopf.classList.remove("an"); };
      sprich = true; knopf.classList.add("an"); speechSynthesis.cancel(); speechSynthesis.speak(u);
    });
    document.addEventListener("keydown", function (e) { if ((e.key === "v" || e.key === "V") && !tippt(e.target) && !e.ctrlKey && !e.metaKey) knopf.click(); });
    var alt = show; show = function (n) { stopp(); alt(n); };
  })();

  var h = parseInt((location.hash || "").replace("#", ""), 10);
  show(isNaN(h) ? 0 : h - 1);
})();
