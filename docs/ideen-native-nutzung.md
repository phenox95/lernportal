# Ideen: Das Portal „nativer“ nutzen

Stand: 16.11.2026. Ideenkatalog mit Prototypen (Ordner `labor/`). Ziel: Funktionen des Browsers und des Internets so einsetzen, dass sie **den Unterricht logischer und einfacher machen**, nicht nur moderner aussehen. Jede Idee hat einen didaktischen Zweck, einen Kompetenzbezug, eine Datenschutz-Einschätzung und einen Aufwand.

Status-Zeichen: ✅ Prototyp lauffähig und getestet · 🧪 Prototyp, aber Teile nur simuliert getestet · 💡 Idee, noch nicht gebaut

## 1. Leitplanken

Diese Regeln folgen aus dem, was das Portal schon ist (statisch, offline-fähig, Datenschutzerklärung „lädt nichts von fremden Servern nach“).

1. **Nichts Fremdes zur Laufzeit.** Externe Daten holt ein Skript **vorher** (`tools/daten-holen.py`, optional als GitHub Action), die Seiten lesen nur eigene Dateien. Das ist schnell, offline nutzbar (Service Worker), ohne CORS-Probleme und ohne dass ein Dritter IP-Adressen der Klasse sieht. Wo ein Live-Abruf unverzichtbar wäre, nur auf Knopfdruck der Lehrkraft und mit Hinweis in der Datenschutzerklärung.
2. **Progressive Verbesserung.** Jede Funktion prüft, ob der Browser sie kann. Fehlt sie (Safari, altes Schulgerät), bleibt die Seite benutzbar, nur ohne den Zusatz. Nie ein leerer Bildschirm.
3. **Sensoren und Kamera nur nach Antippen**, nur im Browser ausgewertet, nichts aufgenommen, gespeichert oder gesendet. Das steht sichtbar auf der Seite.
4. **Kein Konto, keine Namen.** Alles, was gemerkt wird, liegt im Browser des Geräts (wie der Lesemodus) oder steckt in einem Code, den man bewusst zeigt.
5. **Didaktik vor Technik.** Jede Idee hängt an einem Schritt der Planungslogik (Do Now, Impuls, Leitfrage, Erarbeitung, Sicherung, Reflexion) und lässt die Klasse etwas **tun**: beschreiben, messen, vermuten, vergleichen, erklären.
6. **Sprachbildung und LRS eingebaut statt aufgesetzt.** Vorlesen, Mehrsprachigkeit und klare Bedienung sind Teil der Bausteine.
7. **Echte Daten kennzeichnen.** Beispiel- oder Simulationsdaten tragen sichtbar „simuliert“ (siehe Erdbeben-Prototyp). Quellenangabe und Abrufdatum stehen auf der Seite (Medienbildung: Quellen prüfen).

## 2. Architektur: Datenpipeline statt Live-Abruf

```
Offene Quelle (USGS, DWD, Natural Earth, …)
   │  tools/daten-holen.py   (von Hand oder GitHub Action „Daten aktualisieren“, als Pull Request)
   ▼
daten/*.json  (klein, mit Quelle und Abrufdatum)  ──►  Seite liest nur Dateien des Portals
                                                        Service Worker legt sie offline ab
```

Vorteile gegenüber `fetch` zu fremden Servern: Datenschutz (keine IP-Weitergabe), keine Ausfälle im Schul-WLAN, kein CORS, kein Schlüssel, die Lehrkraft prüft die Daten im Pull Request vor dem Einsatz, die Stunde ist reproduzierbar (die Daten ändern sich nicht mitten in der Sequenz). Nachteil: nicht sekundengenau „live“. Für den Unterricht reicht „aktuell vom Montag“ fast immer, und das lässt sich sogar als Lernanlass nutzen („Wie alt sind die Daten?“).

Umgesetzt: `tools/daten-holen.py` mit den Befehlen `karte`, `laender`, `erdbeben`, `demo`; `.github/workflows/daten.yml` (nur von Hand, erzeugt einen Pull Request); Ordner `daten/`.

