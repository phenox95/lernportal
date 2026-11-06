/* Interaktive Bausteine für die Energie-Präsentationen. Arbeitet mit data-ia-Attributen, nichts wird gespeichert oder ausgewertet.
   Läuft nur im Browser der Lehrkraft bzw. am Board. Nach einem Klick verliert das Element den Fokus, damit Leertaste und
   Pfeiltasten weiter die Folie wechseln (das Blättern übernimmt das Skript der Präsentation). */
(function () {
  "use strict";
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function mk(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; }
  function press(el, fn) {
    el.setAttribute("tabindex", "0"); if (!el.getAttribute("role")) el.setAttribute("role", "button");
    el.addEventListener("click", function (e) { fn(e); if (document.activeElement === el && e.detail) el.blur(); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); fn(e); } });
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function shake(el) { el.classList.add("ia-shake"); setTimeout(function () { el.classList.remove("ia-shake"); }, 400); }
  function komma(n) { return String(n).replace(".", ","); }

  /* Richtig oder falsch */
  $$("[data-ia=tf]").forEach(function (box) {
    var fb = mk("p", "ia-fb"); fb.setAttribute("aria-live", "polite"); box.parentNode.insertBefore(fb, box.nextSibling);
    $$(".choice", box).forEach(function (c) {
      press(c, function () {
        var ok = c.textContent.trim() === box.dataset.richtig;
        $$(".choice", box).forEach(function (x) { x.classList.remove("ok", "bad"); });
        c.classList.add(ok ? "ok" : "bad");
        fb.className = "ia-fb " + (ok ? "ok" : "bad");
        fb.textContent = ok ? "✓ Richtig. " + (box.dataset.feedback || "") : "✗ Nicht ganz. Lies die Aussage noch einmal und prüfe deine Begründung.";
      });
    });
  });

  /* Fragefeld beschreibbar, Fragestarter fügen Text ein */
  $$("[data-ia=qfield]").forEach(function (q) {
    var starters = q.parentNode.querySelectorAll("[data-ins]");
    $$("[data-ins]", q.parentNode).forEach(function (c) {
      press(c, function () {
        q.textContent = (q.textContent.trim() ? q.textContent.trim() + " " : "") + c.dataset.ins;
        q.focus(); var r = document.createRange(); r.selectNodeContents(q); r.collapse(false); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      });
    });
  });

  /* Karten aufklappen */
  var DET = { Sonne: "Solaranlagen auf Dächern und Freiflächen", Wind: "Windräder an Land, in Nord- und Ostsee", Wasser: "Laufwasserkraftwerke am Rhein, Pumpspeicher im Schwarzwald", Biomasse: "Biogasanlagen und Holzheizungen", "Erdwärme": "Tiefe Bohrungen für Fernwärme, Wärmepumpen im Garten" };
  $$("[data-ia=cards] .card").forEach(function (t) {
    var h = t.querySelector("b"); if (!h) return;
    t.appendChild(mk("p", "ia-detail", DET[h.textContent.trim()] || ""));
    press(t, function () { t.classList.toggle("open"); });
    t.setAttribute("aria-label", h.textContent + ": Beispiel zeigen");
  });

  /* Tabelle direkt beschriften */
  $$("[data-ia=cells] td:not(:first-child)").forEach(function (td) { td.setAttribute("contenteditable", "true"); td.setAttribute("aria-label", "Eingabefeld"); td.classList.add("ia-edit"); });

  /* Pumpspeicher: Zustand wählen */
  $$("[data-ia=toggle]").forEach(function (box) {
    var svg = box.querySelector("svg.schema"), a1 = svg.querySelector(".a1"), a2 = svg.querySelector(".a2");
    var bar = mk("div", "ia-toggle"), info = mk("p", "ia-info", "Wähle einen Zustand des Stromnetzes."); info.setAttribute("aria-live", "polite");
    [["Zu viel Strom", "Das Wasser wird nach oben gepumpt. Die Anlage speichert Energie.", 1], ["Zu wenig Strom", "Das Wasser fließt nach unten und treibt die Turbine an. Die Anlage liefert Strom.", 2], ["Beides", "Wähle einen Zustand des Stromnetzes.", 0]].forEach(function (o, i) {
      var b = mk("button", "ia-btn" + (i === 2 ? " on" : ""), o[0]); b.type = "button";
      b.addEventListener("click", function () { $$(".ia-btn", bar).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); a1.style.opacity = o[2] === 2 ? ".15" : ""; a2.style.opacity = o[2] === 1 ? ".15" : ""; info.textContent = o[1]; b.blur(); });
      bar.appendChild(b);
    });
    var host = box.querySelector("[data-ia-host]"); host.insertBefore(info, host.firstChild); host.insertBefore(bar, host.firstChild);
  });

  /* Aufgaben abhaken */
  $$("[data-ia=tick] .task").forEach(function (d) { press(d, function () { d.classList.toggle("done"); }); });

  /* Lückensatz mit Wortkarten */
  $$("[data-ia=gap]").forEach(function (m) {
    var blanks = $$(".blank", m), sol = m.dataset.words.split("|");
    blanks.forEach(function (b, i) { b.dataset.l = sol[i]; });
    var bank = mk("div", "ia-bank"), msg = mk("span", "ia-msg", "Tippe ein Wort an."); msg.setAttribute("aria-live", "polite");
    sol.slice().reverse().forEach(function (w) {
      var c = mk("span", "ia-word", w);
      press(c, function () {
        if (c.classList.contains("used")) return;
        var next = blanks.filter(function (b) { return !b.dataset.f && b.dataset.l === w; })[0];
        if (next) { next.textContent = w; next.dataset.f = "1"; next.classList.add("filled"); c.classList.add("used"); msg.textContent = blanks.every(function (b) { return b.dataset.f; }) ? "✓ Der Satz ist vollständig." : "✓ Passt."; }
        else { shake(c); msg.textContent = "Das Wort passt zu keiner freien Lücke."; }
      });
      bank.appendChild(c);
    });
    var reset = mk("button", "ia-btn", "Neu"); reset.type = "button";
    reset.addEventListener("click", function () { blanks.forEach(function (b) { b.textContent = ""; delete b.dataset.f; b.classList.remove("filled"); }); $$(".ia-word", bank).forEach(function (w) { w.classList.remove("used"); }); msg.textContent = "Tippe ein Wort an."; reset.blur(); });
    bank.appendChild(reset); bank.appendChild(msg); m.appendChild(bank);
  });

  /* Verdeckte Inhalte aufdecken */
  $$(".slide").forEach(function (s) {
    var cov = $$("[data-ia=cover]", s); if (!cov.length) return;
    cov.forEach(function (c) { c.classList.add("ia-cover"); c.setAttribute("aria-label", "Aufdecken"); press(c, function () { c.classList.remove("ia-cover"); c.removeAttribute("aria-label"); }); });
    var ctl = mk("div", "ia-ctl"), all = mk("button", "ia-btn", "Alles aufdecken"), back = mk("button", "ia-btn", "Wieder verdecken");
    all.type = back.type = "button";
    all.addEventListener("click", function () { cov.forEach(function (c) { c.classList.remove("ia-cover"); }); all.blur(); });
    back.addEventListener("click", function () { cov.forEach(function (c) { c.classList.add("ia-cover"); }); back.blur(); });
    ctl.appendChild(back); ctl.appendChild(all); s.appendChild(ctl);
  });

  /* Stimmen zählen */
  $$("[data-ia=vote]").forEach(function (box) {
    var cards = $$(".card", box), reset = mk("button", "ia-btn", "Stimmen löschen"); reset.type = "button";
    cards.forEach(function (t) {
      var b = mk("span", "ia-vote", "0"); b.setAttribute("aria-hidden", "true"); t.appendChild(b); t.dataset.v = "0";
      press(t, function () { var n = (+t.dataset.v) + 1; t.dataset.v = n; b.textContent = n; b.classList.add("show"); t.setAttribute("aria-label", n + " Stimmen"); });
    });
    reset.addEventListener("click", function () { cards.forEach(function (t) { t.dataset.v = 0; var b = t.querySelector(".ia-vote"); b.textContent = "0"; b.classList.remove("show"); }); reset.blur(); });
    var host = box.querySelector("[data-ia-host]"); host.appendChild(mk("span", "ia-info inline", "Tippe auf eine Maßnahme, um eine Stimme zu geben.")); host.appendChild(reset);
  });

  /* Balken: Abschnitt antippen für die Zahl dahinter */
  $$("[data-ia=seg]").forEach(function (box) {
    var info = mk("p", "ia-info sdetail", "Tippe auf einen Abschnitt des Balkens."); info.setAttribute("aria-live", "polite");
    var segs = $$(".seg[data-d]", box);
    segs.forEach(function (sg) {
      sg.setAttribute("aria-label", sg.dataset.n + ": Zahl zeigen");
      press(sg, function () { segs.forEach(function (x) { x.classList.remove("sel"); }); sg.classList.add("sel"); info.textContent = sg.dataset.n + ": " + sg.dataset.d; });
    });
    box.appendChild(info);
  });

  /* Auswählen */
  $$("[data-ia=select]").forEach(function (box) {
    var items = $$(".pill", box);
    items.forEach(function (c) { press(c, function () { items.forEach(function (x) { x.classList.remove("sel"); x.setAttribute("aria-pressed", "false"); }); c.classList.add("sel"); c.setAttribute("aria-pressed", "true"); }); });
  });

  /* Zuordnen: Aussage antippen, dann die passende Kategorie */
  $$("[data-ia=sort]").forEach(function (box) {
    var chips = $$(".ia-chip", box), cats = $$(".ia-cat", box), fb = box.querySelector(".ia-fb"), sel = null, wrong = 0, done = 0, pool = box.querySelector(".ia-chips");
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

  /* Reihenfolge: Karten in der richtigen Reihenfolge antippen */
  $$("[data-ia=order]").forEach(function (box) {
    var items = $$("ol li", box).map(function (li) { return li.textContent; }); box.querySelector("ol").remove();
    var slots = mk("ol", "ia-slots"), pool = mk("div", "ia-pool"), fb = mk("p", "ia-fb"), next = 0, names = ["Neues", "Bestand", "Folge"];
    fb.setAttribute("aria-live", "polite");
    items.forEach(function (t, i) { var s = mk("li", "ia-slot"); s.innerHTML = "<b>" + (names[i] || (i + 1)) + "</b><span></span>"; slots.appendChild(s); });
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
    var foot = mk("div", "ia-foot"); foot.appendChild(fb); foot.appendChild(reset); box.appendChild(slots); box.appendChild(pool); box.appendChild(foot);
  });

  /* Schätzen mit Regler, dann auflösen */
  $$("[data-ia=guess]").forEach(function (g) {
    var real = parseFloat(g.dataset.real), val = 50, out = mk("p", "ia-val", "50 %"), rng = document.createElement("input");
    rng.type = "range"; rng.min = 0; rng.max = 100; rng.step = 1; rng.value = 50; rng.setAttribute("aria-label", "Dein Schätzwert in Prozent");
    var track = mk("div", "ia-track"), mark = mk("span", "ia-real"), res = mk("p", "ia-res"), btn = mk("button", "ia-btn on", "Auflösen");
    track.appendChild(rng); mark.hidden = true; track.appendChild(mark); res.setAttribute("aria-live", "polite"); btn.type = "button";
    rng.addEventListener("input", function () { val = +rng.value; out.textContent = val + " %"; });
    rng.addEventListener("keydown", function (e) { e.stopPropagation(); });
    btn.addEventListener("click", function () {
      var diff = Math.round(Math.abs(val - real) * 10) / 10;
      mark.hidden = false; mark.style.left = real + "%"; mark.setAttribute("data-t", komma(real) + " %");
      res.innerHTML = "<b>Tatsächlich: " + komma(real) + " %</b><br>" + (diff <= 2 ? "Fast genau. Du lagst " : (val > real ? "Du hast den Anteil überschätzt, um " : "Du hast den Anteil unterschätzt, um ")) + komma(diff) + " Prozentpunkte" + (diff <= 2 ? " daneben." : ".");
      rng.disabled = true; btn.blur();
    });
    g.appendChild(out); g.appendChild(track); g.appendChild(btn); g.appendChild(res);
  });

  /* Selbsteinschätzung (nur auf dem Bildschirm, keine Speicherung) */
  $$("[data-ia=self] .ia-row").forEach(function (row) {
    row.appendChild(mk("p", "ia-stmt", row.dataset.t));
    var opts = mk("div", "ia-opts");
    [["Sicher", "3", "●●●"], ["Fast", "2", "●●○"], ["Noch nicht", "1", "●○○"]].forEach(function (o) {
      var b = mk("button", "ia-opt l" + o[1]); b.type = "button"; b.setAttribute("aria-pressed", "false");
      b.innerHTML = '<span aria-hidden="true">' + o[2] + "</span> " + o[0];
      b.addEventListener("click", function () { $$(".ia-opt", opts).forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); }); b.classList.add("on"); b.setAttribute("aria-pressed", "true"); b.blur(); });
      opts.appendChild(b);
    });
    row.appendChild(opts);
  });
})();
