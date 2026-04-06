// ═══════════════════════════════════════════════════════════
// FORUM PLAYBOOK — app.js
// Phase 1: Structure + API integration
// ═══════════════════════════════════════════════════════════

// ── Session cache (no localStorage) ────────────────────────
const CACHE = {
  files: [],       // All Drive files across all folders
  videos: [],      // All YouTube playlist items
};

// ── State ───────────────────────────────────────────────────
let activeFilter = 'all';
let searchQuery  = '';

// ── DOM refs ─────────────────────────────────────────────────
const cardGrid     = document.getElementById('card-grid');
const videoGrid    = document.getElementById('video-grid');
const pillGroup    = document.getElementById('pill-group');
const searchInput  = document.getElementById('search-input');
const emptyState   = document.getElementById('empty-state');
const emptyMsg     = document.getElementById('empty-msg');
const resourceCount= document.getElementById('resource-count');
const statResources= document.getElementById('stat-resources');
const statCategories=document.getElementById('stat-categories');
const statVideos   = document.getElementById('stat-videos');
const lightbox     = document.getElementById('lightbox');
const lightboxEmbed= document.getElementById('lightbox-embed');
const lightboxClose= document.getElementById('lightbox-close');
const lightboxBg   = document.getElementById('lightbox-backdrop');


// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
async function init() {
  if (
    !CONFIG.GOOGLE_API_KEY ||
    CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY_HERE' ||
    CONFIG.DRIVE_FOLDERS.some(f => f.id === 'FOLDER_ID_HERE')
  ) {
    showConfigError();
    return;
  }

  await Promise.all([
    loadDriveFiles(),
    loadYouTubeVideos(),
  ]);
}


// ════════════════════════════════════════════════════════════
// GOOGLE DRIVE — load all folders
// ════════════════════════════════════════════════════════════
async function loadDriveFiles() {
  try {
    const allFiles = [];

    for (const folder of CONFIG.DRIVE_FOLDERS) {
      // Skip API call for restricted folders — no files to fetch
      if (folder.restricted) continue;

      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.set('q', `'${folder.id}' in parents and trashed = false`);
      url.searchParams.set('fields', 'files(id,name,mimeType,modifiedTime)');
      url.searchParams.set('orderBy', 'name');
      url.searchParams.set('pageSize', '500');
      url.searchParams.set('key', CONFIG.GOOGLE_API_KEY);

      const res  = await fetch(url.toString());
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);

      const files = (data.files || []).map(f => ({
        ...f,
        category: folder.label,
      }));
      allFiles.push(...files);
    }

    CACHE.files = allFiles;
    buildPills();
    renderCards();
    updateStats();

  } catch (err) {
    showDriveError(err.message);
  }
}


// ════════════════════════════════════════════════════════════
// YOUTUBE — load playlist
// ════════════════════════════════════════════════════════════
async function loadYouTubeVideos() {
  try {
    if (!CONFIG.YOUTUBE_PLAYLIST_ID || CONFIG.YOUTUBE_PLAYLIST_ID === 'YOUR_PLAYLIST_ID_HERE') {
      clearVideoSkeletons();
      return;
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('playlistId', CONFIG.YOUTUBE_PLAYLIST_ID);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', CONFIG.GOOGLE_API_KEY);

    const res  = await fetch(url.toString());
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);

    CACHE.videos = (data.items || []).sort((a, b) =>
      new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
    );

    renderVideos();
    updateStats();

  } catch (err) {
    showVideoError(err.message);
  }
}


// ════════════════════════════════════════════════════════════
// FILTER PILLS — build from folder labels
// Restricted folders get their own pill but no file cards
// ════════════════════════════════════════════════════════════
function buildPills() {
  const existing = pillGroup.querySelectorAll('.pill[data-filter]:not([data-filter="all"])');
  existing.forEach(p => p.remove());

  // Include all folders in pills — restricted ones still get a pill
  CONFIG.DRIVE_FOLDERS.forEach(folder => {
    const btn = document.createElement('button');
    btn.className = 'pill sh warm';
    btn.dataset.filter = folder.label;
    btn.innerHTML = `<span>${folder.label}</span>`;
    btn.addEventListener('click', () => setFilter(folder.label));
    pillGroup.appendChild(btn);
  });
}


// ════════════════════════════════════════════════════════════
// FILTER + SEARCH STATE
// ════════════════════════════════════════════════════════════
function setFilter(filter) {
  activeFilter = filter;
  pillGroup.querySelectorAll('.pill').forEach(p => {
    const isActive = p.dataset.filter === filter;
    p.classList.toggle('active', isActive);
    p.classList.toggle('sh', true);
    p.classList.toggle('dp', isActive);
    p.classList.toggle('warm', !isActive);
  });
  renderCards();
}