## 3. Prototypen (alle unter `labor/`)

| Prototyp | Idee | Kompetenz / Phase | Status |
|---|---|---|---|
| `assets/js/referent.js` (eingebunden in `vorlage/praesentation/`) | **Referentenansicht**: Zweitfenster mit nächster Folie, Hinweisen, Uhr, Blätterknöpfen. Taste R. Hält außerdem den Bildschirm wach | Unterrichtsführung, alle Phasen | ✅ getestet mit der Vorlage (zwei Fenster, Hinweise, Vorschau, Blättern) |
| `labor/erdbeben/` | **Karte ohne Karte**: Erdbebenpunkte ohne Küsten, die Klasse beschreibt und fragt, dann Küsten, dann Plattengrenzen | Geografie 7 (Risikoräume), Impuls und Fragenentwicklung; Sich orientieren, Systeme erschließen | ✅, Daten **simuliert** (Netz in der Entwicklungsumgebung gesperrt). Echte Daten: `python3 tools/daten-holen.py erdbeben` |
| `labor/laenderquiz/` | **Länder-Quiz** mit Namen in 8 Sprachen (Arabisch, Türkisch, Ukrainisch, Russisch, Polnisch, Persisch, Englisch) | Geografie, Sich orientieren D–E, DaZ | ✅ |
| `labor/raeuber-beute/` | **Vermuten, simulieren, beurteilen** (Räuber-Beute-Modell) | Biologie 3.2, Mit Modellen umgehen, Erkenntnisse gewinnen | ✅ |
| `labor/vorlesen/` bzw. `assets/js/vorlesen.js` | **Vorlesen mit Mitlesen**, nur lokale Stimmen, Wort antippen = ab hier weiter | LRS, Sprachbildung, Lesestrategie | ✅ mit simulierter Sprachausgabe getestet. Echte Stimmen je Gerät prüfen |
| `labor/donow/` bzw. `assets/js/donow.js` | **Do Now aus der Vorstunde**: drei Aufgaben (erklären, richtig/falsch, zuordnen) aus den vorhandenen Begriffen | Phase Do Now, Retrieval | ✅ |
| `labor/seismograph/` | **Handy als Seismograf** (Bewegungssensor), Messen, Vergleichen, Erklären | Geografie 7 (Erdbeben), Methoden anwenden | 🧪 Sensor simuliert getestet. Auf echten Handys (Android, iPhone mit Freigabe) prüfen |
| `labor/farbmesser/` | **Kamera als Farbmesser** (Rotkohl-pH, Stärke-Nachweis, Blattfarbe), Messtabelle | Biologie, Untersuchungen durchführen | 🧪 mit Testkamera getestet. Reale Lichtverhältnisse prüfen |
| `labor/rueckkanal/` | **Rückkanal per QR**: Gruppe schreibt Ergebnis, erzeugt QR, Lehrkraft scannt, Wand sammelt | Sicherung, Plenum, Datenschutz | ✅ Rundlauf getestet (Erzeugen und Dekodieren, mit Umlauten). Kamera-Scan live prüfen |

Neue Fremdbibliothek: `assets/js/vendor/jsQR.js` (Apache-2.0, Lizenz liegt daneben). Nur der QR-Prototyp lädt sie.

## 4. Ideenkatalog

Aufwand: S = Stunden, M = Tage, L = Wochen. Datenschutz: grün = nur lokal, gelb = Hinweis in Datenschutzerklärung nötig, rot = nicht empfohlen.

### A. Präsentation und Unterrichtsführung

