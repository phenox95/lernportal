/* Rollenkarten der Debatte „Impfen“. Gemeinsame Quelle für alle Impfen-Präsentationen und die Handyseite (rolle/).
   Jede Rolle hat dieselben Bausteine, damit alle gleich viel haben und Argument und Beleg getrennt bleiben:
   Position, Wer bist du, 2 × (Argument + Beleg), Frage an die anderen.
   Argument = Begründung („…, weil …“). Beleg = Fakt, Zahl oder Quelle, die das Argument stützt.
   Runde 2: je Rolle zwei neue Belege, dazu ein Auftrag. */
window.IMPF_ROLLEN={
  A:{n:'Frau Wagner, Mutter',
     p:'Du bist gegen eine Impfpflicht.',
     w:'Du bist die Mutter von Leon (6 Jahre). Du liebst dein Kind und willst es schützen. Du hast von Nebenwirkungen bei Impfungen gelesen und bist unsicher.',
     args:[
       {a:'Eine Impfung ist ein Eingriff in den Körper. Darum sollen Eltern entscheiden.',
        b:'Auch Impfungen können Nebenwirkungen haben, zum Beispiel Fieber oder Schmerzen an der Einstichstelle.'},
       {a:'Eine Pflicht greift stark in die Entscheidung der Eltern ein.',
        b:'Seit dem 1. März 2020 brauchen Kinder in Kita und Schule einen Nachweis. Ohne Nachweis kann ein Bußgeld drohen.'}
     ],
     q:'Warum soll der Staat entscheiden und nicht ich?'},
  B:{n:'Dr. Kaya, Kinderärztin',
     p:'Du bist für eine Impfpflicht. Du nimmst die Sorgen der Eltern ernst.',
     w:'Du bist Kinderärztin und behandelst Kinder in einer Praxis. Du siehst, wie Infektionen verlaufen.',
     args:[
       {a:'Masern sind keine harmlose Kinderkrankheit. Darum ist Schutz wichtig.',
        b:'Masern sind sehr ansteckend. Sie können zu Mittelohrentzündung, Lungenentzündung und selten zu einer Gehirnentzündung führen.'},
       {a:'Die Impfung ist sicher und wirksam. Darum ist die Gefahr durch Masern größer als die Gefahr durch die Impfung.',
        b:'Zwei Impfungen schützen sehr gut vor Masern. Impfreaktionen sind meist leicht und kurz, zum Beispiel Rötung oder Fieber. Schwere Nebenwirkungen sind sehr selten.'}
     ],
     q:'Was würden Sie sagen, wenn ein ungeimpftes Kind ein krankes Kind ansteckt?'},
  C:{n:'Herr Brandt, Vater von Mia',
     p:'Du bist für eine Impfpflicht.',
     w:'Deine Tochter Mia ist 8 Jahre alt. Wegen ihrer Behandlung ist ihr Immunsystem sehr schwach. Sie geht gern zur Schule. Du hast Angst, dass sie sich ansteckt.',
     args:[
       {a:'Mia kann sich nicht selbst schützen. Sie ist auf andere angewiesen.',
        b:'Mia darf im Moment nicht gegen Masern geimpft werden. Eine Masernerkrankung kann für sie sehr gefährlich sein.'},
       {a:'Die Entscheidung gegen eine Impfung betrifft nicht nur das eigene Kind.',
        b:'Wenn viele Kinder geimpft sind, erreicht der Erreger Mia kaum (Herdenimmunität). Dafür sind laut RKI etwa 95 % Geimpfte nötig.'}
     ],
     q:'Welche Verantwortung haben wir für Menschen, die sich nicht selbst schützen können?'},
  D:{n:'Herr Okafor, Jurist',
     p:'Du wägst ab. Du bist für keine Seite.',
     w:'Du bist Jurist und kennst dich mit Gesetzen aus. Du bewertest beide Seiten und ordnest ein.',
     args:[
       {a:'Der Staat darf die Gesundheit vieler Menschen schützen.',
        b:'Das Masernschutzgesetz gilt seit dem 1. März 2020. Kinder in Kita und Schule brauchen einen Nachweis: Impfung, Immunität oder ärztliches Attest, dass sie nicht geimpft werden dürfen.'},
       {a:'Der Staat muss dabei die Selbstbestimmung achten und darf nicht zu weit gehen.',
        b:'Eine Zwangsimpfung gibt es nicht. Ein Gesetz muss verhältnismäßig sein: Mildere Mittel, zum Beispiel mehr Aufklärung, müssen geprüft werden.'}
     ],
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
      '.rk-satz{font-size:.9em;margin-top:.7em}.mcard{padding:16px 34px!important}.mcard .rk{font-size:.9em}.mcard .rk-satz{display:none}.mcard h2{font-size:30px!important;margin:0 0 8px!important}';
    document.head.appendChild(st);
  }
  h+='<div class="rk">';
  if(runde2){
    h+='<p class="rk-pos">Deine Rollenkarte aus Runde 1 bleibt gültig. Hier kommen neue Belege.</p>';
    r.belege.forEach(function(b,i){h+='<p class="rk-bel" style="margin-left:0"><span class="rk-tag">Neuer Beleg '+(i+1)+'</span>'+b+'</p>';});
    h+='<p class="rk-wer"><b>Dein Auftrag:</b> <b>Entscheide:</b> Stützt der Beleg eines deiner Argumente aus Runde 1 oder schwächt er es? <b>Formuliere</b> dann ein Argument mit dem Beleg.</p>';
  }else{
    h+='<p class="rk-pos"><b>Deine Position:</b> '+r.p+'</p><p class="rk-wer">'+r.w+'</p>';
    r.args.forEach(function(x,i){h+='<div class="rk-paar"><p class="rk-arg"><span class="rk-tag">Argument '+(i+1)+'</span>'+x.a+'</p><p class="rk-bel"><span class="rk-tag">Beleg '+(i+1)+'</span>'+x.b+'</p></div>';});
  }
  h+='<p class="rk-frage">Deine Frage an die anderen: '+r.q+'</p>';
  h+='<p class="rk-satz"><b>So sprichst du:</b> „Ich finde …, weil … (Argument). Das zeigt: … (Beleg).“</p></div>';
  return {titel:'Rolle '+k+(runde2?' · Runde 2: ':': ')+r.n,html:h};
};
