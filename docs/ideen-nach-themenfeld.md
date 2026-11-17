# Ideen und Recherche, geordnet nach Fach und Themenfeld

Stand: 17.11.2026. Dies ist die Sortierung des Ideenkatalogs ([ideen-native-nutzung.md](ideen-native-nutzung.md)) nach den Themenfeldern aus `themenfelder.json`. Dort stehen die Einzelheiten (Lizenzen, Links, Ablauf). Hier steht nur: **Was passt wohin, was gibt es schon, was fehlt.**

**Wichtig vorab**
- Die Zuordnung zu Themenfeldern ist ein **Vorschlag** der Planung, kein Teil des Rahmenlehrplans. Die Fachteile des RLP werden laut Recherche neu entwickelt (Abschnitt 11.2 des Katalogs): Nummern und Zuschnitte können sich ändern.
- **Lizenz-Ampel:** 🟢 gemeinfrei oder Namensnennung genügt (CC0, CC BY, DL-DE-BY, Natural Earth, USGS) · 🟡 Grauzone, getrennte Regelung oder Lizenz unklar, vor Einsatz Lizenzseite lesen · 🔴 nur verlinken, nicht ablegen. **Alle Ampelfarben beruhen auf Suchtreffern und sind nicht an der Quelle geprüft.**
- Status: ✅ Prototyp läuft (`labor/`) · 🧪 Prototyp, Sensor oder Daten nur simuliert getestet · 💡 Idee · 🔗 nur Link, kein Einbau
- Aufwand: S Stunden, M Tage, L Wochen.
- „Im Portal“ nennt nur, was als Ordner unter `biologie/` und `geografie/` liegt. Umfang und Qualität der dortigen Stunden habe ich nicht geprüft.

## Überblick

| Themenfeld | Im Portal | Prototypen und Bausteine | Daten und Quellen (Ampel) | Lücke |
|---|---|---|---|---|
| **Bio 3.1** Zelle | ja (Klasse 7 und 8) | Do Now ✅, Vorlesen ✅, Farbmesser 🧪 | – | Mikroskop vermessen 💡 |
| **Bio 3.2** Lebensräume | ja (Klasse 8) | Räuber-Beute ✅ | GBIF 🟡, iNaturalist 🔴, Citizen Science | Schulhof-Zählung 💡 |
| **Bio 3.3** Stoffwechsel | nein | Farbmesser 🧪 | – | **größte Lücke** |
| **Bio 3.4** Sexualität | nein | – | – | bewusst wenig Technik |
| **Bio 3.5** Gesundheit | ja (Klasse 9) | Ergebnis-QR ✅ | RKI 🟡, UBA 🟢 | Modell gegen Daten 💡 |
| **Bio 3.6** Nervensystem | ja (Klasse 9) | – | – | Reaktionstest, Hörbereich 💡 |
| **Bio 3.7** Genetik | ja (Klasse 10) | – | – | Kreuzungsquadrat 💡 |
| **Bio 3.8** Evolution | nein | – | PhET 🟡 🔗 | Modell-Aufgabe 💡 |
| **Geo 3.1** Risikoräume | ja (Klasse 7) | Karte ohne Karte ✅, Seismograf 🧪 | USGS 🟢, Natural Earth 🟢, Plattengrenzen 🟢, EONET 🟡 | echte Erdbebendaten holen |
| **Geo 3.2** Migration | nein | Länder-Quiz ✅ | UNHCR 🟡, Weltbank 🟡, OWID 🟡 | sensibles Thema, Daten fehlen |
| **Geo 3.3** Vielfalt der Erde | nein | Länder-Quiz ✅ | DWD 🟢, Natural Earth 🟢 | **starke Passung, nichts da** |
| **Geo 3.4** Armut und Reichtum | nein | – | Weltbank 🟡, OWID 🟡 | Streuplot-Baustein 💡 |
| **Geo 3.5** Ressourcen | ja (Klasse 9) | – | SMARD 🟢, PEGELONLINE 🟡, Energy-Charts 🟡 | Strommix-Impuls 💡 |
| **Geo 3.6** Klimawandel | ja (Klasse 9) | – | DWD 🟢, Open-Meteo 🟡, Copernicus 🟢 | Klimadiagramm Berlin 💡 |
| **Geo 3.7** Globalisierung | ja (Klasse 10) | – | Weltbank 🟡, OWID 🟡 | Wirkungsgefüge-Editor 💡 |
| **Geo 3.8** Europa | nein | Länder-Quiz ✅ (Europa) | Natural Earth 🟢 | Eurostat nicht recherchiert |

