/* Rollen der Mini-COP31. Gemeinsame Quelle für die Handyseite (rolle/), die Präsentation und die Druck-Rollenmappe
   (tools/mini-cop31-rollenmappe.js erzeugt daraus arbeitsblatt-rollenmappe.pdf).
   Aufbau je Rolle:
   - n, s, wer, kopf, liste, ziel: Text der ausgeschnittenen Rollenkarte (arbeitsblatt-1.pdf, Seite 3, erzeugt mit tools/mini-cop31-rollenmappe.js)
   - auftrag: ein Satz, der die Position klar sagt
   - Die Haltung zu den Varianten steht bewusst NICHT hier. Die SuS leiten sie aus Interessen und M-R1 bis M-R3 selbst ab
     (Tabelle auf Seite 2 der Mappe). Erwartete Haltungen: nur in der Lehrkraftdatei (Verlaufsplan).
   - infos: Infokarten M-R1 bis M-R3. Eine Zeile = ein Satz. Es stehen nur Fakten drin, keine fertigen Argumente.
   - aufg: Arbeitsaufträge. Die SuS erarbeiten Argumente, Kompromisse und rote Linien selbst.
   Gestaltungsregel: Die Varianten sind nicht nach Ehrgeiz sortiert und nicht wertend formuliert. Jede hat Vor- und Nachteile, je nach Rolle gibt es Zielkonflikte.
   Interessen sind allgemein formuliert (nicht im Wortlaut der Varianten). Die Infokarten nennen Belege, die für und gegen eine Variante sprechen,
   aber keine Folgerung. Die SuS müssen Belege den Varianten zuordnen und abwägen.
   Fakten sind vereinfacht und stammen aus allgemein bekannten Quellen (UNFCCC, IPCC, EU-Kommission, IEA, UNEP). Geprüft am 19.11.2026 per Websuche (Sekundärquellen, Primärtexte nicht abgerufen).
   Die Rollen sind typisiert: Sie sind keine Meinung der Lehrkraft oder der Klasse. */
