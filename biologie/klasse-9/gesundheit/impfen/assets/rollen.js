/* Rollenkarten der Debatte „Impfen“. Gemeinsame Quelle für alle Impfen-Präsentationen und die Handyseite (rolle/).
   Die Karten geben bewusst KEINE fertigen Argumente vor. Die SuS müssen
   1. aus dem gemeinsamen Materialpool (Belege M1–M8) passende Belege auswählen,
   2. zu jedem Beleg selbst ein Argument formulieren („…, weil …“),
   3. einen Beleg der Gegenseite nennen und damit umgehen.
   Argument = Begründung. Beleg = Fakt, Zahl oder Quelle, die ein Argument stützt.
   Basis-Hilfe: „Tipp“ nennt passende Belege. Runde 2: je Rolle zwei neue Belege und ein Auftrag. */
window.IMPF_POOL=[
  'Masern sind sehr ansteckend. Sie können zu Mittelohrentzündung, Lungenentzündung und selten zu einer Gehirnentzündung führen.',
  'Auch Impfungen können Nebenwirkungen haben, zum Beispiel Fieber oder Schmerzen an der Einstichstelle.',
  'Fall Mia (8 Jahre, fiktiv): Wegen ihrer Behandlung darf sie im Moment nicht gegen Masern geimpft werden. Eine Masernerkrankung kann für sie sehr gefährlich sein.',
  'Das Masernschutzgesetz gilt seit dem 1. März 2020. Kinder in Kita und Schule brauchen einen Nachweis: Impfung, Immunität oder ärztliches Attest. Ohne Nachweis kann ein Bußgeld drohen.',
  'Eine Zwangsimpfung gibt es nicht. Ein Gesetz muss verhältnismäßig sein: Mildere Mittel, zum Beispiel mehr Aufklärung, müssen geprüft werden.',
  'Um Masern auszurotten, braucht man laut RKI etwa 95 % Geimpfte. Dann sind auch Menschen geschützt, die nicht geimpft werden können (Herdenimmunität).',
  'Zwei Impfungen schützen sehr gut vor Masern.',
  'Impfreaktionen sind meist leicht und kurz, zum Beispiel Rötung oder Fieber. Schwere Nebenwirkungen sind sehr selten.'
];
window.IMPF_ROLLEN={
  A:{n:'Frau Wagner, Mutter',
     p:'Du bist gegen eine Impfpflicht.',
     w:'Du bist die Mutter von Leon (6 Jahre). Du liebst dein Kind und willst es schützen. Du hast von Nebenwirkungen bei Impfungen gelesen und bist unsicher.',
     wichtig:'Eltern sollen über ihr Kind entscheiden.',
     tipp:'M2, M4 und M5 passen zu deiner Position.',
     satz:['Eltern sollen entscheiden, weil …','Eine Pflicht ist problematisch, weil …'],
     q:'Warum soll der Staat entscheiden und nicht ich?'},
  B:{n:'Dr. Kaya, Kinderärztin',
     p:'Du bist für eine Impfpflicht. Du nimmst die Sorgen der Eltern ernst.',
     w:'Du bist Kinderärztin und behandelst Kinder in einer Praxis. Du siehst, wie Infektionen verlaufen.',
     wichtig:'Kinder sollen gesund bleiben.',
     tipp:'M1, M7 und M8 passen zu deiner Position.',
     satz:['Masern sind nicht harmlos, weil …','Die Impfung ist verantwortbar, weil …'],
     q:'Was würden Sie sagen, wenn ein ungeimpftes Kind ein krankes Kind ansteckt?'},
  C:{n:'Herr Brandt, Vater von Mia',
     p:'Du bist für eine Impfpflicht.',
     w:'Deine Tochter Mia ist 8 Jahre alt. Wegen ihrer Behandlung ist ihr Immunsystem sehr schwach. Sie geht gern zur Schule. Du hast Angst, dass sie sich ansteckt.',
     wichtig:'Menschen, die sich nicht selbst schützen können, brauchen Schutz.',
     tipp:'M1, M3 und M6 passen zu deiner Position.',
     satz:['Mia braucht den Schutz der anderen, weil …','Die Entscheidung gegen eine Impfung betrifft auch andere, weil …'],
     q:'Welche Verantwortung haben wir für Menschen, die sich nicht selbst schützen können?'},
  D:{n:'Herr Okafor, Jurist',
     p:'Du wägst ab. Du bist für keine Seite.',
     w:'Du bist Jurist und kennst dich mit Gesetzen aus. Du bewertest beide Seiten und ordnest ein.',
     wichtig:'Beide Seiten haben gute Gründe. Das Gesetz muss verhältnismäßig sein.',
     tipp:'Für eine Pflicht sprechen M1, M4 und M6. Dagegen sprechen M2 und M5.',
     satz:['Der Staat darf eingreifen, weil …','Der Staat darf nicht zu weit gehen, weil …'],
     auf:['Wähle zwei Belege: einen, der für eine Pflicht spricht, und einen, der dagegen spricht.',
          'Formuliere zu jedem Beleg ein Argument.',
          'Begründe, welche Seite dich mehr überzeugt.'],
     q:'Wie weit darf der Staat in die Entscheidung von Eltern eingreifen?'}
};

