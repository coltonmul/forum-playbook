#!/usr/bin/env python3
"""build-catalyst.py: builds forumplaybook.com/concepts/catalystcollective/ from its page sources.
VERSION 2.0.0 (2026-10-07)

  python3 tools/build-catalyst.py            build every page, patch the /concepts/ footers, run the guards

Sources live in concepts/catalystcollective/_src/<page>.html (GitHub Pages never publishes folders that
start with an underscore). Each source has two halves split by <!--BODY-->: the band (headline, lede)
and the body. Tokens:
  {{icon:name}} / {{icon:name:thin}}   a Phosphor icon from ~/Sites/brand-assets/icons/icon.py (light weight default)
  {{sh:icon|Kicker|Title}}             a section header with its icon, kicker and the section's own timestamp
  {{B}}                                the site path, /concepts/catalystcollective
  {{OLD}}                              the old host, which still serves the API and the two full-text perspectives
  {{FEEDBACK}}                         the feedback box
  {{CHANGELOG}}                        the changelog as <li> rows
  {{STAMP}}                            "Updated Wed / 2026-10-07 / 6:58 PM CT", from the clock at build time

The footer page list for the WHOLE /concepts/ section is SITE_PAGES below: the one canonical list. This
script writes it into every Catalyst page and patches it into /concepts/, /concepts/regionaltrainingdays/ and /chapters/.

Changelog
  2.0.0  First version: the sandbox moves from catalystcollective.pages.dev to forumplaybook.com and gets
         the Regional Training Days design (versions continue the old site's 1.x numbering).
"""
import html, os, re, subprocess, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CC = os.path.join(ROOT, "concepts", "catalystcollective")
SRC = os.path.join(CC, "_src")
ICON_PY = os.path.expanduser("~/Sites/brand-assets/icons")
sys.path.insert(0, ICON_PY)
import icon as _icon  # noqa: E402

# the one visitor-counter line every forumplaybook.com page carries (copied from timer.html)
COUNTER = "<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{\"token\": \"c20145f631df48ff8dc17a09c0c3fcdb\"}'></script><!-- End Cloudflare Web Analytics -->"

VERSION = "2.0.2"
B = "/concepts/catalystcollective"
OLD = "https://catalystcollective.pages.dev"
SITE = "https://forumplaybook.com"
STAMP = "Updated " + subprocess.check_output(["date", "+%a / %Y-%m-%d / %-I:%M %p CT"], text=True).strip()

# slug, source file, tab label, tab icon, <title>, description, og image (relative to B)
PAGES = [
    ("", "overview", "Overview", "squares-four", "Catalyst Collective | Forum Playbook",
     "EO Nashville's proposed membership between Catalyst and EO, as an evolving model: the concept, how you apply, three journeys, a financial model you can change, and the surveys.", "og.png"),
    ("journey/", "journey", "Journeys", "path", "The entrepreneur journeys | Catalyst Collective",
     "Three paths through Catalyst and the proposed Catalyst Collective: grow into EO, stay and run it well, or not invited yet. Side by side.", "og.png"),
    ("model/", "model", "Financial model", "chart-line-up", "The financial model | Catalyst Collective",
     "A five-year financial model for the proposed Catalyst Collective. Every number is adjustable and shareable by link.", "og.png"),
    ("surveys/", "surveys", "Surveys", "clipboard-text", "The surveys | Catalyst Collective",
     "Four draft surveys about the proposed Catalyst Collective, as working forms the council can test.", "og.png"),
    ("library/", "library", "Already built", "books", "Already built | Catalyst Collective",
     "Everything built so far for the Catalyst Collective: the working draft, the Three Tracks Kit, council perspectives, and the logo files.", "og.png"),
    ("feedback/", "feedback", "Feedback + changelog", "chat-circle-text", "Feedback and changelog | Catalyst Collective",
     "Every comment left on the Catalyst Collective pages, what happened to it, and every change by version.", "og.png"),
]

