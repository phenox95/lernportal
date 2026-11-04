/* Lernportal – Materialseite pro Thema.
   Liest den eigenen Eintrag aus projects.json (Feld "dateien") und zeigt die Dateien in Gruppen.
   Einbinden mit defer, NACH material.js. Quelle der Wahrheit ist projects.json, die Dateiliste steht nirgends sonst. */
(() => {
  "use strict";

  const body = document.body;
  const main = document.querySelector("main");
  if (!body || !main) return;

  const root = /^(\.\.\/|\.\/)+$/.test(body.dataset.root || "") ? body.dataset.root : "../";

  /* Gruppen in fester Reihenfolge; die Gruppe ergibt sich aus "art" */
  const GRUPPEN = [
    { id: "stunde", titel: "Zur Stunde", arten: ["Präsentation"] },
    { id: "arbeitsblatt", titel: "Arbeitsblätter", arten: ["Arbeitsblatt"] },
    { id: "ueben", titel: "Üben", arten: ["Übung", "Spiel"] },
    { id: "hilfe", titel: "Hilfen", arten: ["Hilfe"] },
    { id: "weitere", titel: "Weitere Materialien", arten: [] }
  ];
  const ICONS = {
    stunde: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
    arbeitsblatt: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    uebung: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    spiel: '<circle cx="12" cy="12" r="9.5"/><path d="m10 8 6 4-6 4z"/>',
    hilfe: '<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.2a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.5-2.8 4"/><path d="M12 17.5h.01"/>',
    weitere: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'
  };
  const NS = "http://www.w3.org/2000/svg";

  function fold(text) {
    return String(text || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }
  /* "Präsentation", "Praesentation" und "präsentation" gelten gleich */
  const schluessel = art => fold(art).replace(/ae/g, "a").replace(/ue/g, "u").replace(/oe/g, "o");
  function neu(tag, klasse, text) {
    const knoten = document.createElement(tag);
    if (klasse) knoten.className = klasse;
    if (text !== undefined) knoten.textContent = text;   // immer als Text, nie als HTML
    return knoten;
  }
  function symbol(name) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24"); svg.setAttribute("height", "24");
    svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.9"); svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
    svg.innerHTML = ICONS[name] || ICONS.weitere;       // feste, eigene Zeichenketten
    return svg;
  }

  /* nur relative Pfade (ohne "..") oder https:// zulassen; sonst null */
  function sicherer(pfad) {
    const wert = String(pfad || "").trim();
    if (!wert || /[\u0000-\u001f\\]/.test(wert)) return null;
    if (/^https:\/\//i.test(wert)) return wert;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(wert) || wert.startsWith("//")) return null;
    if (/(^|\/)\.\.(\/|$)/.test(wert)) return null;
    return root + wert.replace(/^\.?\//, "");
  }
  function gruppeVon(art) {
    const a = schluessel(art);
    const hit = GRUPPEN.find(g => g.arten.some(x => schluessel(x) === a));
    return hit ? hit.id : "weitere";
  }
  function symbolVon(art) {
    const a = schluessel(art);
    return { prasentation: "stunde", arbeitsblatt: "arbeitsblatt", ubung: "uebung", spiel: "spiel", hilfe: "hilfe" }[a] || "weitere";
  }
  function stufeVon(wert) {
    const n = Number(wert);
    return n === 1 || n === 2 || n === 3 ? n : 0;       // ungültig: ignorieren
  }
  const typVon = pfad => {
    const ohne = pfad.split(/[?#]/)[0];
    if (/\.pdf$/i.test(ohne)) return "pdf";
    if (/\/$/.test(ohne) || /\/index\.html?$/i.test(ohne)) return "anwendung";
    return "datei";
  };

  function eigenerEintrag(projekte) {
    const basis = new URL(root, location.href).pathname;
    let eigen = decodeURIComponent(location.pathname);
    if (eigen.startsWith(basis)) eigen = eigen.slice(basis.length);
    eigen = eigen.replace(/index\.html?$/i, "");
    if (eigen && !eigen.endsWith("/")) eigen += "/";
    const norm = p => { const s = String(p || "").trim().replace(/^\.?\//, ""); return s && !s.endsWith("/") ? s + "/" : s; };
    return projekte.find(p => p && norm(p.path) === eigen) || null;
  }

  function meldung(text, mitLink) {
    main.replaceChildren();
    const box = neu("div", "ms-meldung");
    box.appendChild(neu("p", "", text));
    if (mitLink) {
      const a = neu("a", "ms-link", "Gehe zurück zum Portal.");
      a.href = root;
      box.appendChild(a);
    }
    main.appendChild(box);
  }

  /* Kopf aktualisieren: material.js hat die Leiste schon gebaut, hier nur Texte und Fachfarbe setzen */
  function kopfSetzen(eintrag) {
    const titel = String(eintrag.title || "").trim() || "Material";
    const fach = eintrag.subject === "Biologie" || eintrag.subject === "Geografie" ? eintrag.subject : "";
    const klasse = String(eintrag.grade || "").trim();
    document.title = titel + " – Lernportal";
    if (fach) body.dataset.subject = fach; else delete body.dataset.subject;
    const zahlen = (klasse.match(/\d+/g) || []).map(Number);
    body.dataset.dichte = zahlen.length && zahlen.every(n => n >= 9) ? "9-10" : "7-8";
    const klassen = ["lp-bio", "lp-geo"];
    document.querySelectorAll(".lp-kopf, .lp-titelblock").forEach(el => {
      el.classList.remove(...klassen);
      if (fach) el.classList.add(fach === "Biologie" ? "lp-bio" : "lp-geo");
    });
    const h1 = document.querySelector(".lp-haupttitel");
    if (h1) h1.textContent = titel;
    const block = document.querySelector(".lp-titelblock-text");
    if (block) {
      let meta = block.querySelector(".lp-meta");
      if (!meta) { meta = neu("p", "lp-meta"); block.prepend(meta); }
      meta.replaceChildren();
      if (fach) meta.appendChild(neu("span", "lp-fach", fach));
      if (fach && klasse) meta.appendChild(document.createTextNode(" "));
      if (klasse) meta.appendChild(neu("span", "", klasse));
      meta.hidden = !fach && !klasse;
    }
  }

  function zeile(datei) {
    const typ = typVon(datei.url);
    const li = neu("li", "ms-zeile");
    li.appendChild(neu("span", "ms-symbol"));
    li.firstChild.appendChild(symbol(symbolVon(datei.art)));

    const text = neu("div", "ms-text");
    const kopf = neu("p", "ms-titel", datei.titel);
    if (datei.stufe) {
      kopf.appendChild(document.createTextNode(" "));
      kopf.appendChild(neu("span", "ms-niveau", "●".repeat(datei.stufe) + "○".repeat(3 - datei.stufe)))
        .setAttribute("aria-hidden", "true");
      kopf.appendChild(neu("span", "lp-sr", "Niveau " + datei.stufe + " von 3"));
    }
    text.appendChild(kopf);
    text.appendChild(neu("p", "ms-art", typ === "pdf" ? "PDF" : typ === "anwendung" ? "Öffnet im Browser" : "Datei"));
    li.appendChild(text);

    const aktionen = neu("div", "ms-aktionen");
    function link(label, extra) {
      const a = neu("a", "ms-btn", label);
      a.href = datei.url;
      if (extra) extra(a);
      aktionen.appendChild(a);
      return a;
    }
    if (typ === "pdf") {
      link("Ansehen", a => { a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", "Ansehen: " + datei.titel + " (öffnet in neuem Tab)"); });
      link("Herunterladen", a => { a.setAttribute("download", ""); a.setAttribute("aria-label", "Herunterladen: " + datei.titel); });
    } else if (typ === "anwendung") {
      link("Öffnen", a => a.setAttribute("aria-label", "Öffnen: " + datei.titel));
    } else {
      link("Öffnen", a => { a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", "Öffnen: " + datei.titel + " (neuer Tab)"); });
    }
    li.appendChild(aktionen);
    return li;
  }

  function zeigen(eintrag) {
    kopfSetzen(eintrag);
    const roh = Array.isArray(eintrag.dateien) ? eintrag.dateien : [];
    const dateien = roh.map(d => {
      if (!d || typeof d !== "object" || d.sichtbar === false) return null;
      const titel = typeof d.titel === "string" ? d.titel.trim() : "";
      const url = sicherer(d.pfad);
      if (!titel || !url) return null;
      return { titel, url, art: d.art, gruppe: gruppeVon(d.art), stufe: stufeVon(d.stufe) };
    }).filter(Boolean);

    main.replaceChildren();
    if (!dateien.length) { meldung("Zu diesem Thema gibt es noch keine Dateien.", true); return; }

    GRUPPEN.forEach(g => {
      const inGruppe = dateien.filter(d => d.gruppe === g.id);
      if (!inGruppe.length) return;
      const abschnitt = neu("section", "ms-gruppe");
      const h = neu("h2", "ms-gruppentitel", g.titel);
      h.id = "ms-" + g.id;
      abschnitt.appendChild(h);
      const ul = neu("ul", "ms-liste");
      ul.setAttribute("aria-labelledby", h.id);
      inGruppe.forEach(d => ul.appendChild(zeile(d)));
      abschnitt.appendChild(ul);
      main.appendChild(abschnitt);
    });

    if (dateien.some(d => d.gruppe === "ueben")) {
      const hinweis = neu("aside", "lp-hilfe ms-hinweis");
      hinweis.appendChild(neu("span", "lp-label", "Hinweis"));
      hinweis.appendChild(neu("p", "", "Dein Ergebnis bleibt nur auf diesem Gerät. Es wird nirgends gespeichert oder verschickt."));
      main.appendChild(hinweis);
    }

    const adresse = location.origin + location.pathname.replace(/index\.html?$/i, "");
    const fuss = neu("p", "ms-adresse");
    fuss.appendChild(document.createTextNode("Diese Seite: "));
    fuss.appendChild(neu("span", "ms-url", /^https?:/.test(location.protocol) ? adresse : location.pathname));
    main.appendChild(fuss);
  }

  fetch(root + "projects.json")
    .then(r => { if (!r.ok) throw new Error("projects.json nicht ladbar"); return r.json(); })
    .then(daten => {
      const eintrag = Array.isArray(daten) ? eigenerEintrag(daten) : null;
      if (!eintrag) { meldung("Zu dieser Seite gibt es keinen Eintrag in der Materialliste.", true); return; }
      zeigen(eintrag);
    })
    .catch(() => meldung("Die Materialien konnten nicht geladen werden.", true));
})();
