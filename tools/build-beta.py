#!/usr/bin/env python3
"""Regenerate the V3 BETA homepage (beta/index.html) from index.html.

The beta lane is the always-live test copy of the homepage where new
homepage ideas run before graduating to production (Colton's beta-lane
rule; this site is on GitHub Pages, which has no branch deploys, so the
lane lives at the /beta/ path instead of a beta host).

Currently carried by the lane: the Forum 14 slow-motion reel card
("Don't you want your forum to be this tight and awesome?") pinned over
the hero stripes. When a feature graduates, fold it into index.html and
remove its block below, then rerun:

    python3 tools/build-beta.py

Rerun after ANY homepage edit so the lane never drifts stale.
The script fails loudly if an anchor it needs is missing.
VERSION 1.0.0 (2026-08-10). Changelog: CHANGELOG.md at the repo root.
"""
import datetime
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'index.html'
OUT = ROOT / 'beta' / 'index.html'

VIMEO_SRC = ('https://player.vimeo.com/video/1214458982?h=1ff3885544'
             '&amp;background=1&amp;autoplay=1&amp;loop=1&amp;muted=1'
             '&amp;autopause=0&amp;badge=0&amp;player_id=0&amp;app_id=58479&amp;dnt=1')

now = datetime.datetime.now()
STAMP = now.strftime('%a / %Y-%m-%d / %I:%M %p CT').upper().replace('/ 0', '/ ')

STYLE_AND_CARD = '''
<style>
/* ── V3 BETA: the reel card, pinned over the hero stripes ── */
.reel-card {
  position: absolute;
  top: 58px;
  right: 44px;
  width: 390px;
  max-width: 44vw;
  z-index: 3;
  transform: rotate(-1.6deg);
  transition: transform 0.35s ease;
}
.reel-card:hover { transform: rotate(0deg); }
.reel-frame {
  position: relative;
  background: #fff;
  border: 0.5px solid #D4CCC0;
  padding: 10px;
  box-shadow: 0 18px 50px rgba(14, 14, 12, 0.16), 0 4px 12px rgba(14, 14, 12, 0.08);
}
.reel-frame::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px;
  width: 14px; height: 14px;
  border-top: 3px solid var(--burn);
  border-left: 3px solid var(--burn);
}
.reel-video {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0E0E0C;
  overflow: hidden;
}
.reel-video iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
.reel-q {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 20px;
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--pitch);
  margin: 10px 2px 6px;
}
.reel-q .accent { color: var(--burn); }
.reel-meta {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--deep-dust);
  margin: 0 2px 2px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.beta-chip {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  background: var(--burn);
  color: #fff;
  padding: 4px 8px;
  border-radius: 2px;
  margin-left: 10px;
  white-space: nowrap;
}
@media (max-width: 1180px) { .reel-card { width: 330px; } }
@media (max-width: 980px) {
  .reel-card {
    position: static;
    transform: none;
    width: min(460px, 100%);
    max-width: 100%;
    margin: 30px auto 34px;
  }
}
</style>
<aside class="reel-card" aria-label="A real forum, tight and awesome, in slow motion">
  <div class="reel-frame">
    <div class="reel-video">
      <iframe src="__VIMEO__"
        allow="autoplay; fullscreen; picture-in-picture"
        loading="lazy"
        title="Forum 14, April 2026, in slow motion"></iframe>
    </div>
    <div class="reel-q">Don't you want your forum<br>to be <span class="accent">this tight and awesome?</span></div>
    <div class="reel-meta"><span>A REAL FORUM · APRIL 2026</span><span>V3 BETA · UPDATED __STAMP__</span></div>
  </div>
</aside>
'''.replace('__VIMEO__', VIMEO_SRC).replace('__STAMP__', STAMP)


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
                 '    FORUM PLAYBOOK\n  </a>\n  <span class="beta-chip">V3 BETA</span>',
                 'beta chip')

# The reel card, inserted in front of the stripes.
t = must_replace(t, '  <div class="hero-inner">',
                 STYLE_AND_CARD + '  <div class="hero-inner">',
                 'reel card')

# Lane switch back to production, plus a lane label in the copyright line.
t = must_replace(t, '<a href="/brand" class="footer-link">',
                 '<a href="/" class="footer-link">← Back to the live site</a>\n    <a href="/brand" class="footer-link">',
                 'lane link')
t = must_replace(t, '© 2026 Forum Playbook', '© 2026 Forum Playbook · V3 BETA LANE', 'lane label')

# Never carry prod's own beta pointer inside the beta lane.
t = t.replace('    <a href="/beta/" class="footer-link">V3 Beta</a>\n', '')

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(t, encoding='utf-8')
print(f'built beta/index.html ({len(t)} bytes) · stamp {STAMP}')
