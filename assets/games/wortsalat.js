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
      let n = 0, hinweise = 0; const t0 = Date.now();
      const info = h.el("div", "lp-pr-sinfo"), zaehler = h.el("span", ""), zeit = h.el("span", "", "0:00");
      info.appendChild(zaehler); if (!h.ohneZeit) info.appendChild(zeit);
      const frage = h.el("p", "lp-pr-frage"), antwort = h.el("div", "lp-pr-antwort"), pool = h.el("div", "lp-pr-buchstaben"), steuer = h.el("div", "lp-pr-buchstaben");
      feld.appendChild(info); feld.appendChild(frage); feld.appendChild(antwort); feld.appendChild(pool); feld.appendChild(steuer);
      const uhr = setInterval(() => { if (!document.body.contains(pool)) return clearInterval(uhr); zeit.textContent = h.zeit((Date.now() - t0) / 1000); }, 500);
      function runde() {
        if (n >= runden.length) {
          clearInterval(uhr); [frage, antwort, pool, steuer].forEach((x) => x.remove());
          feld.appendChild(h.el("p", "lp-pr-geschafft", "Alle Wörter gefunden" + (h.ohneZeit ? "" : " in " + h.zeit((Date.now() - t0) / 1000)) + "!"));
          return;
        }
        const r = runden[n], wort = r.b; zaehler.textContent = "Wort " + (n + 1) + " von " + runden.length;
        frage.textContent = "Welcher Begriff ist gemeint? „" + r.e + "“";
        antwort.textContent = ""; antwort.classList.remove("ok"); pool.textContent = ""; steuer.textContent = "";
        let teile = h.mischen(wort.toLowerCase().split("").map((c, i) => ({ c, i })));
        if (wort.length > 3) { let v = 0; while (teile.map((t) => t.c).join("") === wort.toLowerCase() && v++ < 8) teile = h.mischen(teile); }
        const gelegt = [];
        const zeigeAntwort = () => { antwort.textContent = gelegt.map((t) => t.c).join(""); if (!gelegt.length) antwort.textContent = ""; };
        const knoepfe = teile.map((t) => {
          const b = h.knopf("lp-pr-karte", t.c, "Buchstabe " + t.c);
          b.addEventListener("click", () => {
            if (antwort.classList.contains("ok") || b.classList.contains("weg")) return;
            gelegt.push({ c: t.c, b }); b.classList.add("weg"); zeigeAntwort();
            if (gelegt.length === wort.length) {
              if (gelegt.map((x) => x.c).join("") === wort.toLowerCase()) {
                antwort.classList.add("ok"); antwort.textContent = r.s || wort;
                setTimeout(() => { n++; runde(); }, 1800);
              } else { setTimeout(zurueck, 700); antwort.style.color = "#d62828"; }
            }
          });
          pool.appendChild(b); return b;
        });
        function zurueck() { gelegt.splice(0).forEach((x) => x.b.classList.remove("weg")); antwort.style.color = ""; zeigeAntwort(); }
        const loesch = h.knopf("lp-pr-klein", "Buchstabe zurück", "Letzten Buchstaben entfernen");
        loesch.addEventListener("click", () => { const x = gelegt.pop(); if (x) x.b.classList.remove("weg"); antwort.style.color = ""; zeigeAntwort(); });
        const hinweis = h.knopf("lp-pr-klein", "Hinweis: erster Buchstabe", "Ersten Buchstaben verraten");
        hinweis.addEventListener("click", () => { hinweise++; hinweis.textContent = "Erster Buchstabe: " + wort[0]; });
        steuer.appendChild(loesch); steuer.appendChild(hinweis);
        void knoepfe;
      }
      runde();
    }
  };
})();
