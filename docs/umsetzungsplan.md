# Umsetzungsplan: Was aus dem Labor wohin gehört

Stand: 18.11.2026. Grundlage: alle 37 Prototypen unter `labor/`, die Geräteprüfung vom 18.11.2026 und der Aufbau des Portals (Fachseiten, Themenfelder, Präsentationen, Materialseiten, Begriffe-Seite, Navigation in `assets/js/nav.js`).

## Leitidee

Jedes Werkzeug kommt **dorthin, wo es im Unterricht gebraucht wird**, und nur einmal:

| Ort | Wofür | Wer öffnet es |
|---|---|---|
| **Präsentation** (`praesentation.js`, gilt für alle) | Bausteine, die in jeder Stunde helfen | Lehrkraft am Board |
| **Materialseite** (`material.js`) | Hilfen beim Lesen und Arbeiten | Schülerinnen und Schüler |
| **Themenfeld** (`<fach>/klasse-N/<themenfeld>/<werkzeug>/`, Eintrag in `projects.json`) | Simulationen, Karten und Daten zu genau einem Thema | beide, über die Themenfeld-Seite |
| **Begriffe-Seite** (`begriffe.js`) | Wiederholen und Sprachen | Schülerinnen und Schüler, auch zu Hause |
| **Seite „Werkzeuge“** (neu, in der Navigation unter „Mehr“) | Werkzeuge für den Unterrichtsablauf ohne festes Thema | vor allem Lehrkraft |
| **Labor** (bleibt, unverlinkt) | Was noch an echten Geräten getestet werden muss | Lehrkraft |

## Schritt 0: Werkbank ins Portal-Design übernehmen

Die Geräteprüfung hat gezeigt: Auf Beamer und iPad füllten Titel, Aufgabe und Hinweise den Bildschirm, Regler und Ergebnis waren nie gleichzeitig zu sehen. Das ist im Labor jetzt gelöst (`labor/labor.css`, `labor/labor.js`, siehe unten). **Bevor** Werkzeuge ins Portal wandern, sollten diese Regeln in zwei gemeinsame Dateien:

- `assets/css/werkbank.css` und `assets/js/werkbank.js` (aus `labor/labor.css` und `labor/labor.js`), zusammen mit `material.css` und `material.js`, damit die Werkzeuge Kopfleiste, Lesemodus, Dunkelmodus und Teilen-Knopf des Portals bekommen.
- Die Zuordnung „was ist Bild, was sind Regler“ steht dann nicht mehr in einer Liste, sondern als Attribut im HTML (`data-wb="bild"`, `data-wb="regler"`). Aufwand S bis M.

## Schritt 1: Bausteine für alle Präsentationen (größter Nutzen pro Aufwand)

Einmal in `praesentation.js`, wirkt in allen Präsentationen. Laden erst bei Bedarf (wie die Belohnungsspiele).

| Baustein | Heute | Ziel | Aufwand |
|---|---|---|---|
| Referentenansicht und Bildschirm wach halten | `assets/js/referent.js`, nur in der Vorlage | Taste R in allen Präsentationen, Knopf im Werkzeugrand | S |
| Foto in die Folie | `assets/js/fotofolie.js`, nur in der Vorlage | Taste B, Knopf im Werkzeugrand | S |
| Aufgabe vorlesen | `assets/js/vorlesen.js` | Taste V liest den Auftrag der Folie vor, in der Leseansicht ein Knopf je Abschnitt | S bis M |
| Vorher/Nachher-Schieber | `assets/js/vergleich.js` | Baustein `data-vergleich` in `stunde.js`, Dokumentation in `docs/praesentationen.md` | S |
| Hilfen auf Abruf | `assets/js/hilfen.js` | Baustein `data-hilfen` in `stunde.js` | S |
| Do Now aus der Vorstunde | `assets/js/donow.js` | Baustein `data-donow` für die Do-Now-Folie | S |

## Schritt 2: Werkzeuge in die Themenfelder

Jedes Werkzeug wird ein Eintrag in `projects.json` (Typ „Simulation“ oder „Interaktive Anwendung“) im Ordner seines Themenfelds. Damit erscheint es auf der Fach- und Themenfeld-Seite. Daten bleiben zentral in `daten/`.

| Themenfeld | Werkzeuge | Bemerkung |
|---|---|---|
| **Geo 3.6 Klimawandel** (Kl. 9/10) | Klimaszenarien, Meeresspiegel (Modell), Meeresspiegel auf der Karte, Energiebilanz, Warming Stripes, Planspiel Klimaverhandlung, Wirkungsgefüge | stärkstes Paket, zuerst. Warming Stripes erst mit echten DWD-Daten |
| **Geo 3.5 Ressourcen** | Strommix | Daten über die Aktion aktualisieren |
| **Geo 3.1 Risikoräume** (Kl. 7/8) | Karte ohne Karte (Erdbeben), Meeresspiegel-Karte als Querverweis | Seismograf erst nach Gerätetest |
| **Geo 3.3 Vielfalt der Erde** | Länder-Quiz, Weltzeit-Uhr, Klimadiagramm | noch kein Material im Portal, hier lohnt der Start |
| **Geo 3.4 Armut und Reichtum** | Streudiagramm | erst mit echten Daten (Weltbank oder OWID, Lizenz prüfen) |
| **Geo 3.7 Globalisierung** | Wirkungsgefüge, Mystery | Mystery-Karten zum Thema neu schreiben |
| **Bio 3.1 Zelle** | Mikroskop-Foto vermessen, Mystery Fotosynthese | Mystery fachlich gegenlesen |
| **Bio 3.2 Lebensräume** | Räuber und Beute, Zählbogen | |
| **Bio 3.6 Nervensystem** | Reaktionstest, Hörbereich | Hörbereich erst nach Lautsprechertest |
| **Bio 3.7 Genetik** | Kreuzungsquadrat | |
| **Bio 3.8 Evolution** | PhET „Natürliche Selektion“ (nur Link) | CC BY-NC, nicht kopieren |

