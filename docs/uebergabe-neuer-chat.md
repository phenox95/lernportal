# Übergabe für einen neuen Chat: Lernportal (Struktur und Regeln)

Stand: 18.11.2026. Diese Datei fasst zusammen, wie das Portal aufgebaut ist und welche Regeln gelten. Die Langfassungen stehen in `README.md` und `docs/`. Wenn etwas hier und dort abweicht, gilt `docs/`.

## 1. Worum es geht

- **Lernportal** für Biologie und Geografie, Jg. 7–10 (ISS Berlin), Repository `phenox95/lernportal`, veröffentlicht über GitHub Pages (Branch `main`, Ordner Stamm). Reines HTML, CSS, JavaScript, **kein Build-Schritt, keine externen Dienste**.
- Die Lehrkraft plant kompetenzorientiert nach dem Rahmenlehrplan 1–10 Berlin-Brandenburg (Niveaustufen D–H, kein AFB-System). Die didaktische Master-Anweisung (Do Now, Impuls, Fragenentwicklung, Operatoren, Textniveau, LRS, Arbeitsblatt-Gestaltung) steht in den persönlichen Einstellungen der Lehrkraft und gilt in jedem Chat. Hier steht nur, was das Portal selbst betrifft.
- Alles im Repository ist **öffentlich**.

## 2. Ordner und Dateien

| Was | Wo |
|---|---|
| Startseite (Suche, Fachbereiche, Impuls der Woche, Register) | `index.html` |
| Fachseiten | `biologie/`, `geografie/` (Themenfelder-Überblick, Suche, Filter) |
| Alle Materialien (zusätzlich Fachfilter) | `alle/` |
| Themenfeld-Seite (Vernetzungskarte, Material nach Reihe, Meldungen) | `themenfeld/?fach=Biologie&nr=3.1` |
| Begriffe nachschlagen und üben (Kacheln 3 × 3 mit Begriffsanzahl) | `begriffe/` |
| Thema der Woche, frühere Themen | `woche/`, `impuls.json` |
| Meldungen und Themenarchiv | `nachrichten/`, `nachrichten.json` |
| Fakten-Check (Mythen, Quellencheck, Prüfbogen, Gesprächskarten) | `fakten/`, `mythen.json` |
| Nachhaltigkeit (17 Ziele) | `bne/`, `bne.json` |
| Hilfe, Impressum, Datenschutz, 404, Offline | `hilfe/`, `impressum/`, `datenschutz/`, `404.html`, `offline.html` |
| Navigation (eine Liste `SEITEN`) | `assets/js/nav.js` |
| App und Offline-Speicher | `manifest.json`, `sw.js` (Netz zuerst, max. 400 Kopien), angemeldet in `assets/js/prefs.js` |
| Metadaten aller Materialien | `projects.json` |
| RLP-Themenfelder (Nummer, Titel, Klassen, `slug`, `kurz`, `icon`, `bezuege`) | `themenfelder.json` |
| Präsentations-Werkzeuge | `assets/js/praesentation.js`, `assets/css/praesentation.css`, Design `praesentation-design.css`, Themenfeld-Farben `themenfarben.css` (erzeugt von `tools/themenfarben.py`) |
| Stunden-Bausteine (Zuordnen, Quiz, Mikroskop usw.) | `assets/css/stunde.css`, `assets/js/stunde.js` |
| Leseansicht, Begriffe-Spiele, QR-Code | in `praesentation.js`; `assets/js/begriffe.js`, `teilen.js`, `qrcode.js` |
| Vorlagen (nicht in `projects.json`) | `vorlage/`, `vorlage/materialseite/`, `vorlage/praesentation/` |
| Werkzeug-Seiten ohne Fach | `interaktiv/gruppen/` (Gruppen losen mit Sitzplan) |
| Prototypen, Daten | `labor/`, `daten/` (nicht in `projects.json`) |
| Prüfskripte und Werkzeuge | `tools/check.py`, `tools/foto.py`, `tools/daten-holen.py`, `tools/themenfarben.py` |
| Dokumentation | `README.md`, `docs/*.md` |

### Ordnerregel

