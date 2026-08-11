// ═══════════════════════════════════════════════════════════
// FORUM PLAYBOOK - app.js
// Phase 2: Recursive accordion, root-folder-driven taxonomy
// ═══════════════════════════════════════════════════════════

// ── Session cache (no localStorage) ────────────────────────
const CACHE = {
  sections: [],
  videos: [],
};

// ── State ───────────────────────────────────────────────────
let searchQuery = '';
let activeBucket = 'all';   // finder rail selection: 'all' or a section id
let viewMode = 'list';      // finder view: 'list' | 'cards' | 'icons'

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
// CORE RESOURCES - centered icon, Option B style
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
  const badge      = resource.badge || 'CORE RESOURCE';
  let icon         = '';
  let buttons      = '';
  let extraClass   = '';
  let btnsClass    = '';

  if (resource.type === 'links') {
    icon       = resource.icon === 'timer' ? coreIconTimer() : coreIconLinks();
    extraClass = ' core-card-links';
    btnsClass  = ' core-links-btns';
    buttons    = (resource.links || []).map((l, i) => {
      const style = i === 0 ? 'primary' : 'secondary';
      const cls   = style === 'primary' ? 'btn btn-primary sh warm' : 'btn sh warm';
      // Same-site links (the Forum Timer web app) stay in this tab.
      const external = /^https?:/i.test(l.url);
      return `<a href="${l.url}" class="${cls}"${external ? ' target="_blank" rel="noopener"' : ''}><span>${l.label}</span></a>`;
    }).join('');
  } else {
    const base     = `https://www.googleapis.com/drive/v3/files/${resource.fileId}/export?key=${CONFIG.GOOGLE_API_KEY}`;
    const driveUrl = `https://drive.google.com/open?id=${resource.fileId}`;
    icon = resource.type === 'doc' ? coreIconDoc() : coreIconSheet();
    if (resource.type === 'doc') {
      const docxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
      const pdfUrl  = `${base}&mimeType=application/pdf`;
      buttons += btnDownload('↓ DOCX', docxUrl, `${resource.title}.docx`, 'primary');
      buttons += btnDownload('↓ PDF',  pdfUrl,  `${resource.title}.pdf`,  'secondary');
      buttons += coreBtnGhost('↗ GDrive', driveUrl);
    } else if (resource.type === 'sheet') {
      const xlsxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
      const pdfUrl  = `${base}&mimeType=application/pdf`;
      buttons += btnDownload('↓ XLSX', xlsxUrl, `${resource.title}.xlsx`, 'primary');
      buttons += btnDownload('↓ PDF',  pdfUrl,  `${resource.title}.pdf`,  'secondary');
      buttons += coreBtnGhost('↗ GDrive', driveUrl);
    }
  }

  return `
    <div class="card core-card${extraClass}">
      <div class="corner-tl"></div>
      <div class="corner-br"></div>
      <div class="core-badge">${badge}</div>
      <div class="core-icon-wrap">${icon}</div>
      <div class="card-title">${resource.title.toUpperCase()}</div>
      <div class="card-meta">${resource.subtitle}</div>
      <div class="card-btns${btnsClass}">${buttons}</div>
    </div>
  `;
}

function coreBtnGhost(label, url) {
  return `<a href="${url}" class="btn btn-ghost sh cool" target="_blank" rel="noopener"><span>${label}</span></a>`;
}

