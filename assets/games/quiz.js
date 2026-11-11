/* Quiz: Zu einer Erklärung gehört der richtige Begriff. Vier Antworten, sechs Runden, Team gegen die Uhr. */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.quiz = {
    titel: "Quiz",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      const runden = h.mischen(paare).slice(0, 6);
      let n = 0, richtig = 0; const t0 = Date.now();
      const info = h.el("div", "lp-pr-sinfo"), zaehler = h.el("span", "", ""), zeit = h.el("span", "", "0:00");
      info.appendChild(zaehler); if (!h.ohneZeit) info.appendChild(zeit);
      const frage = h.el("p", "lp-pr-frage"), karten = h.el("div", "lp-pr-karten"), sagt = h.el("p", "lp-pr-spieltext", "");
      karten.style.gridTemplateColumns = "repeat(2, 1fr)";
      feld.appendChild(info); feld.appendChild(frage); feld.appendChild(karten); feld.appendChild(sagt);
      const uhr = setInterval(() => { if (!document.body.contains(karten)) return clearInterval(uhr); zeit.textContent = h.zeit((Date.now() - t0) / 1000); }, 500);
      function runde() {
        if (n >= runden.length) {
          clearInterval(uhr); karten.remove(); frage.remove(); sagt.remove();
          feld.appendChild(h.el("p", "lp-pr-geschafft", richtig + " von " + runden.length + " richtig" + (h.ohneZeit ? "" : " in " + h.zeit((Date.now() - t0) / 1000)) + "!"));
          return;
        }
        const r = runden[n]; zaehler.textContent = "Frage " + (n + 1) + " von " + runden.length;
        frage.textContent = "Welcher Begriff passt? „" + r.e + "“"; sagt.textContent = ""; karten.textContent = "";
        const falsch = h.mischen(paare.filter((p) => p !== r)).slice(0, 3);
        let gesperrt = false;
        h.mischen([r].concat(falsch)).forEach((p) => {
          const b = h.knopf("lp-pr-karte", p.s || p.b);
          b.addEventListener("click", () => {
            if (gesperrt) return; gesperrt = true;
            if (p === r) { b.classList.add("ok"); richtig++; sagt.textContent = "Richtig!"; }
            else { b.classList.add("bad"); sagt.textContent = "Gesucht war: " + (r.s || r.b); [].forEach.call(karten.children, (x) => { if (x.textContent === (r.s || r.b)) x.classList.add("ok"); }); }
            setTimeout(() => { n++; runde(); }, 1600);
          });
          karten.appendChild(b);
        });
      }
      runde();
    }
  };
})();
