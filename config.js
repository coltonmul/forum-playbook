// ═══════════════════════════════════════════════════════════
// FORUM PLAYBOOK — config.js
//
// HOW TO UPDATE THIS FILE:
//   1. Edit this file in your GitHub repo (github.com → forum-playbook → config.js → pencil icon)
//   2. Commit the change — site auto-deploys within ~60 seconds
//
// NEVER share this file publicly with a real API key in it.
// The API key below is restricted to forumplaybook.com only via Google Cloud Console.
// ═══════════════════════════════════════════════════════════
const CONFIG = {
// ── Google API Key ─────────────────────────────────────
// Restricted to: HTTP referrer forumplaybook.com/* and *.forumplaybook.com/*
// Enabled APIs: Google Drive API v3 + YouTube Data API v3
GOOGLE_API_KEY: ‘AIzaSyD-DZWNK5YL8qgVzAVCv0qt87VHGnykh8Y’,
// ── Core Resources ──────────────────────────────────────
// These cards appear in the “Core Resources” section above the Resource Library.
// type: ‘doc’      = Google Doc (downloads as DOCX + PDF)
// type: ‘sheet’    = Google Sheet (downloads as XLSX + PDF)
// type: ‘external’ = External URL (opens in new tab, no download)
// Update fileId here if you ever replace these files in Drive.
CORE_RESOURCES: [
{
title: ‘Nashville Forum Constitution Template’,
subtitle: ‘GOOGLE DOC — FORUM FOUNDATION’,
fileId: ‘1h2AYwSQ0HcMY3EpF5L8kq1ZrZA63kwiT-J5w7BtcmWQ’,
type: ‘doc’,
},
{
title: ‘Forum Organizer Spreadsheet’,
subtitle: ‘DYNAMIC AGENDA, SCHEDULE, PARKING LOT’,
fileId: ‘1KbdvEq8kFxR9yOO-J0p76oj4KLBVzmVyyk1FLCY60Zg’,
type: ‘sheet’,
},
{
title: ‘Clearing Round & Repair Process’,
subtitle: ‘GOOGLE DOC — FACILITATION TOOLS’,
fileId: ‘18GbUZDJoT__ETZ2b2hSVgOZXOrKp4Z9aM-jke5NLiUc’,
type: ‘doc’,
},
{
title: ‘1000 Great Questions’,
subtitle: ‘EXTERNAL SITE — FORUM QUESTIONS’,
url: ‘https://1000greatquestions.com’,
type: ‘external’,
},
],
// ── Root Drive Folder ───────────────────────────────────
// The site reads the immediate subfolders of this folder
// and turns each one into a top-level accordion section.
// Add subfolders in Drive to add new sections — no code changes needed.
DRIVE_ROOT_FOLDER_ID: ‘1WiseQewJb3yisikZ2xWXGWImo_hrANIR’,
// ── Restricted Folder Names ─────────────────────────────
// Folders whose names match anything in this list will show
// the access-restricted notice instead of their contents.
// Match is case-insensitive. Update here if you rename the folder in Drive.
RESTRICTED_FOLDER_NAMES: [
‘official eo global tools and documents’,
],
// ── YouTube Playlist ────────────────────────────────────
// Get this from the playlist URL:
// youtube.com/playlist?list=THIS_PART_HERE
// Playlist order is controlled in YouTube Studio — drag videos to reorder.
YOUTUBE_PLAYLIST_ID: ‘PLtzLM6Y0VXALboL2zJFZq9i3QlWwFO3zG’,
};