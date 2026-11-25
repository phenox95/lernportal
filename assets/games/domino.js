/* Domino: Jede Karte hat links einen Begriff und rechts die Erklärung zum nächsten Begriff der Kette. Allein oder mit bis zu vier Teams reihum. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.domino = {
    titel: "Domino",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      h.anzahl(feld, "Wie viele Teams spielen? Mit 1 spielt ihr gemeinsam.", [1, 2, 3, 4], spiel);
      function spiel(n) {
        const ps = h.mischen(paare).slice(0, 6), m = ps.length;
        const karte = (i) => ({ i, links: ps[i].s || ps[i].b, rechts: ps[(i + 1) % m].e });
        const kette = [0], pool = h.mischen(ps.map((p, i) => i).slice(1));
        const tafel = h.tafel(feld, n);
        feld.appendChild(h.el("p", "lp-pr-spieltext", "Die letzte Karte der Kette endet rechts mit einer Erklärung. Tippe die Karte, deren linke Hälfte der passende Begriff ist."));
        const reihe = h.el("div", "lp-pr-kette"), sagt = h.el("p", "lp-pr-frage", ""), vorrat = h.el("div", "lp-pr-karten");
        vorrat.style.gridTemplateColumns = "repeat(2, 1fr)";
        feld.appendChild(reihe); feld.appendChild(sagt); feld.appendChild(vorrat);
        let t = 0;
        const hälften = (c) => { const a = h.el("span", "lp-pr-dlinks", c.links), b = h.el("span", "lp-pr-drechts", c.rechts); return [a, b]; };
        function zeichne() {
          reihe.textContent = ""; vorrat.textContent = "";
          kette.forEach((i) => { const d = h.el("div", "lp-pr-domino"); hälften(karte(i)).forEach((x) => d.appendChild(x)); reihe.appendChild(d); });
          if (!pool.length) {
            tafel.dran(-1); sagt.remove(); vorrat.remove();
            feld.appendChild(h.el("p", "lp-pr-geschafft", "Die Kette ist fertig! " + (n === 1 ? "" : tafel.sieger())));
            return;
          }
          const ende = kette[kette.length - 1], gesucht = (ende + 1) % m; tafel.dran(t);
          sagt.textContent = (n === 1 ? "" : "Team " + (t + 1) + ": ") + "Welcher Begriff gehört zu „" + karte(ende).rechts + "“?";
          let gesperrt = false;
          pool.forEach((i) => {
            const c = karte(i), b = h.knopf("lp-pr-karte lp-pr-domino"); hälften(c).forEach((x) => b.appendChild(x));
            b.addEventListener("click", () => {
              if (gesperrt) return; gesperrt = true;
              if (i === gesucht) { b.classList.add("ok"); tafel.punkt(t); pool.splice(pool.indexOf(i), 1); kette.push(i); }
              else { b.classList.add("bad"); }
              t = (t + 1) % n; setTimeout(zeichne, 1200);
            });
            vorrat.appendChild(b);
          });
        }
        zeichne();
      }
    }
  };
})();
