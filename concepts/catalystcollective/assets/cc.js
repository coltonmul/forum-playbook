/* Catalyst Collective on forumplaybook.com: shared page behavior. VERSION 2.0.0 (2026-10-07)
   The feedback box (posts to the sandbox's own API, which stays at catalystcollective.pages.dev with the
   database), the bar charts that grow in when scrolled into view, the hover timeline, and copy buttons.
   No third-party scripts. */
(function () {
  'use strict';
  var API = 'https://catalystcollective.pages.dev/api';
  var B = '/concepts/catalystcollective';
  window.CC_API = API;
  window.CC_BASE = B;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  window.ccEscape = escapeHtml;

  /* ---------- bar charts grow in once visible ---------- */
  var bars = document.querySelectorAll('.bars');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    bars.forEach(function (b) { io.observe(b); });
  } else {
    bars.forEach(function (b) { b.classList.add('in'); });
  }

  /* ---------- timeline: hover, focus or tap a stop to read it ---------- */
  document.querySelectorAll('[data-tl]').forEach(function (tl) {
    var panel = document.getElementById(tl.getAttribute('data-tl'));
    var items = Array.prototype.slice.call(tl.querySelectorAll('li'));
    function show(li) {
      items.forEach(function (o) { o.classList.toggle('on', o === li); var b = o.querySelector('button'); if (b) b.setAttribute('aria-pressed', o === li ? 'true' : 'false'); });
      if (!panel) return;
      panel.innerHTML = '<b>' + li.querySelector('.d').textContent + '</b><span>' + li.querySelector('.tl-more').innerHTML + '</span>';
      var r = li.getBoundingClientRect(), pr = panel.getBoundingClientRect();
      panel.style.setProperty('--x', Math.max(12, r.left - pr.left + 11) + 'px');
    }
    items.forEach(function (li) {
      var b = li.querySelector('button');
      if (!b) return;
      b.addEventListener('mouseenter', function () { show(li); });
      b.addEventListener('focus', function () { show(li); });
      b.addEventListener('click', function () { show(li); });
    });
    var start = tl.querySelector('li.next') || items[0];
    if (start) show(start);
    window.addEventListener('resize', function () { var on = tl.querySelector('li.on'); if (on) show(on); });
  });

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('.copybtn').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.getElementById(b.getAttribute('data-copy'));
      if (!el) return;
      navigator.clipboard.writeText(el.innerText.replace(/\n{3,}/g, '\n\n').trim()).then(function () {
        var o = b.textContent; b.textContent = 'Copied';
        setTimeout(function () { b.textContent = o; }, 1800);
      }).catch(function () { b.textContent = 'Select and copy manually'; });
    });
  });

  /* ---------- feedback box ---------- */
  var form = document.getElementById('fb-form');
  if (!form) return;
  var startedAt = Date.now();
  var nameEl = form.querySelector('[name="name"]');
  var emailEl = form.querySelector('[name="email"]');
  var msgEl = form.querySelector('[name="message"]');
  var changeEl = form.querySelector('[name="change_request"]');
  var out = document.getElementById('fb-result');
  var btn = form.querySelector('button[type="submit"]');
  try {
    var savedName = localStorage.getItem('cc-fb-name'); if (savedName && nameEl) nameEl.value = savedName;
    var savedEmail = localStorage.getItem('cc-fb-email'); if (savedEmail && emailEl) emailEl.value = savedEmail;
  } catch (e) {}
  if (changeEl && msgEl) {
    msgEl.addEventListener('input', function () { if (/#calvin\b/i.test(msgEl.value)) changeEl.checked = true; });
  }
  var mailto = document.getElementById('fb-mailto');
  if (mailto) {
    mailto.href = 'mailto:colton@foxfuelcreative.com?subject=' + encodeURIComponent('[Catalyst Collective] Feedback on ' + document.title) +
      '&body=' + encodeURIComponent('Page: ' + location.href + '\n\n');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    out.className = 'notice'; out.textContent = '';
    var name = nameEl.value.trim(), message = msgEl.value.trim();
    if (!name) { out.className = 'notice err'; out.textContent = 'Add your name so Colton knows who to thank.'; nameEl.focus(); return; }
    if (!message) { out.className = 'notice err'; out.textContent = 'The message is empty.'; msgEl.focus(); return; }
    var isChange = changeEl && changeEl.checked;
    if (isChange && !/#calvin\b/i.test(message)) message = message + '\n\n#Calvin';
    btn.disabled = true; btn.textContent = 'Sending';
    var payload = {
      name: name, email: emailEl ? emailEl.value.trim() : '', message: message,
      page: location.pathname, page_title: document.title,
      change_request: isChange ? 1 : 0, website: form.querySelector('[name="website"]').value,
      started_at: startedAt
    };
    fetch(API + '/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
      .then(function (res) {
        btn.disabled = false; btn.textContent = 'Send to Colton';
        if (res.body && res.body.ok) {
          try { localStorage.setItem('cc-fb-name', name); if (emailEl) localStorage.setItem('cc-fb-email', emailEl.value.trim()); } catch (e2) {}
          msgEl.value = ''; if (changeEl) changeEl.checked = false;
          out.className = 'notice ok';
          out.innerHTML = 'Got it, ' + escapeHtml(name.split(' ')[0]) + '. It is in the <a href="' + B + '/feedback/">feedback log</a> now.' +
            (res.body.is_change_request ? ' Flagged as a change request: Calvin drafts it, Colton approves it, then it ships here.' : ' Colton reads every entry.');
          document.dispatchEvent(new CustomEvent('cc:feedback-sent'));
        } else {
          out.className = 'notice err';
          out.textContent = (res.body && res.body.error) ? res.body.error : 'Could not send. Email Colton instead: colton@foxfuelcreative.com';
        }
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = 'Send to Colton';
        out.className = 'notice err';
        out.textContent = 'Could not reach the server. Email Colton instead: colton@foxfuelcreative.com';
      });
  });
})();
