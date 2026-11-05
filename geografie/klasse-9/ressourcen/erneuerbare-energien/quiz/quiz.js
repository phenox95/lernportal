/* Energie-Quiz · Spiellogik
   Läuft ohne Build und ohne Internet. Fragen stehen in fragen.js. */
(function () {
  "use strict";

  var F = window.ENERGIE_FRAGEN;
  var PT = F.PT;
  var DATA = F.DATA;
  var root = document.documentElement;
  var app = document.getElementById("app");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Eingabeart merken: Tastatur-Aktionen werden nicht animiert ---------- */
  root.dataset.input = "pointer";
  document.addEventListener("keydown", function () { root.dataset.input = "key"; }, true);
  document.addEventListener("pointerdown", function () { root.dataset.input = "pointer"; }, true);

  /* ---------- Hilfsfunktionen ---------- */
  function shuffle(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(s) { return esc(s).replace(/CO\u2082/g, "CO<sub>2</sub>"); }
  function plainText(s) { return String(s).replace(/CO\u2082/g, "CO2"); }
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }

  /* Kleiner Zählerpuls: nur bei Zeigereingaben und ohne reduzierte Bewegung */
  function bump(el) {
    if (!el || reduceMotion || root.dataset.input === "key" || !el.animate) return;
    el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.14)" }, { transform: "scale(1)" }],
      { duration: 260, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );
  }

  /* ---------- Zustand ---------- */
  var cfg = { mode: "team", n: 10, teams: 3, names: ["Team 1", "Team 2", "Team 3", "Team 4"] };
  var G = null; // laufendes Spiel

  function prep(d) {
    var o = { type: d.type, e: d.e, s: d.s || "", clues: null };
    if (d.type === "mc") {
      o.label = "Multiple Choice"; o.qh = fmt(d.q); o.plain = plainText(d.q); o.cols = "c2";
      o.opts = shuffle(d.o.map(function (t, i) { return { t: t, ok: i === 0 }; }));
    } else if (d.type === "ff") {
      o.label = "Fakt oder Fake?"; o.qh = fmt(d.q); o.plain = plainText(d.q); o.cols = "c2";
      o.opts = [{ t: "Fakt", ok: d.a === true }, { t: "Fake", ok: d.a === false }];
    } else if (d.type === "pt") {
      o.label = "Einordnen";
      o.qh = "Wie ordnest du ein: <span class=\"term\">" + fmt(d.item) + "</span>?";
      o.plain = "Einordnen: " + plainText(d.item); o.cols = "c3";
      o.opts = PT.map(function (t, i) { return { t: t, ok: i === d.a }; });
    } else {
      o.label = "Wer oder was bin ich?";
      o.qh = "Errate den Begriff. Je weniger Hinweise du brauchst, desto mehr Punkte gibt es.";
      o.plain = "Rätsel: \u201E" + plainText(d.clues[0]) + "\u201C \u2026"; o.cols = "c2"; o.clues = d.clues;
      o.opts = shuffle(d.o.map(function (t, i) { return { t: t, ok: i === 0 }; }));
    }
    return o;
  }

  /* ---------- Hülle (Leiste) ---------- */
  function shell(inner, inGame) {
    return '<header class="bar glass"><div class="brand"><span class="mark">' + icon("bolt") + '</span><span>Energie-Quiz</span></div>' +
      '<div class="bar-actions">' +
      (inGame ? '<button class="btn ghost" data-act="quit">Beenden</button>' : "") +
      '<button class="btn ghost" data-act="theme" aria-label="Hell oder dunkel umschalten">' + icon("moon") + '<span class="sr-only">Hell oder dunkel</span></button>' +
      '</div></header><main class="shell">' + inner + "</main>";
  }

  /* ---------- Start ---------- */
  function segHTML(group, vals, labels, cur) {
    var idx = Math.max(0, vals.map(String).indexOf(String(cur)));
    return '<div class="seg ui-motion" role="group" style="--n:' + vals.length + ";--i:" + idx + '" data-group="' + group + '">' +
      vals.map(function (v, i) {
        return '<button type="button" data-v="' + v + '" data-i="' + i + '" aria-pressed="' + (i === idx) + '">' + labels[i] + "</button>";
      }).join("") + "</div>";
  }
  function namesHTML() {
    var h = "";
    for (var i = 0; i < cfg.teams; i++) {
      h += '<input type="text" maxlength="20" aria-label="Name von Team ' + (i + 1) + '" data-name="' + i + '" value="' + esc(cfg.names[i]) + '">';
    }
    return h;
  }
  function renderStart() {
    G = null;
    app.innerHTML = shell(
      '<section class="hero stage">' +
        '<p class="eyebrow">Geografie 9 \u00B7 Erneuerbare Energien</p>' +
        '<h1 class="display">Energie-Quiz.</h1>' +
        '<p class="lead">Wind, Sonne, Wasser. Wie fit seid ihr?</p>' +
      "</section>" +
      '<section class="card settings stage" style="animation-delay:60ms">' +
        '<div class="group"><span class="eyebrow">Spielart</span>' +
          segHTML("mode", ["team", "solo"], ["Teams vorn am Beamer", "Allein am Gerät"], cfg.mode) + "</div>" +
        '<div class="group"><span class="eyebrow">Fragen</span>' +
          segHTML("n", [10, 15, 20], ["10 Fragen \u00B7 ca. 20 Min.", "15 Fragen \u00B7 ca. 28 Min.", "20 Fragen \u00B7 ca. 38 Min."], cfg.n) + "</div>" +
        '<div class="group" id="teamGroup"' + (cfg.mode === "team" ? "" : " hidden") + '><span class="eyebrow">Teams</span>' +
          segHTML("teams", [2, 3, 4], ["2 Teams", "3 Teams", "4 Teams"], cfg.teams) +
          '<div class="names" id="names" style="margin-top:12px">' + namesHTML() + "</div></div>" +
        '<div class="start-row"><button class="btn primary large" data-act="start">Los geht\u2019s' + icon("chevron") + "</button>" +
        '<span class="fine">' + DATA.length + " Fragen im Pool \u00B7 Reihenfolge wird gemischt</span></div>" +
      "</section>" +
      '<p class="foot">Hinweis: Wer die Fragen ändern möchte, bearbeitet die Datei quiz/fragen.js.</p>',
      false
    );
  }

  /* ---------- Spiel ---------- */
  function startGame() {
    var solo = cfg.mode === "solo";
    var teams = solo ? [{ name: "Du", score: 0, joker: 2 }] :
      Array.apply(null, { length: cfg.teams }).map(function (_, i) {
        return { name: (cfg.names[i] || "").trim() || "Team " + (i + 1), score: 0, joker: 1 };
      });
    G = {
      solo: solo, teams: teams, list: shuffle(DATA).slice(0, cfg.n).map(prep),
      qi: 0, streak: 0, right: 0, missed: [], cq: false
    };
    var n = G.list.length;
    app.innerHTML = shell(
      '<div class="progress" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="0" id="prog">' +
        new Array(n + 1).join("<i></i>") + "</div>" +
      '<div class="board" id="board"></div>' +
      '<article class="card qcard" id="qcard"></article>',
      true
    );
    renderBoard(true);
    loadQuestion();
  }

  function renderBoard(build) {
    var board = $("#board");
    if (build) {
      board.innerHTML = G.solo ?
        '<div class="chip"><span class="nm">Punkte</span><span class="sc" data-sc="0">0</span></div>' +
        '<div class="chip"><span class="nm">Serie</span><span class="sc" data-streak>0</span></div>' +
        '<div class="chip"><span class="nm">Joker</span><span class="sc" data-joker>' + G.teams[0].joker + "</span></div>" :
        G.teams.map(function (t, i) {
          return '<div class="chip ui-motion" data-chip="' + i + '"><span class="nm">' + esc(t.name) + ' <small>Joker <span data-joker>' + t.joker + '</span></small></span><span class="sc" data-sc>' + t.score + "</span></div>";
        }).join("");
    }
    if (G.solo) {
      $("[data-sc]", board).textContent = G.teams[0].score;
      $("[data-streak]", board).textContent = G.streak;
      $("[data-joker]", board).textContent = G.teams[0].joker;
    } else {
      $$(".chip", board).forEach(function (c, i) {
        c.classList.toggle("active", i === G.turn);
        $("[data-sc]", c).textContent = G.teams[i].score;
        $("[data-joker]", c).textContent = G.teams[i].joker;
      });
    }
  }

  function points() { return G.q.clues ? ([12, 9, 6, 3][G.clue - 1] || 3) : 10; }
  function correctText() { for (var i = 0; i < G.opts.length; i++) if (G.opts[i].ok) return G.opts[i].t; return ""; }
  function canJoker() {
    if (G.answered || G.teams[G.turn].joker < 1) return false;
    return G.opts.filter(function (o) { return !o.ok && !o.out; }).length >= 3;
  }

  function loadQuestion() {
    var q = G.list[G.qi];
    G.q = q; G.opts = q.opts.map(function (o) { return { t: o.t, ok: o.ok, out: false }; });
    G.answered = false; G.picked = -1; G.clue = 1; G.last = null;
    G.turn = G.qi % G.teams.length;
    renderBoard(false);
    paintProgress();
    var n = G.list.length;
    var meta = '<div class="meta"><span class="pill accent">' + q.label + "</span>" +
      '<span class="eyebrow">Frage ' + (G.qi + 1) + " von " + n + "</span>" +
      (G.solo ? "" : '<span class="eyebrow">Dran: <strong>' + esc(G.teams[G.turn].name) + "</strong></span>") +
      '<span class="grow"></span><span class="eyebrow" id="pts"></span></div>';
    $("#qcard").innerHTML = meta +
      '<h2 class="qtext">' + q.qh + "</h2>" +
      (q.clues ? '<ol class="clues" id="clues"></ol>' : "") +
      '<div class="opts ' + q.cols + '" id="opts" role="group" aria-label="Antworten"></div>' +
      '<div class="fb" id="fb" role="status" aria-live="polite"></div>' +
      '<div class="actions" id="actions"></div>';
    paintClues(true);
    paintOptions(true);
    paintActions();
    paintPoints();
    var card = $("#qcard");
    card.classList.remove("stage"); void card.offsetWidth; card.classList.add("stage");
  }

  function paintProgress() {
    var n = G.list.length;
    $$("#prog i").forEach(function (el, i) {
      el.className = i < G.qi || (i === G.qi && G.answered) ? "done" : (i === G.qi ? "now" : "");
    });
    $("#prog").setAttribute("aria-valuenow", G.qi + (G.answered ? 1 : 0));
  }
  function paintPoints() {
    var el = $("#pts");
    if (el) el.textContent = G.answered ? "" : points() + " Punkte möglich";
  }
  function paintClues(first) {
    var q = G.q; if (!q.clues) return;
    var h = "";
    q.clues.slice(0, G.clue).forEach(function (c, i) {
      var isNew = !first && i === G.clue - 1;
      h += '<li' + (isNew ? ' style="animation:rise var(--t-enter) var(--ease-out) both"' : "") + "><b>" + (i + 1) + ".</b>" + fmt(c) + "</li>";
    });
    var left = q.clues.length - G.clue;
    if (left > 0 && !G.answered) h += '<li class="locked">' + left + (left === 1 ? " Hinweis" : " Hinweise") + " noch verborgen</li>";
    $("#clues").innerHTML = h;
  }
  function paintOptions(build) {
    var box = $("#opts");
    if (build) {
      box.innerHTML = G.opts.map(function (o, i) {
        return '<button type="button" class="opt ui-motion" data-i="' + i + '" style="animation:rise var(--t-enter) var(--ease-out) both;animation-delay:' + (i * 50) + 'ms">' +
          '<span class="let">' + "ABCD".charAt(i) + '</span><span class="txt">' + fmt(o.t) + "</span>" +
          '<span class="res" aria-hidden="true"></span></button>';
      }).join("");
    }
    $$(".opt", box).forEach(function (b, i) {
      var o = G.opts[i], s = "";
      if (G.answered) {
        s = o.ok ? "ok" : (i === G.picked ? "bad" : "dim");
        $(".res", b).innerHTML = o.ok ? icon("check") : (i === G.picked ? icon("cross") : "");
        b.setAttribute("aria-label", plainText(o.t) + (o.ok ? " (richtig)" : (i === G.picked ? " (falsch)" : "")));
      } else if (o.out) { s = "out"; }
      if (s) b.dataset.s = s; else delete b.dataset.s;
      b.disabled = G.answered || o.out;
    });
  }
  function paintActions() {
    var a = $("#actions"), h = "";
    if (!G.answered) {
      if (G.q.clues && G.clue < G.q.clues.length) h += '<button class="btn ghost ui-motion" data-act="clue">' + icon("bulb") + " Nächster Hinweis (weniger Punkte)</button>";
      if (canJoker()) h += '<button class="btn ghost ui-motion" data-act="joker">' + icon("bolt") + " 50:50 (" + G.teams[G.turn].joker + ")</button>";
    } else {
      h += '<span class="grow"></span><button class="btn primary ui-motion" data-act="next">' + (G.qi + 1 >= G.list.length ? "Zur Auswertung" : "Weiter") + icon("chevron") + "</button>";
    }
    a.innerHTML = h;
  }

  function answer(i) {
    var o = G.opts[i];
    if (G.answered || !o || o.out) return;
    G.answered = true; G.picked = i;
    var gain = 0, bonus = 0, t = G.teams[G.turn];
    if (o.ok) {
      gain = points();
      if (G.solo) { G.streak++; if (G.streak >= 3) bonus = 5; }
      t.score += gain + bonus; G.right++;
    } else {
      if (G.solo) G.streak = 0;
      G.missed.push({ q: G.q.plain, a: correctText() });
    }
    G.last = { ok: o.ok, gain: gain, bonus: bonus };
    renderBoard(false);
    if (o.ok) bump($(G.solo ? "[data-sc]" : '.chip[data-chip="' + G.turn + '"] [data-sc]'));
    paintProgress(); paintOptions(false); paintClues(false); paintActions(); paintPoints();
    var fb = $("#fb");
    var who = G.solo ? "" : " für " + esc(t.name);
    fb.className = "fb show " + (o.ok ? "ok" : "bad");
    fb.innerHTML = '<div class="hd">' +
      (o.ok ? "<strong>Richtig.</strong><span class=\"eyebrow\">+" + gain + " Punkte" + who + (bonus ? " \u00B7 Serienbonus +" + bonus : "") + "</span>"
            : "<strong>Leider falsch.</strong><span class=\"eyebrow\">Richtig ist: " + fmt(correctText()) + "</span>") +
      "</div><p>" + fmt(G.q.e) + "</p>" +
      (G.q.s ? '<span class="fine src">Quelle: ' + esc(G.q.s) + "</span>" : "");
    var nb = $('[data-act="next"]'); if (nb) nb.focus({ preventScroll: true });
    if (fb.scrollIntoView) fb.scrollIntoView({ block: "nearest", behavior: reduceMotion || root.dataset.input === "key" ? "auto" : "smooth" });
  }
  function useJoker() {
    if (!canJoker()) return;
    var idx = [];
    G.opts.forEach(function (o, i) { if (!o.ok && !o.out) idx.push(i); });
    shuffle(idx).slice(0, 2).forEach(function (i) { G.opts[i].out = true; });
    G.teams[G.turn].joker--;
    renderBoard(false); paintOptions(false); paintActions();
  }
  function moreClue() {
    if (G.answered || !G.q.clues || G.clue >= G.q.clues.length) return;
    G.clue++; paintClues(false); paintActions(); paintPoints();
  }
  function nextQ() {
    if (!G.answered) return;
    if (G.qi + 1 >= G.list.length) { renderEnd(); return; }
    G.qi++; loadQuestion(); window.scrollTo(0, 0);
  }

  /* ---------- Auswertung ---------- */
  function renderEnd() {
    var n = G.list.length, h = "";
    if (G.solo) {
      var t = G.teams[0], p = G.right / n;
      var title = p >= 0.9 ? "Energie-Profi" : p >= 0.7 ? "Windrad-Meister" : p >= 0.5 ? "Solarforscher" : "Energie-Azubi";
      h += '<section class="hero stage"><p class="eyebrow">Ergebnis</p><h1 class="display">' + title + '.</h1>' +
           '<p class="big">' + t.score + '</p><p class="lead">Punkte \u00B7 ' + G.right + " von " + n + " Fragen richtig</p></section>";
    } else {
      var max = Math.max.apply(null, G.teams.map(function (x) { return x.score; }));
      var win = G.teams.filter(function (x) { return x.score === max; });
      var head = win.length > 1 ? "Gleichstand." : esc(win[0].name) + " gewinnt.";
      h += '<section class="hero stage"><p class="eyebrow">Ergebnis</p><h1 class="display">' + head + "</h1></section>" +
           '<section class="stagger">';
      G.teams.slice().sort(function (a, b) { return b.score - a.score; }).forEach(function (x, idx) {
        var rank = 1 + G.teams.filter(function (y) { return y.score > x.score; }).length;
        h += '<div class="rank' + (rank === 1 ? " first" : "") + '" style="--i:' + idx + '"><span class="no">' + rank + '</span><span class="nm">' + esc(x.name) + "</span><span>" + x.score + " Punkte</span></div>";
      });
      h += "</section>";
    }
    if (G.missed.length) {
      h += '<section class="card soft stage" style="margin-top:28px;animation-delay:80ms"><h2 class="headline">Das war knifflig.</h2><ul class="review">' +
        G.missed.map(function (m) { return "<li><strong>" + esc(m.q) + "</strong>" + esc(m.a) + "</li>"; }).join("") + "</ul></section>";
    } else {
      h += '<section class="card soft stage" style="margin-top:28px"><p class="headline">Keine einzige Frage falsch.</p></section>';
    }
    h += '<div class="start-row"><button class="btn primary" data-act="again">Noch einmal spielen</button><button class="btn" data-act="home">Zum Start</button></div>' +
         '<p class="foot">Schöne Ferien.</p>';
    app.innerHTML = shell(h, false);
    window.scrollTo(0, 0);
  }

  /* ---------- Ereignisse ---------- */
  function toggleTheme() {
    var cur = root.getAttribute("data-theme") ||
      ((window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
    root.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
  }

  app.addEventListener("click", function (e) {
    var seg = e.target.closest(".seg button");
    if (seg && !G) {
      var box = seg.parentNode, group = box.dataset.group, v = seg.dataset.v;
      box.style.setProperty("--i", seg.dataset.i);
      $$("button", box).forEach(function (b) { b.setAttribute("aria-pressed", b === seg ? "true" : "false"); });
      if (group === "mode") { cfg.mode = v; $("#teamGroup").hidden = v !== "team"; }
      if (group === "n") cfg.n = +v;
      if (group === "teams") { cfg.teams = +v; $("#names").innerHTML = namesHTML(); }
      return;
    }
    var optBtn = e.target.closest(".opt");
    if (optBtn && G) { answer(+optBtn.dataset.i); return; }
    var b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    var act = b.dataset.act;
    if (act !== "quit" && G && G.cq) { G.cq = false; var q = $('[data-act="quit"]'); if (q) q.textContent = "Beenden"; }
    if (act === "theme") toggleTheme();
    else if (act === "start" || act === "again") { startGame(); window.scrollTo(0, 0); }
    else if (act === "home") { renderStart(); window.scrollTo(0, 0); }
    else if (act === "quit") {
      if (G.cq) renderStart();
      else { G.cq = true; b.textContent = "Wirklich beenden? Nochmal tippen"; }
    }
    else if (act === "joker") useJoker();
    else if (act === "clue") moreClue();
    else if (act === "next") nextQ();
  });

  app.addEventListener("input", function (e) {
    var t = e.target;
    if (t.matches && t.matches("[data-name]")) cfg.names[+t.getAttribute("data-name")] = t.value;
  });

  document.addEventListener("keydown", function (e) {
    if (!G || !G.q) return;
    if (e.target && e.target.matches && e.target.matches("input")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = (e.key || "").toLowerCase();
    if (!G.answered) {
      var i = -1;
      if (k.length === 1 && "1234".indexOf(k) > -1) i = +k - 1;
      else if (k.length === 1 && "abcd".indexOf(k) > -1) i = k.charCodeAt(0) - 97;
      if (i >= 0 && i < G.opts.length) answer(i);
    } else if (e.key === "ArrowRight" || (e.key === "Enter" && e.target === document.body)) {
      e.preventDefault(); nextQ();
    }
  });

  renderStart();
})();
