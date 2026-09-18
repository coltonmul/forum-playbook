#!/usr/bin/env python3
"""
5% REFLECTION SHEET MOCKUPS: the generator.

VERSION 0.1.0

What this builds, into the folder above this one (mockups/5-percent-reflection/):
  - six one-page sheets as HTML: three content iterations (A, B, C), each in a
    Forum Playbook version and a neutral version that never says the name
  - a print-verified PDF and a PNG preview of each sheet
  - index.html, the gallery page Colton picks from
  - og.png, the 1200x630 link-preview card for the gallery

One generator on purpose: six hand-kept files drift, one template cannot.
NEVER hand-edit the generated files. Change this script and rerun it:

    python3 mockups/5-percent-reflection/_build/build.py

This folder starts with an underscore so GitHub Pages (Jekyll) leaves it off
the published site. It still lives in the repo.

Source for the sheet's flow: Colton's "F14 5% Update Form 2026+" (Google Doc in
Forum 14 / Forms for Presentations and 5% Reflections). Source for the split:
his Sept 2026 note to the EO trainer community (EQ first and biggest, IQ last).
Tokens, fonts and chrome runs come from templates/TEMPLATE-CONTRACT.md. The
sheet is a NEW document type (write-in fields are not in the contract's block
library), so the geometry here is the sheet's own: half-inch side margins.

Needs: Google Chrome (headless PDF + screenshots), poppler (pdfinfo, pdffonts,
pdftoppm). Fails loudly if a PDF is not exactly one page, if the brand fonts did
not embed, or if an em dash sneaks into any generated file.

Changelog
  0.1.0 (2026-09-18) first build: iterations A, B, C in two versions each.
"""

import datetime
import html
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from zoneinfo import ZoneInfo

VERSION = "0.1.0"
SHEET_VERSION = "v0.1"

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SITE = "https://forumplaybook.com/mockups/5-percent-reflection/"
EM_DASH = chr(0x2014)

NOW = datetime.datetime.now(ZoneInfo("America/Chicago"))
STAMP = NOW.strftime("%a / %Y-%m-%d / ") + NOW.strftime("%I:%M %p CT").lstrip("0")
MONTH_YEAR = NOW.strftime("%B %Y")

FP_FAVICON = ("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>"
              "<circle cx='16' cy='16' r='16' fill='%23F0EBE0'/><text x='50%25' y='54%25' "
              "dominant-baseline='middle' text-anchor='middle' font-family='Roboto,sans-serif' "
              "font-weight='700' font-size='13' fill='%23E8521A' letter-spacing='0.5'>FP</text></svg>")
NEUTRAL_FAVICON = ("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>"
                   "<rect width='32' height='32' fill='%23FFFFFF'/><rect x='1' y='1' width='30' height='30' "
                   "fill='none' stroke='%230E0E0C' stroke-width='2'/><text x='50%25' y='56%25' "
                   "dominant-baseline='middle' text-anchor='middle' font-family='Roboto,sans-serif' "
                   "font-weight='700' font-size='13' fill='%230E0E0C'>5%25</text></svg>")

# ---------------------------------------------------------------- iterations

ITERATIONS = [
    {
        "key": "a",
        "name": "Labels Only",
        "bet": "The least on the page: zone labels, column heads, numbers. For a forum that already knows the system.",
        "adds": [
            "Two zone labels: EQ · THE 5% and IQ · LEARNING",
            "Your four column heads, unchanged",
            "Nothing else to read",
        ],
    },
    {
        "key": "b",
        "name": "A Sentence Each",
        "bet": "A, plus one sentence per zone saying what belongs there. EQ is the whys. IQ is the what and the how.",
        "adds": [
            "EQ: the whys, and your line that if anybody outside the forum knows it, it is not 5%",
            "IQ: the what and the how, name 1-2 topics to bring to the room",
            "The sentences ride inside the label strips",
        ],
    },
    {
        "key": "c",
        "name": "With the Agenda",
        "bet": "B, plus the meeting itself: where each zone lands in the agenda, and a way to route every topic as it comes up.",
        "adds": [
            "A time bar: first ~2 hrs EQ, then 1-2 impromptu EQ deep dives, last ~30 min IQ lightning rounds",
            "A check box on every topic: parking lot, or today's queue",
            "Your three example IQ topics, so nobody stares at a blank box",
        ],
    },
]

SKINS = [
    {"key": "forum-playbook", "label": "Forum Playbook"},
    {"key": "neutral", "label": "Neutral"},
]

EQ_SAY = "The whys: fears, dreams, doubts. If anybody outside the forum knows it, it is not 5%."
IQ_SAY = "The what and the how: process, tools, facts and figures. Name 1-2 topics to bring to the room."
IQ_EG = ("e.g. your best use of AI right now &nbsp;·&nbsp; comp, bonuses, and benefits that keep your people "
         "&nbsp;·&nbsp; company culture in a hybrid/virtual world")


def base(it, skin):
    return f"5-percent-reflection-{it['key']}-{skin['key']}-{SHEET_VERSION}"


# ---------------------------------------------------------------- sheet CSS

