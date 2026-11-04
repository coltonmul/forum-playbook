#!/usr/bin/env python3
"""build-catalyst.py: builds the Catalyst Collective pages for BOTH of their homes from one set of sources.
VERSION 3.3.0 (2026-11-03)

  python3 tools/build-catalyst.py            build every page for both homes, patch the /concepts/ footers, run the guards

ONE SITE, TWO HOMES (Colton, 2026-11-02 email "two things floating out there"):
  1. The FULL-SCREEN version, the address to share with everybody: https://builtbycolton.com/catalystcollective/
     Written to FULL_OUT (the builtbycolton repo's hosted-page slot, src/hosted/catalystcollective/), then shipped by
     that repo's ./deploy.sh. No Forum Playbook chrome: the EO-navy band runs edge to edge (assets/cc-full.css).
  2. The MIRROR on forumplaybook.com/concepts/catalystcollective/, built from the same sources into this repo, inside
     the Forum Playbook interior bar and footer, with a "Full-screen version" link in its band.
  Both carry the version and the changelog at the bottom (light: one line per version; the full notes stay on the
  Feedback + changelog page). The builtbycolton.com policy forbids inline style and inline script, so the sources use
  classes only and the js flag is an external file (assets/js.js); the guard below fails the build on either.

Sources live in concepts/catalystcollective/_src/<page>.html (GitHub Pages never publishes folders that
start with an underscore). Each source has two halves split by <!--BODY-->: the band (headline, lede)
and the body. Tokens:
  {{icon:name}} / {{icon:name:thin}}   a Phosphor icon from ~/Sites/brand-assets/icons/icon.py (light weight default)
  {{sh:icon|Kicker|Title}}             a section header with its icon, kicker and the section's own timestamp
  {{B}}                                the site path for the home being built (/concepts/catalystcollective or /catalystcollective)
  {{OLD}}                              the old host, which still serves the API and the two full-text perspectives
  {{FEEDBACK}}                         the feedback box
  {{CHANGELOG}}                        the changelog as <li> rows (short line, full note folded under it)
  {{STAMP}}                            "Updated Wed / 2026-10-07 / 6:58 PM CT", from the clock at build time

The footer page list for the WHOLE /concepts/ section is SITE_PAGES below: the one canonical list. This
script writes it into every Catalyst page and patches it into /concepts/, /concepts/regionaltrainingexperience/, its charlotte/ page and /chapters/.
(2.1.1: Regional Training Days became the Regional Training Experience at that address; the old path is a redirect stub and is left alone.)

Changelog
  3.3.0  The alumni survey page is the three points of the survey and the form, once: no readable list, no note under
         every question, no audience-and-purpose box (Colton, 2026-11-03).
  3.2.1  Same pages, new asset addresses: the mirror's CDN had cached the 3.2.0 survey script before it landed.
  3.2.0  The price question offers $2,500 to $4,000 and nothing lower, and the alumni survey carries the first-year offer
         for an honest answer with a name and email (Colton's pricing note, 2026-11-03).
  3.1.0  The alumni survey is cut to twelve questions and framed as EO Nashville exploring how to expand the Catalyst
         experience beyond graduation (Colton, 2026-11-03); the survey pages no longer name a council.
  3.0.0  Two homes from one source (full-screen at builtbycolton.com, mirror here); the Three Tracks Kit pages join
         as sub-pages of Already built; CSP-safe output (no inline style or script); light changelog in the footer.
  2.2.0  A page may be a sub-page (tab label None): it gets no tab of its own, the parent tab stays current,
         and it is listed in the footer like every other page (surveys/alumni/ is the first).
  2.0.0  First version: the sandbox moves from catalystcollective.pages.dev to forumplaybook.com and gets
         the Regional Training Days design (versions continue the old site's 1.x numbering).
"""
import html, os, re, shutil, subprocess, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CC = os.path.join(ROOT, "concepts", "catalystcollective")
SRC = os.path.join(CC, "_src")
ICON_PY = os.path.expanduser("~/Sites/brand-assets/icons")
sys.path.insert(0, ICON_PY)
import icon as _icon  # noqa: E402

# the one visitor-counter line every forumplaybook.com page carries (copied from timer.html)
COUNTER = "<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{\"token\": \"c20145f631df48ff8dc17a09c0c3fcdb\"}'></script><!-- End Cloudflare Web Analytics -->"

