# fonts/

The typefaces forumplaybook.com uses, served from this site since 2026-11-19 so that loading a page sends no request to Google Fonts. `fonts.css` holds the `@font-face` rules; every page links it (`/fonts/fonts.css`, or a relative path in files that are also rendered from disk by headless Chrome).

The files were downloaded once from Google Fonts, for exactly the families, weights and styles the pages requested, latin and latin-ext subsets only. Big Shoulders Display, DM Sans and Roboto are variable fonts, so one file per subset covers every weight listed.

| Family | Weights and styles | Files | License |
|---|---|---|---|
| Big Shoulders Display | 700, 900 | `big-shoulders-display-normal-*.woff2` | SIL Open Font License 1.1, `licenses/big-shoulders-display-OFL.txt` (Copyright 2019 The Big Shoulders Project Authors) |
| DM Sans | 300, 400, 500, 700 | `dm-sans-normal-*.woff2` | SIL Open Font License 1.1, `licenses/dm-sans-OFL.txt` (Copyright 2014 The DM Sans Project Authors) |
| DM Mono | 400, 500 | `dm-mono-normal-400-*.woff2`, `dm-mono-normal-500-*.woff2` | SIL Open Font License 1.1, `licenses/dm-mono-OFL.txt` (Copyright 2020 The DM Mono Project Authors) |
| Roboto | 400, 500, 700, 900, and 400 italic | `roboto-normal-*.woff2`, `roboto-italic-*.woff2` | SIL Open Font License 1.1, `licenses/roboto-OFL.txt` (Copyright 2011 The Roboto Project Authors) |

The Open Font License allows using, hosting and redistributing the fonts, provided the license and copyright notice travel with them; the license texts in `licenses/` are copied unchanged from the google/fonts repository.

To add a weight or a family: download its woff2 files (latin and latin-ext) into this folder, add matching `@font-face` rules to `fonts.css`, add its license to `licenses/`, and add a row above. Pages and builders link only this folder's `fonts.css`, not Google Fonts.
