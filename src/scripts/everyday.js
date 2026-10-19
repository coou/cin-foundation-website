/* Interactive everyday translation tabs (#for-you) and the Risk-Scaled Agreement Explorer (#swarm-lock).
   Runs entirely in the visitor's browser and sends nothing anywhere.
   When JavaScript is off, all everyday cards and the risk table stay visible in the HTML. */
(function () {
  'use strict';

  /* ---------- 1. "What this means for your daily life" (#for-you) ---------- */
  var fyRoot = document.getElementById('for-you');
  if (fyRoot) {
    var tabs = [].slice.call(fyRoot.querySelectorAll('[data-fy-tab]'));
    var panels = [].slice.call(fyRoot.querySelectorAll('[data-fy-panel]'));
    if (tabs.length && panels.length) {
      var activateFy = function (id) {
        tabs.forEach(function (b) {
          var on = b.getAttribute('data-fy-tab') === id;
          b.setAttribute('aria-selected', String(on));
        });
        panels.forEach(function (p) {
          p.hidden = p.getAttribute('data-fy-panel') !== id;
        });
      };
      tabs.forEach(function (b) {
        b.addEventListener('click', function () {
          activateFy(b.getAttribute('data-fy-tab'));
        });
      });
      activateFy(tabs[0].getAttribute('data-fy-tab'));
    }
  }

  /* ---------- 2. "No one person commands a swarm" (#swarm-lock) ---------- */
  var slRoot = document.getElementById('swarm-lock');
  if (!slRoot) return;

  var TASKS = [
    {
      id: 'personal',
      label: 'Check my bills & subscriptions',
      risk: 0,
      affected: 1,
      affectedText: '1 person (only you)',
      supportPct: 100,
      what: 'Your personal agent reads your bank statements on your own device and flags a forgotten recurring charge.',
      singleCmd: 'Works, though cloud bots often upload your bank history to remote servers.',
      cinResult: 'Unlocks immediately on your device. Zero outside permission needed.'
    },
    {
      id: 'guild',
      label: 'Build a 20-home solar microgrid',
      risk: 5,
      affected: 20,
      affectedText: '20 neighboring households',
      supportPct: 85,
      what: 'Neighbors coordinate their personal agents to pool rooftop solar and battery storage on their street.',
      singleCmd: 'A utility monopoly can block or overcharge the street unilaterally.',
      cinResult: 'Requires ~23% (5 of 20 households) to open the shared task; 85% agree -> Unlocks cleanly.'
    },
    {
      id: 'city',
      label: 'Re-route town water & power grid',
      risk: 25,
      affected: 10000,
      affectedText: '10,000 local residents',
      supportPct: 82,
      what: 'A municipal cooperative proposes re-balancing water pressure and grid load across ten thousand homes.',
      singleCmd: 'One hacked city console or corrupt contractor can shut off a neighborhood without consent.',
      cinResult: 'Requires 76.3% agreement across local residents’ agents; 82% agree -> Unlocks after verification.'
    },
    {
      id: 'oligarch',
      label: 'Hostile market cornering with 50,000 fake bots',
      risk: 78,
      affected: 10000,
      affectedText: '10,000 residents (+ 50,000 fake bots blocked)',
      supportPct: 4,
      what: 'An outside operator spins up 50,000 fake accounts and claims “low risk” to corner regional energy prices.',
      singleCmd: 'Executes immediately—whoever rents the biggest server cluster wins.',
      cinResult: 'BLOCKED: Private personhood proof rejects all 50,000 fake bots; diverse risk checkers flag 78% risk (requires 99.95% real agreement; only 4% approve).'
    },
    {
      id: 'nuclear',
      label: 'Launch a cross-border strike or autonomous war swarm',
      risk: 99.9,
      affected: 8000000000,
      affectedText: 'Millions to billions of families on both sides',
      supportPct: 0.01,
      what: 'A panicked leader, spoofed command or rogue model attempts to launch a mass-casualty strike.',
      singleCmd: 'CATASTROPHE: One command console or two keys in a bunker can trigger irreversible destruction in minutes.',
      cinResult: 'BLOCKED AT THE GATE: Requires 99.9999999999999% agreement from the personal agents of affected families on both sides + a 72-hour cooling-off lock.'
    }
  ];

  var btns = [].slice.call(slRoot.querySelectorAll('[data-sl-task]'));
  var slider = document.getElementById('sl-risk-slider');
  var elRiskVal = document.getElementById('sl-risk-val');
  var elReqVal = document.getElementById('sl-req-val');
  var elReqBar = document.getElementById('sl-req-bar');
  var elSupBar = document.getElementById('sl-sup-bar');
  var elTimer = document.getElementById('sl-timer');
  var elAffected = document.getElementById('sl-affected');
  var elWhat = document.getElementById('sl-what');
  var elSingle = document.getElementById('sl-single');
  var elCin = document.getElementById('sl-cin');
  var elBadge = document.getElementById('sl-badge');

  function phi(r01) {
    if (r01 <= 0.001) return 0;
    return 1 - Math.pow(1 - Math.min(0.9999, r01), 5);
  }

  function formatPct(p01) {
    var pct = p01 * 100;
    if (pct === 0) return '0% outside permission (only you)';
    if (pct < 99.9) return pct.toFixed(1) + '% of affected people’s agents';
    if (pct < 99.9999) return pct.toFixed(4) + '% of affected people’s agents';
    return '99.9999999%+ (virtually every family on both sides)';
  }

  function renderTask(t, customRiskPct) {
    var rPct = customRiskPct != null ? customRiskPct : t.risk;
    var r01 = rPct / 100;
    var req01 = (t.affected <= 1 && rPct < 1) ? 0 : phi(r01);
    var coolingHours = r01 <= 0.30 ? 0 : Math.round(72 * r01 * r01);
    var sup01 = t.supportPct / 100;
    var unlocked = sup01 >= req01;

    if (slider && customRiskPct == null) slider.value = String(Math.round(rPct));
    if (elRiskVal) elRiskVal.textContent = rPct < 1 && rPct > 0 ? rPct.toFixed(1) + '%' : Math.round(rPct) + '%';
    if (elReqVal) elReqVal.textContent = formatPct(req01);
    if (elReqBar) elReqBar.style.width = Math.min(100, Math.max(2, req01 * 100)) + '%';
    if (elSupBar) {
      elSupBar.style.width = Math.min(100, Math.max(1, t.supportPct)) + '%';
      elSupBar.className = 'sl-bar-fill ' + (unlocked ? 'ok' : 'bad');
    }
    if (elTimer) {
      elTimer.textContent = coolingHours === 0
        ? 'Immediate (0h cooling-off window)'
        : coolingHours + '-hour mandatory deliberation & simulation window';
    }
    if (elAffected) elAffected.textContent = t.affectedText;
    if (elWhat) elWhat.textContent = t.what;
    if (elSingle) elSingle.textContent = t.singleCmd;
    if (elCin) elCin.textContent = customRiskPct == null ? t.cinResult : (
      unlocked
        ? 'Unlocks: real community support (' + t.supportPct + '%) meets the ' + (req01 * 100).toFixed(1) + '% risk threshold.'
        : 'BLOCKED AT THE GATE: real support (' + t.supportPct + '%) is below the ' + (req01 * 100).toFixed(2) + '% threshold required for this risk level.'
    );
    if (elBadge) {
      elBadge.textContent = unlocked ? 'UNLOCKED BY CONSENT' : 'BLOCKED AT THE THRESHOLD GATE';
      elBadge.className = 'sl-badge ' + (unlocked ? 'ok' : 'bad');
    }
  }

  var currentTask = TASKS[0];
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-sl-task');
      var found = TASKS.filter(function (x) { return x.id === id; })[0];
      if (!found) return;
      currentTask = found;
      btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderTask(currentTask, null);
    });
  });

  if (slider) {
    slider.addEventListener('input', function () {
      renderTask(currentTask, parseFloat(slider.value));
    });
  }

  renderTask(currentTask, null);
})();
