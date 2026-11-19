/* Erzeugt die Arbeitsblätter der Mini-COP31:
   - tools/.ab-druck.pdf (Seite 1 und 2 des Druck-Arbeitsblatts, wird mit tools/mini-cop31-karten-einbauen.py zu arbeitsblatt-1.pdf)
   - geografie/klasse-9/klimawandel/mini-cop31/arbeitsblatt-handy.pdf (Fassung für Gruppen, die mit Handys arbeiten, 3 Seiten)
   Aufruf: node tools/mini-cop31-arbeitsblaetter.js   (Playwright mit Chromium, Andika in assets/fonts/)
   Layout: Andika 9 pt, Zeilenabstand 1,3, Rand 10 mm, nur Schwarz/Weiß/Grau. Bei Überlauf bricht das Skript ab. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'geografie/klasse-9/klimawandel/mini-cop31');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(dir,'assets/rollen.js'),'utf8'),ctx);const W=ctx.window;
const QR=(()=>{const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'assets/js/qrcode.js'),'utf8')+';this.qrcode=qrcode;',c);return c.qrcode})();
const BASE='https://phenox95.github.io/lernportal/geografie/klasse-9/klimawandel/mini-cop31/rolle/';
function qrsvg(u){const q=QR(0,'M');q.addData(u);q.make();const n=q.getModuleCount();let r='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(q.isDark(y,x))r+=`<rect x="${x+2}" y="${y+2}" width="1" height="1"/>`;return `<svg viewBox="0 0 ${n+4} ${n+4}" shape-rendering="crispEdges"><rect width="${n+4}" height="${n+4}" fill="#fff"/><g fill="#000">${r}</g></svg>`}
const font=f=>'file://'+path.join(root,'assets/fonts',f);
const lines=n=>Array.from({length:n},()=>'<div class="lin"></div>').join('');
const z=(arr)=>arr.map((t,i)=>`<div class="zl"><i>${(i+1)%5===0?i+1:''}</i><span>${t}</span></div>`).join('');
const kopf=(l,r)=>`<div class="kopf"><span>${l}</span><span>${r||'Name: ______________ Klasse: ____ Niveau: ●●○'}</span></div>`;
const aufg=(nr,t,n,extra)=>`<div class="auf"><div class="ar"><span class="cb"></span><b>${nr}</b><span>${t}</span><span class="lv">${n}</span></div>${extra||''}</div>`;
const M1=['Fast 200 Staaten schicken Delegationen zur COP.','Eine Delegation ist eine Gruppe, die ein Land vertritt.','Die Delegationen verhandeln über Anträge.','Ein Antrag ist ein Vorschlag für einen Satz im Beschluss.','Ein Beschluss gilt nur, wenn alle zustimmen. Das heißt Konsens.','Ein Land kann einen Satz mit „Nein“ stoppen.','Deshalb suchen die Delegationen einen Kompromiss.','Nicht alle am Tisch dürfen abstimmen: Die Präsidentschaft leitet, Beobachter wie Umweltorganisationen dürfen reden. Beide haben keine Stimme.'];
const m1=()=>`<div class="mat"><div class="mk">M1 So entscheidet eine Klimakonferenz (COP)</div>${z(M1)}<div class="qu">Quelle: nach Germanwatch (2026), vereinfacht</div></div>`;
const M2=[`<b>${W.COP_TITEL[1]}</b>`,...['A','B','C'].map(v=>`${v} ${W.COP_VAR[1][v]}`),`<b>${W.COP_TITEL[2]}</b>`,...['A','B','C'].map(v=>`${v} ${W.COP_VAR[2][v]}`)];
const m2=()=>`<div class="mat"><div class="mk">M2 Eure Anträge bei der Mini-COP</div>${z(M2)}</div>`;
const M3=['Am Montag (16.11.) lag ein Entwurf mit 18 Seiten vor.','Er nannte fossile Brennstoffe zweimal und wollte sie begrenzen.','Am Donnerstag (19.11.) kam ein neuer Entwurf mit 9 Seiten.','Fossile Brennstoffe kommen darin nicht mehr vor.','Der Text nennt weiter mehr Strom (Elektrifizierung) und nationale Energiepläne.','Jedes Land darf seinen eigenen Weg wählen.','Greenpeace kritisiert: Der Ausstieg aus fossilen Energien fehlt.','Australien leitet die Verhandlungen. Es sagt: Der erste Entwurf war zu breit.'];
const m3=()=>`<div class="mat"><div class="mk">M3 Der Entwurf der echten COP31 (Stand: 19.11.2026)</div>${z(M3)}<div class="qu">Quelle: Reuters und ORF, 19.11.2026, vereinfacht</div></div>`;
const wortspeicher=`<div class="box"><b>Wortspeicher</b><br>De-le-ga-ti-on · An-trag · Kon-sens<br>Kom-pro-miss · Ab-stim-mung<br>Ent-hal-tung · Be-schluss · Ent-wurf</div>`;
const frage=`<div class="box"><b>Unsere Frage für heute:</b>${lines(2)}</div>`;
const tabelleEin=()=>{let h='<div class="hint">Trage ein: Passt die Variante zu euch (✓), geht sie noch (±) oder sagt ihr Nein (✗)? Begründe mit einem Beleg.</div>';
 [1,2].forEach(a=>{h+=`<table class="ein"><caption>${W.COP_TITEL[a].split(' (')[0]}</caption><tr><th>Var.</th><th>Was steht darin?</th><th>✓</th><th>±</th><th>✗</th><th>Begründung mit Beleg</th></tr>`;['A','B','C'].forEach(v=>{h+=`<tr><td><b>${v}</b></td><td>${W.COP_VAR[a][v]}</td><td></td><td></td><td></td><td></td></tr>`});h+='</table>'});return h};
const auswertung=(handy)=>`<div class="seite">${kopf('Geografie · Klimawandel und Klimaschutz · Auswertung')}<h1>Mini-COP31: Wir werten aus</h1>
 ${aufg('4','<b>Trage</b> das Ergebnis eurer Abstimmung ein. Es zählen nur die 4 stimmberechtigten Gruppen.','E',`<table class="erg"><tr><th>Antrag</th><th>Variante</th><th>Ja (von 4)</th><th>Nein</th><th>Enthaltung</th><th>angenommen?</th></tr><tr><td>1 Kohle, Öl, Gas</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>2 Geld</td><td></td><td></td><td></td><td></td><td></td></tr></table>
 <div class="box"><b>Wer hat eine Stimme?</b> Stimmberechtigt: 1 Europäische Union, 2 Ölförderland, 3 Inselstaat, 4 Großes Schwellenland. Dabei, aber ohne Stimme: 5 Präsidentschaft (leitet), 6 Umweltorganisation (Beobachter). Sie zählen nicht mit.${handy?'<br><b>Mit Handy:</b> Gruppen 1 bis 4 tragen ihre Stimmen auf der Handyseite ein und zeigen den Ergebnis-Code.':''}</div>`)}
 ${m3()}
 ${aufg('5','<b>Vergleiche</b> euren Beschluss zu Antrag 1 mit dem Entwurf vom Donnerstag.','F',`<table class="erg"><tr><th></th><th>Unser Beschluss</th><th>Entwurf (Do. 19.11.)</th></tr><tr><td>Kohle, Öl, Gas</td><td></td><td></td></tr><tr><td>mehr Strom</td><td></td><td></td></tr></table>`)}
 ${aufg('6','<b>Erkläre</b>, warum ein Satz zu fossilen Energien im Konsens schnell verschwinden kann.','F',lines(2))}
 ${aufg('7','<b>Beurteile</b>, ob die COP31 ein Erfolg ist. <b>Nenne</b> dafür zwei Kriterien.','G',lines(3))}
 <div class="zwei"><div class="box"><b>Kriterien</b><br>Bleibt das 1,5-Grad-Ziel geschützt?<br>Haben alle zugestimmt?<br>Hilft der Text armen Ländern?</div><div class="box"><b>Satzbausteine</b><br>Ich beurteile die COP31 als …, weil …<br>Dafür spricht …<br>Dagegen spricht …</div></div></div>`;
const druck1=`<div class="seite">${kopf('Geografie · Klimawandel und Klimaschutz · Vorbereitung')}<h1>Mini-COP31: Wir verhandeln</h1>${frage}${m1()}${m2()}
 ${aufg('1','<b>Nenne</b> zwei Dinge, die deiner Rolle wichtig sind. (Rollenkarte)','E–F',lines(2))}
 ${aufg('2','<b>Beurteile</b>, welche Variante deine Gruppe bei Antrag 1 und bei Antrag 2 am besten findet. <b>Begründe</b> mit einem Beleg aus der Rollenmappe (M-R1 bis M-R3). Nutze deine Einschätzungstabelle.','F',lines(3))}
 ${aufg('3','<b>Entwickle</b> einen Kompromiss-Satz, dem eine andere Gruppe zustimmen kann.','G',lines(2))}
 <div class="zwei">${wortspeicher}<div class="box"><b>Satzbausteine</b><br>Wir halten Variante … für passend, weil …<br>Wir sagen Nein zu …, weil …<br>Wir können zustimmen, wenn …</div></div></div>`;
const handy1=`<div class="seite">${kopf('Geografie · Klimawandel und Klimaschutz · Vorbereitung mit Handy')}<h1>Mini-COP31: Wir verhandeln</h1>${frage}
 <div class="box hb"><div class="qr">${qrsvg(BASE)}</div><div><b>So arbeitet deine Gruppe mit dem Handy</b><br>1 Scanne den Code. Tippe die Nummer eurer Rolle.<br>2 Lies Auftrag und Infos (M-R1 bis M-R3). Du kannst dir den Text vorlesen lassen.<br>3 Bearbeite auf der Handyseite die Aufgaben R1 bis R5. Schreibe die Ergebnisse hier auf das Blatt.<br><br>Unsere Rolle: Nr. ____ ______________________</div></div>
 ${m1()}${m2()}${wortspeicher}</div>`;
const handy2=`<div class="seite">${kopf('Geografie · Klimawandel und Klimaschutz · Vorbereitung mit Handy')}<h1>Eure Einschätzung</h1>${tabelleEin()}
 ${aufg('1','<b>Nenne</b> zwei Dinge, die deiner Rolle wichtig sind. (Handyseite)','E–F',lines(2))}
 ${aufg('2','<b>Beurteile</b>, welche Variante deine Gruppe bei Antrag 1 und bei Antrag 2 am besten findet. <b>Begründe</b> mit einem Beleg aus M-R1 bis M-R3. Nutze die Tabelle.','F',lines(3))}
 ${aufg('3','<b>Entwickle</b> einen Kompromiss-Satz, dem eine andere Gruppe zustimmen kann. <b>Lege</b> eure rote Linie fest: Bei welchem Satz sagt ihr Nein?','G',lines(3))}
 <div class="box"><b>Satzbausteine</b><br>Wir halten Variante … für passend, weil …<br>Wir sagen Nein zu …, weil …<br>Wir können zustimmen, wenn …</div></div>`;
const css=`@font-face{font-family:Andika;src:url(${font('andika-regular.woff2')}) format("woff2");font-weight:400}@font-face{font-family:Andika;src:url(${font('andika-bold.woff2')}) format("woff2");font-weight:700}
@page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}
body{font-family:Andika,Verdana,Arial,sans-serif;color:#111;font-size:9pt;line-height:1.3;text-align:left;hyphens:manual;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.seite{width:210mm;height:296mm;padding:10mm;background:#fff;overflow:hidden;page-break-after:always}.seite:last-child{page-break-after:auto}
.kopf{display:flex;justify-content:space-between;border-bottom:1.5pt solid #111;padding-bottom:2mm;margin-bottom:3mm;font-weight:700}
h1{font-size:16pt;margin:0 0 2mm;line-height:1.15}.box{border:1.5pt solid #111;padding:2mm 3mm;margin:2mm 0;background:#efefef}.hint{margin:0 0 2mm}
table{width:100%;border-collapse:collapse;margin:1mm 0 2mm}caption{text-align:left;font-weight:700;padding-bottom:.5mm}th,td{border:1pt solid #111;padding:.8mm 2mm;text-align:left;vertical-align:top}th{background:#efefef}
.ein td{height:9mm}.ein td:nth-child(2){width:62mm}.ein th:nth-child(n+3):nth-child(-n+5),.ein td:nth-child(n+3):nth-child(-n+5){width:7mm;text-align:center}
.erg td{height:8mm}
.mat{border:1pt solid #111;padding:2mm 3mm;margin:0 0 2.5mm}.mk{font-weight:700;margin-bottom:1mm}.zl{display:grid;grid-template-columns:6mm 1fr}.zl i{font-style:normal;font-size:8pt}.qu{font-size:8pt;margin-top:1mm}
.auf{margin:2mm 0}.ar{display:grid;grid-template-columns:5mm 6mm 1fr 10mm;gap:1mm}.cb{width:4mm;height:4mm;border:1pt solid #111;margin-top:.7mm}.lv{font-weight:700;text-align:right}
.lin{height:9mm;border-bottom:.7pt solid #777}.zwei{display:grid;grid-template-columns:1fr 1.2fr;gap:3mm}
.hb{display:grid;grid-template-columns:26mm 1fr;gap:3mm;align-items:center}.hb .qr{width:26mm;height:26mm}.hb .qr svg{display:block;width:100%;height:100%}`;
(async()=>{
 const b=await chromium.launch(),p=await b.newPage();
 async function bau(name,body,out){const f=path.join(__dirname,'.'+name+'.html');fs.writeFileSync(f,`<!doctype html><meta charset="utf-8"><style>${css}</style>${body}`);
  await p.goto('file://'+f);await p.evaluate(()=>document.fonts.ready);
  const fr=await p.evaluate(()=>[...document.querySelectorAll('.seite')].map(s=>s.clientHeight-s.scrollHeight));
  // freier Platz: letzte Kind-Unterkante gegen Seitenende
  const rest=await p.evaluate(()=>[...document.querySelectorAll('.seite')].map(s=>{const k=[...s.children].pop().getBoundingClientRect().bottom;return Math.round(s.getBoundingClientRect().bottom-parseFloat(getComputedStyle(s).paddingBottom)-k)}));
  console.log(name,'Rest je Seite (px, negativ = Überlauf):',rest.join(' '));
  if(fr.some(x=>x<0)||rest.some(x=>x<0)){console.error('Überlauf in',name,': Text kürzen oder Seite anlegen, nie Schrift verkleinern.');await b.close();process.exit(1)}
  await p.pdf({path:out,preferCSSPageSize:true,printBackground:true});fs.unlinkSync(f)}
 await bau('ab-druck',druck1+auswertung(false),path.join(__dirname,'.ab-druck.pdf'));
 await bau('ab-handy',handy1+handy2+auswertung(true),path.join(dir,'arbeitsblatt-handy.pdf'));
 await b.close();console.log('ok');
})();
