/* Lernportal – Referentenansicht (Prototyp).
   Zwei Fenster, ein Vortrag: Das Beamer-Fenster zeigt die Präsentation, das Laptop-Fenster zeigt der Lehrkraft
   die nächste Folie, die Hinweise (data-notes), eine Uhr und Knöpfe zum Blättern. Kein Server, keine Kopie der Folien:
   beide Fenster laden dieselbe Seite, sie sprechen über BroadcastChannel (nur im Browser, nichts verlässt das Gerät).

   Einbinden: <script src=".../assets/js/referent.js" defer></script> am Ende einer Präsentation. Sonst nichts.
   Bedienung: Taste R (oder Knopf „Referent“) öffnet das Lehrerfenster. Das Beamer-Fenster bleibt unverändert.
   Funktioniert mit jeder Präsentation, die die sichtbare Folie mit der Klasse „on“ markiert (praesentation.js, stunde.js, Vorlage).
   Zusätzlich: hält den Bildschirm wach (Screen Wake Lock), solange die Präsentation sichtbar ist.

   Technik: Das Lehrerfenster lädt die Präsentation noch einmal als Vorschau (iframe, gleiche Adresse) und blättert diese
   Vorschau per Tastendruck eine Folie weiter als das Beamer-Fenster. Aus der Vorschau liest es die Hinweise der Folie. */
