# forum-playbook: working rules for every Claude session

Created 2026-08-10 after two threads (the design/docs thread and the "Forum Timer web app" thread) started shipping to this repo the same day. These rules exist so they never overwrite each other. Live site: forumplaybook.com (GitHub Pages, push to main = deploy).

## The two lanes (as of 2026-08-10)

- **Design/docs lane:** mockups/, one-pagers/, templates/, brand.html, the one-pager system (source of record: `Projects/ForumPlaybook.com/one-pager-system/` on the MacBook).
- **App lane** (the "Forum Timer web app" thread): timer.html, timer.css, timer.js, og-timer.png, tools/build-beta.py, /beta experiments (current resident: the hours-in-the-room stats rework, awaiting Colton's corrections), reel-poster.jpg, preview.command.

## The rules

1. **Pull first, always.** `git pull --rebase origin main` at session start AND again immediately before every commit+push. Never force-push. This alone prevented a collision on 2026-08-10; make it reflex.
2. **Shared hot files** (index.html, config.js, app.js, styles.css, CHANGELOG.md): small additive edits are fine under rule 1. A REBUILD or restructure of any of them gets announced FIRST under an `## IN FLIGHT` header at the top of CHANGELOG.md (which thread, what, started when), committed and pushed before the work starts. The other lane stays off that file until the entry clears. Remove the entry in the commit that lands the work.
3. **/beta/ is generated, never hand-edited.** tools/build-beta.py regenerates it from index.html; rerun it after ANY index.html edit, and if you change index.html's structure, fix build-beta.py's anchors in the same commit or the beta lane silently breaks.
4. **Every push gets a CHANGELOG.md entry**, newest day on top.
5. **No em dashes, ever** (Colton's global law). The repo has been em-dash clean since 2026-08-10; grep before committing.
6. **Brand:** brand.html (v2.2+) is the visual system; the newest document templates and one-pagers are HOUSED at forumplaybook.com/brand section 08 and that section updates in the same session as any template change. One-pagers obey templates/TEMPLATE-CONTRACT.md exactly (one page, EDIT-SLOTs only).
7. **Library content lives in Drive** (brand rule 03): resources are never added by editing code; the site syncs the Drive folder.

## Status 2026-08-10: the V2 homepage rebuild (the one thing that needs a single owner)

Colton LOCKED "V2 Split Finder" (mockups/2026-08-10/v2-split-finder.html) as the homepage direction, with the full-bar wave rollover (the button load-up across the whole row) and the slower shade sheen. The rebuild rewrites index.html + app.js + styles.css and must ABSORB, not drop: the Forum 14 reel card, the Forum Timer core card and nav link, live Drive/YouTube sync (replacing the mockup's baked data), the /beta lane machinery (rule 3), and the beta stats experiment's compatibility. Exactly ONE thread runs this rebuild (Colton assigns it); the other thread freezes homepage-file edits until it lands, per rule 2.
