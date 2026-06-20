// ═══════════════════════════════════════════════════════════
// FORUM PLAYBOOK — podcasts.js
//
// Renders the "Podcasts" section. These episodes live on OTHER
// channels, so they can't come through the YouTube playlist that
// powers the How-To Videos. They're listed by hand in config.js
// (CONFIG.PODCASTS). This file just draws them.
//
// To change which podcasts show up, edit CONFIG.PODCASTS in
// config.js — you do NOT need to touch this file.
//
// Reuses the existing video-card styles, so there are no CSS changes.
// ═══════════════════════════════════════════════════════════
(function () {
  const grid = document.getElementById('podcast-grid');
  if (!grid || typeof CONFIG === 'undefined' || !Array.isArray(CONFIG.PODCASTS) || !CONFIG.PODCASTS.length) {
    return;
  }

  // Microphone icon (matches the orange used by the video-camera icon)
  const podcastIcon = `<svg class="video-type-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
<rect x="6" y="1" width="4" height="8" rx="2" stroke="#E8521A" stroke-width="0.9" fill="#E8521A" fill-opacity="0.15"/>
<path d="M4 7a4 4 0 0 0 8 0" stroke="#E8521A" stroke-width="0.9"/>
<line x1="8" y1="11" x2="8" y2="14" stroke="#E8521A" stroke-width="0.9"/>
<line x1="5.5" y1="14" x2="10.5" y2="14" stroke="#E8521A" stroke-width="0.9" stroke-linecap="round"/>
</svg>`;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  grid.innerHTML = CONFIG.PODCASTS.map(p => {
    const title = escapeHtml(p.title);
    const thumb = `https://img.youtube.com/vi/${p.videoId}/mqdefault.jpg`;
    return `
<div class="video-card" data-videoid="${p.videoId}" role="button" tabindex="0" aria-label="Play: ${title}">
<div class="video-thumb-16x9">
<img src="${thumb}" alt="${title}" loading="lazy" />
<div class="play-btn" aria-hidden="true"><div class="play-triangle"></div></div>
<div class="yt-badge">Podcast</div>
</div>
<div class="video-info">
${podcastIcon}
<div class="video-text">
<div class="video-title">${title}</div>
<div class="video-meta">Podcast episode</div>
</div>
</div>
</div>`;
  }).join('');

  // Open the same lightbox the How-To Videos use. The close/Escape/
  // backdrop handlers in app.js act on these same elements, so closing
  // works without any extra wiring here.
  const lightbox = document.getElementById('lightbox');
  const lightboxEmbed = document.getElementById('lightbox-embed');
  const lightboxClose = document.getElementById('lightbox-close');

  function openVideo(videoId) {
    if (!videoId) return;
    if (window.innerWidth < 680) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener');
      return;
    }
    if (!lightbox || !lightboxEmbed) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener');
      return;
    }
    lightboxEmbed.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  grid.addEventListener('click', e => {
    const card = e.target.closest('[data-videoid]');
    if (card) openVideo(card.dataset.videoid);
  });

  grid.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-videoid]');
      if (card) { e.preventDefault(); card.click(); }
    }
  });
})();
