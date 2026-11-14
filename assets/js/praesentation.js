/* Lernportal – Werkzeuge für Präsentationen: Stift, Timer, Lärmampel.
   Einbinden am Ende des body (nach dem Präsentationsskript oder davor, beides geht):
   <link rel="stylesheet" href="…/assets/css/praesentation.css">
   <script src="…/assets/js/praesentation.js" defer></script>

   Voraussetzung an die Präsentation:
   - #stage ist die 1280 × 720 große Bühne (wird per transform skaliert),
   - jede Folie ist ein Element mit der Klasse .slide, die sichtbare Folie hat display ≠ none.
   - Optional: data-min="5" an einer Folie schlägt dem Timer 5 Minuten vor.

   Alles läuft im Browser. Das Mikrofon wird nur nach Klick auf "Start" in der Lärmampel
   angefragt, nur zur Lautstärkemessung genutzt, nichts wird aufgenommen oder gesendet. */
(() => {
  "use strict";

  const stage = document.getElementById("stage");
  if (!stage || window.Praesentation) return;

  const SVG = (pfade) => '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + pfade + "</svg>";
  const ICON = {
    stift: SVG('<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>'),
    timer: SVG('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5"/><path d="M9.5 3h5"/>'),
    zurueck: SVG('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'),
    voll: SVG('<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>'),
    teilen: SVG('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M14 14h2.5v2.5H14zM19 14v.01M14 19.5v.01M17 19h3.5v1.5"/>'),
    ampel: SVG('<rect x="7" y="2.5" width="10" height="19" rx="3"/><circle cx="12" cy="7.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="16.5" r="1.4"/>')
  };

  function neu(tag, klasse, text) {
    const k = document.createElement(tag);
    if (klasse) k.className = klasse;
    if (text !== undefined) k.textContent = text;
    return k;
  }
  function knopf(klasse, text, label) {
    const b = neu("button", klasse, text);
    b.type = "button";
    if (label) b.setAttribute("aria-label", label);
    return b;
  }
  function speichern(key, wert) { try { localStorage.setItem(key, JSON.stringify(wert)); } catch (e) { /* ohne Speicher weiter */ } }
  function laden(key, std) { try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? std : v; } catch (e) { return std; } }
  function tippt(t) { return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)); }

  const slides = () => [].slice.call(stage.querySelectorAll(".slide"));
  /* Eine Hauptüberschrift je Präsentation: die erste h1 bleibt h1, alle weiteren Folientitel gelten für
     Hilfstechnik als Überschrift der Ebene 2 (Tag und Aussehen bleiben unverändert) */
  (function () {
    let erste = true;
    slides().forEach((s) => [].forEach.call(s.querySelectorAll("h1"), (h) => {
      if (erste) { erste = false; return; }
      h.setAttribute("role", "heading");
      h.setAttribute("aria-level", "2");
    }));
  })();
  function aktuelleFolie() {
    const liste = slides();
    for (let i = 0; i < liste.length; i++) if (getComputedStyle(liste[i]).display !== "none") return i;
    return 0;
  }

  /* ---------- Dock (immer sichtbar, schmal am rechten Rand) und verschiebbare Panels ---------- */
  const dock = neu("div", "lp-pr-dock");
  dock.setAttribute("role", "toolbar");
  dock.setAttribute("aria-label", "Werkzeuge");
  document.body.appendChild(dock);

  /* Klar beschrifteter Rückweg zum Portal und Vollbild */
  (function randKnoepfe() {
    const wurzel = /^(\.\.\/|\.\/)+$/.test(document.body.dataset.root || "") ? document.body.dataset.root : "./";
    const zurueck = neu("a", "lp-pr-btn lp-pr-portal");
    zurueck.href = wurzel;
    zurueck.innerHTML = ICON.zurueck + '<span>Portal</span>';
    zurueck.setAttribute("aria-label", "Zurück zum Portal");
    zurueck.title = "Zurück zum Portal";
    dock.appendChild(zurueck);
    const voll = knopf("lp-pr-btn", "", "Vollbild (Taste F)");
    voll.innerHTML = ICON.voll;
    voll.title = "Vollbild (F)";
    voll.addEventListener("click", () => {
      try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) { /* ok */ }
    });
    dock.appendChild(voll);
    const teilen = knopf("lp-pr-btn", "", "Link und QR-Code (Taste Q)");
    teilen.innerHTML = ICON.teilen;
    teilen.title = "Link und QR-Code (Q)";
    teilen.addEventListener("click", () => teilenOeffnen(teilen));
    dock.appendChild(teilen);
    /* teilen.js wird erst beim ersten Öffnen nachgeladen */
    window.teilenOeffnenInt = teilenOeffnen;
    function teilenOeffnen(opener) {
      const los = () => window.LPTeilen && window.LPTeilen.open({ opener: opener || teilen });
      if (window.LPTeilen) { los(); return; }
      const sk = document.createElement("script");
      sk.src = wurzel + "assets/js/teilen.js";
      sk.onload = los;
      document.head.appendChild(sk);
    }
  })();

  let zTop = 3100;
  const panels = {};

  function panelBauen(id, titel, startOben, breite) {
    const p = neu("section", "lp-pr-panel");
    p.id = "lp-pr-" + id;
    p.hidden = true;
    p.setAttribute("role", "dialog");
    p.setAttribute("aria-label", titel);
    p.style.width = breite + "px";
    const n = Object.keys(panels).length;                   // jedes Panel startet etwas versetzt
    p.style.top = (startOben + n * 28) + "px";
    p.style.right = (76 + n * 28) + "px";
    const kopf = neu("div", "lp-pr-kopf");
    kopf.appendChild(neu("span", "lp-pr-grip", "⠿"));
    kopf.appendChild(neu("strong", "", titel));
    const zu = knopf("lp-pr-zu", "×", titel + " schließen");
    kopf.appendChild(zu);
    const inhalt = neu("div", "lp-pr-inhalt");
    p.appendChild(kopf);
    p.appendChild(inhalt);
    document.body.appendChild(p);

    /* Verschieben per Maus, Finger oder Stift am Kopf */
    let dx = 0, dy = 0, drag = null;
    kopf.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      const r = p.getBoundingClientRect();
      p.style.left = r.left + "px"; p.style.top = r.top + "px"; p.style.right = "auto";
      dx = e.clientX - r.left; dy = e.clientY - r.top; drag = e.pointerId;
      kopf.setPointerCapture(e.pointerId);
      p.style.zIndex = ++zTop;
      e.preventDefault();
    });
    kopf.addEventListener("pointermove", (e) => {
      if (drag !== e.pointerId) return;
      const x = Math.max(0, Math.min(innerWidth - 60, e.clientX - dx));
      const y = Math.max(0, Math.min(innerHeight - 40, e.clientY - dy));
      p.style.left = x + "px"; p.style.top = y + "px";
    });
    const ende = () => { drag = null; };
    kopf.addEventListener("pointerup", ende);
    kopf.addEventListener("pointercancel", ende);
    p.addEventListener("pointerdown", () => { p.style.zIndex = ++zTop; });
    /* Fenster kleiner gezogen: Panel im Bild halten */
    addEventListener("resize", () => {
      const r = p.getBoundingClientRect();
      if (p.hidden || p.style.left === "") return;
      p.style.left = Math.max(0, Math.min(innerWidth - 60, r.left)) + "px";
      p.style.top = Math.max(0, Math.min(innerHeight - 40, r.top)) + "px";
    });

    /* Größe frei verstellbar: Griff unten rechts (Maus, Finger, Stift), die Größe bleibt im Browser gemerkt */
    const griff = knopf("lp-pr-groesse", "", titel + ": Größe ändern (ziehen)");
    griff.title = "Größe ändern";
    p.appendChild(griff);
    const GR = "lp-pr-fenster";
    const alt = (laden(GR, {}) || {})[id];
    if (alt && alt.w >= 220 && alt.h >= 140) { p.style.width = Math.min(alt.w, innerWidth - 16) + "px"; p.style.height = Math.min(alt.h, innerHeight - 16) + "px"; }
    let rz = null;
    griff.addEventListener("pointerdown", (e) => {
      const r = p.getBoundingClientRect();
      p.style.left = r.left + "px"; p.style.top = r.top + "px"; p.style.right = "auto";
      rz = { id: e.pointerId, x: e.clientX, y: e.clientY, w: r.width, h: r.height, l: r.left, t: r.top };
      griff.setPointerCapture(e.pointerId); p.style.zIndex = ++zTop; e.preventDefault(); e.stopPropagation();
    });
    griff.addEventListener("pointermove", (e) => {
      if (!rz || rz.id !== e.pointerId) return;
      p.style.width = Math.max(220, Math.min(innerWidth - rz.l - 4, rz.w + e.clientX - rz.x)) + "px";
      p.style.height = Math.max(140, Math.min(innerHeight - rz.t - 4, rz.h + e.clientY - rz.y)) + "px";
    });
    const rzEnde = () => {
      if (!rz) return; rz = null;
      const r = p.getBoundingClientRect(), gesamt = laden(GR, {}) || {};
      gesamt[id] = { w: Math.round(r.width), h: Math.round(r.height) }; speichern(GR, gesamt);
    };
    griff.addEventListener("pointerup", rzEnde);
    griff.addEventListener("pointercancel", rzEnde);
    griff.addEventListener("dblclick", () => { p.style.height = ""; p.style.width = breite + "px"; const g = laden(GR, {}) || {}; delete g[id]; speichern(GR, g); });   // Doppelklick: Standardgröße

    /* Fenster immer vollständig im Bild halten: Höhe auf den sichtbaren Rest begrenzen, ggf. nach oben schieben */
    function einpassen() {
      if (p.hidden) return;
      p.style.maxHeight = "";
      let r = p.getBoundingClientRect();
      const top = Math.max(8, Math.min(r.top, innerHeight - 8 - Math.min(r.height, innerHeight - 16)));
      if (Math.abs(top - r.top) > 0.5) { p.style.left = r.left + "px"; p.style.right = "auto"; p.style.top = top + "px"; }
      r = p.getBoundingClientRect();
      p.style.maxHeight = Math.max(140, innerHeight - 8 - r.top) + "px";
    }
    p.einpassen = einpassen;
    addEventListener("resize", einpassen);
    kopf.addEventListener("pointerup", einpassen);
    griff.addEventListener("pointerup", einpassen);
    inhalt.addEventListener("toggle", () => setTimeout(einpassen, 0), true);

    const o = { el: p, inhalt, zu, taste: null, beimOeffnen: null, beimSchliessen: null };
    zu.addEventListener("click", () => schalte(id, false));
    panels[id] = o;
    return o;
  }

  function schalte(id, an) {
    const o = panels[id];
    if (!o) return;
    const zeigen = an === undefined ? o.el.hidden : an;
    o.el.hidden = !zeigen;
    if (zeigen) { o.el.style.zIndex = ++zTop; if (o.el.einpassen) o.el.einpassen(); }
    if (o.taste) { o.taste.setAttribute("aria-pressed", String(zeigen)); o.taste.classList.toggle("on", zeigen); }
    if (zeigen && o.beimOeffnen) o.beimOeffnen();
    if (!zeigen && o.beimSchliessen) o.beimSchliessen();
  }

  function dockKnopf(id, icon, label, taste) {
    const b = knopf("lp-pr-btn", "", label + " (Taste " + taste + ")");
    b.innerHTML = icon;                                   // feste, eigene Zeichenkette
        b.setAttribute("aria-pressed", "false");
    b.title = label + " (" + taste + ")";
    dock.appendChild(b);
    panels[id].taste = b;
    b.addEventListener("click", () => schalte(id));
    return b;
  }

  /* =====================================================================
     STIFT
     ===================================================================== */
  const pen = panelBauen("stift", "Stift", 60, 280);
  const FARBEN = [["#d62828", "Rot"], ["#111111", "Schwarz"], ["#1F6BA5", "Blau"], ["#F4B400", "Gelb"], ["#ffffff", "Weiß"]];
  const DICKEN = [["klein", 3], ["mittel", 6], ["groß", 12]];
  const cv = neu("canvas", "lp-pr-canvas");
  const SKAL = 2;                                           // doppelte Auflösung, bleibt auch bei Vollbild scharf
  cv.width = 1280 * SKAL; cv.height = 720 * SKAL;
  cv.setAttribute("aria-hidden", "true");
  stage.appendChild(cv);
  const cx = cv.getContext("2d");
  const striche = {};
  let penAn = false, farbe = FARBEN[0][0], dicke = DICKEN[1][1], radierer = false, strich = null, folie = 0;

  function zeichne() {
    cx.setTransform(SKAL, 0, 0, SKAL, 0, 0);
    cx.clearRect(0, 0, 1280, 720);
    (striche[folie] || []).forEach((s) => {
      cx.globalCompositeOperation = s.r ? "destination-out" : "source-over";
      cx.strokeStyle = s.c; cx.lineWidth = s.w; cx.lineCap = "round"; cx.lineJoin = "round";
      cx.beginPath();
      s.p.forEach((q, k) => (k ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])));
      if (s.p.length === 1) cx.lineTo(s.p[0][0] + 0.1, s.p[0][1]);
      cx.stroke();
    });
    cx.globalCompositeOperation = "source-over";
  }
  function pos(e) {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) * 1280 / r.width, (e.clientY - r.top) * 720 / r.height];
  }
  let anBtn = null;
  function stiftSetzen(an) {
    penAn = an;
    document.body.classList.toggle("lp-stift-an", an);
    if (!an) strich = null;
    if (anBtn) {
      anBtn.textContent = an ? "Stift an" : "Stift aus";
      anBtn.classList.toggle("on", an);
      anBtn.setAttribute("aria-pressed", String(an));
    }
    if (pen.taste) pen.taste.classList.toggle("on", an);
    if (an && panels.stift.el.hidden) schalte("stift", true);   // Panel zeigen (beimOeffnen schaltet nur ein)
  }
  cv.addEventListener("pointerdown", (e) => {
    if (!penAn) return;
    cv.setPointerCapture(e.pointerId);
    strich = { c: farbe, w: radierer ? dicke * 4 : dicke, r: radierer, p: [pos(e)] };
    (striche[folie] = striche[folie] || []).push(strich);
    zeichne();
    e.preventDefault();
  });
  cv.addEventListener("pointermove", (e) => { if (strich) { strich.p.push(pos(e)); zeichne(); } });
  const strichEnde = () => { strich = null; };
  cv.addEventListener("pointerup", strichEnde);
  cv.addEventListener("pointercancel", strichEnde);
  /* Beim Schreiben nicht blättern (Wischgeste der Präsentation) */
  ["touchstart", "touchend", "touchmove"].forEach((n) => cv.addEventListener(n, (e) => { if (penAn) e.stopPropagation(); }, { passive: true }));

  (function stiftPanel() {
    const z = pen.inhalt;
    const an = knopf("lp-pr-gross on", "Stift an", "Stift ein- oder ausschalten");
    an.setAttribute("aria-pressed", "true");
    anBtn = an;
    z.appendChild(an);
    const reihe = neu("div", "lp-pr-reihe");
    reihe.setAttribute("role", "group"); reihe.setAttribute("aria-label", "Farbe");
    FARBEN.forEach(([c, n], i) => {
      const b = knopf("lp-pr-farbe" + (i === 0 ? " act" : ""), "", n);
      b.style.background = c;
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", () => {
        farbe = c; radierer = false;
        reihe.querySelectorAll(".lp-pr-farbe").forEach((x) => { x.classList.toggle("act", x === b); x.setAttribute("aria-pressed", String(x === b)); });
        er.classList.remove("on"); er.setAttribute("aria-pressed", "false");
        stiftSetzen(true);
      });
      reihe.appendChild(b);
    });
    z.appendChild(reihe);
    const dr = neu("div", "lp-pr-reihe");
    dr.setAttribute("role", "group"); dr.setAttribute("aria-label", "Strichstärke");
    DICKEN.forEach(([n, w], i) => {
      const b = knopf("lp-pr-dicke" + (i === 1 ? " act" : ""), "", "Strichstärke " + n);
      const punkt = neu("i"); punkt.style.width = punkt.style.height = (w + 4) + "px"; b.appendChild(punkt);
      b.setAttribute("aria-pressed", String(i === 1));
      b.addEventListener("click", () => {
        dicke = w;
        dr.querySelectorAll(".lp-pr-dicke").forEach((x) => { x.classList.toggle("act", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      });
      dr.appendChild(b);
    });
    z.appendChild(dr);
    const er = knopf("lp-pr-klein", "Radierer", "Radierer");
    er.setAttribute("aria-pressed", "false");
    const rueck = knopf("lp-pr-klein", "Zurück", "Letzten Strich zurücknehmen");
    const leer = knopf("lp-pr-klein", "Folie leeren", "Alle Striche auf dieser Folie löschen");
    const zeile = neu("div", "lp-pr-reihe"); zeile.appendChild(er); zeile.appendChild(rueck); zeile.appendChild(leer);
    z.appendChild(zeile);
    z.appendChild(neu("p", "lp-pr-hinweis", "Solange der Stift an ist, lassen sich Schaltflächen auf der Folie nicht antippen. Zum Bedienen den Stift ausschalten (Taste P). Die Striche bleiben sichtbar."));
    an.addEventListener("click", () => stiftSetzen(!penAn));
    er.addEventListener("click", () => { radierer = !radierer; er.classList.toggle("on", radierer); er.setAttribute("aria-pressed", String(radierer)); stiftSetzen(true); });
    rueck.addEventListener("click", () => { (striche[folie] || []).pop(); zeichne(); });
    leer.addEventListener("click", () => { striche[folie] = []; zeichne(); });
    pen.beimOeffnen = () => { if (!penAn) stiftSetzen(true); };
    pen.beimSchliessen = () => { stiftSetzen(false); };      // Panel zu = Stift aus, Striche bleiben
  })();
  dockKnopf("stift", ICON.stift, "Stift", "P");

  /* =====================================================================
     TIMER
     ===================================================================== */
  const tim = panelBauen("timer", "Timer", 60, 300);
  let rest = 300, gesamt = 300, uhr = null, ende = 0, audio = null;
  const MIN_RE = /^\s*(\d+)\s*Min\./;
  const anzeige = neu("div", "lp-pr-zeit", "05:00");
  const status = neu("p", "lp-pr-hinweis", "");
  status.setAttribute("aria-live", "polite");
  const startBtn = knopf("lp-pr-gross", "Start", "Timer starten");
  const folieBtn = knopf("lp-pr-klein", "", "Dauer der Folie übernehmen");
  folieBtn.hidden = true;
  const bild = neu("span", "lp-pr-dockzeit");
  /* Minutenangaben auf den Folien (z. B. „5 Min. · allein“) sind antippbar und starten den Timer; */
  let aktivChip = null;                                     // die Minutenangabe, die gerade herunterzählt
  const chips = [];

  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function zeitZeigen() {
    anzeige.textContent = fmt(Math.max(0, rest));
    bild.textContent = (uhr || rest === 0) ? fmt(Math.max(0, rest)) : "";
    tim.taste && tim.taste.classList.toggle("lp-pr-lauf", !!uhr);
    anzeige.classList.toggle("aus", rest === 0);
    chipsZeigen();
  }
  function chipsZeigen() {
    chips.forEach((c) => {
      const mein = c === aktivChip && (uhr || rest < gesamt || rest === 0);
      const zustand = !mein ? "aus" : uhr ? "an" : rest === 0 ? "ende" : "pause";
      c.el.dataset.lauf = zustand;
      const text = mein ? c.orig.replace(MIN_RE, fmt(Math.max(0, rest))) + (rest === 0 ? " Zeit!" : "") : c.orig;
      if (c.el.textContent !== text) c.el.textContent = text;
    });
  }
  function piep() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach((t) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.frequency.value = 880; g.gain.value = 0.15;
        o.connect(g); g.connect(audio.destination);
        o.start(audio.currentTime + t); o.stop(audio.currentTime + t + 0.2);
      });
    } catch (e) { /* ohne Ton weiter */ }
  }
  function timerStop() { clearInterval(uhr); uhr = null; startBtn.textContent = rest > 0 && rest < gesamt ? "Weiter" : "Start"; }
  function setze(sek, behalten) { if (!behalten) aktivChip = null; timerStop(); gesamt = rest = Math.max(0, Math.min(99 * 60 + 59, sek)); startBtn.textContent = "Start"; status.textContent = ""; zeitZeigen(); }
  function timerStart() {
    if (uhr) { timerStop(); zeitZeigen(); return; }
    if (rest <= 0) rest = gesamt;
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch (e) { /* ok */ }
    ende = Date.now() + rest * 1000;                       // genau auch bei gedrosselten Hintergrund-Tabs
    startBtn.textContent = "Pause";
    uhr = setInterval(() => {
      rest = Math.max(0, Math.round((ende - Date.now()) / 1000));
      if (rest <= 0) { timerStop(); startBtn.textContent = "Start"; status.textContent = "Zeit ist um."; piep(); }
      zeitZeigen();
    }, 250);
    zeitZeigen();
  }
  (function timerPanel() {
    const z = tim.inhalt;
    z.appendChild(anzeige);
    const pre = neu("div", "lp-pr-reihe");
    pre.setAttribute("role", "group"); pre.setAttribute("aria-label", "Dauer wählen");
    [1, 3, 5, 10, 15].forEach((m) => {
      const b = knopf("lp-pr-klein", m + " Min.", m + " Minuten einstellen");
      b.addEventListener("click", () => setze(m * 60));
      pre.appendChild(b);
    });
    z.appendChild(pre);
    const fein = neu("div", "lp-pr-reihe");
    const minus = knopf("lp-pr-klein", "−1 Min.", "Eine Minute abziehen");
    const plus = knopf("lp-pr-klein", "+1 Min.", "Eine Minute addieren");
    const plus30 = knopf("lp-pr-klein", "+30 s", "30 Sekunden addieren");
    minus.addEventListener("click", () => { const w = uhr; setze(Math.max(0, rest - 60), true); if (w) timerStart(); });
    plus.addEventListener("click", () => { const w = uhr; setze(rest + 60, true); if (w) timerStart(); });
    plus30.addEventListener("click", () => { const w = uhr; setze(rest + 30, true); if (w) timerStart(); });
    fein.appendChild(minus); fein.appendChild(plus30); fein.appendChild(plus);
    z.appendChild(fein);
    z.appendChild(folieBtn);
    const steuer = neu("div", "lp-pr-reihe");
    const reset = knopf("lp-pr-klein", "Zurücksetzen", "Timer zurücksetzen");
    reset.addEventListener("click", () => setze(gesamt));
    startBtn.addEventListener("click", timerStart);
    steuer.appendChild(startBtn); steuer.appendChild(reset);
    z.appendChild(steuer);
    z.appendChild(status);
    folieBtn.addEventListener("click", () => { const m = parseFloat(folieBtn.dataset.min); if (m > 0) setze(Math.round(m * 60)); });
  })();
  /* Minutenangaben antippbar machen: erstes Wort der Angabe muss „N Min.“ sein (Badge, Meta-Chip oder data-minuten) */
  [].forEach.call(stage.querySelectorAll(".slide .badge, .slide .meta span, .slide [data-minuten]"), (el) => {
    if (el.closest("button, a, [data-timer], .lp-pr-minuten") || el.children.length) return;
    const m = MIN_RE.exec(el.textContent);
    if (!m) return;
    const c = { el, orig: el.textContent, sek: +m[1] * 60 };
    chips.push(c);
    el.classList.add("lp-pr-minuten");
    el.tabIndex = 0; el.setAttribute("role", "button");
    el.setAttribute("aria-label", "Timer starten: " + m[1] + " Minuten");
    el.title = "Antippen startet den Timer (" + m[1] + " Min.)";
    const klick = () => {
      if (aktivChip === c && (uhr || (rest > 0 && rest < gesamt))) { timerStart(); return; }   // Pause bzw. Weiter
      setze(c.sek); aktivChip = c; timerStart();                                               // neu starten
    };
    el.addEventListener("click", klick);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); klick(); } });
  });
  chipsZeigen();
  const timerTaste = dockKnopf("timer", ICON.timer, "Timer", "T");
  timerTaste.appendChild(bild);
  function folienMinuten() {
    const s = slides()[folie];
    const m = s && parseFloat(s.dataset.min);
    if (m > 0) { folieBtn.hidden = false; folieBtn.dataset.min = m; folieBtn.textContent = "Dauer dieser Folie: " + m + " Min."; }
    else folieBtn.hidden = true;
  }
  zeitZeigen();

  /* =====================================================================
     LÄRMAMPEL
     ===================================================================== */
  const lae = panelBauen("laerm", "Lärmampel", 60, 280);
  const SCHL = "lp-pr-laerm";
  const cfg = laden(SCHL, { gelb: -42, rot: -32, ton: true });   // Grenzen in dBFS, je Gerät kalibrierbar; ton = Signaltöne
  let strom = null, ctxA = null, analyser = null, daten = null, raf = 0, glatt = -90, stufe = 0, rotBis = 0, kalib = null, stummBis = 0, rotTonBis = 0;
  /* Signaltöne: Rot = sanfter, fallender Zweiklang, Stern = kurzer Ding, Ziel = Dreiklang.
     Während und kurz nach einem Ton wird die Ampel nicht neu bewertet, damit der Lautsprecher die Messung nicht auslöst. */
  function ton(noten) {
    if (!cfg.ton) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
      let t = audio.currentTime + 0.02, gesamt = 0;
      noten.forEach(([f, d]) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + d + 0.05);
        t += d * 0.8; gesamt += d * 0.8;
      });
      stummBis = Date.now() + gesamt * 1000 + 1200;
    } catch (e) { /* ohne Ton weiter */ }
  }
  const lampen = neu("div", "lp-pr-lampen");
  lampen.setAttribute("aria-hidden", "true");
  const lg = neu("i", "g"), ly = neu("i", "y"), lr = neu("i", "r");
  lampen.appendChild(lg); lampen.appendChild(ly); lampen.appendChild(lr);
  const text = neu("p", "lp-pr-laermtext", "Aus");
  const balken = neu("div", "lp-pr-balken");
  const fuell = neu("i"); balken.appendChild(fuell);
  balken.appendChild(neu("b", "m1")); balken.appendChild(neu("b", "m2"));
  const meld = neu("p", "lp-pr-hinweis", "Das Mikrofon misst nur die Lautstärke. Es wird nichts aufgenommen oder gesendet.");
  meld.setAttribute("role", "status");
  const lStart = knopf("lp-pr-gross", "Start", "Lärmmessung starten");
  const lKal = knopf("lp-pr-klein", "Kalibrieren", "Mit der jetzigen Lautstärke als ruhig kalibrieren");
  lKal.disabled = true;
  const emp = document.createElement("input");
  emp.type = "range"; emp.min = "-60"; emp.max = "-15"; emp.step = "1"; emp.value = String(cfg.gelb);
  emp.id = "lp-pr-emp"; emp.className = "lp-pr-regler";
  const empLabel = neu("label", "", "Empfindlichkeit (links: empfindlicher)");
  empLabel.htmlFor = "lp-pr-emp";

  const db = (v) => Math.max(0, Math.min(100, (v + 70) / 60 * 100));
  function grenzen() { balken.querySelector(".m1").style.left = db(cfg.gelb) + "%"; balken.querySelector(".m2").style.left = db(cfg.rot) + "%"; }
  function ampelSetzen(s, ruhig) {
    stufe = s;
    lg.classList.toggle("an", s === 0 && !ruhig); ly.classList.toggle("an", s === 1); lr.classList.toggle("an", s === 2);
    lampen.classList.toggle("aus", !!ruhig);
    text.textContent = ruhig ? "Aus" : ["Ruhig", "Etwas laut", "Zu laut"][s];
    lae.el.dataset.stufe = ruhig ? "aus" : String(s);
  }
  function messen() {
    analyser.getFloatTimeDomainData(daten);
    let q = 0;
    for (let i = 0; i < daten.length; i++) q += daten[i] * daten[i];
    const wert = 20 * Math.log10(Math.sqrt(q / daten.length) + 1e-9);
    glatt = wert > glatt ? glatt * 0.6 + wert * 0.4 : glatt * 0.95 + wert * 0.05;   // schnell hoch, langsam runter
    fuell.style.width = db(glatt) + "%";
    const jetzt = Date.now();
    if (kalib) {
      kalib.summe += wert; kalib.n++;
      if (jetzt >= kalib.bis) {
        const m = kalib.summe / kalib.n; kalib = null;
        cfg.gelb = Math.round(Math.max(-60, Math.min(-15, m + 8)));
        cfg.rot = cfg.gelb + 10;
        emp.value = String(cfg.gelb); speichern(SCHL, cfg); grenzen();
        meld.textContent = "Kalibriert: Das jetzige Niveau gilt als ruhig.";
      }
    }
    let s = glatt >= cfg.rot ? 2 : glatt >= cfg.gelb ? 1 : 0;
    if (s === 2) rotBis = jetzt + 1500;                    // Rot bleibt kurz stehen, sonst flackert die Ampel
    else if (jetzt < rotBis) s = 2;
    if (jetzt < stummBis && lae.el.dataset.stufe !== "aus") s = stufe;   // während eines Signaltons nicht neu bewerten
    const neuRot = s === 2 && stufe !== 2;
    if (s !== stufe || lae.el.dataset.stufe === "aus") ampelSetzen(s, false);
    if (neuRot && jetzt >= rotTonBis) { rotTonBis = jetzt + 8000; ton([[660, 0.45], [494, 0.7]]); }   // höchstens alle 8 Sekunden
    ruheTick(jetzt, s);
    raf = requestAnimationFrame(messen);
  }

  /* ---------- Ruhe-Sterne: die Klasse sammelt gemeinsam, Rot kostet nie Sterne ---------- */
  const SPK = "lp-pr-sterne";
  const pk = laden(SPK, { takt: 30, ziel: 8 });
  let sterne = 0, ruhe = 0, ruheLetzt = 0;
  const sternAnz = neu("p", "lp-pr-sterne", "");
  sternAnz.setAttribute("role", "img");
  const sternBalken = neu("div", "lp-pr-balken lp-pr-ruhebalken");
  const sternFuell = neu("i"); sternBalken.appendChild(sternFuell);
  const spielBtn = knopf("lp-pr-gross on", "Spiel starten", "Belohnungsspiel starten");
  spielBtn.hidden = true;
  const sternLabel = neu("span", "lp-pr-dockzeit");
  function sterneZeigen() {
    sternAnz.textContent = "★".repeat(Math.min(sterne, pk.ziel)) + "☆".repeat(Math.max(0, pk.ziel - sterne));
    sternAnz.setAttribute("aria-label", sterne + " von " + pk.ziel + " Sternen");
    sternFuell.style.width = Math.min(100, ruhe / pk.takt * 100) + "%";
    spielBtn.hidden = sterne < pk.ziel;
    sternLabel.textContent = (strom || sterne) ? "★ " + sterne + "/" + pk.ziel : "";
  }
  function ruheTick(jetzt, s) {
    const dt = ruheLetzt ? Math.min(0.5, (jetzt - ruheLetzt) / 1000) : 0;
    ruheLetzt = jetzt;
    if (kalib || sterne >= pk.ziel) return;                 // beim Kalibrieren und nach dem Ziel wird nicht gezählt
    if (s === 0) ruhe += dt;                                // Grün: Balken füllt sich
    else if (s === 2) ruhe = 0;                             // Rot: Balken beginnt von vorn, Sterne bleiben
    if (ruhe >= pk.takt) {
      ruhe = 0; sterne++;
      ton(sterne >= pk.ziel ? [[523, 0.25], [659, 0.25], [784, 0.6]] : [[880, 0.18], [1175, 0.4]]);   // Ding, beim Ziel ein Dreiklang
    }
    sterneZeigen();
  }
  function laermAus(nachricht) {
    cancelAnimationFrame(raf); raf = 0; kalib = null; ruheLetzt = 0;
    if (strom) { strom.getTracks().forEach((t) => t.stop()); strom = null; }
    if (ctxA) { try { ctxA.close(); } catch (e) { /* ok */ } ctxA = null; }
    analyser = null; glatt = -90; fuell.style.width = "0%";
    ampelSetzen(0, true);
    lStart.textContent = "Start"; lKal.disabled = true;
    lae.taste && lae.taste.classList.remove("lp-pr-lauf");
    if (nachricht) meld.textContent = nachricht;
  }
  async function laermAn() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) {
      meld.textContent = "Dieser Browser oder diese Adresse erlaubt keinen Mikrofonzugriff. Die Seite muss über https geöffnet sein.";
      return;
    }
    meld.textContent = "Bitte den Mikrofonzugriff erlauben …";
    try {
      strom = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
      strom = null;
      meld.textContent = e && e.name === "NotFoundError" ? "Kein Mikrofon gefunden." : "Kein Zugriff aufs Mikrofon. Erlaube ihn in den Browsereinstellungen und starte neu.";
      return;
    }
    if (lae.el.hidden) { strom.getTracks().forEach((t) => t.stop()); strom = null; return; }   // inzwischen geschlossen
    const AC = window.AudioContext || window.webkitAudioContext;
    ctxA = new AC();
    try { await ctxA.resume(); } catch (e) { /* ok */ }
    const quelle = ctxA.createMediaStreamSource(strom);
    analyser = ctxA.createAnalyser(); analyser.fftSize = 2048;
    daten = new Float32Array(analyser.fftSize);
    quelle.connect(analyser);                               // nicht mit den Lautsprechern verbunden
    lStart.textContent = "Stopp"; lKal.disabled = false;
    lae.taste && lae.taste.classList.add("lp-pr-lauf");
    meld.textContent = "Tipp: Wenn die Klasse leise arbeitet, auf „Kalibrieren“ tippen.";
    ampelSetzen(0, false);
    raf = requestAnimationFrame(messen);
  }
  (function laermPanel() {
    const z = lae.inhalt;
    z.appendChild(lampen); z.appendChild(text); z.appendChild(balken);
    const r = neu("div", "lp-pr-reihe"); r.appendChild(lStart); z.appendChild(r);
    const tonBtn = knopf("lp-pr-klein", cfg.ton ? "Ton: an" : "Ton: aus", "Signaltöne ein- oder ausschalten");
    tonBtn.setAttribute("aria-pressed", String(!!cfg.ton));
    tonBtn.addEventListener("click", () => {
      cfg.ton = !cfg.ton; speichern(SCHL, cfg);
      tonBtn.textContent = cfg.ton ? "Ton: an" : "Ton: aus"; tonBtn.setAttribute("aria-pressed", String(cfg.ton));
      if (cfg.ton) ton([[660, 0.3]]);                       // Hörprobe
    });
    const r2 = neu("div", "lp-pr-reihe"); r2.appendChild(lKal); r2.appendChild(tonBtn); z.appendChild(r2);
    const rg = neu("div", "lp-pr-regelzeile"); rg.appendChild(empLabel); rg.appendChild(emp); z.appendChild(rg);
    /* Sterne und Einstellungen */
    z.appendChild(sternAnz); z.appendChild(sternBalken); z.appendChild(spielBtn);
    const det = document.createElement("details"); det.className = "lp-pr-details";
    det.appendChild(neu("summary", "", "Sterne einstellen"));
    function stepper(label, wert, min, max, schritt, setze) {
      const zeile = neu("div", "lp-pr-step");
      zeile.appendChild(neu("span", "lp-pr-steptext", label));
      const m = knopf("lp-pr-klein", "−", label + " verringern"), pl = knopf("lp-pr-klein", "+", label + " erhöhen");
      const w = neu("b", "", String(wert));
      m.addEventListener("click", () => { const v = Math.max(min, +w.textContent - schritt); w.textContent = v; setze(v); });
      pl.addEventListener("click", () => { const v = Math.min(max, +w.textContent + schritt); w.textContent = v; setze(v); });
      const reglerZeile = neu("div", "lp-pr-stepreihe");
      reglerZeile.appendChild(m); reglerZeile.appendChild(w); reglerZeile.appendChild(pl);
      zeile.appendChild(reglerZeile);
      return zeile;
    }
    det.appendChild(stepper("Sekunden pro Stern", pk.takt, 10, 120, 5, (v) => { pk.takt = v; speichern(SPK, pk); sterneZeigen(); }));
    det.appendChild(stepper("Sterne bis Spiel", pk.ziel, 1, 20, 1, (v) => { pk.ziel = v; speichern(SPK, pk); sterneZeigen(); }));
    const von = knopf("lp-pr-klein", "+1 Stern", "Einen Stern geben"), weg = knopf("lp-pr-klein", "−1 Stern", "Einen Stern wegnehmen"), nul = knopf("lp-pr-klein", "Neu beginnen", "Alle Sterne löschen");
    von.addEventListener("click", () => { sterne = Math.min(pk.ziel, sterne + 1); sterneZeigen(); });
    weg.addEventListener("click", () => { sterne = Math.max(0, sterne - 1); sterneZeigen(); });
    nul.addEventListener("click", () => { sterne = 0; ruhe = 0; sterneZeigen(); });
    const hand = neu("div", "lp-pr-reihe"); hand.appendChild(von); hand.appendChild(weg); hand.appendChild(nul);
    det.appendChild(hand);
    det.appendChild(neu("p", "lp-pr-hinweis", "Gezählt wird nur bei laufender Ampel und Grün. Bei Gelb pausiert der Balken, bei Rot beginnt er von vorn. Sterne gehen nie verloren, außer du nimmst sie weg."));
    z.appendChild(det);
    spielBtn.addEventListener("click", () => { sterne = 0; ruhe = 0; sterneZeigen(); spielStarten(); });
    sterneZeigen();
    z.appendChild(meld);
    grenzen(); ampelSetzen(0, true);
    lStart.addEventListener("click", () => { if (strom) laermAus("Messung beendet."); else laermAn(); });
    lKal.addEventListener("click", () => { if (analyser) { kalib = { summe: 0, n: 0, bis: Date.now() + 3000 }; meld.textContent = "Messe 3 Sekunden …"; } });
    emp.addEventListener("input", () => { cfg.gelb = +emp.value; cfg.rot = cfg.gelb + 10; speichern(SCHL, cfg); grenzen(); });
    lae.beimSchliessen = () => laermAus("Das Mikrofon ist aus.");   // Schließen beendet die Messung
  })();
  dockKnopf("laerm", ICON.ampel, "Lärmampel", "L").appendChild(sternLabel);


  /* =====================================================================
     FRAGENFELD (Fragenentwicklung): <div data-fragenfeld></div> in einer Folie genügt.
     Die Klasse nennt Fragen, die Lehrkraft tippt sie ein, die Klasse priorisiert mit 👍,
     „→ Leitfrage“ trägt die gewählte Frage unten ein (dort frei umformulierbar).
     Optional: data-impulse="Frage 1|Frage 2|Frage 3" ersetzt die Moderationsfragen links (die letzte wird hervorgehoben).
     Jedes Element mit data-leitfrage zeigt später in der Präsentation die Leitfrage an.
     Es wird nichts gespeichert; die Fragen verschwinden beim Neuladen.
     ===================================================================== */
  const STANDARD_IMPULSE = ["Was fällt euch auf?", "Was überrascht euch?", "Was wollt ihr herausfinden?", "Welche Frage stellt sich euch?"];
  let leitfrageText = "";
  function leitfrageSpiegeln() {
    [].forEach.call(document.querySelectorAll("[data-leitfrage]"), (e) => { e.textContent = leitfrageText || "…"; });
  }
  [].forEach.call(document.querySelectorAll("[data-fragenfeld]"), (feld) => {
    feld.classList.add("fragen");
    feld.textContent = "";
    const hilfe = neu("ol", "fragen-hilfe");
    const impulse = (feld.dataset.impulse ? feld.dataset.impulse.split("|") : STANDARD_IMPULSE).map((t) => t.trim()).filter(Boolean);
    impulse.forEach((t, i) => {
      const li = neu("li"); li.appendChild(neu("b", "", String(i + 1))); li.appendChild(neu("span", "", t)); hilfe.appendChild(li);
    });
    const rechts = neu("div", "fragen-rechts");
    const neuZeile = neu("div", "fragen-neu");
    const eingabe = document.createElement("input");
    eingabe.type = "text"; eingabe.maxLength = 140; eingabe.placeholder = "Eure Frage eintippen …"; eingabe.setAttribute("aria-label", "Frage eintippen");
    eingabe.spellcheck = false;
    const hinzu = knopf("lp-pr-aktion", "Hinzufügen", "Frage hinzufügen");
    neuZeile.appendChild(eingabe); neuZeile.appendChild(hinzu);
    const liste = neu("div", "fragen-liste");
    liste.setAttribute("aria-live", "polite");
    rechts.appendChild(neuZeile); rechts.appendChild(liste);
    const leit = neu("div", "fragen-leit");
    leit.appendChild(neu("div", "fragen-label", "Unsere Frage für heute:"));
    const text = neu("div", "fragen-text");
    text.contentEditable = "true"; text.spellcheck = false;
    text.setAttribute("role", "textbox"); text.setAttribute("aria-label", "Unsere Frage für heute, anklickbar zum Umformulieren");
    leit.appendChild(text);
    feld.appendChild(hilfe); feld.appendChild(rechts); feld.appendChild(leit);

    const fragen = [];
    function zeige() {
      liste.textContent = "";
      fragen.slice().sort((a, b) => b.v - a.v || a.id - b.id).forEach((q) => {
        const k = neu("div", "fragen-karte");
        k.appendChild(neu("span", "", q.t));
        const stimme = knopf("", "👍 " + q.v, "Stimme für diese Frage, bisher " + q.v);
        stimme.addEventListener("click", () => { q.v++; zeige(); });
        const wahl = knopf("leit", "→ Leitfrage", "Als Leitfrage übernehmen");
        wahl.addEventListener("click", () => { text.textContent = q.t; leitfrageText = q.t; leitfrageSpiegeln(); });
        const weg = knopf("", "✕", "Frage entfernen");
        weg.addEventListener("click", () => { fragen.splice(fragen.indexOf(q), 1); zeige(); });
        k.appendChild(stimme); k.appendChild(wahl); k.appendChild(weg);
        liste.appendChild(k);
      });
    }
    function hinzufuegen() {
      const t = eingabe.value.trim();
      if (!t) return;
      fragen.push({ id: fragen.length ? fragen[fragen.length - 1].id + 1 : 0, t, v: 0 });
      eingabe.value = ""; zeige(); eingabe.focus();
    }
    hinzu.addEventListener("click", hinzufuegen);
    eingabe.addEventListener("keydown", (e) => { if (e.key === "Enter") hinzufuegen(); });
    text.addEventListener("input", () => { leitfrageText = text.textContent.trim(); leitfrageSpiegeln(); });
  });
  leitfrageSpiegeln();

  /* =====================================================================
     SPIELE (Belohnung): allgemeine Spiele in assets/games/, Inhalte liefert jede Präsentation selbst
     ===================================================================== */
  const BASIS = (document.currentScript && document.currentScript.src || "").replace(/js\/praesentation\.js.*$/, "");
  const LP = window.LPSpiele = window.LPSpiele || {};
  LP.reg = LP.reg || {};
  LP.hilfe = {
    el: neu,
    knopf,
    mischen(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    zeit(sek) { return Math.floor(sek / 60) + ":" + String(Math.floor(sek % 60)).padStart(2, "0"); }
  };
  const SPIELE = ["memory", "quiz", "zuordnen", "wortsalat"];
  const EIGNUNG = {                                        // Mindestanzahl brauchbarer Paare je Spiel
    memory: (p) => p.length >= 4, quiz: (p) => p.length >= 4, zuordnen: (p) => p.length >= 4,
    wortsalat: (p) => p.filter((x) => /^[A-Za-zÄÖÜäöüß]{3,14}$/.test(x.b)).length >= 3
  };
  let letztesSpiel = "";
  function spielDaten() {
    const el = document.getElementById("lp-spiel-daten");
    if (!el) return null;
    try {
      const d = JSON.parse(el.textContent);
      const paare = (d.paare || []).filter((x) => Array.isArray(x) && x[0] && x[1]).map((x) => ({ b: String(x[0]), e: String(x[1]), s: x[2] ? String(x[2]) : "" }));
      return { titel: d.titel || "", paare, erlaubt: Array.isArray(d.spiele) ? d.spiele : SPIELE };
    } catch (e) { return null; }
  }
  function ladeSpiel(name) {
    return new Promise((ok, nein) => {
      if (LP.reg[name]) return ok(LP.reg[name]);
      const sk = document.createElement("script");
      sk.src = BASIS + "games/" + name + ".js";
      sk.onload = () => (LP.reg[name] ? ok(LP.reg[name]) : nein(new Error("leer")));
      sk.onerror = () => nein(new Error("fehlt"));
      document.head.appendChild(sk);
    });
  }
  function spielStarten() {
    const d = spielDaten();
    const flaeche = neu("div", "lp-pr-spiel");
    flaeche.setAttribute("role", "dialog"); flaeche.setAttribute("aria-label", "Belohnungsspiel");
    const kopf = neu("div", "lp-pr-spielkopf");
    const titel = neu("strong", "", "Belohnung: Spiel");
    const zu = knopf("lp-pr-klein", "Schließen", "Spiel schließen");
    kopf.appendChild(titel); kopf.appendChild(zu);
    const feld = neu("div", "lp-pr-spielfeld");
    flaeche.appendChild(kopf); flaeche.appendChild(feld);
    document.body.appendChild(flaeche);
    let aktiv = true;
    const ende = () => { aktiv = false; flaeche.remove(); document.removeEventListener("keydown", esc, true); };
    const esc = (e) => { if (e.key === "Escape") ende(); };
    document.addEventListener("keydown", esc, true);
    zu.addEventListener("click", ende);
    if (!d || !d.paare.length) { feld.appendChild(neu("p", "lp-pr-spieltext", "Für diese Präsentation sind noch keine Spielinhalte hinterlegt.")); return; }
    const frei = SPIELE.filter((n) => d.erlaubt.indexOf(n) >= 0 && EIGNUNG[n](d.paare));
    const wahl = frei.filter((n) => n !== letztesSpiel);
    const name = (wahl.length ? wahl : frei)[Math.floor(Math.random() * (wahl.length ? wahl.length : frei.length))];
    if (!name) { feld.appendChild(neu("p", "lp-pr-spieltext", "Es sind zu wenige Spielinhalte hinterlegt (mindestens 4 Paare).")); return; }
    letztesSpiel = name;
    feld.appendChild(neu("p", "lp-pr-spieltext", "Spiel wird geladen …"));
    ladeSpiel(name).then((spiel) => {
      if (!aktiv) return;
      feld.textContent = "";
      titel.textContent = "Belohnung: " + spiel.titel;
      spiel.start({ feld, paare: d.paare, hilfe: LP.hilfe, ende });
    }).catch(() => { if (aktiv) { feld.textContent = ""; feld.appendChild(neu("p", "lp-pr-spieltext", "Das Spiel konnte nicht geladen werden.")); } });
  }
  window.Praesentation = window.Praesentation || {};
  /* ---------- Folienwechsel erkennen (Striche gehören zur Folie) ---------- */
  function folieAktualisieren() {
    const n = aktuelleFolie();
    if (n === folie && cv.dataset.f) return;
    folie = n; cv.dataset.f = "1";
    zeichne(); folienMinuten();
  }
  const beob = new MutationObserver(folieAktualisieren);
  slides().forEach((s) => beob.observe(s, { attributes: true, attributeFilter: ["class"] }));
  addEventListener("hashchange", folieAktualisieren);
  folieAktualisieren();

  /* =====================================================================
     Leseansicht: alle Folien untereinander zum Nachlesen (Handy, zu Hause).
     - Schmale Fenster (unter 820 px): eine Spalte. Mehrspaltige Bereiche der Folie laufen untereinander,
       die Schrift richtet sich nach dem Lesemodus (Aa). Dafür werden die Folien einmal vermessen.
     - Breite Fenster: jede Folie in Originalform, nur untereinander statt zum Blättern.
     Start: Knopf im Werkzeugrand, Adresse ?ansicht=lesen, oder von selbst auf dem Handy im Hochformat.
     ?ansicht=folien erzwingt die Präsentation. Es wird nichts gespeichert.
     ===================================================================== */
  const LESE_BREIT = 820, LESE_SPALTE = 520, LESE_FAKTOR = { gross: 1.15, "sehr-gross": 1.3 };
  const wurzelEl = document.documentElement;
  let lesenAn = false, leseVermessen = false;

  ICON.buch = SVG('<path d="M12 6.5C10.2 5.2 7.6 4.7 4.5 5v13c3.1-.3 5.7.2 7.5 1.5 1.8-1.3 4.4-1.8 7.5-1.5V5c-3.1-.3-5.7.2-7.5 1.5z"/><path d="M12 6.5v13"/>');
  ICON.folien = SVG('<rect x="3.5" y="5" width="17" height="11.5" rx="2"/><path d="M12 16.5V20"/><path d="M8.5 20h7"/>');

  /* Einmal im Folienlayout (1280 px) messen, was auf dem Handy umgebaut werden muss:
     data-lese-fluss   = an der Folie absolut gesetzt (z. B. Minutenangabe), läuft im Lesen im Textfluss mit
     data-lese-spalten = Raster oder Zeile mit mindestens zwei breiten Spalten, läuft im Lesen untereinander
     data-lese-fest    = Kasten mit darin absolut gesetzten Teilen (z. B. beschriftete Abbildung): behält seine Maße
                         und wird als Ganzes verkleinert, wenn er breiter als die Spalte ist (leseEngpass)
     data-lese-weit    = feste Mindestbreite ab 180 px (z. B. lange Lücke), entfällt im Lesen */
  function leseMessen() {
    if (leseVermessen) return;
    leseVermessen = true;
    wurzelEl.classList.add("lp-lese-mess");
    slides().forEach((s) => {
      [].forEach.call(s.querySelectorAll("*"), (el) => {
        if (el.ownerSVGElement || !el.getClientRects().length) return;
        const cs = getComputedStyle(el);
        if (cs.position === "absolute") {
          let halt = el.offsetParent;
          if (halt === undefined) {                        // SVG-Wurzel: Bezugskasten von Hand suchen
            halt = el.parentElement;
            while (halt && halt !== s && getComputedStyle(halt).position === "static") halt = halt.parentElement;
          }
          if (halt === s) el.setAttribute("data-lese-fluss", "");
          else if (halt && s.contains(halt)) halt.setAttribute("data-lese-fest", "");
        }
        const d = cs.display;
        if (d === "grid" || d === "inline-grid") {
          const breit = cs.gridTemplateColumns.split(/\s+/).filter((w) => parseFloat(w) >= 180).length;
          if (breit >= 2) el.setAttribute("data-lese-spalten", "");
        } else if ((d === "flex" || d === "inline-flex") && cs.flexDirection.indexOf("row") === 0) {
          const breit = [].filter.call(el.children, (k) => k.offsetWidth >= 180).length;
          if (breit >= 2) el.setAttribute("data-lese-spalten", "");
        }
        if (parseFloat(cs.minWidth) >= 180) el.setAttribute("data-lese-weit", "");
      });
    });
    wurzelEl.classList.remove("lp-lese-mess");
  }

  function leseMass() {
    if (!lesenAn) return;
    /* Breite des Anzeigebereichs, nicht innerWidth: Auf dem Handy meldet innerWidth bei breitem Inhalt die herausgezoomte Breite (bis 1280 px) */
    const breit = wurzelEl.clientWidth >= LESE_BREIT;
    wurzelEl.classList.toggle("lp-lesen-breit", breit);
    wurzelEl.classList.toggle("lp-lesen-schmal", !breit);
    const platz = Math.max(240, wurzelEl.clientWidth - 16);
    const f = LESE_FAKTOR[wurzelEl.dataset.size] || 1;
    const w = breit ? 1280 : Math.round(LESE_SPALTE / f);
    const z = breit ? Math.min(1, platz / w) : Math.min(f, platz / w);
    stage.style.setProperty("--lese-breite", w + "px");
    stage.style.setProperty("--lese-zoom", String(Math.round(z * 1000) / 1000));
    leseEngpass();
  }
  /* Was in der schmalen Spalte nicht umbrechen kann, wird als Ganzes verkleinert (wie ein Bild):
     Kästen mit festen Maßen und Bereiche, deren Inhalt über ihren Rand hinausragt. Breite Tabellen scrollen im eigenen Rahmen.
     Bei jeder Größenänderung wird alles zurückgesetzt und neu berechnet. */
  let leseKlein = [];
  function leseEngpass() {
    leseKlein.forEach((m) => { m.el.style.zoom = m.zoom; m.el.style.width = m.width; });
    leseKlein = [];
    const schmal = lesenAn && wurzelEl.classList.contains("lp-lesen-schmal");
    function verkleinern(el, faktor, breite) {
      leseKlein.push({ el, zoom: el.style.zoom, width: el.style.width });
      if (breite) el.style.width = breite + "px";
      el.style.zoom = String(Math.max(0.3, Math.floor(faktor * 1000) / 1000));
    }
    slides().forEach((s) => {
      const tabellen = s.querySelectorAll("table");
      [].forEach.call(tabellen, (el) => el.removeAttribute("data-lese-rollen"));
      if (!schmal) return;
      const cs = getComputedStyle(s);
      const platz = s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!(platz > 100)) return;
      [].forEach.call(tabellen, (el) => { if (el.offsetWidth > platz + 2) el.setAttribute("data-lese-rollen", ""); });
      const alle = [].slice.call(s.querySelectorAll("*")).reverse();   // innen vor außen
      alle.forEach((el) => {
        if (el.ownerSVGElement || el.hasAttribute("data-lese-rollen") || el.closest("table[data-lese-rollen]")) return;
        const w = el.clientWidth, sw = el.scrollWidth;
        if (!w) return;
        const st = getComputedStyle(el);
        if (st.display === "inline" || st.overflowX !== "visible") return;
        if (el.offsetWidth > platz + 2) verkleinern(el, platz / Math.max(el.offsetWidth, sw), 0);
        else if (sw > w + 2) verkleinern(el, w / sw, w);
      });
    });
  }
  const leseBtn = knopf("lp-pr-btn", "", "Leseansicht: alle Folien untereinander");
  leseBtn.innerHTML = ICON.buch;                          // feste, eigene Zeichenkette
  leseBtn.title = "Leseansicht";
  dock.appendChild(leseBtn);
  const folienBtn = knopf("lp-pr-zurfolie", "", "Als Präsentation zeigen");
  folienBtn.innerHTML = ICON.folien;                      // feste, eigene Zeichenkette
  folienBtn.appendChild(neu("span", "", "Folien"));
  folienBtn.hidden = true;
  (function () {
    const platz = document.querySelector(".lp-kopf .lp-werkzeuge");
    if (platz) platz.parentNode.insertBefore(folienBtn, platz);
    else { folienBtn.classList.add("lp-pr-frei"); document.body.appendChild(folienBtn); }
  })();

  function lesenSetzen(an) {
    an = !!an;
    if (an === lesenAn) return;
    const nr = folie;
    if (an) {
      stiftSetzen(false);
      Object.keys(panels).forEach((id) => { if (!panels[id].el.hidden) schalte(id, false); });
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* ok */ }
      leseMessen();
    }
    lesenAn = an;
    wurzelEl.classList.toggle("lp-lesen", an);
    if (!an) { wurzelEl.classList.remove("lp-lesen-breit", "lp-lesen-schmal"); leseEngpass(); }
    folienBtn.hidden = !an;
    leseMass();
    try {
      const u = new URL(location.href);
      u.searchParams.set("ansicht", an ? "lesen" : "folien");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (e) { /* Adresse bleibt, die Ansicht wechselt trotzdem */ }
    if (an) { const s = slides()[nr]; if (s && nr > 0) s.scrollIntoView(); else scrollTo(0, 0); }
    else { scrollTo(0, 0); dispatchEvent(new Event("resize")); }   // Bühne neu einpassen
  }
  leseBtn.addEventListener("click", () => lesenSetzen(true));
  folienBtn.addEventListener("click", () => { lesenSetzen(false); leseBtn.focus(); });
  addEventListener("resize", leseMass);
  new MutationObserver(leseMass).observe(wurzelEl, { attributes: true, attributeFilter: ["data-size"] });

  /* In der Leseansicht gehören Pfeiltasten und Leertaste dem Scrollen, die Kürzel der Präsentation ruhen.
     Eingaben in Feldern und die Bedienung von Knöpfen bleiben unberührt. */
  addEventListener("keydown", (e) => {
    if (!lesenAn || tippt(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    const blaettern = k === " " || k === "Home" || k === "End" || /^(Arrow|Page)/.test(k);
    const bedient = e.target.closest && e.target.closest("button,a[href],summary,[tabindex],[role=button]");
    if (k.length === 1 && k !== " " || (blaettern && !bedient)) e.stopImmediatePropagation();
  }, true);

  (function leseStart() {
    let wahl = "";
    try { wahl = new URLSearchParams(location.search).get("ansicht") || ""; } catch (e) { /* ohne Parameter weiter */ }
    const handy = !!window.matchMedia && matchMedia("(max-width: 700px) and (orientation: portrait)").matches;
    if (wahl === "lesen" || (wahl !== "folien" && handy)) lesenSetzen(true);
  })();

  /* ---------- Tasten: P Stift, T Timer, L Lärmampel, Esc schließt Stift ---------- */
  addEventListener("keydown", (e) => {
    if (tippt(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "p") { e.preventDefault(); stiftSetzen(!penAn); }
    else if (k === "t") { schalte("timer"); }
    else if (k === "l") { schalte("laerm"); }
    else if (k === "q") { e.preventDefault(); if (window.teilenOeffnenInt) window.teilenOeffnenInt(); }
    else if (k === "escape" && penAn) { stiftSetzen(false); }
  });

  Object.assign(window.Praesentation, { stift: stiftSetzen, schalte, folie: () => folie, spiel: spielStarten, lesen: lesenSetzen, teilen: () => window.teilenOeffnenInt && window.teilenOeffnenInt() });
})();
