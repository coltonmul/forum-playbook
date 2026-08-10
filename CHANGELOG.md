# Changelog: forum-playbook (forumplaybook.com)

Code and housed-document changes only. Library resources and videos sync from Google Drive / YouTube (brand rule 03) and are not versioned here.

## IN FLIGHT

- (nothing; claim a shared-file rebuild here per CLAUDE.md rule 2 before starting it)

## 2026-08-10, evening

- V2 SPLIT FINDER IS LIVE on the homepage (Colton's push order). The Resource Library accordion is replaced by the finder: sticky bucket rail (Everything, each Drive section with live counts, the restricted EO bucket, jump links to Videos and Podcasts), big legible rows, live search across everything, and click-to-preview (Drive first-page thumbnail + full download buttons). Rows carry the full-bar wave (gold sweep, teal landing, content flips white, buttons pop) per Colton's locked interaction spec; an open row reads calm. PRESERVED UNTOUCHED: hero + reel card, stats markup, core resources, timer nav + /timer, videos, podcasts, GTM, OG. All changes namespaced (fx- CSS appended; renderAccordion rewritten in place; old accordion builders retired in place, cleanup later). tools/build-beta.py reran clean, /beta regenerated with the finder + the hours-stats experiment intact.

## 2026-08-10, late afternoon

- Hours ledger reworked with Colton's round-1 corrections: own forum now counts the 48-hour mini retreat AND the annual retreat (~1,320 over 10 years); FTP/MTP bumped to three years (~600); pipeline split into Pipeline Entrepreneurs (~66) and a new "chapters that flew him in" bucket (OKC ~44 documented, Tampa, Philly, Detroit, plus a growing allowance for everything he forgets, ~240). New base 2,922 hours at the 2026-08-10 epoch, accruing 9.13/week (~475/yr run rate). Ledger foot now answers "what is this informed by": intimate working time with hundreds of forums and thousands of EO and YPO members, that is where the templates come from. Still beta-only.
- V2 SPLIT FINDER LOCKED as the homepage direction (Colton, 4:10 PM). Mockups bumped to v0.2: the sheen is now a slower shade (1.05s warm tint, no white glaze, holds a light shade while hovered) per his note that the glaze read as a glitch, and rows/cards/tiles now carry the FULL-BAR WAVE: the button load-up (gold sweep, teal landing, content flips white, buttons stay obvious) applied to the whole bar on hover or tap, slightly slower than the buttons. Open rows suppress the wave (reading surface). Chooser marks V2 LOCKED; V1/V3 kept as reference.
- NEW CLAUDE.md: working rules for parallel Claude threads in this repo (pull-rebase always, shared-hot-file claims via IN FLIGHT, /beta is generated never hand-edited, changelog every push, em dash ban). Written after the design thread and the Forum Timer thread shipped to this repo the same day without collision, to keep it that way.
- NEXT (single-owner job, unassigned): the real homepage rebuild on V2, absorbing the reel card, the Forum Timer card, live Drive sync, and build-beta.py anchor updates.

## 2026-08-10, afternoon

- BETA EXPERIMENT: hero stats rework (build-beta.py 1.2.0). "4 Categories" is gone; the row becomes Resources / Published Videos / HOURS IN THE ROOM* / Library Synced (today's date; the library genuinely syncs from Drive on every load). The hours stat is Colton's career counter: base 2,002 hours as of 2026-08-10 plus a 7.25 hrs/week conservative accrual, computed client-side forever (zero upkeep). The asterisk opens THE HOURS LEDGER: the full math (own forum 10 yrs ~840, retreats facilitated ~480, forums seeded as chair ~216, FTP/MTP ~400, pipeline ~66) and the disclaimer ("what happens in forum stays in forum... if anything, the number is low"). Beta only, awaiting Colton's corrections to the assumptions before any graduation.
- REEL CARD GRADUATED TO PRODUCTION on Colton's "push it live asap" (his explicit yes on the faces-on-an-indexed-site call): the card now lives in index.html; tools/build-beta.py 1.1.0 is pure lane machinery (chip, noindex, lane links, regen stamp) with the lane EMPTY and ready for the next experiment. Same push per Colton mid-flight: caption now "COLTON'S REAL FORUM (FORUM 14: EO NASHVILLE)" + "APRIL 2026 · SLOW MOTION", and the card no longer opens as a dark box: a local poster still (reel-poster.jpg, the reel's opening overlook frame via Vimeo oEmbed) covers the player and fades out the moment Vimeo reports genuine playback (postMessage play/timeupdate handshake; if autoplay is ever blocked, the still simply stays).
- V3 BETA reel card line changed per Colton: "Don't you want your forum to be this tight and awesome?" (was "this easy and fun?"). tools/build-beta.py updated + beta regenerated.
- Open Coaching bumped to v3.0 per Colton's correction: IQ topics get LIGHT open coaching (2-3 minutes of facts and solutions being explored, then 1-2 minutes per member for process, resources, tools) with the "How did you...?" / "What did you do when...?" stems and his three concrete examples. v2.0 files removed from the site (git history keeps them); brand page row, stamp, and changelog updated (brand page now v2.2).
- NEW /mockups/2026-08-10/: three homepage redesign direction mockups for Colton's approval (V1 Open Shelves, V2 Split Finder, V3 Task Router) plus a chooser page. All noindex. Shared DNA: audit type scale (17px body, 11px floor), icons, universal hover feedback, the proposed sheen sweep toward buttons, and click-to-preview using Drive's public thumbnail endpoint with real library data baked in. Live homepage untouched pending his pick.

## 2026-08-10

- NEW: the Forum Timer web app at /timer (timer.html + timer.css + timer.js), a full port of the Forum Timer iOS app v1.1, labeled as a web app with "coming soon to the iOS App Store." Quick timer (giant digits, bars or clock-face display, 40%/15% green/gold/brick thresholds, chained timers, saved cadences, microwave keypad, light/dark themes), Agenda Based Timer (Standard Forum + Express templates, editable durations and roster, custom templates, hold-at-zero, planned-vs-actual summary), seven synthesized public-domain overtime melodies in piano/guitar/chime with the duet layer, three Time's Up intensities with escalation curves, pre-ending alerts, screen wake lock, drift-free clock. No accounts; everything saves in the browser. Timer web app version: 1.0.0.
- Homepage: "Timer" nav link; Forum Timer card added first in Core Resources (config.js, badge WEB APP) with a dial icon (app.js coreIconTimer). Same-site links in 'links' cards now open in the same tab; external ones keep target="_blank".
- og-timer.png: 1200x630 link-preview card for /timer (OG + Twitter meta on the page).
- NEW: the V3 BETA lane at /beta/, the always-live homepage test copy (GitHub Pages has no branch deploys, so the lane is a path, not a host). Generated from index.html by tools/build-beta.py; rerun it after any homepage edit. First resident: the Forum 14 slow-motion reel card ("Don't you want your forum to be this easy and fun?"), a white schematic-pinned frame with a corner tick floating over the hero stripes, playing the April 2026 mini-retreat reel (Vimeo 1214458982, muted chrome-less loop, same embed as forum14.com). Beta is noindexed, carries a V3 BETA nav chip + lane label, and links back to the live site; production's footer gained the "V3 Beta" switch. Graduation path: fold the card into index.html, drop its block from the build script, rerun.
- Timer web app 1.1.0, same day (Colton's first-look round): TYPE A TIME button on the idle dock (custom keypad was hiding behind the SET chip); running controls rebuilt as +times row, gap, full-width PAUSE and STOP with words, and a PRE-TIME CHIME dropdown carrying the room signals (chime timing, screen flash on/off, sound/vibration/silent); "Set up your phone for the table" walkthrough panel (subtle button on the timer + Options row) with exact iPhone/Android steps for brightness, Auto-Lock, Attention Aware, ring switch, Do Not Disturb; assertive overtime label now says "tap Stop"; screen-flash toggle added to Alerts &amp; Sound.

## 2026-08-10, earlier that day

- brand.html bumped to v2.1: new section 08, Templates & One-Pagers. The newest document templates are now housed on the brand page permanently: one-pager template v1.0, template contract v1.0, Word document template v1.1 (.docx), plus the four current one-pagers with view links and print-verified PDFs.
- NEW: Open Coaching v2.0 one-pager. Carries the current opening language ("What types of experiences are you curious to hear from the group?" and the experience-share stem "A time when you felt...") plus the EQ vs IQ topic frame up front. Supersedes the 2022 ForumSherpa-era tips sheet and the FP Word doc v1.0a (April 2026). Source of record: Projects/ForumPlaybook.com/one-pager-system/ on the MacBook.
- New directories: /one-pagers/ (4 HTML + 4 PDF, every PDF verified exactly one page) and /templates/ (3 files).
- Em dashes removed from every text file in the repo per the global style law (visible copy, meta tags, stat placeholders, code comments).
- brand.html gains the site favicon and Open Graph / Twitter card metadata.

## Earlier, pre-changelog (from git history)

- 2026-07: iOS apps privacy section added to /legal; podcasts section added; accessibility color-contrast PR #3 open and awaiting merge.
- 2026-03 to 04: Brand Guidelines v2.0 locked (color system, typography, two-wave hover, document chrome).
