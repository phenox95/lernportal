#!/usr/bin/env python3
"""Holt offene Daten und legt sie als kleine JSON-Dateien im Ordner daten/ ab.

Idee: Das Portal lädt zur Laufzeit nichts von Dritten nach (Datenschutz, Schul-WLAN, Offline-Speicher).
Stattdessen holt dieses Skript die Daten VORHER (von Hand oder per GitHub Action), und die Seiten lesen
nur noch eigene Dateien. So sind "Live"-Daten datenschutzfreundlich, schnell und offline nutzbar.

Aufruf (aus dem Hauptordner):
  python3 tools/daten-holen.py karte       Küstenlinien (Natural Earth, gemeinfrei) und Plattengrenzen (Bird 2003, ODC-By) -> daten/weltkarte.json, daten/plattengrenzen.json
  python3 tools/daten-holen.py laender     Länder mit Namen in 8 Sprachen (Natural Earth, gemeinfrei) -> daten/laender.json (Topografie-Quiz, mehrsprachig)
  python3 tools/daten-holen.py meeresspiegel  Globaler Meeresspiegel 1880 bis 2013 (EPA mit CSIRO und NOAA Satellitenaltimetrie, Datensatz datasets/sea-level-rise, ODC-PDDL) -> daten/meeresspiegel.json
  python3 tools/daten-holen.py erdbeben    Erdbeben der letzten 30 Tage, Stärke 4,5 und mehr (USGS, gemeinfrei) -> daten/erdbeben.json
  python3 tools/daten-holen.py demo        Beispiel-Erdbeben aus den Plattengrenzen SIMULIERT -> daten/erdbeben.json ("demo": true, wird auf der Seite gekennzeichnet)
"""
import json, math, random, sys, urllib.request, datetime, pathlib

WURZEL = pathlib.Path(__file__).resolve().parent.parent / "daten"
NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson"
PB = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
LAENDER = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"
MSP = "https://raw.githubusercontent.com/datasets/sea-level-rise/master/data/epa-sea-level.csv"
USGS = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"


def holen(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "lernportal-daten"}), timeout=60) as r:
        return json.load(r)


def runden(pkt):
    return [round(pkt[0], 1), round(pkt[1], 1)]


def linie(punkte):
    aus = []
    for p in map(runden, punkte):
        if not aus or aus[-1] != p:
            aus.append(p)
    return aus


