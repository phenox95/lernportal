/* Lernportal – Fenster „Link und QR-Code“.
   Wird NICHT auf jeder Seite eingebunden, sondern erst beim Antippen von „Teilen“ nachgeladen
   (material.js in der Kopfleiste der Materialseiten, praesentation.js im Werkzeugrand, Taste Q).
   Lädt dabei lokal nach: assets/css/teilen.css und assets/js/qrcode.js. Keine externen Dienste, nichts wird übertragen.

   Aufruf:  window.LPTeilen.open({ opener: <Knopf, der zuletzt den Fokus hatte> })
   Welche Adresse geteilt wird, bestimmt diese Datei:
   - Materialseite, Übung, Anwendung: die Adresse der Seite (ohne Suchteil und ohne #Anker).
   - Präsentation (body.lp-pres): „Nachlesen“ = ?ansicht=lesen (alle Folien untereinander, gut für das Handy)
     und, wenn es sie gibt, „Stundenseite“ = der Ordner darüber (Präsentation, Arbeitsblätter, Übungen).
     In Präsentationen startet das Fenster groß, damit der Code am Beamer oder Board lesbar ist. */
(() => {
  "use strict";
  if (window.LPTeilen) return;

  const SKRIPT = (document.currentScript && document.currentScript.src) || "";
  const STAMM = /\/assets\/js\/teilen\.js(\?.*)?$/.test(SKRIPT) ? SKRIPT.replace(/assets\/js\/teilen\.js(\?.*)?$/, "") : "";

  let offen = null;   // das gerade geöffnete Fenster (immer nur eins)

  function neu(tag, klasse, text) {
    const k = document.createElement(tag);
    if (klasse) k.className = klasse;
    if (text !== undefined) k.textContent = text;   // immer als Text, nie als HTML
    return k;
  }
  function knopf(klasse, text, label) {
    const b = neu("button", klasse, text);
    b.type = "button";
    if (label) b.setAttribute("aria-label", label);
    return b;
  }

  function skript(src) {
    return new Promise((ok, fehl) => {
      const s = document.createElement("script");
      s.src = src; s.onload = ok; s.onerror = fehl;
      document.head.appendChild(s);
    });
  }
  function css(href) {
    return new Promise(ok => {
      if (document.querySelector('link[data-lp-teilen]')) { ok(); return; }
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = href; l.setAttribute("data-lp-teilen", "");
      l.onload = ok; l.onerror = ok;                   // ohne Stile geht es trotzdem, nur schlichter
      document.head.appendChild(l);
      setTimeout(ok, 1500);                            // nicht ewig warten
    });
  }

  /* ---------- Adressen ---------- */
  function seitenAdresse() {
    const u = new URL(location.href);
    u.hash = ""; u.search = "";
    u.pathname = u.pathname.replace(/index\.html?$/i, "");
    return u.href;
  }
  function optionen() {
    const basis = seitenAdresse();
    if (!document.body.classList.contains("lp-pres")) {
      return [{ id: "seite", label: "Diese Seite", url: basis, hinweis: "Scanne den Code mit der Kamera deines Handys." }];
    }
    return [{ id: "lesen", label: "Nachlesen", url: basis + "?ansicht=lesen", hinweis: "Alle Folien untereinander. Gut lesbar auf dem Handy." }];
  }
  /* Stundenseite = Ordner über der Präsentation, nur wenn es dort eine Seite gibt */
  function stundenseite() {
    const basis = seitenAdresse();
    if (!/\/praesentation\/$/.test(basis)) return Promise.resolve(null);
    const eltern = basis.replace(/praesentation\/$/, "");
    return fetch(eltern, { method: "HEAD" })
      .then(r => (r.ok ? { id: "stunde", label: "Stundenseite", url: eltern, hinweis: "Präsentation, Arbeitsblätter und Übungen dieser Stunde." } : null))
      .catch(() => null);
  }

  /* ---------- QR-Code ---------- */
  function qrSvg(url) {
    const c = window.qrcode(0, "M");
    c.addData(url);
    c.make();
    /* Rand von 4 Modulen (32 von 8), wie es die QR-Norm für sicheres Scannen verlangt */
    return c.createSvgTag({ cellSize: 8, margin: 32, scalable: true });
  }

  /* ---------- Kopieren ---------- */
  function kopieren(text) {
    const alt = () => {
      try {
        const ta = neu("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch (e) { return false; }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(() => true, () => alt());
    }
    return Promise.resolve(alt());
  }

  /* ---------- Fenster ---------- */
  function fenster(opts) {
    const netz = /^https?:$/.test(location.protocol);
    const optionsListe = optionen();
    let wahl = optionsListe[0];
    let gross = document.body.classList.contains("lp-pres");

    const huelle = neu("div", "lp-tl");
    const box = neu("div", "lp-tl-box");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-labelledby", "lp-tl-h");
    box.tabIndex = -1;

    const kopf = neu("div", "lp-tl-kopf");
    const h = neu("h2", "", "Link und QR-Code");
    h.id = "lp-tl-h";
    const zu = knopf("lp-tl-x", "", "Schließen");
    zu.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>';   // feste Zeichenkette
    kopf.append(h, zu);

    const wahlBox = neu("div", "lp-tl-wahl");
    wahlBox.setAttribute("role", "group");
    wahlBox.setAttribute("aria-label", "Welche Seite soll geöffnet werden?");
    wahlBox.hidden = true;

    const qr = neu("div", "lp-tl-qr");
    qr.setAttribute("role", "img");
    const hinweis = neu("p", "lp-tl-hinweis");
    const url = neu("p", "lp-tl-url");
    const aktionen = neu("div", "lp-tl-aktionen");
    const status = neu("p", "lp-tl-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    const kopierBtn = knopf("lp-tl-b voll", "Link kopieren");
    const teilBtn = knopf("lp-tl-b", "Per App teilen");
    teilBtn.hidden = !navigator.share;
    const grossBtn = knopf("lp-tl-b", "Groß zeigen");
    grossBtn.setAttribute("aria-pressed", String(gross));
    aktionen.append(kopierBtn, teilBtn, grossBtn);

    const hinweisNetz = neu("p", "lp-tl-note", "Du hast diese Seite als Datei auf dem Gerät geöffnet. Öffne das Portal über seine Internetadresse, dann gibt es einen QR-Code.");

    box.append(kopf, wahlBox, qr, hinweis, url, aktionen, status);
    if (!netz) { qr.hidden = true; box.insertBefore(hinweisNetz, hinweis); }
    huelle.appendChild(box);

    function zeichnen() {
      url.textContent = wahl.url;
      hinweis.textContent = wahl.hinweis;
      qr.setAttribute("aria-label", "QR-Code für den Link: " + wahl.label);
      status.textContent = "";
      huelle.classList.toggle("gross", gross);
      if (!netz) return;
      try { qr.innerHTML = qrSvg(wahl.url); }       // Ausgabe der lokalen Bibliothek: feste Form, die Adresse steckt nur in den Punkten
      catch (e) { qr.textContent = "Der QR-Code konnte nicht erstellt werden. Nutze den Link."; }
    }

    function optionenZeigen(liste) {
      wahlBox.textContent = "";
      liste.forEach(o => {
        const b = knopf("", o.label);
        b.setAttribute("aria-pressed", String(o === wahl));
        b.addEventListener("click", () => {
          wahl = o;
          wahlBox.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
          zeichnen();
        });
        wahlBox.appendChild(b);
      });
      wahlBox.hidden = liste.length < 2;
    }

    /* ---------- Bedienung ---------- */
    function schliessen() {
      if (!offen) return;
      window.removeEventListener("keydown", taste, true);
      huelle.remove();
      document.documentElement.classList.remove("lp-tl-offen");
      offen = null;
      const o = opts && opts.opener;
      if (o && document.contains(o)) { try { o.focus(); } catch (e) { /* ohne Fokus weiter */ } }
    }
    function taste(e) {
      /* Solange das Fenster offen ist, gehören alle Tasten dem Fenster (Pfeile blättern keine Folie, P, T, L tun nichts) */
      const k = String(e.key || "");
      if (k === "Escape" || ((k === "q" || k === "Q") && !e.ctrlKey && !e.metaKey && !e.altKey)) {
        e.preventDefault(); e.stopImmediatePropagation(); schliessen(); return;
      }
      if (k === "Tab") {
        const f = [].slice.call(box.querySelectorAll("button")).filter(b => !b.hidden && !b.closest("[hidden]"));
        if (f.length) {
          const erster = f[0], letzter = f[f.length - 1], jetzt = document.activeElement;
          if (!box.contains(jetzt)) { e.preventDefault(); erster.focus(); }
          else if (e.shiftKey && (jetzt === erster || jetzt === box)) { e.preventDefault(); letzter.focus(); }
          else if (!e.shiftKey && jetzt === letzter) { e.preventDefault(); erster.focus(); }
        }
      }
      e.stopPropagation();
    }

    zu.addEventListener("click", schliessen);
    huelle.addEventListener("click", e => { if (e.target === huelle) schliessen(); });
    kopierBtn.addEventListener("click", () => {
      kopieren(wahl.url).then(ok => {
        status.textContent = ok ? "Link kopiert." : "Kopieren hat nicht geklappt. Markiere die Adresse und kopiere sie.";
      });
    });
    teilBtn.addEventListener("click", () => {
      if (!navigator.share) return;
      const titel = (document.body.dataset.title || document.title || "Lernportal").replace(/\s*[–-]\s*Lernportal\s*$/, "");
      navigator.share({ title: titel, url: wahl.url }).catch(() => { /* abgebrochen: nichts tun */ });
    });
    grossBtn.addEventListener("click", () => {
      gross = !gross;
      grossBtn.setAttribute("aria-pressed", String(gross));
      huelle.classList.toggle("gross", gross);
    });

    zeichnen();
    document.body.appendChild(huelle);
    document.documentElement.classList.add("lp-tl-offen");
    window.addEventListener("keydown", taste, true);
    offen = { schliessen };
    box.focus();

    /* Stundenseite nachreichen, sobald klar ist, dass es sie gibt */
    stundenseite().then(s => {
      if (!s || offen === null) return;
      optionsListe.push(s);
      optionenZeigen(optionsListe);
    });
    optionenZeigen(optionsListe);
  }

  function open(opts) {
    if (offen) return Promise.resolve();
    const stamm = STAMM || (/^(\.\.\/|\.\/)+$/.test(document.body.dataset.root || "") ? document.body.dataset.root : "./");
    const lade = css(stamm + "assets/css/teilen.css")
      .then(() => (typeof window.qrcode === "function" || !/^https?:$/.test(location.protocol)) ? null : skript(stamm + "assets/js/qrcode.js"));
    return lade.then(() => { if (!offen) fenster(opts || {}); });
  }

  window.LPTeilen = { open };
})();
