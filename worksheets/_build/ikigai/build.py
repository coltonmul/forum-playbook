#!/usr/bin/env python3
"""Ikigai Worksheet, 11x17 landscape, in the Forum Playbook document class.

Rebuilt 2026-10-31 from Colton's 2023 tabloid sheet (laid out by Joy Hugick in the ForumSherpa
template, "Adapted by Colton Mulligan, building on the work of many others"). Same eight prompts
and the same four-circle diagram; Forum Playbook chrome, tokens and type per
templates/TEMPLATE-CONTRACT.md (section 13, the document class), footer per contract v1.3.

Run: python3 worksheets/_build/ikigai/build.py
Writes worksheets/_build/ikigai/ikigai-worksheet.html, then worksheets/ikigai-worksheet-11x17.pdf
and a PNG preview beside it, with headless Chrome.

Changelog
  1.0.0 (2026-10-31) first Forum Playbook edition (v1.0 on the sheet).
"""
import os, subprocess, functools

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT_PDF = os.path.join(REPO, 'worksheets', 'ikigai-worksheet-11x17.pdf')
OUT_PNG = os.path.join(REPO, 'worksheets', 'ikigai-worksheet-11x17.png')
ICON_PY = os.path.expanduser('~/Sites/brand-assets/icons/icon.py')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
VERSION, UPDATED = 'v1.0', 'October 2026'


@functools.lru_cache(maxsize=None)
def ic(name, size=22):
    return subprocess.check_output(['python3', ICON_PY, 'svg', name, '--weight', 'thin', '--size', str(size)],
                                   cwd=os.path.dirname(ICON_PY)).decode().strip()


# the eight prompts: (grid area, icon, head, sub, numbered lines)
PROMPTS = [
    ('a', 'game-controller', 'What do you enjoy doing?', 'Hobbies, recreation', 0),
    ('b', 'toolbox', 'List your most valuable skill sets.', '', 0),
    ('c', 'briefcase', 'What do you enjoy doing professionally?', '', 0),
    ('d', 'chat-circle-text', 'What are the most meaningful compliments you receive?', '', 0),
    ('e', 'hand-heart', 'What acts of service give you a sense of joy or pride?', '', 0),
    ('f', 'clock', 'If you had 1 more hour in your day, what would you do?', '', 0),
    ('g', 'list-checks', 'What specific actions can you take to enrich your ikigai?', '', 3),
    ('h', 'users-three', 'How can the forum support you?', '', 3),
]


def card(area, icon, head, sub, lines):
    sub_html = f'<div class="sub">{sub}</div>' if sub else ''
    nums = ''.join(f'<div class="num">{i}.</div>' for i in range(1, lines + 1))
    nums_html = f'<div class="nums">{nums}</div>' if lines else ''
    return (f'<section class="card" style="grid-area:{area}"><div class="head">{ic(icon)}<h2>{head}</h2></div>'
            f'{sub_html}{nums_html}</section>')


# four-circle diagram, viewBox in hundredths of an inch
CX, CY, D, R = 370, 335, 108, 172
CIRCLES = {'love': (CX, CY - D), 'good': (CX - D, CY), 'needs': (CX + D, CY), 'paid': (CX, CY + D)}
TINT = {'passion': '#FBE3D8', 'mission': '#D9ECEC', 'profession': '#ECE6DA', 'vocation': '#F7E9C9'}


