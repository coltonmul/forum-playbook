# Forum Playbook site, Changelog

Source of truth for what changed on forumplaybook.com and when. Started
2026-08-10; for earlier history see `git log`. Newest first. The Forum
Timer web app carries its own version (shown on the page and in
gear > Options > Version); site-level entries land here.

---

## 1.1.0, 2026-08-10: The Forum Timer web app

- NEW PAGE `/timer` (timer.html + timer.css + timer.js): the Forum Timer,
  a full web port of the Forum Timer iOS app v1.1, labeled as a web app
  with "coming soon to the iOS App Store." Quick timer (giant digits,
  bars or clock-face display, green/gold/brick thresholds at 40%/15%,
  chained timers, saved cadences, microwave keypad, light/dark themes),
  Agenda Based Timer (Standard Forum + Express templates, editable
  durations and roster, custom templates, hold-at-zero, planned vs
  actual summary), seven synthesized public-domain overtime melodies in
  piano/guitar/chime with the optional duet layer, three Time's Up
  intensities with escalation curves, pre-ending alerts, screen wake
  lock, drift-free clock. No accounts; everything saves in the browser.
- Homepage: "Timer" nav link; Forum Timer card added to Core Resources
  (config.js, badge WEB APP) with a dial icon (app.js `coreIconTimer`).
- app.js: same-site links in 'links' cards now open in the same tab;
  external ones keep target="_blank".
- og-timer.png: link-preview card for /timer (OG + Twitter meta on the
  page per the link-preview standard).
- This CHANGELOG.md started.

## Earlier

- 2026-07-11 and before: main site (resource library synced from Google
  Drive, YouTube how-to hub, podcasts, brand page, legal page). See
  `git log` for the trail.
