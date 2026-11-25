/* Stammbäume der Stunde 5 (Präsentation und Arbeitsblatt zeigen dieselben Daten).
   ausgefüllt = Merkmal. Lösungen (sol): AA, Aa, aa oder A_ (AA oder Aa). A = Anlage für kurzes bzw. schwarzes Fell. */
window.HZ_SB = {
  /* M1: Zuchtbuch Zwinger Feldmark, Merkmal langes Fell (ausgefüllt) */
  A: { w: 560, h: 270, gens: ["I", "II"], alt: "Stammbaum M1: Zwei kurzhaarige Eltern, vier Welpen, eine Hündin mit langem Fell",
    nodes: {
      "I-1": { g: 0, x: 200, sex: "m", aff: false, sol: "Aa" }, "I-2": { g: 0, x: 360, sex: "w", aff: false, sol: "Aa" },
      "II-1": { g: 1, x: 90, sex: "m", aff: false, sol: "A_" }, "II-2": { g: 1, x: 215, sex: "w", aff: true, sol: "aa" },
      "II-3": { g: 1, x: 345, sex: "m", aff: false, sol: "A_" }, "II-4": { g: 1, x: 470, sex: "w", aff: false, sol: "A_" } },
    fam: [{ p: ["I-1", "I-2"], k: ["II-1", "II-2", "II-3", "II-4"] }] },
  /* M2: Zuchtbuch Zwinger Auenhof, Merkmal schwarzes Fell (ausgefüllt), braun ohne Merkmal */
  B: { w: 560, h: 270, gens: ["I", "II"], alt: "Stammbaum M2: Zwei schwarze Eltern, vier Welpen, eine braune Hündin",
    nodes: {
      "I-1": { g: 0, x: 200, sex: "m", aff: true, sol: "Aa" }, "I-2": { g: 0, x: 360, sex: "w", aff: true, sol: "Aa" },
      "II-1": { g: 1, x: 90, sex: "m", aff: true, sol: "A_" }, "II-2": { g: 1, x: 215, sex: "w", aff: false, sol: "aa" },
      "II-3": { g: 1, x: 345, sex: "w", aff: true, sol: "A_" }, "II-4": { g: 1, x: 470, sex: "m", aff: true, sol: "A_" } },
    fam: [{ p: ["I-1", "I-2"], k: ["II-1", "II-2", "II-3", "II-4"] }] },
  /* M3: drei Generationen, Merkmal langes Fell (ausgefüllt) */
  C: { w: 580, h: 390, gens: ["I", "II", "III"], alt: "Stammbaum M3: Drei Generationen, langes Fell in Generation II und III",
    nodes: {
      "I-1": { g: 0, x: 220, sex: "m", aff: false, sol: "Aa" }, "I-2": { g: 0, x: 400, sex: "w", aff: false, sol: "Aa" },
      "II-1": { g: 1, x: 110, sex: "w", aff: false, sol: "A_" }, "II-2": { g: 1, x: 220, sex: "m", aff: true, sol: "aa" },
      "II-3": { g: 1, x: 330, sex: "w", aff: false, sol: "Aa" }, "II-4": { g: 1, x: 470, sex: "m", aff: true, sol: "aa" },
      "III-1": { g: 2, x: 330, sex: "m", aff: true, sol: "aa" }, "III-2": { g: 2, x: 400, sex: "w", aff: false, sol: "Aa" }, "III-3": { g: 2, x: 470, sex: "w", aff: false, sol: "Aa" } },
    fam: [{ p: ["I-1", "I-2"], k: ["II-1", "II-2", "II-3"] }, { p: ["II-3", "II-4"], k: ["III-1", "III-2", "III-3"] }] },
  /* Transfer: Familie, Merkmal Albinismus (ausgefüllt), autosomal-rezessiv, ohne Genotypen zum Eintragen */
  D: { w: 560, h: 270, gens: ["I", "II"], alt: "Stammbaum einer Familie: Zwei Eltern ohne Albinismus, vier Kinder, ein Sohn mit Albinismus",
    nodes: {
      "I-1": { g: 0, x: 200, sex: "m", aff: false }, "I-2": { g: 0, x: 360, sex: "w", aff: false },
      "II-1": { g: 1, x: 90, sex: "w", aff: false }, "II-2": { g: 1, x: 215, sex: "m", aff: true },
      "II-3": { g: 1, x: 345, sex: "w", aff: false }, "II-4": { g: 1, x: 470, sex: "m", aff: false } },
    fam: [{ p: ["I-1", "I-2"], k: ["II-1", "II-2", "II-3", "II-4"] }] }
};
