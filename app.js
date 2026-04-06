// ═══════════════════════════════════════════════════════════
// FORUM PLAYBOOK — app.js
// Phase 2: Recursive accordion, root-folder-driven taxonomy
// ═══════════════════════════════════════════════════════════

// ── Session cache (no localStorage) ────────────────────────
const CACHE = {
  sections: [],    // Top-level folder nodes (subfolders of root)
  videos: [],      // YouTube playlist items
};

// ── State ───────────────────────────────────────────────────
let searchQuery = '';

// ── DOM refs ─────────────────────────────────────────────────
const accordionWrap = document.getElementById('accordion-wrap');
const searchInput   = document.getElementById('search-input');
const videoGrid     = document.getElementById('video-grid');
const resourceCount = document.getElementById('resource-count');
const statResources = document.getElementById('stat-resources');
const statCategories= document.getElementById('stat-categories');
const statVideos    = document.getElementById('stat-videos');
const lightbox      = document.getElementById('lightbox');
const lightboxEmbed = document.getElementById('lightbox-embed');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxBg    = document.getElementById('lightbox-backdrop');
const coreGrid      = document.getElementById('core-grid');


// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
async function init() {
  if (!CONFIG.GOOGLE_API_KEY || CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') {
    showConfigError();
    return;
  }

  renderCoreResources();

  await Promise.all([
    loadResourceLibrary(),
    loadYouTubeVideos(),
  ]);
}


// ════════════════════════════════════════════════════════════
// CORE RESOURCES — hardcoded featured cards
// ════════════════════════════════════════════════════════════
function renderCoreResources() {
  if (!coreGrid || !CONFIG.CORE_RESOURCES || !CONFIG.CORE_RESOURCES.length) return;

  coreGrid.innerHTML = CONFIG.CORE_RESOURCES.map(r => buildCoreCardHTML(r)).join('');

  coreGrid.querySelectorAll('[data-download-url]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      downloadFile(btn.dataset.downloadUrl, btn.dataset.filename);
    });
  });
}

function buildCoreCardHTML(resource) {
  const base     = `https://www.googleapis.com/drive/v3/files/${resource.fileId}/export?key=${CONFIG.GOOGLE_API_KEY}`;
  const driveUrl = `https://drive.google.com/open?id=${resource.fileId}`;
  const icon     = resource.type === 'doc' ? iconDoc() : iconSheet();
  let buttons    = '';

  if (resource.type === 'doc') {
    const docxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
    const pdfUrl  = `${base}&mimeType=application/pdf`;
    buttons += btnDownload('↓ DOCX', docxUrl, `${resource.title}.docx`, 'primary');
    buttons += btnDownload('↓ PDF',  pdfUrl,  `${resource.title}.pdf`,  'secondary');
    buttons += btnGhost('↗ Drive', driveUrl);
  } else if (resource.type === 'sheet') {
    const xlsxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
    const pdfUrl  = `${base}&mimeType=application/pdf`;
    buttons += btnDownload('↓ XLSX', xlsxUrl, `${resource.title}.xlsx`, 'primary');
    buttons += btnDownload('↓ PDF',  pdfUrl,  `${resource.title}.pdf`,  'secondary');
    buttons += btnGhost('↗ Drive', driveUrl);
  }

  return `
    <div class="card core-card">
      <div class="corner-tl"></div>
      <div class="corner-br"></div>
      <div class="core-badge">CORE RESOURCE</div>
      <div class="core-icon">${icon}</div>
      <div class="card-title">${resource.title.toUpperCase()}</div>
      <div class="card-meta">${resource.subtitle}</div>
      <div class="card-btns">${buttons}</div>
    </div>
  `;
}

