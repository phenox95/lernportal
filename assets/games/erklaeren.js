/* Erklären ohne Begriff: Zwei bis vier Teams, ein Gerät. Eine Person erklärt den Begriff, ohne ihn zu sagen, das eigene Team rät. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.erklaeren = {
    titel: "Erklären ohne Begriff",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      h.anzahl(feld, "Wählt die Zahl der Teams. Eine Person erklärt den Begriff, das eigene Team rät.", [2, 3, 4], spiel);
      function spiel(n) {
        let folge = []; while (folge.length < n * 2) folge = folge.concat(h.mischen(paare));
        folge = folge.slice(0, n * 2);
        const tafel = h.tafel(feld, n), buehne = h.el("div", "lp-pr-spielwahl"); feld.appendChild(buehne);
        let k = 0;
        function zwischen() {
          buehne.textContent = "";
          if (k >= folge.length) { tafel.dran(-1); buehne.appendChild(h.el("p", "lp-pr-geschafft", tafel.sieger())); return; }
          const t = k % n; tafel.dran(t);
          buehne.appendChild(h.el("p", "lp-pr-spieltext", "Team " + (t + 1) + " ist dran. Eine Person schaut auf den Bildschirm, alle anderen sehen weg."));
          const los = h.knopf("lp-pr-klein lp-pr-weiter", "Karte zeigen"); buehne.appendChild(los);
          los.addEventListener("click", () => karte(t));
          los.focus();
        }
        function karte(t) {
          const r = folge[k]; buehne.textContent = "";
          buehne.appendChild(h.el("p", "lp-pr-frage", r.s || r.b));
          const auftrag = h.el("p", "lp-pr-spieltext");
          h.frage(auftrag, "Erkläre den Begriff mit eigenen Worten.", "Sage das Wort nicht, auch keinen Wortteil. Zeige nicht darauf.");
          buehne.appendChild(auftrag);
          const hilfeText = h.el("p", "lp-pr-spieltext", ""), reihe = h.el("div", "lp-pr-buchstaben");
          const hilfeBtn = h.knopf("lp-pr-klein", "Erklärung zeigen (Hilfe)"), ja = h.knopf("lp-pr-karte", "Gefunden: 1 Punkt"), nein = h.knopf("lp-pr-karte", "Nicht gefunden");
          hilfeBtn.addEventListener("click", () => { hilfeText.textContent = "Hilfe: " + r.e; hilfeBtn.hidden = true; });
          ja.addEventListener("click", () => { tafel.punkt(t); k++; zwischen(); });
          nein.addEventListener("click", () => { k++; zwischen(); });
          reihe.appendChild(ja); reihe.appendChild(nein);
          buehne.appendChild(hilfeBtn); buehne.appendChild(hilfeText); buehne.appendChild(reihe);
          hilfeBtn.style.alignSelf = "flex-start";
        }
        zwischen();
      }
    }
  };
})();
