# Präsentationen

## Präsentationen: Grundaufbau und Werkzeuge

Jede Präsentation (HTML) hat denselben Grundaufbau und bekommt dieselben Werkzeuge aus **einer** Datei (`assets/js/praesentation.js` mit `assets/css/praesentation.css`). Eine Änderung dort gilt für alle Präsentationen. Startpunkt für neue Präsentationen ist `vorlage/praesentation/index.html`.

**Einheitliches Design:** `assets/css/praesentation-design.css` enthält das gemeinsame Aussehen aller Präsentationen (Vorbild: Fotosynthese Stunde 1): Schrift Andika (lokal in `assets/fonts/`, SIL Open Font License), Farben als Variablen (`--g`, `--dk`, `--mint`, `--y`, `--grey`, `--ink`, Werte siehe „Fachfarben“), die Fachfarbe je Fach über `data-subject` am `<body>` (Biologie Grün, Geografie Rostrot; ein weiteres Fach oder Thema bekommt einen eigenen Block in der Datei), große Überschriften, Pill-Badge oben rechts, Aufgabenzeilen mit Niveau-Marke (`.task`, `.lvl`), Hilfekästen (`.shilfe`), Rahmen (`.frame`), Karten (`.chip`) und Schaltflächen (`.b`). Orientierung an den Apple Human Interface Guidelines: ruhige Fläche, ein Schriftschnitt, klare Hierarchie, weiche Rundungen, Bedienelemente mindestens 44 px. Neue Präsentationen nutzen diese Klassen, eigene Farben und Schriften entfallen. Die Portal-Kopfleiste ist in Präsentationen ausgeblendet, damit die Folie die ganze Fläche bekommt. Der Weg zurück steht als Haus-Knopf im Werkzeugrand (führt zur vorherigen Seite, ohne Vorgängerseite, etwa bei direktem Aufruf in neuem Tab, zur Portal-Startseite), daneben der Vollbild-Knopf (Taste F).

**Grundaufbau:** `#buehne` (füllt das Fenster) enthält `#stage` (feste Größe 1280 × 720, wird per Skript skaliert) mit den Folien als `<section class="slide">`. Die sichtbare Folie hat `display` ungleich `none`. Optional steht an einer Folie `data-min="5"`, das schlägt dem Timer 5 Minuten vor.

**Blätterpfeile:** Große runde Pfeile in den unteren Ecken (`.pfeil`, 84 px, Weiter in Gelb) stehen in `praesentation-design.css`. Das Markup steht in der Vorlage. **Ein- und Ausblenden der Folien nur über `display`** (Klasse `.on`), nicht über `opacity` oder `visibility`, sonst erkennen Stift und Timer die aktuelle Folie nicht.

**Einbinden** (Pfade je nach Tiefe anpassen, `defer` ist Pflicht): im `<head>` `praesentation-design.css` und `praesentation.css`, am Ende des `<body>` `praesentation.js`. Am `<body>` steht `class="lp-pres"`.

```html
<link rel="stylesheet" href="../../../../assets/css/praesentation-design.css">
<link rel="stylesheet" href="../../../../assets/css/praesentation.css">
<script src="../../../../assets/js/praesentation.js" defer></script>
```

Am rechten Bildrand stehen Haus (zurück zur Seite, von der die Präsentation geöffnet wurde, sonst zur Portal-Startseite), Vollbild und die drei Werkzeuge. Jeder öffnet ein Fenster, das sich am Kopf frei verschieben lässt und mit × schließt. **Die Größe ist über den Griff unten rechts frei verstellbar** (Doppelklick auf den Griff setzt die Standardgröße zurück, die Größe bleibt im Browser gemerkt). Ampel, Schrift und Timer-Ziffern wachsen mit der Fensterbreite mit. Das Fenster bleibt immer vollständig im Bild, zu langer Inhalt scrollt im Fenster.

| Werkzeug | Taste | Funktion |
|---|---|---|
| Stift | P | Schreiben mit Maus, Finger oder Stift in 5 Farben und 3 Stärken, Radierer, Strich zurück, Folie leeren. Striche gehören zur Folie und bleiben beim Blättern erhalten. Solange der Stift an ist, lässt sich die Folie nicht bedienen (Esc oder P schaltet ihn aus, die Striche bleiben sichtbar) |
| Timer | T | Countdown mit 1, 3, 5, 10, 15 Min., ±1 Min., +30 s, Start/Pause/Zurücksetzen und Signalton. Hat die Folie `data-min`, gibt es den Knopf „Dauer dieser Folie“. Die Restzeit steht auch am Knopf, wenn das Fenster zu ist. **Die Minutenangabe auf der Folie ist antippbar:** Ein Badge oder Meta-Chip, dessen Text mit „N Min.“ beginnt (zum Beispiel `<span class="badge">5 Min. · allein</span>`), startet beim Antippen den Timer mit N Minuten und zählt selbst herunter (`▮▮ 04:37 · allein`). Nochmal antippen: Pause und Weiter. Bei Ablauf wird das Badge rot und blinkt, dazu der Signalton. Das gilt automatisch in jeder Präsentation mit `praesentation.js`, auch für `data-minuten` an anderen Elementen. Eigene Timer-Knöpfe mit `data-timer` (Impfen) bleiben unberührt |
| Lärmampel | L | Ampel (Ruhig, Etwas laut, Zu laut) mit Pegelbalken und Ruhe-Sternen (siehe unten). Erst nach Klick auf „Start“ fragt der Browser nach dem Mikrofon. „Kalibrieren“ misst 3 Sekunden und setzt die jetzige Lautstärke als ruhig. Der Regler stellt die Empfindlichkeit ein. Fenster schließen beendet die Messung und gibt das Mikrofon frei. **Töne** (Schalter „Ton: an/aus“): sanfter fallender Zweiklang, wenn die Ampel auf Rot springt (höchstens alle 8 Sekunden), kurzes Ding bei jedem Stern, Dreiklang beim Ziel. Während eines Tons wird die Ampel nicht neu bewertet, damit der Lautsprecher die Messung nicht auslöst |

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

**Hinweise:**

- Die Lärmampel misst nur die Lautstärke im Browser. Es wird nichts aufgenommen, gespeichert oder gesendet. Sie braucht https (GitHub Pages) oder `localhost`. Die Pegelwerte hängen vom Gerät ab, deshalb vor der ersten Nutzung einmal kalibrieren.
- Die Werkzeuge liegen außerhalb der Folie und werden nicht gedruckt. Striche gibt es nur im Browser und sie sind beim Neuladen weg.
- Eigene Stift-, Timer- oder Ampelknöpfe in einer Präsentation entfallen, sonst gibt es sie doppelt. Vorhandene Timer, die Teil einer Aufgabenfolie sind, dürfen bleiben. Neue Folien nutzen stattdessen die antippbare Minutenangabe.