VERSION = "3.3.0"
OLD = "https://catalystcollective.pages.dev"
STAMP = "Updated " + subprocess.check_output(["date", "+%a / %Y-%m-%d / %-I:%M %p CT"], text=True).strip()

# the two homes
HOMES = {
    "mirror": {"base": "/concepts/catalystcollective", "site": "https://forumplaybook.com", "out": CC},
    "full": {"base": "/catalystcollective", "site": "https://builtbycolton.com",
             "out": os.environ.get("CC_FULL_OUT", "/Users/calvin/work/builtbycolton/src/hosted/catalystcollective")},
}
FULL_URL = HOMES["full"]["site"] + HOMES["full"]["base"]
MIRROR_URL = HOMES["mirror"]["site"] + HOMES["mirror"]["base"]

# slug, source file, tab label (None = sub-page, no tab, parent tab stays current), tab icon, <title>, description, og image (relative to the base)
PAGES = [
    ("", "overview", "Overview", "squares-four", "Catalyst Collective | EO Nashville strategic council",
     "EO Nashville's proposed membership between Catalyst and EO, as an evolving model: the concept, how you apply, three journeys, a financial model you can change, and the surveys.", "og.png"),
    ("journey/", "journey", "Journeys", "path", "The entrepreneur journeys | Catalyst Collective",
     "Three paths through Catalyst and the proposed Catalyst Collective: grow into EO, stay and run it well, or not invited yet. Side by side.", "og.png"),
    ("model/", "model", "Financial model", "chart-line-up", "The financial model | Catalyst Collective",
     "A five-year financial model for the proposed Catalyst Collective, plus Brittany Lorenzi's preliminary budget. Every number is adjustable and shareable by link.", "og.png"),
    ("surveys/", "surveys", "Surveys", "clipboard-text", "The surveys | Catalyst Collective",
     "Four draft surveys about the proposed Catalyst Collective, as working forms the council can test.", "og.png"),
    ("surveys/alumni/", "alumni", None, None, "The alumni survey, a draft | Catalyst Collective",
     "EO Nashville is exploring how to expand the Catalyst experience beyond graduation. A twelve-question draft survey for Catalyst alumni, including current and former Bridge members: would the Catalyst Collective represent real value to them, and at what price. Not live, nothing sent.", "og.png"),
    ("library/", "library", "Already built", "books", "Already built | Catalyst Collective",
     "Everything built so far for the Catalyst Collective: the working draft, the Three Tracks Kit pages, council perspectives, and the logo files.", "og.png"),
    ("library/offering/", "offering", None, None, "The Offering: three rooms | Catalyst Collective",
     "Three rooms, one community: Catalyst, the Catalyst Collective, and EO Nashville. The prospect-facing showcase page from the Three Tracks Kit.", "og.png"),
    ("library/fit-finder/", "fit-finder", None, None, "Find your room: the fit finder | Catalyst Collective",
     "Eight questions, two minutes, no wrong answers: which of EO Nashville's three rooms fits. Nothing is stored. From the Three Tracks Kit.", "og.png"),
    ("library/video/", "video", None, None, "The 60-second video script | Catalyst Collective",
     "Beat-by-beat script and storyboard for the prospect-facing spot: voiceover, visuals, on-screen text, production notes. From the Three Tracks Kit.", "og.png"),
    ("library/memo/", "memo", None, None, "The strategy memo: why tracks, not thresholds | Catalyst Collective",
     "The argument behind the prospect-facing pages, for the strategic council only. From the Three Tracks Kit.", "og.png"),
    ("feedback/", "feedback", "Feedback + changelog", "chat-circle-text", "Feedback and changelog | Catalyst Collective",
     "Every comment left on the Catalyst Collective pages, what happened to it, and every change by version.", "og.png"),
]

