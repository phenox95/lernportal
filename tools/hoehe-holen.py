#!/usr/bin/env python3
"""Erzeugt Überflutungskarten für das Meeresspiegel-Tool (labor/meeresspiegel-karte/).

Aus einem globalen Höhenmodell (Terrarium-Kacheln, Mapzen/Tilezen, Quellen siehe unten) und der Küstenlinie von Natural Earth wird
für jeden Bildpunkt berechnet, **ab welchem Meeresspiegel (0 bis 10 m in 0,1-m-Schritten) er vom Meer erreicht wird**. Nur Land,
das über zusammenhängend niedrigeres Land mit dem offenen Meer verbunden ist, überflutet (Binnensenken bleiben trocken).
Die Seite muss dadurch nur noch einen Schwellenwert anwenden, der Regler reagiert sofort.

Ausgabe: daten/hoehe/<id>.png (RGB, 8 Bit) und daten/hoehe/index.json
  Rot  : Überflutungshöhe. 0 = offenes Meer, 1..101 = überflutet ab (Wert minus 1) / 10 m, 255 = nicht bis 10 m erreichbar
  Grün : Relief des Landes (Quadratwurzel der Höhe bis 4000 m, 0 bis 255)
  Blau : Land (255) oder Wasser (0)
Gitter: gleichwinklig (Längen- und Breitengrad), Breite und Höhe in index.json.

WICHTIG (Genauigkeit, auch auf der Seite genannt): Das Höhenmodell (SRTM und andere) hat eine senkrechte Genauigkeit im Bereich
mehrerer Meter und enthält Bäume und Gebäude. Deiche und Pumpen sind nicht erfasst. Die Karten zeigen Größenordnungen, keine Prognose.

Zwei Höhenmodelle:
- Terrarium (Weltkarte und alle Ausschnitte, Datei <id>.png)
- Copernicus GLO-30 (30 m, für die Ausschnitte, Datei <id>-cop.png, jeweils der Median je Gitterzelle). Es ist wie SRTM ein Oberflächenmodell, enthält also ebenfalls Baumkronen und Dächer, ist aber genauer.

Quellen (Lizenzen vor der Veröffentlichung lesen):
- Copernicus DEM GLO-30: https://registry.opendata.aws/copernicus-dem/ (Lizenz und Namensnennung des Anbieters lesen)
- Höhenkacheln: https://registry.opendata.aws/terrain-tiles/ (Terrarium-Format, enthält u. a. SRTM, ETOPO1, GMTED; Hinweise des Anbieters beachten)
- Küstenlinie: Natural Earth, gemeinfrei

Benötigt: numpy, scipy, pillow, tifffile, imagecodecs (pip install numpy scipy pillow tifffile imagecodecs). Aufruf: python3 tools/hoehe-holen.py [welt|<regions-id> ...]
Erlaubte Hosts: elevation-tiles-prod.s3.amazonaws.com, copernicus-dem-30m.s3.amazonaws.com, raw.githubusercontent.com
"""
import io, json, math, os, pathlib, sys, urllib.request
import concurrent.futures as cf
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

WURZEL = pathlib.Path(__file__).resolve().parent.parent / "daten" / "hoehe"
CACHE = pathlib.Path(os.environ.get("LP_CACHE", "/tmp/lp-hoehe"))
KACHEL = "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png"
LAND = {"50m": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson",
        "10m": "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson"}

