/* Lernportal – Labor: gemeinsamer Aufbau für alle Geräte.
   1. Die Aufgabe (erster Kasten) wird einklappbar. Auf kleinen oder niedrigen Bildschirmen (Handy, Beamer) startet sie zugeklappt.
   2. Seiten mit Werkzeug bekommen eine „Werkbank“: Bild und Regler sind gleichzeitig sichtbar
      (breit: nebeneinander, das Bild bleibt beim Scrollen stehen; schmal: Bild oben angeheftet, Regler darunter).
   3. Hinweise und Grenzen (gelbe Kästen) rücken unter das Werkzeug, ein Link oben führt hin. Sie bleiben vollständig sichtbar.
   4. Knopf „Vollbild“ zeigt nur die Werkbank (für den Beamer).
   Die Zuordnung, welche Teile Bild und welche Regler sind, steht unten in KONF (je Ordner). Elemente werden nur verschoben,
   ihre Funktionen bleiben erhalten. */
(function () {
  "use strict";
  var KONF = {
    "klimaszenarien": { bild: [".oben"], regler: [".leiste", ".gruppen"], kleinRaus: ["#kz-energie", "#bud"] },
    "meeresspiegel-karte": { bild: ["#kf", ".legende", "#ausw"], regler: [".regler", ".leiste", "#punkt", "#hw", "#stl"], ordnen: true, kleinRaus: [".legende"] },
    "meeresspiegel": { scope: "#p1", bild: ["#sv", "#auss"], regler: [".leiste", ".regler"] },
    "strom": { bild: ["#sv", "#lg", "#ke"], regler: [".leiste", ".tw"] },
    "erdbeben": { bild: ["#kf", "#lege", "#info"], regler: [".leiste"] },
    "energiebilanz": { bild: ["p.erg", ".tw"], regler: [".regler", ".leiste"] },
    "raeuber-beute": { bild: [".lege", "#c"], regler: [".regler", ".leiste"] },
    "laenderquiz": { bild: ["#kf"], regler: [".leiste", "#frage", "#opt", "#erg"] },
    "warming": { bild: ["#cv", ".lg", "#info"], regler: ["label[for=d]", "#d", ".leiste"] },
    "streuplot": { bild: ["#sv", "#info"], regler: ["label[for=d]", "#d", ".leiste"] },
    "klimadiagramm": { bild: ["#sv", "#ausw"], regler: [".leiste", ".tw"] },
    "wirkungsgefuege": { bild: ["#sv"], regler: [".leiste", "#hin"] },
    "kreuzung": { bild: ["#qd", "#erw", "#erg"], regler: [".leiste"] },
    "mikroskop": { bild: ["#cv"], regler: [".leiste", "#st", ".tw"] },
    "seismograph": { bild: ["#c"], regler: [".leiste", "#st"] },
    "schatten": { bild: [".tw"], regler: [".leiste"] }
  };
  var main = document.querySelector("main");
  if (!main) return;
  var teile = location.pathname.replace(/\/index\.html$/, "/").split("/").filter(Boolean);
  var ordner = teile[teile.length - 1] || "";

  /* 1. Aufgabe einklappbar */
  var auf = main.querySelector(":scope > .kasten:not(.warn)");
  if (auf && /\b(Beschreibe|Erkläre|Vergleiche|Sage vorher|Miss|Erstelle|Beurteile|Lies|Untersuche|Bestimme|Probiere|Ordne|Suche)\b/.test(auf.textContent)) {
    var d = document.createElement("details");
    d.className = "aufgabe";
    var s = document.createElement("summary");
    s.textContent = "Aufgabe";
    auf.parentNode.insertBefore(d, auf);
    d.appendChild(s);
    d.appendChild(auf);
    if (innerWidth >= 700 && innerHeight >= 800) d.open = true;
  }

  /* 2. Werkbank */
  var k = KONF[ordner];
  if (!k || !k.bild) return;
  var scope = k.scope ? main.querySelector(k.scope) : main;
  if (!scope) return;
  function sammeln(liste) {
    var r = [];
    liste.forEach(function (sel) {
      [].forEach.call(scope.querySelectorAll(":scope > " + sel), function (e) { if (r.indexOf(e) < 0) r.push(e); });
    });
    return r.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
  }
  var bild = sammeln(k.bild), regler = sammeln(k.regler).filter(function (e) { return bild.indexOf(e) < 0; });
  if (k.ordnen) {
    /* Reihenfolge der Regler wie in KONF angegeben (wichtigster Regler zuerst) */
    var geordnet = [];
    k.regler.forEach(function (sel) { regler.forEach(function (e) { if (e.matches(sel) && geordnet.indexOf(e) < 0) geordnet.push(e); }); });
    regler = geordnet;
  }
  if (!bild.length) return;
  var alle = bild.concat(regler).sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
  var wb = document.createElement("div"); wb.className = "werkbank";
  var kopf = document.createElement("div"); kopf.className = "wb-kopf";
  var wbB = document.createElement("div"); wbB.className = "wb-bild";
  var wbR = document.createElement("div"); wbR.className = "wb-regler";
  alle[0].parentNode.insertBefore(wb, alle[0]);
  wb.appendChild(kopf); wb.appendChild(wbB); wb.appendChild(wbR);
  bild.forEach(function (e) { wbB.appendChild(e); });
  regler.forEach(function (e) { wbR.appendChild(e); });
  main.classList.add("mit-werkbank");
  /* auf schmalen Bildschirmen nur das Wichtigste anheften, der Rest kommt über die Regler */
  if (k.kleinRaus && matchMedia("(max-width:979px)").matches) {
    k.kleinRaus.forEach(function (sel) { var e = wbB.querySelector(sel); if (e) wbR.appendChild(e); });
  }

  /* 3. Hinweise unter die Werkbank */
  var warn = [].filter.call(main.querySelectorAll(":scope > .kasten.warn"), function (e) {
    return e.compareDocumentPosition(wb) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  var nachWb = wb.parentNode === main ? wb : main.querySelector(":scope > " + k.scope);
  if (warn.length && nachWb) {
    var sec = document.createElement("section"); sec.className = "hinweise"; sec.id = "hinweise";
    var h = document.createElement("h2"); h.textContent = "Hinweise und Grenzen"; sec.appendChild(h);
    warn.forEach(function (e) { sec.appendChild(e); });
    nachWb.parentNode.insertBefore(sec, nachWb.nextSibling);
    var a = document.createElement("a"); a.href = "#hinweise"; a.textContent = "Hinweise und Grenzen ↓"; kopf.appendChild(a);
  }

  /* 4. Vollbild und Anheften */
  if (wb.requestFullscreen) {
    var vb = document.createElement("button"); vb.type = "button"; vb.className = "sek"; vb.textContent = "Vollbild";
    vb.onclick = function () { if (document.fullscreenElement) document.exitFullscreen(); else wb.requestFullscreen().catch(function () {}); };
    document.addEventListener("fullscreenchange", function () { vb.textContent = document.fullscreenElement ? "Vollbild beenden" : "Vollbild"; setTimeout(function () { dispatchEvent(new Event("resize")); }, 50); });
    kopf.appendChild(vb);
  }
  if (matchMedia("(max-width:979px)").matches) {
    var an = document.createElement("button"); an.type = "button"; an.className = "sek"; an.textContent = "Bild lösen"; an.setAttribute("aria-pressed", "false");
    an.onclick = function () { var l = wbB.classList.toggle("lose"); an.textContent = l ? "Bild anheften" : "Bild lösen"; an.setAttribute("aria-pressed", String(l)); };
    kopf.insertBefore(an, kopf.firstChild);
  }
  setTimeout(function () { dispatchEvent(new Event("resize")); }, 60);
})();