window.COP_VAR={
 1:{A:'Jedes Land legt in seinem Klimaplan (NDC) selbst fest, wie es Kohle, Öl und Gas verringert. Die Pläne sind öffentlich.',
    B:'Der Beschluss nennt ein gemeinsames Enddatum: Bis 2050 beenden alle Länder die Nutzung von Kohle, Öl und Gas.',
    C:'Der Beschluss setzt ein Ziel für mehr Strom: Bis 2035 soll Strom 35 % des Energieverbrauchs decken (E-Autos, Wärmepumpen). Kohle, Öl und Gas stehen nicht darin.'},
 2:{A:'Die Industrieländer geben das Geld. Mindestens die Hälfte kommt als Zuschuss, nicht als Kredit.',
    B:'Alle Länder mit starker Wirtschaft geben Geld. Wer dazugehört, richtet sich nach Wirtschaftskraft und CO2-Ausstoß. Zuschuss oder Kredit ist frei.',
    C:'Es gibt keine neue Regel. Jedes Land entscheidet freiwillig, wie viel es gibt.'}
};
window.COP_TITEL={1:'Antrag 1: Kohle, Öl und Gas',2:'Antrag 2: Geld für Klimaschutz (ab 2035 mindestens 300 Milliarden US-Dollar im Jahr)'};
window.COP_HALTUNG={w:'Wir wollen',m:'Wir können mitgehen',n:'Wir sagen Nein',o:'Offen: Das klärt ihr in der Verhandlung'};
window.COP_TISCH=[
 ['1 Europäische Union','ein Zusammenschluss von 27 Staaten'],['2 Ölförderland','lebt von Öl und Gas'],
 ['3 Inselstaat','kleines Land im Meer'],['4 Großes Schwellenland','Wirtschaft wächst schnell'],
 ['5 Präsidentschaft','leitet, keine Stimme'],['6 Umweltorganisation','Beobachter, keine Stimme']
];
window.COP_F={
 paris:'2015 in Paris: Die Staaten wollen die Erwärmung auf deutlich unter 2 Grad begrenzen, möglichst auf 1,5 Grad.',
 ndc:'Dafür legt jedes Land alle 5 Jahre einen nationalen Klimaplan (NDC) vor. Er steht in einem öffentlichen Register.',
 cop28:'2023 auf der COP28 in Dubai: Alle Staaten beschließen, sich von fossilen Energien abzuwenden. Zum ersten Mal standen fossile Brennstoffe in einem COP-Beschluss. Der Text nennt Netto-Null bis 2050.',
 cop30:'Die COP30 (2025) endete ohne ausdrückliche Nennung fossiler Energien. Viele Länder fordern deshalb jetzt klare Sätze dazu.',
 geld:'2009 versprachen reiche Länder 100 Milliarden US-Dollar im Jahr. Erreicht wurde das erst 2022, zwei Jahre zu spät.',
 geld35:'Ab 2035 sollen es mindestens 300 Milliarden US-Dollar im Jahr sein.',
 einteilung:'Die UN-Einteilung der Länder stammt von 1992. Große Schwellenländer gelten dort noch als Entwicklungsländer. Sie müssen nicht zahlen, dürfen aber freiwillig mitzahlen.',
 strom:'Mehr Strom (E-Autos, Wärmepumpen) senkt den Ausstoß nur, wenn der Strom aus erneuerbaren Quellen kommt.'
};
window.COP_AUFG=[
 {t:'**Beschreibe** in zwei Sätzen, wer ihr seid und was euch wichtig ist.',n:'E'},
 {t:'**Beurteile** mit der Tabelle auf Seite 2 jede Variante von Antrag 1: Passt sie zu euch, geht sie noch, oder sagt ihr Nein? **Begründe** jede Einschätzung mit einem Beleg aus M-R1 bis M-R3. Der Beleg kann dafür oder dagegen sprechen.',n:'F'},
 {t:'**Beurteile** ebenso jede Variante von Antrag 2. **Begründe** mit je einem Beleg.',n:'F'},
 {t:'**Erkläre**, welche Gruppe euch am ehesten widerspricht. **Nenne** ihr Interesse und eure Antwort darauf.',n:'F–G'},
 {t:'**Entwickle** einen Kompromiss-Satz, dem ihr noch zustimmen könntet. **Lege** eure rote Linie fest: Bei welchem Satz sagt ihr Nein?',n:'G'}];
