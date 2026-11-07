# Lernportal

Zentrales Portal für digitale Unterrichtsmaterialien in Biologie und Geografie (Jg. 7–10). Reines HTML, CSS und JavaScript, ohne Build-Schritt, ohne externe Dienste.

## Aufbau

| Seite | Zweck |
|---|---|
| `index.html` | Startseite: Suche, zwei Fachbereiche, Impuls der Woche, Register nach Klassenstufe |
| `themenfelder.json` | Die offiziellen RLP-Themenfelder je Fach (Nummer, Titel, Doppeljahrgangsstufe, Ordnername). Steuert Themenfeld-Filter und Themenfelder-Überblick |
| `biologie/`, `geografie/` | Fachseiten mit Themenfelder-Überblick, Suche und Filtern (Klassenstufe, Art, Themenfeld) |
| `alle/` | Alle Materialien mit zusätzlichem Fachfilter. Das Register der Startseite verlinkt hierher (`alle/?klasse=8`) |
| `impressum/`, `datenschutz/` | Rechtstexte, in der Fußzeile aller Seiten verlinkt. Laden bewusst kein `app.js`. **Platzhalter in eckigen Klammern vor der Veröffentlichung ausfüllen** |
| `projects.json` | Metadaten aller Materialien |
| `impuls.json` | Impuls der Woche (optional) |
| `vorlage/` | Vorlagen: `vorlage/` (Materialseite mit Aufgaben), `vorlage/materialseite/` (Seite pro Thema mit Dateiliste) und `vorlage/praesentation/` (Grundaufbau einer Präsentation mit Stift, Timer und Lärmampel). Alle mit einheitlicher Kopfleiste. Steht nicht in `projects.json`, ist also nicht im Portal sichtbar |
| `assets/` | `css/` (`styles.css` Portal, `material.css` Materialseiten), `js/` (`qrcode.js` QR-Codes für Präsentationen, `app.js` Liste und Suche, `prefs.js` Lesemodus, `material.js` Kopfleiste und Titelblock der Materialseiten, `materialseite.js` Dateiliste der Themenseite), `css/materialseite.css` (Stile der Themenseite), `js/praesentation.js` und `css/praesentation.css` (Werkzeuge für Präsentationen), `img/muster/` (Fachmuster als SVG), `img/fach/` (optionale Themenbilder der Fachseiten), `fonts/` (Andika, **nur für Präsentationen**), `games/` (Belohnungsspiele ohne Fachinhalte). Portal und Materialseiten laden keine Schriftdatei und nutzen die Systemschrift des Geräts |

## Ordnerregel

```
<fach>/klasse-<n>/<themenfeld-ordner>/[<reihe>/]<stunde>/
```

- `<themenfeld-ordner>` ist der `slug` des Themenfelds aus `themenfelder.json` (z. B. `nervensystem` für 3.6). Er muss zur Nummer in `themenfeld` passen. `tools/check.py` warnt sonst.
- `<reihe>` ist optional (z. B. `risikoraeume`). Die Stunde ist die unterste Ebene mit einer eigenen Materialseite oder Anwendung.
- Zieht ein Ordner um, bleibt an der alten Adresse eine `index.html` mit Weiterleitung (`<meta http-equiv="refresh">`), damit gedruckte QR-Codes und Lesezeichen funktionieren. Beispiel: `biologie/klasse-9/auge-bau/`.

## Prüfen vor dem Hochladen

```bash
python3 tools/check.py
```

Das Skript prüft `projects.json` und `themenfelder.json`: Pflichtfelder, Format von Klasse und Datum, Passung von Fach und Klasse zum Pfad, Themenfeld-Nummern, vorhandene Ordner und Dateien (auch in `dateien`), doppelte Pfade und doppelte Hilfsdateien. Fehler lassen den Lauf scheitern, Warnungen nicht. Dieselbe Prüfung läuft bei jedem Pull Request als GitHub Action (`.github/workflows/check.yml`).

**Gemeinsame Bausteine** liegen zentral in `assets/js/` (z. B. `qrcode.js` für QR-Codes). Reihen bringen nur ihre Inhalte mit, keine Kopien.

## Inhalte ergänzen

1. Lege einen Ordner für das neue Material an, z. B. `biologie/klasse-10/meiose/`.
2. Lege die Startdatei der Anwendung dort als `index.html` ab.
3. Ergänze einen Eintrag in `projects.json`:

