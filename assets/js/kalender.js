/* Lernportal – Stundenkalender (Seite kalender/). Liest kalender.json und projects.json.
   Gemerkt wird nur die gewählte Lerngruppe im Browser (localStorage). Keine Namen, nichts wird gesendet. */
(() => {
  "use strict";
  const root = /^(\.\.\/)*$/.test(document.body.dataset.root || "") ? document.body.dataset.root : "../";
  const $ = (id) => document.getElementById(id);
  const WT = ["Mo", "Di", "Mi", "Do", "Fr"];
  const WT_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const MONAT = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const GK = "lp-kalender-gruppe";

  const neu = (tag, klasse, text) => { const e = document.createElement(tag); if (klasse) e.className = klasse; if (text !== undefined) e.textContent = text; return e; };
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const ausIso = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const langDatum = (d) => WT_LANG[d.getDay()] + ", " + d.getDate() + ". " + MONAT[d.getMonth()] + " " + d.getFullYear();
  const sicher = (p) => (typeof p === "string" && /^[a-z0-9][a-z0-9\-_\/]*\/$/i.test(p) && p.indexOf("..") < 0 ? p : "");
  const stundenText = (st) => (st.length === 1 ? st[0] + ". Stunde" : st.join(". und ") + ". Stunde");
  const holen = (u) => fetch(root + u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
  function laden(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function speichern(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ohne Speicher weiter */ } }

  const jahr = $("year"); if (jahr) jahr.textContent = new Date().getFullYear();
  let daten = null, projekte = {}, gruppe = null;
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  let monat = new Date(heute.getFullYear(), heute.getMonth(), 1);
  let gewaehlt = iso(heute);

  /* Ferien, Feiertage und unterrichtsfreie Tage (Berlin): an solchen Tagen gilt der Wochenplan nicht */
  const freiAm = (d) => { const s = iso(d); return daten.frei.filter((f) => f.von <= s && s <= f.bis); };
  const planAm = (d) => (gruppe ? gruppe.woche.find((w) => w.tag === d.getDay()) : null);
  const rhythmus = (d) => (freiAm(d).length ? null : planAm(d));
  const freiText = (liste) => liste.map((f) => f.name).filter((n, i, a) => a.indexOf(n) === i).join(", ");
  const eintraegeAm = (s) => daten.eintraege.filter((e) => e.gruppe === gruppe.id && e.datum === s && e.datum <= iso(heute));

  function materialKarte(e, d) {
    const k = neu("div", "kal-eintrag-karte");
    const dat = neu("p", "kal-datum", langDatum(d) + (rhythmus(d) ? " · " + stundenText(rhythmus(d).stunden) : ""));
    k.appendChild(dat);
    (e.material || []).forEach((pfad) => {
      const p = projekte[pfad]; if (!p || !sicher(pfad)) return;
      k.appendChild(neu("p", "kal-material", p.title));
      const meta = [p.reihe, p.dauer].filter(Boolean).join(" · ");
      if (meta) k.appendChild(neu("p", "kal-reihe", meta));
      const links = neu("div", "kal-links");
      const auf = neu("a", "", "Öffnen"); auf.href = root + pfad; links.appendChild(auf);
      if (/pr[äa]sentation/i.test(p.type || "")) { const les = neu("a", "", "Nachlesen"); les.href = root + pfad + "?ansicht=lesen"; links.appendChild(les); }
      k.appendChild(links);
    });
    if (e.notiz) k.appendChild(neu("p", "kal-notiz", e.notiz));
    return k;
  }

  function zeichneNaechste() {
    const z = $("kal-naechste");
    if (!gruppe || !gruppe.woche.length) { z.textContent = ""; return; }
    for (let i = 0; i < 28; i++) {
      const d = new Date(heute); d.setDate(d.getDate() + i);
      const w = rhythmus(d);
      if (w) { z.textContent = (i === 0 ? "Heute" : i === 1 ? "Morgen" : "Nächste Stunde") + ": " + langDatum(d) + ", " + stundenText(w.stunden) + "."; return; }
    }
    z.textContent = "";
  }

  function zeichneFerien() {
    const z = $("kal-ferien"); if (!z) return;
    const h = iso(heute), laufend = daten.frei.find((f) => f.art === "ferien" && f.von <= h && h <= f.bis);
    if (laufend) {
      const e = ausIso(laufend.bis); do { e.setDate(e.getDate() + 1); } while (e.getDay() === 0 || e.getDay() === 6 || freiAm(e).length);
      z.textContent = laufend.name + " bis " + langDatum(ausIso(laufend.bis)) + ". Schule wieder ab " + langDatum(e) + ".";
      return;
    }
    const kommend = daten.frei.filter((f) => f.art === "ferien" && f.von > h).sort((a, b) => (a.von < b.von ? -1 : 1))[0];
    if (!kommend) { z.textContent = ""; return; }
    const tage = Math.round((ausIso(kommend.von) - heute) / 86400000);
    z.textContent = "Nächste Ferien: " + kommend.name + " ab " + langDatum(ausIso(kommend.von)) + " (noch " + tage + (tage === 1 ? " Tag)." : " Tage).");
  }

  function zeichneMonat() {
    $("kal-monat").textContent = MONAT[monat.getMonth()] + " " + monat.getFullYear();
    const r = $("kal-raster"); r.textContent = "";
    WT.forEach((t) => { const h = neu("div", "kal-wt", t); h.setAttribute("role", "columnheader"); r.appendChild(h); });
    const erster = new Date(monat.getFullYear(), monat.getMonth(), 1);
    const letzter = new Date(monat.getFullYear(), monat.getMonth() + 1, 0);
    const start = new Date(erster); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));        // Montag der ersten Woche
    for (let d = new Date(start); d <= letzter; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const tag = new Date(d), s = iso(tag), im = tag.getMonth() === monat.getMonth();
      const b = neu("button", "kal-tagzelle" + (im ? "" : " anderer-monat"));
      b.type = "button"; b.setAttribute("role", "gridcell");
      const hatU = !!rhythmus(tag), n = gruppe ? eintraegeAm(s).length : 0;
      const fr = freiAm(tag);
      if (hatU) b.classList.add("unterricht");
      if (fr.length) b.classList.add(fr.some((f) => f.art === "ferien") ? "ferien" : "freitag");
      if (s === iso(heute)) b.classList.add("heute");
      if (s === gewaehlt) b.classList.add("gewaehlt");
      b.appendChild(neu("span", "", String(tag.getDate())));
      const m = neu("span", "kal-marken");
      if (hatU) m.appendChild(neu("span", "kal-punkt kal-unterricht"));
      if (n) m.appendChild(neu("span", "kal-punkt kal-eintrag"));
      b.appendChild(m);
      b.setAttribute("aria-label", langDatum(tag) + (hatU ? ", Unterricht" : "") + (fr.length ? ", " + freiText(fr) + ", kein Unterricht" : "") + (n ? ", " + n + (n === 1 ? " Eintrag" : " Einträge") : ""));
      b.addEventListener("click", () => { gewaehlt = s; if (!im) { monat = new Date(tag.getFullYear(), tag.getMonth(), 1); } zeichneAlles(); });
      r.appendChild(b);
    }
  }

  function zeichneTag() {
    const d = ausIso(gewaehlt), box = $("kal-tag-inhalt"); box.textContent = "";
    $("kal-tag-titel").textContent = d ? langDatum(d) : "Tag wählen";
    if (!d || !gruppe) return;
    const liste = eintraegeAm(gewaehlt);
    if (liste.length) { liste.forEach((e) => box.appendChild(materialKarte(e, d))); return; }
    const w = rhythmus(d), fr = freiAm(d);
    if (fr.length) { box.appendChild(neu("p", "hint", freiText(fr) + ": kein Unterricht.")); return; }
    box.appendChild(neu("p", "hint", w ? "In dieser Gruppe ist Unterricht (" + stundenText(w.stunden) + "). Es ist noch nichts eingetragen." : "In dieser Gruppe ist an diesem Tag kein Unterricht."));
  }

  function zeichneListe() {
    const box = $("kal-liste"); box.textContent = "";
    if (!gruppe) return;
    const liste = daten.eintraege.filter((e) => e.gruppe === gruppe.id && ausIso(e.datum) && e.datum <= iso(heute)).sort((a, b) => (a.datum < b.datum ? 1 : -1));
    if (!liste.length) { box.appendChild(neu("p", "empty-message", "Für " + gruppe.klasse + " " + gruppe.fach + " ist noch nichts eingetragen.")); return; }
    liste.forEach((e) => box.appendChild(materialKarte(e, ausIso(e.datum))));
  }

  function zeichneAlles() {
    document.querySelector(".kal").dataset.fach = gruppe ? gruppe.fach : "";
    zeichneNaechste(); zeichneFerien(); zeichneMonat(); zeichneTag(); zeichneListe();
  }

  Promise.all([holen("kalender.json"), holen("projects.json")]).then(([k, p]) => {
    daten = { lerngruppen: Array.isArray(k.lerngruppen) ? k.lerngruppen : [], eintraege: Array.isArray(k.eintraege) ? k.eintraege : [], frei: Array.isArray(k.frei) ? k.frei.filter((f) => f && ausIso(f.von) && ausIso(f.bis)) : [] };
    (Array.isArray(p) ? p : []).forEach((x) => { if (x && x.path) projekte[x.path] = x; });
    const sel = $("kal-gruppe");
    daten.lerngruppen.forEach((g) => { const o = neu("option", "", g.klasse + " · " + g.fach); o.value = g.id; sel.appendChild(o); });
    const gemerkt = laden(GK);
    gruppe = daten.lerngruppen.find((g) => g.id === gemerkt) || daten.lerngruppen[0] || null;
    if (gruppe) sel.value = gruppe.id;
    sel.addEventListener("change", () => { gruppe = daten.lerngruppen.find((g) => g.id === sel.value) || gruppe; speichern(GK, gruppe.id); zeichneAlles(); });
    $("kal-zurueck").addEventListener("click", () => { monat = new Date(monat.getFullYear(), monat.getMonth() - 1, 1); zeichneMonat(); });
    $("kal-weiter").addEventListener("click", () => { monat = new Date(monat.getFullYear(), monat.getMonth() + 1, 1); zeichneMonat(); });
    $("kal-heute").addEventListener("click", () => { monat = new Date(heute.getFullYear(), heute.getMonth(), 1); gewaehlt = iso(heute); zeichneAlles(); });
    zeichneAlles();
  }).catch(() => { $("kal-liste").textContent = ""; $("kal-liste").appendChild(neu("p", "empty-message", "Der Kalender konnte nicht geladen werden. Bitte lade die Seite neu.")); });
})();
