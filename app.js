// ═══════════════════════════════════════════════════════════
// FORUM PLAYBOOK — app.js
// Phase 2: Recursive accordion, root-folder-driven taxonomy
// ═══════════════════════════════════════════════════════════

// ── Session cache (no localStorage) ────────────────────────
const CACHE = {
sections: [],
videos: [],
};

// ── State ───────────────────────────────────────────────────
let searchQuery = ‘’;

// ── DOM refs ─────────────────────────────────────────────────
const accordionWrap = document.getElementById(‘accordion-wrap’);
const searchInput   = document.getElementById(‘search-input’);
const videoGrid     = document.getElementById(‘video-grid’);
const resourceCount = document.getElementById(‘resource-count’);
const statResources = document.getElementById(‘stat-resources’);
const statCategories= document.getElementById(‘stat-categories’);
const statVideos    = document.getElementById(‘stat-videos’);
const lightbox      = document.getElementById(‘lightbox’);
const lightboxEmbed = document.getElementById(‘lightbox-embed’);
const lightboxClose = document.getElementById(‘lightbox-close’);
const lightboxBg    = document.getElementById(‘lightbox-backdrop’);
const coreGrid      = document.getElementById(‘core-grid’);

// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
async function init() {
if (!CONFIG.GOOGLE_API_KEY || CONFIG.GOOGLE_API_KEY === ‘YOUR_API_KEY_HERE’) {
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
// CORE RESOURCES — centered icon, Option B style
// ════════════════════════════════════════════════════════════
function renderCoreResources() {
if (!coreGrid || !CONFIG.CORE_RESOURCES || !CONFIG.CORE_RESOURCES.length) return;
coreGrid.innerHTML = CONFIG.CORE_RESOURCES.map(r => buildCoreCardHTML(r)).join(’’);
coreGrid.querySelectorAll(’[data-download-url]’).forEach(btn => {
btn.addEventListener(‘click’, e => {
e.preventDefault();
downloadFile(btn.dataset.downloadUrl, btn.dataset.filename);
});
});
}

function buildCoreCardHTML(resource) {
const base     = `https://www.googleapis.com/drive/v3/files/${resource.fileId}/export?key=${CONFIG.GOOGLE_API_KEY}`;
const driveUrl = `https://drive.google.com/open?id=${resource.fileId}`;
const icon     = resource.type === ‘doc’ ? coreIconDoc() : resource.type === ‘sheet’ ? coreIconSheet() : coreIconExternal();
let buttons    = ‘’;

if (resource.type === ‘doc’) {
const docxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
const pdfUrl  = `${base}&mimeType=application/pdf`;
buttons += btnDownload(‘↓ DOCX’, docxUrl, `${resource.title}.docx`, ‘primary’);
buttons += btnDownload(‘↓ PDF’,  pdfUrl,  `${resource.title}.pdf`,  ‘secondary’);
buttons += coreBtnGhost(‘↗ GDrive’, driveUrl);
} else if (resource.type === ‘sheet’) {
const xlsxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
const pdfUrl  = `${base}&mimeType=application/pdf`;
buttons += btnDownload(‘↓ XLSX’, xlsxUrl, `${resource.title}.xlsx`, ‘primary’);
buttons += btnDownload(‘↓ PDF’,  pdfUrl,  `${resource.title}.pdf`,  ‘secondary’);
buttons += coreBtnGhost(‘↗ GDrive’, driveUrl);
} else if (resource.type === ‘external’) {
buttons += `<a href="${resource.url}" target="_blank" rel="noopener" class="btn btn-teal sh cool-teal"><span>↗ Visit Site</span></a>`;
}

const isExternal = resource.type === ‘external’;
return `<div class="card core-card${isExternal ? ' core-card-external' : ''}"> <div class="corner-tl${isExternal ? ' corner-tl-teal' : ''}"></div> <div class="corner-br"></div> <div class="${isExternal ? 'core-badge-external' : 'core-badge'}">${isExternal ? 'EXTERNAL RESOURCE' : 'CORE RESOURCE'}</div> <div class="core-icon-wrap">${icon}</div> <div class="card-title">${resource.title.toUpperCase()}</div> <div class="card-meta">${resource.subtitle}</div> <div class="card-btns">${buttons}</div> </div>`;
}

function coreBtnGhost(label, url) {
return `<a href="${url}" class="btn btn-ghost sh cool" target="_blank" rel="noopener"><span>${label}</span></a>`;
}

// Large centered doc icon
function coreIconDoc() {
return `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="6" y="2" width="32" height="42" stroke="#E8521A" stroke-width="1.5"/> <rect x="2" y="6" width="32" height="42" stroke="#C4B8A8" stroke-width="1" fill="#F8F4EE"/> <rect x="10" y="14" width="16" height="2" fill="#E8521A"/> <rect x="10" y="19" width="16" height="1.5" fill="#C4B8A8"/> <rect x="10" y="23" width="16" height="1.5" fill="#C4B8A8"/> <rect x="10" y="27" width="10" height="1.5" fill="#C4B8A8"/> <rect x="10" y="31" width="13" height="1.5" fill="#C4B8A8"/> <circle cx="38" cy="38" r="9" fill="#F0EBE0" stroke="#E8521A" stroke-width="1.2"/> <path d="M35 38l2.5 2.5L42 35" stroke="#E8521A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/> </svg>`;
}

// Large centered sheet icon
function coreIconSheet() {
return `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="2" y="6" width="32" height="42" stroke="#C4B8A8" stroke-width="1" fill="#F8F4EE"/> <rect x="6" y="2" width="40" height="44" stroke="#3A8A8A" stroke-width="1.5" fill="#fff"/> <line x1="6" y1="12" x2="46" y2="12" stroke="#3A8A8A" stroke-width="1.2"/> <line x1="6" y1="22" x2="46" y2="22" stroke="#C4B8A8" stroke-width="0.8"/> <line x1="6" y1="32" x2="46" y2="32" stroke="#C4B8A8" stroke-width="0.8"/> <line x1="6" y1="42" x2="46" y2="42" stroke="#C4B8A8" stroke-width="0.8"/> <line x1="20" y1="2" x2="20" y2="46" stroke="#C4B8A8" stroke-width="0.8"/> <line x1="34" y1="2" x2="34" y2="46" stroke="#C4B8A8" stroke-width="0.8"/> <rect x="6" y="2" width="14" height="10" fill="#3A8A8A" fill-opacity="0.2"/> <rect x="20" y="2" width="14" height="10" fill="#3A8A8A" fill-opacity="0.1"/> <rect x="34" y="2" width="12" height="10" fill="#3A8A8A" fill-opacity="0.1"/> </svg>`;
}

// Large centered external/questions icon
function coreIconExternal() {
return `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="4" y="4" width="44" height="44" stroke="#3A8A8A" stroke-width="1.5" fill="#F8F4EE"/> <rect x="4" y="4" width="44" height="12" fill="#3A8A8A" fill-opacity="0.15" stroke="#3A8A8A" stroke-width="1.5"/> <line x1="4" y1="16" x2="48" y2="16" stroke="#3A8A8A" stroke-width="1.2"/> <text x="26" y="38" text-anchor="middle" font-family="Big Shoulders Display, sans-serif" font-size="22" font-weight="900" fill="#3A8A8A" letter-spacing="-1">?</text> </svg>`;
}
function folderClosed() {
return `<svg class="folder-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M1 4.5h4.5l1.5 2H15v7.5H1V4.5z" stroke="#D4A832" stroke-width="0.9" fill="#D4A832" fill-opacity="0.15"/> <path d="M1 4.5h4.5l1.5 2" stroke="#D4A832" stroke-width="0.9" stroke-linejoin="round"/> </svg>`;
}

function folderOpen() {
return `<svg class="folder-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M1 4.5h4.5l1.5 2H15v7.5H1V4.5z" stroke="#D4A832" stroke-width="0.9" fill="#D4A832" fill-opacity="0.28"/> <path d="M1 4.5h4.5l1.5 2" stroke="#D4A832" stroke-width="0.9" stroke-linejoin="round"/> <line x1="1" y1="6.5" x2="15" y2="6.5" stroke="#D4A832" stroke-width="0.75"/> <path d="M3.5 9.5h9" stroke="#D4A832" stroke-width="0.6" stroke-linecap="round"/> <path d="M3.5 11.5h6" stroke="#D4A832" stroke-width="0.6" stroke-linecap="round"/> </svg>`;
}

function folderIconPair() {
return `<span class="fi-closed" style="display:inline;line-height:0;">${folderClosed()}</span> <span class="fi-open"   style="display:none; line-height:0;">${folderOpen()}</span>`;
}

// Video camera icon
function videoIcon() {
return `<svg class="video-type-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"> <rect x="1" y="3" width="10" height="10" stroke="#E8521A" stroke-width="0.9"/> <path d="M11 6l4-2v8l-4-2V6z" stroke="#E8521A" stroke-width="0.9" fill="#E8521A" fill-opacity="0.15"/> </svg>`;
}

// ════════════════════════════════════════════════════════════
// DRIVE — fetch and recurse
// ════════════════════════════════════════════════════════════
async function fetchFolderContents(folderId) {
const url = new URL(‘https://www.googleapis.com/drive/v3/files’);
url.searchParams.set(‘q’, `'${folderId}' in parents and trashed = false`);
url.searchParams.set(‘fields’, ‘files(id,name,mimeType,modifiedTime)’);
url.searchParams.set(‘orderBy’, ‘name’);
url.searchParams.set(‘pageSize’, ‘200’);
url.searchParams.set(‘key’, CONFIG.GOOGLE_API_KEY);
const res  = await fetch(url.toString());
const data = await res.json();
if (data.error) throw new Error(data.error.message);
return data.files || [];
}

async function buildFolderNode(folderId, folderName) {
const restricted = isRestricted(folderName);
if (restricted) return { id: folderId, name: folderName, files: [], subfolders: [], restricted: true };
const contents   = await fetchFolderContents(folderId);
const files      = contents.filter(f => f.mimeType !== ‘application/vnd.google-apps.folder’);
const rawFolders = contents.filter(f => f.mimeType === ‘application/vnd.google-apps.folder’);
const subfolders = await Promise.all(rawFolders.map(sf => buildFolderNode(sf.id, sf.name)));
return { id: folderId, name: folderName, files, subfolders, restricted: false };
}

function isRestricted(name) {
const lower = name.toLowerCase();
return (CONFIG.RESTRICTED_FOLDER_NAMES || []).some(r => lower.includes(r.toLowerCase()));
}

async function loadResourceLibrary() {
try {
accordionWrap.innerHTML = buildSkeletonAccordion();
const rootContents = await fetchFolderContents(CONFIG.DRIVE_ROOT_FOLDER_ID);
const topFolders   = rootContents.filter(f => f.mimeType === ‘application/vnd.google-apps.folder’);
const rootFiles    = rootContents.filter(f => f.mimeType !== ‘application/vnd.google-apps.folder’);
const sections     = await Promise.all(topFolders.map(f => buildFolderNode(f.id, f.name)));
if (rootFiles.length) {
sections.unshift({ id: CONFIG.DRIVE_ROOT_FOLDER_ID, name: ‘General’, files: rootFiles, subfolders: [], restricted: false });
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
searchInput.addEventListener(‘input’, e => {
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
}).join(’’);

accordionWrap.innerHTML = html || `<div class="empty-state"><div class="empty-icon">◈</div><div class="empty-title">No resources found</div><div class="empty-msg">Try a different search term.</div></div>`;
resourceCount.textContent = `${totalMatching} resource${totalMatching !== 1 ? 's' : ''}`;

accordionWrap.querySelectorAll(’.acc-header’).forEach(header => {
header.addEventListener(‘click’, () => {
const isOpen = header.classList.toggle(‘open’);
header.nextElementSibling.classList.toggle(‘open’);
const closed = header.querySelector(’.fi-closed’);
const open   = header.querySelector(’.fi-open’);
if (closed) closed.style.display = isOpen ? ‘none’ : ‘inline’;
if (open)   open.style.display   = isOpen ? ‘inline’ : ‘none’;
});
});

accordionWrap.querySelectorAll(’.sub-header’).forEach(header => {
header.addEventListener(‘click’, e => {
e.stopPropagation();
const isOpen = header.classList.toggle(‘open’);
header.nextElementSibling.classList.toggle(‘open’);
const closed = header.querySelector(’.fi-closed’);
const open   = header.querySelector(’.fi-open’);
if (closed) closed.style.display = isOpen ? ‘none’ : ‘inline’;
if (open)   open.style.display   = isOpen ? ‘inline’ : ‘none’;
});
});

accordionWrap.querySelectorAll(’[data-download-url]’).forEach(btn => {
btn.addEventListener(‘click’, e => {
e.preventDefault();
e.stopPropagation();
downloadFile(btn.dataset.downloadUrl, btn.dataset.filename);
});
});
}

function buildFolderBodyHTML(folder, depth) {
let count = 0;
let html  = ‘’;
const matchingFiles = folder.files.filter(f => {
if (!searchQuery) return true;
return cleanFileName(f.name).toLowerCase().includes(searchQuery) ||
folder.name.toLowerCase().includes(searchQuery);
});
count += matchingFiles.length;
html  += matchingFiles.map(f => buildDocRowHTML(f, depth)).join(’’);
folder.subfolders.forEach(sf => {
const { html: subHtml, count: subCount } = buildFolderBodyHTML(sf, depth + 1);
count += subCount;
if (!searchQuery || subCount > 0) html += buildSubfolderHTML(sf.name, subCount, subHtml, depth);
});
return { html, count };
}

function buildAccordionSectionHTML(name, count, bodyHtml) {
const label = cleanFolderName(name);
return `<div class="acc-category"> <div class="acc-header"> <div class="acc-header-left"> ${folderIconPair()} <div class="acc-cat-name">${label}</div> <div class="acc-count">${count} document${count !== 1 ? 's' : ''}</div> </div> <span class="acc-caret">▼</span> </div> <div class="acc-body"> ${bodyHtml || '<div class="acc-empty">No documents in this category yet.</div>'} </div> </div>`;
}

function buildSubfolderHTML(name, count, bodyHtml, depth) {
const indent = depth * 12;
const label  = cleanFolderName(name);
return `<div class="sub-folder" style="padding-left:${indent}px;"> <div class="sub-header"> ${folderIconPair()} <div class="sub-folder-name">${label}</div> <div class="sub-folder-count">${count} doc${count !== 1 ? 's' : ''}</div> <span class="sub-caret">▼</span> </div> <div class="sub-body"> ${bodyHtml || '<div class="acc-empty" style="padding-left:16px;">Empty folder.</div>'} </div> </div>`;
}

function buildDocRowHTML(file, depth) {
const title   = cleanFileName(file.name);
const type    = getMimeLabel(file.mimeType);
const date    = formatDate(file.modifiedTime);
const buttons = buildDocButtonsHTML(file);
const indent  = depth * 12;
const icon    = getDocIcon(file.mimeType);
return `<div class="doc-row" style="padding-left:${16 + indent}px;"> ${icon} <div class="doc-name">${title}</div> <div class="doc-meta">${type} · ${date}</div> <div class="doc-btns">${buttons}</div> </div>`;
}

function buildRestrictedAccordionHTML(name) {
const label = cleanFolderName(name);
return `<div class="acc-category acc-restricted"> <div class="acc-header"> <div class="acc-header-left"> ${folderIconPair()} <div class="acc-cat-name" style="color:#C4B8A8;">${label}</div> <div class="acc-count">Access restricted</div> </div> <span class="acc-caret">▼</span> </div> <div class="acc-body"> <div class="doc-row" style="padding:16px;gap:16px;"> <div class="doc-name" style="color:#A89880;font-size:10px;text-transform:none;letter-spacing:0.03em;line-height:1.6;">EO Legal prohibits linking to official EO materials here. Access them directly on the EO Member Site, or reach out to your local EO staff or a certified trainer.</div> <a href="https://member.eonetwork.org/member/forum/meeting-resources" target="_blank" rel="noopener" class="btn btn-ghost sh cool" style="flex-shrink:0;white-space:nowrap;"><span>↗ EO Member Site</span></a> </div> </div> </div>`;
}

function getDocIcon(mime) {
if (mime === ‘application/vnd.google-apps.document’ ||
mime === ‘application/vnd.openxmlformats-officedocument.wordprocessingml.document’) {
return `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="2" y="1" width="9" height="13" stroke="#E8521A" stroke-width="0.8"/><line x1="4" y1="5" x2="9" y2="5" stroke="#C4B8A8" stroke-width="0.7"/><line x1="4" y1="7" x2="9" y2="7" stroke="#C4B8A8" stroke-width="0.7"/><line x1="4" y1="9" x2="7" y2="9" stroke="#C4B8A8" stroke-width="0.7"/></svg>`;
}
if (mime === ‘application/vnd.google-apps.spreadsheet’ ||
mime === ‘application/vnd.openxmlformats-officedocument.spreadsheetml.sheet’) {
return `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="1" y="1" width="14" height="14" stroke="#3A8A8A" stroke-width="0.8"/><line x1="1" y1="5" x2="15" y2="5" stroke="#3A8A8A" stroke-width="0.7"/><line x1="6" y1="1" x2="6" y2="15" stroke="#C4B8A8" stroke-width="0.7"/></svg>`;
}
if (mime === ‘application/pdf’) {
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
if (!res.ok) throw new Error(‘Download failed’);
const blob = await res.blob();
const blobUrl = URL.createObjectURL(blob);
const a = document.createElement(‘a’);
a.href = blobUrl;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
} catch (err) {
console.error(‘Download error:’, err);
window.open(url, ‘_blank’, ‘noopener’);
}
}

function buildDocButtonsHTML(file) {
const id       = file.id;
const mime     = file.mimeType;
const base     = `https://www.googleapis.com/drive/v3/files/${id}/export?key=${CONFIG.GOOGLE_API_KEY}`;
const baseName = cleanFileName(file.name);
const driveUrl = `https://drive.google.com/open?id=${id}`;
let html = ‘’;
if (mime === ‘application/vnd.google-apps.document’) {
const docxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
const pdfUrl  = `${base}&mimeType=application/pdf`;
html += btnDownload(‘↓ DOCX’, docxUrl, `${baseName}.docx`, ‘primary’);
html += btnDownload(‘↓ PDF’,  pdfUrl,  `${baseName}.pdf`,  ‘secondary’);
html += btnGhost(‘↗ GDrive’, driveUrl);
} else if (mime === ‘application/vnd.google-apps.spreadsheet’) {
const xlsxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
const pdfUrl  = `${base}&mimeType=application/pdf`;
html += btnDownload(‘↓ XLSX’, xlsxUrl, `${baseName}.xlsx`, ‘primary’);
html += btnDownload(‘↓ PDF’,  pdfUrl,  `${baseName}.pdf`,  ‘secondary’);
html += btnGhost(‘↗ GDrive’, driveUrl);
} else if (mime === ‘application/pdf’) {
const pdfUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
html += btnDownload(‘↓ PDF’, pdfUrl, `${baseName}.pdf`, ‘secondary’);
html += btnGhost(‘↗ GDrive’, driveUrl);
} else if (mime === ‘application/vnd.openxmlformats-officedocument.wordprocessingml.document’) {
const dlUrl  = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
const pdfUrl = `${base}&mimeType=application/pdf`;
html += btnDownload(‘↓ DOCX’, dlUrl,  `${baseName}.docx`, ‘primary’);
html += btnDownload(‘↓ PDF’,  pdfUrl, `${baseName}.pdf`,  ‘secondary’);
html += btnGhost(‘↗ GDrive’, driveUrl);
} else if (mime === ‘application/vnd.openxmlformats-officedocument.spreadsheetml.sheet’) {
const dlUrl  = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
const pdfUrl = `${base}&mimeType=application/pdf`;
html += btnDownload(‘↓ XLSX’, dlUrl,  `${baseName}.xlsx`, ‘primary’);
html += btnDownload(‘↓ PDF’,  pdfUrl, `${baseName}.pdf`,  ‘secondary’);
html += btnGhost(‘↗ GDrive’, driveUrl);
} else {
html += btnGhost(‘↗ GDrive’, driveUrl);
}
return html;
}

function btnDownload(label, url, filename, style) {
const cls = style === ‘primary’ ? ‘btn btn-primary sh warm’ : ‘btn sh warm’;
return `<button class="${cls}" data-download-url="${url}" data-filename="${filename}"><span>${label}</span></button>`;
}

function btnGhost(label, url) {
return `<a href="${url}" class="btn btn-ghost sh cool" target="_blank" rel="noopener"><span>${label}</span></a>`;
}

// ════════════════════════════════════════════════════════════
// SKELETON
// ════════════════════════════════════════════════════════════
function buildSkeletonAccordion() {
return [1,2,3,4].map(() => `<div class="acc-category skeleton"> <div class="acc-header" style="pointer-events:none;"> <div class="acc-header-left" style="gap:10px;"> <div style="width:16px;height:16px;background:#E8E2D6;flex-shrink:0;"></div> <div class="skel-line" style="width:180px;height:14px;margin:0;border-radius:2px;"></div> <div class="skel-line" style="width:70px;height:10px;margin:0;border-radius:2px;"></div> </div> </div> </div>`).join(’’);
}

// ════════════════════════════════════════════════════════════
// YOUTUBE — manual playlist order
// ════════════════════════════════════════════════════════════
async function loadYouTubeVideos() {
try {
if (!CONFIG.YOUTUBE_PLAYLIST_ID || CONFIG.YOUTUBE_PLAYLIST_ID === ‘YOUR_PLAYLIST_ID_HERE’) {
clearVideoSkeletons();
return;
}
const url = new URL(‘https://www.googleapis.com/youtube/v3/playlistItems’);
url.searchParams.set(‘part’, ‘snippet,contentDetails’);
url.searchParams.set(‘playlistId’, CONFIG.YOUTUBE_PLAYLIST_ID);
url.searchParams.set(‘maxResults’, ‘50’);
url.searchParams.set(‘key’, CONFIG.GOOGLE_API_KEY);
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
videoGrid.innerHTML = CACHE.videos.map(v => buildVideoCardHTML(v)).join(’’);
}

function buildVideoCardHTML(item) {
const snippet   = item.snippet;
const videoId   = snippet.resourceId?.videoId || ‘’;
const title     = snippet.title;
const thumb     = snippet.thumbnails?.medium?.url || ‘’;
const published = timeAgo(snippet.publishedAt);
return `<div class="video-card" data-videoid="${videoId}" role="button" tabindex="0" aria-label="Play: ${title}"> <div class="video-thumb-16x9"> ${thumb ?`<img src="${thumb}" alt="${title}" loading="lazy" />`: '<div class="video-thumb-placeholder"></div>'} <div class="play-btn" aria-hidden="true"><div class="play-triangle"></div></div> <div class="yt-badge">YouTube</div> </div> <div class="video-info"> ${videoIcon()} <div class="video-text"> <div class="video-title">${title}</div> <div class="video-meta">${published}</div> </div> </div> </div>`;
}

function clearVideoSkeletons() {
videoGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;padding:40px 0;"> <div class="empty-icon">▷</div> <div class="empty-title">No Videos Yet</div> <div class="empty-msg">Add videos to your YouTube playlist and they'll appear here.</div> </div>`;
}

// ════════════════════════════════════════════════════════════
// LIGHTBOX
// ════════════════════════════════════════════════════════════
videoGrid.addEventListener(‘click’, e => {
const card = e.target.closest(’[data-videoid]’);
if (!card) return;
const videoId = card.dataset.videoid;
if (!videoId) return;
if (window.innerWidth < 680) {
window.open(`https://www.youtube.com/watch?v=${videoId}`, ‘_blank’, ‘noopener’);
return;
}
lightboxEmbed.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
lightbox.hidden = false;
document.body.style.overflow = ‘hidden’;
lightboxClose.focus();
});

videoGrid.addEventListener(‘keydown’, e => {
if (e.key === ‘Enter’ || e.key === ’ ‘) {
const card = e.target.closest(’[data-videoid]’);
if (card) card.click();
}
});

function closeLightbox() {
lightbox.hidden = true;
lightboxEmbed.innerHTML = ‘’;
document.body.style.overflow = ‘’;
}
lightboxClose.addEventListener(‘click’, closeLightbox);
lightboxBg.addEventListener(‘click’, closeLightbox);
document.addEventListener(‘keydown’, e => { if (e.key === ‘Escape’) closeLightbox(); });

// ════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════
function updateStats() {
const totalFiles = countAllFiles(CACHE.sections);
statResources.textContent  = totalFiles || ‘—’;
statCategories.textContent = CACHE.sections.filter(s => !s.restricted).length || ‘—’;
statVideos.textContent     = CACHE.videos.length || ‘—’;
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
console.warn(‘YouTube API error:’, msg);
clearVideoSkeletons();
}

// ════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════
function getMimeLabel(mime) {
const map = {
‘application/vnd.google-apps.document’:     ‘GOOGLE DOC’,
‘application/vnd.google-apps.spreadsheet’:  ‘GOOGLE SHEET’,
‘application/pdf’:                          ‘PDF’,
‘application/vnd.openxmlformats-officedocument.wordprocessingml.document’: ‘DOCX’,
‘application/vnd.openxmlformats-officedocument.spreadsheetml.sheet’:       ‘XLSX’,
};
return map[mime] || ‘FILE’;
}

function formatDate(iso) {
if (!iso) return ‘’;
const d   = new Date(iso);
const y   = d.getFullYear();
const m   = String(d.getMonth() + 1).padStart(2, ‘0’);
const day = String(d.getDate()).padStart(2, ‘0’);
return `${y}.${m}.${day}`;
}

function timeAgo(iso) {
if (!iso) return ‘’;
const diff = Date.now() - new Date(iso).getTime();
const days = Math.floor(diff / 86400000);
if (days === 0) return ‘Today’;
if (days === 1) return ‘Yesterday’;
if (days < 7)  return `${days} days ago`;
if (days < 14) return ‘1 week ago’;
if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
if (days < 60) return ‘1 month ago’;
return `${Math.floor(days / 30)} months ago`;
}

function cleanFileName(name) {
return name.replace(/^\d+[._-\s]+/, ‘’).replace(/.(docx?|xlsx?|pdf|gsheet|gdoc)$/i, ‘’).toUpperCase();
}

function cleanFolderName(name) {
return name.replace(/^\d+[._-\s]+/, ‘’);
}

// ════════════════════════════════════════════════════════════
// GO
// ════════════════════════════════════════════════════════════
init();