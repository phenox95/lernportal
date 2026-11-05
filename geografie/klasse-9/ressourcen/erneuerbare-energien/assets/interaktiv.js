/* Interaktive Bausteine für die Präsentationen. Arbeitet mit data-Attributen, keine Auswertung, nichts wird gespeichert.
   Wird nicht in der Referentenansicht (?presenter) ausgeführt. Nach einem Klick verliert das Element den Fokus,
   damit Leertaste und Pfeiltasten weiter die Folie wechseln. */
(function () {
  "use strict";
  if (new URLSearchParams(location.search).has("presenter")) return;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function press(el, fn) {
    el.setAttribute("tabindex", "0"); if (!el.getAttribute("role")) el.setAttribute("role", "button");
    el.addEventListener("click", function (e) { fn(e); if (document.activeElement === el && e.detail) el.blur(); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); fn(e); } });
  }
  function mk(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; }

  /* Beim Schreiben dürfen Leertaste und Pfeile die Folie nicht wechseln */
  document.addEventListener("keydown", function (e) { if (e.target && e.target.isContentEditable) e.stopPropagation(); }, true);

  /* 1. Richtig oder falsch (Do Now) */
  $$(".choices[data-richtig]").forEach(function (box) {
    var fb = mk("p", "ia-fb"); fb.setAttribute("aria-live", "polite"); box.parentNode.appendChild(fb);
    $$(".choice", box).forEach(function (c) {
      press(c, function () {
        var ok = c.textContent.trim() === box.dataset.richtig;
        $$(".choice", box).forEach(function (x) { x.classList.remove("ia-ok", "ia-bad"); });
        c.classList.add(ok ? "ia-ok" : "ia-bad");
        fb.className = "ia-fb " + (ok ? "ok" : "bad");
        fb.textContent = (ok ? "✓ Richtig. " : "✗ Nicht ganz. Prüfe deine Begründung. ") + (box.dataset.feedback || "");
        if (!ok) fb.textContent = "✗ Nicht ganz. Lies die Aussage noch einmal und prüfe deine Begründung.";
      });
    });
  });

  /* 2. Fragefeld: schreiben und Fragestarter einfügen */
  $$(".qfield").forEach(function (q) {
    var hint = q.querySelector(".hint"); if (hint) hint.dataset.ph = hint.textContent;
    q.setAttribute("contenteditable", "true"); q.setAttribute("role", "textbox"); q.setAttribute("aria-label", "Frage der Klasse");
    var txt = mk("span", "ia-text"); q.insertBefore(txt, q.firstChild); txt.setAttribute("contenteditable", "true"); txt.style.outline = "none";
    q.removeAttribute("contenteditable"); q.addEventListener("click", function () { txt.focus(); });
    function sync() { q.classList.toggle("filled", txt.textContent.trim().length > 0); }
    txt.addEventListener("input", sync);
    var starters = q.parentNode.querySelector(".starters");
    if (starters) $$(".choice", starters).forEach(function (c) {
      press(c, function () { txt.textContent = (txt.textContent ? txt.textContent.trim() + " " : "") + c.textContent.replace("…?", "…").replace("…", "… "); sync(); txt.focus(); var r = document.createRange(); r.selectNodeContents(txt); r.collapse(false); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); });
    });
  });

  /* 3. Karten aufklappen (Quellen) */
  var DET = { Sonne: "Solaranlagen auf Dächern und Freiflächen", Wind: "Windräder an Land, in Nord- und Ostsee", Wasser: "Laufwasserkraftwerke am Rhein, Pumpspeicher im Schwarzwald", Biomasse: "Biogasanlagen und Holzheizungen", "Erdwärme": "Tiefe Bohrungen für Fernwärme, Wärmepumpen im Garten" };
  $$(".b-quellen .tile").forEach(function (t) {
    var h = t.querySelector("h2"); if (!h) return;
    var d = mk("p", "ia-detail", DET[h.textContent.trim()] || ""); t.appendChild(d);
    t.classList.add("ia-card"); press(t, function () { t.classList.toggle("open"); });
    t.setAttribute("aria-label", h.textContent + ": Beispiel zeigen");
  });

  /* 4. Tabelle direkt beschriften */
  $$(".seh-table tbody td:not(:first-child)").forEach(function (td) { td.setAttribute("contenteditable", "true"); td.setAttribute("aria-label", "Eingabefeld"); td.classList.add("ia-edit"); });

  /* 5. Pumpspeicher: Zustand wählen */
  $$(".schema").forEach(function (svg) {
    var a1 = svg.querySelector(".a1"), a2 = svg.querySelector(".a2"); if (!a1 || !a2) return;
    var bar = mk("div", "ia-toggle"), info = mk("p", "ia-info", "Wähle einen Zustand des Stromnetzes.");
    info.setAttribute("aria-live", "polite");
    var opts = [["Zu viel Strom", "Das Wasser wird nach oben gepumpt. Die Anlage speichert Energie.", 1], ["Zu wenig Strom", "Das Wasser fließt nach unten und treibt die Turbine an. Die Anlage liefert Strom.", 2], ["Beides", "Wähle einen Zustand des Stromnetzes.", 0]];
    opts.forEach(function (o, i) {
      var b = mk("button", "ia-btn" + (i === 2 ? " on" : ""), o[0]); b.type = "button";
      b.addEventListener("click", function () {
        $$(".ia-btn", bar).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
        a1.style.opacity = o[2] === 2 ? ".15" : ""; a2.style.opacity = o[2] === 1 ? ".15" : ""; info.textContent = o[1]; b.blur();
      });
      bar.appendChild(b);
    });
    var host = svg.closest(".b-schema"); host = host && host.querySelector(".stats") || svg.parentNode; host.insertBefore(info, host.firstChild); host.insertBefore(bar, host.firstChild);
  });

  /* 6. Aufgaben abhaken */
  $$(".level-tasks > div").forEach(function (d) { press(d, function () { d.classList.toggle("ia-done"); }); d.setAttribute("aria-pressed", "false"); });

  /* 7. Lückensatz mit Wortkarten */
  var SOL = [["schwanken", "Speicher", "Stromnetz"], ["Bestand", "langsam"]];
  $$(".merk").forEach(function (m) {
    var blanks = $$(".blank", m); if (!blanks.length) return;
    var sol = SOL.filter(function (s) { return s.length === blanks.length; })[0]; if (!sol) return;
    blanks.forEach(function (b, i) { b.dataset.l = sol[i]; });
    var fine = m.querySelector(".fine"); if (fine) fine.remove();
    var bank = mk("div", "ia-bank"), msg = mk("span", "ia-msg", "Tippe ein Wort an."); msg.setAttribute("aria-live", "polite");
    sol.slice().sort(function () { return 0; }).reverse().forEach(function (w) {
      var c = mk("span", "ia-word", w);
      press(c, function () {
        if (c.classList.contains("used")) return;
        var next = blanks.filter(function (b) { return !b.dataset.f && b.dataset.l === w; })[0];
        if (next) { next.textContent = w; next.dataset.f = "1"; next.classList.add("ia-filled"); c.classList.add("used"); msg.textContent = blanks.every(function (b) { return b.dataset.f; }) ? "✓ Der Satz ist vollständig." : "✓ Passt."; }
        else { c.classList.add("ia-shake"); msg.textContent = "Das Wort passt zu keiner freien Lücke. Lies den Satz noch einmal."; setTimeout(function () { c.classList.remove("ia-shake"); }, 400); }
      });
      bank.appendChild(c);
    });
    var reset = mk("button", "ia-btn", "Neu"); reset.type = "button";
    reset.addEventListener("click", function () { blanks.forEach(function (b) { b.textContent = ""; delete b.dataset.f; b.classList.remove("ia-filled"); }); $$(".ia-word", bank).forEach(function (w) { w.classList.remove("used"); }); msg.textContent = "Tippe ein Wort an."; reset.blur(); });
    bank.appendChild(reset); bank.appendChild(msg); m.appendChild(bank);
  });

  /* 8. Verdeckte Inhalte aufdecken */
  $$(".slide").forEach(function (s) {
    var cov = $$(".b-matrix dd, .b-wirk .step, .b-wirk .res", s); if (!cov.length) return;
    cov.forEach(function (c) { c.classList.add("ia-cover"); c.setAttribute("aria-label", "Aufdecken"); press(c, function () { c.classList.remove("ia-cover"); c.removeAttribute("aria-label"); }); });
    var all = mk("button", "ia-btn ia-all", "Alles aufdecken"); all.type = "button";
    all.addEventListener("click", function () { cov.forEach(function (c) { c.classList.remove("ia-cover"); }); all.blur(); });
    var cov2 = mk("button", "ia-btn ia-all2", "Wieder verdecken"); cov2.type = "button";
    cov2.addEventListener("click", function () { cov.forEach(function (c) { c.classList.add("ia-cover"); }); cov2.blur(); });
    var tb = s.querySelector(".topbar"), tm = tb && tb.querySelector(".time"); if (tb) { tb.insertBefore(cov2, tm); tb.insertBefore(all, tm); } else { s.appendChild(all); s.appendChild(cov2); }
  });

  /* 9. Maßnahmen: Stimmen zählen */
  $$(".b-mass").forEach(function (box) {
    var tiles = $$(".tile", box), badges = [];
    tiles.forEach(function (t) { var b = mk("span", "ia-vote", "0"); b.setAttribute("aria-hidden", "true"); t.appendChild(b); badges.push(b); t.classList.add("ia-card"); t.dataset.v = "0";
      press(t, function () { var n = (+t.dataset.v) + 1; t.dataset.v = n; b.textContent = n; b.classList.add("show"); t.setAttribute("aria-label", n + " Stimmen"); }); });
    var crit = box.parentNode.querySelector(".crit"); if (!crit) return;
    var r = mk("button", "ia-btn", "Stimmen löschen"); r.type = "button"; r.addEventListener("click", function () { tiles.forEach(function (t, i) { t.dataset.v = 0; badges[i].textContent = "0"; badges[i].classList.remove("show"); }); r.blur(); });
    var h = mk("span", "ia-info inline", "Tippe auf eine Maßnahme, um eine Stimme zu geben."); crit.appendChild(h); crit.appendChild(r);
  });

  /* 10. Balken: Abschnitt antippen für die Zahl dahinter */
  var DT = [["Gas und Heizöl", "73,3 % von 43,8 Mio. Wohnungen sind etwa 32 Mio. Wohnungen."], ["Fernwärme", "15,5 % sind etwa 6,8 Mio. Wohnungen."], ["Wärmepumpe, Solar-, Erdwärme", "4,5 % sind etwa 2 Mio. Wohnungen."], ["Holz, Strom, Sonstiges", "6,8 % sind etwa 3 Mio. Wohnungen."],
    ["Wärmepumpe oder Fernwärme", "77,4 % von 172 600 neuen Wohnungen sind etwa 133 600 Wohnungen."], ["Gas u. a.", "22,6 % von 172 600 neuen Wohnungen sind etwa 39 000 Wohnungen."],
    ["Benzin", "59,3 % von 49,5 Mio. Autos sind etwa 29,4 Mio. Autos."], ["Diesel", "27,0 % sind etwa 13,4 Mio. Autos."], ["Hybrid (auch Plug-in)", "8,8 % sind etwa 4,4 Mio. Autos."], ["Elektro", "4,1 % von 49,5 Mio. Autos sind etwa 2 Mio. Autos."], ["Rest", "0,8 % sind etwa 0,4 Mio. Autos."]];
  $$(".b-stack").forEach(function (st) {
    var info = mk("p", "ia-info sdetail", "Tippe auf einen Abschnitt des Balkens."); info.setAttribute("aria-live", "polite");
    var legs = $$(".legend li", st);
    $$(".srow", st).forEach(function (row) {
      var label = (row.querySelector(".slabel") || {}).childNodes[0].textContent.trim();
      var segs = $$(".seg", row), vi = 0;
      segs.forEach(function (sg, i) {
        var txt = sg.textContent.replace(/[0-9,.]+ %/, "").trim();
        if (!txt) { var li = legs[vi++]; txt = li ? li.textContent.replace(/[0-9,.]+ %/, "").trim() : ""; }
        var hit = DT.filter(function (d) { return d[0] === txt || (d[0] === "Elektro" && txt.indexOf("Elektro") === 0); })[0];
        if (!hit && label.indexOf("Neue Autos") === 0) hit = [txt, i === 0 ? "19,1 % aller neuen Autos 2025 sind Elektroautos." : "80,9 % aller neuen Autos 2025 haben einen anderen Antrieb."];
        if (!hit) return;
        sg.classList.add("ia-seg"); sg.setAttribute("aria-label", txt + ": Zahl zeigen");
        press(sg, function () { $$(".ia-seg", st).forEach(function (x) { x.classList.remove("sel"); }); sg.classList.add("sel"); info.textContent = (label.indexOf("Neu") === 0 ? "" : "") + txt + ": " + hit[1]; });
      });
    });
    st.appendChild(info);
  });

  /* 11. Auswählen (Zusatzaufgabe) */
  $$(".chips .chip5").forEach(function (c, _, all) { press(c, function () { all.forEach(function (x) { x.classList.remove("sel"); x.setAttribute("aria-pressed", "false"); }); c.classList.add("sel"); c.setAttribute("aria-pressed", "true"); }); });

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function shake(el) { el.classList.add("ia-shake"); setTimeout(function () { el.classList.remove("ia-shake"); }, 400); }

  /* 12. Zuordnen: Aussage antippen, dann die passende Kategorie */
  $$(".ia-sort").forEach(function (box) {
    var chips = $$(".ia-chip", box), cats = $$(".ia-cat", box), fb = box.querySelector(".ia-fb"), sel = null, wrong = 0, done = 0;
    var pool = box.querySelector(".ia-chips");
    shuffle(chips.slice()).forEach(function (c) { pool.appendChild(c); });
    chips.forEach(function (c) { press(c, function () { if (c.classList.contains("placed")) return; if (sel) sel.classList.remove("sel"); sel = c === sel ? null : c; if (sel) sel.classList.add("sel"); fb.textContent = sel ? "Welche Quelle passt zu dieser Aussage?" : ""; fb.className = "ia-fb"; }); });
    cats.forEach(function (cat) {
      press(cat, function () {
        if (!sel) { fb.textContent = "Tippe zuerst eine Aussage an."; fb.className = "ia-fb"; return; }
        if (sel.dataset.k === cat.dataset.k) {
          sel.classList.remove("sel"); sel.classList.add("placed"); cat.querySelector(".ia-drop").appendChild(sel); sel.removeAttribute("tabindex"); sel.removeAttribute("role"); sel = null; done++;
          fb.className = "ia-fb ok"; fb.textContent = done === chips.length ? "✓ Alles zugeordnet. Fehlversuche: " + wrong + "." : "✓ Passt.";
        } else { wrong++; shake(sel); fb.className = "ia-fb bad"; fb.textContent = "✗ Das passt nicht zu " + cat.querySelector("b").textContent + ". Versuche es noch einmal."; }
      });
    });
  });

  /* 13. Reihenfolge: Karten in der richtigen Reihenfolge antippen */
  $$(".ia-order").forEach(function (box) {
    var items = $$("ol li", box).map(function (li) { return li.textContent; }); box.querySelector("ol").remove();
    var slots = mk("ol", "ia-slots"), pool = mk("div", "ia-pool"), fb = mk("p", "ia-fb"); fb.setAttribute("aria-live", "polite");
    var names = ["Neues", "Bestand", "Folge"], next = 0;
    items.forEach(function (t, i) { var s = mk("li", "ia-slot"); s.innerHTML = '<b>' + (names[i] || (i + 1)) + '</b><span></span>'; slots.appendChild(s); });
    var cards = items.map(function (t, i) {
      var c = mk("span", "ia-ocard", t); c.dataset.i = i;
      press(c, function () {
        if (c.classList.contains("placed")) return;
        if (+c.dataset.i === next) { c.classList.add("placed"); slots.children[next].querySelector("span").appendChild(c); c.removeAttribute("tabindex"); c.removeAttribute("role"); next++; fb.className = "ia-fb ok"; fb.textContent = next === items.length ? "✓ Die Kette stimmt." : "✓ Weiter mit dem nächsten Schritt."; }
        else { shake(c); fb.className = "ia-fb bad"; fb.textContent = "✗ Das ist noch nicht dran. Welcher Schritt kommt zuerst?"; }
      });
      return c;
    });
    shuffle(cards.slice()).forEach(function (c) { pool.appendChild(c); });
    var reset = mk("button", "ia-btn", "Neu mischen"); reset.type = "button";
    reset.addEventListener("click", function () { next = 0; cards.forEach(function (c) { c.classList.remove("placed"); c.setAttribute("tabindex", "0"); c.setAttribute("role", "button"); }); shuffle(cards.slice()).forEach(function (c) { pool.appendChild(c); }); fb.textContent = ""; fb.className = "ia-fb"; reset.blur(); });
    box.appendChild(slots); box.appendChild(pool); box.appendChild(fb); box.appendChild(reset);
  });

  /* 14. Schätzen mit Regler, dann auflösen */
  $$(".ia-guess").forEach(function (g) {
    var real = parseFloat(g.dataset.real), val = 50;
    var out = mk("p", "ia-val", "50 %"), rng = document.createElement("input");
    rng.type = "range"; rng.min = 0; rng.max = 100; rng.step = 1; rng.value = 50; rng.setAttribute("aria-label", "Dein Schätzwert in Prozent");
    var track = mk("div", "ia-track"); track.appendChild(rng); var mark = mk("span", "ia-real"); mark.hidden = true; track.appendChild(mark);
    var res = mk("p", "ia-res"); res.setAttribute("aria-live", "polite");
    var btn = mk("button", "ia-btn on", "Auflösen"); btn.type = "button";
    rng.addEventListener("input", function () { val = +rng.value; out.textContent = val + " %"; });
    rng.addEventListener("keydown", function (e) { e.stopPropagation(); });
    btn.addEventListener("click", function () {
      var fmt = String(real).replace(".", ","), diff = Math.round(Math.abs(val - real) * 10) / 10;
      mark.hidden = false; mark.style.left = real + "%"; mark.setAttribute("data-t", fmt + " %");
      res.innerHTML = "<b>Tatsächlich: " + fmt + " %</b><br>" + (diff <= 2 ? "Fast genau. Du lagst " + String(diff).replace(".", ",") + " Prozentpunkte daneben." : (val > real ? "Du hast den Anteil überschätzt, um " : "Du hast den Anteil unterschätzt, um ") + String(diff).replace(".", ",") + " Prozentpunkte.");
      rng.disabled = true; btn.blur();
    });
    g.appendChild(out); g.appendChild(track); g.appendChild(btn); g.appendChild(res);
  });

  /* 15. Selbsteinschätzung (bleibt nur auf dem Bildschirm, keine Speicherung) */
  $$(".ia-self .ia-row").forEach(function (row) {
    row.appendChild(mk("p", "ia-stmt", row.dataset.t));
    var opts = mk("div", "ia-opts");
    [["Sicher", "3"], ["Fast", "2"], ["Noch nicht", "1"]].forEach(function (o) {
      var b = mk("button", "ia-opt l" + o[1]); b.type = "button"; b.setAttribute("aria-pressed", "false");
      b.innerHTML = '<span class="ia-mk" aria-hidden="true">' + (o[1] === "3" ? "●●●" : o[1] === "2" ? "●●○" : "●○○") + "</span> " + o[0];
      b.addEventListener("click", function () { $$(".ia-opt", opts).forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); }); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); b.blur(); });
      opts.appendChild(b);
    });
    row.appendChild(opts);
  });
})();
