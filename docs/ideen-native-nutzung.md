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

## 8. Weitere Ideen (zweite Runde)

| Idee | Nutzen | Aufwand |
|---|---|---|
| **Weltzeit-Uhr aus dem Browser** 💡 (`Intl.DateTimeFormat` mit Zeitzone, offline) | Geo Orientieren: Gradnetz und Zeitzonen. Schieber über die Karte, Uhrzeiten vieler Orte gleichzeitig, Sommerzeit als Falle. Kein Fremddienst nötig | S |
| **Wirkungsgefüge-Editor** 💡 | Geo „Systeme erschließen“: Knoten ziehen, Pfeile mit + oder − beschriften, Rückkopplungen erkennen, Export als Bild fürs Heft. Auch als Concept Map in Biologie | M |
| **Mystery digital** 💡 | Informationskarten sortieren und zu einem Ursache-Wirkung-Netz legen, Lösungsvorschlag erst nach Abgabe der eigenen Fassung | M |
| **Energiebilanz-Schieber** 💡 | Geo 3.6: Treibhausgas-Anteil verändern, Gleichgewichtstemperatur im vereinfachten Modell ablesen, Modellgrenzen benennen | M |
| **Warming-Stripes-Generator** 💡 | Eigene Jahresreihe (aus `daten/`) als Farbstreifen, Farbskala wählen und kritisch vergleichen | S |
| **Kreuzungsquadrat-Simulator** 💡 | Bio Vererbung: Genotypen wählen, Verhältnisse ablesen, Häufigkeit mit Zufallsstichprobe vergleichen | S |
| **Schattenlänge und Sonnenstand** 💡 | Geo und Bio: Sonnenhöhe aus Ort und Datum berechnen, mit gemessener Schattenlänge am Schulhof vergleichen | M |
| **Klassenmessung als Datensatz** 💡 | Messwerte der Klasse (Reaktionszeit, Temperatur, Schattenlänge) per Ergebnis-QR sammeln, Diagramm der Klasse | M |
| **Citizen Science mit Rückfluss** 💡 | Zählung von Vögeln oder Insekten im Schulgelände, Tabelle exportieren, Meldung an das Projekt von Hand durch die Lehrkraft | M |
| **Planspiel digital (Klimaverhandlung)** 💡 | Rollenkarten, Zeitgeber, geheime Zusatzkarte per QR, Abstimmung per Papierkarten | M |

## 9. Soll das Portal selbst von Dritten nachladen?

Kurz: **Nein als Standard, ja als bewusste Ausnahme.**

| Dafür | Dagegen |
|---|---|
| Wirklich live (Strommix, Wetter, Erdbeben der letzten Minute) | Jeder Aufruf gibt die IP-Adresse der Klasse an einen Dritten, oft in den USA. Das widerspricht der jetzigen Datenschutzerklärung |
| Kein Pflegeaufwand für Daten | Ausfall, Drosselung oder Schlüsselzwang mitten in der Stunde, Schul-WLAN und Filter blockieren oft |
| Riesige Auswahl (Kartenkacheln, Videos) | Inhalte ändern sich ungeprüft (Fachfehler, Werbung, Empfehlungen), die Stunde ist nicht wiederholbar |
| | Offline-Speicher funktioniert nicht, CORS und Nutzungsbedingungen je Dienst |

**Empfehlung:** Die Pipeline (Abschnitt 2) deckt fast alles ab, weil „vom Montag“ für Unterricht reicht. Wo wirklich live nötig ist, ein **Fremdinhalt-Tor**: Der Inhalt lädt erst nach Klick der Lehrkraft („Jetzt live von … laden“), nennt vorher Anbieter und Datenweitergabe, merkt die Wahl nur für diese Sitzung und fällt ohne Netz auf den gespeicherten Stand zurück. Eine feste Liste erlaubter Anbieter steht an **einer** Stelle im Quelltext, die Datenschutzerklärung zählt sie auf. So bleibt die Regel „nichts ungefragt“ und es gibt trotzdem Live-Momente. Nicht gesagt, dass ein Dritter zugelassen sein darf: Das klärt die Schule (Datenschutzbeauftragte).

## 10. Recherche (Nacht 1)

Stand: 16.11.2026. Recherche zu Datenquellen, Bausteinen, Unterrichtsideen und Recht. Alle Funde dienen als **Vorschläge**, nichts davon ist eingebaut. **Korrekturen aus Nacht 2 stehen in 11.1.**

**Wie belastbar die Angaben sind (bitte zuerst lesen).** In der Recherche-Umgebung war nur die Websuche erreichbar. Die Seiten der Anbieter selbst (Open-Meteo, DWD, Energy-Charts, GBIF, OWID, Gesetzestexte u. a.) ließen sich **nicht abrufen** (Netzsperre), und Header-Tests (CORS) waren deshalb nicht möglich. Die Angaben stammen aus Zusammenfassungen der Suchtreffer zu den offiziellen Seiten. Das ist **keine Prüfung an der Quelle**. Deshalb gilt:

| Status | Bedeutung |
|---|---|
| **ungeprüft (Suchbeleg)** | Aussage stand im Suchtreffer zu einer offiziellen Seite, die Seite selbst wurde nicht gelesen. Vor dem Einsatz Lizenzseite öffnen, Wortlaut und Namensnennung abschreiben |
| **ungeprüft (Allgemeinwissen)** | kein Suchtreffer zur Angabe. Nicht verlassen, erst prüfen |
| **offen** | Quellen widersprechen sich oder der Treffer sagt es selbst. Klärung nötig |

**CORS** ist bei **keiner** Quelle geprüft. Für die Pipeline (Abschnitt 2) spielt es keine Rolle, weil `tools/daten-holen.py` serverseitig lädt und die Seiten nur eigene Dateien lesen. Das ist ein weiterer Grund, bei der Pipeline zu bleiben. Namensnennung und Abrufdatum gehören in jede Datei unter `daten/` (wie bisher). Wichtig, weil das Repository öffentlich ist: **Wir veröffentlichen die Daten damit selbst weiter.** Lizenzen mit Namensnennung (CC BY, DL-DE-BY) erlauben das, wenn Quelle und Veränderung genannt werden. „Nur nicht kommerziell“ (CC BY-NC) ist für ein öffentliches Repository heikel und sollte gemieden werden (siehe GBIF und iNaturalist).

Aufwand: S = Stunden, M = Tage, L = Wochen.

### 10.1 Offene Datenquellen

Format und Update-Rhythmus sind, wo nicht anders genannt, **ungeprüft**. Spalte „Lizenz“ gibt den Kern aus dem Suchbeleg wieder, nicht den Wortlaut.