# The one canonical footer list for the /concepts/ pages on forumplaybook.com (full footer nav law). Path, label.
MB = HOMES["mirror"]["base"]
SITE_PAGES = [
    ("/", "Home"), ("/timer", "Forum Timer"), ("/brand", "Brand"), ("/legal", "Privacy &amp; Terms"),
    ("/app/", "The app"), ("/chapters/", "Chapters + Forums"), ("/concepts/", "Concepts"), ("/concepts/regionaltrainingexperience/", "Regional Training Experience"),
    ("/concepts/regionaltrainingexperience/charlotte/", "Charlotte, Nov 16 and 17"),
    ("/facilitate/", "Have Colton facilitate your retreat"),
    (MB + "/", "Catalyst Collective"), (MB + "/journey/", "Catalyst journeys"), (MB + "/model/", "Catalyst model"),
    (MB + "/surveys/", "Catalyst surveys"), (MB + "/surveys/alumni/", "Catalyst alumni survey (draft)"), (MB + "/library/", "Catalyst library"),
    (MB + "/library/offering/", "Catalyst: the Offering"), (MB + "/library/fit-finder/", "Catalyst: find your room"),
    (MB + "/library/video/", "Catalyst: the 60-second video"), (MB + "/library/memo/", "Catalyst: the strategy memo"),
    (MB + "/feedback/", "Catalyst feedback"),
]