| Idee | Nutzen | Aufwand | Datenschutz |
|---|---|---|---|
| **Referentenansicht** ✅ | Lehrkraft sieht Hinweis und nächste Folie, Klasse sieht nur die Folie. Ersetzt die Taste N | S | grün |
| **Bildschirm wach halten** ✅ (Wake Lock, steckt in `referent.js`) | Beamer-Rechner und Tablet schlafen nicht mitten in der Stunde ein. Gehört langfristig in `praesentation.js` | S | grün |
| **Schwebende Uhr und Lärmampel** 💡 (Document Picture-in-Picture, nur Chrome und Edge) | Timer und Ampel bleiben über anderen Fenstern sichtbar, etwa über einem Video oder einer Karte. Chromium hat die Schnittstelle (hier geprüft: vorhanden). Ohne Unterstützung bleibt das jetzige Fenster | M | grün |
| **Tafelbild sichern** 💡 | Stiftstriche plus Folie als Bild speichern oder drucken: für Abwesende, fürs Heft, für die Dokumentation. Technik: Canvas der Striche exportieren, Folie als SVG-Foto (`foreignObject`) oder Druckansicht. Grenzen bei Fremdbildern prüfen | M | grün |
| **Vorhang und Spotlight** 💡 | Folie abdecken (Taste), nur einen Bereich zeigen, Lupe: lenkt den Blick, wirkt als Impuls („Was seht ihr hier?“) | S | grün |
| **Aufgabenstellung vorlesen per Taste** 💡 | Jede Folie liest ihren Auftrag vor (Baustein Vorlesen). Entlastet LRS und DaZ in jeder Stunde, ohne dass die Lehrkraft vorliest | S | grün |
| **Sanfte Übergänge zwischen Zuständen** 💡 (View Transitions) | Zwei Zustände einer Karte oder eines Diagramms ineinander übergehen lassen (vorher/nachher). Nur wo die Veränderung Inhalt ist, nicht als Effekt | M | grün |
| **Vorher/Nachher-Schieber** 💡 | Zwei Bilder übereinander, Regler zieht die Grenze: Satellitenbilder (Aralsee, Gletscher), Stadt früher und heute. Hohe Wirkung bei kleinem Aufwand | S | grün (Bilder lokal) |
| **Zufall und Gruppen** 💡 | Zufällige Gruppen, Reihenfolge der Präsentationen, Würfel. Namen nur im Browser | S | grün |

### B. Rückkanal und Klassenarbeit ohne Server

Das größte Loch im Portal: Ergebnisse der Klasse kommen nicht zur Lehrkraft. Konten und Echtzeit-Server sind datenschutzrechtlich schwer. Drei serverlose Wege:

| Weg | Funktionsweise | Stand |
|---|---|---|
| **Ergebnis-QR** ✅ | Gruppe erzeugt einen QR mit Gruppenname und kurzem Ergebnis, Lehrkraft scannt (jsQR) und sammelt an der Wand. Bis etwa 280 Zeichen. Alles steckt im Code | Prototyp |
| **Papierkarten (Plickers-Prinzip)** 💡 | Jede Person hat eine Karte mit QR, die gedrehte Lage bedeutet A, B, C oder D. Kamera der Lehrkraft liest die ganze Klasse in Sekunden. Keine Geräte bei den SuS nötig. Kartensatz als druckbares Blatt erzeugbar (QR-Code-Erzeugung vorhanden), Auswertung mit den Eckpunkten, die jsQR liefert | M |
| **Gerät-zu-Gerät (WebRTC)** 💡 | Direktverbindung zwischen Geräten im Klassenraum, Austausch des Verbindungscodes per QR. Kein Server dauerhaft nötig, aber ein STUN-Server und Schul-Firewalls sind Stolpersteine. Nur nach Test im Schulnetz | L |

Bewusst **nicht** vorgeschlagen: Dienste von Dritten (Abstimmungsplattformen, Pads) einbetten. Datenschutz und Verfügbarkeit liegen dann nicht beim Portal.

### C. Daten, Karten und „das Internet“

Datenquellen, die sich für die Pipeline eignen. **Vor dem Einsatz je Quelle Lizenz, Nutzungsbedingungen und Format prüfen** (in der Entwicklungsumgebung war das Netz gesperrt, die Liste beruht auf bekannten, öffentlichen Angeboten und ist nicht abgerufen).

