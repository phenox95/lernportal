# Lernportal

Zentrales Portal für digitale Unterrichtsmaterialien in Biologie und Geografie (Jg. 7–10). Reines HTML, CSS und JavaScript, ohne Build-Schritt, ohne externe Dienste.

## Aufbau

| Seite | Zweck |
|---|---|
| `index.html` | Startseite: Suche, zwei Fachbereiche, Impuls der Woche, Register nach Klassenstufe |
| `themenfelder.json` | Die offiziellen RLP-Themenfelder je Fach (Nummer, Titel, Doppeljahrgangsstufe, Ordnername). Steuert Themenfeld-Filter und Themenfelder-Überblick |
| `biologie/`, `geografie/` | Fachseiten mit Themenfelder-Überblick, Suche und Filtern (Klassenstufe, Art, Themenfeld) |
| `alle/` | Alle Materialien mit zusätzlichem Fachfilter. Das Register der Startseite verlinkt hierher (`alle/?klasse=8`) |
| `kalender/`, `kalender.json` | Stundenkalender für Schülerinnen und Schüler: Lerngruppe wählen (Klasse und Fach, z. B. „7b · Geografie“), Monatsraster mit Unterrichtstagen und Einträgen, „Nächste Stunde“ und die Liste „Was war dran?“ mit Links zum Material (bei Präsentationen auch „Nachlesen“). Die Lerngruppen mit Wochenrhythmus (Wochentag und Stunde, **keine Räume, keine Namen**) und die Einträge stehen in `kalender.json`. Skript `assets/js/kalender.js`, Stil `assets/css/kalender.css`, lädt kein `app.js`. Siehe [docs/inhalte-ergaenzen.md](docs/inhalte-ergaenzen.md) |
| `begriffe/` | Begriffe nachschlagen und üben, je Themenfeld (`begriffe/?fach=Biologie&nr=3.1`), verlinkt auf der Themenfeld-Seite. Liest die Spielinhalte der Präsentationen (`lp-spiel-daten`) und zeigt nur Blöcke mit `"geprueft": true`. Skript `assets/js/begriffe.js`, lädt bewusst kein `app.js`. Siehe [docs/praesentationen.md](docs/praesentationen.md) |
| `impressum/`, `datenschutz/` | Rechtstexte, in der Fußzeile aller Seiten verlinkt. Laden bewusst kein `app.js`. **Platzhalter in eckigen Klammern vor der Veröffentlichung ausfüllen** |
| `hilfe/` | Hilfeseite für Schülerinnen, Schüler und Lehrkräfte (Material finden, Lesemodus, als App nutzen, ohne Internet, Präsentation bedienen). Statischer Text, lädt kein `app.js` |
| `assets/js/nav.js` | Navigation aller Portalseiten aus **einer** Liste (`SEITEN`): Kopfleiste im breiten Fenster, Leiste am unteren Rand auf dem Handy. Jede Portalseite bindet die Datei mit `defer` ein. Auf der Startseite ergänzt sie den Knopf „Link und QR-Code“ (lädt `teilen.js` beim Antippen) |
| `manifest.json`, `sw.js`, `offline.html` | Portal als App (Symbol auf dem Startbildschirm) und Offline-Speicher: einmal geöffnete Seiten gehen ohne Internet. Angemeldet wird beides in `assets/js/prefs.js`. Siehe [docs/betrieb.md](docs/betrieb.md) |
| `404.html` | Seite für unbekannte Adressen (GitHub Pages zeigt sie von selbst), mit Weg zur Startseite |
| `projects.json` | Metadaten aller Materialien |
| `impuls.json` | Impuls der Woche (optional) |
| `woche/`, `nachrichten.json` | Seite „Thema der Woche“ (Foto, Erklärung, Material, aktuelle Meldungen, frühere Themen) und die Liste ausgewählter aktueller Meldungen nach Fach und Nachhaltigkeitsziel |
| `fakten/`, `mythen.json` | Seite „Fakten-Check“ für Kinder und Jugendliche: Mythen-Check (Aussage antippen, Antwort mit Quelle), Quellencheck in fünf Fragen, Prüfbogen zu einer Meldung, „Gleiches Thema, andere Sicht“, Faktensandwich und druckbare Gesprächskarten. Aussagen stehen in `mythen.json`, Material kommt aus `projects.json` mit `"fakten": true`. Eigener Eintrag in der Navigation (`assets/js/nav.js`), Suchwörter wie „fake“ oder „stimmt“ führen auf der Startseite hierher |
| `nachrichten/` | Seite „Nachrichten und Themenarchiv“: zwei Reiter (Meldungen, Themenarchiv; `#archiv` öffnet das Archiv), je mit Suche, Fachauswahl und Filter, nach Monat gruppiert (die zwei neuesten Monate offen), Kennzeichen „Neu“ (14 Tage) und Recherche-Tipps |
| `bne.json`, `bne/` | 17 Nachhaltigkeitsziele und die Seite „Nachhaltigkeit (BNE)“: Materialien beider Fächer nach Ziel. Zuordnung über das Feld `bne` in `projects.json` |
| `labor/`, `daten/` | Prototypen neuer Werkzeuge (Karte ohne Karte, Länder-Quiz, Räuber-Beute, Vorlesen, Do Now, Seismograf, Farbmesser, QR-Rückkanal) und die Dateien, die `tools/daten-holen.py` aus offenen Quellen erzeugt. Nicht in `projects.json`. Siehe [docs/ideen-native-nutzung.md](docs/ideen-native-nutzung.md) |
| `vorlage/` | Vorlagen: `vorlage/` (Materialseite mit Aufgaben), `vorlage/materialseite/` (Seite pro Thema mit Dateiliste) und `vorlage/praesentation/` (Grundaufbau einer Präsentation mit Stift, Timer und Lärmampel). Alle mit einheitlicher Kopfleiste. Steht nicht in `projects.json`, ist also nicht im Portal sichtbar |
| `assets/` | `css/` (`styles.css` Portal, `material.css` Materialseiten), `js/` (`qrcode.js` QR-Codes für Präsentationen, `app.js` Liste und Suche, `prefs.js` Lesemodus, `material.js` Kopfleiste und Titelblock der Materialseiten, `materialseite.js` Dateiliste der Themenseite), `css/materialseite.css` (Stile der Themenseite), `js/praesentation.js` und `css/praesentation.css` (Werkzeuge für Präsentationen), `js/lernmodul.js` und `css/lernmodul.css` (Übungen mit Selbstprüfung für Lernmodule: Reihenfolge, Ablage, Ja/Nein-Tabelle, Entdecker, Signal-Modell, siehe docs/inhalte-ergaenzen.md), `img/muster/` (Fachmuster als SVG), `img/fach/` (optionale Themenbilder der Fachseiten), `fonts/` (Andika, **nur für Präsentationen**), `games/` (Belohnungsspiele ohne Fachinhalte). Portal und Materialseiten laden keine Schriftdatei und nutzen die Systemschrift des Geräts |

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