```json
{
  "title": "Meiose",
  "subject": "Biologie",
  "grade": "Klasse 10",
  "type": "Interaktive Präsentation",
  "description": "Chromosomenverteilung während der Meiose.",
  "path": "biologie/klasse-10/meiose/",
  "themenfeld": "Zellteilung",
  "dauer": "45 Min.",
  "niveau": "F–G",
  "datum": "2026-11-03",
  "sichtbar": true
}
```

4. Änderungen in den `main`-Branch hochladen. GitHub Pages veröffentlicht sie anschließend automatisch.

## Felder in projects.json

| Feld | Pflicht | Wirkung |
|---|---|---|
| `title` | ja | Titel der Zeile |
| `subject` | ja | `Biologie` oder `Geografie` bestimmt die Fachseite. `Interaktiv` erscheint nur in der Suche und unter „Alle Materialien". |
| `grade` | ja | z. B. `Klasse 8`. Die Zahl steuert Klassenfilter und Register. `Klasse 7/8` zählt für beide Klassen. |
| `type` | ja | Enthält das Wort *Präsentation*, *Arbeitsblatt*, *Modul* oder *interaktiv/Spiel/Simulation/Quiz*, greift der Filter „Art". Das Wort bestimmt auch das Symbol. `Materialseite` ist der Typ für ein Thema mit Dateiliste (siehe `dateien`). |
| `path` | ja | Relativer Pfad im Repository, z. B. `biologie/klasse-8/zelle/` |
| `description` | nein | Wird durchsucht |
| `reihe` | nein | Name der Unterrichtsreihe, z. B. `Risikoräume`. Ordner der Reihe: `geografie/klasse-7/risikoraeume/<stunde>/`. Wird noch nicht ausgewertet, dient der Ordnung |
| `themenfeld` | nein | Nummer des RLP-Themenfelds, z. B. `3.1`. Das Portal ergänzt den offiziellen Titel aus `themenfelder.json`. Freier Text geht weiterhin, erscheint dann unter „Weitere“ im Filter (gleiche Schreibweise für gleiche Themenfelder) |
| `dauer` | nein | z. B. `Do Now`, `45 Min.`, `Doppelstunde` |
| `niveau` | nein | Niveaustufen D–H, nur eintragen, wenn gesichert |
| `datum` | nein | `JJJJ-MM-TT` |
| `sichtbar` | nein | `false` blendet Entwürfe aus (auch aus Zählern und Suche) |
| `status` | nein | Kleines Label, z. B. `Beispiel` |
| `dateien` | nein | Liste der Dateien eines Themas (siehe unten). Fehlt das Feld, verhält sich der Eintrag wie bisher |

### Feld `dateien` (Materialseite pro Thema)

Ein Listeneintrag pro Thema, dahinter eine Materialseite mit allen Dateien: Präsentation, Arbeitsblätter, Übung, Exit-Game. Die Seite liest ihren Eintrag aus `projects.json`, die Dateiliste wird nirgends sonst gepflegt.

```json
{
  "title": "Auge: Bau und Funktion",
  "subject": "Biologie",
  "grade": "Klasse 9",
  "type": "Materialseite",
  "path": "biologie/klasse-9/auge/",
  "dateien": [
    { "titel": "Präsentation zur Stunde", "pfad": "biologie/klasse-9/auge/praesentation.pdf", "art": "Präsentation" },
    { "titel": "Arbeitsblatt Auge", "pfad": "biologie/klasse-9/auge/arbeitsblatt-1.pdf", "art": "Arbeitsblatt", "stufe": 1 },
    { "titel": "Übung: Auge beschriften", "pfad": "biologie/klasse-9/auge/uebung/", "art": "Übung" },
    { "titel": "Exit-Game", "pfad": "biologie/klasse-9/auge/exitgame/", "art": "Spiel" }
  ]
}
```

| Feld in `dateien` | Pflicht | Wirkung |
|---|---|---|
| `titel` | ja | Anzeigename der Zeile. Ohne Titel wird die Zeile nicht angezeigt |
| `pfad` | ja | Relativ zum Repository-Stamm. Datei (`.pdf`) oder Ordner mit `index.html` (Schrägstrich am Ende). Erlaubt sind relative Pfade (ohne `..`) und `https://`. Alles andere (`javascript:`, `data:`) blendet die Zeile aus |
| `art` | ja | `Präsentation`, `Arbeitsblatt`, `Übung`, `Spiel`, `Hilfe`. Bestimmt Gruppe und Symbol. Unbekannte Werte landen in „Weitere Materialien" |
| `stufe` | nein | `1`, `2` oder `3`, angezeigt als ●○○ / ●●○ / ●●● (Mindest-/Regel-/Erweiterungsniveau) mit Text für Screenreader. Andere Werte werden ignoriert |
| `sichtbar` | nein | `false` blendet die Zeile aus |

