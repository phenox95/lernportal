# Inhalte ergänzen

Anleitung für neue Materialien, die Felder in `projects.json`, Materialseiten, Impuls der Woche und Themenfelder.

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
| `reihe` | nein | Name der Unterrichtsreihe (Sequenz), z. B. `Vulkanismus`. Die Themenfeld-Seite gliedert ihre Materialien danach: je Reihe eine Überschrift mit Klasse und Anzahl, Reihen nach Klassenstufe sortiert, Materialien ohne Reihe unter „Weitere Materialien“. Gibt es nur eine Reihe und trägt sie den Namen des Themenfelds (oder fehlt `reihe`), bleibt die Liste flach. Die Reihe wird auch durchsucht. Ordner der Reihe: `geografie/klasse-7/risikoraeume/<stunde>/`. Gleiche Schreibweise für dieselbe Reihe verwenden |
| `folge` | nein | Zahl (1, 2, 3 …): Reihenfolge innerhalb einer Reihe. Ohne `folge` gilt die Reihenfolge in `projects.json` |
| `themenfeld` | nein | Nummer des RLP-Themenfelds, z. B. `3.1`. Das Portal ergänzt den offiziellen Titel aus `themenfelder.json`. Freier Text geht weiterhin, erscheint dann unter „Weitere“ im Filter (gleiche Schreibweise für gleiche Themenfelder) |
| `dauer` | nein | z. B. `Do Now`, `45 Min.`, `Doppelstunde` |
| `niveau` | nein | Niveaustufen D–H, nur eintragen, wenn gesichert |
| `datum` | nein | `JJJJ-MM-TT` |
| `sichtbar` | nein | `false` blendet Entwürfe aus (auch aus Zählern und Suche) |
| `status` | nein | Kleines Label, z. B. `Beispiel` |
| `bne` | nein | Liste von Nachhaltigkeitszielen (Zahlen 1–17, Titel in `bne.json`), z. B. `[13, 15]`. Wirkt als Filter „Nachhaltigkeit (BNE)“ auf Fachseiten und „Alle Materialien“, als Zeile „Nachhaltigkeit: …“ in der Liste, auf der Seite `bne/` und in „Verbindungen“ der Materialseite. Materialien beider Fächer mit gleichem Ziel gelten automatisch als verwandt |
| `verweise` | nein | Liste von Pfaden anderer Einträge (wie `path`), optional mit Grund: `["biologie/klasse-9/auge/", { "pfad": "geografie/klasse-7/risikoraeume/aetna-tourismus/", "grund": "Ein Satz, warum beide zusammengehören" }]`. Wirkt wechselseitig: Der Verweis erscheint auch beim Ziel. Sichtbar unter „Verbindungen“ auf der Materialseite |
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

## Themenfelder

Die Themenfelder stammen aus dem Rahmenlehrplan Berlin-Brandenburg 2015, Teil C (RLP-Online, Kapitel „Themen und Inhalte“, Stand der veröffentlichten Fassung). Sie stehen in `themenfelder.json`. Die Fachseiten zeigen sie als Überblick nach Doppeljahrgangsstufe (7/8 und 9/10) mit der Anzahl der Materialien. Ein Klick wählt das Themenfeld im Filter, ein zweiter Klick hebt die Auswahl auf. Auch Themenfelder ohne Material erscheinen („Noch kein Material“), so ist die Struktur von Anfang an sichtbar.

**Neues Material einem Themenfeld zuordnen:** im Eintrag in `projects.json` nur die Nummer eintragen, z. B. `"themenfeld": "3.7"`. Der Ordner folgt der Ordnerregel: erst der Themenfeld-Ordner aus der Tabelle, darunter das Thema (z. B. `biologie/klasse-10/genetik/mitose/`). Der Ordnername ist nur eine Empfehlung und kein RLP-Bestandteil.

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


## Vernetzung und Nachhaltigkeit (BNE)

- **Nachhaltigkeitsziele:** `bne.json` enthält die 17 Ziele (UN-Agenda 2030) mit Kurztitel. Bezug im RLP: übergreifendes Thema „Nachhaltige Entwicklung/Lernen in globalen Zusammenhängen“ (Teil B). Die Zuordnung zu einem Material trägst du selbst über das Feld `bne` ein. Nichts wird automatisch zugeordnet. Kurztitel in `bne.json` vor der Veröffentlichung gegenlesen.
- **Seite `bne/`:** kurze Erklärung (Ziele, BNE, Warum) oben, darunter die klickbare Grafik der 17 Ziele mit farbiger Zahl je Fach (grün Biologie, rot Geografie), unten die Tabelle Themenfelder × Ziele. Die Frage je Ziel steht in `bne.json` (Feld `frage`) und erscheint auf der Zielseite. `bne/?ziel=13` zeigt die Materialien beider Fächer, nach Fach gruppiert. Das Ziel lässt sich auch über die Adresse vorbelegen (`alle/?bne=13`).
- **Themenfelder verbinden:** In `themenfelder.json` kann jedes Themenfeld das optionale Feld `bezuege` tragen, z. B. `"bezuege": [{ "fach": "Geografie", "nr": "3.6", "grund": "Ein Satz" }]`. Es genügt, die Verbindung an einem der beiden Themenfelder einzutragen, sie erscheint an beiden. Verbindungen nur eintragen, wenn sie fachlich gesichert sind.
- **Darstellung:** Auf jeder Themenfeld-Seite zeigt die **Vernetzungskarte** das Themenfeld links und rechts Äste zu verbundenen Themenfeldern (auch des anderen Fachs) und zu den Nachhaltigkeitszielen seiner Materialien. Darunter sind die Materialien nach **Reihe** (Feld `reihe`) gruppiert, jede Reihe mit den Zielen ihrer Materialien. Die Seite `bne/` zeigt oben die **Übersicht Themenfelder × Ziele** als Tabelle.
- **Zuordnungsregel für `bne`:** Ein Ziel nur eintragen, wenn die Aufgabe oder das Urteil der Stunde es selbst behandelt, höchstens drei je Material. Materialien ohne Handlungs- oder Gesellschaftsbezug bekommen kein Ziel.
- **Prüfen:** `python3 tools/check.py` prüft `bne` (Zahlen 1–17), `verweise` (Pfad muss in `projects.json` stehen) und `bezuege` (Fach und Nummer müssen existieren).
- Präsentationen bleiben unverändert. Die Vernetzung erscheint nur in Portal, Listen und Materialseiten.
