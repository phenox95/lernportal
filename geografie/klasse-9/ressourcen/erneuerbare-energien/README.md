# Erneuerbare Energien · Geografie 9

Zwei Doppelstunden (je 90 Minuten) als Webseite: **Präsentationen** mit Referentenansicht, ein **Quiz** für Teams oder Einzelspiel und ein **Arbeitsblatt** als Word-Datei. Läuft im Browser, ohne Anmeldung, ohne Cookies und ohne Verbindung zu fremden Servern. Schrift, Symbole und QR-Code liegen im Projekt, deshalb funktioniert alles auch offline.

## Inhalt

| Ordner | Was dort liegt |
|---|---|
| `index.html` | Startseite mit Zugang zu beiden Teilen |
| `praesentation/` | Stunde 1: 12 Folien, Notizen, Referentenansicht mit Uhr |
| `heizen-verkehr/` | Stunde 2 (Strom, Wärme, Verkehr): 11 Folien und `material/` mit Arbeitsblatt (docx). Der Erwartungshorizont liegt bewusst nicht im Portal |
| `quiz/` | Quiz mit 29 Fragen (`fragen.js`), Spiellogik (`quiz.js`) |
| `assets/` | Gemeinsames Design (`design.css`), Symbole (`icons.js`), Schrift, QR-Bibliothek |

## Benutzen

**Lokal:** Ordner herunterladen, `index.html` doppelklicken. Fertig. Auch vom USB-Stick.

**Über GitHub Pages (für die Klasse per Link oder QR-Code):**

1. Neues Repository auf GitHub anlegen und den Inhalt dieses Ordners hochladen (Dateien direkt in die Wurzel, nicht in einen Unterordner).
2. Im Repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, Ordner `/ (root)`** und speichern.
3. Nach etwa einer Minute ist die Seite unter `https://<benutzername>.github.io/<repository>/` erreichbar.
4. Der QR-Code auf Folie 9 erzeugt sich selbst aus der Adresse der Seite. Öffne die Präsentation über die Pages-Adresse, dann führt der Code direkt zum Quiz.

Die Datei `.nojekyll` sorgt dafür, dass GitHub die Dateien unverändert ausliefert.

## Präsentation bedienen

| Taste | Wirkung |
|---|---|
| `→`, `Leertaste`, Bild ab | nächste Folie (funktioniert auch mit Presenter-Klicker) |
| `←`, Bild auf | vorherige Folie |
| `P` | Referentenansicht in neuem Fenster (Notizen, Uhr, Zeitplan), bleibt mit dem Beamer-Fenster synchron |
| `N` | Notizen als Schublade |
| `F` | Vollbild |
| `?` | Hilfe |

Auf Touchgeräten wischt man. Auf schmalen Bildschirmen (Handy, Tablet hochkant) werden die Folien einspaltig und scrollen senkrecht. Wischen nach links oder rechts wechselt die Folie. Eine Folie lässt sich direkt verlinken, zum Beispiel `…/praesentation/#5`.

**Referentenansicht:** Das zweite Fenster auf den Laptop legen, das erste auf den Beamer ziehen. Die Uhr startet mit dem Knopf und zeigt, ob du vor oder hinter dem Plan der aktuellen Folie liegst. Der Plan summiert sich auf 85 Minuten, dazu kommen etwa 5 Minuten Puffer für Übergänge.

## Quiz anpassen

Alle Fragen stehen in `quiz/fragen.js`. Vier Typen:

```js
{type:"mc", q:"Frage?", o:["richtige Antwort","falsch","falsch","falsch"], e:"Erklärung", s:"Quelle"}
{type:"pt", item:"Windkraft", a:0, e:"Erklärung"}      // a: 0 erneuerbar, 1 fossil, 2 weder noch
{type:"rd", clues:["Hinweis 1","Hinweis 2","Hinweis 3","Hinweis 4"], o:["richtig","falsch","falsch","falsch"], e:"Erklärung"}
{type:"ff", q:"Aussage.", a:true, e:"Erklärung"}      // Fakt oder Fake
```

Bei `mc` und `rd` steht die **richtige Antwort immer an erster Stelle**. Beim Spielen wird gemischt. `s` ist optional und erscheint als Quellenangabe unter der Erklärung.

## Zur Gestaltung

Das Design setzt Prinzipien um, die man von hochwertigen Produktseiten kennt, ohne sie zu kopieren: eine Aussage pro Fläche, große enge Überschriften, viel Weißraum, weiche Flächen mit konzentrischen Radien, Glas-Leisten, abwechselnd helle und dunkle Kapitel, Quellen als Fußnoten. Farben, Schrift und Symbole sind eigen (Petrol und Sonnengelb, Atkinson Hyperlegible, selbst gezeichnete Linien-Symbole).

Die Bewegung folgt der Emil-Methode:

| Regel | Umsetzung |
|---|---|
| Nur `transform` und `opacity` animieren | Ausnahme: Ringdiagramm der Folie 2, das erklärend zeichnet |
| Keine Standardkurven, nie `ease-in` | `--ease-out`, `--ease-in-out`, `--ease-drawer` in `assets/design.css` |
| Unter 300 ms für Bedienelemente | Drücken 140 ms, Einblenden 220 ms, Ausblenden 140 ms |
| Tastatur-Aktionen nicht animieren | `data-input="key"` schaltet Übergänge ab, sobald eine Taste gedrückt wurde |
| Druckfeedback | `scale(0.97)` bei `:active` |
| Nie aus `scale(0)` | Einblenden mit Deckkraft und 10 px Versatz |
| Hover nur mit Maus | `@media (hover: hover) and (pointer: fine)` |
| Gestaffelt statt gleichzeitig | 50 ms Abstand bei Antworten und Ranglisten |
| Reduzierte Bewegung respektieren | `prefers-reduced-motion` setzt Versatz und Skalierung auf null |

Barrierefreiheit: Antworten werden nie nur über Farbe angezeigt (Haken und Kreuz), alle Bedienelemente sind per Tastatur erreichbar, Zustandsänderungen werden über `aria-live` angesagt, die Schrift ist auf gute Lesbarkeit ausgelegt.

## Quellen und Lizenzen

- **Film:** *total phänomenal: Windenergie und Wasserkraft*, planet schule / SWR. Der Film ist nicht enthalten. Die Präsentation verlinkt auf die Seite des Anbieters.
- **Zahlen:** BDEW/ZSW (Dezember 2025), dpa (2025); Stunde 2: Umweltbundesamt/AGEE-Stat (2025), BDEW (Beheizungsstruktur 2025), Kraftfahrt-Bundesamt (Bestand 1.1.2026, Neuzulassungen 2025). Einzelnachweise stehen an den Fragen, Folien und Arbeitsblättern.
- **Code:** MIT-Lizenz, siehe `LICENSE`. Bitte dort deinen Namen eintragen.
- **Schrift:** Atkinson Hyperlegible, SIL Open Font License 1.1.
- **QR-Code:** qrcode-generator von Kazuhiko Arase (MIT).

## Prüfen

Getestet mit Chromium bei 1024×768, 1280×720, 1366×768, 1600×900 und 1920×1080 (kein Überlauf auf den Folien) sowie bei 390×844 (Handy hochkant), 820×1180 (Tablet hochkant) und 844×390 (Handy quer) für Quiz und Präsentation (kein horizontaler Überlauf). Bitte vor dem Unterricht einmal am Beamer des Klassenraums öffnen.
