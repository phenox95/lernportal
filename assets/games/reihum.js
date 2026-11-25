/* Reihum-Quiz: Zwei bis vier Teams sind abwechselnd dran. Zu einer Erklärung gehört der richtige Begriff. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.reihum = {
    titel: "Reihum-Quiz",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      h.anzahl(feld, "Wie viele Teams spielen? Die Teams sind abwechselnd dran und beraten sich leise.", [2, 3, 4], spiel);
      function spiel(n) {
        let folge = []; while (folge.length < n * 3) folge = folge.concat(h.mischen(paare));
        folge = folge.slice(0, n * 3);
        const tafel = h.tafel(feld, n);
        const frage = h.el("p", "lp-pr-frage"), karten = h.el("div", "lp-pr-karten"), sagt = h.el("p", "lp-pr-spieltext", "");
        karten.style.gridTemplateColumns = "repeat(2, 1fr)";
        feld.appendChild(frage); feld.appendChild(karten); feld.appendChild(sagt);
        let k = 0;
        function runde() {
          if (k >= folge.length) {
            tafel.dran(-1); frage.remove(); karten.remove(); sagt.remove();
            feld.appendChild(h.el("p", "lp-pr-geschafft", tafel.sieger()));
            return;
          }
          const t = k % n, r = folge[k]; tafel.dran(t);
          frage.textContent = "Welcher Begriff passt? „" + r.e + "“"; sagt.textContent = "Team " + (t + 1) + " ist dran."; karten.textContent = "";
          let gesperrt = false;
          h.mischen([r].concat(h.mischen(paare.filter((p) => p !== r)).slice(0, 3))).forEach((p) => {
            const b = h.knopf("lp-pr-karte", p.s || p.b);
            b.addEventListener("click", () => {
              if (gesperrt) return; gesperrt = true;
              if (p === r) { b.classList.add("ok"); tafel.punkt(t); sagt.textContent = "Richtig! Punkt für Team " + (t + 1) + "."; }
              else { b.classList.add("bad"); sagt.textContent = "Gesucht war: " + (r.s || r.b); [].forEach.call(karten.children, (x) => { if (x.textContent === (r.s || r.b)) x.classList.add("ok"); }); }
              setTimeout(() => { k++; runde(); }, 1800);
            });
            karten.appendChild(b);
          });
        }
        runde();
      }
    }
  };
})();