| Thema (RLP) | Quelle | Idee | Aufwand |
|---|---|---|---|
| Geo 3.1 Risikoräume | USGS Erdbeben-Feeds (gemeinfrei) | ✅ Karte ohne Karte. Erweiterung: Zeitschieber, Tiefenschnitt (Subduktion sichtbar) | S |
| Geo 3.1 | NASA EONET (Naturereignisse: Vulkane, Brände, Stürme) | „Was passiert gerade auf der Erde?“ als Do-Now-Impuls der Woche | M |
| Geo 3.6 Klima, Geo 3.5 Ressourcen | Open-Meteo (Wetter und Klimaarchiv ab 1940), DWD Open Data | Eigenes Klimadiagramm für Berlin aus echten Jahren, Hitzetage zählen, **Hypothese prüfen** | M |
| Geo 3.5 Ressourcen (Erneuerbare) | Energy-Charts (Strommix Deutschland) | Strommix des Vortags als Impuls: „Wann scheint die Sonne, wann weht der Wind, wer springt ein?“ | M |
| Bio 3.2 Lebensräume | GBIF oder iNaturalist (Artbeobachtungen) | Artenvielfalt im eigenen Bezirk, Karten der Funde | M |
| Bio 3.5 Gesundheit | RKI-Impfquoten (offene Daten) | Impfquoten nach Jahr und Land als Diagramm, Verbindung zur Simulation | M |
| Geo 3.2 Migration, 3.4 Armut/Reichtum | Our World in Data, Weltbank, UNHCR (offene Lizenzen) | Daten-Streuplots selbst deuten, Gapminder-Prinzip; Zeitschieber | M |
| Geo, Stadt Berlin | Geoportal Berlin (FIS-Broker), Berlin Open Data | Stadtklima, Grünflächen, Lärm als Karte des eigenen Kiezes | L |
| Geo Orientieren | Natural Earth (gemeinfrei) | ✅ Länder und Küsten im Portal. Erweiterungen: Flüsse, Städte, Klimazonen | S |
| Medienbildung | Wikimedia Commons | **Bildersuche mit Lizenz** für Plakate und Referate: Bild, Urheber, Lizenztext in einem Klick kopieren. Lernt Quellenangabe. Netz nur auf Knopfdruck | M |
| Geo 3.6 | NASA GIBS / Worldview (Satellitenzeitreihen) | Zeitraffer als Bildsequenz, vorab als Bilder abgelegt (Vorher/Nachher-Schieber) | M |

Hinweis zu Webcams, Live-Karten, Videos: nur als **Link-Karte** (Vorschau lokal, Klick öffnet die Quelle). Kein Einbetten (iframe), weil sonst beim Aufruf der Seite Dritte laden.

### D. Geräte-Sensoren („Das Handy als Messgerät“)

BYOD ist an Berliner Schulen unterschiedlich geregelt. Alle Sensor-Bausteine sind deshalb **als Lehrkraft-Demo am Beamer oder als Station mit einem Schulgerät** gedacht und haben eine Ohne-Sensor-Variante.

| Idee | Schnittstelle | Fach und Einsatz | Stand |
|---|---|---|---|
| **Seismograf** | Bewegung (`devicemotion`) | Geo 3.1: Erschütterung messen, Abstand und Stärke vergleichen | 🧪 |
| **Farbmesser** | Kamera (`getUserMedia`) | Bio: Rotkohl-pH, Iod-Stärke-Nachweis, Blattfarbe über das Jahr | 🧪 |
| **Reaktionstest** | Bildschirm und Zeit | Bio 3.6 Nervensystem: Reaktionszeit messen, Klassendaten zusammenführen (Ergebnis-QR) | 💡 S |
| **Hörbereich** | Web Audio (Tongenerator) | Bio Sinne: Hörschwelle 8 bis 20 kHz. Lautstärke vorher einstellen, Gerätegrenzen nennen | 💡 S |
| **Kompass und Lage** | Ausrichtung des Geräts | Geo Orientieren: Himmelsrichtung, Karte einnorden, Schulhof | 💡 S |
| **Schulhof-Maßstab** | Standort (nur lokal, nur nach Freigabe) | Geo Methoden: Strecke messen, Maßstab prüfen, Exkursion | 💡 M |
| **Mikroskop-Foto vermessen** | Kamera oder Bilddatei | Bio 3.1: Zelle mit Maßstab vermessen: zwei Punkte klicken, Referenzlänge angeben, Größe berechnen | 💡 M |
| **Puls per Kamera** | Kamera | Bio Kreislauf. Messgenauigkeit begrenzt, nur als Näherung zeigen und reflektieren | 💡 M |

