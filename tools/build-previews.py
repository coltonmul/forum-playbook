#!/opt/homebrew/bin/python3
"""Page-one preview images for the homepage's featured cards (Preview button).

Renders page one of each on-site PDF below to /previews/<name>.png, so the in-page
preview needs no PDF plugin. Rerun after any of these PDFs changes:
    /opt/homebrew/bin/python3 tools/build-previews.py
Needs poppler's pdftoppm (brew install poppler) and Pillow.
Version 1.0.0 (2026-11-04).
"""
import pathlib, subprocess, sys, tempfile
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'previews'
LONG_EDGE = 1600  # px on the long side: sharp in a large overlay, light enough for a phone

PDFS = [
    'worksheets/5-percent-reflection-sheet.pdf',
    'worksheets/ikigai-worksheet-11x17.pdf',
    'one-pagers/4-hour-forum-meeting-blueprint-v1.0.pdf',
    'one-pagers/eq-vs-iq-topics-v1.0.pdf',
    'one-pagers/open-coaching-v4.0.pdf',
    'one-pagers/retreat-thirds-rule-v1.0.pdf',
]

def render(rel):
    src = ROOT / rel
    dest = OUT / (src.stem + '.png')
    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp) / 'p'
        subprocess.run(['pdftoppm', '-f', '1', '-l', '1', '-r', '220', '-png', '-singlefile',
                        str(src), str(base)], check=True)
        im = Image.open(str(base) + '.png').convert('RGB')
    scale = LONG_EDGE / max(im.size)
    if scale < 1:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    im = im.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    im.save(dest, optimize=True)
    print(f'{dest.relative_to(ROOT)}  {im.width}x{im.height}  {dest.stat().st_size // 1024} KB')

if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for rel in (sys.argv[1:] or PDFS):
        render(rel)
