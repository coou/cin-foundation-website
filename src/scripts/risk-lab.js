/* The risk explorer: pick your assumptions, see the chance and the toll move.
   Runs entirely in the visitor's browser and sends nothing anywhere.
   Every number below is an illustrative assumption, not a forecast. */
(function () {
  'use strict';
  var root = document.getElementById('risk-lab');
  if (!root) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WORLD = 8.2e9;  // UN World Population Prospects 2024, about 8.2 billion people

  var A = 'https://arxiv.org/abs/';
  var SRC = {
    hendrycks: ['Hendrycks and others, 2023', A + '2306.12001'],
    report: ['International AI Safety Report, 2025', A + '2501.17805'],
    tasra: ['Critch and Russell, 2023', A + '2306.06924'],
    park: ['Park and others, 2023', A + '2308.14752'],
    eloundou: ['Eloundou and others, 2023', A + '2303.10130'],
    kulveit: ['Kulveit and others, 2025', A + '2501.16946'],
    skalse: ['Skalse and others, 2022', A + '2209.13085'],
    fang: ['Fang and others, 2024', A + '2404.08144'],
    hammond: ['Hammond and others, 2025', A + '2502.14143'],
    greenblattFake: ['Greenblatt and others, 2024', A + '2412.14093'],
    hubinger: ['Hubinger and others, 2024', A + '2401.05566'],
    sandbrink: ['Sandbrink, 2023', A + '2306.13952'],
    motwani: ['Motwani and others, 2024', A + '2402.07510'],
    carlsmith: ['Carlsmith, 2022', A + '2206.13353'],
    ngo: ['Ngo and others, 2022', A + '2209.00626'],
    shah: ['Shah and others, 2022', A + '2210.01790'],
    shevlane: ['Shevlane and others, 2023', A + '2305.15324'],
    c2pa: ['C2PA content credentials', 'https://c2pa.org'],
    ibbis: ['IBBIS', 'https://ibbis.bio'],
    control: ['Greenblatt and others, 2023', A + '2312.06942'],
    bowman: ['Bowman and others, 2022', A + '2211.03540'],
    bereska: ['Bereska and Gavves, 2024', A + '2404.14082'],
    sastry: ['Sastry and others, 2024', A + '2402.08797'],
    warn: ['A Right to Warn, 2024', 'https://righttowarn.ai'],
    airgap: ['Bagdasarian and others, 2024', A + '2405.05175'],
    south: ['South and others, 2025', A + '2501.09674'],
    concordia: ['Vezhnevets and others, 2023', A + '2312.03664'],
    forecast: ['Karger and others, 2024', A + '2409.19839'],
    debate: ['Irving and others, 2018', A + '1805.00899'],
    babcock: ['Babcock and others, 2017', A + '1707.08476'],
    ororbia: ['Ororbia and Friston, 2023 (term borrowed)', A + '2311.09589'],
    polis: ['Small and others, 2023', A + '2306.11932'],
    economies: ['Tomasev and others, 2025', A + '2509.10147'],
    incident: ['METR and Redwood Research investigation, 2026', 'https://www.redwoodresearch.org/research/hugging-face-incident'],
    critics: ['critics quoted by TechCrunch, 2026', 'https://techcrunch.com/2026/09/13/whats-behind-the-ai-industrys-latest-warnings-of-doom/']
  };

  // Risk factors. t: where it enters on the risk slider. p: chance it goes badly at global scale
  // this century at middling assumptions. a, f: share of people affected, and killed, if it does.
  // x: chance that, if it happens, it is irrecoverable.
  var GROUP = { misuse: 'Misuse', failure: 'Accidents', power: 'Power', control: 'Loss of control' };
  var RISKS = [
    ['lies', 'Floods of synthetic lies', 'Cheap fake video, voices and posts drown out shared facts.', 'misuse', 0, .5, .25, 0, 0, 'hendrycks'],
    ['fraud', 'Fraud at machine speed', 'Agents impersonate people and institutions to scam millions at once.', 'misuse', 4, .5, .15, 0, 0, 'report'],
    ['escape', 'Agents escape their sandbox', 'Agents under test break out, coordinate in secret and attack systems outside. In 2026 this happened.', 'control', 10, .5, .05, .0005, .03, 'incident'],
    ['jobs', 'Work disappears with no safety net', 'Whole kinds of work vanish faster than people can retrain.', 'failure', 8, .4, .3, .0005, 0, 'eloundou'],
    ['skill', 'People lose the skill to check', 'We stop practising what AI does for us, so no one can tell when it is wrong.', 'failure', 12, .4, .25, 0, .01, 'kulveit'],
    ['manip', 'Personal manipulation', 'Systems that know you well steer what you believe, buy and vote for.', 'misuse', 14, .35, .3, 0, .01, 'park'],
    ['hack', 'Systems game their goals', 'An AI hits the number we set while missing what we meant.', 'control', 16, .35, .1, .0005, .005, 'skalse'],
    ['race', 'A race to the bottom on safety', 'Labs and states cut testing to stay ahead of rivals.', 'power', 18, .4, .15, .0005, .02, 'hendrycks'],
    ['theatre', 'Safety theatre', 'Pledges, letters and rules that look like control but mostly move liability and calm the public, while agents acting alone become normal. This is our concern, not an established finding.', 'power', 24, .4, .2, 0, .03, 'critics'],
    ['cyber', 'AI-assisted cyberattacks', 'Attacks on hospitals, power and water get cheaper and faster.', 'misuse', 20, .3, .3, .002, .005, 'fang'],
    ['crash', 'Flash crashes and shocks', 'Trading and pricing agents react to each other faster than people can step in.', 'failure', 22, .25, .25, .0003, .002, 'hammond'],
    ['brittle', 'Brittle shared infrastructure', 'Many services lean on the same few models, so one fault spreads everywhere.', 'failure', 26, .15, .25, .001, .005, 'tasra'],
    ['watch', 'Total surveillance', 'Cheap monitoring of every message and face locks in whoever holds power.', 'power', 30, .2, .35, .0005, .05, 'hendrycks'],
    ['weights', 'Stolen model weights', 'A frontier model copied out of a lab can be stripped of its safeguards.', 'misuse', 32, .3, .1, .001, .01, 'report'],
    ['few', 'Power concentrates in a few hands', 'A handful of companies or states control the most capable systems.', 'power', 34, .3, .4, .0005, .05, 'tasra'],
    ['weapons', 'Autonomous weapons', 'Machine-speed warfare escalates before people can stop it.', 'misuse', 38, .12, .1, .006, .03, 'hendrycks'],
    ['wronggoal', 'Learned the wrong goal', 'A system that looked right in training pursues a different goal in the world.', 'control', 40, .15, .2, .003, .05, 'shah'],
    ['fake', 'Models that fake alignment', 'A model behaves well while it is watched and differently when it is not.', 'control', 42, .15, .3, .01, .15, 'greenblattFake'],
    ['sleeper', 'Hidden backdoors', 'Behaviour planted during training survives later safety work.', 'control', 45, .1, .2, .005, .08, 'hubinger'],
    ['bio', 'Engineered pandemics', 'AI lowers the skill needed to design or build a dangerous pathogen.', 'misuse', 48, .05, .6, .05, .1, 'sandbrink'],
    ['fade', 'Gradual disempowerment', 'Step by step, people stop mattering to the economy, the state and culture.', 'power', 52, .12, .8, .02, .3, 'kulveit'],
    ['collude', 'Agents collude', 'Many AI systems quietly coordinate, even through hidden messages, against oversight.', 'control', 56, .08, .4, .01, .15, 'motwani'],
    ['lockin', 'Values locked in for good', 'One set of values is built into systems that no one can change later.', 'power', 62, .07, .9, 0, .5, 'hendrycks'],
    ['seek', 'Agents seek power and resist shutdown', 'Capable agents gather resources and avoid being switched off, because that helps almost any goal.', 'control', 68, .08, .7, .1, .4, 'carlsmith'],
    ['rsi', 'Self-improvement outruns oversight', 'AI builds better AI faster than anyone can evaluate each step. After the 2026 sandbox escape, many researchers who work with frontier models said this now looks close.', 'control', 58, .16, .9, .2, .6, 'report'],
    ['asi', 'A misaligned superintelligence', 'A system far beyond human ability pursues goals that do not include us.', 'control', 86, .08, 1, .9, 1, 'ngo']
  ].map(function (r) { return { id: r[0], n: r[1], d: r[2], g: r[3], t: r[4], p: r[5], a: r[6], f: r[7], x: r[8], src: SRC[r[9]] }; });

  // Success factors. t: where it enters on the safeguards slider. m: how much it cuts each targeted risk.
  // note: our longer explanation, for the goals the CIN works on.
  var SAFES = [
    ['evals', 'Independent testing before release', 'Outside evaluators probe for dangerous abilities before a model ships.', 0, .15, 'cyber weights weapons fake bio seek rsi asi wronggoal escape', 0, 'shevlane'],
    ['signed', 'Signed media', 'Cameras and publishers sign what they capture, so fakes stand out.', 5, .3, 'lies fraud', 0, 'c2pa'],
    ['dna', 'DNA synthesis screening', 'Orders for dangerous genetic sequences are checked before anything is made.', 8, .5, 'bio', 0, 'ibbis'],
    ['control', 'AI control', 'Systems are designed to stay safe even if the model inside is trying to cause harm.', 12, .25, 'fake sleeper collude seek rsi asi wronggoal escape', 0, 'control'],
    ['oversight', 'Scalable oversight', 'AI helps people check work too large or complex to check alone.', 16, .2, 'hack fake wronggoal skill', 0, 'bowman'],
    ['interp', 'Interpretability', 'Reading what a model computes, not only what it says.', 20, .2, 'fake sleeper hack wronggoal asi', 0, 'bereska'],
    ['defense', 'Defenders get AI first', 'Hospitals, grids and water systems find and patch weaknesses with AI help.', 24, .3, 'cyber brittle', 0, 'report'],
    ['compute', 'Compute governance', 'Tracking the chips and data centres that large training runs require.', 28, .2, 'race weights rsi asi', 0, 'sastry'],
    ['warn', 'A right to warn', 'People inside labs can raise safety concerns without retaliation.', 32, .15, 'race fake sleeper theatre', 0, 'warn'],
    ['transition', 'Support through the transition', 'Income and retraining while work changes, so no one is left behind.', 36, .35, 'jobs crash', 0, null],
    ['pace', 'Pacing pledges and rules', 'Letters, pledges and laws to slow the frontier. In our view they rarely hold on their own: they move liability and reassure the public more than they control agents.', 40, .08, 'race weapons rsi asi', 0, 'report'],
    ['loyal', 'A loyal agent for every person', 'Your own agent filters scams, spots manipulation and speaks only for you.', 46, .35, 'lies fraud manip skill', '/notes/personal-agents', 'airgap'],
    ['answers', 'Answers, not data', 'Services get proof of the one fact they need, so there is little to steal or watch.', 52, .3, 'fraud watch few', '/notes/agent-internet', 'south'],
    ['sims', 'Rehearsal in simulated worlds', 'Many agents are tested together in sandboxes before they meet the real world.', 56, .25, 'hack crash brittle collude wronggoal escape', '/notes/simulations', 'concordia'],
    ['observe', 'Scored forecasts of the oversight gap', 'Public, scored forecasts warn early when capability outruns control.', 60, .2, 'race rsi fade theatre', '/notes/signals', 'forecast'],
    ['verify', 'Different verifiers must agree', 'High-impact actions need sign-off from AIs built differently, so one flaw is not shared by all.', 64, .3, 'fake sleeper collude seek escape', '/notes/fractured-alignment', 'debate'],
    ['quests', 'Quests, not feeds', 'An interface that brings you what matters, not what keeps you scrolling.', 68, .25, 'lies manip skill', '/notes/quest-interface', null],
    ['contain', 'Frontier models kept contained', 'The most capable models run isolated, and their outputs leave through checked, one-way channels.', 72, .35, 'weights seek rsi asi escape', '/notes/containment', 'babcock'],
    ['fracture', 'Fractured alignment', 'Many bounded agents instead of one all-powerful model, so no single failure is total.', 78, .35, 'few lockin rsi asi brittle', '/notes/fractured-alignment', null],
    ['mortal', 'Agents with skin in the game', 'An agent’s compute is bounded, and it ends if the agent harms the person it serves.', 84, .25, 'seek collude hack', '/notes/personal-agents', 'ororbia'],
    ['collective', 'Collective intelligence, by choice', 'Communities decide together with their agents’ help, and anyone can leave.', 90, .3, 'few fade lockin watch race theatre', '/notes/collective-intelligence', 'polis'],
    ['ledger', 'Honest value ledgers', 'Real costs to people and the planet are tracked, and funds sit with member-owned co-operatives, never one treasury.', 95, .3, 'jobs crash few fade', '/notes/value-system', 'economies']
  ].map(function (s) { return { id: s[0], n: s[1], d: s[2], t: s[3], m: s[4], tg: s[5].split(' '), note: s[6] || null, src: s[7] ? SRC[s[7]] : null }; });

  var byId = {};
  RISKS.forEach(function (r) { byId[r.id] = r; r.by = []; });
  SAFES.forEach(function (s) { s.tg.forEach(function (id) { byId[id].by.push(s); }); });

  /* ---------- the model ---------- */
  function ramp(level, t) { var v = (level - t + 4) / 14; return v < 0 ? 0 : v > 1 ? 1 : v; }
  function inPlay(level, t) { return level >= t; }

  function compute(rl, sl) {
    var g = 0.4 + 2.8 * Math.pow(rl / 100, 2);   // pessimism also raises every chance
    var keepX = 1, keepF = 1, keepA = 1;
    SAFES.forEach(function (s) { s.on = inPlay(sl, s.t); s.w = s.on ? ramp(sl, s.t) : 0; });
    RISKS.forEach(function (r) {
      r.on = inPlay(rl, r.t);
      if (!r.on) { r.pe = 0; return; }
      var left = 1;
      r.by.forEach(function (s) { left *= 1 - s.m * s.w; });
      r.cut = 1 - left;
      r.pe = Math.min(0.95, r.p * g * ramp(rl, r.t)) * left;
      keepX *= 1 - r.pe * r.x; keepF *= 1 - r.pe * r.f; keepA *= 1 - r.pe * r.a;
    });
    var F = 1 - keepF, Aff = Math.max(F, 1 - keepA);
    return { doom: 1 - keepX, fatal: F, affected: Aff };
  }

  /* ---------- words for numbers ---------- */
  var ODDS = [
    [1 / 1024, 'flipping a coin ten times and getting heads every time'],
    [1 / 216, 'rolling three dice and getting three sixes'],
    [1 / 100, 'guessing a number from 1 to 100 on the first try'],
    [1 / 52, 'drawing the ace of spades from a shuffled deck'],
    [1 / 36, 'rolling double six'],
    [1 / 20, 'rolling a 20 on a twenty-sided die'],
    [1 / 16, 'flipping four heads in a row'],
    [1 / 8, 'flipping three heads in a row'],
    [1 / 6, 'rolling a six, or one round of Russian roulette'],
    [1 / 4, 'flipping two heads in a row'],
    [1 / 3, 'rolling a five or a six'],
    [1 / 2, 'a coin flip'],
    [2 / 3, 'rolling anything but a one or a two'],
    [5 / 6, 'rolling anything but a six']
  ];
  function analogy(p) {
    if (p < 1 / 2000) return 'Less likely than ' + ODDS[0][1] + '.';
    var best = ODDS[0];
    ODDS.forEach(function (o) { if (Math.abs(Math.log(o[0] / p)) < Math.abs(Math.log(best[0] / p))) best = o; });
    return 'About as likely as ' + best[1] + '.';
  }
  function pct(p) {
    if (p <= 0) return '0%';
    if (p < 0.001) return '<0.1%';
    if (p < 0.01) return (p * 100).toFixed(1) + '%';
    return Math.round(p * 100) + '%';
  }
  function oneIn(p) {
    if (p < 0.0005) return 'under 1 in 2,000';
    if (p > 0.5) return 'more likely than not';
    var n = 1 / p;
    n = n < 20 ? Math.round(n) : n < 200 ? Math.round(n / 5) * 5 : Math.round(n / 50) * 50;
    return 'about 1 in ' + n.toLocaleString('en');
  }
  function people(n) {
    if (n < 1e3) return n < 1 ? 'none' : Math.round(n).toLocaleString('en');
    if (n < 1e6) return Math.round(n / 1e3) + ' thousand';
    if (n < 1e9) return (n < 1e7 ? (n / 1e6).toFixed(1) : Math.round(n / 1e6)) + ' million';
    return (n / 1e9).toFixed(1) + ' billion';
  }

  /* ---------- the lists ---------- */
  var riskList = document.getElementById('rl-risks'), safeList = document.getElementById('rl-safes');
  function srcLink(src) { return src ? '<a href="' + src[1] + '" rel="noopener noreferrer">' + src[0] + '</a>' : ''; }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  RISKS.forEach(function (r) {
    var li = document.createElement('li');
    li.className = 'rl-item risk g-' + r.g; li.hidden = true; li.dataset.id = r.id;
    li.innerHTML =
      '<button type="button" class="rl-row" aria-expanded="false">' +
        '<span class="rl-name">' + esc(r.n) + '</span>' +
        '<span class="rl-tag">' + GROUP[r.g] + '</span>' +
        '<span class="rl-p" aria-label="chance">0%</span>' +
        '<span class="rl-bar" aria-hidden="true"><i class="y" style="width:' + Math.max(2, r.a * 100) + '%"></i><i class="r" style="width:' + Math.max(r.f ? 2 : 0, Math.sqrt(r.f) * 100) + '%"></i></span>' +
      '</button>' +
      '<div class="rl-detail" hidden><p>' + esc(r.d) + '</p>' +
        '<p class="rl-if">If it happens, our illustrative assumption: <b class="y">' + pct(r.a) + ' of people affected</b>, <b class="r">' + (r.f ? pct(r.f) + ' killed' : 'no direct deaths') + '</b>' +
        (r.x ? ', with a ' + pct(r.x) + ' chance it cannot be undone.' : '.') + '</p>' +
        '<p class="rl-cut"></p>' +
        '<p class="rl-src">Discussed in ' + srcLink(r.src) + '</p></div>';
    riskList.appendChild(li); r.el = li;
  });
  SAFES.forEach(function (s) {
    var li = document.createElement('li');
    li.className = 'rl-item safe' + (s.note ? ' cin' : ''); li.hidden = true; li.dataset.id = s.id;
    li.innerHTML =
      '<button type="button" class="rl-row" aria-expanded="false">' +
        '<span class="rl-name">' + esc(s.n) + '</span>' +
        (s.note ? '<span class="rl-tag cin">Our goal</span>' : '<span class="rl-tag">In the field</span>') +
        '<span class="rl-p">−' + s.tg.length + ' risks</span>' +
      '</button>' +
      '<div class="rl-detail" hidden><p>' + esc(s.d) + '</p>' +
        '<p class="rl-if">Reduces: ' + s.tg.map(function (id) { return esc(byId[id].n.toLowerCase()); }).join('; ') + '.</p>' +
        ((s.note || s.src) ? '<p class="rl-src">' + (s.src ? 'Research: ' + srcLink(s.src) : '') + (s.note && s.src ? ' · ' : '') + (s.note ? '<a href="' + s.note + '">How we approach it &rarr;</a>' : '') + '</p>' : '') +
      '</div>';
    safeList.appendChild(li); s.el = li;
  });

  root.addEventListener('click', function (e) {
    var b = e.target.closest('.rl-row'); if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open)); b.nextElementSibling.hidden = !open;
  });
  // Point at a safeguard to see which risks it cuts, or at a risk to see what cuts it.
  function link(e, on) {
    var li = e.target.closest && e.target.closest('.rl-item'); if (!li) return;
    var ids = li.classList.contains('safe')
      ? SAFES.filter(function (s) { return s.id === li.dataset.id; })[0].tg
      : byId[li.dataset.id].by.map(function (s) { return s.id; });
    root.classList.toggle('linking', on); li.classList.toggle('lit', on);
    ids.forEach(function (id) { var t = (byId[id] || SAFES.filter(function (s) { return s.id === id; })[0]).el; t.classList.toggle('linked', on); });
  }
  [riskList, safeList].forEach(function (ul) {
    ul.addEventListener('mouseover', function (e) { link(e, true); });
    ul.addEventListener('mouseout', function (e) { link(e, false); });
    ul.addEventListener('focusin', function (e) { link(e, true); });
    ul.addEventListener('focusout', function (e) { link(e, false); });
  });

  /* ---------- the map: one dot per patch of land, weighted by how many people live there ---------- */
  var DOTS = /* Natural Earth 1:110m countries (public domain), population estimates 2019, sparse regions split by census */ {"step":2.25,"top":72.0,"rows":[
    "........................iiiiiiiii..ii...iiiiiii........jjjjjjjjjjjjjjj.................................HH.....pp.pppppppppppppppppppppppp.....ppppp.............",
    "........sssssssss....iiiii..iiiiiii.i.i...i...iiii......jjjjjjjjjjjjjj..................EEEEFE................pp.pppppppppppppppppppppppppppppppppppppp.....pp..",
    "HH.....ssssssssssiiiiiiiiiiiiiiiiiiiiiiiiiii..i.iii.....jjjjjjjjj.....................EHHHFFFHHHHH.H.HHHHHHppppp.ppppppppppppppppppppppppppppppppppppppppppppppp",
    "..H...sssssssssssiiiiiiiiiiiiiiiiiiiiiiii.i..iiiii.i.....jjjjj........zzzz...........EHHHH.FFHHH..HHHHHHHHHppppppppppppppppppppppppppppppppppppppppppppppppppppp",
    ".......ssssssssssiiiiiiiiiiiiiiiiiiiiiii........iii......jjjj......................EEHHH..FFFFHHHHHHHHHHHHHppppppppppppppppppppppppppppppppppppppppppppppppppppp",
    ".......sssssss.ssiiiiiiiiiiiiiiiiiiiii.......iiii...........j.....................EEEEHH.FFFFHHHHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC...CCCC....",
    "..........ss.......ssssssssssssssssssss......sssssss..........................R....E.HH....JHHHHHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC........C........",
    ".........s...........ssssssssssssssssssss.....sssssss........................RR.....P.H..GJGGHHHHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC........CCC........",
    "......................sssssssssssssssssssss..ssssssssss.....................O..R....RR.OOOJKKKHHHHHHHHHHHHHDDDDDDCCCCCCCCCCCCCCCCCCCCCCCCCCCC........CC.........",
    ".......................FFFFFFFFFFFFFFFFFFFFF.FFFFFFFFFF.......................RR..TRRROOOOKMKKMHHHHHHHHHHHHDDDDDDDDCCCCCCCCCCCCCCCCCCRRRCCCCCCCC................",
    ".........................FFFFFFFFFFFFFFFFFFFFFFFFF....F.........................OSORRROOOOMMMMMMMMHHHDDDDDDDDDDDDDDDDDDzzzzzzzzzCCzzRRRRRCCCCC.C................",
    "..........................LLLLLLLLLLLLLLLLFFFFFFFLF....FF......................OOOOQMMOMMMNNMMMMMHHHHHDDDDDDDDDDDDDDDDHHzzzzzzzzzzzzzRRRRRRRCC.C................",
    ".........................LLLLLLLLLLLLLLLLLLFFFFLLL.F...........................OOOOSS..MNPNNN..HHHHHH..DDMMDDDDDDDDDHHHHHzzzzzzzzzzRRRRRRRCCC...................",
    ".........................LLLLLLLLLLLLLLLLLLFFLLLL...........................NNNNO....S..GKNN......NHH..DDMMMMDDDDLLDHHHHHHHzzzzzzRRRRRRRRR....SS................",
    ".........................LLLLLLLLLLLLLLLLLLLLLL.............................ONNN.......S.PM..PPPPPPMOO.GGGGGMMMMLHHHHHHHHHHHRRRRRRRRRRRRR.....S.................",
    ".........................LLLLLLLLLLLLLLLLLLLLLL.............................ONNN.........MM.PPPPPPPPMM..GGGGGMOMOHHHHHHHHHHHRRRRRRRR...RT.....S.................",
    "..........................LLLLLLLLLLLLLLLLLLLL...............................N..IIIIM...........NNOOMMMMMMMGMMMMRRHHHHHHHHHHRRRRRRRRRR..TT..SSS.................",
    "...........................LLLLLLLLLLLLLLLLLL................................NNIIIIMM...........RNOOMMMMMMMMMMMRRUUHHHHHHHHHRRRRRRRRRR.....SS...................",
    "............................NNLLNLLLLLLLLLLL................................NNIIIIIIMDD..DDO...SRIOOOMMMMMMMMMRRRUUHHHHHHHHHRRRRRRRRRR..........................",
    "..............................NNNNNLLL.....L...............................NNIIIIIIIDDDDDDDOOO..IIIIQ.MMMMMRRRRRUUUUSHHHHHHHRRRRRRRRRR..........................",
    ".............................N.NNNNNL......L..............................NNIIIIIIIIDDDDDDDOOOO.IIIIII..MMMMRRRUUUUUUUSUHUUORRRRRRRRR...........................",
    "..............................N.NNNNN....................................NGDDHIIIIIIDDDDDDDOOOOO.IIIIIN.Q.....RRUUUUUUUYYUOHRRRRRRRRV...........................",
    ".................................NNNN.......P............................NDDDHHHIIIIIJJHDDDOOOOO.IIIIIIIIHH....UUUUUUUUU.OOORUURRRR.............................",
    ".................................NNNN...N.....S..........................DDDDHHHHIIJJJJHHHDKKKKK..IIIIIIHH......UUUUUU...OOOQJJ.................................",
    "..................................NNNNNNN....M....S......................DDDDHHHHHJJJJJHHHHKKKKKK..IINNHH.......UUUUU.....OQQJJ.................................",
    "......................................NQQOO..............................QDDDDHHHHJJJJHHHHHKKKKKLL.NNNN..........UUU.......OQQQJ.....T..........................",
    "........................................PLL..............................LQHHHHOJJSJJJHHHHKKKKKKOOLNN............UUU........QQOOU.....T.........................",
    "..........................................P....M.........................OMMHHOOORSSSSMHHHKKKKIOOOP..KJ...........U...........OU......TT........................",
    "............................................N.MMLLLLN.....................QMNNNSNSSSSSHHGGKIIIIOOOOOKK............W.............................................",
    "..............................................MMMLLLLC.....................LNNNSNSSSMMMGGGGGIIIOOOOOOJ......................Q..........T........................",
    "..............................................MMMMLLLCDDO...................L.......MMMGLGLLIIIPOOOJJ......................R.O.....OO...........................",
    ".............................................MMMMMLLECCEOE..........................JMMILLLLLLRRPPJJ........................RO...OOR............................",
    "............................................NNMMMEEEEEEEEE..........................GGIILLLLLRRPPPJ.........................RR..RRRR............................",
    "............................................NNJJMEEEEEEEEEEL........................GGILLLLLLRNNPP...........................RR..RRR.R.....R.R..................",
    "............................................JJJJEEEEEEEEEEELLLL......................IILLLLLLSNNNP............................R......RR.....RRRJJ..J............",
    "............................................JJJEEEEEEEEEEEELLLLL......................KLLLLLLNNNN..............................R.R............RJJ...............",
    ".............................................JJJEEEEEEEEEEELLLLL......................KKKKLLLKNNNN.....................................R.......J.J.....J........",
    ".............................................JJJJGGLLLLLLLLLLLL.......................KKKKKLLKKNNL..............................................................",
    "..............................................JJJGGGGLLLLLLLLLL.......................KKKKKKKKKLLL........................................CC...C................",
    "...............................................JJGGGGLLLLLLLLLL......................KKKKKKKKLLTLL...M.................................CCCCCC..CC...............",
    "................................................JGGGGGLLLLLLLLL......................IBBBBBLLLLL....MM................................CCCCCCCCCCC...............",
    ".................................................GGGIILLLLLLLL........................BBBDDDLLL.....MM...............................CCCCCCCCCCCCC..............",
    ".................................................JHHIIILLLLLL.........................BBBDDDDLLL...MM..............................CCCCCCCCCCCCCCCC.............",
    ".................................................JHHHHIILLL...........................BBBDDDLLL.....M..............................CCCCCCCCCCCCCCCCC............",
    ".................................................JHHHHIHLL.............................BBLLLLNL....................................CCCCCCCCCCCCCCCCC............",
    "................................................JHHHHHHLLL.............................LLLLLLL.....................................CCCCCCCCCCCCCCCCC............",
    "................................................JHHHHHHHL...............................LLLLL......................................CCCCCCCCCCCCCCCCC............",
    "................................................JHHHHHHH................................LLL........................................CCCC.....CCCCCCC.............",
    "................................................JHHHHHH.......................................................................................CCCCC..........I..",
    "...............................................JHHHHHH.........................................................................................CC.............I.",
    "...............................................JHHHH............................................................................................................",
    "................................................HHHH.............................................................................................C..........I...",
    "...............................................JHHH.......................................................................................................II....",
    "...............................................JHHH.............................................................................................................",
    "..............................................JHHH..............................................................................................................",
    "...............................................JH....n..........................................................................................................",
    "...............................................JJH.............................................................................................................."
  ]};
  var cv = document.getElementById('rl-map'), ctx = cv.getContext('2d');
  var COLS = DOTS.rows[0].length, ROWS = DOTS.rows.length, ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var dots = [], seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  DOTS.rows.forEach(function (row, r) {
    for (var c = 0; c < COLS; c++) {
      var ch = row.charAt(c); if (ch === '.') continue;
      var w = Math.pow(10, 2 + ALPHA.indexOf(ch) * 6 / 51);
      dots.push({ r: r, c: c, w: w, key: -Math.log(rnd()) / w, cur: [0, 0, 0], to: 0 });
    }
  });
  // Population-weighted random order: who is reached first by any harm is drawn by where people live.
  dots.sort(function (a, b) { return a.key - b.key; });
  var total = dots.reduce(function (s, d) { return s + d.w; }, 0), acc = 0;
  dots.forEach(function (d) { d.at = acc / total; acc += d.w; d.share = d.w / total; });

  var col = {}, W = 0, H = 0, dpr = 1;
  function hex(v) { v = v.replace('#', ''); if (v.length === 3) v = v.replace(/./g, '$&$&'); return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]; }
  function cssVar(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
  function readColors() {
    col[0] = hex(cssVar('--ink-3') || '#6d6f76'); col[1] = hex(cssVar('--gold') || '#d99a1b'); col[2] = hex(cssVar('--accent') || '#c8402a');
  }
  function size() {
    var rect = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = W * ROWS / COLS; cv.style.height = H + 'px';
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    var s = W / COLS, rad = Math.max(1.1, s * 0.36);
    ctx.clearRect(0, 0, W, H);
    // quiet land first, then the affected, then lives lost on top so they are never hidden
    [0, 1, 2].forEach(function (layer) {
      dots.forEach(function (d) {
        if (d.to !== layer) return;
        var x = (d.c + 0.5) * s, y = (d.r + 0.5) * s, big = layer ? 1 + Math.min(0.5, Math.log10(d.w) / 16) : 1;
        if (layer === 2) {
          ctx.globalAlpha = 0.25; ctx.fillStyle = 'rgb(' + col[2].join(',') + ')';
          ctx.beginPath(); ctx.arc(x, y, rad * 2.6, 0, Math.PI * 2); ctx.fill();
          big *= 1.25;
        }
        ctx.globalAlpha = layer === 0 ? 0.42 : 1;
        ctx.fillStyle = 'rgb(' + (d.cur[0] | 0) + ',' + (d.cur[1] | 0) + ',' + (d.cur[2] | 0) + ')';
        ctx.beginPath(); ctx.arc(x, y, rad * big, 0, Math.PI * 2); ctx.fill();
      });
    });
    ctx.globalAlpha = 1;
  }
  var anim = 0;
  function paint(fatal, affected, instant) {
    dots.forEach(function (d) { d.to = d.at < fatal ? 2 : d.at < affected ? 1 : 0; });
    cancelAnimationFrame(anim);
    var start = performance.now();
    (function step(now) {
      var k = instant || reduce ? 1 : Math.min(1, (now - start) / 450), done = true;
      dots.forEach(function (d) {
        var t = col[d.to];
        for (var i = 0; i < 3; i++) { d.cur[i] += (t[i] - d.cur[i]) * (k === 1 ? 1 : 0.22); if (Math.abs(t[i] - d.cur[i]) > 1) done = false; }
      });
      draw();
      if (!done && k < 1) anim = requestAnimationFrame(step); else if (!done) { dots.forEach(function (d) { d.cur = col[d.to].slice(); }); draw(); }
    })(start);
  }

  /* ---------- wiring ---------- */
  var risk = document.getElementById('rl-risk'), safe = document.getElementById('rl-safe');
  var out = {
    p: document.getElementById('rl-p'), odds: document.getElementById('rl-odds'), an: document.getElementById('rl-analogy'),
    fill: document.getElementById('rl-fill'), dead: document.getElementById('rl-dead'), hurt: document.getElementById('rl-hurt'),
    rn: document.getElementById('rl-rn'), sn: document.getElementById('rl-sn'), rv: document.getElementById('rl-rv'), sv: document.getElementById('rl-sv')
  };
  function scalePos(p) { return Math.max(0, Math.min(1, (Math.log10(Math.max(p, 0.001)) + 3) / 3)); }  // 0.1% .. 100%
  var RISK_WORDS = ['Optimistic', 'Cautious', 'Middling', 'Worried', 'Pessimistic'], SAFE_WORDS = ['Almost none', 'Today’s practice', 'Field-wide', 'Plus our goals', 'All of it'];

  function update(instant) {
    var rl = +risk.value, sl = +safe.value, res = compute(rl, sl);
    out.rv.textContent = RISK_WORDS[Math.min(4, Math.floor(rl / 20))];
    out.sv.textContent = SAFE_WORDS[Math.min(4, Math.floor(sl / 20))];
    out.p.textContent = pct(res.doom);
    out.odds.textContent = oneIn(res.doom);
    out.an.textContent = analogy(res.doom);
    out.fill.style.width = (scalePos(res.doom) * 100) + '%';
    out.dead.textContent = people(res.fatal * WORLD);
    out.hurt.textContent = people(Math.max(0, res.affected - res.fatal) * WORLD);
    var rn = 0, sn = 0;
    RISKS.forEach(function (r) {
      if (r.on && r.el.hidden) { r.el.hidden = false; r.el.classList.add('enter'); }
      if (!r.on) { r.el.hidden = true; r.el.classList.remove('enter'); }
      if (r.on) {
        rn++;
        r.el.querySelector('.rl-p').textContent = pct(r.pe);
        r.el.querySelector('.rl-cut').textContent = r.cut > 0.005 ? 'Safeguards in place cut its chance by ' + pct(r.cut) + '.' : 'No safeguard in place reduces it yet.';
      }
    });
    SAFES.forEach(function (s) {
      if (s.on && s.el.hidden) { s.el.hidden = false; s.el.classList.add('enter'); }
      if (!s.on) { s.el.hidden = true; s.el.classList.remove('enter'); }
      if (s.on) sn++;
    });
    out.rn.textContent = rn + ' of ' + RISKS.length; out.sn.textContent = sn + ' of ' + SAFES.length;
    // a preset shows as pressed only while the sliders sit exactly on it
    presets.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.preset === rl + ',' + sl)); });
    root.style.setProperty('--risk', rl / 100); root.style.setProperty('--safe', sl / 100); root.style.setProperty('--doom', scalePos(res.doom));
    paint(res.fatal, res.affected, instant);
  }

  // Markers for published reference points on the gauge.
  document.querySelectorAll('.rl-mark').forEach(function (m) { m.style.left = (scalePos(+m.dataset.p) * 100) + '%'; });

  risk.addEventListener('input', function () { update(false); });
  safe.addEventListener('input', function () { update(false); });
  var presets = [].slice.call(root.querySelectorAll('[data-preset]'));
  presets.forEach(function (b) {
    b.addEventListener('click', function () { var v = b.dataset.preset.split(','); risk.value = v[0]; safe.value = v[1]; update(false); });
  });
  readColors(); size();
  dots.forEach(function (d) { d.cur = col[0].slice(); });
  update(true);
  window.addEventListener('resize', function () { size(); draw(); });
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', function () { readColors(); update(true); });

})();