### E. Differenzierung, Sprache, Zugänglichkeit

| Idee | Nutzen | Aufwand | Datenschutz |
|---|---|---|---|
| **Vorlesen mit Mitlesen** ✅ | Wirksamste LRS-Hilfe jederzeit, auch zu Hause. In der Leseansicht und auf Materialseiten einbaubar (Attribut `data-vorlesen`) | S | grün (nur lokale Stimmen) |
| **Mehrsprachige Begriffe** 💡 | Begriffe-Seite mit Übersetzungen. Zwei Wege: (a) geprüfte Übersetzungen im Datenblock (`lp-spiel-daten`, z. B. Ukrainisch, Arabisch, Türkisch) durch Lehrkraft oder Kolleginnen, (b) **eingebaute Browser-Übersetzung** (`Translator`, läuft auf dem Gerät, Chromium hier vorhanden). Fachbegriffe maschinell übersetzt **immer als ungeprüft kennzeichnen** | M | grün (auf dem Gerät) |
| **Textniveau umschaltbar** 💡 | Ein Material in zwei geprüften Fassungen (Basis, Original) mit einem Schalter. Keine KI-Vereinfachung für SuS, weil Fachfehler schleichen sich ein. Fassungen schreibt die Lehrkraft, ggf. mit Hilfe eines Sprachmodells und Gegenlesen | M | grün |
| **Leseansicht mit Strategiekarte** 💡 | Strategiekarte und Zeilennummern in der Leseansicht automatisch, Wortspeicher einblendbar | S | grün |
| **Hilfen auf Abruf** 💡 | Tipps in drei Stufen (Hinweis, Satzanfang, Beispiel), die die SuS selbst aufdecken. Zählt nichts, bewertet nichts | S | grün |

### F. Üben, Wiederholen, Selbsteinschätzung

| Idee | Nutzen | Aufwand |
|---|---|---|
| **Do Now automatisch** ✅ | Vorstunde ist schon im Portal, Aufgaben entstehen daraus. Jede Stunde anders | S |
| **Karteikasten (Leitner) auf der Begriffe-Seite** 💡 | Begriffe kommen nach 1, 3, 7 Tagen wieder. Stand nur im Browser (`localStorage`). Kalenderdatei (.ics) als Erinnerung ohne Server erzeugbar | M |
| **„Ich kann“-Spiegel** 💡 | Bestehende Selbsteinschätzung bleibt im Browser, Übersicht pro Themenfeld, Export als Text für das Lerntagebuch | S |
| **Retrieval-Quiz zum Stundenende (Exit-Ticket)** 💡 | Aus den Begriffen und den Leitfrage-Karten der Klasse | S |
| **Quellencheck als Übung** 💡 | Echte Meldungen aus `nachrichten.json` mit Aufgabe: Wer sagt das? Woher stammt die Zahl? Passt gut zum Medienbildungs-Auftrag | S |

### G. Lernorte außerhalb des Raums

| Idee | Nutzen | Aufwand |
|---|---|---|
| **Stationenlauf mit QR** 💡 | Stationen an Schulhof oder Kiez mit QR (Erzeugung vorhanden), jede Station öffnet eine Materialseite, die offline im Service Worker liegt | M |
| **Schulhof-Biotop kartieren** 💡 | Messpunkte mit Ort (nur lokal) und Foto, Export als Tabelle. Passt zu Bio 3.2 und BNE | L |

### H. Bewusst nicht empfohlen

