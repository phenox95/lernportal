/* Lernportal – Offline-Speicher (Service Worker).
   Aufgabe: Seiten, die einmal geöffnet wurden, auch ohne Internet zeigen (schwaches Schul-WLAN, unterwegs).

   Regel: immer zuerst das Netz, der Speicher ist nur der Rückfall.
   Dadurch ist eine neue Version sofort sichtbar, sobald das Gerät online ist. Es gibt keine Dateiliste zu pflegen.
   - Antwort aus dem Netz: anzeigen und eine Kopie ablegen.
   - Netz fehlt oder braucht bei einem Seitenaufruf länger als WARTEN: Kopie aus dem Speicher.
   - Keine Kopie vorhanden: bei Seiten die Hinweisseite offline.html.
   Gespeichert werden nur eigene Dateien des Portals (gleiche Adresse), keine fremden Inhalte, keine Eingaben.

   Abschalten: VERSION ändern leert den Speicher. Soll der Offline-Speicher ganz weg, siehe docs/betrieb.md. */
"use strict";

const VERSION = "lp-1";
const MAX = 400;                           // höchstens so viele Kopien, danach fallen die ältesten weg (knapper Speicher auf Schulgeräten)
const WARTEN = 4000;                       // Millisekunden, danach bei Seitenaufrufen die gespeicherte Kopie
const START = ["./", "offline.html", "assets/css/styles.css", "assets/js/prefs.js", "assets/js/nav.js", "assets/js/app.js",
  "projects.json", "themenfelder.json", "bne.json", "impuls.json", "assets/favicon/favicon.svg"];

self.addEventListener("install", event => {
  /* Start-Dateien einzeln ablegen: fehlt eine, scheitert nicht die ganze Einrichtung */
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => Promise.all(START.map(datei => cache.add(new Request(datei, { cache: "reload" })).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n.indexOf("lp-") === 0 && n !== VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function ablegen(request, response) {
  /* nur vollständige, eigene Antworten (keine Fehlerseiten, keine Teilantworten) */
  if (!response || response.status !== 200 || response.type !== "basic") return;
  const kopie = response.clone();
  caches.open(VERSION)
    .then(cache => cache.put(request, kopie).then(() => kuerzen(cache)))
    .catch(() => { /* Speicher voll: ohne Kopie weiter */ });
}

/* Obergrenze halten: die zuletzt abgelegten Kopien bleiben (put hängt eine Kopie ans Ende), die ältesten fallen weg.
   Die Start-Dateien bleiben immer erhalten. */
function kuerzen(cache) {
  return cache.keys().then(liste => {
    const ueberzaehlig = liste.length - MAX;
    if (ueberzaehlig <= 0) return null;
    const pfade = START.map(d => new URL(d, self.registration.scope).href);
    const weg = liste.filter(r => pfade.indexOf(r.url) < 0).slice(0, ueberzaehlig);
    return Promise.all(weg.map(r => cache.delete(r)));
  });
}

function ausSpeicher(request, istSeite) {
  /* Seiten und Daten auch ohne den Teil nach dem Fragezeichen finden (alle/?klasse=8) */
  return caches.match(request).then(treffer => treffer || caches.match(request, { ignoreSearch: true }))
    .then(treffer => treffer || (istSeite ? caches.match("offline.html") : undefined));
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.indexOf(new URL(self.registration.scope).pathname) !== 0) return;

  const istSeite = request.mode === "navigate";
  const netz = fetch(request).then(response => { ablegen(request, response); return response; });

  if (!istSeite) {
    event.respondWith(netz.catch(() => ausSpeicher(request, false).then(treffer => treffer || Response.error())));
    return;
  }

  /* Seitenaufruf: Netz gegen Uhr. Läuft die Uhr ab und es gibt eine Kopie, kommt die Kopie. Das Netz lädt im Hintergrund weiter. */
  event.respondWith(new Promise(fertig => {
    let erledigt = false;
    const liefern = antwort => { if (!erledigt && antwort) { erledigt = true; fertig(antwort); } };
    const uhr = setTimeout(() => {
      caches.match(request).then(treffer => treffer || caches.match(request, { ignoreSearch: true })).then(liefern);
    }, WARTEN);
    netz.then(antwort => { clearTimeout(uhr); liefern(antwort); })
      .catch(() => { clearTimeout(uhr); ausSpeicher(request, true).then(treffer => liefern(treffer || Response.error())); });
  }));
  event.waitUntil(netz.catch(() => null));
});
