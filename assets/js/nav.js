/* Lernportal – Navigation der Portalseiten. Eine Quelle für alle Seiten:
   Ändert sich die Navigation, ändert sich nur die Liste SEITEN in dieser Datei.
   Einbinden mit defer, nach prefs.js:  <script src="…/assets/js/nav.js" defer></script>
   Breite Fenster: Links in der Kopfleiste (Kernbereiche und „Mehr“).
   Schmale Fenster (Handy): feste Leiste am unteren Rand mit „Mehr“ als Blatt.
   Die Links im HTML (<nav class="top-nav">) bleiben als Rückfall ohne JavaScript stehen. */
(() => {
  "use strict";
  const body = document.body;
  const kopfNav = document.querySelector("nav.top-nav");
  if (!body || !kopfNav) return;

  /* nur relative Wurzelpfade wie "../" zulassen */
  const r = String(body.dataset.root || "");
  const root = /^(\.\.\/)*$/.test(r) ? r : "";

  /* ort: "leiste" = immer sichtbar, "mehr" = unter „Mehr“. kurz: Wort in der unteren Leiste */
  const SEITEN = [
    { id: "start", titel: "Start", pfad: "", symbol: "start", nurUnten: true },
    { id: "biologie", titel: "Biologie", pfad: "biologie/", symbol: "blatt", ort: "leiste" },
    { id: "geografie", titel: "Geografie", pfad: "geografie/", symbol: "erde", ort: "leiste" },
    { id: "alle", titel: "Alle Materialien", kurz: "Alle", pfad: "alle/", symbol: "stapel", ort: "leiste" },
    { id: "begriffe", titel: "Begriffe", pfad: "begriffe/", ort: "mehr" },
    { id: "bne", titel: "Nachhaltigkeit", pfad: "bne/", ort: "mehr" },
    { id: "nachrichten", titel: "Nachrichten", pfad: "nachrichten/", ort: "mehr" },
    { id: "hilfe", titel: "Hilfe", pfad: "hilfe/", ort: "mehr" }
  ];
  const SYMBOLE = {
    start: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9V21h13V9"/>',
    blatt: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    erde: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5c2.8 2.7 4 5.9 4 9.5s-1.2 6.8-4 9.5c-2.8-2.7-4-5.9-4-9.5s1.2-6.8 4-9.5z"/>',
    stapel: '<path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
    mehr: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>'
  };
  const symbol = name => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${SYMBOLE[name] || ""}</svg>`;

  /* Welcher Bereich ist gerade offen? */
  function aktuell() {
    const seite = body.dataset.page || "";
    const fach = body.dataset.subject || (seite === "themenfeld" ? new URLSearchParams(location.search).get("fach") : "") || "";
    if (seite === "home") return "start";
    if (fach === "Biologie") return "biologie";
    if (fach === "Geografie") return "geografie";
    if (seite === "woche") return "nachrichten";
    return SEITEN.some(s => s.id === seite) ? seite : "";
  }
  const hier = aktuell();

  function link(seite, text) {
    const a = document.createElement("a");
    a.href = root + seite.pfad || "./";
    a.textContent = text;
    if (seite.id === hier) a.setAttribute("aria-current", "page");
    return a;
  }

  /* ---------- Kopfleiste (breite Fenster) ---------- */
  kopfNav.textContent = "";
  kopfNav.setAttribute("aria-label", "Hauptnavigation");
  const kern = document.createElement("div");
  kern.className = "nav-group nav-primary";
  SEITEN.filter(s => s.ort === "leiste").forEach(s => kern.append(link(s, s.titel)));
  const mehr = document.createElement("details");
  mehr.className = "nav-more";
  const mehrKopf = document.createElement("summary");
  mehrKopf.textContent = "Mehr";
  mehrKopf.setAttribute("aria-label", "Weitere Bereiche anzeigen");
  const mehrMenue = document.createElement("div");
  mehrMenue.className = "nav-more-menu";
  SEITEN.filter(s => s.ort === "mehr").forEach(s => {
    if (s.id === hier) mehr.classList.add("has-current");
    mehrMenue.append(link(s, s.titel));
  });
  mehr.append(mehrKopf, mehrMenue);
  kopfNav.append(kern, mehr);

  /* ---------- Leiste am unteren Rand (schmale Fenster) ---------- */
  const leiste = document.createElement("nav");
  leiste.className = "tabbar";
  leiste.setAttribute("aria-label", "Hauptnavigation");
  SEITEN.filter(s => s.nurUnten || s.ort === "leiste").forEach(s => {
    const a = link(s, "");
    a.className = "tab tab-" + s.id;
    a.innerHTML = symbol(s.symbol);                       // feste, eigene Zeichenkette
    const wort = document.createElement("span");
    wort.textContent = s.kurz || s.titel;
    a.append(wort);
    leiste.append(a);
  });
  const mehrKnopf = document.createElement("button");
  mehrKnopf.type = "button";
  mehrKnopf.className = "tab tab-mehr";
  mehrKnopf.innerHTML = symbol("mehr") + "<span>Mehr</span>";
  mehrKnopf.setAttribute("aria-expanded", "false");
  mehrKnopf.setAttribute("aria-controls", "tab-blatt");
  const imMehr = SEITEN.some(s => s.ort === "mehr" && s.id === hier);
  if (imMehr) mehrKnopf.classList.add("ist-hier");
  leiste.append(mehrKnopf);

  const blatt = document.createElement("div");
  blatt.className = "tab-blatt";
  blatt.id = "tab-blatt";
  blatt.hidden = true;
  const blattTitel = document.createElement("p");
  blattTitel.className = "tab-blatt-titel";
  blattTitel.textContent = "Mehr";
  blatt.append(blattTitel);
  SEITEN.filter(s => s.ort === "mehr").forEach(s => blatt.append(link(s, s.titel)));

  const schleier = document.createElement("div");
  schleier.className = "tab-schleier";
  schleier.hidden = true;

  body.append(schleier, blatt, leiste);
  body.classList.add("hat-tabbar");

  function blattOffen(offen) {
    blatt.hidden = !offen;
    schleier.hidden = !offen;
    mehrKnopf.setAttribute("aria-expanded", String(offen));
    if (offen) { const erster = blatt.querySelector("a"); if (erster) erster.focus(); }
  }
  mehrKnopf.addEventListener("click", () => blattOffen(blatt.hidden));
  schleier.addEventListener("click", () => blattOffen(false));
  blatt.addEventListener("click", event => { if (event.target.closest("a")) blattOffen(false); });

  /* Schließen: Klick daneben, Escape, Wechsel auf breites Fenster */
  document.addEventListener("click", event => { if (!mehr.contains(event.target)) mehr.open = false; });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (mehr.open) { mehr.open = false; mehrKopf.focus(); }
    if (!blatt.hidden) { blattOffen(false); mehrKnopf.focus(); }
  });
  const breit = window.matchMedia("(min-width: 46rem)");
  const beiWechsel = () => { if (breit.matches) blattOffen(false); };
  if (breit.addEventListener) breit.addEventListener("change", beiWechsel);
  /* ---------- Teilen (nur Startseite): Link und QR-Code ----------
     teilen.js wird erst beim Antippen nachgeladen. Auf Seiten mit Filtern in der Adresse
     (alle/, begriffe/ …) fehlt der Knopf bewusst, weil teilen.js den Suchteil der Adresse weglässt. */
  if (hier === "start") {
    const werkzeuge = document.querySelector(".header-tools");
    if (werkzeuge && werkzeuge.parentNode) {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "icon-btn";
      t.id = "teilen-btn";
      t.setAttribute("aria-label", "Link und QR-Code zeigen");
      t.title = "Link und QR-Code";
      t.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M14 14h2.5v2.5H14zM19 14v.01M14 19.5v.01M17 19h3.5v1.5"/></svg>';
      t.addEventListener("click", () => {
        const los = () => window.LPTeilen && window.LPTeilen.open({ opener: t });
        if (window.LPTeilen) { los(); return; }
        const sk = document.createElement("script");
        sk.src = root + "assets/js/teilen.js";
        sk.onload = los;
        document.head.appendChild(sk);
      });
      werkzeuge.parentNode.insertBefore(t, werkzeuge);
    }
  }
})();