# id, Name, lon0, lat0 (Süd), lon1, lat1 (Nord), Auflösung in Grad, Zoom der Terrarium-Kacheln, Küstenlinie, Copernicus-Variante
REGIONEN = [
    ("welt", "Weltkarte", -180.0, -60.0, 180.0, 84.0, 0.1, 4, "50m", False),
    ("nordsee", "Nordsee: Niederlande und Norddeutschland", 3.0, 51.0, 10.5, 55.2, 0.005, 8, "10m", True),
    ("hamburg", "Hamburg und Elbmündung", 8.8, 53.0, 10.6, 54.0, 0.0025, 9, "10m", True),
    ("ostsee", "Deutsche Ostseeküste", 10.0, 53.8, 14.4, 54.9, 0.005, 8, "10m", True),
    ("bangladesch", "Bangladesch: Ganges-Brahmaputra-Delta", 87.0, 21.0, 93.0, 25.0, 0.005, 8, "10m", True),
    ("nildelta", "Ägypten: Nildelta", 29.0, 30.0, 33.0, 32.0, 0.005, 8, "10m", True),
    ("mekong", "Vietnam: Mekong-Delta", 104.5, 8.3, 108.0, 11.6, 0.005, 8, "10m", True),
    ("bangkok", "Thailand: Bangkok und Golf von Thailand", 99.8, 12.6, 101.4, 14.2, 0.005, 8, "10m", True),
    ("jakarta", "Indonesien: Jakarta und Nordküste Javas", 106.2, -6.9, 107.6, -5.8, 0.005, 8, "10m", True),
    ("florida", "USA: Südflorida", -83.0, 24.8, -79.3, 28.2, 0.005, 8, "10m", True),
    ("newyork", "USA: New York und New Jersey", -74.6, 39.6, -73.2, 41.0, 0.005, 8, "10m", True),
    ("mississippi", "USA: Mississippi-Delta", -92.5, 28.5, -88.0, 30.8, 0.005, 8, "10m", True),
    ("venedig", "Italien: Venedig und Po-Ebene", 11.0, 44.0, 14.5, 46.0, 0.005, 8, "10m", True),
    ("jangtse", "China: Jangtse-Delta und Shanghai", 119.5, 29.5, 123.5, 32.5, 0.005, 8, "10m", True),
    ("lagos", "Nigeria: Lagos und Golf von Guinea", 2.6, 6.0, 4.8, 6.9, 0.005, 8, "10m", True),
    ("london", "Großbritannien: London und Themsemündung", -0.8, 51.2, 1.4, 51.9, 0.005, 8, "10m", True),
    ("kopenhagen", "Dänemark und Schweden: Kopenhagen und Öresund", 12.0, 55.3, 13.4, 56.1, 0.005, 8, "10m", True),
    ("houston", "USA: Houston und Galveston", -95.8, 28.8, -94.2, 30.2, 0.005, 8, "10m", True),
    ("rio", "Brasilien: Rio de Janeiro", -43.8, -23.3, -42.8, -22.6, 0.005, 8, "10m", True),
    ("buenosaires", "Argentinien: Buenos Aires und Río de la Plata", -59.0, -35.2, -57.4, -34.2, 0.005, 8, "10m", True),
    ("mumbai", "Indien: Mumbai", 72.5, 18.5, 73.6, 20.0, 0.005, 8, "10m", True),
    ("indus", "Pakistan: Indus-Delta und Karatschi", 66.5, 23.5, 68.5, 25.5, 0.005, 8, "10m", True),
    ("manila", "Philippinen: Manila", 120.5, 14.0, 121.5, 15.0, 0.005, 8, "10m", True),
    ("tokio", "Japan: Tokio und Kanto-Ebene", 139.3, 35.0, 140.6, 36.0, 0.005, 8, "10m", True),
    ("osaka", "Japan: Osaka und Kobe", 134.8, 34.2, 136.0, 35.0, 0.005, 8, "10m", True),
    ("dubai", "Vereinigte Arabische Emirate: Dubai und Abu Dhabi", 54.0, 24.2, 55.8, 25.6, 0.005, 8, "10m", True),
    ("singapur", "Singapur und Johor", 103.4, 1.0, 104.4, 1.7, 0.005, 8, "10m", True),
    ("malediven", "Malediven (Atolle): Beispiel für ein ungeeignetes Höhenmodell", 72.5, -0.7, 73.9, 4.6, 0.005, 8, "10m", True),
]

