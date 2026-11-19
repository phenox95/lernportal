"""Ersetzt Seite 3 (Rollenkarten) von arbeitsblatt-1.pdf durch die Seite aus tools/.rollenkarten.pdf.
Ablauf: node tools/mini-cop31-rollenmappe.js  (erzeugt Mappe und tools/.rollenkarten.pdf), dann dieses Skript."""
from pypdf import PdfReader, PdfWriter
import os
d='geografie/klasse-9/klimawandel/mini-cop31/arbeitsblatt-1.pdf'
r=PdfReader(d); k=PdfReader('tools/.rollenkarten.pdf')
w=PdfWriter(); w.add_page(r.pages[0]); w.add_page(r.pages[1]); w.add_page(k.pages[0])
w.add_metadata(r.metadata or {})
w.write(d+'.neu'); os.replace(d+'.neu',d); os.remove('tools/.rollenkarten.pdf'); print('ok')