searchInput.addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderCards();
});


// ════════════════════════════════════════════════════════════
// DOWNLOAD HELPER — fetches blob and names the file correctly
// ════════════════════════════════════════════════════════════
async function downloadFile(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.error('Download error:', err);
    // Fall back to opening in new tab
    window.open(url, '_blank', 'noopener');
  }
}


// ════════════════════════════════════════════════════════════
// RENDER RESOURCE CARDS
// ════════════════════════════════════════════════════════════
function renderCards() {
  // Check if the active filter is a restricted folder
  const activeFolder = CONFIG.DRIVE_FOLDERS.find(f => f.label === activeFilter);
  if (activeFolder && activeFolder.restricted) {
    cardGrid.hidden = false;
    emptyState.hidden = true;
    resourceCount.textContent = '0 resources';
    cardGrid.innerHTML = buildRestrictedCardHTML(activeFolder.label);
    return;
  }

  const filtered = CACHE.files.filter(f => {
    const matchesFilter = activeFilter === 'all' || f.category === activeFilter;
    const matchesSearch = !searchQuery ||
      f.name.toLowerCase().includes(searchQuery) ||
      f.category.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  resourceCount.textContent = `${filtered.length} resource${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    cardGrid.innerHTML = '';
    cardGrid.hidden = true;
    emptyState.hidden = false;
    emptyMsg.textContent = searchQuery
      ? `No results for "${searchQuery}".`
      : 'No resources in this category yet.';
    return;
  }

  emptyState.hidden = true;
  cardGrid.hidden = false;
  cardGrid.innerHTML = filtered.map((f, i) => buildCardHTML(f, i)).join('');

  // Attach download handlers after rendering
  cardGrid.querySelectorAll('[data-download-url]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const url      = btn.dataset.downloadUrl;
      const filename = btn.dataset.filename;
      downloadFile(url, filename);
    });
  });
}

// ── Restricted folder notice card ───────────────────────────
function buildRestrictedCardHTML(categoryLabel) {
  return `
    <div class="card card-restricted" style="grid-column:1/-1; opacity:0.72;">
      <div class="corner-tl" style="border-color:#C4B8A8;"></div>
      <div class="corner-br"></div>
      <div class="card-id">
        <div class="card-id-box" style="color:#C4B8A8; border-color:#C4B8A8;">${categoryLabel.toUpperCase()}</div>
      </div>
      <div class="card-title" style="color:#C4B8A8; font-size:16px;">ACCESS RESTRICTED</div>
      <div class="card-meta" style="margin-bottom:0;">EO Legal now prohibits anyone from linking to EO official materials. You gotta hit up a trainer or staff member to get those documents directly.</div>
    </div>
  `;
}

function buildCardHTML(file, index) {
  const type    = getMimeLabel(file.mimeType);
  const date    = formatDate(file.modifiedTime);
  const num     = String(index + 1).padStart(3, '0');
  const title   = cleanFileName(file.name);
  const buttons = buildButtonsHTML(file);

  return `
    <div class="card">
      <div class="corner-tl"></div>
      <div class="corner-br"></div>
      <div class="card-id">
        DOC-${num}
        <div class="card-id-box">${file.category.toUpperCase()}</div>
      </div>
      <div class="card-title">${title}</div>
      <div class="card-meta">${type} — UPDATED ${date}</div>
      <div class="card-btns">${buttons}</div>
    </div>
  `;
}

function buildButtonsHTML(file) {
  const id       = file.id;
  const mime     = file.mimeType;
  const base     = `https://www.googleapis.com/drive/v3/files/${id}/export?key=${CONFIG.GOOGLE_API_KEY}`;
  const baseName = cleanFileName(file.name);

  const driveUrl = `https://drive.google.com/open?id=${id}`;

  let html = '';

  if (mime === 'application/vnd.google-apps.document') {
    const docxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
    const pdfUrl  = `${base}&mimeType=application/pdf`;
    html += btnDownload('↓ DOCX', docxUrl, `${baseName}.docx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl,  `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ Drive', driveUrl);

  } else if (mime === 'application/vnd.google-apps.spreadsheet') {
    const xlsxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
    const pdfUrl  = `${base}&mimeType=application/pdf`;
    html += btnDownload('↓ XLSX', xlsxUrl, `${baseName}.xlsx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl,  `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ Drive', driveUrl);

  } else if (mime === 'application/pdf') {
    const pdfUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
    html += btnDownload('↓ PDF', pdfUrl, `${baseName}.pdf`, 'secondary');
    html += btnGhost('↗ Drive', driveUrl);

  } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const dlUrl  = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
    const pdfUrl = `${base}&mimeType=application/pdf`;
    html += btnDownload('↓ DOCX', dlUrl,   `${baseName}.docx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl,  `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ Drive', driveUrl);

  } else if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const dlUrl  = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
    const pdfUrl = `${base}&mimeType=application/pdf`;
    html += btnDownload('↓ XLSX', dlUrl,   `${baseName}.xlsx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl,  `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ Drive', driveUrl);

  } else {
    html += btnGhost('↗ Drive', driveUrl);
  }

  return html;
}

function btnDownload(label, url, filename, style) {
  const cls = style === 'primary'
    ? 'btn btn-primary sh warm'
    : 'btn sh warm';
  return `<button class="${cls}" data-download-url="${url}" data-filename="${filename}"><span>${label}</span></button>`;
}

function btnGhost(label, url) {
  return `<a href="${url}" class="btn btn-ghost sh cool" target="_blank" rel="noopener"><span>${label}</span></a>`;
}


// ════════════════════════════════════════════════════════════
// RENDER VIDEO CARDS
// ════════════════════════════════════════════════════════════
function renderVideos() {
  if (!CACHE.videos.length) {
    clearVideoSkeletons();
    return;
  }

  videoGrid.innerHTML = CACHE.videos.map(v => buildVideoCardHTML(v)).join('');
}

function buildVideoCardHTML(item) {
  const snippet   = item.snippet;
  const videoId   = snippet.resourceId?.videoId || '';
  const title     = snippet.title;
  const thumb     = snippet.thumbnails?.medium?.url || '';
  const published = timeAgo(snippet.publishedAt);

  return `
    <div class="video-card" data-videoid="${videoId}" role="button" tabindex="0" aria-label="Play: ${title}">
      <div class="video-thumb">
        ${thumb ? `<img src="${thumb}" alt="${title}" loading="lazy" />` : ''}
        <div class="play-btn" aria-hidden="true">
          <div class="play-triangle"></div>
        </div>
        <div class="yt-badge">YouTube</div>
      </div>
      <div class="video-info">
        <div class="video-title">${title}</div>
        <div class="video-meta">${published}</div>
      </div>
    </div>
  `;
}

function clearVideoSkeletons() {
  videoGrid.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1;padding:40px 0;">
      <div class="empty-icon">▷</div>
      <div class="empty-title">No Videos Yet</div>
      <div class="empty-msg">Add videos to your YouTube playlist and they'll appear here.</div>
    </div>
  `;
}


// ════════════════════════════════════════════════════════════
// LIGHTBOX
// ════════════════════════════════════════════════════════════
videoGrid.addEventListener('click', e => {
  const card = e.target.closest('[data-videoid]');
  if (!card) return;
  const videoId = card.dataset.videoid;
  if (!videoId) return;

  if (window.innerWidth < 680) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener');
    return;
  }

  lightboxEmbed.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
      allow="autoplay; fullscreen"
      allowfullscreen
    ></iframe>
  `;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
});

videoGrid.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    const card = e.target.closest('[data-videoid]');
    if (card) card.click();
  }
});

