/* Lernportal – Bausteine für Lernmodule auf Vorlagenseiten (body.lp-seite).
   Gehört zu assets/css/lernmodul.css. Fachinhalte stehen nie hier, nur im HTML der Seite.
   Es wird nichts gespeichert und nichts übertragen. Beim Neuladen ist alles wieder leer.
   Alle Bausteine gehen mit Maus, Finger und Tastatur (es sind echte Knöpfe).

   [data-reihe]     Reihenfolge legen. Im .lm-vorrat liegen Karten button.lm-karte[data-pos="1"], [data-pos="2"] …
                    Das Skript mischt sie und baut die Plätze in ol.lm-kette. Antippen legt eine Karte auf den
                    nächsten freien Platz, antippen auf dem Platz legt sie zurück. Knöpfe .lm-pruefen und .lm-neu,
                    Rückmeldung in .lm-rm. Gleiche Position für mehrere Karten erlaubt (data-pos="2|3").
   [data-ablage]    Karten in Felder legen. Karten button.lm-karte[data-ziel="zns"] im .lm-vorrat, Felder
                    .lm-feld[data-feld="zns"] mit button.lm-feld-ziel und .lm-inhalt. Karte antippen, dann Feld
                    antippen (am Rechner auch ziehen). Mehrere richtige Felder: data-ziel="a|b".
   [data-jn]        Tabelle mit td.lm-jn[data-ok="ja"|"nein"]. Antippen wechselt: leer, ja, nein. .lm-pruefen, .lm-rm
   [data-entdecker] Eingebundene SVG mit Teilen .lm-teil[data-teil]. Die Liste ul.lm-daten enthält je Teil
                    li[data-teil][data-name][data-silben] mit der Funktion als Text. Ohne JavaScript bleibt die
                    Liste lesbar. Anzeige in .lm-info, Knöpfe in .lm-knoepfe, Zähler in .lm-zaehler.
   [data-signal]    Signal-Modell. SVG mit Pfaden path[id], optional data-ende="Text" (erscheint im Protokoll),
                    data-pause="ms" (Wartezeit am Ende) und data-zeige="id …" (Elemente .lm-zeigen erscheinen).
                    Knöpfe button[data-ablauf="a; b+c"]: Semikolon = nacheinander, Plus = gleichzeitig.
                    Tempo in Einheiten der SVG je Sekunde: data-tempo am Baustein (Standard 120).
                    Protokoll ol.lm-protokoll mit Modellzeit.
   [data-lernlandkarte data-speicher="name"]
                    Lernlandkarte einer Reihe. Stationen .lm-feld[data-feld] mit button.lm-feld-ziel und .lm-inhalt,
                    Eingabe input.llk-neu und button.llk-dazu, optional textarea.llk-import mit button.llk-einfuegen
                    (Text aus dem Rückkanal, eine Frage je Zeile), Vorrat .lm-vorrat. Mythen als
                    .llk-mythos[data-id] mit der Aussage als Text, Liste .llk-mythen. Karten-Name input.llk-name,
                    Knöpfe .llk-laden, .llk-export, .llk-importdatei (input type=file), .llk-leeren, Liste .llk-namen.
                    Speichert nur in diesem Browser (localStorage), je Karten-Name getrennt. Keine Lösungen.
   [data-ichkann data-speicher="name"]
                    Ich-kann-Liste vorher und nachher: ol mit li je Satz. Drei Stufen (noch nicht, teilweise, sicher).
                    Speichert nur in diesem Browser.
   [data-synapse]   Synapsen-Baukasten. SVG svg.sy-svg mit Teilen [data-sy]: "signalweg" (Pfad zum Endknöpfchen),
                    "blaeschen" (circle mit cx, cy), "transporter", "rezeptor", "spalt" (rect), "anzeige" (rect mit
                    data-max-breite) und "anzeige-text". Texte fürs Protokoll in ul.sy-ereignisse li[data-e="ankunft|
                    verschmelzen|spalt|andocken|signal|zurueck|abbau|ende"],
                    optional li[data-e="ruhe"] (Status, wenn ohne Signal Rezeptoren besetzt sind). Stoff-Auswahl input[name="sy-stoff"] mit
                    data-wirkung="ohne|rezeptor-blocker|wiederaufnahme-hemmer|wie-transmitter" und label[for].
                    Knöpfe .sy-senden, .sy-pause, .sy-zeitlupe, .sy-beschriftung-knopf, .sy-reset. Ausgabe:
                    ol.lm-protokoll, .sy-status, svg.sy-verlauf (Pfade .sy-alt, .sy-neu), table.sy-vergleich. */
