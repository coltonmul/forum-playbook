# Forum Playbook — Active To-Do
Last updated: May 2026

---

## BUGS

- **Mobile accordion/dropdown text overlap**
  - Some items in expandable areas have text overlapping links on small viewports
  - Needs investigation and a layout fix
  - Reported on iPhone

---

## IMMEDIATE / NEXT UP

- **Favicon**
  - Inline SVG code already written from a prior session
  - Needs to be pasted into `<head>` of `index.html`
  - Goal: small "FP" mark — Pitch (#0E0E0C) background, Burn orange (#E8521A) text

- **Hero stat "Lines of Code"** *(locked, was previously "Categories")*
  - Replace the middle hero stat label with "Lines of Code"
  - Number drifts up ~1 every 2–3 days using a date-based seed algorithm (no randomness)
  - Wire `<span id="stat-loc">` into the hero stats block in `index.html`
  - Drop algorithm into `app.js` — see algorithm section below
  - Seed LOC needs to be counted from current codebase on deploy day

- **Reorder YouTube Videos** *(no code change needed)*
  - Retreats video should appear first, Parking Lot video second
  - Fix: YouTube playlist → drag into correct order → site reflects on next load

- **Top Resources section**
  - Goes above the Resource Library
  - Curated/pinned highlights, not just alphabetical Drive order
  - Visual treatment TBD

- **Featured resource highlighting**
  - Visual treatment for files prefixed with `00_` in Drive
  - Options: Burn orange badge, different border, or a small ⎇ mark

---

## COPY / BRAND PASS

- **Hero headline review**
  - "LEAD BETTER. / TOGETHER." may not match the locked tagline anymore
  - Locked tagline: "A Resource Hub for Forums, Moderators, & Facilitators"

- **Hero annotation bar**
  - Currently reads "FP-001 / FACILITATION RESOURCE HUB"
  - Update to match locked tagline language

- **About section voice pass**
  - Forum capitalization consistency
  - EO mention decisions

- **Footer copy + `/brand` footer link**
  - Add subtle text link to `/brand` page in footer

---

## MEDIUM TERM

- **Subfolder / expandable view decision**
  - Two paths: expandable cards in place, or sub-pages per category (e.g. `/retreat-exercises`)
  - Option A: simpler, fits single-page app model
  - Option B: better for sharing direct links to a category
  - Direction undecided

- **Open Coaching doc, page 2**
  - Question bank rewording, not yet started

---

## LONGER TERM

- **Hero image carousel (desktop)**
  - Photo rotation in the hero, right side where color stripe bands currently are
  - Mobile: single static image or hidden
  - Design constraint: dark-toned images or overlay so they don't compete with headline
  - Implementation: CSS-only or lightweight vanilla JS (no library)

---

## LINES OF CODE ALGORITHM

Drop this into `app.js`. Wire `<span id="stat-loc">` into the hero stats block in `index.html`.

```js
function getLinesOfCode() {
  const SEED_DATE = new Date('2026-05-11T00:00:00Z');
  const SEED_LOC  = 1247;        // replace with real count on deploy day
  const DRIFT_PER_DAY = 0.4;     // ~3 lines per week

  const daysSince = Math.max(
    0,
    Math.floor((Date.now() - SEED_DATE) / 86400000)
  );
  return SEED_LOC + Math.floor(daysSince * DRIFT_PER_DAY);
}

document.getElementById('stat-loc').textContent =
  getLinesOfCode().toLocaleString();
```

- Seed date and seed LOC are set on deploy day
- No randomness — every visitor on the same day sees the same number
- When a big code update lands, re-seed both values
- Need contents of `index.html`, `styles.css`, `app.js`, `config.js` to get accurate seed count

---

## ALREADY DONE ✅

- WCAG AA color contrast fixes — all major violations resolved (branch: `claude/accessible-color-contrast-Wc1yU`)
- Copyright symbol in footer (© 2026 Forum Playbook. All rights reserved.)
- Color system / palette section removed from bottom of page
- "Who Built This" section updated with Colton's voice + LinkedIn link
- Footer brand colors removed (diamond now muted gray)
- API key rotated and referer restrictions fixed
- `.gitignore` fixed (was missing the dot) — `config.js` and `node_modules/` excluded
