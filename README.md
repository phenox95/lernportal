# Lernportal

Zentrales Portal für digitale Unterrichtsmaterialien in Biologie und Geografie.

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
  "path": "biologie/klasse-10/meiose/"
}
```

4. Änderungen in den `main`-Branch hochladen. GitHub Pages veröffentlicht sie anschließend automatisch.

## GitHub Pages aktivieren

Im Repository unter **Settings → Pages** als Build source **Deploy from a branch** wählen, Branch `main`, Ordner `/(root)`, dann **Save**.

## Hinweis

Die drei Einträge in `projects.json` sind Beispiele. Vor dem produktiven Einsatz durch echte Inhalte ersetzen oder löschen.
