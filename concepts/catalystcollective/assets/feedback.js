/* Catalyst Collective sandbox: renders the public feedback log. VERSION 2.0.0 (2026-10-07; moved to forumplaybook.com, reads the log from the sandbox API) */
(function () {
  'use strict';
  var log = document.getElementById('log');
  var count = document.getElementById('log-count');
  var items = [];
  var filter = 'all';
  var esc = function (s) { return window.ccEscape ? window.ccEscape(s) : String(s); };
  var LABEL = { received: 'Received', reviewing: 'Reviewing', proposed: 'Proposed on beta', approved: 'Approved', live: 'Live', declined: 'Declined' };
  var B = '/concepts/catalystcollective';
  var PAGES = { '/': 'Overview', '/journey/': 'Journeys', '/model/': 'Financial model', '/surveys/': 'Surveys', '/library/': 'Already built', '/feedback/': 'Feedback log' };
  Object.keys(PAGES).forEach(function (k) { PAGES[B + k] = PAGES[k]; });

  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' CT';
    } catch (e) { return iso; }
  }

  function render() {
    var list = items.filter(function (x) {
      if (filter === 'change') return Number(x.is_change_request) === 1;
      if (filter === 'open') return ['received', 'reviewing', 'proposed'].indexOf(x.status) >= 0;
      return true;
    });
    count.textContent = list.length + ' of ' + items.length;
    if (!items.length) { log.innerHTML = '<p class="muted">Nothing yet. Be the first: the box is at the bottom of this page.</p>'; return; }
    if (!list.length) { log.innerHTML = '<p class="muted">Nothing matches that filter.</p>'; return; }
    log.innerHTML = list.map(function (x) {
      var page = PAGES[x.page] || x.page_title || x.page || '';
      var chips = '<span class="chip ' + esc(x.status) + '">' + esc(LABEL[x.status] || x.status) + (x.applied_version ? ' in v' + esc(x.applied_version) : '') + '</span>';
      if (Number(x.is_change_request) === 1) chips += ' <span class="chip change">Change request</span>';
      var resp = x.response ? '<div class="resp"><b>Colton:</b> ' + esc(x.response) + '</div>' : '';
      return '<div class="log-item"><div class="top"><b>' + esc(x.name) + '</b><span>' + fmtDate(x.created_at) + '</span><span>on ' + esc(page) + '</span>' + chips + '</div>' +
        '<div class="msg">' + esc(x.message) + '</div>' + resp + '</div>';
    }).join('');
  }

  document.querySelectorAll('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      filter = b.getAttribute('data-filter');
      document.querySelectorAll('[data-filter]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      render();
    });
  });

  fetch(window.CC_API + '/feedback', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (j) { items = (j && j.items) || []; render(); })
    .catch(function () { log.innerHTML = '<p class="notice err">Could not load the log right now. The entries are safe; try again in a minute.</p>'; });

  // refresh the log after someone posts from this page
  document.addEventListener('cc:feedback-sent', function () { setTimeout(function () {
    fetch(window.CC_API + '/feedback', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { items = (j && j.items) || []; render(); }).catch(function () {});
  }, 1500); });
})();