Gruppen auf der Materialseite: **Zur Stunde** (Präsentation), **Arbeitsblätter**, **Üben** (Übung, Spiel), **Hilfen**, **Weitere Materialien**. Leere Gruppen fehlen. PDFs haben die Aktionen *Ansehen* (neuer Tab) und *Herunterladen*, Anwendungen öffnen im selben Tab. Bei Übung und Spiel steht der Hinweis, dass das Ergebnis nur auf dem Gerät bleibt.

**Filter und Suche:** Die Arten eines Eintrags ergeben sich aus `type` und den `art`-Werten in `dateien`. Filter „Arbeitsblatt": mindestens ein Arbeitsblatt in `dateien`. Filter „Interaktiv": auch Einträge mit Übung oder Spiel. Filter „Präsentation": auch Einträge mit einer Präsentation. Die Suche findet zusätzlich `titel` und `art` der Dateien. Die Kartenzeile zeigt eine Inhaltsangabe, z. B. „Präsentation · 2 Arbeitsblätter · Übung · Spiel".

**Ordnerkonvention** (Dateinamen klein, ohne Umlaute und Leerzeichen):

```
biologie/klasse-9/auge/
├── index.html            Materialseite (aus vorlage/materialseite/ kopiert)
├── praesentation.pdf
├── arbeitsblatt-1.pdf    Niveau ●○○
├── arbeitsblatt-2.pdf    Niveau ●●○
├── uebung/index.html     eigenständige Anwendung
└── exitgame/index.html   eigenständige Anwendung
```

**Ablauf pro Thema in drei Schritten:**

1. Ordner `vorlage/materialseite/` nach `biologie/klasse-N/thema/` kopieren, PDFs hineinlegen. In der kopierten `index.html` die Pfade um eine Ebene verlängern (aus `../../` wird `../../../`, fünf Stellen) und den Kommentar löschen. Anwendungen bekommen ihre Kopfleiste wie unter „Bestehende Anwendung einhängen".
2. Eintrag mit `dateien` in `projects.json` ergänzen (`path` muss zum Ordner passen).
3. Hochladen und kontrollieren. Änderungen können bis etwa 10 Minuten brauchen, bis sie sichtbar sind.

**Wichtig:**

