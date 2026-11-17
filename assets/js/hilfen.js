/* Lernportal – Hilfen auf Abruf (Prototyp).
   Zu einer Aufgabe gehören bis zu drei Hilfen, die die Lernenden selbst nacheinander aufdecken: Hinweis, Satzanfang, Beispiel.
   Es wird nichts gezählt, bewertet oder gespeichert. Die Hilfe ist Teil des Lernwegs, kein Makel.
   Markup:
     <div data-hilfen>
       <p>Hinweis: Denke an …</p>
       <p>Satzanfang: Die Temperatur steigt von … bis …</p>
       <p>Beispiel: …</p>
     </div>
   Jede Kindzeile (p, li, div) ist eine Stufe. Optional data-namen="Hinweis|Satzanfang|Beispiel" ändert die Knopfbeschriftung. */
(function () {
  "use strict";
  var css = document.createElement("style");
  css.textContent =
    "[data-hilfen]{margin:10px 0}[data-hilfen] .lp-hf-st{margin:8px 0;padding:10px 14px;border-radius:12px;background:#E8F3EC;color:#1A2B24;border-left:6px solid #0F6E56}" +
    "[data-hilfen] .lp-hf-st[hidden]{display:none}[data-hilfen] .lp-hf-k{font:700 16px Andika,Verdana,sans-serif;min-height:44px;padding:6px 16px;margin:0 8px 6px 0;border:2px solid currentColor;border-radius:12px;background:transparent;color:inherit;cursor:pointer}" +
    "[data-hilfen] .lp-hf-k:disabled{opacity:.45;cursor:default}[data-hilfen] .lp-hf-k:focus-visible{outline:3px solid #F4B400}";
  document.head.appendChild(css);
  function bauen(el) {
    if (el.__hf) return; el.__hf = true;
    var st = [].slice.call(el.children), namen = (el.getAttribute("data-namen") || "Hinweis|Satzanfang|Beispiel").split("|"), knoepfe = [];
    st.forEach(function (s, i) { s.classList.add("lp-hf-st"); s.hidden = true; s.setAttribute("aria-live", "polite"); });
    var leiste = document.createElement("div"); el.insertBefore(leiste, el.firstChild);
    st.forEach(function (s, i) {
      var k = document.createElement("button"); k.type = "button"; k.className = "lp-hf-k";
      k.textContent = "Hilfe " + (i + 1) + (namen[i] ? ": " + namen[i] : ""); k.disabled = i > 0; knoepfe.push(k);
      k.onclick = function () { s.hidden = false; k.disabled = true; if (knoepfe[i + 1]) knoepfe[i + 1].disabled = false; s.setAttribute("tabindex", "-1"); s.focus(); };
      leiste.appendChild(k);
    });
  }
  function start() { [].forEach.call(document.querySelectorAll("[data-hilfen]"), bauen); }
  window.LPHilfen = { bauen: bauen };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
