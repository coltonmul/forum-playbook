/* Catalyst Collective sandbox: the financial model. VERSION 2.1.0 (2026-10-08; writeUrl now preserves the b_ parameters of Brittany's budget lower on the page)
   2.0.0 (2026-10-07; moved to forumplaybook.com, unchanged math, EO pill label 12px for the legibility floor)
   Pure browser JavaScript, no libraries. Inputs live in the URL so a scenario can be
   shared by link. Defaults are Colton's September 17 assumptions; "guess" lines are
   Calvin's placeholders and are labeled that way in the page. */
(function () {
  'use strict';

  var DEFAULTS = {
    intake: 40, grads: 25, capture: 75, recruited: 10, firstYear: 1,
    fastEO: 5, eoRate: 10, retention: 80, years: 5,
    dues: 3000, otherRev: 0,
    staff: 75000, software: 2400, marketing: 3000, training: 1500, committee: 1000, ecCost: 0,
    learn: 12, learnAtt: 25, learnFB: 15, speaker: 0,
    social: 6, socialAtt: 30, socialFB: 45,
    atHouse: 80, venue: 600, av: 75, contingency: 10
  };
  var PRESETS = {
    base: {},
    slide: { capture: 50, dues: 2500 },
    elevate: { dues: 1750, capture: 50 },
    lean: { staff: 20000, software: 1200, marketing: 1500, training: 750, committee: 500, social: 4, learnFB: 10, socialFB: 35, contingency: 5 },
    ambitious: { capture: 85, dues: 3000, social: 12, learn: 12, recruited: 15, fastEO: 6, retention: 85, otherRev: 10000 }
  };
  var EO_DUES = 5380, EO_INIT = 6000;

  var inputs = {};
  document.querySelectorAll('.inputs input[data-key]').forEach(function (el) { inputs[el.getAttribute('data-key')] = el; });

  function readParams() {
    var p = {};
    var q = new URLSearchParams(location.search);
    Object.keys(DEFAULTS).forEach(function (k) {
      var v = q.get(k);
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
    p.years = Math.max(2, Math.min(10, Math.round(p.years)));
    return p;
  }
  function writeUrl(p) {
    var q = new URLSearchParams(location.search);
    Object.keys(DEFAULTS).forEach(function (k) { if (p[k] !== DEFAULTS[k]) q.set(k, String(p[k])); else q.delete(k); });
    var s = q.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  function run(p) {
    var rows = [];
    var carried = 0;
    var cumNet = 0, cumEO = 0;
    var perEvent = {
      learn: p.learnAtt * p.learnFB + p.speaker + p.av,
      social: p.socialAtt * p.socialFB + p.av
    };
    var venueEvents = (p.learn + p.social) * (1 - p.atHouse / 100);
    for (var y = 1; y <= p.years; y++) {
      var newCohort = (y === 1 && !p.firstYear) ? 0 : Math.round(p.grads * p.capture / 100);
      var recruited = (y === 1) ? p.recruited : 0;
      var start = carried + recruited + newCohort;
      var toEOnew = Math.min(newCohort, p.fastEO);
      var toEOold = Math.round(carried * p.eoRate / 100);
      var toEO = toEOnew + toEOold;
      var remaining = start - toEO;
      var attrition = Math.round(remaining * (1 - p.retention / 100));
      var end = remaining - attrition;
      var revenue = start * p.dues + p.otherRev;
      var events = p.learn * perEvent.learn + p.social * perEvent.social + venueEvents * p.venue;
      var fixed = p.staff + p.software + p.marketing + p.training + p.committee;
      var perMember = start * p.ecCost;
      var subtotal = fixed + perMember + events;
      var contingency = subtotal * p.contingency / 100;
      var cost = subtotal + contingency;
      var net = revenue - cost;
      cumNet += net; cumEO += toEO;
      rows.push({
        year: y, carried: carried, recruited: recruited, newCohort: newCohort, start: start,
        toEO: toEO, attrition: attrition, end: end, revenue: revenue, dues: start * p.dues, otherRev: p.otherRev,
        staff: p.staff, fixed: fixed - p.staff, perMember: perMember, events: events, contingency: contingency,
        cost: cost, net: net, cumNet: cumNet, cumEO: cumEO
      });
      carried = end;
    }
    var margin = p.dues - p.ecCost;
    var fixedAll = (p.staff + p.software + p.marketing + p.training + p.committee) * (1 + p.contingency / 100);
    var breakEven = margin > 0 ? Math.ceil(fixedAll / margin) : null;
    return { rows: rows, breakEven: breakEven };
  }

  function money(n) {
    var neg = n < 0; n = Math.round(Math.abs(n));
    var s = '$' + n.toLocaleString('en-US');
    return neg ? '-' + s : s;
  }
  function moneyK(n) {
    var neg = n < 0; var a = Math.abs(n);
    var s = a >= 1000 ? '$' + Math.round(a / 1000) + 'k' : '$' + Math.round(a);
    return neg ? '-' + s : s;
  }
  function esc(s) { return window.ccEscape ? window.ccEscape(s) : String(s); }

  function renderStats(res, p) {
    var r = res.rows, first = r[0], last = r[r.length - 1];
    var html = '';
    html += '<div class="stat"><div class="v">' + first.start + '</div><div class="l">Members in year 1</div></div>';
    html += '<div class="stat"><div class="v">' + last.end + '</div><div class="l">Members at the end of year ' + last.year + '</div></div>';
    html += '<div class="stat"><div class="v">' + last.cumEO + '</div><div class="l">Graduated into EO over ' + p.years + ' years</div></div>';
    html += '<div class="stat ' + (first.net < 0 ? 'neg' : 'pos') + '"><div class="v">' + moneyK(first.net) + '</div><div class="l">Net, year 1</div></div>';
    html += '<div class="stat ' + (last.net < 0 ? 'neg' : 'pos') + '"><div class="v">' + moneyK(last.net) + '</div><div class="l">Net, year ' + last.year + '</div></div>';
    html += '<div class="stat ' + (last.cumNet < 0 ? 'neg' : 'pos') + '"><div class="v">' + moneyK(last.cumNet) + '</div><div class="l">Cumulative net over ' + p.years + ' years</div></div>';
    html += '<div class="stat"><div class="v">' + (res.breakEven === null ? 'n/a' : res.breakEven) + '</div><div class="l">Members to cover fixed costs</div></div>';
    html += '<div class="stat"><div class="v">' + moneyK(last.cumEO * (EO_DUES + EO_INIT)) + '</div><div class="l">EO impact: first-year dues plus initiation those graduates represent, informational</div></div>';
    document.getElementById('stats').innerHTML = html;
  }

  function renderTable(res, p) {
    var r = res.rows;
    var head = '<thead><tr><th>Line</th>' + r.map(function (x) { return '<th class="n">Year ' + x.year + '</th>'; }).join('') + '</tr></thead>';
    function row(label, key, fmt, cls) {
      return '<tr class="' + (cls || '') + '"><td>' + label + '</td>' + r.map(function (x) {
        var v = x[key]; var c = 'n';
        if (cls === 'total' || key === 'net' || key === 'cumNet') c += v < 0 ? ' neg' : (v > 0 ? ' pos' : '');
        return '<td class="' + c + '">' + fmt(v) + '</td>';
      }).join('') + '</tr>';
    }
    var num = function (v) { return String(v); };
    var body = '<tbody>';
    body += '<tr><th colspan="' + (r.length + 1) + '">People</th></tr>';
    body += row('Carried over from last year', 'carried', num, 'sub');
    body += row('Recruited past graduates', 'recruited', num, 'sub');
    body += row('New from the graduating class', 'newCohort', num, 'sub');
    body += row('Members during the year (paying)', 'start', num, 'total');
    body += row('Graduated into EO', 'toEO', num, 'sub');
    body += row('Left the Collective', 'attrition', num, 'sub');
    body += row('Members at year end', 'end', num, 'total');
    body += '<tr><th colspan="' + (r.length + 1) + '">Revenue</th></tr>';
    body += row('Dues', 'dues', money, 'sub');
    body += row('Other revenue', 'otherRev', money, 'sub');
    body += row('Total revenue', 'revenue', money, 'total');
    body += '<tr><th colspan="' + (r.length + 1) + '">Costs</th></tr>';
    body += row('Dedicated resource', 'staff', money, 'sub');
    body += row('Software, marketing, training, committee', 'fixed', money, 'sub');
    body += row('EC bundle (per member)', 'perMember', money, 'sub');
    body += row('Events (food, beverage, speakers, AV, venues)', 'events', money, 'sub');
    body += row('Contingency', 'contingency', money, 'sub');
    body += row('Total cost', 'cost', money, 'total');
    body += '<tr><th colspan="' + (r.length + 1) + '">Result</th></tr>';
    body += row('Net for the year', 'net', money, 'total');
    body += row('Cumulative net', 'cumNet', money, 'sub');
    body += row('Cumulative graduates into EO', 'cumEO', num, 'sub');
    body += '</tbody>';
    document.getElementById('proforma').innerHTML = head + body;
  }

  function axisMax(v) {
    if (v <= 0) return 10;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / mag;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * mag;
  }

  function renderMembersChart(res) {
    var r = res.rows;
    var W = 760, H = 320, L = 48, R = 12, T = 16, B = 40;
    var maxV = axisMax(Math.max.apply(null, r.map(function (x) { return x.start; })) * 1.15);
    var cw = (W - L - R) / r.length;
    var bw = Math.min(70, cw * 0.55);
    var y = function (v) { return T + (H - T - B) * (1 - v / maxV); };
    var s = '';
    for (var g = 0; g <= 4; g++) {
      var gv = maxV * g / 4;
      s += '<line x1="' + L + '" y1="' + y(gv) + '" x2="' + (W - R) + '" y2="' + y(gv) + '" stroke="var(--rule)" stroke-width="1"/>';
      s += '<text x="' + (L - 8) + '" y="' + (y(gv) + 4) + '" text-anchor="end" font-size="12" fill="var(--muted)">' + Math.round(gv) + '</text>';
    }
    r.forEach(function (x, i) {
      var cx = L + cw * i + cw / 2;
      var x0 = cx - bw / 2;
      var base = y(0);
      var segs = [[x.carried, 'var(--chart-1)'], [x.newCohort, 'var(--chart-2)'], [x.recruited, 'var(--chart-3)']];
      var acc = 0;
      segs.forEach(function (sg) {
        if (sg[0] <= 0) return;
        var top = y(acc + sg[0]);
        var bottom = y(acc);
        s += '<rect x="' + x0 + '" y="' + top + '" width="' + bw + '" height="' + Math.max(0, bottom - top) + '" fill="' + sg[1] + '" rx="2"><title>Year ' + x.year + ': ' + sg[0] + '</title></rect>';
        acc += sg[0];
      });
      s += '<text x="' + cx + '" y="' + (y(acc) - 6) + '" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">' + x.start + '</text>';
      // graduated to EO marker: a small pill beside the bar
      if (x.toEO > 0) {
        s += '<rect x="' + (x0 + bw + 6) + '" y="' + (base - 22) + '" width="34" height="18" rx="9" fill="var(--chart-4)"/>';
        s += '<text x="' + (x0 + bw + 23) + '" y="' + (base - 9) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--chart-4-ink)">' + x.toEO + '</text>';
      }
      s += '<text x="' + cx + '" y="' + (H - 14) + '" text-anchor="middle" font-size="13" fill="var(--muted)">Year ' + x.year + '</text>';
    });
    document.getElementById('chartMembers').innerHTML = s;
  }

  function renderMoneyChart(res) {
    var r = res.rows;
    var W = 760, H = 320, L = 60, R = 12, T = 16, B = 40;
    var vals = [];
    r.forEach(function (x) { vals.push(x.revenue, x.cost, x.net); });
    var maxV = axisMax(Math.max.apply(null, vals) * 1.15);
    var minV = Math.min(0, Math.min.apply(null, vals) * 1.15);
    minV = -axisMax(-minV);
    if (minV === -10) minV = 0;
    var cw = (W - L - R) / r.length;
    var bw = Math.min(34, cw * 0.28);
    var y = function (v) { return T + (H - T - B) * (1 - (v - minV) / (maxV - minV)); };
    var s = '';
    var steps = 4;
    for (var g = 0; g <= steps; g++) {
      var gv = minV + (maxV - minV) * g / steps;
      s += '<line x1="' + L + '" y1="' + y(gv) + '" x2="' + (W - R) + '" y2="' + y(gv) + '" stroke="var(--rule)" stroke-width="1"/>';
      s += '<text x="' + (L - 8) + '" y="' + (y(gv) + 4) + '" text-anchor="end" font-size="12" fill="var(--muted)">' + moneyK(gv) + '</text>';
    }
    s += '<line x1="' + L + '" y1="' + y(0) + '" x2="' + (W - R) + '" y2="' + y(0) + '" stroke="var(--muted)" stroke-width="1.5"/>';
    var pts = [];
    r.forEach(function (x, i) {
      var cx = L + cw * i + cw / 2;
      var bars = [[x.revenue, 'var(--chart-2)', cx - bw - 2], [x.cost, 'var(--chart-4)', cx + 2]];
      bars.forEach(function (b) {
        var top = y(Math.max(0, b[0])), bot = y(Math.min(0, b[0]));
        s += '<rect x="' + b[2] + '" y="' + top + '" width="' + bw + '" height="' + Math.max(1, bot - top) + '" fill="' + b[1] + '" rx="2"><title>Year ' + x.year + ': ' + money(b[0]) + '</title></rect>';
      });
      pts.push([cx, y(x.net)]);
      s += '<text x="' + cx + '" y="' + (H - 14) + '" text-anchor="middle" font-size="13" fill="var(--muted)">Year ' + x.year + '</text>';
    });
    s += '<polyline fill="none" stroke="var(--chart-1)" stroke-width="3" stroke-linejoin="round" points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/>';
    pts.forEach(function (p, i) {
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="var(--chart-1)" stroke="var(--bg)" stroke-width="2"/>';
      s += '<text x="' + p[0] + '" y="' + (p[1] - 10) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink)">' + moneyK(r[i].net) + '</text>';
    });
    document.getElementById('chartMoney').innerHTML = s;
  }

  function summaryText(res, p) {
    var r = res.rows, last = r[r.length - 1];
    return 'Scenario: ' + p.intake + ' Catalyst members, ' + p.grads + ' graduates, ' + p.capture + '% accept, ' + p.recruited + ' recruited in year 1, ' +
      p.fastEO + ' to EO in year one per class, ' + p.eoRate + '% to EO yearly, ' + p.retention + '% retention, dues ' + money(p.dues) +
      ', dedicated resource ' + money(p.staff) + '. Result: ' + r[0].start + ' members in year 1, ' + last.end + ' at the end of year ' + last.year +
      ', ' + last.cumEO + ' graduated into EO, net year 1 ' + money(r[0].net) + ', net year ' + last.year + ' ' + money(last.net) +
      ', cumulative ' + money(last.cumNet) + '.\nLink: ' + location.href;
  }

  var current;
  function recalc() {
    var p = getInputs();
    writeUrl(p);
    var res = run(p);
    current = { p: p, res: res };
    renderStats(res, p);
    renderMembersChart(res);
    renderMoneyChart(res);
    renderTable(res, p);
  }

  Object.keys(inputs).forEach(function (k) {
    inputs[k].addEventListener('input', recalc);
    inputs[k].addEventListener('change', recalc);
  });
  document.querySelectorAll('#presets [data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = Object.assign({}, DEFAULTS, PRESETS[b.getAttribute('data-preset')] || {});
      setInputs(p); recalc();
    });
  });
  document.getElementById('copyLink').addEventListener('click', function () {
    var btn = this;
    navigator.clipboard.writeText(location.href).then(function () {
      var o = btn.textContent; btn.textContent = 'Link copied'; setTimeout(function () { btn.textContent = o; }, 1800);
    }).catch(function () { btn.textContent = 'Copy the address bar'; });
  });
  document.getElementById('sendScenario').addEventListener('click', function () {
    var msg = document.querySelector('#fb-form [name="message"]');
    if (!msg || !current) return;
    var text = summaryText(current.res, current.p);
    msg.value = (msg.value ? msg.value + '\n\n' : '') + text + '\n\nMy take: ';
    document.getElementById('feedback').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { msg.focus(); msg.setSelectionRange(msg.value.length, msg.value.length); }, 500);
  });

  setInputs(readParams());
  recalc();
})();
