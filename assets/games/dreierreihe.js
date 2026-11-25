/* Dreierreihe: Tic-Tac-Toe mit Begriffen für zwei Teams. Ein Feld gehört dem Team, das den passenden Begriff zur Erklärung antippt. Braucht 9 Begriffe. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  const REIHEN = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const ZEICHEN = ["✕", "○"];
  LP.reg.dreierreihe = {
    titel: "Dreierreihe",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      const brett = h.mischen(paare).slice(0, 9), besitz = new Array(9).fill(-1);
      const tafel = h.tafel(feld, 2);
      const frage = h.el("p", "lp-pr-frage"), sagt = h.el("p", "lp-pr-spieltext", ""), gitter = h.el("div", "lp-pr-karten");
      gitter.style.gridTemplateColumns = "repeat(3, 1fr)";
      feld.appendChild(frage); feld.appendChild(gitter); feld.appendChild(sagt);
      let t = 0, r = null, aus = false;
      const knoepfe = brett.map((p, i) => {
        const b = h.knopf("lp-pr-karte", p.s || p.b);
        b.addEventListener("click", () => {
          if (aus || besitz[i] >= 0) return;
          if (i === r) {
            besitz[i] = t; b.classList.add(t === 0 ? "ok" : "sel"); b.textContent = ZEICHEN[t] + " " + (brett[i].s || brett[i].b); tafel.punkt(t);
            if (REIHEN.some((l) => l.every((x) => besitz[x] === t))) { aus = true; frage.remove(); sagt.textContent = ""; feld.appendChild(h.el("p", "lp-pr-geschafft", "Team " + (t + 1) + " (" + ZEICHEN[t] + ") gewinnt mit einer Dreierreihe!")); return; }
            if (besitz.every((x) => x >= 0)) { aus = true; frage.remove(); feld.appendChild(h.el("p", "lp-pr-geschafft", "Unentschieden")); return; }
            sagt.textContent = "Richtig! Das Feld gehört Team " + (t + 1) + ".";
          } else {
            b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 900);
            sagt.textContent = "Falsch. Das Feld bleibt frei. Das andere Team ist dran.";
          }
          t = 1 - t; setTimeout(neueFrage, 1600);
        });
        gitter.appendChild(b); return b;
      });
      function neueFrage() {
        if (aus) return;
        const frei = brett.map((p, i) => i).filter((i) => besitz[i] < 0);
        r = frei[Math.floor(Math.random() * frei.length)]; tafel.dran(t);
        frage.textContent = "Team " + (t + 1) + " (" + ZEICHEN[t] + "): Welcher Begriff passt? „" + brett[r].e + "“";
      }
      void knoepfe; sagt.textContent = "Wer drei Felder in einer Reihe hat, gewinnt: waagerecht, senkrecht oder schräg.";
      neueFrage();
    }
  };
})();