SHEET_CSS = """
/* GENERATED by _build/build.py. Tokens, fonts and chrome runs per
   templates/TEMPLATE-CONTRACT.md. Geometry is the sheet's own: a write-on
   form wants the width, so side margins are 0.5in, not the one-pager's 0.875in. */
:root {
  --pitch: #0E0E0C; --burn: #E8521A; --brick: #B83A14; --teal: #3A8A8A;
  --linen: #F0EBE0; --dust: #C4B8A8; --deep-dust: #4A4038; --line: #C8C0B4;
  --chrome: Consolas, 'Menlo', 'Courier New', monospace;
  --display: 'Big Shoulders Display', 'Arial Narrow', sans-serif;
  --body: 'Roboto', Arial, sans-serif;
  --g4: 25.5% 24% 15% 35.5%;   /* column widths follow the current Forum 14 sheet */
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: #8B8880; }
body { font-family: var(--body); color: var(--pitch);
       -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@page { size: 8.5in 11in; margin: 0; }
.page { width: 8.5in; height: 11in; background: #FFFFFF; margin: 24px auto;
        padding: 0.36in 0.5in; box-shadow: 0 6px 28px rgba(0,0,0,0.35);
        display: flex; flex-direction: column; overflow: hidden; }
@media print {
  html, body { background: #FFFFFF; }
  .page { margin: 0; box-shadow: none; }
  .print-btn { display: none; }
}
/* header chrome (run sizes from the contract, section 5) */
.doc-header { font-family: var(--chrome); white-space: nowrap; line-height: 1; flex: 0 0 auto; }
.h-mark  { font-size: 8pt;   color: var(--burn); }
.h-name  { font-size: 8pt;   font-weight: 700; color: var(--pitch); }
.h-gap   { font-size: 5.5pt; color: var(--dust); }
.h-cat   { font-size: 6pt;   font-weight: 700; color: var(--burn); }
.h-sep   { font-size: 6pt;   color: var(--dust); }
.h-doc   { font-size: 5.5pt; color: var(--dust); }
.h-title { font-size: 6pt;   font-weight: 700; color: var(--pitch); }
.h-ver   { font-size: 6pt;   font-weight: 700; color: var(--pitch); }
.h-meta  { font-size: 6.5pt; color: var(--dust); }
.neutral .h-title { font-size: 8pt; }

.doc-body { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; margin: 9pt 0 7pt; }

/* title + date */
.title-row { display: flex; align-items: flex-end; justify-content: space-between; flex: 0 0 auto; }
h1 { font-family: var(--display); font-weight: 900; text-transform: uppercase;
     font-size: 25pt; line-height: 0.95; letter-spacing: -0.5px; color: var(--pitch); }
.date { font-family: var(--chrome); font-size: 7.5pt; font-weight: 700; letter-spacing: 0.08em;
        color: var(--deep-dust); display: flex; align-items: flex-end; gap: 5pt; padding-bottom: 2pt; }
.blank { display: inline-block; border-bottom: 0.75pt solid var(--deep-dust); height: 1em; }
.date .blank { width: 1.6in; }

/* the four ratings */
.rate-row { display: flex; align-items: center; margin-top: 8pt; flex: 0 0 auto; }
.rates { display: grid; grid-template-columns: repeat(4, 1.28in); align-items: center; }
.rate { display: flex; align-items: center; gap: 6pt; }
.rate .box { width: 0.37in; height: 0.37in; border: 0.75pt solid var(--deep-dust); }
.rate .lbl { font-weight: 700; font-size: 9pt; letter-spacing: 0.06em; text-transform: uppercase; }
.rate-hint { margin-left: auto; font-family: var(--chrome); font-size: 7pt; letter-spacing: 0.05em;
             color: var(--deep-dust); }

/* zones */
.zone { position: relative; border: 0.5pt solid var(--line); border-top: 2pt solid var(--zc);
        display: flex; flex-direction: column; }
.zone.eq { --zc: var(--burn); flex: 1 1 auto; min-height: 0; margin-top: 9pt; }
.zone.iq { --zc: var(--teal); flex: 0 0 auto; margin-top: 8pt; }
.zone-head { display: flex; align-items: baseline; gap: 9pt; padding: 4pt 7pt 3pt; flex: 0 0 auto; }
.zone-name { font-family: var(--display); font-weight: 700; font-size: 15pt; line-height: 1;
             letter-spacing: 0.02em; text-transform: uppercase; color: var(--zc); white-space: nowrap; }
.zone-say { font-size: 8.5pt; line-height: 1.25; color: var(--deep-dust); }
.zone-eg { font-size: 7.5pt; line-height: 1.25; font-style: italic; color: var(--deep-dust);
           padding: 0 7pt 3pt; flex: 0 0 auto; }

.cols-head { display: grid; grid-template-columns: var(--g4); background: var(--linen);
             border-top: 0.5pt solid var(--line); border-bottom: 0.5pt solid var(--line); flex: 0 0 auto; }
.cols-head > div { font-weight: 700; font-size: 8.5pt; line-height: 1.15; padding: 4pt 5pt;
                   text-align: center; border-left: 0.5pt solid var(--line);
                   display: flex; flex-direction: column; justify-content: center; }
.cols-head > div:first-child { border-left: 0; }
.cols-head small { display: block; font-weight: 400; font-size: 7pt; color: var(--deep-dust); }
.cols-head .narrow { font-size: 7.5pt; white-space: nowrap; padding-left: 2pt; padding-right: 2pt; }

.eq-rows { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }
.erow { flex: 1 1 0; min-height: 0; display: grid; grid-template-columns: var(--g4);
        border-top: 0.5pt solid var(--line); }
.erow:first-child { border-top: 0; }
.cell { position: relative; padding: 4pt 6pt; border-left: 0.5pt solid var(--line); }
.cell:first-child { border-left: 0; }
.num { font-family: var(--display); font-weight: 900; font-size: 15pt; line-height: 1; color: var(--zc); }

.iq-row { display: grid; grid-template-columns: 1fr 1fr; border-top: 0.5pt solid var(--line); flex: 0 0 auto; }
.iq-row .cell { height: 0.74in; }

/* iteration C: route every topic as it comes up */
.route { position: absolute; right: 6pt; bottom: 4pt; display: flex; gap: 9pt;
         font-family: var(--chrome); font-size: 6pt; letter-spacing: 0.06em;
         text-transform: uppercase; color: var(--deep-dust); white-space: nowrap; }
.route i { display: inline-block; width: 6.5pt; height: 6.5pt; border: 0.6pt solid var(--deep-dust);
           margin-right: 3pt; vertical-align: -1.2pt; }

/* the wager */
.wager { display: flex; align-items: flex-end; gap: 6pt; margin-top: 12pt; flex: 0 0 auto;
         font-weight: 700; font-size: 8.5pt; letter-spacing: 0.05em; text-transform: uppercase; }
.wager .grow { flex: 1 1 auto; }
.wager .short { width: 0.95in; }
.wager .gap { width: 10pt; }

/* iteration C: the agenda, drawn to scale */
.agenda { margin-top: 10pt; flex: 0 0 auto; }
.agenda-head { display: flex; justify-content: space-between; font-family: var(--chrome);
               font-size: 6.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
               color: var(--deep-dust); margin-bottom: 3pt; }
.agenda-head span + span { font-weight: 400; }
.scale { display: flex; gap: 1.5pt; }
.scale > * { min-width: 0; }
.s1 { flex: 120 1 0; } .s2 { flex: 60 1 0; } .s3 { flex: 30 1 0; }
.agenda-bar > * { height: 5pt; }
.agenda-bar .s1 { background: var(--burn); }
.agenda-bar .s2 { background: var(--brick); }
.agenda-bar .s3 { background: var(--teal); }
.agenda-caps { display: grid; grid-template-columns: 1fr 1.1fr 1.5fr; gap: 12pt; margin-top: 4pt; }
.agenda-caps div { font-size: 7.5pt; line-height: 1.25; color: var(--pitch); }
.agenda-caps b { font-family: var(--chrome); font-size: 6.5pt; letter-spacing: 0.06em; }
.chip { display: inline-block; width: 6pt; height: 6pt; margin-right: 3pt; vertical-align: -0.4pt; }
.chip.c1 { background: var(--burn); } .chip.c2 { background: var(--brick); } .chip.c3 { background: var(--teal); }

/* footer chrome (run sizes from the contract, section 6) */
.doc-footer { font-family: var(--chrome); white-space: nowrap; line-height: 1; flex: 0 0 auto;
              display: flex; align-items: baseline; justify-content: space-between; }
.f-mark { font-size: 7pt; color: var(--burn); }
.f-name { font-size: 7pt; font-weight: 700; color: var(--pitch); }
.f-tag  { font-size: 6pt; color: var(--dust); }
.f-url  { font-size: 5.5pt; color: var(--dust); }
.f-by   { font-size: 6pt; color: var(--deep-dust); }

.print-btn { position: fixed; top: 16px; right: 16px; z-index: 10; font-family: var(--chrome);
             font-size: 12px; font-weight: 700; letter-spacing: 0.08em; background: var(--burn);
             color: #FFFFFF; border: none; padding: 14px 20px; min-height: 44px; cursor: pointer; }
.print-btn:hover { background: var(--brick); }
.neutral .print-btn { background: var(--pitch); }
.neutral .print-btn:hover { background: var(--deep-dust); }
"""


