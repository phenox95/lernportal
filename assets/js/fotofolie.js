/* Lernportal – Foto in die Folie (Prototyp).
   Ein Foto (Heft, Plakat, Tafelbild, Gruppenergebnis) wird direkt auf die aktuelle Folie gelegt und füllt die Bühne.
   Alles bleibt im Browser: Das Bild wird nicht hochgeladen, nicht gespeichert und nicht gesendet. Beim Neuladen ist es weg.

   Einbinden: <script src=".../assets/js/fotofolie.js" defer></script> am Ende einer Präsentation (wie referent.js).
   Wege zum Bild:
     - Knopf „Foto“ links oben (erscheint bei Berührung oder Fokus) oder Taste B: öffnet die Auswahl. Auf dem iPad und Handy
       bietet sie „Foto aufnehmen“ und die Fotomediathek an.
     - Einfügen (Strg+V oder Cmd+V): ein kopiertes Bild, auch vom iPad per Zwischenablage auf den Mac (Universal Clipboard).
     - Datei auf die Folie ziehen (Laptop).
     - AirDrop oder USB vom iPad auf den Laptop, dann Knopf „Foto“ und Datei wählen.
   Bedienung auf dem Bild: Drehen, Vergrößern per Tippen (Zoom 1x, 2x, 3x), Schließen (Esc).
   Mehrere Fotos: Pfeile am Rand wechseln durch die Fotos dieser Sitzung. Es gibt nur ein Ablageziel: die Seite selbst. */