def venn():
    c = CIRCLES
    defs = ''.join(f'<clipPath id="c-{k}"><circle cx="{x}" cy="{y}" r="{R}"/></clipPath>' for k, (x, y) in c.items())

    def lens(a, b, fill):
        x, y = c[b]
        return f'<g clip-path="url(#c-{a})"><circle cx="{x}" cy="{y}" r="{R}" fill="{fill}"/></g>'
    # the centre (all four) stays white so IKIGAI reads on its own
    centre = ('<g clip-path="url(#c-love)"><g clip-path="url(#c-paid)"><g clip-path="url(#c-good)">'
              f'<circle cx="{c["needs"][0]}" cy="{c["needs"][1]}" r="{R}" fill="#FFFFFF"/></g></g></g>')
    rings = ''.join(f'<circle cx="{x}" cy="{y}" r="{R}" fill="none" stroke="#0E0E0C" stroke-width="1.4"/>' for x, y in c.values())

    def t(x, y, lines, cls):
        sp = ''.join(f'<tspan x="{x}" dy="{0 if i == 0 else "1.15em"}">{s}</tspan>' for i, s in enumerate(lines))
        return f'<text x="{x}" y="{y}" class="{cls}">{sp}</text>'
    labels = (t(CX, CY - D - 92, ['WHAT YOU', 'LOVE'], 'ring') + t(CX - D - 92, CY - 12, ['WHAT YOU', 'ARE', 'GOOD AT'], 'ring')
              + t(CX + D + 92, CY - 12, ['WHAT THE', 'WORLD', 'NEEDS'], 'ring') + t(CX, CY + D + 86, ['WHAT YOU GET', 'PAID FOR'], 'ring')
              + t(CX - 88, CY - 80, ['PASSION'], 'zone') + t(CX + 88, CY - 80, ['MISSION'], 'zone')
              + t(CX - 88, CY + 98, ['PROFESSION'], 'zone') + t(CX + 88, CY + 98, ['VOCATION'], 'zone')
              + t(CX, CY + 9, ['IKIGAI'], 'core'))
    # corner notes with leader lines into each lens
    notes = [((18, 34), ['PASSION', 'Satisfaction, but', 'feelings of uselessness'], (CX - 122, CY - 122), 'start'),
             ((722, 34), ['MISSION', 'Delight and fullness,', 'but not wealth'], (CX + 122, CY - 122), 'end'),
             ((18, 548), ['PROFESSION', 'Unique skills, training', 'and expertise; less', 'fulfilling, less joy'], (CX - 122, CY + 122), 'start'),
             ((722, 548), ['VOCATION', 'What you are suited for;', 'may not be as unique', 'or profitable'], (CX + 122, CY + 122), 'end')]
    note_svg = ''
    for (x, y), lines, (tx, ty), anchor in notes:
        sp = ''.join(f'<tspan x="{x}" dy="{0 if i == 0 else "1.3em"}" class="{"nh" if i == 0 else "nb"}">{s}</tspan>'
                     for i, s in enumerate(lines))
        note_svg += f'<text x="{x}" y="{y}" text-anchor="{anchor}">{sp}</text>'
        lx = x + (150 if anchor == 'start' else -150)
        ly = y + (60 if y < 300 else -22)
        note_svg += (f'<path d="M{lx} {ly} L{tx} {ty}" fill="none" stroke="#4A4038" stroke-width="0.8"/>'
                     f'<circle cx="{tx}" cy="{ty}" r="4" fill="#0E0E0C"/>')
    return (f'<svg class="venn" viewBox="0 0 740 670" role="img" aria-label="Ikigai diagram: what you love, what you are good at, '
            f'what the world needs and what you get paid for, overlapping in passion, mission, profession and vocation, with ikigai at the centre">'
            f'<defs>{defs}</defs>{lens("love", "good", TINT["passion"])}{lens("love", "needs", TINT["mission"])}'
            f'{lens("good", "paid", TINT["profession"])}{lens("needs", "paid", TINT["vocation"])}{centre}{rings}{labels}{note_svg}</svg>')


