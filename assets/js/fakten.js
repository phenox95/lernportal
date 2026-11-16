/* Lernportal – Seite Fakten-Check (fakten/).
   Daten: mythen.json (Aussagen mit Quelle), nachrichten.json (Meldungen), projects.json (Material mit fakten: true), bne.json (Zielnamen).
   Alles läuft im Browser, nichts wird gespeichert oder gesendet. */
(() => {
  "use strict";
  const root = document.body.dataset.root || "";
  const $ = s => document.querySelector(s);
  const esc = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const json = (name, leer) => fetch(root + name).then(r => (r.ok ? r.json() : leer)).catch(() => leer);
  const https = u => typeof u === "string" && /^https:\/\//.test(u);
  const datumLang = d => /^\d{4}-\d{2}-\d{2}$/.test(d || "") ? new Date(d + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "";
  const ART = { Medienbericht: "Medienbericht", Regierung: "Sicht der Regierung", Position: "Position eines Verbands" };
  const PFEIL = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const CHEV = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

  const jahr = $("#year"); if (jahr) jahr.textContent = new Date().getFullYear();
  document.querySelectorAll("[data-icon='down']").forEach(e => { e.innerHTML = PFEIL; });

  function materialZeilen(liste) {
    return `<div class="group">${liste.map(p => `<a class="row" href="${root}${esc(p.path)}"><span class="dot" aria-hidden="true"></span><span class="row-main"><span class="row-title">${esc(p.title)}</span><span class="row-meta">${[p.subject, p.grade, p.type].filter(Boolean).map(esc).join(" · ")}</span></span><span class="row-chev">${CHEV}</span></a>`).join("")}</div>`;
  }

  Promise.all([json("mythen.json", {}), json("nachrichten.json", {}), json("projects.json", []), json("bne.json", {})]).then(([my, nach, proj, bne]) => {
    const themen = Array.isArray(my.themen) ? my.themen : [];
    const mythen = (Array.isArray(my.mythen) ? my.mythen : []).filter(m => m && m.aussage && m.fakt && m.quelle && https(m.quelle.link));
    const projekte = (Array.isArray(proj) ? proj : (proj && proj.projekte) || []).filter(p => p && p.sichtbar !== false);
    const news = (Array.isArray(nach.eintraege) ? nach.eintraege : []).filter(n => n && n.titel && https(n.link) && n.sichtbar !== false)
      .sort((a, b) => String(b.datum || "").localeCompare(String(a.datum || "")));
    const ziele = Array.isArray(bne.ziele) ? bne.ziele : [];
    const zielName = n => { const z = ziele.find(x => x.nr === n); return z ? "Ziel " + n + " " + (z.kurz || z.titel || "") : ""; };

    /* ---------- Mythen-Check ---------- */
    const pills = $("#f-themen"), karten = $("#f-karten"), punkte = $("#f-punkte"), hint = $("#f-thema-hinweis"), tm = $("#f-thema-material");
    let thema = "alle";
    const stand = { richtig: 0, getippt: 0 };
    const beantwortet = new Set();
    const punkteText = () => { punkte.textContent = stand.getippt ? "Richtig geraten: " + stand.richtig + " von " + stand.getippt : ""; };
    const zeigeThema = () => {
      pills.innerHTML = [{ id: "alle", titel: "Alle" }, ...themen.map(t => ({ id: t.id, titel: t.titel }))]
        .map(t => `<button type="button" data-t="${esc(t.id)}" aria-pressed="${t.id === thema}">${esc(t.titel)}</button>`).join("");
      const t = themen.find(x => x.id === thema);
      hint.hidden = !(t && t.hinweis); hint.textContent = t && t.hinweis ? t.hinweis : "";
      const liste = mythen.map((m, i) => Object.assign({ _i: i }, m)).filter(m => thema === "alle" || m.thema === thema);
      karten.innerHTML = liste.length
        ? `<div class="f-karten">${liste.map(kartenHtml).join("")}</div>`
        : '<p class="empty-message">Zu diesem Thema gibt es hier noch keine Aussagen. Schau unter „Mehr dazu“.</p>';
      const mat = t && t.material ? projekte.find(p => p.path === t.material) : null;
      tm.innerHTML = mat ? `<h3 class="n-unter">Mehr dazu</h3>${materialZeilen([mat])}` : "";
      punkteText();
    };
    const kartenHtml = m => {
      const t = themen.find(x => x.id === m.thema);
      const fertig = beantwortet.has(m._i);
      return `<article class="f-karte" data-i="${m._i}">
        <p class="f-thema-etikett">${esc(t ? t.titel : "")}</p>
        <p class="f-aussage">„${esc(m.aussage)}“</p>
        <p class="f-frage" id="fq${m._i}">Stimmt das?</p>
        <div class="f-tipp" role="group" aria-labelledby="fq${m._i}">
          <button type="button" data-tipp="ja"${fertig ? " disabled" : ""}>Stimmt</button>
          <button type="button" data-tipp="nein"${fertig ? " disabled" : ""}>Stimmt nicht</button>
        </div>
        <div class="f-antwort" aria-live="polite"${fertig ? "" : " hidden"}>${fertig ? antwortHtml(m) : ""}</div>
      </article>`;
    };
    const antwortHtml = m => `<p class="f-urteil"><span class="f-marke">${m.stimmt ? "Stimmt" : "Mythos"}</span></p>
      <p class="f-fakt">${esc(m.fakt)}</p>
      <p class="f-quelle">Quelle: <a href="${esc(m.quelle.link)}" target="_blank" rel="noopener noreferrer">${esc(m.quelle.name)}<span class="sr-only"> (externe Seite, öffnet in neuem Tab)</span></a></p>`;
    pills.addEventListener("click", e => { const b = e.target.closest("button[data-t]"); if (!b) return; thema = b.dataset.t; zeigeThema(); });
    const tipps = {};   // Index -> Tipp, damit gewählte Antwort sichtbar bleibt
    karten.addEventListener("click", e => {
      const b = e.target.closest("button[data-tipp]"); if (!b) return;
      const k = b.closest(".f-karte"), i = Number(k.dataset.i), m = mythen[i];
      if (beantwortet.has(i)) return;
      beantwortet.add(i); tipps[i] = b.dataset.tipp;
      const richtig = (b.dataset.tipp === "ja") === (m.stimmt === true);
      stand.getippt += 1; if (richtig) stand.richtig += 1;
      k.querySelectorAll("button[data-tipp]").forEach(x => { x.disabled = true; x.setAttribute("aria-pressed", String(x === b)); });
      const a = k.querySelector(".f-antwort");
      a.innerHTML = `<p class="f-urteil">${richtig ? "Richtig geraten." : "Nicht ganz."}</p>` + antwortHtml(m);
      a.hidden = false; punkteText();
    });
    zeigeThema();

    /* ---------- Material zum Üben (projects.json: fakten: true) ---------- */
    const fm = projekte.filter(p => p.fakten === true);
    $("#f-material").innerHTML = fm.length ? `<h3 class="n-unter">Zum Üben im Unterricht</h3>${materialZeilen(fm)}` : "";

    /* ---------- Meldung prüfen ---------- */
    const wahl = $("#f-wahl"), bogen = $("#f-bogen");
    wahl.innerHTML = '<option value="">Meldung wählen</option>' + news.map((n, i) => `<option value="${i}">${esc(n.quelle)}: ${esc(n.titel.length > 70 ? n.titel.slice(0, 67) + " …" : n.titel)}</option>`).join("");
    const FRAGEN = [
      ["Wer schreibt?", "Ich finde einen Namen oder eine Organisation."],
      ["Wo steht es?", "Die Seite gehört zu einem Medium, einer Behörde oder einem Institut."],
      ["Gibt es Belege?", "Es gibt Zahlen oder einen Link zur Quelle."],
      ["Passt es zum Gesamtbild?", "Andere Quellen sagen etwas Ähnliches."],
      ["Wie ist der Ton?", "Der Text ist sachlich, ohne Panik und ohne Schuldzuweisungen."]
    ];
    const auswerten = () => {
      const ja = bogen.querySelectorAll('input[value="ja"]:checked').length;
      const offen = bogen.querySelectorAll("fieldset").length - bogen.querySelectorAll("input:checked").length;
      const box = bogen.querySelector(".f-ergebnis");
      if (offen > 0) { box.hidden = true; return; }
      const nein = bogen.querySelectorAll('input[value="nein"]:checked').length;
      box.hidden = false;
      box.innerHTML = `<p><strong>${ja} von 5 Fragen mit „Ja“ beantwortet.</strong></p><p>${
        ja === 5 ? "Viele gute Zeichen. Prüfe trotzdem noch eine zweite Quelle."
          : nein >= 3 ? "Mehrere Warnzeichen. Glaube nichts, bevor du es woanders geprüft hast."
            : "Einige Fragen sind offen. Suche nach mehr Informationen und vergleiche andere Quellen."}</p>`;
    };
    wahl.addEventListener("change", () => {
      const n = news[Number(wahl.value)];
      if (wahl.value === "" || !n) { bogen.hidden = true; bogen.innerHTML = ""; return; }
      const meta = [n.quelle, datumLang(n.datum), ART[n.art] || ""].filter(Boolean).map(esc).join(" · ");
      bogen.hidden = false;
      bogen.className = "f-bogen";
      bogen.innerHTML = `<p class="f-bogen-kopf">${esc(n.titel)}</p><p class="f-bogen-meta">${meta} · <a href="${esc(n.link)}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;font-weight:700">Meldung öffnen (externe Seite)</a></p>
        <p class="woche-hinweis">Öffne die Meldung, lies sie und beantworte dann die Fragen.</p>
        ${FRAGEN.map((f, i) => `<div class="f-frage-block"><fieldset><legend>${i + 1}. ${esc(f[0])}<span>${esc(f[1])}</span></legend>
          <div class="f-antworten">${[["ja", "Ja"], ["nein", "Nein"], ["unklar", "Weiß ich nicht"]].map(o => `<label><input type="radio" name="fb${i}" value="${o[0]}">${o[1]}</label>`).join("")}</div></fieldset></div>`).join("")}
        <div class="f-ergebnis" aria-live="polite" hidden></div>`;
      bogen.querySelectorAll("input").forEach(x => x.addEventListener("change", auswerten));
    });

    /* ---------- Gleiches Thema, andere Sicht ---------- */
    const gruppen = {};
    news.forEach(n => (Array.isArray(n.bne) ? n.bne : []).forEach(z => { (gruppen[z] = gruppen[z] || []).push(n); }));
    const passend = Object.keys(gruppen).map(z => ({ z: Number(z), liste: gruppen[z], arten: new Set(gruppen[z].map(n => n.art || "Medienbericht")) }))
      .filter(g => g.arten.size >= 2).sort((a, b) => b.arten.size - a.arten.size || b.liste.length - a.liste.length).slice(0, 2);
    if (passend.length) {
      $("#f-andere-h").hidden = false;
      $("#f-andere").innerHTML = passend.map(g => `<div class="f-andere"><p class="woche-hinweis"><strong>${esc(zielName(g.z) || "Thema")}</strong>: Diese Quellen schauen aus verschiedenen Richtungen auf dasselbe Thema.</p>${
        g.liste.slice(0, 4).map(n => `<a class="f-sicht" href="${esc(n.link)}" target="_blank" rel="noopener noreferrer"><span class="chip">${esc(ART[n.art] || "Medienbericht")}</span><strong>${esc(n.titel)}</strong><span class="row-meta">${[n.quelle, datumLang(n.datum)].filter(Boolean).map(esc).join(" · ")}</span>${n.einordnung ? `<span class="f-s-ein">${esc(n.einordnung)}</span>` : ""}</a>`).join("")}
        <p class="f-auftrag"><strong>Vergleiche:</strong> Was betont jede Quelle? Was lässt sie weg? Welche Frage aus dem Quellencheck kannst du für jede Quelle beantworten?</p></div>`).join("");
    }
  });

  /* ---------- Gesprächskarten drucken ---------- */
  const druck = $("#f-druck");
  if (druck) {
    druck.addEventListener("click", () => {
      document.body.classList.add("f-druck");
      window.addEventListener("afterprint", () => document.body.classList.remove("f-druck"), { once: true });
      window.print();
    });
  }
})();
