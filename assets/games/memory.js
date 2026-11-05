/* Memory: Begriff und Erklärung bilden ein Paar. Die Klasse spielt gemeinsam an der Tafel. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.memory = {
    titel: "Memory",
    start({ feld, paare, hilfe, ende }) {
      const h = hilfe;
      const wahl = h.mischen(paare).slice(0, 6);
      const karten = h.mischen(wahl.flatMap((p, i) => [{ i, t: p.s || p.b, art: "b" }, { i, t: p.e, art: "e" }]));
      const info = h.el("div", "lp-pr-sinfo");
      const zuege = h.el("span", "", "Züge: 0"), zeit = h.el("span", "", "0:00");
      info.appendChild(zuege); info.appendChild(zeit);
      feld.appendChild(h.el("p", "lp-pr-spieltext", "Finde zu jedem Begriff die passende Erklärung. Tippt abwechselnd zwei Karten an."));
      feld.appendChild(info);
      const gitter = h.el("div", "lp-pr-karten");
      gitter.style.gridTemplateColumns = "repeat(4, 1fr)"; gitter.style.gridAutoRows = "1fr"; gitter.style.flex = "1";
      feld.appendChild(gitter);
      const t0 = Date.now(); let offen = [], z = 0, paareGefunden = 0, sperre = false;
      const uhr = setInterval(() => { if (!document.body.contains(gitter)) return clearInterval(uhr); zeit.textContent = h.zeit((Date.now() - t0) / 1000); }, 500);
      karten.forEach((k) => {
        const b = h.knopf("lp-pr-karte zu", "", "Karte umdrehen");
        b.style.fontSize = "clamp(14px, 1.7vw, 24px)";
        b.addEventListener("click", () => {
          if (sperre || b.classList.contains("auf") || b.classList.contains("ok")) return;
          b.classList.remove("zu"); b.classList.add("auf"); b.textContent = k.t; b.setAttribute("aria-label", k.t);
          offen.push([b, k]);
          if (offen.length < 2) return;
          z++; zuege.textContent = "Züge: " + z;
          const [a, c] = offen; offen = [];
          if (a[1].i === c[1].i && a[1].art !== c[1].art) {
            [a[0], c[0]].forEach((x) => { x.classList.remove("auf"); x.classList.add("ok"); });
            if (++paareGefunden === wahl.length) {
              clearInterval(uhr);
              feld.appendChild(h.el("p", "lp-pr-geschafft", "Geschafft in " + h.zeit((Date.now() - t0) / 1000) + " mit " + z + " Zügen!"));
            }
          } else {
            sperre = true;
            setTimeout(() => { [a[0], c[0]].forEach((x) => { x.classList.remove("auf"); x.classList.add("zu"); x.textContent = ""; x.setAttribute("aria-label", "Karte umdrehen"); }); sperre = false; }, 1400);
          }
        });
        gitter.appendChild(b);
      });
    }
  };
})();