# The one canonical footer list for the /concepts/ pages (full footer nav law). Path, label.
SITE_PAGES = [
    ("/", "Home"), ("/timer", "Forum Timer"), ("/brand", "Brand"), ("/legal", "Privacy &amp; Terms"),
    ("/app/", "The app"), ("/chapters/", "Chapters + Forums"), ("/concepts/", "Concepts"), ("/concepts/regionaltrainingdays/", "Regional Training Days"),
    (B + "/", "Catalyst Collective"), (B + "/journey/", "Catalyst journeys"), (B + "/model/", "Catalyst model"),
    (B + "/surveys/", "Catalyst surveys"), (B + "/library/", "Catalyst library"), (B + "/feedback/", "Catalyst feedback"),
]

CHANGELOG = [
    ("2.0.2", "Thu / 2026-10-08", "the footer lists the new app page, and every page carries the site's visitor counter like the rest of forumplaybook.com."),
    ("2.0.1", "Wed / 2026-10-07", "wording fix from Colton: \"deep dive\" is a specific part of an EO forum meeting, so the alumni survey option now reads \"Quarterly themed sessions led by EO members who solved my exact problem\"."),
    ("2.0.0", "Wed / 2026-10-07", "moved to forumplaybook.com/concepts/catalystcollective, at Colton's direction, and redesigned to match the Regional Training Days concept: the logo appears once, every section has an icon and its own timestamp, the three rooms and the prices are charts, the history is a timeline you can hover, the journeys branch from one trunk, and everything lifts or tilts on hover. Also from Colton: getting in is now an application. Catalyst graduates apply to the Collective, past alumni can apply at any time, and the committee invites applicants on the same kinds of factors EO weighs on an application, with Catalyst's revenue thresholds tiered by industry. The old address forwards here; the feedback box, the surveys and the #Calvin flow keep working, and everything already in the feedback log is still there."),
    ("1.2.1", "Fri / 2026-09-18", "naming rule from Colton, matched to the Three Tracks Kit and the long-form draft. The name now carries its tagline at first reference on every page (\"An ongoing membership, by invitation.\"), the overview opens with the one-sentence definition, and the older parenthetical that tied the name back to Bridge is gone. The framing is the evolution of Bridge, not a rename."),
    ("1.2.0", "Fri / 2026-09-18", "identity pass, at Colton's direction. The lockup is always stacked and traced to vector; the salmon from the Catalyst invitation is gone everywhere; the identity is EO's base navy with EO Blue as the one highlight. Jay Graves's Project Elevate draft gets its own full page."),
    ("1.1.0", "Fri / 2026-09-18", "attribution made explicit everywhere, at Colton's direction: the concept Colton presented, where the room leaned on September 17 (Colton's read of the recording), and perspectives from individual council members under their own names are kept apart on every page. The reconvene time matches Sameera's calendar invite (October 14, 10:30 to 11:30 AM CT, on Zoom)."),
    ("1.0.0", "Thu / 2026-09-17", "first live version, built the afternoon of the September 17 strategic council: the overview, three journeys, the five-year model, four draft surveys, the library, the public feedback log with the #Calvin change-request flow, and the lockup. Brittany Lorenzi's stage-two model and Jay Graves's Project Elevate draft blended in the same afternoon."),
]

LOCKUP = open(os.path.join(SRC, "_lockup.svg")).read().strip()


def icon(name, weight="light"):
    return _icon.inline_svg(name, weight=weight, size=24)


def section_header(m):
    ic, kick, title = [x.strip() for x in m.group(1).split("|")]
    t = STAMP.replace("Updated ", "")
    return (f'<header class="sh"><span class="sh-i">{icon(ic)}</span><div><p class="sh-k">{kick}'
            f'<time>{t}</time></p><h2>{title}</h2></div></header>')


def feedback_box():
    return open(os.path.join(SRC, "_feedback.html")).read()


def changelog_html():
    return "".join(f"<li><b>{v}</b> ({d}): {html.escape(t, quote=False)}</li>" for v, d, t in CHANGELOG)