def sheet_html(it, skin):
    k = it["key"]
    fp = skin["key"] == "forum-playbook"
    letter = k.upper()
    rich = k in ("b", "c")
    agenda = k == "c"

    if fp:
        title_tag = f"5% Reflection Sheet, Mockup {letter} {SHEET_VERSION} | Forum Playbook"
        favicon = FP_FAVICON
        header = (
            '<header class="doc-header"><span class="h-mark">⎇ </span><span class="h-name">FORUM PLAYBOOK</span>'
            '<span class="h-gap">&nbsp;&nbsp;&nbsp;</span><span class="h-cat">[ MEETING TOOLS ]</span>'
            '<span class="h-sep">&nbsp;&nbsp;│&nbsp;&nbsp;</span><span class="h-doc">DOCUMENT&nbsp;&nbsp;</span>'
            f'<span class="h-title">5% REFLECTION SHEET · MOCKUP {letter}</span>'
            f'<span class="h-sep">&nbsp;&nbsp;│&nbsp;</span><span class="h-ver">{SHEET_VERSION}&nbsp;</span>'
            f'<span class="h-sep">│&nbsp;</span><span class="h-meta">Updated: {MONTH_YEAR}&nbsp;</span>'
            '<span class="h-sep">│&nbsp;</span><span class="h-meta">ForumPlaybook.com</span></header>'
        )
        footer = (
            '<footer class="doc-footer"><span><span class="f-mark">⎇ </span>'
            '<span class="f-name">FORUM PLAYBOOK&nbsp;&nbsp;</span>'
            '<span class="f-tag">A Resource Hub for Forums, Moderators, &amp; Facilitators.</span></span>'
            '<span><span class="f-by">Built by Colton with Claude</span>'
            '<span class="f-url">&nbsp;&nbsp;│&nbsp;&nbsp;ForumPlaybook.com</span></span></footer>'
        )
    else:
        title_tag = f"5% Reflection Sheet, Mockup {letter} {SHEET_VERSION}"
        favicon = NEUTRAL_FAVICON
        header = (
            '<header class="doc-header"><span class="h-title">5% REFLECTION SHEET</span>'
            f'<span class="h-sep">&nbsp;&nbsp;│&nbsp;&nbsp;</span><span class="h-meta">MOCKUP {letter}&nbsp;</span>'
            f'<span class="h-sep">│&nbsp;</span><span class="h-ver">{SHEET_VERSION}&nbsp;</span>'
            f'<span class="h-sep">│&nbsp;</span><span class="h-meta">Updated: {MONTH_YEAR}</span></header>'
        )
        footer = (
            '<footer class="doc-footer"><span class="f-by">From EO Nashville\'s Forum 14.</span>'
            '<span class="f-by">Built by Colton with Claude</span></footer>'
        )

    eq_say = f'<span class="zone-say">{EQ_SAY}</span>' if rich else ""
    iq_say = f'<span class="zone-say">{IQ_SAY}</span>' if rich else ""
    iq_eg = f'<div class="zone-eg">{IQ_EG}</div>' if agenda else ""
    eq_route = '<div class="route"><span><i></i>Parking lot</span><span><i></i>Today\'s queue</span></div>' if agenda else ""
    iq_route = '<div class="route"><span><i></i>Today\'s lightning round</span></div>' if agenda else ""

    rows = "\n".join(
        f'        <div class="erow"><div class="cell"><span class="num">{n}</span></div>'
        f'<div class="cell"></div><div class="cell"></div><div class="cell">{eq_route}</div></div>'
        for n in (1, 2, 3)
    )

    agenda_html = ""
    if agenda:
        agenda_html = """
    <div class="agenda">
      <div class="agenda-head"><span>How the meeting uses this sheet</span><span>EQ first and biggest, IQ last and short</span></div>
      <div class="scale agenda-bar"><span class="s1"></span><span class="s2"></span><span class="s3"></span></div>
      <div class="agenda-caps">
        <div><span class="chip c1"></span><b>FIRST ~2 HRS · EQ</b><br>5% reflections + the planned deep dive.</div>
        <div><span class="chip c2"></span><b>NEXT 30-60 MIN · EQ</b><br>1-2 impromptu deep dives, open coached, ~30 min each.</div>
        <div><span class="chip c3"></span><b>LAST ~30 MIN · IQ</b><br>2-4 lightning rounds, 10-12 min each: a 2 minute topic overview, then 1-minute shares.</div>
      </div>
    </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=864">
<meta name="robots" content="noindex, nofollow">
<!-- GENERATED {STAMP} by mockups/5-percent-reflection/_build/build.py v{VERSION}.
     Do not hand-edit: change the generator and rerun it. -->
<title>{title_tag}</title>
<link rel="icon" href="{favicon}"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>{SHEET_CSS}</style>
</head>
<body class="{'fp' if fp else 'neutral'} iter-{k}">

<button class="print-btn" onclick="window.print()">⎙ PRINT</button>

<div class="page">
  {header}

  <main class="doc-body">
    <div class="title-row">
      <h1>Monthly 5% Reflection</h1>
      <div class="date">DATE <span class="blank"></span></div>
    </div>

    <div class="rate-row">
      <div class="rates">
        <div class="rate"><span class="box"></span><span class="lbl">Career</span></div>
        <div class="rate"><span class="box"></span><span class="lbl">Family</span></div>
        <div class="rate"><span class="box"></span><span class="lbl">Self</span></div>
        <div class="rate"><span class="box"></span><span class="lbl">Forum</span></div>
      </div>
      <div class="rate-hint">[ RATE EACH ON A SCALE OF 1-10 ]</div>
    </div>

    <section class="zone eq">
      <div class="zone-head"><span class="zone-name">EQ · The 5%</span>{eq_say}</div>
      <div class="cols-head">
        <div>Headline</div>
        <div>Significance / Impact</div>
        <div class="narrow">Emotions / Feelings<small>(3+ words)</small></div>
        <div>What do I realize about myself?</div>
      </div>
      <div class="eq-rows">
{rows}
      </div>
    </section>

    <section class="zone iq">
      <div class="zone-head"><span class="zone-name">IQ · Learning</span>{iq_say}</div>
      {iq_eg}
      <div class="iq-row">
        <div class="cell"><span class="num">1</span>{iq_route}</div>
        <div class="cell"><span class="num">2</span>{iq_route}</div>
      </div>
    </section>

    <div class="wager"><span>Next month's personal wager</span><span class="blank grow"></span><span class="gap"></span><span>Cash on the line $</span><span class="blank short"></span></div>
{agenda_html}
  </main>

  {footer}
</div>

</body>
</html>
"""


