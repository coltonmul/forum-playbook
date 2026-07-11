#!/bin/bash
# Double-click this file in Finder to preview the site locally.
# Opens http://localhost:3000 in your default browser.
# Press Ctrl+C in the terminal window to stop the server.

cd "$(dirname "$0")"
echo ""
echo "  Forum Playbook — local preview"
echo "  http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop."
echo ""
open http://localhost:3000
python3 -m http.server 3000
