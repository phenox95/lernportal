# Baut ../uebung/index.html aus template.html, daten.json und den Schriftdateien.
# Nutzung: python3 build.py (im Ordner quelle/)
import base64, json, pathlib
here = pathlib.Path(__file__).resolve().parent
b = lambda n: base64.b64encode((here / 'fonts' / n).read_bytes()).decode()
t = (here / 'template.html').read_text(encoding='utf-8')
d = json.dumps(json.loads((here / 'daten.json').read_text(encoding='utf-8')), ensure_ascii=False, indent=1).replace('</', '<\\/')
out = t.replace('__F400__', b('andika-latin-400-normal.woff2')).replace('__F700__', b('andika-latin-700-normal.woff2')).replace('__DATEN__', d)
(here.parent / 'uebung' / 'index.html').write_text(out, encoding='utf-8')
