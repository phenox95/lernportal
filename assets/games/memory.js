/* Memory: Begriff und Erklärung bilden ein Paar. Die Klasse spielt gemeinsam an der Tafel. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.memory = {
    titel: "Memory",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      const wahl = h.mischen(paare).slice(0, 6);
      const karten = h.mischen(wahl.flatMap((p, i) => [{ i, t: p.s || p.b, art: "b" }, { i, t: p.e, art: "e" }]));
      const info = h.el("div", "lp-pr-sinfo");
      const zuege = h.el("span", "", "Züge: 0"), zeit = h.el("span", "", "0:00");
      info.appendChild(zuege); if (!h.ohneZeit) info.appendChild(zeit);
      const auftrag = h.el("p", "lp-pr-spieltext");
      h.frage(auftrag, "Finde zu jedem Begriff die passende Erklärung.", "Tippt abwechselnd zwei Karten an.");
      feld.appendChild(auftrag);
      feld.appendChild(info);
      const sagt = h.el("p", "lp-pr-spieltext", ""); sagt.setAttribute("role", "status");
      const gitter = h.el("div", "lp-pr-karten");
      gitter.style.gridTemplateColumns = "repeat(4, 1fr)"; gitter.style.gridAutoRows = "1fr"; gitter.style.flex = "1";
      feld.appendChild(gitter); feld.appendChild(sagt);
      const t0 = Date.now(); let offen = [], z = 0, paareGefunden = 0, sperre = false;
      const uhr = setInterval(() => { if (!document.body.contains(gitter)) return clearInterval(uhr); zeit.textContent = h.zeit((Date.now() - t0) / 1000); }, 500);
      const zuKarte = (x, nr) => { x.classList.remove("auf"); x.classList.add("zu"); x.textContent = ""; x.setAttribute("aria-label", "Karte " + nr + " umdrehen"); };
      karten.forEach((k, nr) => {
        const b = h.knopf("lp-pr-karte zu", "", "Karte " + (nr + 1) + " umdrehen");
        b.style.fontSize = "clamp(14px, 1.7vw, 24px)";
        b.addEventListener("click", () => {
          if (sperre || b.classList.contains("auf") || b.classList.contains("ok")) return;
          b.classList.remove("zu"); b.classList.add("auf"); b.textContent = k.t; b.removeAttribute("aria-label");
          offen.push([b, k, nr + 1]);
          if (offen.length < 2) { h.rueck(sagt, "", ""); return; }
          z++; zuege.textContent = "Züge: " + z;
          const [a, c] = offen; offen = [];
          if (a[1].i === c[1].i && a[1].art !== c[1].art) {
            [a[0], c[0]].forEach((x) => { x.classList.remove("auf"); x.classList.add("ok"); });
            h.rueck(sagt, "gut", "Paar gefunden");
            if (++paareGefunden === wahl.length) {
              clearInterval(uhr); h.rueck(sagt, "", "");
              feld.appendChild(h.el("p", "lp-pr-geschafft", (h.ohneZeit ? "Geschafft mit " : "Geschafft in " + h.zeit((Date.now() - t0) / 1000) + " mit ") + z + " Zügen"));
            }
          } else {
            sperre = true; h.rueck(sagt, "falsch", "Kein Paar. Die Karten drehen sich wieder um.");
            setTimeout(() => { zuKarte(a[0], a[2]); zuKarte(c[0], c[2]); sperre = false; }, 1600);
          }
        });
        gitter.appendChild(b);
      });
    }
  };
})();
