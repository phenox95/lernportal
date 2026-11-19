/* Erzeugt geografie/klasse-9/klimawandel/mini-cop31/arbeitsblatt-rollenmappe.pdf aus assets/rollen.js.
   Aufruf: node tools/mini-cop31-rollenmappe.js   (Playwright mit Chromium nötig, Andika liegt in assets/fonts/)
   Layout nach den Druckregeln: Andika 9 pt, Zeilenabstand 1,3, Rand 10 mm, nur Schwarz/Weiß/Grau.
   Pro Rolle zwei Seiten: Seite 1 Infos, Seite 2 Arbeit. Bei Überlauf bricht das Skript ab (nie Schrift verkleinern). */
const fs=require('fs'),path=require('path'),vm=require('vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'geografie/klasse-9/klimawandel/mini-cop31');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(dir,'assets/rollen.js'),'utf8'),ctx);
const W=ctx.window;
const QR=(()=>{const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'assets/js/qrcode.js'),'utf8')+';this.qrcode=qrcode;',c);return c.qrcode})();
const BASE='https://phenox95.github.io/lernportal/geografie/klasse-9/klimawandel/mini-cop31/rolle/?r=';
function qrsvg(u){const q=QR(0,'M');q.addData(u);q.make();const n=q.getModuleCount();let r='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(q.isDark(y,x))r+=`<rect x="${x+2}" y="${y+2}" width="1" height="1"/>`;return `<svg viewBox="0 0 ${n+4} ${n+4}" shape-rendering="crispEdges"><rect width="${n+4}" height="${n+4}" fill="#fff"/><g fill="#000">${r}</g></svg>`}
const md=t=>t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const font=f=>'file://'+path.join(root,'assets/fonts',f);
const lines=n=>Array.from({length:n},()=>'<div class="lin"></div>').join('');
function einschaetzung(k,r){if(k===5)return '';let h='<h2>Eure Einschätzung der Varianten</h2><div class="hint">Schritt 1: Was bedeutet die Variante für euer Land? Nenne einen Beleg (zum Beispiel M-R1, Z. 3). Schritt 2: Passt sie zu euch (✓), geht sie noch (±) oder sagt ihr Nein (✗)?</div>';
 [1,2].forEach(a=>{h+=`<table class="ein"><caption>${W.COP_TITEL[a].split(' (')[0]}</caption><tr><th>Var.</th><th>Was steht darin?</th><th>Was bedeutet das für uns? (Beleg)</th><th>✓</th><th>±</th><th>✗</th></tr>`;
  ['A','B','C'].forEach(v=>{h+=`<tr><td><b>${v}</b></td><td>${W.COP_VAR[a][v]}</td><td></td><td></td><td></td><td></td></tr>`});h+='</table>'});return h}
const tisch=W.COP_TISCH.map(t=>`<span><b>${t[0]}</b>: ${t[1]}</span>`).join('');
function seite1(k,r){
 const infos=r.infos.map((f,i)=>`<div class="mat"><div class="mk">M-R${i+1} · ${f.t}</div>${f.z.map((z,j)=>`<div class="zl"><i>${(j+1)%5===0?j+1:''}</i><span>${z}</span></div>`).join('')}<div class="qu">Quelle: ${f.q}</div></div>`).join('');
 return `<div class="seite"><div class="kopf"><span>Geografie · Mini-COP31 · Rollenmappe</span><span>Name: ______________ Klasse: ____ Niveau: ●●○</span></div>
 <div class="titel"><div><h1>${k} ${r.n}</h1><div class="st">${r.s}</div></div><div class="qr">${qrsvg(BASE+k)}<small>Auf dem Handy lesen</small></div></div>
 <div class="box"><b>Dein Auftrag:</b> ${r.auftrag}</div>
 <h2>Infos zu eurer Rolle</h2><div class="hint">Hier stehen Fakten. Die Argumente schreibt ihr selbst. Markiere in jedem Absatz 1 bis 2 Schlüsselwörter.</div>
 ${infos}
 <div class="zwei"><div class="box"><b>Satzbausteine</b><br>${r.sb.join('<br>')}</div><div class="box"><b>Wer sitzt noch am Tisch?</b><br>${tisch}</div></div></div>`}
function seite2(k,r){
 const nl=[1,1,1,1,2,1];
 const tab=(k===5)?`<table class="beo"><tr><th>Gruppe</th><th>Das will sie</th><th>Dazu sagt sie Nein</th></tr>${[1,2,3,4].map(i=>`<tr><td>${i} ${W.COP_ROLLEN[i].n}</td><td></td><td></td></tr>`).join('')}</table>`:
  (k===6)?`<table class="beo"><tr><th>Gruppe</th><th>Setzt sich durch?</th><th>Gibt nach?</th><th>Sagt Nein?</th></tr>${[1,2,3,4].map(i=>`<tr><td>${i} ${W.COP_ROLLEN[i].n}</td><td></td><td></td><td></td></tr>`).join('')}</table>`:'';
 const a=r.aufg.map((x,i)=>{const t=(k===5&&i===2||k===6&&i===3)?tab:lines(x.opt?1:(k===6&&i===4?1:nl[i]));
  return `<div class="auf"><div class="ar"><span class="cb"></span><b>R${i+1}</b><span>${md(x.t)}${x.opt?' (Erweiterung)':''}</span><span class="lv">${x.n}</span></div>${t}</div>`}).join('');
 return `<div class="seite"><div class="kopf"><span>Geografie · Mini-COP31 · Rollenmappe</span><span>${k} ${r.n} · Seite 2</span></div>
 ${einschaetzung(k,r)}<h2>Das erarbeitet ihr selbst</h2><div class="hint">Das hilft dir bei Aufgabe 1 bis 3 auf dem Arbeitsblatt. Schreibe in ganzen Sätzen.</div>${a}
 ${k<=4?'<div class="hint"><b>Abstimmung:</b> Scannt den Code auf Seite 1. Auf der Handyseite tragt ihr euer Ergebnis ein und zeigt der Lehrkraft den neuen Code.</div>':''}
 ${k===5?'<div class="hint"><b>Rückkanal:</b> Schreibt eure Kompromiss-Sätze auf der Handyseite (Code auf Seite 1) und zeigt der Lehrkraft den neuen Code.</div>':''}</div>`}
const css=`@font-face{font-family:Andika;src:url(${font('andika-regular.woff2')}) format("woff2");font-weight:400}@font-face{font-family:Andika;src:url(${font('andika-bold.woff2')}) format("woff2");font-weight:700}
@page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}
body{font-family:Andika,Verdana,Arial,sans-serif;color:#111;font-size:9pt;line-height:1.3;text-align:left;hyphens:manual;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.seite{width:210mm;height:296mm;padding:10mm;background:#fff;overflow:hidden;page-break-after:always}.seite:last-child{page-break-after:auto}
.kopf{display:flex;justify-content:space-between;border-bottom:1.5pt solid #111;padding-bottom:2mm;margin-bottom:3mm;font-weight:700}
.titel{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2mm}h1{font-size:18pt;margin:0;line-height:1.15}.st{display:inline-block;border:1pt solid #111;border-radius:4mm;padding:0 3mm;margin-top:1mm}
.qr{width:24mm;text-align:center}.qr svg{display:block;width:24mm;height:24mm}.qr small{font-size:7pt}
h2{font-size:11pt;margin:3mm 0 1mm}.box{border:1.5pt solid #111;padding:2mm 3mm;margin:2mm 0;background:#efefef}.hint{margin:0 0 2mm}
table{width:100%;border-collapse:collapse;margin:1mm 0 2mm}caption{text-align:left;font-weight:700;padding-bottom:.5mm}th,td{border:1pt solid #111;padding:.8mm 2mm;text-align:left;vertical-align:top}th{background:#efefef}td.w{font-weight:700}td.n{font-weight:700;border:2pt solid #111}
.mat{border:1pt solid #111;padding:2mm 3mm;margin:0 0 2.5mm}.mk{font-weight:700;margin-bottom:1mm}
.zl{display:grid;grid-template-columns:6mm 1fr}.zl i{font-style:normal;font-size:8pt}.qu{font-size:8pt;margin-top:1mm}
.auf{margin-bottom:2mm}.ar{display:grid;grid-template-columns:5mm 7mm 1fr 10mm;gap:1mm}.cb{width:4mm;height:4mm;border:1pt solid #111;margin-top:.7mm}.lv{font-weight:700;text-align:right}
.lin{height:9mm;border-bottom:.7pt solid #777}.zwei{display:grid;grid-template-columns:1fr 1.4fr;gap:3mm}.zwei .box span{display:block}
.ein td{height:10mm}.ein td:nth-child(2){width:84mm}.ein th:nth-child(1),.ein td:nth-child(1){width:9mm}.ein th:nth-child(n+4),.ein td:nth-child(n+4){width:7mm;text-align:center}.beo td{height:7mm}.beo th,.beo td{width:auto}`;
function karte(k,r){return `<div class="rk"><div class="rkh"><b>${k} ${r.n}</b><span>${r.s}</span></div><div><b>Wer wir sind:</b> ${r.wer}</div><div class="rkk"><b>${r.kopf}</b></div><ul>${r.liste.map(x=>`<li>${x}</li>`).join('')}</ul>${r.ziel?`<div><b>Unser Ziel:</b> ${r.ziel}</div>`:''}<div class="rkq"><div class="t"><b>Auf dem Handy lesen:</b><br>QR-Code scannen. Du kannst dir die Karte vorlesen lassen.</div><div class="q" role="img" aria-label="QR-Code zur Rollenkarte ${k}">${qrsvg(BASE+k)}</div></div></div>`}
const csskarten=`.kseite{width:210mm;height:296mm;padding:10mm;background:#fff;overflow:hidden}.kk{font-size:8pt;margin-bottom:2mm}.kgrid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,87.9mm);gap:3mm}
.rk{position:relative;border:1pt dashed #111;padding:3mm 3.5mm;font-size:9pt;line-height:1.3}.rkh{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1.5pt solid #111;margin-bottom:2mm;font-size:10.5pt}.rkh span{font-size:8pt}
.rk ul{margin:1mm 0 1mm;padding-left:4mm}.rkk{margin-top:2mm}.rkq{position:absolute;left:3.5mm;right:3.5mm;bottom:3mm;display:flex;justify-content:space-between;align-items:flex-end}.rkq .t{width:55mm;font-size:8pt}.rkq .q{width:23mm;height:23mm}.rkq svg{display:block;width:100%;height:100%}`;
(async()=>{
 const html=`<!doctype html><meta charset="utf-8"><style>${css}</style>`+[1,2,3,4,5,6].map(k=>seite1(k,W.COP_ROLLEN[k])+seite2(k,W.COP_ROLLEN[k])).join('');
 fs.writeFileSync(path.join(__dirname,'.rollenmappe.html'),html);
 const kh=`<!doctype html><meta charset="utf-8"><style>${css}${csskarten}</style><div class="kseite"><div class="kk">Rollenkarten · Ausschneiden · Die Rollen sind vereinfachte Positionen. Sie sind keine Meinung der Lehrkraft oder der Klasse.</div><div class="kgrid">${[1,2,3,4,5,6].map(k=>karte(k,W.COP_ROLLEN[k])).join('')}</div></div>`;
 fs.writeFileSync(path.join(__dirname,'.rollenkarten.html'),kh);
 const b=await chromium.launch(),p=await b.newPage();
 await p.goto('file://'+path.join(__dirname,'.rollenmappe.html'));await p.evaluate(()=>document.fonts.ready);
 const ue=await p.evaluate(()=>[...document.querySelectorAll('.seite')].map((s,i)=>({i:i+1,frei:s.clientHeight-s.scrollHeight})));
 const bad=ue.filter(x=>x.frei<0);console.log('Reserve je Seite (px):',ue.map(x=>x.frei).join(' '));
 if(bad.length){console.error('Überlauf auf Seite',bad.map(x=>x.i).join(', '),': Text kürzen oder Seite anlegen, nie Schrift verkleinern.');await b.close();process.exit(1)}
 await p.pdf({path:path.join(dir,'arbeitsblatt-rollenmappe.pdf'),preferCSSPageSize:true,printBackground:true});
 await p.goto('file://'+path.join(__dirname,'.rollenkarten.html'));await p.evaluate(()=>document.fonts.ready);
 const kue=await p.evaluate(()=>{const s=document.querySelector('.kseite');return[...document.querySelectorAll('.rk')].map(c=>{const q=c.querySelector('.rkq');const last=c.querySelector('ul,div:not(.rkq):last-of-type');return q.getBoundingClientRect().top-[...c.children].filter(x=>!x.classList.contains('rkq')).pop().getBoundingClientRect().bottom})});
 console.log('Abstand Text zu QR je Karte (px):',kue.map(x=>Math.round(x)).join(' '));
 if(kue.some(x=>x<4)){console.error('Rollenkarte zu voll: Text kürzen.');await b.close();process.exit(1)}
 await p.pdf({path:path.join(__dirname,'.rollenkarten.pdf'),preferCSSPageSize:true,printBackground:true});
 await b.close();fs.unlinkSync(path.join(__dirname,'.rollenmappe.html'));fs.unlinkSync(path.join(__dirname,'.rollenkarten.html'));console.log('ok: Mappe fertig, Rollenkarten-Seite in tools/.rollenkarten.pdf');
})();
