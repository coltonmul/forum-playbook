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
// CORE_GROUPS: the top of the homepage, in three groups (Colton, 2026-11-16):
//   1. Forum Tools: Forum Timer first, then the Forum Organizer spreadsheet, then the worksheet and the constitution.
//   2. Process Breakdowns: one process per row, each as a web page, a PDF and a two-minute video.
//   3. Retreat Exercises: the Ikigai worksheet and North Star.
// A group has: id, title, tag, icon, note, tint ('burn' | 'teal' | 'gold'), layout ('cards' | 'rows' | 'wide'), items.
// An item has:
//   title, badge, icon   icon is a name from core-icons.js (tools/build-core-icons.py holds the one list)
//   bullets              two to four short lines (cards); line = the one line a row shows
//   shot                 the picture on the card; preview = the large page-one picture the Preview opens
//                        (a Google file with no shot or preview uses its Drive thumbnail)
//   landscape            true for a wide page
//   fileId               the Google Doc or Sheet behind export and drive actions
//   actions              the buttons, in order. Each is { label, icon, style: 'primary' | 'ghost' (optional) } plus ONE of:
//                          url (add download: true to save the file), export: 'pdf' | 'docx' | 'xlsx' (Google export
//                          of fileId), drive: true (opens fileId in Google), soon: true (not made yet, shown as such)
// The official EO documents live in the library's own bucket (EO Legal), not up here.
CORE_GROUPS: [
{
id: 'tools',
title: 'Forum Tools',
tag: 'Open every month',
icon: 'toolbox',
tint: 'burn',
layout: 'cards',
note: 'What a forum opens at every meeting: the timer, the organizer, the reflection worksheet and the constitution.',
items: [
{
title: 'Forum Timer',
badge: 'WEB APP · IOS APP',
icon: 'timer',
shot: '/previews/forum-timer-shot.jpg',
shotFit: 'photo',
shotAlt: 'The Forum Timer running: a green dial with 3 minutes 56 seconds left',
bullets: [
'A timer built for the nuances of forum, readable from across the room',
'Automatic timing from your agenda, block by block',
'Green, gold, then red, so everyone sees where the time stands',
],
actions: [
{ label: 'Use the web app', icon: 'timer', url: '/timer', style: 'primary' },
{ label: 'Get the iOS app', icon: 'app-store-logo', url: 'https://apps.apple.com/us/app/forum-playbook/id6789998894' },
],
},
{
title: 'Forum Organizer Spreadsheet',
badge: 'GOOGLE SHEET',
icon: 'table',
type: 'sheet',
fileId: '1KbdvEq8kFxR9yOO-J0p76oj4KLBVzmVyyk1FLCY60Zg',
bullets: [
'An agenda for every meeting',
'The year\'s schedule: host, presenter and coach',
'Roles, resources and the parking lot, with a filled-in example',
],
actions: [
{ label: 'Make your own copy', icon: 'copy', url: 'https://docs.google.com/spreadsheets/d/1KbdvEq8kFxR9yOO-J0p76oj4KLBVzmVyyk1FLCY60Zg/copy', style: 'primary' },
{ label: 'Open the sheet', icon: 'google-drive-logo', drive: true },
{ label: 'XLSX', icon: 'file-xls', export: 'xlsx' },
],
},
{
title: '5% Reflection Worksheet',
badge: 'PDF · PRINT OR GOODNOTES',
icon: 'percent',
preview: '/previews/5-percent-reflection-sheet.png',
bullets: [
'EQ up top: three 5% topics, from headline to what you realize about yourself',
'IQ at the bottom: 1-2 learning topics to bring to the room',
'Your four ratings and next month\'s wager',
],
actions: [
{ label: 'PDF', icon: 'download-simple', url: '/worksheets/5-percent-reflection-sheet.pdf', download: true, style: 'primary' },
{ label: 'Open', icon: 'arrow-up-right', url: '/worksheets/5-percent-reflection-sheet.pdf' },
],
},
{
title: 'Nashville Forum Constitution Template',
badge: 'V2026.11.16',
icon: 'scroll',
preview: '/previews/nashville-forum-constitution-template.png',
bullets: [
'Sixteen topics, from attendance and fines to roles and retreats',
'Copy it, download it, or compare it to yours with one prompt',
'Make it yours, then review it every year at retreat',
],
actions: [
{ label: 'Read it', icon: 'browser', url: '/constitution/', style: 'primary' },
{ label: 'Word', icon: 'file-doc', url: '/constitution/nashville-forum-constitution-template-V2026.11.16.docx', download: true },
{ label: 'PDF', icon: 'file-pdf', url: '/constitution/nashville-forum-constitution-template-V2026.11.16.pdf', download: true },
],
},
],
},
{
id: 'process',
title: 'Process Breakdowns',
tag: 'Web page · PDF · Video',
icon: 'path',
tint: 'teal',
layout: 'rows',
note: 'One process at a time. Each comes as a web page, a one-page PDF and a two-minute video.',
items: [
{
title: 'Open Coaching',
icon: 'chats-circle',
badge: 'ONE-PAGER · v4.1',
preview: '/previews/open-coaching-v4.1.png',
line: 'Four opening questions, questions that find the core struggle, then a prompt for experience shares.',
bullets: [
'Four opening questions: headline, three emotions, one year from now, and the experiences they are curious to hear',
'Questions that split the topic to find the core struggle',
'Close with the prompt, then silence and experience shares',
],
actions: [
{ label: 'Web page', icon: 'browser', url: '/process/open-coaching/', style: 'primary' },
{ label: 'PDF', icon: 'file-pdf', url: '/one-pagers/open-coaching-v4.1.pdf' },
{ label: 'Video: soon', icon: 'play-circle', soon: true },
],
},
{
title: 'Clearing Round & Repair Process',
icon: 'handshake',
badge: 'GOOGLE DOC',
fileId: '18GbUZDJoT__ETZ2b2hSVgOZXOrKp4Z9aM-jke5NLiUc',
type: 'doc',
line: 'Three to five minutes in every meeting, and word-for-word steps for repairing a conflict.',
bullets: [
'3 to 5 minutes in every forum meeting',
'What the healthiest forums do',
'Word-for-word steps for repairing a conflict',
],
actions: [
{ label: 'Google Doc', icon: 'google-drive-logo', drive: true, style: 'primary' },
{ label: 'PDF', icon: 'file-pdf', export: 'pdf' },
{ label: 'Video: soon', icon: 'play-circle', soon: true },
],
},
{
title: 'The 4-Hour Forum Meeting Blueprint',
icon: 'clock-countdown',
badge: 'ONE-PAGER · v1.3',
preview: '/previews/4-hour-forum-meeting-blueprint-v1.3.png',
line: 'Where each hour goes: reflections, a planned deep dive, then the impromptu queue.',
bullets: [
'Hour 1: opening rituals, clearing round, and 5% reflections',
'Hour 2: the planned deep dive, coached a week ahead',
'Hours 3-4: the impromptu queue, EQ topics first, then IQ lightning rounds',
'Close: confirm next month\'s presenter, coach, and host',
],
actions: [
{ label: 'Web page', icon: 'browser', url: '/one-pagers/4-hour-forum-meeting-blueprint-v1.3.html', style: 'primary' },
{ label: 'PDF', icon: 'file-pdf', url: '/one-pagers/4-hour-forum-meeting-blueprint-v1.3.pdf' },
{ label: 'Video: soon', icon: 'play-circle', soon: true },
],
},
{
title: 'EQ vs IQ Topics',
icon: 'scales',
badge: 'ONE-PAGER · v1.3',
preview: '/previews/eq-vs-iq-topics-v1.3.png',
line: 'Match the size of the conversation to the kind of topic.',
bullets: [
'Match the size of the conversation to the kind of topic',
'EQ topics, the whys, get a 30-40 minute deep dive',
'IQ topics, the what and the how, get 10-12 minute lightning rounds',
],
actions: [
{ label: 'Web page', icon: 'browser', url: '/one-pagers/eq-vs-iq-topics-v1.3.html', style: 'primary' },
{ label: 'PDF', icon: 'file-pdf', url: '/one-pagers/eq-vs-iq-topics-v1.3.pdf' },
{ label: 'Video: soon', icon: 'play-circle', soon: true },
],
},
{
title: 'Retreat Planning: The Thirds Rule',
icon: 'chart-pie-slice',
badge: 'ONE-PAGER · v1.3',
preview: '/previews/retreat-thirds-rule-v1.3.png',
line: 'One third exercises, one third activities, one third unstructured time.',
bullets: [
'One third exercises, one third activities, one third unstructured time',
'Front-load the heavy exercises on day one',
'What keeps a retreat from souring',
],
actions: [
{ label: 'Web page', icon: 'browser', url: '/one-pagers/retreat-thirds-rule-v1.3.html', style: 'primary' },
{ label: 'PDF', icon: 'file-pdf', url: '/one-pagers/retreat-thirds-rule-v1.3.pdf' },
{ label: 'Video: soon', icon: 'play-circle', soon: true },
],
},
],
},
{
id: 'retreat',
title: 'Retreat Exercises',
tag: 'Retreat tools',
icon: 'mountains',
tint: 'gold',
layout: 'wide',
note: 'Exercises to run at a forum retreat.',
items: [
{
title: 'Ikigai Worksheet',
badge: '11X17 PDF',
icon: 'flower-lotus',
preview: '/previews/ikigai-worksheet-11x17.png',
landscape: true,
bullets: [
'Eight prompts on what you love, what you are good at, and what the world needs',
'The four circles show where your ikigai sits',
'Three actions to take, and how the forum can support you',
],
actions: [
{ label: 'PDF', icon: 'download-simple', url: '/worksheets/ikigai-worksheet-11x17.pdf', download: true, style: 'primary' },
{ label: 'Open', icon: 'arrow-up-right', url: '/worksheets/ikigai-worksheet-11x17.pdf' },
],
},
{
title: 'North Star',
badge: 'FACILITATED EXERCISE',
icon: 'star-four',
shot: '/facilitate/img/r1-north-star-sky.jpg',
shotFit: 'photo',
shotAlt: 'The Milky Way over a retreat house deck at night in Telluride',
landscape: true,
bullets: [
'The North Star each member inherited, and the one that is theirs now',
'The stars they steer by this year',
'One page of intentions to take home',
],
actions: [
{ label: 'See the exercise', icon: 'browser', url: '/facilitate/north-star/', style: 'primary' },
],
},
],
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
