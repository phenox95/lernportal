/* Wortsalat: Aus durcheinandergewürfelten Buchstaben den Fachbegriff bilden. Die Erklärung ist der Hinweis. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.wortsalat = {
    titel: "Wortsalat",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      const geeignet = paare.filter((p) => /^[A-Za-zÄÖÜäöüß]{3,14}$/.test(p.b));
      const runden = h.mischen(geeignet).slice(0, 4);
      let n = 0; const t0 = Date.now();
      const info = h.el("div", "lp-pr-sinfo"), zaehler = h.el("span", ""), zeit = h.el("span", "", "0:00");
      info.appendChild(zaehler); if (!h.ohneZeit) info.appendChild(zeit);
      const frage = h.el("p", "lp-pr-frage"), antwort = h.el("div", "lp-pr-antwort"), sagt = h.el("p", "lp-pr-spieltext", ""), pool = h.el("div", "lp-pr-buchstaben"), steuer = h.el("div", "lp-pr-buchstaben");
      antwort.setAttribute("aria-live", "polite");
      feld.appendChild(info); feld.appendChild(frage); feld.appendChild(antwort); feld.appendChild(sagt); feld.appendChild(pool); feld.appendChild(steuer);
      const vl = h.vorlesen(frage);
      const uhr = setInterval(() => { if (!document.body.contains(pool)) return clearInterval(uhr); zeit.textContent = h.zeit((Date.now() - t0) / 1000); }, 500);
      function runde() {
        if (n >= runden.length) {
          clearInterval(uhr); [frage, antwort, sagt, pool, steuer].forEach((x) => x.remove()); if (vl) vl.remove();
          feld.appendChild(h.el("p", "lp-pr-geschafft", "Alle Wörter gefunden" + (h.ohneZeit ? "" : " in " + h.zeit((Date.now() - t0) / 1000))));
          return;
        }
        const r = runden[n], wort = r.b; zaehler.textContent = "Wort " + (n + 1) + " von " + runden.length;
        h.frage(frage, "Bilde aus den Buchstaben den Begriff, der gemeint ist.", "„" + r.e + "“");
        antwort.textContent = ""; antwort.classList.remove("ok", "bad"); h.rueck(sagt, "", ""); pool.textContent = ""; steuer.textContent = "";
        let teile = h.mischen(wort.toLowerCase().split("").map((c, i) => ({ c, i })));
        if (wort.length > 3) { let v = 0; while (teile.map((t) => t.c).join("") === wort.toLowerCase() && v++ < 8) teile = h.mischen(teile); }
        const gelegt = [];
        const zeigeAntwort = () => { antwort.textContent = gelegt.map((t) => t.c).join(""); };
        teile.forEach((t) => {
          const b = h.knopf("lp-pr-karte", t.c, "Buchstabe " + t.c);
          b.addEventListener("click", () => {
            if (antwort.classList.contains("ok") || b.classList.contains("weg")) return;
            gelegt.push({ c: t.c, b }); b.classList.add("weg"); zeigeAntwort(); h.rueck(sagt, "", "");
            if (gelegt.length === wort.length) {
              if (gelegt.map((x) => x.c).join("") === wort.toLowerCase()) {
                antwort.classList.add("ok"); antwort.textContent = r.s || wort; h.rueck(sagt, "gut", "Richtig");
                h.weiter(feld, () => { n++; runde(); }, 1800);
              } else {
                antwort.classList.add("bad"); h.rueck(sagt, "falsch", "Noch nicht richtig. Die Buchstaben kommen zurück.");
                setTimeout(zurueck, 1400);
              }
            }
          });
          pool.appendChild(b);
        });
        function zurueck() { gelegt.splice(0).forEach((x) => x.b.classList.remove("weg")); antwort.classList.remove("bad"); zeigeAntwort(); }
        const loesch = h.knopf("lp-pr-klein", "Buchstabe zurück", "Letzten Buchstaben entfernen");
        loesch.addEventListener("click", () => { if (antwort.classList.contains("ok")) return; const x = gelegt.pop(); if (x) x.b.classList.remove("weg"); antwort.classList.remove("bad"); h.rueck(sagt, "", ""); zeigeAntwort(); });
        const hinweis = h.knopf("lp-pr-klein", "Hinweis: erster Buchstabe", "Ersten Buchstaben verraten");
        hinweis.addEventListener("click", () => { hinweis.textContent = "Erster Buchstabe: " + wort[0]; hinweis.disabled = true; });
        steuer.appendChild(loesch); steuer.appendChild(hinweis);
      }
      runde();
    }
  };
})();
