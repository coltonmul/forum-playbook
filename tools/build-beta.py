#!/usr/bin/env python3
"""Regenerate the V3 BETA homepage (beta/index.html) from index.html.

The beta lane is the always-live test copy of the homepage where new
homepage ideas run before graduating to production (Colton's beta-lane
rule; this site is on GitHub Pages, which has no branch deploys, so the
lane lives at the /beta/ path instead of a beta host).

Lane residents:
- HERO STATS REWORK (added 2026-08-10 evening, awaiting graduation):
  the stat row becomes Resources / Published Videos / Hours in the
  Room* / Library Synced. The hours stat is Colton's directionally
  accurate career counter: BASE_HOURS as of the epoch plus a
  conservative weekly accrual, computed client-side (zero upkeep), with
  the asterisk opening THE HOURS LEDGER (the full math + the
  confidentiality disclaimer). Constants live in STATS_SCRIPT below;
  Colton corrects assumptions there. "4 Categories" is gone (he hates
  it); the hidden stub keeps app.js's getElementById happy.

Graduated earlier: the Forum 14 slow-motion reel card (2026-08-10, in
index.html now).

To run a new experiment: add its insertion block below (see git history
for the reel card's block as a pattern), then rerun:

    python3 tools/build-beta.py

Rerun after ANY homepage edit so the lane never drifts stale.
The script fails loudly if an anchor it needs is missing.
VERSION 1.2.0 (2026-08-10). Changelog: CHANGELOG.md at the repo root.
"""
import datetime
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'index.html'
OUT = ROOT / 'beta' / 'index.html'

now = datetime.datetime.now()
STAMP = now.strftime('%a / %Y-%m-%d / %I:%M %p CT').upper().replace('/ 0', '/ ')

CHIP = ('\n  <span class="beta-chip">V3 BETA</span>'
        '\n  <style>.beta-chip{font-family:var(--font-mono);font-size:10px;'
        'font-weight:500;letter-spacing:0.14em;background:var(--burn);color:#fff;'
        'padding:4px 8px;border-radius:2px;margin-left:10px;white-space:nowrap;}</style>')


def must_replace(text, old, new, label):
    if old not in text:
        sys.exit(f'build-beta: anchor missing for {label!r}; index.html changed shape, update tools/build-beta.py')
    return text.replace(old, new, 1)


t = SRC.read_text(encoding='utf-8')

# noindex: the lane is for Colton's testing, never for search engines.
t = must_replace(t, '<meta charset="UTF-8" />',
                 '<meta charset="UTF-8" />\n<meta name="robots" content="noindex, nofollow" />',
                 'noindex meta')

t = must_replace(t, '<title>Forum Playbook', '<title>V3 BETA · Forum Playbook', 'title')

# Root-absolute assets so the copy works from /beta/.
for asset in ['styles.css', 'config.js', 'app.js', 'podcasts.js']:
    t = must_replace(t, f'"{asset}"', f'"/{asset}"', asset)

# The lane badge in the nav.
t = must_replace(t, '    FORUM PLAYBOOK\n  </a>',
                 '    FORUM PLAYBOOK\n  </a>' + CHIP,
                 'beta chip')

# Lane switch back to production, plus lane label + regen stamp.
t = must_replace(t, '<a href="/brand" class="footer-link">',
                 '<a href="/" class="footer-link">← Back to the live site</a>\n    <a href="/brand" class="footer-link">',
                 'lane link')
t = must_replace(t, '© 2026 Forum Playbook',
                 f'© 2026 Forum Playbook · V3 BETA LANE · REGENERATED {STAMP}',
                 'lane label')

# Never carry prod's own beta pointer inside the beta lane.
t = t.replace('    <a href="/beta/" class="footer-link">V3 Beta</a>\n', '')

# ── EXPERIMENT: hero stats rework (Resources / Videos / Hours* / Synced) ──
OLD_STATS = '''      <div class="stats" aria-label="Site statistics">
        <div class="stat">
          <div class="stat-num" id="stat-resources">-</div>
          <div class="stat-label">Resources</div>
        </div>
        <div class="stat">
          <div class="stat-num" id="stat-categories">-</div>
          <div class="stat-label">Categories</div>
        </div>
        <div class="stat">
          <div class="stat-num" id="stat-videos">-</div>
          <div class="stat-label">Videos</div>
        </div>
      </div>'''