HINWEISE = {
    "bangladesch": "Das Terrarium-Modell zeigt das Land hier vermutlich zu hoch (Bäume, Dächer). Vergleiche mit Copernicus.",
    "florida": "Das Terrarium-Modell zeigt das Land hier vermutlich zu hoch. Vergleiche mit Copernicus. Die Karte kennt weder Kanäle noch Pumpen.",
    "jangtse": "Das Terrarium-Modell zeigt das Land hier vermutlich zu hoch. Vergleiche mit Copernicus. Deiche und Sperrwerke sind nicht erfasst.",
    "bangkok": "Das Terrarium-Modell zeigt das Land hier vermutlich zu hoch. Dazu kommt Landabsenkung durch Grundwasserentnahme, die die Karte nicht kennt.",
    "jakarta": "Jakarta sinkt stellenweise stark ab (Grundwasserentnahme). Das Höhenmodell kennt nur einen Zeitpunkt und keine Absenkung.",
    "nordsee": "Weite Teile der Niederlande und der deutschen Küste liegen auf oder unter dem Meeresspiegel. Deiche, Siele und Schöpfwerke halten das Wasser fern. Sie sind in der Karte nicht erfasst.",
    "hamburg": "Hochwasserschutz (Deiche, Sperrwerke, Warften) ist in der Karte nicht erfasst.",
    "london": "Die Themse-Sperre (Thames Barrier) und die Deiche sind in der Karte nicht erfasst.",
    "malediven": "UNGEEIGNET: Die Inseln der Atolle sind meist nur 1 bis 2 m hoch und sehr klein. Das Höhenmodell ist viel zu grob, Bäume und Gebäude erscheinen als Höhe. Die Karte zeigt die Gefahr hier nicht richtig. Beurteile, warum.",
    "venedig": "Die Lagune hat bewegliche Sperren (MOSE) und Deiche, die in der Karte nicht erfasst sind.",
    "tokio": "Hochwasserschutz und Landabsenkung sind nicht erfasst.",
    "indus": "Das Delta ist sehr flach. Das Höhenmodell ist dort ungenau, Bäume (Mangroven) erscheinen als Höhe.",
}


def holen(url, ziel):
    if ziel.exists():
        return ziel.read_bytes()
    ziel.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "lernportal-daten"}), timeout=90) as r:
        daten = r.read()
    ziel.write_bytes(daten)
    return daten


def kachel(z, x, y):
    d = holen(KACHEL.format(z=z, x=x, y=y), CACHE / "terrarium" / str(z) / str(x) / ("%d.png" % y))
    a = np.asarray(Image.open(io.BytesIO(d)).convert("RGB"), dtype=np.float32)
    return a[:, :, 0] * 256.0 + a[:, :, 1] + a[:, :, 2] / 256.0 - 32768.0


def hoehen(lon0, lat0, lon1, lat1, res, z):
    """Höhe in Metern auf gleichwinkligem Gitter (Zeile 0 = Nord)."""
    w, h = int(round((lon1 - lon0) / res)), int(round((lat1 - lat0) / res))
    lons = lon0 + (np.arange(w) + 0.5) * res
    lats = lat1 - (np.arange(h) + 0.5) * res
    n = 2 ** z
    mx = (lons + 180.0) / 360.0 * n
    la = np.radians(np.clip(lats, -85.05, 85.05))
    my = (1.0 - np.log(np.tan(la) + 1.0 / np.cos(la)) / math.pi) / 2.0 * n
    tx0, tx1 = int(math.floor(mx.min())), int(math.floor(mx.max()))
    ty0, ty1 = int(math.floor(my.min())), int(math.floor(my.max()))
    nx, ny = tx1 - tx0 + 1, ty1 - ty0 + 1
    todo = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
    mos = np.zeros((ny * 256, nx * 256), dtype=np.float32)
    with cf.ThreadPoolExecutor(8) as ex:
        for (x, y), a in zip(todo, ex.map(lambda t: kachel(z, t[0], t[1]), todo)):
            mos[(y - ty0) * 256:(y - ty0 + 1) * 256, (x - tx0) * 256:(x - tx0 + 1) * 256] = a
    px = np.clip((mx * 256).astype(int) - tx0 * 256, 0, nx * 256 - 1)
    py = np.clip((my * 256).astype(int) - ty0 * 256, 0, ny * 256 - 1)
    e = mos[np.ix_(py, px)]
    e[lats > 85.05, :] = 9999.0  # über dem Kachelrand: nie überflutet
    return e


COP = "https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_{ns}{lat:02d}_00_{ew}{lon:03d}_00_DEM/Copernicus_DSM_COG_10_{ns}{lat:02d}_00_{ew}{lon:03d}_00_DEM.tif"


