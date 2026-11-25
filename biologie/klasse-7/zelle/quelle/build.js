// Baut die Druck-PDFs aus den HTML-Quellen in diesem Ordner (echter Text, Andika eingebettet).
// Nutzung: im Ordner quelle/ "node build.js" (lädt die Dateien direkt, kein Server nötig).
// Prüft dabei jede Seite auf Überlauf und bricht dann ab.
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');
const JOBS = [
  ['ab-fotosynthese-1.html', 'fotosynthese-1/arbeitsblatt-2.pdf'],
];
(async () => {
  const nur = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage();
  let fehler = 0;
  for (const [q, z] of JOBS) {
    if (nur && !q.includes(nur)) continue;
    await p.goto(pathToFileURL(path.join(__dirname, q)).href);
    await p.evaluate(() => document.fonts.ready);
    const ueber = await p.evaluate(() => [...document.querySelectorAll('.seite')].map((s, i) => {
      const rest = [...s.querySelectorAll('.rest')].map(x => x.getBoundingClientRect().height);
      return { i: i + 1, ueber: s.scrollHeight - s.clientHeight, rest: rest.map(h => Math.round(h)) };
    }));
    for (const u of ueber) {
      if (u.ueber > 0) { fehler++; console.log('ÜBERLAUF', q, 'Seite', u.i, u.ueber + 'px'); }
      else console.log('ok', q, 'Seite', u.i, 'Restraum', u.rest.join(',') + 'px');
    }
    await p.pdf({ path: path.join(__dirname, '..', z), format: 'A4', printBackground: true, preferCSSPageSize: true });
  }
  await b.close();
  process.exit(fehler ? 1 : 0);
})();