## Biologie

### Bio 3.1 Die Zelle (7/8)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Do Now aus der Vorstunde** | Aus den geprüften Begriffen der Zelle-Stunden drei Wiederholungsaufgaben | ✅ | – |
| **Vorlesen mit Mitlesen** | Materialtexte der Zelle-Reihe, LRS | ✅ | S zum Einbinden |
| **Kamera-Farbmesser** | Blattfarbe, Iod-Stärke-Nachweis an Zellmaterial (Überschneidung mit Bio 3.3) | 🧪 | – |
| **Mikroskop-Foto vermessen** | Zwei Punkte klicken, Referenzlänge angeben, Zellgröße berechnen | 💡 | M |
| **Mehrsprachige Begriffe** | Vorschlag 1 (Katalog 11.3): Start mit diesem Themenfeld | 💡 | M |
| **Quellenblatt** | Bilder mit Lizenz sauber nennen | 💡 | S |

Bezug im `themenfelder.json`: Geo 3.6 (Fotosynthese, Kohlenstoffkreislauf), Geo 3.5 (Papier aus Zellwänden).

### Bio 3.2 Lebensräume und ihre Bewohner (7/8)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Räuber und Beute** | Vermuten, simulieren, Modell beurteilen | ✅ | – |
| **Schulhof-Zählung mit Klassendatensatz** | Vorschlag 2 (Katalog 11.3): Zählen, Ergebnis-QR, Diagramm der Klasse | 💡 | M |
| **Schulhof-Biotop kartieren** | Messpunkte, Export als Tabelle | 💡 | L |
| **Citizen Science** | Humboldt Explorers (HU Berlin), City Nature Challenge Berlin, Mückenatlas, Schulstunde der Gartenvögel: nur als Anregung und Link, Lizenz der Materialien unklar | 🔗 🟡 | – |
| **Datenkritik an Bürgerdaten** | Warum werden Vögel eher bestätigt als Insekten? Wer meldet ungewöhnliche Tiere? | 💡 | S |
| **GBIF-Funde im Bezirk** | Nur Datensätze mit CC0 oder CC BY ablegen | 💡 🟡 | M |
| **iNaturalist** | Als Exkursionswerkzeug verlinken, **nicht** als Datenquelle im öffentlichen Repository (Standard der Nutzer ist CC BY-NC) | 🔗 🔴 | – |
| **Exkursion Tempelhofer Feld** | Pflanzenjagd als Stationenlauf mit QR, Karte lokal | 💡 | M |

Bezug: Geo 3.3 (Klima- und Vegetationszonen), Geo 3.6 (Klimawandel verändert Lebensräume).

### Bio 3.3 Stoffwechsel des Menschen (7/8)

Im Portal und in der Recherche **kaum etwas**. Das ist die größte Lücke. Brauchbare Anknüpfungen:

| Baustein | Was | Status |
|---|---|---|
| **Kamera-Farbmesser** | Stärke-Nachweis mit Iod in Lebensmitteln, Messtabelle der Klasse | 🧪 |
| **Puls per Kamera** | Näherungsmessung, Genauigkeit als Lernanlass (Zuordnung Kreislauf zu klären) | 💡 M |
| **Ergebnis-QR** | Klassendaten zum Frühstück oder Trinkverhalten sammeln, anonym | ✅ Prototyp, Einsatz 💡 |
| **Bio-Höfe und Schulexkursionen** (Charlottenburg-Wilmersdorf, Pilot 2021) | Ob das Angebot noch besteht, ist offen | 🔗 offen |

Bezug: Geo 3.4 (Ernährung und Hunger hängen mit Armut und Reichtum zusammen).
**Zu klären:** Welche Inhalte das Themenfeld genau umfasst (Ernährung, Verdauung, Atmung, Kreislauf), damit die Passung belegt ist. Das steht nicht in `themenfelder.json`.

### Bio 3.4 Sexualität, Fortpflanzung und Entwicklung (7/8)

Hier bewusst **wenig Technik**. Mögliche, behutsame Bausteine:

| Baustein | Was | Status |
|---|---|---|
| **Hilfen auf Abruf** | Tipps in drei Stufen, die SuS selbst aufdecken | 💡 S |
| **Vorlesen** | Alle Materialtexte, auch für Wiederholung zu Hause | ✅ |
| **Anonyme Fragen sammeln** | Gruppen schreiben Fragen, Ergebnis-QR statt Namen, Lehrkraft beantwortet im Plenum. Nur wenn die Lehrkraft das für die Gruppe passend hält | 💡 (Eigenidee) |