/* Zusatzkarten Runde 2 (Folgestunde „Fortsetzung USA“). Handyseite: rolle/?r=A&s=2 */
window.IMPF_ROLLEN_2={
  A:{n:'Frau Wagner, Mutter',
     belege:['In den USA waren rund 3 % der Erkrankten einmal und rund 4 % zweimal geimpft (Stand Juli).',
             'Etwa 11 % der Erkrankten kamen ins Krankenhaus (gemeldete Zahlen, sie ändern sich).'],
     q:'Warum erkranken auch Geimpfte? Und was bringt mir dann eine Pflicht?'},
  B:{n:'Dr. Kaya, Kinderärztin',
     belege:['96 % der Fälle in den USA 2026 waren ungeimpft oder der Impfstatus war unbekannt (CDC, bis 5.11.).',
             'Zwei Impfungen sind etwa zu 97 % wirksam.'],
     q:'Wie erklären Sie Frau Wagner, dass trotzdem fast alle Erkrankten ungeimpft waren?'},
  C:{n:'Herr Brandt, Vater von Mia',
     belege:['Ein Kind in New York ist an Masern gestorben. Es war der erste Masern-Todesfall eines Kindes im Bundesstaat seit rund 30 Jahren.',
             'Auch ein Säugling in Wisconsin ist gestorben.'],
     q:'Was würden Sie den Eltern sagen, deren Kind nicht geimpft ist?'},
  D:{n:'Herr Okafor, Jurist',
     belege:['Kindergartenkinder in den USA: Impfquote 92,4 %. Das Ziel sind 95 %.',
             'Ein Land verliert den Eliminationsstatus, wenn ein Virusstamm 12 Monate lang weitergegeben wird. Kanada und Großbritannien haben ihn verloren. Für die USA gibt es Medienberichte, die offizielle Bekanntgabe steht aus.'],
     q:'Reicht gute Aufklärung, oder braucht es mehr als Aufklärung?'}
};

/* Darstellung der Karten (Board-Fenster und Handyseite), gemeinsam, damit alles gleich aussieht.
   Argument: Rahmen mit durchgehender Linie. Beleg: gestrichelter Rahmen. Unterschied also auch ohne Farbe sichtbar. */
