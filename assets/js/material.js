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

    /* Vorlagenseiten (body.lp-seite): schmale Leiste (Zurück, Lesemodus) plus Titelblock mit Fachgrafik.
       Eingehängte Anwendungen: eine einzige schmale Leiste mit Titel, ohne Titelblock. */
    const mitBlock = body.classList.contains("lp-seite");

    const kopf = neu("header", "lp-kopf " + (FACHKLASSE[fach] || "") + (mitBlock ? " lp-schlank" : ""));
    const innen = neu("div", "lp-kopf-innen");

    const zurueck = neu("a", "lp-zurueck");
    zurueck.href = wurzel(d.root);
    zurueck.setAttribute("aria-label", "Zurück zum Portal");
    zurueck.innerHTML = PFEIL;                              // feste, eigene Zeichenkette
    zurueck.appendChild(neu("span", "lp-lang", "Zurück zum\u00A0"));
    zurueck.appendChild(neu("span", "", "Portal"));

    function metaZeile() {
      const meta = neu("p", "lp-meta");
      if (fach) meta.appendChild(neu("span", "lp-fach", fach));
      if (fach && klasse) meta.appendChild(document.createTextNode(" "));   // Leerraum für Vorlesegeräte
      if (klasse) meta.appendChild(neu("span", "", klasse));
      return meta.childNodes.length ? meta : null;
    }

    const werkzeuge = neu("div", "lp-werkzeuge");
    werkzeuge.id = "prefs-slot";                            // prefs.js füllt diesen Platz

    innen.appendChild(zurueck);
    if (!mitBlock) {
      const block = neu("div", "lp-kopf-titel");
      block.appendChild(neu(document.querySelector("h1") ? "p" : "h1", "lp-titel", titel));
      const meta = metaZeile();
      if (meta) block.appendChild(meta);
      innen.appendChild(block);
    }
    innen.appendChild(werkzeuge);
    kopf.appendChild(innen);
    body.insertBefore(kopf, body.firstChild);

    if (mitBlock) {
      const tb = neu("div", "lp-titelblock " + (fach === "Biologie" ? "lp-bio" : fach === "Geografie" ? "lp-geo" : ""));
      const tbInnen = neu("div", "lp-titelblock-innen");
      const meta = metaZeile();
      const textblock = neu("div", "lp-titelblock-text");
      if (meta) textblock.appendChild(meta);
      textblock.appendChild(neu("h1", "lp-haupttitel", titel));
      tbInnen.appendChild(textblock);

      /* Themenbild (optional): data-bild = Pfad relativ zum Repository-Stamm, nur Bilddateien.
         Ohne data-bild-alt gilt das Bild als Dekoration (alt=""). Lädt es nicht, verschwindet es. */
      if (/^[A-Za-z0-9_][A-Za-z0-9_\-./]*\.(webp|jpe?g|png)$/.test(d.bild || "") && !/\.\./.test(d.bild)) {
        const bild = neu("figure", "lp-titelbild");
        const img = document.createElement("img");
        img.src = wurzel(d.root) + d.bild;
        img.alt = d.bildAlt || "";
        img.width = 1200; img.height = 900; img.loading = "lazy";
        img.addEventListener("error", () => { bild.remove(); tb.classList.remove("lp-mit-bild"); });
        bild.appendChild(img);
        if (d.bildQuelle) bild.appendChild(neu("figcaption", "", d.bildQuelle));
        tbInnen.appendChild(bild);
        tb.classList.add("lp-mit-bild");
      }
      tb.appendChild(tbInnen);
      kopf.after(tb);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", baue);
  else baue();
})();