function iconDoc() {
  return `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="3" width="16" height="22" stroke="#E8521A" stroke-width="1"/>
    <rect x="9" y="8" width="10" height="1" fill="#E8521A"/>
    <rect x="9" y="11" width="10" height="1" fill="#C4B8A8"/>
    <rect x="9" y="14" width="10" height="1" fill="#C4B8A8"/>
    <rect x="9" y="17" width="6" height="1" fill="#C4B8A8"/>
    <circle cx="23" cy="22" r="5" fill="#E8E2D6" stroke="#E8521A" stroke-width="1"/>
    <path d="M21 22l1.5 1.5L25 20.5" stroke="#E8521A" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function iconSheet() {
  return `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="24" height="24" stroke="#E8521A" stroke-width="1"/>
    <line x1="4" y1="10" x2="28" y2="10" stroke="#E8521A" stroke-width="1"/>
    <line x1="4" y1="16" x2="28" y2="16" stroke="#C4B8A8" stroke-width="0.75"/>
    <line x1="4" y1="22" x2="28" y2="22" stroke="#C4B8A8" stroke-width="0.75"/>
    <line x1="11" y1="4" x2="11" y2="28" stroke="#C4B8A8" stroke-width="0.75"/>
    <line x1="20" y1="4" x2="20" y2="28" stroke="#C4B8A8" stroke-width="0.75"/>
    <rect x="4" y="4" width="7" height="6" fill="#E8521A" fill-opacity="0.15"/>
    <rect x="11" y="4" width="9" height="6" fill="#E8521A" fill-opacity="0.08"/>
    <rect x="20" y="4" width="8" height="6" fill="#E8521A" fill-opacity="0.08"/>
  </svg>`;
}


// ════════════════════════════════════════════════════════════
// DRIVE — fetch folder contents
// ════════════════════════════════════════════════════════════
async function fetchFolderContents(folderId) {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', `'${folderId}' in parents and trashed = false`);
  url.searchParams.set('fields', 'files(id,name,mimeType,modifiedTime)');
  url.searchParams.set('orderBy', 'name');
  url.searchParams.set('pageSize', '200');
  url.searchParams.set('key', CONFIG.GOOGLE_API_KEY);

  const res  = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.files || [];
}

// Recursively build a folder node
async function buildFolderNode(folderId, folderName) {
  const restricted = isRestricted(folderName);

  // Don't fetch contents of restricted folders
  if (restricted) {
    return { id: folderId, name: folderName, files: [], subfolders: [], restricted: true };
  }

  const contents   = await fetchFolderContents(folderId);
  const files      = contents.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
  const rawFolders = contents.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

  const subfolders = await Promise.all(
    rawFolders.map(sf => buildFolderNode(sf.id, sf.name))
  );

  return { id: folderId, name: folderName, files, subfolders, restricted: false };
}

function isRestricted(name) {
  const lower = name.toLowerCase();
  return (CONFIG.RESTRICTED_FOLDER_NAMES || []).some(r => lower.includes(r.toLowerCase()));
}

async function loadResourceLibrary() {
  try {
    accordionWrap.innerHTML = buildSkeletonAccordion();

    // Fetch the root folder's immediate subfolders — these become top-level sections
    const rootContents = await fetchFolderContents(CONFIG.DRIVE_ROOT_FOLDER_ID);
    const topFolders   = rootContents.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

    // Also surface any loose files at root level (rare but handle gracefully)
    const rootFiles    = rootContents.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');

    // Build each top-level section recursively
    const sections = await Promise.all(
      topFolders.map(f => buildFolderNode(f.id, f.name))
    );

    // If there are loose root-level files, add a catch-all section
    if (rootFiles.length) {
      sections.unshift({ id: CONFIG.DRIVE_ROOT_FOLDER_ID, name: 'General', files: rootFiles, subfolders: [], restricted: false });
    }

    CACHE.sections = sections;
    renderAccordion();
    updateStats();

  } catch (err) {
    accordionWrap.innerHTML = `<div class="empty-state"><div class="empty-icon">◈</div><div class="empty-title">Could not load resources</div><div class="empty-msg">${err.message}</div></div>`;
  }
}


// ════════════════════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════════════════════
searchInput.addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderAccordion();
});


// ════════════════════════════════════════════════════════════
// RENDER ACCORDION
// ════════════════════════════════════════════════════════════
function renderAccordion() {
  if (!CACHE.sections.length) return;

  let totalMatching = 0;

  const html = CACHE.sections.map(section => {
    if (section.restricted) return buildRestrictedAccordionHTML(section.name);
    const { html: bodyHtml, count } = buildFolderBodyHTML(section, 0);
    totalMatching += count;
    return buildAccordionSectionHTML(section.name, count, bodyHtml);
  }).join('');

  accordionWrap.innerHTML = html || `<div class="empty-state"><div class="empty-icon">◈</div><div class="empty-title">No resources found</div><div class="empty-msg">Try a different search term.</div></div>`;

  resourceCount.textContent = `${totalMatching} resource${totalMatching !== 1 ? 's' : ''}`;

  // Toggle listeners
  accordionWrap.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('open');
      header.nextElementSibling.classList.toggle('open');
    });
  });

  accordionWrap.querySelectorAll('.sub-header').forEach(header => {
    header.addEventListener('click', e => {
      e.stopPropagation();
      header.classList.toggle('open');
      header.nextElementSibling.classList.toggle('open');
    });
  });

  // Download handlers
  accordionWrap.querySelectorAll('[data-download-url]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      downloadFile(btn.dataset.downloadUrl, btn.dataset.filename);
    });
  });
}

// Recursively build folder body HTML
function buildFolderBodyHTML(folder, depth) {
  let count = 0;
  let html  = '';

  const matchingFiles = folder.files.filter(f => {
    if (!searchQuery) return true;
    return cleanFileName(f.name).toLowerCase().includes(searchQuery) ||
           folder.name.toLowerCase().includes(searchQuery);
  });

  count += matchingFiles.length;
  html  += matchingFiles.map(f => buildDocRowHTML(f, depth)).join('');

  folder.subfolders.forEach(sf => {
    const { html: subHtml, count: subCount } = buildFolderBodyHTML(sf, depth + 1);
    count += subCount;
    if (!searchQuery || subCount > 0) {
      html += buildSubfolderHTML(sf.name, subCount, subHtml, depth);
    }
  });

  return { html, count };
}

function buildAccordionSectionHTML(name, count, bodyHtml) {
  const label = cleanFolderName(name);
  return `
    <div class="acc-category">
      <div class="acc-header">
        <div class="acc-header-left">
          <div class="acc-cat-name">${label}</div>
          <div class="acc-count">${count} document${count !== 1 ? 's' : ''}</div>
        </div>
        <span class="acc-caret">▼</span>
      </div>
      <div class="acc-body">
        ${bodyHtml || '<div class="acc-empty">No documents in this category yet.</div>'}
      </div>
    </div>
  `;
}

function buildSubfolderHTML(name, count, bodyHtml, depth) {
  const indent = depth * 12;
  const label  = cleanFolderName(name);
  return `
    <div class="sub-folder" style="padding-left:${indent}px;">
      <div class="sub-header">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;">
          <path d="M1 3h4l1 1.5h5v6H1V3z" stroke="#D4A832" stroke-width="0.8" fill="#D4A832" fill-opacity="0.15"/>
        </svg>
        <div class="sub-folder-name">${label}</div>
        <div class="sub-folder-count">${count} doc${count !== 1 ? 's' : ''}</div>
        <span class="sub-caret">▼</span>
      </div>
      <div class="sub-body">
        ${bodyHtml || '<div class="acc-empty" style="padding-left:16px;">Empty folder.</div>'}
      </div>
    </div>
  `;
}

function buildDocRowHTML(file, depth) {
  const title   = cleanFileName(file.name);
  const type    = getMimeLabel(file.mimeType);
  const date    = formatDate(file.modifiedTime);
  const buttons = buildDocButtonsHTML(file);
  const indent  = depth * 12;
  const icon    = getDocIcon(file.mimeType);

  return `
    <div class="doc-row" style="padding-left:${16 + indent}px;">
      ${icon}
      <div class="doc-name">${title}</div>
      <div class="doc-meta">${type} · ${date}</div>
      <div class="doc-btns">${buttons}</div>
    </div>
  `;
}

function buildRestrictedAccordionHTML(name) {
  const label = cleanFolderName(name);
  return `
    <div class="acc-category acc-restricted">
      <div class="acc-header">
        <div class="acc-header-left">
          <div class="acc-cat-name" style="color:#C4B8A8;">${label}</div>
          <div class="acc-count">Access restricted</div>
        </div>
        <span class="acc-caret">▼</span>
      </div>
      <div class="acc-body">
        <div class="doc-row" style="padding:16px;">
          <div class="doc-name" style="color:#A89880; font-size:10px; text-transform:none; letter-spacing:0.03em; line-height:1.6;">EO Legal now prohibits anyone from linking to EO official materials. You gotta hit up a trainer or staff member to get those documents directly.</div>
        </div>
      </div>
    </div>
  `;
}

function getDocIcon(mime) {
  if (mime === 'application/vnd.google-apps.document' ||
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="2" y="1" width="9" height="13" stroke="#E8521A" stroke-width="0.8"/><line x1="4" y1="5" x2="9" y2="5" stroke="#C4B8A8" stroke-width="0.7"/><line x1="4" y1="7" x2="9" y2="7" stroke="#C4B8A8" stroke-width="0.7"/><line x1="4" y1="9" x2="7" y2="9" stroke="#C4B8A8" stroke-width="0.7"/></svg>`;
  }
  if (mime === 'application/vnd.google-apps.spreadsheet' ||
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="14" height="14" stroke="#3A8A8A" stroke-width="0.8"/><line x1="1" y1="5" x2="15" y2="5" stroke="#3A8A8A" stroke-width="0.7"/><line x1="6" y1="1" x2="6" y2="15" stroke="#C4B8A8" stroke-width="0.7"/></svg>`;
  }
  if (mime === 'application/pdf') {
    return `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="2" y="1" width="9" height="13" stroke="#B83A14" stroke-width="0.8"/><line x1="4" y1="5" x2="9" y2="5" stroke="#B83A14" stroke-width="0.7"/></svg>`;
  }
  return `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="2" y="1" width="9" height="13" stroke="#C4B8A8" stroke-width="0.8"/></svg>`;
}


// ════════════════════════════════════════════════════════════
// DOWNLOAD HELPER
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
    window.open(url, '_blank', 'noopener');
  }
}

function buildDocButtonsHTML(file) {
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
    html += btnDownload('↓ DOCX', dlUrl,  `${baseName}.docx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl, `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ Drive', driveUrl);
  } else if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const dlUrl  = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
    const pdfUrl = `${base}&mimeType=application/pdf`;
    html += btnDownload('↓ XLSX', dlUrl,  `${baseName}.xlsx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl, `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ Drive', driveUrl);
  } else {
    html += btnGhost('↗ Drive', driveUrl);
  }

  return html;
}

function btnDownload(label, url, filename, style) {
  const cls = style === 'primary' ? 'btn btn-primary sh warm' : 'btn sh warm';
  return `<button class="${cls}" data-download-url="${url}" data-filename="${filename}"><span>${label}</span></button>`;
}

function btnGhost(label, url) {
  return `<a href="${url}" class="btn btn-ghost sh cool" target="_blank" rel="noopener"><span>${label}</span></a>`;
}


// ════════════════════════════════════════════════════════════
// SKELETON LOADING STATE
// ════════════════════════════════════════════════════════════
function buildSkeletonAccordion() {
  return [1,2,3,4].map(() => `
    <div class="acc-category skeleton">
      <div class="acc-header" style="pointer-events:none;">
        <div class="acc-header-left">
          <div class="skel-line" style="width:180px;height:14px;margin:0;border-radius:2px;"></div>
          <div class="skel-line" style="width:80px;height:10px;margin:0;border-radius:2px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}


// ════════════════════════════════════════════════════════════
// YOUTUBE — manual playlist order
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

    CACHE.videos = data.items || [];
    renderVideos();
    updateStats();

  } catch (err) {
    showVideoError(err.message);
  }
}


