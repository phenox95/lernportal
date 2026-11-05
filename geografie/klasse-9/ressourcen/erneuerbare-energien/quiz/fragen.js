/* Fragenpool "Erneuerbare Energien" (Geografie, Jg. 9)
   Typen:
     mc : Multiple Choice. o[0] ist IMMER die richtige Antwort, die Reihenfolge wird beim Spielen gemischt.
     pt : Einordnen. item = Begriff, a = Index in PT (0 erneuerbar, 1 fossil, 2 weder noch).
     rd : Wer oder was bin ich? clues = 4 Hinweise, o[0] ist die richtige Antwort.
     ff : Fakt oder Fake. a = true oder false.
   e = Erklärung nach der Antwort, s = Quelle (optional, wird als Fußnote gezeigt). */
window.ENERGIE_FRAGEN = (function () {
var PT = ["Erneuerbar","Fossil","Weder noch"];
var DATA = [
  /* Multiple Choice: erste Antwort ist richtig, wird gemischt */
  {type:"mc", q:"Was bedeutet „erneuerbar“ bei Energiequellen?",
   o:["Die Quelle wird beim Nutzen nicht aufgebraucht oder wächst schnell nach.","Die Anlage hält für immer und geht nie kaputt.","Die Energie wird wie Plastik recycelt.","Die Energie ist immer billiger als Kohle."],
   e:"Sonne, Wind, Wasser, Biomasse und Erdwärme verbrauchen sich nicht auf Dauer. Kohle, Erdöl und Erdgas sind dagegen irgendwann aufgebraucht."},
  {type:"mc", q:"Warum eignet sich die Nordsee gut für Windparks?",
   o:["Der Wind weht oft stark, Flaute ist selten.","Dort gibt es nie Wolken.","Das Meerwasser kühlt die Rotoren.","Dort fahren keine Schiffe."],
   e:"Vor der Küste laufen die Windräder über zwei Drittel der Zeit unter Volllast.", s:"planet schule, Windenergie und Wasserkraft"},
  {type:"mc", q:"Wind und Sonne liefern gerade viel zu viel Strom. Was macht ein Pumpspeicherkraftwerk?",
   o:["Es pumpt Wasser nach oben und speichert so Energie.","Es lässt Wasser nach unten fließen und erzeugt Strom.","Es schaltet alle Windräder ab.","Es verbrennt den überschüssigen Strom."],
   e:"Bei Stromüberschuss wird Wasser ins Oberbecken gepumpt. Bei Strommangel fließt es nach unten und treibt Turbinen an. Das Kraftwerk ist wie eine riesige Batterie."},
  {type:"mc", q:"Wasserkraft ist erneuerbar. Warum ist sie trotzdem nicht überall unproblematisch?",
   o:["Stauseen überfluten Land, und Menschen müssen umziehen.","Das Wasser wird beim Stromerzeugen verbraucht.","Wasserkraft funktioniert nur nachts.","Wasserkraft erzeugt besonders viel CO₂."],
   e:"Beispiel Belo Monte in Brasilien: Der Stausee überflutete Land und Regenwald. Zehntausende Menschen waren betroffen."},
  {type:"mc", q:"Wie viel Prozent des Stromverbrauchs in Deutschland deckten erneuerbare Energien 2025?",
   o:["Fast 56 Prozent","Etwa 26 Prozent","Etwa 86 Prozent","Etwa 6 Prozent"],
   e:"2025 waren es fast 56 Prozent. Wind und Sonne sind inzwischen die wichtigsten Stromlieferanten.", s:"BDEW/ZSW, Dezember 2025"},
  {type:"mc", q:"Welches Ziel gilt für den Anteil des Ökostroms am Stromverbrauch bis 2030?",
   o:["80 Prozent","60 Prozent","100 Prozent","70 Prozent"],
   e:"Bis 2030 sollen 80 Prozent des Stromverbrauchs aus erneuerbaren Energien kommen.", s:"BDEW/ZSW, Dezember 2025"},
  {type:"mc", q:"Wie viel Prozent der Energie im Verkehr stammten 2024 aus erneuerbaren Quellen?",
   o:["Nur etwa 7 Prozent","Etwa 27 Prozent","Etwa 47 Prozent","Etwa 67 Prozent"],
   e:"Beim Strom sind wir weit, beim Verkehr noch nicht. Strom ist nur ein Teil des Energiebedarfs.", s:"dpa, 2025"},
  {type:"mc", q:"Wie viel Energie schickt die Sonne an einem Tag zur Erde?",
   o:["Mehr, als alle Menschen in einem Jahr brauchen.","So viel, wie Deutschland an einem Tag verbraucht.","So viel wie ein einziges Kohlekraftwerk.","Kaum messbar wenig."],
   e:"Die Sonne ist eine riesige Energiequelle. Schwierig ist, die Energie einzufangen und zu speichern.", s:"planet schule, Sonnenenergie"},
  {type:"mc", q:"Welche Technik macht aus Sonnenlicht direkt Strom?",
   o:["Die Solarzelle (Photovoltaik)","Der Sonnenkollektor","Die Fußbodenheizung","Das Pumpspeicherkraftwerk"],
   e:"Solarzellen machen aus Licht elektrische Energie. Sonnenkollektoren erwärmen dagegen nur Wasser."},
  {type:"mc", q:"Was ist eine Dunkelflaute?",
   o:["Eine Zeit mit wenig Sonne und wenig Wind.","Ein Stromausfall in der Nacht.","Ein Sturm auf dem Meer.","Ein Kraftwerk ohne Licht."],
   e:"In einer Dunkelflaute liefern Solar- und Windanlagen wenig Strom. Dann helfen Speicher und andere Kraftwerke."},
  {type:"mc", q:"Wie wirkt sich der Klimawandel auf manche Wasserkraftwerke aus?",
   o:["Trockene Sommer und Niedrigwasser können die Stromerzeugung einschränken.","Es regnet immer mehr, darum laufen alle Kraftwerke besser.","Der Klimawandel hat keine Wirkung auf Wasserkraft.","Die Kraftwerke werden vom Wind angetrieben."],
   e:"Manche Pumpspeicherwerke nutzen den Rhein als Unterbecken. Bei Niedrigwasser dürfen sie kein zusätzliches Wasser nach oben pumpen.", s:"planet schule, Windenergie und Wasserkraft"},
  {type:"mc", q:"Warum brauchen Wind- und Solarenergie Speicher?",
   o:["Sie liefern nicht immer dann Strom, wenn wir ihn brauchen.","Sie erzeugen sonst zu viel CO₂.","Sie funktionieren nur im Dunkeln.","Ohne Speicher sind sie verboten."],
   e:"Bei Flaute oder Dunkelheit fehlt Strom, bei viel Wind und Sonne gibt es zu viel. Speicher gleichen das aus."},

  /* Erneuerbar, fossil oder weder noch: a = Index in PT */
  {type:"pt", item:"Windkraft", a:0, e:"Wind entsteht immer wieder neu. Windkraft ist erneuerbar."},
  {type:"pt", item:"Steinkohle", a:1, e:"Kohle entstand vor Millionen von Jahren aus Pflanzen. Sie ist ein fossiler Energieträger und irgendwann aufgebraucht."},
  {type:"pt", item:"Biomasse (Holz, Biogas)", a:0, e:"Biomasse stammt aus Pflanzen und Resten, die nachwachsen. Sie zählt zu den erneuerbaren Energien."},
  {type:"pt", item:"Erdgas", a:1, e:"Erdgas ist wie Erdöl und Kohle ein fossiler Energieträger."},
  {type:"pt", item:"Erdwärme", a:0, e:"Erdwärme kommt aus dem Erdinneren und nicht von der Sonne. Sie ist erneuerbar, weil sie dort ständig nachgeliefert wird."},
  {type:"pt", item:"Atomkraft (Uran)", a:2, e:"Uran ist kein fossiler Brennstoff aus Pflanzen oder Tieren, aber es ist auch nicht erneuerbar, weil die Vorräte begrenzt sind."},
  {type:"pt", item:"Solarenergie", a:0, e:"Die Sonne scheint weiter, egal wie viel wir nutzen. Solarenergie ist erneuerbar."},

  /* Wer bin ich: erste Antwort ist richtig, wird gemischt */
  {type:"rd", clues:["Ich liege oft in den Bergen.","Ich habe ein Oberbecken und ein Unterbecken.","Bei Stromüberschuss pumpe ich Wasser nach oben.","Man nennt mich eine riesige Batterie."],
   o:["Pumpspeicherkraftwerk","Laufwasserkraftwerk","Offshore-Windpark","Biogasanlage"],
   e:"Das Pumpspeicherkraftwerk speichert Energie als Lageenergie des Wassers und gibt sie bei Bedarf als Strom wieder ab."},
  {type:"rd", clues:["Ich stehe im Meer.","Meine Gondel wiegt etwa 300 Tonnen.","In der Nordsee laufe ich über zwei Drittel der Zeit unter Volllast.","Mein Strom geht über ein Umspannwerk an Land."],
   o:["Offshore-Windpark","Solarpark","Laufwasserkraftwerk","Erdwärmekraftwerk"],
   e:"Offshore-Windparks stehen im Meer. Dort weht der Wind stark und gleichmäßig."},
  {type:"rd", clues:["Ich liege oft auf Dächern.","Im Sommer liefere ich am meisten.","Ich nutze nicht die gesamte Sonnenenergie, die auf mich trifft.","Ich mache aus Licht direkt elektrische Energie."],
   o:["Solarzelle","Sonnenkollektor","Windrad","Turbine"],
   e:"Solarzellen wandeln Licht in Strom um. Sonnenkollektoren erwärmen dagegen Wasser."},
  {type:"rd", clues:["Ich stehe in Brasilien.","Ich staue den Rio Xingu.","Für mich wurden Land und Regenwald überflutet.","Zehntausende Menschen waren betroffen."],
   o:["Belo Monte","Pumpspeicherkraftwerk Wehr","Rheinkraftwerk Iffezheim","Offshore-Windpark in der Nordsee"],
   e:"Belo Monte gehört zu den größten Wasserkraftwerken der Welt. Es zeigt, dass erneuerbar nicht automatisch ohne Folgen heißt."},

  /* Fakt oder Fake: a = true/false */
  {type:"ff", q:"Wasserkraft ist in Deutschland die wichtigste erneuerbare Energie.", a:false,
   e:"An erster Stelle liegt die Windkraft, dazu kommt viel Solarstrom. Wasserkraft liefert nur etwa 3 bis 4 Prozent des Stroms, dafür gleichmäßig."},
  {type:"ff", q:"Wind liefert die besten Erträge im Winter und Frühjahr, Solar im Sommer.", a:true,
   e:"Beide ergänzen sich über das Jahr ganz gut. (Aussage von Prof. Quaschning im Film)"},
  {type:"ff", q:"Wenn 56 Prozent des Stroms erneuerbar sind, kommen 56 Prozent unserer gesamten Energie aus Erneuerbaren.", a:false,
   e:"Strom ist nur ein Teil des Energiebedarfs. Bei Heizen und Verkehr sind die Erneuerbaren noch deutlich schwächer."},
  {type:"ff", q:"Windräder und Solaranlagen stoßen beim Stromerzeugen kein CO₂ aus.", a:true,
   e:"Im Betrieb entsteht kein CO₂. Bei Herstellung und Bau entstehen allerdings Emissionen."},
  {type:"ff", q:"Auch Holz und Biogas zählen zu den erneuerbaren Energien.", a:true,
   e:"Biomasse wächst nach und zählt zu den erneuerbaren Energien, neben Sonne, Wind, Wasser und Erdwärme."},
  {type:"ff", q:"Windkraft funktioniert immer gleich zuverlässig, auch bei Flaute.", a:false,
   e:"Bei Flaute stehen die Räder still. Deshalb braucht es Speicher und andere Kraftwerke, die einspringen."}
];

  return { PT: PT, DATA: DATA };
})();