(function () {
  "use strict";
  var KANAL = "lp-referent:" + location.pathname;
  var ref = /[?&]referent=1/.test(location.search);

  function folien(doc) { return [].slice.call(doc.querySelectorAll(".slide")); }
  function aktuell(doc) { var f = folien(doc); for (var i = 0; i < f.length; i++) if (getComputedStyle(f[i]).display !== "none") return i; return 0; }
  function taste(doc, key) {
    var e = new KeyboardEvent("keydown", { key: key, bubbles: true, cancelable: true });
    doc.dispatchEvent(e);
  }
  var bc = null;
  try { bc = new BroadcastChannel(KANAL); } catch (e) { bc = null; }

  /* ---------- Beamer-Fenster ---------- */
  function beamer() {
    if (window.top !== window) return; /* Vorschau im Lehrerfenster sendet nichts */
    var letzte = -1;
    function melden() {
      var i = aktuell(document);
      if (i === letzte) return;
      letzte = i;
      if (bc) bc.postMessage({ t: "folie", i: i, n: folien(document).length });
    }
    var beob = new MutationObserver(melden);
    beob.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class", "style"] });
    setInterval(melden, 700);
    melden();
    if (bc) bc.onmessage = function (m) {
      var d = m.data || {};
      if (d.t === "taste") taste(document, d.key);
      if (d.t === "frage") { letzte = -1; melden(); }
    };
    document.addEventListener("keydown", function (e) {
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "") && !(e.target && e.target.isContentEditable)) oeffnen();
    });
    var kn = document.createElement("button");
    kn.type = "button"; kn.textContent = "Referent (R)"; kn.setAttribute("aria-label", "Referentenansicht in neuem Fenster öffnen");
    kn.style.cssText = "position:fixed;left:10px;top:10px;z-index:3000;opacity:.0;font:700 14px Andika,Verdana,sans-serif;padding:8px 12px;border:0;border-radius:10px;background:#0F6E56;color:#fff;cursor:pointer;min-height:44px";
    kn.onfocus = kn.onmouseenter = function () { kn.style.opacity = "1"; };
    kn.onblur = kn.onmouseleave = function () { kn.style.opacity = "0"; };
    kn.onclick = oeffnen;
    document.body.appendChild(kn);
    wach();
  }
  function oeffnen() {
    var u = location.href.split("#")[0].replace(/[?&]referent=1/, "");
    u += (u.indexOf("?") < 0 ? "?" : "&") + "referent=1";
    window.open(u, "lp-referent", "width=1100,height=720");
  }

  /* Bildschirm wach halten, solange die Seite sichtbar ist (Beamer-Rechner schläft nicht ein). Ohne Unterstützung passiert nichts. */
  function wach() {
    var sperre = null;
    function holen() {
      if (!navigator.wakeLock || document.visibilityState !== "visible") return;
      navigator.wakeLock.request("screen").then(function (s) { sperre = s; }).catch(function () { /* nicht erlaubt */ });
    }
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") holen(); });
    holen();
  }

  /* ---------- Lehrerfenster ---------- */
  function lehrer() {
    var basis = location.href.split("#")[0].replace(/[?&]referent=1/, "");
    document.title = "Referent – " + document.title;
    document.documentElement.className = "";
    document.body.className = "";
    document.body.removeAttribute("style");
    document.head.insertAdjacentHTML("beforeend", "<style>" +
      "html,body{margin:0;height:100%;overflow:hidden;background:#12201a;color:#fff;font-family:Andika,Verdana,sans-serif}" +
      "#rf{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);grid-template-rows:auto 1fr;gap:14px;height:100%;padding:14px;box-sizing:border-box}" +
      "#rf header{grid-column:1/3;display:flex;gap:14px;align-items:center;flex-wrap:wrap}" +
      "#rf .z{font-size:28px;font-weight:700}#rf .u{font-size:28px;font-variant-numeric:tabular-nums;color:#F4B400}" +
      "#rf button{font:700 20px inherit;font-family:inherit;border:0;border-radius:12px;padding:10px 22px;min-height:48px;background:#0F6E56;color:#fff;cursor:pointer}" +
      "#rf button.s{background:#3a4a43}" +
      "#rf .vor{aspect-ratio:16/9;align-self:start;background:#000;border-radius:14px;position:relative;overflow:hidden;min-height:0}" +
      "#rf .vor iframe{position:absolute;left:0;top:0;width:1280px;height:720px;border:0;transform-origin:0 0;pointer-events:none}" +
      "#rf .vor span{position:absolute;left:10px;top:8px;background:rgba(0,0,0,.7);padding:3px 10px;border-radius:8px;font-size:16px;z-index:2}" +
      "#rf .no{background:#1c2f27;border-radius:14px;padding:18px 22px;overflow:auto;font-size:26px;line-height:1.45}" +
      "#rf .no h2{margin:0 0 10px;font-size:18px;color:#9fd;font-weight:400;text-transform:none}" +
      "#rf .no p{margin:0}.leer{color:#8aa}" +
      "</style>");
    document.body.innerHTML =
      '<div id="rf"><header><span class="z" id="rfz">Folie – / –</span><button id="rfb" type="button" aria-label="Zur vorherigen Folie">◀ Zurück</button>' +
      '<button id="rfw" type="button" aria-label="Zur nächsten Folie">Weiter ▶</button><span class="u" id="rfu">00:00</span>' +
      '<button class="s" id="rfr" type="button">Uhr zurücksetzen</button></header>' +
      '<div class="vor" id="rfv"><span>Nächste Folie</span><iframe id="rfi" title="Vorschau der nächsten Folie"></iframe></div>' +
      '<div class="no" id="rfn" aria-live="polite"><h2>Hinweise zu dieser Folie</h2><p class="leer">Warte auf das Beamer-Fenster …</p></div></div>';
    var fr = document.getElementById("rfi"), vor = document.getElementById("rfv"), no = document.getElementById("rfn"), zeile = document.getElementById("rfz");
    fr.src = basis + (basis.indexOf("?") < 0 ? "?" : "&") + "ansicht=folien";
    var n = 0, cur = -1, bereit = false;
    function skala() { var s = Math.min(vor.clientWidth / 1280, vor.clientHeight / 720); fr.style.transform = "scale(" + s + ")"; }
    addEventListener("resize", skala); skala();
    function vorschauAuf(ziel) {
      var d; try { d = fr.contentDocument; } catch (e) { return; }
      if (!d || !d.querySelector(".slide")) return;
      var f = folien(d), schritte = 0, i = aktuell(d);
      while (i !== ziel && schritte++ < f.length + 2) { taste(d, i < ziel ? "ArrowRight" : "ArrowLeft"); var j = aktuell(d); if (j === i) break; i = j; }
    }
    function zeigen(i, gesamt) {
      cur = i; n = gesamt || n;
      zeile.textContent = "Folie " + (i + 1) + " / " + n;
      var d; try { d = fr.contentDocument; } catch (e) { d = null; }
      var f = d ? folien(d) : [];
      vorschauAuf(Math.min(i + 1, n - 1));
      var h = f[i] ? f[i].getAttribute("data-notes") : "";
      var min = f[i] ? f[i].getAttribute("data-min") : "";
      no.innerHTML = "<h2>Hinweise zu dieser Folie" + (min ? " · geplant " + min + " Min." : "") + "</h2>";
      var p = document.createElement("p");
      if (h) p.textContent = h; else { p.className = "leer"; p.textContent = "Kein Hinweis hinterlegt (data-notes)."; }
      no.appendChild(p);
    }
    if (bc) bc.onmessage = function (m) { var d = m.data || {}; if (d.t === "folie") { bereit = true; zeigen(d.i, d.n); } };
    var frage = setInterval(function () { if (bereit) clearInterval(frage); else if (bc) bc.postMessage({ t: "frage" }); }, 400);
    function schick(k) { if (bc) bc.postMessage({ t: "taste", key: k }); }
    document.getElementById("rfw").onclick = function () { schick("ArrowRight"); };
    document.getElementById("rfb").onclick = function () { schick("ArrowLeft"); };
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); schick("ArrowRight"); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); schick("ArrowLeft"); }
    });
    var t0 = Date.now();
    document.getElementById("rfr").onclick = function () { t0 = Date.now(); };
    setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); document.getElementById("rfu").textContent = ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + s % 60).slice(-2); }, 500);
    setTimeout(function () { if (!bereit) { var p = no.querySelector("p"); if (p) p.textContent = "Kein Beamer-Fenster gefunden. Öffne die Präsentation in einem zweiten Fenster (gleiche Adresse, ohne ?referent=1)."; } }, 3000);
  }

  function start() { if (ref) lehrer(); else beamer(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
