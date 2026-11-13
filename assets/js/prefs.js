/* Lernportal – läuft auf jeder Seite im head (ohne defer):
   1. Lesemodus (Schriftgröße, Zeilenabstand, Hell/Dunkel), vor dem ersten Zeichnen gesetzt.
   2. Portal als App: Manifest, Farbe der Statusleiste, Offline-Speicher (sw.js).
   3. „Zuletzt geöffnet“: merkt sich die letzten Materialien, nur in diesem Browser. */
(() => {
  const KEY = "lernportal.prefs";
  /* Adresse des Portal-Stamms, abgeleitet aus der Adresse dieser Datei (…/assets/js/prefs.js) */
  const SKRIPT = document.currentScript && document.currentScript.src || "";
  const STAMM = /\/assets\/js\/prefs\.js(\?.*)?$/.test(SKRIPT) ? SKRIPT.replace(/assets\/js\/prefs\.js(\?.*)?$/, "") : "";
  const OPTIONS = {
    size: [["normal", "Normal"], ["gross", "Groß"], ["sehr-gross", "Sehr groß"]],
    spacing: [["normal", "Normal"], ["weit", "Weit"]],
    theme: [["auto", "Auto"], ["light", "Hell"], ["dark", "Dunkel"]]
  };
  const LABELS = { size: "Schriftgröße", spacing: "Zeilenabstand", theme: "Darstellung" };
  const DEFAULTS = { size: "normal", spacing: "normal", theme: "auto" };

  function valid(key, value) {
    return OPTIONS[key].some(option => option[0] === value);
  }
  function load() {
    const prefs = { ...DEFAULTS };
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
      Object.keys(DEFAULTS).forEach(key => { if (valid(key, stored[key])) prefs[key] = stored[key]; });
    } catch (error) { /* Speicher nicht verfügbar: Standardwerte */ }
    return prefs;
  }
  function save(prefs) {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (error) { /* ignorieren */ }
  }
  function apply(prefs) {
    const root = document.documentElement;
    Object.keys(DEFAULTS).forEach(key => { root.dataset[key] = prefs[key]; });
  }

  /* Farbe der Statusleiste (Handy, installierte App) passend zu Hell oder Dunkel */
  const FARBE = { light: "#f7f7f4", dark: "#121513" };
  const dunkelMedia = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function statusFarbe(prefs) {
    if (!document.head) return;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.appendChild(meta); }
    const dunkel = prefs.theme === "dark" || (prefs.theme === "auto" && dunkelMedia && dunkelMedia.matches);
    meta.content = dunkel ? FARBE.dark : FARBE.light;
  }

  let prefs = load();
  apply(prefs);
  statusFarbe(prefs);
  if (dunkelMedia && dunkelMedia.addEventListener) dunkelMedia.addEventListener("change", () => statusFarbe(prefs));

  /* ---------- Portal als App ---------- */
  if (STAMM && /^https?:$/.test(location.protocol)) {
    /* Manifest: Seiten ohne eigenen Link (Materialien, Präsentationen) bekommen ihn hier */
    if (document.head && !document.querySelector('link[rel="manifest"]')) {
      const l = document.createElement("link");
      l.rel = "manifest"; l.href = STAMM + "manifest.json";
      document.head.appendChild(l);
    }
    /* Offline-Speicher: sw.js legt geöffnete Seiten auf dem Gerät ab. Braucht https oder localhost. */
    if ("serviceWorker" in navigator && window.isSecureContext) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register(STAMM + "sw.js", { scope: STAMM }).catch(() => { /* ohne Offline-Speicher weiter */ });
      });
    }
  }

  /* ---------- Zuletzt geöffnet ----------
     Gemerkt wird nur der Pfad von Materialien (biologie/klasse-…, geografie/klasse-…, interaktiv/), höchstens 8.
     Die Startseite zeigt nur Pfade, die in projects.json stehen. Nichts wird übertragen. */
  const KEY_ZULETZT = "lernportal.zuletzt";
  try {
    const stammPfad = STAMM ? new URL(STAMM).pathname : "";
    const pfad = stammPfad && location.pathname.indexOf(stammPfad) === 0
      ? location.pathname.slice(stammPfad.length).replace(/index\.html?$/i, "") : "";
    if (/^(biologie|geografie)\/klasse-[a-z0-9\-\/]+\/$|^interaktiv\/([a-z0-9\-\/]+\/)?$/.test(pfad) && pfad.length < 200) {
      let liste = JSON.parse(localStorage.getItem(KEY_ZULETZT) || "[]");
      liste = (Array.isArray(liste) ? liste : []).filter(e => e && typeof e.p === "string" && e.p !== pfad);
      liste.unshift({ p: pfad, t: Date.now() });
      localStorage.setItem(KEY_ZULETZT, JSON.stringify(liste.slice(0, 8)));
    }
  } catch (error) { /* Speicher nicht verfügbar: nichts merken */ }

  document.addEventListener("DOMContentLoaded", () => {
    const slot = document.querySelector("#prefs-slot");
    if (!slot) return;

    const groups = Object.keys(OPTIONS).map(key => `
      <fieldset>
        <legend>${LABELS[key]}</legend>
        <div class="segmented" data-pref="${key}">
          ${OPTIONS[key].map(([value, label]) =>
            `<button type="button" data-value="${value}" aria-pressed="${prefs[key] === value}">${label}</button>`).join("")}
        </div>
      </fieldset>`).join("");

    slot.innerHTML = `
      <button type="button" class="icon-btn" id="prefs-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="prefs-panel" aria-label="Lesemodus und Darstellung">Aa</button>
      <div class="prefs-panel" id="prefs-panel" role="dialog" aria-label="Lesemodus und Darstellung" hidden>
        <div class="prefs-head"><h2>Lesemodus</h2>
          <button type="button" class="icon-btn" id="prefs-close" aria-label="Schließen">&#10005;</button></div>
        ${groups}
        <button type="button" class="prefs-reset" id="prefs-reset">Zurücksetzen</button>
      </div>`;

    const button = slot.querySelector("#prefs-btn");
    const panel = slot.querySelector("#prefs-panel");

    function setOpen(open) {
      panel.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      if (open) panel.querySelector("button").focus();
    }
    function refresh() {
      panel.querySelectorAll("[data-pref]").forEach(group => {
        group.querySelectorAll("button").forEach(item => {
          item.setAttribute("aria-pressed", String(prefs[group.dataset.pref] === item.dataset.value));
        });
      });
    }

    button.addEventListener("click", () => setOpen(panel.hidden));
    slot.querySelector("#prefs-close").addEventListener("click", () => { setOpen(false); button.focus(); });
    slot.querySelector("#prefs-reset").addEventListener("click", () => {
      prefs = { ...DEFAULTS }; apply(prefs); statusFarbe(prefs); save(prefs); refresh();
    });
    panel.addEventListener("click", event => {
      const item = event.target.closest("[data-pref] button");
      if (!item) return;
      const key = item.parentElement.dataset.pref;
      if (!valid(key, item.dataset.value)) return;
      prefs[key] = item.dataset.value;
      apply(prefs); statusFarbe(prefs); save(prefs); refresh();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !panel.hidden) { setOpen(false); button.focus(); }
    });
    document.addEventListener("click", event => {
      if (!panel.hidden && !slot.contains(event.target)) setOpen(false);
    });
  });
})();
