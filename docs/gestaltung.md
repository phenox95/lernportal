# Gestaltung

## Favicon

Das Portal-Icon (weißes L auf Grün und Rostrot, den beiden Fachfarben) liegt in `assets/favicon/`: `favicon.svg` (Vorlage, scharf in jeder Größe), `favicon.ico` (16, 32, 48 px), `favicon-32.png`, `favicon-48.png`, `favicon-192.png` und `apple-touch-icon.png` (180 px, deckender Hintergrund für iPad und iPhone). Jede HTML-Seite bindet es mit drei `<link>`-Zeilen im `<head>` ein, mit dem Weg zum Repository-Stamm davor (`../../assets/favicon/…`). Neue Seiten aus den Vorlagen haben die Zeilen schon. Fehlen sie, ergänzt `material.js` sie über `data-root`. Das Icon ändern: `favicon.svg` anpassen und die PNG- und ICO-Dateien daraus neu erzeugen (SVG in der Größe 32, 48, 180 und 192 px als PNG exportieren).

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

## Navigation

Die Navigation aller Portalseiten kommt aus `assets/js/nav.js` (Liste `SEITEN`). Ein neuer Bereich wird nur dort eingetragen. Die Links im HTML (`<nav class="top-nav">`) sind der Rückfall ohne JavaScript.

- **Breites Fenster (ab 46rem):** Kopfleiste mit Biologie, Geografie, Alle Materialien und „Mehr“ (Begriffe, Nachhaltigkeit, Nachrichten, Hilfe).
- **Handy:** feste Leiste am unteren Rand mit Start, Biologie, Geografie, Alle und „Mehr“. „Mehr“ öffnet ein Blatt mit den übrigen Bereichen (Escape oder Tipp daneben schließt). Der aktive Bereich ist fett und hat eine getönte Marke hinter dem Symbol, also nicht nur Farbe. Flache Fläche mit Linie, kein Glas. Die Leiste beachtet den sicheren Bereich des Geräts (`env(safe-area-inset-bottom)`).
- Materialseiten und Präsentationen haben diese Leiste bewusst nicht. Dort führt „Zurück zum Portal“ aus dem Material heraus.

**Startseite:** Suche, „Zuletzt geöffnet“ (nur wenn vorhanden), Fächer, Klassenstufen, Impuls der Woche, Aktuell, Fächerübergreifend. Die Wege zum Material stehen vor Impuls und Meldungen.

## Lesemodus

Das Symbol „Aa" in der Kopfleiste (Portal und Materialseiten) öffnet die Einstellungen: Schriftgröße (3 Stufen), Zeilenabstand und Darstellung (Auto, Hell, Dunkel). Gespeichert wird nur im Browser (`localStorage`), ohne Konto und ohne Übertragung. Die Einstellung gilt portalweit. Auf Vorlagenseiten wirken Schriftgröße und Zeilenabstand auf den ganzen Inhalt, bei eingehängten Anwendungen auf die Kopfleiste.