window.COP_ROLLEN={
 1:{n:'Europäische Union',s:'stimmberechtigt',
    auftrag:'Ihr vertretet die EU, einen Zusammenschluss von 27 Staaten. Euch sind Klimaschutz und eine starke Wirtschaft wichtig. Ihr entscheidet selbst, welche Varianten dazu passen.',
    wer:'Wir sind die EU. Wir wollen Klimaschutz. Unsere Wirtschaft soll stark bleiben.',kopf:'Uns ist wichtig:',
    liste:['Wir wollen unsere eigenen Klimaziele erreichen.','Wir wollen nicht schlechter dastehen als Länder, die weniger für den Klimaschutz tun.'],
    infos:[
     {t:'Unsere Lage',z:['Die EU besteht aus 27 Staaten. In den Klimaverhandlungen sprechen sie mit einer Stimme.',
       'Die EU will bis 2050 klimaneutral sein. Das steht im Europäischen Klimagesetz.',
       'Bis 2030 sollen die Treibhausgase um mindestens 55 % sinken (netto, im Vergleich zu 1990).',
       'Die EU baut Wind- und Solaranlagen aus. Sie führt aber noch Öl und Gas aus anderen Ländern ein.',
       'Seit 2026 gilt an der EU-Grenze ein CO2-Preis für bestimmte Importe, zum Beispiel Stahl und Zement (CBAM).'],q:'nach EU-Kommission, vereinfacht'},
     {t:'Was schon beschlossen ist',z:[window.COP_F.paris,window.COP_F.ndc,window.COP_F.cop28,window.COP_F.cop30],q:'nach UNFCCC und Medienberichten, vereinfacht'},
     {t:'Die Anträge aus Sicht der EU',z:['Die EU und ihre Mitgliedsländer gehören zu den größten Geldgebern für Klimaschutz in ärmeren Ländern.',
       window.COP_F.geld,window.COP_F.geld35,window.COP_F.einteilung,window.COP_F.strom],q:'nach UNFCCC, OECD, vereinfacht'}],
    aufg:window.COP_AUFG.concat([{t:'**Recherchiere** mit dem Handy: Wie viel Prozent des Stroms in der EU kommen aus Wind und Sonne? **Nenne** Zahl und Quelle.',n:'G',opt:true}]),
    sb:['Wir halten Variante … für passend, weil …','Wir können zustimmen, wenn …','Unsere rote Linie ist …, weil …']},
 2:{n:'Ölförderland',s:'stimmberechtigt · typisiert',
    auftrag:'Ihr vertretet ein erfundenes, typisches Land, das von Öl und Gas lebt. Euch ist wichtig, dass euer Land wirtschaftlich stabil bleibt. Ihr entscheidet selbst, welche Varianten dazu passen.',
    wer:'Wir verdienen viel Geld mit Öl und Gas. Davon bezahlen wir Schulen, Straßen und Arbeitsplätze.',kopf:'Uns ist wichtig:',
    liste:['Wir brauchen stabile Einnahmen für den Staat.','Wir brauchen Zeit für den Umbau unserer Wirtschaft.'],
    infos:[
     {t:'Unsere Lage',z:['Euer Land fördert Erdöl und Erdgas und verkauft sie an andere Länder.',
       'Die Einnahmen bezahlen einen großen Teil des Staatshaushalts.',
       'Viele Menschen arbeiten in der Öl- und Gasbranche. Die Firmen gehören oft dem Staat.',
       'Euer Land hat ein hohes Einkommen pro Kopf. Nach der UN-Einteilung von 1992 zählt es nicht zu den Industrieländern.',
       'Eine neue Wirtschaft aufzubauen (zum Beispiel Solarenergie, Industrie, Tourismus) dauert viele Jahre.'],q:'typisiertes Land, vereinfacht'},
     {t:'Was schon beschlossen ist',z:['2023 auf der COP28 in Dubai beschließen alle Staaten: Abkehr von fossilen Energien in den Energiesystemen.',
       'Im Text steht: „gerecht, geordnet und fair“. Er nennt Netto-Null bis 2050, aber kein Datum für das Ende von Öl und Gas.',
       'Im Text steht auch: Erdgas kann als Übergangsbrennstoff eine Rolle spielen.',window.COP_F.ndc,window.COP_F.cop30],q:'nach UNFCCC und Medienberichten, vereinfacht'},
     {t:'Die Anträge aus Sicht eures Landes',z:['Kohle, Öl und Gas liefern weltweit noch etwa 80 % der Energie. Öl braucht man auch für Verkehr und Kunststoffe, Gas für Strom und Wärme.',
       'Ein nationaler Klimaplan steht in einem öffentlichen Register. Andere Länder und Medien können ihn prüfen.',
       'Länder mit hohem Einkommen pro Kopf gelten oft als zahlungsfähig, auch wenn sie 1992 nicht als Industrieländer eingestuft wurden.',
       'Manche Förderländer bauen selbst große Solarparks.','Inselstaaten und andere Länder fordern klare Sätze zu fossilen Energien.'],q:'nach IEA und UNFCCC, vereinfacht'}],
    aufg:window.COP_AUFG.concat([{t:'**Recherchiere** mit dem Handy: Suche ein echtes Förderland, das in Solar- oder Windenergie investiert. **Nenne** ein Beispiel und die Quelle.',n:'G',opt:true}]),
    sb:['Wir halten Variante … für passend, weil …','Wir brauchen Zeit, weil …','Unsere rote Linie ist …, weil …']},
 3:{n:'Inselstaat',s:'stimmberechtigt · typisiert',
    auftrag:'Ihr vertretet einen erfundenen, typischen Inselstaat. Euch ist wichtig, dass euer Land bewohnbar bleibt. Ihr entscheidet selbst, welche Varianten dazu passen.',
    wer:'Wir sind ein kleines Land im Meer. Der Meeresspiegel steigt. Unsere Küsten sind in Gefahr.',kopf:'Uns ist wichtig:',
    liste:['Unser Land soll bewohnbar bleiben.','Wir brauchen Hilfe, die sicher und rechtzeitig ankommt.'],
    infos:[
     {t:'Unsere Lage',z:['Euer Land besteht aus niedrigen Inseln. Viele Orte liegen nur wenige Meter über dem Meer.',
       'Der Meeresspiegel ist seit 1900 weltweit um etwa 20 cm gestiegen.','Heute steigt er schneller als früher: über 3 mm im Jahr.',
       'Bei Sturmfluten kommt Salzwasser auf Felder und in Brunnen.','Euer Land hat sehr wenig CO2 ausgestoßen, spürt die Folgen aber früh.'],
      q:'nach IPCC (2021), vereinfacht'},
     {t:'Drei Arten von Klimageld',z:[window.COP_F.paris,'Klimaschutz: weniger Treibhausgase, zum Beispiel durch Solaranlagen.',
       'Anpassung: Schutz vor den Folgen, zum Beispiel Deiche und Frühwarnung.','Schäden und Verluste: Hilfe, wenn Schutz nicht mehr reicht.',
       'Für Schäden und Verluste gibt es seit 2023 einen Fonds. Er ist im Vergleich zu den Schäden noch klein.'],q:'nach UNFCCC, vereinfacht'},
     {t:'Die Anträge aus eurer Sicht',z:['Das Energiesystem mit Kohle, Öl und Gas verursacht etwa drei Viertel der Treibhausgase.',
       window.COP_F.strom,window.COP_F.geld,'2022 waren etwa 69 % des öffentlichen Klimageldes Kredite. Kredite müssen zurückgezahlt werden.',
       'Ab 2035 sollen es mindestens 300 Milliarden US-Dollar im Jahr sein. Große Schwellenländer dürfen freiwillig mitzahlen.',
       'Viele kleine Inselstaaten sind in der Gruppe AOSIS vereint. 2015 in Paris setzten sie sich stark für das 1,5-Grad-Ziel ein.'],q:'nach IEA, OECD, UNFCCC, vereinfacht'}],
    aufg:window.COP_AUFG.concat([{t:'**Recherchiere** mit dem Handy: Suche einen echten Inselstaat (zum Beispiel Tuvalu, Malediven oder Kiribati). **Nenne**, wie hoch das Land über dem Meer liegt, und die Quelle.',n:'G',opt:true}]),
    sb:['Wir halten Variante … für passend, weil …','Für uns ist wichtig, dass …','Unsere rote Linie ist …, weil …']},
 4:{n:'Großes Schwellenland',s:'stimmberechtigt · typisiert',
    auftrag:'Ihr vertretet ein erfundenes, typisches Schwellenland, also ein Land auf dem Weg zum Industrieland. Euch ist wichtig, dass euer Land weiter wachsen kann und Energie bezahlbar bleibt. Ihr entscheidet selbst, welche Varianten dazu passen.',
    wer:'Unsere Wirtschaft wächst schnell. Wir bauen Wind und Sonne aus. Wir brauchen aber noch Kohle und Gas.',kopf:'Uns ist wichtig:',
    liste:['Wir brauchen bezahlbare Energie für Arbeit und Wachstum.','Wir können nicht alle Kosten des Klimaschutzes allein tragen.'],
    infos:[
     {t:'Unsere Lage',z:['Euer Land hat viele Millionen Einwohner. Die Wirtschaft wächst schnell. Der Energiebedarf steigt jedes Jahr.',
       'Ihr baut Wind und Sonne stark aus. Kohle und Gas braucht ihr noch für verlässlichen Strom.',
       'Der CO2-Ausstoß pro Person ist bei euch kleiner als in Industrieländern.',
       'Insgesamt gehört euer Land zu den größten Verursachern von CO2.'],q:'typisiertes Land, vereinfacht'},
     {t:'Wer trägt die Verantwortung?',z:['Die UN-Klimakonvention von 1992 sagt: „gemeinsame, aber unterschiedliche Verantwortung“.',
       'Industrieländer haben seit 1850 einen sehr großen Teil des CO2 ausgestoßen.',
       'Die Einteilung in Industrie- und Entwicklungsländer stammt von 1992. Euer Land zählt dort zu den Entwicklungsländern.',
       'Heute sagen manche Länder: Große Schwellenländer sind reicher und stoßen viel aus. Sie sollen mitzahlen.'],q:'nach UNFCCC, vereinfacht'},
     {t:'Die Anträge aus Sicht eures Landes',z:['Wind und Sonne liefern nicht immer Strom. Reserven, Speicher und Netze kosten viel Geld.',
       'Kohlekraftwerke laufen oft 40 Jahre und länger.',window.COP_F.strom,window.COP_F.ndc,
       '2022 erreichten reiche Länder erstmals 100 Milliarden US-Dollar im Jahr. Ab 2035 sollen es mindestens 300 Milliarden sein.'],q:'nach UNFCCC, IEA, OECD, vereinfacht'}],
    aufg:window.COP_AUFG.concat([{t:'**Recherchiere** mit dem Handy: **Vergleiche** den CO2-Ausstoß pro Person in Deutschland und in einem Schwellenland deiner Wahl. **Nenne** die Zahlen und die Quelle.',n:'G',opt:true}]),
    sb:['Wir halten Variante … für passend, weil …','Wir können nicht allein zahlen, weil …','Unsere rote Linie ist …, weil …']},
 5:{n:'Präsidentschaft',s:'leitet · keine Stimme',
    auftrag:'Ihr leitet die Konferenz und habt keine Stimme. Ihr schreibt Kompromiss-Sätze, denen alle zustimmen können.',
    wer:'Wir leiten die Konferenz. Die Türkei ist Gastgeber. Australien führt die Verhandlungen.',kopf:'Unsere Aufgabe:',
    liste:['Hört allen Gruppen zu.','Schreibt Kompromiss-Sätze zu Antrag 1 und 2.','Euer Entwurf nennt schon mehr Strom im Energieverbrauch (Elektrifizierung).'],
    ziel:'Ein Beschluss, dem alle zustimmen können. Fragt in der Abstimmung: „Sagt jemand Nein?“',
    infos:[
     {t:'Die Regel: Konsens',z:['Auf einer COP gilt das Konsens-Prinzip: Ein Beschluss gilt nur, wenn niemand widerspricht.',
       'Fast 200 Staaten sitzen am Tisch. Ein einziges Land kann einen Satz stoppen.',
       'Die Präsidentschaft stimmt nicht mit ab. Sie sammelt Wünsche, schreibt Entwürfe und macht Vorschläge.','Am Ende fragt sie: „Sagt jemand Nein?“'],q:'nach UNFCCC, vereinfacht'},
     {t:'Werkzeugkasten für Kompromisse',z:['1 Abschwächen: Aus „müssen“ wird „sollen“ oder „werden eingeladen“.',
       '2 Streichen: Ein umstrittener Satz fällt weg.','3 Wahl lassen: „Jedes Land wählt seinen Weg.“',
       '4 Zeit geben: Statt eines Datums steht „so bald wie möglich“.','5 Verbinden: Zwei Wünsche stehen im selben Satz.'],q:'nach Praxis der Klimakonferenzen, vereinfacht'},
     {t:'Beispiele aus der Praxis',z:['Glasgow 2021: In der letzten Verhandlungsnacht wollten einige Länder keinen „Kohleausstieg“.',
       'Aus „auslaufen lassen“ (phase out) wurde „schrittweise verringern“ (phase down). Der Satz blieb im Text, aber schwächer. Alle haben zugestimmt.',
       'Euer Entwurf vom 19.11.: Fossile Energien kommen nicht mehr vor.',
       'Der Entwurf nennt Strom: Sein Anteil am Energieverbrauch soll bis 2035 auf 35 % steigen.'],q:'nach UNFCCC und Reuters (19.11.2026), vereinfacht'}],
    aufg:[
     {t:'**Beschreibe** in zwei Sätzen, was die Präsidentschaft tut und was sie nicht darf.',n:'E'},
     {t:'**Erkläre** mit M-R1, warum ein einziges Nein genügt, um einen Satz zu stoppen.',n:'F'},
     {t:'**Notiere** in der Eröffnung für jede Gruppe: Was will sie? Wozu sagt sie Nein? (Tabelle)',n:'E–F'},
     {t:'**Entwickle** je einen Kompromiss-Satz zu Antrag 1 und zu Antrag 2. **Nutze** mindestens ein Werkzeug aus M-R2.',n:'G'},
     {t:'**Erkläre**, bei welchem Antrag ein Kompromiss schwerer wird und warum.',n:'F–G'},
     {t:'**Recherchiere** mit dem Handy: Wie lief die Einigung in Glasgow 2021 zur Kohle ab? **Nenne** zwei Fakten und die Quelle.',n:'G',opt:true}],
    sb:['Wir schlagen vor: …','Dem könnt ihr zustimmen, weil …','Sagt jemand Nein?']},
 6:{n:'Umweltorganisation',s:'Beobachter · keine Stimme',
    auftrag:'Ihr seid Beobachter und dürft reden, aber nicht abstimmen. Euch ist wichtig, dass der Beschluss das Klima schützt. Ihr entscheidet selbst, welche Varianten dafür nötig sind, und haltet ein Statement mit 3 Sätzen.',
    wer:'Wir sind eine Umweltorganisation. Wir dürfen im Raum sein und reden. Wir dürfen nicht abstimmen.',kopf:'Unsere Aufgabe:',
    liste:['Haltet ein Statement mit 3 Sätzen (1 Minute). Fordert, was dem Klima am meisten hilft, und stützt es mit einem Beleg.','Beobachtet: Welche Gruppe setzt sich durch? Notiert Stichpunkte.'],
    ziel:'Der Beschluss soll das Klima schützen.',
    infos:[
     {t:'Unsere Rolle',z:['Umweltorganisationen sind Beobachter. Sie dürfen im Raum sein und reden.','Sie dürfen nicht abstimmen.',
       'Sie veröffentlichen Analysen, schreiben Kommentare zu den Entwürfen und sprechen mit Medien.','So machen sie Druck auf die Staaten.'],q:'nach UNFCCC, vereinfacht'},
     {t:'Was hilft dem Klima?',z:['Das Energiesystem verursacht etwa drei Viertel der Treibhausgase. Es beruht noch größtenteils auf Kohle, Öl und Gas.',
       'Laut UNEP-Bericht vom Oktober 2026 ist die 1,5-Grad-Grenze kaum noch zu halten. Jetzt geht es darum, die Überschreitung so klein wie möglich zu halten.',
       'Je wärmer es wird, desto mehr Hitzewellen, Dürren und Starkregen gibt es.',window.COP_F.strom,
       '2022 waren etwa 69 % des öffentlichen Klimageldes Kredite, die zurückgezahlt werden müssen.',
       'Ärmere Länder tragen wenig zur Erwärmung bei, spüren aber früh die Folgen.'],q:'nach IEA, UNEP (Emissions Gap Report 2026), OECD, vereinfacht'},
     {t:'Ein Statement schreiben',z:['Ein Statement hat drei Teile:','1 Forderung: Was verlangt ihr?','2 Beleg: Welcher Fakt stützt das?','3 Appell: Was sollen die Staaten tun?',
       'Ihr habt 1 Minute. Sprecht in kurzen Sätzen.'],q:'Methode, vereinfacht'}],
    aufg:[
     {t:'**Beschreibe** in zwei Sätzen, wer ihr seid und was ihr bei der Mini-COP dürft.',n:'E'},
     {t:'**Beurteile** mit der Tabelle auf Seite 2, welche Variante bei Antrag 1 und bei Antrag 2 dem Klima am meisten hilft. **Begründe** jede Einschätzung mit einem Beleg aus M-R2.',n:'F'},
     {t:'**Entwickle** ein Statement mit 3 Sätzen: Forderung, Beleg, Appell.',n:'F–G'},
     {t:'**Notiere** beim Verhandeln: Welche Gruppe setzt sich durch? Wer gibt nach? Wer sagt Nein? (Tabelle)',n:'E–F'},
     {t:'**Beurteile** nach der Abstimmung: Schützt der Beschluss das Klima? **Nenne** ein Kriterium und begründe.',n:'G'},
     {t:'**Recherchiere** mit dem Handy: Suche eine Forderung einer echten Umweltorganisation zur COP31. **Fasse** sie in zwei Sätzen **zusammen** und **nenne** die Quelle.',n:'G',opt:true}],
    sb:['Wir fordern: …','Der Grund: …','Deshalb bitten wir die Staaten: …']}
};
