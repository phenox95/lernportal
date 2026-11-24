/* Lernportal – Beschriften durch Ziehen (Stil in assets/css/beschriften.css).
   Läuft in Lernmodulen (nach lernmodul.css) und in Präsentationen. Es wird nichts gespeichert oder gesendet.

   <div data-beschriften>
     <div class="bs-bild"><svg viewBox="0 -60 740 380"> … Abbildung ohne Beschriftung … </svg></div>
     <ul class="bs-felder">
       <li data-wort="Axon" data-silben="A-xon" data-x="600" data-y="-35" data-zeigt="625,130" data-basis></li>
     </ul>
   </div>

   Jedes li wird ein Feld an (data-x | data-y) in Einheiten der viewBox, mit Linie zum Punkt data-zeigt.
   Drei Stufen zum Umschalten:
     ●○○ nur Felder mit data-basis, Wörter mit Silben (data-silben)
     ●●○ alle Felder, Wörter ohne Silben
     ●●● alle Felder, ohne Wortliste: Begriffe eintippen
   Wörter antippen und dann ein Feld antippen, oder ziehen. Ein volles Feld antippen: Wort kommt zurück.
   „Prüfen“ markiert jedes Feld mit ✓ oder ✗ (Zeichen und Text, nie nur Farbe). */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, txt, cls) { var e = document.createElement(tag); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; }
  function knopf(txt, cls) { var b = el("button", txt, cls); b.type = "button"; return b; }
  function mische(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function norm(s) { return String(s || "").toLowerCase().replace(/[-\s]+/g, "").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss"); }

  function baustein(root, nr) {
    var bild = root.querySelector(".bs-bild"), svg = bild && bild.querySelector("svg"), quelle = root.querySelector(".bs-felder");
    if (!svg || !quelle) return;
    var vb = (svg.getAttribute("viewBox") || "0 0 100 100").split(/[\s,]+/).map(Number);
    var daten = [].map.call(quelle.children, function (li, k) {
      var z = (li.getAttribute("data-zeigt") || "").split(",").map(Number);
      return { id: k, wort: li.getAttribute("data-wort"), silben: li.getAttribute("data-silben") || li.getAttribute("data-wort"),
               x: +li.getAttribute("data-x"), y: +li.getAttribute("data-y"), zx: z[0], zy: z[1], basis: li.hasAttribute("data-basis") };
    });
    quelle.hidden = true; root.classList.add("bs");
    var stufe = 2, gewaehlt = null, belegt = {};

    /* Stufen-Wahl */
    var stufen = el("div", null, "bs-stufen"); stufen.setAttribute("role", "group"); stufen.setAttribute("aria-label", "Niveau wählen");
    var sKn = [["●○○", "weniger Felder, mit Silben"], ["●●○", "alle Felder"], ["●●●", "ohne Wortliste"]].map(function (s, k) {
      var b = knopf(null, "lm-knopf zweit b sec s bs-stufe"); b.innerHTML = '<span aria-hidden="true">' + s[0] + "</span> " + s[1];
      b.setAttribute("aria-label", "Niveau " + (k + 1) + ": " + s[1]);
      b.addEventListener("click", function () { stufe = k + 1; aufbauen(); });
      stufen.appendChild(b); return b;
    });
    root.insertBefore(stufen, bild);

    /* Linien und Felder */
    var linien = document.createElementNS(NS, "g"); linien.setAttribute("class", "bs-linien"); svg.appendChild(linien);
    var felderBox = el("div", null, "bs-feldebene"); bild.appendChild(felderBox);
    var vorrat = el("div", null, "bs-vorrat"); vorrat.setAttribute("aria-label", "Wörter zum Beschriften");
    var hinweis = el("p", null, "lm-hinweis bs-hinweis");
    var leiste = el("div", null, "lm-leiste");
    var pruef = knopf("Prüfen", "lm-knopf b"), neu = knopf("Neu beginnen", "lm-knopf zweit b sec");
    leiste.appendChild(pruef); leiste.appendChild(neu);
    var rm = el("p", null, "lm-rm bs-rm"); rm.setAttribute("aria-live", "polite");
    root.appendChild(hinweis); root.appendChild(vorrat); root.appendChild(leiste); root.appendChild(rm);

    var felder = [];
    function aktive() { return daten.filter(function (d) { return stufe > 1 || d.basis; }); }
    function wortText(d) { return stufe === 1 ? d.silben : d.wort; }
    function pos(e, d) { e.style.left = ((d.x - vb[0]) / vb[2] * 100) + "%"; e.style.top = ((d.y - vb[1]) / vb[3] * 100) + "%"; }

    function aufbauen() {
      sKn.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k + 1 === stufe)); });
      linien.textContent = ""; felderBox.textContent = ""; vorrat.textContent = ""; rm.textContent = ""; belegt = {}; gewaehlt = null; felder = [];
      var liste = aktive();
      liste.forEach(function (d) {
        var l = document.createElementNS(NS, "line");
        l.setAttribute("x1", d.x); l.setAttribute("y1", d.y); l.setAttribute("x2", d.zx); l.setAttribute("y2", d.zy);
        linien.appendChild(l);
        var p = document.createElementNS(NS, "circle"); p.setAttribute("cx", d.zx); p.setAttribute("cy", d.zy); p.setAttribute("r", 4); linien.appendChild(p);
        var f;
        if (stufe === 3) {
          f = el("input", null, "bs-feld bs-tipp"); f.type = "text"; f.autocomplete = "off"; f.spellcheck = false;
          f.setAttribute("aria-label", "Begriff für Feld " + (felder.length + 1));
          f.addEventListener("input", function () { f.classList.remove("ok", "falsch"); markeWeg(f); });
        } else {
          f = knopf("", "bs-feld"); f.setAttribute("aria-label", "Feld " + (felder.length + 1) + ", leer");
          f.addEventListener("click", function () { feldTippen(f); });
        }
        f.bsDaten = d; pos(f, d); felderBox.appendChild(f); felder.push(f);
      });
      if (stufe === 3) {
        hinweis.textContent = "Tippe in jedes Feld den passenden Begriff.";
      } else {
        hinweis.textContent = "Tippe ein Wort an und dann ein Feld. Am Rechner oder Board kannst du das Wort auch ziehen.";
        mische(liste.slice()).forEach(function (d) {
          var w = knopf(wortText(d), "lm-karte bs-wort"); w.bsDaten = d;
          w.addEventListener("click", function (e) { if (w.bsGezogen) { w.bsGezogen = false; return; } waehle(w); });
          ziehbar(w); vorrat.appendChild(w);
        });
      }
    }
    function waehle(w) {
      if (gewaehlt) gewaehlt.setAttribute("aria-pressed", "false");
      gewaehlt = gewaehlt === w ? null : w;
      if (gewaehlt) gewaehlt.setAttribute("aria-pressed", "true");
    }
    function markeWeg(f) { f.classList.remove("ok", "falsch"); var m = f.parentNode && f.parentNode.querySelector('.bs-marke[data-f="' + felder.indexOf(f) + '"]'); if (m) m.remove(); }
    function ablegen(w, f) {
      if (belegt[felder.indexOf(f)]) zurueck(f);
      w.hidden = true; belegt[felder.indexOf(f)] = w;
      f.textContent = w.textContent; f.classList.add("voll"); markeWeg(f);
      f.setAttribute("aria-label", "Feld " + (felder.indexOf(f) + 1) + ": " + w.textContent + ". Antippen zum Zurücklegen.");
      if (gewaehlt === w) gewaehlt = null; w.setAttribute("aria-pressed", "false");
    }
    function zurueck(f) {
      var k = felder.indexOf(f), w = belegt[k]; if (!w) return;
      w.hidden = false; delete belegt[k]; f.textContent = ""; f.classList.remove("voll"); markeWeg(f);
      f.setAttribute("aria-label", "Feld " + (k + 1) + ", leer");
    }
    function feldTippen(f) {
      if (gewaehlt) ablegen(gewaehlt, f);
      else if (belegt[felder.indexOf(f)]) zurueck(f);
      else rm.textContent = "Tippe zuerst ein Wort an.";
    }
    /* Ziehen mit Zeiger (Maus, Stift, Finger) */
    function ziehbar(w) {
      var geist = null, start = null;
      w.addEventListener("pointerdown", function (e) {
        if (e.button > 0) return;
        start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      });
      w.addEventListener("pointermove", function (e) {
        if (!start || e.pointerId !== start.id) return;
        if (!geist && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 8) return;
        if (!geist) { w.setPointerCapture(e.pointerId); geist = w.cloneNode(true); geist.className += " bs-geist"; document.body.appendChild(geist); }
        geist.style.left = e.clientX + "px"; geist.style.top = e.clientY + "px";
        e.preventDefault();
      });
      function ende(e) {
        if (!start || e.pointerId !== start.id) return;
        if (geist) {
          geist.remove(); geist = null; w.bsGezogen = true;
          var unter = document.elementFromPoint(e.clientX, e.clientY);
          var f = unter && unter.closest && unter.closest(".bs-feld");
          if (f && felder.indexOf(f) >= 0) ablegen(w, f);
          setTimeout(function () { w.bsGezogen = false; }, 0);
        }
        start = null;
      }
      w.addEventListener("pointerup", ende); w.addEventListener("pointercancel", ende);
    }

    pruef.addEventListener("click", function () {
      var ok = 0;
      felder.forEach(function (f, k) {
        var d = f.bsDaten, richtig = stufe === 3 ? norm(f.value) === norm(d.wort) : !!belegt[k] && belegt[k].bsDaten.wort === d.wort;
        markeWeg(f); f.classList.add(richtig ? "ok" : "falsch"); if (richtig) ok++;
        var m = el("span", richtig ? "✓" : "✗", "bs-marke " + (richtig ? "ok" : "falsch")); m.setAttribute("data-f", k); m.setAttribute("aria-hidden", "true");
        pos(m, { x: d.x, y: d.y }); felderBox.appendChild(m);
      });
      rm.textContent = ok === felder.length ? "✓ Alles richtig: " + ok + " von " + felder.length + "." : "✗ " + ok + " von " + felder.length + " richtig. Ändere die Felder mit ✗ und prüfe noch einmal.";
      rm.className = "lm-rm bs-rm " + (ok === felder.length ? "ok" : "falsch");
    });
    neu.addEventListener("click", aufbauen);
    aufbauen();
  }

  function los() { [].forEach.call(document.querySelectorAll("[data-beschriften]"), baustein); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();
