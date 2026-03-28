# Forum Playbook — Future State To-Do
Last updated: March 2026

---

## IMMEDIATE / NEXT SESSION

### Favicon
- Current: generic globe icon in browser tab
- Goal: small "FP" mark — dark Pitch background, Burn orange text
- Solution: inline SVG favicon already written, just needs to be added to <head> in index.html
- Code ready, just needs to be committed

### Highlight Featured Resources
- Add a visual "featured" treatment to pinned cards (files prefixed with 00_ in Drive)
- Options: subtle "Featured" badge in Burn orange, different border treatment, or a small diamond mark
- Rename key files in Drive with 00_ prefix to pin them to top automatically

### Reorder YouTube Videos
- Retreats video should appear first
- Parking Lot video should appear second
- Fix: go to YouTube playlist → drag videos into correct order → site reflects on next load
- No code change needed

### Funny Hero Stat — Replace "Categories"
- Currently shows: Resources / Categories / Videos
- Goal: Resources / Videos / [something funny with a slowly-changing number]
- Ideas discussed:
  - "Awkward Silences Broken"
  - "Hard Conversations Had"
  - "Circles Sat In"
- Number behavior: starts at a seed value, increments slowly over time (JS date-based math, not random)
- Needs Colton to pick the label

---

## MEDIUM TERM

### Sub-pages / Expandable Folders
- The 4 numbered subfolders in Drive (Exercises, 5% Worksheets, Retreat Exercises, Official EO Tools) need to be accessible
- Two options:
  A) Expandable/collapsible cards — click a category to reveal files inside (no page load)
  B) Sub-pages — each category gets its own URL (e.g. forumplaybook.com/retreat-exercises)
- Option A is simpler to build and fits the single-page app model
- Option B is better for sharing direct links to a category
- Decision needed before building

---

## LONGER TERM / FUTURE STATE

### Hero Image Carousel (Desktop)
- Add a photo carousel to the hero section on desktop viewports
- Images would sit in the right portion of the hero (where the color stripe bands currently are)
- On tablet/mobile: shrink to a single static image or disappear entirely
- Content: retreat photos, facilitation moments, group shots
- Design constraint: images should be dark-toned or have an overlay so they don't compete with the headline
- Implementation: CSS-only carousel or lightweight vanilla JS (no library)

---

## ALREADY DONE ✅
- Copyright symbol in footer (© 2026 Forum Playbook. All rights reserved.)
- Color system / palette section removed from bottom of page
- "Who Built This" section updated with Colton's voice + LinkedIn link
- Footer brand colors removed (diamond now muted gray)
- API key rotated and referer restrictions fixed
- .gitignore added so config.js never triggers GitHub secret scanner again