Keine Sensoren, keine Datenabfragen, keine Fremdinhalte. Beutelsbacher Konsens beachten.

### Bio 3.5 Gesundheit – Krankheit (9/10)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Impf-Stunden** | Ausbruch-Simulation (impfen-usa), Doppelstunde: im Portal | vorhanden | – |
| **Modell gegen Daten** | Impfquoten (RKI) neben die Simulation legen. Lizenz der Impfquoten **nicht gefunden**, die Lizenz für COVID-Impfungen ist CC BY 4.0 (Suchbeleg) | 💡 🟡 | M |
| **Quellencheck als Übung** | Echte Meldungen aus `nachrichten.json`: Wer sagt das? Woher stammt die Zahl? | 💡 | S |
| **Luftdaten Berlin (UBA)** | Feinstaub und Stickstoffdioxid, Werktag gegen Wochenende (Umwelt und Gesundheit). Tageswerte sind **vorläufig** | 💡 🟢 | M |
| **Vorläufig oder geprüft** | Kennzeichen an Werten, die die Quelle selbst vorläufig nennt | 💡 | S |
| **Puls per Kamera** | Kreislauf, Messgenauigkeit begrenzt | 💡 | M |

Bezug: Geo 3.4, Geo 3.7.

### Bio 3.6 Bau und Funktion des Nervensystems (9/10)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Reaktionstest** | Reaktionszeit messen, Klassendaten per Ergebnis-QR zusammenführen | 💡 | S |
| **Hörbereich** | Tongenerator, Hörschwelle. Lautstärke vorher einstellen | 💡 | S |
| **Auge** | Stunden zu Bau des Auges und Kurzsichtigkeit liegen im Portal | vorhanden | – |
| **Klassenmessung als Datensatz** | Mittelwerte, Streuung, Ausreißer | 💡 | M |

### Bio 3.7 Genetik (9/10)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Kreuzungsquadrat-Simulator** | Genotypen wählen, Verhältnisse ablesen, Zufallsstichprobe gegen Erwartung | 💡 | S |
| **Mehrsprachige Begriffe** | Fachwortschatz, Wikidata als CC0-Rohquelle, Gegenlesen nötig | 💡 | M |
| **Modell beurteilen** | Wie bei Räuber und Beute: Wo vereinfacht das Modell? | 💡 | S |

Im Portal liegt `biologie/klasse-10/genetik/`. Umfang nicht geprüft.

### Bio 3.8 Evolution (9/10)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **PhET „Natural Selection“** | Vorhersagen, simulieren, Modell beurteilen. Lizenz laut Suchtreffern CC BY 4.0, Sonderregel „historische Sammlung“ offen. **Verlinken, nicht kopieren** | 🔗 🟡 | S |
| **Räuber und Beute** | Vorübung zum Modelldenken (Wechselwirkung, Verzögerung) | ✅ | – |
| **Kreuzungsquadrat** | Brücke zur Genetik | 💡 | S |

Im Portal liegt noch nichts. Hier könnte man schnell etwas bauen, weil PhET als Link reicht.

## Geografie

### Geo 3.1 Leben in Risikoräumen (7/8)

Das am besten ausgestattete Themenfeld. Im Portal: Vulkanausbruch, Ätna (Landwirtschaft, Tourismus), Erdbeben Tokio.

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Karte ohne Karte** | Erdbebenpunkte als Impuls, dann Küsten, dann Plattengrenzen | ✅ (Daten **simuliert**) | – |
| **Echte Erdbebendaten** | `python3 tools/daten-holen.py erdbeben` (USGS, gemeinfrei) im Netz mit Freigabe laufen lassen | 💡 🟢 | S |
| **Handy-Seismograf** | Messen, Abstand und Stärke vergleichen. Auf echten Handys prüfen | 🧪 | – |
| **Plattengrenzen** | Bird 2003, Open Data Commons Attribution, Namensnennung steht auf der Seite | ✅ 🟢 | – |
| **NASA EONET** | „Was passiert gerade auf der Erde?“, Schlüsselpflicht widersprüchlich belegt | 💡 🟡 | M |
| **Vorher/Nachher mit Sentinel-Bildern** | Brandnarben, Asche, mit Vermerk „Contains modified Copernicus Sentinel data“ | 💡 🟢 | M |
| **Mystery** | Methode nach David Leat. Verlagsmaterial **nicht** übernehmen, Karten selbst schreiben | 💡 | M |
| **Webcams und Live-Karten** | Nur als Linkkarte, kein Einbetten | 🔗 | – |