def expand(s):
    s = s.replace("{{FEEDBACK}}", feedback_box())
    s = re.sub(r"\{\{sh:([^}]*)\}\}", section_header, s)
    s = re.sub(r"\{\{icon:([a-z0-9-]+)(?::(thin|light))?\}\}", lambda m: icon(m.group(1), m.group(2) or "light"), s)
    s = s.replace("{{CHANGELOG}}", changelog_html())
    return s.replace("{{B}}", B).replace("{{OLD}}", OLD).replace("{{STAMP}}", STAMP).replace("{{VERSION}}", VERSION)


def footer_nav(current):
    links = []
    for path, label in SITE_PAGES:
        cur = ' aria-current="page"' if path == current else ""
        links.append(f'<a href="{path}"{cur}>{label}</a>')
    return '<nav class="cfoot-nav" aria-label="Site pages">' + " ".join(links) + "</nav>"


def tabs(current_slug):
    out = []
    for slug, _src, label, ic, *_ in PAGES:
        cur = ' aria-current="page"' if slug == current_slug else ""
        out.append(f'<a href="{B}/{slug}"{cur}>{icon(ic)}<span>{label}</span></a>')
    return '<nav class="cc-tabs" aria-label="Catalyst Collective pages">' + "".join(out) + "</nav>"


FAVICON = _icon.data_uri(_icon.favicon_svg("users-three", "light"))


def page(slug, src, label, ic, title, desc, og):
    raw = open(os.path.join(SRC, src + ".html")).read()
    band, body = raw.split("<!--BODY-->", 1)
    extra_head = ""
    m = re.search(r"<!--HEAD(.*?)-->", band, re.S)
    if m:
        extra_head = m.group(1).strip()
        band = band.replace(m.group(0), "")
    url = f"{SITE}{B}/{slug}"
    ogurl = f"{SITE}{B}/{og}"
    scripts = '<script src="{B}/assets/cc.js?v={V}" defer></script>'.format(B=B, V=VERSION)
    for js in re.findall(r"<!--SCRIPT (\S+)-->", body):
        scripts += f'\n<script src="{B}/assets/{js}?v={VERSION}" defer></script>'
    body = re.sub(r"<!--SCRIPT \S+-->", "", body)
    return f"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="{FAVICON}">
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Forum Playbook" />
<meta property="og:url" content="{url}" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{desc}" />
<meta property="og:image" content="{ogurl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Catalyst Collective lockup on EO navy: a membership, not a waiting room" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{desc}" />
<meta name="twitter:image" content="{ogurl}" />
<meta name="generator" content="Catalyst Collective v{VERSION}, built {STAMP}">
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/interior.css">
<link rel="stylesheet" href="/concepts/concepts.css">
<link rel="stylesheet" href="{B}/assets/cc.css?v={VERSION}">
{extra_head}
<script>document.documentElement.classList.add('js')</script>
</head><body><header class="ibar" role="banner">
  <a href="/" class="ibar-hit ibar-warm ibar-home" aria-label="Forum Playbook home">
    <span>
      <svg class="ibar-mark" viewBox="0 0 212 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path class="ibar-mb" d="M 0 5.9 L 42.06 5.9 L 101.6 94.1 L 212 94.1" />
        <path class="ibar-ma" d="M 86.4 5.9 L 212 5.9" />
      </svg>
      <span class="ibar-word">FORUM PLAYBOOK</span>
    </span>
  </a>
  <span class="ibar-rule" aria-hidden="true"></span>
  <span class="ibar-page">Catalyst Collective</span>
  <span class="ibar-meta">{STAMP}</span>
  <nav class="ibar-nav" aria-label="Main navigation">
    <a href="/#resources" class="ibar-hit ibar-cool ibar-link"><span>Resources</span></a>
    <a href="/timer" class="ibar-hit ibar-cool ibar-link"><span>Timer</span></a>
    <a href="/concepts/" class="ibar-hit ibar-cool ibar-link"><span>Concepts</span></a>
    <a href="/brand" class="ibar-hit ibar-cool ibar-link"><span>Brand</span></a>
  </nav>