CSS = r'''
:root { --pitch:#0E0E0C; --burn:#E8521A; --brick:#B83A14; --teal:#3A8A8A; --linen:#F0EBE0; --dust:#C4B8A8;
  --deep-dust:#4A4038; --card-border:#D4CCC0;
  --chrome: Consolas, 'Menlo', 'Courier New', monospace; --display:'Big Shoulders Display','Arial Narrow',sans-serif;
  --body:'Roboto',Arial,sans-serif; }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { background:#8B8880; }
body { font-family:var(--body); color:var(--pitch); }
/* 11x17 landscape: same chrome bands (0.492in) and side margins (0.875in) as the letter class */
@page { size:17in 11in; margin:0; }
.page { width:17in; height:11in; background:#fff; margin:24px auto; padding:0.492in 0.875in; box-shadow:0 6px 28px rgba(0,0,0,.35);
  display:flex; flex-direction:column; overflow:hidden; }
@media print { html,body{background:#fff} .page{margin:0;box-shadow:none} .print-btn{display:none} }
.doc-header { font-family:var(--chrome); white-space:nowrap; line-height:1; flex:0 0 auto; }
.h-mark{font-size:8pt;color:var(--burn)} .h-name{font-size:8pt;font-weight:700;color:var(--pitch)} .h-gap{font-size:5.5pt;color:var(--dust)}
.h-cat{font-size:6pt;font-weight:700;color:var(--burn)} .h-sep{font-size:6pt;color:var(--dust)} .h-doc{font-size:5.5pt;color:var(--dust)}
.h-title{font-size:6pt;font-weight:700;color:var(--pitch)} .h-ver{font-size:6pt;font-weight:700;color:var(--pitch)} .h-meta{font-size:6.5pt;color:var(--dust)}
.doc-footer { font-family:var(--chrome); white-space:nowrap; line-height:1; flex:0 0 auto; display:flex; align-items:baseline; justify-content:space-between; }
.f-mark{font-size:7pt;color:var(--burn)} .f-name{font-size:7pt;font-weight:700;color:var(--pitch)}
.f-tag{font-size:6pt;color:var(--deep-dust)} .f-url{font-size:6.5pt;color:var(--deep-dust)} .f-url a{color:inherit;text-decoration:none}
.print-btn{position:fixed;top:16px;right:16px;z-index:10;font-family:var(--chrome);font-size:12px;font-weight:700;letter-spacing:.08em;
  background:var(--burn);color:#fff;border:0;padding:14px 20px;min-height:44px;cursor:pointer}
.print-btn:hover{background:var(--brick)}
.doc-body { flex:1 1 auto; display:flex; flex-direction:column; margin:0.133in 0 0.12in; overflow:hidden; }
.title { display:flex; align-items:baseline; gap:18pt; margin-top:18pt; margin-bottom:10pt; }
h1 { font-family:var(--display); font-weight:900; text-transform:uppercase; font-size:30pt; line-height:1; letter-spacing:-0.5px; }
.intro { font-size:11pt; line-height:1.35; color:var(--deep-dust); max-width:7.6in; }
.byline { font-family:var(--chrome); font-size:7pt; color:var(--deep-dust); margin-left:auto; white-space:nowrap; }
.grid { flex:1 1 auto; min-height:0; display:grid; gap:10pt;
  grid-template-columns: repeat(4, minmax(0,1fr)); grid-template-rows: 2.05in minmax(0,1fr) minmax(0,1fr);
  grid-template-areas: "a b c d" "e v v g" "f v v h"; }
.card { position:relative; border:0.5px solid var(--card-border); background:#fff; padding:8pt 10pt; display:flex; flex-direction:column; }
.card::before { content:''; position:absolute; top:-1px; left:-1px; width:12px; height:12px;
  border-top:1px solid var(--burn); border-left:1px solid var(--burn); }
.card::after { content:''; position:absolute; bottom:-1px; right:-1px; width:12px; height:12px;
  border-bottom:1px solid var(--dust); border-right:1px solid var(--dust); }
.head { display:flex; align-items:flex-start; gap:6pt; color:var(--pitch); }
.head svg { flex:0 0 auto; margin-top:1pt; color:var(--deep-dust); }
h2 { font-family:var(--display); font-weight:700; text-transform:uppercase; font-size:15pt; line-height:1.05; letter-spacing:.02em; color:var(--pitch); }
.sub { font-size:9.5pt; color:var(--deep-dust); margin:2pt 0 0 28pt; }
.nums { flex:1 1 auto; display:flex; flex-direction:column; justify-content:space-around; padding:6pt 0 2pt 28pt; }
.num { font-weight:700; font-size:10.5pt; color:var(--brick); }
.diagram { grid-area:v; min-height:0; display:flex; align-items:center; justify-content:center; }
.venn { width:100%; height:100%; }
.venn text { font-family:var(--body); fill:var(--pitch); }
.venn .ring, .venn .zone, .venn .core { text-anchor:middle; }
.venn .ring { font-size:15px; font-weight:400; letter-spacing:.04em; }
.venn .zone { font-family:var(--display); font-weight:700; font-size:22px; letter-spacing:.04em; }
.venn .core { font-family:var(--display); font-weight:900; font-size:30px; letter-spacing:.05em; fill:var(--brick); }
.venn .nh { font-family:var(--display); font-weight:700; font-size:18px; letter-spacing:.04em; fill:var(--pitch); }
.venn .nb { font-size:13.5px; fill:var(--deep-dust); }
'''


