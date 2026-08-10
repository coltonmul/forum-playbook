#!/usr/bin/env python3
"""Regenerate the V3 BETA homepage (beta/index.html) from index.html.

The beta lane is the always-live test copy of the homepage where new
homepage ideas run before graduating to production (Colton's beta-lane
rule; this site is on GitHub Pages, which has no branch deploys, so the
lane lives at the /beta/ path instead of a beta host).

Lane status: EMPTY. The first resident, the Forum 14 slow-motion reel
card ("Don't you want your forum to be this tight and awesome?"),
graduated to the production homepage on 2026-08-10 on Colton's "push it
live asap"; the card now lives in index.html and flows into the lane
with everything else.

To run a new experiment: add its insertion block below (see git history
of this file for the reel card's block as a pattern), then rerun:

    python3 tools/build-beta.py

Rerun after ANY homepage edit so the lane never drifts stale.
The script fails loudly if an anchor it needs is missing.
VERSION 1.1.0 (2026-08-10). Changelog: CHANGELOG.md at the repo root.
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

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(t, encoding='utf-8')
print(f'built beta/index.html ({len(t)} bytes) · stamp {STAMP}')