## Schritt 3: Begriffe-Seite und Lesemodus

| Baustein | Ziel | Bemerkung |
|---|---|---|
| Karteikasten (Leitner) | Reiter „Wiederholen“ auf der Begriffe-Seite, je Themenfeld | Stand nur im Browser |
| Begriffe in Familiensprachen | Sprachwahl auf der Begriffe-Seite, Übersetzungen im Datenblock `lp-spiel-daten` (Feld `sprachen`) | **erst nach Gegenlesen** durch Sprachkundige. Die Datei `daten/begriffe-sprachen.json` ist ungeprüft |
| Lesedarstellung | in den Lesemodus (`prefs.js`): Schriftgröße, Zeilen- und Textabstand | danach `labor/lesedarstellung/` löschen |

## Schritt 4: Seite „Werkzeuge“ (neu)

Ein Eintrag in `SEITEN` in `assets/js/nav.js` („Mehr“ → „Werkzeuge“), eine Seite mit Kacheln:

- **Abstimmen und Sammeln:** Papierkarten-Abstimmung, Rückkanal per QR, Zählbogen (Sammelseite).
- **Unterrichtsablauf:** Planspiel-Uhr mit Phasen (aus dem Planspiel), Zufall und Gruppen (noch nicht gebaut).
- **Medienbildung:** Quellenblatt und Lizenz-Check.

## Schritt 5: Bleibt im Labor, bis an Geräten getestet

Kamera-Farbmesser, Handy-Seismograf, Kompass, Schulhof-Maßstab, Schatten und Sonnenstand, Hörbereich. Test auf einem Schul-iPad und einem Handy, dann Schritt 2. **Vorher** die Datenschutzerklärung um Kamera, Bewegungssensor, Standort und Sprachausgabe ergänzen (alles nur lokal, aber zu nennen).

Die Demoseiten `labor/vorlesen/`, `labor/hilfen/`, `labor/vergleich/`, `labor/donow/` werden überflüssig, sobald Schritt 1 erledigt ist.

## Was noch fehlt (unabhängig vom Ort)

- Lizenz Copernicus DEM (Lizenzseite nicht erreichbar) und Bedingungen von EPA, CSIRO und NOAA für die Meeresspiegelreihe.
- Gerätetests: Kamera-Scan (QR, Papierkarten), iPad, Sensoren, Sprachausgabe.
- Die Aktion „Daten aktualisieren“ einmal in GitHub starten.
- Fachliches Gegenlesen: Mystery, Planspiel, PhET-Ablauf, Hinweise je Meeresspiegel-Ausschnitt.

## Reihenfolge und Aufwand

1. Werkbank ins Portal-Design (Schritt 0), etwa 1 Tag.
2. Präsentations-Bausteine (Schritt 1), 1 bis 2 Tage.
3. Klimawandel-Paket Geo 3.6 und Strommix Geo 3.5 (Schritt 2, erster Teil), 1 bis 2 Tage.
4. Geo 3.3 Vielfalt der Erde, Geo 3.1 Risikoräume, Biologie-Werkzeuge (Schritt 2, Rest), 2 Tage.
5. Begriffe-Seite und Lesemodus (Schritt 3), 1 bis 2 Tage, Sprachen erst nach Gegenlesen.
6. Seite „Werkzeuge“ (Schritt 4), 1 Tag.
7. Gerätetests und Datenschutzerklärung, dann Sensor-Werkzeuge (Schritt 5).

## Geräteprüfung vom 18.11.2026 (Ergebnis)

Geprüft wurden alle 37 Seiten in vier Größen: Handy (390 × 844), iPad hoch (820 × 1180), iPad quer (1180 × 820), Beamer (1280 × 720). Kein Inhalt lief seitlich aus dem Bild. Die Probleme lagen in der Anordnung:

- **Beamer und iPad quer:** Titel, Aufgabe und Hinweise füllten den ersten Bildschirm. Regler und Bild waren nicht gleichzeitig sichtbar.
- **Handy:** Das Bild stand über oder unter langen Reglerlisten, beim Verstellen sah man die Wirkung nicht.
- Kleinigkeiten: zu kleine Tippziele in Streudiagramm und Wirkungsgefüge, Auswahllisten zu breit, ein versehentlich sichtbares Bildfeld im Farbmesser, zu kleine Quellenschrift im Do Now.

**Behoben** mit der Werkbank (`labor/labor.js`, `labor/labor.css`) für 16 Werkzeuge: Breit stehen Bild und Regler nebeneinander und das Bild bleibt beim Scrollen stehen, schmal ist das Bild oben angeheftet (mit Knopf „Bild lösen“). Die Aufgabe ist einklappbar (auf Handy und Beamer zugeklappt), die Hinweise zu Grenzen und Daten stehen vollständig unter dem Werkzeug (Link oben). Knopf „Vollbild“ für den Beamer. Nachprüfung: In allen vier Größen sind bei allen 16 Werkzeugen Bild und erster Regler gleichzeitig zu sehen. Die Funktionstests der Werkzeuge laufen weiter fehlerfrei. **Nicht** geprüft: echte Geräte (nur nachgebildete Bildschirmgrößen im Browser).