// Large centered doc icon
function coreIconDoc() {
  return `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="2" width="32" height="42" stroke="#E8521A" stroke-width="1.5"/>
    <rect x="2" y="6" width="32" height="42" stroke="#C4B8A8" stroke-width="1" fill="#F8F4EE"/>
    <rect x="10" y="14" width="16" height="2" fill="#E8521A"/>
    <rect x="10" y="19" width="16" height="1.5" fill="#C4B8A8"/>
    <rect x="10" y="23" width="16" height="1.5" fill="#C4B8A8"/>
    <rect x="10" y="27" width="10" height="1.5" fill="#C4B8A8"/>
    <rect x="10" y="31" width="13" height="1.5" fill="#C4B8A8"/>
    <circle cx="38" cy="38" r="9" fill="#F0EBE0" stroke="#E8521A" stroke-width="1.2"/>
    <path d="M35 38l2.5 2.5L42 35" stroke="#E8521A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// Large centered globe + external-link icon (for 'links' type cards)
// Large centered timer dial (the Forum Timer web app card)
function coreIconTimer() {
  return `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="26" cy="27" r="19" stroke="#E8521A" stroke-width="1.5" fill="#F8F4EE"/>
    <path d="M26 27 L26 11 A16 16 0 1 1 12.14 35 Z" fill="#3A8A5A"/>
    <circle cx="26" cy="27" r="16" stroke="#0E0E0C" stroke-width="1" fill="none"/>
    <line x1="26" y1="27" x2="26" y2="11" stroke="#0E0E0C" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="26" y1="8"  x2="26" y2="5"  stroke="#C4B8A8" stroke-width="1.2"/>
    <line x1="45" y1="27" x2="48" y2="27" stroke="#C4B8A8" stroke-width="1.2"/>
    <line x1="26" y1="46" x2="26" y2="49" stroke="#C4B8A8" stroke-width="1.2"/>
    <line x1="7"  y1="27" x2="4"  y2="27" stroke="#C4B8A8" stroke-width="1.2"/>
    <rect x="22" y="1" width="8" height="3" rx="1.5" fill="#E8521A"/>
  </svg>`;
}

function coreIconLinks() {
  return `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="16" stroke="#E8521A" stroke-width="1.5" fill="#F8F4EE"/>
    <ellipse cx="22" cy="22" rx="16" ry="6" stroke="#C4B8A8" stroke-width="0.9"/>
    <ellipse cx="22" cy="22" rx="6" ry="16" stroke="#C4B8A8" stroke-width="0.9"/>
    <line x1="6"  y1="22" x2="38" y2="22" stroke="#E8521A" stroke-width="1"/>
    <line x1="22" y1="6"  x2="22" y2="38" stroke="#E8521A" stroke-width="1"/>
    <rect x="32" y="32" width="16" height="16" fill="#F0EBE0" stroke="#E8521A" stroke-width="1.2"/>
    <path d="M37 43l6-6" stroke="#E8521A" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M39 37h4v4" stroke="#E8521A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// Large centered sheet icon
function coreIconSheet() {
  return `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="32" height="42" stroke="#C4B8A8" stroke-width="1" fill="#F8F4EE"/>
    <rect x="6" y="2" width="40" height="44" stroke="#3A8A8A" stroke-width="1.5" fill="#fff"/>
    <line x1="6" y1="12" x2="46" y2="12" stroke="#3A8A8A" stroke-width="1.2"/>
    <line x1="6" y1="22" x2="46" y2="22" stroke="#C4B8A8" stroke-width="0.8"/>
    <line x1="6" y1="32" x2="46" y2="32" stroke="#C4B8A8" stroke-width="0.8"/>
    <line x1="6" y1="42" x2="46" y2="42" stroke="#C4B8A8" stroke-width="0.8"/>
    <line x1="20" y1="2" x2="20" y2="46" stroke="#C4B8A8" stroke-width="0.8"/>
    <line x1="34" y1="2" x2="34" y2="46" stroke="#C4B8A8" stroke-width="0.8"/>
    <rect x="6" y="2" width="14" height="10" fill="#3A8A8A" fill-opacity="0.2"/>
    <rect x="20" y="2" width="14" height="10" fill="#3A8A8A" fill-opacity="0.1"/>
    <rect x="34" y="2" width="12" height="10" fill="#3A8A8A" fill-opacity="0.1"/>
  </svg>`;
}


// ════════════════════════════════════════════════════════════
// FOLDER ICONS - open / closed states
// ════════════════════════════════════════════════════════════
function folderClosed() {
  return `<svg class="folder-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4.5h4.5l1.5 2H15v7.5H1V4.5z" stroke="#D4A832" stroke-width="0.9" fill="#D4A832" fill-opacity="0.15"/>
    <path d="M1 4.5h4.5l1.5 2" stroke="#D4A832" stroke-width="0.9" stroke-linejoin="round"/>
  </svg>`;
}

function folderOpen() {
  return `<svg class="folder-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 4.5h4.5l1.5 2H15v7.5H1V4.5z" stroke="#D4A832" stroke-width="0.9" fill="#D4A832" fill-opacity="0.28"/>
    <path d="M1 4.5h4.5l1.5 2" stroke="#D4A832" stroke-width="0.9" stroke-linejoin="round"/>
    <line x1="1" y1="6.5" x2="15" y2="6.5" stroke="#D4A832" stroke-width="0.75"/>
    <path d="M3.5 9.5h9" stroke="#D4A832" stroke-width="0.6" stroke-linecap="round"/>
    <path d="M3.5 11.5h6" stroke="#D4A832" stroke-width="0.6" stroke-linecap="round"/>
  </svg>`;
}

function folderIconPair() {
  return `
    <span class="fi-closed" style="display:inline;line-height:0;">${folderClosed()}</span>
    <span class="fi-open"   style="display:none; line-height:0;">${folderOpen()}</span>
  `;
}

// Video camera icon
function videoIcon() {
  return `<svg class="video-type-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
    <rect x="1" y="3" width="10" height="10" stroke="#E8521A" stroke-width="0.9"/>
    <path d="M11 6l4-2v8l-4-2V6z" stroke="#E8521A" stroke-width="0.9" fill="#E8521A" fill-opacity="0.15"/>
  </svg>`;
}


// ════════════════════════════════════════════════════════════
// DRIVE - fetch and recurse
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

async function buildFolderNode(folderId, folderName) {
  const restricted = isRestricted(folderName);
  if (restricted) return { id: folderId, name: folderName, files: [], subfolders: [], restricted: true };
  const contents   = await fetchFolderContents(folderId);
  const files      = contents.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
  const rawFolders = contents.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
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
    const topFolders   = rootContents.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    const rootFiles    = rootContents.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
    const sections     = await Promise.all(topFolders.map(f => buildFolderNode(f.id, f.name)));
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
// V2 SPLIT FINDER (locked by Colton 2026-08-10): bucket rail + rows with
// click-to-preview. Function keeps its old name; search and stats callers
// are unchanged. The old accordion builders below are retired but left in
// place until the next cleanup pass.
function renderAccordion() {
  if (!CACHE.sections.length) return;
  renderRail();
  const searching     = !!searchQuery;
  const activeSection = CACHE.sections.find(s => s.id === activeBucket);
  let html = '';
  if (!searching && activeSection && activeSection.restricted) {
    html = `<div class="fx-restricted">${restrictedBodyHTML()}</div>`;
    resourceCount.textContent = 'Access restricted';
  } else {
    const rows = [];
    CACHE.sections.forEach(section => {
      if (section.restricted) return;
      if (!searching && activeBucket !== 'all' && section.id !== activeBucket) return;
      collectFinderRows(section, rows, cleanFolderName(section.name));
    });
    const build = viewMode === 'cards' ? buildDocCardHTML
                : viewMode === 'icons' ? buildDocTileHTML
                : buildDocRowHTML;
    const inner = rows.map(r => build(r.file)).join('');
    html = inner
      ? `<div class="fx-list view-${viewMode}">${inner}</div>`
      : `<div class="empty-state"><div class="empty-icon">◈</div><div class="empty-title">No resources found</div><div class="empty-msg">Try a different search term.</div></div>`;
    resourceCount.textContent = `${rows.length} resource${rows.length !== 1 ? 's' : ''}`;
  }
  accordionWrap.innerHTML = html;
  renderViewSwitch();
  wireFinderRows();
}

// LIST / CARDS / ICONS, the file-picker switch (Colton 2026-08-10).
function renderViewSwitch() {
  const host = document.getElementById('fx-viewswitch');
  if (!host) return;
  const opts = [
    ['list',  'List',  '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.2"/></svg>'],
    ['cards', 'Cards', '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="4.5" stroke="currentColor" stroke-width="1.1"/><rect x="1.5" y="9" width="13" height="4.5" stroke="currentColor" stroke-width="1.1"/></svg>'],
    ['icons', 'Icons', '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" stroke="currentColor" stroke-width="1.1"/><rect x="9" y="1.5" width="5.5" height="5.5" stroke="currentColor" stroke-width="1.1"/><rect x="1.5" y="9" width="5.5" height="5.5" stroke="currentColor" stroke-width="1.1"/><rect x="9" y="9" width="5.5" height="5.5" stroke="currentColor" stroke-width="1.1"/></svg>']
  ];
  host.innerHTML = opts.map(([id, label, ic]) =>
    `<button class="fx-view${viewMode === id ? ' on' : ''}" data-view="${id}" title="${label} view" aria-pressed="${viewMode === id}">${ic}<span>${label}</span></button>`
  ).join('');
  host.querySelectorAll('[data-view]').forEach(b => {
    b.addEventListener('click', () => { viewMode = b.dataset.view; renderAccordion(); });
  });
}

function collectFinderRows(node, out, crumb) {
  node.files.forEach(f => {
    if (searchQuery &&
        !cleanFileName(f.name).toLowerCase().includes(searchQuery) &&
        !crumb.toLowerCase().includes(searchQuery)) return;
    out.push({ file: f, crumb });
  });
  node.subfolders.forEach(sf =>
    collectFinderRows(sf, out, crumb + ' · ' + cleanFolderName(sf.name)));
}

function countFinderFiles(section) {
  const cnt = n => n.files.length + n.subfolders.reduce((a, sf) => a + cnt(sf), 0);
  if (section) return section.restricted ? 0 : cnt(section);
  return CACHE.sections.filter(s => !s.restricted).reduce((a, s) => a + cnt(s), 0);
}

function renderRail() {
  const rail = document.getElementById('fx-rail');
  if (!rail) return;
  const item = (id, iconHtml, label, count, on, extra) =>
    `<button class="fx-rail-item${on ? ' on' : ''}${extra || ''}" data-bucket="${id}">
       <span class="fx-rail-ic">${iconHtml}</span>
       <span class="fx-rail-label">${label}</span>
       <span class="fx-rail-count">${count}</span>
     </button>`;
  let html = item('all', railIconAll(), 'Everything', countFinderFiles(null), activeBucket === 'all' && !searchQuery);
  CACHE.sections.forEach(s => {
    html += item(s.id, s.restricted ? railIconLock() : folderClosed(), cleanFolderName(s.name),
      s.restricted ? '' : countFinderFiles(s), activeBucket === s.id && !searchQuery);
  });
  html += `<div class="fx-rail-split"></div>
    <a class="fx-rail-item" href="#videos"><span class="fx-rail-ic">${videoIcon()}</span><span class="fx-rail-label">How-To Videos</span><span class="fx-rail-count"></span></a>
    <a class="fx-rail-item" href="#podcasts"><span class="fx-rail-ic">${railIconMic()}</span><span class="fx-rail-label">Podcasts</span><span class="fx-rail-count"></span></a>`;
  rail.innerHTML = html;
  rail.querySelectorAll('[data-bucket]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeBucket = btn.dataset.bucket;
      if (searchQuery) { searchQuery = ''; searchInput.value = ''; }
      renderAccordion();
    });
  });
}

