/* Forum Playbook load sting, v1.0.0. The animation itself is CSS (sting.css);
   this only decides WHEN it may run and clears the node afterwards.
   Once per calendar day per device, skippable by any click, key or scroll. */
(function () {
  var el = document.getElementById('fpSting');
  if (!el) return;
  var done = false;
  function clear() {
    if (done) return;
    done = true;
    el.classList.add('is-skipping');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    off();
  }
  function off() {
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (evt) {
      window.removeEventListener(evt, clear);
    });
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (evt) {
    window.addEventListener(evt, clear, { passive: true });
  });
  // Belt and braces: the CSS already hides it at 3.9s, this reclaims the node.
  setTimeout(function () {
    if (done) return;
    done = true;
    if (el.parentNode) el.parentNode.removeChild(el);
    off();
  }, 4100);
})();
