/* Zuordnen: Begriff antippen, dann die passende Erklärung antippen. Richtige Paare bleiben mit Haken stehen. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.zuordnen = {
    titel: "Zuordnen",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      const wahl = h.mischen(paare).slice(0, 5);
      const t0 = Date.now(); let fehler = 0, fertig = 0, gewaehlt = null;
      const info = h.el("div", "lp-pr-sinfo"), fl = h.el("span", "", "Fehlversuche: 0"), zeit = h.el("span", "", "0:00");
      info.appendChild(fl); if (!h.ohneZeit) info.appendChild(zeit);
      const auftrag = h.el("p", "lp-pr-spieltext");
      h.frage(auftrag, "Ordne zu: Tippe einen Begriff an und dann die Erklärung, die dazu passt.");
      feld.appendChild(auftrag);
      feld.appendChild(info);
      const gitter = h.el("div", "lp-pr-zuordnen"), links = h.el("div", "lp-pr-karten"), rechts = h.el("div", "lp-pr-karten");
      const sagt = h.el("p", "lp-pr-spieltext", ""); sagt.setAttribute("role", "status");
      gitter.appendChild(links); gitter.appendChild(rechts); feld.appendChild(gitter); feld.appendChild(sagt);
      const uhr = setInterval(() => { if (!document.body.contains(gitter)) return clearInterval(uhr); zeit.textContent = h.zeit((Date.now() - t0) / 1000); }, 500);
      const knL = h.mischen(wahl).map((p) => { const b = h.knopf("lp-pr-karte", p.s || p.b); b.dataset.i = wahl.indexOf(p); b.setAttribute("aria-pressed", "false"); links.appendChild(b); return b; });
      const knR = h.mischen(wahl).map((p) => { const b = h.knopf("lp-pr-karte", p.e); b.dataset.i = wahl.indexOf(p); rechts.appendChild(b); return b; });
      knL.forEach((b) => b.addEventListener("click", () => {
        if (b.classList.contains("ok")) return;
        knL.forEach((x) => { x.classList.remove("sel"); x.setAttribute("aria-pressed", "false"); });
        gewaehlt = b; b.classList.add("sel"); b.setAttribute("aria-pressed", "true");
        h.rueck(sagt, "", "Gewählt: " + b.textContent + ". Tippe jetzt die passende Erklärung an.");
      }));
      knR.forEach((b) => b.addEventListener("click", () => {
        if (b.classList.contains("ok")) return;
        if (!gewaehlt) { h.rueck(sagt, "", "Tippe zuerst links einen Begriff an."); return; }
        if (gewaehlt.dataset.i === b.dataset.i) {
          [gewaehlt, b].forEach((x) => { x.classList.remove("sel"); x.classList.add("ok"); x.removeAttribute("aria-pressed"); }); gewaehlt = null;
          h.rueck(sagt, "gut", "Richtig zugeordnet");
          if (++fertig === wahl.length) { clearInterval(uhr); h.rueck(sagt, "", ""); feld.appendChild(h.el("p", "lp-pr-geschafft", (h.ohneZeit ? "Geschafft mit " : "Geschafft in " + h.zeit((Date.now() - t0) / 1000) + " mit ") + fehler + " Fehlversuchen")); }
        } else {
          fehler++; fl.textContent = "Fehlversuche: " + fehler;
          h.rueck(sagt, "falsch", "Passt nicht. Versuche es noch einmal.");
          b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 1200);
        }
      }));
    }
  };
})();