```
<fach>/klasse-<n>/<themenfeld-slug>/[<reihe>/]<stunde>/
```

- `slug` kommt aus `themenfelder.json` und muss zur Nummer in `themenfeld` passen. Dateinamen klein, ohne Umlaute und Leerzeichen.
- Zieht ein Ordner um, bleibt an der alten Adresse eine `index.html` mit Weiterleitung (gedruckte QR-Codes).
- Fachübergreifende Werkzeuge liegen unter `interaktiv/<name>/` mit `subject: "Interaktiv"` (erscheinen nur in Suche und „Alle Materialien“).

## 3. Daten (alles datengetrieben)

- **`projects.json`**: Pflicht `title`, `subject` (Biologie, Geografie, Interaktiv), `grade`, `type`, `path` (endet mit `/`). Optional `description`, `themenfeld` (Nummer, z. B. `3.1`), `reihe`, `folge`, `dauer`, `niveau`, `datum` (JJJJ-MM-TT), `sichtbar` (false blendet aus, **schützt nicht**), `status`, `bne` (Ziele 1–17, höchstens drei, nur wenn die Stunde das Ziel selbst behandelt), `verweise`, `begriffe` (true nur mit `"geprueft": true` in den Spielinhalten), `fakten`, `dateien` (Materialseite mit Präsentation, Arbeitsblättern, Übung, Spiel, Hilfe; `art`, `stufe` 1–3 als ●○○ bis ●●●).
- **`impuls.json`**: Wochenplan `wochen` mit `ab`, `klasse`, `bne`, `frage`, `erklaerung`, `material`, `bild`, `bildAlt`, `bildQuelle`. Fotos als WebP, unter ca. 150 KB, 16:9, in `assets/img/impuls/`, Urheber und Lizenz in `bildQuelle`.
- **`nachrichten.json`**: `erlaubteQuellen` (Positivliste), `eintraege` mit `datum`, `titel`, `quelle`, `link`, `einordnung` (1–2 eigene Sätze), `faecher`, `bne`, optional `woche`, `themenfeld`, `bild`, `art` (Medienbericht, Regierung, Position), `sichtbar`.
- **`mythen.json`**: Aussage, `stimmt`, kurzer `fakt`, Quelle mit https-Link, optional `hinweis` bei Streitthemen.
- **Prüfen vor jedem Hochladen:** `python3 tools/check.py`. Fehler lassen den Lauf scheitern, Warnungen nicht. Dieselbe Prüfung läuft als GitHub Action „Portal prüfen“ bei jedem Pull Request. Sie prüft Pflichtfelder, Pfade und Ordnerregel, Themenfeld-Nummern, doppelte Pfade, Hosts der Meldungen gegen die Positivliste, Konsistenz Begriffe/geprüft, Fotos der Wochen, `manifest.json`, `sw.js`, `nav.js`.

## 4. Inhaltliche und rechtliche Regeln

1. **Nie hochladen:** Erwartungshorizonte, Lehrkrafthinweise, Klassenarbeiten, Lösungen für die Lehrkraft. Lösungen nur, wenn Schülerinnen und Schüler sie selbst per Knopf prüfen.
2. **Rechte:** Nur eigene oder klar lizenzierte Bilder und Texte (CC0, gemeinfrei, CC BY, CC BY-SA). Keine Schulbuchabbildungen. Urheber und Lizenz immer angeben. Fremdes nur verlinken. Keine erkennbaren Personen (besonders Minderjährige) ohne Einwilligung.
3. **Keine Namen von Schülerinnen und Schülern** in Werkzeugen. Gruppen-Generator und „Wer ist dran?“ arbeiten mit Nummern. Gespeichert wird nur lokal im Browser.
4. **Meldungen:** Nur seriöse Quellen aus `erlaubteQuellen` (öffentlich-rechtliche Medien, Bundesbehörden und Ministerien, bpb, Fachmedien, Verbände wie DUH und Germanwatch, außerdem `fluter.de` und `utopia.de`; **`web.de` bewusst nicht**). `utopia.de` ist ein privates Medium: `art: Medienbericht`, mit zweiter Quelle vergleichen. Nur verlinken und mit eigenen Worten einordnen, keine Artikeltexte oder Bilder kopieren. Titel und Datum prüfen. Bei Streitthemen mehrere Blickwinkel (Beutelsbacher Konsens), Positionen und Regierungsmeldungen als Sicht kennzeichnen.
5. **Nichts erfinden:** keine Standards, Themenfeld-Bezüge, Links, Lizenzen. Im Zweifel kennzeichnen („ungeprüft“).
6. **Benennung:** Fassungen nur über das Niveau (●○○ …) kennzeichnen. Keine „LRS“-Kennzeichnung in Titeln oder Dateinamen.
7. **Impressum und Datenschutz** haben noch Platzhalter in eckigen Klammern (Name, Anschrift, E-Mail …). Die Lehrkraft muss sie ausfüllen. Hosting mit Schulleitung und Datenschutzbeauftragten klären.
8. PDFs mit echtem Text exportieren (Vorlesefunktion), Foliennotizen entfernen, Bilder komprimieren.

