#!/usr/bin/env python3
"""build-north-star.py: builds forumplaybook.com/facilitate/north-star/ (North Star, a retreat exercise). VERSION 1.0.0 (2026-11-14)

  python3 tools/build-north-star.py

Reads facilitate/north-star/_src/index.html and facilitate/north-star/photos.json, draws the icons with icon.py
(Phosphor, thin), writes the photo tiles, the footer page list (SITE_PAGES in build-catalyst.py, the one canonical
list) and the stamp, renders og.png from og.html with headless Chrome, prints the contrast table for the page's
color pairs, and guards against em dashes, leftover tokens and promise words (NO PROMISES IN PUBLIC COPY).

The member worksheet and the facilitator's guide are NOT in this repo (it is public). They live in the private
library at Projects/ForumPlaybook.com/north-star/ and the page links no PDF.

Changelog (the full history stays here and in CHANGELOG.md, never on the page)
  1.0.0  First version (Colton, 2026-11-14): the purpose with icons, the night step by step, photos from Telluride,
         what the forum takes home, and the booking line; linked from the North Star card on /facilitate/.
"""
import html, importlib.util, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("bc", os.path.join(ROOT, "tools", "build-catalyst.py"))
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

VERSION = "1.0.0"
D = os.path.join(ROOT, "facilitate", "north-star")
ICON_PY = os.path.expanduser("~/Sites/brand-assets/icons/icon.py")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
STAMP = subprocess.check_output(["date", "+Updated %a / %Y-%m-%d / %-I:%M %p CT"], text=True).strip()
FAC_VERSION = re.search(r'^VERSION = "([^"]+)"', open(os.path.join(ROOT, "tools", "build-facilitate.py")).read(), re.M).group(1)


def esc(s): return html.escape(str(s or ""), quote=True)


def icon(name, size=52):
    svg = subprocess.check_output(["python3", ICON_PY, "svg", name, "--weight", "thin", "--size", str(size)],
                                  cwd=os.path.dirname(ICON_PY)).decode().strip()
    return svg.replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)


def photo(p):
    cap = esc(p["caption"])
    return (f'      <figure class="tile photo"><img src="{esc(p["src"])}" alt="{esc(p["alt"])}" loading="lazy" '
            f'width="{p["w"]}" height="{p["h"]}"><figcaption>{cap}</figcaption></figure>')


# ---------- contrast: computed, never eyeballed (LEGIBILITY LAW) ----------
def lum(hexc):
    hexc = hexc.lstrip("#")
    rgb = [int(hexc[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    rgb = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]


def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


PAIRS = [("#0E0E0C", t) for t in ("#F6E9C9", "#DCEBEA", "#F8DFD3", "#E8E2D6", "#FFFFFF", "#F0EBE0")] + \
        [("#4A4038", t) for t in ("#F6E9C9", "#DCEBEA", "#F8DFD3", "#E8E2D6", "#FFFFFF")] + \
        [("#B83A14", "#FFFFFF"), ("#B83A14", "#E8E2D6", 3.0), ("#F0EBE0", "#0E0E0C"), ("#C9C2B6", "#0E0E0C"),
         ("#F0EBE0", "#434343")]  # the last: hero text over the .78 dark layer on a pure white sky, the worst case
fails = []
for fg, bg, *n in PAIRS:
    r = ratio(fg, bg)
    need = n[0] if n else (7.0 if fg in ("#0E0E0C", "#4A4038", "#F0EBE0") else 4.5)  # 3.0 = display headings only
    print(f"  contrast {fg} on {bg}: {r:.1f}:1 (needs {need}:1)")
    if r < need: fails.append(f"{fg} on {bg} {r:.1f}")
if fails: sys.exit("guard failed: contrast " + ", ".join(fails))

# ---------- build ----------
photos = json.load(open(os.path.join(D, "photos.json")))
s = open(os.path.join(D, "_src", "index.html")).read()
s = re.sub(r"\{\{IC_SM:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1), 28), s)
s = re.sub(r"\{\{IC:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1)), s)
s = s.replace("{{PHOTOS}}", "\n".join(photo(p) for p in photos))
s = s.replace("{{STAMP}}", STAMP).replace("{{STAMPDATE}}", STAMP.replace("Updated ", ""))
s = s.replace("{{VERSION}}", VERSION).replace("{{FACILITATE_VERSION}}", FAC_VERSION)
s = re.sub(r'<nav class="cfoot-nav".*?</nav>', bc.footer_nav("/facilitate/north-star/"), s, count=1, flags=re.S)
s = s.replace("</body>", bc.COUNTER + "\n</body>", 1)

# guards
if "\u2014" in s: sys.exit("guard failed: em dash")
left = re.findall(r"\{\{[^}]*\}\}", s)
if left: sys.exit("guard failed: leftover tokens " + ", ".join(left[:5]))
PROMISES = ["guarantee", "guaranteed", "never ", "always ", "forever", "100%", "any time you want", "no questions asked", "we will", "you will get"]
text = re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)\b.*?</\1>", " ", s, flags=re.S))
hits = [w for w in PROMISES if w in text.lower()]
if hits: sys.exit("guard failed: promise words " + ", ".join(hits))
for m in re.finditer(r'<a [^>]*href="(https?://[^"]+)"[^>]*>', s):
    if 'target="_blank"' not in m.group(0) or 'rel="noopener"' not in m.group(0):
        sys.exit("guard failed: off-site link without target=_blank rel=noopener: " + m.group(1))
if ".pdf" in s.lower(): sys.exit("guard failed: the page links a PDF; the worksheet stays private")

open(os.path.join(D, "index.html"), "w").write(s)

# og.png, 1200 x 630, from og.html
og_html = os.path.join(D, "og.html")
if os.path.exists(og_html):
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,630",
                    "--virtual-time-budget=6000", f"--screenshot={os.path.join(D, 'og.png')}", f"file://{og_html}"],
                   stderr=subprocess.DEVNULL, check=True)
print("built facilitate/north-star/index.html", STAMP, "| photos:", len(photos), "| v" + VERSION)