(function () {
  "use strict";

  function alle(el, sel) { return [].slice.call(el.querySelectorAll(sel)); }
  function mische(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function passt(liste, wert) { return String(liste || "").split("|").indexOf(String(wert)) >= 0; }
  function marke(el, ok) {
    var m = el.querySelector(".lm-marke");
    if (!m) { m = document.createElement("span"); m.className = "lm-marke"; el.appendChild(m); }
    m.textContent = ok ? " ✓ richtig" : " ✗ noch nicht";
  }
  function ohneMarke(el) {
    el.classList.remove("ok", "falsch");
    var m = el.querySelector(".lm-marke"); if (m) m.remove();
  }
  function meldung(root, text, ok) {
    var rm = root.querySelector(".lm-rm");
    if (!rm) return;
    rm.textContent = text;
    rm.classList.toggle("ok", !!ok);
  }
  function ergebnis(root, richtig, gesamt) {
    if (richtig === gesamt) meldung(root, "✓ Alles richtig! " + richtig + " von " + gesamt + ".", true);
    else meldung(root, richtig + " von " + gesamt + " richtig. Ändere die markierten Stellen (✗) und prüfe noch einmal.", false);
  }

  /* ---------- Reihenfolge ---------- */
  function reihe(root) {
    var vorrat = root.querySelector(".lm-vorrat"), kette = root.querySelector(".lm-kette");
    if (!vorrat || !kette) return;
    var karten = alle(vorrat, ".lm-karte");
    var plaetze = karten.map(function (_, i) {
      var li = document.createElement("li"); li.className = "lm-platz";
      var leer = document.createElement("span"); leer.className = "lm-leer"; leer.textContent = "Platz " + (i + 1) + ": frei";
      li.appendChild(leer); kette.appendChild(li); return li;
    });
    function zuruecksetzenMarken() { karten.forEach(ohneMarke); meldung(root, "", false); }
    function leeren(li) { var l = li.querySelector(".lm-leer"); if (l) l.hidden = false; }
    function mischen() {
      var m = mische(karten.slice());
      var geordnet = m.every(function (k, i) { return passt(k.getAttribute("data-pos"), i + 1); });
      if (geordnet && m.length > 1) m.push(m.shift());
      m.forEach(function (k) { vorrat.appendChild(k); });
    }
    karten.forEach(function (k) {
      k.type = "button";
      k.addEventListener("click", function () {
        zuruecksetzenMarken();
        var platz = k.closest(".lm-platz");
        if (platz) { vorrat.appendChild(k); leeren(platz); k.focus(); return; }
        var frei = plaetze.filter(function (p) { return !p.querySelector(".lm-karte"); })[0];
        if (!frei) return;
        frei.querySelector(".lm-leer").hidden = true;
        frei.appendChild(k);
        var naechste = vorrat.querySelector(".lm-karte");
        if (naechste) naechste.focus(); else k.focus();
      });
    });
    var pr = root.querySelector(".lm-pruefen"), neu = root.querySelector(".lm-neu");
    if (pr) pr.addEventListener("click", function () {
      if (vorrat.querySelector(".lm-karte")) { meldung(root, "Lege zuerst alle Karten auf einen Platz.", false); return; }
      var richtig = 0;
      plaetze.forEach(function (p, i) {
        var k = p.querySelector(".lm-karte"), ok = passt(k.getAttribute("data-pos"), i + 1);
        ohneMarke(k); k.classList.add(ok ? "ok" : "falsch"); marke(k, ok); if (ok) richtig++;
      });
      ergebnis(root, richtig, plaetze.length);
    });
    if (neu) neu.addEventListener("click", function () {
      zuruecksetzenMarken();
      karten.forEach(function (k) { vorrat.appendChild(k); });
      plaetze.forEach(leeren);
      mischen();
    });
    mischen();
  }

  /* ---------- Ablage ---------- */
  function ablage(root) {
    var vorrat = root.querySelector(".lm-vorrat");
    var karten = alle(root, ".lm-karte"), felder = alle(root, ".lm-feld");
    if (!vorrat || !felder.length) return;
    var gewaehlt = null;
    function waehle(k) {
      gewaehlt = k;
      karten.forEach(function (x) { x.setAttribute("aria-pressed", x === k ? "true" : "false"); });
      felder.forEach(function (f) { f.classList.toggle("ziel", !!k); });
    }
    function zuruecksetzenMarken() { karten.forEach(ohneMarke); meldung(root, "", false); }
    function ablegen(k, feld) {
      zuruecksetzenMarken();
      feld.querySelector(".lm-inhalt").appendChild(k);
      waehle(null);
    }
    mische(karten.slice()).forEach(function (k) { vorrat.appendChild(k); });
    karten.forEach(function (k, i) {
      k.type = "button";
      k.setAttribute("aria-pressed", "false");
      k.draggable = true;
      k.id = k.id || ("lm-k-" + Math.random().toString(36).slice(2, 8) + i);
      k.addEventListener("click", function () {
        if (k.closest(".lm-feld")) { zuruecksetzenMarken(); vorrat.appendChild(k); waehle(null); k.focus(); return; }
        waehle(gewaehlt === k ? null : k);
      });
      k.addEventListener("dragstart", function (e) { try { e.dataTransfer.setData("text/plain", k.id); } catch (x) { /* alter Browser */ } waehle(k); });
    });
    felder.forEach(function (f) {
      var ziel = f.querySelector(".lm-feld-ziel");
      ziel.type = "button";
      ziel.addEventListener("click", function () {
        if (!gewaehlt) { meldung(root, "Tippe zuerst eine Karte an. Tippe dann auf das passende Feld.", false); return; }
        var k = gewaehlt; ablegen(k, f); k.focus();
      });
      f.addEventListener("dragover", function (e) { e.preventDefault(); });
      f.addEventListener("drop", function (e) {
        e.preventDefault();
        var id = ""; try { id = e.dataTransfer.getData("text/plain"); } catch (x) { /* alter Browser */ }
        var k = id ? document.getElementById(id) : gewaehlt;
        if (k && root.contains(k)) ablegen(k, f);
      });
    });
    vorrat.addEventListener("dragover", function (e) { e.preventDefault(); });
    vorrat.addEventListener("drop", function (e) {
      e.preventDefault();
      var id = ""; try { id = e.dataTransfer.getData("text/plain"); } catch (x) { /* alter Browser */ }
      var k = id ? document.getElementById(id) : null;
      if (k && root.contains(k)) { zuruecksetzenMarken(); vorrat.appendChild(k); waehle(null); }
    });
    var pr = root.querySelector(".lm-pruefen"), neu = root.querySelector(".lm-neu");
    if (pr) pr.addEventListener("click", function () {
      if (vorrat.querySelector(".lm-karte")) { meldung(root, "Lege zuerst alle Karten in ein Feld.", false); return; }
      var richtig = 0;
      karten.forEach(function (k) {
        var ok = passt(k.getAttribute("data-ziel"), k.closest(".lm-feld").getAttribute("data-feld"));
        ohneMarke(k); k.classList.add(ok ? "ok" : "falsch"); marke(k, ok); if (ok) richtig++;
      });
      ergebnis(root, richtig, karten.length);
    });
    if (neu) neu.addEventListener("click", function () {
      zuruecksetzenMarken(); waehle(null);
      mische(karten.slice()).forEach(function (k) { vorrat.appendChild(k); });
    });
  }

  /* ---------- Ja/Nein-Tabelle ---------- */
  function jn(root) {
    var zellen = alle(root, "td.lm-jn");
    var FOLGE = ["", "ja", "nein"], TEXT = { "": "?", ja: "ja", nein: "nein" };
    var kopf = alle(root, "thead th").map(function (th) { return th.textContent.trim(); });
    zellen.forEach(function (td) {
      var b = document.createElement("button"); b.type = "button";
      var spalte = kopf[td.cellIndex] || "", zeile = td.parentNode.querySelector("th");
      function setze(w) {
        b.setAttribute("data-wert", w); b.textContent = TEXT[w];
        b.setAttribute("aria-label", (zeile ? zeile.textContent.trim() + " – " : "") + spalte + ": " + (w || "noch offen"));
      }
      setze("");
      b.addEventListener("click", function () {
        ohneMarke(td); meldung(root, "", false);
        setze(FOLGE[(FOLGE.indexOf(b.getAttribute("data-wert")) + 1) % FOLGE.length]);
      });
      td.textContent = ""; td.appendChild(b);
    });
    var pr = root.querySelector(".lm-pruefen");
    if (pr) pr.addEventListener("click", function () {
      var offen = zellen.some(function (td) { return !td.querySelector("button").getAttribute("data-wert"); });
      if (offen) { meldung(root, "Entscheide zuerst in jedem Feld: ja oder nein.", false); return; }
      var richtig = 0;
      zellen.forEach(function (td) {
        var ok = td.querySelector("button").getAttribute("data-wert") === td.getAttribute("data-ok");
        ohneMarke(td); td.classList.add(ok ? "ok" : "falsch"); marke(td, ok); if (ok) richtig++;
      });
      ergebnis(root, richtig, zellen.length);
    });
  }

  /* ---------- Entdecker ---------- */
  function entdecker(root) {
    var daten = alle(root, ".lm-daten li"), info = root.querySelector(".lm-info");
    var leiste = root.querySelector(".lm-knoepfe"), zaehler = root.querySelector(".lm-zaehler");
    if (!daten.length || !info) return;
    var liste = root.querySelector(".lm-daten"); if (liste) liste.hidden = true;
    var gesehen = {}, knoepfe = {};
    var teile = alle(root, ".lm-teil");
    function zeige(id) {
      var d = daten.filter(function (li) { return li.getAttribute("data-teil") === id; })[0];
      if (!d) return;
      gesehen[id] = true;
      teile.forEach(function (t) { t.classList.toggle("aktiv", t.getAttribute("data-teil") === id); });
      Object.keys(knoepfe).forEach(function (k) {
        knoepfe[k].setAttribute("aria-pressed", k === id ? "true" : "false");
        knoepfe[k].classList.toggle("gesehen", !!gesehen[k]);
      });
      info.innerHTML = "";
      var h = document.createElement("h3"); h.textContent = d.getAttribute("data-name"); info.appendChild(h);
      var s = document.createElement("p"); s.className = "lm-silben"; s.textContent = "Silben: " + d.getAttribute("data-silben"); info.appendChild(s);
      var p = document.createElement("p"); p.textContent = d.textContent.trim(); info.appendChild(p);
      if (zaehler) zaehler.textContent = Object.keys(gesehen).length + " von " + daten.length + " Teilen angesehen.";
    }
    daten.forEach(function (d) {
      var id = d.getAttribute("data-teil");
      if (leiste) {
        var li = document.createElement("li"), b = document.createElement("button");
        b.type = "button"; b.textContent = d.getAttribute("data-name"); b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () { zeige(id); });
        li.appendChild(b); leiste.appendChild(li); knoepfe[id] = b;
      }
    });
    teile.forEach(function (t) {
      var id = t.getAttribute("data-teil");
      var d = daten.filter(function (li) { return li.getAttribute("data-teil") === id; })[0];
      t.setAttribute("tabindex", "0"); t.setAttribute("role", "button");
      if (d) t.setAttribute("aria-label", d.getAttribute("data-name"));
      t.addEventListener("click", function () { zeige(id); });
      t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zeige(id); } });
    });
    info.setAttribute("aria-live", "polite");
    info.innerHTML = "<p>Tippe ein Teil in der Abbildung an oder wähle es in der Liste.</p>";
    if (zaehler) zaehler.textContent = "0 von " + daten.length + " Teilen angesehen.";
  }

  /* ---------- Signal-Modell ---------- */
  function signal(root) {
    var svg = root.querySelector("svg"), protokoll = root.querySelector(".lm-protokoll");
    if (!svg) return;
    var tempo = +root.getAttribute("data-tempo") || 120;
    var knoepfe = alle(root, "button[data-ablauf]");
    var NS = "http://www.w3.org/2000/svg", lauf = 0;
    function warte(ms, id) { return new Promise(function (ok) { setTimeout(function () { ok(id === lauf); }, ms); }); }
    function formatiere(ms) { return (ms / 1000).toFixed(1).replace(".", ",") + " s"; }
    function fahre(id, start, nr) {
      var p = svg.getElementById ? svg.getElementById(id) : svg.querySelector("#" + id);
      if (!p || !p.getTotalLength) return Promise.resolve(true);
      var L = p.getTotalLength(), dauer = L / tempo * 1000;
      var punkt = document.createElementNS(NS, "circle");
      punkt.setAttribute("r", "7"); punkt.setAttribute("class", "lm-punkt"); svg.appendChild(punkt);
      return new Promise(function (fertig) {
        var t0 = null;
        function schritt(t) {
          if (nr !== lauf) { punkt.remove(); fertig(false); return; }
          if (t0 === null) t0 = t;
          var f = Math.min(1, (t - t0) / dauer), q = p.getPointAtLength(f * L);
          punkt.setAttribute("cx", q.x); punkt.setAttribute("cy", q.y);
          if (f < 1) { requestAnimationFrame(schritt); return; }
          punkt.remove();
          warte(+p.getAttribute("data-pause") || 0, nr).then(function (weiter) {
            if (!weiter) { fertig(false); return; }
            (p.getAttribute("data-zeige") || "").split(/\s+/).forEach(function (z) {
              var el = z && (svg.getElementById ? svg.getElementById(z) : null); if (el) el.classList.add("lm-an");
            });
            var ende = p.getAttribute("data-ende");
            if (ende && protokoll) {
              var li = document.createElement("li"), zeit = document.createElement("span");
              zeit.className = "lm-zeit"; zeit.textContent = formatiere(performance.now() - start);
              li.appendChild(zeit); li.appendChild(document.createTextNode(": " + ende)); protokoll.appendChild(li);
            }
            fertig(true);
          });
        }
        requestAnimationFrame(schritt);
      });
    }
    knoepfe.forEach(function (b) {
      b.type = "button";
      b.addEventListener("click", function () {
        var nr = ++lauf, start = performance.now();
        alle(svg, ".lm-an").forEach(function (e) { e.classList.remove("lm-an"); });
        alle(svg, ".lm-punkt").forEach(function (e) { e.remove(); });
        if (protokoll) protokoll.innerHTML = "";
        knoepfe.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var schritte = b.getAttribute("data-ablauf").split(";").map(function (s) { return s.split("+").map(function (x) { return x.trim(); }).filter(Boolean); });
        schritte.reduce(function (kette, gruppe) {
          return kette.then(function (weiter) {
            if (!weiter) return false;
            return Promise.all(gruppe.map(function (id) { return fahre(id, start, nr); })).then(function (r) { return r.every(Boolean); });
          });
        }, Promise.resolve(true));
      });
    });
  }


  /* ---------- Synapsen-Baukasten ---------- */
  function synapse(root) {
    var svg = root.querySelector("svg.sy-svg"); if (!svg) return;
    var NS = "http://www.w3.org/2000/svg";
    function teil(n) { return svg.querySelector('[data-sy="' + n + '"]'); }
    function teile(n) { return alle(svg, '[data-sy="' + n + '"]'); }
    function mitte(e) { var b = e.getBBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, b: b }; }
    var spalt = teil("spalt").getBBox();
    var weg = teil("signalweg"), balken = teil("anzeige"), balkenText = teil("anzeige-text");
    var balkenMax = balken ? +balken.getAttribute("data-max-breite") || +balken.getAttribute("width") : 0;
    var blaeschen = teile("blaeschen").map(function (b) { return { el: b, x: +b.getAttribute("cx"), y: +b.getAttribute("cy"), voll: true }; });
    var rezeptoren = teile("rezeptor").map(function (r) { var m = mitte(r); return { el: r, x: m.x, y: spalt.y + spalt.height, frei: true, gesperrt: false }; });
    var transporter = teile("transporter").map(function (t) { var m = mitte(t); return { el: t, x: m.x }; });
    var texte = {}; alle(root, ".sy-ereignisse [data-e]").forEach(function (li) { texte[li.getAttribute("data-e")] = li.textContent.trim(); });
    var protokoll = root.querySelector(".lm-protokoll"), status = root.querySelector(".sy-status");
    var verlauf = root.querySelector("svg.sy-verlauf"), vergleich = root.querySelector(".sy-vergleich tbody");
    var schicht = document.createElementNS(NS, "g"); schicht.setAttribute("class", "sy-teilchen"); svg.appendChild(schicht);
    var punkt = document.createElementNS(NS, "circle"); punkt.setAttribute("r", "8"); punkt.setAttribute("class", "lm-punkt"); punkt.style.display = "none"; svg.appendChild(punkt);

    var stoff = "ohne", stoffName = "", zeitlupe = false, pause = false;
    var mol = [], t = 0, letzt = null, lauf = null, kurve = [], alteKurve = null, gesehen = {}, maxSig = 0, sigAn = null, sigAus = null;

    function wirkung() {
      var r = root.querySelector('input[name="sy-stoff"]:checked');
      stoff = r ? r.getAttribute("data-wirkung") : "ohne";
      var l = r && root.querySelector('label[for="' + r.id + '"]'); stoffName = l ? l.textContent.trim() : "";
    }
    function zeit(s) { return s.toFixed(1).replace(".", ",") + " s"; }
    function melde(e) {
      if (gesehen[e] || !texte[e]) return; gesehen[e] = true;
      if (!protokoll) return;
      var li = el("li"), z = el("span", "lm-zeit", zeit(t - t0)); li.appendChild(z); li.appendChild(document.createTextNode(": " + texte[e])); protokoll.appendChild(li);
    }
    function sage(s) { if (status) status.textContent = s; }
    function neuesTeilchen(x, y, art) {
      var e;
      if (art === "x") { e = document.createElementNS(NS, "rect"); e.setAttribute("width", "9"); e.setAttribute("height", "9"); e.setAttribute("class", "sy-x"); }
      else { e = document.createElementNS(NS, "circle"); e.setAttribute("r", "4.5"); e.setAttribute("class", "sy-tr"); }
      schicht.appendChild(e);
      var m = { el: e, x: x, y: y, art: art, frei: true, r: null, bis: 0 }; mol.push(m); setze(m); return m;
    }
    function setze(m) {
      if (m.art === "x") { m.el.setAttribute("x", (m.x - 4.5).toFixed(1)); m.el.setAttribute("y", (m.y - 4.5).toFixed(1)); }
      else { m.el.setAttribute("cx", m.x.toFixed(1)); m.el.setAttribute("cy", m.y.toFixed(1)); }
    }
    function entferne(m) { m.el.remove(); mol.splice(mol.indexOf(m), 1); }
    function zufallNormal() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

    function rezeptorenZeichnen() {
      rezeptoren.forEach(function (r) { r.el.classList.toggle("sy-besetzt", !r.frei); r.el.classList.toggle("sy-gesperrt", r.gesperrt); });
      transporter.forEach(function (tp) { tp.el.classList.toggle("sy-gesperrt", stoff === "wiederaufnahme-hemmer"); });
    }
    function signalStaerke() {
      var n = rezeptoren.filter(function (r) { return !r.frei; }).length;
      return Math.round(n / rezeptoren.length * 100);
    }
    function anzeige(s) {
      if (balken) balken.setAttribute("width", (balkenMax * s / 100).toFixed(1));
      if (balkenText) balkenText.textContent = s + " %";
    }
    function zeichneVerlauf() {
      if (!verlauf) return;
      var W = 600, H = 120, L = 40, T = 10, B = 100, tMax = 12;
      function pfad(k) { return k.map(function (p, i) { return (i ? "L" : "M") + (L + Math.min(p[0], tMax) / tMax * (W - L - 10)).toFixed(1) + " " + (B - p[1] / 100 * (B - T)).toFixed(1); }).join(" "); }
      var a = verlauf.querySelector(".sy-alt"), n = verlauf.querySelector(".sy-neu");
      if (a) a.setAttribute("d", alteKurve && alteKurve.length ? pfad(alteKurve) : "");
      if (n) n.setAttribute("d", kurve.length ? pfad(kurve) : "");
    }

    function stoffAnwenden() {
      wirkung();
      rezeptoren.forEach(function (r, i) { r.gesperrt = stoff === "rezeptor-blocker" && i % 3 !== 0; });
      mol.filter(function (m) { return m.art === "x"; }).forEach(function (m) { if (m.r) m.r.frei = true; entferne(m); });
      if (stoff === "wie-transmitter") for (var i = 0; i < 6; i++) neuesTeilchen(spalt.x + 20 + Math.random() * (spalt.width - 40), spalt.y + 8 + Math.random() * (spalt.height - 16), "x");
      rezeptorenZeichnen();
      if (!lauf) start(false);
    }

    function schritt(jetzt) {
      if (letzt === null) letzt = jetzt;
      var echt = Math.min(0.05, (jetzt - letzt) / 1000); letzt = jetzt;
      if (pause) { lauf = requestAnimationFrame(schritt); return; }
      var dt = echt * (zeitlupe ? 0.35 : 1); t += dt;
      var sigma = 38 * Math.sqrt(dt), oben = spalt.y + 4, unten = spalt.y + spalt.height - 4;
      var hemmer = stoff === "wiederaufnahme-hemmer", rate = hemmer ? 0.45 : 2.2;
      mol.slice().forEach(function (m) {
        if (m.ziel) { /* wird zum Transporter zurückgeholt */
          var dx = m.ziel.x - m.x, dy = spalt.y - 6 - m.y, d = Math.sqrt(dx * dx + dy * dy), v = 260 * dt;
          if (d <= v) { entferne(m); return; }
          m.x += dx / d * v; m.y += dy / d * v; setze(m); return;
        }
        if (m.ausstoss) { m.ausstoss -= dt; m.y += 75 * dt; if (m.ausstoss <= 0) m.ausstoss = 0; }
        if (!m.frei) {
          if (t >= m.bis) { m.frei = true; m.r.frei = true; m.r = null; m.y = unten - 22; m.ruhe = t + 0.5; }
          else { setze(m); return; }
        }
        m.x += zufallNormal() * sigma; m.y += zufallNormal() * sigma + 2 * dt; m.alter = (m.alter || 0) + dt;
        if (m.x < spalt.x + 4) m.x = spalt.x + 4; if (m.x > spalt.x + spalt.width - 4) m.x = spalt.x + spalt.width - 4;
        if (m.y < oben) m.y = oben; if (m.y > unten) m.y = unten;
        if (m.y > unten - 8 && !(m.ruhe > t)) {
          var r = rezeptoren.filter(function (q) { return q.frei && !q.gesperrt && Math.abs(q.x - m.x) < 14; })[0];
          if (r) {
            r.frei = false; m.frei = false; m.r = r; m.x = r.x; m.y = unten - 2;
            m.bis = t + (m.art === "x" ? 1.6 + Math.random() : 0.35 + Math.random() * 0.3);
            if (m.art !== "x") melde("andocken");
            setze(m); return;
          }
        }
        if (m.art !== "x" && !m.ausstoss && m.alter > 0.4 && Math.random() < dt * rate) {
          if (hemmer || !transporter.length) { entferne(m); melde("abbau"); return; }
          m.ziel = transporter.reduce(function (a, q) { return Math.abs(q.x - m.x) < Math.abs(a.x - m.x) ? q : a; });
          melde("zurueck");
          var bl = blaeschen.filter(function (v) { return !v.voll; })[0]; if (bl && Math.random() < 0.15) { bl.voll = true; bl.el.classList.remove("sy-leer"); }
        }
        setze(m);
      });
      rezeptorenZeichnen();
      var s = signalStaerke(); anzeige(s);
      if (gesehen.verschmelzen) {
        kurve.push([t - t0, s]); if (s > maxSig) maxSig = s;
        if (s >= 30) { melde("signal"); if (sigAn === null) sigAn = t; }
        if (sigAn !== null && s < 10 && sigAus === null) sigAus = t;
        if (s >= 10) sigAus = null;
      }
      zeichneVerlauf();
      if (!laufend && texte.ruhe) {
        var ruhe = s > 0 ? texte.ruhe + " " + s + " %" : "";
        if (ruhe && status && status.textContent !== ruhe) sage(ruhe);
      }
      var transmitterDa = mol.some(function (m) { return m.art !== "x"; });
      if (gesehen.verschmelzen && !transmitterDa && !freisetzung) {
        melde("ende"); abschluss();
      }
      lauf = requestAnimationFrame(schritt);
    }
    var t0 = 0, freisetzung = false, laufend = false, laufName = "";
    function start(mitSignal) {
      if (lauf) cancelAnimationFrame(lauf);
      letzt = null; lauf = requestAnimationFrame(schritt);
      if (!mitSignal) return;
    }
    function abschluss() {
      if (!laufend) return; laufend = false;
      var dauer = sigAn === null ? 0 : ((sigAus === null ? t : sigAus) - sigAn);
      if (vergleich) {
        var tr = el("tr");
        tr.appendChild(el("td", null, laufName || "ohne Stoff"));
        tr.appendChild(el("td", "zahl", maxSig + " %"));
        tr.appendChild(el("td", "zahl", zeit(Math.max(0, dauer))));
        vergleich.appendChild(tr);
      }
      sage("Fertig. Stärkstes Signal: " + maxSig + " %. Dauer des Signals: " + zeit(Math.max(0, dauer)) + " Modellzeit.");
      senden.disabled = false;
    }
    function signalSenden() {
      if (laufend) return;
      wirkung(); laufName = stoffName; laufend = true; senden.disabled = true;
      gesehen = {}; if (protokoll) protokoll.innerHTML = ""; alteKurve = kurve.length ? kurve : alteKurve; kurve = []; maxSig = 0; sigAn = null; sigAus = null;
      mol.filter(function (m) { return m.art !== "x"; }).forEach(entferne);
      rezeptoren.forEach(function (r) { if (!mol.some(function (m) { return m.r === r; })) r.frei = true; });
      t0 = t; freisetzung = true; sage("Ein Signal läuft zum Endknöpfchen.");
      var L = weg.getTotalLength(), dauer = 0.9, s0 = null;
      punkt.style.display = "";
      function fahre(jetzt) {
        if (s0 === null) s0 = t;
        var f = Math.min(1, (t - s0) / dauer), q = weg.getPointAtLength(f * L);
        punkt.setAttribute("cx", q.x); punkt.setAttribute("cy", q.y);
        if (f < 1) { requestAnimationFrame(fahre); return; }
        punkt.style.display = "none"; melde("ankunft"); verschmelzen();
      }
      start(true); requestAnimationFrame(fahre);
    }
    function verschmelzen() {
      var volle = blaeschen.filter(function (b) { return b.voll; }), wahl = volle.slice(0, Math.min(3, volle.length));
      if (!wahl.length) { sage("Alle Bläschen sind leer. Warte, bis sie wieder gefüllt sind."); freisetzung = false; laufend = false; senden.disabled = false; return; }
      var s0 = t, dauer = 0.6;
      function bewege() {
        var f = Math.min(1, (t - s0) / dauer);
        wahl.forEach(function (b) { b.el.setAttribute("cy", (b.y + (spalt.y - 14 - b.y) * f).toFixed(1)); });
        if (f < 1) { requestAnimationFrame(bewege); return; }
        melde("verschmelzen");
        wahl.forEach(function (b) {
          for (var i = 0; i < 9; i++) { var m = neuesTeilchen(b.x + (Math.random() - 0.5) * 22, spalt.y + 5, "t"); m.ausstoss = 0.4 + Math.random() * 0.3; }
          b.voll = false; b.el.classList.add("sy-leer"); b.el.setAttribute("cy", b.y);
        });
        melde("spalt"); freisetzung = false; sage("Transmitter sind im Spalt.");
      }
      requestAnimationFrame(bewege);
    }

    var senden = root.querySelector(".sy-senden");
    if (senden) senden.addEventListener("click", signalSenden);
    var pk = root.querySelector(".sy-pause");
    if (pk) pk.addEventListener("click", function () { pause = !pause; pk.setAttribute("aria-pressed", String(pause)); pk.textContent = pause ? "Weiter" : "Pause"; });
    var zl = root.querySelector(".sy-zeitlupe");
    if (zl) zl.addEventListener("click", function () { zeitlupe = !zeitlupe; zl.setAttribute("aria-pressed", String(zeitlupe)); });
    var bk = root.querySelector(".sy-beschriftung-knopf");
    if (bk) bk.addEventListener("click", function () { var aus = svg.classList.toggle("sy-ohne-text"); bk.setAttribute("aria-pressed", String(aus)); });
    var rs = root.querySelector(".sy-reset");
    if (rs) rs.addEventListener("click", function () {
      mol.slice().forEach(entferne); rezeptoren.forEach(function (r) { r.frei = true; });
      blaeschen.forEach(function (b) { b.voll = true; b.el.classList.remove("sy-leer"); b.el.setAttribute("cy", b.y); });
      laufend = false; freisetzung = false; if (senden) senden.disabled = false; kurve = []; alteKurve = null; if (vergleich) vergleich.innerHTML = ""; if (protokoll) protokoll.innerHTML = "";
      var o = root.querySelector('input[name="sy-stoff"][data-wirkung="ohne"]'); if (o) o.checked = true; stoffAnwenden(); anzeige(0); zeichneVerlauf(); sage("Zurückgesetzt.");
    });
    alle(root, 'input[name="sy-stoff"]').forEach(function (r) { r.addEventListener("change", stoffAnwenden); });
    /* Bläschen langsam wieder auffüllen */
    setInterval(function () { if (pause) return; var b = blaeschen.filter(function (v) { return !v.voll; })[0]; if (b && !laufend) { b.voll = true; b.el.classList.remove("sy-leer"); } }, 2500);
    stoffAnwenden(); anzeige(0);
  }

  /* ---------- Speicher (nur dieser Browser, Fehler werden geschluckt) ---------- */
  function lies(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function schreib(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function weg(k) { try { localStorage.removeItem(k); } catch (e) { /* ohne Speicher */ } }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- Lernlandkarte ---------- */
  function lernlandkarte(root) {
    var basis = "lp-llk-" + (root.getAttribute("data-speicher") || "karte");
    var vorrat = root.querySelector(".lm-vorrat"), felder = alle(root, ".lm-feld");
    var eingabe = root.querySelector(".llk-neu"), name = root.querySelector(".llk-name"), namenListe = root.querySelector(".llk-namen");
    var stand = root.querySelector(".llk-stand");
    var mythenHtml = alle(root, ".llk-mythos"), mythenListe = root.querySelector(".llk-mythen");
    var stationen = felder.map(function (f) { return { id: f.getAttribute("data-feld"), titel: (f.querySelector(".lm-feld-ziel strong") || f.querySelector(".lm-feld-ziel")).textContent.trim() }; });
    var aktuell = "", daten = null, gewaehlt = null;

    function leer() { return { fragen: [], mythen: {} }; }
    function schluessel(n) { return basis + ":" + n; }
    function namen() { return lies(basis + ":namen") || []; }
    function sichern() {
      if (!aktuell) return;
      var inhalt = daten.fragen.length || Object.keys(daten.mythen).some(function (k) { return daten.mythen[k].auf; });
      var l = namen(), ok = true;
      if (inhalt || l.indexOf(aktuell) >= 0) ok = schreib(schluessel(aktuell), daten);
      if (inhalt && l.indexOf(aktuell) < 0) { l.push(aktuell); schreib(basis + ":namen", l); }
      if (stand) stand.textContent = ok ? "Gespeichert auf diesem Gerät: Karte „" + aktuell + "“." : "Speichern ist in diesem Browser nicht möglich. Nutze „Als Datei sichern“.";
      zeigeNamen();
    }
    function zeigeNamen() {
      if (!namenListe) return;
      namenListe.innerHTML = "";
      namen().forEach(function (n) {
        var b = el("button", "lm-knopf zweit", n); b.type = "button";
        b.setAttribute("aria-pressed", n === aktuell ? "true" : "false");
        b.addEventListener("click", function () { oeffne(n); });
        var li = el("li"); li.appendChild(b); namenListe.appendChild(li);
      });
    }
    function mythos(id) {
      if (!daten.mythen[id]) daten.mythen[id] = { auf: false, s: [0, 0, 0], station: "", geklaert: false, ergebnis: "" };
      return daten.mythen[id];
    }
    function waehle(k) {
      gewaehlt = k;
      alle(root, ".llk-frage").forEach(function (x) { x.setAttribute("aria-pressed", x === k ? "true" : "false"); });
      felder.forEach(function (f) { f.classList.toggle("ziel", !!k); });
      if (vorrat) vorrat.classList.toggle("ziel", !!k);
    }
    function frageKarte(f) {
      var k = el("div", "llk-karte");
      var b = el("button", "lm-karte llk-frage"); b.type = "button"; b.setAttribute("aria-pressed", "false");
      b.appendChild(el("span", "", f.t)); b.setAttribute("data-id", f.id);
      b.addEventListener("click", function () { waehle(gewaehlt === b ? null : b); });
      k.appendChild(b);
      if (f.feld) {
        var lab = el("label", "llk-haken"), cb = el("input"); cb.type = "checkbox"; cb.checked = !!f.ok;
        cb.addEventListener("change", function () { f.ok = cb.checked; k.classList.toggle("ok", f.ok); sichern(); });
        lab.appendChild(cb); lab.appendChild(el("span", "", "beantwortet")); k.appendChild(lab);
        k.classList.toggle("ok", !!f.ok);
      }
      var x = el("button", "llk-weg", "Entfernen"); x.type = "button"; x.setAttribute("aria-label", "Frage entfernen: " + f.t);
      x.addEventListener("click", function () { daten.fragen = daten.fragen.filter(function (y) { return y !== f; }); sichern(); zeichne(); });
      k.appendChild(x);
      return k;
    }
    function zeichne() {
      waehle(null);
      if (vorrat) vorrat.innerHTML = "";
      felder.forEach(function (f) { f.querySelector(".lm-inhalt").innerHTML = ""; });
      daten.fragen.forEach(function (f) {
        var ziel = f.feld ? root.querySelector('.lm-feld[data-feld="' + f.feld + '"] .lm-inhalt') : vorrat;
        if (!ziel) { f.feld = ""; ziel = vorrat; }
        ziel.appendChild(frageKarte(f));
      });
      felder.forEach(function (f) {
        var id = f.getAttribute("data-feld"), inh = f.querySelector(".lm-inhalt");
        mythenHtml.forEach(function (m, i) {
          var d = mythos(m.getAttribute("data-id"));
          if (d.station === id) {
            var c = el("p", "llk-mythos-chip" + (d.geklaert ? " ok" : ""), "Aussage " + (i + 1) + (d.geklaert ? ": geklärt" : ": noch offen"));
            inh.appendChild(c);
          }
        });
        var offen = daten.fragen.filter(function (q) { return q.feld === id; }), fertig = offen.filter(function (q) { return q.ok; }).length;
        var z = f.querySelector(".llk-zahl"); if (!z) { z = el("span", "llk-zahl"); f.querySelector(".lm-feld-ziel").appendChild(z); }
        z.textContent = offen.length ? fertig + " von " + offen.length + " Fragen beantwortet" : "noch keine Fragen";
      });
      zeichneMythen();
    }
    function zeichneMythen() {
      if (!mythenListe) return;
      mythenListe.innerHTML = "";
      mythenHtml.forEach(function (m, i) {
        var id = m.getAttribute("data-id"), d = mythos(id);
        var li = el("li", "llk-myth" + (d.auf ? " auf" : ""));
        li.appendChild(el("h4", "", "Aussage " + (i + 1)));
        if (!d.auf) {
          var auf = el("button", "lm-knopf", "Aufdecken"); auf.type = "button";
          auf.addEventListener("click", function () { d.auf = true; sichern(); zeichneMythen(); });
          li.appendChild(el("p", "llk-verdeckt", "Die Aussage ist noch verdeckt."));
          li.appendChild(auf);
        } else {
          li.appendChild(el("p", "llk-aussage", "„" + m.textContent.trim() + "“"));
          var zaehl = el("div", "llk-stimmen");
          ["stimmt", "stimmt nicht", "weiß nicht"].forEach(function (w, j) {
            var box = el("div", "llk-stimme");
            var plus = el("button", "lm-knopf zweit", w + ": " + d.s[j]); plus.type = "button";
            plus.setAttribute("aria-label", w + ", bisher " + d.s[j] + " Stimmen. Antippen zählt eine Stimme dazu.");
            plus.addEventListener("click", function () { d.s[j]++; sichern(); zeichneMythen(); });
            var minus = el("button", "llk-minus", "−"); minus.type = "button"; minus.setAttribute("aria-label", w + ": eine Stimme zurück");
            minus.addEventListener("click", function () { if (d.s[j] > 0) d.s[j]--; sichern(); zeichneMythen(); });
            box.appendChild(plus); box.appendChild(minus); zaehl.appendChild(box);
          });
          li.appendChild(zaehl);
          var sel = el("select", "llk-station"), lab = el("label", "llk-zeile");
          lab.appendChild(el("span", "", "Station: "));
          var o0 = el("option", "", "noch nicht zugeordnet"); o0.value = ""; sel.appendChild(o0);
          stationen.forEach(function (st) { var o = el("option", "", st.titel); o.value = st.id; sel.appendChild(o); });
          sel.value = d.station || "";
          sel.addEventListener("change", function () { d.station = sel.value; sichern(); zeichne(); });
          lab.appendChild(sel); li.appendChild(lab);
          var lk = el("label", "llk-haken"), cb = el("input"); cb.type = "checkbox"; cb.checked = !!d.geklaert;
          cb.addEventListener("change", function () { d.geklaert = cb.checked; sichern(); zeichne(); });
          lk.appendChild(cb); lk.appendChild(el("span", "", "in der Reihe geklärt")); li.appendChild(lk);
          var ta = el("textarea", "lp-schreib llk-ergebnis"); ta.rows = 2; ta.value = d.ergebnis || "";
          ta.setAttribute("aria-label", "Unser Ergebnis zu Aussage " + (i + 1));
          ta.placeholder = "Unser Ergebnis (wenn geklärt)";
          ta.addEventListener("input", function () { d.ergebnis = ta.value; sichern(); });
          li.appendChild(ta);
        }
        mythenListe.appendChild(li);
      });
    }
    function dazu(text) {
      text = String(text || "").replace(/^\s*[-•*]\s*/, "").trim();
      if (!text) return false;
      daten.fragen.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: text.slice(0, 200), feld: "", ok: false });
      return true;
    }
    function verschiebe(feld) {
      if (!gewaehlt) { if (stand) stand.textContent = "Tippe zuerst eine Frage an. Tippe dann auf die Station."; return; }
      var id = gewaehlt.getAttribute("data-id");
      daten.fragen.forEach(function (f) { if (f.id === id) { f.feld = feld; if (!feld) f.ok = false; } });
      sichern(); zeichne();
      var neu = root.querySelector('.llk-frage[data-id="' + id + '"]'); if (neu) neu.focus();
    }
    function oeffne(n) {
      n = String(n || "").trim().slice(0, 40) || "Meine Klasse";
      aktuell = n; if (name) name.value = n;
      daten = lies(schluessel(n)) || leer();
      if (!daten.fragen) daten.fragen = []; if (!daten.mythen) daten.mythen = {};
      schreib(basis + ":zuletzt", n);
      sichern(); zeichne();
    }

    felder.forEach(function (f) {
      var z = f.querySelector(".lm-feld-ziel"); z.type = "button";
      z.addEventListener("click", function () { verschiebe(f.getAttribute("data-feld")); });
    });
    var zurueck = root.querySelector(".llk-zurueck");
    if (zurueck) zurueck.addEventListener("click", function () { verschiebe(""); });
    var dazuKnopf = root.querySelector(".llk-dazu");
    function neueFrage() { if (dazu(eingabe.value)) { eingabe.value = ""; sichern(); zeichne(); } eingabe.focus(); }
    if (dazuKnopf) dazuKnopf.addEventListener("click", neueFrage);
    if (eingabe) eingabe.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); neueFrage(); } });
    var imp = root.querySelector(".llk-import"), einf = root.querySelector(".llk-einfuegen");
    if (imp && einf) einf.addEventListener("click", function () {
      var n = 0; imp.value.split(/\r?\n/).forEach(function (z) { if (dazu(z.replace(/^\s*-\s*[^:]{1,30}:\s*/, ""))) n++; });
      imp.value = ""; sichern(); zeichne();
      if (stand) stand.textContent = n + (n === 1 ? " Frage" : " Fragen") + " eingefügt.";
    });
    var laden = root.querySelector(".llk-laden");
    if (laden) laden.addEventListener("click", function () { oeffne(name.value); });
    if (name) name.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); oeffne(name.value); } });
    var exp = root.querySelector(".llk-export");
    if (exp) exp.addEventListener("click", function () {
      var blob = new Blob([JSON.stringify({ karte: aktuell, daten: daten }, null, 1)], { type: "application/json" });
      var a = el("a"); a.href = URL.createObjectURL(blob); a.download = "lernlandkarte-" + aktuell.replace(/[^a-z0-9äöüß-]+/gi, "-").toLowerCase() + ".json";
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    var datei = root.querySelector(".llk-importdatei");
    if (datei) datei.addEventListener("change", function () {
      var f = datei.files && datei.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var o = JSON.parse(r.result);
          if (!o || !o.daten || !Array.isArray(o.daten.fragen)) throw new Error("Format");
          aktuell = String(o.karte || aktuell).slice(0, 40); if (name) name.value = aktuell;
          daten = { fragen: o.daten.fragen.filter(function (q) { return q && typeof q.t === "string"; }).map(function (q) { return { id: String(q.id || Math.random()), t: q.t.slice(0, 200), feld: typeof q.feld === "string" ? q.feld : "", ok: !!q.ok }; }), mythen: typeof o.daten.mythen === "object" && o.daten.mythen ? o.daten.mythen : {} };
          sichern(); zeichne();
        } catch (e) { if (stand) stand.textContent = "Die Datei passt nicht. Nimm eine Datei, die hier gesichert wurde."; }
        datei.value = "";
      };
      r.readAsText(f);
    });
    var leeren = root.querySelector(".llk-leeren");
    if (leeren) leeren.addEventListener("click", function () {
      if (leeren.getAttribute("data-sicher") !== "1") {
        leeren.setAttribute("data-sicher", "1"); leeren.textContent = "Wirklich leeren? Nochmal tippen";
        setTimeout(function () { leeren.removeAttribute("data-sicher"); leeren.textContent = "Karte leeren"; }, 4000);
        return;
      }
      leeren.removeAttribute("data-sicher"); leeren.textContent = "Karte leeren";
      daten = leer(); weg(schluessel(aktuell));
      var l = namen().filter(function (x) { return x !== aktuell; }); schreib(basis + ":namen", l);
      sichern(); zeichne();
    });
    oeffne(lies(basis + ":zuletzt") || (name && name.value) || "Meine Klasse");
  }

  /* ---------- Ich-kann-Liste vorher und nachher ---------- */
  function ichkann(root) {
    var key = "lp-ichkann-" + (root.getAttribute("data-speicher") || "liste");
    var saetze = alle(root, "ol > li").map(function (li) { return li.textContent.trim(); });
    var liste = root.querySelector("ol"); if (!saetze.length) return;
    var werte = lies(key) || {};
    var STUFEN = ["noch nicht", "teilweise", "sicher"];
    var tab = el("table", "lp-tabelle lm-ichkann"), kopf = el("thead"), tr = el("tr");
    ["Ich kann …", "Vorher", "Nachher"].forEach(function (t) { var th = el("th", "", t); th.scope = "col"; tr.appendChild(th); });
    kopf.appendChild(tr); tab.appendChild(kopf);
    var body = el("tbody");
    saetze.forEach(function (s, i) {
      var r = el("tr"), th = el("th", "", "… " + s); th.scope = "row"; r.appendChild(th);
      ["v", "n"].forEach(function (wann) {
        var td = el("td"), grp = el("div", "lm-stufen"); grp.setAttribute("role", "group");
        grp.setAttribute("aria-label", (wann === "v" ? "Vorher: " : "Nachher: ") + s);
        STUFEN.forEach(function (st, j) {
          var b = el("button", "", "●".repeat(j + 1) + "○".repeat(2 - j)); b.type = "button";
          b.setAttribute("aria-label", st); b.title = st;
          b.setAttribute("aria-pressed", werte[wann + i] === j + 1 ? "true" : "false");
          b.addEventListener("click", function () {
            werte[wann + i] = werte[wann + i] === j + 1 ? 0 : j + 1; schreib(key, werte);
            alle(grp, "button").forEach(function (x, k) { x.setAttribute("aria-pressed", werte[wann + i] === k + 1 ? "true" : "false"); });
          });
          grp.appendChild(b);
        });
        td.appendChild(grp); r.appendChild(td);
      });
      body.appendChild(r);
    });
    tab.appendChild(body);
    var rahmen = el("div", "lp-scroll"); rahmen.setAttribute("tabindex", "0"); rahmen.setAttribute("role", "region"); rahmen.setAttribute("aria-label", "Ich-kann-Liste, seitlich wischbar");
    rahmen.appendChild(tab);
    liste.replaceWith(rahmen);
    var lz = root.querySelector(".lm-leeren");
    if (lz) lz.addEventListener("click", function () {
      werte = {}; weg(key);
      alle(root, ".lm-stufen button").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    });
  }

  function los() {
    alle(document, "[data-reihe]").forEach(reihe);
    alle(document, "[data-ablage]").forEach(ablage);
    alle(document, "[data-jn]").forEach(jn);
    alle(document, "[data-entdecker]").forEach(entdecker);
    alle(document, "[data-signal]").forEach(signal);
    alle(document, "[data-lernlandkarte]").forEach(lernlandkarte);
    alle(document, "[data-ichkann]").forEach(ichkann);
    alle(document, "[data-synapse]").forEach(synapse);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();
