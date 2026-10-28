#!/usr/bin/env python3
"""build-facilitate.py: builds forumplaybook.com/facilitate/ ("Have Colton facilitate your retreat"). VERSION 1.0.0 (2026-10-26)

  python3 tools/build-facilitate.py

Reads facilitate/_src/index.html and the data files in facilitate/data/ (quotes.json, photos.json, availability.json),
renders the quotes-and-photos grid, the twelve-month availability strip and the footer page list (SITE_PAGES in
build-catalyst.py, the one canonical list), stamps the page, and guards against em dashes, leftover tokens and
promise words (NO PROMISES IN PUBLIC COPY). The changelog stays here and in CHANGELOG.md, never on the page.

Changelog
  1.2.1  "Why forums bring Colton in" and the two halves of a facilitation, in his words (Colton, 2026-10-28).
  1.2.0  A landing page: the hook, what Colton does, the app, the price, with quotes rotating in two blocks and single picks in the sections; quotes carry the chapter forum only; photos sit beside sections and in a strip (Colton, 2026-10-28). Merged over the October 27 session's 1.1.x (photo classes, video tiles started by the page script, italics).
  1.1.2  Version bump for the tile margin fix in facilitate.css.
  1.1.1  Version bump so the stylesheet link (?v=) changes with the feature tile CSS.
  1.1.0  Photos take "classes" (feature, captop); video tiles can be wide and start from the page script (never under reduced motion); quotes render in italics (facilitate.css 1.1.0). Colton, 2026-10-27.
  1.0.0  First version, the Monday after the Uncharted retreat, from Colton's brief of 2026-10-26.
"""
import datetime, html, importlib.util, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("bc", os.path.join(ROOT, "tools", "build-catalyst.py"))
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

VERSION = "1.2.1"
D = os.path.join(ROOT, "facilitate")
STAMP = subprocess.check_output(["date", "+Updated %a / %Y-%m-%d / %-I:%M %p CT"], text=True).strip()

def load(name, default):
    p = os.path.join(D, "data", name)
    return json.load(open(p)) if os.path.exists(p) else default

quotes = load("quotes.json", [])
photos = load("photos.json", [])
avail = load("availability.json", {"blackout": [], "generated": "", "note": ""})

def esc(s): return html.escape(str(s or ""), quote=False)

# ---------- quotes: the hero quote, two rotators, single picks; photos: slots and the strip ----------
used = set()
def q_html(q, cls="rot-item"):
    return f'<blockquote class="{cls}"><p>{esc(q["text"])}</p><cite>{esc(q.get("where", ""))}</cite></blockquote>'

def quote_hero():
    q = quotes[0]; used.add(id(q))
    return f'<blockquote class="hq"><p>{esc(q["text"])}</p><cite>{esc(q.get("where", ""))}</cite></blockquote>'

def quote_pick(sub):
    for q in quotes:
        if id(q) not in used and sub.lower() in q["text"].lower():
            used.add(id(q)); return q_html(q, "pick")
    return ""

def rotator(items, label):
    if not items: return ""
    inner = "".join(q_html(q) for q in items)
    for q in items: used.add(id(q))
    return f'<div class="rotator" data-interval="8000" aria-roledescription="carousel" aria-label="{esc(label)}"><div class="rot-track">{inner}</div><div class="rot-dots" role="tablist" aria-label="Pick a quote"></div></div>'

def photo_fig(p, cls="pic"):
    cap = esc(p.get("caption", ""))
    wide = " wide" if p.get("wide") else ""
    if p.get("video"):
        # No autoplay attribute: the page script starts it, and never under reduced motion (the poster stays).
        return (f'<figure class="{cls}{wide}"><video src="{esc(p["video"])}" poster="{esc(p.get("src",""))}" muted loop playsinline preload="metadata" data-autoplay aria-label="{esc(p.get("alt", cap))}"></video>'
                f'<figcaption>{cap}</figcaption></figure>')
    return f'<figure class="{cls}{wide}"><img src="{esc(p["src"])}" alt="{esc(p.get("alt", cap))}" loading="lazy" width="{p.get("w", 800)}" height="{p.get("h", 600)}"><figcaption>{cap}</figcaption></figure>'

def photo_slot(slot):
    for p in photos:
        if p.get("slot") == slot: return photo_fig(p)
    return ""

def photo_strip():
    return "\n".join(photo_fig(p) for p in photos if not p.get("slot"))

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
s = src.replace("{{MONTHS}}", months_html).replace("{{BLACKOUTS}}", blackouts_html)
s = s.replace("{{QUOTE_HERO}}", quote_hero())
s = re.sub(r"\{\{QUOTE_PICK:([^}]+)\}\}", lambda m: quote_pick(m.group(1)), s)
sd = [q for q in quotes if str(q.get("where", "")).startswith("EO San Diego Forum") and id(q) not in used]
s = s.replace("{{ROTATOR_SD}}", rotator(sd, "What the EO San Diego forum said"))
rest = [q for q in quotes if id(q) not in used]
s = s.replace("{{ROTATOR_REST}}", rotator(rest, "What other forums said"))
s = s.replace("{{PHOTO_DOES}}", photo_slot("does")).replace("{{PHOTO_PRICE}}", photo_slot("price")).replace("{{PHOTO_STRIP}}", photo_strip())
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