# ---------------------------------------------------------------- chrome helpers

_RUNS = [0]


def chrome(args, profile, done_marker, timeout=60):
    """Headless Chrome on this Mac writes its output and then never exits (seen 2026-09-18, Chrome 153).
    So: start it, watch its log for the line that says the output is complete, then stop the ONE
    process this script started. Each run gets a fresh profile folder so no stale lock carries over.
    Returns everything Chrome printed."""
    _RUNS[0] += 1
    run_dir = Path(profile) / f"run-{_RUNS[0]}"
    run_dir.mkdir(parents=True, exist_ok=True)
    log_path = run_dir / "chrome.log"
    cmd = [CHROME, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
           f"--user-data-dir={run_dir / 'profile'}", "--hide-scrollbars"] + args
    with open(log_path, "w") as log:
        proc = subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT)
    deadline = time.time() + timeout
    while time.time() < deadline:
        if done_marker in log_path.read_text(errors="replace") or proc.poll() is not None:
            break
        time.sleep(0.25)
    time.sleep(0.4)
    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=8)
        except subprocess.TimeoutExpired:
            proc.kill()
    return log_path.read_text(errors="replace")


def render_pdf(html_path, pdf_path, profile):
    if pdf_path.exists():
        pdf_path.unlink()
    chrome(["--no-pdf-header-footer", f"--print-to-pdf={pdf_path}", html_path.as_uri()],
           profile, "bytes written to file")
    if not pdf_path.exists():
        sys.exit(f"FAILED: Chrome wrote no PDF for {html_path.name}")
    info = subprocess.run(["pdfinfo", str(pdf_path)], capture_output=True, text=True).stdout
    pages = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    if pages != 1:
        sys.exit(f"FAILED: {pdf_path.name} is {pages} pages. A sheet is exactly one.")
    fonts = subprocess.run(["pdffonts", str(pdf_path)], capture_output=True, text=True).stdout
    for needed in ("BigShoulders", "Roboto"):
        if needed not in fonts:
            sys.exit(f"FAILED: {needed} did not embed in {pdf_path.name} (fonts CDN unreachable?).\n{fonts}")


def measure(html_path, profile, tmpdir):
    """Row heights in inches, measured in a throwaway copy so the shipped HTML carries no script."""
    probe = Path(tmpdir) / ("probe-" + html_path.name)
    script = """<script>
document.fonts.ready.then(function () {
  var d = document.documentElement, p = document.querySelector('.page');
  d.setAttribute('data-eq-in', (document.querySelector('.erow').getBoundingClientRect().height / 96).toFixed(2));
  d.setAttribute('data-iq-in', (document.querySelector('.iq-row').getBoundingClientRect().height / 96).toFixed(2));
  d.setAttribute('data-eqzone-in', (document.querySelector('.zone.eq').getBoundingClientRect().height / 96).toFixed(2));
  d.setAttribute('data-say-lines', Array.prototype.map.call(document.querySelectorAll('.zone-say'),
      function (e) { return Math.round(e.getBoundingClientRect().height / 14.17); }).join(','));
  var last = document.querySelector('.doc-footer').getBoundingClientRect().bottom;
  d.setAttribute('data-fits', last <= p.getBoundingClientRect().bottom ? 'yes' : 'NO');
});
</script></body>"""
    probe.write_text(html_path.read_text(encoding="utf-8").replace("</body>", script), encoding="utf-8")
    dom = chrome(["--virtual-time-budget=6000", "--window-size=900,1200", "--dump-dom", probe.as_uri()],
                 profile, "</html>")
    got = {}
    for key in ("eq-in", "iq-in", "eqzone-in", "say-lines", "fits"):
        m = re.search(rf'data-{key}="([^"]*)"', dom)
        got[key] = m.group(1) if m else None
    if got["fits"] != "yes":
        sys.exit(f"FAILED: {html_path.name} does not fit its page: {got}")
    return got


