#!/usr/bin/env python3
"""Erzeugt assets/css/themenfarben.css: eine Tonlage je Themenfeld (Biologie und Geografie).
Aufruf: python3 tools/themenfarben.py  (aus dem Repository-Stamm).
Gleiche Sättigung und Helligkeit je Fach, nur der Farbton (Winkel) wechselt. Weiß auf der Hauptfarbe: Kontrast mindestens 5,6.
Zuordnung zur Seite: data-tf-fach und data-tf-nr (Symbole, Karten) oder body[data-tf="<slug>"] (Material und Präsentation)."""
import colorsys, json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
tfl = json.loads((root / "themenfelder.json").read_text(encoding="utf-8"))
TON = {  # Farbton (Grad) je Themenfeld-Ordner
 "Biologie": {"zelle": 158, "lebensraeume": 100, "stoffwechsel": 188, "sexualitaet": 338, "gesundheit": 208, "nervensystem": 245, "genetik": 275, "evolution": 30},
 "Geografie": {"risikoraeume": 12, "migration": 33, "vielfalt-der-erde": 78, "armut-reichtum": 320, "ressourcen": 196, "klimawandel": 355, "globalisierung": 262, "europa": 218}}
FIX = {}  # alle Themenfelder gleich berechnet, auch Zelle und Risikoräume
def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100); return tuple(round(x * 255) for x in (r, g, b))
hx = lambda t: "#%02X%02X%02X" % t
def lum(t):
    f = lambda c: c / 255 / 12.92 if c / 255 <= .03928 else ((c / 255 + .055) / 1.055) ** 2.4
    r, g, b = map(f, t); return .2126 * r + .7152 * g + .0722 * b
def kontrast(a, b): la, lb = lum(a), lum(b); return (max(la, lb) + .05) / (min(la, lb) + .05)
def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
out = ["/* Erzeugt von tools/themenfarben.py, nicht von Hand ändern. Eine Tonlage je Themenfeld, siehe docs/gestaltung.md. */"]
hell, dunkel = [], []
for fach in ("Biologie", "Geografie"):
    S = 38 if fach == "Biologie" else 34
    for t in tfl[fach]:
        slug, nr, h = t["slug"], t["nr"], TON[fach][t["slug"]]
        if (fach, slug) in FIX: g, dk, mint, grey, ink = FIX[(fach, slug)]
        else:
            L = 55
            while kontrast(hsl(h, S, L), (255, 255, 255)) < 5.6: L -= 1
            g, dk, mint, grey, ink = hx(hsl(h, S, L)), hx(hsl(h, S, max(L - 11, 12))), hx(hsl(h, 26, 94)), hx(hsl(h, 8, 38)), hx(hsl(h, 22, 12))
        tint, tink = hx(hsl(h, 30, 91)), dk
        dtint, dink, dacc, dhov, don = hx(hsl(h, 22, 22)), hx(hsl(h, 38, 76)), hx(hsl(h, 42, 72)), hx(hsl(h, 42, 80)), hx(hsl(h, 28, 12))
        sel = f'[data-tf-fach="{fach}"][data-tf-nr="{nr}"]'
        body = f'body[data-subject="{fach}"][data-tf="{slug}"]'
        out.append(f'{sel} {{ --tf-tint: {tint}; --tf-ink: {tink}; }}')
        out.append(f'{body} {{ --tf: {g}; --tf-g: {g}; --tf-dk: {dk}; --tf-mint: {mint}; --tf-grey: {grey}; --tf-ink0: {ink}; --g: {g}; --dk: {dk}; --mint: {mint}; --grey: {grey}; --ink: {ink}; --fach-rgb: {",".join(map(str, rgb(g)))}; --accent: {g}; --accent-2: {g}; --accent-hover: {dk}; --accent-ink: {g}; --fach-tint: {mint}; --lp-akzent: {g}; }}')
        for lst, pre in ((dunkel, ':root[data-theme="dark"] '), (hell, ':root[data-theme="auto"] ')):
            pass
        d = (f'{sel} {{ --tf-tint: {dtint}; --tf-ink: {dink}; }}',
             f'{body} {{ --tf: {dacc}; --accent: {dacc}; --accent-2: {dacc}; --accent-hover: {dhov}; --accent-ink: {dacc}; --on-accent: {don}; --fach-tint: {dtint}; --lp-akzent: {dacc}; }}')
        for rule in d:
            sel2, rest = rule.split(" {", 1)
            dunkel.append(f':root[data-theme="dark"] {sel2} {{{rest}')
            hell.append(f'  :root[data-theme="auto"] {sel2} {{{rest}')
            hell.append(f'  :root:not([data-theme]) {sel2} {{{rest}')
out += dunkel + ["@media (prefers-color-scheme: dark) {"] + hell + ["}"]
out.append('/* Themenfeld-Seite und Begriffe-Seite: Kopfzeile in der Farbe des Themenfelds */\nbody[data-subject][data-tf] .eyebrow::before { background: var(--tf); }\nbody[data-subject][data-tf] .fach-intro { background: var(--fach-tint); }\nbody[data-subject][data-tf] .fach-intro::after { background: var(--tf); }')
(root / "assets/css/themenfarben.css").write_text("\n".join(out) + "\n", encoding="utf-8")
print("geschrieben:", len(out), "Zeilen")
