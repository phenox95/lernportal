/* Duell zu zweit: Zwei Spieler sitzen sich gegenüber, das Gerät liegt in der Mitte (Tablet). Wer zuerst den richtigen Begriff tippt, bekommt den Punkt.
   Läuft bewusst mit fester Pause zwischen den Fragen (kein Weiter-Knopf): Beide Seiten sollen gleichzeitig starten. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.duell = {
    titel: "Duell zu zweit",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      const runden = h.mischen(paare).slice(0, Math.min(7, paare.length));
      const auftrag = h.el("p", "lp-pr-spieltext");
      h.frage(auftrag, "Setzt euch gegenüber, das Gerät liegt in der Mitte.", "Wer zuerst den richtigen Begriff antippt, bekommt den Punkt. Eine falsche Antwort sperrt nur die eigene Seite.");
      feld.appendChild(auftrag);
      const brett = h.el("div", "lp-pr-duell"); feld.appendChild(brett);
      const seiten = [0, 1].map((i) => {
        const el = h.el("div", "lp-pr-duellseite" + (i === 1 ? " oben" : ""));
        el.setAttribute("aria-label", i === 1 ? "Seite Spieler 2 (oben)" : "Seite Spieler 1 (unten)");
        const s = { el, stand: h.el("p", "lp-pr-duellstand"), frage: h.el("p", "lp-pr-duellfrage"), knoepfe: h.el("div", "lp-pr-karten"), meldung: h.el("p", "lp-pr-duellstand"), btn: [] };
        s.knoepfe.style.gridTemplateColumns = "repeat(2, 1fr)";
        [s.stand, s.frage, s.knoepfe, s.meldung].forEach((x) => el.appendChild(x));
        return s;
      });
      brett.appendChild(seiten[1].el); brett.appendChild(seiten[0].el);       // Spieler 2 sitzt oben, die Seite steht auf dem Kopf
      const pt = [0, 0]; let n = 0;
      const stand = () => seiten.forEach((s, i) => { s.stand.textContent = "Du: " + pt[i] + " · Gegner: " + pt[1 - i] + " · Frage " + Math.min(n + 1, runden.length) + " von " + runden.length; });
      function runde() {
        if (n >= runden.length) {
          seiten.forEach((s, i) => {
            s.knoepfe.textContent = ""; s.stand.textContent = ""; h.rueck(s.meldung, "", "Endstand: " + pt[i] + " zu " + pt[1 - i]);
            s.frage.textContent = pt[i] > pt[1 - i] ? "Du gewinnst" : pt[i] < pt[1 - i] ? "Dein Gegner gewinnt" : "Unentschieden";
          });
          return;
        }
        const r = runden[n], gesperrt = [false, false]; let fertig = false;
        const optionen = h.mischen([r].concat(h.mischen(paare.filter((p) => p !== r)).slice(0, 3)));
        const weiter = () => setTimeout(() => { n++; runde(); }, 2400);
        stand();
        seiten.forEach((s, i) => {
          h.frage(s.frage, "Tippe den Begriff an, der passt.", "„" + r.e + "“"); h.rueck(s.meldung, "", ""); s.knoepfe.textContent = "";
          s.btn = optionen.map((p) => {
            const b = h.knopf("lp-pr-karte", p.s || p.b);
            b.addEventListener("click", () => tipp(i, p, b));
            s.knoepfe.appendChild(b); return b;
          });
        });
        function tipp(i, p, b) {
          if (fertig || gesperrt[i]) return;
          if (p === r) {
            fertig = true; pt[i]++; stand();
            seiten.forEach((s, j) => {
              s.btn.forEach((x, k) => { if (optionen[k] === r) x.classList.add("ok"); else x.disabled = true; });
              if (j === i) h.rueck(s.meldung, "gut", "Punkt für dich"); else h.rueck(s.meldung, "falsch", "Punkt für deinen Gegner. Gesucht war: " + (r.s || r.b));
            });
            weiter();
          } else {
            gesperrt[i] = true; b.classList.add("bad"); seiten[i].btn.forEach((x) => { x.disabled = true; });
            h.rueck(seiten[i].meldung, "falsch", "Nicht richtig. Warte, ob dein Gegner es schafft."); h.rueck(seiten[1 - i].meldung, "", "Dein Gegner hat falsch getippt.");
            if (gesperrt[0] && gesperrt[1]) { fertig = true; seiten.forEach((s) => { h.rueck(s.meldung, "falsch", "Beide nicht richtig. Gesucht war: " + (r.s || r.b)); }); weiter(); }
          }
        }
      }
      runde();
    }
  };
})();
