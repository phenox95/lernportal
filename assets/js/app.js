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
    "Lernmodul": /modul/i,
    "Interaktiv": INTERACTIVE
  };

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
    const badge = project.status ? `<span class="badge">${escapeHtml(project.status)}</span>` : "";
    return `
      <a class="row" href="${escapeHtml(resolvePath(project.path))}">
        <span class="dot ${tileClass(project)}" aria-hidden="true"></span>
        <span class="row-main">
          <span class="row-title">${escapeHtml(project.title)}${badge}</span>
          <span class="row-meta">${meta}</span>
        </span>
        <span class="row-chev">${icon("chevron", 20)}</span>
      </a>`;
  }
  function textMatches(project, query) {
    const tokens = fold(query).split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    const haystack = fold([project.title, project.description, themeOf(project), project.subject, project.type, project.grade].join(" "));
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
    if (state.art !== "Alle" && !ART_TESTS[state.art].test(project.type || "")) return false;
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
          const label = tfLabel(tf);
          const n = visible.filter(p => p.subject === pageSubject && themeOf(p) === label).length;
          const note = [tf.verbund, tf.hinweis].filter(Boolean).map(escapeHtml).join(" · ");
          return `<button type="button" class="tf-row" data-theme="${escapeHtml(label)}" aria-pressed="${state.theme === label}">
            <span class="tf-nr">${escapeHtml(tf.nr)}</span>
            <span class="tf-main"><span class="tf-title">${escapeHtml(tf.titel)}</span>${note ? `<span class="tf-note">${note}</span>` : ""}</span>
            <span class="tf-count">${n ? countText(n) : "Noch kein Material"}</span>
          </button>`;
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
    $("#filter-theme").addEventListener("change", event => { state.theme = event.target.value; renderList(); renderThemenfelder(); });
    const overview = $("#themenfelder");
    if (overview) {
      overview.addEventListener("click", event => {
        const button = event.target.closest(".tf-row");
        if (!button) return;
        state.theme = state.theme === button.dataset.theme ? "Alle" : button.dataset.theme;
        $("#filter-theme").value = state.theme;
        renderList();
        renderThemenfelder();
        const target = $("#result-count");
        if (state.theme !== "Alle" && target) {
          const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
        }
      });
    }
    $("#q").addEventListener("input", event => { state.query = event.target.value; renderList(); });

    buildThemes();
    renderThemenfelder();
    renderList();
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
      if (page === "home") { initHome(); initImpuls(); } else { initList(); }
    })
    .catch(() => {
      if (list) list.innerHTML = '<p class="empty-message">Die Projektübersicht konnte nicht geladen werden. Bitte projects.json prüfen.</p>';
      if (page === "home") initImpuls();
    });
})();