### Geo 3.2 Migration und Bevölkerung (7/8)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Länder-Quiz** | Länder finden, Namen in Familiensprachen | ✅ | – |
| **UNHCR** | Herkunfts- und Aufnahmeländer, CC BY 4.0 laut Suchtreffern, API-Lizenz getrennt prüfen | 💡 🟡 | M |
| **Weltbank, Our World in Data** | Bevölkerungsdaten, Geburtenrate. OWID: Daten Dritter nach deren Bedingungen | 💡 🟡 | M |
| **Planspiel, Mystery** | Perspektiven, Beutelsbacher Konsens | 💡 | M |

**Sensibel:** Zahlen mit Menschen verbinden, nicht nur Karten. Nicht alle Namen in Familiensprachen ungeprüft verwenden, nie SuS nach der Herkunft fragen oder zeigen. Im Portal noch nichts.

### Geo 3.3 Vielfalt der Erde (7/8)

Starke Passung, bisher nichts im Portal.

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Länder-Quiz** | Orientieren, Welt und Kontinente | ✅ | – |
| **Weltzeit-Uhr** | Gradnetz und Zeitzonen, `Intl`, offline | 💡 | S |
| **Klimadiagramm aus Pipeline-Daten** | DWD-Station und Open-Meteo, mit Sprachgerüst („Die Temperatur steigt von … bis …“) | 💡 🟢 / 🟡 | M |
| **Natural Earth ergänzen** | Flüsse, Seen, Städte, Klimazonen | 💡 🟢 | S |
| **Projektionen vergleichen** | d3-geo (ISC), gleiche Daten in drei Projektionen. Nicht gemessen, Version prüfen | 💡 🟡 | M |
| **Kompass, Schulhof-Maßstab, Schatten und Sonnenstand** | Geräte und Rechner für Orientieren und Methoden | 💡 | S bis M |

### Geo 3.4 Armut und Reichtum (7/8)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Streuplot zum Selberdeuten** | Gapminder-Prinzip: Indikator wählen, Land anklicken, Jahr verschieben | 💡 | M |
| **Weltbank** | Lizenz CC BY 4.0 „mit zusätzlichen Bedingungen“ (Suchbeleg) | 💡 🟡 | M |
| **Our World in Data** | Eigene Inhalte CC BY, Daten Dritter anders | 💡 🟡 | M |
| **Tabelle zu jedem Diagramm** | Barrierefreiheit und Datenkompetenz | 💡 | S |

Bezug: Bio 3.3 und 3.5.

### Geo 3.5 Umgang mit Ressourcen (9/10)

Im Portal: Erneuerbare Energien (Quiz, Heizen und Verkehr), E-Fuels.

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Strommix des Vortags (SMARD)** | CC BY 4.0, Vermerk „Bundesnetzagentur, SMARD.de“. Nur Downloaddateien, Webseiten-Inhalte sind CC BY-ND | 💡 🟢 | M |
| **Energy-Charts** | Lizenztexte widersprechen sich: **vorerst SMARD** | 💡 🟡 | M |
| **PEGELONLINE** | Wasserstände Spree und Havel, Lizenzseite nicht gefunden | 💡 🟡 | S bis M |
| **Bio-Höfe, Landwirtschaft** | Angebot offen | 🔗 offen | – |
| **Quellencheck** | E-Fuels-Meldungen auf Aussagekraft prüfen | 💡 | S |

### Geo 3.6 Klimawandel und Klimaschutz (9/10)

Im Portal: Klima-Info, Quellen prüfen.

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Klimadiagramm Berlin** | DWD-Messung gegen Open-Meteo-Modell: „Welchen Daten traue ich?“ | 💡 🟢 / 🟡 | M |
| **Warming-Stripes-Generator** | Eigene Jahresreihe als Farbstreifen, Farbskala kritisch | 💡 | S |
| **Energiebilanz-Schieber** | Vereinfachtes Modell, Grenzen benennen | 💡 | M |
| **Station gegen Raster** | Was misst eine Station, was rechnet ein Modell? | 💡 | M |
| **Vorher/Nachher** | Gletscher, Aralsee, Sentinel-Bilder | 💡 🟢 | M |
| **Planspiel Klimaverhandlung** | Rollenkarten, Zeitgeber, Abstimmung per Papierkarten | 💡 | M |
| **Wirkungsgefüge-Editor, Mystery** | Systeme erschließen | 💡 | M |