</header>
<main class="wrap">
  <div class="cc-row"><p class="kicker">[ An evolving model ]</p><span class="cc-pill">{icon("flask")}Concept only. Nothing here is adopted or approved.</span></div>
  <article class="cc">
    <section class="cc-band" aria-label="Catalyst Collective">
      <div class="cc-top">
        <div><a class="cc-lockup" href="{B}/" aria-label="Catalyst Collective overview">{LOCKUP}</a><div class="cc-tagline">An ongoing membership, by invitation.</div></div>
        <div class="cc-stamp">{STAMP}<br>An evolving model &middot; v{VERSION}</div>
      </div>
{expand(band).strip()}
      {tabs(slug)}
    </section>
    <div class="cc-body">
{expand(body).strip()}
    </div>
    <footer class="cc-foot">
      <p><b>Concept only.</b> A working concept for EO Nashville's strategic council, prepared by Colton Mulligan. Not an official EO Nashville publication, not an adopted program, not a board decision, not a promise to anyone.</p>
    </footer>
  </article>

  <a class="more" href="/concepts/"><strong>More concepts and half-baked ideas</strong><span>forumplaybook.com/concepts &rarr;</span></a>
</main>
{scripts}
<footer class="cfoot">
  {footer_nav(B + "/" + slug)}
  <p class="cfoot-line"><b>Concept only.</b> Not adopted, not approved, not solicitation. &middot; Built by Colton &middot; <a href="https://builtbycolton.com" target="_blank" rel="noopener">builtbycolton.com</a></p>
  <details class="cfoot-ver"><summary>v{VERSION} &middot; changelog</summary><ul>{changelog_html()}</ul></details>
</footer>
{COUNTER}
</body></html>
"""


def patch_footer(path, current):
    s = open(path).read()
    new = re.sub(r'<nav class="cfoot-nav".*?</nav>', footer_nav(current), s, count=1, flags=re.S)
    if "cloudflareinsights" not in new:
        new = new.replace("</body>", COUNTER + "\n</body>", 1)
    if new != s:
        open(path, "w").write(new)
        print("  footer list updated:", os.path.relpath(path, ROOT))


def main():
    built = []
    for p in PAGES:
        slug = p[0]
        out_dir = os.path.join(CC, slug)
        os.makedirs(out_dir, exist_ok=True)
        out = os.path.join(out_dir, "index.html")
        doc = page(*p)
        open(out, "w").write(doc)
        built.append(out)
        print("  built", os.path.relpath(out, ROOT))
    patch_footer(os.path.join(ROOT, "concepts", "index.html"), "/concepts/")
    patch_footer(os.path.join(ROOT, "concepts", "regionaltrainingdays", "index.html"), "/concepts/regionaltrainingdays/")
    patch_footer(os.path.join(ROOT, "chapters", "index.html"), "/chapters/")
    # guards: no em dashes, no leftover tokens, every page has its stamp, footer list, feedback box and og image
    bad = 0
    for f in built + [os.path.join(CC, "assets", x) for x in os.listdir(os.path.join(CC, "assets")) if x.endswith((".js", ".css"))]:
        s = open(f).read()
        if "\u2014" in s:
            print("  FAIL em dash in", f); bad += 1
        if f.endswith(".html"):
            for need in (STAMP, "cloudflareinsights", 'class="cfoot-nav"', 'id="fb-form"', 'og:image', 'builtbycolton.com'):
                if need not in s:
                    print("  FAIL", os.path.relpath(f, ROOT), "is missing", need); bad += 1
            left = re.findall(r"\{\{[^}]*\}\}", s)
            if left:
                print("  FAIL leftover tokens in", f, left[:3]); bad += 1
    if bad:
        sys.exit(f"{bad} guard failure(s)")
    print(f"ok: v{VERSION}, {len(built)} pages, {STAMP}")


if __name__ == "__main__":
    main()