## Dokumentation

| Thema | Datei |
|---|---|
| Neues Material anlegen, Felder in `projects.json`, Materialseiten, Impuls der Woche, Themenfelder | [docs/inhalte-ergaenzen.md](docs/inhalte-ergaenzen.md) |
| Präsentationen: Grundaufbau, Stift, Timer, Lärmampel, Teilen mit QR-Code, Leseansicht (Nachlesen auf dem Handy), Fragenfeld, Belohnungsspiele, Begriffe-Seite | [docs/praesentationen.md](docs/praesentationen.md) |
| Ideen und Prototypen: Browser-Funktionen, Sensoren, Datenpipeline, Rückkanal ohne Server | [docs/ideen-native-nutzung.md](docs/ideen-native-nutzung.md) |
| Ideen und Recherche nach Fach und Themenfeld geordnet (Lizenz-Ampel, Lücken) | [docs/ideen-nach-themenfeld.md](docs/ideen-nach-themenfeld.md) |
| Gestaltung, Favicon, Themenbilder, Lesemodus | [docs/gestaltung.md](docs/gestaltung.md) |
| GitHub Pages, Rechtstexte, eigene Domain, App und Offline-Speicher | [docs/betrieb.md](docs/betrieb.md) |

**Wichtig:** Alles im Repository ist öffentlich. Nie hochladen: Erwartungshorizonte, Lehrkrafthinweise, Klassenarbeiten, Lösungen. Mehr dazu in [docs/inhalte-ergaenzen.md](docs/inhalte-ergaenzen.md).
