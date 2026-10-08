#!/usr/bin/env python3
"""build-app-page.py: builds forumplaybook.com/app/ from app/_src/index.html. VERSION 1.0.0 (2026-10-08)

  python3 tools/build-app-page.py

Expands {{icon:name}} (Phosphor, from ~/Sites/brand-assets/icons/icon.py), {{STAMP}}, {{STAMPDATE}} and {{FAVICON}},
fills the footer page list from SITE_PAGES in build-catalyst.py (the one canonical list), puts in the visitor
counter, and guards against em dashes and leftover tokens.

Changelog
  1.0.0  First version, the day after the app went live on the App Store.
"""
import importlib.util, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("bc", os.path.join(ROOT, "tools", "build-catalyst.py"))
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

src = open(os.path.join(ROOT, "app", "_src", "index.html")).read()
s = re.sub(r"\{\{icon:([a-z0-9-]+)\}\}", lambda m: bc.icon(m.group(1)), src)
s = s.replace("{{STAMP}}", bc.STAMP).replace("{{STAMPDATE}}", bc.STAMP.replace("Updated ", ""))
s = s.replace("{{FAVICON}}", bc._icon.data_uri(bc._icon.favicon_svg("device-mobile", "light")))
s = re.sub(r'<nav class="cfoot-nav".*?</nav>', bc.footer_nav("/app/"), s, count=1, flags=re.S)
s = re.sub(r"<script defer src='https://static.cloudflareinsights.com[^\n]*</script>", "", s)
s = s.replace("</body>", bc.COUNTER + "\n</body>", 1)
bad = ("\u2014" in s) or re.findall(r"\{\{[^}]*\}\}", s)
if bad:
    sys.exit("guard failed: em dash or leftover token")
open(os.path.join(ROOT, "app", "index.html"), "w").write(s)
print("built app/index.html", bc.STAMP)
