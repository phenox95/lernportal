/* Lernportal – Messen und Prüfen in Präsentationen (Stil in assets/css/messen.css).
   Nach stunde.js und vor praesentation.js laden. Es wird nichts gesendet, Werte bleiben im Browser.

   1) Vermuten, dann prüfen
      <div data-vermuten>
        <p class="vm-frage"><b>Vermute</b> …</p>
        <div class="vm-wahl"><button type="button">A</button><button type="button">B</button></div>
        <div class="vm-pruefen"> … Regler oder Modell … </div>
      </div>
      Der Bereich .vm-pruefen bleibt verdeckt, bis eine Vermutung angetippt ist. „Neu vermuten“ deckt wieder zu.

   2) Klassenmessung Reaktionszeit (Lineal-Test und Test am Board)
      <div data-klassenmessung data-max="50"></div>
      Werte in cm eintragen (Lineal), Punktdiagramm mit cm- und Sekunden-Achse, Mittelwert und Median.
      „Am Board messen“ öffnet einen Reaktionstest zum Antippen; diese Werte erscheinen als Ringe.
      Gespeichert in localStorage (data-key, sonst je Seite), „Neu beginnen“ leert.

   3) Gruppenwerte per QR-Code sammeln
      <div data-qr-sammeln data-key="lp-…" data-namen="A=Blinder Fleck|B=Zwei Spitzen"></div>
      Liest Codes im Format des Rückkanals ({"v":1,"g":"Gruppe 2","a":"B: Fingerkuppe 3"}) mit der Kamera
      und schreibt je Code eine Zeile „Gruppe 2 · B: Fingerkuppe 3“ in localStorage (data-key).
      Dieselbe Zeilenform lesen die Klassentabelle der Sinnes-Stationen und die Auswertungsstunde. */