(function () {
  "use strict";
  if (window.top !== window) return; /* nicht in Vorschau-Fenstern */
  var fotos = [], idx = -1, drehung = 0, zoom = 1;
  var NS = "lp-ff";

  var css = document.createElement("style");
  css.textContent =
    "#" + NS + "{position:fixed;inset:0;z-index:2500;background:rgba(10,18,14,.94);display:none;align-items:center;justify-content:center;overflow:hidden}" +
    "#" + NS + ".an{display:flex}" +
    "#" + NS + " img{max-width:100%;max-height:100%;object-fit:contain;transform-origin:center;transition:transform .15s;touch-action:manipulation;cursor:zoom-in}" +
    "#" + NS + " .leiste{position:absolute;left:50%;transform:translateX(-50%);bottom:max(14px,env(safe-area-inset-bottom,0px));display:flex;gap:8px;flex-wrap:wrap;justify-content:center;z-index:2}" +
    "#" + NS + " button,.lp-ff-auf{font:700 18px Andika,Verdana,sans-serif;min-height:48px;min-width:48px;padding:8px 18px;border:0;border-radius:12px;background:#0F6E56;color:#fff;cursor:pointer}" +
    "#" + NS + " button.s{background:#3a4a43}" +
    "#" + NS + " .zahl{position:absolute;left:14px;top:14px;color:#fff;font:700 16px Andika,Verdana,sans-serif;background:rgba(0,0,0,.5);padding:4px 10px;border-radius:8px}" +
    ".lp-ff-auf{position:fixed;left:10px;top:60px;z-index:3000;opacity:0;transition:opacity .15s}.lp-ff-auf:focus,.lp-ff-auf:hover{opacity:1}" +
    "@media (hover:none){.lp-ff-auf{opacity:.35}}";
  document.head.appendChild(css);

  var wurzel = document.createElement("div");
  wurzel.id = NS; wurzel.setAttribute("role", "dialog"); wurzel.setAttribute("aria-label", "Foto");
  wurzel.innerHTML = '<span class="zahl" aria-live="polite"></span><img alt="Hochgeladenes Foto"><div class="leiste">' +
    '<button type="button" class="s" data-a="vor" aria-label="Vorheriges Foto">◀</button>' +
    '<button type="button" class="s" data-a="dreh" aria-label="Foto drehen">↻ Drehen</button>' +
    '<button type="button" class="s" data-a="zoom" aria-label="Vergrößern">🔍 1x</button>' +
    '<button type="button" class="s" data-a="neu" aria-label="Weiteres Foto wählen">＋ Foto</button>' +
    '<button type="button" class="s" data-a="nach" aria-label="Nächstes Foto">▶</button>' +
    '<button type="button" data-a="zu">Schließen</button></div>';
  document.body.appendChild(wurzel);
  var bild = wurzel.querySelector("img"), zahl = wurzel.querySelector(".zahl"), zoomKn = wurzel.querySelector('[data-a=zoom]');

  var eingabe = document.createElement("input");
  eingabe.type = "file"; eingabe.accept = "image/*"; eingabe.multiple = true; eingabe.hidden = true; eingabe.id = NS + "-in";
  document.body.appendChild(eingabe);

  function anwenden() {
    bild.style.transform = "rotate(" + drehung + "deg) scale(" + zoom + ")";
    zoomKn.textContent = "🔍 " + zoom + "x";
  }
  function zeigen(i) {
    if (!fotos.length) return;
    idx = (i + fotos.length) % fotos.length; drehung = 0; zoom = 1;
    bild.src = fotos[idx]; anwenden();
    zahl.textContent = "Foto " + (idx + 1) + " von " + fotos.length;
    wurzel.classList.add("an");
    wurzel.querySelector('[data-a=zu]').focus();
  }
  function zu() { wurzel.classList.remove("an"); }
  function hinzu(dateien) {
    var n = 0;
    [].forEach.call(dateien, function (f) {
      if (!f || !/^image\//.test(f.type)) return;
      fotos.push(URL.createObjectURL(f)); n++;
    });
    if (n) zeigen(fotos.length - n);
  }

  wurzel.addEventListener("click", function (e) {
    var a = e.target.getAttribute && e.target.getAttribute("data-a");
    if (e.target === bild) { zoom = zoom >= 3 ? 1 : zoom + 1; anwenden(); return; }
    if (!a) return;
    if (a === "zu") zu();
    else if (a === "dreh") { drehung = (drehung + 90) % 360; anwenden(); }
    else if (a === "zoom") { zoom = zoom >= 3 ? 1 : zoom + 1; anwenden(); }
    else if (a === "neu") eingabe.click();
    else if (a === "vor") zeigen(idx - 1);
    else if (a === "nach") zeigen(idx + 1);
  });
  eingabe.addEventListener("change", function () { hinzu(eingabe.files); eingabe.value = ""; });

  document.addEventListener("paste", function (e) {
    var dt = e.clipboardData; if (!dt) return;
    var t = e.target; if (t && (t.isContentEditable || /INPUT|TEXTAREA/.test(t.tagName))) return;
    var dateien = []; [].forEach.call(dt.items || [], function (it) { if (it.kind === "file" && /^image\//.test(it.type)) dateien.push(it.getAsFile()); });
    if (dateien.length) { e.preventDefault(); hinzu(dateien); }
  });
  ["dragover", "drop"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var hat = e.dataTransfer && [].some.call(e.dataTransfer.types || [], function (t) { return t === "Files"; });
      if (!hat) return; e.preventDefault();
      if (ev === "drop") hinzu(e.dataTransfer.files);
    });
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target; if (t && (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName))) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape" && wurzel.classList.contains("an")) { zu(); e.stopPropagation(); }
    else if ((e.key === "b" || e.key === "B") && !wurzel.classList.contains("an")) { fotos.length ? zeigen(idx < 0 ? 0 : idx) : eingabe.click(); }
    else if (wurzel.classList.contains("an")) {
      if (e.key === "ArrowRight") { e.stopPropagation(); e.preventDefault(); zeigen(idx + 1); }
      else if (e.key === "ArrowLeft") { e.stopPropagation(); e.preventDefault(); zeigen(idx - 1); }
    }
  }, true);

  var auf = document.createElement("button");
  auf.type = "button"; auf.className = "lp-ff-auf"; auf.textContent = "Foto (B)"; auf.setAttribute("aria-label", "Foto auf die Folie legen");
  auf.onclick = function () { eingabe.click(); };
  document.body.appendChild(auf);
  window.LPFotoFolie = { hinzu: hinzu, zu: zu };
})();
