/* Stimmt das?: Begriff und Erklärung werden gezeigt. Passt die Erklärung wirklich zum Begriff? */
(() => {
  "use strict";
  const LP = window.LPSpiele;
  LP.reg.stimmts = {
    titel: "Stimmt das?",
    start({ feld, paare, hilfe }) {
      const h = hilfe;
      let folge = []; while (folge.length < 8) folge = folge.concat(h.mischen(paare));
      folge = folge.slice(0, 8).map((p) => { const stimmt = Math.random() < 0.5; return { p, stimmt, e: stimmt ? p.e : h.mischen(paare.filter((x) => x !== p))[0].e }; });
      let n = 0, richtig = 0;
      const info = h.el("div", "lp-pr-sinfo"), zaehler = h.el("span", ""), frage = h.el("p", "lp-pr-frage"), karten = h.el("div", "lp-pr-karten"), sagt = h.el("p", "lp-pr-spieltext", "");
      karten.style.gridTemplateColumns = "repeat(2, 1fr)"; info.appendChild(zaehler);
      [info, frage, karten, sagt].forEach((x) => feld.appendChild(x));
      const vl = h.vorlesen(frage);
      function runde() {
        if (n >= folge.length) { [info, frage, karten, sagt].forEach((x) => x.remove()); if (vl) vl.remove(); feld.appendChild(h.el("p", "lp-pr-geschafft", richtig + " von " + folge.length + " richtig")); return; }
        const r = folge[n]; zaehler.textContent = "Aussage " + (n + 1) + " von " + folge.length; h.rueck(sagt, "", ""); karten.textContent = "";
        h.frage(frage, "Entscheide: Passt die Erklärung zum Begriff?", "„" + (r.p.s || r.p.b) + "“ bedeutet: " + r.e);
        let gesperrt = false;
        [[true, "Stimmt"], [false, "Stimmt nicht"]].forEach(([wert, text]) => {
          const b = h.knopf("lp-pr-karte", text);
          b.addEventListener("click", () => {
            if (gesperrt) return; gesperrt = true;
            if (wert === r.stimmt) { b.classList.add("ok"); richtig++; h.rueck(sagt, "gut", "Richtig." + (r.stimmt ? "" : " Zu „" + (r.p.s || r.p.b) + "“ passt: " + r.p.e)); }
            else { b.classList.add("bad"); h.rueck(sagt, "falsch", r.stimmt ? "Nicht richtig. Die Erklärung passt zum Begriff." : "Nicht richtig. Zu „" + (r.p.s || r.p.b) + "“ passt: " + r.p.e); }
            [].forEach.call(karten.children, (x) => { x.disabled = true; });
            h.weiter(feld, () => { n++; runde(); }, 2800);
          });
          karten.appendChild(b);
        });
      }
      runde();
    }
  };
})();
