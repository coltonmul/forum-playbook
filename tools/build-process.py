#!/usr/bin/env python3
"""build-process.py: builds the Process Breakdown pages, forumplaybook.com/process/<name>/. VERSION 1.1.0 (2026-11-17)

  /opt/homebrew/bin/python3 tools/build-process.py

For every folder under process/ that has _src/index.html: draws the icons with icon.py (Phosphor, thin), writes the
footer page list (SITE_PAGES in build-catalyst.py, the one canonical list) and the stamp, renders og.png from og.html
with headless Chrome, prints the contrast table for the page's color pairs, and guards against em dashes, leftover
tokens, promise words (NO PROMISES IN PUBLIC COPY) and off-site links without target and rel.

A Process Breakdown is one process in three formats: this web page, the one-page PDF in /one-pagers/, and a
two-minute video (Colton, 2026-11-16). The page copy comes from the one-pager; the one-pager stays the source.

Changelog (the full history stays here and in CHANGELOG.md, never on the page)
  1.1.0  Live (Colton, 2026-11-17: "Ship it"): the mockup note and the noindex tag are gone; the app block says what
         the app has today.
  1.0.0  First version (Colton, 2026-11-16): Open Coaching as the mockup of the format.
"""
import html, importlib.util, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("bc", os.path.join(ROOT, "tools", "build-catalyst.py"))
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

VERSION = "1.1.0"
P = os.path.join(ROOT, "process")
ICON_PY = os.path.expanduser("~/Sites/brand-assets/icons/icon.py")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
STAMP = subprocess.check_output(["date", "+Updated %a / %Y-%m-%d / %-I:%M %p CT"], text=True).strip()
FAC_VERSION = re.search(r'^VERSION = "([^"]+)"', open(os.path.join(ROOT, "tools", "build-facilitate.py")).read(), re.M).group(1)


def icon(name, size=52):
    svg = subprocess.check_output(["/opt/homebrew/bin/python3", ICON_PY, "svg", name, "--weight", "thin", "--size", str(size)],
                                  cwd=os.path.dirname(ICON_PY)).decode().strip()
    return svg.replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)


# ---------- contrast: computed, never eyeballed (LEGIBILITY LAW) ----------
def lum(hexc):
    hexc = hexc.lstrip("#")
    rgb = [int(hexc[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    rgb = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]


def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


# (text, background, needed). 7:1 reading text, 4.5:1 other text.
PAIRS = [("#0E0E0C", t, 7.0) for t in ("#F6E9C9", "#DCEBEA", "#F8DFD3", "#E8E2D6", "#FFFFFF", "#F0EBE0")] + \
        [("#4A4038", t, 7.0) for t in ("#FFFFFF", "#E8E2D6", "#F0EBE0")] + \
        [("#B83A14", "#FFFFFF", 4.5), ("#F0EBE0", "#0E0E0C", 7.0), ("#C9C2B6", "#0E0E0C", 7.0),
         ("#F0EBE0", "#1B1B18", 7.0), ("#C9C2B6", "#1B1B18", 7.0), ("#E8521A", "#0E0E0C", 4.5)]
fails = []
for fg, bg, need in PAIRS:
    r = ratio(fg, bg)
    print(f"  contrast {fg} on {bg}: {r:.1f}:1 (needs {need}:1)")
    if r < need: fails.append(f"{fg} on {bg} {r:.1f}")
if fails: sys.exit("guard failed: contrast " + ", ".join(fails))

PROMISES = ["guarantee", "guaranteed", "never ", "always ", "forever", "100%", "any time you want", "no questions asked", "we will", "you will get"]
built = 0
for slug in sorted(os.listdir(P)):
    D = os.path.join(P, slug)
    src = os.path.join(D, "_src", "index.html")
    if not os.path.isfile(src): continue
    s = open(src).read()
    s = re.sub(r"\{\{IC_SM:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1), 28), s)
    s = re.sub(r"\{\{IC:([a-z0-9-]+)\}\}", lambda m: icon(m.group(1)), s)
    s = s.replace("{{STAMP}}", STAMP).replace("{{STAMPDATE}}", STAMP.replace("Updated ", ""))
    s = s.replace("{{VERSION}}", VERSION).replace("{{FACILITATE_VERSION}}", FAC_VERSION)
    s = re.sub(r'<nav class="cfoot-nav".*?</nav>', bc.footer_nav(f"/process/{slug}/"), s, count=1, flags=re.S)
    s = s.replace("</body>", bc.COUNTER + "\n</body>", 1)
    if "\u2014" in s: sys.exit(f"guard failed ({slug}): em dash")
    left = re.findall(r"\{\{[^}]*\}\}", s)
    if left: sys.exit(f"guard failed ({slug}): leftover tokens " + ", ".join(left[:5]))
    text = re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)\b.*?</\1>", " ", s, flags=re.S))
    hits = [w for w in PROMISES if w in text.lower()]
    if hits: sys.exit(f"guard failed ({slug}): promise words " + ", ".join(hits))
    for m in re.finditer(r'<a [^>]*href="(https?://[^"]+)"[^>]*>', s):
        if 'target="_blank"' not in m.group(0) or 'rel="noopener"' not in m.group(0):
            sys.exit(f"guard failed ({slug}): off-site link without target=_blank rel=noopener: " + m.group(1))
    open(os.path.join(D, "index.html"), "w").write(s)
    og_html = os.path.join(D, "og.html")
    if os.path.exists(og_html):
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,630",
                        "--virtual-time-budget=6000", f"--screenshot={os.path.join(D, 'og.png')}", f"file://{og_html}"],
                       stderr=subprocess.DEVNULL, check=True)
    built += 1
    print(f"built process/{slug}/index.html", STAMP, "| v" + VERSION)
if not built: sys.exit("build-process: nothing to build")