def hoehen_cop(lon0, lat0, lon1, lat1, res):
    """Copernicus GLO-30: Median je Gitterzelle (res muss ein Vielfaches von 1/3600 Grad sein, Ränder auf das Gitter gelegt)."""
    import tifffile
    w, h = int(round((lon1 - lon0) / res)), int(round((lat1 - lat0) / res))
    f = int(round(res * 3600))
    n = 3600 // f
    e = np.full((h, w), -50.0, np.float32)
    kacheln = [(la, lo) for la in range(int(math.floor(lat0)), int(math.ceil(lat1))) for lo in range(int(math.floor(lon0)), int(math.ceil(lon1)))]

    def hole(t):
        la, lo = t
        url = COP.format(ns="N" if la >= 0 else "S", lat=abs(la), ew="E" if lo >= 0 else "W", lon=abs(lo))
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "lernportal-daten"}), timeout=120) as r:
                a = tifffile.imread(io.BytesIO(r.read()))
        except Exception:
            return t, None  # reine Meereskachtel gibt es nicht
        a = a.astype(np.float32)
        # Kacheln haben ab etwa 50 Grad Breite weniger Spalten (2400, 1800, ...), Zeilen immer 3600
        fx = a.shape[1] * res
        if abs(fx - round(fx)) > 1e-6:
            xi = np.minimum((np.arange(n) + 0.5) * (a.shape[1] / n), a.shape[1] - 1).astype(int)
            yi = np.minimum((np.arange(n) + 0.5) * f, a.shape[0] - 1).astype(int)
            return t, a[np.ix_(yi, xi)]
        fx = int(round(fx))
        a = a[:n * f, :n * fx]
        return t, np.median(a.reshape(n, f, n, fx), axis=(1, 3))

    with cf.ThreadPoolExecutor(4) as ex:
        for (la, lo), m in ex.map(hole, kacheln):
            if m is None:
                continue
            c0 = int(round((lo - lon0) / res))
            r0 = int(round((lat1 - (la + 1)) / res))
            cs, rs = max(0, c0), max(0, r0)
            ce, re_ = min(w, c0 + n), min(h, r0 + n)
            if ce > cs and re_ > rs:
                e[rs:re_, cs:ce] = m[rs - r0:re_ - r0, cs - c0:ce - c0]
    return e


_land_cache = {}


