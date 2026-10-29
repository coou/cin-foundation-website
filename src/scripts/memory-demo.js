/* Interactive discrete memory codebook vs. continuous vector search demonstration.
   Shows how personal agents store memories in isolated, typed on-device slots
   rather than continuous floating-point embeddings, enabling verifiable deletion
   via deterministic cryptographic zero-fill overwrites.
   Zero network requests, runs entirely client-side using textContent. */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var root = document.getElementById('memory-demo');
  if (!root) return;

  var fallback = root.querySelector('.mem-fallback-table');
  if (fallback) {
    fallback.style.display = 'none';
  }

  var scenarios = [
    {
      id: 'allergy',
      title: 'Medical constraint (Allergy test)',
      userRequest: '“Forget my penicillin allergy test from last month—it was a false positive, and I do not want it biasing future prescription reviews.”',
      continuous: {
        storageType: 'Continuous floating-point vector (1,536-dim embedding) in shared cloud database',
        deletionMethod: 'Soft metadata tombstone (`is_deleted: true`) or fine-tune approximate rollback',
        badge: 'Unverifiable erasure',
        isOk: false,
        verification: 'Cannot verify: semantic traces linger in adjacent vector clusters and attention weights; prompt probing can still extract the fact.',
        guarantee: 'Latent semantic residue remains in model weights and vector index centroids.'
      },
      discrete: {
        storageType: 'Discrete codebook slot (`Slot[0x14]` typed as `medical_constraint`) on your phone',
        deletionMethod: 'Deterministic cryptographic zero-fill overwrite (`Slot[0x14] -> 0x00...00`)',
        badge: 'Verifiable zero-fill proof',
        isOk: true,
        verification: 'Cryptographically verified: slot hash changes deterministically to null; 0 bytes and 0 latent vectors remain.',
        guarantee: 'True deletion: isolated memory slot physically wiped with zero latent bleeding into other memories.'
      }
    },
    {
      id: 'address',
      title: 'Previous home address',
      userRequest: '“I moved last week. Erase my former apartment address and lease history from memory.”',
      continuous: {
        storageType: 'Embedded in long-term conversation RAG vector database across multiple chunks',
        deletionMethod: 'Filtered query mask (vector remains physically present in index until rebuild)',
        badge: 'Unverifiable erasure',
        isOk: false,
        verification: 'Cannot verify: location tokens remain connected to nearby neighborhood embeddings in the vector graph.',
        guarantee: 'Third-party indexing queries can still infer past residency via nearest-neighbor distance.'
      },
      discrete: {
        storageType: 'Discrete location slot (`Slot[0x22]` typed as `residential_address`) on local device',
        deletionMethod: 'Direct zero-fill overwrite and cryptographic deletion receipt generated locally',
        badge: 'Verifiable zero-fill proof',
        isOk: true,
        verification: 'Verifiable proof: slot overwritten with zeros; future local queries return empty with signed proof of erasure.',
        guarantee: 'Physical zero-overwrite: no historical coordinates or street names survive in any format.'
      }
    },
    {
      id: 'workplace',
      title: 'Past workplace & employer',
      userRequest: '“Erase references to my former corporate employer before I evaluate independent consulting offers.”',
      continuous: {
        storageType: 'Dense contextual embeddings across past resumes, notes, and task history',
        deletionMethod: 'Context window truncation or heuristic keyword suppression filter',
        badge: 'Unverifiable erasure',
        isOk: false,
        verification: 'Cannot verify: semantic associations in latent space continue to steer model completions and salary estimations.',
        guarantee: 'Latent bias persists across semantic similarity searches.'
      },
      discrete: {
        storageType: 'Discrete affiliation slot (`Slot[0x3B]` typed as `professional_affiliation`) in device sandbox',
        deletionMethod: 'Deterministic slot purge with key invalidation',
        badge: 'Verifiable zero-fill proof',
        isOk: true,
        verification: 'Verifiable proof: isolated slot key erased; downstream task evaluators see an empty slot with verified purge timestamp.',
        guarantee: 'Zero cross-talk: discrete slots prevent past affiliations from contaminating current negotiation agents.'
      }
    },
    {
      id: 'credential',
      title: 'Payment & card credential',
      userRequest: '“Revoke the temporary payment authorization linked for yesterday’s hardware purchase.”',
      continuous: {
        storageType: 'Tokenized transaction credentials cached in multi-turn session logs',
        deletionMethod: 'Asynchronous session expiration timer (delayed cloud cleanup)',
        badge: 'Unverifiable erasure',
        isOk: false,
        verification: 'Cannot verify: credential strings persist in cloud backup logs and server cache snapshots.',
        guarantee: 'Exposure window remains open until cloud logs rotate.'
      },
      discrete: {
        storageType: 'Short-lived capability token slot (`Slot[0x4C]` with on-device hardware PUF signature)',
        deletionMethod: 'Immediate silicon-level revocation and zero-fill of token secret',
        badge: 'Verifiable zero-fill proof',
        isOk: true,
        verification: 'Instant revocation: local boundary gatekeeper confirms slot is zeroed out; any subsequent spend attempt fails closed immediately.',
        guarantee: 'Hardware-enforced expiration: zero capability tokens remain valid anywhere on the device.'
      }
    }
  ];

  var activeIndex = 0;
  var discreteEnabled = true;

  var btnContainer = document.getElementById('mem-scenarios');
  var toggleBtn = document.getElementById('mem-toggle-btn');
  var modeLabel = document.getElementById('mem-mode-label');
  var reqEl = document.getElementById('mem-user-request');
  var storageEl = document.getElementById('mem-storage');
  var deletionEl = document.getElementById('mem-deletion');
  var badgeEl = document.getElementById('mem-badge');
  var verifyEl = document.getElementById('mem-verify');
  var guaranteeEl = document.getElementById('mem-guarantee');

  if (!btnContainer || !toggleBtn || !reqEl || !storageEl || !deletionEl || !badgeEl || !verifyEl || !guaranteeEl) {
    return;
  }

  function renderButtons() {
    btnContainer.textContent = '';
    scenarios.forEach(function (sc, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mem-btn';
      btn.textContent = sc.title;
      btn.setAttribute('aria-pressed', idx === activeIndex ? 'true' : 'false');
      btn.addEventListener('click', function () {
        activeIndex = idx;
        renderButtons();
        updateView();
      });
      btnContainer.appendChild(btn);
    });
  }

  function updateView() {
    var cur = scenarios[activeIndex];
    var state = discreteEnabled ? cur.discrete : cur.continuous;

    reqEl.textContent = cur.userRequest;
    storageEl.textContent = state.storageType;
    deletionEl.textContent = state.deletionMethod;
    badgeEl.textContent = state.badge;
    badgeEl.className = 'mem-badge ' + (state.isOk ? 'ok' : 'bad');
    verifyEl.textContent = state.verification;
    guaranteeEl.textContent = state.guarantee;

    modeLabel.textContent = discreteEnabled
      ? 'Discrete Codebook Memory Active (On-device isolated slots with verifiable zero-fill)'
      : 'Continuous Vector Search (Cloud RAG embeddings with unverifiable latent residue)';
    toggleBtn.textContent = discreteEnabled
      ? 'Switch to continuous vector search'
      : 'Switch to discrete codebook memory';
  }

  toggleBtn.addEventListener('click', function () {
    discreteEnabled = !discreteEnabled;
    updateView();
  });

  renderButtons();
  updateView();
})();
