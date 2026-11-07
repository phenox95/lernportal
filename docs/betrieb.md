# Betrieb und Veröffentlichung

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