function wireFinderRows() {
  accordionWrap.querySelectorAll('[data-download-url]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      downloadFile(btn.dataset.downloadUrl, btn.dataset.filename);
    });
  });
  accordionWrap.querySelectorAll('.fx-row-main').forEach(main => {
    main.addEventListener('click', e => {
      if (e.target.closest('a') || e.target.closest('[data-download-url]')) return;
      const row = main.parentElement;
      const was = row.classList.contains('open');
      accordionWrap.querySelectorAll('.fx-row.open').forEach(r => r.classList.remove('open'));
      if (!was) { row.classList.add('open'); loadRowThumb(row); }
    });
  });
  accordionWrap.querySelectorAll('[data-peek]').forEach(el => {
    el.addEventListener('mouseenter', () => showPeek(el));
    el.addEventListener('mouseleave', hidePeek);
    el.addEventListener('focus', () => showPeek(el));
    el.addEventListener('blur', hidePeek);
  });
  accordionWrap.querySelectorAll('.fx-tile').forEach(t => {
    t.addEventListener('click', () => openSheet(t.dataset.fid));
  });
}

// ── Hover peek: the document itself, floating next to the icon ──
let peekTimer = null;
function peekEl() {
  let p = document.getElementById('fxPeek');
  if (!p) {
    p = document.createElement('div');
    p.id = 'fxPeek';
    p.className = 'fx-peek';
    p.innerHTML = '<div class="fx-peek-shot"></div><div class="fx-peek-name"></div>';
    document.body.appendChild(p);
  }
  return p;
}
function showPeek(el) {
  clearTimeout(peekTimer);
  peekTimer = setTimeout(() => {
    const p = peekEl();
    const shot = p.querySelector('.fx-peek-shot');
    const src = el.dataset.peek;
    if (shot.dataset.src !== src) {
      shot.dataset.src = src;
      shot.innerHTML = '<span class="fx-peek-load">Loading preview</span>';
      const img = new Image();
      img.onload = () => { if (shot.dataset.src === src) { shot.innerHTML = ''; shot.appendChild(img); } };
      img.onerror = () => { if (shot.dataset.src === src) shot.innerHTML = '<span class="fx-peek-load">No preview available</span>'; };
      img.alt = 'Document preview';
      img.src = src;
    }
    p.querySelector('.fx-peek-name').textContent = el.dataset.peekname || '';
    const r = el.getBoundingClientRect();
    const w = 300, h = 380;
    let left = r.right + 14;
    if (left + w > window.innerWidth - 12) left = Math.max(12, r.left - w - 14);
    let top = Math.min(Math.max(12, r.top + r.height / 2 - h / 2), window.innerHeight - h - 12);
    p.style.left = left + 'px';
    p.style.top = top + 'px';
    p.classList.add('on');
  }, 110);
}
function hidePeek() {
  clearTimeout(peekTimer);
  const p = document.getElementById('fxPeek');
  if (p) p.classList.remove('on');
}

