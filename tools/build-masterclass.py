#!/usr/bin/env python3
"""build-masterclass.py: builds forumplaybook.com/masterclass/ ("Forum Masterclass"), the page forummasterclass.com forwards to.
VERSION 1.0.0 (2026-11-16)

  python3 tools/build-masterclass.py

Reads masterclass/_src/index.html and masterclass/data/photos.json, puts in the Phosphor icons (brand-assets/icons/icon.py,
light weight), the hero mosaic, the slotted photos and the photo strip, the table drawing, the structured data for search,
the footer page list (SITE_PAGES in build-catalyst.py, the one canonical list) and the visitor counter, stamps the page,
and guards against em dashes, leftover tokens, promise words (NO PROMISES IN PUBLIC COPY) and failed contrast pairs.
To swap a photo, edit photos.json and rebuild; the changelog stays here and in CHANGELOG.md, never on the page.

Changelog
  1.0.0  First version, from Colton's ask of 2026-11-16: a landing page for forummasterclass.com, connected to
         forumplaybook.com, laying out the program (optional moderator dinner or happy hour the night before, a
         chapter-wide masterclass, and a connection exercise that uses what part two taught) for a retreat, an annual
         meeting or its own day; group photos and selfies with chapters, forums and trainers. Live and indexed at his word.
"""
import html, importlib.util, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("bc", os.path.join(ROOT, "tools", "build-catalyst.py"))
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)
_icon = bc._icon

VERSION = "1.0.0"
D = os.path.join(ROOT, "masterclass")
STAMP = subprocess.check_output(["date", "+Updated %a / %Y-%m-%d / %-I:%M %p CT"], text=True).strip()
photos = json.load(open(os.path.join(D, "data", "photos.json")))

def esc(s): return html.escape(str(s or ""), quote=True)

def icon(name, cls="i", size=20):
    return _icon.inline_svg(name, weight="light", size=size).replace('<svg class="icon ', f'<svg class="{cls} icon ', 1)

def fig(p, cls="pic", lazy=True):
    load = ' loading="lazy"' if lazy else ' fetchpriority="high"'
    return (f'<figure class="{cls}"><img src="{esc(p["src"])}" alt="{esc(p["alt"])}" width="{p["w"]}" height="{p["h"]}"{load}>'
            f'<figcaption>{esc(p["caption"])}</figcaption></figure>')

def slot(name):
    for p in photos:
        if p.get("slot") == name: return p
    sys.exit("photos.json has no slot " + name)

