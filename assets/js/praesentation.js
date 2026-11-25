/* Lernportal – Werkzeuge für Präsentationen: Stift, Timer, Lärmampel, Blende, Zufallsnummer, Gruppen, Stoppuhr, Notizzettel.
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

  /* Themenfeld-Farbe: Ordnername nach klasse-N (zum Beispiel genetik) wird zu data-tf am body, siehe praesentation-design.css */
  try{var tfm=location.pathname.match(/\/klasse-\d+\/([^\/]+)\//);if(tfm&&document.body&&!document.body.dataset.tf)document.body.dataset.tf=tfm[1]}catch(e){}

  const stage = document.getElementById("stage");
  if (!stage || window.Praesentation) return;

  const SVG = (pfade) => '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + pfade + "</svg>";
  const ICON = {
    stift: SVG('<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>'),
    timer: SVG('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5"/><path d="M9.5 3h5"/>'),
    zurueck: SVG('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'),
    voll: SVG('<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>'),
    teilen: SVG('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M14 14h2.5v2.5H14zM19 14v.01M14 19.5v.01M17 19h3.5v1.5"/>'),
    aus: SVG('<path d="M3 3l18 18"/><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c5 0 8.5 4 10 7a15 15 0 0 1-3 3.9"/><path d="M6.6 6.7C4.5 8.1 3 10.2 2 12c1.5 3 5 7 10 7 1.7 0 3.2-.5 4.4-1.2"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
    klappe: SVG('<path d="m7 14 5-5 5 5"/>'),
    mehr: SVG('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'),
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

  /* ---------- Folie ausblenden: schwarzer Bildschirm, Antippen, Punkt-Taste oder Esc zeigt sie wieder ---------- */
  const ausEl = neu("div", "lp-pr-aus");
  ausEl.hidden = true;
  ausEl.setAttribute("role", "button");
  ausEl.tabIndex = 0;
  ausEl.setAttribute("aria-label", "Folie ist ausgeblendet. Antippen zeigt sie wieder.");
  ausEl.appendChild(neu("span", "", "Folie ausgeblendet · antippen zeigt sie wieder"));
  document.body.appendChild(ausEl);
  let ausTaste = null;
  function ausSchalte(an) {
    const zeigen = an === undefined ? ausEl.hidden : an;
    ausEl.hidden = !zeigen;
    if (ausTaste) { ausTaste.classList.toggle("on", zeigen); ausTaste.setAttribute("aria-pressed", String(zeigen)); }
    if (zeigen) ausEl.focus();
  }
  ausEl.addEventListener("click", () => ausSchalte(false));
  ausEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); ausSchalte(false); } });

  /* Klar beschrifteter Rückweg zum Portal und Vollbild */
  (function randKnoepfe() {
    const wurzel = /^(\.\.\/|\.\/)+$/.test(document.body.dataset.root || "") ? document.body.dataset.root : "./";
    /* Dock einklappen: nur Klappe und „Folie ausblenden“ bleiben stehen, der Zustand bleibt im Browser gemerkt */
    const klappe = knopf("lp-pr-btn lp-pr-klappe", "", "Werkzeugleiste einklappen");
    klappe.innerHTML = ICON.klappe;
    klappe.title = "Leiste ein- oder ausklappen";
    const setzeKlappe = (zu) => { dock.classList.toggle("eingeklappt", zu); klappe.setAttribute("aria-expanded", String(!zu)); klappe.setAttribute("aria-label", zu ? "Werkzeugleiste ausklappen" : "Werkzeugleiste einklappen"); speichern("lp-pr-dockzu", zu); };
    klappe.addEventListener("click", () => setzeKlappe(!dock.classList.contains("eingeklappt")));
    dock.appendChild(klappe);
    setzeKlappe(!!laden("lp-pr-dockzu", false));
    const zurueck = neu("a", "lp-pr-btn lp-pr-portal");
    zurueck.href = wurzel;
    zurueck.innerHTML = ICON.zurueck + '<span>Portal</span>';
    zurueck.setAttribute("aria-label", "Zurück zum Portal");
    zurueck.title = "Zurück zum Portal";
    dock.appendChild(zurueck);
    const voll = knopf("lp-pr-btn", "", "Vollbild (Taste F)");
    voll.innerHTML = ICON.voll;
    voll.title = "Vollbild (F)";
    /* Vollbild: mit und ohne Herstellervorsatz (iPad-Safari nutzt webkit…). Geht es nicht (z. B. Brave und andere Browser auf dem iPad,
       dort fehlt die Funktion), erscheint ein Hinweis mit dem Weg über den Home-Bildschirm. */
    const el = document.documentElement;
    const imVollbild = () => document.fullscreenElement || document.webkitFullscreenElement;
    function vollbildHinweis() {
      let h = document.getElementById("lp-pr-hinweisfeld");
      if (!h) {
        h = neu("div", "lp-pr-toast");
        h.id = "lp-pr-hinweisfeld";
        h.setAttribute("role", "status");
        h.appendChild(neu("strong", "", "Dieser Browser kann kein Vollbild."));
        h.appendChild(neu("span", "", " Auf dem iPad: Teilen-Symbol, dann „Zum Home-Bildschirm“, und das Portal von dort öffnen. Dann steht die Seite ohne Browserleiste da. In Safari geht auch: Symbol „aA“, dann „Symbolleiste ausblenden“."));
        const zu = knopf("lp-pr-klein", "Schließen", "Hinweis schließen");
        zu.addEventListener("click", () => { h.hidden = true; });
        h.appendChild(zu);
        document.body.appendChild(h);
      }
      h.hidden = false;
      clearTimeout(h._t); h._t = setTimeout(() => { h.hidden = true; }, 15000);
    }
    window.LPVollbild = function () {
      try {
        if (imVollbild()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
        const anfrage = el.requestFullscreen || el.webkitRequestFullscreen;
        if (!anfrage) { vollbildHinweis(); return; }
        const r = anfrage.call(el);
        if (r && r.catch) r.catch(vollbildHinweis);
      } catch (e) { vollbildHinweis(); }
    };
    voll.addEventListener("click", () => window.LPVollbild());
    dock.appendChild(voll);
    ausTaste = knopf("lp-pr-btn lp-pr-ausbtn", "", "Folie ausblenden (Punkt-Taste)");
    ausTaste.innerHTML = ICON.aus;
    ausTaste.title = "Folie ausblenden (.)";
    ausTaste.setAttribute("aria-pressed", "false");
    ausTaste.addEventListener("click", () => ausSchalte());
    dock.appendChild(ausTaste);
    const teilen = knopf("lp-pr-btn", "", "Link und QR-Code (Taste Q)");
    teilen.innerHTML = ICON.teilen;
    teilen.title = "Link und QR-Code (Q)";
    teilen.addEventListener("click", () => teilenOeffnen(teilen));
    /* Der Knopf „Link und QR-Code“ steht unter „Weitere Werkzeuge“ (spart Platz im Dock) */
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
    miniZeigen();
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
  /* ---------- Mini-Timer: schwebende Zeitanzeige, solange der Timer läuft und das Fenster zu ist ---------- */
  const mini = neu("div", "lp-pr-mini");
  mini.hidden = true;
  mini.setAttribute("role", "group");
  mini.setAttribute("aria-label", "Timer");
  const miniZeit = knopf("lp-pr-mini-zeit", "", "Timer anhalten oder fortsetzen");
  const miniZu = knopf("lp-pr-mini-zu", "×", "Timer zurücksetzen");
  mini.appendChild(miniZeit); mini.appendChild(miniZu);
  document.body.appendChild(mini);
  (function miniStart() {
    const MK = "lp-pr-mini";
    const alt = laden(MK, null);
    if (alt && typeof alt.x === "number" && typeof alt.y === "number") { mini.style.left = Math.max(0, Math.min(innerWidth - 80, alt.x)) + "px"; mini.style.top = Math.max(0, Math.min(innerHeight - 50, alt.y)) + "px"; }
    let d = null;
    mini.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".lp-pr-mini-zu")) return;
      const r = mini.getBoundingClientRect();
      d = { id: e.pointerId, ox: e.clientX - r.left, oy: e.clientY - r.top, x: e.clientX, y: e.clientY, bewegt: false };
      mini.setPointerCapture(e.pointerId); mini.style.zIndex = ++zTop;
    });
    mini.addEventListener("pointermove", (e) => {
      if (!d || d.id !== e.pointerId) return;
      if (!d.bewegt && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
      d.bewegt = true;
      mini.style.right = "auto"; mini.style.bottom = "auto";
      mini.style.left = Math.max(0, Math.min(innerWidth - mini.offsetWidth, e.clientX - d.ox)) + "px";
      mini.style.top = Math.max(0, Math.min(innerHeight - mini.offsetHeight, e.clientY - d.oy)) + "px";
    });
    const ende = (e) => {
      if (!d || d.id !== e.pointerId) return;
      const war = d.bewegt; d = null;
      if (war) { const r = mini.getBoundingClientRect(); speichern(MK, { x: Math.round(r.left), y: Math.round(r.top) }); }
      else if (e.type === "pointerup" && !e.target.closest(".lp-pr-mini-zu")) { if (rest <= 0) setze(gesamt); else timerStart(); }
    };
    mini.addEventListener("pointerup", ende);
    mini.addEventListener("pointercancel", ende);
    miniZeit.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (rest <= 0) setze(gesamt); else timerStart(); } });
    miniZu.addEventListener("click", () => setze(gesamt));
    new MutationObserver(() => miniZeigen()).observe(tim.el, { attributes: true, attributeFilter: ["hidden"] });
  })();
  function miniZeigen() {
    const lauft = !!uhr, pause = !uhr && rest > 0 && rest < gesamt, aus = rest === 0 && gesamt > 0;
    const zeigen = tim.el.hidden && (lauft || pause || aus);
    mini.hidden = !zeigen;
    if (!zeigen) return;
    mini.dataset.zustand = aus ? "ende" : lauft ? "an" : "pause";
    const t = (aus ? "Zeit! " : "") + fmt(Math.max(0, rest));
    if (miniZeit.textContent !== t) miniZeit.textContent = t;
  }
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

  /* ---------- Aquarium-Ansicht: jeder Ruhe-Stern ist ein Fisch.
     Grün: die Fische schwimmen. Gelb: sie ruhen. Rot: sie verstecken sich. Verloren geht nichts.
     Alles ist lokales Inline-SVG, keine Bilddatei, kein Fremdinhalt. ---------- */
  const NS = "http://www.w3.org/2000/svg";
  function svg(tag, attr, eltern) {
    const k = document.createElementNS(NS, tag);
    for (const a in attr) k.setAttribute(a, attr[a]);
    if (eltern) eltern.appendChild(k);
    return k;
  }
  /* Zwei Riffe: „Gezeichnet“ (flach, mit sanftem Verlauf) und „Gemalt“ (Aquarell durch SVG-Filter: Papierkorn, unruhige Farbränder).
     Der Hintergrund ist eine eigene, ruhende SVG-Ebene unter den Fischen, damit die Filter nicht bei jeder Bewegung neu rechnen. */
  const RIFFE = {
    gezeichnet:
      '<defs><linearGradient id="lp-aq-wasser" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e3ef"/><stop offset=".45" stop-color="#4fb0d2"/><stop offset="1" stop-color="#14699a"/></linearGradient>' +
      '<linearGradient id="lp-aq-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecd9a8"/><stop offset="1" stop-color="#d4b97e"/></linearGradient></defs>' +
      '<rect width="360" height="200" fill="url(#lp-aq-wasser)"/>' +
      '<g class="strahl"><path d="M60 0h30l-50 200h-40z"/><path d="M150 0h46l-30 200h-52z"/><path d="M250 0h30l-14 200h-48z"/></g>' +
      '<path class="berg1" d="M0 120Q40 96 80 112T160 100T250 84T360 112V200H0z"/>' +
      '<path class="berg2" d="M0 142Q70 118 140 134T270 126T360 138V200H0z"/>' +
      '<g class="alge hinten"><path d="M108 176Q100 140 112 110Q120 90 110 62"/><path d="M200 176Q192 146 204 118Q212 98 202 74"/><path d="M262 176Q256 140 266 112Q272 92 264 66"/><path d="M296 176Q290 150 300 124"/></g>' +
      '<path class="sand" d="M0 168Q60 160 120 168T250 166T360 164V200H0z" fill="url(#lp-aq-sand)"/>' +
      '<g class="rippel"><path d="M70 182q14-3 28 0M150 188q16-3 32 0M240 180q14-3 28 0M300 190q12-3 24 0M20 192q10-2 20 0"/></g>' +
      '<g class="kiesel"><ellipse cx="96" cy="176" rx="2.4" ry="1.6"/><ellipse cx="104" cy="179" rx="1.8" ry="1.2"/><ellipse cx="262" cy="176" rx="2.4" ry="1.6"/><ellipse cx="270" cy="182" rx="1.8" ry="1.2"/><ellipse cx="170" cy="190" rx="2" ry="1.3"/></g>' +
      '<path class="fels" d="M0 200V132Q14 112 40 122Q60 132 76 168L86 200z"/><path class="fels2" d="M0 200V150Q16 138 34 146Q52 156 60 182L64 200z"/>' +
      '<ellipse class="hoehle" cx="30" cy="172" rx="14" ry="12"/><ellipse class="hoehle" cx="52" cy="190" rx="6" ry="5"/>' +
      '<g class="bunt"><circle cx="18" cy="126" r="4" fill="#e8a33d"/><circle cx="26" cy="122" r="3.4" fill="#d9577f"/><circle cx="34" cy="125" r="3" fill="#7ad0b4"/></g>' +
      '<path class="fels" d="M360 200V136Q346 116 322 126Q302 136 288 170L278 200z"/><path class="fels2" d="M360 200V154Q344 142 328 150Q310 160 304 184L300 200z"/>' +
      '<ellipse class="hoehle" cx="334" cy="174" rx="14" ry="12"/><ellipse class="hoehle" cx="312" cy="192" rx="6" ry="5"/>' +
      '<g class="bunt"><circle cx="340" cy="130" r="4" fill="#e8a33d"/><circle cx="332" cy="126" r="3.4" fill="#d9577f"/><circle cx="324" cy="129" r="3" fill="#7ad0b4"/></g>' +
      '<g class="alge vorn"><path d="M44 176Q36 150 46 128"/><path d="M322 176Q330 150 320 130"/><path d="M92 178Q86 158 94 142"/></g>' +
      '<g class="koralle rot"><path d="M138 170V148M138 158l-10-12M138 154l9-10M128 146v-8M147 144v-8"/><path d="M156 170V152M156 162l-8-9M156 158l8-8"/></g>' +
      '<g class="koralle rosa"><path d="M170 170q-14-4-14-22M170 170q-6-8-5-26M170 170q2-10 8-26M170 170q8-6 18-18M170 170q12-2 22-10"/></g>' +
      '<g class="rohr"><rect x="186" y="150" width="6" height="22" rx="3"/><rect x="194" y="156" width="6" height="16" rx="3"/><rect x="202" y="146" width="6" height="26" rx="3"/></g>' +
      '<g class="truhe"><path d="M222 172v-12q0-6 6-6h22q6 0 6 6v12z" class="holz"/><path d="M222 160h34" class="band"/><rect x="236" y="158" width="6" height="8" rx="1" class="gold"/></g>' +
      '<path class="stern" d="M270 176l3-7-6-4 7-1 2-7 3 7 7 1-6 4 3 7-6-4z"/>' +
      '<path class="muschel" d="M112 178q8-12 16 0z"/>',
    maerchenSvg: `<defs>
<linearGradient id="mW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8f4e6"/><stop offset=".25" stop-color="#7fdbd8"/><stop offset=".55" stop-color="#2fa8c0"/><stop offset=".82" stop-color="#157aa0"/><stop offset="1" stop-color="#0f5886"/></linearGradient>
<linearGradient id="mSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeec6"/><stop offset=".6" stop-color="#f2dcae"/><stop offset="1" stop-color="#e3c48f"/></linearGradient>
<filter id="mNass" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".015" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26"/><feGaussianBlur stdDeviation="7"/></filter>
<filter id="mStrahl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="mF" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3" result="d"/><feGaussianBlur in="d" stdDeviation=".55" result="b"/><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="3" result="k"/><feColorMatrix in="k" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -.3 1.1" result="ka"/><feComposite in="b" in2="ka" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/></filter>
<filter id="mWeich" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.1"/></filter>
<filter id="mPinsel" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="3" seed="6"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 .95 0 0 0 0 .8 0 0 0 1.4 -.45"/></filter>
<filter id="mPapier" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="12"/><feColorMatrix type="matrix" values="0 0 0 0 .3 0 0 0 0 .28 0 0 0 0 .2 0 0 0 -1.5 .9"/></filter>
</defs><g transform="translate(-5 -5) scale(1.03)"><rect width="360" height="200" fill="url(#mW)"/><g filter="url(#mNass)"><ellipse cx="270" cy="-4" rx="140" ry="56" fill="#fffbd2" opacity=".7"/><ellipse cx="30" cy="196" rx="100" ry="50" fill="#0a416c" opacity=".6"/><ellipse cx="180" cy="110" rx="110" ry="28" fill="#3cc0c8" opacity=".35"/><ellipse cx="340" cy="150" rx="50" ry="40" fill="#0f5f8c" opacity=".4"/></g><g filter="url(#mStrahl)" fill="#fffbe0" opacity=".34"><path d="M250 0h34l-80 170h-60z"/><path d="M200 0h22l-70 170h-40z"/><path d="M300 0h30l-30 150h-70z"/><path d="M160 0h14l-80 150h-30z"/><path d="M330 0h24l6 120h-40z"/></g><g filter="url(#mF)" fill="#fff" opacity=".4"><path d="M0 0h360v7q-30 8-60 2t-70 3-70-3-70 4-60-3z"/></g><g filter="url(#mF)"><path d="M0 118Q50 92 100 108T200 96T290 104T360 94V200H0z" fill="#45b4bd" opacity=".55"/><path d="M80 160Q80 100 128 96Q176 100 180 160z" fill="#2c92ae" opacity=".55"/><path d="M110 160Q112 124 130 122Q148 124 150 160z" fill="#3fb0be" opacity=".8"/><path d="M0 138Q70 116 140 130T270 124T360 132V200H0z" fill="#1f86a8" opacity=".7"/></g><path d="M0 170Q60 160 120 168T240 166T360 162V210H0z" fill="url(#mSand)" filter="url(#mF)"/><g fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".6"><path d="M96 184q16-3 32 0M170 191q18-3 36 0M238 182q14-3 28 0M30 194q12-2 24 0M292 192q14-3 28 0"/></g><path d="M170 180h0M180 184h0M210 188h0M146 190h0M224 178h0M244 190h0M108 176h0" stroke="#d7b98a" stroke-width="3" stroke-linecap="round"/><g filter="url(#mF)" fill="none" stroke-linecap="round"><path d="M112 182 C122 149 102 119 116 90" stroke="#3d9a5c" stroke-width="6"/><path d="M112 182 C122 149 102 119 116 90" stroke="#8fdc7a" stroke-width="2.1" transform="translate(-1 0)" opacity=".7"/><path d="M178 182 C166 142 190 105 173 70" stroke="#2f8a55" stroke-width="6.5"/><path d="M178 182 C166 142 190 105 173 70" stroke="#79d070" stroke-width="2.3" transform="translate(-1 0)" opacity=".7"/><path d="M236 182 C248 147 224 114 240 82" stroke="#3d9a5c" stroke-width="6"/><path d="M236 182 C248 147 224 114 240 82" stroke="#8fdc7a" stroke-width="2.1" transform="translate(-1 0)" opacity=".7"/><path d="M268 182 C259 155 277 130 264 106" stroke="#4aa862" stroke-width="5"/><path d="M268 182 C259 155 277 130 264 106" stroke="#9be487" stroke-width="1.8" transform="translate(-1 0)" opacity=".7"/><path d="M140 182 C148 157 132 134 143 112" stroke="#4aa862" stroke-width="5"/><path d="M140 182 C148 157 132 134 143 112" stroke="#9be487" stroke-width="1.8" transform="translate(-1 0)" opacity=".7"/></g><g filter="url(#mF)" opacity=".95"><ellipse cx="119.9" cy="161.0" rx="7.0" ry="2.6" transform="rotate(-35 119.9 161.0)" fill="#3d9a5c"/><ellipse cx="109.3" cy="149.8" rx="6.6" ry="2.6" transform="rotate(35 109.3 149.8)" fill="#3d9a5c"/><ellipse cx="118.0" cy="138.6" rx="6.2" ry="2.6" transform="rotate(-35 118.0 138.6)" fill="#3d9a5c"/><ellipse cx="106.6" cy="127.6" rx="5.8" ry="2.6" transform="rotate(35 106.6 127.6)" fill="#3d9a5c"/><ellipse cx="115.9" cy="116.8" rx="5.4" ry="2.6" transform="rotate(-35 115.9 116.8)" fill="#3d9a5c"/><ellipse cx="106.4" cy="106.0" rx="5.0" ry="2.6" transform="rotate(35 106.4 106.0)" fill="#3d9a5c"/><ellipse cx="179.5" cy="156.4" rx="7.0" ry="2.6" transform="rotate(-35 179.5 156.4)" fill="#2f8a55"/><ellipse cx="170.2" cy="142.7" rx="6.6" ry="2.6" transform="rotate(35 170.2 142.7)" fill="#2f8a55"/><ellipse cx="181.8" cy="129.2" rx="6.2" ry="2.6" transform="rotate(-35 181.8 129.2)" fill="#2f8a55"/><ellipse cx="173.5" cy="115.8" rx="5.8" ry="2.6" transform="rotate(35 173.5 115.8)" fill="#2f8a55"/><ellipse cx="184.4" cy="102.6" rx="5.4" ry="2.6" transform="rotate(-35 184.4 102.6)" fill="#2f8a55"/><ellipse cx="173.8" cy="89.5" rx="5.0" ry="2.6" transform="rotate(35 173.8 89.5)" fill="#2f8a55"/><ellipse cx="244.5" cy="159.2" rx="7.0" ry="2.6" transform="rotate(-35 244.5 159.2)" fill="#3d9a5c"/><ellipse cx="233.8" cy="147.0" rx="6.6" ry="2.6" transform="rotate(35 233.8 147.0)" fill="#3d9a5c"/><ellipse cx="242.2" cy="134.9" rx="6.2" ry="2.6" transform="rotate(-35 242.2 134.9)" fill="#3d9a5c"/><ellipse cx="230.5" cy="122.9" rx="5.8" ry="2.6" transform="rotate(35 230.5 122.9)" fill="#3d9a5c"/><ellipse cx="239.6" cy="111.1" rx="5.4" ry="2.6" transform="rotate(-35 239.6 111.1)" fill="#3d9a5c"/><ellipse cx="230.2" cy="99.4" rx="5.0" ry="2.6" transform="rotate(35 230.2 99.4)" fill="#3d9a5c"/><ellipse cx="270.4" cy="164.7" rx="7.0" ry="2.6" transform="rotate(-35 270.4 164.7)" fill="#4aa862"/><ellipse cx="260.9" cy="155.4" rx="6.6" ry="2.6" transform="rotate(35 260.9 155.4)" fill="#4aa862"/><ellipse cx="272.1" cy="146.2" rx="6.2" ry="2.6" transform="rotate(-35 272.1 146.2)" fill="#4aa862"/><ellipse cx="263.3" cy="137.1" rx="5.8" ry="2.6" transform="rotate(35 263.3 137.1)" fill="#4aa862"/><ellipse cx="274.0" cy="128.1" rx="5.4" ry="2.6" transform="rotate(-35 274.0 128.1)" fill="#4aa862"/><ellipse cx="263.6" cy="119.2" rx="5.0" ry="2.6" transform="rotate(35 263.6 119.2)" fill="#4aa862"/><ellipse cx="147.3" cy="166.0" rx="7.0" ry="2.6" transform="rotate(-35 147.3 166.0)" fill="#4aa862"/><ellipse cx="136.8" cy="157.5" rx="6.6" ry="2.6" transform="rotate(35 136.8 157.5)" fill="#4aa862"/><ellipse cx="145.8" cy="149.0" rx="6.2" ry="2.6" transform="rotate(-35 145.8 149.0)" fill="#4aa862"/><ellipse cx="134.7" cy="140.6" rx="5.8" ry="2.6" transform="rotate(35 134.7 140.6)" fill="#4aa862"/><ellipse cx="144.1" cy="132.4" rx="5.4" ry="2.6" transform="rotate(-35 144.1 132.4)" fill="#4aa862"/><ellipse cx="134.5" cy="124.2" rx="5.0" ry="2.6" transform="rotate(35 134.5 124.2)" fill="#4aa862"/></g><g filter="url(#mF)"><path d="M-6 210V122Q-2 94 34 94Q70 96 88 128Q102 152 104 210z" fill="#8aa3a6"/><path d="M-6 210V146Q4 128 28 130Q52 134 66 158Q76 176 78 210z" fill="#6d868f"/><path d="M-4 124Q4 98 32 97Q54 98 66 112Q46 108 28 116Q12 124-4 130z" fill="#6fc255"/><path d="M6 112Q18 100 38 101Q26 104 16 112z" fill="#a9e56e"/><path d="M12 210V162Q12 140 34 140Q58 142 58 164V210z" fill="#0f3552"/></g><g fill="#ffd1dc"><circle cx="18" cy="104" r="2"/><circle cx="30" cy="99" r="1.8"/><circle cx="44" cy="102" r="2"/></g><g fill="#fff3a8"><circle cx="24" cy="108" r="1.5"/><circle cx="38" cy="104" r="1.5"/><circle cx="52" cy="108" r="1.4"/></g><g filter="url(#mF)"><path d="M366 210V128Q362 102 330 104Q300 108 290 138Q282 160 282 210z" fill="#92a8a8"/><path d="M366 210V152Q356 140 336 142Q316 146 308 168Q302 184 302 210z" fill="#6f8892"/><path d="M366 132Q358 108 330 108Q312 110 302 122Q320 116 336 124Q352 130 366 136z" fill="#6fc255"/><path d="M356 114Q344 106 326 110Q338 112 346 118z" fill="#a9e56e"/><path d="M318 210V176Q318 158 336 158Q354 160 354 178V210z" fill="#0f3552"/></g><g fill="#ffd1dc"><circle cx="340" cy="112" r="2"/><circle cx="328" cy="110" r="1.8"/></g><g fill="#fff3a8"><circle cx="346" cy="116" r="1.5"/><circle cx="334" cy="115" r="1.4"/></g><g filter="url(#mF)"><path d="M184 176q12-10 24 0z" fill="#b84f86"/><path d="M189.7 171.3 L175.1 169.5M189.9 170.9 L174.8 167.8M190.1 170.4 L175.3 166.2M190.4 170.0 L175.4 164.3M190.8 169.7 L178.1 163.4M191.2 169.3 L178.6 161.6M191.8 169.0 L184.9 163.7M192.3 168.7 L184.5 161.1M192.9 168.5 L184.6 158.2M193.6 168.3 L187.9 158.8M194.2 168.2 L189.6 157.1M194.9 168.1 L193.1 160.6M195.6 168.0 L194.9 158.7M196.4 168.0 L197.0 159.8M197.1 168.1 L199.4 158.5M197.8 168.2 L201.7 158.7M198.4 168.3 L202.3 161.8M199.1 168.5 L204.7 161.4M199.7 168.7 L206.7 161.9M200.2 169.0 L211.5 160.3M200.8 169.3 L212.5 162.1M201.2 169.7 L210.4 165.1M201.6 170.0 L215.6 164.7M201.9 170.4 L212.2 167.5M202.1 170.9 L216.3 168.0M202.3 171.3 L213.2 170.0" stroke="#ff9cc4" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M189.7 171.3 L175.1 169.5M189.9 170.9 L174.8 167.8M190.1 170.4 L175.3 166.2M190.4 170.0 L175.4 164.3M190.8 169.7 L178.1 163.4M191.2 169.3 L178.6 161.6M191.8 169.0 L184.9 163.7M192.3 168.7 L184.5 161.1M192.9 168.5 L184.6 158.2M193.6 168.3 L187.9 158.8M194.2 168.2 L189.6 157.1M194.9 168.1 L193.1 160.6M195.6 168.0 L194.9 158.7M196.4 168.0 L197.0 159.8M197.1 168.1 L199.4 158.5M197.8 168.2 L201.7 158.7M198.4 168.3 L202.3 161.8M199.1 168.5 L204.7 161.4M199.7 168.7 L206.7 161.9M200.2 169.0 L211.5 160.3M200.8 169.3 L212.5 162.1M201.2 169.7 L210.4 165.1M201.6 170.0 L215.6 164.7M201.9 170.4 L212.2 167.5M202.1 170.9 L216.3 168.0M202.3 171.3 L213.2 170.0" stroke="#ffd6e6" stroke-width=".8" stroke-linecap="round" fill="none" transform="translate(0 -.8)"/></g><g filter="url(#mF)"><circle cx="124" cy="172" r="11" fill="#f5977f"/><circle cx="135" cy="176" r="8" fill="#f7ad8e"/><circle cx="122" cy="168" r="4" fill="#ffc9b0"/><g fill="#9576c8"><rect x="146" y="150" width="9" height="26" rx="4.5"/><rect x="157" y="158" width="9" height="18" rx="4.5"/></g><g fill="#c4aae6"><ellipse cx="150.5" cy="150" rx="3.2" ry="1.5"/><ellipse cx="161.5" cy="158" rx="3.2" ry="1.5"/></g></g><g filter="url(#mF)"><ellipse cx="256" cy="172" rx="22" ry="7" fill="#58bfae"/><ellipse cx="256" cy="168" rx="22" ry="6" fill="#74d3c0"/><path d="M236 168q20-5 40 0" fill="none" stroke="#c3f6e0" stroke-width="2.4" stroke-linecap="round"/><rect x="252" y="150" width="8" height="18" rx="3" fill="#4fae9f"/><ellipse cx="256" cy="150" rx="26" ry="7.5" fill="#6ccdb9"/><ellipse cx="256" cy="147" rx="26" ry="6.5" fill="#8fe3cc"/><path d="M232 147q24-6 48 0" fill="none" stroke="#d5fbe9" stroke-width="2.6" stroke-linecap="round"/></g><g filter="url(#mF)"><path d="M300 176L280.9 163.0M300 176L284.4 157.6M300 176L289.0 153.5M300 176L294.3 150.9M300 176L300.0 150.0M300 176L305.7 150.9M300 176L311.0 153.5M300 176L315.6 157.6M300 176L319.1 163.0" stroke="#f08ab8" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M300 176q-18-10-20-30q14-4 20 14q6-18 22-14q-2 20-22 30z" fill="#f6a8c8" opacity=".55"/></g><g filter="url(#mF)"><path d="M70 186q8-12 17 0z" fill="#fff1de"/><path d="M268 186l3-8 3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5z" fill="#ff8a5c"/><circle cx="271" cy="190" r="1.4" fill="#ffd0b0"/><path d="M196 192l2-5 2 5 5 1-4 3 1 5-4-2-4 2 1-5-4-3z" fill="#ff9e72"/></g><g fill="none" stroke-linecap="round"><path d="M2 128Q6 106 34 100M66 114Q84 128 92 150" stroke="#cfe0dc" stroke-width="2" opacity=".6"/><path d="M40 150q8 6 6 16M70 160q6 8 4 22" stroke="#52707c" stroke-width="1.6" opacity=".6"/><path d="M360 134Q354 112 330 108M300 126Q290 138 286 160" stroke="#d6e6e2" stroke-width="2" opacity=".6"/><path d="M320 160q-6 6-4 16M300 170q-6 8-4 20" stroke="#52707c" stroke-width="1.6" opacity=".6"/></g><g filter="url(#mF)" fill="none" stroke-linecap="round" stroke-width="2.2"><path d="M92.5 184 q-1.0 -5.0 -1.7 -10.0M95.5 184 q-4.4 -6.3 -7.0 -12.6M98.5 184 q-2.7 -6.7 -4.3 -13.5M101.5 184 q-0.9 -9.1 -1.5 -18.1M104.5 184 q-4.8 -10.8 -7.7 -21.6M159.0 184 q0.1 -10.4 0.2 -20.7M162.0 184 q-1.3 -7.5 -2.1 -15.0M165.0 184 q-3.0 -7.0 -4.8 -14.0M168.0 184 q-1.5 -9.2 -2.5 -18.5M171.0 184 q3.5 -9.9 5.6 -19.8M174.0 184 q3.5 -6.1 5.6 -12.2M206.5 184 q-4.7 -5.3 -7.6 -10.7M209.5 184 q0.1 -7.1 0.1 -14.3M212.5 184 q1.9 -9.7 3.0 -19.5M215.5 184 q0.2 -10.0 0.4 -20.1M218.5 184 q-0.6 -6.1 -1.0 -12.2M275.0 184 q1.7 -6.5 2.8 -13.0M278.0 184 q3.9 -7.1 6.2 -14.3M281.0 184 q4.3 -5.6 6.9 -11.3M284.0 184 q-1.0 -5.2 -1.7 -10.4M287.0 184 q4.6 -8.1 7.3 -16.2M290.0 184 q-1.6 -7.0 -2.5 -14.1" stroke="#5fbf6a"/><path d="M92.5 184 q-1.0 -5.0 -1.7 -10.0M95.5 184 q-4.4 -6.3 -7.0 -12.6M98.5 184 q-2.7 -6.7 -4.3 -13.5M101.5 184 q-0.9 -9.1 -1.5 -18.1M104.5 184 q-4.8 -10.8 -7.7 -21.6M159.0 184 q0.1 -10.4 0.2 -20.7M162.0 184 q-1.3 -7.5 -2.1 -15.0M165.0 184 q-3.0 -7.0 -4.8 -14.0M168.0 184 q-1.5 -9.2 -2.5 -18.5M171.0 184 q3.5 -9.9 5.6 -19.8M174.0 184 q3.5 -6.1 5.6 -12.2M206.5 184 q-4.7 -5.3 -7.6 -10.7M209.5 184 q0.1 -7.1 0.1 -14.3M212.5 184 q1.9 -9.7 3.0 -19.5M215.5 184 q0.2 -10.0 0.4 -20.1M218.5 184 q-0.6 -6.1 -1.0 -12.2M275.0 184 q1.7 -6.5 2.8 -13.0M278.0 184 q3.9 -7.1 6.2 -14.3M281.0 184 q4.3 -5.6 6.9 -11.3M284.0 184 q-1.0 -5.2 -1.7 -10.4M287.0 184 q4.6 -8.1 7.3 -16.2M290.0 184 q-1.6 -7.0 -2.5 -14.1" stroke="#c4f08a" stroke-width=".8" transform="translate(.6 0)"/></g><g fill="#fffbe0" opacity=".32" filter="url(#mWeich)"><ellipse cx="160" cy="184" rx="16" ry="3"/><ellipse cx="236" cy="190" rx="12" ry="2.4"/><ellipse cx="120" cy="192" rx="10" ry="2"/></g><g filter="url(#mWeich)" fill="#1c6a46" opacity=".9"><path d="M-6 210Q-2 168 22 150Q18 176 30 210z"/><path d="M14 210Q22 176 46 166Q36 186 42 210z" fill="#2c8a58"/><path d="M366 210Q362 172 340 156Q342 182 330 210z"/><path d="M346 210Q340 182 318 174Q326 192 320 210z" fill="#2c8a58"/></g><g fill="#fffbe0" opacity=".7"><circle cx="40" cy="60" r="1.1"/><circle cx="92" cy="40" r="1.4"/><circle cx="150" cy="70" r="1"/><circle cx="214" cy="54" r="1.3"/><circle cx="260" cy="30" r="1"/><circle cx="318" cy="64" r="1.4"/><circle cx="190" cy="96" r="1"/><circle cx="70" cy="110" r="1.2"/><circle cx="300" cy="96" r="1"/></g><rect width="360" height="200" filter="url(#mPinsel)" opacity=".16" style="mix-blend-mode:soft-light"/><rect width="360" height="200" filter="url(#mPapier)" opacity=".12" style="mix-blend-mode:multiply"/></g>`,
    gemalt: `<defs>
<linearGradient id="aqW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7e9ef"/><stop offset=".3" stop-color="#8ec9db"/><stop offset=".62" stop-color="#4b93b4"/><stop offset="1" stop-color="#2a6a8c"/></linearGradient>
<linearGradient id="aqSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe3c8"/><stop offset="1" stop-color="#dcc79c"/></linearGradient>
<filter id="aqNass" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="22"/><feGaussianBlur stdDeviation="6"/></filter>
<filter id="aqStrahl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>
<filter id="aqFarbe" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" result="d"/><feGaussianBlur in="d" stdDeviation=".45" result="b"/><feMorphology in="b" operator="erode" radius=".9" result="er"/><feComposite in="b" in2="er" operator="out" result="rim"/><feColorMatrix in="rim" type="matrix" values=".5 0 0 0 0 0 .5 0 0 0 0 0 .55 0 0 0 0 0 .6 0" result="rimd"/><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="2" result="k"/><feColorMatrix in="k" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -.4 1.05" result="ka"/><feComposite in="b" in2="ka" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="rimd"/></feMerge></filter>
<filter id="aqPapier" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="3" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .35 0 0 0 0 .3 0 0 0 0 .25 0 0 0 -1.6 1"/></filter>
<clipPath id="aqRL"><path d="M0 200V122Q8 104 28 100Q56 98 76 124Q92 148 96 176L102 200z"/></clipPath><clipPath id="aqRR"><path d="M360 200V130Q346 110 326 120Q310 130 312 160L314 200z"/></clipPath></defs><g transform="translate(-5 -5) scale(1.03)"><rect width="360" height="200" fill="#f3efe3"/><rect width="360" height="200" fill="url(#aqW)"/><g filter="url(#aqNass)" opacity=".42"><ellipse cx="180" cy="10" rx="120" ry="40" fill="#f4fbfc"/><ellipse cx="30" cy="150" rx="70" ry="50" fill="#1f5a80"/><ellipse cx="340" cy="60" rx="50" ry="60" fill="#3f86aa"/><ellipse cx="190" cy="125" rx="90" ry="26" fill="#2a74a0"/></g><g filter="url(#aqStrahl)" fill="#fff" opacity=".28"><path d="M150 0h30l-40 150h-40z"/><path d="M185 0h24l10 150h-36z"/><path d="M215 0h26l40 140h-40z"/><path d="M120 0h16l-60 120h-20z"/><path d="M250 0h18l66 110h-24z"/></g><g filter="url(#aqFarbe)"><path d="M0 112Q30 90 70 106T150 98T230 82T300 100T360 88V200H0z" fill="#4d93b6" opacity=".7"/><path d="M0 134Q60 112 120 128T230 120T330 130T360 124V200H0z" fill="#33789f" opacity=".85"/></g><path fill="url(#aqSand)" filter="url(#aqFarbe)" d="M0 170Q50 160 110 168T230 166T360 162V200H0z"/><g fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".55"><path d="M110 184q16-3 32 0M180 190q18-3 36 0M236 182q14-3 28 0M20 194q12-2 24 0M286 192q14-3 28 0"/></g><path d="M168 180h0M178 184h0M206 188h0M148 190h0M222 178h0M240 190h0M110 176h0" stroke="#bda878" stroke-width="3.4" stroke-linecap="round"/><g filter="url(#aqFarbe)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M196 176Q186 150 200 128Q212 110 200 88Q194 76 202 64" stroke="#7c9650" stroke-width="5.5"/><path d="M262 176Q252 148 266 124Q276 104 264 84" stroke="#6f8a47" stroke-width="5.5"/><path d="M236 176Q232 150 242 130Q248 116 240 100" stroke="#8aa25a" stroke-width="4.5"/><path d="M154 176Q150 154 160 140" stroke="#8aa25a" stroke-width="4"/></g><g filter="url(#aqFarbe)"><path d="M0 200V122Q8 104 28 100Q56 98 76 124Q92 148 96 176L102 200z" fill="#b8a88b"/><path d="M0 200V138Q10 126 26 128Q46 130 60 152Q70 170 72 200z" fill="#9a8b73"/><path d="M10 112q16-10 34-4q-8 8-20 8z" fill="#d2c4a6"/></g><g clip-path="url(#aqRL)"><path d="M45 123h0M54 187h0M10 113h0M72 116h0M50 178h0M11 168h0M31 108h0M15 159h0M57 112h0M34 115h0M74 158h0M11 176h0M19 132h0M84 184h0M78 111h0M77 178h0M54 110h0M32 109h0M75 121h0M41 157h0M22 173h0M19 177h0M43 175h0M91 127h0M17 178h0M77 185h0M28 151h0M16 174h0M12 176h0M11 183h0M30 167h0M91 172h0M58 144h0M63 178h0M62 150h0M42 135h0M27 193h0M35 114h0M77 142h0M71 167h0M47 197h0M61 140h0M81 113h0M19 169h0M57 125h0M47 123h0" stroke="#e3d6b8" stroke-width="1.8" stroke-linecap="round" opacity=".8"/><path d="M66 157h0M9 189h0M13 175h0M77 144h0M47 192h0M48 180h0M67 178h0M62 112h0M15 138h0M64 193h0M89 112h0M11 197h0M93 143h0M86 177h0M91 161h0M40 195h0M53 189h0M48 106h0M63 149h0M25 182h0M18 167h0M11 131h0M40 120h0M35 154h0M54 167h0M14 125h0M61 155h0M74 139h0M21 159h0M74 139h0M94 157h0M49 191h0M52 133h0M23 114h0M26 123h0M33 188h0M33 105h0M66 179h0M27 137h0M40 104h0" stroke="#7d6e58" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></g><g filter="url(#aqFarbe)"><path d="M10 200V158Q10 136 32 136Q58 136 58 160V200z" fill="#142840"/><path d="M62 200q0-14 8-22 6 10 10 22z" fill="#1d3550"/></g><g filter="url(#aqFarbe)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#f0e1c4" stroke-width="3.4"><path d="M8 112V90M8 102l-7-10M8 98l8-10M24 114V94M24 104l-8-9M24 100l9-11M38 112V98M38 104l6-8"/></g><g stroke="#e8964f" stroke-width="2.8"><path d="M44 112q-8-4-8-20M44 112q-2-8 2-22M44 112q7-6 14-18"/></g><g stroke="#d9728f" stroke-width="2.6"><path d="M58 118q-4-9 0-20M58 118q7-6 13-11"/></g></g><g filter="url(#aqFarbe)"><g fill="#8a68b8"><rect x="114" y="150" width="10" height="26" rx="5"/><rect x="126" y="140" width="10" height="36" rx="5"/><rect x="138" y="154" width="10" height="22" rx="5"/><rect x="148" y="162" width="8" height="14" rx="4"/></g><g fill="#b69bdc"><ellipse cx="119" cy="150" rx="3.6" ry="1.7"/><ellipse cx="131" cy="140" rx="3.6" ry="1.7"/><ellipse cx="143" cy="154" rx="3.6" ry="1.7"/><ellipse cx="152" cy="162" rx="3" ry="1.4"/></g></g><g filter="url(#aqFarbe)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#d9a0b8" stroke-width="2"><path d="M96 176q-4-14-2-28M96 176q-10-8-14-22M96 176q4-12 12-24M96 176q10-6 20-12M90 158q-6-4-10-4M104 158q6-2 8-10"/></g><g stroke="#ecc0cf" stroke-width="1.3"><path d="M94 148l-4-9M108 152l4-9M82 154l-6-3M80 154l-4-6"/></g></g><g filter="url(#aqFarbe)"><path d="M212 178q-12-6-8-18q10-10 22-6q14 4 14 18q0 6-6 6z" fill="#34506e"/><path d="M214 172q-6-8-2-14q8-8 18-4q10 4 10 14" fill="#4f6f90"/><path d="M210 178q16-8 36 0z" fill="#26405a"/><path d="M222 162q8-6 18 0" fill="none" stroke="#7e9bb8" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(-84 0)"><g filter="url(#aqFarbe)"><path d="M252 180q-7 0-9-9-2-11 4-15h9q6 4 4 15-2 9-8 9z" fill="#d98a3e"/></g><path d="M247 162h0M252 166h0M246 170h0M253 160h0M250 173h0" stroke="#f6cf8a" stroke-width="2.2" stroke-linecap="round"/></g><g transform="translate(-26 6)"><g filter="url(#aqFarbe)"><path d="M256 136q40-22 84-6-6 10-36 12-34 2-48-6z" fill="#d6bf92"/><path d="M258 135q40-18 80-4" fill="none" stroke="#f0e2bc" stroke-width="3.2" stroke-linecap="round"/><path d="M262 144q40 4 66-4" fill="none" stroke="#a68f62" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M266 158q34-16 66-2-4 9-30 10-26 1-36-8z" fill="#cdb585"/><path d="M268 157q32-12 62-2" fill="none" stroke="#e9d7ac" stroke-width="3" stroke-linecap="round"/><path d="M278 148v14M302 144v18M322 140v14" stroke="#a68f62" stroke-width="3.2" stroke-linecap="round"/></g><path d="M279 135h0M304 134h0M309 136h0M290 133h0M314 138h0M302 136h0M311 137h0M317 132h0M299 138h0M319 138h0M313 138h0M305 135h0" stroke="#a88f60" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></g><g transform="translate(-18 0)"><g filter="url(#aqFarbe)"><path d="M296 180q-4-20 14-24t24 6q14 8 14 18z" fill="#d1b98a"/><path d="M296 180q-4-20 14-24" fill="none" stroke="#efe0bb" stroke-width="2.8" stroke-linecap="round"/><path d="M238 182q-2-12 8-14" fill="none" stroke="#ecddb8" stroke-width="0"/></g></g><path d="M310 166h0M318 170h0M326 174h0M316 177h0M306 175h0M330 166h0" stroke="#9b835a" stroke-width="2.2" stroke-linecap="round" opacity=".85" transform="translate(-18 0)"/><g filter="url(#aqFarbe)"><path d="M360 200V130Q346 110 326 120Q310 130 312 160L314 200z" fill="#aa9d85"/><path d="M360 200V150Q346 140 334 148Q324 158 326 200z" fill="#8e826c"/><path d="M332 200q0-20 12-24 12 4 16 24z" fill="#142840"/></g><g clip-path="url(#aqRR)"><path d="M337 165h0M337 127h0M342 195h0M337 121h0M324 122h0M325 170h0M322 128h0M333 190h0M315 127h0M312 186h0M321 182h0M318 160h0M351 117h0M316 140h0M351 162h0M321 195h0M328 158h0M350 160h0M342 129h0M319 176h0M341 175h0M342 153h0M317 132h0M318 157h0M328 175h0M356 134h0M345 116h0M325 181h0M335 132h0M356 183h0M313 181h0M331 196h0M317 147h0M345 160h0" stroke="#e3d6b8" stroke-width="1.8" stroke-linecap="round" opacity=".75"/><path d="M322 159h0M326 182h0M346 178h0M333 195h0M326 192h0M324 144h0M337 143h0M324 180h0M343 159h0M358 117h0M313 149h0M342 147h0M324 191h0M334 171h0M358 158h0M335 124h0M326 127h0M326 174h0M324 157h0M325 175h0M351 192h0M312 175h0M353 158h0M353 124h0M354 129h0M336 139h0M342 136h0M339 195h0M333 125h0M358 164h0" stroke="#7d6e58" stroke-width="1.6" stroke-linecap="round" opacity=".55"/></g><g filter="url(#aqFarbe)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#6fb0c0" stroke-width="3.2"><path d="M346 116V88M346 104l-8-12M346 98l9-12M336 118l-7-16M356 120l6-12M338 110v-14"/></g><g stroke="#e8866a" stroke-width="2.6"><path d="M298 140q-8-4-8-18M298 140q-2-9 2-20M298 140q8-6 14-15"/></g></g><g filter="url(#aqFarbe)" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M104 182Q96 168 104 156" stroke="#9db46a" stroke-width="3.6"/><path d="M286 184Q292 166 284 150" stroke="#9db46a" stroke-width="3.6"/></g><g filter="url(#aqFarbe)"><path d="M186 184q6-11 15 0z" fill="#f4e8d4"/><path d="M132 192q5-8 11 0z" fill="#f0d9d2"/><path d="M264 190q4-7 9 0z" fill="#f4e8d4"/><path d="M168 188l3-7 7 2-3 6z" fill="#e8683a" opacity=".9"/></g><rect width="360" height="200" filter="url(#aqPapier)" opacity=".2" style="mix-blend-mode:multiply"/></g>`
  };
  const hg = svg("svg", { viewBox: "0 0 360 200", "class": "lp-pr-aqua lp-pr-hg", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true", focusable: "false" });
  const tank = svg("svg", { viewBox: "0 0 360 200", "class": "lp-pr-aqua", role: "img", focusable: "false", preserveAspectRatio: "xMidYMid slice" });
  tank.innerHTML = '<g class="blase"></g>';
  tank.firstChild.innerHTML = '<circle cx="96" cy="150" r="3"/><circle cx="212" cy="140" r="2.5"/><circle cx="262" cy="130" r="2"/><circle cx="150" cy="120" r="2"/>';
  const tankRahmen = neu("div", "lp-pr-aquarahmen");
  tankRahmen.appendChild(hg); tankRahmen.appendChild(tank);
  const fischSchicht = svg("g", {}, tank);
  fischSchicht.setAttribute("class", "fische");
  const fischText = neu("p", "lp-pr-fischzahl", "");
  /* Fischarten (Kopf zeigt nach rechts, Ursprung in der Körpermitte). k = Umriss, lb = Körper, fl = Flossen in der Artfarbe */
  const AUGE = (x, y, r) => '<circle class="auge" cx="' + x + '" cy="' + y + '" r="' + r + '"/><circle class="pupille" cx="' + (x + .5) + '" cy="' + y + '" r="' + (r * .46).toFixed(1) + '"/>';
  const ARTEN = [
    { k: "a0", name: "Clownfisch", svg: '<path class="k fl" d="M-12 0L-27-10Q-24 0-27 10z"/><path class="k fl" d="M-5-8Q2-17 10-7z"/><path class="k fl" d="M-2 8Q3 14 8 8z"/><ellipse class="k lb" rx="15" ry="9"/><path class="streifen" d="M5-8.3Q8.5 0 5 8.3"/><path class="streifen" d="M-6-8.5Q-3 0-6 8.5"/>' + AUGE(9, -2.5, 2.4) },
    { k: "a1", name: "Paletten-Doktorfisch", svg: '<path class="k" fill="#f4b400" d="M-13 0L-28-9L-24 0L-28 9z"/><path class="k fl" d="M-9-9Q0-16 9-8z"/><ellipse class="k lb" rx="15" ry="10"/><path fill="#14284a" d="M-11 3Q-4-7 9-4Q3 2-3 7Q-9 7-11 3z"/><path class="k" fill="#f4b400" d="M3 6Q8 12 11 6z"/>' + AUGE(10, -3, 2.2) },
    { k: "a2", name: "Falterfisch", svg: '<path class="k fl" d="M-10 0L-21-7L-21 7z"/><path class="k fl" d="M-7-10Q0-18 8-9z"/><path class="k fl" d="M-4 10Q1 16 7 10z"/><ellipse class="k lb" rx="13" ry="11"/><path class="k lb" d="M10-3L18 0L10 3z"/><path class="band" d="M7-10Q10 0 7 10"/>' + AUGE(9, -3, 2.3) },
    { k: "a3", name: "Kugelfisch", svg: '<path class="k fl" d="M-10 0L-18-5L-18 5z"/><circle class="k lb" r="11"/><path fill="#f2ecd0" d="M-8 4Q0 12 9 4Q0 8-8 4z"/><path class="punkte" d="M-6-5h0M0-7h0M-3-1h0M3-3h0M-7 1h0"/><path class="k fl" d="M-1 5Q3 11 6 5z"/>' + AUGE(6, -3, 3) },
    { k: "a4", name: "Kaiserfisch", svg: '<path class="k" fill="#f4b400" d="M-12 0L-26-8L-26 8z"/><path class="k fl" d="M-9-8Q0-17 12-7z"/><ellipse class="k lb" rx="15" ry="9.5"/><path class="gelb" d="M-4-9Q-1 0-4 9"/><path class="gelb" d="M3-9Q6 0 3 9"/><path class="gelb" d="M-11-6Q-9 0-11 6"/>' + AUGE(10, -2.5, 2.3) },
    { k: "a5", name: "Fahnenbarsch", svg: '<path class="k fl" d="M-14 0L-30-11L-25 0L-30 11z"/><path class="k fl" d="M-6-6L1-15L9-6z"/><ellipse class="k lb" rx="16" ry="6.5"/><path class="gelb" d="M-8 0H8"/>' + AUGE(11, -1.5, 2) }
  ];
  const ARTFOLGE = [0, 1, 2, 3, 4, 5, 1, 0, 2, 5, 3, 4, 1, 2, 0, 4, 5, 3, 2, 1];
  /* Märchenriff mit Bildern (assets/img/aquarium/): Hintergrund und 7 Tiere als WebP. Fehlen die Dateien, greift die Vektorzeichnung. */
  const WURZEL = /^(\.\.\/|\.\/)+$/.test(document.body.dataset.root || "") ? document.body.dataset.root : "./";
  const BILDPFAD = WURZEL + "assets/img/aquarium/";
  const SPRITES = [   // Datei, Name, Breite und Höhe in Bildeinheiten (Seitenverhältnis der Datei)
    ["clownfisch", "Clownfisch", 46.8, 24.4], ["riffbarsch", "Violetter Riffbarsch", 49.4, 25.1], ["falterfisch", "Falterfisch", 39.0, 27.0],
    ["kugelfisch", "Kugelfisch", 42.9, 21.3], ["kaiserfisch", "Kaiserfisch", 41.6, 23.7], ["fahnenbarsch", "Fahnenbarsch", 49.4, 24.8], ["qualle", "Qualle", 52.0, 22.8]
  ];
  const SPRFOLGE = [0, 1, 2, 3, 4, 5, 6, 2, 0, 4, 1, 5, 3, 6, 0, 2, 5, 1, 4, 3];
  let bildFehler = false, aquaN = -1;
  const spriteModus = () => tankRahmen.dataset.riff === "maerchen" && !bildFehler;
  function aquaBauen(n) {
    fischSchicht.textContent = "";
    for (let i = 0; i < n; i++) {
      const links = i % 2 === 1, dauer = 16 + ((i * 5) % 9) * 1.4;
      const f = svg("g", { "class": "fisch", transform: "translate(0 " + (24 + (i * 37) % 96) + ")" }, fischSchicht);
      const sw = svg("g", { "class": "schwimm " + (links ? "l" : "r") }, f);
      sw.style.cssText = "--x0:" + (40 + (i * 53) % 280) + "px;animation-duration:" + dauer + "s;animation-delay:-" + ((i * 3.7) % dauer).toFixed(1) + "s";
      if (spriteModus()) {
        const sp = SPRITES[SPRFOLGE[i % SPRFOLGE.length]];
        if (sp[0] === "qualle") sw.style.animationDuration = (dauer * 1.7) + "s";
        const bob = svg("g", { "class": "bob" }, sw);
        bob.style.animationDelay = "-" + ((i * 1.3) % 3).toFixed(1) + "s";
        const d = svg("g", links ? { transform: "scale(-1 1)" } : {}, bob);
        svg("image", { href: BILDPFAD + "fische/" + sp[0] + ".webp", x: -sp[2] / 2, y: -sp[3] / 2, width: sp[2], height: sp[3], "aria-hidden": "true" }, d);
        svg("title", {}, f).textContent = sp[1];
        continue;
      }
      const d = svg("g", links ? { transform: "scale(-1 1)" } : {}, sw);
      const art = ARTEN[ARTFOLGE[i % ARTFOLGE.length]];
      f.classList.add(art.k);
      d.innerHTML = art.svg;
      svg("title", {}, f).textContent = art.name;
      svg("ellipse", { "class": "glanz", cx: 1, cy: -4.5, rx: 7, ry: 2 }, d);
    }
  }
  function aquaZeigen() {
    if (aquaN !== pk.ziel) { aquaN = pk.ziel; aquaBauen(pk.ziel); }
    const da = Math.min(sterne, pk.ziel);
    [].forEach.call(fischSchicht.children, (f, i) => f.classList.toggle("da", i < da));
    fischText.textContent = da + " von " + pk.ziel + " Tieren" + (lae.el.dataset.stufe === "2" ? ". Sie verstecken sich." : "");
    tank.setAttribute("aria-label", "Aquarium mit " + da + " von " + pk.ziel + " Tieren");
  }
  const ansichtZeile = neu("div", "lp-pr-reihe lp-pr-ansicht");
  const aBtn = knopf("lp-pr-klein", "Ampel", "Ansicht Ampel"), qBtn = knopf("lp-pr-klein", "Aquarium", "Ansicht Aquarium");
  function ansichtSetzen(a, merken) {
    const aq = a === "aqua";
    lae.el.dataset.ansicht = aq ? "aqua" : "ampel";
    aBtn.setAttribute("aria-pressed", String(!aq)); aBtn.classList.toggle("on", !aq);
    qBtn.setAttribute("aria-pressed", String(aq)); qBtn.classList.toggle("on", aq);
    if (merken) { cfg.ansicht = aq ? "aqua" : "ampel"; speichern(SCHL, cfg); }
    aquaZeigen();
  }
  aBtn.addEventListener("click", () => ansichtSetzen("ampel", true));
  qBtn.addEventListener("click", () => ansichtSetzen("aqua", true));
  const riffZeile = neu("div", "lp-pr-reihe lp-pr-riff");
  const RIFFNAMEN = [["maerchen", "Märchen", "Riff Märchen, handgemalt und warm"], ["gezeichnet", "Gezeichnet", "Riff gezeichnet"], ["gemalt", "Aquarell", "Riff Aquarell"]];
  const riffKnoepfe = {};
  RIFFNAMEN.forEach(([id, text, label]) => {
    const k = knopf("lp-pr-klein", text, label);
    k.addEventListener("click", () => riffSetzen(id, true));
    riffKnoepfe[id] = k; riffZeile.appendChild(k);
  });
  function riffSetzen(r, merken) {
    if (!riffKnoepfe[r]) r = "maerchen";
    tankRahmen.dataset.riff = r;
    if (r === "maerchen") {
      bildFehler = false; hg.innerHTML = "";
      const bild = svg("image", { href: BILDPFAD + "riff-maerchen.webp", x: 0, y: 0, width: 360, height: 200, preserveAspectRatio: "xMidYMid slice" }, hg);
      bild.addEventListener("error", () => { bildFehler = true; hg.innerHTML = RIFFE.maerchenSvg; aquaN = -1; aquaZeigen(); });
    } else { hg.innerHTML = RIFFE[r]; }
    aquaN = -1; aquaZeigen();
    for (const id in riffKnoepfe) { riffKnoepfe[id].setAttribute("aria-pressed", String(id === r)); riffKnoepfe[id].classList.toggle("on", id === r); }
    if (merken) { cfg.riff = r; speichern(SCHL, cfg); }
  }
  const vBtn = knopf("lp-pr-klein", "Vollbild", "Fenster auf die ganze Bühne vergrößern");
  vBtn.setAttribute("aria-pressed", "false");
  function vollSetzen(an) {
    lae.el.classList.toggle("vollfenster", an);
    vBtn.textContent = an ? "Verkleinern" : "Vollbild"; vBtn.setAttribute("aria-pressed", String(an));
    if (lae.el.einpassen) lae.el.einpassen();
  }
  vBtn.addEventListener("click", () => vollSetzen(!lae.el.classList.contains("vollfenster")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && lae.el.classList.contains("vollfenster") && !lae.el.hidden) vollSetzen(false); });
  ansichtZeile.appendChild(aBtn); ansichtZeile.appendChild(qBtn); ansichtZeile.appendChild(vBtn);

  const db = (v) => Math.max(0, Math.min(100, (v + 70) / 60 * 100));
  function grenzen() { balken.querySelector(".m1").style.left = db(cfg.gelb) + "%"; balken.querySelector(".m2").style.left = db(cfg.rot) + "%"; }
  function ampelSetzen(s, ruhig) {
    stufe = s;
    lg.classList.toggle("an", s === 0 && !ruhig); ly.classList.toggle("an", s === 1); lr.classList.toggle("an", s === 2);
    lampen.classList.toggle("aus", !!ruhig);
    text.textContent = ruhig ? "Aus" : ["Ruhig", "Etwas laut", "Zu laut"][s];
    lae.el.dataset.stufe = ruhig ? "aus" : String(s);
    aquaZeigen();
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
    aquaZeigen();
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
    z.appendChild(ansichtZeile); z.appendChild(riffZeile); z.appendChild(lampen); z.appendChild(tankRahmen); z.appendChild(text); z.appendChild(fischText); z.appendChild(balken);
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
    riffSetzen(cfg.riff, false);
    ansichtSetzen(cfg.ansicht === "aqua" ? "aqua" : "ampel", false);
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
    zeit(sek) { return Math.floor(sek / 60) + ":" + String(Math.floor(sek % 60)).padStart(2, "0"); },
    /* Aufgabe mit Operator vorn (fett), darunter der Inhalt, z. B. die Erklärung in Anführungszeichen */
    frage(el, auftrag, inhalt) {
      el.textContent = "";
      const a = neu("span", "lp-pr-auftrag"), i = auftrag.indexOf(" ");
      a.appendChild(neu("b", "", i > 0 ? auftrag.slice(0, i) : auftrag));
      if (i > 0) a.appendChild(document.createTextNode(auftrag.slice(i)));
      el.appendChild(a);
      if (inhalt) el.appendChild(document.createTextNode(inhalt));
    },
    /* Rückmeldung: Text plus Linien-Symbol (Haken oder Kreuz), nie nur Farbe. art: "gut", "falsch" oder leer */
    rueck(el, art, text) {
      el.textContent = text || "";
      el.classList.toggle("lp-pr-gut", art === "gut");
      el.classList.toggle("lp-pr-falsch", art === "falsch");
      if (!el.hasAttribute("role")) el.setAttribute("role", "status");
    },
    /* Am Beamer läuft das Spiel nach kurzer Pause von selbst weiter (die Lehrkraft liest vor) */
    weiter(feld, los, ms) { setTimeout(los, ms || 1600); },
    vorlesen() { return null; },
    /* Mehrspieler: Auswahl der Anzahl (Teams oder Spieler), dann los(n) */
    anzahl(feld, text, werte, los) {
      const box = neu("div", "lp-pr-spielwahl"), reihe = neu("div", "lp-pr-buchstaben");
      box.appendChild(neu("p", "lp-pr-spieltext", text));
      werte.forEach((w) => { const b = knopf("lp-pr-karte", String(w), w + " auswählen"); b.addEventListener("click", () => { box.remove(); los(w); }); reihe.appendChild(b); });
      box.appendChild(reihe); feld.appendChild(box);
    },
    /* Punktetafel für n Teams (bei n = 1 nur „Punkte“) */
    tafel(feld, n, name) {
      name = name || "Team";
      const el = neu("div", "lp-pr-tafel"), z = [], p = [];
      for (let i = 0; i < n; i++) { p.push(0); const s = neu("span", "lp-pr-team", ""); z.push(s); el.appendChild(s); }
      const zeige = () => z.forEach((s, i) => { s.textContent = (n === 1 ? "Punkte: " + p[i] : name + " " + (i + 1) + ": " + p[i]) + (s.classList.contains("dran") ? " (ist dran)" : ""); });
      zeige(); feld.appendChild(el);
      return {
        punkte: p,
        dran(i) { z.forEach((s, j) => { s.classList.toggle("dran", j === i); if (j === i) s.setAttribute("aria-current", "true"); else s.removeAttribute("aria-current"); }); zeige(); },
        punkt(i) { p[i]++; zeige(); },
        sieger() {
          const m = Math.max.apply(null, p), w = p.map((x, i) => (x === m ? i : -1)).filter((i) => i >= 0);
          return n === 1 ? p[0] + " Punkte" : (w.length > 1 ? "Unentschieden" : name + " " + (w[0] + 1) + " gewinnt") + " (" + p.join(" : ") + ")";
        }
      };
    }
  };
  // Duell und Erklären fehlen hier mit Absicht: Sie brauchen ein Gerät in der Hand (Duell: Tablet zwischen zwei Spielern, Erklären: geheime Karte). Sie laufen nur auf der Begriffe-Seite.
  const SPIELE = ["memory", "quiz", "zuordnen", "wortsalat", "reihum", "dreierreihe", "domino", "buchstabenraten", "stimmts"];
  const EIGNUNG = {                                        // Mindestanzahl brauchbarer Paare je Spiel
    memory: (p) => p.length >= 4, quiz: (p) => p.length >= 4, zuordnen: (p) => p.length >= 4,
    wortsalat: (p) => p.filter((x) => /^[A-Za-zÄÖÜäöüß]{3,14}$/.test(x.b)).length >= 3,
    reihum: (p) => p.length >= 4, dreierreihe: (p) => p.length >= 9, domino: (p) => p.length >= 4, stimmts: (p) => p.length >= 4,
    buchstabenraten: (p) => p.filter((x) => /^[A-Za-zÄÖÜäöüß]{3,18}$/.test(x.b)).length >= 3
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
  /* =====================================================================
     WEITERE WERKZEUGE: Blende, Zufallsnummer, Gruppen, Stoppuhr, Notizzettel
     Ein Dock-Knopf („Weitere“, Taste W) öffnet die Auswahl. Alles läuft im Browser, nichts wird gesendet.
     ===================================================================== */
  const zuf = (n) => {
    const c = window.crypto;
    if (!c || !c.getRandomValues) return Math.floor(Math.random() * n);
    const grenze = Math.floor(4294967296 / n) * n, x = new Uint32Array(1);
    do { c.getRandomValues(x); } while (x[0] >= grenze);
    return x[0] % n;
  };
  const wenigBewegung = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- Datum: kleines Tagesdatum unten links auf jeder Folie (an Tafel und Board üblich), unten links; Schalter unter „Weitere Werkzeuge“ ---------- */
  const datumEl = neu("div", "lp-pr-datum");
  datumEl.setAttribute("aria-hidden", "true");
  stage.appendChild(datumEl);
  let datumTaste = null;
  const datumText = () => { try { return new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()); } catch (e) { return new Date().toLocaleDateString("de-DE"); } };
  function datumZeigen(an) {
    datumEl.hidden = !an;
    if (an) datumEl.textContent = datumText();
    if (datumTaste) { datumTaste.classList.toggle("on", an); datumTaste.setAttribute("aria-pressed", String(an)); }
    speichern("lp-pr-datum", an);
  }
  datumEl.hidden = laden("lp-pr-datum", true) === false;
  if (!datumEl.hidden) datumEl.textContent = datumText();
  setInterval(() => { if (!datumEl.hidden) { const t = datumText(); if (datumEl.textContent !== t) datumEl.textContent = t; } }, 60000);   // Datum wechselt um Mitternacht mit

  /* ---------- Blende: frei verschiebbare und in jeder Kante ziehbare Abdeckung der Folie ---------- */
  const blende = neu("div", "lp-pr-blende");
  blende.hidden = true;
  blende.setAttribute("role", "group");
  blende.setAttribute("aria-label", "Blende: verdeckt einen Teil der Folie");
  const blendeText = neu("p", "lp-pr-blende-text", "Blende · Ziehen verschiebt, die Kanten ziehen verkleinert");
  const blendeZu = knopf("lp-pr-blende-zu", "× Blende weg", "Blende entfernen");
  blende.appendChild(blendeText); blende.appendChild(blendeZu);
  ["n", "s", "w", "o", "nw", "no", "sw", "so"].forEach((k) => { const h = neu("i", "lp-pr-bh"); h.dataset.k = k; h.setAttribute("aria-hidden", "true"); blende.appendChild(h); });
  stage.appendChild(blende);
  let br = { x: 0, y: 0, w: 1280, h: 720 };
  let blendeTaste = null;
  function blendeSetzen() {
    blende.style.left = br.x + "px"; blende.style.top = br.y + "px"; blende.style.width = br.w + "px"; blende.style.height = br.h + "px";
    blendeText.hidden = br.w < 420 || br.h < 160;
  }
  function blendeSchalte(an) {
    const zeigen = an === undefined ? blende.hidden : an;
    if (zeigen) { br = { x: 0, y: 0, w: 1280, h: 720 }; blendeSetzen(); }
    blende.hidden = !zeigen;
    if (blendeTaste) { blendeTaste.classList.toggle("on", zeigen); blendeTaste.setAttribute("aria-pressed", String(zeigen)); }
  }
  function blendeWeg() { if (!blende.hidden) blendeSchalte(false); }   // beim Folienwechsel: neue Folie, neue Blende
  (function blendeBedienung() {
    let d = null;
    blende.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".lp-pr-blende-zu")) return;
      const r = stage.getBoundingClientRect();
      d = { id: e.pointerId, k: (e.target.dataset && e.target.dataset.k) || "", f: r.width / 1280, x: e.clientX, y: e.clientY, b: Object.assign({}, br) };
      blende.setPointerCapture(e.pointerId); e.preventDefault();
    });
    blende.addEventListener("pointermove", (e) => {
      if (!d || d.id !== e.pointerId) return;
      const dx = (e.clientX - d.x) / d.f, dy = (e.clientY - d.y) / d.f, b = d.b, MIN = 80;
      let x = b.x, y = b.y, w = b.w, h = b.h;
      if (!d.k) {
        x = Math.max(0, Math.min(1280 - b.w, b.x + dx)); y = Math.max(0, Math.min(720 - b.h, b.y + dy));
      } else {
        if (d.k.indexOf("w") >= 0) { const nx = Math.max(0, Math.min(b.x + b.w - MIN, b.x + dx)); w = b.x + b.w - nx; x = nx; }
        if (d.k.indexOf("o") >= 0) w = Math.max(MIN, Math.min(1280 - b.x, b.w + dx));
        if (d.k.indexOf("n") >= 0) { const ny = Math.max(0, Math.min(b.y + b.h - MIN, b.y + dy)); h = b.y + b.h - ny; y = ny; }
        if (d.k.indexOf("s") >= 0) h = Math.max(MIN, Math.min(720 - b.y, b.h + dy));
      }
      br = { x, y, w, h }; blendeSetzen();
    });
    const ende = (e) => { if (d && d.id === e.pointerId) d = null; };
    blende.addEventListener("pointerup", ende);
    blende.addEventListener("pointercancel", ende);
    blendeZu.addEventListener("click", () => blendeSchalte(false));
  })();

  /* ---------- Zufallsnummer „Wer ist dran?“ ---------- */
  const zf = panelBauen("zufall", "Wer ist dran?", 80, 300);
  (function zufallPanel() {
    const ZK = "lp-pr-zufall", z = zf.inhalt;
    const st = laden(ZK, {}) || {};
    let n = Math.max(2, Math.min(60, +st.n || 24)), einmal = st.einmal !== false, gezogen = [], lauf = null;
    const zahl = neu("div", "lp-pr-zufallzahl", "?");
    zahl.setAttribute("aria-live", "polite");
    const zeile = neu("div", "lp-pr-reihe");
    const minus = knopf("lp-pr-klein", "−", "Eine Nummer weniger"), plus = knopf("lp-pr-klein", "+", "Eine Nummer mehr");
    const von = neu("span", "lp-pr-hinweis");
    zeile.appendChild(neu("span", "lp-pr-hinweis", "Nummern 1 bis"));
    zeile.appendChild(minus); zeile.appendChild(von); zeile.appendChild(plus);
    von.style.cssText = "font:700 20px Verdana,Arial,sans-serif;min-width:2ch;text-align:center;color:#1a1a1a";
    const los = knopf("lp-pr-gross", "Losen", "Nummer losen");
    const opt = neu("label", "lp-pr-opt");
    const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = einmal;
    opt.appendChild(cb); opt.appendChild(document.createTextNode(" Jede Nummer nur einmal"));
    const schon = neu("p", "lp-pr-hinweis", "");
    const neuBtn = knopf("lp-pr-klein", "Neu beginnen", "Gezogene Nummern zurücksetzen");
    z.appendChild(zahl); z.appendChild(zeile); z.appendChild(los); z.appendChild(opt); z.appendChild(schon); z.appendChild(neuBtn);
    function zeigen() {
      von.textContent = n;
      schon.textContent = einmal && gezogen.length ? "Schon dran: " + gezogen.join(", ") : "";
      los.disabled = einmal && gezogen.length >= n;
      if (los.disabled) { zahl.textContent = "Alle"; schon.textContent += " (alle waren dran)"; }
      speichern(ZK, { n, einmal });
    }
    function ziehen() {
      if (lauf) return;
      const frei = []; for (let i = 1; i <= n; i++) if (!einmal || gezogen.indexOf(i) < 0) frei.push(i);
      if (!frei.length) return;
      const ziel = frei[zuf(frei.length)];
      const fertig = () => { lauf = null; zahl.textContent = ziel; zahl.classList.remove("rollt"); if (einmal) gezogen.push(ziel); zeigen(); };
      if (wenigBewegung()) { fertig(); return; }
      zahl.classList.add("rollt");
      let k = 0;
      lauf = setInterval(() => { zahl.textContent = 1 + zuf(n); if (++k >= 12) { clearInterval(lauf); fertig(); } }, 60);
    }
    los.addEventListener("click", ziehen);
    minus.addEventListener("click", () => { n = Math.max(2, n - 1); gezogen = gezogen.filter((x) => x <= n); zeigen(); });
    plus.addEventListener("click", () => { n = Math.min(60, n + 1); zeigen(); });
    cb.addEventListener("change", () => { einmal = cb.checked; gezogen = []; zeigen(); });
    neuBtn.addEventListener("click", () => { gezogen = []; zahl.textContent = "?"; zeigen(); });
    zeigen();
  })();

  /* ---------- Gruppen losen (die Seite interaktiv/gruppen/ im Fenster) ---------- */
  const gp = panelBauen("gruppen", "Gruppen losen", 90, 640);
  gp.el.classList.add("lp-pr-rahmen");
  gp.beimOeffnen = () => {
    if (gp.inhalt.firstChild) return;
    const f = document.createElement("iframe");
    f.className = "lp-pr-iframe"; f.title = "Gruppen losen mit Sitzplan";
    f.src = WURZEL + "interaktiv/gruppen/?eingebettet=1";
    gp.inhalt.appendChild(f);
  };

  /* ---------- Stoppuhr ---------- */
  const sp = panelBauen("stoppuhr", "Stoppuhr", 100, 300);
  (function stoppuhrPanel() {
    const z = sp.inhalt;
    let t0 = 0, vor = 0, an = null, runden = [];
    const zeit = neu("div", "lp-pr-zeit", "00:00,0");
    const liste = neu("ol", "lp-pr-runden");
    const reihe = neu("div", "lp-pr-reihe");
    const start = knopf("lp-pr-gross", "Start", "Stoppuhr starten");
    const runde = knopf("lp-pr-klein", "Runde", "Zwischenzeit festhalten");
    const reset = knopf("lp-pr-klein", "Zurücksetzen", "Stoppuhr zurücksetzen");
    reihe.appendChild(start); reihe.appendChild(runde); reihe.appendChild(reset);
    z.appendChild(zeit); z.appendChild(reihe); z.appendChild(liste);
    const fm = (ms) => { const g = Math.floor(ms / 100), m = Math.floor(g / 600), s = Math.floor(g / 10) % 60; return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "," + (g % 10); };
    const jetzt = () => vor + (an ? performance.now() - t0 : 0);
    function zeichnen() {
      zeit.textContent = fm(jetzt());
      runde.disabled = !an;
      start.textContent = an ? "Stopp" : vor > 0 ? "Weiter" : "Start";
      liste.textContent = "";
      runden.slice(-5).forEach((r) => liste.appendChild(neu("li", "", r)));
    }
    start.addEventListener("click", () => {
      if (an) { vor = jetzt(); clearInterval(an); an = null; }
      else { t0 = performance.now(); an = setInterval(() => { zeit.textContent = fm(jetzt()); }, 100); }
      zeichnen();
    });
    runde.addEventListener("click", () => { runden.push(fm(jetzt())); zeichnen(); });
    reset.addEventListener("click", () => { clearInterval(an); an = null; vor = 0; runden = []; zeichnen(); });
    zeichnen();
  })();

  /* ---------- Notizzettel (bleibt nur in diesem Browser, je Präsentation) ---------- */
  const nz = panelBauen("notiz", "Notizzettel", 110, 300);
  (function notizPanel() {
    const NK = "lp-pr-notiz:" + location.pathname, z = nz.inhalt;
    const feld = document.createElement("textarea");
    feld.className = "lp-pr-notizfeld"; feld.rows = 8; feld.spellcheck = false;
    feld.setAttribute("aria-label", "Notizzettel");
    feld.value = laden(NK, "") || "";
    feld.addEventListener("input", () => speichern(NK, feld.value));
    const leer = knopf("lp-pr-klein", "Leeren", "Notizzettel leeren");
    leer.addEventListener("click", () => { feld.value = ""; speichern(NK, ""); feld.focus(); });
    z.appendChild(feld); z.appendChild(leer);
    z.appendChild(neu("p", "lp-pr-hinweis", "Bleibt nur in diesem Browser. Keine Namen eintragen."));
  })();

  /* ---------- Auswahl „Weitere Werkzeuge“ ---------- */
  const mw = panelBauen("weitere", "Weitere Werkzeuge", 70, 260);
  dockKnopf("weitere", ICON.mehr, "Weitere Werkzeuge", "W");
  (function weiterePanel() {
    const z = mw.inhalt;
    const raster = neu("div", "lp-pr-raster");
    const eintrag = (text, taste, tat, label) => {
      const b = knopf("lp-pr-klein lp-pr-wahl", "", label);
      b.appendChild(neu("span", "", text));
      if (taste) b.appendChild(neu("kbd", "", taste));
      b.addEventListener("click", tat);
      raster.appendChild(b);
      return b;
    };
    blendeTaste = eintrag("Blende", "B", () => blendeSchalte(), "Blende: Teil der Folie verdecken");
    blendeTaste.setAttribute("aria-pressed", "false");
    datumTaste = eintrag("Datum anzeigen", "", () => datumZeigen(datumEl.hidden), "Tagesdatum oben auf der Folie ein- oder ausblenden");
    datumTaste.classList.toggle("on", !datumEl.hidden); datumTaste.setAttribute("aria-pressed", String(!datumEl.hidden));
    eintrag("Wer ist dran?", "Z", () => schalte("zufall"), "Zufallsnummer");
    eintrag("Gruppen losen", "G", () => schalte("gruppen"), "Gruppen losen");
    eintrag("Stoppuhr", "S", () => schalte("stoppuhr"), "Stoppuhr");
    eintrag("Notizzettel", "", () => schalte("notiz"), "Notizzettel");
    eintrag("Link und QR-Code", "Q", () => { schalte("weitere", false); if (window.teilenOeffnenInt) window.teilenOeffnenInt(); }, "Link und QR-Code zeigen");
    eintrag("Leseansicht", "", () => { schalte("weitere", false); lesenSetzen(true); }, "Leseansicht: alle Folien untereinander");
    z.appendChild(raster);
  })();

  /* ---------- Folienwechsel erkennen (Striche gehören zur Folie) ---------- */
  function folieAktualisieren() {
    const n = aktuelleFolie();
    if (n === folie && cv.dataset.f) return;
    folie = n; cv.dataset.f = "1";
    zeichne(); folienMinuten(); blendeWeg(); ausSchalte(false);
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
  /* Die Leseansicht startet aus „Weitere Werkzeuge“, nicht aus dem Dock */
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

  /* ---------- Tasten: P Stift, T Timer, L Lärmampel, Punkt Folie ausblenden, W Weitere, B Blende, Z Zufall, G Gruppen, S Stoppuhr, Esc schließt Stift ---------- */
  addEventListener("keydown", (e) => {
    if (tippt(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "p") { e.preventDefault(); stiftSetzen(!penAn); }
    else if (k === "t") { schalte("timer"); }
    else if (k === "l") { schalte("laerm"); }
    else if (k === ".") { e.preventDefault(); ausSchalte(); }
    else if (k === "w") { schalte("weitere"); }
    else if (k === "b") { blendeSchalte(); }
    else if (k === "z") { schalte("zufall"); }
    else if (k === "g") { schalte("gruppen"); }
    else if (k === "s") { schalte("stoppuhr"); }
    else if (k === "q") { e.preventDefault(); if (window.teilenOeffnenInt) window.teilenOeffnenInt(); }
    else if (k === "escape" && !ausEl.hidden) { ausSchalte(false); }
    else if (k === "escape" && penAn) { stiftSetzen(false); }
  });

  Object.assign(window.Praesentation, { stift: stiftSetzen, schalte, folie: () => folie, spiel: spielStarten, lesen: lesenSetzen, teilen: () => window.teilenOeffnenInt && window.teilenOeffnenInt() });
})();
