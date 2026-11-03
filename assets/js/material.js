/* Lernportal – Kopfleiste für Materialseiten.
   Einbinden mit defer, NACH prefs.js:
   <script src="…/assets/js/prefs.js"></script>
   <script src="…/assets/js/material.js" defer></script>
   Quelle der Angaben: data-Attribute am body (data-root, data-title, data-subject, data-grade). */
(() => {
  "use strict";

  const FACHKLASSE = { Biologie: "lp-bio", Geografie: "lp-geo", Interaktiv: "lp-neutral" };
  const PFEIL = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>';

  /* nur relative Wurzelpfade wie "../../../" zulassen, alles andere wird zu "./" */
  function wurzel(wert) {
    const w = String(wert || "");
    return /^(\.\.\/|\.\/)*$/.test(w) && w !== "" ? w : "./";
  }
  function neu(tag, klasse, text) {
    const knoten = document.createElement(tag);
    if (klasse) knoten.className = klasse;
    if (text !== undefined) knoten.textContent = text;   // immer als Text, nie als HTML
    return knoten;
  }

  function baue() {
    const body = document.body;
    if (!body || document.querySelector(".lp-kopf")) return;
    const d = body.dataset;

    const titel = (d.title || document.title || "Material").replace(/\s*[–-]\s*Lernportal\s*$/, "").trim() || "Material";
    const fach = Object.prototype.hasOwnProperty.call(FACHKLASSE, d.subject) ? d.subject : "";
    const klasse = (d.grade || "").trim();

    /* Dichte nach Jahrgang (nur auf Vorlagenseiten): 7–8 luftiger, 9–10 dichter */
    if (body.classList.contains("lp-seite") && !d.dichte) {
      const zahlen = (klasse.match(/\d+/g) || []).map(Number);
      body.dataset.dichte = zahlen.length && zahlen.every(n => n >= 9) ? "9-10" : "7-8";
    }

    const kopf = neu("header", "lp-kopf " + (FACHKLASSE[fach] || ""));
    const innen = neu("div", "lp-kopf-innen");

    const zurueck = neu("a", "lp-zurueck");
    zurueck.href = wurzel(d.root);
    zurueck.setAttribute("aria-label", "Zurück zum Portal");
    zurueck.innerHTML = PFEIL;                              // feste, eigene Zeichenkette
    zurueck.appendChild(neu("span", "lp-lang", "Zurück zum\u00A0"));
    zurueck.appendChild(neu("span", "", "Portal"));

    const block = neu("div", "lp-kopf-titel");
    const hatH1 = !!document.querySelector("h1");
    block.appendChild(neu(hatH1 ? "p" : "h1", "lp-titel", titel));
    const meta = neu("p", "lp-meta");
    if (fach) meta.appendChild(neu("span", "lp-fach", fach));
    if (fach && klasse) meta.appendChild(document.createTextNode(" "));   // Leerraum für Vorlesegeräte
    if (klasse) meta.appendChild(neu("span", "", klasse));
    if (meta.childNodes.length) block.appendChild(meta);

    const werkzeuge = neu("div", "lp-werkzeuge");
    werkzeuge.id = "prefs-slot";                            // prefs.js füllt diesen Platz

    innen.append(zurueck, block, werkzeuge);
    kopf.appendChild(innen);
    body.insertBefore(kopf, body.firstChild);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", baue);
  else baue();
})();
