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

Quellen (Lizenzen vor der Veröffentlichung lesen):
- Höhenkacheln: https://registry.opendata.aws/terrain-tiles/ (Terrarium-Format, enthält u. a. SRTM, ETOPO1, GMTED; Hinweise des Anbieters beachten)
- Küstenlinie: Natural Earth, gemeinfrei

Benötigt: numpy, scipy, pillow (pip install numpy scipy pillow). Aufruf: python3 tools/hoehe-holen.py [welt|<regions-id> ...]
Erlaubte Hosts: elevation-tiles-prod.s3.amazonaws.com, raw.githubusercontent.com
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

# id, Name, lon0, lat0 (Süd), lon1, lat1 (Nord), Auflösung in Grad, Zoom der Höhenkacheln, Küstenlinie
REGIONEN = [
    ("welt", "Weltkarte", -180.0, -60.0, 180.0, 84.0, 0.1, 4, "50m"),
    ("nordsee", "Nordsee: Niederlande und Norddeutschland", 3.0, 51.0, 10.5, 55.2, 0.005, 8, "10m"),
    ("bangladesch", "Bangladesch: Ganges-Brahmaputra-Delta", 87.0, 21.0, 93.0, 25.0, 0.005, 8, "10m"),
    ("nildelta", "Ägypten: Nildelta", 29.0, 30.0, 33.0, 32.0, 0.005, 8, "10m"),
    ("mekong", "Vietnam: Mekong-Delta", 104.5, 8.3, 108.0, 11.6, 0.005, 8, "10m"),
    ("florida", "USA: Südflorida", -83.0, 24.8, -79.3, 28.2, 0.005, 8, "10m"),
    ("venedig", "Italien: Venedig und Po-Ebene", 11.0, 44.0, 14.5, 46.0, 0.005, 8, "10m"),
    ("jangtse", "China: Jangtse-Delta und Shanghai", 119.5, 29.5, 123.5, 32.5, 0.005, 8, "10m"),
    ("mississippi", "USA: Mississippi-Delta", -92.5, 28.5, -88.0, 30.8, 0.005, 8, "10m"),
]


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


def rechne(rid, name, lon0, lat0, lon1, lat1, res, z, mass):
    print("→", rid, name, flush=True)
    e = hoehen(lon0, lat0, lon1, lat1, res, z)
    land = landmaske(lon0, lat0, lon1, lat1, res, mass)
    rot = ueberflutungshoehe(e, land)
    gruen = np.where(land, np.rint(255 * np.sqrt(np.clip(e, 0, 4000) / 4000.0)), 0).astype(np.uint8)
    blau = np.where(land, 255, 0).astype(np.uint8)
    bild = Image.fromarray(np.dstack([rot, gruen, blau]), "RGB")
    WURZEL.mkdir(parents=True, exist_ok=True)
    pfad = WURZEL / (rid + ".png")
    bild.save(pfad, optimize=True)
    print("   ", bild.size, pfad.stat().st_size // 1024, "KB; überflutet bis 10 m:", int(((rot > 0) & (rot < 255)).sum()), "Punkte", flush=True)
    return {"id": rid, "name": name, "lon0": lon0, "lat0": lat0, "lon1": lon1, "lat1": lat1, "breite": bild.size[0], "hoehe": bild.size[1], "aufloesung_grad": res}


def main():
    wahl = sys.argv[1:] or [r[0] for r in REGIONEN]
    idx_pfad = WURZEL / "index.json"
    alt = {}
    if idx_pfad.exists():
        alt = {r["id"]: r for r in json.loads(idx_pfad.read_text(encoding="utf-8"))["regionen"]}
    for r in REGIONEN:
        if r[0] in wahl:
            alt[r[0]] = rechne(*r)
    regionen = [alt[r[0]] for r in REGIONEN if r[0] in alt]
    idx_pfad.write_text(json.dumps({
        "quelle": "Höhenmodell: Terrarium-Kacheln (Mapzen/Tilezen, Amazon Open Data, u. a. SRTM, ETOPO1, GMTED), Küstenlinie: Natural Earth (gemeinfrei). Berechnung: tools/hoehe-holen.py",
        "hinweis": "Senkrechte Genauigkeit des Höhenmodells im Bereich mehrerer Meter, Bäume und Gebäude enthalten, Deiche und Pumpen nicht erfasst. Größenordnung, keine Prognose.",
        "regionen": regionen}, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
