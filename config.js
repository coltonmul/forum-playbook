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
  // Restricted to: HTTP referrer *.forumplaybook.com/*
  // Enabled APIs: Google Drive API v3 + YouTube Data API v3
  GOOGLE_API_KEY: 'YOUR_API_KEY_HERE',

  // ── Google Drive Folders ────────────────────────────────
  // One object per category. Order here = order in filter pills.
  // id: the folder ID from the Google Drive URL
  //     (drive.google.com/drive/folders/THIS_PART_HERE)
  // Folders must be set to "Anyone with the link can view"
  DRIVE_FOLDERS: [
    { label: 'Facilitation Tools', id: 'FOLDER_ID_HERE' },
    { label: 'Templates',          id: 'FOLDER_ID_HERE' },
    { label: 'Frameworks',         id: 'FOLDER_ID_HERE' },
    { label: 'Retreat Guides',     id: 'FOLDER_ID_HERE' },
  ],

  // ── YouTube Playlist ────────────────────────────────────
  // Get this from the playlist URL:
  // youtube.com/playlist?list=THIS_PART_HERE
  YOUTUBE_PLAYLIST_ID: 'YOUR_PLAYLIST_ID_HERE',

};
