/* Lernportal – Schrittfilm: Animation in Schritten, die die Klasse selbst weiterschaltet.
   Stil in assets/css/schrittfilm.css. Läuft in Lernmodulen (nach lernmodul.css) und in Präsentationen.
   Es wird nichts gespeichert oder gesendet.

   <div data-schrittfilm data-vermuten="an">
     <svg class="sf-bild" viewBox="…">
       … Teile mit data-ab="3"      sichtbar ab Schritt 3
                   data-nur="2 3"   sichtbar nur in Schritt 2 und 3
                   data-hl="4"      in Schritt 4 hervorgehoben (Umriss blinkt einmal, dann bleibt er dick)
                   data-lauf="3"    Pfad: läuft in Schritt 3 als Signal von Anfang bis Ende, danach bleibt er stehen
                   data-zu="6"      ab Schritt 6 bekommt das Element die Klasse sf-zu (Endzustand per CSS, z. B. Bein schnellt hoch)
     </svg>
     <ol class="sf-schritte">
       <li>Text zu Schritt 1</li>
       <li data-frage="Was passiert als Nächstes?" data-wahl="A|B|C" data-ok="1">Text zu Schritt 2</li>
     </ol>
   </div>

   data-vermuten="an": Vor jedem Schritt mit data-frage erscheint erst die Frage mit Antwortknöpfen.
   Nach dem Antippen erscheint der Schritt, mit Rückmeldung in Zeichen und Text (✓ / ✗).
   Der Schalter „Erst vermuten“ in der Leiste schaltet das ab und an. data-ok zählt ab 1.
   Mit „Bewegung reduzieren“ springt jede Animation sofort an ihr Ende. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, txt, cls) { var e = document.createElement(tag); if (txt != null) e.textContent = txt; if (cls) e.className = cls; return e; }
  function knopf(txt, cls) { var b = el("button", txt, cls); b.type = "button"; return b; }
  function liste(attr) { return String(attr || "").split(/[\s,]+/).filter(Boolean).map(Number); }

  function film(root, nr) {
    var svg = root.querySelector(".sf-bild"), quelle = root.querySelector(".sf-schritte");
    if (!svg || !quelle) return;
    var schritte = [].slice.call(quelle.children).map(function (li) {
      return {
        html: li.innerHTML,
        frage: li.getAttribute("data-frage"),
        wahl: (li.getAttribute("data-wahl") || "").split("|").filter(Boolean),
        ok: +li.getAttribute("data-ok") || 0
      };
    });
    var N = schritte.length, jetzt = 0, vermuten = root.getAttribute("data-vermuten") === "an", offen = {};
    quelle.hidden = true;
    root.classList.add("sf");

    /* Laufpfade vorbereiten: Länge messen */
    var laeufe = [].slice.call(svg.querySelectorAll("[data-lauf]"));
    laeufe.forEach(function (p) {
      var l = p.getTotalLength ? Math.ceil(p.getTotalLength()) : 1000;
      p.style.setProperty("--sf-len", l);
      p.classList.add("sf-lauf");
    });

    /* Leiste und Textfeld */
    var kopf = el("div", null, "sf-kopf");
    var zaehler = el("p", null, "sf-zaehler"); zaehler.setAttribute("aria-live", "polite");
    var punkte = el("div", null, "sf-punkte"); punkte.setAttribute("aria-hidden", "true");
    for (var i = 0; i < N; i++) punkte.appendChild(el("i"));
    kopf.appendChild(zaehler); kopf.appendChild(punkte);

    var text = el("div", null, "sf-text"); text.setAttribute("aria-live", "polite"); text.id = "sf-text-" + nr;
    var frage = el("div", null, "sf-frage"); frage.hidden = true;
    var rm = el("p", null, "sf-rm"); rm.hidden = true;

    var leiste = el("div", null, "sf-leiste");
    var zur = knopf("Zurück", "lm-knopf zweit b sec sf-zur"), weiter = knopf("Weiter", "lm-knopf b sf-weiter"),
        nochmal = knopf("Noch einmal", "lm-knopf zweit b sec sf-nochmal"), anfang = knopf("Von vorn", "lm-knopf zweit b sec sf-anfang");
    var vorlesen = knopf("Vorlesen", "lm-knopf zweit b sec sf-vorlesen");
    var schalter = el("label", null, "sf-schalter"), box = el("input"); box.type = "checkbox"; box.checked = vermuten;
    schalter.appendChild(box); schalter.appendChild(document.createTextNode(" Erst vermuten"));
    [zur, weiter, nochmal, anfang].forEach(function (b) { leiste.appendChild(b); });
    if (window.speechSynthesis) leiste.appendChild(vorlesen);
    if (schritte.some(function (s) { return s.frage; })) leiste.appendChild(schalter);

    var unten = el("div", null, "sf-unten");
    unten.appendChild(frage); unten.appendChild(rm); unten.appendChild(text);
    root.insertBefore(kopf, svg);
    root.appendChild(unten); root.appendChild(leiste);
    svg.setAttribute("aria-describedby", text.id);

    function sichtbar(e, n) {
      var ab = e.getAttribute("data-ab"), nur = e.getAttribute("data-nur");
      if (nur != null) return liste(nur).indexOf(n) >= 0;
      if (ab != null) return n >= +ab;
      return true;
    }
    function zeichnen(n, animiert) {
      [].forEach.call(svg.querySelectorAll("[data-ab],[data-nur]"), function (e) { e.classList.toggle("sf-weg", !sichtbar(e, n)); });
      [].forEach.call(svg.querySelectorAll("[data-hl]"), function (e) {
        var an = liste(e.getAttribute("data-hl")).indexOf(n) >= 0;
        e.classList.remove("sf-hl"); if (an) { void e.getBoundingClientRect(); e.classList.add("sf-hl"); }
      });
      [].forEach.call(svg.querySelectorAll("[data-zu]"), function (e) {
        var ab = +e.getAttribute("data-zu");
        e.classList.toggle("sf-ohne", !animiert || ruhig || n !== ab);
        e.classList.toggle("sf-zu", n >= ab);
      });
      laeufe.forEach(function (p) {
        var s = +p.getAttribute("data-lauf");
        p.classList.remove("sf-laeuft", "sf-fertig");
        if (n > s || (n === s && (!animiert || ruhig))) p.classList.add("sf-fertig");
        else if (n === s) { void p.getBoundingClientRect(); p.classList.add("sf-laeuft"); }
      });
    }
    function zeigeText(n) {
      text.innerHTML = "";
      var t = el("p"); t.innerHTML = schritte[n - 1].html; text.appendChild(t);
    }
    function status(n) {
      zaehler.textContent = "Schritt " + n + " von " + N;
      [].forEach.call(punkte.children, function (p, k) { p.className = k < n ? "an" : ""; });
      zur.disabled = n <= 1; weiter.disabled = n >= N;
      weiter.textContent = n >= N ? "Ende" : "Weiter";
    }
    function gehe(n, animiert) {
      if (window.speechSynthesis) speechSynthesis.cancel();
      jetzt = Math.max(1, Math.min(N, n));
      var s = schritte[jetzt - 1];
      status(jetzt);
      if (animiert && box.checked && s.frage && !offen[jetzt]) {
        /* Erst vermuten: alter Zustand bleibt stehen, Text wird zur Frage */
        zeichnen(jetzt - 1, false);
        text.innerHTML = ""; rm.hidden = true;
        frage.hidden = false; frage.innerHTML = "";
        frage.appendChild(el("p", null, "sf-frage-satz")).innerHTML = "<b>Vermute:</b> " + s.frage.replace(/</g, "&lt;");
        var wahl = el("div", null, "sf-wahl");
        s.wahl.forEach(function (w, k) {
          var b = knopf(w, "lm-knopf zweit b sec");
          b.addEventListener("click", function () {
            offen[jetzt] = true; frage.hidden = true;
            var richtig = k + 1 === s.ok;
            rm.hidden = false; rm.className = "sf-rm " + (richtig ? "ok" : "falsch");
            rm.textContent = (richtig ? "✓ Vermutung passt: " : "✗ Anders als vermutet. Ihr hattet: ") + w;
            status(jetzt); zeichnen(jetzt, true); zeigeText(jetzt); nochmal.disabled = false; weiter.focus({ preventScroll: true });
          });
          wahl.appendChild(b);
        });
        frage.appendChild(wahl);
        weiter.disabled = true; nochmal.disabled = true;
        var erster = wahl.querySelector("button"); if (erster) erster.focus({ preventScroll: true });
        return;
      }
      frage.hidden = true; if (!offen[jetzt] || !box.checked) rm.hidden = true;
      nochmal.disabled = false;
      zeichnen(jetzt, animiert); zeigeText(jetzt);
    }

    weiter.addEventListener("click", function () { if (jetzt < N) { rm.hidden = true; gehe(jetzt + 1, true); } });
    zur.addEventListener("click", function () { rm.hidden = true; gehe(jetzt - 1, false); });
    nochmal.addEventListener("click", function () { zeichnen(jetzt - 1, false); requestAnimationFrame(function () { zeichnen(jetzt, true); }); });
    anfang.addEventListener("click", function () { offen = {}; rm.hidden = true; gehe(1, true); });
    box.addEventListener("change", function () { offen = {}; rm.hidden = true; gehe(jetzt, false); });
    vorlesen.addEventListener("click", function () {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      var t = (frage.hidden ? text.textContent : frage.textContent).trim();
      var u = new SpeechSynthesisUtterance(t); u.lang = "de-DE"; u.rate = 0.9; speechSynthesis.speak(u);
    });
    /* Pfeiltasten nur im Film, damit Präsentationen nicht weiterblättern */
    root.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight" && !weiter.disabled) { e.preventDefault(); e.stopPropagation(); weiter.click(); }
      if (e.key === "ArrowLeft" && !zur.disabled) { e.preventDefault(); e.stopPropagation(); zur.click(); }
    });
    gehe(1, false);
  }

  function los() { [].forEach.call(document.querySelectorAll("[data-schrittfilm]"), film); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();