window.impfRolleKarte=function(k,runde2){
  var R=(runde2?window.IMPF_ROLLEN_2:window.IMPF_ROLLEN)||{},r=R[k];
  if(!r)return null;
  var h='';
  if(!document.getElementById('rk-css')){
    var st=document.createElement('style');st.id='rk-css';
    st.textContent='.rk p{margin:0 0 .5em}.rk-pos{background:var(--lg,#E8F3EC);border-radius:.6em;padding:.5em .8em}.rk-wer{margin-bottom:.7em}'+
      '.rk-paar{margin:0 0 .8em}.rk-arg,.rk-bel{padding:.4em .8em;border-radius:.6em;margin:0 0 .35em}.rk-arg{border:.18em solid var(--ink,#1A2B24);background:#fff}'+
      '.rk-bel{border:.14em dashed var(--ink,#1A2B24);margin-left:1.4em;background:var(--lg,#E8F3EC)}.rk-tag{display:inline-block;font-weight:700;margin-right:.5em;padding:0 .5em;border-radius:.4em;background:var(--ink,#1A2B24);color:#fff;font-size:.85em}'+
      '.rk-bel .rk-tag{background:#fff;color:var(--ink,#1A2B24);border:.12em solid var(--ink,#1A2B24)}.rk-frage{border:.18em solid var(--g,#0F6E56);border-radius:.6em;padding:.5em .8em;font-weight:700}'+
      '.rk-satz{font-size:.9em;margin-top:.7em}.mcard{padding:16px 34px!important}.mcard .rk{font-size:.9em}.mcard .rk-satz{display:none}.mcard h2{font-size:30px!important;margin:0 0 8px!important}'+
      '.rk-auf{margin:0 0 .6em;padding-left:1.4em}.rk-auf li{margin-bottom:.25em}.rk-tipp{margin:0 0 .6em}.rk-tipp summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}.rk-tipp p{margin:0}'+
      '@media(min-width:700px){.rk-pool{display:grid;grid-template-columns:1fr 1fr;gap:0 14px;align-items:start}}.rk-pool .rk-bel{margin-bottom:.4em}.mcard .rk-pool{font-size:.78em}';
    document.head.appendChild(st);
  }
  h+='<div class="rk">';
  if(runde2){
    h+='<p class="rk-pos">Deine Rollenkarte aus Runde 1 bleibt gültig. Hier kommen neue Belege.</p>';
    r.belege.forEach(function(b,i){h+='<p class="rk-bel" style="margin-left:0"><span class="rk-tag">Neuer Beleg '+(i+1)+'</span>'+b+'</p>';});
    h+='<p class="rk-wer"><b>Dein Auftrag:</b> <b>Entscheide:</b> Stützt der Beleg eines deiner Argumente aus Runde 1 oder schwächt er es? <b>Formuliere</b> dann ein Argument mit dem Beleg.</p>';
  }else{
    var auf=r.auf||['Wähle im Materialpool zwei Belege, die zu deiner Position passen.','Formuliere zu jedem Beleg ein Argument.','Nenne einen Beleg, der gegen dich spricht, und begründe, warum du bei deiner Position bleibst.'];
    h+='<p class="rk-pos"><b>Deine Position:</b> '+r.p+'</p><p class="rk-wer">'+r.w+'</p><p class="rk-wer"><b>Das ist dir wichtig:</b> '+r.wichtig+'</p>';
    h+='<ol class="rk-auf">'+auf.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol>';
    h+='<details class="rk-tipp"><summary>Tipp anzeigen</summary><p>'+r.tipp+'</p></details>';
    h+='<details class="rk-tipp"><summary>Zweiter Tipp: Satzanfänge</summary><ul class="rk-auf">'+r.satz.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></details>';
  }
  h+='<p class="rk-frage">Deine Frage an die anderen: '+r.q+'</p>';
  h+='<p class="rk-satz"><b>So sprichst du:</b> „Ich finde …, weil … (Argument). Das zeigt: … (Beleg).“</p></div>';
  return {titel:'Rolle '+k+(runde2?' · Runde 2: ':': ')+r.n,html:h};
};

/* Materialpool: Belege M1–M8, gestrichelt wie ein Beleg. Die SuS wählen daraus selbst aus. */
window.impfPoolKarte=function(){
  window.impfRolleKarte('A',false);   // sorgt dafür, dass die Stile geladen sind
  var h='<div class="rk rk-pool">'+window.IMPF_POOL.map(function(t,i){return '<p class="rk-bel" style="margin-left:0"><span class="rk-tag">M'+(i+1)+'</span>'+t+'</p>';}).join('')+'</div>';
  return {titel:'Materialpool: Belege M1 bis M8',html:h};
};

/* Beispiel „vom Beleg zum Argument“ (anderes Thema, damit nichts für die Debatte vorweggenommen wird) */
window.impfBeispielKarte=function(){
  window.impfRolleKarte('A',false);   // lädt die Stile
  var h='<div class="rk">'+
    '<p class="rk-pos"><b>Beispiel aus einem anderen Thema:</b> Meine Position ist: Radfahrer sollen einen Helm tragen.</p>'+
    '<p class="rk-bel" style="margin-left:0"><span class="rk-tag">1 Beleg</span>Crashtests zeigen: Ein Helm dämpft den Aufprall.</p>'+
    '<p class="rk-wer"><b>2 Frage:</b> Was folgt aus dem Beleg für meine Position?</p>'+
    '<p class="rk-arg"><span class="rk-tag">3 Argument</span>Radfahrer sollen einen Helm tragen, weil er bei einem Sturz den Kopf schützt. Das zeigen Crashtests.</p>'+
    '<p class="rk-satz"><b>So gehst du vor:</b> Lies den Beleg. Frage: Was folgt daraus für meine Position? Schreibe einen Satz mit „weil“. Nenne am Ende den Beleg.</p></div>';
  return {titel:'Vom Beleg zum Argument',html:h};
};
