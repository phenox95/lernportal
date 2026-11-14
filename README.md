# Lernportal

Zentrales Portal für digitale Unterrichtsmaterialien in Biologie und Geografie (Jg. 7–10). Reines HTML, CSS und JavaScript, ohne Build-Schritt, ohne externe Dienste.

## Aufbau

| Seite | Zweck |
|---|---|
| `index.html` | Startseite: Suche, zwei Fachbereiche, Impuls der Woche, Register nach Klassenstufe |
| `themenfelder.json` | Die offiziellen RLP-Themenfelder je Fach (Nummer, Titel, Doppeljahrgangsstufe, Ordnername). Steuert Themenfeld-Filter und Themenfelder-Überblick |
| `biologie/`, `geografie/` | Fachseiten mit Themenfelder-Überblick, Suche und Filtern (Klassenstufe, Art, Themenfeld) |
| `alle/` | Alle Materialien mit zusätzlichem Fachfilter. Das Register der Startseite verlinkt hierher (`alle/?klasse=8`) |
| `begriffe/` | Begriffe nachschlagen und üben, je Themenfeld (`begriffe/?fach=Biologie&nr=3.1`), verlinkt auf der Themenfeld-Seite. Liest die Spielinhalte der Präsentationen (`lp-spiel-daten`) und zeigt nur Blöcke mit `"geprueft": true`. Skript `assets/js/begriffe.js`, lädt bewusst kein `app.js`. Siehe [docs/praesentationen.md](docs/praesentationen.md) |
| `impressum/`, `datenschutz/` | Rechtstexte, in der Fußzeile aller Seiten verlinkt. Laden bewusst kein `app.js`. **Platzhalter in eckigen Klammern vor der Veröffentlichung ausfüllen** |
| `hilfe/` | Hilfeseite für Schülerinnen, Schüler und Lehrkräfte (Material finden, Lesemodus, als App nutzen, ohne Internet, Präsentation bedienen). Statischer Text, lädt kein `app.js` |
| `assets/js/nav.js` | Navigation aller Portalseiten aus **einer** Liste (`SEITEN`): Kopfleiste im breiten Fenster, Leiste am unteren Rand auf dem Handy. Jede Portalseite bindet die Datei mit `defer` ein. Auf der Startseite ergänzt sie den Knopf „Link und QR-Code“ (lädt `teilen.js` beim Antippen) |
| `manifest.json`, `sw.js`, `offline.html` | Portal als App (Symbol auf dem Startbildschirm) und Offline-Speicher: einmal geöffnete Seiten gehen ohne Internet. Angemeldet wird beides in `assets/js/prefs.js`. Siehe [docs/betrieb.md](docs/betrieb.md) |
| `404.html` | Seite für unbekannte Adressen (GitHub Pages zeigt sie von selbst), mit Weg zur Startseite |
| `projects.json` | Metadaten aller Materialien |
| `impuls.json` | Impuls der Woche (optional) |
| `woche/`, `nachrichten.json` | Seite „Thema der Woche“ (Foto, Erklärung, Material, aktuelle Meldungen, frühere Themen) und die Liste ausgewählter aktueller Meldungen nach Fach und Nachhaltigkeitsziel |
| `nachrichten/` | Seite „Nachrichten und Themenarchiv“: zwei Reiter (Meldungen, Themenarchiv; `#archiv` öffnet das Archiv), je mit Suche, Fachauswahl und Filter, nach Monat gruppiert (die zwei neuesten Monate offen), Kennzeichen „Neu“ (14 Tage) und Recherche-Tipps |
| `bne.json`, `bne/` | 17 Nachhaltigkeitsziele und die Seite „Nachhaltigkeit (BNE)“: Materialien beider Fächer nach Ziel. Zuordnung über das Feld `bne` in `projects.json` |
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

## Dokumentation

| Thema | Datei |
|---|---|
| Neues Material anlegen, Felder in `projects.json`, Materialseiten, Impuls der Woche, Themenfelder | [docs/inhalte-ergaenzen.md](docs/inhalte-ergaenzen.md) |
| Präsentationen: Grundaufbau, Stift, Timer, Lärmampel, Teilen mit QR-Code, Leseansicht (Nachlesen auf dem Handy), Fragenfeld, Belohnungsspiele, Begriffe-Seite | [docs/praesentationen.md](docs/praesentationen.md) |
| Gestaltung, Favicon, Themenbilder, Lesemodus | [docs/gestaltung.md](docs/gestaltung.md) |
| GitHub Pages, Rechtstexte, eigene Domain, App und Offline-Speicher | [docs/betrieb.md](docs/betrieb.md) |

**Wichtig:** Alles im Repository ist öffentlich. Nie hochladen: Erwartungshorizonte, Lehrkrafthinweise, Klassenarbeiten, Lösungen. Mehr dazu in [docs/inhalte-ergaenzen.md](docs/inhalte-ergaenzen.md).
