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
    haus: SVG('<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/>'),
    voll: SVG('<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>'),
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

  /* Zurück zum Portal (ersetzt die ausgeblendete Kopfleiste) und Vollbild */
  (function randKnoepfe() {
    const wurzel = /^(\.\.\/|\.\/)+$/.test(document.body.dataset.root || "") ? document.body.dataset.root : "./";
    const haus = neu("a", "lp-pr-btn");
    haus.href = wurzel;
    haus.innerHTML = ICON.haus;                           // feste, eigene Zeichenkette
    haus.setAttribute("aria-label", "Zurück zum Portal");
    haus.title = "Zurück zum Portal";
    dock.appendChild(haus);
    const voll = knopf("lp-pr-btn", "", "Vollbild (Taste F)");
    voll.innerHTML = ICON.voll;
    voll.title = "Vollbild (F)";
    voll.addEventListener("click", () => {
      try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) { /* ok */ }
    });
    dock.appendChild(voll);
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
    if (zeigen) o.el.style.zIndex = ++zTop;
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
  const pen = panelBauen("stift", "Stift", 60, 260);
  const FARBEN = [["#d62828", "Rot"], ["#111111", "Schwarz"], ["#2E7DBA", "Blau"], ["#F4B400", "Gelb"], ["#ffffff", "Weiß"]];
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
  const tim = panelBauen("timer", "Timer", 60, 280);
  let rest = 300, gesamt = 300, uhr = null, ende = 0, audio = null;
  const anzeige = neu("div", "lp-pr-zeit", "05:00");
  const status = neu("p", "lp-pr-hinweis", "");
  status.setAttribute("aria-live", "polite");
  const startBtn = knopf("lp-pr-gross", "Start", "Timer starten");
  const folieBtn = knopf("lp-pr-klein", "", "Dauer der Folie übernehmen");
  folieBtn.hidden = true;
  const bild = neu("span", "lp-pr-dockzeit");

  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function zeitZeigen() {
    anzeige.textContent = fmt(Math.max(0, rest));
    bild.textContent = (uhr || rest === 0) ? fmt(Math.max(0, rest)) : "";
    tim.taste && tim.taste.classList.toggle("lp-pr-lauf", !!uhr);
    anzeige.classList.toggle("aus", rest === 0);
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
  function setze(sek) { timerStop(); gesamt = rest = Math.max(0, Math.min(99 * 60 + 59, sek)); startBtn.textContent = "Start"; status.textContent = ""; zeitZeigen(); }
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
    minus.addEventListener("click", () => { const w = uhr; setze(Math.max(0, rest - 60)); if (w) timerStart(); });
    plus.addEventListener("click", () => { const w = uhr; setze(rest + 60); if (w) timerStart(); });
    plus30.addEventListener("click", () => { const w = uhr; setze(rest + 30); if (w) timerStart(); });
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
  const lae = panelBauen("laerm", "Lärmampel", 60, 220);
  const SCHL = "lp-pr-laerm";
  const cfg = laden(SCHL, { gelb: -42, rot: -32 });         // Grenzen in dBFS, je Gerät kalibrierbar
  let strom = null, ctxA = null, analyser = null, daten = null, raf = 0, glatt = -90, stufe = 0, rotBis = 0, kalib = null;
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
  const lGross = knopf("lp-pr-klein", "Größer", "Ampel vergrößern");
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
    if (s !== stufe || lae.el.dataset.stufe === "aus") ampelSetzen(s, false);
    raf = requestAnimationFrame(messen);
  }
  function laermAus(nachricht) {
    cancelAnimationFrame(raf); raf = 0; kalib = null;
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
    const r2 = neu("div", "lp-pr-reihe"); r2.appendChild(lKal); r2.appendChild(lGross); z.appendChild(r2);
    const rg = neu("div", "lp-pr-regelzeile"); rg.appendChild(empLabel); rg.appendChild(emp); z.appendChild(rg);
    z.appendChild(meld);
    grenzen(); ampelSetzen(0, true);
    lStart.addEventListener("click", () => { if (strom) laermAus("Messung beendet."); else laermAn(); });
    lKal.addEventListener("click", () => { if (analyser) { kalib = { summe: 0, n: 0, bis: Date.now() + 3000 }; meld.textContent = "Messe 3 Sekunden …"; } });
    lGross.addEventListener("click", () => {
      const gross = lae.el.classList.toggle("gross");
      lae.el.style.width = (gross ? 340 : 220) + "px";
      lGross.textContent = gross ? "Kleiner" : "Größer";
      lGross.setAttribute("aria-label", gross ? "Ampel verkleinern" : "Ampel vergrößern");
    });
    emp.addEventListener("input", () => { cfg.gelb = +emp.value; cfg.rot = cfg.gelb + 10; speichern(SCHL, cfg); grenzen(); });
    lae.beimSchliessen = () => laermAus("Das Mikrofon ist aus.");   // Schließen beendet die Messung
  })();
  dockKnopf("laerm", ICON.ampel, "Lärmampel", "L");

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

  /* ---------- Tasten: P Stift, T Timer, L Lärmampel, Esc schließt Stift ---------- */
  addEventListener("keydown", (e) => {
    if (tippt(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "p") { e.preventDefault(); stiftSetzen(!penAn); }
    else if (k === "t") { schalte("timer"); }
    else if (k === "l") { schalte("laerm"); }
    else if (k === "escape" && penAn) { stiftSetzen(false); }
  });

  window.Praesentation = { stift: stiftSetzen, schalte, folie: () => folie };
})();
