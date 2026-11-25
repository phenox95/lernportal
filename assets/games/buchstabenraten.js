/* Buchstabenraten: Die Erklärung ist der Hinweis. Teams raten reihum Buchstaben. Nach 7 Fehlern ist das Wort verloren. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  const MAX = 7;
  LP.reg.buchstabenraten = {
    titel: "Buchstabenraten",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      h.anzahl(feld, "Wählt die Zahl der Teams. Die Teams sind abwechselnd dran. Mit 1 raten alle gemeinsam.", [1, 2, 3, 4], spiel);
      function spiel(n) {
        const woerter = h.mischen(paare.filter((p) => /^[A-Za-zÄÖÜäöüß]{3,18}$/.test(p.b))).slice(0, 3);
        const tafel = h.tafel(feld, n);
        const frage = h.el("p", "lp-pr-frage"), wort = h.el("div", "lp-pr-antwort"), fehler = h.el("p", "lp-pr-spieltext", ""), sagt = h.el("p", "lp-pr-spieltext", ""), tasten = h.el("div", "lp-pr-buchstaben tasten");
        [frage, wort, fehler, sagt, tasten].forEach((x) => feld.appendChild(x));
        const vl = h.vorlesen(frage);
        let k = 0;
        function runde() {
          if (k >= woerter.length) { [frage, wort, fehler, sagt, tasten].forEach((x) => x.remove()); if (vl) vl.remove(); tafel.dran(-1); feld.appendChild(h.el("p", "lp-pr-geschafft", tafel.sieger())); return; }
          const r = woerter[k], ziel = r.b.toLowerCase().split(""), da = {}; let f = 0, t = 0, aus = false;
          h.frage(frage, "Errate den Begriff, der gemeint ist. Tippe Buchstaben an.", "„" + r.e + "“");
          wort.classList.remove("ok", "bad"); tasten.textContent = ""; h.rueck(sagt, "", "");
          const zeige = () => {
            const sichtbar = ziel.map((c) => (da[c] ? (c === "ß" ? c : c.toUpperCase()) : "_"));
            wort.textContent = sichtbar.join(" ");
            wort.setAttribute("aria-label", "Wort mit " + ziel.length + " Buchstaben: " + sichtbar.map((c) => (c === "_" ? "Lücke" : c)).join(", "));
            fehler.textContent = (n === 1 ? "" : "Team " + (t + 1) + " ist dran. ") + "Fehler: " + f + " von " + MAX + " ";
            const punkte = h.el("span", "lp-pr-fehler"); punkte.setAttribute("aria-hidden", "true");
            for (let i = 0; i < MAX; i++) punkte.appendChild(h.el("i", i < f ? "voll" : ""));
            fehler.appendChild(punkte);
          };
          const schluss = (gewonnen) => {
            aus = true; wort.textContent = r.s || r.b; wort.removeAttribute("aria-label");
            [].forEach.call(tasten.children, (x) => { x.disabled = true; });
            if (gewonnen) { wort.classList.add("ok"); h.rueck(sagt, "gut", "Richtig" + (n === 1 ? "" : ". Punkt für Team " + (t + 1))); }
            else { wort.classList.add("bad"); h.rueck(sagt, "falsch", "Leider verloren. Das Wort war: " + r.b); }
            h.weiter(feld, () => { k++; runde(); }, 2400);
          };
          zeige(); tafel.dran(t);
          "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß".split("").forEach((z) => {
            const b = h.knopf("lp-pr-karte", z, "Buchstabe " + z), c = z.toLowerCase();
            b.addEventListener("click", () => {
              if (aus || b.disabled) return; b.disabled = true;
              if (ziel.indexOf(c) >= 0) {
                da[c] = true; b.classList.add("ok"); b.setAttribute("aria-label", "Buchstabe " + z + ", kommt vor");
                if (ziel.every((x) => da[x])) { tafel.punkt(t); zeige(); schluss(true); return; }
              } else { b.classList.add("bad"); b.setAttribute("aria-label", "Buchstabe " + z + ", kommt nicht vor"); f++; if (f >= MAX) { zeige(); schluss(false); return; } }
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