// ════════════════════════════════════════════════════════════
// RENDER VIDEO CARDS
// ════════════════════════════════════════════════════════════
function renderVideos() {
  if (!CACHE.videos.length) { clearVideoSkeletons(); return; }
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
        <div class="play-btn" aria-hidden="true"><div class="play-triangle"></div></div>
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
  lightboxEmbed.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
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
  const totalFiles = countAllFiles(CACHE.sections);
  statResources.textContent  = totalFiles || '—';
  statCategories.textContent = CACHE.sections.filter(s => !s.restricted).length || '—';
  statVideos.textContent     = CACHE.videos.length || '—';
}

function countAllFiles(sections) {
  let count = 0;
  sections.forEach(s => {
    if (s.restricted) return;
    count += s.files.length;
    count += countAllFiles(s.subfolders || []);
  });
  return count;
}


// ════════════════════════════════════════════════════════════
// ERROR STATES
// ════════════════════════════════════════════════════════════
function showConfigError() {
  accordionWrap.innerHTML = `<div class="empty-state"><div class="empty-icon">◈</div><div class="empty-title">Config not set up</div><div class="empty-msg">Add your API key to config.js.</div></div>`;
  clearVideoSkeletons();
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
  const d   = new Date(iso);
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
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
  return name.replace(/^\d+[\._\-\s]+/, '').replace(/\.(docx?|xlsx?|pdf|gsheet|gdoc)$/i, '').toUpperCase();
}

function cleanFolderName(name) {
  return name.replace(/^\d+[\._\-\s]+/, '');
}


// ════════════════════════════════════════════════════════════
// GO
// ════════════════════════════════════════════════════════════
init();