NEW_STATS = '''      <div class="stats" aria-label="Site statistics">
        <div class="stat">
          <div class="stat-num" id="stat-resources">-</div>
          <div class="stat-label">Resources</div>
        </div>
        <div class="stat" style="display:none" aria-hidden="true">
          <div class="stat-num" id="stat-categories">-</div>
          <div class="stat-label">Categories</div>
        </div>
        <div class="stat">
          <div class="stat-num" id="stat-videos">-</div>
          <div class="stat-label">Published Videos</div>
        </div>
        <button class="stat stat-hours" id="hoursStat" aria-expanded="false" aria-controls="hoursLedger">
          <div class="stat-num"><span id="stat-hours">-</span><sup>*</sup></div>
          <div class="stat-label">Hours in the Room</div>
        </button>
        <div class="stat">
          <div class="stat-num" id="stat-updated">-</div>
          <div class="stat-label">Library Synced</div>
        </div>
      </div>
      <div class="hours-ledger" id="hoursLedger" hidden>
        <button class="ledger-close" id="ledgerClose" aria-label="Close the ledger">✕</button>
        <div class="ledger-title">The Hours Ledger<sup>*</sup></div>
        <div class="ledger-sub">Directionally accurate. Recalculated weekly, because he is still in there.</div>
        <div class="ledger-rows">
          <div class="ledger-row"><span>His own forum, 10 years: 4-hour monthlies, the 48-hour mini retreat, and the annual retreat</span><strong>~1,320</strong></div>
          <div class="ledger-row"><span>Retreats facilitated for other forums, call it six a year for eight years</span><strong>~480</strong></div>
          <div class="ledger-row"><span>Forums seeded as chapter forum chair: a dozen launches, 3 to 6 four-hour sessions each</span><strong>~216</strong></div>
          <div class="ledger-row"><span>Forum + Moderator Training Programs: 8-hour days, 15 FTP and 10 MTP a year, three years running</span><strong>~600</strong></div>
          <div class="ledger-row"><span>Pipeline Entrepreneurs, two years</span><strong>~66</strong></div>
          <div class="ledger-row"><span>Chapters that flew him in (Oklahoma City, Tampa, Philly, Detroit) plus everything he is forgetting, a bucket that grows every year</span><strong>~240</strong></div>
          <div class="ledger-row ledger-total"><span>Running total, growing about 9 hours a week</span><strong id="ledgerTotal">-</strong></div>
        </div>
        <div class="ledger-foot">What this does not count: the phone calls, the prep, and every hour that cannot be logged, because what happens in forum stays in forum. Everything on this site is informed by intimate working time with hundreds of forums and thousands of EO and YPO members. That is where the templates come from. If anything, the number is low.</div>
      </div>
      <style>
      .hero-bottom { flex-wrap: wrap; }
      .stat-hours { text-align: left; cursor: pointer; }
      .stat-hours sup { font-size: 16px; color: var(--burn); }
      .hours-ledger {
        flex-basis: 100%;
        max-width: 520px;
        margin-left: auto;
        margin-top: 16px;
        background: #fff;
        border: 0.5px solid #D4CCC0;
        box-shadow: 0 18px 50px rgba(14, 14, 12, 0.16);
        padding: 18px 18px 16px;
        position: relative;
        text-align: left;
      }
      .hours-ledger::before {
        content: '';
        position: absolute;
        top: -1px; left: -1px;
        width: 14px; height: 14px;
        border-top: 3px solid var(--burn);
        border-left: 3px solid var(--burn);
      }
      .ledger-close {
        position: absolute;
        top: 8px; right: 10px;
        font-size: 13px;
        color: var(--deep-dust);
        cursor: pointer;
      }
      .ledger-title {
        font-family: var(--font-display);
        font-weight: 900;
        font-size: 21px;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .ledger-title sup { color: var(--burn); font-size: 13px; }
      .ledger-sub {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--deep-dust);
        margin: 4px 0 12px;
      }
      .ledger-row {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        padding: 7px 0;
        border-bottom: 0.5px solid #E4DDD0;
        font-size: 12.5px;
        line-height: 1.45;
        color: var(--deep-dust);
      }
      .ledger-row strong {
        font-family: var(--font-mono);
        font-size: 12.5px;
        color: var(--pitch);
        white-space: nowrap;
      }
      .ledger-row.ledger-total { border-bottom: none; color: var(--pitch); font-weight: 500; }
      .ledger-row.ledger-total strong { color: var(--burn); font-size: 15px; }
      .ledger-foot {
        margin-top: 10px;
        font-size: 11.5px;
        line-height: 1.6;
        color: var(--deep-dust);
        font-style: italic;
      }
      @media (max-width: 900px) {
        .hours-ledger { max-width: 100%; }
        .stats { flex-wrap: wrap; gap: 22px; }
      }
      </style>'''

t = must_replace(t, OLD_STATS, NEW_STATS, 'stats rework')

STATS_SCRIPT = '''<script>
// The hours counter: a directionally accurate model, not a diary.
// BASE_HOURS is the ledger total as of the EPOCH (Colton-corrected
// round 1, 2026-08-10: own forum 1320 + retreats 480 + seeded 216 +
// FTP/MTP x3yrs 600 + Pipeline Entrepreneurs 66 + paid chapters and
// the forgotten bucket 240 = 2,922). PER_WEEK is the current run rate
// (forum 132 + retreats 60 + FTP/MTP 200 + pipeline 33 + chapters 50
// = ~475/yr = 9.13/wk). Colton corrects here; nothing else to maintain.
(function () {
  var BASE_HOURS = 2922;
  var EPOCH = new Date('2026-08-10T00:00:00-05:00');
  var PER_WEEK = 9.13;
  var weeks = Math.max(0, (Date.now() - EPOCH.getTime()) / (7 * 24 * 3600 * 1000));
  var hours = Math.floor(BASE_HOURS + weeks * PER_WEEK).toLocaleString('en-US');
  var el = document.getElementById('stat-hours');
  if (el) el.textContent = hours;
  var total = document.getElementById('ledgerTotal');
  if (total) total.textContent = hours + ' hrs';
  var synced = document.getElementById('stat-updated');
  if (synced) synced.textContent = new Date().toLocaleDateString('en-US',
    { month: 'short', day: 'numeric' }).toUpperCase();
  var ledger = document.getElementById('hoursLedger');
  var statBtn = document.getElementById('hoursStat');
  if (ledger && statBtn) {
    statBtn.addEventListener('click', function () {
      ledger.hidden = !ledger.hidden;
      statBtn.setAttribute('aria-expanded', String(!ledger.hidden));
    });
    var close = document.getElementById('ledgerClose');
    if (close) close.addEventListener('click', function () {
      ledger.hidden = true;
      statBtn.setAttribute('aria-expanded', 'false');
    });
  }
})();
</script>
'''

t = must_replace(t, '<script src="/config.js"></script>',
                 STATS_SCRIPT + '<script src="/config.js"></script>',
                 'stats script')

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(t, encoding='utf-8')
print(f'built beta/index.html ({len(t)} bytes) · stamp {STAMP}')
