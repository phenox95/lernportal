/* Stammbäume der Stunde 5 (Präsentation und Arbeitsblatt zeigen dieselben Daten).
   Wie im Buch (S. 130): Namen unter den Symbolen, Generationen P, F1, F2. Ausgefüllt = Merkmal.
   Beispiele beim Menschen, vereinfachte Schulmodelle: Daumenbiegen (Buch S. 129 und 130, rezessiv), Rhesusfaktor positiv (Buch S. 134, dominant),
   rote Haare (rezessiv), Rot-Grün-Sehschwäche (X-gonosomal-rezessiv). Familien und Namen sind erfunden. */
window.HZ_SB = {
  /* M2: Familie Weber, Daumenbiegen, rezessiv */
  A: { w: 560, h: 270, gens: ["P", "F1"], alt: "Stammbaum M2: Thomas und Sabine haben vier Kinder, Laura kann den Daumen zurückbiegen",
    nodes: {
      Thomas: { name: "Thomas", g: 0, x: 200, sex: "m", aff: false }, Sabine: { name: "Sabine", g: 0, x: 360, sex: "w", aff: false },
      Jonas: { name: "Jonas", g: 1, x: 100, sex: "m", aff: false }, Laura: { name: "Laura", g: 1, x: 220, sex: "w", aff: true },
      Felix: { name: "Felix", g: 1, x: 340, sex: "m", aff: false }, Marie: { name: "Marie", g: 1, x: 460, sex: "w", aff: false } },
    fam: [{ p: ["Thomas", "Sabine"], k: ["Jonas", "Laura", "Felix", "Marie"] }] },
  /* M3: Familie Kern, Rhesusfaktor positiv (Rh+), dominant */
  B: { w: 560, h: 270, gens: ["P", "F1"], alt: "Stammbaum M3: Karl und Elke sind rhesuspositiv, ihre Tochter Lisa ist rhesusnegativ",
    nodes: {
      Karl: { name: "Karl", g: 0, x: 200, sex: "m", aff: true }, Elke: { name: "Elke", g: 0, x: 360, sex: "w", aff: true },
      Tim: { name: "Tim", g: 1, x: 100, sex: "m", aff: true }, Lisa: { name: "Lisa", g: 1, x: 220, sex: "w", aff: false },
      Nora: { name: "Nora", g: 1, x: 340, sex: "w", aff: true }, Paul: { name: "Paul", g: 1, x: 460, sex: "m", aff: true } },
    fam: [{ p: ["Karl", "Elke"], k: ["Tim", "Lisa", "Nora", "Paul"] }] },
  /* M4: Familie Hartmann, rote Haare, rezessiv */
  C: { w: 580, h: 390, gens: ["P", "F1", "F2"], alt: "Stammbaum M4: Drei Generationen, rote Haare bei Bernd, Jens und Leon",
    nodes: {
      Hans: { name: "Hans", g: 0, x: 220, sex: "m", aff: false }, Gerda: { name: "Gerda", g: 0, x: 400, sex: "w", aff: false },
      Ute: { name: "Ute", g: 1, x: 100, sex: "w", aff: false }, Bernd: { name: "Bernd", g: 1, x: 220, sex: "m", aff: true },
      Mia: { name: "Mia", g: 1, x: 330, sex: "w", aff: false }, Jens: { name: "Jens", g: 1, x: 470, sex: "m", aff: true },
      Leon: { name: "Leon", g: 2, x: 330, sex: "m", aff: true }, Sarah: { name: "Sarah", g: 2, x: 400, sex: "w", aff: false }, Lena: { name: "Lena", g: 2, x: 470, sex: "w", aff: false } },
    fam: [{ p: ["Hans", "Gerda"], k: ["Ute", "Bernd", "Mia"] }, { p: ["Mia", "Jens"], k: ["Leon", "Sarah", "Lena"] }] },
  /* M6: Rot-Grün-Sehschwäche, nur Männer, X-gonosomal-rezessiv (Buch S. 130, Schritt 2) */
  E: { w: 580, h: 390, gens: ["P", "F1", "F2"], alt: "Stammbaum M6: Drei Generationen, nur Männer mit Rot-Grün-Sehschwäche",
    nodes: {
      Arno: { name: "Arno", g: 0, x: 220, sex: "m", aff: false }, Berta: { name: "Berta", g: 0, x: 400, sex: "w", aff: false },
      Carl: { name: "Carl", g: 1, x: 100, sex: "m", aff: true }, Dora: { name: "Dora", g: 1, x: 220, sex: "w", aff: false },
      Elsa: { name: "Elsa", g: 1, x: 330, sex: "w", aff: false }, Franz: { name: "Franz", g: 1, x: 470, sex: "m", aff: false },
      Gustav: { name: "Gustav", g: 2, x: 330, sex: "m", aff: true }, Hanna: { name: "Hanna", g: 2, x: 400, sex: "w", aff: false }, Ingo: { name: "Ingo", g: 2, x: 470, sex: "m", aff: false } },
    fam: [{ p: ["Arno", "Berta"], k: ["Carl", "Dora", "Elsa"] }, { p: ["Elsa", "Franz"], k: ["Gustav", "Hanna", "Ingo"] }] },
  /* M5: Familie Brandt, Rhesusfaktor positiv (Rh+), dominant */
  F: { w: 580, h: 390, gens: ["P", "F1", "F2"], alt: "Stammbaum M5: Drei Generationen, rhesuspositiv in jeder Generation",
    nodes: {
      Kurt: { name: "Kurt", g: 0, x: 220, sex: "m", aff: true }, Pia: { name: "Pia", g: 0, x: 400, sex: "w", aff: false },
      Rolf: { name: "Rolf", g: 1, x: 100, sex: "m", aff: false }, Tanja: { name: "Tanja", g: 1, x: 220, sex: "w", aff: true },
      Sven: { name: "Sven", g: 1, x: 330, sex: "m", aff: true }, Uta: { name: "Uta", g: 1, x: 470, sex: "w", aff: true },
      Udo: { name: "Udo", g: 2, x: 330, sex: "m", aff: false }, Vera: { name: "Vera", g: 2, x: 400, sex: "w", aff: true }, Wilma: { name: "Wilma", g: 2, x: 470, sex: "w", aff: true } },
    fam: [{ p: ["Kurt", "Pia"], k: ["Rolf", "Tanja", "Sven"] }, { p: ["Sven", "Uta"], k: ["Udo", "Vera", "Wilma"] }] }
};
