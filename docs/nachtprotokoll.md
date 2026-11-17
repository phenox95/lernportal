# Nachtprotokoll: Recherche für das Lernportal

Ein Eintrag je Recherchenacht: Auftrag, Methode, Ergebnis, Grenzen. Ergebnisse stehen in `docs/ideen-native-nutzung.md` (Abschnitte 10 und 11). Es gilt immer: Das Repository ist öffentlich, keine Lösungen, Erwartungshorizonte oder Lehrkrafthinweise.

## Nacht 1 (16.11.2026), nachgetragen am 17.11.2026

- **Auftrag (aus dem Katalog rekonstruiert):** Datenquellen, Browser-Bausteine, Unterrichtsideen und Rechtsfragen recherchieren, als Vorschläge festhalten.
- **Ergebnis:** Abschnitt 10 des Katalogs (10.1 Datenquellen, 10.2 Bausteine, 10.3 Unterrichtsideen, 10.4 Recht und Datenschutz, 10.5 neue Ideen, 10.6 offene Prüfungen).
- **Grenzen:** Nur Websuche, Anbieterseiten nicht abrufbar, CORS nicht getestet. Alle Angaben „ungeprüft (Suchbeleg)“ oder „offen“.
- **Nachtrag zur Ablage:** Dieses Protokoll und Abschnitt 10 lagen am 17.11.2026 **nicht** im Branch `claude/zealous-hawking-ge9ixn`, nur im Katalog-Artifact. Abschnitt 10 wurde in Nacht 2 aus dem Artifact in die Markdown-Datei übernommen, dieser Eintrag ist aus dem Artifact rekonstruiert (kein Originalprotokoll).

## Nacht 2 (17.11.2026)

- **Auftrag:** (1) Stichprobe aus Abschnitt 10 erneut an der Quelle prüfen und Korrekturen markieren. (2) Neue Quellen und Ideen in Bereichen, die Runde 1 nicht abdeckt: Fachdidaktik Berlin (LISUM, Bildungsserver), OER mit freier Lizenz, Citizen Science, Exkursionsorte, mehrsprachige Fachbegriffe, Barrierefreiheit, LRS. (3) Drei Umsetzungsvorschläge.
- **Methode:** Websuche in zwei Wellen (rund 30 Suchen, Standardmodus). Direkter Abruf der Anbieterseiten war gesperrt (Namensauflösung und Proxy, alle getesteten Hosts). Deshalb **keine Prüfung an der Quellseite**, sondern eine zweite, unabhängige Suche je Eintrag („bestätigt (Suchbeleg 2)“). Jede Zeile trägt einen Status, nichts Ungeprüftes ist als geprüft ausgewiesen.
- **Ergebnis:** Abschnitt 11 des Katalogs.
  - **11.1** Stichprobe von 12 Einträgen aus Abschnitt 10. Korrekturen: **PhET** (Übergang der Kernsammlung zu CC BY-NC laut Impact Report, nur die historische Sammlung vor dem 29.03.2026 steht unter CC BY 4.0), **SMARD** (Website-Inhalte CC BY-ND, nur Downloaddaten verwenden), **UBA** (Vermerk aus älterer Schnittstellenbeschreibung, Satz in Runde 1 unsauber), **Fachbrief DaZ 24** (Inhaltsangabe und Jahr in Runde 1 nicht bestätigt), **Translator** (Polnisch und Russisch nicht belegt), **Energy-Charts** bleibt offen.
  - **11.2** Neue Funde: Neuentwicklung der RLP-Fachteile (Risiko für `themenfelder.json`), Berliner OER-Weg über den Bildungsserver (CC BY, BY-SA, BY-ND), Wikidata als CC0-Quelle für mehrsprachige Begriffe, TULLU-Regel, Humboldt Explorers, City Nature Challenge Berlin, Mückenatlas, Leitfäden Citizen Science mit Schulen, Exkursionsorte (Tempelhofer Feld, Tegeler Fließ), Umweltatlas-Lizenzen, LRS-Evidenz (Spezialschriften ohne Formeffekt, Abstände umstritten), WCAG 1.4.12.
  - **11.3** Drei Umsetzungsvorschläge: (1) Mehrsprachige Begriffe aus Wikidata mit Kennzeichen „ungeprüft“, (2) Schulhof-Zählung mit Klassendatensatz über Ergebnis-QR, (3) Einstellbare Lesedarstellung ohne feste „LRS-Schrift“.
  - **11.5** Liste dessen, was mit freiem Netz geprüft werden muss, einschließlich der Hosts, die freigegeben werden müssten.
- **Nicht gelungen / offen:** Quellseiten selbst lesen (Lizenzwortlaut, CORS); Botanischer Garten, Rieselfelder, Naturschutzstationen und ein Berliner Schulbiologiezentrum ergaben keine Treffer; Leichte Sprache ohne Treffer; Humboldt-Explorers-Materialien und ihre Lizenz nicht gefunden; Abschnitt 10.4 (Recht) und die Mehrzahl der Datenquellen nicht erneut belegt.
- **Aus Nacht 2 ins Repository gekommen:** nur Text in `docs/`. Kein Code, keine Daten, kein Eintrag in `projects.json`.