def context_words(page_html):
    """Words a member has to read, not counting the chrome lines, the title, or the labels on every version."""
    body = re.search(r'<main class="doc-body">(.*?)</main>', page_html, re.S).group(1)
    words = 0
    for cls in ("zone-say", "zone-eg", "route", "agenda"):
        for m in re.finditer(rf'<(span|div) class="{cls}">(.*?)</\1>' if cls != "agenda"
                             else r'<div class="agenda">(.*?)\n    </div>', body, re.S):
            text = html.unescape(re.sub(r"<[^>]+>", " ", m.group(m.lastindex)))
            words += len(re.findall(r"[A-Za-z0-9%~'/+-]+", text))
    return words


# ---------------------------------------------------------------- gallery page

GALLERY_CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --pitch: #0E0E0C; --burn: #E8521A; --brick: #B83A14; --gold: #D4A832;
  --teal: #3A8A8A; --blue: #2A6E9A; --linen: #F0EBE0; --linen-dk: #E8E2D6;
  --dust: #C4B8A8; --deep-dust: #4A4038; --ink2: #5A5048; --border: #C8C0B4;
  --disp: 'Big Shoulders Display', 'Arial Narrow', sans-serif;
  --sans: 'DM Sans', sans-serif; --mono: 'DM Mono', monospace;
}
html { background: var(--linen); scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { font-family: var(--sans); font-size: 17px; line-height: 1.6; color: var(--pitch);
       background: var(--linen); -webkit-font-smoothing: antialiased; }
.wrap { max-width: 1160px; margin: 0 auto; padding: 0 32px; }
.ribbon { position: sticky; top: 0; z-index: 60; background: var(--gold); color: var(--pitch);
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; text-align: center;
  padding: 7px 12px; text-transform: uppercase; }
.hero { padding: 34px 0 6px; }
.hero-grid { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: start; }
.annot { font-family: var(--mono); font-size: 11px; color: var(--ink2); letter-spacing: 0.18em;
  text-transform: uppercase; display: flex; gap: 10px; align-items: center; margin-bottom: 14px; }
.annot-box { border: 0.5px solid var(--ink2); padding: 2px 6px; }
.annot-line { width: 40px; height: 0.5px; background: var(--ink2); }
h1 { font-family: var(--disp); font-weight: 900; font-size: clamp(46px, 7vw, 84px); line-height: 0.88;
  letter-spacing: -1px; text-transform: uppercase; }
h1 .burn { color: var(--burn); } h1 .teal { color: var(--teal); }
.hero-sub { font-size: 19px; font-weight: 300; color: var(--deep-dust); margin-top: 18px; max-width: 62ch; }
.stats { display: flex; gap: 30px; padding-top: 40px; }
.stat-num { font-family: var(--disp); font-weight: 900; font-size: 60px; line-height: 1; }
.stat-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--ink2); margin-top: 6px; max-width: 12ch; }

.sec { margin: 44px 0; }
.sec-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
.sec-tag { font-family: var(--mono); font-size: 11px; letter-spacing: 0.16em; color: var(--brick);
  border: 0.5px solid var(--brick); padding: 3px 8px; text-transform: uppercase; }
.sec-title { font-family: var(--disp); font-size: 34px; font-weight: 900; letter-spacing: 0.02em;
  text-transform: uppercase; line-height: 1; }
.sec-rule { flex: 1; min-width: 40px; height: 0.5px; background: var(--border); }