def page():
    header = ('<header class="doc-header"><span class="h-mark">⎇ </span><span class="h-name">FORUM PLAYBOOK</span>'
              '<span class="h-gap">&nbsp;&nbsp;&nbsp;</span><span class="h-cat">[ RETREAT TOOLS ]</span>'
              '<span class="h-sep">&nbsp;&nbsp;│&nbsp;&nbsp;</span><span class="h-doc">DOCUMENT&nbsp;&nbsp;</span>'
              '<span class="h-title">IKIGAI WORKSHEET</span>'
              f'<span class="h-sep">&nbsp;&nbsp;│&nbsp;</span><span class="h-ver">{VERSION}&nbsp;</span>'
              f'<span class="h-sep">│&nbsp;</span><span class="h-meta">Updated: {UPDATED}&nbsp;</span>'
              '<span class="h-sep">│&nbsp;</span><span class="h-meta">ForumPlaybook.com</span></header>')
    footer = ('<footer class="doc-footer"><span><span class="f-mark">⎇ </span><span class="f-name">FORUM PLAYBOOK&nbsp;&nbsp;</span>'
              '<span class="f-tag">The operating system and tools to make Forum easy and awesome.</span></span>'
              '<span class="f-url"><a href="https://builtbycolton.com">builtbycolton.com</a>&nbsp;/&nbsp;'
              '<a href="https://forumplaybook.com">forumplaybook.com</a></span></footer>')
    cards = ''.join(card(*p) for p in PROMPTS)
    body = (f'<main class="doc-body"><div class="title"><h1>Ikigai</h1>'
            '<p class="intro">Answer the eight prompts first. Then look at the circles: your ikigai sits where what you love, '
            'what you are good at, what the world needs and what you get paid for meet.</p>'
            '<span class="byline">Adapted by Colton Mulligan, building on the work of many others.</span></div>'
            f'<div class="grid">{cards}<div class="diagram">{venn()}</div></div></main>')
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ikigai Worksheet {VERSION} | Forum Playbook</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">PRINT / SAVE PDF</button>
<div class="page">
{header}
{body}
{footer}
</div>
</body>
</html>
'''


def main():
    html_path = os.path.join(HERE, 'ikigai-worksheet.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(page())
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=8000',
                    f'--print-to-pdf={OUT_PDF}', f'file://{html_path}'], stderr=subprocess.DEVNULL, check=True)
    subprocess.run(['pdftoppm', '-r', '60', '-png', '-singlefile', OUT_PDF, OUT_PNG[:-4]], check=True)
    print('wrote', OUT_PDF)


if __name__ == '__main__':
    main()
