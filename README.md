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
| `assets/` | `css/`, `js/` (`app.js` Liste und Suche, `prefs.js` Lesemodus), keine Schriftdateien, es wird die Systemschrift des Geräts genutzt |

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

## Lesemodus

Das Symbol „Aa" in der Kopfleiste öffnet die Einstellungen: Schriftgröße (3 Stufen), Zeilenabstand und Darstellung (Auto, Hell, Dunkel). Gespeichert wird nur im Browser (`localStorage`), ohne Konto und ohne Übertragung.

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
