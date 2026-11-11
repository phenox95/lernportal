/* Lernportal – Begriffe nachschlagen und üben (Seite begriffe/).
   Quelle der Begriffe sind die Spielinhalte der Präsentationen (<script type="application/json" id="lp-spiel-daten">).
   Es gibt keine zweite Liste: Die Seite liest projects.json, lädt die Präsentationen eines Themenfelds
   und entnimmt ihnen die Paare. Gezeigt werden nur Blöcke mit "geprueft": true (fachlich gegengelesen).
   Adresse: begriffe/?fach=Biologie&nr=3.1   Ohne Angaben: Übersicht der Themenfelder mit Material.
   Für die Lehrkraft: &entwurf=1 zeigt auch ungeprüfte Blöcke, deutlich als Entwurf markiert.
   Üben nutzt die Spiele aus assets/games/ (gleiche Schnittstelle wie praesentation.js), ohne Zeitanzeige.
   Es wird nichts gespeichert und nichts gesendet. */
(() => {
  "use strict";

  const body = document.body;
  const root = /^(\.\.\/|\.\/)+$/.test(body.dataset.root || "") ? body.dataset.root : "./";
  const $ = (s) => document.querySelector(s);
  const FAECHER = ["Biologie", "Geografie"];
  const SPIELE = ["memory", "quiz", "zuordnen", "wortsalat"];
  const EIGNUNG = {
    memory: (p) => p.length >= 4, quiz: (p) => p.length >= 4, zuordnen: (p) => p.length >= 4,
    wortsalat: (p) => p.filter((x) => /^[A-Za-zÄÖÜäöüß]{3,14}$/.test(x.b)).length >= 3
  };

  function neu(tag, klasse, text) {
    const k = document.createElement(tag);
    if (klasse) k.className = klasse;
    if (text !== undefined) k.textContent = text;          // immer als Text, nie als HTML
    return k;
  }
  function knopf(klasse, text, label) {
    const b = neu("button", klasse, text);
    b.type = "button";
    if (label) b.setAttribute("aria-label", label);
    return b;
  }
  /* nur Pfade innerhalb des Portals: relativ zum Stamm, ohne "..", ohne Protokoll */
  function sicher(pfad) {
    const p = String(pfad || "").trim();
    return /^[A-Za-z0-9_][A-Za-z0-9_\-./]*$/.test(p) && !/\.\./.test(p) && !/\/\//.test(p) ? p : "";
  }
  function norm(text) {
    return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss");
  }
  function holeJson(datei) {
    return fetch(root + datei).then((r) => (r.ok ? r.json() : Promise.reject(new Error(datei))));
  }

  const params = new URLSearchParams(location.search);
  const fach = FAECHER.indexOf(params.get("fach")) >= 0 ? params.get("fach") : "";
  const nr = /^\d+\.\d+$/.test(params.get("nr") || "") ? params.get("nr") : "";
  const entwurf = params.get("entwurf") === "1";

  const liste = $("#bg-liste"), zahl = $("#bg-zahl"), leiste = $("#bg-leiste"), suche = $("#bg-q"), alleBtn = $("#bg-alle");
  const jahr = $("#year");
  if (jahr) jahr.textContent = String(new Date().getFullYear());

  function meldung(text) {
    liste.textContent = "";
    liste.appendChild(neu("p", "empty-message", text));
    zahl.textContent = "";
  }
  function tfNummer(eintrag) {
    const m = String(eintrag.themenfeld || "").trim().match(/^(\d+\.\d+)(?!\d)/);
    return m ? m[1] : "";
  }

  /* ---------- Übersicht: Themenfelder mit geprüften Begriffen (Feld begriffe: true), mit &entwurf=1 alle mit Material ---------- */
  function uebersicht(projekte, themenfelder) {
    document.title = "Begriffe – Lernportal";
    const gruppe = neu("div", "group");
    let n = 0;
    FAECHER.forEach((f) => {
      (Array.isArray(themenfelder[f]) ? themenfelder[f] : []).forEach((tf) => {
        if (!projekte.some((p) => p.subject === f && tfNummer(p) === tf.nr && (entwurf || p.begriffe === true))) return;
        const a = neu("a", "row");
        a.href = root + "begriffe/?fach=" + encodeURIComponent(f) + "&nr=" + encodeURIComponent(tf.nr);
        const haupt = neu("span", "row-main");
        haupt.appendChild(neu("span", "row-title", tf.kurz || tf.titel));
        haupt.appendChild(neu("span", "row-meta", f + " · Themenfeld " + tf.nr));
        a.appendChild(haupt);
        gruppe.appendChild(a);
        n++;
      });
    });
    if (!n) return meldung("Es gibt noch keine Begriffe.");
    liste.textContent = "";
    liste.appendChild(gruppe);
    zahl.textContent = "Wähle ein Themenfeld.";
  }

  /* ---------- Begriffe eines Themenfelds laden ---------- */
  function ordnerVon(eintrag) {
    const out = [];
    const haupt = sicher(eintrag.path);
    if (haupt && /\/$/.test(haupt)) out.push({ pfad: haupt, titel: eintrag.title });
    (Array.isArray(eintrag.dateien) ? eintrag.dateien : []).forEach((d) => {
      const p = sicher(d && d.pfad);
      if (p && /\/$/.test(p) && d.sichtbar !== false) out.push({ pfad: p, titel: eintrag.title });
    });
    return out;
  }
  function ladeBlock(quelle) {
    return fetch(root + quelle.pfad)
      .then((r) => (r.ok ? r.text() : ""))
      .then((text) => {
        if (!text || text.indexOf("lp-spiel-daten") < 0) return null;
        const el = new DOMParser().parseFromString(text, "text/html").getElementById("lp-spiel-daten");
        if (!el) return null;
        const d = JSON.parse(el.textContent);
        const paare = (Array.isArray(d.paare) ? d.paare : [])
          .filter((x) => Array.isArray(x) && x[0] && x[1])
          .map((x) => ({ b: String(x[0]), e: String(x[1]), s: x[2] ? String(x[2]) : "" }));
        if (!paare.length) return null;
        const geprueft = d.geprueft === true;
        if (!geprueft && !entwurf) return null;
        const istPraes = /class="[^"]*\blp-pres\b/.test(text);
        return {
          titel: String(d.titel || quelle.titel || "Stunde"), stunde: String(quelle.titel || ""), pfad: quelle.pfad, paare, geprueft, istPraes,
          erlaubt: Array.isArray(d.spiele) ? d.spiele.filter((s) => SPIELE.indexOf(s) >= 0) : SPIELE
        };
      })
      .catch(() => null);                                  // eine fehlende Seite bricht die Liste nicht ab
  }

  let bloecke = [];
  function zeichne() {
    const q = norm(suche.value).trim();
    liste.textContent = "";
    let treffer = 0;
    bloecke.forEach((b) => {
      const paare = q ? b.paare.filter((p) => norm(p.b + " " + p.e).indexOf(q) >= 0) : b.paare;
      if (!paare.length) return;
      treffer += paare.length;
      const abschnitt = neu("section", "bg-block");
      const kopf = neu("div", "bg-blockkopf");
      const titel = neu("div", "bg-blocktitel");
      titel.appendChild(neu("h2", "", b.titel));
      if (b.stunde && norm(b.stunde) !== norm(b.titel)) titel.appendChild(neu("p", "bg-stunde", b.stunde));
      if (!b.geprueft) titel.appendChild(neu("p", "bg-entwurf", "Entwurf: noch nicht fachlich geprüft. Schülerinnen und Schüler sehen diesen Block nicht."));
      kopf.appendChild(titel);
      const aktionen = neu("div", "bg-aktionen");
      const lesen = neu("a", "bg-knopf", "Stunde nachlesen");
      lesen.href = root + b.pfad + (b.istPraes ? "?ansicht=lesen" : "");
      aktionen.appendChild(lesen);
      if (b.paare.length >= 4) {
        const ueben = knopf("bg-knopf", "Üben", "Begriffe üben: " + b.titel);
        ueben.addEventListener("click", () => spielStarten(b.titel, b.paare, b.erlaubt, ueben));
        aktionen.appendChild(ueben);
      }
      kopf.appendChild(aktionen);
      abschnitt.appendChild(kopf);
      const dl = neu("dl", "bg-dl");
      paare.forEach((p) => {
        const zeile = neu("div", "bg-zeile");
        const dt = neu("dt", "", p.b);
        if (p.s && p.s !== p.b) { dt.appendChild(document.createTextNode(" ")); dt.appendChild(neu("span", "bg-silben", p.s)); }
        zeile.appendChild(dt);
        zeile.appendChild(neu("dd", "", p.e));
        dl.appendChild(zeile);
      });
      abschnitt.appendChild(dl);
      liste.appendChild(abschnitt);
    });
    if (!treffer) liste.appendChild(neu("p", "empty-message", "Kein Begriff passt zu deiner Suche."));
    zahl.textContent = treffer + (treffer === 1 ? " Begriff" : " Begriffe") + (q ? " gefunden" : "");
  }

  /* alle Begriffe des Themenfelds, jeder Begriff nur einmal (erste Erklärung), damit das Quiz eindeutig bleibt */
  function allePaare() {
    const gesehen = new Set(), out = [];
    bloecke.forEach((b) => b.paare.forEach((p) => { const k = norm(p.b); if (!gesehen.has(k)) { gesehen.add(k); out.push(p); } }));
    return out;
  }

  function themenfeld(projekte, themenfelder) {
    const tf = (Array.isArray(themenfelder[fach]) ? themenfelder[fach] : []).find((t) => t.nr === nr);
    const name = tf ? (tf.kurz || tf.titel) : "Themenfeld " + nr;
    document.title = "Begriffe: " + name + " – Lernportal";
    body.dataset.subject = fach;
    $("#bg-back").href = root + "themenfeld/?fach=" + encodeURIComponent(fach) + "&nr=" + encodeURIComponent(nr);
    $("#bg-back-text").textContent = name;
    $("#bg-eyebrow").textContent = fach + " · Themenfeld " + nr;
    $("#bg-title").textContent = "Begriffe: " + name;

    const quellen = [], schon = new Set();
    projekte.filter((p) => p.subject === fach && tfNummer(p) === nr).forEach((p) => ordnerVon(p).forEach((q) => {
      if (!schon.has(q.pfad)) { schon.add(q.pfad); quellen.push(q); }
    }));
    if (!quellen.length) return meldung("Für dieses Themenfeld gibt es noch kein Material.");
    Promise.all(quellen.map(ladeBlock)).then((ergebnis) => {
      bloecke = ergebnis.filter(Boolean);
      if (!bloecke.length) return meldung("Für dieses Themenfeld gibt es noch keine Begriffe.");
      leiste.hidden = false;
      const alle = allePaare();
      alleBtn.hidden = alle.length < 4 || bloecke.length < 2;
      alleBtn.addEventListener("click", () => spielStarten(name, allePaare(), SPIELE, alleBtn));
      suche.addEventListener("input", zeichne);
      zeichne();
    });
  }

  /* ---------- Üben: Spiele aus assets/games/, ohne Zeitanzeige ---------- */
  const LP = window.LPSpiele = window.LPSpiele || {};
  LP.reg = LP.reg || {};
  LP.hilfe = {
    el: neu, knopf, ohneZeit: true,
    mischen(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    zeit(sek) { return Math.floor(sek / 60) + ":" + String(Math.floor(sek % 60)).padStart(2, "0"); }
  };
  function ladeSpiel(name) {
    return new Promise((ok, nein) => {
      if (LP.reg[name]) return ok(LP.reg[name]);
      const sk = document.createElement("script");
      sk.src = root + "assets/games/" + name + ".js";
      sk.onload = () => (LP.reg[name] ? ok(LP.reg[name]) : nein(new Error("leer")));
      sk.onerror = () => nein(new Error("fehlt"));
      document.head.appendChild(sk);
    });
  }
  let letztesSpiel = "";
  function spielStarten(thema, paare, erlaubt, ausloeser) {
    const flaeche = neu("div", "lp-pr-spiel bg-spiel");
    flaeche.setAttribute("role", "dialog"); flaeche.setAttribute("aria-modal", "true"); flaeche.setAttribute("aria-label", "Begriffe üben");
    const kopf = neu("div", "lp-pr-spielkopf");
    const titel = neu("strong", "", "Üben");
    const knoepfe = neu("div", "bg-spielknoepfe");
    const weiter = knopf("lp-pr-klein", "Anderes Spiel");
    const zu = knopf("lp-pr-klein", "Schließen", "Üben schließen");
    knoepfe.appendChild(weiter); knoepfe.appendChild(zu);
    kopf.appendChild(titel); kopf.appendChild(knoepfe);
    const feld = neu("div", "lp-pr-spielfeld");
    flaeche.appendChild(kopf); flaeche.appendChild(feld);
    document.body.appendChild(flaeche);
    document.documentElement.classList.add("bg-spiel-offen");
    let aktiv = true, lauf = 0;
    const ende = () => {
      aktiv = false; flaeche.remove(); document.documentElement.classList.remove("bg-spiel-offen");
      document.removeEventListener("keydown", tasten, true);
      if (ausloeser && ausloeser.focus) ausloeser.focus();
    };
    /* Esc schließt, Tab bleibt im Fenster */
    const tasten = (e) => {
      if (e.key === "Escape") { ende(); return; }
      if (e.key !== "Tab") return;
      const f = [].filter.call(flaeche.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])"), (x) => !x.disabled && x.getClientRects().length);
      if (!f.length) return;
      const erstes = f[0], letztes = f[f.length - 1];
      if (e.shiftKey && document.activeElement === erstes) { e.preventDefault(); letztes.focus(); }
      else if (!e.shiftKey && document.activeElement === letztes) { e.preventDefault(); erstes.focus(); }
      else if (!flaeche.contains(document.activeElement)) { e.preventDefault(); erstes.focus(); }
    };
    document.addEventListener("keydown", tasten, true);
    zu.addEventListener("click", ende);
    const frei = SPIELE.filter((n) => erlaubt.indexOf(n) >= 0 && EIGNUNG[n](paare));
    weiter.hidden = frei.length < 2;
    function runde() {
      const mein = ++lauf;
      feld.textContent = "";
      const wahl = frei.filter((n) => n !== letztesSpiel);
      const pool = wahl.length ? wahl : frei;
      const name = pool[Math.floor(Math.random() * pool.length)];
      if (!name) { feld.appendChild(neu("p", "lp-pr-spieltext", "Zum Üben braucht es mindestens 4 Begriffe.")); return; }
      letztesSpiel = name;
      feld.appendChild(neu("p", "lp-pr-spieltext", "Spiel wird geladen …"));
      ladeSpiel(name).then((spiel) => {
        if (!aktiv || mein !== lauf) return;
        feld.textContent = "";
        titel.textContent = "Üben: " + spiel.titel + " · " + thema;
        spiel.start({ feld, paare, hilfe: LP.hilfe, ende });
      }).catch(() => { if (aktiv && mein === lauf) { feld.textContent = ""; feld.appendChild(neu("p", "lp-pr-spieltext", "Das Spiel konnte nicht geladen werden.")); } });
    }
    weiter.addEventListener("click", runde);
    runde();
    zu.focus();
  }

  /* ---------- Start ---------- */
  Promise.all([holeJson("projects.json"), holeJson("themenfelder.json").catch(() => ({}))]).then(([projekte, themenfelder]) => {
    const sichtbare = (Array.isArray(projekte) ? projekte : []).filter((p) => p && p.sichtbar !== false);
    const tf = themenfelder && typeof themenfelder === "object" ? themenfelder : {};
    if (fach && nr) themenfeld(sichtbare, tf); else uebersicht(sichtbare, tf);
  }).catch(() => meldung("Die Begriffe konnten nicht geladen werden. Bitte lade die Seite neu."));
})();