// ── Icons view: click a tile, get the full preview sheet ──
function findFileById(id) {
  let hit = null;
  const walk = n => {
    n.files.forEach(f => { if (f.id === id) hit = f; });
    n.subfolders.forEach(walk);
  };
  CACHE.sections.forEach(s => { if (!s.restricted) walk(s); });
  return hit;
}
function openSheet(id) {
  const file = findFileById(id);
  if (!file) return;
  hidePeek();
  const title = cleanFileName(file.name);
  let sheet = document.getElementById('fxSheet');
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'fxSheet';
    sheet.className = 'fx-sheet';
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('.fx-sheet-close')) closeSheet(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
  }
  sheet.innerHTML = `
    <div class="fx-sheet-panel" role="dialog" aria-label="${title}">
      <button class="fx-sheet-close" aria-label="Close preview">✕</button>
      <div class="fx-prev">
        <div>
          <div class="fx-thumb" data-thumb="${thumbSrc(file, 640)}"></div>
          <div class="fx-thumb-cap">Preview: the document you are about to get</div>
        </div>
        <div class="fx-prev-right">
          <div class="fx-prev-title">${title}</div>
          <div class="fx-prev-desc">${getMimeLabel(file.mimeType)}. Look it over, then take it in the format you want.</div>
          <div class="fx-btns-big">${buildDocButtonsHTML(file)}</div>
        </div>
      </div>
    </div>`;
  sheet.querySelectorAll('[data-download-url]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      downloadFile(btn.dataset.downloadUrl, btn.dataset.filename);
    });
  });
  loadRowThumb(sheet);
  sheet.classList.add('on');
}
function closeSheet() {
  const sheet = document.getElementById('fxSheet');
  if (sheet) sheet.classList.remove('on');
}

