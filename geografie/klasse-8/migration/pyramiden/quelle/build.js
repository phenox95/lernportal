// Baut die Druck-PDFs aus den HTML-Quellen (echter Text, Andika). Nutzung im Ordner quelle/: node build.js
// Prüft jede Seite auf Überlauf und bricht dann ab.
const { chromium } = require('playwright');
const path = require('path');
const JOBS = [['ab-expertenkarten.html','../arbeitsblatt-1.pdf'],['ab-stammgruppe.html','../arbeitsblatt-2.pdf'],['ab-donow.html','../do-now-zettel.pdf']];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); let fehler = 0;
  for (const [q, z] of JOBS) {
    await p.goto('file://' + path.join(__dirname, q));
    await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(() => [...document.querySelectorAll('.seite')].map((s, i) => ({ i: i + 1, ueber: s.scrollHeight - s.clientHeight })));
    for (const u of r) { if (u.ueber > 0) { fehler++; console.log('ÜBERLAUF', q, 'Seite', u.i, u.ueber + 'px'); } else console.log('ok', q, 'Seite', u.i); }
    await p.pdf({ path: path.join(__dirname, z), format: 'A4', printBackground: true, preferCSSPageSize: true });
  }
  await b.close(); process.exit(fehler ? 1 : 0);
})();
