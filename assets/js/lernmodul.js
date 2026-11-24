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
                    Protokoll ol.lm-protokoll mit Modellzeit. */
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

  function los() {
    alle(document, "[data-reihe]").forEach(reihe);
    alle(document, "[data-ablage]").forEach(ablage);
    alle(document, "[data-jn]").forEach(jn);
    alle(document, "[data-entdecker]").forEach(entdecker);
    alle(document, "[data-signal]").forEach(signal);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();
