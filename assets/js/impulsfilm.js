/* Lernportal – kleine Animationen für Impulse in Präsentationen („Impulsfilm“).
   Gehört zu stunde.js (Folien mit Klasse "on"). Fachinhalte und Bewegungen stehen im HTML/CSS der Stunde, hier nur der Ablauf.

   <div data-film> … </div>
     Bekommt die Klasse "spielt", sobald seine Folie gezeigt wird (Klasse "on"), und verliert sie beim Verlassen.
     Die CSS-Animationen der Stunde hängen an ".spielt" (animation-fill-mode: both).
     Ohne "spielt" muss das CSS den Endzustand zeigen: so sehen Leseansicht, Druck und
     „Bewegung reduzieren“ (prefers-reduced-motion) das fertige Bild.
   <button data-film-neu> im selben data-film: spielt die Animation noch einmal ab.
   <span data-zaehler data-bis="0.4" data-stellen="2" data-start="600" data-dauer="4000">0,40</span>
     Zählt beim Abspielen gleichmäßig von 0 bis data-bis (Komma, data-stellen Nachkommastellen),
     beginnt nach data-start ms und dauert data-dauer ms. Im HTML steht der Endwert. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function zahl(z, wert) {
    var st = +z.getAttribute("data-stellen") || 0;
    z.textContent = wert.toFixed(st).replace(".", ",");
  }
  function zaehlen(film) {
    [].forEach.call(film.querySelectorAll("[data-zaehler]"), function (z) {
      var bis = +z.getAttribute("data-bis") || 0, start = +z.getAttribute("data-start") || 0, dauer = +z.getAttribute("data-dauer") || 1000;
      var lauf = (z._lauf || 0) + 1, t0 = null; z._lauf = lauf;
      zahl(z, 0);
      function tick(t) {
        if (z._lauf !== lauf) return;              // neu gestartet oder angehalten
        if (t0 === null) t0 = t;
        var p = Math.min(1, Math.max(0, (t - t0 - start) / dauer));
        zahl(z, bis * p);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  function stopp(film) {
    film.classList.remove("spielt");
    [].forEach.call(film.querySelectorAll("[data-zaehler]"), function (z) {
      z._lauf = (z._lauf || 0) + 1; zahl(z, +z.getAttribute("data-bis") || 0);
    });
  }
  function spielen(film) {
    if (ruhig || document.documentElement.classList.contains("lp-lesen")) { stopp(film); return; }
    film.classList.remove("spielt");
    void film.offsetWidth;                          // Neustart der CSS-Animation erzwingen
    film.classList.add("spielt");
    zaehlen(film);
  }

  [].forEach.call(document.querySelectorAll("[data-film]"), function (film) {
    var folie = film.closest(".slide");
    var knopf = film.querySelector("[data-film-neu]");
    if (knopf) {
      if (ruhig) knopf.hidden = true;
      knopf.addEventListener("click", function () { spielen(film); });
    }
    if (!folie) { spielen(film); return; }
    var war = folie.classList.contains("on");
    if (war) spielen(film);
    new MutationObserver(function () {
      var ist = folie.classList.contains("on");
      if (ist && !war) spielen(film); else if (!ist && war) stopp(film);
      war = ist;
    }).observe(folie, { attributes: true, attributeFilter: ["class"] });
  });
})();
