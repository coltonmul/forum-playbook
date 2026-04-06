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
  GOOGLE_API_KEY: 'AIzaSyD-DZWNK5YL8qgVzAVCv0qt87VHGnykh8Y',

  // ── Google Drive Folders ────────────────────────────────
  // One object per category. Order here = order in filter pills.
  // id: the folder ID from the Google Drive URL
  //     (drive.google.com/drive/folders/THIS_PART_HERE)
  // Folders must be set to "Anyone with the link can view"
  //
  // restricted: true — hides files and shows a notice card instead.
  // Use this for folders that cannot be publicly linked per policy.
  DRIVE_FOLDERS: [
    { label: 'Forum Templates',              id: '1WiseQewJb3yisikZ2xWXGWImo_hrANIR' },
    { label: 'Official EO Global Documents', id: '1wZUTcEdu2y0LQOpXAC9BLG6n0GlXQf3w', restricted: true },
  ],

  // ── YouTube Playlist ────────────────────────────────────
  // Get this from the playlist URL:
  // youtube.com/playlist?list=THIS_PART_HERE
  YOUTUBE_PLAYLIST_ID: 'PLtzLM6Y0VXALboL2zJFZq9i3QlWwFO3zG',

};
