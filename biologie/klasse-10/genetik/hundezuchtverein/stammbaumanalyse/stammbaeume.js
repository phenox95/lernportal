/* Stammbäume der Stunde 5 (Präsentation und Arbeitsblatt zeigen dieselben Daten).
   Wie im Buch (S. 130): Namen unter den Symbolen, Generationen P, F1, F2. Ausgefüllt = Merkmal. */
window.HZ_SB = {
  /* M2: Zuchtbuch Zwinger Feldmark, Merkmal langes Fell (ausgefüllt), rezessiv */
  A: { w: 560, h: 270, gens: ["P", "F1"], alt: "Stammbaum M2: Bruno und Luna haben vier Welpen, Mila hat langes Fell",
    nodes: {
      Bruno: { name: "Bruno", g: 0, x: 200, sex: "m", aff: false }, Luna: { name: "Luna", g: 0, x: 360, sex: "w", aff: false },
      Rex: { name: "Rex", g: 1, x: 100, sex: "m", aff: false }, Mila: { name: "Mila", g: 1, x: 220, sex: "w", aff: true },
      Odin: { name: "Odin", g: 1, x: 340, sex: "m", aff: false }, Zoe: { name: "Zoe", g: 1, x: 460, sex: "w", aff: false } },
    fam: [{ p: ["Bruno", "Luna"], k: ["Rex", "Mila", "Odin", "Zoe"] }] },
  /* M3: Zwinger Auenhof, schwarzes Fell (ausgefüllt), dominant */
  B: { w: 560, h: 270, gens: ["P", "F1"], alt: "Stammbaum M3: Fritz und Emma sind schwarz, Lotte ist braun",
    nodes: {
      Fritz: { name: "Fritz", g: 0, x: 200, sex: "m", aff: true }, Emma: { name: "Emma", g: 0, x: 360, sex: "w", aff: true },
      Max: { name: "Max", g: 1, x: 100, sex: "m", aff: true }, Lotte: { name: "Lotte", g: 1, x: 220, sex: "w", aff: false },
      Nala: { name: "Nala", g: 1, x: 340, sex: "w", aff: true }, Karl: { name: "Karl", g: 1, x: 460, sex: "m", aff: true } },
    fam: [{ p: ["Fritz", "Emma"], k: ["Max", "Lotte", "Nala", "Karl"] }] },
  /* M4: drei Generationen, langes Fell (ausgefüllt), rezessiv */
  C: { w: 580, h: 390, gens: ["P", "F1", "F2"], alt: "Stammbaum M4: Drei Generationen, langes Fell bei Balu, Dax und Fiete",
    nodes: {
      Anton: { name: "Anton", g: 0, x: 220, sex: "m", aff: false }, Greta: { name: "Greta", g: 0, x: 400, sex: "w", aff: false },
      Hella: { name: "Hella", g: 1, x: 100, sex: "w", aff: false }, Balu: { name: "Balu", g: 1, x: 220, sex: "m", aff: true },
      Cleo: { name: "Cleo", g: 1, x: 330, sex: "w", aff: false }, Dax: { name: "Dax", g: 1, x: 470, sex: "m", aff: true },
      Fiete: { name: "Fiete", g: 2, x: 330, sex: "m", aff: true }, Gina: { name: "Gina", g: 2, x: 400, sex: "w", aff: false }, Lilly: { name: "Lilly", g: 2, x: 470, sex: "w", aff: false } },
    fam: [{ p: ["Anton", "Greta"], k: ["Hella", "Balu", "Cleo"] }, { p: ["Cleo", "Dax"], k: ["Fiete", "Gina", "Lilly"] }] },
  /* M6: nur Männer mit Merkmal, X-gonosomal-rezessiv (Buch S. 130, Schritt 2) */
  E: { w: 580, h: 390, gens: ["P", "F1", "F2"], alt: "Stammbaum M6: Drei Generationen, nur Männer mit Merkmal",
    nodes: {
      Arno: { name: "Arno", g: 0, x: 220, sex: "m", aff: false }, Berta: { name: "Berta", g: 0, x: 400, sex: "w", aff: false },
      Carl: { name: "Carl", g: 1, x: 100, sex: "m", aff: true }, Dora: { name: "Dora", g: 1, x: 220, sex: "w", aff: false },
      Elsa: { name: "Elsa", g: 1, x: 330, sex: "w", aff: false }, Franz: { name: "Franz", g: 1, x: 470, sex: "m", aff: false },
      Gustav: { name: "Gustav", g: 2, x: 330, sex: "m", aff: true }, Hanna: { name: "Hanna", g: 2, x: 400, sex: "w", aff: false }, Ingo: { name: "Ingo", g: 2, x: 470, sex: "m", aff: false } },
    fam: [{ p: ["Arno", "Berta"], k: ["Carl", "Dora", "Elsa"] }, { p: ["Elsa", "Franz"], k: ["Gustav", "Hanna", "Ingo"] }] },
  /* M5: Zwinger Birkenhof, schwarzes Fell (ausgefüllt), dominant */
  F: { w: 580, h: 390, gens: ["P", "F1", "F2"], alt: "Stammbaum M5: Drei Generationen, schwarzes Fell in jeder Generation",
    nodes: {
      Otto: { name: "Otto", g: 0, x: 220, sex: "m", aff: true }, Pia: { name: "Pia", g: 0, x: 400, sex: "w", aff: false },
      Quirin: { name: "Quirin", g: 1, x: 100, sex: "m", aff: false }, Rosa: { name: "Rosa", g: 1, x: 220, sex: "w", aff: true },
      Sam: { name: "Sam", g: 1, x: 330, sex: "m", aff: true }, Tessa: { name: "Tessa", g: 1, x: 470, sex: "w", aff: true },
      Udo: { name: "Udo", g: 2, x: 330, sex: "m", aff: false }, Vera: { name: "Vera", g: 2, x: 400, sex: "w", aff: true }, Wilma: { name: "Wilma", g: 2, x: 470, sex: "w", aff: true } },
    fam: [{ p: ["Otto", "Pia"], k: ["Quirin", "Rosa", "Sam"] }, { p: ["Sam", "Tessa"], k: ["Udo", "Vera", "Wilma"] }] }
};
