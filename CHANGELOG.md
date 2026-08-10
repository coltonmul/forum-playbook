# Changelog: forum-playbook (forumplaybook.com)

Code and housed-document changes only. Library resources and videos sync from Google Drive / YouTube (brand rule 03) and are not versioned here.

## 2026-08-10, afternoon

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
