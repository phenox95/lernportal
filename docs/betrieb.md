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

## App und Offline-Speicher

**Als App:** `manifest.json` beschreibt Name, Symbole und Startadresse. Auf dem Handy oder Tablet lässt sich das Portal damit auf den Startbildschirm legen und öffnet ohne Browserleiste. Die Symbole liegen in `assets/favicon/` (`favicon-192.png`, `favicon-512.png`, `favicon-maskable-512.png`). Ändert sich das Favicon, diese drei Dateien neu erzeugen. Portalseiten verlinken das Manifest im `<head>`, alle anderen Seiten bekommen den Link über `prefs.js`.

**Offline-Speicher (`sw.js`):** Der Browser legt jede geöffnete Seite samt Bildern, Schrift und Skripten auf dem Gerät ab. Die Regel ist immer **Netz zuerst**: Ist das Gerät online, kommt die aktuelle Fassung vom Server. Nur wenn das Netz fehlt (oder ein Seitenaufruf länger als 4 Sekunden braucht), kommt die gespeicherte Kopie. Für eine nie geöffnete Seite erscheint `offline.html`. Es gibt keine Dateiliste zu pflegen: neue Materialien werden beim ersten Öffnen gespeichert. Der Speicher ist auf 400 Kopien begrenzt (`MAX` in `sw.js`): Darüber fallen die ältesten Kopien weg, die Start-Dateien bleiben immer erhalten. So wächst er auf knappen Schulgeräten nicht unbegrenzt.

- Braucht https oder localhost. Über `file://` passiert nichts.
- `sw.js` muss im Stamm des Repositorys liegen, sonst gilt der Speicher nicht für alle Ordner.
- Beim Hochladen ändert sich nichts am Ablauf. Der Zwischenspeicher von GitHub Pages (bis etwa 10 Minuten) gilt weiter.
- Speicher auf allen Geräten leeren: in `sw.js` die Zeile `const VERSION = "lp-1";` hochzählen (`lp-2`).
- Offline-Speicher ganz abschalten: den Inhalt von `sw.js` durch diese drei Zeilen ersetzen und in `assets/js/prefs.js` den Block „Offline-Speicher“ entfernen. Die Datei `sw.js` bleibt noch einige Wochen liegen, damit sich Geräte abmelden können.

```js
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(n => Promise.all(n.map(k => caches.delete(k)))).then(() => self.registration.unregister())));
```

**Zuletzt geöffnet:** `prefs.js` merkt sich im Browser (`localStorage`, Schlüssel `lernportal.zuletzt`) die Pfade der letzten 8 geöffneten Materialien. Die Startseite zeigt die 3 neuesten, aber nur Pfade, die in `projects.json` stehen und sichtbar sind. Eine Präsentation zählt zu ihrer Stunde.

**Seite nicht gefunden (`404.html`):** GitHub Pages zeigt die Datei bei jeder unbekannten Adresse. Sie lädt keine weiteren Dateien und findet den Stamm des Portals selbst (unter `<name>.github.io` der erste Ordner, unter eigener Domain `/`).

## Hinweis

Die Einträge in `projects.json` und `impuls.json` sind Beispiele. Vor dem produktiven Einsatz durch echte Inhalte ersetzen oder löschen.