# the table: a moderator and five members, each seat a different forum
SEATS = [("#E8521A", "Moderator"), ("#3A8A8A", "Forum 3"), ("#2A6E9A", "Forum 7"), ("#C9C2B6", "Forum 12"), ("#D98A5E", "Forum 14"), ("#6FB3B3", "Forum 21")]
def table_svg():
    import math
    cx, cy, R = 210, 200, 120
    out = ['<svg viewBox="0 0 420 410" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
           f'<circle cx="{cx}" cy="{cy}" r="78" fill="#26241F" stroke="#3A3833" stroke-width="2"/>',
           f'<text x="{cx}" y="{cy-6}" text-anchor="middle" font-family="DM Mono, monospace" font-size="13" letter-spacing="1.5" fill="#C9C2B6">ONE TABLE</text>',
           f'<text x="{cx}" y="{cy+16}" text-anchor="middle" font-family="DM Mono, monospace" font-size="13" letter-spacing="1.5" fill="#C9C2B6">6 FORUMS</text>']
    for i, (col, label) in enumerate(SEATS):
        a = -math.pi / 2 + i * 2 * math.pi / len(SEATS)
        x, y = cx + R * math.cos(a), cy + R * math.sin(a)
        ring = f'<circle cx="{x:.1f}" cy="{y:.1f}" r="34" fill="none" stroke="#F0EBE0" stroke-width="2" stroke-dasharray="4 5"/>' if i == 0 else ""
        lx, ly = cx + (R + 58) * math.cos(a), cy + (R + 58) * math.sin(a) + 5
        out.append(f'<g class="seat" style="transition-delay:{i*90}ms">{ring}<circle cx="{x:.1f}" cy="{y:.1f}" r="26" fill="{col}"/>'
                   f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="middle" font-family="DM Mono, monospace" font-size="13" fill="#F0EBE0">{label}</text></g>')
    out.append("</svg>")
    return "".join(out)

JSONLD = {
    "@context": "https://schema.org",
    "@graph": [
        {"@type": "WebPage", "@id": "https://forumplaybook.com/masterclass/", "url": "https://forumplaybook.com/masterclass/",
         "name": "Forum Masterclass for EO chapters and forums", "isPartOf": {"@type": "WebSite", "name": "Forum Playbook", "url": "https://forumplaybook.com/"},
         "primaryImageOfPage": "https://forumplaybook.com/masterclass/og.png"},
        {"@type": "Service", "name": "Forum Masterclass", "url": "https://forumplaybook.com/masterclass/",
         "serviceType": "Chapter-wide forum training for peer advisory groups",
         "description": "An optional moderator dinner the night before, a chapter-wide masterclass on the tools and best practices of forum, and a connection exercise in mixed tables that uses those tools. Runs inside a chapter retreat, with an annual meeting, or as its own day.",
         "audience": {"@type": "Audience", "audienceType": "Entrepreneurs' Organization chapters, forum moderators and forum members"},
         "provider": {"@type": "Person", "name": "Colton Mulligan", "jobTitle": "EO forum trainer", "url": "https://builtbycolton.com",
                      "memberOf": {"@type": "Organization", "name": "EO Nashville"}}},
    ],
}

src = open(os.path.join(D, "_src", "index.html")).read()
s = re.sub(r"\{\{ICONL:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1), "il", 40), src)
s = re.sub(r"\{\{ICON:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1)), s)
s = s.replace("{{MOSAIC}}", "\n      ".join(fig(slot(k), "m", lazy=False) for k in ("hero-a", "hero-b", "hero-c")))
s = re.sub(r"\{\{PHOTO:([a-z-]+)\}\}", lambda m: fig(slot(m.group(1))), s)
s = s.replace("{{STRIP}}", "\n      ".join(fig(p, "s") for p in photos if p.get("strip")))
s = s.replace("{{TABLE_SVG}}", table_svg())
s = s.replace("{{JSONLD}}", json.dumps(JSONLD, separators=(",", ":")))
s = s.replace("{{FAVICON}}", _icon.data_uri(_icon.favicon_svg("chalkboard-teacher", "light")))
s = s.replace("{{STAMP}}", STAMP).replace("{{STAMPDATE}}", STAMP.replace("Updated ", "")).replace("{{VERSION}}", VERSION)
s = re.sub(r'<nav class="cfoot-nav".*?</nav>', bc.footer_nav("/masterclass/"), s, count=1, flags=re.S)
s = s.replace("</body>", bc.COUNTER + "\n</body>", 1)

# ---------- guards ----------
if "\u2014" in s: sys.exit("guard failed: em dash")
left = re.findall(r"\{\{[^}]*\}\}", s)
if left: sys.exit("guard failed: leftover tokens " + ", ".join(left[:5]))
PROMISES = ["guarantee", "never ", "always ", "forever", "100%", "we will ", "you will ", "promise"]
text = re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s, flags=re.S))
hits = [w for w in PROMISES if w in text.lower()]
if hits: sys.exit("guard failed: promise words " + ", ".join(hits))

def lum(h):
    h = h.lstrip("#"); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la + 0.05) / (lb + 0.05)
# (foreground, background, minimum, what): reading text 7:1, other text 4.5:1
PAIRS = [("#0E0E0C", "#F0EBE0", 7, "body text"), ("#4A4038", "#F0EBE0", 7, "quiet text"), ("#4A4038", "#E8E2D6", 7, "quiet text on alt"),
         ("#B83A14", "#F0EBE0", 4.5, "section numbers"), ("#F0EBE0", "#0E0E0C", 7, "text on dark"), ("#C9C2B6", "#0E0E0C", 7, "quiet on dark"),
         ("#C9C2B6", "#1A1916", 7, "quiet in panels"), ("#E8521A", "#0E0E0C", 4.5, "burn labels on dark"), ("#E8521A", "#1A1916", 4.5, "burn labels in panels"),
         ("#0E0E0C", "#E8521A", 4.5, "button text"), ("#0E0E0C", "#F8DCCF", 7, "text on burn tint"), ("#0E0E0C", "#D3E8E8", 7, "text on teal tint"),
         ("#0E0E0C", "#D6E4EF", 7, "text on blue tint"), ("#4A4038", "#F8DCCF", 4.5, "labels on burn tint"), ("#4A4038", "#D3E8E8", 4.5, "labels on teal tint"),
         ("#4A4038", "#D6E4EF", 4.5, "labels on blue tint"), ("#9E3110", "#F8DCCF", 4.5, "times on burn tint"), ("#1F5A80", "#F0EBE0", 4.5, "links"),
         ("#9CC9E8", "#0E0E0C", 4.5, "links on dark"), ("#FFFFFF", "#000000", 7, "captions on photo shade"), ("#F0EBE0", "#1A1916", 7, "form text"),
         ("#9A948A", "#1A1916", 4.5, "form placeholder"), ("#C9C2B6", "#26241F", 7, "calculator labels"), ("#F26B35", "#26241F", 4.5, "calculator numbers"),
         ("#8A8478", "#1A1916", 3, "form field edges"), ("#1F6464", "#D3E8E8", 3, "teal icons")]
bad = [f"{w} {a} on {b} {ratio(a, b):.2f}:1 < {m}" for a, b, m, w in PAIRS if ratio(a, b) < m]
if bad: sys.exit("guard failed: contrast\n  " + "\n  ".join(bad))

open(os.path.join(D, "index.html"), "w").write(s)
print("built masterclass/index.html", STAMP, "| photos:", len(photos), "| contrast pairs passed:", len(PAIRS))
