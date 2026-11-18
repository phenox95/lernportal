/* Lernportal – Do Now aus der Vorstunde (Prototyp).
   Das Do Now wiederholt immer die Vorstunde (Planungsvorgaben, Abschnitt 9.1). Die Begriffe der Vorstunde stehen schon im Portal
   (lp-spiel-daten der Präsentation). Dieser Baustein liest sie von der eigenen Seite (gleiche Adresse, kein Fremdserver) und baut daraus
   drei kurze, operatorgestützte Aufgaben. Nichts wird gespeichert. Nur Blöcke mit "geprueft": true werden benutzt.

   Einbinden: <script src=".../assets/js/donow.js" defer></script>, Platzhalter auf der Folie:
     <div data-donow="../vorstunde/praesentation/"></div>      (Pfad zur Vorstunde, relativ zur Seite)
   Von Hand: window.LPDoNow.holen(url) liefert { titel, paare }, window.LPDoNow.aufgaben(paare, n) die Aufgabenliste.
   Formate (nach Priorität der Vorgaben): 1 Begriff erklären, 3 Aussage richtig/falsch mit Begründung, 4 Erklärung dem Begriff zuordnen. */
(function () {
  "use strict";

  function holen(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error("nicht gefunden"); return r.text(); }).then(function (t) {
      var d = new DOMParser().parseFromString(t, "text/html"), j = d.getElementById("lp-spiel-daten");
      if (!j) throw new Error("keine Begriffe");
      var o = JSON.parse(j.textContent);
      if (o.geprueft !== true) throw new Error("Begriffe der Vorstunde noch nicht freigegeben");
      return { titel: o.titel || "", paare: (o.paare || []).map(function (p) { return { b: p[0], e: p[1] }; }) };
    });
  }

  function mischen(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[k]; a[k] = t; } return a; }

  /* Drei Aufgaben: erklären, richtig/falsch, zuordnen. Jede beginnt mit einem Operator. */
  function aufgaben(paare) {
    if (paare.length < 4) return [];
    var m = mischen(paare), a = m[0], b = m[1], c = m[2], d = m[3], e = m[4] || m[0];
    var falsch = Math.random() < 0.5, aussage = falsch ? b.e : c.e;
    return [
      { art: "erklaeren", text: "Erkläre den Begriff „" + a.b + "“ in einem Satz.", loesung: a.e },
      { art: "jn", text: "Entscheide: richtig oder falsch? „" + c.b + "“ bedeutet: " + aussage, loesung: falsch ? "falsch. Richtig ist: " + c.b + " = " + c.e : "richtig", ok: !falsch },
      { art: "zuordnen", text: "Ordne zu: Welcher Begriff passt zu dieser Erklärung? „" + d.e + "“", optionen: mischen([d, e, b].filter(function (x, i, arr) { return arr.indexOf(x) === i; })).map(function (x) { return x.b; }), loesung: d.b }
    ];
  }

  function el(tag, cls, txt) { var x = document.createElement(tag); if (cls) x.className = cls; if (txt) x.textContent = txt; return x; }

  function zeichnen(host, daten) {
    host.textContent = "";
    var liste = aufgaben(daten.paare);
    if (!liste.length) { host.appendChild(el("p", "", "Zu wenige Begriffe in der Vorstunde.")); return; }
    var ol = el("ol", "lp-dn");
    liste.forEach(function (a) {
      var li = el("li", "lp-dn-a"); li.appendChild(el("p", "lp-dn-t", a.text));
      var rueck = el("p", "lp-dn-r"); rueck.hidden = true;
      if (a.art === "jn") {
        ["richtig", "falsch"].forEach(function (w) { var k = el("button", "lp-dn-k", w); k.type = "button"; k.onclick = function () { rueck.hidden = false; rueck.textContent = ((w === "richtig") === a.ok ? "Stimmt. " : "Nicht ganz. ") + (a.ok ? "Die Aussage ist richtig." : "Die Aussage ist " + a.loesung); }; li.appendChild(k); });
      } else if (a.art === "zuordnen") {
        a.optionen.forEach(function (w) { var k = el("button", "lp-dn-k", w); k.type = "button"; k.onclick = function () { rueck.hidden = false; rueck.textContent = w === a.loesung ? "Stimmt." : "Nicht ganz. Gesucht war: " + a.loesung; }; li.appendChild(k); });
      } else {
        var z = el("button", "lp-dn-k", "Vergleichen"); z.type = "button"; z.onclick = function () { rueck.hidden = false; rueck.textContent = "Vergleiche mit deinem Satz: " + a.loesung; }; li.appendChild(z);
      }
      li.appendChild(rueck); ol.appendChild(li);
    });
    host.appendChild(ol);
    var neu = el("button", "lp-dn-k lp-dn-neu", "Neue Aufgaben"); neu.type = "button"; neu.onclick = function () { zeichnen(host, daten); }; host.appendChild(neu);
    host.appendChild(el("p", "lp-dn-q", "Begriffe aus: " + daten.titel));
  }

  var css = document.createElement("style");
  css.textContent = ".lp-dn{padding-left:1.4em}.lp-dn-a{margin:0 0 18px;font-size:inherit}.lp-dn-t{margin:0 0 8px;font-weight:700}.lp-dn-k{font:inherit;font-weight:700;min-height:44px;margin:0 8px 8px 0;padding:6px 16px;border-radius:12px;border:2px solid currentColor;background:transparent;color:inherit;cursor:pointer}.lp-dn-r{margin:4px 0 0;background:#E8F3EC;color:#1A2B24;border-radius:10px;padding:8px 12px}.lp-dn-q{font-size:.85em;opacity:.8}";
  document.head.appendChild(css);

  function start() {
    [].forEach.call(document.querySelectorAll("[data-donow]"), function (h) {
      holen(h.getAttribute("data-donow")).then(function (d) { zeichnen(h, d); }).catch(function (e) { h.textContent = "Do Now: " + e.message + ". Die Lehrkraft stellt eine eigene Aufgabe."; });
    });
  }
  window.LPDoNow = { holen: holen, aufgaben: aufgaben };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
