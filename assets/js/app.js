(() => {
  const body = document.body;
  const root = body.dataset.root || "";           // "" auf der Startseite, "../" in Unterordnern
  const page = body.dataset.page || "home";        // home | fach | alle
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
    photo: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L6 21"/>'
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
  function row(project, showSubject) {
    const meta = [showSubject ? project.subject : "", project.type, project.grade, project.dauer]
      .filter(Boolean).map(escapeHtml).join(" · ");
    const inhalt = inhaltOf(project);
    const badge = project.status ? `<span class="badge">${escapeHtml(project.status)}</span>` : "";
    return `
      <a class="row" href="${escapeHtml(resolvePath(project.path))}">
        <span class="dot ${tileClass(project)}" aria-hidden="true"></span>
        <span class="row-main">
          <span class="row-title">${escapeHtml(project.title)}${badge}</span>
          <span class="row-meta">${meta}</span>${inhalt ? `
          <span class="row-meta">${escapeHtml(inhalt)}</span>` : ""}
        </span>
        <span class="row-chev">${icon("chevron", 20)}</span>
      </a>`;
  }
  function textMatches(project, query) {
    const tokens = fold(query).split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    const haystack = fold([project.title, project.description, themeOf(project), project.subject, project.type, project.grade,
      dateienOf(project).map(d => d.titel + " " + (d.art || "")).join(" ")].join(" "));
    return tokens.every(token => haystack.includes(token));
  }

  let projects = [];
  let themenfelder = {};   // themenfelder.json (RLP-Themenfelder je Fach), optional

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
  const state = { subject: "Alle", grade: "Alle", art: "Alle", theme: "Alle", query: "" };

  function matches(project) {
    if (!isVisible(project)) return false;
    const subject = pageSubject || state.subject;
    if (subject !== "Alle" && project.subject !== subject) return false;
    if (state.grade !== "Alle" && !gradesOf(project).includes(state.grade)) return false;
    if (state.art !== "Alle" && !(ART_TESTS[state.art] && artMatches(project, state.art))) return false;
    if (state.theme !== "Alle" && themeOf(project) !== state.theme) return false;
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

  function initImpuls() {
    const section = $("#impuls");
    if (!section) return;
    fetch(root + "impuls.json")
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (!data || data.aktiv !== true || !data.frage) return;
        const label = [data.label || "Impuls der Woche", data.klasse].filter(Boolean).map(escapeHtml).join(" · ");
        const media = data.bild
          ? `<img src="${escapeHtml(resolvePath(data.bild))}" alt="${escapeHtml(data.bildAlt || "")}" loading="lazy">`
          : `<div class="impuls-placeholder">${icon("photo", 32)}<span>Platz für eigenes Foto</span></div>`;
        const caption = data.bildQuelle ? `<p class="impuls-caption">${escapeHtml(data.bildQuelle)}</p>` : "";
        const link = data.link
          ? `<a class="impuls-link" href="${escapeHtml(resolvePath(data.link))}">Material öffnen ${icon("arrow", 18)}</a>` : "";
        section.innerHTML = `
          <p class="label">${label}</p>
          <div class="impuls">
            <div><div class="impuls-media">${media}</div>${caption}</div>
            <div class="impuls-body"><p class="impuls-q">${escapeHtml(data.frage)}</p>${link}</div>
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
    const filtering = state.grade !== "Alle" || state.art !== "Alle" || state.theme !== "Alle" || state.query.trim() !== "";
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
        renderList();
      });
    }
    $("#filter-art").addEventListener("change", event => { state.art = event.target.value; renderList(); });
    $("#filter-theme").addEventListener("change", event => { state.theme = event.target.value; renderList(); });
    $("#q").addEventListener("input", event => { state.query = event.target.value; renderList(); });

    buildThemes();
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
    list.innerHTML = items.length
      ? `<div class="group">${items.map(p => row(p, false)).join("")}</div>`
      : '<p class="empty-message">Für dieses Themenfeld gibt es noch kein Material.</p>';
  }

  /* ---------- Start ---------- */
  hydrateIcons();
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const loadThemenfelder = page === "home" ? Promise.resolve({})
    : fetch(root + "themenfelder.json").then(r => (r.ok ? r.json() : {})).catch(() => ({}));

  Promise.all([
    fetch(root + "projects.json").then(response => {
      if (!response.ok) throw new Error("projects.json nicht ladbar");
      return response.json();
    }),
    loadThemenfelder
  ])
    .then(([data, tf]) => {
      projects = Array.isArray(data) ? data : [];
      themenfelder = tf && typeof tf === "object" ? tf : {};
      if (page === "home") { initHome(); initImpuls(); } else if (page === "themenfeld") { initThemenfeld(); } else { initList(); }
    })
    .catch(() => {
      if (list) list.innerHTML = '<p class="empty-message">Die Projektübersicht konnte nicht geladen werden. Bitte projects.json prüfen.</p>';
      if (page === "home") initImpuls();
    });
})();
