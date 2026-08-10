# FORUM PLAYBOOK One-Pager Template Contract v1.0

This file is the law. Any session producing a Forum Playbook one-pager must follow it exactly. If this contract and your instincts disagree, the contract wins. If this contract and a user request disagree, ask; do not silently deviate. Nothing outside an EDIT-SLOT may ever change.

Derived from: FORUM PLAYBOOK Document Template v1_1.docx (measured with python-docx), Clearing Round and Repair Process v1.1.docx (finished example), and Brand Guide v2.0 (BRAND-SYSTEM.md). Where the docx and Brand Guide v2.0 conflict, v2.0 wins (noted below).

---

## 1. Page geometry (LOCKED)

| Property | Value | Source |
|---|---|---|
| Page size | 8.5in x 11in (US Letter), portrait | docx section 0 |
| Body margins left/right | 0.875in | docx |
| Body margins top/bottom | 0.625in | docx |
| Header chrome band | begins 0.492in from top edge | docx header_distance |
| Footer chrome band | ends 0.492in from bottom edge | docx footer_distance |
| Page background | White #FFFFFF (print docs) | Brand Guide |
| Page count | Exactly one. Never two. | this contract |

CSS implementation (do not restyle): `@page { size: 8.5in 11in; margin: 0; }`, `.page { width: 8.5in; height: 11in; padding: 0.492in 0.875in; overflow: hidden; }`, `.doc-body { margin: 0.133in 0; }` (0.492 + 0.133 = 0.625in body start).

Overflow protocol: if content does not fit on one page, CUT CONTENT (shorten copy, drop a block). Never shrink type sizes, never trim margins, never reduce spacing to force a fit.

## 2. Color tokens (LOCKED)

| Token | Hex | Allowed uses in documents |
|---|---|---|
| Pitch | #0E0E0C | Body text, H1, bold chrome runs |
| Burn | #E8521A | The ⎇ mark, chrome category label, body kicker, H2 section heads (14pt+ bold only), corner ticks, print button |
| Brick | #B83A14 | Bold accent text at body sizes (step numbers, step leads, DON'T card heads) |
| Teal | #3A8A8A | DO card heads (14pt+ bold only) |
| Linen | #F0EBE0 | Callout block background only |
| Dust | #C4B8A8 | Header/footer chrome runs and bottom-right corner ticks ONLY. Never body text. |
| Deep Dust | #4A4038 | Intro paragraph, callout attributions, sources/footnote text |
| Card border | #D4CCC0 | 0.5px card and callout borders |

Contrast law (Brand Guide v2.0, overrides docx precedent): all reading text at body sizes meets 4.5:1 on its background. Burn fails 4.5:1 on white, so Burn text is permitted only at display sizes (14pt+ bold) or in the grandfathered chrome band and kicker. Small bold accents use Brick (5.7:1). The docx used Dust for footnote body text; that is superseded: footnotes use Deep Dust.

## 3. Typography (LOCKED)

Google Fonts CDN load, exactly this and nothing more:
`https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Roboto:ital,wght@0,400;0,700;1,400&display=swap`

Consolas is a system font; fallback stack is `Consolas, 'Menlo', 'Courier New', monospace`. Never DM Sans or DM Mono in documents (those are web-only fonts).