def landmaske(lon0, lat0, lon1, lat1, res, mass):
    if mass not in _land_cache:
        _land_cache[mass] = json.loads(holen(LAND[mass], CACHE / ("land_%s.geojson" % mass)))
    w, h = int(round((lon1 - lon0) / res)), int(round((lat1 - lat0) / res))
    bild = Image.new("L", (w, h), 0)
    zeich = ImageDraw.Draw(bild)

    def pix(ring):
        return [((x - lon0) / res, (lat1 - y) / res) for x, y in ring]

    for f in _land_cache[mass]["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            xs = [p[0] for p in poly[0]]
            ys = [p[1] for p in poly[0]]
            if max(xs) < lon0 or min(xs) > lon1 or max(ys) < lat0 or min(ys) > lat1:
                continue
            zeich.polygon(pix(poly[0]), fill=255)
            for loch in poly[1:]:
                zeich.polygon(pix(loch), fill=0)
    return np.asarray(bild) > 0


def ueberflutungshoehe(e, land):
    """Byte-Karte: 0 Meer, 1..101 überflutet ab (b-1)/10 m, 255 nie (bis 10 m)."""
    wasser = ~land
    lbl, _ = ndimage.label(wasser)
    rand = np.unique(np.concatenate([lbl[0, :], lbl[-1, :], lbl[:, 0], lbl[:, -1]]))
    rand = rand[rand > 0]
    lut = np.zeros(lbl.max() + 1, bool)
    lut[rand] = True
    meer = lut[lbl]  # nur Meer, das den Kartenrand berührt (Binnenseen bleiben außen vor)
    ek = np.ceil(np.clip(e, -50, 50) * 10).astype(np.int16)
    aus = np.full(e.shape, 255, np.uint8)
    aus[meer] = 0
    ziel = land & ~meer
    for stufe in range(0, 101):
        m = meer | (ziel & (ek <= stufe))
        l2, n2 = ndimage.label(m)
        t = np.zeros(n2 + 1, bool)
        t[np.unique(l2[meer])] = True
        t[0] = False
        neu = t[l2] & (aus == 255) & ziel
        aus[neu] = stufe + 1
    return aus


def speichern(rid, e, land, suffix=""):
    rot = ueberflutungshoehe(e, land)
    gruen = np.where(land, np.rint(255 * np.sqrt(np.clip(e, 0, 4000) / 4000.0)), 0).astype(np.uint8)
    blau = np.where(land, 255, 0).astype(np.uint8)
    bild = Image.fromarray(np.dstack([rot, gruen, blau]), "RGB")
    WURZEL.mkdir(parents=True, exist_ok=True)
    pfad = WURZEL / (rid + suffix + ".png")
    bild.save(pfad, optimize=True)
    print("   ", pfad.name, bild.size, pfad.stat().st_size // 1024, "KB; überflutet bis 10 m:", int(((rot > 0) & (rot < 255)).sum()), "Punkte", flush=True)
    return bild.size


def rechne(rid, name, lon0, lat0, lon1, lat1, res, z, mass, cop):
    print("→", rid, name, flush=True)
    land = landmaske(lon0, lat0, lon1, lat1, res, mass)
    groesse = speichern(rid, hoehen(lon0, lat0, lon1, lat1, res, z), land)
    modelle = ["terrarium"]
    if cop:
        speichern(rid, hoehen_cop(lon0, lat0, lon1, lat1, res), land, "-cop")
        modelle.append("cop")
    return {"id": rid, "name": name, "lon0": lon0, "lat0": lat0, "lon1": lon1, "lat1": lat1, "breite": groesse[0], "hoehe": groesse[1], "aufloesung_grad": res, "modelle": modelle}


def staedte():
    """Städte (Natural Earth, gemeinfrei) in den Ausschnitten und Städte ab 1 Mio. Einwohner weltweit -> daten/hoehe/staedte.json."""
    quelle = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson"
    pp = json.loads(holen(quelle, CACHE / "populated_places.geojson"))["features"]
    laender = {}
    lp = WURZEL.parent / "laender.json"
    if lp.exists():
        for l in json.loads(lp.read_text(encoding="utf-8"))["laender"]:
            if l["n"].get("en") and l["n"].get("de"):
                laender[l["n"]["en"]] = l["n"]["de"]
    boxen = [(r[2], r[3], r[4], r[5]) for r in REGIONEN if r[0] != "welt"]
    aus = []
    for f in pp:
        p = f["properties"]
        pop = p.get("POP_MAX") or 0
        lon, lat = p["LONGITUDE"], p["LATITUDE"]
        in_region = any(b[0] <= lon <= b[2] and b[1] <= lat <= b[3] for b in boxen)
        if (in_region and pop >= 100000) or pop >= 1000000:
            land = p.get("ADM0NAME") or ""
            aus.append([p.get("NAME_DE") or p["NAME"], laender.get(land, land), round(lon, 3), round(lat, 3), int(pop)])
    aus.sort(key=lambda x: -x[4])
    schreiben_json = WURZEL / "staedte.json"
    schreiben_json.write_text(json.dumps({
        "quelle": "Natural Earth, ne_10m_populated_places (gemeinfrei). Einwohnerzahl ist der größte Schätzwert (POP_MAX) für Stadt und Umland, Stand der Datei (um 2010 bis 2020). Näherung.",
        "spalten": ["Name", "Land", "Länge", "Breite", "Einwohner"], "staedte": aus}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("Städte:", len(aus), schreiben_json.stat().st_size // 1024, "KB")


def main():
    args = sys.argv[1:]
    if "staedte" in args:
        WURZEL.mkdir(parents=True, exist_ok=True)
        staedte()
        args = [a for a in args if a != "staedte"]
        if not args and len(sys.argv) > 1:
            return
    wahl = args or [r[0] for r in REGIONEN]
    idx_pfad = WURZEL / "index.json"
    alt = {}
    if idx_pfad.exists():
        alt = {r["id"]: r for r in json.loads(idx_pfad.read_text(encoding="utf-8"))["regionen"]}
    for r in REGIONEN:
        if r[0] in wahl:
            alt[r[0]] = rechne(*r)
    regionen = [dict(alt[r[0]], hinweis=HINWEISE.get(r[0], "")) for r in REGIONEN if r[0] in alt]
    idx_pfad.write_text(json.dumps({
        "quelle": "Höhenmodelle: Terrarium-Kacheln (Mapzen/Tilezen, Amazon Open Data, u. a. SRTM, ETOPO1, GMTED) und Copernicus DEM GLO-30 (Copernicus, Amazon Open Data, Median je Gitterzelle). Küstenlinie: Natural Earth (gemeinfrei). Berechnung: tools/hoehe-holen.py",
        "hinweis": "Senkrechte Genauigkeit des Höhenmodells im Bereich mehrerer Meter, Bäume und Gebäude enthalten, Deiche und Pumpen nicht erfasst. Größenordnung, keine Prognose.",
        "regionen": regionen}, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
