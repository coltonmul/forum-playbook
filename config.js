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
// CORE_RESOURCES: the featured Forum Playbook cards at the top of the homepage
// (Colton, 2026-11-04: feature the items that are on Playbook, more of them, each with a Preview).
// OTHER_RESOURCES: useful documents that are not Forum Playbook-made, in the smaller
// "Other Resources" row under the featured cards.
// type: 'doc' = Google Doc (downloads as DOCX + PDF; preview = the Drive thumbnail of page one)
// type: 'sheet' = Google Sheet (downloads as XLSX + PDF; preview = the Drive thumbnail)
// type: 'links' = External link card - supply `links: [{label, url}]` instead of fileId (no preview)
// type: 'file' = A file housed on this site - supply `url` (download + open buttons),
//   `preview` (page-one PNG, built by tools/build-previews.py) and optionally `web` (the HTML version).
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
title: 'The 4-Hour Forum Meeting Blueprint',
badge: 'ONE-PAGER · PDF',
type: 'file',
url: '/one-pagers/4-hour-forum-meeting-blueprint-v1.0.pdf',
web: '/one-pagers/4-hour-forum-meeting-blueprint-v1.0.html',
preview: '/previews/4-hour-forum-meeting-blueprint-v1.0.png',
bullets: [
'Hour 1: opening rituals, clearing round, and 5% reflections',
'Hour 2: the planned deep dive, coached a week ahead',
'Hours 3-4: the impromptu queue, EQ topics first, then IQ lightning rounds',
'Close: confirm next month\'s presenter, coach, and host',
],
},
{
title: '5% Reflection Worksheet',
badge: 'PDF · PRINT OR GOODNOTES',
type: 'file',
url: '/worksheets/5-percent-reflection-sheet.pdf',
preview: '/previews/5-percent-reflection-sheet.png',
bullets: [
'EQ up top: three 5% topics, from headline to what you realize about yourself',
'IQ at the bottom: 1-2 learning topics to bring to the room',
'Your four ratings and next month\'s wager',
],
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
{
title: 'EQ vs IQ Topics',
badge: 'ONE-PAGER · PDF',
type: 'file',
url: '/one-pagers/eq-vs-iq-topics-v1.0.pdf',
web: '/one-pagers/eq-vs-iq-topics-v1.0.html',
preview: '/previews/eq-vs-iq-topics-v1.0.png',
bullets: [
'Match the size of the conversation to the kind of topic',
'EQ topics, the whys, get a 30-40 minute deep dive',
'IQ topics, the what and the how, get 10-12 minute lightning rounds',
],
},
{
title: 'Open Coaching',
badge: 'ONE-PAGER · PDF',
type: 'file',
url: '/one-pagers/open-coaching-v4.0.pdf',
web: '/one-pagers/open-coaching-v4.0.html',
preview: '/previews/open-coaching-v4.0.png',
bullets: [
'Four opening questions: headline, three emotions, one year from now, and the experiences they are curious to hear',
'Questions that split the topic to find the core struggle',
'Close with the prompt, then silence and experience shares',
],
},
{
title: 'The Retreat Thirds Rule',
badge: 'ONE-PAGER · PDF',
type: 'file',
url: '/one-pagers/retreat-thirds-rule-v1.0.pdf',
web: '/one-pagers/retreat-thirds-rule-v1.0.html',
preview: '/previews/retreat-thirds-rule-v1.0.png',
bullets: [
'One third exercises, one third activities, one third unstructured time',
'Front-load the heavy exercises on day one',
'What keeps a retreat from souring',
],
},
{
title: 'Ikigai Worksheet',
badge: 'RETREAT · 11X17 PDF',
type: 'file',
url: '/worksheets/ikigai-worksheet-11x17.pdf',
preview: '/previews/ikigai-worksheet-11x17.png',
landscape: true,
bullets: [
'Eight prompts on what you love, what you are good at, and what the world needs',
'The four circles show where your ikigai sits',
'Three actions to take, and how the forum can support you',
],
},
],
OTHER_RESOURCES: [
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