## 5. Gestaltung

- Portal und Materialseiten: ruhiger Stil „Digital Library“, warmes Weiß `#f7f7f4`, **Systemschrift** (keine Schriftdatei). Fachfarben: Biologie grün (`#0F6E56`), Geografie rostrot (`#A9442B`). Fachfarbe nur für Punkt, Linie, Rahmen, Tönung, Muster, **nie für Text**. Keine Verläufe, kein Glas, keine harten Schatten. Kontrast: Text 4,5:1, Bedienelemente 3:1, Bedienelemente mindestens 44 px.
- Präsentationen: Schrift **Andika** (lokal in `assets/fonts/`), gemeinsames Design über `praesentation-design.css`, Farbe je Themenfeld über `data-tf` (aus dem Ordnernamen). Eigene Farben nur über `var(--g)`, `--dk`, `--mint`, `--fach-rgb`.
- Arbeitsblätter (Master-Anweisung): OpenDyslexic 9 pt, Rand 10 mm, nur Schwarz/Weiß/Grau, Zeichenbudget je A4-Seite, **nie** Schrift oder Ränder verkleinern, um Platz zu gewinnen. LRS-Fassung 12 pt, gleiche Aufgaben, weniger Text.
- Jg. 7–8 freundlich-sachlich mit viel Weißraum, Jg. 9–10 nüchtern und dicht.

## 6. Präsentationen (eine gemeinsame Datei für alle)

- Bühne `#stage` 1280 × 720, Folien `.slide`. Werkzeuge aus **einer** Datei (`praesentation.js`), eine Änderung gilt für alle Präsentationen. Startpunkt: `vorlage/praesentation/index.html`.
- Dock am rechten Rand: Portal, Vollbild (F), QR-Code (Q), Stift (P), Timer (T), Lärmampel (L), **Weitere Werkzeuge (W)**, Leseansicht.
- **Weitere Werkzeuge:** Blende (B, Milchglas, an allen Kanten ziehbar, verschwindet beim Folienwechsel), Wer ist dran? (Z, Nummern 1 bis N), Gruppen losen (G, Fenster mit drei Reitern), Stoppuhr (S), Notizzettel. Dazu der **Mini-Timer** (schwebt über der Folie, solange der Timer läuft und sein Fenster zu ist).
- Minutenangaben auf Folien (`.badge`, `.meta span`, `[data-minuten]`, Text beginnt mit „N Min.“) sind antippbar und starten den Timer. In der Leseansicht sind die Werkzeuge bewusst aus.
- **Leseansicht** (alle Folien untereinander, Handy): wählt die Breite über `wurzelEl.clientWidth >= LESE_BREIT`, nicht über `innerWidth`.
- Pro Präsentation genau eine echte `h1`, weitere Folientitel bekommen `role="heading" aria-level="2"`.
- **Begriffe:** Spielinhalte stehen als `<script id="lp-spiel-daten">` mit `"geprueft": true` in der Präsentation und `begriffe: true` in `projects.json`. Die Seite `begriffe/` zeigt nur geprüfte Blöcke (`&entwurf=1` für die Lehrkraft).
- **Gruppen-Generator** (`interaktiv/gruppen/`): Plätze als Raster, Gänge, Nummern tauschen, Pläne speichern (nur Raster und Nummern), Einteilung nach Anzahl oder Größe, zufällig oder Sitznachbarn, Gruppen heißen **A, B, C …** (Platznummer = Zahl, damit man sich nicht zwei Zahlen merken muss). **Nummern gehören zum Kind** und ändern sich beim Entfernen oder Tauschen von Plätzen nicht, Lücken sind gewollt, Neunummerierung nur nach Rückfrage.

