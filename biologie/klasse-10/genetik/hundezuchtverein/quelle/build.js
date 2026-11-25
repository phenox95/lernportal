// Baut die Druck-PDFs der Reihe „Der Hundezuchtverein“ aus den HTML-Quellen in diesem Ordner (echter Text, Andika eingebettet).
// Nutzung: im Repository-Stamm "python3 -m http.server 8765" starten, dann hier "node build.js".
// Prüft dabei jede Seite auf Überlauf und bricht dann ab. Die Stammbäume kommen aus ../stammbaumanalyse/stammbaeume.js,
// dieselben Daten wie in der Präsentation.
const { chromium } = require('playwright');
const path = require('path');
const BASIS = 'http://localhost:8765/biologie/klasse-10/genetik/hundezuchtverein/';
const JOBS = [
  ['quelle/ab-stammbaum.html', 'stammbaumanalyse/arbeitsblatt-stammbaum.pdf'],
];
(async () => {
  const nur = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage();
  let fehler = 0;
  for (const [q, z] of JOBS) {
    if (nur && !q.includes(nur)) continue;
    const r = await p.goto(BASIS + q);
    if (!r || !r.ok()) { console.log('fehlt', q); continue; }
    await p.evaluate(() => document.fonts.ready);
    const ueber = await p.evaluate(() => [...document.querySelectorAll('.seite')].map((s, i) => ({ i: i + 1, ueber: s.scrollHeight - s.clientHeight })));
    for (const u of ueber) {
      if (u.ueber > 0) { fehler++; console.log('ÜBERLAUF', q, 'Seite', u.i, u.ueber + 'px'); }
      else console.log('ok', q, 'Seite', u.i);
    }
    await p.pdf({ path: path.join(__dirname, '..', z), format: 'A4', printBackground: true, preferCSSPageSize: true });
  }
  await b.close();
  process.exit(fehler ? 1 : 0);
})();
