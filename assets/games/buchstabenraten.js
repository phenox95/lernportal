/* Buchstabenraten: Die Erklärung ist der Hinweis. Teams raten reihum Buchstaben. Nach 7 Fehlern ist das Wort verloren. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  const MAX = 7;
  LP.reg.buchstabenraten = {
    titel: "Buchstabenraten",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      h.anzahl(feld, "Wie viele Teams raten? Die Teams sind abwechselnd dran. Mit 1 raten alle gemeinsam.", [1, 2, 3, 4], spiel);
      function spiel(n) {
        const woerter = h.mischen(paare.filter((p) => /^[A-Za-zÄÖÜäöüß]{3,18}$/.test(p.b))).slice(0, 3);
        const tafel = h.tafel(feld, n);
        const frage = h.el("p", "lp-pr-frage"), wort = h.el("div", "lp-pr-antwort"), fehler = h.el("p", "lp-pr-spieltext", ""), tasten = h.el("div", "lp-pr-buchstaben tasten");
        [frage, wort, fehler, tasten].forEach((x) => feld.appendChild(x));
        let k = 0;
        function runde() {
          if (k >= woerter.length) { [frage, wort, fehler, tasten].forEach((x) => x.remove()); tafel.dran(-1); feld.appendChild(h.el("p", "lp-pr-geschafft", tafel.sieger())); return; }
          const r = woerter[k], ziel = r.b.toLowerCase().split(""), da = {}; let f = 0, t = 0, aus = false;
          frage.textContent = "Welcher Begriff ist gemeint? „" + r.e + "“";
          wort.classList.remove("ok"); tasten.textContent = "";
          const zeige = () => {
            wort.textContent = ziel.map((c) => (da[c] ? (c === "ß" ? c : c.toUpperCase()) : "_")).join(" ");
            fehler.textContent = (n === 1 ? "" : "Team " + (t + 1) + " ist dran. ") + "Fehler: " + "●".repeat(f) + "○".repeat(MAX - f);
          };
          const schluss = (gewonnen) => {
            aus = true; wort.textContent = r.s || r.b;
            if (gewonnen) { wort.classList.add("ok"); } else { fehler.textContent = "Leider verloren. Das Wort war: " + r.b; }
            setTimeout(() => { k++; runde(); }, 2200);
          };
          zeige(); tafel.dran(t);
          "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß".split("").forEach((z) => {
            const b = h.knopf("lp-pr-karte", z, "Buchstabe " + z), c = z.toLowerCase();
            b.addEventListener("click", () => {
              if (aus || b.disabled) return; b.disabled = true;
              if (ziel.indexOf(c) >= 0) {
                da[c] = true; b.classList.add("ok");
                if (ziel.every((x) => da[x])) { tafel.punkt(t); zeige(); schluss(true); return; }
              } else { b.classList.add("bad"); f++; if (f >= MAX) { schluss(false); return; } }
              t = (t + 1) % n; tafel.dran(t); zeige();
            });
            tasten.appendChild(b);
          });
        }
        runde();
      }
    }
  };
})();
