/* Dreierreihe: Tic-Tac-Toe mit Begriffen für zwei Teams. Ein Feld gehört dem Team, das den passenden Begriff zur Erklärung antippt. Braucht 9 Begriffe.
   Die Felder der Teams unterscheiden sich nicht nur in der Farbe: Team 1 volle Fläche, Team 2 gestrichelter Doppelrahmen, dazu steht der Teamname im Feld. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  const REIHEN = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  LP.reg.dreierreihe = {
    titel: "Dreierreihe",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      const brett = h.mischen(paare).slice(0, 9), besitz = new Array(9).fill(-1);
      const tafel = h.tafel(feld, 2);
      const frage = h.el("p", "lp-pr-frage"), sagt = h.el("p", "lp-pr-spieltext", ""), gitter = h.el("div", "lp-pr-karten");
      gitter.style.gridTemplateColumns = "repeat(3, 1fr)";
      feld.appendChild(frage); feld.appendChild(gitter); feld.appendChild(sagt);
      const vl = h.vorlesen(frage);
      let t = 0, r = null, aus = false, warten = false;
      brett.forEach((p, i) => {
        const name = p.s || p.b, b = h.knopf("lp-pr-karte", name);
        b.addEventListener("click", () => {
          if (aus || warten || besitz[i] >= 0) return;
          if (i === r) {
            besitz[i] = t; b.classList.add(t === 0 ? "t1" : "t2"); b.textContent = name;
            b.appendChild(h.el("span", "lp-pr-feldteam", "Team " + (t + 1))); b.setAttribute("aria-label", name + ", gehört Team " + (t + 1)); tafel.punkt(t);
            if (REIHEN.some((l) => l.every((x) => besitz[x] === t))) { aus = true; frage.remove(); if (vl) vl.remove(); h.rueck(sagt, "", ""); tafel.dran(-1); feld.appendChild(h.el("p", "lp-pr-geschafft", "Team " + (t + 1) + " gewinnt mit einer Dreierreihe")); return; }
            if (besitz.every((x) => x >= 0)) { aus = true; frage.remove(); if (vl) vl.remove(); h.rueck(sagt, "", ""); tafel.dran(-1); feld.appendChild(h.el("p", "lp-pr-geschafft", "Unentschieden")); return; }
            h.rueck(sagt, "gut", "Richtig. Das Feld gehört Team " + (t + 1) + ".");
          } else {
            b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 1200);
            h.rueck(sagt, "falsch", "Nicht richtig. Das Feld bleibt frei. Das andere Team ist dran.");
          }
          t = 1 - t; warten = true; h.weiter(feld, neueFrage, 1600);
        });
        gitter.appendChild(b);
      });
      function neueFrage() {
        if (aus) return;
        warten = false;
        const frei = brett.map((p, i) => i).filter((i) => besitz[i] < 0);
        r = frei[Math.floor(Math.random() * frei.length)]; tafel.dran(t);
        h.frage(frage, "Tippe den Begriff an, der zur Erklärung passt.", "„" + brett[r].e + "“");
        h.rueck(sagt, "", "Team " + (t + 1) + " ist dran. Wer drei Felder in einer Reihe hat, gewinnt: waagerecht, senkrecht oder schräg.");
      }
      neueFrage();
    }
  };
})();
