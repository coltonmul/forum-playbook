/* Catalyst Collective: the fit finder (Find Your Room), from the Three Tracks Kit of September 10. VERSION 3.0.0 (2026-11-02):
   moved onto the Catalyst Collective pages; the same questions and scoring. Nothing is stored or sent anywhere.
   Scoring: v = create viability, c = navigate complexity, s = lead at scale. No inline styles (CSP). */
(function () {
  'use strict';
  var form = document.getElementById('quiz');
  if (!form) return;
  var QUESTIONS = [
    { q: 'How many people are on your team?', o: [['Just me, maybe a contractor or two', { v: 3 }], ['1 to 3 employees', { v: 1, c: 2 }], ['4 to 10 employees', { c: 3 }], ['More than 10, including people who manage people', { s: 3 }]] },
    { q: 'What ate most of your brain this week?', o: [['Getting more customers in the door', { v: 3 }], ['Delivering everything without dropping balls', { v: 1, c: 2 }], ['Getting myself out of day-to-day decisions', { c: 2, s: 1 }], ['Developing leaders and picking the next big bet', { s: 3 }]] },
    { q: 'If you disappeared for two weeks, the business would...', o: [['Stop. I am the business', { v: 3 }], ['Limp along, then start breaking', { c: 2, v: 1 }], ['Run fine day to day, stall on big decisions', { c: 1, s: 2 }], ['Run fine. They might not notice', { s: 3 }]] },
    { q: 'Roughly where is annual revenue?', o: [['Under $250K', { v: 1 }], ['$250K to $1M', { c: 1 }], ['$1M to $3M', { c: 1 }], ['Over $3M', { s: 1 }]] },
    { q: 'You get 30 minutes with a sharp peer group. What do you bring?', o: [['How do I sell more of this?', { v: 3 }], ['How do I hire and delegate without everything slipping?', { c: 3 }], ['How do I build a management layer that actually manages?', { c: 1, s: 2 }], ['How do I grow leaders and keep the culture as we scale?', { s: 3 }]] },
    { q: 'How documented is the way your business runs?', o: [['It is in my head', { v: 2, c: 1 }], ['Some checklists when things break', { c: 2 }], ['Real processes most people follow', { c: 1, s: 1 }], ['Managers own and improve the processes', { s: 3 }]] },
    { q: 'Who depends on your decisions?', o: [['Me and my family', { v: 3 }], ['A few contractors and my customers', { v: 1, c: 2 }], ['Employees with paychecks, plus customers and vendors', { c: 3 }], ['Layers of people I mostly see in meetings', { s: 3 }]] },
    { q: 'What does winning look like in 18 months?', o: [['The business reliably pays me. It is real', { v: 3 }], ['Profitable, sustainable, and less dependent on me', { c: 3 }], ['A business that runs while I work on it, not in it', { c: 1, s: 2 }], ['Scale: new markets, acquisitions, a bigger mission', { s: 3 }]] }
  ];
  var TRACKS = {
    v: { name: 'Create Viability', cls: 'ja', tag: 'Track 1', desc: 'Your constraint is beautifully simple and completely consuming: the business needs more customers and more cash. Frameworks about org charts can wait. Demand cannot.', room: 'A room of people fighting the same fight: positioning, pricing, acquisition, and finding the one constraint between you and a business that reliably pays you.', eo: 'Catalyst is built to move businesses over the $1M mark, and the early curriculum there (sales, pricing, financial fundamentals) is your track. Start at the Catalyst page on eonashville.com.' },
    c: { name: 'Navigate Complexity', cls: 'jb', tag: 'Track 2', desc: 'You built a real business and it is getting heavy: employees, systems, payroll, and a calendar that eats owners. The problems are no longer simple, and that is exactly the point.', room: 'Peers who have carried the same weight: hiring and delegation, management systems, cash flow at scale, and getting you out of every decision without the wheels coming off.', eo: 'This is the heart of Catalyst, and the Catalyst Collective, an ongoing membership by invitation, is what follows it. If you are already past $1M, this is your on-ramp to full EO membership and forum.' },
    s: { name: 'Lead at Scale', cls: 'jc', tag: 'Track 3', desc: 'The machine runs without you doing everything, which means your job changed: leaders, culture, strategy, and deciding what all of this is for.', room: 'A confidential peer forum at full depth, with people who understand that the hardest problems at this stage are rarely about the business itself.', eo: 'Full EO Nashville membership and forum. One of the largest, most active chapters in the world, and the room you have earned.' }
  };
  var esc = function (s) { return window.ccEscape ? window.ccEscape(s) : String(s); };
  form.innerHTML = QUESTIONS.map(function (item, qi) {
    return '<fieldset class="q"><legend><span class="qnum">' + String(qi + 1).padStart(2, '0') + '</span>' + esc(item.q) + '</legend><div class="opts">' +
      item.o.map(function (o, oi) { return '<label class="opt"><input type="radio" name="q' + qi + '" value="' + oi + '"><span>' + esc(o[0]) + '</span></label>'; }).join('') +
      '</div></fieldset>';
  }).join('') + '<div class="btn-row"><button class="btn primary" type="submit" id="quiz-go">Show my room</button><span class="muted small" id="quiz-left"></span></div>';
  var btn = document.getElementById('quiz-go'), left = document.getElementById('quiz-left');
  form.addEventListener('change', function (e) {
    var lab = e.target.closest('.opt'); if (!lab) return;
    lab.parentElement.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('picked'); });
    lab.classList.add('picked');
  });
  var result = document.getElementById('result');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var score = { v: 0, c: 0, s: 0 }, answered = 0;
    QUESTIONS.forEach(function (item, qi) {
      var sel = form.querySelector('input[name="q' + qi + '"]:checked');
      if (sel) { answered++; var w = item.o[+sel.value][1]; for (var k in w) score[k] += w[k]; }
    });
    if (answered < QUESTIONS.length) { left.textContent = (QUESTIONS.length - answered) + ' left to answer'; return; }
    left.textContent = '';
    var total = score.v + score.c + score.s;
    var order = ['v', 'c', 's'].sort(function (a, b) { return score[b] - score[a]; });
    var t = TRACKS[order[0]];
    result.className = 'resultcard ' + t.cls;
    document.getElementById('r-tag').textContent = t.tag;
    document.getElementById('r-name').textContent = t.name;
    document.getElementById('r-desc').textContent = t.desc;
    document.getElementById('r-room').textContent = t.room;
    document.getElementById('r-eo').textContent = t.eo;
    var bars = document.getElementById('r-bars'); bars.innerHTML = '';
    ['v', 'c', 's'].forEach(function (k) {
      var pct = Math.round(100 * score[k] / total);
      var li = document.createElement('li');
      li.innerHTML = '<span class="lab"></span><span class="track"><span class="fill"></span></span><span class="val"></span>';
      li.querySelector('.lab').textContent = TRACKS[k].name;
      li.querySelector('.fill').style.setProperty('--w', pct + '%');
      li.querySelector('.fill').className = 'fill ' + (k === 'v' ? '' : k === 'c' ? 'alt' : 'dark');
      li.querySelector('.val').textContent = pct + '%';
      bars.appendChild(li);
    });
    bars.classList.add('in');
    var mail = document.getElementById('r-mail');
    mail.href = 'mailto:colton@foxfuelcreative.com?subject=' + encodeURIComponent('[Find your room] I got ' + t.name) +
      '&body=' + encodeURIComponent('My result: ' + t.name + ' (viability ' + Math.round(100 * score.v / total) + '%, complexity ' + Math.round(100 * score.c / total) + '%, scale ' + Math.round(100 * score.s / total) + '%).\n\nDid it get me right? ');
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  var retake = document.getElementById('r-retake');
  if (retake) retake.addEventListener('click', function () {
    form.reset(); form.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('picked'); });
    result.hidden = true; form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
