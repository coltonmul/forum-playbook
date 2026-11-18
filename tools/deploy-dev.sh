#!/bin/bash
# deploy-dev.sh: ships the working copy of this repo to the dev lane, https://dev.forumplaybook.com.
# VERSION 2.0.0 (2026-11-18)
#
# 2.0.0 (Colton, 2026-11-17: "I do want beta.forumplaybook.com ... maybe it should be dev because I've been
#       calling beta like the app ... dev.forumplaybook.com ... the same setup ... like we've done with the
#       collective"): the lane is named dev, lives at dev.forumplaybook.com (a custom domain on the Worker
#       forumplaybook-site-dev) and has no workers.dev address. Was deploy-beta.sh, on a workers.dev host.
# 1.0.0 (2026-11-16): first version, as deploy-beta.sh.
#
#   tools/deploy-dev.sh
#
# The dev lane is the whole site as it stands in this checkout (any branch), so Colton can look at
# work before it merges to main (main = the live site on GitHub Pages). It is a Worker, not a Pages
# project, because the Cloudflare account is at its Pages project cap; it deploys through the wrangler
# OAuth login, the same way coltonmul/forum-playbook-forums does.
#
# Staging: a clean copy in ~/work/forumplaybook-site-dev/stage (never the repo folder itself), without
# .git, tools/, _src/, the repo's own .md notes and backup files. Every page gets the lane line
# (dev-lane.js, written here) and the whole lane is noindex through _headers.
# Guards: no em dash in any staged page, script or stylesheet; every staged page carries the lane line.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$HOME/work/forumplaybook-site-dev/stage"
CONF="$HOME/work/forumplaybook-site-dev"
NAME="forumplaybook-site-dev"
DOMAIN="dev.forumplaybook.com"
HOST="https://$DOMAIN"
PY=/opt/homebrew/bin/python3
STAMP="$(date '+%a / %Y-%m-%d / %-I:%M %p CT')"
BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)"

rm -rf "$STAGE"; mkdir -p "$STAGE"
rsync -a --exclude '.git' --exclude 'tools' --exclude '_src' --exclude '_build' --exclude '*.bak*' --exclude '.DS_Store' \
  --exclude '/*.md' --exclude '/gitignore' --exclude '/CNAME' --exclude '/preview.command' --exclude '/_config.yml' \
  --exclude 'wrangler.jsonc' --exclude '.wrangler' "$ROOT/" "$STAGE/"

printf '/*\n  X-Robots-Tag: noindex, nofollow\n' > "$STAGE/_headers"

cat > "$STAGE/dev-lane.js" <<JS
/* dev-lane.js: written by tools/deploy-dev.sh, only ever served on the dev lane.
   Ends every page with one line saying which lane this is and the way back to the live site,
   same path. On the homepage it also says why the Resource Library is empty when this lane is
   not on a forumplaybook.com address (the Google key only answers on that domain). */
(function () {
  try {
    var bar = document.createElement('p');
    bar.id = 'fp-lane';
    bar.style.cssText = 'max-width:none;margin:0;padding:14px 16px 18px;text-align:center;font:500 12px/1.5 "DM Mono",monospace;letter-spacing:.06em;color:#4A4038;background:#F0EBE0;border-top:.5px solid #C8C0B4';
    bar.appendChild(document.createTextNode('You are on the dev lane (branch $BRANCH, deployed $STAMP). '));
    var a = document.createElement('a');
    a.href = 'https://forumplaybook.com' + location.pathname + location.search;
    a.textContent = 'Back to the live site';
    a.style.cssText = 'color:#B83A14;text-decoration:underline;text-underline-offset:3px;display:inline-flex;align-items:center;min-height:44px';
    bar.appendChild(a);
    document.body.appendChild(bar);
    if (!/(^|\.)forumplaybook\.com$/.test(location.hostname)) {
      var wrap = document.getElementById('accordion-wrap');
      if (wrap) {
        var n = document.createElement('p');
        n.style.cssText = 'max-width:none;margin:0 0 12px;padding:12px 14px;background:#F6E9C9;color:#0E0E0C;font:400 15px/1.5 "DM Sans",sans-serif';
        n.textContent = 'Dev lane note: the Resource Library, the videos and Google downloads only load on a forumplaybook.com address, so they are empty here. Everything above this line is the new work.';
        wrap.parentNode.insertBefore(n, wrap);
      }
    }
  } catch (e) { /* a footer line never takes a page down */ }
})();
JS

$PY - "$STAGE" <<'PYEOF'
import os, sys
stage = sys.argv[1]
pages = bad = 0
for d, _, files in os.walk(stage):
    for f in files:
        p = os.path.join(d, f)
        if f.endswith(('.html', '.js', '.css', '.md')):
            s = open(p, encoding='utf-8', errors='replace').read()
            if '\u2014' in s and '/mockups/' not in p:
                print('guard: em dash in', os.path.relpath(p, stage)); bad += 1
            if f.endswith('.html') and '</body>' in s:
                s = s.replace('</body>', '<script src="/dev-lane.js" defer></script>\n</body>', 1)
                open(p, 'w', encoding='utf-8').write(s); pages += 1
print('staged pages with the lane line:', pages)
if bad: sys.exit('deploy-dev: guard failed')
PYEOF

cat > "$CONF/wrangler.jsonc" <<JSON
{ "name": "$NAME", "compatibility_date": "2026-10-01", "account_id": "0846f81c6d552ea17aad9869f562ad18",
  "workers_dev": false, "preview_urls": false,
  "routes": [{ "pattern": "$DOMAIN", "custom_domain": true }],
  "assets": { "directory": "$STAGE", "not_found_handling": "404-page", "html_handling": "auto-trailing-slash" } }
JSON
(cd "$CONF" && env -u CLOUDFLARE_API_TOKEN npx --yes wrangler@4.120.0 deploy 2>&1 | tail -6)

sleep 4
echo "verifying $HOST ..."
for path in / /constitution/ /process/open-coaching/ /timer /dev-lane.js /core-icons.js; do
  curl -s -o /dev/null -w "%{http_code}  $path\n" "$HOST$path"
done
curl -sI "$HOST/" | grep -i "x-robots-tag" || { echo "deploy-dev: noindex header missing"; exit 1; }
echo "dev lane: $HOST"
