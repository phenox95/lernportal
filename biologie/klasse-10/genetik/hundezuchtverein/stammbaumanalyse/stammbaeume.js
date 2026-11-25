/* Stammbäume der Stunde 5 (Präsentation und Arbeitsblatt zeigen dieselben Daten).
   Namen unter den Symbolen. Generationen mit römischen Ziffern (I, II, III) wie in der Humangenetik üblich:
   P und F1 bleiben den Kreuzungen reinerbiger Eltern aus Stunde 3 und 4 vorbehalten. Ausgefüllt = Merkmal.
   Beispiele beim Menschen, vereinfachte Schulmodelle: Daumenbiegen (Buch S. 129 und 130, rezessiv; fachlich umstritten,
   der Daumenwinkel hängt nicht an einem Gen), Rhesusfaktor positiv (Buch S. 134, dominant), rote Haare (rezessiv),
   Rot-Grün-Sehschwäche (X-chromosomal-rezessiv). Familien und Namen sind erfunden.
   sol = Genotyp für das Eintragen (nur Personen mit sicherem Genotyp). */
window.HZ_SB = {
  /* M2: Familie Weber, Daumenbiegen, rezessiv. Bewusst 2 von 4 Kindern mit Merkmal: 25 % heißt nicht „genau jedes vierte Kind“. */
  A: { art: "mensch", w: 560, h: 270, gens: ["I", "II"], alt: "Stammbaum M2: Thomas und Sabine haben vier Kinder, Laura und Marie können den Daumen zurückbiegen",
    nodes: {
      Thomas: { name: "Thomas", g: 0, x: 200, sex: "m", aff: false }, Sabine: { name: "Sabine", g: 0, x: 360, sex: "w", aff: false },
      Jonas: { name: "Jonas", g: 1, x: 100, sex: "m", aff: false }, Laura: { name: "Laura", g: 1, x: 220, sex: "w", aff: true },
      Ben: { name: "Ben", g: 1, x: 340, sex: "m", aff: false }, Marie: { name: "Marie", g: 1, x: 460, sex: "w", aff: true } },
    fam: [{ p: ["Thomas", "Sabine"], k: ["Jonas", "Laura", "Ben", "Marie"] }] },
  /* M3: Familie Kern, Rhesusfaktor positiv (Rh+), dominant */
  B: { art: "mensch", w: 560, h: 270, gens: ["I", "II"], alt: "Stammbaum M3: Karl und Elke sind rhesuspositiv, ihre Tochter Lisa ist rhesusnegativ",
    nodes: {
      Karl: { name: "Karl", g: 0, x: 200, sex: "m", aff: true }, Elke: { name: "Elke", g: 0, x: 360, sex: "w", aff: true },
      Tim: { name: "Tim", g: 1, x: 100, sex: "m", aff: true }, Lisa: { name: "Lisa", g: 1, x: 220, sex: "w", aff: false },
      Nora: { name: "Nora", g: 1, x: 340, sex: "w", aff: true }, Paul: { name: "Paul", g: 1, x: 460, sex: "m", aff: true } },
    fam: [{ p: ["Karl", "Elke"], k: ["Tim", "Lisa", "Nora", "Paul"] }] },
  /* M4: Familie Hartmann, rote Haare, rezessiv (a = rote Haare). Ute: AA oder Aa, deshalb ohne sol. */
  C: { art: "mensch", w: 580, h: 390, gens: ["I", "II", "III"], alt: "Stammbaum M4: Drei Generationen, rote Haare bei Bernd, Jens und Leon. Jens hat in die Familie eingeheiratet.",
    nodes: {
      Hans: { name: "Hans", g: 0, x: 220, sex: "m", aff: false, sol: "Aa" }, Gerda: { name: "Gerda", g: 0, x: 400, sex: "w", aff: false, sol: "Aa" },
      Ute: { name: "Ute", g: 1, x: 100, sex: "w", aff: false }, Bernd: { name: "Bernd", g: 1, x: 220, sex: "m", aff: true, sol: "aa" },
      Mia: { name: "Mia", g: 1, x: 330, sex: "w", aff: false, sol: "Aa" }, Jens: { name: "Jens", g: 1, x: 470, sex: "m", aff: true, sol: "aa" },
      Leon: { name: "Leon", g: 2, x: 330, sex: "m", aff: true, sol: "aa" }, Sarah: { name: "Sarah", g: 2, x: 400, sex: "w", aff: false, sol: "Aa" }, Lena: { name: "Lena", g: 2, x: 470, sex: "w", aff: false, sol: "Aa" } },
    fam: [{ p: ["Hans", "Gerda"], k: ["Ute", "Bernd", "Mia"] }, { p: ["Mia", "Jens"], k: ["Leon", "Sarah", "Lena"] }] },
  /* M6: Rot-Grün-Sehschwäche, nur Männer. X-chromosomal-rezessiv ist am wahrscheinlichsten,
     autosomal-rezessiv ist mit diesem Stammbaum aber nicht ausgeschlossen. Ausgeschlossen ist nur autosomal-dominant. */
  E: { art: "mensch", w: 580, h: 390, gens: ["I", "II", "III"], alt: "Stammbaum M6: Drei Generationen, nur Männer mit Rot-Grün-Sehschwäche",
    nodes: {
      Arno: { name: "Arno", g: 0, x: 220, sex: "m", aff: false }, Berta: { name: "Berta", g: 0, x: 400, sex: "w", aff: false },
      Carl: { name: "Carl", g: 1, x: 100, sex: "m", aff: true }, Dora: { name: "Dora", g: 1, x: 220, sex: "w", aff: false },
      Elsa: { name: "Elsa", g: 1, x: 330, sex: "w", aff: false }, Franz: { name: "Franz", g: 1, x: 470, sex: "m", aff: false },
      Gustav: { name: "Gustav", g: 2, x: 330, sex: "m", aff: true }, Hanna: { name: "Hanna", g: 2, x: 400, sex: "w", aff: false }, Ingo: { name: "Ingo", g: 2, x: 470, sex: "m", aff: false } },
    fam: [{ p: ["Arno", "Berta"], k: ["Carl", "Dora", "Elsa"] }, { p: ["Elsa", "Franz"], k: ["Gustav", "Hanna", "Ingo"] }] },
  /* M5: Familie Brandt, Rhesusfaktor positiv (Rh+), dominant. Kurt × Pia allein entscheidet nichts, erst Sven × Uta → Udo. */
  F: { art: "mensch", w: 580, h: 390, gens: ["I", "II", "III"], alt: "Stammbaum M5: Drei Generationen, rhesuspositiv in jeder Generation",
    nodes: {
      Kurt: { name: "Kurt", g: 0, x: 220, sex: "m", aff: true }, Pia: { name: "Pia", g: 0, x: 400, sex: "w", aff: false },
      Rolf: { name: "Rolf", g: 1, x: 100, sex: "m", aff: false }, Tanja: { name: "Tanja", g: 1, x: 220, sex: "w", aff: true },
      Sven: { name: "Sven", g: 1, x: 330, sex: "m", aff: true }, Uta: { name: "Uta", g: 1, x: 470, sex: "w", aff: true },
      Udo: { name: "Udo", g: 2, x: 330, sex: "m", aff: false }, Vera: { name: "Vera", g: 2, x: 400, sex: "w", aff: true }, Wilma: { name: "Wilma", g: 2, x: 470, sex: "w", aff: true } },
    fam: [{ p: ["Kurt", "Pia"], k: ["Rolf", "Tanja", "Sven"] }, { p: ["Sven", "Uta"], k: ["Udo", "Vera", "Wilma"] }] },
  /* M7: Exit-Ticket, Familie Wolf, allgemeines Merkmal, dominant. Die Regel greift erst in Generation II:
     Emre × Katrin entscheidet nichts, Selin × Jan (beide mit Merkmal) → Mila ohne Merkmal. */
  G: { art: "mensch", w: 580, h: 390, gens: ["I", "II", "III"], alt: "Stammbaum M7: Emre hat das Merkmal, Katrin nicht. Ihre Tochter Selin hat es, ihr Sohn Max nicht. Selin und ihr Partner Jan haben beide das Merkmal, ihre Tochter Mila nicht.",
    nodes: {
      Emre: { name: "Emre", g: 0, x: 220, sex: "m", aff: true }, Katrin: { name: "Katrin", g: 0, x: 400, sex: "w", aff: false },
      Max: { name: "Max", g: 1, x: 140, sex: "m", aff: false }, Selin: { name: "Selin", g: 1, x: 310, sex: "w", aff: true },
      Jan: { name: "Jan", g: 1, x: 470, sex: "m", aff: true },
      Mila: { name: "Mila", g: 2, x: 390, sex: "w", aff: false } },
    fam: [{ p: ["Emre", "Katrin"], k: ["Max", "Selin"] }, { p: ["Selin", "Jan"], k: ["Mila"] }] }
};
