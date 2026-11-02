/* Catalyst Collective sandbox: renders the four draft surveys as working forms. VERSION 2.2.0 (2026-11-02; the alumni survey
   has its own page, surveys/alumni/, which renders the questions as a readable list (with a note on what each one is for)
   and then the form; its spec now carries every question from the September 9 working draft and the September 10 sample
   survey; new "rate" question type; the overview link points at this site. 2.0.1, 2026-10-07: "deep dive" wording
   replaced; moved to forumplaybook.com, posts to the sandbox API on catalystcollective.pages.dev.)
   Question specs live here so the council can see exactly what would be asked. Responses post to
   /api/survey and are stored privately; only counts are public. */
(function () {
  'use strict';
  var esc = function (s) { return window.ccEscape ? window.ccEscape(s) : String(s); };

  var WEEK = ['Finding customers and making the business real', 'Delivering everything without dropping balls', 'Building systems and a team so it runs without me', 'Leading leaders and setting direction'];
  var REVENUE = ['Under $250K', '$250K to $500K', '$500K to $1M', '$1M to $2M', 'Over $2M'];
  var TRACKS = ['Growth & Scaling', 'Stabilizing & Optimizing', 'Still firefighting, honestly', 'Not sure'];
  var USE = ['A moderated forum in my track', 'Rotating advisors by function (finance, sales, people)', 'The ability to audit past Catalyst classes', 'Monthly learning events on my track', 'Social hours with the whole Collective', 'Quarterly themed sessions led by EO members who solved my exact problem', 'Subsidized software to help run the business', 'Discounted or subsidized consulting engagements', 'An operating system with accountability (EOS, Petra or similar)', 'A financial dashboard or decision tool', 'An Entrepreneur Center membership bundle', '90-day execution cycles with accountability'];
  var PRICE = ['$1,000', '$1,750 (what Bridge costs today)', '$2,500', '$3,000', 'More than $3,000'];

  var SURVEYS = {
    council: {
      title: 'Council review questions',
      audience: 'The strategic council. Name required so Colton can follow up.',
      purpose: 'React to the concept itself before it ever reaches a member. Short answers are fine; blunt ones are better.',
      needName: true,
      sections: [
        { h: 'The model', q: [
          { id: 'tracks', t: 'Two forum tracks inside the Collective (Growth & Scaling, Stabilizing & Optimizing) and three content buckets on the learning calendar, with firefighting handled by repeating Catalyst. Does that match what you see come through Catalyst? Is a track missing, or drawn wrong?', type: 'text' },
          { id: 'placement', t: 'This draft assumes placement by a 20-minute intake informed by the moderator and mentor, not self-selection. Right call, or does self-selection deserve more weight?', type: 'text' },
          { id: 'invitation', t: 'Getting in is an application: Catalyst graduates apply, past alumni can apply at any time, and the committee invites applicants on the same kinds of factors EO weighs on an application, with Catalyst revenue thresholds tiered by industry. Right criteria? Right people deciding?', type: 'text' },
          { id: 'notinvited', t: 'Graduates who are not invited: repeat Catalyst at a discount (Colton’s proposal), a lighter bootcamp, or neither?', type: 'text' }
        ] },
        { h: 'The money', q: [
          { id: 'price', t: 'Does $3,000 a year feel right, too high, or too low, against $1,750 for Bridge today with no programming attached? Should a year of Collective dues credit toward EO initiation?', type: 'text' },
          { id: 'number', t: 'Colton\u2019s slide said keep 50% of each graduating class; the sandbox models his 75% target. What number would you plan around, and what class size?', type: 'text' },
          { id: 'staff', t: 'The model prices a $75,000 dedicated resource to run the Collective with the committee. Too much, too little, or the wrong shape (a stipend, a contractor, part of an existing role)?', type: 'text' }
        ] },
        { h: 'The rest', q: [
          { id: 'programming', t: 'What are the real class titles or programming that belong in each track? Matt, this is the one thing the draft cannot do without you.', type: 'text' },
          { id: 'name', t: 'The working name is Catalyst Collective, with the tagline \u201Can ongoing membership, by invitation.\u201D Catalyst Continuation was offered. Do the name and the tagline hold, or does something beat them? Any conflict with EO Global’s policies and procedures we are missing?', type: 'text' }
        ] }
      ]
    },
    alumni: {
      title: 'Catalyst alumni survey',
      audience: 'Every past Catalyst graduate: current Bridge members, lapsed Bridge members, graduates who never joined Bridge, and the class in Catalyst now.',
      purpose: 'Learn where alumni are today, what Catalyst and Bridge did and did not do for them, whether the Catalyst Collective would represent real value to them, and what they would pay. Watch the 60-second explainer or read the overview first.',
      needName: false,
      sections: [
        { h: 'A. Where you are today', q: [
          { id: 'status', t: 'Where are you today?', type: 'single', o: ['Current Bridge member', 'Lapsed Bridge member', 'Catalyst graduate who never joined Bridge', 'Currently in Catalyst', 'EO member who came through Catalyst'], why: 'Sorts every answer into the groups the council wants to compare.' },
          { id: 'when', t: 'Roughly how long ago did you finish Catalyst?', type: 'single', o: ['Less than a year', '1 to 2 years', '3 to 5 years', 'More than 5 years', 'Still in it'] },
          { id: 'week', t: 'Which of these sounds most like your week?', type: 'single', o: WEEK, why: 'The track question in disguise: stage, not revenue.' },
          { id: 'team', t: 'How many people are on your team, and do any of them manage others?', type: 'short', why: 'Matt\u2019s complexity axis.' },
          { id: 'revenue', t: 'Roughly where is annual revenue?', type: 'single', o: REVENUE, why: 'Kept coarse on purpose.' },
          { id: 'growth', t: 'Is growing past $1M a goal you are actively pursuing, a someday thing, or not the point of your business?', type: 'single', o: ['Actively pursuing it', 'A someday thing', 'Not the point of my business'], why: 'Separates strivers from stabilizers without judgment.' }
        ] },
        { h: 'B. Why you came, and what you got', q: [
          { id: 'hoped', t: 'What did you hope Catalyst or Bridge would do for you when you joined?', type: 'text' },
          { id: 'problem', t: 'What is the one problem you most wanted help carrying?', type: 'text', why: 'Matt\u2019s "what problem are we solving", answered from the trenches.' },
          { id: 'valuable', t: 'What was the single most valuable part of your Catalyst experience?', type: 'text' },
          { id: 'rate', t: 'Rate the value you got from each, 1 (none) to 5 (a lot).', type: 'rate', o: ['The classes', 'Your cohort or forum', 'Your mentor', 'Learning events', 'Social events'], why: 'Which parts of the program earn their keep.' },
          { id: 'redundant', t: '"The format became redundant for me over time." Agree or disagree, and when did that start?', type: 'text', why: 'Tests the redundancy signal the council heard, without naming anyone.' },
          { id: 'gap', t: 'If you are or were in Bridge: what is the biggest gap? If you left or never joined: what would have kept you, or gotten you in?', type: 'text', why: 'The retention question, asked straight.' }
        ] },
        { h: 'C. The Collective (watch the explainer or read the overview first)', q: [
          { id: 'value', t: 'Read the overview page of this site, or watch the 60-second explainer. In one sentence, does the Catalyst Collective represent real value to you? Why or why not?', type: 'text', why: 'The question the whole survey exists to ask.' },
          { id: 'track', t: 'Which track would you place yourself in today?', type: 'single', o: TRACKS },
          { id: 'room', t: 'Would you rather be in a room of people at your exact stage, or a mixed room that includes entrepreneurs further ahead?', type: 'single', o: ['A room at my exact stage', 'A mixed room, including people further ahead', 'No strong preference'], why: 'The two-track forum question.' },
          { id: 'placement', t: 'Placement by a short intake, not picking your own track: comfortable with that, or would you rather self-select?', type: 'single', o: ['Comfortable with placement', 'I would rather self-select', 'Either is fine'] },
          { id: 'missing', t: 'What is missing? What would you want in addition to what is on the page?', type: 'text' },
          { id: 'use', t: 'Which of these would you actually use? Check all that apply.', type: 'multi', o: USE, why: 'The programming menu from the September 8 huddle, priced by demand.' },
          { id: 'price', t: 'At what annual price does a membership like that feel obviously worth it?', type: 'single', o: PRICE, why: 'Against $1,750 for Bridge today with no programming attached. Van Westendorp lite.' },
          { id: 'mentor', t: 'Would you give an hour a month to mentor someone a stage behind you?', type: 'single', o: ['Yes', 'Maybe', 'No'], why: 'Tests the mentor supply line.' }
        ] },
        { h: 'D. The bottom line', q: [
          { id: 'nps', t: 'How likely are you to recommend Catalyst or Bridge to another entrepreneur, 0 (not at all) to 10 (already have)?', type: 'single', o: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], why: 'NPS with teeth, with the next question.' },
          { id: 'move', t: 'What is the one change that would move that answer up?', type: 'text' },
          { id: 'focus', t: 'Would you join a small focus group, 5 to 6 people, to go deeper on this with Sameera and Matt?', type: 'single', o: ['Yes', 'Maybe', 'No'], why: 'The survey recruits its own second round.' },
          { id: 'else', t: 'Anything else the strategic council should know before this locks?', type: 'text' }
        ] }
      ]
    },
    graduate: {
      title: 'Graduating class survey',
      audience: 'The class finishing Catalyst now, in the last weeks before graduation.',
      purpose: 'A placement signal for the committee and an honest read on whether an invitation would be accepted, before any invitation is extended.',
      needName: false,
      sections: [
        { h: 'A. Where the business is', q: [
          { id: 'week', t: 'Which of these sounds most like your week?', type: 'single', o: WEEK },
          { id: 'team', t: 'How many people are on your team (employees, 1099s, freelancers, agents, bots, a bookkeeper), and do any of them manage others?', type: 'short' },
          { id: 'disappear', t: 'If you disappeared for two weeks, the business would...', type: 'single', o: ['Stop. I am the business', 'Limp along, then start breaking', 'Run fine day to day, stall on big decisions', 'Run fine. They might not notice'] },
          { id: 'revenue', t: 'Roughly where is annual revenue?', type: 'single', o: REVENUE },
          { id: 'growth', t: 'Is growing past $1M a goal you are actively pursuing, a someday thing, or not the point of your business?', type: 'single', o: ['Actively pursuing it', 'A someday thing', 'Not the point of my business'] }
        ] },
        { h: 'B. What comes next', q: [
          { id: 'next18', t: 'What do you want the next 18 months to look like for the business, and for you?', type: 'text' },
          { id: 'accept', t: 'If you were invited into the Catalyst Collective at graduation, would you accept?', type: 'single', o: ['Yes', 'Probably', 'Depends on the price', 'No'] },
          { id: 'track', t: 'Which track fits you today?', type: 'single', o: TRACKS },
          { id: 'use', t: 'What would make the Collective worth it to you? Check all that apply.', type: 'multi', o: USE },
          { id: 'price', t: 'At what annual price does it feel obviously worth it?', type: 'single', o: PRICE },
          { id: 'else', t: 'Anything the committee should know?', type: 'text' }
        ] }
      ]
    },
    prospect: {
      title: 'Prospect survey',
      audience: 'Entrepreneurs considering Catalyst: info-session attendees, referrals from members, people who found the page.',
      purpose: 'Interest and fit, plus a reason to follow up. Pairs with the fit finder, which stores nothing.',
      needName: false,
      sections: [
        { h: 'About you and the business', q: [
          { id: 'heard', t: 'How did you hear about Catalyst?', type: 'single', o: ['An EO member', 'An info session', 'The Entrepreneur Center', 'Social media or the website', 'Somewhere else'] },
          { id: 'revenue', t: 'Roughly where is annual revenue?', type: 'single', o: ['Under $250K', '$250K to $500K', '$500K to $1M', 'Over $1M'] },
          { id: 'team', t: 'How many people are on your team?', type: 'single', o: ['Just me, maybe a contractor or two', '1 to 3', '4 to 10', 'More than 10'] },
          { id: 'week', t: 'What ate most of your brain this week?', type: 'single', o: ['Getting more customers in the door', 'Delivering everything without dropping balls', 'Getting myself out of day-to-day decisions', 'Developing leaders and picking the next big bet'] },
          { id: 'hope', t: 'What do you hope Catalyst would do for you?', type: 'text' },
          { id: 'holding', t: 'What is holding you back, if anything? Check all that apply.', type: 'multi', o: ['The price ($3,500)', 'Timing this year', 'Not sure I qualify', 'Not sure it is for me', 'I want to talk to someone who did it', 'Nothing, where do I sign'] }
        ] }
      ]
    }
  };

  var host = document.getElementById('survey-host');
  var counts = {};

  function field(sid, q, i) {
    var name = q.id;
    var label = '<p style="margin:0 0 8px"><b>' + (i + 1) + '.</b> ' + esc(q.t) + '</p>';
    if (q.type === 'single') {
      return '<div class="field">' + label + q.o.map(function (o) { return '<label class="check"><input type="radio" name="' + name + '" value="' + esc(o) + '"> <span>' + esc(o) + '</span></label>'; }).join('') + '</div>';
    }
    if (q.type === 'multi') {
      return '<div class="field">' + label + q.o.map(function (o) { return '<label class="check"><input type="checkbox" name="' + name + '" value="' + esc(o) + '"> <span>' + esc(o) + '</span></label>'; }).join('') + '</div>';
    }
    if (q.type === 'short') {
      return '<div class="field">' + label + '<input type="text" name="' + name + '" maxlength="300"></div>';
    }
    if (q.type === 'rate') {
      return '<div class="field">' + label + '<div class="rate">' + q.o.map(function (o, k) {
        var n = name + '__' + k;
        return '<div class="rate-row"><span class="rate-l">' + esc(o) + '</span><span class="rate-o">' + [1, 2, 3, 4, 5].map(function (v) {
          return '<label class="check rate-c"><input type="radio" name="' + n + '" value="' + v + '"> <span>' + v + '</span></label>';
        }).join('') + '</span></div>';
      }).join('') + '</div></div>';
    }
    return '<div class="field">' + label + '<textarea name="' + name + '" maxlength="2000"></textarea></div>';
  }

  function render(sid, noScroll) {
    var s = SURVEYS[sid];
    var n = 0;
    var html = '<div class="callout blue" style="margin-top:22px"><p class="kicker" style="margin:0">' + esc(s.title) + '</p>' +
      '<p style="margin:6px 0 4px"><b>Audience:</b> ' + esc(s.audience) + '</p><p style="margin:0 0 4px"><b>Purpose:</b> ' + esc(s.purpose) + '</p>' +
      '<p class="small muted" style="margin:0">Status: draft for council review, open for testing. Responses so far: <span id="sv-count">' + (counts[sid] || 0) + '</span>. Answers are private; only the count is public.</p></div>';
    html += '<form id="sv-form" data-survey="' + sid + '" novalidate>';
    s.sections.forEach(function (sec) {
      html += '<h2>' + esc(sec.h) + '</h2>';
      sec.q.forEach(function (q) { html += field(sid, q, n); n++; });
    });
    html += '<h2>About you</h2><div class="two-col">' +
      '<div class="field"><label>Your name' + (s.needName ? '' : ' <span class="hint">optional</span>') + '<input type="text" name="respondent" maxlength="80" autocomplete="name"></label></div>' +
      '<div class="field"><label>Email <span class="hint">optional, only if you want a reply</span><input type="email" name="email" maxlength="120" autocomplete="email"></label></div></div>';
    html += '<div class="vh" aria-hidden="true"><label>Leave this empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>';
    html += '<div class="btn-row"><button class="btn primary" type="submit">Submit ' + esc(s.title.toLowerCase()) + '</button><button class="btn secondary" type="button" id="sv-copy">Copy the questions as text</button></div>';
    html += '<div id="sv-result" class="notice" role="status"></div></form>';
    host.innerHTML = html;
    document.querySelectorAll('#survey-tabs [data-survey]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-survey') === sid ? 'true' : 'false'); b.style.borderColor = b.getAttribute('data-survey') === sid ? 'var(--eo)' : ''; });
    var startedAt = Date.now();
    var form = document.getElementById('sv-form');
    var out = document.getElementById('sv-result');
    document.getElementById('sv-copy').addEventListener('click', function () {
      var lines = [s.title, 'Audience: ' + s.audience, 'Purpose: ' + s.purpose, ''];
      var k = 0;
      s.sections.forEach(function (sec) { lines.push(sec.h); sec.q.forEach(function (q) { k++; lines.push(k + '. ' + q.t + (q.o ? ' (' + q.o.join(' / ') + ')' : '')); }); lines.push(''); });
      var btn = this;
      navigator.clipboard.writeText(lines.join('\n')).then(function () { var o = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = o; }, 1800); }).catch(function () { btn.textContent = 'Select and copy manually'; });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var answers = {};
      var answered = 0;
      s.sections.forEach(function (sec) { sec.q.forEach(function (q) {
        if (q.type === 'multi') {
          var vals = Array.prototype.map.call(form.querySelectorAll('[name="' + q.id + '"]:checked'), function (x) { return x.value; });
          if (vals.length) { answers[q.id] = vals; answered++; }
        } else if (q.type === 'single') {
          var sel = form.querySelector('[name="' + q.id + '"]:checked');
          if (sel) { answers[q.id] = sel.value; answered++; }
        } else if (q.type === 'rate') {
          var rated = [];
          q.o.forEach(function (o, k) { var r = form.querySelector('[name="' + q.id + '__' + k + '"]:checked'); if (r) rated.push(o + ': ' + r.value); });
          if (rated.length) { answers[q.id] = rated; answered++; }
        } else {
          var el = form.querySelector('[name="' + q.id + '"]');
          if (el && el.value.trim()) { answers[q.id] = el.value.trim(); answered++; }
        }
      }); });
      var respondent = form.querySelector('[name="respondent"]').value.trim();
      if (s.needName && !respondent) { out.className = 'notice err'; out.textContent = 'Add your name so Colton knows whose answers these are.'; return; }
      if (!answered) { out.className = 'notice err'; out.textContent = 'Answer at least one question.'; return; }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      fetch(window.CC_API + '/survey', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        survey: sid, respondent: respondent, email: form.querySelector('[name="email"]').value.trim(), answers: answers,
        website: form.querySelector('[name="website"]').value, started_at: startedAt
      }) }).then(function (r) { return r.json(); }).then(function (j) {
        btn.disabled = false;
        if (j && j.ok) {
          out.className = 'notice ok';
          out.textContent = 'Received. Thank you' + (respondent ? ', ' + respondent.split(' ')[0] : '') + '. ' + answered + ' answers saved. Colton reads every response.';
          counts[sid] = (counts[sid] || 0) + 1;
          var c = document.getElementById('sv-count'); if (c) c.textContent = counts[sid];
          form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(function (x) { x.checked = false; });
          form.querySelectorAll('textarea, input[type="text"]').forEach(function (x) { if (x.name !== 'respondent') x.value = ''; });
        } else {
          out.className = 'notice err'; out.textContent = (j && j.error) ? j.error : 'Could not save. Email Colton instead: colton@foxfuelcreative.com';
        }
      }).catch(function () { btn.disabled = false; out.className = 'notice err'; out.textContent = 'Could not reach the site. Email Colton instead: colton@foxfuelcreative.com'; });
    });
    if (!noScroll) host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // The readable list: every question with its options and a note on what it is for (the alumni page).
  function questionsText(s) {
    var lines = [s.title, 'Audience: ' + s.audience, 'Purpose: ' + s.purpose, ''];
    var k = 0;
    s.sections.forEach(function (sec) { lines.push(sec.h); sec.q.forEach(function (q) { k++; lines.push(k + '. ' + q.t + (q.o ? ' (' + q.o.join(' / ') + (q.type === 'rate' ? '; each 1 to 5' : '') + ')' : '') + (q.why ? ' [Why: ' + q.why + ']' : '')); }); lines.push(''); });
    return lines.join('\n');
  }
  function renderRead(sid, el) {
    var s = SURVEYS[sid];
    var n = 0;
    var html = '';
    s.sections.forEach(function (sec) {
      html += '<h3>' + esc(sec.h) + '</h3><ol class="qlist">';
      sec.q.forEach(function (q) {
        n++;
        var kind = q.type === 'single' ? 'One answer' : q.type === 'multi' ? 'Check all that apply' : q.type === 'rate' ? 'Each item 1 to 5' : q.type === 'short' ? 'A short answer' : 'Open text';
        html += '<li class="q"><span class="n">' + (n < 10 ? '0' : '') + n + '</span><span><span class="t">' + esc(q.t) + '</span>' +
          '<span class="opts">' + kind + (q.o ? ': ' + esc(q.o.join(' / ')) : '') + '</span>' +
          (q.why ? '<span class="why">Why it is here: ' + esc(q.why) + '</span>' : '') + '</span></li>';
      });
      html += '</ol>';
    });
    html += '<p class="small muted">' + n + ' questions. The numbering matches the form below.</p>';
    el.innerHTML = html;
  }

  document.querySelectorAll('#survey-tabs [data-survey]').forEach(function (b) {
    b.addEventListener('click', function () { render(b.getAttribute('data-survey')); history.replaceState(null, '', '#' + b.getAttribute('data-survey')); });
  });

  fetch(window.CC_API + '/survey', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
    counts = (j && j.counts) || {};
    var c = document.getElementById('sv-count'); var f = document.getElementById('sv-form');
    if (c && f) c.textContent = counts[f.getAttribute('data-survey')] || 0;
  }).catch(function () {});

  var readEl = document.getElementById('alumni-read');
  if (readEl) {
    // the alumni page: readable list, copy button, then the form, no scrolling
    renderRead('alumni', readEl);
    var cp = document.getElementById('al-copy');
    if (cp) cp.addEventListener('click', function () {
      var btn = this; var o = btn.innerHTML;
      navigator.clipboard.writeText(questionsText(SURVEYS.alumni)).then(function () { btn.textContent = 'Copied'; setTimeout(function () { btn.innerHTML = o; }, 1800); }).catch(function () { btn.textContent = 'Select and copy manually'; });
    });
    render('alumni', true);
  } else {
    var initial = (location.hash || '').replace('#', '');
    if (initial === 'alumni') { location.replace(window.CC_BASE ? window.CC_BASE + '/surveys/alumni/' : '/concepts/catalystcollective/surveys/alumni/'); return; }
    if (SURVEYS[initial]) { render(initial); } else { render('council'); window.scrollTo(0, 0); }
  }
})();