function loadRowThumb(row) {
  const t = row.querySelector('.fx-thumb');
  if (!t || t.dataset.done) return;
  t.dataset.done = '1';
  const img = new Image();
  img.onload  = () => { t.innerHTML = ''; t.appendChild(img); };
  img.onerror = () => { t.classList.add('noimg'); t.textContent = 'Preview unavailable'; };
  img.alt = 'Document preview';
  img.src = t.dataset.thumb;
}

function railIconAll() {
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" stroke="#E8521A" stroke-width="0.9"/><rect x="9" y="1.5" width="5.5" height="5.5" stroke="#C4B8A8" stroke-width="0.9"/><rect x="1.5" y="9" width="5.5" height="5.5" stroke="#C4B8A8" stroke-width="0.9"/><rect x="9" y="9" width="5.5" height="5.5" stroke="#C4B8A8" stroke-width="0.9"/></svg>`;
}
function railIconLock() {
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" stroke="#C4B8A8" stroke-width="0.9"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#C4B8A8" stroke-width="0.9"/></svg>`;
}
function railIconMic() {
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="6" y="1.5" width="4" height="8" rx="2" stroke="#E8521A" stroke-width="0.9"/><path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5v2" stroke="#C4B8A8" stroke-width="0.9"/></svg>`;
}
function restrictedBodyHTML() {
  return `<div class="restricted-body">
    <p class="restricted-copy">EO Legal now prohibits redistribution or external hosting of official EO materials. The full library is still available to members, you just have to access it directly from the EO member portal (login required).</p>
    <p class="restricted-copy">For the official, up-to-date documents, head to:</p>
    <ul class="restricted-links">
      <li><a href="https://member.eonetwork.org/member/forum/for-forum-moderators" target="_blank" rel="noopener">↗ Forum &amp; Moderator Docs</a> <span class="restricted-note">(login required)</span></li>
      <li><a href="https://member.eonetwork.org/member/forum/for-forum-chairs" target="_blank" rel="noopener">↗ Forum Chair Docs</a> <span class="restricted-note">(login required)</span></li>
    </ul>
    <p class="restricted-copy restricted-fineprint">If you can't get in, ping a trainer or chapter staff member.</p>
  </div>`;
}

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
    if (!searchQuery || subCount > 0) html += buildSubfolderHTML(sf.name, subCount, subHtml, depth);
  });
  return { html, count };
}

