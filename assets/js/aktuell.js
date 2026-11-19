/* Lernportal – Block „Aktuell dazu“ auf Materialseiten.
   Zeigt die neuesten Meldungen aus nachrichten.json, deren Feld "themen" zur Seite passt:
   - Pfad: Eintrag wie "geografie/klasse-9/klimawandel/" gilt für alle Seiten darunter.
   - Themenfeld: Eintrag wie "Geografie 3.6" gilt für alle Materialien mit diesem Fach und Themenfeld in projects.json.
   Meldungen sind nur Verweise mit eigener Einordnung (siehe nachrichten.json). Ältere als 90 Tage erscheinen nicht.
   Wird von material.js nachgeladen, nicht auf Präsentationen (lp-pres). Nichts wird gespeichert. */
(() => {
  "use strict";
  const body = document.body;
  const main = document.querySelector("main");
  if (!body || !main || body.classList.contains("lp-pres") || document.getElementById("lp-aktuell")) return;
  const rootRaw = String(body.dataset.root || "");
  const root = /^(\.\.\/|\.\/)+$/.test(rootRaw) ? rootRaw : "../";
  const TAGE = 90, MAX = 3;
  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const json = n => fetch(root + n).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const datumLang = d => /^\d{4}-\d{2}-\d{2}$/.test(d || "") ? new Date(d + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "";
  const ART = { Medienbericht: "Medienbericht", Regierung: "Sicht der Regierung", Position: "Position eines Verbands" };

  /* eigener Pfad relativ zum Portalstamm, z. B. "geografie/klasse-9/ressourcen/e-fuels/" */
  const basis = new URL(root, location.href).pathname;
  let pfad = location.pathname.startsWith(basis) ? location.pathname.slice(basis.length) : "";
  pfad = pfad.replace(/index\.html$/, "");
  if (!pfad) return;

  Promise.all([json("nachrichten.json"), json("projects.json")]).then(([nach, proj]) => {
    const liste = Array.isArray(proj) ? proj : (proj && proj.projekte) || [];
    const ich = liste.filter(p => p && typeof p.path === "string" && (pfad === p.path || pfad.startsWith(p.path)))
      .sort((a, b) => b.path.length - a.path.length)[0];
    const feld = ich && ich.subject && ich.themenfeld ? ich.subject + " " + ich.themenfeld : "";
    const grenze = new Date(Date.now() - TAGE * 86400000).toISOString().slice(0, 10);
    const passend = (nach && Array.isArray(nach.eintraege) ? nach.eintraege : [])
      .filter(n => n && n.titel && /^https:\/\//.test(n.link || "") && n.sichtbar !== false && String(n.datum || "") >= grenze)
      .filter(n => (Array.isArray(n.themen) ? n.themen : []).some(t => typeof t === "string" && (t.includes("/") ? pfad.startsWith(t) : (feld && t === feld))))
      .sort((a, b) => String(b.datum || "").localeCompare(String(a.datum || "")))
      .slice(0, MAX);
    if (!passend.length) return;
    const box = document.createElement("aside");
    box.id = "lp-aktuell";
    box.className = "lp-aktuell";
    box.setAttribute("aria-labelledby", "lp-aktuell-h");
    box.innerHTML = `<span class="lp-label" id="lp-aktuell-h">Aktuell dazu</span>
      <p class="lp-aktuell-hinweis">Meldungen zum Thema. Sie führen auf Seiten anderer Anbieter. Dort gelten deren Regeln.</p>
      <ul class="lp-aktuell-liste">${passend.map(n => {
        const meta = [n.quelle, datumLang(n.datum), ART[n.art] || ""].filter(Boolean).map(esc).join(" · ");
        return `<li><a href="${esc(n.link)}" target="_blank" rel="noopener noreferrer"><strong>${esc(n.titel)}</strong><span class="lp-sr"> (externe Seite, öffnet in neuem Tab)</span><span class="lp-aktuell-meta">${meta}</span>${n.einordnung ? `<span class="lp-aktuell-ein">${esc(n.einordnung)}</span>` : ""}</a></li>`;
      }).join("")}</ul>`;
    main.appendChild(box);
  });
})();