## 7. Arbeitsweise im Entwicklungs-Chat

- Sprache Deutsch, ehrlich berichten, nicht Geprüftes als nicht geprüft benennen.
- Ablauf: ändern, `python3 tools/check.py`, mit Playwright testen (lokaler `python3 -m http.server`, Desktop und 390 px Breite, Konsolenfehler beobachten), committen, auf den Session-Branch pushen. **Pull Request nur auf Anfrage**; die Lehrkraft sagt „PR erstellen und mergen“, dann wird der PR erstellt und mit `merge_method: merge` gemerged.
- Commit-Anhang: `Co-Authored-By` und `Claude-Session`-Zeile laut Session-Vorgabe. Auf keinen Fall ein Modellname im Repository.
- **Kein Force-Push.** Wird der Branch nach einem Merge zurückgesetzt, `main` in den Branch mergen und normal pushen (der Stop-Hook meldet danach nur Merge-Commits als „unpushed“: einfach `git push`).
- Hochgeladene ZIP-Updates: in den Scratchpad entpacken, gegen `HEAD` vergleichen, Basis-Commit finden, bei Bedarf 3-Wege-Merge (`git merge-file`), verlorene Zeilen neu einsetzen, testen, dann einarbeiten.
- Keine temporären Dateien (z. B. `__pycache__`) committen.
- Neue Dokumentation immer an den passenden Stellen in `README.md` und `docs/` nachziehen. Änderungen an Regeln durchgängig einarbeiten, nicht als Zusatzregel.

## 8. Routine (alle zwei Wochen)

- Eine geplante Routine sucht aktuelle Meldungen (nur aus der Positivliste) und Fotos für die Wochenthemen und legt dazu **einen Pull Request** an. Sie mergt nie selbst. Die Lehrkraft prüft vor dem Merge Quellen, Einordnung und Zuordnung zu Medienbericht, Regierung oder Position.
- Fotos: `python3 tools/foto.py commons "Datei.jpg" ziel.webp --fokus x,y` (nur CC0, gemeinfrei, CC BY, CC BY-SA, zwei Anfragen je Bild, bei HTTP 429 sofort abbrechen) oder `lokal` mit `--urheber` und `--lizenz`.
- Die Cloud-Umgebung hat eine Positivliste erlaubter Hosts (u. a. Wikimedia, ZDFheute, BMUKN). Neue Hosts trägt die Lehrkraft in den Umgebungs-Einstellungen ein.

## 9. Offen (Stand 18.11.2026)

- Impressum und Datenschutz: Name, Anschrift (PLZ Berlin), E-Mail eintragen.
- Windrad-Foto: Urheber und Lizenz von „Energiewende_-_Windräder_hinter_einer_Siedlung.jpg“.
- Fotos für die Wochen 07.12. (Ätna Landwirtschaft) und 04.01. (Klimawandel).
- Quelle und Lizenz von `assets/img/fach/biologie.webp` und `geografie.webp`.
- Stimmungsbilder für die Schlussfolien (Ordner der Lehrkraft, mit Urheber und Lizenz) und Plan, eine Schlussfolie je Präsentation.
- „Wer ist dran?“ soll nur besetzte Nummern aus dem Sitzplan losen (Entscheidung der Lehrkraft offen).
- Routine-PR vom 16.11. (#113) wurde gemerged, aber nicht inhaltlich gegengelesen.
- `web.de`/`www.web.de` stehen noch in den erlaubten Hosts der Umgebung (kann entfernt werden).
- Tests auf einem echten Handy und Beamer: Navigation, Offline-Seite, Leseansicht, Milchglas-Blende, Gruppen-Fenster.
- Entscheidung zu E-Fuels und `quelle/template.html`.
