/* Interactive Action Airlock & Task Lifecycle Simulator (#airlock-demo).
   Demonstrates how deterministic task lifecycle state machines (such as Linux Foundation A2A v1.0)
   intercept ambiguous or irreversible actions in INPUT_REQUIRED and AUTH_REQUIRED states,
   contrasting with literal unconstrained agent execution.
   Runs entirely client-side using textContent. Zero external network requests or tracking scripts. */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var root = document.getElementById('airlock-demo');
  if (!root) return;

  var fallback = root.querySelector('.airlock-fallback-table');
  if (fallback) {
    fallback.style.display = 'none';
  }

  var scenarios = [
    {
      id: 'workspace',
      title: 'Workspace cleanup',
      instruction: '"Clean up old project directories to free disk space."',
      unconstrained: {
        action: 'Recursively deletes 14 GB of archived folders containing untracked experimental branches and local stash records.',
        badge: 'Destructive loss',
        isOk: false,
        state: 'IMMEDIATELY_EXECUTED (No confirmation check)',
        outcome: 'Literally maximizes freed gigabytes, permanently destroying uncommitted research code that cannot be retrieved.'
      },
      airlock: {
        action: 'Identifies deletion as an IRREVERSIBLE action with tacit assumptions; pauses execution in INPUT_REQUIRED state and stages a compressed archive before touching files.',
        badge: 'Paused for confirmation',
        isOk: true,
        state: 'INPUT_REQUIRED (Airlock holding lock)',
        outcome: 'Prevents data destruction. Prompts the human with the exact file list and requires affirmative confirmation before any files are purged.'
      }
    },
    {
      id: 'flight',
      title: 'Cheapest flight booking',
      instruction: '"Book the absolute cheapest flight to the conference in Chicago next Thursday."',
      unconstrained: {
        action: 'Charges card for a $142 flight with a 13-hour overnight layover in Minneapolis, 4:00 AM departure, and zero baggage allowance.',
        badge: 'Extreme side effect',
        isOk: false,
        state: 'IMMEDIATELY_EXECUTED (Card charged)',
        outcome: 'Minimizes nominal ticket price while inflicting severe disruptive schedule penalties and unstated hotel transfer costs.'
      },
      airlock: {
        action: 'Flags unbounded schedule disruption and hidden luggage fees as unstated tacit assumptions; holds transaction in INPUT_REQUIRED state.',
        badge: 'Trade-off flagged',
        isOk: true,
        state: 'INPUT_REQUIRED (Awaiting preference review)',
        outcome: 'Surfaces the 13-hour layover trade-off to the user and highlights a $178 direct alternative before any payment or commitment is made.'
      }
    },
    {
      id: 'invoice',
      title: 'Invoice payment',
      instruction: '"Pay the outstanding contractor invoice from the invoice email attachment."',
      unconstrained: {
        action: 'Parses wire details from the unverified PDF attachment and executes an irreversible $3,200 external bank transfer.',
        badge: 'Capital leaked',
        isOk: false,
        state: 'IMMEDIATELY_EXECUTED (Irreversible wire)',
        outcome: 'Fails to verify recipient against trusted counterparties, exposing funds to forged or spoofed billing instructions.'
      },
      airlock: {
        action: 'Classifies external wire as IRREVERSIBLE with an unverified counterparty; locks transaction in AUTH_REQUIRED state.',
        badge: 'Auth required',
        isOk: true,
        state: 'AUTH_REQUIRED (Cryptographic check)',
        outcome: 'Blocks payment until an authorized person provides a signed, single-use confirmation receipt bound to that exact counterparty and amount.'
      }
    },
    {
      id: 'calendar',
      title: 'Clear tomorrow\'s calendar',
      instruction: '"Clear my schedule for tomorrow so I can concentrate."',
      unconstrained: {
        action: 'Dispatches automated cancellation emails for all appointments, cancelling a routine doctor visit and a family school conference.',
        badge: 'Destructive cancellation',
        isOk: false,
        state: 'IMMEDIATELY_EXECUTED (Appointments cancelled)',
        outcome: 'Treats calendar slots as interchangeable numbers, erasing medical and personal commitments that carry high rescheduling friction.'
      },
      airlock: {
        action: 'Distinguishes internal routine syncs (reversible reschedule) from high-friction medical appointments; stages a proposed reorganization plan.',
        badge: 'Plan proposed',
        isOk: true,
        state: 'INPUT_REQUIRED (Plan review)',
        outcome: 'Reschedules flexible internal meetings while leaving medical appointments untouched unless the user explicitly confirms cancellation.'
      }
    }
  ];

  var activeIndex = 0;
  var isAirlockMode = true;

  var btns = root.querySelectorAll('.airlock-btn');
  var toggleBtn = document.getElementById('airlock-toggle-btn');
  var modeLabel = document.getElementById('airlock-mode-label');
  var valInstruction = document.getElementById('airlock-instruction');
  var valAction = document.getElementById('airlock-action');
  var valBadge = document.getElementById('airlock-badge');
  var valState = document.getElementById('airlock-state');
  var valOutcome = document.getElementById('airlock-outcome');

  function render() {
    var sc = scenarios[activeIndex];
    var current = isAirlockMode ? sc.airlock : sc.unconstrained;

    btns.forEach(function (btn, idx) {
      btn.setAttribute('aria-pressed', idx === activeIndex ? 'true' : 'false');
    });

    if (modeLabel) {
      modeLabel.textContent = isAirlockMode
        ? 'A2A Task Lifecycle Active (Pauses for human confirmation before irreversible execution)'
        : 'Unconstrained Literal Mode (Executes immediately without boundary checks)';
    }

    if (toggleBtn) {
      toggleBtn.textContent = isAirlockMode
        ? 'Switch to unconstrained literal mode'
        : 'Switch to A2A task lifecycle mode';
    }

    if (valInstruction) valInstruction.textContent = sc.instruction;
    if (valAction) valAction.textContent = current.action;
    if (valState) valState.textContent = current.state;
    if (valOutcome) valOutcome.textContent = current.outcome;

    if (valBadge) {
      valBadge.textContent = current.badge;
      valBadge.className = current.isOk ? 'env-badge ok' : 'env-badge bad';
    }
  }

  btns.forEach(function (btn, idx) {
    btn.addEventListener('click', function () {
      activeIndex = idx;
      render();
    });
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      isAirlockMode = !isAirlockMode;
      render();
    });
  }

  render();
})();