# version, date, the short line (every footer), the full note (Feedback + changelog page, folded under the short line)
CHANGELOG = [
    ("3.3.0", "Tue / 2026-11-03", "the alumni survey page is three bullets on what the survey asks and then the twelve questions, once; the readable list, the note under every question and the audience-and-purpose box are gone.",
     "Colton's note on November 3: nobody reads a preamble above every question, and showing the same survey twice (a readable list, then the form) forces people to read far too much. The page now opens with three bullets, one per section of the survey (where you are today; what Catalyst and Bridge did for you; the Collective, and the price), and then the form, with a one-line status in place of the audience-and-purpose box. The sections went from four to three to match the bullets; the twelve questions, their order and the offer are unchanged. The links to the earlier drafts are one line under the form."),
    ("3.2.1", "Tue / 2026-11-03", "same pages as 3.2.0 with new asset addresses, so the mirror serves the new survey script at once.",
     "The mirror's content network had cached the 3.2.0 survey script under its new address before the deploy finished, so the pages were rebuilt under 3.2.1 to get fresh addresses. No content change."),
    ("3.2.0", "Tue / 2026-11-03", "the price question on the alumni and graduating-class surveys offers $2,500, $3,000, $3,500 and $4,000 and nothing lower; the alumni survey adds an offer: an honest answer with a name and email earns the first year at the $2,500 price.",
     "Colton's note on November 3: dues are paid up front for the year, so the survey does not float a price below what the program would ask. The $1,000 and $1,750 options are gone from the price question on the alumni survey and the graduating-class survey, and the question no longer anchors on Bridge. The alumni survey now carries an offer above the name and email fields, in the readable list and in the copied text: leave your name and email with an honest answer and the first year in the Collective is at the $2,500 price, the lowest option. Whether the price question stays in the survey at all is EO Nashville's call."),
    ("3.1.0", "Tue / 2026-11-03", "the alumni survey is cut from twenty-four questions to twelve and framed as EO Nashville exploring how to expand the Catalyst experience beyond graduation.",
     "On Colton's note of November 3 (combine questions, get to twelve or fewer, cut anything that would not change a decision about building the program, and never reference a council, since nobody outside it knows what that is). Four pairs became one question each: why you came with what problem you wanted help carrying; the biggest gap with whether the format became redundant; what is missing with anything else to know; and the explainer framing now opens the real-value question. Eight questions were dropped: how long ago you finished Catalyst, team size, annual revenue, the open most-valuable-part question (the 1-to-5 rating covers it), which track you would place yourself in, comfort with placement by intake, the mentor-an-hour-a-month question, and the 0-to-10 recommend score with its follow-up. The alumni page, the surveys page and the form status line now say EO Nashville where they said the council; the pages written for the group itself are unchanged. Every dropped question is still in the September 9 draft and the September 10 sample survey, linked from the page."),
    ("3.0.0", "Mon / 2026-11-02", "one site, two homes: the full-screen version at builtbycolton.com/catalystcollective/ is the address to share, forumplaybook.com carries a mirror built from the same source, and the Three Tracks Kit pages moved in under Already built.",
     "At Colton's direction on November 2, after the Catalyst Collective pages and the Three Tracks Kit (September 10, its own dark site) had drifted apart. The full-screen version at builtbycolton.com/catalystcollective/ is now the one to use with everybody; forumplaybook.com/concepts/catalystcollective/ is a mirror built from the same source files at the same moment, so the two cannot diverge again. The kit's four pages (the Offering, Find Your Room, the 60-second video script, the strategy memo) are now pages here under Already built, in this design, with their words kept; the kit's sample survey already lives on the alumni survey page. The kit's old addresses forward here. Version and changelog stay at the bottom of every page, one line per version, with the full notes on this page."),
    ("2.2.0", "Mon / 2026-11-02", "the alumni survey gets its own page (draft, not live): every proposed question readable with a note on what it is for, then the form.",
     "At Colton's direction after Sameera Lowe asked on November 2 where the list of questions for past Bridge members had gone. The page carries the wrapping text from the September 9 working draft (would the Collective represent real value to the people it is for), every question from that draft and from the September 10 sample survey in the Three Tracks Kit with a note on what each one is for, the same questions as a working form, and links to the earlier copies. It is marked as a draft, not live, a suggestion for how the council could solicit alumni feedback. The alumni form's overview link now points at this site instead of the old address."),
    ("2.1.3", "Wed / 2026-10-21", "the footer lists the Charlotte run of the Regional Training Experience.",
     "The footer lists the Charlotte run of the Regional Training Experience (November 16 and 17, 2026, hosted by EO Charlotte), so every page in the section links it."),
    ("2.1.2", "Mon / 2026-10-12", "on a phone, the row labels in Brittany's table and the main model stay in view while you swipe sideways.",
     "On a phone, the Revenue, Expense and Result labels in Brittany's table (and the People, Revenue, Costs and Result labels in the main model) now stay in view while you swipe sideways, instead of sliding off the left edge. The rest of the October 11 freeze was already live; this closes it. From Colton's October 12 email."),
    ("2.1.1", "Sun / 2026-10-11", "Brittany's budget table runs the full width of the page with a frozen heading row.",
     "Brittany's budget table runs the full width of the page, with her levers in a panel above it instead of a column beside it, and its heading row (Line, Fee, the year counts and amounts, her note) stays frozen at the top of the screen while you scroll, like a frozen row in a spreadsheet. On a phone, where the table is wider than the screen, the line names also stay frozen at the left while you swipe sideways. Her notes column now wraps instead of forcing a sideways scroll. From Colton's October 11 email."),
    ("2.1.0", "Thu / 2026-10-08", "Brittany Lorenzi's preliminary budget joins the model page as its own adjustable table.",
     "Brittany Lorenzi's preliminary budget joins the model page as its own adjustable table, at Colton's direction: her September 18 numbers are the defaults, every fee and count is a lever, and a version can be shared by link alongside the main model's. One transcription note, stated on the page: her sheet's year-2 recruitment event cell reads $1 with the fee and count columns transposed, so the page assumes the same one $500 event as year 1."),
    ("2.0.3", "Thu / 2026-10-08", "the feedback log says \"Proposed, waiting for approval\" instead of naming a beta lane.",
     "The feedback log calls a drafted change \"Proposed, waiting for approval\" instead of \"Proposed on beta\": there is no beta lane since the move. Drafts now wait on a branch until Colton approves them."),
    ("2.0.2", "Thu / 2026-10-08", "the footer lists the app page; every page carries the site's visitor counter.",
     "The footer lists the new app page, and every page carries the site's visitor counter like the rest of forumplaybook.com."),
    ("2.0.1", "Wed / 2026-10-07", "wording fix from Colton on one alumni survey option.",
     "Wording fix from Colton: \"deep dive\" is a specific part of an EO forum meeting, so the alumni survey option now reads \"Quarterly themed sessions led by EO members who solved my exact problem\"."),
    ("2.0.0", "Wed / 2026-10-07", "moved to forumplaybook.com and redesigned; getting in is now an application.",
     "Moved to forumplaybook.com/concepts/catalystcollective, at Colton's direction, and redesigned to match the Regional Training Days concept: the logo appears once, every section has an icon and its own timestamp, the three rooms and the prices are charts, the history is a timeline you can hover, the journeys branch from one trunk, and everything lifts or tilts on hover. Also from Colton: getting in is now an application. Catalyst graduates apply to the Collective, past alumni can apply at any time, and the committee invites applicants on the same kinds of factors EO weighs on an application, with Catalyst's revenue thresholds tiered by industry. The old address forwards here; the feedback box, the surveys and the #Calvin flow keep working, and everything already in the feedback log is still there."),
    ("1.2.1", "Fri / 2026-09-18", "the name carries its tagline at first reference on every page; the evolution of Bridge, not a rename.",
     "Naming rule from Colton, matched to the Three Tracks Kit and the long-form draft. The name now carries its tagline at first reference on every page (\"An ongoing membership, by invitation.\"), the overview opens with the one-sentence definition, and the older parenthetical that tied the name back to Bridge is gone. The framing is the evolution of Bridge, not a rename."),
    ("1.2.0", "Fri / 2026-09-18", "identity pass: the stacked vector lockup, EO navy with EO Blue, and Jay Graves's draft on its own page.",
     "Identity pass, at Colton's direction. The lockup is always stacked and traced to vector; the salmon from the Catalyst invitation is gone everywhere; the identity is EO's base navy with EO Blue as the one highlight. Jay Graves's Project Elevate draft gets its own full page."),
    ("1.1.0", "Fri / 2026-09-18", "attribution made explicit: the concept, where the room leaned, and perspectives kept apart on every page.",
     "Attribution made explicit everywhere, at Colton's direction: the concept Colton presented, where the room leaned on September 17 (Colton's read of the recording), and perspectives from individual council members under their own names are kept apart on every page. The reconvene time matches Sameera's calendar invite (October 14, 10:30 to 11:30 AM CT, on Zoom)."),
    ("1.0.0", "Thu / 2026-09-17", "first live version, built the afternoon of the September 17 meeting.",
     "First live version, built the afternoon of the September 17 strategic council: the overview, three journeys, the five-year model, four draft surveys, the library, the public feedback log with the #Calvin change-request flow, and the lockup. Brittany Lorenzi's stage-two model and Jay Graves's Project Elevate draft blended in the same afternoon."),
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


def changelog_short():
    """One line per version: the footer of every page (Colton, 2026-11-02: keep it light, findable, never detailed for everybody)."""
    return "".join(f"<li><b>{v}</b> ({d}): {html.escape(s, quote=False)}</li>" for v, d, s, _ in CHANGELOG)


def changelog_full():
    """The Feedback + changelog page: the short line, with the full note folded under it."""
    return "".join(f'<li><b>{v}</b> ({d}): {html.escape(s, quote=False)} <details class="cl-more"><summary>The full note</summary><p>{html.escape(f, quote=False)}</p></details></li>'
                   for v, d, s, f in CHANGELOG)


def expand(s, base):
    s = s.replace("{{FEEDBACK}}", feedback_box())
    s = re.sub(r"\{\{sh:([^}]*)\}\}", section_header, s)
    s = re.sub(r"\{\{icon:([a-z0-9-]+)(?::(thin|light))?\}\}", lambda m: icon(m.group(1), m.group(2) or "light"), s)
    s = s.replace("{{CHANGELOG}}", changelog_full())
    return s.replace("{{B}}", base).replace("{{OLD}}", OLD).replace("{{STAMP}}", STAMP).replace("{{VERSION}}", VERSION)


def footer_nav(current):
    links = []
    for path, label in SITE_PAGES:
        cur = ' aria-current="page"' if path == current else ""
        links.append(f'<a href="{path}"{cur}>{label}</a>')
    return '<nav class="cfoot-nav" aria-label="Site pages">' + " ".join(links) + "</nav>"


def tabs(current_slug, base):
    out = []
    for slug, _src, label, ic, *_ in PAGES:
        if label is None:
            continue
        is_cur = slug == current_slug or (slug != "" and current_slug.startswith(slug))
        cur = ' aria-current="page"' if is_cur else ""
        out.append(f'<a href="{base}/{slug}"{cur}>{icon(ic)}<span>{label}</span></a>')
    return '<nav class="cc-tabs" aria-label="Catalyst Collective pages">' + "".join(out) + "</nav>"


FAVICON = _icon.data_uri(_icon.favicon_svg("users-three", "light"))


def head(home, slug, title, desc, og, extra_head, full):
    base, site = home["base"], home["site"]
    url = f"{site}{base}/{slug}"
    ogurl = f"{site}{base}/{og}"
    robots = "noindex, nofollow" if full else "noindex"
    site_name = "Built by Colton" if full else "Forum Playbook"
    fonts = ("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=DM+Mono:wght@400;500&display=swap" if full else
             "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&family=Roboto:wght@400;500;700;900&display=swap")
    sheets = (f'<link rel="stylesheet" href="{base}/assets/cc.css?v={VERSION}">\n<link rel="stylesheet" href="{base}/assets/cc-full.css?v={VERSION}">' if full else
              f'<link rel="stylesheet" href="/interior.css">\n<link rel="stylesheet" href="/concepts/concepts.css">\n<link rel="stylesheet" href="{base}/assets/cc.css?v={VERSION}">')
    return f"""<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="{robots}">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="{FAVICON}">
<meta property="og:type" content="website" />
<meta property="og:site_name" content="{site_name}" />
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
<link href="{fonts}" rel="stylesheet">
{sheets}
{extra_head}
<script src="{base}/assets/js.js?v={VERSION}"></script>"""


def page(home, full, slug, src, label, ic, title, desc, og):
    base = home["base"]
    raw = open(os.path.join(SRC, src + ".html")).read()
    band, body = raw.split("<!--BODY-->", 1)
    extra_head = ""
    m = re.search(r"<!--HEAD(.*?)-->", band, re.S)
    if m:
        extra_head = m.group(1).strip()
        band = band.replace(m.group(0), "")
    scripts = f'<script src="{base}/assets/cc.js?v={VERSION}" defer></script>'
    for js in re.findall(r"<!--SCRIPT (\S+)-->", body):
        scripts += f'\n<script src="{base}/assets/{js}?v={VERSION}" defer></script>'
    body = re.sub(r"<!--SCRIPT \S+-->", "", body)
    pill = f'<span class="cc-pill">{icon("flask")}Concept only. Nothing here is adopted or approved.</span>'
    if full:
        stamp_block = f'<div class="cc-stamp"><span>{STAMP}<br>An evolving model &middot; v{VERSION}</span>{pill}</div>'
    else:
        stamp_block = (f'<div class="cc-stamp">{STAMP}<br>An evolving model &middot; v{VERSION}<br>'
                       f'<a href="{FULL_URL}/{slug}" target="_blank" rel="noopener">Full-screen version</a></div>')
    sheet = f"""<article class="cc">
    <section class="cc-band" aria-label="Catalyst Collective">
      <div class="cc-top">
        <div><a class="cc-lockup" href="{base}/" aria-label="Catalyst Collective overview">{LOCKUP}</a><div class="cc-tagline">An ongoing membership, by invitation.</div></div>
        {stamp_block}
      </div>
{expand(band, base).strip()}
      {tabs(slug, base)}
    </section>
    <div class="cc-body">
{expand(body, base).strip()}
    </div>
    <footer class="cc-foot">
      <p><b>Concept only.</b> A working concept for EO Nashville, prepared by Colton Mulligan. Not an official EO Nashville publication, not an adopted program, not a board decision, not a promise to anyone.</p>
      {'<p>These pages are kept at <a href="' + FULL_URL + '/">builtbycolton.com/catalystcollective</a>, the address to share; <a href="' + MIRROR_URL + '/' + slug + '" target="_blank" rel="noopener">forumplaybook.com</a> carries a mirror built from the same source.</p>' if full else
       '<p>This is the mirror. The full-screen version, the address to share, is <a href="' + FULL_URL + '/' + slug + '" target="_blank" rel="noopener">builtbycolton.com/catalystcollective</a>; both are built from the same source at the same moment.</p>'}
      {'<details class="cfoot-ver"><summary>v' + VERSION + ' &middot; changelog</summary><ul>' + changelog_short() + '</ul></details>' if full else ''}
    </footer>
  </article>"""
    if full:
        return f"""<!DOCTYPE html>
<html lang="en" data-base="{base}"><head>
{head(home, slug, title, desc, og, extra_head, True)}
</head><body class="cc-full">
<main id="main">
  {sheet}
</main>
<!--BBC-FOOT-->
{scripts}
</body></html>
"""
    return f"""<!DOCTYPE html>
<html lang="en" data-base="{base}"><head>
{head(home, slug, title, desc, og, extra_head, False)}
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
  <div class="cc-row"><p class="kicker">[ An evolving model ]</p>{pill}</div>
  {sheet}

  <a class="more" href="/concepts/"><strong>More concepts and half-baked ideas</strong><span>forumplaybook.com/concepts &rarr;</span></a>
</main>
{scripts}
<footer class="cfoot">
  {footer_nav(base + "/" + slug)}
  <p class="cfoot-line"><b>Concept only.</b> Not adopted, not approved, not solicitation. &middot; Built by Colton &middot; <a href="https://builtbycolton.com" target="_blank" rel="noopener">builtbycolton.com</a></p>
  <details class="cfoot-ver"><summary>v{VERSION} &middot; changelog</summary><ul>{changelog_short()}</ul></details>
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


def guard(files, full):
    bad = 0
    for f in files:
        s = open(f).read()
        if "\u2014" in s:
            print("  FAIL em dash in", f); bad += 1
        if f.endswith(".html"):
            needs = [STAMP, 'id="fb-form"', 'og:image', 'builtbycolton.com', 'data-base=']
            needs += ['<!--BBC-FOOT-->', 'class="cc-full"'] if full else ["cloudflareinsights", 'class="cfoot-nav"']
            for need in needs:
                if need not in s:
                    print("  FAIL", f, "is missing", need); bad += 1
            left = re.findall(r"\{\{[^}]*\}\}", s)
            if left:
                print("  FAIL leftover tokens in", f, left[:3]); bad += 1
            if re.search(r' style="', s):
                print("  FAIL inline style attribute in", f, "(the builtbycolton.com policy forbids it)"); bad += 1
            inline = [m for m in re.findall(r"<script(?![^>]*src=)[^>]*>", s)]
            if full and inline:
                print("  FAIL inline script in", f, inline[:2]); bad += 1
            if len(re.findall(r"<h1[ >]", s)) != 1:
                print("  FAIL", f, "needs exactly one h1"); bad += 1
            for a in re.findall(r'<a [^>]*href="https?://[^"]*"[^>]*>', s):
                if "builtbycolton.com" not in a and 'target="_blank"' not in a:
                    print("  FAIL off-site link without a new tab in", f, a[:90]); bad += 1
    return bad


def main():
    bad = 0
    for name, home in HOMES.items():
        full = name == "full"
        out_root = home["out"]
        if full:
            if not os.path.isdir(os.path.dirname(out_root)):
                print(f"  SKIP full-screen home: {os.path.dirname(out_root)} is not on this machine (set CC_FULL_OUT)")
                continue
            if os.path.isdir(out_root):
                shutil.rmtree(out_root)
            os.makedirs(out_root)
            shutil.copytree(os.path.join(CC, "assets"), os.path.join(out_root, "assets"))
            shutil.copy(os.path.join(CC, "og.png"), os.path.join(out_root, "og.png"))
        built = []
        for p in PAGES:
            slug = p[0]
            out_dir = os.path.join(out_root, slug)
            os.makedirs(out_dir, exist_ok=True)
            out = os.path.join(out_dir, "index.html")
            open(out, "w").write(page(home, full, *p))
            built.append(out)
        print(f"  built {len(built)} pages for the {name} home at {out_root}")
        assets = [os.path.join(out_root, "assets", x) for x in os.listdir(os.path.join(out_root, "assets")) if x.endswith((".js", ".css"))]
        bad += guard(built + assets, full)
    patch_footer(os.path.join(ROOT, "concepts", "index.html"), "/concepts/")
    patch_footer(os.path.join(ROOT, "concepts", "regionaltrainingexperience", "index.html"), "/concepts/regionaltrainingexperience/")
    patch_footer(os.path.join(ROOT, "concepts", "regionaltrainingexperience", "charlotte", "index.html"), "/concepts/regionaltrainingexperience/charlotte/")
    patch_footer(os.path.join(ROOT, "chapters", "index.html"), "/chapters/")
    if bad:
        sys.exit(f"{bad} guard failure(s)")
    print(f"ok: v{VERSION}, {STAMP}")


if __name__ == "__main__":
    main()
