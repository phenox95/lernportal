#!/usr/bin/env python3
"""Foto für den Impuls der Woche vorbereiten: 16:9, WebP unter ca. 150 KB, Quellenzeile.

Aus Wikimedia Commons (nur CC0, gemeinfrei, CC BY, CC BY-SA; nur 2 Anfragen je Bild):
  python3 tools/foto.py commons "Heimeier-Thermostat-1283675.jpg" assets/img/impuls/2026-12-14-heizen.webp --fokus 0.5,0.4

Eigene oder zugeschickte Datei:
  python3 tools/foto.py lokal bild.jpg assets/img/impuls/2026-11-16-impfen.webp --urheber "Name" --lizenz "CC BY 4.0" --quelle "Wikimedia Commons (Datei.jpg)"

--fokus x,y (0..1) legt fest, welcher Bildpunkt im Ausschnitt in der Mitte liegen soll (Standard 0.5,0.5).
--zoom z (>=1) schneidet enger zu (Standard 1). Ausgabe: Zeilen für impuls.json (bild, bildQuelle).
Bei HTTP 429 sofort abbrechen und nicht wiederholen: Wikimedia drosselt sonst länger.
"""
import argparse, hashlib, json, os, re, subprocess, sys, tempfile, urllib.parse
from PIL import Image

UA = "User-Agent: lernportal-schulprojekt/1.0 (Unterrichtsmaterial; github.com/phenox95/lernportal)"
ERLAUBT = re.compile(r"^(CC0.*|Public domain.*|PD.*|CC BY( |-)?\d\.\d.*|CC BY-SA \d\.\d.*)$", re.I)
ZIEL_KB = 150


def curl(url, out=None):
    """Lädt eine URL (Text oder Datei). Bei 429 sofort abbrechen."""
    cmd = ["curl", "-sS", "-m", "120", "-H", UA, "-w", "\n%{http_code}"]
    if out:
        cmd += ["-o", out]
    r = subprocess.run(cmd + [url], capture_output=True, text=True)
    body, _, code = r.stdout.rpartition("\n")
    code = code.strip()
    if code == "429":
        sys.exit("Wikimedia antwortet 429 (zu viele Anfragen). Nicht wiederholen, später erneut versuchen.")
    if code != "200":
        sys.exit(f"HTTP {code} für {url[:90]} {r.stderr[:120]}")
    return body


def commons_meta(titel):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "extmetadata|url|size",
                                "titles": "File:" + titel})
    d = json.loads(curl("https://commons.wikimedia.org/w/api.php?" + q))
    seite = next(iter(d["query"]["pages"].values()))
    if "imageinfo" not in seite:
        sys.exit("Datei nicht gefunden: " + titel)
    info = seite["imageinfo"][0]
    m = info.get("extmetadata", {})
    g = lambda k: re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", m.get(k, {}).get("value", ""))).strip()
    return {"lizenz": g("LicenseShortName"), "urheber": g("Artist"), "nonfree": g("NonFree"), "url": info["url"],
            "breite": info.get("width"), "hoehe": info.get("height"), "titel": seite["title"].replace("File:", "")}


def zuschneiden(pfad_in, pfad_out, fokus, zoom):
    im = Image.open(pfad_in).convert("RGB")
    w, h = im.size
    cw = w / zoom
    ch = cw * 9 / 16
    if ch > h / zoom * 1.0001 and ch > h:
        ch = h
        cw = ch * 16 / 9
    cw, ch = min(cw, w), min(ch, h)
    fx, fy = fokus
    x0 = max(0, min(w - cw, fx * w - cw / 2))
    y0 = max(0, min(h - ch, fy * h - ch / 2))
    c = im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch))).resize((1200, 675), Image.LANCZOS)
    os.makedirs(os.path.dirname(pfad_out) or ".", exist_ok=True)
    for q in range(80, 40, -4):
        c.save(pfad_out, "WEBP", quality=q, method=6)
        kb = os.path.getsize(pfad_out) / 1024
        if kb < ZIEL_KB:
            return q, kb
    return q, kb


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("modus", choices=["commons", "lokal"])
    ap.add_argument("quelle")
    ap.add_argument("ziel")
    ap.add_argument("--fokus", default="0.5,0.5")
    ap.add_argument("--zoom", type=float, default=1.0)
    ap.add_argument("--urheber")
    ap.add_argument("--lizenz")
    ap.add_argument("--herkunft", help="Text für die Quellenzeile, z. B. 'Wikimedia Commons (Datei.jpg)'")
    a = ap.parse_args()
    fokus = tuple(float(x) for x in a.fokus.split(","))
    if a.modus == "commons":
        m = commons_meta(a.quelle)
        if m["nonfree"] not in ("", "false") or not ERLAUBT.match(m["lizenz"] or ""):
            sys.exit(f"Lizenz nicht erlaubt oder unklar: „{m['lizenz']}“ (erlaubt: CC0, gemeinfrei, CC BY, CC BY-SA)")
        name = m["url"].rsplit("/", 1)[-1]
        tmp = os.path.join(tempfile.mkdtemp(), name)
        curl(m["url"], out=tmp)
        urheber, lizenz, herkunft = m["urheber"], m["lizenz"], f"Wikimedia Commons ({m['titel']})"
        quelle = tmp
    else:
        if not (a.urheber and a.lizenz):
            sys.exit("Für lokale Dateien --urheber und --lizenz angeben.")
        quelle, urheber, lizenz, herkunft = a.quelle, a.urheber, a.lizenz, a.herkunft or "eigene Datei"
    q, kb = zuschneiden(quelle, a.ziel, fokus, a.zoom)
    zeile = f"Foto: {urheber}, {lizenz}, {herkunft}, Ausschnitt"
    print(json.dumps({"bild": a.ziel, "bildQuelle": zeile}, ensure_ascii=False, indent=2))
    print(f"# {kb:.0f} KB (WebP-Qualität {q}). bildAlt selbst schreiben: beschreiben, was zu sehen ist.", file=sys.stderr)


if __name__ == "__main__":
    main()
