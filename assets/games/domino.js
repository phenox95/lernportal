/* Domino: Jede Karte hat links einen Begriff und rechts die Erklärung zum nächsten Begriff der Kette. Allein oder mit bis zu vier Teams reihum. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.domino = {
    titel: "Domino",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      h.anzahl(feld, "Wählt die Zahl der Teams. Mit 1 spielt ihr gemeinsam.", [1, 2, 3, 4], spiel);
      function spiel(n) {
        const ps = h.mischen(paare).slice(0, 6), m = ps.length;
        const karte = (i) => ({ i, links: ps[i].s || ps[i].b, rechts: ps[(i + 1) % m].e });
        const kette = [0], pool = h.mischen(ps.map((p, i) => i).slice(1));
        const tafel = h.tafel(feld, n);
        const auftrag = h.el("p", "lp-pr-spieltext");
        h.frage(auftrag, "Lege die passende Karte an.", "Die letzte Karte der Kette endet rechts mit einer Erklärung. Links auf der neuen Karte steht der passende Begriff.");
        feld.appendChild(auftrag);
        const reihe = h.el("div", "lp-pr-kette"), sagt = h.el("p", "lp-pr-frage", ""), rueck = h.el("p", "lp-pr-spieltext", ""), vorrat = h.el("div", "lp-pr-karten");
        reihe.setAttribute("aria-label", "Kette");
        vorrat.style.gridTemplateColumns = "repeat(2, 1fr)";
        feld.appendChild(reihe); feld.appendChild(sagt); feld.appendChild(rueck); feld.appendChild(vorrat);
        const vl = h.vorlesen(sagt);
        let t = 0;
        const haelften = (c) => [h.el("span", "lp-pr-dlinks", c.links), h.el("span", "lp-pr-drechts", c.rechts)];
        function zeichne() {
          reihe.textContent = ""; vorrat.textContent = ""; h.rueck(rueck, "", "");
          kette.forEach((i) => { const d = h.el("div", "lp-pr-domino"); haelften(karte(i)).forEach((x) => d.appendChild(x)); reihe.appendChild(d); });
          if (!pool.length) {
            tafel.dran(-1); sagt.remove(); rueck.remove(); vorrat.remove(); if (vl) vl.remove();
            feld.appendChild(h.el("p", "lp-pr-geschafft", "Die Kette ist fertig" + (n === 1 ? "" : ". " + tafel.sieger())));
            return;
          }
          const ende = kette[kette.length - 1], gesucht = (ende + 1) % m; tafel.dran(t);
          sagt.textContent = (n === 1 ? "" : "Team " + (t + 1) + ": ") + "Welcher Begriff gehört zu „" + karte(ende).rechts + "“?";
          let gesperrt = false;
          pool.forEach((i) => {
            const c = karte(i), b = h.knopf("lp-pr-karte lp-pr-domino"); haelften(c).forEach((x) => b.appendChild(x));
            b.setAttribute("aria-label", "Begriff: " + c.links + ". Erklärung: " + c.rechts);
            b.addEventListener("click", () => {
              if (gesperrt) return; gesperrt = true;
              [].forEach.call(vorrat.children, (x) => { if (x !== b) x.disabled = true; });
              if (i === gesucht) { b.classList.add("ok"); tafel.punkt(t); pool.splice(pool.indexOf(i), 1); kette.push(i); h.rueck(rueck, "gut", "Passt. Die Karte kommt an die Kette."); }
              else { b.classList.add("bad"); h.rueck(rueck, "falsch", "Passt nicht. Die Karte bleibt im Vorrat."); }
              t = (t + 1) % n; h.weiter(feld, zeichne, 1400);
            });
            vorrat.appendChild(b);
          });
        }
        zeichne();
      }
    }
  };
})();
