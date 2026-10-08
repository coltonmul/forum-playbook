/* Catalyst Collective sandbox: Brittany Lorenzi's preliminary budget, VERSION 2.1.0 (2026-10-08).
   Her September 18, 2026 spreadsheet ("Catalyst Collective Preliminary Model Thoughts.xlsx"),
   reproduced formula for formula with her numbers as the defaults and every fee and count as a
   lever. Added at Colton's direction from his October 8 email. Pure browser JavaScript, no
   libraries. Inputs live in the URL with a b_ prefix so a version can be shared by link without
   touching the main model's parameters. */
(function () {
  'use strict';

  var DEFAULTS = {
    fee: 2500, grads1: 36, grads2: 40, join: 50, ret: 90, toeo: 50,
    setup: 2500, rmonthly: 1000, facilFee: 1000, facilN: 4,
    ec: 99, alloc: 1256.25, training: 35,
    socialPM: 25, holiday: 125, food: 500, video: 3500
  };

  var inputs = {};
  document.querySelectorAll('.inputs input[data-bkey]').forEach(function (el) { inputs[el.getAttribute('data-bkey')] = el; });
  if (!Object.keys(inputs).length) return;

  function readParams() {
    var p = {};
    var q = new URLSearchParams(location.search);
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = q.get('b_' + k);
      p[k] = (v !== null && v !== '' && !isNaN(Number(v))) ? Number(v) : DEFAULTS[k];
    });
    return p;
  }
  function setInputs(p) { Object.keys(inputs).forEach(function (k) { inputs[k].value = p[k]; }); }
  function getInputs() {
    var p = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = inputs[k] ? Number(inputs[k].value) : DEFAULTS[k];
      p[k] = isNaN(v) ? DEFAULTS[k] : v;
    });
    return p;
  }
  function writeUrl(p) {
    var q = new URLSearchParams(location.search);
    Object.keys(DEFAULTS).forEach(function (k) {
      if (p[k] !== DEFAULTS[k]) q.set('b_' + k, String(p[k])); else q.delete('b_' + k);
    });
    var s = q.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  /* Her formulas, cell for cell. Year-2 socials deliberately price off the year-1 member
     count (her B20 = 25 * C7 feeds both years), and the year-2 recruitment event is one
     $500 event (her sheet shows $1 there with the fee and count cells transposed). */
  function run(p) {
    var new1 = p.grads1 * p.join / 100;
    var new2 = p.grads2 * p.join / 100;
    var ong2 = new1 * (p.ret / 100) * (1 - p.toeo / 100);
    var m1 = new1, m2 = new2 + ong2;
    var socialMonthly = p.socialPM * new1;

    function lines(y) {
      var m = y === 1 ? m1 : m2;
      return [
        { l: 'Rainey Cronin, project set up', f: p.setup, n: y === 1 ? 1 : 0, note: 'Initial Project Set Up' },
        { l: 'Rainey Cronin, monthly retainer', f: p.rmonthly, n: y === 1 ? 11 : 12, note: 'Add to her retainer to oversee the program' },
        { l: 'Recruitment food', f: p.food, n: 1, note: 'Assumes event to invite past Catalyst Participants to learn about program' },
        { l: 'EC Membership, CoWork+', f: p.ec, n: m, note: '' },
        { l: 'Facilitation fees', f: p.facilFee, n: p.facilN, note: 'Assumes quarterly facilitated programming' },
        { l: 'Recruitment video', f: p.video, n: y === 1 ? 1 : 0, note: 'Every other year' },
        { l: 'Socials', f: socialMonthly, n: 12, note: 'Monthly Happy Hour & Snacks at EO House' },
        { l: 'Holiday party', f: p.holiday, n: m * 2, note: 'Assumes joining with Catalyst' },
        { l: 'Social & learning allocation', f: p.alloc, n: m, note: 'From her Learning & Social Events tab' },
        { l: 'Training content/materials', f: p.training, n: m, note: 'Increased to include 15 EO Members' }
      ];
    }
    var rev = [
      { l: 'New members', f: p.fee, n1: new1, n2: new2, note: 'Assumes 50% of Catalyst Graduates' },
      { l: 'Ongoing members', f: p.fee, n1: 0, n2: ong2, note: 'Assumes 90% retention and 50% conversion to EO' }
    ];
    var e1 = lines(1), e2 = lines(2);
    var amt = function (x) { return x.f * x.n; };
    var rev1 = rev.reduce(function (a, x) { return a + x.f * x.n1; }, 0);
    var rev2 = rev.reduce(function (a, x) { return a + x.f * x.n2; }, 0);
    var exp1 = e1.reduce(function (a, x) { return a + amt(x); }, 0);
    var exp2 = e2.reduce(function (a, x) { return a + amt(x); }, 0);
    return {
      rev: rev, e1: e1, e2: e2, m1: m1, m2: m2,
      rev1: rev1, rev2: rev2, exp1: exp1, exp2: exp2,
      net1: rev1 - exp1, net2: rev2 - exp2,
      margin1: rev1 > 0 ? (rev1 - exp1) / rev1 : null,
      margin2: rev2 > 0 ? (rev2 - exp2) / rev2 : null
    };
  }

  function money(n) {
    var neg = n < 0; var a = Math.abs(n);
    var s = (Math.round(a * 100) % 100 !== 0)
      ? '$' + a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '$' + Math.round(a).toLocaleString('en-US');
    return neg ? '-' + s : s;
  }
  function people(n) {
    return (Math.round(n * 10) % 10 === 0) ? String(Math.round(n)) : n.toFixed(1);
  }
  function pct(x) { return x === null ? 'n/a' : (x * 100).toFixed(1) + '%'; }

  function renderStats(r) {
    var html = '';
    html += '<div class="stat"><div class="v">' + people(r.m1) + '</div><div class="l">Members, year 1</div></div>';
    html += '<div class="stat"><div class="v">' + people(r.m2) + '</div><div class="l">Members, year 2 (new plus ongoing)</div></div>';
    html += '<div class="stat ' + (r.net1 < 0 ? 'neg' : 'pos') + '"><div class="v">' + money(r.net1) + '</div><div class="l">Net, year 1 (' + pct(r.margin1) + ' margin)</div></div>';
    html += '<div class="stat ' + (r.net2 < 0 ? 'neg' : 'pos') + '"><div class="v">' + money(r.net2) + '</div><div class="l">Net, year 2 (' + pct(r.margin2) + ' margin)</div></div>';
    document.getElementById('b-stats').innerHTML = html;
  }

  function renderTable(r) {
    var head = '<thead><tr><th>Line</th><th class="n">Fee</th><th class="n">Yr 1 count</th><th class="n">Yr 1 amount</th><th class="n">Yr 2 count</th><th class="n">Yr 2 amount</th><th>Her note</th></tr></thead>';
    var body = '<tbody>';
    body += '<tr><th colspan="7">Revenue</th></tr>';
    r.rev.forEach(function (x) {
      body += '<tr class="sub"><td>' + x.l + '</td><td class="n">' + money(x.f) + '</td><td class="n">' + people(x.n1) + '</td><td class="n">' + money(x.f * x.n1) +
        '</td><td class="n">' + people(x.n2) + '</td><td class="n">' + money(x.f * x.n2) + '</td><td>' + x.note + '</td></tr>';
    });
    body += '<tr class="total"><td>Total revenue</td><td class="n"></td><td class="n"></td><td class="n">' + money(r.rev1) + '</td><td class="n"></td><td class="n">' + money(r.rev2) + '</td><td></td></tr>';
    body += '<tr><th colspan="7">Expense</th></tr>';
    r.e1.forEach(function (x, i) {
      var y2 = r.e2[i];
      body += '<tr class="sub"><td>' + x.l + '</td><td class="n">' + money(x.f) + '</td><td class="n">' + people(x.n) + '</td><td class="n">' + money(x.f * x.n) +
        '</td><td class="n">' + people(y2.n) + '</td><td class="n">' + money(y2.f * y2.n) + '</td><td>' + x.note + '</td></tr>';
    });
    body += '<tr class="total"><td>Total expense</td><td class="n"></td><td class="n"></td><td class="n">' + money(r.exp1) + '</td><td class="n"></td><td class="n">' + money(r.exp2) + '</td><td></td></tr>';
    body += '<tr><th colspan="7">Result</th></tr>';
    body += '<tr class="total"><td>Net</td><td class="n"></td><td class="n"></td><td class="n ' + (r.net1 < 0 ? 'neg' : 'pos') + '">' + money(r.net1) +
      '</td><td class="n"></td><td class="n ' + (r.net2 < 0 ? 'neg' : 'pos') + '">' + money(r.net2) + '</td><td></td></tr>';
    body += '<tr class="sub"><td>Estimated profit margin</td><td class="n"></td><td class="n"></td><td class="n">' + pct(r.margin1) + '</td><td class="n"></td><td class="n">' + pct(r.margin2) + '</td><td></td></tr>';
    body += '</tbody>';
    document.getElementById('b-table').innerHTML = head + body;
  }

  function summaryText(r, p) {
    return "Brittany's budget, my version: fee " + money(p.fee) + ', ' + p.grads1 + '/' + p.grads2 + ' graduates, ' + p.join + '% join, ' +
      p.ret + '% retention, ' + p.toeo + '% convert to EO, allocation ' + money(p.alloc) + ' per member. Result: year 1 net ' + money(r.net1) +
      ' (' + pct(r.margin1) + '), year 2 net ' + money(r.net2) + ' (' + pct(r.margin2) + ').\nLink: ' + location.href;
  }

  var current;
  function recalc() {
    var p = getInputs();
    writeUrl(p);
    var r = run(p);
    current = { p: p, r: r };
    renderStats(r);
    renderTable(r);
  }

  Object.keys(inputs).forEach(function (k) {
    inputs[k].addEventListener('input', recalc);
    inputs[k].addEventListener('change', recalc);
  });
  document.getElementById('b-reset').addEventListener('click', function () { setInputs(Object.assign({}, DEFAULTS)); recalc(); });
  document.getElementById('b-copyLink').addEventListener('click', function () {
    var btn = this;
    navigator.clipboard.writeText(location.href.split('#')[0] + '#brittany').then(function () {
      var o = btn.textContent; btn.textContent = 'Link copied'; setTimeout(function () { btn.textContent = o; }, 1800);
    }).catch(function () { btn.textContent = 'Copy the address bar'; });
  });
  document.getElementById('b-send').addEventListener('click', function () {
    var msg = document.querySelector('#fb-form [name="message"]');
    if (!msg || !current) return;
    msg.value = (msg.value ? msg.value + '\n\n' : '') + summaryText(current.r, current.p) + '\n\nMy take: ';
    document.getElementById('feedback').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { msg.focus(); msg.setSelectionRange(msg.value.length, msg.value.length); }, 500);
  });

  setInputs(readParams());
  recalc();
})();