- **Spracheingabe im Browser** (`SpeechRecognition`): in Chrome läuft sie über einen Server des Browserherstellers. Datenschutzwidrig für SuS-Sprache.
- **Eingebettete Fremdvideos, Karten, Pads, Abstimmungstools**: Datenschutz und Ausfallrisiko liegen dann bei Dritten.
- **KI-Chat für SuS im Portal**: Fachliche Fehler, Datenschutz, Kosten, Aufsicht. Für Lehrkräfte bei der Materialvorbereitung sinnvoll, im Portal nicht.
- **Konten, Rangliste, Noten im Portal**: widerspricht Ausrichtung (keine Namen) und braucht Server.

## 5. Vorgeschlagene Reihenfolge

1. **Kleine Gewinne (je etwa 1 bis 2 Stunden):** `referent.js` und Wake Lock in `praesentation.js` aufnehmen, `vorlesen.js` in die Leseansicht und in Materialseiten einbinden, Vorher/Nachher-Schieber als Baustein in `stunde.js`.
2. **Datenpipeline ausbauen (1 bis 2 Tage):** echte Erdbebendaten holen (Skript einmal laufen lassen, Pull Request prüfen), Klimadaten Berlin, Strommix. Daraus je eine Impulsfolie.
3. **Rückkanal (2 bis 3 Tage):** Ergebnis-QR in eine Präsentation einbauen (Folie „Eure Ergebnisse“), danach Papierkarten.
4. **Mehrsprachigkeit (1 Woche):** Datenblock um Übersetzungen erweitern, Begriffe-Seite mit Sprachwahl, Vorlesen in der Zielsprache, wo das Gerät eine Stimme hat.
5. **Sensor-Stationen (nach Test auf Schulgeräten):** Seismograf und Farbmesser als Stationen.

## 6. Offene Fragen und Risiken

- **Browser-Unterstützung prüfen**: Document Picture-in-Picture und `Translator` sind laut Entwicklungsumgebung in Chromium vorhanden, in Safari und Firefox nicht gesichert. Deshalb immer Rückfall.
- **Schulgeräte**: Sind Kamera, Mikrofon und Bewegungssensor im Schulnetz und auf den Geräten freigegeben? iPhones fragen für Bewegungssensoren extra um Erlaubnis (im Prototyp eingebaut).
- **Sprachausgabe**: Qualität und Verfügbarkeit deutscher lokaler Stimmen schwankt je Gerät. Fehlt eine, erscheint der Knopf nicht. Auf Schul-Tablets testen.
- **Datenschutzerklärung** (`datenschutz/index.html`) und `docs/betrieb.md` ergänzen, sobald ein Baustein live geht: Kamera, Bewegungssensor, Sprachausgabe, Wake Lock (alles nur lokal).
- **Lizenzen**: Natural Earth gemeinfrei. Plattengrenzen (Bird 2003, Aufbereitung `fraxen/tectonicplates`) unter Open Data Commons Attribution: Namensnennung steht auf der Seite. jsQR Apache-2.0 (Lizenzdatei liegt bei). USGS gemeinfrei. Übrige Quellen vor Einsatz prüfen.
- **Fachliche Kontrolle**: Simulationen (Räuber-Beute) sind Modelle. Die Seite nennt die Vereinfachungen und verlangt „Beurteile, wo das Modell vereinfacht“ (Modellkritik als Kompetenz).
- **Eingecheckte Daten**: `daten/` (etwa 350 KB) wird vom Service Worker mitgespeichert. Bei vielen weiteren Datensätzen `MAX` in `sw.js` im Blick behalten.

## 7. Wie ein Prototyp in eine Stunde kommt

1. Prototyp aus `labor/` in einen Stundenordner kopieren, die Seite mit den Klassen aus `praesentation-design.css` (Folie) oder `material.css` (Materialseite) gestalten.
2. Aufgaben operatorgestützt formulieren, Niveau am Rand, Hilfen als Kasten (Vorgaben Abschnitt 7 und 11).
3. Zielkorridor und Moderationsfragen für den Impuls in `data-notes` der Folie, Erwartungshorizont **nicht** ins Repository (öffentlich).
4. Eintrag in `projects.json`, `python3 tools/check.py` ausführen.
