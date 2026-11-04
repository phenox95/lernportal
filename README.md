# Lernportal

Zentrales Portal für digitale Unterrichtsmaterialien in Biologie und Geografie (Jg. 7–10). Reines HTML, CSS und JavaScript, ohne Build-Schritt, ohne externe Dienste.

## Aufbau

| Seite | Zweck |
|---|---|
| `index.html` | Startseite: Suche, zwei Fachbereiche, Impuls der Woche, Register nach Klassenstufe |
| `biologie/`, `geografie/` | Fachseiten mit Suche und Filtern (Klassenstufe, Art, Themenfeld) |
| `alle/` | Alle Materialien mit zusätzlichem Fachfilter. Das Register der Startseite verlinkt hierher (`alle/?klasse=8`) |
| `impressum/`, `datenschutz/` | Rechtstexte, in der Fußzeile aller Seiten verlinkt. Laden bewusst kein `app.js`. **Platzhalter in eckigen Klammern vor der Veröffentlichung ausfüllen** |
| `projects.json` | Metadaten aller Materialien |
| `impuls.json` | Impuls der Woche (optional) |
| `vorlage/` | Vorlage für Materialseiten mit einheitlicher Kopfleiste. Steht nicht in `projects.json`, ist also nicht im Portal sichtbar |
| `assets/` | `css/` (`styles.css` Portal, `material.css` Materialseiten), `js/` (`app.js` Liste und Suche, `prefs.js` Lesemodus, `material.js` Kopfleiste und Titelblock der Materialseiten), `img/muster/` (Fachmuster als SVG), `img/fach/` (optionale Themenbilder der Fachseiten), keine Schriftdateien, es wird die Systemschrift des Geräts genutzt |

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
| `type` | ja | Enthält das Wort *Präsentation*, *Modul* oder *interaktiv/Spiel/Simulation/Quiz*, greift der Filter „Art". Das Wort bestimmt auch das Symbol. |
| `path` | ja | Relativer Pfad im Repository, z. B. `biologie/klasse-8/zelle/` |
| `description` | nein | Wird durchsucht |
| `themenfeld` | nein | Erzeugt den Themenfeld-Filter. Gleiche Schreibweise für gleiche Themenfelder |
| `dauer` | nein | z. B. `Do Now`, `45 Min.`, `Doppelstunde` |
| `niveau` | nein | Niveaustufen D–H, nur eintragen, wenn gesichert |
| `datum` | nein | `JJJJ-MM-TT` |
| `sichtbar` | nein | `false` blendet Entwürfe aus (auch aus Zählern und Suche) |
| `status` | nein | Kleines Label, z. B. `Beispiel` |

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

## Gestaltung

Stil „Digital Library" mit warmer Fachfarbe: Der Aufbau ist ruhig (warmes Weiß `#f7f7f4`, dunkler Text, große Typografie, Linien in Listen). Die Wärme kommt aus flachen Fachtönungen (Biologie grün, Geografie ocker), dezenten Fachmustern (`assets/img/muster/`), optionalen Themenbildern und weichen Schatten. Es gibt keine Verläufe, kein Glas und keine harten Schatten. Fachfarbe ist Punkt, Linie, Rahmen, Tönung oder Muster, der Text bleibt in Textfarbe. Alle Farben, Radien, Tönungen und Schatten stehen als Variablen am Anfang von `styles.css` bzw. `material.css`. Die Fachmuster sind rein dekorativ und werden per CSS-Maske in der Fachfarbe eingefärbt, sie folgen deshalb dem Dunkelmodus.

## Themenbilder (optional)

Statt nur Typografie kann rechts neben dem Titel ein Themenbild stehen. Das Bild steht neben dem Text, nie darunter oder dahinter. Das Fachmuster bleibt hinter dem Bild sichtbar.

- **Fachseite:** In `biologie/index.html` und `geografie/index.html` steht ein auskommentierter Block. Ergänze die Klasse `mit-bild` bei `band-inner` und entferne die Kommentarzeichen um die `figure`. Bild nach `assets/img/fach/biologie.webp` bzw. `geografie.webp` legen.
- **Materialseite:** Am `body` ergänzen: `data-bild="assets/img/<material>/titel.webp"` (Pfad ab Repository-Stamm), `data-bild-alt` und `data-bild-quelle`. Lädt das Bild nicht, verschwindet es.
- **Anforderungen:** 4:3, WebP, möglichst unter ca. 150 KB, eigene Bilder oder klare Lizenz, Urheber und Lizenz in der Quelle, keine erkennbaren Personen (besonders keine Minderjährigen) ohne Einwilligung, aussagekräftiger Alternativtext. Ohne `data-bild-alt` gilt das Bild als Dekoration.

Die Fachseiten zeigen Fotos (`assets/img/fach/biologie.webp`, `geografie.webp`), der Impuls der Woche ein Foto (`assets/img/impuls/blatt.webp`). Zum Ersetzen: Datei gleichen Namens überschreiben, Alternativtext und Bildunterschrift im HTML bzw. `bildAlt` und `bildQuelle` in `impuls.json` anpassen. **Vor der Veröffentlichung** müssen in den Bildunterschriften Urheber und Lizenz stehen (derzeit steht dort „Quelle und Lizenz ergänzen").

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
