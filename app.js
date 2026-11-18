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
// finder view: 'list' | 'cards' | 'icons'. Honors ?view= in the URL so a
// view is shareable, then remembers the last choice on this device.
let viewMode = (function () {
  const valid = ['list', 'cards', 'icons'];
  const q = new URLSearchParams(location.search).get('view');
  if (valid.includes(q)) return q;
  try {
    const saved = localStorage.getItem('fp-view');
    if (valid.includes(saved)) return saved;
  } catch (e) { /* private mode, fall through */ }
  return 'list';
})();

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
// CORE RESOURCES: three groups from CONFIG.CORE_GROUPS (Colton, 2026-11-16).
// Forum Tools and Retreat Exercises are cards that show the thing itself (page one of the
// document, or a picture) with its own Phosphor icon; Process Breakdowns are rows, one process
// per row, with its formats (web page, PDF, video) lined up in the same three columns.
// Icons come from core-icons.js (tools/build-core-icons.py holds the one list).
// ════════════════════════════════════════════════════════════
const CORE_EXPORT_MIME = {
  pdf:  'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function renderCoreResources() {
  const wrap = document.getElementById('core-groups');
  const groups = CONFIG.CORE_GROUPS || [];
  if (!wrap || !groups.length) return;
  wrap.innerHTML = groups.map((g, gi) => {
    const build = g.layout === 'rows' ? coreRowHTML : coreCardHTML;
    return `
    <div class="cg cg-${g.tint || 'burn'}" id="cg-${g.id}">
      <div class="section-header core-section-header cg-head">
        ${coreIcon(g.icon, 'ci-head')}
        <h2 class="section-title">${g.title.toUpperCase()}</h2>
        ${g.tag ? `<div class="section-tag">${g.tag}</div>` : ''}
        <div class="section-rule"></div>
      </div>
      ${g.note ? `<p class="cg-note">${g.note}</p>` : ''}
      <div class="cg-grid cg-${g.layout || 'cards'}">${g.items.map((r, i) => build(r, gi + ':' + i)).join('')}</div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('[data-download-url]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      downloadFile(btn.dataset.downloadUrl, btn.dataset.filename);
    });
  });
  wrap.querySelectorAll('[data-core-preview]').forEach(btn => {
    btn.addEventListener('click', () => openCorePreview(btn.dataset.corePreview, btn));
  });
  coreDrawIn(wrap);
}

function coreIcon(name, cls) {
  const svg = (typeof CORE_ICONS !== 'undefined' && CORE_ICONS[name]) || '';
  return svg ? `<span class="ci ${cls || ''}" aria-hidden="true">${svg}</span>` : '';
}

function coreItemByKey(key) {
  const [g, i] = key.split(':');
  const group = (CONFIG.CORE_GROUPS || [])[Number(g)];
  return group ? group.items[Number(i)] : null;
}

function coreDriveThumb(r, width) {
  return r.fileId ? `https://drive.google.com/thumbnail?id=${r.fileId}&sz=w${width}` : '';
}
// The picture on the card, and the large page-one picture the Preview opens.
function coreShotSrc(r)    { return r.shot || r.preview || coreDriveThumb(r, 800); }
function corePreviewSrc(r) { return r.preview || coreDriveThumb(r, 1400); }

// One button. `soon` is a format that is not made yet: shown, not clickable.
function coreActionHTML(r, a) {
  const label = `<span>${a.icon ? coreIcon(a.icon, 'ci-btn') : ''}${a.label}</span>`;
  if (a.soon) return `<span class="btn cg-soon">${label}</span>`;
  const cls = a.style === 'primary' ? 'btn btn-primary sh warm' : a.style === 'ghost' ? 'btn btn-ghost sh cool' : 'btn sh warm';
  if (a.export && r.fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${r.fileId}/export?key=${CONFIG.GOOGLE_API_KEY}&mimeType=${CORE_EXPORT_MIME[a.export]}`;
    return `<button type="button" class="${cls}" data-download-url="${url}" data-filename="${r.title}.${a.export}">${label}</button>`;
  }
  const url = a.drive && r.fileId ? `https://drive.google.com/open?id=${r.fileId}` : a.url;
  // Same-site links (the Forum Timer web app, the web pages) stay in this tab; a file opens in a new one.
  const newTab = /^https?:/i.test(url) || (/\.(pdf|html)$/i.test(url) && !a.download);
  return `<a href="${url}" class="${cls}"${a.download ? ' download' : ''}${newTab ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
}
function coreActionsHTML(r, withSoon) {
  return (r.actions || []).filter(a => withSoon || !a.soon).map(a => coreActionHTML(r, a)).join('');
}

// A card: the thing itself on top (a click opens the large preview), then its icon, title,
// bullets and buttons.
function coreCardHTML(r, key) {
  const src = coreShotSrc(r);
  const img = src ? `<img src="${src}" alt="${r.shotAlt || ''}" loading="lazy" decoding="async">` : '';
  const fit = r.shotFit === 'photo' ? ' cg-shot-photo' : r.shotFit === 'phone' ? ' cg-shot-phone' : r.landscape ? ' cg-shot-land' : '';
  const shot = corePreviewSrc(r)
    ? `<button type="button" class="cg-shot${fit}" data-core-preview="${key}" aria-haspopup="dialog" aria-label="Preview: ${r.title}">${img}<span class="cg-shot-cap">${coreIcon('eye', 'ci-btn')}Preview</span></button>`
    : `<div class="cg-shot cg-shot-still${fit}">${img}</div>`;
  return `
    <article class="card cg-card cg-reveal">
      <div class="corner-tl"></div>
      <div class="corner-br"></div>
      ${shot}
      <div class="cg-body">
        <div class="cg-headline">
          ${coreIcon(r.icon, 'ci-lg')}
          <div>
            ${r.badge ? `<div class="core-badge">${r.badge}</div>` : ''}
            <h3 class="card-title">${r.title.toUpperCase()}</h3>
          </div>
        </div>
        ${r.bullets && r.bullets.length ? `<ul class="core-bullets">${r.bullets.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
        <div class="cg-actions">${coreActionsHTML(r, true)}</div>
      </div>
    </article>`;
}

// A row: one process, its one line, and its formats in the same three columns on every row.
function coreRowHTML(r, key) {
  const src = coreShotSrc(r);
  const thumb = src
    ? `<button type="button" class="cg-thumb" data-core-preview="${key}" aria-haspopup="dialog" aria-label="Preview: ${r.title}"><img src="${src}" alt="" loading="lazy" decoding="async"></button>`
    : `<div class="cg-thumb"></div>`;
  return `
    <article class="card cg-row cg-reveal">
      <div class="corner-tl"></div>
      <div class="corner-br"></div>
      ${thumb}
      <div class="cg-row-main">
        ${coreIcon(r.icon, 'ci-lg')}
        <div>
          <h3 class="card-title">${r.title.toUpperCase()}</h3>
          <p class="cg-line">${r.line || ''}</p>
        </div>
      </div>
      <div class="cg-formats">${coreActionsHTML(r, true)}</div>
    </article>`;
}

// Large preview of a document, in the library's preview sheet.
function openCorePreview(key, opener) {
  const r = coreItemByKey(key);
  if (!r) return;
  openPreviewSheet({
    title: r.title,
    badge: r.badge || '',
    bullets: r.bullets || [],
    thumb: corePreviewSrc(r),
    cap: `Preview: ${r.type === 'sheet' ? 'the first tab' : 'page one'}`,
    buttons: coreActionsHTML(r, false),
    large: true,
    landscape: !!r.landscape,
    opener,
  });
}

// The icons draw in, left to right, when their card or row scrolls into view.
// With reduced motion on they arrive drawn (the CSS also stops the transition).
function coreDrawIn(wrap) {
  let reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* old browser */ }
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('cg-wait'); io.unobserve(e.target); } });
  }, { threshold: 0.25 });
  wrap.querySelectorAll('.cg-reveal').forEach(el => { el.classList.add('cg-wait'); io.observe(el); });
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
    b.addEventListener('click', () => {
      viewMode = b.dataset.view;
      try { localStorage.setItem('fp-view', viewMode); } catch (e) { /* private mode */ }
      renderAccordion();
    });
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
      keepFinderInView();
    });
  });
}