| Quelle | Link | Lizenz (Kern) | Format, Update | Themenfeld und Passung | Aufwand | Status |
|---|---|---|---|---|---|---|
| **Open-Meteo** Archiv-API (Wetter ab 1940, Modell ERA5 u. a.) | [Lizenz](https://open-meteo.com/en/license), [Nutzung](https://open-meteo.com/en/terms), [Archiv-Doku](https://open-meteo.com/en/docs/historical-weather-api), [Klima-API](https://open-meteo.com/en/docs/climate-api) | Daten CC BY 4.0, Namensnennung und Hinweis auf Änderungen. Kostenlose API nur **nicht kommerziell**, unter 10 000 Abrufen am Tag, ohne Zusicherung | JSON, CSV. Archiv täglich mit wenigen Tagen Verzug (ungeprüft). CORS: ungeprüft | Geo 3.6 Klima: eigenes Klimadiagramm Berlin aus echten Jahren, Hitzetage zählen, Hypothese prüfen. Modelldaten (Raster 9 bis 25 km), keine Stationsmessung: das ist ein Lernanlass | S bis M | ungeprüft (Suchbeleg). Vorsicht: Hosting der API und Daten-Lizenz sind getrennt geregelt |
| **DWD Open Data** (Stationsdaten, Klimaübersichten) | [Urheberrecht](https://beobachtungen.dwd.de/dwd_cas/copyright_en), [README](https://opendata.dwd.de/README.txt), [GeoNutzV § 3](https://www.gesetze-im-internet.de/geonutzv/__3.html) | Nutzung frei nach GeoNutzV, **Quellenvermerk Pflicht**, auch bei Auszügen und geändertem Format. Bei Veränderung muss der Vermerk die Änderung kennzeichnen (DWD nennt Mustertexte) | Textdateien (CSV-artig), Verzeichnisse. Rhythmus je Produkt. CORS: ungeprüft | Geo 3.6: Station Berlin-Tempelhof oder Dahlem, Klimadiagramm aus Messwerten. Passt, weil „Messung vs. Modell“ mit Open-Meteo verglichen werden kann | M | ungeprüft (Suchbeleg) |
| **Energy-Charts** (Fraunhofer ISE) | [API-Beschreibung](https://api.energy-charts.info/llms.txt), [Webseite](https://energy-charts.info/llms.txt) | API: CC BY 4.0 mit Namensnennung „energy-charts.info“, **strengere Abrufgrenzen**, Day-Ahead-Preise je Zone eigene Lizenz (teils nur privat und intern). Webseite nennt „nicht kommerziell und journalistisch“. Widerspruch | JSON, Endpunkt `public_power`. Viertelstündlich bis täglich (ungeprüft). CORS: ungeprüft | Geo 3.5 Ressourcen, Erneuerbare: Strommix eines Tages, „Wann scheint die Sonne, wann weht der Wind, wer springt ein?“ | M | **offen** (Lizenztexte widersprechen sich). Alternative: SMARD (nächste Zeile) |
| **SMARD** (Bundesnetzagentur) | [Datennutzung](https://smard.de/en/datennutzung) | CC BY 4.0, Quellenangabe „Bundesnetzagentur \| SMARD.de“ | CSV-Download im Downloadcenter. Stündlich bis viertelstündlich (ungeprüft) | Geo 3.5: dasselbe Thema wie Energy-Charts, klarere Lizenz. Gut als Hauptquelle für die Pipeline | M | ungeprüft (Suchbeleg) |
| **UBA Luftdaten** (Luftqualität, Messnetz Bund und Länder) | [Portal](https://luftdaten.umweltbundesamt.de/en), [API-Doku v4](https://luftdaten.umweltbundesamt.de/api/air-data/v4/doc), [Schnittstelle (PDF)](https://www.umweltbundesamt.de/sites/default/files/medien/358/dokumente/schnittstellenbeschreibung_luftdaten_api_v4.pdf) | Nach Metadatensatz Datenlizenz Deutschland Namensnennung 2.0. Vermerk laut Schnittstellenbeschreibung: „Umweltatlas“ nein, sondern „Umweltbundesamt mit Daten der Messnetze der Länder und des Bundes“. Tageswerte **vorläufig**, nicht qualitätsgesichert | JSON (REST). Stündlich. CORS: ungeprüft | Geo/Bio Umwelt und BNE: Feinstaub und Stickstoffdioxid an Berliner Stationen, Wochenende vs. Werktag, Grenzwert vergleichen | M | ungeprüft (Suchbeleg) |
| **GBIF** (Artenfunde weltweit) | [Datenprinzipien](https://training.gbif.org/en/data-use/gbif-mediated-data-principles), [Bedingungen](https://gbif.org/terms) | Je Datensatz CC0, CC BY oder CC BY-NC. Zitierpflicht (Download mit DOI). Lizenz je Datensatz prüfen | JSON-API, Downloads. Laufend. CORS: ungeprüft | Bio 3.2 Lebensräume: Funde im eigenen Bezirk, Karte. **Nur CC0 und CC BY ins Repository**, BY-NC aussortieren | M | ungeprüft (Suchbeleg) |
| **iNaturalist** (Beobachtungen und Fotos) | [Nutzungsbedingungen](https://www.inaturalist.org/terms), [Lizenzen](https://help.inaturalist.org/en/support/solutions/articles/151000173511) | Standard der Nutzer: CC BY-NC, Nutzer können ändern. Foto- und Datenlizenz können abweichen. Rate-Limits laut Treffern 60 bis 100 pro Minute, **uneinheitlich** | JSON-API. Laufend | Bio 3.2: Arterkennung im Kiez als Exkursion. Als Datenquelle für das öffentliche Repository wegen BY-NC **eher nicht** | M | ungeprüft (Suchbeleg), Rate-Limit offen |
| **RKI Open Data** (GitHub-Organisation) | [robert-koch-institut](https://www.github.com/orgs/robert-koch-institut/repositories) | COVID-19-Impfungen: CC BY 4.0 (laut Zenodo-Dokumentation und Zitierdatei). Für die Impfquoten (KV-Impfsurveillance) **Lizenz nicht gefunden** | CSV, TSV im Repository. Je Datensatz | Bio 3.5 Gesundheit: Impfquoten, Meldezahlen, Diagramm und Simulation. Gut mit Räuber-Beute-Logik („Modell vs. Daten“) | M | **offen** für Impfquoten, sonst ungeprüft (Suchbeleg) |
| **Our World in Data** | [FAQ](https://ourworldindata.org/faqs) | Eigene Inhalte CC BY. **Daten Dritter (WHO, UN, Weltbank) unter deren Bedingungen**, je Diagramm prüfen | CSV und JSON je Diagramm | Geo 3.2 Migration, 3.4 Armut und Reichtum: Streudiagramme selbst deuten, Zeitschieber. Als Fundstelle gut, als Pipeline-Quelle nur mit Prüfung der Ursprungsquelle | M | ungeprüft (Suchbeleg) |
| **Weltbank** (Indikatoren-API v2) | [Datensatz-Bedingungen](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets), [Kurzfassung](https://data.worldbank.org/summary-terms-of-use) | Standard CC BY 4.0 „mit zusätzlichen Bedingungen“, einzelne Datensätze andere Lizenzen | JSON, CSV über `api.worldbank.org/v2/...` (Beispielform nur aus Drittquelle). CORS: ungeprüft | Geo 3.4: Bruttoinlandsprodukt, Lebenserwartung, Geburtenrate je Land und Jahr, Gapminder-Prinzip | M | ungeprüft (Suchbeleg) |
| **UNHCR** Refugee Population Statistics | [Datensatz-Bedingungen](https://www.unhcr.org/terms-use-datasets) | CC BY 4.0, Vermerk „UNHCR Refugee Population Statistics Database“. UNHCR darf API und Daten ohne Ankündigung ändern, keine Gewähr | JSON-API, CSV | Geo 3.2 Migration: Herkunfts- und Aufnahmeländer. Sensibles Thema: Zahlen mit Menschen verbinden, nicht nur Karte | M | ungeprüft (Suchbeleg). API-Lizenz getrennt prüfen |
| **Berlin Open Data, Geoportal, Umweltatlas** | [Bildungsdaten Berlin](https://www.berlin.de/sen/bildung/service/daten/), [DL-DE-BY 2.0](https://www.govdata.de/dl-de/by-2-0), [Geodatensuche](https://gdi.berlin.de/geonetwork/srv/api/records/48ad3a23-d974-3458-90b7-deb0d5941c0a) | **Je Datensatz**: CC0, CC BY, DL-DE-BY 2.0 oder DL-DE-Zero 2.0. Das Geoportal ist seit 2019 DL-DE-BY 2.0. Vermerk je Datensatz (z. B. „Umweltatlas Berlin / Titel“) | WFS, Shape, teils GeoJSON. Je Datensatz. FIS-Broker: Meldung, dass er im Landesnetz seit 30.06.2026 abgeschaltet sei, öffentlicher Zugang **nicht geklärt** | Geo Stadt: Stadtklima, Grünversorgung, Lärm, Kiez-Karte. Hoher Lokalbezug, hoher Aufwand (WFS umwandeln) | L | ungeprüft (Suchbeleg), Erreichbarkeit offen |
| **Copernicus** (Klima-Daten, Sentinel-Bilder) | [Lizenz Copernicus](https://apps.ecmwf.int/datasets/licences/copernicus/), [Sentinel-Lizenz](https://ads.atmosphere.copernicus.eu/licences/ec-sentinel), [Sentinel Legal Notice](https://sentinel.esa.int/documents/247904/690755/Sentinel_Data_Legal_Notice) | „Frei, vollständig, offen“, kostenlos, weltweit. Vermerk „Copernicus Sentinel data [Jahr]“, bei Bearbeitung „Contains modified Copernicus Sentinel data [Jahr]“. Einzelne Klimadatensätze haben eigene Lizenzen (z. B. nur Forschung und Bildung nicht kommerziell) | GRIB, NetCDF, GeoTIFF (schwer), Bilder | Geo 3.6: Vorher/Nachher-Bilder (Aralsee, Gletscher, Waldbrandnarben) als **vorab abgelegte Bilder**, nicht als Datenverarbeitung im Browser | M | ungeprüft (Suchbeleg) |
| **NASA** EONET und GIBS, Bildrechte | [EONET v3](https://eonet.gsfc.nasa.gov/docs/v3), [Medienrichtlinien](https://www.nasa.gov/multimedia/guidelines/index.html) | NASA-Inhalte in den USA meist nicht urheberrechtlich geschützt, **Drittbilder sind gekennzeichnet**, Logo und Zeichen **nicht** frei. EONET: ob ein Schlüssel nötig ist, widersprüchlich. GIBS-Nutzungsregeln nicht gefunden | EONET JSON und GeoJSON (`/api/v3/events`). Laufend | Geo 3.1: „Was passiert gerade?“ als Impuls der Woche (Vulkane, Brände, Stürme). Bilder für Folien mit Quellenangabe | M | ungeprüft (Suchbeleg), EONET-Schlüssel und GIBS offen |
| **PEGELONLINE** (Wasserstände, WSV) | [REST v2](https://www.pegelonline.wsv.de/webservices/rest-api/v2) | „Offen und frei nutzbar“ laut Drittquelle, **Lizenzseite nicht gefunden**. Rohwerte ungeprüft, keine Gewähr | JSON (REST), kein Schlüssel (Drittquelle). Minütlich bis viertelstündlich | Geo Hochwasser, Fluss und Stadt (Spree, Havel): Pegelverlauf einer Woche, Niedrigwasser deuten | S bis M | ungeprüft (Allgemeinwissen und Drittquelle) |
| **Natural Earth** | [Über](https://www.naturalearthdata.com/about/) | Gemeinfrei, Namensnennung nicht nötig, Hinweis „Made with Natural Earth“ erwünscht | GeoJSON, Shape. Selten | Geo Orientieren: Flüsse, Städte, Seen, Klimazonen ergänzen (Länder und Küsten sind schon im Portal) | S | ungeprüft (Suchbeleg) |
| **Wikimedia Commons** (Bildersuche mit Lizenz) | – | Je Datei, Lizenz und Urheber stehen an der Datei | JSON-API. CORS: **kein Beleg gefunden** | Medienbildung: Lizenzblock zu Bildern lesen und kopieren. Netz nur auf Knopfdruck (siehe Abschnitt 9) | M | ungeprüft (kein Treffer), Link nicht belegt |

**Empfehlung für die nächste Pipeline-Runde** (Reihenfolge nach Nutzen und Lizenzklarheit):
1. `klima` aus dem **DWD** (Messung) und optional Open-Meteo (Modell): zwei Wege zum selben Diagramm, Vergleich als Quellenkritik. Aufwand M.
2. `strom` aus **SMARD** (klare Lizenz). Aufwand M.
3. `luft` aus **UBA** (Berlin, wenige Stationen). Aufwand M.
4. `eonet` für die Seite „Thema der Woche“. Aufwand M.
5. `weltbank` für 3 bis 5 Indikatoren, Zeitschieber. Aufwand M.
Jedes Kommando schreibt in die Datei Quelle, Lizenz, Vermerk, Abrufdatum und „bearbeitet: ja/nein“. Die Lizenzseite wird **vor** dem ersten Lauf von Hand gelesen und der Vermerk wörtlich übernommen.

### 10.2 Bausteine im Browser (Bibliotheken, Funktionen)

Bibliotheken würden wie `jsQR` unter `assets/js/vendor/` **mit Lizenzdatei** liegen, nie von einem CDN geladen. Größenangaben sind Näherungen aus Suchtreffern und vor dem Einbau zu messen.

| Baustein | Link | Lizenz | Größe | Passung | Aufwand | Status |
|---|---|---|---|---|---|---|
| **Leaflet** (Karten, Kacheln nötig) | – (kein Link belegt) | BSD-2-Clause | etwa 40 bis 42 KB gzip | Nur mit **eigenen Vektor- oder Bilddaten**, keine Kartenkacheln von Dritten. Für Länder, Stationen, Funde | M | ungeprüft (Suchbeleg für Lizenz und Größe) |
| **MapLibre GL JS** | [npm](https://www.npmjs.com/package/maplibre-gl) | BSD-3-Clause | etwa 200 KB gzip, Angaben schwanken | Zu schwer für Stationenkarten, nur wenn echte Vektorkacheln lokal vorliegen. Eher nein | L | ungeprüft (Suchbeleg) |
| **d3-geo** (nur Projektion und Pfade) | [npm](https://www.npmjs.com/package/d3-geo) | ISC (ältere Versionen BSD-3-Clause) | klein, nicht gemessen | Weltkarten ohne Kartenserver direkt aus GeoJSON zeichnen, Projektionen vergleichen (Mercator vs. flächentreu). Passt zu Karte ohne Karte | M | ungeprüft (Suchbeleg), Version prüfen |
| **Observable Plot** | [npm](https://www.npmjs.com/package/@observablehq/plot) | ISC | nicht gemessen | Diagramme mit wenig Code, aber lädt d3. Für das Portal vermutlich zu groß, eigene SVG-Diagramme reichen oft | M | ungeprüft (Suchbeleg) |
| **uPlot** (Zeitreihen) | [npm](https://www.npmjs.com/package/uplot) | MIT | etwa 45 bis 50 KB min | Schnelle Linien für Klima, Strom, Pegel, auch mit vielen Punkten. Barrierefreiheit (Tabellen-Alternative) selbst ergänzen | M | ungeprüft (Suchbeleg) |
| **Chart.js** | – (kein Treffer) | MIT (nur Allgemeinwissen) | nicht gemessen | Balken, Linien, Torten. Eigener SVG-Code bleibt kleiner | S | ungeprüft (Allgemeinwissen) |
| **PhET-Simulationen** (Biologie und Physik) | [Lizenz](https://phet.colorado.edu/en/licensing/html) | Bisher CC BY 4.0, Namensnennung, Name und Logo geschützt. **Seit 29.03.2026 anderes Lizenzmodell für neue Versionen** (Treffer sagt nur: „historische Sammlung davor CC BY 4.0“) | je Simulation ein HTML | Schul-Sims lokal ablegen statt einbetten. Passt zu Bio (Genexpression, Naturselektion). **Aktuelle Bedingungen vor dem Einsatz lesen** | S | **offen** |
| **Referenten- und Schwebende Uhr** (Document Picture-in-Picture) | – | Browserfunktion | 0 | siehe Abschnitt 4 A | M | ungeprüft |
| **Übersetzung auf dem Gerät** (`Translator`, `LanguageDetector`) | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Translator_and_Language_Detector_APIs) | Browserfunktion | 0 | Chrome ab 138 am Computer, **nicht** auf Mobilgeräten, Firefox und Safari nicht. Edge: eine Drittquelle nennt Version 148, ungeprüft. Fachbegriffe immer als „maschinell, ungeprüft“ kennzeichnen. Nur als Zusatz | M | ungeprüft (Suchbeleg), Stand wechselt |
| **Atkinson Hyperlegible Next** (Schrift) | [GitHub](https://github.com/googlefonts/atkinson-hyperlegible) | SIL Open Font License 1.1 (für „Next“ in mehreren Treffern, beim Original gab es Zweifel an Abweichungen) | Datei je Schnitt | Alternative zu Andika für die Leseansicht. **Nur lokal laden**, wie Andika. Wirkung auf LRS nicht belegt, Nutzer sollen wählen können | S | ungeprüft (Suchbeleg) |
| **Lexend, OpenDyslexic** | – | nicht belegt | – | Nicht empfohlen ohne Beleg: für „Legasthenie-Schriften“ fand die Suche keinen Wirksamkeitsnachweis, nur „Nutzer wählt selbst“ | – | ungeprüft |

**Eigenbau statt Bibliothek** (kein Fremdcode, daher keine Lizenzfrage): `Intl.DateTimeFormat` und `Intl.NumberFormat` (Zeitzonen, Zahlen je Sprache, Weltzeit-Uhr aus Abschnitt 8), `Intl.Collator` (Sortieren mit Umlauten), `<details>` für Hilfen auf Abruf, `prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme` für Anzeigeeinstellungen ohne Schalter, Druckansicht mit `@media print` (Arbeitsblatt aus der Seite), `lang`-Attribut je Sprachabschnitt für richtige Vorlese-Stimme.

### 10.3 Unterrichtsideen aus Fachdidaktik und Praxis

Die Quellen sind **Verlags- und Behördentreffer**, nicht gelesen. Ideen sind als Anregung gedacht, nichts davon ersetzt die Planung der Fachlehrkraft. Keine Erwartungshorizonte ins Repository.

| Idee | Beleg und Hinweis | Passung zum Portal | Aufwand | Status |
|---|---|---|---|---|
| **Mystery** (ungeordnete Informationskarten, Leitfrage, Gruppe ordnet zu Wirkungsnetz) | Auf David Leat zurückgeführt (Großbritannien, 1990er). Typisch 20 bis 30 Karten, Phasen: Einstieg, Gruppenarbeit, Präsentation, Reflexion. Beispiel: [Diercke-Mystery Hunga Tonga 2022](https://diercke.de/sites/default/files/2024-11/Mystery%20%E2%80%93%20Der%20Vulkanausbruch%20des%20Hunga%20Tonga-Hunga%20Ha%27apai%202022%20Vorschau.pdf), [Leitfaden PH Bern](https://www.phbern.ch/sites/default/files/2019-11/20191126_leitfaden_mystery_d_is1.pdf). Kritik: Mysterys sind **nicht automatisch kooperativ**, erst Einzelaufgabe, dann Gruppe | Baustein „Mystery digital“ aus Abschnitt 8: Karten sortieren, Netz legen, Export als Bild. Karten selbst schreiben, nichts von Verlagen kopieren | M | ungeprüft (Suchbeleg) |
| **Klimadiagramm mit Sprachgerüst** | [Friedrich, Sprachbildung im Geographieunterricht](https://www.friedrich-verlag.de/friedrich-plus/sekundarstufe/geographie/geographie-heute/sprachbildung-im-geographieunterricht-6688) nennt Scaffolding bei der Auswertung von Klimadiagrammen | Eigenes Klimadiagramm aus Pipeline-Daten mit abrufbaren Satzanfängen („Die Temperatur steigt von … bis …“) als Hilfe auf Abruf | S | ungeprüft (Suchbeleg, Verlag) |
| **Lernwörtertabelle und Wortspeicher** | Berliner [Fachbrief DaZ 24](https://schulportal.berlin.de/get-data/fd5a5a8e-ebf9-40d7-9f32-008e4205063f/Fachbrief_Sprachfoerderung_DaZ_24_Willkommen_in_der__Regelklasse.pdf) (2018) behandelt Wortschatzarbeit, Lernwörtertabellen, Scaffolding | Begriffe-Seite um Spalte „Satzbeispiel“ und Bild ergänzen, druckbare Lernwörtertabelle je Themenfeld erzeugen | S | ungeprüft (Suchbeleg) |
| **Sprachsensibel in Biologie** | Handbuch von Leisen mit Kapitel „Sprachsensibel Biologie unterrichten“ (Verlagsbuch, nur Leseprobe in der Suche) | Textniveau-Schalter und Satzbausteine in Materialseiten. Berliner Fachhandreichung für Bio oder Geo wurde **nicht gefunden** | M | ungeprüft |
| **Messen und selbst Daten erzeugen** | aus den Prototypen (Reaktionstest, Schattenlänge, Seismograf) | Klassenmessung als Datensatz, Diagramm der Klasse, danach Vergleich mit Fachdaten. Daten bleiben im Browser oder im Ergebnis-QR | M | – (Eigenidee) |
| **Messung gegen Modell** | Idee aus 10.1 (DWD vs. Open-Meteo) | „Welchen Daten traue ich?“ als Quellenkritik: Station, Raster, Lücken, Rundung | M | – (Eigenidee, braucht Daten) |
| **Karte lesen ohne Karte** | schon Prototyp | Erweiterung mit d3-geo: gleiche Daten in drei Projektionen, „Was verändert sich, was bleibt?“ | M | – (Eigenidee) |
| **Anzeige selbst einstellbar (LRS)** | Auswertung zu [Legasthenie-freundlichen Formaten](https://dyslexiascotland.org.uk/dyslexia-friendly-typed-formats) und [Smashing Magazine](https://smashingmagazine.com/2021/11/dyslexia-friendly-mode-website): Schrift mindestens 12 bis 14 pt, Zeilenabstand um 1,5, Kursivschrift und Großbuchstaben meiden, **Nutzer wählen Schrift, Größe und Hintergrund selbst**. Zu Farben sind die Aussagen uneinheitlich | Lesemodus um Schriftgröße, Zeilenabstand, Buchstabenabstand, Hintergrund wählbar erweitern (Wahl bleibt im Browser). Keine feste „LRS-Schrift“ | S bis M | ungeprüft (Suchbeleg, Zweitquellen) |
| **Erklärvideo-Ersatz: Folge von Bildern** | Idee | Statt Fremdvideos Bildfolgen mit Untertitel und Vorlesen (Baustein), offline, ohne Drittanbieter | M | – (Eigenidee) |

### 10.4 Recht und Datenschutz (Berlin, Schule)

**Keine Rechtsberatung.** Aussagen sind aus Treffern zusammengefasst, die Gesetzestexte wurden nicht gelesen. Die Schule und die behördliche Datenschutzbeauftragte entscheiden.

| Thema | Hinweis | Link | Folge für das Portal | Status |
|---|---|---|---|---|
| **Rechtsgrundlage Schule Berlin** | Schulen verarbeiten Daten nach § 64 Schulgesetz, Schuldatenverordnung und Verordnung über digitale Lehr- und Lernmittel (beide laut Treffer vom 7. August 2023). Die Schule trägt die Verantwortung beim Einsatz. Eine Novelle war angekündigt, ob sie gilt, ist **offen** | [Informationspflichten Sek I/II (Beispiel)](https://v2.ong.berlin/wp-content/uploads/2026/01/2026-01-Informationspflichten-Art13-SekI-SekII-Allgemein.pdf) | Das Portal ist ein **statisches Angebot ohne Konto und ohne Erhebung von Schülerdaten**. Das bleibt die wichtigste Eigenschaft. Jede Funktion, die Daten verlässt, ist begründungspflichtig | ungeprüft (Suchbeleg) |
| **Lernplattformen: Einwilligung** | Berliner Datenschutzbeauftragte fordert für Lernplattformen Einwilligung (altersgerecht), freiwillig, mit Alternative | [Hinweise Lernplattformen (BlnBDI 2020)](https://www.datenschutz-berlin.de/fileadmin/user_upload/pdf/dokumente/2020-BlnBDI_Hinweise-Lernplattformen.pdf) | Gilt für Plattformen mit Konto. Das Portal braucht keine Einwilligung, solange nichts erhoben wird. Rückkanal per QR nur mit Gruppenname, keine Klarnamen | ungeprüft (Suchbeleg, Stand 2020) |
| **Schriften und Fremdinhalte von Servern Dritter** | LG München I, 20.01.2022, Az. 3 O 17493/20: dynamische Einbindung von Google Fonts ohne Einwilligung gab 100 Euro Schadensersatz wegen Übermittlung der IP-Adresse. Lokale Einbindung ist der Weg | [IHK-Zusammenfassung](https://www.ihk.de/bergische/recht-und-steuern/wettbewerbsrecht/google-fonts-5646176) | Bestätigt die Leitplanke 1: Schriften, Bibliotheken, Karten **lokal**. Ob es Berufung oder spätere Entscheidungen gab, wurde nicht geklärt | ungeprüft (Suchbeleg, Kanzleien) |
| **Speicher im Gerät (Lesemodus, Service Worker)** | § 25 TDDDG: Zugriff auf das Endgerät braucht Einwilligung, Ausnahme für **unbedingt erforderliche** Zugriffe für einen ausdrücklich gewünschten Dienst. Ob ein Offline-Speicher und gemerkte Anzeigeeinstellungen darunter fallen, wurde **nicht belegt** (nur eigene Schlussfolgerung) | [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html) | In der Datenschutzerklärung erklären, was gespeichert wird (nur Einstellungen und Seiten), wie man es löscht. Ob ein Hinweis auf der Seite reicht, mit der Datenschutzbeauftragten klären | **offen** |
| **Barrierefreiheit** | Berlin: BIKTG Bln setzt die EU-Richtlinie 2016/2102 für öffentliche Stellen um, Maßstab BITV 2.0 und EN 301 549, mit Barrierefreiheitserklärung. Ob und wie das auf ein Lernportal einer **einzelnen Schule** anzuwenden ist: nicht geklärt | [Landesbeauftragte, Recht Berlin](https://www.berlin.de/lb/digitale-barrierefreiheit/recht/berlin/) | Unabhängig von der Pflicht: Prüfpunkte aus WCAG und BITV als Qualitätsliste (Tastatur, Kontrast, Alternativtexte, Sprache `lang`, Reihenfolge). Eine **Erklärung zur Barrierefreiheit** auf `hilfe/` ist sinnvoll, wenn die Schule als Betreiber auftritt | ungeprüft (Suchbeleg) |
| **Eigene Geräte (Handy)** | Berlin hat laut Treffern aus 2025 **kein landesweites Handyverbot**, Schulen regeln es in ihrer Hausordnung. 2026-Stand für Berlin nicht gefunden. Andere Länder haben Verbote | [news4teachers 2025](https://www.news4teachers.de/2025/05/streit-um-handy-verbot-bildungssenatorin-warnt-vor-einfachen-loesungen/) | Bestätigt Abschnitt 4 D: Sensor-Bausteine als Lehrkraft-Demo oder Station, mit Variante ohne Gerät | ungeprüft (Suchbeleg) |
| **Lizenzen der eigenen Inhalte** | Offene Lizenzen (CC BY) erfordern Namensnennung, Hinweis auf Änderung, Lizenznennung. **CC BY-NC** (iNaturalist, GBIF teils) passt nicht zu einem öffentlichen Repository ohne Prüfung | siehe 10.1 | In `daten/*.json` je Datei Felder `quelle`, `lizenz`, `vermerk`, `abruf`, `bearbeitet`. In `tools/check.py` prüfen, dass sie gesetzt sind (Vorschlag) | – (Vorschlag) |

### 10.5 Neue Ideen aus der Recherche (noch nicht in Abschnitten 4 und 8)

| Idee | Nutzen | Aufwand |
|---|---|---|
| **Quellenblatt automatisch** | Jede Seite mit Daten zeigt Quelle, Lizenz, Vermerk und Abrufdatum aus der Datei, dazu ein Knopf „Quelle kopieren“. Medienbildung und Lizenzpflicht in einem | S |
| **Daten-Alter sichtbar** | Banner „Stand: 16.11., Messnetz: …“, Aufgabe „Wie alt sind diese Daten, was heißt das?“ | S |
| **Vorläufig oder geprüft** | Kennzeichen bei Werten, die die Quelle selbst „vorläufig“ nennt (z. B. UBA-Tageswerte). Lernanlass zu Messunsicherheit | S |
| **Station vs. Raster** | Karte der DWD-Station gegen Rasterzelle des Modells, „Was misst eine Station, was rechnet ein Modell?“ | M |
| **Lizenz-Sortierspiel** | Bilder mit Lizenztext sortieren: darf ich das auf mein Plakat? (Wikimedia, NASA-Bildrechte, CC BY vs. BY-NC) | S |
| **Bildfolge „Vorher/Nachher“ mit Sentinel-Bildern** | Aralsee, Gletscher, Brandnarben, selbst ausgewählt, Vermerk „Contains modified Copernicus Sentinel data“ | M |
| **Tabelle zu jedem Diagramm** | Jedes Diagramm bietet seine Zahlen als Tabelle an (Barrierefreiheit, Datenkompetenz, Vorlesen) | S |
| **Mystery-Karten als Datei** | Kartensatz als JSON, Lehrkraft schreibt eigene, Seite sortiert und exportiert | M |

### 10.6 Was als Nächstes geprüft werden muss

1. Lizenzseiten von **Open-Meteo, DWD, SMARD, UBA, Weltbank, UNHCR** in einer Umgebung mit freiem Netz lesen und den Vermerk wörtlich in `tools/daten-holen.py` hinterlegen.
2. **Energy-Charts**: Widerspruch zwischen API (CC BY 4.0) und Webseite (nicht kommerziell) klären, sonst SMARD nehmen.
3. **PhET**: aktuelle Lizenz nach der Änderung vom 29.03.2026 lesen, bevor Simulationen abgelegt werden.
4. **RKI-Impfquoten**: Lizenzdatei im Repository lesen.
5. **CORS** jeder Quelle nur testen, wenn ein Live-Abruf (Abschnitt 9) wirklich gebraucht wird.
6. **FIS-Broker**: ob der öffentliche Zugang noch besteht oder das neue Geoportal andere Adressen hat.
7. **TDDDG und Offline-Speicher**: mit der Datenschutzbeauftragten der Schule klären, ob die Erklärung auf `datenschutz/` reicht.
8. Alle **Links in diesem Abschnitt** stammen aus Suchergebnissen. Beim ersten Öffnen prüfen, ob die Adresse noch stimmt (Leaflet, Chart.js und Wikimedia haben bewusst keinen Link, weil keiner belegt wurde).


## 11. Recherche (Nacht 2)

Stand: 17.11.2026. Zweite Runde: Stichprobe aus Abschnitt 10 erneut belegt, neue Bereiche (Fachdidaktik Berlin, OER, Citizen Science, Exkursionen, Mehrsprachigkeit, LRS, Barrierefreiheit), drei Umsetzungsvorschläge. Nichts davon ist eingebaut.

**Zuerst lesen: Was diese Runde leisten konnte und was nicht.**

- **Kein Zugriff auf die Quellseiten.** Der direkte Abruf (Namensauflösung und Proxy) war auch in dieser Runde für alle Anbieter gesperrt (Open-Meteo, SMARD, PhET, DWD, Energy-Charts, UNHCR u. a. ließen sich nicht öffnen). Verfügbar war nur die Websuche. **Keine Angabe unten ist an der Quellseite selbst gelesen.** Wo „bestätigt“ steht, hat eine zweite, unabhängig formulierte Suche dasselbe Ergebnis gebracht (Zusammenfassung eines Treffers auf die offizielle Seite). Das ist stärker als ein einzelner Treffer, aber **kein Ersatz für das Lesen der Lizenzseite**. Der Auftrag „an der Quelle prüfen“ ist damit nur teilweise erfüllt, die Lücke steht in 11.5.
- **Abweichung vom Auftrag:** Abschnitt 10 und `docs/nachtprotokoll.md` lagen im Branch `claude/zealous-hawking-ge9ixn` nicht vor (letzter Commit „Ideenkatalog: zweite Runde und Abwägung Nachladen von Dritten“). Die Ergebnisse von Nacht 1 standen nur im Katalog-Artifact. Abschnitt 10 wurde daher **unverändert aus dem Artifact in diese Datei übernommen** (oben), damit Repository und Artifact übereinstimmen. Das Protokoll wurde nachgetragen.
- **Statuswörter:** **bestätigt (Suchbeleg 2)** = zweite Suche stützt die Aussage · **korrigiert** = Runde 1 war ungenau oder überholt · **offen** = Quellen widersprechen sich oder Beleg fehlt · **ungeprüft** = nur ein Treffer oder nur Allgemeinwissen. Aufwand: S = Stunden, M = Tage, L = Wochen.

### 11.1 Stichprobe aus Abschnitt 10 (erneut belegt, Korrekturen)

| Eintrag (Abschnitt 10) | Runde 1 sagte | Runde 2 Befund | Link | Status |
|---|---|---|---|---|
| **PhET** (10.2) | Bisher CC BY 4.0, seit 29.03.2026 anderes Modell, Stand offen | **Korrektur, schärfer:** Der PhET Impact Report 2025 nennt den Übergang der Kernsammlung von CC BY zu **CC BY-NC**. Die Lizenzseite beschreibt eine „historische Sammlung“ für vor dem 29.03.2026 veröffentlichte Simulationen (CC BY 4.0). Bedingungen für neuere Versionen nicht gefunden. Folge: Nur Simulationen der historischen Sammlung kämen für ein öffentliches Repository in Frage, und auch das erst nach Lesen der Lizenzseite. Namen und Logo bleiben geschützt | [Lizenz HTML](https://phet.colorado.edu/en/licensing/html), [Impact Report 2025](https://phet.colorado.edu/publications/PhET_Impact_Report_2025.pdf) | **korrigiert**, Endstand offen |
| **SMARD** (10.1) | CC BY 4.0, Vermerk „Bundesnetzagentur \| SMARD.de“ | Bestätigt, Vermerk wörtlich so (Treffer zitieren die Zeichenfolge). **Neu:** Das Impressum nennt für Website-Inhalte **CC BY-ND 4.0** (keine Bearbeitung). Daten aus dem Downloadcenter und Kraftwerksdaten stehen unter CC BY 4.0. Folge: nur Downloaddateien verwenden, keine Grafiken oder Texte der Website kopieren | [Datennutzung](https://smard.de/en/datennutzung), [Impressum](https://smard.de/en/impressum) | bestätigt (Suchbeleg 2), Hinweis neu |
| **Open-Meteo** (10.1) | CC BY 4.0, kostenlose API nur nicht kommerziell, unter 10 000 Abrufen am Tag | Bestätigt. **Ergänzt:** Grenzen laut Bedingungen unter 10 000 pro Tag, 5 000 pro Stunde, 600 pro Minute. Ein Treffer nennt als Vermerk „Weather data by Open-Meteo.com (CC BY 4.0)“, das ist eine Drittquelle, den offiziellen Wortlaut aus der Lizenzseite übernehmen. Eine Schule im Regelbetrieb ist nicht kommerziell, ob das für die Veröffentlichung im Repository gilt, bleibt Auslegung | [Nutzung](https://open-meteo.com/en/terms), [Lizenz](https://open-meteo.com/en/license) | bestätigt (Suchbeleg 2) |
| **Energy-Charts** (10.1) | Widerspruch API (CC BY 4.0) gegen Webseite (nicht kommerziell) | Bestätigt und präzisiert: Die API-Antwort trägt ein Feld `license`, Standard CC BY 4.0 mit Vermerk „energy-charts.info“. Day-ahead-Preise: je Gebotszone, mehrere unter CC BY 4.0 von Bundesnetzagentur \| SMARD.de, **übrige nur privat und intern**. Die `llms.txt` der Webseite nennt nicht kommerziell und journalistisch, die Veröffentlichungshinweise untersagen andere Nutzung ohne Genehmigung. Empfehlung bleibt: **SMARD statt Energy-Charts** | [API](https://api.energy-charts.info/llms.txt), [Web](https://energy-charts.info/llms.txt) | **offen** (bleibt) |
| **UBA Luftdaten** (10.1) | DL-DE-BY 2.0, Vermerk „Umweltbundesamt mit Daten der Messnetze …“ | Lizenz bestätigt (Metadatensatz: dl-de/by-2-0, keine Zugriffsbeschränkung). API v4, Schnittstellenbeschreibung laut Treffer vom 17.12.2025. **Korrektur:** Der Vermerk stammt aus einer älteren Schnittstellenbeschreibung (Treffer: 2019), die aktuelle Fassung prüfen. Der Satz in Runde 1 („‚Umweltatlas‘ nein, sondern …“) war unsauber formuliert und ist so zu lesen: Vermerk nicht „Umweltatlas“, sondern der UBA-Text. Berliner Stationen laufen über dieselbe Schnittstelle, eigene Berliner Auflagen nicht gefunden | [Portal](https://luftdaten.umweltbundesamt.de/en), [Schnittstelle (PDF)](https://www.umweltbundesamt.de/sites/default/files/medien/358/dokumente/schnittstellenbeschreibung_luftdaten_api_v4.pdf) | bestätigt (Suchbeleg 2), Vermerk **korrigiert** |
| **Weltbank** (10.1) | CC BY 4.0 „mit zusätzlichen Bedingungen“ | Bestätigt, auch für die API. Zusatzbedingungen: kein Eindruck der Unterstützung durch die Weltbank, **Logo und Marken nicht verwenden**, keine Gewähr. Vermerk mit Weltbank und Datensatzname (Angabe aus Drittquelle CASRAI) | [Bedingungen](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets), [Kurzfassung](https://data.worldbank.org/summary-terms-of-use) | bestätigt (Suchbeleg 2) |
| **Natural Earth** (10.1) | gemeinfrei, Hinweis „Made with Natural Earth“ erwünscht | Bestätigt (Treffer: public domain, keine Erlaubnis und keine Nennung nötig, optionaler Hinweis). Die Treffer zitierten teils Spiegelseiten, der Wortlaut auf der Originalseite ist nicht gelesen | [Über](https://www.naturalearthdata.com/about/) | bestätigt (Suchbeleg 2) |
| **NASA EONET** (10.1) | Schlüssel „widersprüchlich“ | Die Doku v3 listet `/api/v3/events/geojson` mit Filtern ohne Schlüsselparameter. Ein Microsoft-Konnektor verlangt einen NASA-Schlüssel, das betrifft den Konnektor. Wahrscheinlich ohne Schlüssel nutzbar, **durch einen Testabruf belegen** | [Doku v3](https://eonet.gsfc.nasa.gov/docs/v3) | offen (Testabruf fehlt) |
| **Translator-API** (10.2) | Chrome ab 138 am Computer, Mobil nein | Bestätigt (Chrome 138, Firefox und Safari nicht, nicht auf Mobilgeräten). **Sprachen:** Arabisch, Türkisch, Ukrainisch ergeben sich aus der Sprachliste (über die japanische Fassung der Doku), **Polnisch und Russisch ließen sich nicht belegen**. Paarweise Modelle, ein Download vor dem ersten Einsatz | [Chrome-Doku](https://developer.chrome.com/docs/ai/translator-api) | bestätigt, Sprachen teils offen |
| **Wikimedia Commons** (10.1, „Link nicht belegt“) | Link und CORS ohne Beleg | Lizenzdaten liegen in `extmetadata` (`LicenseShortName`, `LicenseUrl`, `Artist`, `Credit`). Die Felder sind Freitext der Beschreibungsseite, `Artist` kann HTML enthalten: **nicht blind übernehmen**. CORS (`origin=*`) weiter ohne Beleg. Folge: Lizenzblock **vorab in der Pipeline** holen und von Hand prüfen, nicht im Browser abrufen | [CommonsMetadata](https://www.mediawiki.org/wiki/Extension:CommonsMetadata/en) | Link jetzt belegt, CORS offen |
| **Lexend, OpenDyslexic** (10.2) | kein Wirksamkeitsnachweis | Bestätigt, siehe 11.2 e). Studien finden für Spezialschriften keinen Buchstabenform-Effekt, Abstände sind umstritten | [Marinus et al. 2016](https://pubmed.ncbi.nlm.nih.gov/27194598/) | bestätigt (Suchbeleg 2) |
| **Fachbrief DaZ 24** (10.3) | Berliner Fachbrief (2018), Wortschatzarbeit, Lernwörtertabellen, Scaffolding | Der Fachbrief existiert und liegt auf dem Schulportal. Er ist Teil 2 der Reihe „Brüche vermeiden, Brücken bauen“ (Übergang Willkommensklasse in die Regelklasse). Der Treffer zeigt nur das Inhaltsverzeichnis: Klassenkonferenz zum Nachteilsausgleich, Checkliste zum Übergang, Beobachtungsbogen, Aufbau von Scaffolds. **Lernwörtertabellen und das Jahr 2018 sind nicht bestätigt.** Die Aussage in 10.3 ist entsprechend abzuschwächen | [Fachbrief 24](https://schulportal.berlin.de/get-data/fd5a5a8e-ebf9-40d7-9f32-008e4205063f/Fachbrief_Sprachfoerderung_DaZ_24_Willkommen_in_der__Regelklasse.pdf) | **korrigiert** (Inhalt) |

**Nicht erneut belegt** (Stand Nacht 1 gilt weiter): DWD, GBIF, iNaturalist-Rate-Limits, RKI-Impfquoten, Our World in Data, UNHCR, Berlin Open Data und FIS-Broker (siehe aber 11.2 d), Copernicus, PEGELONLINE, Leaflet, MapLibre, d3-geo, uPlot, Chart.js, Atkinson Hyperlegible Next, alle Rechtsthemen in 10.4 (LG München, § 25 TDDDG, BIKTG, Handyregelung).

### 11.2 Neue Quellen und Funde

Alle Zeilen: **Suchbeleg, Seite nicht gelesen**, sofern nicht anders vermerkt. Lizenz-Spalte gibt den Treffer wieder, nicht den Wortlaut.

#### a) Fachdidaktik, Rahmenlehrplan, Berliner Angebote

| Quelle | Link | Lizenz | Passung zum Portal in einer Zeile | Status |
|---|---|---|---|---|
| **Fachteile des RLP werden neu entwickelt** (Biologie, Chemie, Physik, Naturwissenschaften 5/6): Auswertung, Gutachten und Hearing-Bericht des Bildungsservers | [Auswertung RLP C Biologie (01/2025)](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/rlp1-10/2025_01_22_Deskriptive_Auswertung_RLP_C_Biologie.pdf), [Gutachten Biologie](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/rlp1-10/Gutachten_Biologie_Upmeier_HUB_Krueger_FUB.pdf), [Hearings-Bericht](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/rlp1-10/2025_07_Ergebnisbericht_Hearings_12.01.2026.pdf) | nicht erkennbar | **Risiko für `themenfelder.json`:** Die Nummern und Titel von 2015 können sich ändern. Die Themenfeld-Zuordnung liegt zentral in einer Datei, das hilft. Neue Fassung beobachten, bevor viele Seiten an Nummern hängen | ungeprüft (Treffer nennen Neuentwicklung 2024 bis 2026, Inkrafttreten unklar) |
| **RLP 1–10 Teil C, Geltung** | [Brandenburg Verwaltungsvorschrift](https://bravors.brandenburg.de/verwaltungsvorschriften/vvrlpcm/4) | Rechtstext | Treffer nennen Inkrafttreten 01.08.2017 und letzte Änderung 01.08.2024 (betrifft Fremdsprachen). Bestätigt nur den Rahmen, die Themenfelder wurden nicht erneut gegen den Text geprüft | ungeprüft |
| **Fachbrief Geografie 10** (Schulportal Berlin) | [PDF](https://schulportal.berlin.de/get-data/2674edf3-97a4-744c-89df-9f5c6f8d9b06/Fachbrief_Geografie_10.pdf) | Behördenschrift, Lizenz nicht erkennbar | Erläutert laut Treffer Teil C Geografie, Eckpunkte Jahrgang 7–10 und das einheitliche Kompetenzmodell (Jahr 2016 laut Treffer). Hintergrund für Kompetenzangaben in Materialien | ungeprüft |
| **Fachbriefe Biologie 17 und 18** (Schulportal Berlin) | [Nr. 17](https://schulportal.berlin.de/get-data/e6035acc-3b9b-46f7-9cdf-6a6bb29e2aa2/Fachbrief_Biologie_17_ueT.pdf), [Nr. 18](https://schulportal.berlin.de/get-data/83651f86-b385-7a4d-a594-52d356aa0f07/Fachbrief_Biologie_18.pdf) | nicht erkennbar | Nur als Fundstelle aufgenommen, **Inhalt nicht bekannt**. Erst lesen, dann nutzen | ungeprüft |
| **OER in Berlin: Richtlinie und Veröffentlichungsweg** | [OER-Policy der Senatsverwaltung](https://www.berlin.de/sen/bildung/unterricht/medien/digitales-lernen/oer_policy.pdf), [Rechteformular Bildungsserver](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/Lebenslanges_Lernen/Ausbildung/Berufliche_Bildung/Fachtagungen_2024/DozentenbogenOER-Rechte.pdf) | Formular: OER unter CC BY 4.0, CC BY-SA 4.0 oder CC BY-ND 4.0. Ein Hamburger Dokument führt LISUM-Material als CC BY-SA 4.0: je Material prüfen | Eigene Materialien des Portals könnten über den Bildungsserver als OER erscheinen. **Achtung bei BY-ND:** nicht bearbeitbar, daher nicht in eigene Seiten einarbeiten. Ein Bio- oder Geo-OER-Bestand wurde **nicht gefunden** (nur Informatik), ein Repositorium „oer-berlin.de“ steht nur im Text eines Treffers, ohne Link | ungeprüft |
| **Berliner Fachbrief DaZ 22 und 24** (Reihe „Brüche vermeiden, Brücken bauen“) | [Nr. 22](https://schulportal.berlin.de/get-data/f6cd14eb-dab1-468e-9e05-868863e13576/Fachbrief_Sprachfoerderung_DaZ_22_UEbergang_Teil_1.pdf), [Nr. 24](https://schulportal.berlin.de/get-data/fd5a5a8e-ebf9-40d7-9f32-008e4205063f/Fachbrief_Sprachfoerderung_DaZ_24_Willkommen_in_der__Regelklasse.pdf) | Behördenschrift | Übergang in die Regelklasse: Schülerinnen und Schüler brauchen danach weiter Sprachförderung. Stütz für Mehrsprachigkeit und Scaffolds im Portal (Vorschlag 1) | bestätigt (Suchbeleg 2), Inhalt nur als Inhaltsverzeichnis |

#### b) OER, Bilder, Karten, mehrsprachige Begriffe

| Quelle | Link | Lizenz | Passung zum Portal in einer Zeile | Status |
|---|---|---|---|---|
| **Wikidata** (Begriffsnamen in vielen Sprachen) | [Lizenz](https://www.wikidata.org/wiki/Wikidata:Licensing) | **CC0** (Treffer: alle Daten CC0, andere Lizenzen werden nicht gehostet) | Fachbegriffe haben zu einer Kennung (Q-Nummer) Bezeichnungen in vielen Sprachen. Ideale Rohquelle für mehrsprachige Begriffe ohne Lizenzproblem (Vorschlag 1). **Abdeckung für Ukrainisch, Arabisch, Türkisch, Polnisch, Russisch und die fachliche Qualität schulischer Begriffe sind nicht geprüft** | Lizenz bestätigt (Suchbeleg), Abdeckung **ungeprüft** |
| **Namensnennung richtig (TULLU-Regel)**: Titel, Urheber, Lizenz mit Link, Ursprungsort, bei Bearbeitung „V“ | [ZHAW-Leitfaden OER](https://www.zhaw.ch/storage/hochschule/hsb/lehren-forschen/leitfaden-oer.pdf), [bildungsserver.de OER im Schulbereich](https://www.bildungsserver.de/oer-im-schulbereich-10854-de.html) | Leitfäden, Lizenz nicht geprüft | Passt zum „Quellenblatt automatisch“ und zum Lizenz-Sortierspiel (10.5): Das Quellenblatt kann genau diese fünf Angaben ausgeben. ZHAW empfiehlt CC BY und CC BY-SA für Schulmaterial. Ein „Lizenzhinweisgenerator“ für Wikipedia- und Commons-Bilder wird im Treffer erwähnt, **ohne Link** | ungeprüft |
| **CC BY-SA: Folge für das Portal** | wie oben | CC BY-SA verlangt, dass Bearbeitungen **unter derselben Lizenz** weitergegeben werden | Bilder aus Commons mit BY-SA dürfen nur dann in eigene Seiten, wenn der Hinweis auf die Lizenz der Bearbeitung mitgeht. Für Bilder in Folien wählen: gemeinfrei, CC0, CC BY. BY-SA nur mit bewusster Entscheidung | ungeprüft (Zusammenfassung) |
| **Mehrsprachige Glossare Biologie** | [Planet-Beruf, 100 Fachbegriffe (Beispiel „Biotop“)](https://100fachbegriffe.planet-beruf.de/landwirtschaft-gartenbau/biotop/l_englisch) | **nicht angegeben** | Enthält laut Treffer Arabisch, Türkisch, Ukrainisch. Ohne Lizenz **nicht übernehmen**, nur als Vergleichsmaterial beim Gegenlesen | ungeprüft |
| **Glossare mit Lizenzproblem** | [Friedrich Verlag: Fachwortschatz Biologie](https://www.friedrich-verlag.de/shop/fachwortschatz-biologie-1843007), [Osceola Schools, Arabic Biology Glossary](https://www.osceolaschools.net/cms/lib/FL50000609/Centricity//Domain/148/Arabic%20Biology%20Glossary%20-%20Secondary%209-12.pdf) | Verlag: kostenpflichtig (Deutsch, Arabisch, Englisch). Schulbezirk USA: Lizenz nicht erkennbar, kein Deutsch | **Nicht verwenden.** Aufgenommen, damit niemand sie später für frei hält | ungeprüft |
| **Methodenkarte Glossar** (Schulentwicklung NRW) | [PDF](https://www.schulentwicklung.nrw.de/q/upload/Interkultur/Arbeitsblaetter/Methodenkarte_Glossar.pdf) | nicht erkennbar | Methode: SuS führen **eigene** Glossare. Passt zu „Wortspeicher“ im Portal. Nur die Idee nutzen | ungeprüft |

Kein frei lizenziertes, fertiges Biologie-Glossar auf Deutsch mit Ukrainisch, Arabisch und Türkisch wurde gefunden.

#### c) Citizen Science für Schulen

| Quelle | Link | Lizenz | Passung zum Portal in einer Zeile | Status |
|---|---|---|---|---|
| **Humboldt Explorers** (HU Berlin, Berliner Lerngruppen) | [Adlershof-Meldung 2024](https://adlershof.de/news/naturwissenschaftlich-forschen-auf-dem-schulhof), [Klimaschulen-Beispiel](https://www.berlin.de/klimaschulen/preistraeger/2022-23/alle-schulen/artikel.1437875.php) | Lizenz der Materialien **nicht gefunden**, keine Downloadmaterialien in den Treffern | Lerneinheiten zu Pflanzenartenvielfalt, Lärm und (ab 2. Förderperiode 2024) Feinstaub, Jahrgang 7–10 laut Mitteilung von 2022 (ein Interview nennt 5–12). Termin über die Projektseite buchen. Direkter Berlin-Bezug für Bio 3.2 und Geo | ungeprüft, Angaben zur Jahrgangsspanne widersprüchlich |
| **City Nature Challenge Berlin** (Museum für Naturkunde mit iNaturalist) | [Exkursion Tempelhofer Feld 2026](https://www.museumfuernaturkunde.berlin/en/programme/events/details/city-nature-challenge-2026-biodiversity-at-tempelhofer-feld/), [Ergebnis 2024](https://www.museumfuernaturkunde.berlin/en/press/press-releases/city-nature-challenge-2024-top-ranking-berlin-common-spadefoot-toad-and) | Beobachtungsdaten: Nutzerlizenz, oft CC BY-NC (siehe 10.1), nicht abgerufen | Berlin 2024 laut Museum: 17 944 Beobachtungen, 355 Teilnehmende, 2 304 Arten. Öffentliche Angebote, **kein Schulprogramm gefunden**. Eine Auswertung (ECSA-2026-Poster) vergleicht mit GBIF: Wirbeltiere werden häufiger bestätigt als Insekten, Pilze, Flechten. Gute Anlass für „Wie sicher ist eine Bestimmung?“ | ungeprüft |
| **Mückenatlas** (ZALF, Friedrich-Loeffler-Institut) | [Projektseite](https://mueckenatlas.com/about/) | nicht angegeben | Mücken fangen und **per Post** an das ZALF in Müncheberg senden, Rückmeldung an die Einsender. Laut Treffer ein Beitrag in „Biologie in der Schule“ (2017), dass das Projekt in Schulen gelingt. Das UBA nennt Verzerrung (ungewöhnliche Tiere werden eher gemeldet): guter Anlass zur Datenkritik. Unterrichtsmaterial **nicht gefunden** | ungeprüft |
| **Citizen Science mit Schulen: Leitfaden** (Kiessling et al. 2023, Zenodo) | [Zenodo-Eintrag](https://zenodo.org/records/10137030) | **Lizenzfeld nicht gesehen** (andere Einträge derselben Person sind CC BY 4.0) | Richtet sich an Projektleitungen: Rollen, Beteiligung der Lehrkraft, Datenschutz, Passung zum Schulalltag. Als Checkliste für eigene Aufgaben nutzbar | ungeprüft, Lizenz offen |
| **„Citizen Science für die Schule!“** (Heft für Lehrkräfte 2025, Wissenschaft im Dialog, Projekt mit:forschen!, Museum für Naturkunde Berlin) | [OeAD-Meldung](https://oead.at/de/aktuelles/artikel/2025/09/citizen-science-fuer-die-schule-neuer-leitfaden-fuer-lehrpersonen) | Laut Meldung online kostenlos, frei weiterzugeben und zu vervielfältigen, **CC-Lizenz nicht genannt** | Praxisheft. Verlinken, nicht kopieren, bis die Lizenz gelesen ist | ungeprüft |
| **Schulstunde der Gartenvögel** (NAJU, Beispiel aus einem Leitfaden für Schleswig-Holstein), **Insektenzählung** | [Leitfaden (PDF)](https://www.bibliotheken-sh.de/fileadmin/downloads/projekte/expedition-natur-sh/expedition-natur-sh-citizen-science-projekte_jugendliche.pdf) | nicht erkennbar | Verfahren: eine Stunde zählen, je Art die **höchste gleichzeitig gesehene Zahl**. Übertragbar auf den Schulhof. Berlin-spezifisches Schulangebot nicht gefunden | ungeprüft |
| **„Das bunte Flattern“** (Senatsverwaltung, „Lass Berlin aufleben“) | [Seite](https://www.berlin.de/sen/uvk/natur-und-gruen/biologische-vielfalt/lass-berlin-aufleben/das-bunte-flattern/) | nicht erkennbar | Nur Titel gesehen, **Inhalt unbekannt**: möglicher Berliner Schmetterlings-Anlass | ungeprüft |

#### d) Exkursionsorte in Berlin

| Ort oder Angebot | Link | Lizenz oder Bedingung | Passung zum Portal in einer Zeile | Status |
|---|---|---|---|---|
| **Tempelhofer Feld** (Vögel, Boden, Pflanzen) | [Museum für Naturkunde 2026](https://www.museumfuernaturkunde.berlin/en/programme/events/details/city-nature-challenge-2026-biodiversity-at-tempelhofer-feld/), [Grüne Liga: Pflanzenjagd (PDF, 2022)](https://grueneliga-berlin.de/wp-content/uploads/2022/08/Exkursion_T-Feld.pdf) | Lizenz der Anleitung nicht erkennbar | Großer offener Raum, gut erreichbar, passend zu Bio 3.2 und Geo (Stadtklima, Flächennutzung). Die Pflanzenjagd-Anleitung ist ein Muster für eine Stationenkarte mit QR | ungeprüft |
| **Naturschutzgebiet Tegeler Fließ**, Umweltladen Mitte | [Meldung 2026](https://www.berlin.de/ba-mitte/aktuelles/pressemitteilungen/2026/pressemitteilung.1676384.php) | Treffer: kostenlos, vier Stunden, nicht barrierefrei, Termin 07.06.2026 (**vorbei**) | Beispiel für ein Bezirksangebot. Termin bereits abgelaufen, nur als Hinweis, beim Umweltladen nach Schulterminen fragen | ungeprüft |
| **Bio-Höfe, Schulexkursionen** (Charlottenburg-Wilmersdorf) | [Meldung 2021](https://www.berlin.de/ba-charlottenburg-wilmersdorf/aktuelles/pressemitteilungen/2021/pressemitteilung.1065267.php) | Pilotprojekt 2021, Fahrtkosten ÖPNV | Bio 3.3 und Geo 3.5, Landwirtschaft. **Ob das Angebot noch besteht, ist unklar** | ungeprüft |
| **Botanischer Garten, Rieselfelder, Naturschutzstationen, Schulbiologiezentrum** | – | – | Hier ergab die Suche **keine verwertbaren Treffer** (ein „Schulbiologiezentrum“ lag in Chemnitz). Direkte Anfrage oder Senatsverwaltung nötig, nichts erfunden | offen |
| **Geoportal Berlin und Umweltatlas** (Stadtklima, Kühlrate) | [Beispiel Kühlrate 2015](https://gdk.gdi-de.org/geonetwork/srv/api/records/c5d57f6c-5c67-34d0-af56-f36e43f4b897), [Stadtklima in der Geodatensuche](https://gdi.berlin.de/geonetwork/srv/api/records/1a2935d9-4cfc-3ae4-99db-f2113831c903) | Je Datensatz: DL-DE-BY 2.0 (Vermerk „Umweltatlas Berlin / [Titel des Datensatzes]“) **oder** DL-DE-Zero 2.0 | Klärt eine offene Frage aus 10.1: Lizenzen der Umweltatlas-Sätze sind **uneinheitlich**. Stadtklima-Planungskarten 2022 lösen die Fassung 2015 ab. Wer den FIS-Broker ersetzt hat, ist weiter offen | bestätigt (Suchbeleg 2) für Lizenzvielfalt, Zugang offen |

#### e) LRS-Forschung und Barrierefreiheit

| Quelle | Link | Aussage (aus Treffern) | Folge für das Portal | Status |
|---|---|---|---|---|
| **Marinus et al. 2016**: „A Special Font for People with Dyslexia: Does it Work and, if so, why?“ | [PubMed](https://pubmed.ncbi.nlm.nih.gov/27194598/) | Bei gleichem Abstand verschwindet der Vorteil der Spezialschrift: Wirksam ist der **Abstand**, nicht die Buchstabenform | Keine feste „LRS-Schrift“. Stattdessen Abstände einstellbar machen (Vorschlag 3) | bestätigt (Suchbeleg 2, Volltext nicht gelesen) |
| **Folgestudien** zu Spezialschriften (OpenDyslexic: kein Gewinn bei Genauigkeit und Tempo; Dyslexie-Schrift ohne eigenen Formeffekt; Abstandseffekt nicht durchgehend wiederholt), Zorzi et al. 2012 (größerer Abstand half) | [Galliussi et al. 2020 (PDF)](https://arts.units.it/retrieve/handle/11368/2960158/339575/Galliussi2020_Article_Inter-letterSpacingInter-wordS.pdf) | Übersicht: Abstandseffekt umstritten. Galliussi 2020: Mehr **Buchstabenabstand ohne mehr Wortabstand verlangsamt** das Lesen | Buchstaben- und Wortabstand **gekoppelt** verstellen, nie einzeln. Standard unverändert lassen, Wahl dem Nutzer überlassen | ungeprüft (Zusammenfassung, Zorzi-Quelle nicht verlinkt) |
| **WCAG 2.2, Erfolgskriterium 1.4.12 Textabstand** (Stufe AA) | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Nutzende sollen Textabstände anpassen können, ohne dass Inhalt verloren geht oder überlappt | Prüfpunkt für `material.css` und die Leseansicht. Die genauen Werte (Zeilenabstand 1,5, Absatz 2-fach, Buchstabe 0,12 em, Wort 0,16 em) stehen **nicht in den Treffern** und sind Allgemeinwissen: vor Einsatz an der W3C-Seite nachlesen | Kriterium bestätigt (Suchbeleg), Werte **ungeprüft (Allgemeinwissen)** |
| **Checklisten barrierearmer Lernmaterialien** (Uni Bremen BALLON, FernUni Hagen, HOOU) und **Handreichung des Bundes** zu Dokumenten in Lernkontexten (Basis WCAG 2.2, Stand 25.03.2026) | [Bund (bfit)](https://handreichungen.bfit-bund.de/bf-dokumente-lernkontext/2.2/docs/barrierefreie-dokumente-in-lernkontexten.pdf), [FernUni Hagen](https://www.fernuni-hagen.de/barrierefrei/docs/checkliste_barrierefreiheit_in_der_digitalen_lehre.pdf) | Praxislisten für Dokumente, Präsentationen, Videos. EN 301 549 wird laut Handreichung überarbeitet | Fertige Prüfliste für Materialseiten und Präsentationen (z. B. PDF-Export). Lizenzen nicht geprüft, deshalb verlinken statt kopieren | ungeprüft |
| **Leichte Sprache** | – | Keine Treffer in dieser Runde | Offen. Netzwerk Leichte Sprache und BITV als Startpunkte (nur Namen aus dem Treffertext, nicht geprüft) | offen |

### 11.3 Drei Umsetzungsvorschläge

Ausgewählt nach Nutzen für den Unterricht, Lizenzklarheit und Passung zu dem, was das Portal schon kann (`lp-spiel-daten`, Länder-Quiz, Rückkanal per QR, Lesemodus, Pipeline). Kompetenzbezeichnungen folgen dem Sprachgebrauch dieses Katalogs und sind vor dem Einsatz mit dem Wortlaut des RLP abzugleichen. Keine Lösungen oder Erwartungshorizonte im Repository: Prüf- und Musterangaben bleiben bei der Lehrkraft.

#### Vorschlag 1: Mehrsprachige Begriffe, vorab geholt und als „ungeprüft“ gekennzeichnet

- **Themenfeld:** alle mit Begriffen im Portal, Start mit Bio 3.1 Zelle und 3.2 Lebensräume sowie Geo 3.1 Risikoräume.
- **Kompetenzbereich:** Kommunikation und Sprachbildung (Fachsprache verstehen und verwenden), Fachwissen sichern.
- **Niveau:** D–E für Neuzugewanderte und DaZ-Lernende, nutzbar bis H als Nachschlagehilfe.
- **Ablauf in 5 Schritten:**
  1. Lehrkraft wählt aus der Begriffe-Seite 8 bis 12 Begriffe und ordnet je Begriff die passende Wikidata-Kennung von Hand zu (Wikidata-Treffer prüfen, nicht raten).
  2. Ein neuer Befehl in `tools/daten-holen.py` holt die Bezeichnungen für Ukrainisch, Arabisch, Türkisch, Russisch, Polnisch und schreibt `daten/begriffe-sprachen.json` mit Quelle (Wikidata, CC0), Abrufdatum und `"geprueft": false` je Eintrag.
  3. Eine Lehrkraft oder Kollegin mit der Sprache prüft die Einträge, setzt `"geprueft": true` oder korrigiert. Ungeprüfte Einträge erscheinen mit dem Hinweis „maschinell oder aus offener Datenbank, nicht geprüft“.
  4. Die Begriffe-Seite zeigt eine Sprachwahl („Zusätzlich in …“, wie im Länder-Quiz), das Vorlesen nutzt `lang` je Sprachabschnitt, damit die richtige Stimme gewählt wird (nur wenn das Gerät sie hat).
  5. Einsatz: SuS suchen den Begriff in ihrer Sprache, erklären ihn auf Deutsch in einem Satz und stellen sich gegenseitig vor („Wie heißt das bei dir?“). Rückmeldungen zu Fehlern gehen an die Lehrkraft, die den Eintrag korrigiert.
- **Benötigte Daten:** Begriffsliste aus `lp-spiel-daten`, Wikidata-Bezeichnungen (CC0, **Abdeckung je Sprache noch zu prüfen**), Gegenlesen durch Sprachkundige. Optional als Zusatz die Translator-API (Chrome 138, Arabisch, Türkisch, Ukrainisch belegt, Polnisch und Russisch nicht), immer als „ungeprüft“ gekennzeichnet.
- **Aufwand:** M (Skript und Seite ein bis zwei Tage, Gegenlesen je Sprache zusätzlich).
- **Risiken:** Wikidata kennt nicht jeden Schulbegriff, Bezeichnungen können fachlich oder sprachlich daneben liegen. Ohne Gegenlesen bleibt alles „ungeprüft“. Die Datei darf keine Namen von SuS enthalten.

#### Vorschlag 2: Schulhof-Zählung mit Klassendatensatz (Citizen-Science-Verfahren, lokal ausgewertet)

- **Themenfeld:** Bio 3.2 Lebensräume und ihre Bewohner, mit Bezug zu Geo 3.6 (Klimawandel verändert Lebensräume).
- **Kompetenzbereich:** Erkenntnisse gewinnen (untersuchen, messen, Daten auswerten), Bewerten (Aussagekraft von Daten beurteilen).
- **Niveau:** F–G, mit Hilfen für E (Zählbogen mit Vorlage) und Zusatzfragen für H (Fehlerquellen, Vergleich mit Fachdaten).
- **Ablauf in 5 Schritten:**
  1. **Fragestellung und Plan:** Die Klasse formuliert eine Frage („Wo auf dem Schulhof leben die meisten Insektenarten?“) und legt Verfahren fest: feste Zählfläche, feste Zeit, je Art die höchste gleichzeitig gesehene Zahl (Verfahren der Schulstunde der Gartenvögel, Leitfaden s. 11.2 c).
  2. **Zählen draußen** in Gruppen mit Papierbogen oder einer Tabelle im Browser. Kein Foto von Personen, kein Standort, keine Namen.
  3. **Zusammenführen:** Jede Gruppe erzeugt einen Ergebnis-QR (Prototyp `labor/rueckkanal/`), die Lehrkraft scannt, die Seite fügt die Tabellen zum Klassendatensatz zusammen.
  4. **Auswerten:** Diagramm der Klasse mit zugehöriger Tabelle, Vergleich der Gruppen, Fehlerquellen sammeln (Wetter, Tageszeit, Bestimmungssicherheit).
  5. **Einordnen und beurteilen:** Vergleich mit einem vorab geholten Datensatz der Umgebung (nur Quellen mit CC0 oder CC BY, Auswahl mit Lizenzprüfung, Beobachtungsdaten von iNaturalist nur wenn die Lizenz im Datensatz CC0 oder CC BY ist). Frage: „Was sagen unsere Daten, was nicht?“ Optional Meldung durch die Lehrkraft an ein Projekt (Humboldt Explorers, City Nature Challenge, Mückenatlas) **von Hand**, nie automatisch.
- **Benötigte Daten:** Eigene Messwerte der Klasse (bleiben im Browser oder im QR), optional vorab geholter Artenfund-Datensatz des Bezirks (GBIF, Lizenz je Datensatz), Zählbogen als Druckvorlage. Das Portal braucht dafür **keine** Fremdanfrage zur Laufzeit.
- **Aufwand:** M (Zusammenführen und Diagramm zwei bis drei Tage auf der Basis des QR-Prototyps, Zählbogen und Material ein Tag).
- **Risiken:** Ergebnis-QR fasst nur etwa 280 Zeichen, je Gruppe also wenige Arten, sonst mehrere QR. Artbestimmung ist für Jg. 7–8 schwer: Gruppen bestimmen Gruppen (Käfer, Fliegen, Falter) statt Arten. Wetter und Aufsicht planen. Rechte an Bildern von Arten klären (Vorschlag 1 zu Bildlizenzen gilt entsprechend).

#### Vorschlag 3: Einstellbare Lesedarstellung (Textabstand, Zeilenabstand, Schriftgröße), kein „LRS-Modus“ mit fester Schrift

- **Themenfeld:** themenfeldübergreifend (alle Materialseiten, Leseansicht, Begriffe-Seite).
- **Kompetenzbereich:** Kommunikation (Texte lesen und verstehen), Barrierefreiheit als Querschnitt.
- **Niveau:** D–H, für alle gedacht, besonders hilfreich bei LRS und Sehbeeinträchtigung.
- **Ablauf in 5 Schritten:**
  1. Den Lesemodus (`prefs.js`) um drei Regler erweitern: Schriftgröße, Zeilenabstand, Textabstand. **Buchstaben- und Wortabstand werden gemeinsam verstellt**, weil mehr Buchstabenabstand ohne mehr Wortabstand laut Galliussi 2020 das Lesen bremst.
  2. Voreinstellung bleibt unverändert. Die Wahl liegt nur im Browser des Geräts (wie bisher), nichts wird gesendet.
  3. Prüfen an Materialseiten, Leseansicht und Präsentation, dass bei erhöhten Abständen nichts abgeschnitten wird oder sich überlagert (Erfolgskriterium 1.4.12, Prüfwerte an der W3C-Seite nachlesen).
  4. Hilfeseite `hilfe/` bekommt einen kurzen Abschnitt „Lesen einstellen“ mit Hinweis: Probiere aus, was für dich leichter ist. Keine Behauptung, eine Einstellung helfe allen.
  5. Rückmeldung einholen (Klasse mit LRS, Förderlehrkraft, Lehrkraft für Sehen), Voreinstellungen bei Bedarf anpassen, Ergebnis kurz in `docs/gestaltung.md` festhalten.
- **Benötigte Daten:** keine neuen. Quellen für die Begründung: Marinus 2016, Galliussi 2020, WCAG 1.4.12 (siehe 11.2 e). Die Wirksamkeit für einzelne Kinder ist **nicht** belegt, daher Wahlfreiheit.
- **Aufwand:** S bis M (ein bis zwei Tage, mit Tests).
- **Risiken:** Seitenlayout (Tabellen, Folien) kann bei großen Abständen brechen. Die Evidenz zum Abstand ist uneinheitlich: nicht versprechen, dass es hilft. Atkinson Hyperlegible Next als wählbare Schrift bleibt eine getrennte Entscheidung (Lizenz und Wirkung aus 10.2 nicht belegt).

### 11.4 Neue Ideen aus dieser Runde (nicht ausgearbeitet)

| Idee | Nutzen | Aufwand |
|---|---|---|
| **Quellenblatt nach TULLU** | Das Quellenblatt aus 10.5 gibt Titel, Urheber, Lizenz mit Link, Ursprungsort und Veränderung aus, Knopf „kopieren“ | S |
| **Bestimmungssicherheit als Lernanlass** | Aus der Auswertung der City Nature Challenge: Warum werden Vögel häufiger bestätigt als Insekten? Datenkritik an Bürgerdaten | S |
| **Verzerrung in Meldedaten** | Mückenatlas: Ungewöhnliche Tiere werden eher gemeldet. Karten- oder Tabellenaufgabe „Wer meldet was?“ | S |
| **Stationenkarte Tempelhofer Feld** | Pflanzenjagd als Stationenlauf mit QR (Idee G aus Abschnitt 4), Karte lokal | M |
| **Prüfliste Barrierefreiheit im Repository** | Kurze Liste in `docs/` aus WCAG 2.2 und den verlinkten Checklisten, läuft zusätzlich als Prüfpunkt in `tools/check.py` (nur Hinweise) | S |

### 11.5 Was in der nächsten Runde mit freiem Netz geprüft werden muss

1. **Netzfreigabe:** Diese Runde zeigte, dass Domains außerhalb der Freigabe nicht auflösen. Vor einer weiteren Prüfung folgende Hosts in den Netzwerkeinstellungen der Sitzung freigeben: `open-meteo.com`, `smard.de`, `phet.colorado.edu`, `opendata.dwd.de`, `luftdaten.umweltbundesamt.de`, `worldbank.org`, `unhcr.org`, `eonet.gsfc.nasa.gov`, `www.wikidata.org`, `commons.wikimedia.org`, `zenodo.org`, `bildungsserver.berlin-brandenburg.de`, `schulportal.berlin.de`.
2. **PhET:** Lizenzseite lesen (CC BY-NC für neue Versionen? Historische Sammlung nutzbar?). Bis dahin nichts ablegen.
3. **Wikidata:** Probeabruf für 10 Begriffe, Abdeckung in uk, ar, tr, ru, pl messen, Qualität durch Sprachkundige beurteilen lassen (Grundlage für Vorschlag 1).
4. **Zenodo-Leitfaden 2023 und Heft 2025:** Lizenzfeld lesen.
5. **EONET:** Testabruf ohne Schlüssel. **Translator:** Sprachliste der Chrome-Doku lesen (Polnisch, Russisch).
6. **RLP:** Prüfen, ob die Neuentwicklung der Biologie-Fachteile Themenfeld-Nummern ändert, und `themenfelder.json` bei Bedarf anpassen.
7. **Humboldt Explorers:** Projektseite, Lizenz der Materialien, Jahrgangsspanne, Buchungsweg.
8. **Exkursionsorte:** Botanischer Garten, Naturschutzstationen, Umweltämter: Schulangebote bei den Anbietern erfragen, nichts hier übernehmen, bevor es bestätigt ist.
9. **WCAG 1.4.12:** Prüfwerte an der W3C-Seite nachlesen.
10. Alle Links in 11.2 stammen aus Suchtreffern. Beim ersten Öffnen prüfen, ob sie noch stimmen.

## 12. Nachträge (Hinweise der Lehrkraft)

### 12.1 PhET „Natural Selection“ (Hinweis vom 17.11.2026)

| Feld | Eintrag |
|---|---|
| Link | [phet.colorado.edu/de/simulations/natural-selection](https://phet.colorado.edu/de/simulations/natural-selection) |
| Fach, Passung | Biologie, Basiskonzept Entwicklung (Variabilität und Angepasstheit). Jahrgang und Themenfeld sind **zuzuordnen** (nicht belegt). Passt zum Muster „erst vermuten, dann simulieren, dann Modell beurteilen“ wie `labor/raeuber-beute/`: Die Klasse sagt vorher, wie sich ein Merkmal in der Population verändert, lässt die Simulation laufen und beurteilt die Modellgrenzen |
| Inhalt (nicht abgerufen) | Aus dem Titel und allgemeiner Kenntnis: Population mit erblichen Merkmalen und Umweltfaktoren. **Ungeprüft**, Seite war im Netz der Entwicklungsumgebung gesperrt (Host `phet.colorado.edu` nicht freigegeben) |
| Sprache | Deutsche Adresse (`/de/`) vorhanden, Umfang der Übersetzung **ungeprüft** |
| Lizenz (Suchbeleg, ungeprüft) | Laut Suchtreffern auf den PhET-Lizenzseiten: reguläre HTML-Simulationen unter **CC BY 4.0** mit Namensnennung „PhET Interactive Simulations, University of Colorado Boulder, https://phet.colorado.edu“, Quellcode GPL-3.0 bzw. MIT, Name und Logo sind Marken (kein Freibrief). Eine Sonderregel „historische Sammlung“ mit Stichtag 29.03.2026 wird erwähnt, deren Inhalt ist **offen**. **KORREKTUR am 17.11.2026 an der Quelle:** Die Aussage aus Abschnitt 11.1 (aktuelle Fassung unter CC BY-NC) ist **richtig**, meine Bemerkung „nicht bestätigt“ an dieser Stelle war falsch. Siehe 12.7 |
| Umgang im Portal | **Verlinken, nicht kopieren**: Linkkarte auf der Materialseite mit Namensnennung und Hinweis „öffnet PhET (Dritter)“. Kein Einbetten per iframe (Datenschutz, Abschnitt 9). Optional später Offline-Kopie nur nach gelesenem Lizenzwortlaut |
| Aufwand | S (Linkkarte und Aufgabenblatt), M mit passender Folge und Arbeitsblatt |
| Status | ungeprüft (Suchbeleg), Quellseite nicht gelesen |

Quellen der Suche: [PhET Lizenz HTML](https://phet.colorado.edu/en/licensing/html), [Historische Sammlung](https://phet.colorado.edu/be/licensing/html), [Natural Selection, Quellcode](https://awesome.ecosyste.ms/projects/github.com%2Fphetsims%2Fnatural-selection).

### 12.2 Foto in die Folie (Idee der Lehrkraft, 17.11.2026)

Statt Ergebnisse per QR zu scannen: Heft, Plakat oder Gruppenergebnis **abfotografieren und direkt auf der Folie zeigen**. Bausteinen: `assets/js/fotofolie.js` (in `vorlage/praesentation/` eingebunden). Taste B, Knopf „Foto“, Einfügen (Strg/Cmd+V) oder Datei auf die Folie ziehen. Das Bild bleibt im Browser, es wird nicht hochgeladen oder gespeichert. Drehen, Zoom 1x bis 3x, mehrere Fotos blättern, Esc schließt. Getestet im Browser mit Testdateien, **nicht** mit der echten Kamera, dem iPad oder dem Beamer.

Weg vom iPad zur Präsentation: läuft die Präsentation auf dem iPad selbst (Spiegelung aufs Board), öffnet „Foto“ direkt die Kamera. Läuft sie auf dem Laptop, hilft AirDrop, USB oder das Einfügen aus der Zwischenablage (Universal Clipboard, **ungeprüft**).

### 12.3 Weitere Prototypen (17.11.2026)

Alle unter `labor/`, im Browser getestet (Hörbereich ohne echte Lautsprecher, Schieber und Reaktionstest ohne echte Geräte):

| Prototyp | Idee | Themenfeld | Anmerkung |
|---|---|---|---|
| `labor/weltzeit/` | Weltzeit-Uhr mit „nach Länge erwartet“ gegen tatsächliche Zeitzone | Geo 3.3 | Zeitzonen und Sommerzeit aus der Datenbank des Browsers, nichts aus dem Netz |
| `labor/kreuzung/` | Kreuzungsquadrat, Nachkommen würfeln gegen Erwartung | Bio 3.7 | Ein Merkmal, vollständige Dominanz, Modellgrenzen genannt |
| `labor/reaktion/` | Reaktionstest, Mittelwert, Median | Bio 3.6 | Gerätelatenz (Bildschirm, Berührung) wird mitgemessen und als Lernanlass genannt |
| `labor/hoerbereich/` | Tongenerator 20 bis 20 000 Hz | Bio 3.6 | Hinweis zum Gehörschutz im Text, Tonstärke begrenzt |
| `labor/vergleich/` und `assets/js/vergleich.js` | Vorher/Nachher-Schieber | Geo allgemein | Demo mit **gezeichneten Platzhalterbildern**, für echte Bilder Quelle und Lizenz einsetzen |
| `labor/wirkungsgefuege/` | Wirkungsgefüge mit + und −, findet Kreisläufe | Geo 3.6, 3.7 | Beispiel Eis-Albedo-Rückkopplung vorgeladen, Export als Bild |

### 12.4 Dritte Runde: alle übrigen Prototypen ohne externe Daten (17.11.2026)

Alle unter `labor/`, im Browser getestet (Kamera, Standort, Sensoren und Sprachausgabe simuliert oder ohne echte Geräte). **Beispieldaten sind überall als Beispiel gekennzeichnet.**

| Prototyp | Themenfeld | Anmerkung |
|---|---|---|
| `mikroskop/` | Bio 3.1 | Foto laden, zwei Punkte kalibrieren, messen. Rechenweg getestet (200 Pixel gleich 100 µm gibt 150 µm bei 300 Pixeln) |
| `energiebilanz/` | Geo 3.6 | Ein-Schicht-Modell, Ausgangslage etwa 15 °C. Werte (Albedo 0,30, Rückhalt 0,78) sind gerundete Näherungen |
| `kompass/` | Geo allgemein | `deviceorientation`, iPhone mit Freigabe, Regler als Rückfall |
| `massstab/` | Geo allgemein | Maßstabsrechnung und Strecke per Standort (nur lokal, nur nach Antippen) |
| `schatten/` | Geo, Bio | Sonnenhöhe, Azimut, Schattenlänge, Näherung etwa 1 Grad. Mittagshöhe stimmt mit 90 minus Breite plus Deklination überein |
| `mystery/` | Bio 3.1 | Beispiel zur Fotosynthese **selbst geschrieben, fachlich gegenzulesen**, eigene Karten ladbar |
| `planspiel/` | Geo 3.6 | Phasenuhr, sechs Rollen **als Entwurf**, Abstimmungszähler |
| `papierkarten/` | Ablauf | Kartendruck mit QR und Buchstaben, Lage der Karte gleich Antwort. Drehung A, B, C, D mit gedrehten Codes getestet, Kamera live nicht |
| `zaehlbogen/` | Bio 3.2 | Zählen, QR, Summe der Gruppen. Rundlauf getestet |
| `lesedarstellung/` | Querschnitt | Größe, Zeilen- und Textabstand, Hintergrund, Schrift, nur im Browser gemerkt |
| `warming/` | Geo 3.6 | Beispielreihe **künstlich erzeugt**, eigene Daten einfügbar |
| `klimadiagramm/` | Geo 3.3, 3.6 | Beispielwerte für Berlin **gerundet und nicht amtlich** |
| `streuplot/` | Geo 3.4, 3.7 | Beispielländer **erfunden** |
| `quellenblatt/` | Medienbildung | TULLU-Vermerk, sechs Lizenzfälle als Vereinfachung, keine Rechtsberatung |
| `hilfen/` und `assets/js/hilfen.js` | Querschnitt | Drei Hilfestufen zum Aufdecken |
| `karteikasten/` | Querschnitt | Liest freigegebene Begriffe der Stunden, Leitner-Fächer im Browser, Kalenderdatei |
| `begriffe-sprachen/` und `daten/begriffe-sprachen.json` | Querschnitt | Neun Begriffe in fünf Sprachen, **von mir zusammengestellt, ungeprüft und nicht aus Wikidata**. Gegenlesen nötig |

### 12.5 Meeresspiegelanstieg modellieren (Wunsch der Lehrkraft, 17.11.2026)

`labor/meeresspiegel/`, vier Reiter: (1) **Küstenschnitt** mit vier gezeichneten Küstenformen (Flussdelta, Steilküste, Küste mit Deich und Land unter dem Meeresspiegel, flache Insel), Regler für Anstieg, Sturmflut und Deichhöhe, Zählung überfluteter Häuser. (2) **Woher das Wasser kommt**: Beiträge von Gebirgsgletschern, Grönland, Westantarktis, Ostantarktis, schwimmendem Eis (null) und Wärmeausdehnung, mit Übernahme in den Küstenschnitt. (3) **Eis im Glas**: schwimmendes Eis gegen Eis auf einem Stein, mit Vorhersage. (4) **Im Internet nachsehen**: Linkkarten zu Climate Central, NOAA und Flood Maps (nicht eingebettet, Adressen aus der Erinnerung, **ungeprüft**).

**Grenzen:** Küstenformen sind schematisch, keine echten Orte. Die Zahlen (Eismassen, Wärmeausdehnung, Szenarien um 2100) sind gerundete Näherungen aus allgemeinem Wissen und **nicht an einer Quelle geprüft**. Eine Karte mit echten Höhendaten ist nicht eingebaut. Dafür bräuchte `tools/daten-holen.py` einen Zuschnitt eines Höhenmodells (zum Beispiel Copernicus DEM, Lizenz vorab lesen) für eine Beispielregion.

**Nachtrag 12.5 (Satellitendaten):** Neuer Reiter „5. Gemessen (Satelliten)“ mit **echten Messdaten**: globaler Meeresspiegel seit 1880 (Gezeitenpegel und Satelliten, CSIRO, bis 2013) und Satellitenaltimetrie ab 1993 (NOAA, bis 2023). Quelle: EPA mit CSIRO und NOAA, aufbereitet von `datasets/sea-level-rise` (Open Data Commons Public Domain Dedication and License 1.0). Datei `daten/meeresspiegel.json` (Zoll in Millimeter umgerechnet), erzeugt mit `python3 tools/daten-holen.py meeresspiegel`. Kontrolle im Test: Satelliten 1993 bis 2023 etwa 3,1 mm pro Jahr, Pegel 1900 bis 1990 etwa 1,5 mm pro Jahr. **Nicht verwendet, weil in dieser Umgebung nicht erreichbar:** NASA Sea Level Change, Copernicus Marine und weitere Satellitenreihen (neuere Jahre, Höhenmodelle für Karten). Die Lizenzbedingungen von CSIRO und NOAA selbst habe ich nicht gelesen, nur die des Datensatz-Aufbereiters.

### 12.6 Meeresspiegel auf der Karte (Weltkarte und Ausschnitte, 17.11.2026)

`labor/meeresspiegel-karte/`: Weltkarte (Satellitenbild oder gezeichnet) und acht Ausschnitte (Nordsee, Bangladesch, Nildelta, Mekong, Südflorida, Venedig und Po, Jangtse, Mississippi). Regler 0 bis 10 m, Ort antippen zeigt, ab welchem Anstieg er überflutet wird, Land unter dem heutigen Meeresspiegel ist violett.

**Technik:** `tools/hoehe-holen.py` berechnet aus dem Höhenmodell (Terrarium-Kacheln, Mapzen/Tilezen auf Amazon Open Data, enthält unter anderem SRTM) und der Natural-Earth-Küstenlinie für jeden Punkt die **Überflutungshöhe** (nur Land, das über niedrigeres Land mit dem offenen Meer verbunden ist). Ergebnis: `daten/hoehe/*.png` (rund 3,3 MB) und `index.json`. Die Seite wendet nur noch einen Schwellenwert an. Benötigte Hosts: `elevation-tiles-prod.s3.amazonaws.com`, `raw.githubusercontent.com`. Benötigt `numpy`, `scipy`, `pillow`. Satellitenbild: NASA „Blue Marble“ 2048 Pixel (Reto Stöckli, NASA Earth Observatory) über Wikimedia Commons, `daten/hoehe/blue-marble-2048.jpg`.

**Grenzen (stehen auch auf der Seite):**
- Die senkrechte Genauigkeit des Höhenmodells liegt bei mehreren Metern. Radarmodelle messen Baumkronen und Dächer mit, dadurch wird die Überflutung in tropischen Deltas **unterschätzt** (bekanntes Problem, aus allgemeinem Wissen, nicht geprüft). Beispiel Bangladesch: Bei 3 m zeigt die Karte nur schmale Küstensäume, das Ergebnis ist mit einer zweiten Quelle zu prüfen. In offenem Gelände wie der Nordsee wirkt es plausibel: Weite Teile der Niederlande liegen auf oder unter dem Meeresspiegel und sind ohne Deiche sofort überflutet.
- Deiche, Pumpen, Dünen, Gezeiten, Sturmfluten und Landabsenkung sind nicht erfasst.
- Weltkarte: eine Gitterzelle ist etwa 11 km breit, überflutete Punkte sind dort vergrößert gezeichnet.
- Die Lizenzbedingungen der Höhenkacheln (Quellenangaben der einzelnen Datensätze) und der NASA-Bilder habe ich nicht an der Quelle gelesen. Vor einer öffentlichen Verwendung lesen.

**Nachtrag 12.6 (zweites Höhenmodell, mehr Ausschnitte, 17.11.2026):** Zu jedem Ausschnitt gibt es jetzt auch eine Berechnung mit **Copernicus DEM GLO-30** (30 m, Median je Gitterzelle, Auswahl „Höhenmodell“ auf der Seite). Neue Ausschnitte: Hamburg und Elbmündung, Deutsche Ostseeküste, Bangkok, Jakarta, New York und New Jersey, Lagos. Insgesamt Weltkarte plus 14 Ausschnitte (rund 6,4 MB). Das Copernicus-Modell ist wie SRTM ein Oberflächenmodell (Baumkronen und Dächer), aber genauer. Benötigter Host zusätzlich: `copernicus-dem-30m.s3.amazonaws.com` (öffentlich, kein Konto nötig).

Überflutete Landfläche bei 3 m Anstieg in km², gemessen mit dem Skript (Terrarium gegen Copernicus). Beide Modelle liegen an manchen Orten weit auseinander, das ist ein Prüfanlass:

| Ausschnitt | Terrarium | Copernicus |
|---|---|---|
| Nordsee | 31.387 | 28.833 |
| Hamburg | 2.530 | 2.251 |
| Ostsee | 2.222 | 1.745 |
| **Bangladesch** | 3.544 | **20.155** |
| Nildelta | 10.521 | 11.334 |
| Mekong | 31.854 | 30.514 |
| **Bangkok** | 1.422 | **4.169** |
| Jakarta | 1.499 | 1.341 |
| **Südflorida** | 1.190 | **9.904** |
| New York | 588 | 696 |
| Mississippi | 13.433 | 18.552 |
| Venedig | 6.999 | 6.081 |
| **Jangtse** | 3.253 | **13.116** |
| Lagos | 149 | 508 |

Wo die Modelle abweichen (Bangladesch, Florida, Bangkok, Jangtse), ist das Terrarium-Modell vermutlich zu hoch (Bäume, Dächer), das Copernicus-Modell wirkt plausibler. **Auch Copernicus zeigt Baumkronen und Dächer**, kann also in dicht bewachsenen Deltas weiter unterschätzen. Beides ist aus allgemeinem Wissen abgeleitet, nicht an einer Quelle geprüft. Ein Modell, das Vegetation und Gebäude herausrechnet (zum Beispiel FABDEM) oder Küstenhöhen mit Korrektur (zum Beispiel CoastalDEM), habe ich nicht eingebaut (Zugang und Lizenz nicht geprüft).

**Nachtrag 12.6 (Städte und 13 weitere Ausschnitte, 17.11.2026):**
- **Städte:** Auf jeder Karte (Schalter „Städte zeigen“) sind Städte als Punkte eingetragen, rot bei Betroffenheit. Unter der Karte steht, wie viele Städte betroffen sind und wie viele Einwohner (Näherung), dazu eine Tabelle der größten betroffenen Städte mit „überflutet ab x m“. Quelle: Natural Earth `ne_10m_populated_places` (gemeinfrei), Einwohnerzahl ist der größte Schätzwert für Stadt und Umland (Stand der Datei), erzeugt mit `python3 tools/hoehe-holen.py staedte` nach `daten/hoehe/staedte.json` (632 Städte: alle ab 100.000 Einwohnern in den Ausschnitten, weltweit ab 1 Million). Weltkarte: nur Städte ab 2 Millionen. Eine Stadt gilt als betroffen, wenn ihr Mittelpunktpunkt im überfluteten Gebiet liegt. Das ist grob: Die ganze Stadt wird mitgezählt, auf der Weltkarte (Gitterzelle etwa 11 km) ist die Bewertung nur eine Größenordnung. Beispiel Nordsee bei 2 m ohne Deiche: Amsterdam, Rotterdam, Den Haag, Groningen und Bremerhaven im Wasser.
- **Neue Ausschnitte (13):** London, Kopenhagen, Houston und Galveston, Rio de Janeiro, Buenos Aires, Mumbai, Indus-Delta und Karatschi, Manila, Tokio, Osaka, Dubai, Singapur und **Malediven** (bewusst als Beispiel für ein **ungeeignetes** Höhenmodell: Atolle sind 1 bis 2 m hoch, Bäume und Gebäude erscheinen als Höhe). Insgesamt Weltkarte und 27 Ausschnitte, rund 7,2 MB.
- **Hinweis je Ausschnitt:** Unter der Karte steht, welche Schutzbauten fehlen (Deiche, Sperrwerke, Pumpen) und wo das Höhenmodell vermutlich zu hoch liegt oder Landabsenkung nicht erfasst ist (Bangkok, Jakarta). Diese Hinweise habe ich aus allgemeinem Wissen formuliert und nicht an Quellen geprüft.

**Nachtrag 12.6 (Menschen und 9 weitere Ausschnitte, 17.11.2026):**
- **Betroffene Menschen:** Neben den Städten zeigt die Karte jetzt je Ausschnitt, wie viele Menschen im überfluteten Gebiet leben. Grundlage ist das Bevölkerungsraster von **WorldPop** (2020, 1 km, an Länder angepasst, Lizenz laut Anbieter CC BY 4.0, **Lizenz und Zitierweise auf worldpop.org prüfen**). `python3 tools/hoehe-holen.py menschen` verteilt die Einwohner jeder 1-km-Zelle gleichmäßig auf deren Landpunkte und legt je Ausschnitt und Höhenmodell eine Summe je Überflutungshöhe in `daten/hoehe/index.json` ab. Benötigter Host: `data.worldpop.org` (in der Umgebung freigegeben). Näherung: Die Menschen einer Zelle liegen nicht gleichmäßig, Schutzbauten sind nicht erfasst.
- **Neue Ausschnitte (9):** Wattenmeer und Ostfriesland, Perlflussdelta mit Hongkong und Guangzhou, Tianjin, Seoul, Chennai, Norfolk, Charleston, San Francisco, Lissabon. Insgesamt Weltkarte und 36 Ausschnitte, rund 9 MB.
- **Beispielwerte (Höhenmodell Copernicus, bei 3 m, ohne Schutzbauten, WorldPop 2020):** Bangladesch etwa 14,8 Millionen von 228 Millionen im Ausschnitt, Mekong etwa 10,2 Millionen (Terrarium, im Modell fast gleich), Nildelta etwa 12 Millionen, Tianjin etwa 7,5 Millionen. Die Zahlen hängen stark vom Höhenmodell ab (Bangladesch bei 1 m: Terrarium etwa 0,3 Millionen, Copernicus etwa 1,3 Millionen).

**Nachtrag 12.6 (Verknüpfung, 17.11.2026):** Das Tool `labor/meeresspiegel/` hat oben einen Kasten „Auf der Karte ansehen“. Der Anstieg aus dem Küstenschnitt oder aus Reiter 2 und 5 (nach „In den Küstenschnitt übernehmen“) geht mit dem gewählten Ausschnitt als Adresse zur Karte: `labor/meeresspiegel-karte/#<ausschnitt>,<anstieg in m>[,terrarium|cop]`, zum Beispiel `#nordsee,2.5,cop`. Die Karte liest die Adresse beim Öffnen und bei Änderung und verweist zurück auf das Modell. Damit lassen sich auch Links für Aufgabenblätter und QR-Codes erzeugen (zum Beispiel mit dem Teilen-Baustein).

### 12.7 Prüfung der verwendeten Quellen an der Quelle (17.11.2026)

Am 17.11.2026 habe ich die Seiten der Anbieter gelesen (Hosts in der Umgebung freigegeben). Nur Quellen, die im Portal **wirklich verwendet** werden. Status: **geprüft** = Wortlaut an der Quelle gelesen, **teilweise** = nur ein Teil lesbar, **offen** = nicht erreichbar.

| Quelle | Wo im Portal | Ergebnis an der Quelle | Status |
|---|---|---|---|
| **SMARD** (Bundesnetzagentur) | `labor/strom/`, `daten/strom.json` | Marktdaten im Bereich „Marktdaten visualisieren“ und „Daten herunterladen“ unter **CC BY 4.0**, Namensnennung „Bundesnetzagentur \| SMARD.de“. **Großhandelspreise** werden laut SMARD wegen des Verfahrens HEDWIG rechtlich geprüft und sind **nicht verwendet**. Die Inhalte der Webseite selbst stehen unter CC BY-ND (Namensnennung, keine Bearbeitung, laut Impressum) und werden **nicht** übernommen. Die Modulnummern der Quellen habe ich gegen die Spaltenköpfe des offiziellen Downloads geprüft (Braunkohle, Steinkohle, Erdgas, Sonstige Konventionelle, Pumpspeicher, Biomasse, Wasserkraft, Sonstige Erneuerbare, Wind Offshore, Wind Onshore, Photovoltaik, Netzlast). Kernenergie liefert im Zeitraum keine Daten | geprüft |
| **PhET „Natürliche Selektion“** | `labor/phet-selektion/` (nur Link) | Version 1.5.17, Build 29.10.2026. Dateikopf: „licensed under Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)“, „Attribution is required near point of use“, „COMMERCIAL USE REQUIRES A COMMERCIAL LICENSE AGREEMENT FROM THE UNIVERSITY OF COLORADO BOULDER“. Nur die **historische Sammlung** (vor dem 29.03.2026) stand unter CC BY 4.0. **Die Nacht-2-Aussage war richtig.** Folge: nur verlinken, nicht kopieren, nicht einbetten. Die deutsche Fassung der Simulation nutzt die Begriffe Kaninchen, Pelz, Ohren, Zähne, Umweltfaktoren (Futter Knappheit, Hartes Futter, Wölfe), Mutation hinzufügen | geprüft |
| **USGS Erdbeben** | `labor/erdbeben/`, `daten/erdbeben.json` | „USGS-authored or produced data and information are considered to be in the U.S. Public Domain“. Gewünscht: Credit „U.S. Geological Survey Department of the Interior/USGS“. Der Feed `4.5_month` wurde abgerufen (683 echte Erdbeben der letzten 30 Tage), **die simulierten Beispieldaten sind ersetzt** | geprüft |
| **WorldPop** | `daten/hoehe/index.json`, Karte | Laut `worldpop.org/faq`: **CC BY 4.0**, frei nutzbar „as long as clear attribution of the source is provided“, Quellenangabe: www.worldpop.org. Datei `*_ppp_2020_1km_Aggregated_UNadj.tif` je Land vorhanden | geprüft |
| **Natural Earth** | Küsten, Länder, Städte | „All versions of Natural Earth raster + vector map data … are in the public domain.“ Keine Genehmigung nötig, Nennung erwünscht. Namen stammen aus Wikidata (CC0) | geprüft |
| **NASA „Blue Marble“** (über Wikimedia Commons) | Satellitenbild der Weltkarte | Commons: NASA Goddard Space Flight Center, Bild von Reto Stöckli, Verbesserungen von Robert Simmon, Quelle visibleearth.nasa.gov. NASA-Richtlinien: Inhalte „generally are not subject to copyright in the United States“, Nutzung für Bildung und Webseiten erlaubt, ohne Hinweis auf Billigung. Die Commons-Lizenzzeile selbst nennt nur die NASA-Katalogisierung, keine ausdrückliche Lizenz | geprüft (Wortlaut), Rest siehe Hinweis |
| **Copernicus DEM GLO-30** | `daten/hoehe/*-cop.png` | AWS-Registry: **Digital Surface Model** („including buildings, infrastructure and vegetation“), „GLO-30 Public … limited worldwide coverage … a small subset of tiles covering specific countries are not yet released“, „available on a free basis for the general public under the terms and conditions of the Licence“. Hinweis für die Zitierung: „accessed on DATE from https://registry.opendata.aws/copernicus-dem“. **Die Copernicus-Lizenzseite (spacedata.copernicus.eu) war nicht erreichbar**, der übliche Namensnennungstext ist aus dem Gedächtnis ergänzt | teilweise |
| **Terrarium-Kacheln** (Mapzen/Tilezen) | `daten/hoehe/*.png`, Weltkarte | Lizenzverweis der Registry führt zur Attribution-Liste des Anbieters (ETOPO1 NOAA, GMTED2010 und SRTM „courtesy of the U.S. Geological Survey“, EU-DEM „produced using Copernicus data and information funded by the European Union“ und weitere je Land). Die Liste steht jetzt auf der Karte | geprüft (Liste), die einzelnen Quellenlizenzen habe ich nicht gelesen |
| **Meeresspiegel (EPA, CSIRO, NOAA)** | `daten/meeresspiegel.json`, Tool | Aufbereiter `datasets/sea-level-rise`: Public Domain Dedication (ODC-PDDL) gelesen. Die EPA-Seiten für Nutzungsbedingungen waren nicht auffindbar, CSIRO und NOAA nicht freigegeben | offen |

**Nicht verwendet und daher weiter ungeprüft:** Open-Meteo, DWD, Energy-Charts, Weltbank, UNHCR, Our World in Data, RKI-Impfquoten, GBIF, iNaturalist, PEGELONLINE, UBA Luftdaten (siehe Abschnitte 10 und 11).

**Folgen:** Das Portal enthält keine Daten, deren Lizenz Veröffentlichung im öffentlichen Repository ausschließt. Zu klären bleiben der Namensnennungstext von Copernicus (Lizenzseite) und die Bedingungen von EPA, CSIRO und NOAA für die Meeresspiegelreihe.

### 12.8 Strommix (SMARD, 17.11.2026)

`labor/strom/`: Stundenwerte der **letzten 14 Tage** (13 volle Tage) der realisierten Stromerzeugung in Deutschland nach elf Quellen plus Netzlast, gestapelte Fläche mit Zeigefunktion, Tagesauswahl, „Tag mit höchstem und niedrigstem Anteil Erneuerbarer“, Tagesvergleich. Daten: `python3 tools/daten-holen.py strom` holt sie über den offiziellen Download von SMARD (CC BY 4.0) nach `daten/strom.json`. Hinweise auf der Seite: Erzeugung und Verbrauch sind nicht gleich (Import, Export), kleine Anlagen sind teilweise geschätzt, Pumpspeicher zeigt nur die Erzeugung. Beispiel aus dem Test: 09.11.2026 nur 23 Prozent Erneuerbare, 15.11.2026 71 Prozent. Neu abrufen bei jedem Einsatz (Daten ändern sich täglich), zum Beispiel über die Aktion „Daten aktualisieren“.

### 12.9 PhET „Natürliche Selektion“ (17.11.2026)

`labor/phet-selektion/`: Linkkarte (Beschreibung und Simulation bei PhET, Deutsch) mit der geprüften Lizenzzeile und einem Ablauf mit Operatoren (vorhersagen, untersuchen, vergleichen, erklären, beurteilen) und Hilfen auf Abruf. Fehlvorstellungen sind genannt. Der Ablauf ist ein Entwurf und gegenzulesen.

### 12.10 Aktion „Daten aktualisieren“ (17.11.2026)

`.github/workflows/daten.yml` holt jetzt **Erdbeben** (USGS) und **Strommix** (SMARD) und legt das Ergebnis als **Pull Request** ab, nie direkt auf `main`. Beim Start von Hand lässt sich jede der beiden Quellen an- und abwählen (GitHub: Actions, „Daten aktualisieren“, Run workflow). Jeden Montag automatisch: im Workflow die beiden Zeilen unter `schedule` einkommentieren. Der Strommix zeigt immer die letzten 14 Tage, nach einer Woche ohne Aktualisierung ist er also bis zu sieben Tage alt (steht in der Datei unter „abruf“). **Nicht in GitHub Actions getestet**, nur die Befehle lokal.

### 12.11 Klimaszenarien nach der Struktur von En-ROADS (18.11.2026)

Anlass: Hinweis der Lehrkraft auf den Simulator En-ROADS (Climate Interactive, MIT Sloan). **An der Quelle gelesen (18.11.2026):** Der **En-ROADS User Guide** (docs.climateinteractive.org) steht laut Seitenfuß unter **CC BY 4.0** („remix, adapt, and build upon … even commercially, as long as you give Climate Interactive credit“). Er beschreibt Struktur (Energie-CO₂ etwa 67 %, Landnutzung etwa 7 %, andere Gase etwa 26 % der Treibhausgase), die Kaya-Gleichung und nennt die UN-Projektion von 10,2 Milliarden Menschen am Ende des Jahrhunderts. **Nicht gefunden:** Nutzungsbedingungen des Simulators selbst (die Seite `climateinteractive.org/about/terms-of-use/` gab 404, `support.climateinteractive.org` war nicht freigegeben). Deshalb wird der Simulator nur **verlinkt**, weder kopiert noch eingebettet, und sein Modell wird nicht nachgebaut.

`labor/klimaszenarien/`: **eigenes Lehrmodell**. Kaya-Gleichung für Energie-CO₂ (Bevölkerung, Wohlstand je Kopf, Energieintensität, emissionsfreier Anteil), Kohleausstieg, Landnutzung, andere Gase, CO₂-Entnahme, Erwärmung aus den gesamten Emissionen (0,45 Grad je 1000 Milliarden Tonnen, Start 1,3 Grad). Startwerte (Näherungen, **nicht geprüft**): Primärenergie 640 EJ, emissionsfreier Anteil 23 %, fossile Mischung Kohle 32 %, Öl 38 %, Gas 30 %, Emissionsfaktoren 94,6, 73,3 und 56,1 kg CO₂ je Gigajoule (IPCC-Standardwerte, aus dem Gedächtnis), Basislinie so gewählt, dass die Emissionen bis 2100 auf etwa 70 Milliarden Tonnen steigen. Ergebnis im Test: Basislinie +3,4 Grad, „alles zusammen“ +1,8 Grad. Szenarien: Basislinie, Kohleausstieg 2040, nur Effizienz, schneller Umbau, alles zusammen, „als Vergleich merken“. Die Wirkung der Regler ist **angenommen** (keine Kosten, keine Trägheit, keine Rückkopplungen). Namensnennung: Climate Interactive, En-ROADS User Guide, CC BY 4.0, Bearbeitung durch dieses Portal.

**Nachtrag 12.11 (Startwerte an Quellen geprüft, 18.11.2026):** Nach der Prüfung gelten für `labor/klimaszenarien/`:

| Wert | Befund an der Quelle |
|---|---|
| Energie-CO₂ 2024 | OWID-CO₂-Datensatz (aus Global Carbon Project und Energy Institute): Kohle 15,7, Öl 12,6, Gas 8,0, Abfackeln 0,45 Mrd. t, zusammen etwa 36,8. Modell 2025: 36,8 |
| Landnutzung | OWID 2024: 4,28 Mrd. t. Global Carbon Budget 2025: 4,1 für 2025 (Seite von globalcarbonbudget.org). Modell: 4,3 |
| Andere Gase und Zement | OWID 2024: Methan 9,5, Lachgas 2,9, Zement 1,5, zusammen 13,9. **Fluorierte Gase fehlen** (nicht im Datensatz). Modell: 13,9, Gesamt 55,0 Mrd. t CO₂-Äquivalent |
| Primärenergie | OWID 2024: 176.737 TWh gleich 636 EJ. Modell: 636 |
| Emissionsfaktoren | IPCC-Leitlinien 2006, Band 2, Tabelle 2.2: Rohöl 73.300, Erdgas 56.100, andere bituminöse Kohle 94.600 kg je TJ (andere Kohlearten bis 101.000). Modell: 94,6, 73,3, 56,1 kg je GJ |
| Fossile Mischung und emissionsfreier Anteil | **Abgeleitet** aus Emissionen geteilt durch Faktoren (Kohle 166, Öl 172, Gas 150 EJ, zusammen 488 EJ, 76,8 Prozent der Primärenergie), also nicht direkt gemessen. Modell: Kohle 34,0, Öl 35,3, Gas 30,7 Prozent, emissionsfrei 23,2 Prozent |
| Bevölkerung | OWID 2025: 8,23 Mrd. Guide von En-ROADS: 10,2 Mrd. für 2100 |
| Erwärmung je CO₂ | Forster et al. 2025 (ESSD 17, 2641, CC BY 4.0): „median TCRE estimate of 0.45 °C per 1000 Gt CO₂“ |
| Erwärmung heute | Forster et al. 2025: menschengemacht 2024 beste Schätzung **1,36 °C**, beobachtet 2024 1,52 °C, Dekade 2015 bis 2024 beobachtet 1,24 °C, Rate 0,27 °C je Jahrzehnt. Modell-Start 2025: 1,4 (Fortschreibung angenommen) |
| Restbudget 1,5 °C | Forster et al. 2025: 130 Mrd. t CO₂ (50 Prozent) ab Anfang 2025, bei 42 Mrd. t je Jahr in gut drei Jahren aufgebraucht. Global Carbon Budget 2025: 170 Mrd. t CO₂ (1,7 Grad: 525, 2 Grad: 1.055). Das Lehrmodell ergibt etwa 220 (alle Gase wie CO₂, ohne Nachwirkung früherer Emissionen), die Seite nennt den Unterschied |

**Nicht geprüft:** die Basislinie des Lehrmodells (Wachstum 2,2 Prozent, Effizienz 1,6 Prozent, Umbau 0,3 Prozentpunkte, an die Grafik von En-ROADS angelehnt) und die Wirkung der Regler (Annahmen). Der IPCC-AR6-Bericht selbst war nicht abrufbar (403), der Wert 0,45 stammt aus Forster et al. 2025, der den AR6 fortschreibt. Neu freigegebene Hosts: ipcc.ch, report.ipcc.ch, ipcc-nggip.iges.or.jp, globalcarbonbudget.org, globalcarbonproject.org, essd.copernicus.org, climate.copernicus.eu, ourworldindata.org, berkeleyearth.org (mehrere davon nicht gebraucht).