(function () {
  "use strict";
  var BASIS = ((document.currentScript && document.currentScript.src) || "").replace(/messen\.js(\?.*)?$/, "");
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, txt, cls) { var e = document.createElement(tag); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; }
  function knopf(txt, cls) { var b = el("button", txt, cls || "b sec"); b.type = "button"; return b; }
  function komma(x, st) { return x.toFixed(st == null ? 1 : st).replace(".", ","); }
  function lies(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function schreib(key, wert) { try { if (wert == null) localStorage.removeItem(key); else localStorage.setItem(key, wert); } catch (e) { /* ohne Speicher */ } }
  /* Knopf, der erst beim zweiten Antippen auslöst (gegen versehentliches Löschen) */
  function scharf(b, text, tun) {
    var an = false, t = null;
    b.addEventListener("click", function () {
      if (!an) { an = true; b.textContent = "Wirklich? Nochmal tippen"; t = setTimeout(function () { an = false; b.textContent = text; }, 4000); return; }
      clearTimeout(t); an = false; b.textContent = text; tun();
    });
  }
  /* Ruft fn(false), sobald die Folie des Elements nicht mehr gezeigt wird */
  function beiFolienwechsel(root, fn) {
    var folie = root.closest(".slide"); if (!folie || !window.MutationObserver) return;
    new MutationObserver(function () { if (!folie.classList.contains("on")) fn(false); }).observe(folie, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- 1) Vermuten, dann prüfen ---------- */
  [].forEach.call(document.querySelectorAll("[data-vermuten]"), function (root) {
    var wahl = [].slice.call(root.querySelectorAll(".vm-wahl button")), pruefen = root.querySelector(".vm-pruefen");
    var status = el("p", "Tippt eure Vermutung an. Dann könnt ihr prüfen.", "vm-status"); status.setAttribute("aria-live", "polite");
    var neu = knopf("Neu vermuten", "b sec s vm-neu"); neu.hidden = true;
    var wahlBox = root.querySelector(".vm-wahl"); wahlBox.parentNode.insertBefore(status, wahlBox.nextSibling); status.appendChild(neu);
    function zu() {
      root.classList.add("vm-zu"); if (pruefen) pruefen.setAttribute("aria-hidden", "true");
      wahl.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      status.firstChild.textContent = "Tippt eure Vermutung an. Dann könnt ihr prüfen."; neu.hidden = true;
      root.dispatchEvent(new CustomEvent("vermuten", { detail: { offen: false } }));
    }
    wahl.forEach(function (b) {
      b.type = "button"; b.classList.add("b", "sec");
      b.addEventListener("click", function () {
        wahl.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        root.classList.remove("vm-zu"); if (pruefen) pruefen.removeAttribute("aria-hidden");
        status.firstChild.textContent = "Eure Vermutung: " + b.textContent.trim() + ". Prüft jetzt. ";
        neu.hidden = false;
        root.dispatchEvent(new CustomEvent("vermuten", { detail: { offen: true, wahl: b.textContent.trim() } }));
      });
    });
    neu.addEventListener("click", zu);
    zu();
  });

  /* ---------- 2) Klassenmessung Reaktionszeit ---------- */
  var G = 9.81;
  function cmZuS(cm) { return Math.sqrt(2 * (cm / 100) / G); }
  function sZuCm(s) { return 0.5 * G * s * s * 100; }
  function median(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
  function mittel(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; }

  [].forEach.call(document.querySelectorAll("[data-klassenmessung]"), function (root, nr) {
    var MAX = +root.getAttribute("data-max") || 50, KEY = root.getAttribute("data-key") || ("lp-klassenmessung:" + location.pathname + ":" + nr);
    var NS = "http://www.w3.org/2000/svg", W = 1000, H = 260, X0 = 70, X1 = 970, Y0 = 176, R = 11;
    var daten = { l: [], b: [] };
    try { var alt = JSON.parse(lies(KEY) || "null"); if (alt && alt.l && alt.b) daten = alt; } catch (e) { /* neu */ }
    function x(cm) { return X0 + (Math.min(cm, MAX) / MAX) * (X1 - X0); }
    function sv(tag, at) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); return e; }

    root.classList.add("km");
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, "class": "km-plot", role: "img" });
    var achse = sv("g", { "class": "km-achse" }), punkte = sv("g", { "class": "km-punkte" }), linie = sv("g", { "class": "km-mw" });
    achse.appendChild(sv("path", { d: "M" + X0 + " " + Y0 + " H" + X1 }));
    for (var c = 0; c <= MAX; c += 5) {
      achse.appendChild(sv("path", { d: "M" + x(c) + " " + Y0 + " v" + (c % 10 ? 8 : 14) }));
      var t1 = sv("text", { x: x(c), y: Y0 + 38, "text-anchor": "middle" }); t1.textContent = c; achse.appendChild(t1);
      if (c > 0 && c % 10 === 0 || c === 5) { var t2 = sv("text", { x: x(c), y: Y0 + 74, "text-anchor": "middle", "class": "km-s" }); t2.textContent = komma(cmZuS(c), 2) + " s"; achse.appendChild(t2); }
    }
    var e1 = sv("text", { x: 0, y: Y0 + 38 }); e1.textContent = "cm"; achse.appendChild(e1);
    var e2 = sv("text", { x: 0, y: Y0 + 74, "class": "km-s" }); e2.textContent = "Zeit"; achse.appendChild(e2);
    svg.appendChild(achse); svg.appendChild(linie); svg.appendChild(punkte);

    var zahlen = el("div", null, "km-zahlen"); zahlen.setAttribute("aria-live", "polite");
    var legende = el("p", null, "km-legende");
    legende.innerHTML = '<span class="km-l"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>Lineal</span><span class="km-b"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>Board (Bildschirm)</span>';
    var ein = el("div", null, "km-ein");
    var lab = el("label", "Wert in cm"), inp = el("input"); inp.type = "number"; inp.min = "1"; inp.max = String(MAX); inp.step = "0.5"; inp.inputMode = "decimal"; inp.id = "km-ein-" + nr; lab.htmlFor = inp.id;
    var dazu = knopf("Eintragen", "b"), weg = knopf("Letzten löschen"), board = knopf("Am Board messen"), leer = knopf("Neu beginnen");
    [lab, inp, dazu, weg, board, leer].forEach(function (e) { ein.appendChild(e); });
    var status = el("p", "Ruft eure Mittelwerte in cm. Die Lehrkraft trägt sie ein.", "km-status"); status.setAttribute("aria-live", "polite");

    /* Reaktionstest am Board */
    var test = el("div", null, "km-test"); test.hidden = true;
    var feld = knopf("Antippen zum Start", "km-feld"), testInfo = el("p", "Warte, bis das Feld „Jetzt“ zeigt. Dann tippe so schnell du kannst.", "km-info"), fertig = knopf("Fertig");
    testInfo.setAttribute("aria-live", "polite");
    var testLeiste = el("div", null, "km-leiste"); testLeiste.appendChild(testInfo); testLeiste.appendChild(fertig);
    test.appendChild(feld); test.appendChild(testLeiste);

    var unter = el("div", null, "km-unter"); unter.appendChild(legende); unter.appendChild(status);
    root.appendChild(svg); root.appendChild(zahlen); root.appendChild(ein); root.appendChild(unter); root.appendChild(test);

    function speichern() { schreib(KEY, JSON.stringify(daten)); }
    function zeichnen() {
      punkte.textContent = ""; linie.textContent = "";
      var stapel = {};
      function punkt(cm, art) {
        var k = Math.round(Math.min(cm, MAX)), h = stapel[k] = (stapel[k] || 0) + 1;
        var y = Y0 - R - 4 - (h - 1) * (2 * R + 2); if (y < R) y = R;
        punkte.appendChild(sv("circle", { cx: x(k), cy: y, r: art === "b" ? R - 1.5 : R, "class": art === "b" ? "km-ring" : "km-voll" }));
      }
      daten.l.forEach(function (v) { punkt(v, "l"); });
      daten.b.forEach(function (s) { punkt(sZuCm(s), "b"); });
      var m = mittel(daten.l), md = median(daten.l), teile = [];
      if (m != null) {
        linie.appendChild(sv("path", { d: "M" + x(m) + " 8 V" + Y0 }));
        var t = sv("text", { x: x(m) + 8, y: 26 }); t.textContent = "Mittelwert"; linie.appendChild(t);
      }
      zahlen.textContent = "";
      function zeile(titel, wert) { var d = el("div"); d.appendChild(el("span", titel)); d.appendChild(el("b", wert)); zahlen.appendChild(d); }
      zeile("Lineal-Werte", String(daten.l.length));
      zeile("Mittelwert", m == null ? "–" : komma(m) + " cm = " + komma(cmZuS(m), 2) + " s");
      zeile("Median", md == null ? "–" : komma(md) + " cm = " + komma(cmZuS(md), 2) + " s");
      if (daten.b.length) zeile("Board, Mittelwert", komma(mittel(daten.b), 2) + " s (" + daten.b.length + ")");
      svg.setAttribute("aria-label", "Punktdiagramm: " + daten.l.length + " Lineal-Werte" + (m == null ? "" : ", Mittelwert " + komma(m) + " Zentimeter") + (daten.b.length ? ", " + daten.b.length + " Werte vom Board" : "") + ".");
      weg.disabled = !daten.l.length && !daten.b.length;
    }
    var letzte = [];
    function eintragen() {
      var v = parseFloat(String(inp.value).replace(",", "."));
      if (!isFinite(v) || v <= 0 || v > MAX) { status.textContent = "Bitte einen Wert zwischen 1 und " + MAX + " cm eintragen."; return; }
      daten.l.push(v); letzte.push("l"); speichern(); zeichnen();
      status.textContent = komma(v) + " cm eingetragen. Das sind " + komma(cmZuS(v), 2) + " s.";
      inp.value = ""; inp.focus();
    }
    dazu.addEventListener("click", eintragen);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); eintragen(); } });
    weg.addEventListener("click", function () {
      var art = letzte.pop() || (daten.b.length ? "b" : "l");
      if (daten[art].length) daten[art].pop(); else if (daten.l.length) daten.l.pop();
      speichern(); zeichnen(); status.textContent = "Letzten Wert gelöscht.";
    });
    scharf(leer, "Neu beginnen", function () { daten = { l: [], b: [] }; letzte = []; speichern(); zeichnen(); status.textContent = "Neu begonnen. Die Tabelle ist leer."; });

    /* Ablauf des Tests: ruhe -> warte -> los -> ruhe */
    var zustand = "ruhe", uhr = null, t0 = 0;
    function feldText(t, cls) { feld.textContent = t; feld.className = "km-feld" + (cls ? " " + cls : ""); }
    function testZu() { clearTimeout(uhr); zustand = "ruhe"; test.hidden = true; root.classList.remove("km-testet"); }
    function tippen() {
      var jetzt = performance.now();
      if (zustand === "ruhe") {
        zustand = "warte"; feldText("Warte …", "warte"); testInfo.textContent = "Noch nicht tippen.";
        uhr = setTimeout(function () { zustand = "los"; feldText("Jetzt", "los"); t0 = performance.now(); }, 1500 + Math.random() * 3000);
      } else if (zustand === "warte") {
        clearTimeout(uhr); zustand = "ruhe"; feldText("Zu früh. Antippen für einen neuen Versuch.");
        testInfo.textContent = "Zu früh getippt. Der Versuch zählt nicht.";
      } else if (zustand === "los") {
        var s = (jetzt - t0) / 1000; zustand = "ruhe";
        if (s > 1.5) { feldText("Zu langsam gezählt. Antippen für einen neuen Versuch."); return; }
        daten.b.push(s); letzte.push("b"); speichern(); zeichnen();
        feldText(komma(s, 2) + " s. Antippen für den nächsten Versuch.");
        testInfo.textContent = komma(s, 2) + " s entsprechen " + komma(sZuCm(s)) + " cm am Lineal.";
      }
    }
    feld.addEventListener("pointerdown", function (e) { e.preventDefault(); tippen(); });
    feld.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); if (!e.repeat) tippen(); } });
    feld.addEventListener("click", function (e) { e.preventDefault(); });
    board.addEventListener("click", function () { test.hidden = false; root.classList.add("km-testet"); feldText("Antippen zum Start"); testInfo.textContent = "Warte, bis das Feld „Jetzt“ zeigt. Dann tippe so schnell du kannst."; feld.focus(); });
    fertig.addEventListener("click", function () { testZu(); board.focus(); });
    beiFolienwechsel(root, testZu);
    zeichnen();
  });

  /* ---------- 3) Gruppenwerte per QR-Code sammeln ---------- */
  function jsqrLaden(fertig) {
    if (window.jsQR) { fertig(true); return; }
    var s = document.createElement("script"); s.src = BASIS + "vendor/jsQR.js";
    s.onload = function () { fertig(!!window.jsQR); }; s.onerror = function () { fertig(false); };
    document.head.appendChild(s);
  }
  [].forEach.call(document.querySelectorAll("[data-qr-sammeln]"), function (root) {
    var KEY = root.getAttribute("data-key") || "lp-qr-sammeln:" + location.pathname, namen = {};
    (root.getAttribute("data-namen") || "").split("|").forEach(function (p) { var i = p.indexOf("="); if (i > 0) namen[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
    root.classList.add("qs");
    var leiste = el("div", null, "qs-leiste");
    var cam = knopf("Kamera starten", "b"), hand = knopf("Von Hand eintragen"), leer = knopf("Leeren");
    leiste.appendChild(cam); leiste.appendChild(hand); leiste.appendChild(leer);
    var video = el("video"); video.setAttribute("playsinline", ""); video.muted = true; video.hidden = true; video.setAttribute("aria-label", "Kamerabild zum Scannen");
    var handBox = el("div", null, "qs-hand"); handBox.hidden = true;
    var hl = el("label", "Zeile"), hi = el("input"); hi.type = "text"; hi.id = "qs-hand-" + Math.random().toString(36).slice(2, 7); hl.htmlFor = hi.id; hi.placeholder = "Gruppe 2 · B: Fingerkuppe 3; Nacken 40"; hi.autocomplete = "off";
    var hok = knopf("Eintragen", "b"); handBox.appendChild(hl); handBox.appendChild(hi); handBox.appendChild(hok);
    var status = el("p", "Die Kamera startet erst nach Antippen. Es wird kein Bild gespeichert.", "qs-status"); status.setAttribute("aria-live", "polite");
    var tabelle = el("div", null, "qs-tabelle"); tabelle.setAttribute("aria-live", "polite");
    root.appendChild(leiste); root.appendChild(handBox); root.appendChild(video); root.appendChild(status); root.appendChild(tabelle);

    function zeilen() { return (lies(KEY) || "").split(/\n/).map(function (z) { return z.replace(/^\s*-\s*/, "").trim(); }).filter(Boolean); }
    function zeigen() {
      var z = zeilen(); tabelle.textContent = "";
      if (!z.length) { tabelle.appendChild(el("p", "Noch keine Werte. Scannt die Codes der Gruppen.", "qs-leer")); return; }
      var t = el("table"), kopf = t.createTHead().insertRow();
      ["Gruppe", "Station", "Werte"].forEach(function (s) { var th = el("th", s); th.scope = "col"; kopf.appendChild(th); });
      var tb = t.createTBody(), reihen = z.map(function (zz) {
        var m = zz.match(/^(.*?)[\s:·-]*\b([A-Z])\s*:\s*(.+)$/);
        return m ? [m[1].replace(/[\s:·-]+$/, "") || "Gruppe", m[2], m[3]] : [zz, "", ""];
      });
      reihen.sort(function (a, b) { return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0; });
      reihen.forEach(function (r) {
        var tr = tb.insertRow(); tr.insertCell().textContent = r[0];
        tr.insertCell().textContent = r[1] ? r[1] + (namen[r[1]] ? " " + namen[r[1]] : "") : "–";
        tr.insertCell().textContent = r[2] || "–";
      });
      tabelle.appendChild(t);
    }
    function dazu(zeile) {
      zeile = zeile.replace(/\s+/g, " ").trim(); if (!zeile) return false;
      var z = zeilen(); if (z.indexOf(zeile) >= 0) return false;
      z.push(zeile); schreib(KEY, z.join("\n")); zeigen(); return true;
    }
    hand.addEventListener("click", function () { handBox.hidden = !handBox.hidden; if (!handBox.hidden) hi.focus(); });
    function handEin() { if (dazu(hi.value)) { status.textContent = "Eingetragen."; hi.value = ""; } else status.textContent = "Leer oder schon in der Tabelle."; }
    hok.addEventListener("click", handEin);
    hi.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); handEin(); } });
    scharf(leer, "Leeren", function () { schreib(KEY, null); zeigen(); status.textContent = "Tabelle geleert."; });

    var strom = null, takt = null, cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
    function stopp() {
      clearInterval(takt); takt = null;
      if (strom) { strom.getTracks().forEach(function (t) { t.stop(); }); strom = null; }
      video.hidden = true; cam.textContent = "Kamera starten"; root.classList.remove("qs-scannt");
    }
    function lesen() {
      if (!video.videoWidth || !window.jsQR) return;
      var w = Math.min(video.videoWidth, 960), h = Math.round(video.videoHeight * w / video.videoWidth);
      cv.width = w; cv.height = h; cx.drawImage(video, 0, 0, w, h);
      var bild = cx.getImageData(0, 0, w, h), c = window.jsQR(bild.data, w, h, { inversionAttempts: "dontInvert" });
      if (!c) return;
      try {
        var o = JSON.parse(c.data);
        if (o && o.v === 1 && typeof o.g === "string" && typeof o.a === "string") {
          var g = o.g.slice(0, 30).trim() || "Gruppe";
          if (dazu(g + " · " + o.a.slice(0, 280))) status.textContent = g + " eingetragen. Nächster Code.";
        }
      } catch (e) { /* kein Code des Portals */ }
    }
    cam.addEventListener("click", function () {
      if (strom) { stopp(); status.textContent = "Kamera aus."; return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { status.textContent = "Kein Kamerazugriff in diesem Browser (nur über https). Tragt die Werte von Hand ein."; return; }
      status.textContent = "Kamera startet …";
      jsqrLaden(function (ok) {
        if (!ok) { status.textContent = "Der Code-Leser fehlt. Tragt die Werte von Hand ein."; return; }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }).then(function (s) {
          strom = s; video.srcObject = s; video.hidden = false; video.play(); cam.textContent = "Kamera stoppen"; root.classList.add("qs-scannt");
          status.textContent = "Haltet euren Code vor die Kamera."; takt = setInterval(lesen, 250);
        }).catch(function () { status.textContent = "Kein Zugriff auf die Kamera. Tragt die Werte von Hand ein."; });
      });
    });
    beiFolienwechsel(root, stopp);
    addEventListener("pagehide", stopp);
    addEventListener("storage", function (e) { if (e.key === KEY) zeigen(); });
    zeigen();
  });

  /* Hilfe für Regler der Stunden: Ausgabe mit Komma, Bewegung nur ohne „Bewegung reduzieren“ */
  window.LPMessen = { komma: komma, ruhig: ruhig };
})();
