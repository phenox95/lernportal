/* Lernportal – Stammbaum zeichnen (SVG) und Genotypen eintragen.
   Einbinden: <script src="…/assets/js/stammbaum.js"></script> (ohne defer, vor dem Seitenskript).
   Nutzung:
     var p = LPStammbaum.render(hostElement, daten, { ask: true });
     p.check()   -> { ok, total }   (markiert richtige und falsche Felder mit Haken oder Kreuz)
     p.loesung() -> trägt alle Lösungen ein
     p.reset()   -> setzt alle Eingaben zurück
   Daten: { w, h, gens: ["I","II"], nodes: { "I-1": { g:0, x:200, sex:"m"|"w", aff:true|false, sol:"Aa" } }, fam: [ { p:["I-1","I-2"], k:["II-1","II-2"] } ] }
   g = Generation (0 beginnt oben), x = waagerechte Lage, aff = Merkmal ausgefüllt, sol = Lösung (AA, Aa, aa oder A_ für „AA oder Aa“).
   Mit ask: true wechselt ein Antippen eines Symbols zwischen ?, AA, Aa, aa und A_ (Tastatur: Enter oder Leertaste).
   Das Merkmal steht immer auch als Beschriftung da, nicht nur als Füllung: ausgefüllt = Merkmal. Es wird nichts gespeichert oder gesendet. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", S = 44, STATES = ["?", "AA", "Aa", "aa", "A_"];
  function el(n, a, t) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; return e; }
  function y(g) { return 52 + g * 124; }
  function render(host, ped, opt) {
    opt = opt || {};
    var svg = el("svg", { viewBox: "0 0 " + (ped.w || 560) + " " + (ped.h || 360), role: "img", width: "100%", "aria-label": ped.alt || "Stammbaum" });
    svg.style.cssText = "display:block;width:100%;height:auto;max-height:100%";
    var N = ped.nodes, state = {}, gnodes = {}, mark = {};
    Object.keys(N).forEach(function (id) { state[id] = "?"; });
    /* Linien zuerst: Paar, Geschwisterlinie, Abstieg */
    (ped.fam || []).forEach(function (f) {
      var a = N[f.p[0]], b = N[f.p[1]], yy = y(a.g), cx = (a.x + b.x) / 2, yb = yy + 64, ks = f.k.map(function (k) { return N[k]; });
      var xs = ks.map(function (k) { return k.x; }).concat([cx]), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
      var ln = function (x1_, y1, x2, y2) { svg.appendChild(el("line", { x1: x1_, y1: y1, x2: x2, y2: y2, stroke: "#1A2B24", "stroke-width": 3, "stroke-linecap": "square" })); };
      ln(Math.min(a.x, b.x) + S / 2, yy, Math.max(a.x, b.x) - S / 2, yy);
      ln(cx, yy, cx, yb); ln(x0, yb, x1, yb);
      ks.forEach(function (k) { ln(k.x, yb, k.x, y(k.g) - S / 2); });
    });
    /* Generationen links */
    (ped.gens || []).forEach(function (r, g) { svg.appendChild(el("text", { x: 6, y: y(g) + 7, "font-size": 22, "font-weight": 700, fill: "#5B6A63", "font-family": "Andika,Verdana,sans-serif" }, r)); });
    /* Symbole */
    Object.keys(N).forEach(function (id) {
      var n = N[id], g = el("g", { transform: "translate(" + n.x + "," + y(n.g) + ")" });
      var sh = n.sex === "m" ? el("rect", { x: -S / 2, y: -S / 2, width: S, height: S, rx: 2 }) : el("circle", { r: S / 2 });
      sh.setAttribute("stroke-width", 3); sh.style.stroke = "#1A2B24"; sh.style.fill = n.aff ? "var(--g, #333)" : "#fff";
      g.appendChild(sh);
      var tx = el("text", { "text-anchor": "middle", y: 7, "font-size": 20, "font-weight": 700, "font-family": "Andika,Verdana,sans-serif" }, "");
      tx.style.fill = n.aff ? "#fff" : "#1A2B24"; g.appendChild(tx);
      g.appendChild(el("text", { "text-anchor": "middle", y: S / 2 + 20, "font-size": 16, "font-family": "Andika,Verdana,sans-serif", fill: "#5B6A63" }, id));
      var bd = el("text", { x: S / 2 - 2, y: -S / 2 + 4, "font-size": 24, "font-weight": 700, "font-family": "Andika,Verdana,sans-serif" }, ""); g.appendChild(bd);
      gnodes[id] = { g: g, tx: tx, sh: sh, bd: bd };
      if (opt.ask && n.sol) {
        g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.style.cursor = "pointer";
        var step = function (e) { if (e && e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return; if (e && e.preventDefault) e.preventDefault(); setState(id, STATES[(STATES.indexOf(state[id]) + 1) % STATES.length]); };
        g.addEventListener("click", step); g.addEventListener("keydown", step);
        setState(id, "?", true);
      } else if (n.show) { tx.textContent = n.show; }
      svg.appendChild(g);
    });
    function label(id) { var n = N[id], who = (n.sex === "m" ? "Rüde" : "Hündin"); return id + ", " + who + (n.aff ? ", mit Merkmal" : ", ohne Merkmal") + (opt.ask ? ", Genotyp " + (state[id] === "?" ? "offen" : state[id].replace("_", " oder Aa")) : ""); }
    function setState(id, s, silent) {
      state[id] = s; var o = gnodes[id]; o.tx.textContent = s === "A_" ? "A_" : s; o.tx.style.opacity = s === "?" ? ".45" : "1";
      o.bd.textContent = ""; o.sh.removeAttribute("stroke-dasharray"); delete mark[id];
      o.g.setAttribute("aria-label", label(id));
    }
    Object.keys(gnodes).forEach(function (id) { gnodes[id].g.setAttribute("aria-label", label(id)); });
    host.innerHTML = ""; host.appendChild(svg);
    return {
      svg: svg,
      check: function () {
        var ok = 0, total = 0;
        Object.keys(N).forEach(function (id) { if (!N[id].sol || !opt.ask) return; total++; var o = gnodes[id], good = state[id] === N[id].sol;
          if (good) ok++; o.bd.textContent = good ? "✓" : "✗"; o.bd.style.fill = good ? "#1e7e3c" : "#c0392b"; o.sh.setAttribute("stroke-dasharray", good ? "" : "6 4"); });
        return { ok: ok, total: total };
      },
      loesung: function () { Object.keys(N).forEach(function (id) { if (N[id].sol && opt.ask) setState(id, N[id].sol); }); },
      reset: function () { Object.keys(N).forEach(function (id) { if (N[id].sol && opt.ask) setState(id, "?"); }); },
      zustand: function () { return state; }
    };
  }
  window.LPStammbaum = { render: render, STATES: STATES };
})();
