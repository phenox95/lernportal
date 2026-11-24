# Präsentationen

## Präsentationen: Grundaufbau und Werkzeuge

Jede Präsentation (HTML) hat denselben Grundaufbau und bekommt dieselben Werkzeuge aus **einer** Datei (`assets/js/praesentation.js` mit `assets/css/praesentation.css`). Eine Änderung dort gilt für alle Präsentationen. Startpunkt für neue Präsentationen ist `vorlage/praesentation/index.html`.

**Einheitliches Design:** `assets/css/praesentation-design.css` enthält das gemeinsame Aussehen aller Präsentationen. Gestaltung nach dem Skill „unslop“ von Damir Sokolovsky (heydamir, CC BY 4.0, https://github.com/heydamir/unslop), Vorbild sind die Präsentationen der Reihe Zelle (Biologie Klasse 7). Schrift Andika (lokal in `assets/fonts/`, SIL Open Font License), Farben als Variablen: `--g` (Fachfarbe), `--dk` (Dunkel-Farbe des Fachs, Grund dunkler Folien), `--ad` (helles Akzent, nur auf dunklem Grund), `--tint` (zarte Fläche), `--paper` (Foliengrund), `--ink`, `--ink2`, `--ink3` (Text in drei Stufen), `--line` (feine Linien), `--ok`/`--bad` (Rückmeldung). Ältere Namen bleiben nutzbar: `--mint` (= zarte Fläche), `--grey` (= `--ink3`), `--y`, `--b`, `--o`, `--p`. `--y` ist ein heller Hervorhebungston in der Farbe des Themenfelds (in der Reihe Zelle die Fachfarbe), auf dunklen Folien immer `--ad`. Die Fachfarbe je Fach kommt über `data-subject` am `<body>` (Biologie Grün, Geografie Rostrot), die Tonlage je Themenfeld aus `themenfarben.css`. Bausteine: Überschrift mit kurzem Balken in Fachfarbe, Randangabe `.badge`, Aufgabenzeilen mit Niveau-Marke (`.task`, `.snr`, `.lvl`), Hilfekästen (`.shilfe`), Rahmen (`.frame`), Karten (`.chip`), Merksatz (`.merk`), Schaltflächen (`.b`, `.b.sec`), Rückmeldung (`.fb.good`, `.fb.warn`), Phasenschilder (`.phase`), Vorlese-Knopf (`.vorl`). Klassen, die nur eine Präsentation braucht, stehen in deren eigenem `<style>`-Block, nicht in der gemeinsamen Datei (viele Namen wie `.dg`, `.bank`, `.tc` nutzt auch `stunde.css`). **Farbe je Themenfeld:** Jedes Themenfeld hat eine eigene, ruhige Tonlage (gleiche Sättigung und Helligkeit je Fach, nur der Farbton wechselt; Weiß auf der Hauptfarbe mindestens 5,6:1). Sie gilt überall: Symbole und Karten der Themenfelder, Themenfeld-Seite, Begriffe-Seite, Materialseiten (auch im Dunkelmodus) und Präsentationen. Die Farben stehen in **einer** Datei, `assets/css/themenfarben.css`, erzeugt von `python3 tools/themenfarben.py` (Farbtöne je Themenfeld oben im Skript ändern, Datei neu erzeugen). Die Zuordnung kommt aus dem Ordnernamen (`<fach>/klasse-N/<themenfeld-slug>/`): `prefs.js` setzt `data-tf` am `<body>`. Eigene Farben in einer Präsentation nur über `var(--g)`, `var(--dk)`, `var(--mint)` und `var(--fach-rgb)` setzen, feste Töne bleiben sonst beim Themenfeld-Wechsel stehen. Neue Präsentationen nutzen diese Klassen, eigene Farben und Schriften entfallen. Die Portal-Kopfleiste ist in Präsentationen ausgeblendet, damit die Folie die ganze Fläche bekommt. Der Weg zurück steht als Haus-Knopf im Werkzeugrand (führt zur vorherigen Seite, ohne Vorgängerseite, etwa bei direktem Aufruf in neuem Tab, zur Portal-Startseite), daneben der Vollbild-Knopf (Taste F).

### Gestaltung (verbindlich für alle Präsentationen)

- **Schrift:** Andika, Gewichte 400 und 500, nie höher. Fett nur mit `<b>` im Fließtext und beim Operator, nie in Titeln, Knöpfen, Kästen, Schildern.
- **Farbe:** nur Fachfarbe (Tonlage des Themenfelds), Papier und Text. Keine Verläufe, keine Schatten (auch kein Textschatten), kein Leuchten. Farbe nie als einziger Bedeutungsträger.
- **Dunkle Folien** (`.slide.dark`): Grund `--dk`, nie Schwarz oder Grau. Man sieht jederzeit, in welchem Fach man ist. Helles Akzent `--ad` nur auf dunklem Grund, auf hellem Grund immer `--g`.
- **Phasenschilder** (`.phase` mit `data-ph`): Farbe je Phase (`dn`, `im`, `er`, `si`, `re`) nur als zarte Tönung mit feinem Rand und dunkler Schrift.
- **Titel:** kein Doppelpunkt am Ende, keine Dauer im Titel. Die Dauer steht klein im `.badge` („4 Min. · allein“), dort startet sie auch den Timer.
- **Zeichen:** keine Emoji und keine Zeichen wie ✓ ✗ ◉ ✎ → ■ in Titeln, Knöpfen und Rückmeldungen des Skripts. Linien-Icons als SVG. Wechselt ein Skript den Knopftext, sitzt das Icon per CSS (`::before`), wie beim Vorlese-Knopf `.vorl`. Rückmeldungen ohne Ausrufezeichen („Alles richtig“). Erlaubt bleiben die Niveau-Marken ●○○ / ●●○ / ●●●, Pfeile im Fließtext und Lehrkrafthinweise in `data-notes`.
- **Maße:** Abstände im 4-px-Raster, Rahmen 1,5 bis 2 px, Bedienelemente mindestens 44 px, Bewegung nur über `transform` und `opacity`.
- **Keine externen Ressourcen:** keine CDNs, keine Webfonts von Dritten.
- **Wirkungskreis:** `praesentation-design.css` laden nicht nur die Ordner `praesentation/`, sondern auch ältere Stunden-Seiten (z. B. `biologie/klasse-7/zelle/kennzeichen-des-lebendigen/`, `biologie/klasse-9/gesundheit/impfen/`, `geografie/klasse-9/klimawandel/escape-climate-change/`). Vor einer Änderung alle betroffenen Seiten prüfen: `grep -rl praesentation-design.css --include=*.html .`
- **Variablen:** Feste Werte stehen auf `:root`, damit eigene `:root`-Variablen einer Seite gewinnen. Was von der Fachfarbe abhängt (`--tint`, `--mint`, `--y`, `--o`, `--b`, `--p`), wird am `body` berechnet. Eigene Kürzel deshalb am `body` setzen (`body{--akzent:var(--g)}`), nicht auf `:root`, sonst greift die Farbe des Themenfelds nicht.
- **`stunde.css` und `stunde.js`** folgen denselben Regeln: Gewicht 500, keine Schatten, Rahmen 2 px, Haken als Linienzeichen, Rückmeldungen ohne Haken und Ausrufezeichen („Alles richtig“). Niveau-Schilder `.niv`: n1 zarte Fläche, n2 Fachfarbe, n3 Dunkel-Farbe.

**Grundaufbau:** `#buehne` (füllt das Fenster) enthält `#stage` (feste Größe 1280 × 720, wird per Skript skaliert) mit den Folien als `<section class="slide">`. Die sichtbare Folie hat `display` ungleich `none`. Optional steht an einer Folie `data-min="5"`, das schlägt dem Timer 5 Minuten vor.

**Überschriften:** Jeder Folientitel bleibt im Quelltext eine `<h1>`. `praesentation.js` lässt nur die erste `h1` der Präsentation als Hauptüberschrift stehen und markiert alle weiteren per `role="heading"` und `aria-level="2"` als Ebene 2. Aussehen und CSS ändern sich nicht, eigene Anpassungen in der einzelnen Präsentation sind nicht nötig.

**Blätterpfeile:** Große runde Pfeile in den unteren Ecken (`.pfeil`, 84 px, Zurück in der Dunkel-Farbe, Weiter in der Fachfarbe) stehen in `praesentation-design.css`. Das Markup steht in der Vorlage. **Ein- und Ausblenden der Folien nur über `display`** (Klasse `.on`), nicht über `opacity` oder `visibility`, sonst erkennen Stift und Timer die aktuelle Folie nicht.

**Einbinden** (Pfade je nach Tiefe anpassen, `defer` ist Pflicht): im `<head>` `praesentation-design.css` und `praesentation.css`, am Ende des `<body>` `praesentation.js`. Am `<body>` steht `class="lp-pres"`.

```html
<link rel="stylesheet" href="../../../../assets/css/praesentation-design.css">
<link rel="stylesheet" href="../../../../assets/css/praesentation.css">
<script src="../../../../assets/js/praesentation.js" defer></script>
```

Am rechten Bildrand stehen Haus (zurück zur Seite, von der die Präsentation geöffnet wurde, sonst zur Portal-Startseite), Vollbild und die drei Werkzeuge. Kann der Browser kein Vollbild (Brave und einige Browser auf dem iPad), erscheint ein Hinweis mit dem Weg über den Home-Bildschirm (Teilen, Zum Home-Bildschirm) oder in Safari über „aA“ und „Symbolleiste ausblenden“. Jeder öffnet ein Fenster, das sich am Kopf frei verschieben lässt und mit × schließt. **Die Größe ist über den Griff unten rechts frei verstellbar** (Doppelklick auf den Griff setzt die Standardgröße zurück, die Größe bleibt im Browser gemerkt). Ampel, Schrift und Timer-Ziffern wachsen mit der Fensterbreite mit. Das Fenster bleibt immer vollständig im Bild, zu langer Inhalt scrollt im Fenster.

| Werkzeug | Taste | Funktion |
|---|---|---|
| Stift | P | Schreiben mit Maus, Finger oder Stift in 5 Farben und 3 Stärken, Radierer, Strich zurück, Folie leeren. Striche gehören zur Folie und bleiben beim Blättern erhalten. Solange der Stift an ist, lässt sich die Folie nicht bedienen (Esc oder P schaltet ihn aus, die Striche bleiben sichtbar) |
| Timer | T | Countdown mit 1, 3, 5, 10, 15 Min., ±1 Min., +30 s, Start/Pause/Zurücksetzen und Signalton. Hat die Folie `data-min`, gibt es den Knopf „Dauer dieser Folie“. Die Restzeit steht auch am Knopf, wenn das Fenster zu ist. **Die Minutenangabe auf der Folie ist antippbar:** Ein Badge oder Meta-Chip, dessen Text mit „N Min.“ beginnt (zum Beispiel `<span class="badge">5 Min. · allein</span>`), startet beim Antippen den Timer mit N Minuten und zählt selbst herunter (`▮▮ 04:37 · allein`). Nochmal antippen: Pause und Weiter. Bei Ablauf wird das Badge rot und blinkt, dazu der Signalton. Das gilt automatisch in jeder Präsentation mit `praesentation.js`, auch für `data-minuten` an anderen Elementen. Eigene Timer-Knöpfe mit `data-timer` (Impfen) bleiben unberührt |
| Lärmampel | L | Ampel (Ruhig, Etwas laut, Zu laut) mit Pegelbalken und Ruhe-Sternen (siehe unten). Erst nach Klick auf „Start“ fragt der Browser nach dem Mikrofon. „Kalibrieren“ misst 3 Sekunden und setzt die jetzige Lautstärke als ruhig. Der Regler stellt die Empfindlichkeit ein. Fenster schließen beendet die Messung und gibt das Mikrofon frei. **Töne** (Schalter „Ton: an/aus“): sanfter fallender Zweiklang, wenn die Ampel auf Rot springt (höchstens alle 8 Sekunden), kurzes Ding bei jedem Stern, Dreiklang beim Ziel. Während eines Tons wird die Ampel nicht neu bewertet, damit der Lautsprecher die Messung nicht auslöst. **Ansicht „Ampel“ oder „Aquarium“** (oben im Fenster, wird im Browser gemerkt): Im Aquarium ist jeder Ruhe-Stern ein Fisch. Es gibt 6 Fischarten im Wechsel (in den Vektor-Riffen: Clownfisch, Paletten-Doktorfisch, Falterfisch, Kugelfisch, Kaiserfisch, Fahnenbarsch; im Märchenriff zusätzlich eine Qualle statt des Doktorfischs; beim Darüberfahren erscheint der Name; die Anzeige zählt deshalb „Tiere“). Grün: die Fische schwimmen. Gelb: sie ruhen. Rot: sie verstecken sich, die Zahl bleibt als Text stehen („3 von 8 Fischen“). Drei Riffe zur Wahl: „Märchen“ (Standard, handgemalt: Hintergrundbild und 7 Tiere als WebP in `assets/img/aquarium/`, Fische in `fische/`; fehlen die Dateien, erscheint eine Vektorzeichnung; Herkunft der Bilder: KI-generiert, Werkzeug und Nutzungsbedingungen vor der Veröffentlichung eintragen), „Gezeichnet“ (flach, sanfter Verlauf) und „Aquarell“ (SVG-Filter für Papierkorn und unruhige Farbränder); die Wahl wird gemerkt. Beide sind Inline-SVG in `praesentation.js` (Objekt `RIFFE`, keine Bilddatei, keine Fremdquelle), die Farben des gezeichneten Riffs stehen im Block `.lp-pr-aqua` in `praesentation.css`. Der Hintergrund liegt als eigene ruhende SVG-Ebene unter den Fischen Die Zahl der Fische folgt der Einstellung „Sterne bis Spiel“. Bei `prefers-reduced-motion` schwimmen die Fische nicht. **Größe:** Der Griff unten rechts zieht das Fenster beliebig groß (das Aquarium wächst mit, Doppelklick auf den Griff = Standardgröße). „Vollbild“ lässt das Fenster die ganze Bühne füllen: links das Aquarium, rechts die Bedienung. „Verkleinern“ oder Esc geht zurück (die Präsentation selbst bleibt im Vollbild) |
| Folie ausblenden | . (Punkt) | Schwarzer Bildschirm über der Folie, Antippen, Punkt-Taste, Esc oder ein Folienwechsel zeigt sie wieder. Der Knopf bleibt auch bei eingeklapptem Dock sichtbar. |
| Dock ein-/ausklappen | – | Der kleine Pfeil oben im Dock klappt die Leiste ein. Dann bleiben nur Pfeil und „Folie ausblenden“ stehen. Der Zustand bleibt im Browser gemerkt. |
| Weitere Werkzeuge | W | Öffnet die Auswahl für Blende, Wer ist dran?, Gruppen losen, Stoppuhr, Notizzettel, Link und QR-Code (Q) und Leseansicht (alles nur im Browser, nichts wird gesendet). |
| Blende | B | Unscharfe, transparent graue Abdeckung über der Folie (Milchglas: Formen sind zu ahnen, Text ist nicht lesbar). Sie startet vollflächig und wird an jeder Kante und Ecke kleiner gezogen (Griffe in Gelb); Ziehen in der Fläche verschiebt sie. „× Blende weg“ entfernt sie, beim Folienwechsel verschwindet sie von selbst. Sie liegt in der Bühne und skaliert mit der Folie. |
| Mini-Timer | – | Läuft der Timer und ist sein Fenster zu, schwebt eine Zeitanzeige über der Folie (frei verschiebbar, Position bleibt im Browser gemerkt). Tippen pausiert und setzt fort, × setzt zurück, bei Ablauf blinkt sie rot mit „Zeit!“. |
| Wer ist dran? | Z | Losnummer ohne Namen: Nummern 1 bis N (N einstellbar), optional „Jede Nummer nur einmal“ mit Liste der schon Gezogenen und „Neu beginnen“. |
| Gruppen losen | G | Die Seite `interaktiv/gruppen/` (Sitzplan mit Nummern) als Fenster. Beim Einbetten (`?eingebettet=1`) ist die Kopfzeile ausgeblendet, die drei Schritte (Sitzplan, Einteilen, Ergebnis) liegen auf Reitern und passen sich der Fenstergröße an, sodass nicht gescrollt werden muss. |
| Stoppuhr | S | Zählt vorwärts (Zehntelsekunden), Start/Stopp/Weiter, Runde (die letzten 5 stehen im Fenster), Zurücksetzen. |
| Notizzettel | – | Freies Textfeld je Präsentation, gespeichert nur im Browser (`localStorage`), „Leeren“. Keine Namen eintragen. |

### Link und QR-Code (Teilen)

Der Knopf mit dem Quadrate-Symbol (Taste **Q**) im Werkzeugrand öffnet ein Fenster mit QR-Code und Adresse. „Nachlesen“ führt zur Leseansicht dieser Präsentation, „Stundenseite“ (nur wenn es sie gibt) zur Seite darüber. Das Fenster startet groß, damit der Code am Board lesbar ist (Schalter „Groß zeigen“). Dazu „Link kopieren“ und, wo das Gerät es kann, „Per App teilen“. Auf Materialseiten steht derselbe Knopf in der Kopfleiste. Code: `assets/js/teilen.js` und `assets/css/teilen.css`, beide werden erst beim ersten Öffnen nachgeladen, der QR-Code kommt lokal aus `assets/js/qrcode.js`. Es wird nichts an Dritte gesendet. Der Code ist immer schwarz auf weiß, auch im Dunkelmodus. Beim Öffnen der Seite als Datei (`file://`) gibt es keinen Code, nur einen Hinweis.

### Leseansicht (Nachlesen auf dem Handy und zu Hause)

Jede Präsentation lässt sich ohne Zutun als **Leseansicht** öffnen: alle Folien stehen untereinander, die Werkzeuge (Stift, Timer, Lärmampel, Blätterpfeile) sind ausgeblendet, oben steht die Portal-Kopfleiste mit „Zurück“, dem Knopf „Folien“ und dem Lesemodus „Aa“. Gedacht ist sie für Schülerinnen und Schüler, die gefehlt haben oder wiederholen wollen. Sie kommt aus `praesentation.js` und `praesentation.css` und gilt für alle Präsentationen, eine einzelne Präsentation braucht dafür nichts.

| Start | Wirkung |
|---|---|
| Handy im Hochformat (Fenster höchstens 700 px breit) | Leseansicht öffnet von selbst |
| Buch-Knopf im Werkzeugrand | wechselt zur Leseansicht, an der Stelle der aktuellen Folie |
| Knopf „Folien“ in der Kopfleiste | zurück zur Präsentation |
| Adresse mit `?ansicht=lesen` | Leseansicht auf jedem Gerät, zum Beispiel als Link „Zum Nachlesen“ |
| Adresse mit `?ansicht=folien` | Präsentation auch auf dem Handy |

- **Schmale Fenster (unter 820 px):** eine Spalte. Mehrspaltige Bereiche laufen untereinander, die Minutenangabe rückt unter den Titel. Die Schriftgröße folgt dem Lesemodus (Normal, Groß, Sehr groß). Der Zeilenabstand des Lesemodus wirkt hier nicht. Was nicht umbrechen kann (beschriftete Abbildungen, feste Raster), wird als Ganzes verkleinert, breite Tabellen scrollen im eigenen Rahmen.
- **Breite Fenster:** jede Folie in Originalform, nur untereinander statt zum Blättern.
- Die Folien behalten ihre Farben, auch im Dunkelmodus des Geräts. Nur der Seitengrund und die Kopfleiste folgen dem Portal.
- Aufgaben zum Antippen und Ausfüllen bleiben bedienbar. Pfeiltasten und Leertaste scrollen, die Tastenkürzel der Präsentation ruhen. Minutenangaben starten keinen Timer, das Fragenfeld zeigt nur die Impulsfragen.
- Es wird nichts gespeichert. Beim Wechsel der Ansicht bleiben Eingaben erhalten, beim Neuladen nicht.
- **Beim Bauen beachten:** Die Leseansicht vermisst jede Folie einmal und baut sie um. Am besten gelingt das mit den Klassen des Designs (`.split`, `.grid2` bis `.grid4`, `.row`, `.task`, `.shilfe`). Frei mit `position:absolute` und festen Pixelmaßen gesetzte Folien werden lesbar, aber weniger schön. Neue Präsentationen deshalb einmal im schmalen Fenster mit `?ansicht=lesen` ansehen.
- Von Hand steuern: `window.Praesentation.lesen(true)` und `window.Praesentation.lesen(false)`.

### Fragenfeld (Fragenentwicklung)

Standardbaustein für den Einstieg nach Impuls (Abschnitt „Impuls und Fragenentwicklung“ der Planungsvorgaben): Die Klasse nennt Fragen, die Lehrkraft tippt sie ein, die Klasse priorisiert mit 👍, „→ Leitfrage“ übernimmt die gewählte Frage ins Feld „Unsere Frage für heute“, dort lässt sie sich gemeinsam umformulieren. Eine Folie braucht nur:

```html
<section class="slide" data-min="4">
  <h1>Eure Fragen</h1>
  <div data-fragenfeld></div>
</section>
```

- Links stehen die Moderationsfragen (Standard: Was fällt euch auf? Was überrascht euch? Was wollt ihr herausfinden? Welche Frage stellt sich euch?). `data-impulse="Frage 1|Frage 2|Frage 3"` am `div` ersetzt sie, die letzte wird hervorgehoben.
- Jedes Element mit `data-leitfrage` zeigt später in der Präsentation die Leitfrage der Klasse an (zum Beispiel in der Sicherung oder im Exit-Ticket).
- Fragen lassen sich entfernen (✕). Es wird nichts gespeichert, beim Neuladen sind sie weg.
- Aussehen und Verhalten stehen zentral in `praesentation-design.css` und `praesentation.js`, nicht in der einzelnen Präsentation. Eigene Bauweisen entfallen.

### Ruhe-Sterne und Belohnungsspiele

Die Klasse sammelt **gemeinsam** Sterne, solange die Lärmampel läuft und grün ist (Standard: 30 Sekunden Ruhe = 1 Stern, 8 Sterne bis zum Spiel, beides im Lärmampel-Fenster unter „Sterne einstellen“ änderbar). Bei Gelb pausiert der Balken, bei Rot beginnt er von vorn. **Sterne gehen nie verloren**, die Lehrkraft kann von Hand geben und wegnehmen. Es werden keine Namen oder Gruppen erfasst, nichts wird gespeichert (nur die Einstellungen). Beim Ziel erscheint „Spiel starten“.

**Merkregel: Spiele sind allgemein, Inhalte gehören immer zu Fach und Thema.** Die Spiele (`assets/games/memory.js`, `quiz.js`, `zuordnen.js`, `wortsalat.js`) enthalten keine Fachinhalte. Jede Präsentation bringt ihre eigenen Inhalte als Datenblock mit, nie fachübergreifend wiederverwenden. Aus denselben Paaren bauen alle Spiele ihre Runden. Beim Start wird zufällig ein Spiel gewählt, das zu den Daten passt, und nicht dasselbe zweimal hintereinander.

```html
<script type="application/json" id="lp-spiel-daten">
{
 "titel": "Fotosynthese",
 "paare": [
  ["Chloroplast", "Ort der Fotosynthese in der Pflanzenzelle", "Chlo-ro-plast"],
  ["Wasser", "Ausgangsstoff, den die Wurzel aufnimmt"]
 ],
 "spiele": ["memory", "quiz"]
}
</script>
```

- Ein Paar besteht aus Begriff, kurzer Erklärung und optional den Silben des Begriffs. Mindestens 4 Paare, besser 8, nur Inhalte der Stunde. Fachliche Entwürfe vor dem Einsatz gegenlesen.
- `spiele` (optional) begrenzt die Auswahl. Fehlt es, kommen alle in Frage. Wortsalat braucht mindestens 3 einteilige Begriffe (3 bis 14 Buchstaben, ohne Leerzeichen und Bindestrich).
- Die Spieldateien werden erst geladen, wenn das Spiel startet. Ein neues Spiel ist eine Datei in `assets/games/`, die sich mit `window.LPSpiele.reg.<name> = { titel, start({ feld, paare, hilfe, ende }) }` anmeldet, und ein Eintrag in der Liste `SPIELE` in `praesentation.js`.

### Begriffe-Seite (`begriffe/`): Nachschlagen und Üben

Aus den Spielinhalten entsteht ohne zweite Liste eine Seite für Schülerinnen und Schüler: `begriffe/?fach=Biologie&nr=3.1` zeigt alle Begriffe eines Themenfelds, geordnet nach Stunde, mit Suche, dem Verweis „Stunde nachlesen“ (öffnet die Leseansicht) und „Üben“. Die Themenfeld-Seite verlinkt darauf. `begriffe/` ohne Angaben zeigt die Themenfelder mit Material.

- **Quelle:** Die Seite liest `projects.json`, lädt die Ordner der Einträge des Themenfelds (`path` und Ordner in `dateien`) und entnimmt ihnen den Block `lp-spiel-daten`. Ein Begriff wird also nur an einer Stelle gepflegt: in der Präsentation.
- **Freigabe:** Gezeigt werden nur Blöcke mit `"geprueft": true`. Das Feld ist optional, ohne es bleibt der Block ein Entwurf: Er läuft weiter als Belohnungsspiel im Unterricht, erscheint aber nicht auf der Begriffe-Seite. Nach dem fachlichen Gegenlesen `"geprueft": true` in den Block schreiben und den Vermerk „ENTWURF“ im Kommentar darüber entfernen.
- **Vorschau für die Lehrkraft:** `&entwurf=1` an der Adresse zeigt auch ungeprüfte Blöcke, deutlich als Entwurf markiert.
- **Üben:** Dieselben Spiele wie in der Präsentation (`assets/games/`), zufällig gewählt, mit „Anderes Spiel“. `spiele` im Datenblock gilt auch hier. „Alle Begriffe üben“ nimmt jeden Begriff des Themenfelds einmal (die Erklärung aus der ersten Stunde, in der er vorkommt). **Ohne Zeitanzeige:** Die Seite setzt `hilfe.ohneZeit`, die Spiele zeigen dann keine Uhr und nennen am Ende keine Zeit. Ein neues Spiel muss `hilfe.ohneZeit` beachten.
- Es wird nichts gespeichert. Die Begriffe sind echter Text und lassen sich vorlesen.

```json
{ "titel": "Fotosynthese", "geprueft": true, "paare": [["Chloroplast", "Ort der Fotosynthese in der Pflanzenzelle", "Chlo-ro-plast"]] }
```

**Hinweise:**

- Die Lärmampel misst nur die Lautstärke im Browser. Es wird nichts aufgenommen, gespeichert oder gesendet. Sie braucht https (GitHub Pages) oder `localhost`. Die Pegelwerte hängen vom Gerät ab, deshalb vor der ersten Nutzung einmal kalibrieren.
- Die Werkzeuge liegen außerhalb der Folie und werden nicht gedruckt. Striche gibt es nur im Browser und sie sind beim Neuladen weg.
- Eigene Stift-, Timer- oder Ampelknöpfe in einer Präsentation entfallen, sonst gibt es sie doppelt. Vorhandene Timer, die Teil einer Aufgabenfolie sind, dürfen bleiben. Neue Folien nutzen stattdessen die antippbare Minutenangabe.

## Stunden-Bausteine (`stunde.css` und `stunde.js`)

Für Stunden mit Aufgaben zum Ausfüllen, Zuordnen und Prüfen gibt es **eine** gemeinsame Datei-Kombination: `assets/css/stunde.css` (nach `praesentation.css` laden) und `assets/js/stunde.js` (am Ende des `body`, vor `praesentation.js`). Sie bringt das Blättern (Pfeile, Tasten, Skalierung der Bühne) und die Bausteine mit. Vorbild: `biologie/klasse-7/zelle/` (sieben Stunden). Der Seitenrahmen steht dort in jeder `index.html`, die Folien sind `<section class="slide">` mit `<p class="phase">` (Phase), `<h1 class="k">` (Titel) und `<span class="badge">` (Sozialform und Zeit).

| Baustein | Markup | Verhalten |
|---|---|---|
| Zuordnen | `<div data-zuordnen>` mit `.bank` (Vorrat aus `.dg`), Zielen `.dz[data-ans]` (Alternativen mit `\|`), Knöpfen `.chk` `.rst` `.lsg` und `.fb` | Wörter ziehen oder antippen, Prüfen färbt Felder grün/rot, „Lösung“ setzt alles richtig |
| ABC-Quiz | `<div data-quiz>` mit `.opt` (richtige Antwort `data-ok`, Rückmeldung in `data-fb`) und `.qfb` | Antippen zeigt sofort Rückmeldung |
| Lösung zeigen | Knopf mit `data-zeige`, Inhalt in `.lsg-box`; in Tabellen `td.fill[data-l]` | schaltet die Lösung an der Folie ein |
| Reihenfolge | `<div data-ordnen>` mit `figure[data-pos]` (je `.rang` und `.buch`) | Bilder der Reihe nach antippen, Prüfen |
| Ankreuz-Tabelle | `<table data-wahl>` mit `td.w` | eine Wahl je Zeile |
| Ja/Nein-Tabelle | `<div data-jn>` mit `td.jn[data-a]`, `.chk` `.rst` `.lsg` | antippen wechselt leer, ja, nein |
| Karten aufdecken | `.aufdecken` mit `.vorn` und `.hinten` | Antippen deckt auf |
| Rechner | `[data-gv]` mit `.gv-o`, `.gv-k`, `.gv-e` | Objektiv mal Okular |
| Strichliste | `[data-strich]` mit `.tc` (`.tn`, `.tm`) | Antippen zählt hoch |
| Eingabefelder | `contenteditable="true"` an `td`, `.kasten`, `.lueck` | Texte tippen, nichts wird gespeichert |
| Schrittweiser Aufbau | `<div data-aufbau>` mit Elementen `[data-s="1"]`, `[data-s="2"]` … (Text und SVG-Gruppen) | Pfeil vor (Taste oder Knopf) deckt den nächsten Schritt auf, erst nach dem letzten Schritt wird geblättert; Pfeil zurück deckt wieder zu. In der Leseansicht ist alles sichtbar |
| Kartenablage | `<div data-sortieren>` mit `.pool` (Karten `.ks`, optional `data-ziel`) und Feldern `.zone[data-z]` mit `.inh`, optional `.chk` | Karten in Felder ziehen oder antippen, mehrere je Feld, Prüfen nur mit `data-ziel` |
| Zoom-Regler | `<div data-zoom data-labels="A\|B">` mit `.zstapel > .zebene` (Ebenen), `input.zr`, `.zl` | Regler blendet Ebenen ineinander über (Lupe, Zoom) |
| Mikroskop-Trainer | `<div data-mikro>` mit `.mk-sicht`, `.mk-obj button[data-o]`, `.mk-fokus`, `.mk-gv`, `.mk-fd`, `.mk-hint` | Objektiv wählen, scharf stellen, Sichtfeld und Gesamtvergrößerung ablesen |
| Entdecker | `<div data-explorer>` mit **eingebundener** SVG (nicht als `img`) aus `.hot[data-n][data-t]` und `.ex-name`, `.ex-text`, `.ex-zahl` | Teile antippen, Name und Aufgabe erscheinen |
| Schalter | `<div data-schalter>` mit `.sch button[data-m=tier\|pflanze]`, `[data-nur="pflanze"]`, `.sch-liste` | blendet Teile ein und aus (Tierzelle ⇄ Pflanzenzelle) |
| Gewebekette | `[data-kette]` mit `circle.kp` und `button` | Signal: Kette zieht sich zusammen |
| Matrix | `<table data-matrix>` mit `td.m` und `.summe` | Merkmale ankreuzen, Summe je Zeile |
| Checkliste | `[data-checkliste]` mit `.cp`, `.cz` | Punkte abhaken, Zähler |
| „Ich kann“ | `[data-selbst]` mit `.sb` (drei Knöpfe) | Selbsteinschätzung in drei Stufen, nichts wird gespeichert |
| Impulsfilm | `<div data-film>` (eigene Datei `assets/js/impulsfilm.js`, nach `stunde.js` laden), optional Knopf `[data-film-neu]` und Zähler `<span data-zaehler data-bis="0.4" data-stellen="2" data-start="600" data-dauer="4000">0,40</span>` | Bekommt beim Zeigen der Folie die Klasse `spielt`, die CSS-Animationen der Stunde hängen daran. **Das CSS ohne `spielt` zeigt das Endbild**: so sehen Leseansicht, Druck und „Bewegung reduzieren“ ein fertiges Bild. Der Zähler zählt mit Komma bis zum Endwert, mit `data-von` ab einem Startwert (auch abwärts). Beispiele: Elfmeter (Auftakt Neurobiologie), fallendes Lineal (Reiz und Reaktion), wackelnde Dose (Sinnesorgane) |
| Vermuten, dann prüfen | `<div data-vermuten>` mit `.vm-frage`, `.vm-wahl` (Knöpfe) und `.vm-pruefen` (Regler, Modell). Eigene Datei `assets/js/messen.js` mit `assets/css/messen.css`, nach `stunde.js` laden | `.vm-pruefen` bleibt verdeckt („Erst vermuten, dann prüfen“), bis eine Vermutung angetippt ist, „Neu vermuten“ deckt wieder zu. Für Regler der Art „Was passiert, wenn …?“. Höchstens ein Regler je Stunde, keine Deko. Die Regler selbst (Rechnung, Zeichnung) stehen als kleines Skript in der Präsentation, Bausteine dafür in `messen.css` (`.rg-zeile`, `.rg-knoepfe`, `.rg-erg`, `.rg-bild`, `.rg-hinweis`). Bewegung nur ohne „Bewegung reduzieren“. Beispiele: Reaktionsweg (Reiz und Reaktion), Hundepfeife (Sinnesorgane), Zwei Spitzen (Sinnesleistungen auswerten) |
| Klassenmessung | `<div data-klassenmessung data-max="50" data-key="…">` (aus `messen.js`) | Lineal-Werte der Klasse in cm eintragen: Punktdiagramm mit cm- und Sekunden-Achse (freier Fall), Mittelwert und Median. „Am Board messen“ öffnet einen Reaktionstest zum Antippen, diese Werte erscheinen als Ringe. Werte bleiben im Browser (`localStorage`, Schlüssel `data-key`), „Neu beginnen“ leert nach zweitem Antippen. Beispiel: Reiz und Reaktion |
| Reaktionstest am Board (Impuls) | `<div data-boardtest data-key="…" data-ziel="0.4" data-ja="…" data-nein="…">` (aus `messen.js`) | Großes Tippfeld für die Impulsfolie: Personen tippen nacheinander am Board, sobald „Jetzt!“ erscheint (zufällige Wartezeit, zu frühes Tippen zählt nicht). Rechts stehen die letzten fünf Zeiten, ohne Mittelwert. Mit `data-ziel` (Sekunden) bekommt jede Zeit den Text `data-ja` oder `data-nein`. Die Zeiten landen unter demselben `data-key` wie die Klassenmessung und erscheinen dort als Ringe: Die Verzögerung von Touchscreen und Bildschirm wird später zum Lernanlass („Warum sind die Board-Zeiten länger?“). Mit `data-wahl` zwei Runden: Runde 1 einfache Reaktion, Runde 2 Wahlreaktion (in etwa einem Drittel der Versuche „✋ Stopp! Nicht tippen“ statt „Jetzt!“). Daneben stehen die Mittelwerte beider Runden und die Fehler; Runde-2-Zeiten erscheinen nicht im Punktdiagramm. Beispiel: Reiz und Reaktion (Impuls und Vertiefung „Tippen oder nicht tippen?“) |
| Gruppenwerte per QR sammeln | `<div data-qr-sammeln data-key="…" data-namen="A=Name\|B=Name">` (aus `messen.js`) | Kamera der Lehrkraft liest die Codes im Format des Rückkanals (`{"v":1,"g":"Gruppe 2","a":"B: …"}`) direkt auf der Folie, jede Gruppe wird eine Zeile der Tabelle („Gruppe 2 · B: …“ in `localStorage`). Ohne Kamera: „Von Hand eintragen“. Kein Bild wird gespeichert, nichts gesendet. Beispiel: Sinnes-Stationen (Schlüssel `lp-sinnes-stationen-tabelle`, den auch die Portalseite und die Auswertungsstunde lesen) |
| Phasenmarke | `<p class="phase">` | Farbe nach Phase (Do Now, Impuls, Erarbeitung, Sicherung, Reflexion) |

Hinweise: Klassennamen `.nr` und `.hilfe` nicht verwenden (kollidieren mit `material.css`). Inhalte der Lehrkraft (Zielkorridor, Erwartungshorizont) kommen nicht in die Folien, nur Lösungen, die Schülerinnen und Schüler selbst per Knopf prüfen.
