(() => {
  const body = document.body;
  const root = body.dataset.root || "";           // "" auf der Startseite, "../" in Unterordnern
  const page = body.dataset.page || "home";        // home | fach | alle | themenfeld | bne
  const pageSubject = body.dataset.subject || "";  // nur auf Fachseiten
  const $ = selector => document.querySelector(selector);
  const GRADES = ["7", "8", "9", "10"];
  const INTERACTIVE = /interaktiv|spiel|simulation|quiz/i;
  const ART_TESTS = {
    "Präsentation": /präsentation/i,
    "Arbeitsblatt": /arbeitsblatt/i,
    "Lernmodul": /modul/i,
    "Interaktiv": INTERACTIVE
  };
  /* Welche Filterart eine Datei aus "dateien" (Feld art) mitbringt */
  const DATEI_FILTER = { "prasentation": "Präsentation", "arbeitsblatt": "Arbeitsblatt", "ubung": "Interaktiv", "spiel": "Interaktiv" };
  /* Reihenfolge und Wortformen der Inhaltsangabe in der Kartenzeile */
  const DATEI_ARTEN = [
    ["prasentation", "Präsentation", "Präsentationen"], ["arbeitsblatt", "Arbeitsblatt", "Arbeitsblätter"],
    ["ubung", "Übung", "Übungen"], ["spiel", "Spiel", "Spiele"], ["hilfe", "Hilfe", "Hilfen"]
  ];

  /* Symbole: lokal als Inline-SVG, keine externen Dateien */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    presentation: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
    layers: '<path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
    play: '<circle cx="12" cy="12" r="9.5"/><path d="m10 8 6 4-6 4z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    cell: '<circle cx="12" cy="12" r="9.5"/><circle cx="10" cy="11" r="3"/><circle cx="16" cy="16" r="1"/><circle cx="16" cy="8" r="1"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    cycle: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M8 16H3v5"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    dna: '<path d="M7 3c0 6 10 6 10 9s-10 3-10 9"/><path d="M17 3c0 6-10 6-10 9s10 3 10 9"/><path d="M8.5 7h7"/><path d="M8.5 17h7"/>',
    tree: '<path d="M12 21V11"/><path d="m12 11-6-5"/><path d="m12 14 6-6"/><circle cx="6" cy="5" r="1.6"/><circle cx="18" cy="7" r="1.6"/><circle cx="12" cy="3.5" r="1.6"/>',
    mountain: '<path d="m8 3 4 8 5-5 5 15H2z"/>',
    exchange: '<path d="m17 3 4 4-4 4"/><path d="M3 7h18"/><path d="m7 21-4-4 4-4"/><path d="M21 17H3"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5c2.8 2.7 4 5.9 4 9.5s-1.2 6.8-4 9.5c-2.8-2.7-4-5.9-4-9.5s1.2-6.8 4-9.5z"/>',
    scale: '<path d="M12 3v18"/><path d="M5 21h14"/><path d="M5 7h14"/><path d="m5 7-3 7a3.5 3.5 0 0 0 6 0z"/><path d="m19 7-3 7a3.5 3.5 0 0 0 6 0z"/>',
    drop: '<path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5z"/>',
    thermo: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
    network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="m12 7.5-6.2 9.2"/><path d="m12 7.5 6.2 9.2"/><path d="M7.5 19h9"/>',
    flag: '<path d="M5 22V3"/><path d="M5 4h13l-2 4 2 4H5"/>',
    photo: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L6 21"/>',
    /* eigene Symbole der 17 Nachhaltigkeitsziele (keine UN-Logos) */
    z1: '<circle cx="12" cy="12" r="9.5"/><path d="M14.6 9.2c-.6-1-1.6-1.5-2.7-1.5-1.5 0-2.6.8-2.6 2s1 1.7 2.8 2.1c1.7.4 2.7.9 2.7 2.1s-1.1 2-2.7 2c-1.2 0-2.3-.5-2.9-1.6"/><path d="M12 5.8v1.9M12 16.3v1.9"/>',
    z2: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 7c0-1 1-1.5 1-2.5M12 7c0-1 1-1.5 1-2.5M16 7c0-1 1-1.5 1-2.5"/>',
    z3: '<path d="M2 12h5l2.5-6 4 12 2.5-6H22"/>',
    z4: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
    z5: '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 9.5h9M7.5 14.5h9"/>',
    z6: '<path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5z"/>',
    z7: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    z8: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M3 13h18"/>',
    z9: '<path d="M3 21V10l6 4v-4l6 4V4h6v17z"/>',
    z10: '<path d="M12 3v18"/><path d="M5 21h14"/><path d="M5 7h14"/><path d="m5 7-3 7a3.5 3.5 0 0 0 6 0z"/><path d="m19 7-3 7a3.5 3.5 0 0 0 6 0z"/>',
    z11: '<rect x="3" y="10" width="7" height="11"/><rect x="10" y="3" width="11" height="18"/><path d="M14 8h3M14 12h3M14 16h3"/>',
    z12: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    z13: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
    z14: '<path d="M3 12c3-5 9-6 13-3l5-2v10l-5-2c-4 3-10 2-13-3z"/><circle cx="8" cy="11" r=".7"/>',
    z15: '<path d="M12 22v-7"/><path d="M12 15c-4 0-7-3-7-6.5C5 5.5 8 3 12 2c4 1 7 3.5 7 6.5 0 3.5-3 6.5-7 6.5z"/>',
    z16: '<circle cx="12" cy="12" r="9.5"/><path d="M12 2.5v19"/><path d="m12 12-6.7 6.7"/><path d="m12 12 6.7 6.7"/>',
    z17: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  function icon(name, size) {
    const px = size || 22;
    return `<svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;
  }
  function hydrateIcons() {
    document.querySelectorAll("[data-icon]").forEach(el => {
      if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 22);
    });
  }

  /* Hilfsfunktionen */
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }
  // Nur relative Pfade oder https-Links zulassen
  function resolvePath(path) {
    const value = String(path || "").trim();
    if (!value) return "#";
    if (/^(javascript|data|vbscript):/i.test(value)) return "#";
    if (/^https?:\/\//i.test(value)) return value;
    return root + value;
  }
  function fold(text) {
    return String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  const gradesOf = project => String(project.grade || "").match(/\d+/g) || [];
  const isVisible = project => project.sichtbar !== false;
  const countText = n => n + (n === 1 ? " Material" : " Materialien");

  /* Dateien eines Eintrags (optionales Feld "dateien"): nur gültige, sichtbare Zeilen mit Titel und sicherem Pfad */
  function safeFilePath(path) {
    const value = String(path || "").trim();
    if (!value || /[\u0000-\u001f\\]/.test(value)) return false;
    if (/^https:\/\//i.test(value)) return true;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(value) || value.startsWith("//")) return false;
    return !/(^|\/)\.\.(\/|$)/.test(value);
  }
  function dateienOf(project) {
    if (!Array.isArray(project.dateien)) return [];
    return project.dateien.filter(d => d && typeof d === "object" && d.sichtbar !== false
      && typeof d.titel === "string" && d.titel.trim() && safeFilePath(d.pfad));
  }
  /* "Präsentation", "Praesentation" und "präsentation" gelten gleich */
  const artKey = art => fold(art).replace(/ae/g, "a").replace(/ue/g, "u").replace(/oe/g, "o");
  function artMatches(project, art) {
    if (ART_TESTS[art].test(project.type || "")) return true;
    return dateienOf(project).some(d => DATEI_FILTER[artKey(d.art)] === art);
  }
  /* kurze Inhaltsangabe als reiner Text, z. B. "Präsentation · 2 Arbeitsblätter · Übung · Spiel" */
  function inhaltOf(project) {
    const files = dateienOf(project);
    const parts = DATEI_ARTEN.map(([key, one, many]) => {
      const n = files.filter(d => artKey(d.art) === key).length;
      return n ? (n === 1 ? one : n + " " + many) : "";
    });
    const other = files.filter(d => !DATEI_ARTEN.some(a => a[0] === artKey(d.art))).length;
    if (other) parts.push(other === 1 ? "Weiteres Material" : other + " weitere Materialien");
    return parts.filter(Boolean).join(" · ");
  }

  function typeIcon(project) {
    const type = project.type || "";
    if (INTERACTIVE.test(type)) return "play";
    if (/präsentation/i.test(type)) return "presentation";
    if (/modul/i.test(type)) return "layers";
    return "file";
  }
  function tileClass(project) {
    if (project.subject === "Biologie") return "bio";
    if (project.subject === "Geografie") return "geo";
    return "";
  }
  /* Material einer Zeile als kleine Symbol-Marken: Art der Anwendung (aus type) und Dateien aus "dateien".
     Niveau (Feld stufe) nur, wenn genau ein Arbeitsblatt vorhanden ist. */
  const CHIP_ICON = { prasentation: "presentation", arbeitsblatt: "file", ubung: "play", spiel: "play", hilfe: "layers" };
  function chipsOf(project) {
    const files = dateienOf(project);
    const type = String(project.type || "").trim();
    const hasPres = files.some(d => artKey(d.art) === "prasentation");
    const chips = [];
    const chip = (ic, text, extra) => chips.push(`<span class="chip">${icon(ic, 14)}<span>${escapeHtml(text)}</span>${extra || ""}</span>`);
    if (type && !/^materialseite$/i.test(type) && !(/präsentation/i.test(type) && hasPres)) {
      chip(/präsentation/i.test(type) ? "presentation" : INTERACTIVE.test(type) ? "play" : "layers", type);
    }
    DATEI_ARTEN.forEach(([key, one, many]) => {
      const list = files.filter(d => artKey(d.art) === key);
      if (!list.length) return;
      const stufe = list.length === 1 && [1, 2, 3].includes(list[0].stufe) ? list[0].stufe : 0;
      const extra = stufe ? `<span class="chip-niveau" aria-hidden="true">${"●".repeat(stufe)}${"○".repeat(3 - stufe)}</span><span class="sr-only">Niveau ${stufe} von 3</span>` : "";
      chip(CHIP_ICON[key], list.length === 1 ? one : list.length + " " + many, extra);
    });
    const other = files.filter(d => !DATEI_ARTEN.some(a => a[0] === artKey(d.art))).length;
    if (other) chip("layers", other === 1 ? "Weiteres Material" : other + " weitere Materialien");
    return chips.length ? `<span class="chips">${chips.join("")}</span>` : "";
  }
  /* Stundennummer einer Reihe: Feld folge, sonst "Stunde N" im Titel */
  const STUNDE_VORSATZ = /^.*?\bStunde\s+\d+\s*:\s*/i;
  function stundeNr(project) {
    if (Number.isFinite(project.folge)) return project.folge;
    const m = String(project.title || "").match(/\bStunde\s+(\d+)\s*:/i);
    return m ? Number(m[1]) : null;
  }
  /* Nummer nur, wenn sie zur Reihe gehört: Feld folge, oder "<Vorsatz> Stunde N:" im Titel, wenn der Vorsatz den Reihennamen enthält
     (so bleibt ein Titel mit anderem Vorsatz, z. B. "Fotosynthese – Stunde 1" in der Reihe "Zelle", ohne Nummer und mit vollem Titel) */
  function reihenNr(project, name) {
    if (Number.isFinite(project.folge)) return project.folge;
    const m = String(project.title || "").match(/^(.*?)\bStunde\s+(\d+)\s*:/i);
    return m && fold(m[1]).includes(fold(name)) ? Number(m[2]) : null;
  }
  /* opts.nr: Stundennummer statt Punkt (Reihe), opts.ohne: Felder, die der Reihenkopf schon nennt */
  function row(project, showSubject, opts) {
    opts = opts || {};
    const ohne = opts.ohne || [];
    const meta = [showSubject ? project.subject : "", ohne.includes("grade") ? "" : project.grade, ohne.includes("dauer") ? "" : project.dauer]
      .filter(Boolean).map(escapeHtml).join(" · ");
    const chips = chipsOf(project);
    const bne = bneText(project);
    const badge = project.status ? `<span class="badge">${escapeHtml(project.status)}</span>` : "";
    const nr = opts.nr;
    const kurz = nr != null && STUNDE_VORSATZ.test(project.title) ? String(project.title).replace(STUNDE_VORSATZ, "") : project.title;
    const vorsatz = nr != null ? `<span class="sr-only">Stunde ${nr}: </span>` : "";
    const lead = nr != null ? `<span class="numeral row-nr" aria-hidden="true">${nr}</span>` : `<span class="dot ${tileClass(project)}" aria-hidden="true"></span>`;
    return `
      <a class="row" href="${escapeHtml(resolvePath(project.path))}">
        ${lead}
        <span class="row-main">
          <span class="row-title">${vorsatz}${escapeHtml(kurz)}${badge}</span>${meta ? `
          <span class="row-meta">${meta}</span>` : ""}${chips}${bne ? `
          <span class="row-meta">Nachhaltigkeit: ${escapeHtml(bne)}</span>` : ""}
        </span>
        <span class="row-chev">${icon("chevron", 20)}</span>
      </a>`;
  }
  function textMatches(project, query) {
    const tokens = fold(query).split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    const haystack = fold([project.title, project.description, project.reihe, themeOf(project), project.subject, project.type, project.grade,
      bneOf(project).length ? "bne nachhaltigkeit " + bneText(project) : "",
      dateienOf(project).map(d => d.titel + " " + (d.art || "")).join(" ")].join(" "));
    return tokens.every(token => haystack.includes(token));
  }

  let projects = [];
  let themenfelder = {};   // themenfelder.json (RLP-Themenfelder je Fach), optional
  let bneZiele = [];       // bne.json (17 Nachhaltigkeitsziele), optional

  function tfList(subject) {
    return Array.isArray(themenfelder[subject]) ? themenfelder[subject] : [];
  }
  function tfLabel(tf) { return tf.nr + " " + tf.titel; }
  /* Themenfeld eines Materials: Nummer ("3.1") wird zum offiziellen Titel aufgelöst, freier Text bleibt wie er ist */
  function themeOf(project) {
    const raw = String(project.themenfeld || "").trim();
    if (!raw) return "";
    const nr = raw.match(/^(\d+\.\d+)(?!\d)/);
    if (nr) {
      const hit = tfList(project.subject).find(tf => tf.nr === nr[1]);
      if (hit) return tfLabel(hit);
    }
    return raw;
  }
  /* BNE (optionales Feld "bne": Liste von Zielnummern 1–17) und Verweise (optionales Feld "verweise") */
  function bneZiel(nr) { return bneZiele.find(z => z.nr === nr) || null; }
  function bneOf(project) {
    if (!Array.isArray(project.bne)) return [];
    const nrs = project.bne.map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 17);
    return [...new Set(nrs)].sort((a, b) => a - b);
  }
  function bneText(project) {
    return bneOf(project).map(n => { const z = bneZiel(n); return z ? z.kurz : "Ziel " + n; }).join(" · ");
  }
  const normPath = p => { const v = String(p || "").trim().replace(/^\.?\//, ""); return v && !v.endsWith("/") ? v + "/" : v; };
  function verweiseOf(project) {
    if (!Array.isArray(project.verweise)) return [];
    return project.verweise.map(v => typeof v === "string" ? { pfad: v } : v)
      .filter(v => v && typeof v === "object" && typeof v.pfad === "string" && v.pfad.trim())
      .map(v => ({ pfad: normPath(v.pfad), grund: typeof v.grund === "string" ? v.grund.trim() : "" }));
  }
  /* Verwandte Materialien: eigene Verweise, Verweise anderer auf dieses Material (wechselseitig)
     und Materialien des anderen Fachs mit gemeinsamem Nachhaltigkeitsziel */
  function relatedOf(project) {
    const me = normPath(project.path);
    const out = new Map();
    const add = (p, grund) => {
      if (!p || p === project || !isVisible(p) || out.has(normPath(p.path))) return;
      out.set(normPath(p.path), { project: p, grund });
    };
    verweiseOf(project).forEach(v => add(projects.find(p => normPath(p.path) === v.pfad), v.grund));
    projects.forEach(p => { const v = verweiseOf(p).find(x => x.pfad === me); if (v) add(p, v.grund); });
    const mine = bneOf(project);
    if (mine.length && (project.subject === "Biologie" || project.subject === "Geografie")) {
      projects.forEach(p => {
        if (p.subject === project.subject || (p.subject !== "Biologie" && p.subject !== "Geografie")) return;
        const shared = bneOf(p).filter(n => mine.includes(n));
        if (shared.length) add(p, "Gemeinsames Ziel: " + shared.map(n => { const z = bneZiel(n); return z ? z.kurz : "Ziel " + n; }).join(", "));
      });
    }
    return [...out.values()];
  }
  const state = { subject: "Alle", grade: "Alle", art: "Alle", theme: "Alle", bne: "Alle", query: "" };

  function matches(project) {
    if (!isVisible(project)) return false;
    const subject = pageSubject || state.subject;
    if (subject !== "Alle" && project.subject !== subject) return false;
    if (state.grade !== "Alle" && !gradesOf(project).includes(state.grade)) return false;
    if (state.art !== "Alle" && !(ART_TESTS[state.art] && artMatches(project, state.art))) return false;
    if (state.theme !== "Alle" && themeOf(project) !== state.theme) return false;
    if (state.bne !== "Alle" && !bneOf(project).includes(Number(state.bne))) return false;
    return textMatches(project, state.query);
  }

  /* ---------- Startseite ---------- */
  function initHome() {
    const visible = projects.filter(isVisible);
    document.querySelectorAll("[data-fach]").forEach(tile => {
      const n = visible.filter(p => p.subject === tile.dataset.fach).length;
      tile.querySelector("[data-count]").textContent = countText(n);
    });
    document.querySelectorAll("[data-grade]").forEach(item => {
      const n = visible.filter(p => gradesOf(p).includes(item.dataset.grade)).length;
      item.querySelector("[data-count]").textContent = countText(n);
    });

    const input = $("#q");
    const results = $("#search-results");
    input.addEventListener("input", () => {
      const query = input.value.trim();
      if (!query) { results.hidden = true; results.innerHTML = ""; return; }
      const found = visible.filter(p => textMatches(p, query));
      results.hidden = false;
      results.innerHTML = found.length
        ? `<div class="group">${found.slice(0, 8).map(p => row(p, true)).join("")}</div>`
        : '<p class="empty-message">Dazu gibt es noch kein Material. Versuche ein anderes Wort.</p>';
    });
  }

  /* Impuls der Woche: entweder ein einzelner Impuls (frage, bild, link) oder ein Wochenplan "wochen".
     Im Plan gilt der letzte Eintrag, dessen Datum "ab" erreicht ist. Mit ?impuls=2026-11-23 lässt sich eine Woche ansehen. */
  function impulsWoche(data) {
    if (!Array.isArray(data.wochen) || !data.wochen.length) return data;
    const preview = new URLSearchParams(location.search).get("impuls");
    const today = /^\d{4}-\d{2}-\d{2}$/.test(preview || "") ? preview : new Date().toISOString().slice(0, 10);
    const wochen = data.wochen.filter(w => w && w.frage).sort((x, y) => String(x.ab || "").localeCompare(String(y.ab || "")));
    const aktuell = wochen.filter(w => !w.ab || String(w.ab) <= today).pop() || wochen[0];
    return aktuell ? Object.assign({ label: data.label }, aktuell) : null;
  }

  function initImpuls() {
    const section = $("#impuls");
    if (!section) return;
    Promise.all([
      fetch(root + "impuls.json").then(response => (response.ok ? response.json() : null)),
      fetch(root + "bne.json").then(r => (r.ok ? r.json() : {})).catch(() => ({}))
    ])
      .then(([raw, bne]) => {
        const data = raw && raw.aktiv === true ? impulsWoche(raw) : null;
        if (!data || !data.frage) return;
        const ziele = bne && Array.isArray(bne.ziele) ? bne.ziele : [];
        const zielNrs = (Array.isArray(data.bne) ? data.bne : []).map(Number).filter(n => ziele.some(z => z.nr === n));
        const erstes = ziele.find(z => z.nr === zielNrs[0]);
        const label = [data.label || "Impuls der Woche", data.klasse].filter(Boolean).map(escapeHtml).join(" · ");
        const media = data.bild
          ? `<img src="${escapeHtml(resolvePath(data.bild))}" alt="${escapeHtml(data.bildAlt || "")}" loading="lazy">`
          : erstes
            ? `<div class="impuls-ziel">${icon("z" + erstes.nr, 56)}<span class="impuls-ziel-nr">Ziel ${erstes.nr}</span><span>${escapeHtml(erstes.kurz)}</span></div>`
            : `<div class="impuls-placeholder">${icon("photo", 32)}<span>Platz für eigenes Foto</span></div>`;
        const caption = data.bildQuelle ? `<p class="impuls-caption">${escapeHtml(data.bildQuelle)}</p>` : "";
        const chips = zielNrs.length ? `<p class="impuls-ziele">${zielNrs.map(n => { const z = ziele.find(x => x.nr === n); return `<a class="tz-chip" href="${root}bne/?ziel=${n}"><span class="z-badge" aria-hidden="true">${n}</span>${escapeHtml(z.kurz)}<span class="sr-only"> (Nachhaltigkeitsziel ${n})</span></a>`; }).join("")}</p>` : "";
        const erklaerung = data.erklaerung ? `<div class="impuls-erkl"><p class="label">Kurz erklärt</p><p>${escapeHtml(data.erklaerung)}</p></div>` : "";
        const mats = (Array.isArray(data.material) ? data.material : []).map(pfad => {
          const proj = projects.find(p => p.path === pfad);
          return proj ? `<a class="impuls-link" href="${escapeHtml(resolvePath(proj.path))}">${escapeHtml(proj.title)} ${icon("arrow", 18)}</a>` : "";
        }).filter(Boolean);
        if (!mats.length && data.link) mats.push(`<a class="impuls-link" href="${escapeHtml(resolvePath(data.link))}">Material öffnen ${icon("arrow", 18)}</a>`);
        const material = mats.length ? `<div class="impuls-material"><p class="label">Material</p>${mats.join("")}</div>` : "";
        section.innerHTML = `
          <p class="label">${label}</p>
          <div class="impuls">
            <div><div class="impuls-media">${media}</div>${caption}</div>
            <div class="impuls-body"><p class="impuls-q">${escapeHtml(data.frage)}</p>${chips}${erklaerung}${material}</div>
          </div>`;
        section.hidden = false;
      })
      .catch(() => {});
  }

  /* ---------- Fach- und Materialseiten ---------- */
  const list = $("#project-list");
  const counter = $("#result-count");

  function renderList() {
    const visible = projects.filter(matches);
    const filtering = state.grade !== "Alle" || state.art !== "Alle" || state.theme !== "Alle" || state.bne !== "Alle" || state.query.trim() !== "";
    const hide = page === "fach" && !filtering;
    counter.hidden = hide;
    list.hidden = hide;
    counter.textContent = countText(visible.length);
    list.innerHTML = visible.length
      ? `<div class="group">${visible.map(p => row(p, page === "alle")).join("")}</div>`
      : '<p class="empty-message">Für diese Auswahl gibt es noch kein Material.</p>';
  }

  /* Themenfeld-Auswahl: erst alle offiziellen Themenfelder des Fachs (auch ohne Material), dann weitere Schreibweisen aus projects.json */
  function buildThemes() {
    const select = $("#filter-theme");
    const themeRow = $("#theme-field");
    if (!select) return;
    const subject = pageSubject || state.subject;
    const subjects = subject === "Alle" ? ["Biologie", "Geografie"] : [subject];
    const visible = projects.filter(isVisible);
    const known = new Set();
    const option = (label, n) =>
      `<option value="${escapeHtml(label)}"${label === state.theme ? " selected" : ""}>${escapeHtml(label)}${n === undefined ? "" : " (" + n + ")"}</option>`;
    const groups = subjects.map(sub => ({
      subject: sub,
      options: tfList(sub).map(tf => {
        const label = tfLabel(tf);
        known.add(label);
        return option(label, visible.filter(p => p.subject === sub && themeOf(p) === label).length);
      })
    })).filter(g => g.options.length);
    const extra = [...new Set(visible
      .filter(p => p.themenfeld && (subject === "Alle" || p.subject === subject))
      .map(themeOf).filter(t => t && !known.has(t)))].sort((a, b) => a.localeCompare(b, "de"));
    const values = [...known, ...extra];
    if (!values.includes(state.theme)) state.theme = "Alle";
    const parts = ['<option value="Alle">Alle Themenfelder</option>'];
    groups.forEach(g => parts.push(subjects.length > 1
      ? `<optgroup label="${escapeHtml(g.subject)}">${g.options.join("")}</optgroup>` : g.options.join("")));
    if (extra.length) parts.push(`<optgroup label="Weitere">${extra.map(t => option(t)).join("")}</optgroup>`);
    select.innerHTML = parts.join("");
    themeRow.hidden = !values.length;
  }

  /* BNE-Auswahl: alle 17 Ziele, Zähler passend zum gewählten Fach */
  function buildBne() {
    const select = $("#filter-bne");
    const field = $("#bne-field");
    if (!select) return;
    if (!bneZiele.length) { if (field) field.hidden = true; return; }
    const subject = pageSubject || state.subject;
    const visible = projects.filter(p => isVisible(p) && (subject === "Alle" || p.subject === subject));
    select.innerHTML = '<option value="Alle">Alle Ziele</option>' + bneZiele.map(z =>
      `<option value="${z.nr}"${String(z.nr) === state.bne ? " selected" : ""}>${escapeHtml(z.nr + " " + z.kurz)} (${visible.filter(p => bneOf(p).includes(z.nr)).length})</option>`).join("");
    if (field) field.hidden = false;
  }

  /* Überblick über die Themenfelder des Fachs (nur Fachseiten): Klick wählt das Themenfeld im Filter */
  function renderThemenfelder() {
    const box = $("#themenfelder");
    if (!box || !pageSubject) return;
    const items = tfList(pageSubject);
    if (!items.length) { box.hidden = true; return; }
    const visible = projects.filter(isVisible);
    const groups = ["7/8", "9/10"].map(k => ({ k, items: items.filter(tf => tf.klassen === k) })).filter(g => g.items.length);
    box.innerHTML = `<p class="label">Themenfelder nach Rahmenlehrplan</p>` + groups.map(g => `
      <div class="tf-group" role="group" aria-label="Klasse ${escapeHtml(g.k)}">
        <p class="tf-head">Klasse ${escapeHtml(g.k)}</p>
        ${g.items.map(tf => {
          const n = visible.filter(p => p.subject === pageSubject && themeOf(p) === tfLabel(tf)).length;
          const href = root + "themenfeld/?fach=" + encodeURIComponent(pageSubject) + "&nr=" + encodeURIComponent(tf.nr);
          return `<a class="tf-row" href="${escapeHtml(href)}" aria-label="${escapeHtml(tf.nr + " " + tf.titel)}">
            <span class="tf-top" data-tf-fach="${escapeHtml(pageSubject)}" data-tf-nr="${escapeHtml(tf.nr)}"><span class="tf-icon">${icon(tf.icon, 22)}</span><span class="tf-nr">${escapeHtml(tf.nr)}</span></span>
            <span class="tf-title">${escapeHtml(tf.kurz || tf.titel)}</span>
            <span class="tf-count">${n ? countText(n) : "Noch kein Material"}</span>
          </a>`;
        }).join("")}
      </div>`).join("");
    box.hidden = false;
  }

  function setPressed(group, value) {
    group.querySelectorAll("button").forEach(button =>
      button.setAttribute("aria-pressed", String(button.dataset.value === value)));
  }

  function initList() {
    const params = new URLSearchParams(location.search);
    const grade = params.get("klasse");
    if (GRADES.includes(grade)) state.grade = grade;
    const fach = params.get("fach");
    if (page === "alle" && (fach === "Biologie" || fach === "Geografie")) state.subject = fach;
    const bne = params.get("bne");
    if (/^\d{1,2}$/.test(bne || "") && Number(bne) >= 1 && Number(bne) <= 17) state.bne = String(Number(bne));

    const gradeControl = $("#grade-control");
    const subjectControl = $("#subject-control");
    setPressed(gradeControl, state.grade);
    if (subjectControl) setPressed(subjectControl, state.subject);

    gradeControl.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      state.grade = button.dataset.value;
      setPressed(gradeControl, state.grade);
      renderList();
    });
    if (subjectControl) {
      subjectControl.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        state.subject = button.dataset.value;
        setPressed(subjectControl, state.subject);
        buildThemes();
        buildBne();
        renderList();
      });
    }
    $("#filter-art").addEventListener("change", event => { state.art = event.target.value; renderList(); });
    $("#filter-theme").addEventListener("change", event => { state.theme = event.target.value; renderList(); });
    const bneSelect = $("#filter-bne");
    if (bneSelect) bneSelect.addEventListener("change", event => { state.bne = event.target.value; renderList(); });
    $("#q").addEventListener("input", event => { state.query = event.target.value; renderList(); });

    buildThemes();
    buildBne();
    renderThemenfelder();
    renderList();
  }

  /* ---------- Themenfeld-Seite: ?fach=Geografie&nr=3.1 ---------- */
  function initThemenfeld() {
    const params = new URLSearchParams(location.search);
    const fach = params.get("fach") === "Biologie" ? "Biologie" : "Geografie";
    const tf = tfList(fach).find(t => t.nr === params.get("nr"));
    const back = $("#tf-back");
    back.href = root + fach.toLowerCase() + "/";
    back.lastChild.textContent = fach;
    $("#tf-eyebrow").textContent = fach + (tf ? " · Klasse " + tf.klassen : "");
    document.body.dataset.subject = fach;
    if (!tf) {
      $("#tf-title").textContent = "Themenfeld nicht gefunden";
      list.innerHTML = '<p class="empty-message">Dieses Themenfeld gibt es nicht. Bitte die Fachseite öffnen.</p>';
      return;
    }
    document.title = tf.kurz + " – Lernportal";
    $("#tf-icon").innerHTML = icon(tf.icon, 28);
    $("#tf-icon").dataset.tfFach = fach; $("#tf-icon").dataset.tfNr = tf.nr;
    $("#tf-title").textContent = tf.kurz;
    $("#tf-full").textContent = tf.nr + " " + tf.titel + [tf.verbund, tf.hinweis].filter(Boolean).map(x => " · " + x).join("");
    const items = projects.filter(p => isVisible(p) && p.subject === fach && themeOf(p) === tfLabel(tf));
    counter.textContent = items.length ? countText(items.length) : "";
    list.innerHTML = items.length ? reihenListe(items) : '<p class="empty-message">Für dieses Themenfeld gibt es noch kein Material.</p>';
    renderVerbindungen(tf, fach, items);
  }

  /* Materialien eines Themenfelds nach Unterrichtsreihe (Sequenz) gruppiert, mit den Zielen der Reihe */
  function reihenListe(items) {
    /* optionales Feld "folge" (Zahl): Reihenfolge innerhalb einer Reihe, Einträge ohne folge behalten ihre Reihenfolge */
    const key = p => Number.isFinite(p.folge) ? p.folge : Infinity;
    items = [...items].sort((a, b) => key(a) === key(b) ? 0 : key(a) < key(b) ? -1 : 1);
    const namen = [...new Set(items.map(p => String(p.reihe || "").trim()).filter(Boolean))];
    if (!namen.length) return `<div class="group">${items.map(p => row(p, false)).join("")}</div>`;
    const gruppe = (titel, mine, name) => {
      const nrs = [...new Set(mine.flatMap(bneOf))].sort((a, b) => a - b);
      const ziele = nrs.length ? `<span class="reihe-ziele">${nrs.map(n => `<a class="reihe-ziel" href="${root}bne/?ziel=${n}" aria-label="Nachhaltigkeitsziel ${n} ${escapeHtml((bneZiel(n) || {}).kurz || "")}">${n}</a>`).join("")}</span>` : "";
      /* Klasse und Dauer einmal im Kopf, wenn sie bei allen Einträgen gleich sind */
      const gleich = f => mine.length > 1 && mine.every(p => p[f] && p[f] === mine[0][f]);
      const ohne = ["grade", "dauer"].filter(gleich);
      const kopfMeta = [countText(mine.length), ...ohne.map(f => mine[0][f])].map(escapeHtml).join(" · ");
      return `<section class="reihe"><div class="reihe-kopf"><h2 class="reihe-titel">${escapeHtml(titel)}</h2><span class="reihe-zahl">${kopfMeta}</span>${ziele}</div>
        <div class="group">${mine.map(p => row(p, false, { nr: name ? reihenNr(p, name) : null, ohne })).join("")}</div></section>`;
    };
    const parts = namen.map(n => gruppe("Reihe: " + n, items.filter(p => String(p.reihe || "").trim() === n), n));
    const ohne = items.filter(p => !String(p.reihe || "").trim());
    if (ohne.length) parts.push(gruppe("Einzelne Stunden", ohne, ""));
    return parts.join("");
  }

  /* Verbindungen eines Themenfelds: Feld "bezuege" in themenfelder.json, wechselseitig aufgelöst
     (steht die Verbindung nur an einem Themenfeld, erscheint sie an beiden) */
  function bezuegeOf(fach, tf) {
    const out = new Map();
    const add = (f, nr, grund) => {
      const ziel = tfList(f).find(t => t.nr === String(nr));
      const key = f + "|" + nr;
      if (!ziel || out.has(key) || (f === fach && ziel.nr === tf.nr)) return;
      out.set(key, { fach: f, tf: ziel, grund: typeof grund === "string" ? grund.trim() : "" });
    };
    (Array.isArray(tf.bezuege) ? tf.bezuege : []).forEach(b => b && typeof b === "object" && add(b.fach, b.nr, b.grund));
    ["Biologie", "Geografie"].forEach(f => tfList(f).forEach(t => {
      (Array.isArray(t.bezuege) ? t.bezuege : []).forEach(b => {
        if (b && b.fach === fach && String(b.nr) === tf.nr) add(f, t.nr, b.grund);
      });
    }));
    return [...out.values()];
  }

  /* Vernetzungskarte: links das Themenfeld, rechts Äste zu verbundenen Themenfeldern und Nachhaltigkeitszielen */
  function renderVerbindungen(tf, fach, items) {
    const box = $("#tf-verbindungen");
    if (!box) return;
    const links = bezuegeOf(fach, tf);
    const zaehler = new Map();
    items.forEach(p => bneOf(p).forEach(n => zaehler.set(n, (zaehler.get(n) || 0) + 1)));
    const nrs = [...zaehler.keys()].sort((a, b) => a - b);
    if (!links.length && !nrs.length) { box.hidden = true; return; }

    const mitte = `<div class="vn-mitte"><span class="tf-icon" data-tf-fach="${escapeHtml(fach)}" data-tf-nr="${escapeHtml(tf.nr)}">${icon(tf.icon, 24)}</span>
      <span class="vn-name">${escapeHtml(tf.kurz || tf.titel)}</span><span class="vn-sub">${escapeHtml(fach + " " + tf.nr)}</span></div>`;
    const ast = (inner, klasse) => `<li class="vn-ast ${klasse}">${inner}</li>`;
    const tfAeste = links.map(l => {
      const href = root + "themenfeld/?fach=" + encodeURIComponent(l.fach) + "&nr=" + encodeURIComponent(l.tf.nr);
      return ast(`<a class="vn-knoten" href="${escapeHtml(href)}">
        <span class="tf-icon" data-tf-fach="${escapeHtml(l.fach)}" data-tf-nr="${escapeHtml(l.tf.nr)}">${icon(l.tf.icon, 22)}</span>
        <span class="vn-text"><span class="vn-name">${escapeHtml(l.tf.kurz || l.tf.titel)}</span>
        <span class="vn-sub">${escapeHtml(l.fach + " " + l.tf.nr)}${l.fach !== fach ? " · anderes Fach" : ""}</span>
        ${l.grund ? `<span class="vn-grund">${escapeHtml(l.grund)}</span>` : ""}</span></a>`, "vn-tf");
    });
    const bneAeste = nrs.map(n => {
      const z = bneZiel(n);
      return ast(`<a class="vn-knoten" href="${root}bne/?ziel=${n}">
        <span class="tf-icon">${icon("z" + n, 22)}</span>
        <span class="vn-text"><span class="vn-name">${escapeHtml(z ? z.kurz : "Ziel " + n)}</span>
        <span class="vn-sub">Ziel ${n} · Nachhaltigkeit · ${countText(zaehler.get(n))} hier</span></span></a>`, "vn-bne");
    });
    box.innerHTML = `<h2 class="vn-titel">Vernetzung</h2>
      <div class="vn">${mitte}<ul class="vn-aeste">${tfAeste.join("")}${bneAeste.join("")}</ul></div>
      <p class="vn-legende">Oben verbundene Themenfelder, darunter Nachhaltigkeitsziele (BNE) der Materialien dieses Themenfelds.</p>`;
    box.hidden = false;
  }

  /* Nach Themenfeld: nur Themenfelder mit Material, je Zeile die Ziele als Chips (Zahl in Fachfarbe, Name daneben) */
  function bneNachThemenfeld(visible) {
    const gruppen = ["Biologie", "Geografie"].map(f => {
      const zeilen = tfList(f).map(tf => {
        const mine = visible.filter(p => p.subject === f && themeOf(p) === tfLabel(tf));
        const nrs = [...new Set(mine.flatMap(bneOf))].sort((x, y) => x - y);
        if (!nrs.length) return "";
        const href = root + "themenfeld/?fach=" + encodeURIComponent(f) + "&nr=" + encodeURIComponent(tf.nr);
        const chips = nrs.map(n => {
          const z = bneZiel(n);
          return `<a class="tz-chip" href="?ziel=${n}"><span class="z-badge ${f === "Biologie" ? "bio" : "geo"}" aria-hidden="true">${n}</span>${escapeHtml(z ? z.kurz : "Ziel " + n)}<span class="sr-only"> (Ziel ${n}, ${escapeHtml(f)})</span></a>`;
        }).join("");
        return `<div class="tz-zeile"><a class="tz-tf" href="${escapeHtml(href)}"><span class="tf-icon" data-tf-fach="${escapeHtml(f)}" data-tf-nr="${escapeHtml(tf.nr)}">${icon(tf.icon, 18)}</span><span>${escapeHtml(tf.nr + " " + (tf.kurz || tf.titel))}</span></a><span class="tz-chips">${chips}</span></div>`;
      }).join("");
      return zeilen ? `<p class="label">${escapeHtml(f)}</p><div class="group">${zeilen}</div>` : "";
    }).join("");
    return gruppen ? `<h2 class="bne-h">Nach Themenfeld</h2><p class="bne-sub">Diese Themenfelder haben schon Material mit Bezug zu den Zielen.</p>${gruppen}` : "";
  }

  /* ---------- BNE-Seite: Einstieg, Fragen und klickbare Grafik der Ziele; mit ?ziel=13 die Materialien beider Fächer ---------- */
  function zielMaterial(visible, nr) {
    const mine = visible.filter(p => bneOf(p).includes(nr));
    return { all: mine, bio: mine.filter(p => p.subject === "Biologie").length, geo: mine.filter(p => p.subject === "Geografie").length };
  }

  /* Grafik: 17 Kacheln (Symbol, Nummer, Kurzname, Zähler je Fach) plus eine Kachel „Alle Materialien“ */
  function bneGrafik(visible) {
    const kacheln = bneZiele.map(z => {
      const m = zielMaterial(visible, z.nr);
      const zaehler = m.all.length
        ? `<span class="z-zaehler">${m.bio ? `<span class="z-badge bio" aria-hidden="true">${m.bio}</span>` : ""}${m.geo ? `<span class="z-badge geo" aria-hidden="true">${m.geo}</span>` : ""}</span>`
        : '<span class="z-zaehler z-leer" aria-hidden="true">noch nichts</span>';
      const sr = m.all.length ? [m.bio ? "Biologie " + m.bio : "", m.geo ? "Geografie " + m.geo : ""].filter(Boolean).join(", ") : "noch kein Material";
      return `<li><a class="z-kachel${m.all.length ? " hat" : ""}" href="?ziel=${z.nr}" aria-label="${escapeHtml("Ziel " + z.nr + ": " + z.titel + ", " + sr)}">
        <span class="z-kopf"><span class="z-icon">${icon("z" + z.nr, 28)}</span><span class="z-nr" aria-hidden="true">${z.nr}</span></span>
        <span class="z-name" aria-hidden="true">${escapeHtml(z.kurz)}</span>${zaehler}</a></li>`;
    });
    kacheln.push(`<li><a class="z-kachel z-alle" href="${root}alle/">
      <span class="z-kopf"><span class="z-icon">${icon("layers", 28)}</span></span><span class="z-name">Alle Materialien</span><span class="z-zaehler">ansehen</span></a></li>`);
    return `<ul class="z-grid">${kacheln.join("")}</ul>`;
  }

  function initBne() {
    const params = new URLSearchParams(location.search);
    const raw = params.get("ziel");
    const nr = /^\d{1,2}$/.test(raw || "") ? Number(raw) : 0;
    const visible = projects.filter(isVisible);
    const head = $("#bne-title"), lead = $("#bne-lead"), back = $("#bne-back");
    const overview = $("#bne-overview");
    if (!bneZiele.length) { list.innerHTML = '<p class="empty-message">Die Nachhaltigkeitsziele konnten nicht geladen werden. Bitte bne.json prüfen.</p>'; if (overview) overview.hidden = true; return; }
    const ziel = bneZiel(nr);
    if (ziel) {
      if (overview) overview.hidden = true;
      const eyebrow = $("#bne-eyebrow"); if (eyebrow) eyebrow.textContent = "Nachhaltigkeit (BNE) · Ziel " + ziel.nr;
      document.title = "Ziel " + ziel.nr + " " + ziel.kurz + " – Lernportal";
      head.textContent = ziel.kurz;
      lead.textContent = ziel.frage || ziel.titel;
      back.href = "./"; back.lastChild.textContent = "Alle Ziele";
      const found = visible.filter(p => bneOf(p).includes(nr));
      counter.textContent = found.length ? countText(found.length) : "";
      const groups = ["Biologie", "Geografie"].map(f => ({ f, items: found.filter(p => p.subject === f) })).filter(g => g.items.length);
      const rest = found.filter(p => p.subject !== "Biologie" && p.subject !== "Geografie");
      if (rest.length) groups.push({ f: "Weitere", items: rest });
      const titel = `<p class="label">Ziel ${ziel.nr} der UN: ${escapeHtml(ziel.titel)}</p>`;
      list.innerHTML = titel + (groups.length
        ? groups.map(g => `<p class="label">${escapeHtml(g.f)}</p><div class="group">${g.items.map(p => row(p, false)).join("")}</div>`).join("")
        : '<p class="empty-message">Für dieses Ziel gibt es noch kein Material.</p>');
      return;
    }
    counter.textContent = "";
    list.innerHTML = "";

    const grafik = $("#bne-grafik");
    if (grafik) grafik.innerHTML = bneGrafik(visible);
    const legende = $("#bne-legende");
    if (legende) legende.innerHTML = 'Tippe ein Ziel an. Die Zahl zeigt, wie viel Material es gibt: <span class="z-z"><span class="z-badge bio" aria-hidden="true">1</span>Biologie</span> <span class="z-z"><span class="z-badge geo" aria-hidden="true">1</span>Geografie</span>';

    /* Zieljahr: aus dem aktuellen Jahr berechnet */
    const jahre = $("#bne-jahre"), diff = 2030 - new Date().getFullYear();
    if (jahre && diff > 0) jahre.textContent = "Das Zieljahr ist 2030. Das ist in " + diff + (diff === 1 ? " Jahr." : " Jahren.");

    const matrix = $("#bne-matrix");
    if (matrix) matrix.innerHTML = bneNachThemenfeld(visible);
  }

  /* ---------- Start ---------- */
  hydrateIcons();
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const loadThemenfelder = page === "home" ? Promise.resolve({})
    : fetch(root + "themenfelder.json").then(r => (r.ok ? r.json() : {})).catch(() => ({}));

  const loadBne = page === "home" ? Promise.resolve({})
    : fetch(root + "bne.json").then(r => (r.ok ? r.json() : {})).catch(() => ({}));

  Promise.all([
    fetch(root + "projects.json").then(response => {
      if (!response.ok) throw new Error("projects.json nicht ladbar");
      return response.json();
    }),
    loadThemenfelder,
    loadBne
  ])
    .then(([data, tf, bne]) => {
      projects = Array.isArray(data) ? data : [];
      themenfelder = tf && typeof tf === "object" ? tf : {};
      bneZiele = bne && Array.isArray(bne.ziele) ? bne.ziele.filter(z => z && Number.isInteger(z.nr) && z.kurz) : [];
      if (page === "home") { initHome(); initImpuls(); } else if (page === "themenfeld") { initThemenfeld(); } else if (page === "bne") { initBne(); } else { initList(); }
    })
    .catch(() => {
      if (list) list.innerHTML = '<p class="empty-message">Die Projektübersicht konnte nicht geladen werden. Bitte projects.json prüfen.</p>';
      if (page === "home") initImpuls();
    });
})();
