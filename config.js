// ═══════════════════════════════════════════════════════════
// FORUM PLAYBOOK - config.js
//
// HOW TO UPDATE THIS FILE:
// 1. Edit this file in your GitHub repo (github.com → forum-playbook → config.js → pencil icon)
// 2. Commit the change - site auto-deploys within ~60 seconds
//
// NEVER share this file publicly with a real API key in it.
// The API key below is restricted to forumplaybook.com only via Google Cloud Console.
// ═══════════════════════════════════════════════════════════
const CONFIG = {
// ── Google API Key ─────────────────────────────────────
// Restricted to: HTTP referrer forumplaybook.com/* and *.forumplaybook.com/*
// Enabled APIs: Google Drive API v3 + YouTube Data API v3
GOOGLE_API_KEY: 'AIzaSyD-DZWNK5YL8qgVzAVCv0qt87VHGnykh8Y',
// ── Core Resources ──────────────────────────────────────
// These cards appear in the "Core Resources" section above the Resource Library.
// type: 'doc' = Google Doc (downloads as DOCX + PDF)
// type: 'sheet' = Google Sheet (downloads as XLSX + PDF)
// type: 'links' = External link card - supply `links: [{label, url}]` instead of fileId
// type: 'file' = A file housed on this site - supply `url` (download + open buttons)
// bullets: two to four short lines under the title saying what the resource is (Colton, 2026-10-27).
// Update fileId here if you ever replace these files in Drive.
// The official EO documents live in the library's own bucket (EO Legal), not up here.
CORE_RESOURCES: [
{
title: 'Forum Timer',
badge: 'IOS APP NOW AVAILABLE',
type: 'links',
icon: 'timer',
bullets: [
'A timer built for the nuances of forum, readable from across the room',
'Automatic timing from your agenda, block by block',
'Green, gold, then red, so everyone sees where the time stands',
],
links: [
{
label: '▶ Use the Web App',
url: '/timer',
},
{
label: '↓ Download the iOS App',
url: 'https://apps.apple.com/us/app/forum-playbook/id6789998894',
},
],
},
{
title: '5% Reflection Worksheet',
badge: 'PDF · PRINT OR GOODNOTES',
type: 'file',
url: '/worksheets/5-percent-reflection-sheet.pdf',
bullets: [
'EQ up top: three 5% topics, from headline to what you realize about yourself',
'IQ at the bottom: 1-2 learning topics to bring to the room',
'Your four ratings and next month\'s wager',
],
},
{
title: 'Nashville Forum Constitution Template',
badge: 'GOOGLE DOC',
bullets: [
'Best practices built on years of learning',
'Attendance, punctuality, phones, confidentiality, fines, and roles',
'Make it yours, then review it every year at retreat',
],
fileId: '1h2AYwSQ0HcMY3EpF5L8kq1ZrZA63kwiT-J5w7BtcmWQ',
type: 'doc',
},
{
title: 'Forum Organizer Spreadsheet',
badge: 'GOOGLE SHEET',
bullets: [
'Parking lot and schedule',
'5% Reflection worksheet',
'Presenter\'s and coach\'s worksheets',
'Agendas, roles, and how-to links for every meeting',
],
fileId: '1KbdvEq8kFxR9yOO-J0p76oj4KLBVzmVyyk1FLCY60Zg',
type: 'sheet',
},
{
title: 'Clearing Round & Repair Process',
badge: 'GOOGLE DOC',
bullets: [
'3 to 5 minutes in every forum meeting',
'What the healthiest forums do',
'Word-for-word steps for repairing a conflict',
],
fileId: '18GbUZDJoT__ETZ2b2hSVgOZXOrKp4Z9aM-jke5NLiUc',
type: 'doc',
},
],
// ── Root Drive Folder ───────────────────────────────────
// The site reads the immediate subfolders of this folder
// and turns each one into a top-level accordion section.
// Add subfolders in Drive to add new sections - no code changes needed.
DRIVE_ROOT_FOLDER_ID: '1WiseQewJb3yisikZ2xWXGWImo_hrANIR',
// ── Restricted Folder Names ─────────────────────────────
// Folders whose names match anything in this list will show
// the access-restricted notice instead of their contents.
// Match is case-insensitive. Update here if you rename the folder in Drive.
RESTRICTED_FOLDER_NAMES: [
'official eo global tools and documents',
],
// ── YouTube Playlist ────────────────────────────────────
// Get this from the playlist URL:
// youtube.com/playlist?list=THIS_PART_HERE
// Playlist order is controlled in YouTube Studio - drag videos to reorder.
YOUTUBE_PLAYLIST_ID: 'PLtzLM6Y0VXALboL2zJFZq9i3QlWwFO3zG',
// ── Podcasts ────────────────────────────────────────────
// Episodes that live on OTHER people's YouTube channels (not the
// Forum Playbook playlist), so they can't auto-sync. List them here
// by hand. To add, remove, or reorder, just edit this array -
// they render top to bottom in the order below.
//
//   videoId  = the part after "youtu.be/" or "watch?v=" in the URL
//              (e.g. https://youtu.be/Uv6KdABlhWw  →  'Uv6KdABlhWw')
//   title    = whatever you want shown under the thumbnail
//
PODCASTS: [
{ videoId: 'Uv6KdABlhWw', title: 'How to Do a Deep Dive' },
{ videoId: 'Oqa-YI_aIdM', title: 'Coaching for Deep Dives' },
{ videoId: 'u_YEH573U2o', title: 'Participating in a Deep Dive' },
],
};