| Element | Font | Size | Weight | Color | Case |
|---|---|---|---|---|---|
| H1 document title | Big Shoulders Display | 26pt | 900 | Pitch | ALL CAPS, letter-spacing -0.5px, line-height 1.0 |
| H2 section head | Big Shoulders Display | 14pt | 700 | Burn | ALL CAPS, space before 14pt, after 5pt |
| H2 aside (optional bracketed note) | Consolas | 7pt | 400 | Dust | as written, e.g. `[...and how to apologize like an adult.]` |
| Body kicker (category) | Consolas | 7pt | 700 | Burn | `[ CATEGORY ]` with inner spaces, margin-bottom 2pt |
| Intro paragraph | Roboto | 11pt | 400 | Deep Dust | sentence case, line-height 1.35 |
| Body text / list items | Roboto | 10.5pt | 400 | Pitch | line-height 1.3, paragraph spacing 4pt |
| Step number + lead phrase | Roboto | 10.5pt | 700 | Brick | lead phrase only; rest of the step is body text |
| Card head | Big Shoulders Display | 14pt | 700 | Teal (DO) / Brick (DON'T) / Pitch (neutral) | ALL CAPS |
| Card list items | Roboto | 9.5pt | 400 | Pitch | line-height 1.3 |
| Callout quote | Roboto | 10.5pt | 400 italic | Pitch | quotation marks included |
| Callout attribution | Consolas | 7pt | 400 | Deep Dust | ALL CAPS |
| Sources/footnote | Consolas | 7pt | 700 lead + 400 rest | Pitch lead, Deep Dust rest | sentence case |

## 4. Spacing scale (LOCKED, measured from docx)

Only these values: **2pt** (kicker to title), **4pt** (between paragraphs and list items), **5pt** (after H1, after H2, after intro), **14pt** (before H2), **6pt** (callout vertical margins), **10pt** (grid gap between cards), **8pt/10pt** (card padding vertical/horizontal). No other spacing values may be introduced.

## 5. Header chrome (LOCKED, run-for-run from docx)

One line, Consolas, white-space nowrap, in this exact order:

| Run | Text | Size | Weight | Color |
|---|---|---|---|---|
| 1 | `⎇ ` | 8pt | 400 | Burn |
| 2 | `FORUM PLAYBOOK` | 8pt | 700 | Pitch |
| 3 | `   ` (3 spaces) | 5.5pt | 400 | Dust |
| 4 | `[ CATEGORY ]` | 6pt | 700 | Burn |
| 5 | `  │  ` | 6pt | 400 | Dust |
| 6 | `DOCUMENT  ` | 5.5pt | 400 | Dust |
| 7 | TITLE IN CAPS | 6pt | 700 | Pitch |
| 8 | `  │ ` | 6pt | 400 | Dust |
| 9 | `vMAJOR.MINOR ` | 6pt | 700 | Pitch |
| 10 | `│ ` | 6pt | 400 | Dust |
| 11 | `Updated: Month Year ` | 6.5pt | 400 | Dust |
| 12 | `│ ` | 6pt | 400 | Dust |
| 13 | `ForumPlaybook.com` | 6.5pt | 400 | Dust |

Header title (run 7) is the document title, ALL CAPS, max 44 characters; abbreviate if longer. Every document carries a version and a category label in this header. No exceptions.

## 6. Footer chrome (LOCKED, run-for-run from docx)

One line, Consolas, left group + right-aligned URL:

| Run | Text | Size | Weight | Color |
|---|---|---|---|---|
| 1 | `⎇ ` | 7pt | 400 | Burn |
| 2 | `FORUM PLAYBOOK  ` | 7pt | 700 | Pitch |
| 3 | `A Resource Hub for Forums, Moderators, & Facilitators.` | 6pt | 400 | Dust |
| 4 (right) | `ForumPlaybook.com` | 5.5pt | 400 | Dust |

## 7. Cards and callouts (LOCKED)

- White background, 0.5px solid #D4CCC0 border, SQUARE corners. Never rounded, never gray, never drop shadows in print.
- Burn corner tick: 12px L-shape (1px stroke), top-left, on every card and callout. Bottom-right tick is Dust.
- Callout block: Linen #F0EBE0 background, same border and ticks.
- DO list markers: `✓` in Teal. DON'T list markers: `✕` in Brick. Never bullets, never dashes as markers.

## 8. Content block library (the ONLY allowed blocks)

An edition uses the intro plus 3 to 5 of these, in any order:

1. **NUMBERED STEPS**: H2 + ordered list; Brick bold number and lead phrase, body text follows.
2. **DO / DON'T COLUMNS**: two cards in a 1fr 1fr grid, Teal DO head, Brick DON'T head.
3. **CALLOUT QUOTE**: Linen block, italic quote, Consolas attribution.
4. **PLAIN SECTION**: H2 + body paragraphs.
5. **FOOTER NOTE (sources)**: Consolas 7pt line pinned above the footer chrome (margin-top auto). Every edition has one.

No tables, no images, no charts, no new block types without amending this contract (bump its version).

## 9. EDIT-SLOT regions (the ONLY things a session may change)

Marked in the HTML with `<!-- EDIT-SLOT: ... -->` comments:

| Slot | What may change |
|---|---|
| CATEGORY | One label from the whitelist in section 10, in both header run 4 and the body kicker (they must match) |
| TITLE | Document title, in header run 7 (caps, max 44 chars), the `<title>` tag, and the H1 |
| VERSION | vMAJOR.MINOR in header run 9. New doc = v1.0. Copy edits = minor bump. Structure/meaning changes = major bump. |
| UPDATED | `Updated: Month Year` in header run 11 |
| INTRO | The intro paragraph, 1 to 3 sentences |
| BLOCKS | The content blocks area, using only section 8 block types |
| FOOTNOTE | The sources line |

Everything else, including all CSS, the chrome lines, the fonts link, and the print button, is read-only.

## 10. Category label whitelist (LOCKED)

`FACILITATION TOOLS`, `MEETING TOOLS`, `RETREAT TOOLS`, `MODERATOR TOOLS`, `FORUM HEALTH`, `PLACEMENT TOOLS`. Adding a category requires amending this contract.

## 11. Voice rules for content

- Colton's frameworks in Colton's words, tightened for print. Pull phrasing from his transcripts, podcasts, and trainings; do not invent frameworks.
- Signature vocabulary to preserve where sourced: "highest and best use of that time", "resonance, not relevance", "sneaky advice phrased as a question", "the gift of vulnerability", "EQ vs IQ", "static" (clearing), "clear is kind".
- Never em dashes. Use commas, colons, or parentheses.
- No EO Global official material reproduced verbatim (per the April 6 contract-restrictions caution); Colton's own explanations only. When an idea is EO official best practice, attribute it as such in passing (his own habit: "that's best practice from global, not Mulligan").

## 12. Production checklist (run before calling any one-pager done)

1. Diff against onepager-template.html: only EDIT-SLOT regions changed.
2. Header shows ⎇ mark, category, title caps, vX.Y, Updated date, ForumPlaybook.com.
3. Body kicker matches header category exactly.
4. Fonts: only Big Shoulders Display (headings), Roboto (body), Consolas stack (chrome). Zero DM Sans/DM Mono.
5. Colors: only section 2 tokens; no Dust body text; no Burn below 14pt bold outside chrome/kicker.
6. Square corners everywhere; burn corner tick on every card and callout.
7. Print preview (or headless render) fits exactly one page at 100% scale with no clipped text.
8. Sources line present.

Changelog: v1.0 (2026-07-10) initial contract, built overnight from docx v1.1 measurements + Brand Guide v2.0.