/* buttons: the locked two-wave (brand rule 2) */
@keyframes wave1 { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes wave2 { from { transform: translateX(-100%); } to { transform: translateX(0); } }
.sh { position: relative; overflow: hidden; cursor: pointer; display: inline-flex; align-items: center;
  justify-content: center; min-height: 44px; transition: box-shadow 0.5s ease, transform 0.3s ease; }
.sh::before, .sh::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); }
.sh::after { z-index: 1; }
.sh:hover::before, .sh:focus-visible::before { animation: wave1 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0s forwards; }
.sh:hover::after, .sh:focus-visible::after { animation: wave2 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.32s forwards; }
.sh > span { position: relative; z-index: 2; transition: color 0.12s ease 0.32s; }
.warm::before { background: var(--gold); } .warm::after { background: var(--teal); }
.warm:hover, .warm:focus-visible { box-shadow: 0 8px 28px rgba(58, 138, 138, 0.5); transform: translateY(-2px); }
.cool::before { background: var(--teal); } .cool::after { background: var(--blue); }
.cool:hover, .cool:focus-visible { box-shadow: 0 8px 28px rgba(42, 110, 154, 0.5); transform: translateY(-2px); }
.sh:hover > span, .sh:focus-visible > span { color: #fff; }
.btn { font-family: var(--mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 10px 16px; text-decoration: none; border: 0.5px solid var(--border); background: transparent;
  color: var(--deep-dust); }
.btn-primary { background: var(--burn); border-color: var(--burn); color: #fff; }
.btn-ghost { border-color: #6E6558; }
.btn.on { background: var(--pitch); border-color: var(--pitch); color: #fff; }
@media (prefers-reduced-motion: reduce) {
  .sh::before, .sh::after { animation: none !important; } .sh { transition: none; }
}

.toggle { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.toggle-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--ink2); margin-right: 4px; }

.pick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start; }
.pick { background: #fff; border: 0.5px solid #D4CCC0; position: relative; padding: 20px;
  display: flex; flex-direction: column; gap: 12px; }
.tick-tl { position: absolute; top: -1px; left: -1px; width: 12px; height: 12px;
  border-top: 1px solid var(--burn); border-left: 1px solid var(--burn); }
.tick-br { position: absolute; bottom: -1px; right: -1px; width: 12px; height: 12px;
  border-bottom: 1px solid var(--dust); border-right: 1px solid var(--dust); }
.pick h3 { font-family: var(--disp); font-size: 26px; font-weight: 900; text-transform: uppercase; line-height: 1; }
.pick h3 b { color: var(--burn); font-weight: 900; }
.shot { display: block; border: 0.5px solid var(--border); background: #fff; line-height: 0;
  box-shadow: 0 4px 18px rgba(14, 14, 12, 0.10); }
.shot img { width: 100%; height: auto; display: block; }
.bet { font-size: 15px; font-weight: 300; color: var(--deep-dust); line-height: 1.5; }
.pick ul { margin: 0 0 0 18px; font-size: 14px; font-weight: 300; color: var(--deep-dust); line-height: 1.45; }
.pick li { margin-bottom: 5px; }
.nums { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.nums > div { border: 0.5px solid var(--border); background: var(--linen); padding: 10px 12px; }
.n-big { font-family: var(--disp); font-weight: 900; font-size: 34px; line-height: 1; }
.n-big small { font-size: 16px; font-weight: 700; }
.n-lbl { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink2); margin-top: 5px; line-height: 1.35; }
.btn-row { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-row .btn { flex: 1 1 auto; }
.say { font-family: var(--mono); font-size: 12px; color: var(--pitch); background: var(--linen);
  border: 0.5px solid var(--border); padding: 9px 11px; letter-spacing: 0.04em; line-height: 1.5; }
.say b { color: var(--brick); font-weight: 500; }

.uni { background: #fff; border: 0.5px solid #D4CCC0; position: relative; padding: 22px 24px; }
.uni ul { margin-left: 18px; font-weight: 300; color: var(--deep-dust); font-size: 16px; }
.uni li { margin-bottom: 8px; }
.uni b { font-weight: 500; color: var(--pitch); }

.dec { background: #fff; border: 0.5px solid #D4CCC0; border-left: 3px solid var(--gold);
  padding: 18px 22px; margin-bottom: 12px; }
.dec-id { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; color: var(--brick); text-transform: uppercase; }
.dec h4 { font-family: var(--disp); font-size: 24px; font-weight: 900; text-transform: uppercase;
  line-height: 1.05; margin: 4px 0 8px; }
.dec p { font-size: 15px; font-weight: 300; color: var(--deep-dust); max-width: 78ch; margin-bottom: 10px; }

.foot { margin-top: 64px; background: var(--pitch); color: var(--linen); }
.foot-inner { max-width: 1160px; margin: 0 auto; padding: 32px; display: flex; justify-content: space-between;
  gap: 20px; flex-wrap: wrap; align-items: baseline; }
.logo { font-family: Consolas, Menlo, monospace; font-weight: 700; letter-spacing: 0.1em; font-size: 15px;
  color: var(--linen); text-decoration: none; white-space: nowrap; }
.logo .mark { color: var(--burn); }
.foot-meta { font-family: var(--mono); font-size: 11px; color: #A8A494; letter-spacing: 0.08em; line-height: 1.9;
  text-align: right; max-width: 70ch; }
.foot-meta a { color: #A8A494; }
details summary { cursor: pointer; min-height: 44px; display: inline-flex; align-items: center; }

@media (max-width: 940px) {
  .wrap { padding: 0 18px; }
  .ribbon { position: static; }
  .hero-grid { grid-template-columns: 1fr; gap: 8px; }
  .stats { padding-top: 14px; gap: 22px; } .stat-num { font-size: 46px; }
  .pick-grid { grid-template-columns: 1fr; }
  .foot-meta { text-align: left; }
  .hero-sub { font-size: 17px; }
}
"""


def gallery_html(stats):
    current_in = 2.6  # per-topic height on the current Forum 14 sheet, measured off its PDF
    cards = []
    for it in ITERATIONS:
        k = it["key"]
        s = stats[k]
        fp_base = base(it, SKINS[0])
        nu_base = base(it, SKINS[1])
        lis = "".join(f"<li>{html.escape(x)}</li>" for x in it["adds"])
        cards.append(f"""
    <div class="pick"><div class="tick-tl"></div><div class="tick-br"></div>
      <h3><b>{k.upper()}</b> · {html.escape(it['name'])}</h3>
      <a class="shot" data-fp="{fp_base}" data-neutral="{nu_base}" href="{fp_base}.pdf" target="_blank" rel="noopener"
         aria-label="Open iteration {k.upper()} as a PDF"><img src="{fp_base}.png" width="935" height="1210"
         alt="Iteration {k.upper()}, {html.escape(it['name'])}: the full one-page sheet" loading="lazy"></a>
      <div class="bet">{html.escape(it['bet'])}</div>
      <div class="nums">
        <div><div class="n-big">{s['eq-in']} <small>in</small></div><div class="n-lbl">Writing height per EQ topic</div></div>
        <div><div class="n-big">{s['words']}</div><div class="n-lbl">Words of context to read</div></div>
      </div>
      <ul>{lis}</ul>
      <div class="btn-row">
        <a class="btn btn-primary sh warm" href="{fp_base}.pdf" download><span>&#8595; PDF · Forum Playbook</span></a>
        <a class="btn btn-ghost sh cool" href="{nu_base}.pdf" download><span>&#8595; PDF · Neutral</span></a>
      </div>
      <div class="btn-row">
        <a class="btn sh cool" href="{fp_base}.html" target="_blank" rel="noopener"><span>&#8599; Web · Forum Playbook</span></a>
        <a class="btn sh cool" href="{nu_base}.html" target="_blank" rel="noopener"><span>&#8599; Web · Neutral</span></a>
      </div>
      <div class="say">To pick it, say: <b>"go with {k.upper()}"</b></div>
    </div>""")

    a_in = float(stats["a"]["eq-in"])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<!-- GENERATED {STAMP} by mockups/5-percent-reflection/_build/build.py v{VERSION}.
     Do not hand-edit: change the generator and rerun it. -->
<title>5% Reflection Sheet Mockups | Forum Playbook</title>
<meta name="description" content="A one-page monthly 5% reflection sheet that puts EQ on top and IQ at the bottom. Three iterations, each in a Forum Playbook version and a neutral version.">
<link rel="canonical" href="{SITE}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Forum Playbook">
<meta property="og:url" content="{SITE}">
<meta property="og:title" content="5% Reflection Sheet: EQ on top, IQ at the bottom">
<meta property="og:description" content="A one-page monthly reflection sheet with a big EQ zone for the 5% and a small IQ zone for 1-2 learning topics. Three iterations, print-ready.">
<meta property="og:image" content="{SITE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The 5% Reflection Sheet from Forum Playbook: EQ on top, IQ at the bottom.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="5% Reflection Sheet: EQ on top, IQ at the bottom">
<meta name="twitter:description" content="A one-page monthly reflection sheet with a big EQ zone and a small IQ zone. Three iterations, print-ready.">
<meta name="twitter:image" content="{SITE}og.png">
<link rel="icon" href="{FP_FAVICON}"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>{GALLERY_CSS}</style>
</head>
<body>
<div class="ribbon">Forum Playbook · 5% Reflection Sheet mockups · {SHEET_VERSION} · Updated {STAMP} · for Colton's pick · noindex</div>
<div class="wrap">

<header class="hero">
  <div class="hero-grid">
    <div>
      <div class="annot"><span class="annot-box">FP</span><span class="annot-line"></span>Mockups for Colton's pick<span class="annot-line"></span><span class="annot-box">{SHEET_VERSION}</span></div>
      <h1><span class="burn">EQ</span> on top.<br><span class="teal">IQ</span> at the bottom.</h1>
      <p class="hero-sub">Your Forum 14 sheet, same flow: four ratings, three topics across the same four columns, the wager. New: a big EQ zone for the 5% on top, and a small IQ zone at the bottom to name 1-2 learning topics. The three iterations differ only in how much context rides on the page. Each comes in a Forum Playbook version and a neutral version that never says the name.</p>
    </div>
    <div class="stats">
      <div><div class="stat-num">3</div><div class="stat-label">Iterations</div></div>
      <div><div class="stat-num">6</div><div class="stat-label">Print-ready PDFs</div></div>
      <div><div class="stat-num">1</div><div class="stat-label">Page each</div></div>
    </div>
  </div>
</header>

<section class="sec">
  <div class="sec-head"><span class="sec-tag">Pick one</span><h2 class="sec-title">Three Amounts of Context</h2><div class="sec-rule"></div></div>
  <div class="toggle" role="group" aria-label="Which version the previews show">
    <span class="toggle-label">Previews show</span>
    <button type="button" class="btn sh warm on" data-skin="fp" aria-pressed="true"><span>Forum Playbook</span></button>
    <button type="button" class="btn sh warm" data-skin="neutral" aria-pressed="false"><span>Neutral</span></button>
  </div>
  <div class="pick-grid">{''.join(cards)}
  </div>
</section>

<section class="sec">
  <div class="sec-head"><span class="sec-tag">All six</span><h2 class="sec-title">What Never Changes</h2><div class="sec-rule"></div></div>
  <div class="uni"><div class="tick-tl"></div><div class="tick-br"></div>
    <ul>
      <li><b>The flow of your current sheet, kept:</b> date, then Career, Family, Self and Forum rated 1-10, then Headline, Significance / Impact, Emotions / Feelings (3+ words), What do I realize about myself?, then next month's personal wager and the cash on the line.</li>
      <li><b>The column widths match your current sheet,</b> so writing on it feels the same. Half-inch side margins keep the writing area 7.5 inches wide.</li>
      <li><b>What the IQ zone costs:</b> your current sheet gives each topic about {current_in} inches of height. Iteration A gives {a_in:.2f}. Nearly all of that difference is the IQ zone itself.</li>
      <li><b>EQ wears Burn, IQ wears Teal,</b> in both versions. Color here only ever means "which kind of topic is this."</li>
      <li><b>The neutral version</b> has no mark, no name and no URL on the page, and none in the PDF's title or file name either. Same layout, same color.</li>
      <li><b>One page, US Letter,</b> fonts embedded, ready for GoodNotes or a printer. Every PDF here was checked to be exactly one page.</li>
    </ul>
  </div>
</section>

<section class="sec">
  <div class="sec-head"><span class="sec-tag">Yours to call</span><h2 class="sec-title">Three Questions</h2><div class="sec-rule"></div></div>
  <div class="dec">
    <div class="dec-id">D1</div>
    <h4>Which iteration becomes the real v1.0 sheet?</h4>
    <p>What this is: all three are the same sheet. They differ only in how much the page explains itself, which trades against writing room (the numbers on each card). Mixing is fine.</p>
    <div class="say">Say: <b>"go with A"</b>, <b>"go with B"</b>, <b>"go with C"</b>, or a mix like <b>"B plus the check boxes from C"</b></div>
  </div>
  <div class="dec">
    <div class="dec-id">D2</div>
    <h4>Should EQ stay orange and IQ stay teal?</h4>
    <p>What this is: your two EQ vs IQ one-pagers show EQ in Teal and IQ in Brick red, but only because the DO / DON'T card block comes in those two colors. Here EQ gets the brand's lead color because it is the lead zone, and IQ gets Teal so it never reads as the DON'T color now that it has its own place in the agenda.</p>
    <div class="say">Say: <b>"keep the colors"</b> or <b>"match the one-pagers"</b></div>
  </div>
  <div class="dec">
    <div class="dec-id">D3</div>
    <h4>Does the neutral version keep its footer credit?</h4>
    <p>What this is: the neutral footer reads "From EO Nashville's Forum 14." on the left and "Built by Colton with Claude" on the right. Your 2024 White Space form carried the Forum 14 line, and your built-by rule puts the credit on anything that reaches other people. If neutral should mean no names at all, it comes off.</p>
    <div class="say">Say: <b>"keep the credit"</b> or <b>"strip the credit"</b></div>
  </div>
  <p style="font-size:15px; font-weight:300; color:var(--deep-dust); max-width:78ch; margin-top:16px;">After the pick: the winner becomes v1.0, moves in next to the one-pagers in section 08 of the brand page, and the template contract gains a WORKSHEET block (write-in fields are not in its block library today).</p>
</section>

</div>
<footer class="foot"><div class="foot-inner">
  <a class="logo" href="/"><span class="mark">⎇</span> FORUM PLAYBOOK</a>
  <div class="foot-meta">5% REFLECTION SHEET MOCKUPS {SHEET_VERSION} · Updated {STAMP}<br>
  Built by Colton with Claude · <a href="/brand#templates">Brand guide, section 08</a>
  <details><summary>Changelog</summary>{SHEET_VERSION} ({NOW.strftime('%Y-%m-%d')}): first round. Iterations A, B and C, each in a Forum Playbook and a neutral version, built from the Forum 14 monthly form and Colton's Sept 2026 note to the EO trainer community. Generator: mockups/5-percent-reflection/_build/build.py v{VERSION}.</details></div>
</div></footer>

<script>
(function () {{
  var btns = document.querySelectorAll('[data-skin]');
  btns.forEach(function (b) {{
    b.addEventListener('click', function () {{
      var neutral = b.getAttribute('data-skin') === 'neutral';
      btns.forEach(function (x) {{
        var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false');
      }});
      document.querySelectorAll('.shot').forEach(function (a) {{
        var name = a.getAttribute(neutral ? 'data-neutral' : 'data-fp');
        a.href = name + '.pdf'; a.querySelector('img').src = name + '.png';
      }});
    }});
  }});
}})();
</script>
</body>
</html>
"""


OG_CARD = """<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@900&family=DM+Sans:wght@400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #F0EBE0; overflow: hidden; position: relative;
       font-family: 'DM Sans', sans-serif; color: #0E0E0C; }
.left { position: absolute; left: 72px; top: 64px; bottom: 58px; width: 610px;
        display: flex; flex-direction: column; }
.chips { display: flex; gap: 12px; font-family: 'DM Mono', monospace; font-size: 20px; letter-spacing: 0.14em; }
.chip-a { background: #E8521A; color: #fff; padding: 12px 22px; }
.chip-b { border: 2px solid #0E0E0C; padding: 10px 22px; }
h1 { font-family: 'Big Shoulders Display', sans-serif; font-weight: 900; font-size: 150px; line-height: 0.86;
     letter-spacing: -2px; text-transform: uppercase; margin-top: 30px; width: 610px; white-space: nowrap; }
h1 span { color: #E8521A; display: block; }
p { font-size: 28px; line-height: 1.32; color: #4A4038; margin-top: 22px; max-width: 590px; }
.url { margin-top: auto; font-family: 'DM Mono', monospace; font-size: 21px; letter-spacing: 0.1em; }
.sheet { position: absolute; right: 78px; top: 40px; width: 410px; border: 1px solid #C8C0B4;
         box-shadow: 0 14px 40px rgba(14,14,12,0.18); background: #fff; line-height: 0; }
.sheet img { width: 100%; display: block; }
.stripe { position: absolute; left: 0; right: 0; bottom: 0; height: 18px; display: flex; }
.stripe i { flex: 1; }
</style></head><body>
<div class="left">
  <div class="chips"><span class="chip-a">WORKSHEET</span><span class="chip-b">EQ FIRST, IQ LAST</span></div>
  <h1>5% Reflection<span>Sheet.</span></h1>
  <p>One page: a big EQ zone for the 5%, a small IQ zone for 1-2 learning topics.</p>
  <div class="url">forumplaybook.com</div>
</div>
<div class="sheet"><img src="@@IMG@@"></div>
<div class="stripe"><i style="background:#B83A14"></i><i style="background:#D4611A"></i><i style="background:#E8521A"></i><i style="background:#D4A832"></i><i style="background:#3A8A8A"></i><i style="background:#2A6E9A"></i></div>
<script>
/* shrink the headline until it fits its column, once the real font is in */
document.fonts.ready.then(function () {
  var h = document.querySelector('h1'), size = 150;
  while (h.scrollWidth > 610 && size > 60) { size -= 2; h.style.fontSize = size + 'px'; }
  document.body.setAttribute('data-ready', 'yes');
});
</script>
</body></html>
"""


# ---------------------------------------------------------------- main

def main():
    for tool in ("pdfinfo", "pdffonts", "pdftoppm"):
        if not shutil.which(tool):
            sys.exit(f"FAILED: {tool} not found (brew install poppler).")
    if not Path(CHROME).exists():
        sys.exit("FAILED: Google Chrome not found.")

    stats = {}
    with tempfile.TemporaryDirectory() as tmp:
        profile = Path(tmp) / "chrome-profile"
        for it in ITERATIONS:
            for skin in SKINS:
                name = base(it, skin)
                page = sheet_html(it, skin)
                html_path = OUT / f"{name}.html"
                html_path.write_text(page, encoding="utf-8")
                render_pdf(html_path, OUT / f"{name}.pdf", profile)
                subprocess.run(["pdftoppm", "-png", "-r", "110", "-singlefile",
                                str(OUT / f"{name}.pdf"), str(OUT / name)], check=True)
                got = measure(html_path, profile, tmp)
                got["words"] = context_words(page)
                print(f"  {name}: EQ row {got['eq-in']} in, IQ row {got['iq-in']} in, "
                      f"sentence lines {got['say-lines'] or '-'}, context words {got['words']}")
                if skin["key"] == "forum-playbook":
                    stats[it["key"]] = got

        og_src = Path(tmp) / "og-card.html"
        og_src.write_text(OG_CARD.replace("@@IMG@@", (OUT / (base(ITERATIONS[1], SKINS[0]) + ".png")).as_uri()),
                          encoding="utf-8")
        if (OUT / "og.png").exists():
            (OUT / "og.png").unlink()
        chrome(["--virtual-time-budget=7000", "--window-size=1200,630", "--force-device-scale-factor=1",
                f"--screenshot={OUT / 'og.png'}", og_src.as_uri()], profile, "bytes written to file")
        if not (OUT / "og.png").exists():
            sys.exit("FAILED: og.png was not written.")

    (OUT / "index.html").write_text(gallery_html(stats), encoding="utf-8")

    dirty = [p.name for p in list(OUT.glob("*.html")) + [Path(__file__)]
             if EM_DASH in p.read_text(encoding="utf-8")]
    if dirty:
        sys.exit(f"FAILED: em dash found in {dirty}. Colton's global law: none, anywhere.")

    print(f"Built {len(ITERATIONS) * len(SKINS)} sheets + gallery + og.png into {OUT}")
    print(f"Stamp: Updated {STAMP}")


if __name__ == "__main__":
    main()