// The rail is sticky, so a bucket can be clicked from deep inside a long list. When the new
// bucket is short (the official EO one is a single notice), the page shrinks by thousands of
// pixels and the browser clamps the scroll into How-To Videos (Colton, 2026-10-27: "it jumped
// to the videos page"). Bring the top of the finder back under the nav instead.
function keepFinderInView() {
  const finder = document.getElementById('finder');
  if (!finder) return;
  const nav = document.querySelector('.nav');
  const offset = (nav ? nav.offsetHeight : 0) + 16;
  const top = finder.getBoundingClientRect().top;
  if (top >= offset) return;
  let smooth = true;
  try { smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* old browser */ }
  window.scrollTo({ top: top + window.scrollY - offset, behavior: smooth ? 'smooth' : 'auto' });
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
  openPreviewSheet({
    title: cleanFileName(file.name),
    desc: `${getMimeLabel(file.mimeType)}. Look it over, then take it in the format you want.`,
    thumb: thumbSrc(file, 640),
    cap: 'Preview: the document you are about to get',
    buttons: buildDocButtonsHTML(file),
  });
}

// One preview sheet for the library tiles and the featured cards: Close button, Esc,
// a click on the backdrop, focus moved in, held inside with Tab, and returned on close.
let sheetOpener = null;
function openPreviewSheet(o) {
  hidePeek();
  let sheet = document.getElementById('fxSheet');
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'fxSheet';
    sheet.className = 'fx-sheet';
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('.fx-sheet-close')) closeSheet(); });
    document.addEventListener('keydown', e => {
      if (!sheet.classList.contains('on')) return;
      if (e.key === 'Escape') { closeSheet(); return; }
      if (e.key === 'Tab') {
        const f = [...sheet.querySelectorAll('a[href], button:not([disabled])')].filter(el => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || !sheet.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !sheet.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
      }
    });
  }
  sheetOpener = o.opener || document.activeElement;
  const cls = 'fx-sheet-panel' + (o.large ? ' fx-sheet-large' : '') + (o.landscape ? ' fx-sheet-landscape' : '');
  const desc = o.bullets && o.bullets.length
    ? `<ul class="core-bullets fx-prev-bullets">${o.bullets.map(t => `<li>${t}</li>`).join('')}</ul>`
    : `<div class="fx-prev-desc">${o.desc || ''}</div>`;
  sheet.innerHTML = `
    <div class="${cls}" role="dialog" aria-modal="true" aria-labelledby="fxSheetTitle">
      <button type="button" class="fx-sheet-close" aria-label="Close preview"><span class="fx-sheet-close-word">Close</span> ✕</button>
      <div class="fx-prev">
        <div class="fx-prev-left">
          <div class="fx-thumb" data-thumb="${o.thumb}"><span class="fx-peek-load">Loading preview</span></div>
          <div class="fx-thumb-cap">${o.cap || ''}</div>
        </div>
        <div class="fx-prev-right">
          ${o.badge ? `<div class="core-badge fx-prev-badge">${o.badge}</div>` : ''}
          <div class="fx-prev-title" id="fxSheetTitle">${o.title}</div>
          ${desc}
          <div class="fx-btns-big">${o.buttons}</div>
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
  const close = sheet.querySelector('.fx-sheet-close');
  requestAnimationFrame(() => { if (close) close.focus(); });
}
function closeSheet() {
  const sheet = document.getElementById('fxSheet');
  if (!sheet || !sheet.classList.contains('on')) return;
  sheet.classList.remove('on');
  if (sheetOpener && document.contains(sheetOpener)) sheetOpener.focus();
  sheetOpener = null;
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
  let out = name
    // a leading sort prefix ("01. ", "3_"), but only when a letter follows,
    // so titles that genuinely start with a number ("5 - 5 Factors") survive
    .replace(/^\d{1,2}[.)_\-\s]+(?=[A-Za-z])/, '')
    .replace(/\.(docx?|xlsx?|pptx?|pdf|png|jpe?g|gif|gsheet|gdoc)$/i, '')
    .replace(/_/g, ' ');
  // a slug with no spaces at all gets its hyphens opened up; prose keeps them
  if (!/\s/.test(out)) out = out.replace(/-/g, ' ');
  return out.replace(/\s{2,}/g, ' ').trim().toUpperCase();
}

function cleanFolderName(name) {
  return name.replace(/^\d+[\._\-\s]+/, '');
}


// ════════════════════════════════════════════════════════════
// GO
// ════════════════════════════════════════════════════════════
init();
