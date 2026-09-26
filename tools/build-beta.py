#!/usr/bin/env python3
"""Regenerate the V3 BETA homepage (beta/index.html) from index.html.

The beta lane is the always-live test copy of the homepage where new
homepage ideas run before graduating to production (Colton's beta-lane
rule; this site is on GitHub Pages, which has no branch deploys, so the
lane lives at the /beta/ path instead of a beta host).

Lane residents (2026-09-26, awaiting Colton's side by side review):
  1. REEL TAP TO PLAY + PHONE ORDER: when a phone refuses the reel's
     muted autoplay, a "Play the reel" button appears over the poster
     still; on phones the headline sits above a smaller reel card.
     Rebuilt on current main from the 2026-09-07 draft (saved untouched
     on branch sept7-reel-fallback).
  2. NO GOOGLE TAG MANAGER: the empty GTM container is removed (Colton
     does not run ads; Cloudflare Web Analytics already counts visits).
To graduate: apply the same edits to index.html (the ready commit is
on branch reel-fallback-ship), delete these blocks, rerun.

Graduated: the Forum 14 slow-motion reel card (2026-08-10 afternoon)
and the hero stats rework with the Hours in the Room counter + ledger
(2026-08-10 evening, with Colton's corrections; constants now live in
index.html's inline stats script).

To run a new experiment: add its insertion block below (see git history
for the reel card's block as a pattern), then rerun:

    python3 tools/build-beta.py

Rerun after ANY homepage edit so the lane never drifts stale.
The script fails loudly if an anchor it needs is missing.
VERSION 1.5.0 (2026-09-26). Changelog: CHANGELOG.md at the repo root.
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
        '\n  <style>.beta-chip{font-family:var(--font-mono);font-size:12px;'
        'font-weight:500;letter-spacing:0.14em;background:var(--burn);color:var(--pitch);'
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
for asset in ['styles.css', 'sting.css', 'config.js', 'app.js', 'podcasts.js', 'sting.js']:
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


# ── EXPERIMENT 2: no Google Tag Manager (the container was empty) ──
t = must_replace(t, """<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N4HDSNSD');</script>
""", '', 'gtm head script')
t = must_replace(t, """<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N4HDSNSD" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
""", '', 'gtm noscript')

# ── EXPERIMENT 1: reel tap to play + headline above the reel on phones ──
# Card caption to the 12px floor (was 9.5px). Deep Dust on white = 10.09 to 1.
t = must_replace(t, """    font-size: 9.5px;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: var(--deep-dust);""", """    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    color: var(--deep-dust);""", 'reel meta size')

t = must_replace(t, """  @media (max-width: 980px) {
    .reel-card {
      position: static;
      transform: none;
      width: min(460px, 100%);
      max-width: 100%;
      margin: 30px auto 34px;
    }
  }
  </style>""", """  /* TAP TO PLAY. Shown only when the reel has not started on its own, so the
     still is never a dead end (phones in Low Power Mode or data saver refuse
     muted autoplay). Measured: white label on Pitch 19.32 to 1, Burn arrow on
     Pitch 5.20, white ring around the chip so it reads on any frame of video.
     The whole card is the tap target. */
  .reel-play {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: rgba(14, 14, 12, 0.18);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .reel-play[hidden] { display: none; }
  .reel-play-chip {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 18px 0 16px;
    background: var(--pitch);
    box-shadow: 0 0 0 2px #fff;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #fff;
    transition: transform 0.2s ease;
  }
  .reel-play-dot {
    width: 0;
    height: 0;
    border-left: 12px solid var(--burn);
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
  }
  .reel-play:hover .reel-play-chip { transform: translateY(-2px); }
  .reel-play:focus-visible { outline: none; }
  .reel-play:focus-visible .reel-play-chip { box-shadow: 0 0 0 2px #fff, 0 0 0 5px var(--pitch); }
  @media (prefers-reduced-motion: reduce) {
    .reel-play-chip { transition: none; }
    .reel-play:hover .reel-play-chip { transform: none; }
  }
  @media (max-width: 980px) {
    /* Phones and tablets: the Join the Beta button stays first, then the
       headline leads, and the reel card follows it as supporting material. */
    .hero { display: flex; flex-direction: column; }
    .hero .app-beta { order: 0; }
    .hero .hero-inner { order: 1; }
    .hero .reel-card { order: 2; }
    .reel-card {
      position: static;
      transform: none;
      width: min(380px, 100%);
      max-width: 100%;
      margin: 26px 0 32px;
    }
  }
  @media (max-width: 680px) {
    /* Phones: a supporting card, not a billboard. */
    .reel-card { width: min(300px, 88%); margin: 22px 0 28px; }
    .reel-frame { padding: 8px; }
    .reel-q { font-size: 17px; margin: 8px 2px 5px; }
    .reel-meta { letter-spacing: 0.04em; }
  }
  </style>""", 'reel phone css')

t = must_replace(t, """        <div class="reel-poster" id="reelPoster" aria-hidden="true"></div>
      </div>""", """        <div class="reel-poster" id="reelPoster" aria-hidden="true"></div>
        <button type="button" class="reel-play" id="reelPlay" hidden aria-label="Play the forum reel">
          <span class="reel-play-chip"><span class="reel-play-dot" aria-hidden="true"></span>Play the reel</span>
        </button>
      </div>""", 'reel play button')

t = must_replace(t, """      poster.classList.add('gone');
    }""", """      poster.classList.add('gone');
      // Playback started (maybe late, after the tap offer went up): take it down.
      var b = document.getElementById('reelPlay');
      if (b) b.hidden = true;
    }""", 'reel reveal hides button')

t = must_replace(t, """  })();
  </script>
  <div class="hero-inner">""", """
    // TAP TO PLAY. If the reel has not started 2 seconds after the player
    // loads, offer the tap. The tap asks the player to play; if the phone
    // still refuses, the card swaps to Vimeo's own player with controls,
    // whose play button counts as a real tap on every phone. Never a dead end.
    var playBtn = document.getElementById('reelPlay');
    if (playBtn) {
      var armed = false;
      var arm = function () {
        if (armed) return;
        armed = true;
        setTimeout(function () { if (!revealed) playBtn.hidden = false; }, 2000);
      };
      frame.addEventListener('load', arm);
      setTimeout(arm, 4000); // backstop in case the load event came and went
      playBtn.addEventListener('click', function () {
        playBtn.hidden = true;
        try {
          frame.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
        } catch (err) { /* messaging unavailable; the swap below still runs */ }
        setTimeout(function () {
          if (revealed) return;
          frame.src = frame.src.replace('background=1', 'background=0&controls=1&playsinline=1');
          reveal();
        }, 1500);
      });
    }
  })();
  </script>
  <div class="hero-inner">""", 'reel tap script')

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(t, encoding='utf-8')
print(f'built beta/index.html ({len(t)} bytes) · stamp {STAMP}')