function closeLightbox() {
  lightbox.hidden = true;
  lightboxEmbed.innerHTML = '';
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBg.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });


// ════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════
function updateStats() {
  statResources.textContent  = CACHE.files.length  || '—';
  statCategories.textContent = CONFIG.DRIVE_FOLDERS.length || '—';
  statVideos.textContent     = CACHE.videos.length || '—';
}


// ════════════════════════════════════════════════════════════
// ERROR STATES
// ════════════════════════════════════════════════════════════
function showConfigError() {
  cardGrid.innerHTML = '';
  cardGrid.hidden = true;
  emptyState.hidden = false;
  emptyMsg.textContent = 'Config not set up yet. Add your API key and folder IDs to config.js.';
  clearVideoSkeletons();
}

function showDriveError(msg) {
  cardGrid.innerHTML = '';
  cardGrid.hidden = true;
  emptyState.hidden = false;
  emptyMsg.textContent = `Could not load resources. (${msg})`;
}

function showVideoError(msg) {
  console.warn('YouTube API error:', msg);
  clearVideoSkeletons();
}


// ════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════
function getMimeLabel(mime) {
  const map = {
    'application/vnd.google-apps.document':     'GOOGLE DOC',
    'application/vnd.google-apps.spreadsheet':  'GOOGLE SHEET',
    'application/pdf':                          'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       'XLSX',
  };
  return map[mime] || 'FILE';
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

function cleanFileName(name) {
  return name.replace(/^\d+_/, '').replace(/\.(docx?|xlsx?|pdf|gsheet|gdoc)$/i, '').toUpperCase();
}


// ════════════════════════════════════════════════════════════
// GO
// ════════════════════════════════════════════════════════════
init();
