/* Lernportal – Vorher/Nachher-Schieber (Prototyp).
   Zwei Bilder übereinander, ein Regler zieht die Grenze. Für Satellitenbilder, Karten, Stadt früher und heute, Diagramme.
   Markup:
     <div data-vergleich data-vorher-text="2000" data-nachher-text="2020">
       <img src="vorher.jpg" alt="Beschreibung vorher"><img src="nachher.jpg" alt="Beschreibung nachher">
     </div>
   (genau zwei Kindbilder, gleiche Größe und gleicher Ausschnitt). Auch mit <svg> statt <img> möglich.
   Bedienung: Regler ziehen, mit Maus, Finger oder Pfeiltasten (der Regler ist ein echtes Eingabefeld, auch für Tastatur und Vorlesegeräte).
   Es wird nichts geladen oder gespeichert. Quellenangabe und Lizenz gehören an die Seite, nicht in den Baustein. */
(function () {
  "use strict";
  var css = document.createElement("style");
  css.textContent =
    "[data-vergleich]{position:relative;display:block;max-width:100%;overflow:hidden;border-radius:12px;border:2px solid currentColor;line-height:0;background:#000}" +
    "[data-vergleich]>img,[data-vergleich]>svg{display:block;width:100%;height:auto;max-width:100%}" +
    "[data-vergleich]>.lp-vg-ober{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}" +
    "[data-vergleich] .lp-vg-griff{position:absolute;top:0;bottom:0;width:4px;margin-left:-2px;background:#fff;box-shadow:0 0 0 2px #000;pointer-events:none}" +
    "[data-vergleich] .lp-vg-griff::after{content:'◀ ▶';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;color:#000;font:700 14px/1 Andika,Verdana,sans-serif;padding:10px 8px;border-radius:20px;box-shadow:0 0 0 2px #000;white-space:nowrap}" +
    "[data-vergleich] input[type=range]{position:absolute;left:0;right:0;top:0;bottom:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize;touch-action:pan-y}" +
    "[data-vergleich] input[type=range]:focus-visible~.lp-vg-griff{outline:3px solid #F4B400;outline-offset:2px}" +
    "[data-vergleich] .lp-vg-tag{position:absolute;top:10px;font:700 15px/1.2 Andika,Verdana,sans-serif;background:rgba(0,0,0,.7);color:#fff;padding:4px 10px;border-radius:8px;pointer-events:none}" +
    "[data-vergleich] .lp-vg-l{left:10px}[data-vergleich] .lp-vg-r{right:10px}";
  document.head.appendChild(css);

  function bauen(el) {
    if (el.__vg) return; el.__vg = true;
    var k = [].filter.call(el.children, function (c) { return c.tagName === "IMG" || c.tagName === "svg"; });
    if (k.length < 2) return;
    var nachher = k[1]; nachher.classList.add("lp-vg-ober");
    var reg = document.createElement("input");
    reg.type = "range"; reg.min = 0; reg.max = 100; reg.value = 50; reg.step = 1;
    reg.setAttribute("aria-label", "Vorher und Nachher vergleichen: Regler verschieben");
    var griff = document.createElement("div"); griff.className = "lp-vg-griff";
    var tl = document.createElement("span"); tl.className = "lp-vg-tag lp-vg-l"; tl.textContent = el.getAttribute("data-vorher-text") || "Vorher";
    var tr = document.createElement("span"); tr.className = "lp-vg-tag lp-vg-r"; tr.textContent = el.getAttribute("data-nachher-text") || "Nachher";
    el.appendChild(reg); el.appendChild(griff); el.appendChild(tl); el.appendChild(tr);
    function setzen() {
      var p = +reg.value;
      nachher.style.clipPath = "inset(0 0 0 " + p + "%)";
      griff.style.left = p + "%";
      reg.setAttribute("aria-valuetext", p + " Prozent vorher sichtbar");
    }
    reg.addEventListener("input", setzen); setzen();
  }
  function start() { [].forEach.call(document.querySelectorAll("[data-vergleich]"), bauen); }
  window.LPVergleich = { bauen: bauen };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
