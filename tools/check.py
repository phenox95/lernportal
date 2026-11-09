#!/usr/bin/env python3
"""Prüft Portal-Daten: projects.json, themenfelder.json, Pfade, Dateilisten.

Aufruf im Repo-Stamm:  python3 tools/check.py
Exit-Code 1 bei Fehlern, Warnungen brechen nicht ab.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FAEHER = {"Biologie", "Geografie", "Interaktiv"}
ARTEN = {"Präsentation", "Arbeitsblatt", "Übung", "Spiel", "Hilfe"}
fehler, warn = [], []


def err(m): fehler.append(m)
def wrn(m): warn.append(m)


def laden(name):
    try:
        return json.loads((ROOT / name).read_text(encoding="utf-8"))
    except Exception as e:
        err(f"{name}: nicht lesbar ({e})")
        return None


def pfad_ok(p):
    """Relativer Pfad ohne .., Datei oder Ordner mit index.html."""
    if p.startswith("https://"):
        return True
    if p.startswith("/") or ".." in p.split("/") or re.match(r"^[a-z]+:", p):
        return False
    ziel = ROOT / p
    return ziel.is_file() or (ziel.is_dir() and (ziel / "index.html").is_file())


projekte = laden("projects.json") or []
bne = laden("bne.json") or {}
bne_nrn = {z.get("nr") for z in bne.get("ziele", [])}
alle_pfade = {p.get("path") for p in projekte}
tf = laden("themenfelder.json") or {}
nummern = {f: {t["nr"] for t in tf.get(f, [])} for f in ("Biologie", "Geografie")}

gesehen = set()
for i, p in enumerate(projekte):
    n = f"projects.json[{i}] „{p.get('title', '?')}“"
    beispiel = p.get("status") == "Beispiel"
    melde = wrn if beispiel else err
    for f in ("title", "subject", "grade", "type", "path"):
        if not p.get(f):
            err(f"{n}: Pflichtfeld „{f}“ fehlt")
    if p.get("subject") and p["subject"] not in FAEHER:
        err(f"{n}: subject „{p['subject']}“ unbekannt")
    if p.get("grade") and not re.match(r"^Klasse \d+(/\d+)?$|^Verschiedene$", p["grade"]):
        err(f"{n}: grade „{p['grade']}“ hat nicht die Form „Klasse 8“ oder „Klasse 7/8“")
    pa = p.get("path", "")
    if pa:
        if pa in gesehen:
            err(f"{n}: path „{pa}“ doppelt")
        gesehen.add(pa)
        if not pa.endswith("/"):
            err(f"{n}: path muss mit / enden")
        if not pfad_ok(pa):
            melde(f"{n}: Ordner/index.html für „{pa}“ fehlt" + (" (Beispiel)" if beispiel else ""))
        m = re.match(r"^(biologie|geografie)/klasse-(\d+)/", pa)
        if m:
            if m.group(1) != (p.get("subject") or "").lower():
                err(f"{n}: Fach passt nicht zum Pfad „{pa}“")
            if m.group(2) not in re.findall(r"\d+", p.get("grade", "")):
                err(f"{n}: Klasse passt nicht zum Pfad „{pa}“")
        elif p.get("subject") in ("Biologie", "Geografie"):
            wrn(f"{n}: Pfad „{pa}“ folgt nicht <fach>/klasse-<n>/…")
        # Ordnerregel: <fach>/klasse-<n>/<themenfeld-slug>/…
        th0 = str(p.get("themenfeld") or "")
        if m and th0 in {t["nr"] for t in tf.get(p.get("subject"), [])}:
            slug = next(t["slug"] for t in tf[p["subject"]] if t["nr"] == th0)
            teile = pa.split("/")
            if len(teile) < 4 or teile[2] != slug:
                wrn(f"{n}: Pfad „{pa}“ sollte unter …/klasse-{m.group(2)}/{slug}/ liegen (Themenfeld {th0})")
    th = p.get("themenfeld")
    if th and re.match(r"^\d+\.\d+$", str(th)) and p.get("subject") in nummern:
        if th not in nummern[p["subject"]]:
            err(f"{n}: Themenfeld {th} steht nicht in themenfelder.json ({p['subject']})")
    if "folge" in p and (isinstance(p["folge"], bool) or not isinstance(p["folge"], (int, float))):
        err(f"{n}: folge muss eine Zahl sein")
    if "folge" in p and not p.get("reihe"):
        wrn(f"{n}: folge ohne reihe hat keine Wirkung")
    if p.get("datum") and not re.match(r"^\d{4}-\d{2}-\d{2}$", p["datum"]):
        err(f"{n}: datum nicht im Format JJJJ-MM-TT")
    # Querbezüge (optional): bne = Zielnummern 1–17, verweise = Pfade anderer Einträge
    b = p.get("bne")
    if b is not None:
        if not isinstance(b, list) or not all(isinstance(x, int) and 1 <= x <= 17 for x in b):
            err(f"{n}: bne muss eine Liste von Zahlen 1–17 sein")
        elif bne_nrn and not set(b) <= bne_nrn:
            err(f"{n}: bne enthält Ziele, die nicht in bne.json stehen")
    v = p.get("verweise")
    if v is not None:
        if not isinstance(v, list):
            err(f"{n}: verweise muss eine Liste sein")
        else:
            for k, x in enumerate(v):
                ziel = x if isinstance(x, str) else (x.get("pfad") if isinstance(x, dict) else None)
                if not ziel:
                    err(f"{n} verweise[{k}]: Pfad fehlt")
                elif ziel not in alle_pfade:
                    err(f"{n} verweise[{k}]: „{ziel}“ steht nicht in projects.json")
                elif ziel == p.get("path"):
                    err(f"{n} verweise[{k}]: Verweis auf sich selbst")
    for j, d in enumerate(p.get("dateien", [])):
        dn = f"{n} dateien[{j}] „{d.get('titel', '?')}“"
        for f in ("titel", "pfad", "art"):
            if not d.get(f):
                err(f"{dn}: Pflichtfeld „{f}“ fehlt")
        if d.get("art") and d["art"] not in ARTEN:
            wrn(f"{dn}: art „{d['art']}“ unbekannt (landet unter „Weitere“)")
        if d.get("stufe") not in (None, 1, 2, 3):
            err(f"{dn}: stufe muss 1, 2 oder 3 sein")
        if d.get("pfad") and not pfad_ok(d["pfad"]):
            melde(f"{dn}: Datei „{d['pfad']}“ fehlt oder Pfad unzulässig")
        if re.search(r"lrs", (d.get("titel", "") + d.get("pfad", "")), re.I):
            err(f"{dn}: Kennzeichnung „LRS“ in Titel/Dateiname nicht erlaubt")

eintraege = {p.get("path") for p in projekte}
for idx in ROOT.glob("*/klasse-*/**/index.html"):
    ordner = idx.parent.relative_to(ROOT).as_posix() + "/"
    if 'http-equiv="refresh"' in idx.read_text(encoding="utf-8", errors="ignore")[:800]:
        continue  # Weiterleitung von einer alten Adresse
    if any(e and (ordner.startswith(e) or e.startswith(ordner)) for e in eintraege):
        continue
    wrn(f"Ordner „{ordner}“ hat index.html, aber keinen Eintrag in projects.json")

for f, liste in tf.items():
    if f == "quelle":
        continue
    slugs = set()
    for t in liste:
        for k in ("nr", "titel", "klassen", "slug"):
            if not t.get(k):
                err(f"themenfelder.json {f} {t.get('nr', '?')}: „{k}“ fehlt")
        if t.get("slug") in slugs:
            err(f"themenfelder.json {f}: slug „{t['slug']}“ doppelt")
        slugs.add(t.get("slug"))

# Themenfeld-Verbindungen (optional): bezuege = [{fach, nr, grund}]
for f, liste in tf.items():
    if f == "quelle":
        continue
    for t in liste:
        for k, bz in enumerate(t.get("bezuege", [])):
            ok = isinstance(bz, dict) and bz.get("nr") in nummern.get(bz.get("fach"), set())
            if not ok:
                err(f"themenfelder.json {f} {t.get('nr')} bezuege[{k}]: Fach oder Nummer unbekannt")
            elif bz["fach"] == f and bz["nr"] == t["nr"]:
                err(f"themenfelder.json {f} {t.get('nr')} bezuege[{k}]: Verweis auf sich selbst")

vorkommen = {}
for ext in ("js", "css"):
    for f in ROOT.rglob(f"*.{ext}"):
        if ".git" in f.parts:
            continue
        vorkommen.setdefault(f.read_bytes(), []).append(f.relative_to(ROOT).as_posix())
for liste in vorkommen.values():
    if len(liste) > 1:
        wrn("Identische Dateien: " + ", ".join(liste))

# Impuls der Woche: Fotos (optional). Datei muss existieren, Beschreibung und Quelle sollen angegeben sein
impuls = laden("impuls.json") or {}
wochen = impuls.get("wochen") if isinstance(impuls.get("wochen"), list) else [impuls]
ohne_foto = 0
for w in wochen:
    wn = f"impuls.json „{w.get('frage', '?')[:40]}“"
    if not w.get("bild"):
        ohne_foto += 1
        continue
    b = w["bild"]
    if b.startswith("/") or ".." in b.split("/") or re.match(r"^[a-z]+:", b):
        err(f"{wn}: bild „{b}“ ist kein zulässiger relativer Pfad")
    elif not (ROOT / b).is_file():
        err(f"{wn}: Bilddatei „{b}“ fehlt")
    else:
        kb = (ROOT / b).stat().st_size / 1024
        if kb > 200:
            wrn(f"{wn}: Bild „{b}“ ist {kb:.0f} KB groß (Ziel: unter ca. 150 KB, WebP)")
        if not b.lower().endswith(".webp"):
            wrn(f"{wn}: Bild „{b}“ ist kein WebP")
    if not w.get("bildAlt"):
        wrn(f"{wn}: bildAlt fehlt (Beschreibung für Screenreader)")
    if not w.get("bildQuelle"):
        wrn(f"{wn}: bildQuelle fehlt (Urheber und Lizenz angeben)")
if ohne_foto:
    print(f"HINWEIS  Impuls der Woche: {ohne_foto} von {len(wochen)} Einträgen ohne Foto")

# Nachrichten (nachrichten.json): nur Verweise mit eigener Einordnung
nach = laden("nachrichten.json") or {}
woche_ab = {w.get("ab") for w in (impuls.get("wochen") or []) if isinstance(w, dict)}
links = set()
for i, n in enumerate(nach.get("eintraege", [])):
    nn = f"nachrichten.json[{i}] „{str(n.get('titel', '?'))[:40]}“"
    for f in ("datum", "titel", "quelle", "link"):
        if not n.get(f):
            err(f"{nn}: Pflichtfeld „{f}“ fehlt")
    if n.get("datum") and not re.match(r"^\d{4}-\d{2}-\d{2}$", n["datum"]):
        err(f"{nn}: datum nicht im Format JJJJ-MM-TT")
    if n.get("link"):
        if not n["link"].startswith("https://"):
            err(f"{nn}: link muss mit https:// beginnen")
        else:
            host = n["link"].split("/")[2].lower()
            host = host[4:] if host.startswith("www.") else host
            erlaubt = nach.get("erlaubteQuellen", [])
            if not any(host == q or host.endswith("." + q) for q in erlaubt):
                err(f"{nn}: Quelle „{host}“ steht nicht in erlaubteQuellen (nur seriöse Quellen)")
        if n["link"] in links:
            err(f"{nn}: link doppelt")
        links.add(n["link"])
    e = n.get("einordnung", "")
    if not e:
        wrn(f"{nn}: einordnung fehlt (ein bis zwei eigene Sätze)")
    elif len(e) > 320:
        wrn(f"{nn}: einordnung ist {len(e)} Zeichen lang (Ziel: höchstens 2 Sätze, Zitate vermeiden)")
    for f in n.get("faecher", []):
        if f not in ("Biologie", "Geografie"):
            err(f"{nn}: faecher „{f}“ unbekannt")
    b = n.get("bne", [])
    if not isinstance(b, list) or not all(isinstance(x, int) and 1 <= x <= 17 for x in b):
        err(f"{nn}: bne muss eine Liste von Zahlen 1–17 sein")
    if n.get("woche") and n["woche"] not in woche_ab:
        wrn(f"{nn}: woche „{n['woche']}“ steht nicht als ab-Datum in impuls.json")
    if not n.get("bne") and not n.get("woche"):
        wrn(f"{nn}: weder bne noch woche, wird nirgends angezeigt")

for m in warn:
    print("WARNUNG ", m)
for m in fehler:
    print("FEHLER  ", m)
print(f"\n{len(projekte)} Einträge geprüft: {len(fehler)} Fehler, {len(warn)} Warnungen")
sys.exit(1 if fehler else 0)