Bezug: Bio 3.1, Bio 3.2.

### Geo 3.7 Wirtschaftliche Verflechtungen und Globalisierung (9/10)

Im Portal: Globalisierung als Netz (Klasse 10).

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Wirkungsgefüge-Editor** | Knoten, Pfeile mit + und −, Rückkopplung | 💡 | M |
| **Weltbank, OWID** | Handel, Wirtschaftsdaten, Streuplot | 💡 🟡 | M |
| **Planspiel, Mystery** | Perspektiven der Akteure | 💡 | M |
| **Lizenz-Sortierspiel** | Bilder und Texte für Plakate und Referate | 💡 | S |

### Geo 3.8 Europa in der Welt (9/10)

| Baustein | Was | Status | Aufwand |
|---|---|---|---|
| **Länder-Quiz Europa** | Eingebaut. Kleine Staaten fehlen im 110-m-Datensatz | ✅ | – |
| **Natural Earth, d3-geo** | Eigene Europakarten, Projektionen | 💡 🟢 | M |
| **Eurostat** | **Nicht recherchiert.** Lizenz, Format und Passung offen | – | – |

## Querschnitt: für alle Themenfelder

| Baustein | Nutzen | Status | Aufwand |
|---|---|---|---|
| **Referentenansicht (Taste R)** | Hinweise und nächste Folie für die Lehrkraft | ✅ | S zum Einbinden |
| **Vorlesen mit Mitlesen** | Wirksamste LRS-Hilfe, immer abrufbar | ✅ | S |
| **Do Now aus der Vorstunde** | Retrieval ohne Mehraufwand | ✅ | S |
| **Rückkanal per QR** | Gruppenergebnisse ohne Server, anonym | ✅ | S |
| **Einstellbare Lesedarstellung** | Vorschlag 3 (Katalog 11.3): Schriftgröße, Zeilen- und Textabstand, kein fester „LRS-Modus“. Evidenz zu Spezialschriften uneinheitlich | 💡 | S bis M |
| **Mehrsprachige Begriffe** | Vorschlag 1 (Katalog 11.3), Gegenlesen nötig | 💡 | M |
| **Quellenblatt (TULLU)** und **Daten-Alter sichtbar** | Medienbildung und Lizenzpflicht in einem | 💡 | S |
| **Tabelle zu jedem Diagramm** | Barrierefreiheit | 💡 | S |
| **Prüfliste Barrierefreiheit** | Aus WCAG 2.2 und verlinkten Checklisten, Hinweise in `tools/check.py` | 💡 | S |
| **Bildschirm wach halten** | Beamer-Rechner schläft nicht ein | ✅ (in `referent.js`) | S |

## Lücken und was ich als Nächstes tun würde

1. **Bio 3.3, 3.4, 3.8 und Geo 3.2, 3.3, 3.4, 3.8:** Im Portal liegt dort nichts. Zuerst klären, **welche dieser Themenfelder du als Nächstes brauchst**, dann dorthin bauen. Das ist vor allem deine Planung, nicht meine.
2. **Die schnellsten Gewinne ohne Lizenzfrage:** Weltzeit-Uhr (Geo 3.3), Kreuzungsquadrat (Bio 3.7), Reaktionstest und Hörbereich (Bio 3.6), PhET „Natural Selection“ als Linkkarte (Bio 3.8).
3. **Daten mit grüner Ampel zuerst:** echte Erdbebendaten (USGS) und DWD-Klima, dann SMARD-Strommix.
4. **Gelbe Quellen erst nach Lesen der Lizenzseite:** Open-Meteo, Weltbank, UNHCR, OWID, RKI-Impfquoten, GBIF, PEGELONLINE, Energy-Charts.
5. **Netz freigeben:** Die Hosts aus Katalog 11.5 müssen in der Umgebung freigegeben sein, sonst bleibt alles „ungeprüft“.

## Nicht eingeordnet

- **Rechtliches und Datenschutz** (Schulgesetz, Einwilligung bei Lernplattformen, TDDDG und Service Worker): Katalog 10.4, bisher nur Suchbelege. Mit der Datenschutzbeauftragten der Schule klären.
- **Eurostat, Berliner Fachhandreichung Biologie und Geografie, Leichte Sprache, GIBS-Nutzungsregeln:** nicht gefunden oder nicht recherchiert (Katalog 11.5).
