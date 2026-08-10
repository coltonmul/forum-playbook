// FORUM PLAYBOOK homepage mockups - shared behavior v0.1 (2026-08-10)
// Vanilla JS per brand rule 05. Real Drive links; thumbnails from Drive's
// public thumbnail endpoint with an icon fallback when one is not served.
(function () {
  'use strict';
  var S = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  var E = '</svg>';
  var ICONS = {
    doc: S + '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>' + E,
    sheet: S + '<rect x="4" y="4" width="16" height="16"/><path d="M4 10h16M10 4v16"/>' + E,
    pdf: S + '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M8.5 15.5c2-1 5.5-6 3-6.5s.5 8 2.5 6.5 2-3.5-2-2.5"/>' + E,
    img: S + '<rect x="4" y="5" width="16" height="14"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 17.5 10 12l4 4 2.5-2.5 3 3"/>' + E,
    folder: S + '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>' + E,
    video: S + '<rect x="3" y="6" width="13" height="12" rx="1"/><path d="m16 10 5-3v10l-5-3"/>' + E,
    mic: S + '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>' + E,
    timer: S + '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>' + E,
    clock: S + '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>' + E,
    percent: S + '<path d="m19 5-14 14"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>' + E,
    mountain: S + '<path d="m3 19 6-10 4 6 3-4 5 8z"/><path d="M2 19h20"/>' + E,
    compass: S + '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>' + E,
    users: S + '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5a3.5 3.5 0 0 1 0 7M17.5 14a6.5 6.5 0 0 1 4 6"/>' + E,
    pulse: S + '<path d="M3 12h4l2.5-6 4 12L16 12h5"/>' + E,
    lock: S + '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>' + E,
    flag: S + '<path d="M5 21V4"/><path d="M5 4c4-2 8 2 14 0v9c-6 2-10-2-14 0"/>' + E,
    search: S + '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>' + E,
    play: S + '<path d="m8 5 12 7-12 7z"/>' + E
  };
  function icon(name) { return ICONS[name] || ICONS.doc; }

  function typeChip(f) {
    return { doc: 'GOOGLE DOC', sheet: 'GOOGLE SHEET', pdf: 'PDF', img: 'IMAGE', folder: 'DRIVE FOLDER', local: 'ONE-PAGER' }[f.type] || 'FILE';
  }
  function typeIcon(f) {
    return { doc: 'doc', sheet: 'sheet', pdf: 'pdf', img: 'img', folder: 'folder', local: 'pdf' }[f.type] || 'doc';
  }
  function thumbUrl(f) {
    if (f.type === 'local') return f.thumb;
    if (f.type === 'folder') return null;
    return 'https://drive.google.com/thumbnail?id=' + f.id + '&sz=w640';
  }
  function buttons(f, big) {
    var cls = big ? 'btn sh ' : 'btn sh ';
    var out = [];
    if (f.type === 'doc') {
      out.push('<a class="' + cls + 'btn-primary warm" href="https://docs.google.com/document/d/' + f.id + '/export?format=docx"><span>&#8595; DOCX</span></a>');
      out.push('<a class="' + cls + 'btn-secondary warm" href="https://docs.google.com/document/d/' + f.id + '/export?format=pdf"><span>&#8595; PDF</span></a>');
      out.push('<a class="' + cls + 'btn-ghost cool" target="_blank" rel="noopener" href="https://docs.google.com/document/d/' + f.id + '/edit"><span>&#8599; Drive</span></a>');
    } else if (f.type === 'sheet') {
      out.push('<a class="' + cls + 'btn-primary warm" href="https://docs.google.com/spreadsheets/d/' + f.id + '/export?format=xlsx"><span>&#8595; XLSX</span></a>');
      out.push('<a class="' + cls + 'btn-ghost cool" target="_blank" rel="noopener" href="https://docs.google.com/spreadsheets/d/' + f.id + '/edit"><span>&#8599; Drive</span></a>');
    } else if (f.type === 'pdf' || f.type === 'img') {
      out.push('<a class="' + cls + 'btn-primary warm" href="https://drive.google.com/uc?export=download&id=' + f.id + '"><span>&#8595; FILE</span></a>');
      out.push('<a class="' + cls + 'btn-ghost cool" target="_blank" rel="noopener" href="https://drive.google.com/file/d/' + f.id + '/view"><span>&#8599; Drive</span></a>');
    } else if (f.type === 'folder') {
      out.push('<a class="' + cls + 'btn-ghost cool" target="_blank" rel="noopener" href="https://drive.google.com/drive/folders/' + f.id + '"><span>&#8599; Open in Drive</span></a>');
    } else if (f.type === 'local') {
      out.push('<a class="' + cls + 'btn-secondary warm" target="_blank" rel="noopener" href="' + f.html + '"><span>&#8599; HTML</span></a>');
      out.push('<a class="' + cls + 'btn-primary warm" href="' + f.pdf + '" download><span>&#8595; PDF</span></a>');
    }
    return out.join('');
  }

  // A library row with click-to-expand preview. opts: {showSection}
  function rowHtml(f, opts) {
    opts = opts || {};
    var metaBits = ['<span>' + typeChip(f) + '</span>'];
    if (f.ver) metaBits.push('<span>' + f.ver + '</span>');
    if (opts.showSection && f.section) metaBits.push('<span>' + f.section + '</span>');
    var newChip = f.isNew ? ' <span class="chip-new">NEW · AUG 2026</span>' : '';
    var expandable = f.type !== 'folder';
    return '' +
      '<div class="row wv' + '" data-fid="' + f.id + '">' +
      '<div class="tick-tl"></div><div class="tick-br"></div>' +
      '<div class="row-main" ' + (expandable ? 'data-toggle="1"' : '') + '>' +
      '<div class="ic-wrap">' + icon(typeIcon(f)) + '</div>' +
      '<div class="row-grow"><div class="row-name">' + f.name + newChip + '</div>' +
      '<div class="row-meta">' + metaBits.join('') + '</div></div>' +
      '<div class="row-btns hide-sm">' + buttons(f) + '</div>' +
      (expandable ? '<svg class="caret" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>' : '') +
      '</div>' +
      (expandable ? (
        '<div class="row-expand"><div class="prev">' +
        '<div><div class="thumb" data-thumb="' + (thumbUrl(f) || '') + '"></div>' +
        '<div class="thumb-cap">Preview: first page of the actual document</div></div>' +
        '<div class="prev-right"><div class="prev-title">' + f.name + '</div>' +
        '<div class="prev-desc">' + (f.desc || (typeChip(f) + (f.section ? ' from ' + f.section : '') + '. Look before you download: this is the document you are about to get.')) + '</div>' +
        '<div class="prev-btns">' + buttons(f, true) + '</div></div>' +
        '</div></div>') : '') +
      '</div>';
  }

  function loadThumb(rowEl) {
    var t = rowEl.querySelector('.thumb');
    if (!t || t.dataset.done) return;
    t.dataset.done = '1';
    var url = t.dataset.thumb;
    if (!url) { t.classList.add('noimg'); t.innerHTML = icon('folder') + '<span>No preview</span>'; return; }
    var img = new Image();
    img.onload = function () { t.innerHTML = ''; t.appendChild(img); };
    img.onerror = function () { t.classList.add('noimg'); t.innerHTML = icon('doc') + '<span>Preview unavailable</span>'; };
    img.alt = 'Document preview'; img.src = url;
  }

  function wireExpand(scope) {
    (scope || document).addEventListener('click', function (e) {
      var main = e.target.closest('.row-main[data-toggle]');
      if (!main || e.target.closest('a')) return;
      var row = main.parentElement;
      var wasOpen = row.classList.contains('open');
      var siblings = row.parentElement.querySelectorAll('.row.open');
      siblings.forEach(function (r) { r.classList.remove('open'); });
      if (!wasOpen) { row.classList.add('open'); loadThumb(row); }
    });
  }

  function videoCard(v, kind) {
    return '<a class="vcard sheen" target="_blank" rel="noopener" href="https://youtu.be/' + v.id + '">' +
      '<div class="tick-tl"></div>' +
      '<div class="vthumb"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg"></div>' +
      '<div class="vtitle">' + v.title + '</div>' +
      '<div class="vmeta">' + (kind === 'pod' ? 'PODCAST · THE DECISION' : 'HOW-TO VIDEO') + '</div></a>';
  }

  function stats() {
    var files = 0;
    FP_DATA.sections.forEach(function (s) { files += s.files.filter(function (f) { return f.type !== 'folder'; }).length; });
    return { resources: files + 2, categories: FP_DATA.sections.length, videos: FP_DATA.videos.length + FP_DATA.podcasts.length };
  }

  window.FP_MOCK = { icon: icon, rowHtml: rowHtml, wireExpand: wireExpand, loadThumb: loadThumb, videoCard: videoCard, buttons: buttons, stats: stats, typeChip: typeChip, typeIcon: typeIcon };
})();