function buildAccordionSectionHTML(name, count, bodyHtml) {
  const label = cleanFolderName(name);
  return `
    <div class="acc-category">
      <div class="acc-header">
        <div class="acc-header-left">
          ${folderIconPair()}
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
        ${folderIconPair()}
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

function thumbSrc(file, w) { return `https://drive.google.com/thumbnail?id=${file.id}&sz=w${w || 640}`; }

// LIST: one line per document. Meta is the file type only (Colton cut the
// date and the folder path as noise). Hovering the icon peeks the document.
function buildDocRowHTML(file) {
  const title   = cleanFileName(file.name);
  const type    = getMimeLabel(file.mimeType);
  const buttons = buildDocButtonsHTML(file);
  const icon    = getDocIcon(file.mimeType);
  return `
    <div class="fx-row wv" data-fid="${file.id}">
      <div class="fx-tick-tl"></div>
      <div class="fx-row-main">
        <div class="fx-ic" data-peek="${thumbSrc(file, 400)}" data-peekname="${title}">${icon}<span class="fx-ic-hint">peek</span></div>
        <div class="fx-grow">
          <div class="fx-name">${title}</div>
          <div class="fx-meta">${type}</div>
        </div>
        <div class="fx-btns">${buttons}</div>
        <span class="fx-caret">▾</span>
      </div>
      <div class="fx-expand">
        <div class="fx-prev">
          <div>
            <div class="fx-thumb" data-thumb="${thumbSrc(file, 640)}"></div>
            <div class="fx-thumb-cap">Preview: the document you are about to get</div>
          </div>
          <div class="fx-prev-right">
            <div class="fx-prev-title">${title}</div>
            <div class="fx-prev-desc">${type}. Look it over, then take it in the format you want.</div>
            <div class="fx-btns-big">${buttons}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// CARDS: the preview IS the card. No click required to see the document.
function buildDocCardHTML(file) {
  const title = cleanFileName(file.name);
  return `
    <div class="fx-card wv" data-fid="${file.id}">
      <div class="fx-tick-tl"></div>
      <div class="fx-card-shot"><img loading="lazy" alt="First page of ${title}" src="${thumbSrc(file, 400)}"
        onerror="this.parentElement.classList.add('noimg');this.remove()"></div>
      <div class="fx-card-body">
        <div class="fx-name">${title}</div>
        <div class="fx-meta">${getMimeLabel(file.mimeType)}</div>
        <div class="fx-btns-big">${buildDocButtonsHTML(file)}</div>
      </div>
    </div>
  `;
}

// ICONS: dense wall of first pages. Hover peeks big, click opens the sheet.
function buildDocTileHTML(file) {
  const title = cleanFileName(file.name);
  return `
    <button class="fx-tile" data-fid="${file.id}" data-peek="${thumbSrc(file, 640)}" data-peekname="${title}">
      <span class="fx-tile-shot"><img loading="lazy" alt="First page of ${title}" src="${thumbSrc(file, 260)}"
        onerror="this.parentElement.classList.add('noimg');this.remove()"></span>
      <span class="fx-tile-name">${title}</span>
    </button>
  `;
}

function buildRestrictedAccordionHTML(name) {
  const label = cleanFolderName(name);
  return `
    <div class="acc-category acc-restricted">
      <div class="acc-header">
        <div class="acc-header-left">
          ${folderIconPair()}
          <div class="acc-cat-name" style="color:#C4B8A8;">${label}</div>
          <div class="acc-count">Access restricted</div>
        </div>
        <span class="acc-caret">▼</span>
      </div>
      <div class="acc-body">
        <div class="restricted-body">
          <p class="restricted-copy">EO Legal now prohibits redistribution or external hosting of official EO materials. The full library is still available to members, you just have to access it directly from the EO member portal (login required).</p>
          <p class="restricted-copy">For the official, up-to-date documents, head to:</p>
          <ul class="restricted-links">
            <li><a href="https://member.eonetwork.org/member/forum/for-forum-moderators" target="_blank" rel="noopener">↗ Forum &amp; Moderator Docs</a> <span class="restricted-note">(login required)</span></li>
            <li><a href="https://member.eonetwork.org/member/forum/for-forum-chairs" target="_blank" rel="noopener">↗ Forum Chair Docs</a> <span class="restricted-note">(login required)</span></li>
          </ul>
          <p class="restricted-copy restricted-fineprint">If you can't get in, ping a trainer or chapter staff member.</p>
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
    html += btnGhost('↗ GDrive', driveUrl);
  } else if (mime === 'application/vnd.google-apps.spreadsheet') {
    const xlsxUrl = `${base}&mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
    const pdfUrl  = `${base}&mimeType=application/pdf`;
    html += btnDownload('↓ XLSX', xlsxUrl, `${baseName}.xlsx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl,  `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ GDrive', driveUrl);
  } else if (mime === 'application/pdf') {
    const pdfUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
    html += btnDownload('↓ PDF', pdfUrl, `${baseName}.pdf`, 'secondary');
    html += btnGhost('↗ GDrive', driveUrl);
  } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const dlUrl  = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
    const pdfUrl = `${base}&mimeType=application/pdf`;
    html += btnDownload('↓ DOCX', dlUrl,  `${baseName}.docx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl, `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ GDrive', driveUrl);
  } else if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const dlUrl  = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${CONFIG.GOOGLE_API_KEY}`;
    const pdfUrl = `${base}&mimeType=application/pdf`;
    html += btnDownload('↓ XLSX', dlUrl,  `${baseName}.xlsx`, 'primary');
    html += btnDownload('↓ PDF',  pdfUrl, `${baseName}.pdf`,  'secondary');
    html += btnGhost('↗ GDrive', driveUrl);
  } else {
    html += btnGhost('↗ GDrive', driveUrl);
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
// SKELETON
// ════════════════════════════════════════════════════════════
function buildSkeletonAccordion() {
  return [1,2,3,4].map(() => `
    <div class="acc-category skeleton">
      <div class="acc-header" style="pointer-events:none;">
        <div class="acc-header-left" style="gap:10px;">
          <div style="width:16px;height:16px;background:#E8E2D6;flex-shrink:0;"></div>
          <div class="skel-line" style="width:180px;height:14px;margin:0;border-radius:2px;"></div>
          <div class="skel-line" style="width:70px;height:10px;margin:0;border-radius:2px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}


// ════════════════════════════════════════════════════════════
// YOUTUBE - manual playlist order
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
      <div class="video-thumb-16x9">
        ${thumb ? `<img src="${thumb}" alt="${title}" loading="lazy" />` : '<div class="video-thumb-placeholder"></div>'}
        <div class="play-btn" aria-hidden="true"><div class="play-triangle"></div></div>
        <div class="yt-badge">YouTube</div>
      </div>
      <div class="video-info">
        ${videoIcon()}
        <div class="video-text">
          <div class="video-title">${title}</div>
          <div class="video-meta">${published}</div>
        </div>
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
  statResources.textContent  = totalFiles || '-';
  statCategories.textContent = CACHE.sections.filter(s => !s.restricted).length || '-';
  statVideos.textContent     = (CACHE.videos.length + ((window.CONFIG && CONFIG.PODCASTS && CONFIG.PODCASTS.length) || 0)) || '-';
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