- **Alles im Repository ist öffentlich.** `sichtbar: false` blendet nur aus und schützt nicht. Nie hochladen: Erwartungshorizonte, Lehrkrafthinweise, Klassenarbeiten, Lösungen für die Lehrkraft.
- **Rechte:** Nur eigene oder klar lizenzierte Bilder und Texte. Schulbuchabbildungen und Fremdmaterial nicht hochladen. Fremde Fundstellen nur verlinken.
- **PDF-Export:** Foliennotizen vor dem Export entfernen. PDFs mit echtem Text exportieren (nicht als Bild), damit Vorlesefunktionen funktionieren. Bilder komprimieren, damit die Dateien schlank bleiben.
- **Benennung:** Fassungen nur über das Niveau kennzeichnen (●○○ …). Keine Kennzeichnung „LRS" oder Ähnliches in Titeln oder Dateinamen.
- **Exit-Games:** Ohne Konten gibt es keine Auswertung für die Lehrkraft. Ergebnisse bleiben im Browser der SuS.
- Das Beispiel `biologie/klasse-9/beispiel-materialseite/` (Status „Beispiel") enthält nur Platzhalter. Löschen, sobald echtes Material da ist, samt Eintrag in `projects.json`.

## Impuls der Woche (`impuls.json`)

Ein Foto mit einer Frage, die die SuS zum Material führt. Das Bild soll fachlich etwas beitragen.

```json
{
  "aktiv": true,
  "label": "Impuls der Woche",
  "klasse": "Klasse 8",
  "frage": "Was fällt dir an diesem Blatt auf?",
  "bild": "assets/img/impuls-blatt.webp",
  "bildAlt": "Beschreibung dessen, was zu sehen ist",
  "bildQuelle": "Foto: eigenes Foto, 2026",
  "link": "biologie/klasse-8/zelle/"
}
```

- `"aktiv": false` blendet den Baustein aus. Ohne `bild` erscheint ein Platzhalter „Platz für eigenes Foto".
- Bilder als WebP, möglichst unter ca. 150 KB. Keine erkennbaren Personen. Bildquelle und Lizenz angeben.
- Ohne `bildAlt` gilt das Bild als Dekoration. Für Impulsbilder besser eine Beschreibung ergänzen.

## Präsentationen: Grundaufbau und Werkzeuge

Jede Präsentation (HTML) hat denselben Grundaufbau und bekommt dieselben Werkzeuge aus **einer** Datei (`assets/js/praesentation.js` mit `assets/css/praesentation.css`). Eine Änderung dort gilt für alle Präsentationen. Startpunkt für neue Präsentationen ist `vorlage/praesentation/index.html`.

**Einheitliches Design:** `assets/css/praesentation-design.css` enthält das gemeinsame Aussehen aller Präsentationen (Vorbild: Fotosynthese Stunde 1): Schrift Andika (lokal in `assets/fonts/`, SIL Open Font License), Farben als Variablen (`--g`, `--dk`, `--mint`, `--y`, `--grey`, `--ink`, Werte siehe „Fachfarben“), die Fachfarbe je Fach über `data-subject` am `<body>` (Biologie Grün, Geografie Rostrot; ein weiteres Fach oder Thema bekommt einen eigenen Block in der Datei), große Überschriften, Pill-Badge oben rechts, Aufgabenzeilen mit Niveau-Marke (`.task`, `.lvl`), Hilfekästen (`.shilfe`), Rahmen (`.frame`), Karten (`.chip`) und Schaltflächen (`.b`). Orientierung an den Apple Human Interface Guidelines: ruhige Fläche, ein Schriftschnitt, klare Hierarchie, weiche Rundungen, Bedienelemente mindestens 44 px. Neue Präsentationen nutzen diese Klassen, eigene Farben und Schriften entfallen. Die Portal-Kopfleiste ist in Präsentationen ausgeblendet, damit die Folie die ganze Fläche bekommt. Der Weg zurück steht als Haus-Knopf im Werkzeugrand, daneben der Vollbild-Knopf (Taste F).

**Grundaufbau:** `#buehne` (füllt das Fenster) enthält `#stage` (feste Größe 1280 × 720, wird per Skript skaliert) mit den Folien als `<section class="slide">`. Die sichtbare Folie hat `display` ungleich `none`. Optional steht an einer Folie `data-min="5"`, das schlägt dem Timer 5 Minuten vor.

**Blätterpfeile:** Große runde Pfeile in den unteren Ecken (`.pfeil`, 84 px, Weiter in Gelb) stehen in `praesentation-design.css`. Das Markup steht in der Vorlage. **Ein- und Ausblenden der Folien nur über `display`** (Klasse `.on`), nicht über `opacity` oder `visibility`, sonst erkennen Stift und Timer die aktuelle Folie nicht.

**Einbinden** (Pfade je nach Tiefe anpassen, `defer` ist Pflicht): im `<head>` `praesentation-design.css` und `praesentation.css`, am Ende des `<body>` `praesentation.js`. Am `<body>` steht `class="lp-pres"`.

```html
<link rel="stylesheet" href="../../../../assets/css/praesentation-design.css">
<link rel="stylesheet" href="../../../../assets/css/praesentation.css">
<script src="../../../../assets/js/praesentation.js" defer></script>
```

Am rechten Bildrand stehen Haus (zurück zum Portal), Vollbild und die drei Werkzeuge. Jeder öffnet ein Fenster, das sich am Kopf frei verschieben lässt und mit × schließt. **Die Größe ist über den Griff unten rechts frei verstellbar** (Doppelklick auf den Griff setzt die Standardgröße zurück, die Größe bleibt im Browser gemerkt). Ampel, Schrift und Timer-Ziffern wachsen mit der Fensterbreite mit. Das Fenster bleibt immer vollständig im Bild, zu langer Inhalt scrollt im Fenster.

| Werkzeug | Taste | Funktion |
|---|---|---|
| Stift | P | Schreiben mit Maus, Finger oder Stift in 5 Farben und 3 Stärken, Radierer, Strich zurück, Folie leeren. Striche gehören zur Folie und bleiben beim Blättern erhalten. Solange der Stift an ist, lässt sich die Folie nicht bedienen (Esc oder P schaltet ihn aus, die Striche bleiben sichtbar) |
| Timer | T | Countdown mit 1, 3, 5, 10, 15 Min., ±1 Min., +30 s, Start/Pause/Zurücksetzen und Signalton. Hat die Folie `data-min`, gibt es den Knopf „Dauer dieser Folie“. Die Restzeit steht auch am Knopf, wenn das Fenster zu ist |
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
- Eigene Stift-, Timer- oder Ampelknöpfe in einer Präsentation entfallen, sonst gibt es sie doppelt. Vorhandene Timer, die Teil einer Aufgabenfolie sind (Ätna, Einzel- und Gruppenphase), dürfen bleiben.

## Favicon

Das Portal-Icon (weißes L auf Grün und Rostrot, den beiden Fachfarben) liegt in `assets/favicon/`: `favicon.svg` (Vorlage, scharf in jeder Größe), `favicon.ico` (16, 32, 48 px), `favicon-32.png`, `favicon-48.png`, `favicon-192.png` und `apple-touch-icon.png` (180 px, deckender Hintergrund für iPad und iPhone). Jede HTML-Seite bindet es mit drei `<link>`-Zeilen im `<head>` ein, mit dem Weg zum Repository-Stamm davor (`../../assets/favicon/…`). Neue Seiten aus den Vorlagen haben die Zeilen schon. Fehlen sie, ergänzt `material.js` sie über `data-root`. Das Icon ändern: `favicon.svg` anpassen und die PNG- und ICO-Dateien daraus neu erzeugen (SVG in der Größe 32, 48, 180 und 192 px als PNG exportieren).

## Materialseiten und Kopfleiste

Jede Anwendung bekommt dieselbe Kopfleiste mit **Zurück zum Portal** und dem Lesemodus „Aa". Auf Vorlagenseiten (`class="lp-seite"` am `body`) folgt darunter ein Titelblock mit Fach, Klasse, Titel und optional einem Themenbild. Bei eingehängten Anwendungen steht der Titel direkt in der schmalen Leiste. Alles erzeugt `assets/js/material.js` aus den `data`-Attributen am `body`. Ändert sich die Kopfleiste, ändert sich nur diese eine Datei.

| Attribut am `body` | Bedeutung |
|---|---|
| `data-root` | Weg zum Repository-Stamm, z. B. `../../../` bei `biologie/klasse-8/zelle/`. Nur relative Pfade werden akzeptiert |
| `data-title` | Titel in der Kopfleiste. Ohne Angabe gilt der `<title>` der Seite |
| `data-subject` | `Biologie`, `Geografie` oder `Interaktiv` (steuert die Fachfarbe, das Fach steht immer auch als Text da) |
| `data-grade` | z. B. `Klasse 8`, `Klasse 9/10`. Ab Klasse 9 gilt die dichtere Darstellung, davor die luftigere |

### Neues Material aus der Vorlage

1. Ordner `vorlage/` kopieren nach z. B. `biologie/klasse-8/zelle/` (nur die Datei `index.html` wird gebraucht).
2. In der kopierten Datei die Pfade um zwei Ebenen verlängern: jedes `../` durch `../../../` ersetzen (Suchen und Ersetzen, fünf Stellen: `link`, zwei `script`, `data-root`, `noscript`). Den Kommentar zum Kopieren löschen.
3. `data-title`, `data-subject`, `data-grade` anpassen, Inhalte ersetzen, `<meta name="robots" content="noindex">` entfernen.
4. Eintrag in `projects.json` ergänzen (siehe oben).

Bausteine der Vorlage: Einstieg, Material (M1, M2 …) mit Quelle, Text mit Zeilennummern (jede Zeile ein `li`, Nummer an jeder fünften), Tabelle im eigenen Scroll-Container, Abbildung mit festem Seitenverhältnis, Aufgabe mit Operator und Niveau (`data-stufe` 1 bis 3), Teilaufgaben zum Abhaken, Hilfe-Kästen (Tipp, Wortspeicher mit Silben, Satzbausteine) und Schreibraum. Aufgabe, Material und Hilfe unterscheiden sich durch Rahmen und Beschriftung, nicht nur durch Farbe. Lehrkrafthinweise und Erwartungshorizonte gehören nie auf die Schülerseite.

### Bestehende Anwendung einhängen

Eine Anwendung mit eigenem Aussehen bekommt nur die Kopfleiste. Im `<head>` ergänzen (Pfade je nach Tiefe anpassen, `defer` ist Pflicht):

```html
<link rel="stylesheet" href="../../../assets/css/material.css">
<script src="../../../assets/js/prefs.js"></script>
<script src="../../../assets/js/material.js" defer></script>
```

Am `<body>` die Attribute `data-root`, `data-title`, `data-subject` und `data-grade` setzen. `material.css` ist eigenständig, alle Klassen tragen das Präfix `lp-`. Danach die Anwendung prüfen: Kopfleiste ist oben angeheftet, Vollbild-Layouts mit `100vh` können dadurch minimal überlaufen.

## Gestaltung

Stil „Digital Library" mit warmer Fachfarbe: Der Aufbau ist ruhig (warmes Weiß `#f7f7f4`, dunkler Text, große Typografie, Linien in Listen). Die Wärme kommt aus flachen Fachtönungen (Biologie grün, Geografie rostrot, Werte unten), dezenten Fachmustern (`assets/img/muster/`), optionalen Themenbildern und weichen Schatten. Es gibt keine Verläufe, kein Glas und keine harten Schatten. Fachfarbe ist Punkt, Linie, Rahmen, Tönung oder Muster, der Text bleibt in Textfarbe. Alle Farben, Radien, Tönungen und Schatten stehen als Variablen am Anfang von `styles.css` bzw. `material.css`. Die Fachmuster sind rein dekorativ und werden per CSS-Maske in der Fachfarbe eingefärbt, sie folgen deshalb dem Dunkelmodus.

**Fachfarben (ein Satz für Portal, Materialseiten und Folien):**

| Rolle | Biologie | Geografie | Verwendung |
|---|---|---|---|
| Vollton | `#0F6E56` | `#A9442B` | Flächen mit weißem Text, Akzente (Schaltflächen, Aufgabenmarken) |
| Dunkel | `#0B4F3C` | `#7C2F1C` | dunkle Folien, Titel auf Weiß, Hover |
| Tint | `#E8F3EC` | `#F5EBE1` | Hilfe-, Karten- und Titelflächen |
| Ink | `#1A2B24` | `#2B211E` | Text auf Weiß und Tint |
| Grau | `#5B6A63` | `#7D726B` | Nebentext, nur auf weißem Grund |

Im Dunkelmodus gelten hellere Varianten (Biologie `#5FC8A4`, Geografie `#EE9A7F`, Tint `#1E322A` bzw. `#352A24`). Neue Farben vor der Verwendung auf Kontrast prüfen (Text 4,5:1, Bedienelemente 3:1). Es gibt keine Verläufe, kein Glas und keine Schatten hinter Text. Ausnahme: die Linien des Schreibraums (`.lp-schreib`) sind ein technisches Linienmuster, keine Farbfläche.

## Themenbilder (optional)

Statt nur Typografie kann rechts neben dem Titel ein Themenbild stehen. Das Bild steht neben dem Text, nie darunter oder dahinter. Das Fachmuster bleibt hinter dem Bild sichtbar.

- **Fachseite:** In `biologie/index.html` und `geografie/index.html` steht ein auskommentierter Block. Ergänze die Klasse `mit-bild` bei `band-inner` und entferne die Kommentarzeichen um die `figure`. Bild nach `assets/img/fach/biologie.webp` bzw. `geografie.webp` legen.
- **Materialseite:** Am `body` ergänzen: `data-bild="assets/img/<material>/titel.webp"` (Pfad ab Repository-Stamm), `data-bild-alt` und `data-bild-quelle`. Lädt das Bild nicht, verschwindet es.
- **Anforderungen:** 4:3, WebP, möglichst unter ca. 150 KB, eigene Bilder oder klare Lizenz, Urheber und Lizenz in der Quelle, keine erkennbaren Personen (besonders keine Minderjährigen) ohne Einwilligung, aussagekräftiger Alternativtext. Ohne `data-bild-alt` gilt das Bild als Dekoration.

Die Fachseiten zeigen Fotos (`assets/img/fach/biologie.webp`, `geografie.webp`), der Impuls der Woche ein Foto (`assets/img/impuls/blatt.webp`). Zum Ersetzen: Datei gleichen Namens überschreiben, Alternativtext und Bildunterschrift im HTML bzw. `bildAlt` und `bildQuelle` in `impuls.json` anpassen. **Vor der Veröffentlichung** müssen in den Bildunterschriften Urheber und Lizenz stehen (derzeit steht dort „Quelle und Lizenz ergänzen").

## Themenfelder

Die Themenfelder stammen aus dem Rahmenlehrplan Berlin-Brandenburg 2015, Teil C (RLP-Online, Kapitel „Themen und Inhalte“, Stand der veröffentlichten Fassung). Sie stehen in `themenfelder.json`. Die Fachseiten zeigen sie als Überblick nach Doppeljahrgangsstufe (7/8 und 9/10) mit der Anzahl der Materialien. Ein Klick wählt das Themenfeld im Filter, ein zweiter Klick hebt die Auswahl auf. Auch Themenfelder ohne Material erscheinen („Noch kein Material“), so ist die Struktur von Anfang an sichtbar.

**Neues Material einem Themenfeld zuordnen:** im Eintrag in `projects.json` nur die Nummer eintragen, z. B. `"themenfeld": "3.7"`. Der Ordner folgt der Empfehlung aus der Tabelle (`biologie/klasse-10/genetik/` oder wie bisher mit eigenem Thema, z. B. `biologie/klasse-10/mitose/`). Der Ordnername ist nur eine Empfehlung und kein RLP-Bestandteil.

**Themenfeldfarben:** Jedes Themenfeld hat Tint und Ink aus der Farbfamilie seines Fachs (Biologie Blaugrün bis Gelbgrün, Geografie Rotbraun bis Ocker). Sie hängen an Fach und Nummer, stehen als CSS-Variablen (`--tf-tint`, `--tf-ink`) am Ende von `assets/css/styles.css` und färben nur das Symbolfeld und die Nummer (Themenfelder-Überblick, Themenseite). Ink auf Tint hat mindestens 5:1, im Dunkelmodus gelten eigene Werte. Farbe ist Zugabe: Nummer, Symbol und Titel tragen die Information.

### Biologie

| Nr. | Themenfeld | Klassen | Ordnername (Empfehlung) |
|---|---|---|---|
| 3.1 | Die Zelle – kleinste Funktionseinheit des Lebendigen | 7/8 | `biologie/klasse-N/zelle/` |
| 3.2 | Lebensräume und ihre Bewohner – vielfältige Wechselwirkungen | 7/8 | `biologie/klasse-N/lebensraeume/` |
| 3.3 | Stoffwechsel des Menschen | 7/8 | `biologie/klasse-N/stoffwechsel/` |
| 3.4 | Sexualität, Fortpflanzung und Entwicklung (Je nach Stundenvolumen auch in 9/10 möglich) | 7/8 | `biologie/klasse-N/sexualitaet/` |
| 3.5 | Gesundheit – Krankheit | 9/10 | `biologie/klasse-N/gesundheit/` |
| 3.6 | Bau und Funktion des Nervensystems | 9/10 | `biologie/klasse-N/nervensystem/` |
| 3.7 | Genetik | 9/10 | `biologie/klasse-N/genetik/` |
| 3.8 | Evolution | 9/10 | `biologie/klasse-N/evolution/` |

### Geografie

| Nr. | Themenfeld | Klassen | Ordnername (Empfehlung) |
|---|---|---|---|
| 3.1 | Leben in Risikoräumen | 7/8 | `geografie/klasse-N/risikoraeume/` |
| 3.2 | Migration und Bevölkerung (Fächerverbund Gesellschaftswissenschaften) | 7/8 | `geografie/klasse-N/migration/` |
| 3.3 | Vielfalt der Erde | 7/8 | `geografie/klasse-N/vielfalt-der-erde/` |
| 3.4 | Armut und Reichtum (Fächerverbund Gesellschaftswissenschaften) | 7/8 | `geografie/klasse-N/armut-reichtum/` |
| 3.5 | Umgang mit Ressourcen | 9/10 | `geografie/klasse-N/ressourcen/` |
| 3.6 | Klimawandel und Klimaschutz als Beispiel für internationale Konflikte und Konfliktlösungen | 9/10 | `geografie/klasse-N/klimawandel/` |
| 3.7 | Wirtschaftliche Verflechtungen und Globalisierung | 9/10 | `geografie/klasse-N/globalisierung/` |
| 3.8 | Europa in der Welt (Fächerverbund Gesellschaftswissenschaften) | 9/10 | `geografie/klasse-N/europa/` |

Hinweise: Das Wahlpflichtfach (3.9) ist nicht aufgeführt. Die Nummern 3.1 bis 3.8 gibt es in beiden Fächern, sie unterscheiden sich durch Fach und Titel. Beim Biologie-Themenfeld 3.4 sieht der RLP vor, dass es je nach Stundenvolumen der 7/8 oder 9/10 zugeordnet werden kann. Die Geografie-Themenfelder 3.2, 3.4 und 3.8 werden im gesellschaftswissenschaftlichen Fächerverbund unterrichtet. Wird der RLP überarbeitet, `themenfelder.json` anpassen, ohne dass sich der Code ändern muss.

## Lesemodus

Das Symbol „Aa" in der Kopfleiste (Portal und Materialseiten) öffnet die Einstellungen: Schriftgröße (3 Stufen), Zeilenabstand und Darstellung (Auto, Hell, Dunkel). Gespeichert wird nur im Browser (`localStorage`), ohne Konto und ohne Übertragung. Die Einstellung gilt portalweit. Auf Vorlagenseiten wirken Schriftgröße und Zeilenabstand auf den ganzen Inhalt, bei eingehängten Anwendungen auf die Kopfleiste.

## GitHub Pages aktivieren

Im Repository unter **Settings → Pages** als Build source **Deploy from a branch** wählen, Branch `main`, Ordner `/(root)`, dann **Save**.

## Rechtstexte (Impressum, Datenschutz)

In `impressum/index.html` und `datenschutz/index.html` stehen Platzhalter in eckigen Klammern (Name, Anschrift, E-Mail, zuständige Gesellschaft von GitHub, Rechtsgrundlage, Aufsichtsbehörde, Datum). Sie müssen vor der Veröffentlichung ausgefüllt werden. Suche nach `[` in beiden Dateien. Die Texte sind keine Rechtsberatung. Offen sind: private oder dienstliche Anschrift, mögliche Anzeige- oder Genehmigungspflicht, Eignung von GitHub-Hosting für den Einsatz mit SuS. Das vorab mit Schulleitung bzw. Datenschutzbeauftragten klären.

## Eigene Domain bei GitHub Pages

1. Domain registrieren (Anbieter mit EU-Sitz, Whois-Datenschutz).
2. Unter **Settings → Pages → Custom domain** eintragen. GitHub legt `CNAME` im Stamm an.
3. DNS: `www` als CNAME auf `<Benutzername>.github.io`. Für die Apex-Domain die A-/AAAA-Einträge aus der aktuellen GitHub-Dokumentation „Managing a custom domain for your GitHub Pages site" übernehmen (nicht aus dem Gedächtnis eintragen).
4. Nach grüner DNS-Prüfung **Enforce HTTPS** aktivieren.
5. Danach läuft das Portal im Stamm der Domain statt unter `/lernportal/`. Relative Pfade bleiben gültig. Nach absoluten Pfaden mit `/lernportal/` suchen und ersetzen (aktuell keine vorhanden).

## Hinweis

Die Einträge in `projects.json` und `impuls.json` sind Beispiele. Vor dem produktiven Einsatz durch echte Inhalte ersetzen oder löschen.

## Beispiel: Erneuerbare Energien (Geografie 9)

Ordner `geografie/klasse-9/ressourcen/erneuerbare-energien/`, Themenfeld 3.5 „Umgang mit Ressourcen“. Zwei Doppelstunden als Materialseite (`index.html` mit `dateien` in `projects.json`): Stunde 1 (`praesentation/`), Stunde 2 Strom, Wärme, Verkehr (`heizen-verkehr/`, dazu `material/AB_Strom_Waerme_Verkehr.docx`, ein vierseitiges Materialheft) und ein Quiz (`quiz/`). **Der Erwartungshorizont liegt bewusst nicht im Repository.**

Beide Präsentationen folgen dem gemeinsamen Aufbau (Bühne 1280 × 720, `praesentation-design.css`, Fachfarbe Geografie, Andika) und haben Stift (P), Timer (T), Lärmampel (L) und Belohnungsspiele aus `assets/js/praesentation.js`. Eigene Ergänzungen für diese Stunden: `assets/energie.css` (nur Layout und Zustände, keine eigenen Farben), `assets/interaktiv.js` (interaktive Bausteine, arbeitet mit `data-ia`-Attributen, keine Speicherung), `assets/icons.js` (lokale Linien-Symbole) und `assets/qrcode.js` (QR-Code zum Quiz).

| Baustein (`data-ia`) | Wirkung |
|---|---|
| `tf` | Richtig oder falsch antippen, Rückmeldung erscheint (Do Now) |
| `qfield` | Fragefeld ist beschreibbar, Fragestarter fügen Text ein |
| `cards` | Karten antippen: Beispiel klappt auf |
| `cells` | Tabelle direkt auf dem Beamer beschriften |
| `tick` | Aufgaben abhaken |
| `toggle` | Pumpspeicher: Zustand „zu viel“ oder „zu wenig Strom“ wählen |
| `cover`, `gap` | Inhalte verdeckt, antippen zum Aufdecken. Lückensatz mit Wortkarten |
| `seg` | Balkenabschnitt antippen: Zahl dahinter |
| `vote` | Antippen gibt Stimmen für Maßnahmen |
| `sort` | Aussagen den Energiequellen zuordnen |
| `order` | Wirkungsketten in die richtige Reihenfolge bringen |
| `guess` | Anteile mit dem Regler schätzen, dann auflösen |
| `self` | Selbsteinschätzung (Sicher, Fast, Noch nicht), nichts wird gespeichert |
| `select` | Eine Möglichkeit auswählen |

Die Zeiten der Folien (`data-min`) ergeben je Stunde etwa 90 Minuten. Die Spielinhalte (`lp-spiel-daten`) sind ein Entwurf und gehören fachlich gegengelesen. Das Quiz ist eine eigene Anwendung mit Fragen in `quiz/fragen.js` (Format: siehe Kommentar in der Datei) und nutzt Farben und Dunkelmodus der Materialseite.
