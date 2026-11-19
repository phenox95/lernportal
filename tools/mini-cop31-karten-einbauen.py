"""Setzt arbeitsblatt-1.pdf aus Seite 1 und 2 (tools/.ab-druck.pdf) und der Rollenkarten-Seite (tools/.rollenkarten.pdf) zusammen.
Ablauf: node tools/mini-cop31-rollenmappe.js  (Mappe und .rollenkarten.pdf)
        node tools/mini-cop31-arbeitsblaetter.js  (.ab-druck.pdf und arbeitsblatt-handy.pdf)
        python3 tools/mini-cop31-karten-einbauen.py"""
from pypdf import PdfReader, PdfWriter
import os
d='geografie/klasse-9/klimawandel/mini-cop31/arbeitsblatt-1.pdf'
a=PdfReader('tools/.ab-druck.pdf'); k=PdfReader('tools/.rollenkarten.pdf')
w=PdfWriter()
for pg in a.pages: w.add_page(pg)
w.add_page(k.pages[0])
w.add_metadata({'/Title':'Mini-COP31: Arbeitsblatt und Rollenkarten'})
w.write(d)
os.remove('tools/.ab-druck.pdf'); os.remove('tools/.rollenkarten.pdf'); print('ok', len(w.pages),'Seiten')