def schreiben(name, daten):
    WURZEL.mkdir(exist_ok=True)
    (WURZEL / name).write_text(json.dumps(daten, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("geschrieben:", name, (WURZEL / name).stat().st_size, "Bytes")


def karte():
    land = holen(NE)
    ringe = []
    for f in land["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            ringe.append(linie(poly[0]))
    schreiben("weltkarte.json", {"quelle": "Natural Earth, ne_110m_land (gemeinfrei)", "ringe": ringe})
    pb = holen(PB)
    linien = [linie(f["geometry"]["coordinates"]) for f in pb["features"] if f["geometry"]["type"] == "LineString"]
    schreiben("plattengrenzen.json", {"quelle": "Peter Bird (2003), An updated digital model of plate boundaries; Aufbereitung: fraxen/tectonicplates, Open Data Commons Attribution License 1.0", "linien": linien})


def laender():
    d = holen(LAENDER)
    sprachen = ["DE", "EN", "AR", "TR", "UK", "RU", "PL", "FA"]
    aus = []
    for f in d["features"]:
        p = f["properties"]
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        ringe = [linie(poly[0]) for poly in polys if len(poly[0]) > 3]
        name = {s.lower(): p.get("NAME_" + s) for s in sprachen if p.get("NAME_" + s)}
        aus.append({"n": name, "k": p.get("CONTINENT"), "e": p.get("POP_EST"), "r": ringe})
    schreiben("laender.json", {"quelle": "Natural Earth, ne_110m_admin_0_countries (gemeinfrei). Grenzen und Namen vereinfacht, kein amtliches Kartenwerk", "laender": aus})


def meeresspiegel():
    import csv, io
    with urllib.request.urlopen(urllib.request.Request(MSP, headers={"User-Agent": "lernportal-daten"}), timeout=60) as r:
        text = r.read().decode("utf-8")
    zeilen = []
    for z in csv.DictReader(io.StringIO(text)):
        def mm(k):
            v = (z.get(k) or "").strip()
            return round(float(v) * 25.4, 1) if v else None  # Quelle in Zoll (inches)
        zeilen.append([int(z["Year"]), mm("CSIRO Adjusted Sea Level"), mm("Lower Error Bound"), mm("Upper Error Bound"), mm("NOAA Adjusted Sea Level")])
    schreiben("meeresspiegel.json", {
        "quelle": "EPA (US Environmental Protection Agency), Climate Change Indicators: Sea Level, mit Daten von CSIRO (Gezeitenpegel und Satelliten) und NOAA (Satellitenaltimetrie ab 1993); Aufbereitung: datasets/sea-level-rise (Open Data Commons Public Domain Dedication and License 1.0). Quelle in Zoll, hier in Millimeter umgerechnet",
        "abruf": datetime.date.today().isoformat(),
        "einheit": "mm gegenüber dem Jahr 1880 (CSIRO) bzw. gleiche Nulllinie (NOAA)",
        "spalten": ["Jahr", "CSIRO", "CSIRO untere Fehlergrenze", "CSIRO obere Fehlergrenze", "NOAA Satelliten"],
        "reihe": zeilen})


def erdbeben():
    d = holen(USGS)
    bebenliste = []
    for f in d["features"]:
        lon, lat, tiefe = f["geometry"]["coordinates"]
        p = f["properties"]
        if p.get("mag") is None:
            continue
        tag = datetime.datetime.fromtimestamp(p["time"] / 1000, datetime.timezone.utc).strftime("%Y-%m-%d")
        bebenliste.append([round(lon, 2), round(lat, 2), round(p["mag"], 1), round(tiefe), tag])
    schreiben("erdbeben.json", {"quelle": "USGS Earthquake Hazards Program (gemeinfrei), Feed 4.5_month", "abruf": datetime.date.today().isoformat(), "demo": False, "beben": bebenliste})


def demo():
    """Simulierte Beispieldaten: Punkte entlang der echten Plattengrenzen mit Streuung. KEINE echten Erdbeben."""
    pb = json.loads((WURZEL / "plattengrenzen.json").read_text(encoding="utf-8"))["linien"]
    zufall = random.Random(7)
    segmente = []
    for l in pb:
        for a, b in zip(l, l[1:]):
            laenge = math.hypot(b[0] - a[0], b[1] - a[1])
            if laenge < 25:  # Sprünge über den Kartenrand ausschließen
                segmente.append((a, b, laenge))
    gesamt = sum(s[2] for s in segmente)
    ziel, bebenliste = 900, []
    heute = datetime.date.today()
    for _ in range(ziel):
        r = zufall.uniform(0, gesamt)
        for a, b, l in segmente:
            r -= l
            if r <= 0:
                break
        t = zufall.random()
        lon = a[0] + (b[0] - a[0]) * t + zufall.gauss(0, 0.9)
        lat = a[1] + (b[1] - a[1]) * t + zufall.gauss(0, 0.9)
        mag = round(4.5 + zufall.expovariate(1.9), 1)
        tiefe = int(min(650, zufall.expovariate(1 / 45)))
        tag = (heute - datetime.timedelta(days=zufall.randint(0, 29))).isoformat()
        bebenliste.append([round(lon, 2), round(lat, 2), min(mag, 8.2), tiefe, tag])
    schreiben("erdbeben.json", {"quelle": "SIMULIERTE Beispieldaten entlang der Plattengrenzen, keine echten Erdbeben. Echte Daten: python3 tools/daten-holen.py erdbeben", "abruf": heute.isoformat(), "demo": True, "beben": bebenliste})


if __name__ == "__main__":
    {"karte": karte, "laender": laender, "meeresspiegel": meeresspiegel, "erdbeben": erdbeben, "demo": demo}.get(sys.argv[1] if len(sys.argv) > 1 else "", lambda: print(__doc__))()
