#!/usr/bin/env python3
"""build-facilitate.py: builds forumplaybook.com/facilitate/ ("Have Colton facilitate your retreat"). VERSION 1.0.0 (2026-10-26)

  python3 tools/build-facilitate.py

Reads facilitate/_src/index.html and the data files in facilitate/data/ (quotes.json, photos.json, availability.json),
renders the quotes-and-photos grid, the twelve-month availability strip and the footer page list (SITE_PAGES in
build-catalyst.py, the one canonical list), stamps the page, and guards against em dashes, leftover tokens and
promise words (NO PROMISES IN PUBLIC COPY). The changelog stays here and in CHANGELOG.md, never on the page.

Changelog
  1.0.0  First version, the Monday after the Uncharted retreat, from Colton's brief of 2026-10-26.
"""
import datetime, html, importlib.util, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("bc", os.path.join(ROOT, "tools", "build-catalyst.py"))
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

VERSION = "1.0.0"
D = os.path.join(ROOT, "facilitate")
STAMP = subprocess.check_output(["date", "+Updated %a / %Y-%m-%d / %-I:%M %p CT"], text=True).strip()

def load(name, default):
    p = os.path.join(D, "data", name)
    return json.load(open(p)) if os.path.exists(p) else default

quotes = load("quotes.json", [])
photos = load("photos.json", [])
avail = load("availability.json", {"blackout": [], "generated": "", "note": ""})

def esc(s): return html.escape(str(s or ""), quote=False)

# ---------- the grid: photos and quotes, interleaved so every photo sits by a quote ----------
def tile_photo(p):
    cap = esc(p.get("caption", ""))
    if p.get("video"):
        return (f'<figure class="tile video"><video src="{esc(p["video"])}" poster="{esc(p.get("src",""))}" muted loop playsinline autoplay preload="metadata" aria-label="{cap}"></video>'
                f'<figcaption>{cap}</figcaption></figure>')
    return f'<figure class="tile photo"><img src="{esc(p["src"])}" alt="{esc(p.get("alt", cap))}" loading="lazy" width="{p.get("w", 800)}" height="{p.get("h", 1000)}"><figcaption>{cap}</figcaption></figure>'

def tile_quote(q):
    who = esc(q.get("who", ""))
    where = esc(q.get("where", ""))
    cls = "tile quote" + (" wide" if len(q.get("text", "")) > 170 else "") + (" big" if len(q.get("text", "")) < 90 else "")
    cite = f'<cite><b>{who}</b>{(" · " + where) if where else ""}</cite>' if who else (f'<cite>{where}</cite>' if where else "")
    return f'<blockquote class="{cls}"><p>{esc(q["text"])}</p>{cite}</blockquote>'

def grid():
    out = []
    qi, pi = 0, 0
    # pattern: quote, photo, quote, quote, photo ... until both run out
    pattern = ["q", "p", "q", "q", "p", "q", "p", "q"]
    k = 0
    while qi < len(quotes) or pi < len(photos):
        kind = pattern[k % len(pattern)]; k += 1
        if kind == "p" and pi < len(photos): out.append(tile_photo(photos[pi])); pi += 1
        elif qi < len(quotes): out.append(tile_quote(quotes[qi])); qi += 1
        elif pi < len(photos): out.append(tile_photo(photos[pi])); pi += 1
    return "\n".join(out)

# ---------- availability: twelve months from this month; blackout days dark, everything else "possible, ask" ----------
def availability():
    today = datetime.date.today()
    first = today.replace(day=1)
    black = []
    for b in avail.get("blackout", []):
        a = datetime.date.fromisoformat(b["from"]); z = datetime.date.fromisoformat(b["to"])
        black.append((a, z, b.get("label", "")))
    def is_black(d): return any(a <= d <= z for a, z, _ in black)
    read_through = datetime.date.fromisoformat(avail["read_through"]) if avail.get("read_through") else None
    months = []
    y, m = first.year, first.month
    for _ in range(12):
        start = datetime.date(y, m, 1)
        nxt = datetime.date(y + (m == 12), (m % 12) + 1, 1)
        days = (nxt - start).days
        cells = ['<span class="pad" aria-hidden="true"></span>'] * ((start.weekday() + 1) % 7)  # Sunday first
        for dd in range(1, days + 1):
            d = datetime.date(y, m, dd)
            if d < today: cls = "past"; title = ""
            elif read_through and d > read_through: cls = "tbd"; title = "calendar not read yet"
            elif is_black(d): cls = "no"; title = next(l for a, z, l in black if a <= d <= z)
            else: cls = "ask"; title = "possible, ask"
            cells.append(f'<span class="{cls}"{(" title=" + chr(34) + esc(title) + chr(34)) if title else ""}>{dd}</span>')
        months.append(f'<div class="month"><h4>{start.strftime("%B %Y")}</h4><div class="days" role="img" aria-label="{start.strftime("%B %Y")}">{"".join(cells)}</div></div>')
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)
    items = "".join(f'<li>{esc(l)}: {a.strftime("%b %-d")} to {z.strftime("%b %-d, %Y")}</li>' for a, z, l in sorted(black) if z >= today)
    return '<div class="months">' + "".join(months) + "</div>", f'<ul class="blackouts">{items}</ul>' if items else ""

months_html, blackouts_html = availability()

src = open(os.path.join(D, "_src", "index.html")).read()
s = src.replace("{{GRID}}", grid()).replace("{{MONTHS}}", months_html).replace("{{BLACKOUTS}}", blackouts_html)
s = s.replace("{{STAMP}}", STAMP).replace("{{STAMPDATE}}", STAMP.replace("Updated ", "")).replace("{{VERSION}}", VERSION)
s = s.replace("{{AVAIL_GENERATED}}", esc(avail.get("generated", STAMP.replace("Updated ", ""))))
hero = os.path.join(D, "img", "hero.jpg")
s = s.replace("{{HERO}}", '<div class="hero-media" aria-hidden="true"><img src="/facilitate/img/hero.jpg" alt=""></div>' if os.path.exists(hero) else "")
s = s.replace("{{QUOTE_COUNT}}", str(len(quotes)))
s = re.sub(r'<nav class="cfoot-nav".*?</nav>', bc.footer_nav("/facilitate/"), s, count=1, flags=re.S)
s = s.replace("</body>", bc.COUNTER + "\n</body>", 1)

# guards
if "—" in s: sys.exit("guard failed: em dash")
left = re.findall(r"\{\{[^}]*\}\}", s)
if left: sys.exit("guard failed: leftover tokens " + ", ".join(left[:5]))
PROMISES = ["guarantee", "guaranteed", "never ", "always ", "forever", "100%", "any time you want", "no questions asked"]
text = re.sub(r"<[^>]+>", " ", re.sub(r"<blockquote.*?</blockquote>", " ", s, flags=re.S))  # quotes are their words, not promises
hits = [w for w in PROMISES if w in text.lower()]
if hits: sys.exit("guard failed: promise words " + ", ".join(hits))

open(os.path.join(D, "index.html"), "w").write(s)
print("built facilitate/index.html", STAMP, "| quotes:", len(quotes), "| photos:", len(photos), "| blackouts:", len(avail.get("blackout", [])))
