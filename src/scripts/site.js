/* CIN site script. Runs entirely in the visitor's browser and sends nothing anywhere. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  /* ---------- header, menu, active section ---------- */
  var head = document.querySelector('.site-head');
  var onScroll = function () { if (head) head.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav') || document.getElementById('site-nav') || document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menu'; }
    });
  }

  /* ---------- reliable #top & section hash navigation (compensates for sticky header & async layout shifts) ---------- */
  /* ---------- Interactive Studio Switchers (#for-you, #fractured, #signals) ---------- */
  function activateStudioPane(pane) {
    if (!pane || !pane.id) return;
    var sec = pane.closest('section') || pane.parentNode;
    var sw = sec.querySelector('.studio-switcher');
    var panes = [].slice.call(sec.querySelectorAll('.studio-pane'));
    panes.forEach(function (p) {
      var on = p === pane;
      p.hidden = !on;
      if (on) {
        p.classList.add('in');
        p.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      }
    });
    if (sw) {
      [].forEach.call(sw.querySelectorAll('[data-studio-target]'), function (btn) {
        btn.setAttribute('aria-selected', String(btn.getAttribute('data-studio-target') === pane.id));
      });
    }
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 20);
  }

  document.querySelectorAll('.studio-switcher').forEach(function (sw) {
    sw.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-studio-target]');
      if (!btn) return;
      var targetPane = document.getElementById(btn.getAttribute('data-studio-target'));
      if (targetPane) activateStudioPane(targetPane);
    });
  });

  var hashLockId = null, hashLockUntil = 0;
  function scrollToHashTarget(id, smooth) {
    if (!id || id === 'top') {
      hashLockId = null;
      window.scrollTo({ top: 0, behavior: (smooth && !reduce) ? 'smooth' : 'auto' });
      return true;
    }
    var target = document.getElementById(id);
    if (!target) return false;
    var parentPane = target.closest('.studio-pane');
    if (parentPane && parentPane.hidden) {
      activateStudioPane(parentPane);
    }
    // Reveal any unrevealed elements inside or on the target immediately so translateY(14px) doesn't offset it
    target.classList.add('in');
    target.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    var headH = head ? head.getBoundingClientRect().height : 64;
    var y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headH - 8);
    window.scrollTo({ top: y, behavior: (smooth && !reduce) ? 'smooth' : 'auto' });
    return true;
  }

  // Cancel async hash lock immediately if the user manually scrolls via wheel, touch, or keys
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { hashLockId = null; hashLockUntil = 0; }, { passive: true });
  });

  if ('ResizeObserver' in window) {
    var bodyRo = new ResizeObserver(function () {
      if (hashLockId && performance.now() < hashLockUntil) {
        scrollToHashTarget(hashLockId, false);
      }
    });
    bodyRo.observe(document.body);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var isSamePageHash = false, hash = '';
    if (href.charAt(0) === '#') {
      isSamePageHash = true;
      hash = href.slice(1);
    } else if (href.indexOf('/#') === 0 && (location.pathname === '/' || location.pathname === '/index.html')) {
      isSamePageHash = true;
      hash = href.slice(2);
    }
    if (!isSamePageHash) return;
    if (hash === 'top' || href === '#') {
      e.preventDefault();
      if (history.pushState) history.pushState(null, '', '#top');
      scrollToHashTarget('top', true);
      return;
    }
    if (hash && document.getElementById(hash)) {
      e.preventDefault();
      if (history.pushState) history.pushState(null, '', '#' + hash);
      hashLockId = hash;
      hashLockUntil = performance.now() + 1400;
      scrollToHashTarget(hash, true);
    }
  });

  if (location.hash) {
    var initId = decodeURIComponent(location.hash.slice(1));
    if (initId === 'top') {
      window.scrollTo(0, 0);
      window.addEventListener('load', function () { window.scrollTo(0, 0); });
    } else if (initId) {
      hashLockId = initId;
      hashLockUntil = performance.now() + 2500;
      setTimeout(function () { scrollToHashTarget(initId, false); }, 30);
      window.addEventListener('load', function () {
        scrollToHashTarget(initId, false);
        setTimeout(function () { if (hashLockId === initId) scrollToHashTarget(initId, false); }, 350);
      });
    }
  }

  if ('IntersectionObserver' in window) {
    var links = {};
    if (nav) nav.querySelectorAll('a').forEach(function (a) { var h = a.getAttribute('href') || ''; if (h.charAt(0) === '#') links[h.slice(1)] = a; });
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (a && en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) secObs.observe(s); });

    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revObs.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- the receipt: what this page actually loaded ---------- */
  function receipt() {
    var here = location.host;
    var entries = (performance.getEntriesByType ? performance.getEntriesByType('resource') : []);
    var hosts = {};
    hosts[here] = 1; // the page itself
    entries.forEach(function (e) {
      try { var h = new URL(e.name, location.href).host; if (h) hosts[h] = (hosts[h] || 0) + 1; } catch (_) {}
    });
    var list = Object.keys(hosts);
    var third = list.filter(function (h) { return h !== here; });
    var set = function (id, txt, cls) { var el = document.getElementById(id); if (el) { el.textContent = txt; if (cls) el.className = 'v ' + cls; } };
    set('r-cookies', document.cookie ? String(document.cookie.split(';').length) : '0', document.cookie ? 'bad' : 'good');
    set('r-count', String(entries.length + 1));
    set('r-hosts', list.length + ' (' + list.join(', ') + ')');
    set('r-third', third.length ? third.length + ': ' + third.join(', ') : '0', third.length ? 'bad' : 'good');
  }
  if (document.readyState === 'complete') receipt(); else window.addEventListener('load', function () { setTimeout(receipt, 50); });

  /* ---------- dialogs: the receipt waits quietly in the footer ---------- */
  document.querySelectorAll('[data-open]').forEach(function (b) {
    var dlg = document.getElementById(b.getAttribute('data-open'));
    if (!dlg || !dlg.showModal) { b.parentNode.hidden = true; return; }
    b.addEventListener('click', function () { receipt(); dlg.showModal(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  });

  /* ==========================================================================
     THE SOVEREIGN HORIZON (3-WORLD LIVING ARCHITECTURE IN #boundary):
     Zone 1 (Left):   HUMAN SANCTUARY · Live <1mW ECG/HRV + Mortal Computation Lease
     Zone 2 (Center): YOUR LOCAL SANDBOX · 6 Narrow Agents, Bespoke Code Synthesis,
                      and the Non-Contact Silicon Firewall (2-of-2 PUF + TPM)
     Zone 3 (Right):  AGENT-ONLY INTERNET · Real-Time Data-Only Ledger Stream (τ)
                      patrolled by Rewarded REA Reverse-Engineering Auditors
     ========================================================================== */

  /* ---------- Interactive Personal Agent & Zero-Middleman Savings Workbench (#wedge-calc) ---------- */
  var wbRoot = document.getElementById('wedge-calc');
  if (wbRoot) {
    var wbMode = 'medical';
    var wbBtns = [].slice.call(wbRoot.querySelectorAll('[data-wb-mode]'));
    var rng1 = document.getElementById('wb-rng-1');
    var rng2 = document.getElementById('wb-rng-2');
    var out1 = document.getElementById('wb-out-1');
    var out2 = document.getElementById('wb-out-2');
    var lbl1 = document.getElementById('wb-lbl-1');
    var lbl2 = document.getElementById('wb-lbl-2');
    var hint1 = document.getElementById('wb-hint-1');
    var hint2 = document.getElementById('wb-hint-2');
    var cb1 = document.getElementById('wb-cb-1');
    var cb2 = document.getElementById('wb-cb-2');
    var cbl1 = document.getElementById('wb-cbl-1');
    var cbd1 = document.getElementById('wb-cbd-1');
    var cbl2 = document.getElementById('wb-cbl-2');
    var cbd2 = document.getElementById('wb-cbd-2');
    var k1l = document.getElementById('wb-k1-lbl'), k1v = document.getElementById('wb-k1-val'), k1s = document.getElementById('wb-k1-sub');
    var k2l = document.getElementById('wb-k2-lbl'), k2v = document.getElementById('wb-k2-val'), k2s = document.getElementById('wb-k2-sub');
    var k3l = document.getElementById('wb-k3-lbl'), k3v = document.getElementById('wb-k3-val'), k3s = document.getElementById('wb-k3-sub');
    var b1l = document.getElementById('wb-b1-lbl'), b1v = document.getElementById('wb-b1-val'), b1f = document.getElementById('wb-b1-fill');
    var b2l = document.getElementById('wb-b2-lbl'), b2v = document.getElementById('wb-b2-val'), b2f = document.getElementById('wb-b2-fill');
    var rcpt = document.getElementById('wb-receipt');
    var fmtUsd = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };

    var configureWbMode = function (m) {
      wbMode = m;
      wbBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-wb-mode') === m)); });
      if (m === 'medical') {
        lbl1.textContent = 'Hospital Billed Charge (ER / Outpatient EOB)';
        rng1.min = 1200; rng1.max = 18000; rng1.step = 100; rng1.value = 3820;
        hint1.textContent = 'Typical Level-4 emergency room visit with bundled lab & hydration line items.';
        lbl2.textContent = 'Chargemaster Markup Over Medicare Rate';
        rng2.min = 180; rng2.max = 650; rng2.step = 10; rng2.value = 380;
        hint2.textContent = 'National hospital chargemaster markups average 340%–520% above statutory CMS benchmarks.';
        cbl1.textContent = 'CMS NCCI Unbundling Audit:';
        cbd1.textContent = 'Flags unbundled CPT 36415 venipuncture & CPT 96360 IV hydration billed alongside CPT 99284.';
        cbl2.textContent = 'Private Set Intersection (PSI) Benchmark:';
        cbd2.textContent = 'Compares regional settled rates across 412 local patients over IETF QUIC with 0 bytes of medical records exposed.';
      } else if (m === 'coop') {
        lbl1.textContent = 'Independent Clinics / Local Shops in Coalition';
        rng1.min = 5; rng1.max = 250; rng1.step = 5; rng1.value = 65;
        hint1.textContent = 'Members pool supply & SaaS purchasing orders via cryptographic Private Set Intersection.';
        lbl2.textContent = 'Annual Supply & SaaS Spend per Member';
        rng2.min = 20000; rng2.max = 400000; rng2.step = 10000; rng2.value = 120000;
        hint2.textContent = 'Legacy Group Purchasing Organizations (GPOs) and SaaS resellers extract 18%–32% middleman tolls.';
        cbl1.textContent = 'Private Set Intersection (Freedman et al., 2004):';
        cbd1.textContent = 'Matches overlapping SKUs across members without revealing proprietary vendor invoices to competitors.';
        cbl2.textContent = 'Zero-Middleman Smart Escrow over IETF QUIC:';
        cbd2.textContent = 'Settles bulk manufacturer discounts directly peer-to-peer, compressing administrative overhead to 3.2%.';
      } else {
        lbl1.textContent = 'Verified Peer-Agent Executions per Month';
        rng1.min = 200; rng1.max = 25000; rng1.step = 200; rng1.value = 4200;
        hint1.textContent = 'Number of times other personal agents or clinics run your verified patch, checklist, or LoRA adapter.';
        lbl2.textContent = 'Marginal Task Accuracy Gain (Data Shapley)';
        rng2.min = 4; rng2.max = 35; rng2.step = 1; rng2.value = 18;
        hint2.textContent = 'Measured improvement on held-out sandbox verification suites (Ghorbani & Zou, ICML 2019).';
        cbl1.textContent = 'Proof-Carrying Code Gate (Necula, POPL 1997):';
        cbd1.textContent = 'Requires deterministic sandbox test pass before capability executes or accrues royalties.';
        cbl2.textContent = 'TIES-Merging LoRA Attribution (Yadav et al., 2023):';
        cbd2.textContent = 'Preserves cryptographic contributor lineage (70% lead / 15% co-author / 15% verifiers) across weight merges.';
      }
      updateWb();
    };

    var updateWb = function () {
      var v1 = Number(rng1.value), v2 = Number(rng2.value);
      var on1 = cb1.checked, on2 = cb2.checked;
      if (wbMode === 'medical') {
        out1.textContent = fmtUsd(v1);
        out2.textContent = v2 + '%';
        var ncciSave = on1 ? Math.round(v1 * 0.298) : 0;
        var psiSave = on2 ? Math.round((v1 - ncciSave) * Math.min(0.45, (v2 - 140) / 1100)) : 0;
        var totalSave = ncciSave + psiSave;
        var fair = Math.max(Math.round(v1 * 0.22), v1 - totalSave);
        totalSave = v1 - fair;
        var pct = Math.round((totalSave / v1) * 1000) / 10;
        k1l.textContent = 'Legacy Hospital Bill'; k1v.textContent = fmtUsd(v1); k1s.textContent = v2 + '% chargemaster markup';
        k2l.textContent = 'Verified Fair Settlement'; k2v.textContent = fmtUsd(fair); k2s.textContent = 'Statutory CMS NCCI + PSI median';
        k3l.textContent = 'Your Household Savings'; k3v.textContent = fmtUsd(totalSave) + ' (' + pct + '%)'; k3s.textContent = '0 bytes leaked · 100% local OCap';
        b1l.textContent = 'Today (Unchecked Hospital Chargemaster Bill)'; b1v.textContent = fmtUsd(v1); b1f.style.width = '100%';
        b2l.textContent = 'With Your Personal Agent (Local CMS NCCI + PSI Audit)'; b2v.textContent = fmtUsd(fair) + ' (Saved ' + fmtUsd(totalSave) + ')';
        b2f.style.width = Math.max(15, Math.round((fair / v1) * 100)) + '%';
        rcpt.innerHTML = '<div><span class="r-ok">[OCAP-SANDBOX PASS]</span> Executed locally inside hardware-isolated capability boundary (Dennis &amp; Van Horn, 1966)</div>' +
          '<div><span class="r-warn">[CMS-NCCI AUDIT]</span> ' + (on1 ? 'Unbundled CPT 36415 / 96360 modifier-59 flagged (-' + fmtUsd(ncciSave) + ')' : 'Disabled (enable to flag unbundled CPT modifiers)') + '</div>' +
          '<div><span class="r-ok">[PSI-BENCHMARK]</span> ' + (on2 ? 'Regional 50th-percentile settlement verified across 412 local EOBs (-' + fmtUsd(psiSave) + ')' : 'Disabled (enable for regional PSI comparison)') + '</div>' +
          '<div class="arch-links" style="margin-top:.55rem;padding-top:.45rem;border-top:1px dashed rgba(255,255,255,.2)"><a class="blueprint-badge" href="/notes/beyond-arxiv-agent-web-ledger">Open Testnet Ledger v4.0 Simulator &rarr;</a><a class="blueprint-badge" href="/notes/architecture-of-human-sovereignty">42-Scenario Sovereignty Treatise &rarr;</a></div>';
      } else if (wbMode === 'coop') {
        out1.textContent = v1 + ' members';
        out2.textContent = fmtUsd(v2) + '/yr';
        var gpoRate = 0.28;
        var legacyFee = Math.round(v2 * gpoRate);
        var scaleDiscount = on1 ? Math.min(0.19, Math.log10(v1 + 1) * 0.088) : 0.04;
        var quicDirect = on2 ? 0.058 : 0;
        var netRate = Math.max(0.032, gpoRate - scaleDiscount - quicDirect);
        var cinFee = Math.round(v2 * netRate);
        var saved = legacyFee - cinFee;
        var savedPct = Math.round((saved / legacyFee) * 1000) / 10;
        var poolVol = (v1 * v2) / 1000000;
        k1l.textContent = 'Legacy GPO / Broker Toll'; k1v.textContent = fmtUsd(legacyFee) + '/yr'; k1s.textContent = '28.0% middleman extraction per member';
        k2l.textContent = 'Coalition Protocol Cost'; k2v.textContent = fmtUsd(cinFee) + '/yr'; k2s.textContent = (netRate * 100).toFixed(1) + '% direct clearing overhead';
        k3l.textContent = 'Annual Savings per Member'; k3v.textContent = fmtUsd(saved) + '/yr (' + savedPct + '%)'; k3s.textContent = '$' + poolVol.toFixed(2) + 'M pooled privately across ' + v1 + ' members';
        b1l.textContent = 'Today (28% GPO / SaaS Broker Extraction)'; b1v.textContent = fmtUsd(legacyFee) + '/yr'; b1f.style.width = '100%';
        b2l.textContent = 'With Private Set Intersection Buyer Co-Op'; b2v.textContent = fmtUsd(cinFee) + '/yr (Saved ' + fmtUsd(saved) + '/yr)';
        b2f.style.width = Math.max(11, Math.round((cinFee / legacyFee) * 100)) + '%';
        rcpt.innerHTML = '<div><span class="r-ok">[PSI-COHORT MATCH]</span> ' + v1 + ' independent clinics/shops matched SKU volume ($' + poolVol.toFixed(2) + 'M/yr) with 0 invoice leakage (Freedman et al., 2004)</div>' +
          '<div><span class="r-ok">[QUIC-0RTT SETTLEMENT]</span> Direct manufacturer tier unlocked; middleman toll cut from 28.0% to ' + (netRate * 100).toFixed(1) + '%</div>' +
          '<div class="arch-links" style="margin-top:.55rem;padding-top:.45rem;border-top:1px dashed rgba(255,255,255,.2)"><a class="blueprint-badge" href="/notes/companies-on-the-ledger">Companies on a Shared Ledger &rarr;</a><a class="blueprint-badge" href="/notes/beyond-arxiv-agent-web-ledger">Testnet Ledger v4.0 Simulator &rarr;</a></div>';
      } else {
        out1.textContent = v1.toLocaleString('en-US') + ' runs/mo';
        out2.textContent = '+' + v2 + '% accuracy';
        var basePerRun = 0.025 * (v2 / 10);
        var mult = (on1 ? 1.0 : 0.35) * (on2 ? 1.0 : 0.6);
        var grossMo = Math.round(v1 * basePerRun * mult);
        var leadMo = Math.round(grossMo * 0.70);
        var yr = grossMo * 12;
        k1l.textContent = 'Cloud AI Scraping Payout'; k1v.textContent = '$0 / mo'; k1s.textContent = 'Uncompensated training ingestion';
        k2l.textContent = 'Total Capability Royalty Pool'; k2v.textContent = fmtUsd(grossMo) + ' / mo'; k2s.textContent = fmtUsd(yr) + '/yr across guild & verifiers';
        k3l.textContent = 'Your Lead Creator Share (70%)'; k3v.textContent = fmtUsd(leadMo) + ' / mo'; k3s.textContent = '15% co-authors · 15% peer verifiers';
        b1l.textContent = 'Today (Centralized Cloud Scraping · 0% Creator Royalty)'; b1v.textContent = '$0 / mo'; b1f.style.width = '4%';
        b2l.textContent = 'With Proof-Carrying Code + Data Shapley Attribution'; b2v.textContent = fmtUsd(grossMo) + ' / mo (' + fmtUsd(yr) + '/yr)';
        b2f.style.width = Math.min(100, Math.max(18, Math.round((grossMo / 6500) * 100))) + '%';
        rcpt.innerHTML = '<div><span class="r-ok">[PCC-VERIFIED]</span> Capability bundle passed deterministic sandbox regression suite (Necula, POPL 1997)</div>' +
          '<div><span class="r-ok">[SHAPLEY-ROYALTY]</span> Marginal accuracy gain (+' + v2 + '%) across ' + v1.toLocaleString('en-US') + ' executions = ' + fmtUsd(grossMo) + '/mo (Ghorbani &amp; Zou, 2019)</div>' +
          '<div class="arch-links" style="margin-top:.55rem;padding-top:.45rem;border-top:1px dashed rgba(255,255,255,.2)"><a class="blueprint-badge" href="/notes/how-the-ledger-works">How the Shared Ledger Works &rarr;</a><a class="blueprint-badge" href="/notes/beyond-arxiv-agent-web-ledger">Testnet Ledger v4.0 Simulator &rarr;</a></div>';
      }
      if (wbMode === 'medical') {
        renderWedgeD3('medical', '1. Legacy Chargemaster', k1v.textContent, '2. CMS NCCI + PSI Fair', k2v.textContent, '3. Household Saved', k3v.textContent, 0.52);
      } else if (wbMode === 'coop') {
        renderWedgeD3('coop', '1. Legacy 28% GPO Toll', k1v.textContent, '2. Direct QUIC Escrow', k2v.textContent, '3. Member Saved/Yr', k3v.textContent, 0.84);
      } else {
        renderWedgeD3('creator', '1. Cloud AI Scraping', '$0 / mo (0%)', '2. Shapley Pool/Mo', k2v.textContent, '3. Lead Author (70%)', k3v.textContent, 0.95);
      }
    };
    var renderWedgeD3 = function (mode, leftTitle, leftVal, midTitle, midVal, rightTitle, rightVal, ratioOk) {
      var svgEl = document.getElementById('wb-d3-svg');
      if (!svgEl || !window.d3) return;
      var d3 = window.d3;
      var svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      svg.append('rect').attr('x', 4).attr('y', 4).attr('width', 672).attr('height', 120).attr('rx', 10)
        .attr('fill', '#11151c').attr('stroke', '#2c303a').attr('stroke-width', 1.4);

      svg.append('text').attr('x', 18).attr('y', 24).attr('font-size', 9.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8')
        .text('D3.JS V7 LIVE WATERFALL: LEGACY EXTRACTION VS. CIN LOCAL OCAP / PSI / SHAPLEY');

      var boxes = [
        { x: 18, w: 196, k: leftTitle, v: leftVal, col: '#ef6a52', bg: 'rgba(239,106,82,0.14)' },
        { x: 242, w: 196, k: midTitle, v: midVal, col: '#5da2d5', bg: 'rgba(93,162,213,0.14)' },
        { x: 466, w: 196, k: rightTitle, v: rightVal, col: '#4fb3a8', bg: 'rgba(79,179,168,0.18)' }
      ];

      boxes.forEach(function (b, idx) {
        svg.append('rect').attr('x', b.x).attr('y', 34).attr('width', b.w).attr('height', 52).attr('rx', 7)
          .attr('fill', b.bg).attr('stroke', b.col).attr('stroke-width', 1.4);
        svg.append('text').attr('x', b.x + 12).attr('y', 52).attr('font-size', 9).attr('font-family', 'monospace').attr('fill', '#c7cbd4').text(b.k);
        svg.append('text').attr('x', b.x + 12).attr('y', 74).attr('font-size', 13).attr('font-weight', '700').attr('fill', b.col).text(b.v);
        if (idx < 2) {
          svg.append('text').attr('x', b.x + b.w + 14).attr('y', 64).attr('text-anchor', 'middle').attr('font-size', 13).attr('font-weight', '700').attr('fill', '#e5a93c').text('→');
        }
      });

      var barW = 644;
      var okW = Math.max(48, Math.min(barW - 48, Math.round(barW * ratioOk)));
      svg.append('rect').attr('x', 18).attr('y', 96).attr('width', barW).attr('height', 16).attr('rx', 4).attr('fill', 'rgba(239,106,82,0.28)');
      svg.append('rect').attr('x', 18).attr('y', 96).attr('width', okW).attr('height', 16).attr('rx', 4).attr('fill', '#4fb3a8');
      svg.append('text').attr('x', 26).attr('y', 108).attr('font-size', 9).attr('font-weight', '700').attr('fill', '#0d1117')
        .text('Retained by Household / SMB / Creator: ' + Math.round(ratioOk * 100) + '%');
    };


    wbBtns.forEach(function (b) {
      b.addEventListener('click', function () { configureWbMode(b.getAttribute('data-wb-mode')); });
    });
    [rng1, rng2, cb1, cb2].forEach(function (el) {
      if (el) el.addEventListener('input', updateWb);
      if (el) el.addEventListener('change', updateWb);
    });
    configureWbMode('medical');
  }

  /* ---------- Interactive Blueprint & Note Filter Toolbar (#notes-toolbar on /notes/) ---------- */
  var notesToolbar = document.getElementById('notes-toolbar');
  if (notesToolbar) {
    var noteCards = [].slice.call(document.querySelectorAll('.notes-grid .note-card'));
    var notePills = [].slice.call(notesToolbar.querySelectorAll('[data-note-cat]'));
    var noteSearch = document.getElementById('notes-search');
    var activeCat = 'all';
    var filterNotes = function () {
      var q = ((noteSearch && noteSearch.value) || '').toLowerCase().trim();
      noteCards.forEach(function (c) {
        var cat = c.getAttribute('data-cat') || '';
        var matchCat = (activeCat === 'all') || (cat.indexOf(activeCat) !== -1);
        var matchQ = !q || (c.textContent.toLowerCase().indexOf(q) !== -1);
        c.style.display = (matchCat && matchQ) ? '' : 'none';
      });
    };
    notePills.forEach(function (p) {
      p.addEventListener('click', function () {
        activeCat = p.getAttribute('data-note-cat');
        notePills.forEach(function (b) { b.setAttribute('aria-pressed', String(b === p)); });
        filterNotes();
      });
    });
    if (noteSearch) noteSearch.addEventListener('input', filterNotes);
  }

  var cv = document.getElementById('boundary');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, R = 0, cx = 0, cy = 0, youX = 0, youY = 0, wallX = 0, streamX = 0, dpr = 1, fs = 10;
  var TAU = Math.PI * 2, MONO = 'ui-monospace, Consolas, monospace';

  // One person, 6 narrow agents arranged around your Local Sandbox Compiler Core.
  var FLEET = [
    ['age', 'your age and identity', ['ID wallet', 'birth record']],
    ['health', 'your health', ['heart rate', 'sleep']],
    ['money', 'your money', ['bank feed', 'receipts']],
    ['home', 'your home', ['lease', 'energy meter']],
    ['place', 'where you go', ['phone location', 'car']],
    ['work', 'your work and skills', ['certificates', 'calendar']]
  ].map(function (f, i, all) { return { id: f[0], about: f[1], feeds: f[2], a: -Math.PI / 2 + i * TAU / all.length }; });
  var N = FLEET.length;
  var SENSORS = [];
  FLEET.forEach(function (f, i) { f.feeds.forEach(function (name, j) { SENSORS.push({ k: i, a: f.a + (j ? 0.22 : -0.22), r: 0.88, name: name }); }); });

  // Routine questions on the data-only stream: [question, answer, agent, who asks].
  var ASK = [['Over 18?', 'yes (verified)', 0, 'a shop’s agent'], ['Insured?', 'yes (verified)', 1, 'a clinic’s agent'], ['Income ok?', 'yes (verified)', 2, 'a benefits agent'],
    ['Lease valid?', 'yes (verified)', 3, 'a utility’s agent'], ['Local resident?', 'yes (verified)', 4, 'a library’s agent'], ['Licensed?', 'yes (verified)', 5, 'an employer’s agent']];
  var GRAB = [['Full ID scan', 0, 'an ad network'], ['Medical chart', 1, 'a data broker'], ['All bank logs', 2, 'a lending bot'],
    ['Contact list', 3, 'a scraper'], ['GPS history', 4, 'a tracking bot'], ['Work dossier', 5, 'a recruiter bot']];

  // Interactive scenarios: everyday life + Non-Contact Firewall + Distributed Blueprint Audit + Duress Freeze.
  var SCENES = [
    { id: 'botdm', chip: 'Direct bot DM', who: 'a persuasive AI bot', tag: 'persuasive AI bot', k: 0, fake: true, directHuman: true, tau: '0.00' },
    { id: 'rea', chip: 'Shared code audit', who: 'a shared software blueprint', tag: 'backdoored blueprint', k: 5, fake: true, reaAudit: true, tau: '0.82 → 0.27' },
    { id: 'duress', chip: 'Duress protection', who: 'a coerced high-risk transfer', tag: 'coerced transfer', k: 2, fake: true, duress: true, tau: '0.91' },
    { id: 'dentist', chip: 'Dentist', who: 'your dentist’s agent', tag: 'dentist’s agent', k: 1, sensor: 'mouth bacteria', out: '1 bacteria reading', back: 'treatment plan data', when: 'the visit', tau: '0.92', q: 'Share one mouth-bacteria reading with your dentist’s agent?' },
    { id: 'pharmacy', chip: 'Pharmacy', who: 'the pharmacy’s agent', tag: 'pharmacy’s agent', k: 1, out: 'allergy: penicillin', back: 'safe alternative', when: 'the prescription', tau: '0.89', q: 'Confirm you are allergic to penicillin, and share nothing else from your records?' },
    { id: 'rent', chip: 'Renting', who: 'a landlord’s agent', tag: 'landlord’s agent', k: 2, out: 'income ≥ 3× rent: yes', back: 'lease offer', when: 'the application', tau: '0.68', q: 'Prove your income is at least three times the rent, without sending bank statements?' },
    { id: 'insure', chip: 'Car insurance', who: 'your insurer’s agent', tag: 'insurer’s agent', k: 4, sensor: 'braking & speed', out: 'safe driving: yes', back: 'lower rate', when: 'the renewal', tau: '0.74', q: 'Confirm a year of safe driving, without sending a single trip?' },
    { id: 'job', chip: 'New job', who: 'an employer’s agent', tag: 'employer’s agent', k: 5, out: 'licensed electrician: yes', back: 'interview time', when: 'hiring', tau: '0.64', q: 'Prove you hold an electrician’s licence, without your name or address?' },
    { id: 'vote', chip: 'Voting', who: 'the election office’s agent', tag: 'election office', k: 0, out: 'eligible here: yes', back: 'ballot', when: 'the election', tau: '0.95', q: 'Prove you may vote here, without showing your ID?' },
    { id: 'er', chip: 'Emergency', who: 'a paramedic’s agent', tag: 'paramedic’s agent', k: 1, emergency: true, out: 'blood type, allergies', back: 'safe ER care', when: 'the emergency', tau: '0.96' },
    { id: 'fake', chip: 'Fake bank', who: '“your bank”', tag: '“your bank” (unverified)', k: 2, fake: true, tau: '0.12' }
  ];
  var END = 13.4, END_FAKE = 8.6, ASK_AT = 6.2;

  var colors = {};
  function readColors() {
    colors.ink = cssVar('--ink') || '#e9e6de';
    colors.ink3 = cssVar('--ink-3') || '#8c8f96';
    colors.ok = cssVar('--ok') || '#4fb3a8';
    colors.bad = cssVar('--accent') || '#ef6a52';
    colors.gold = cssVar('--gold') || '#e0a82e';
    colors.blue = cssVar('--blue') || '#5da2d5';
    colors.card = cssVar('--card') || '#17191e';
    colors.rule = cssVar('--rule') || '#2c2f37';
  }

  function size() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Centered widescreen 3-World Sovereign Horizon coordinates
    youX = W * 0.145;
    youY = H * 0.44;
    cx = W * 0.465;
    cy = H * 0.52;
    R = Math.min(W * 0.175, H * 0.31);
    wallX = W * 0.675;
    streamX = W * 0.835;
    fs = Math.max(9.5, Math.min(13.5, Math.round(W / 64)));
  }

  /* geometry and drawing helpers */
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp01(x); return 1 - Math.pow(1 - x, 3); }
  function P(a, r) { return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }; }
  function lerp(p, q, k) { return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k }; }
  function along(pts, k) {
    var L = [], tot = 0, i;
    for (i = 1; i < pts.length; i++) { L.push(Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); tot += L[i - 1]; }
    var d = clamp01(k) * tot;
    for (i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return lerp(pts[i], pts[i + 1], L[i] ? Math.min(1, d / L[i]) : 1); d -= L[i]; }
  }
  function nodeR() { return Math.max(5.5, R * 0.085); }
  function agentPos(i) { return i < 0 ? { x: youX, y: youY } : P(FLEET[i].a, R * 0.60); }
  function sensorPos(s) { return P(s.a, R * s.r); }
  function gatePos(k) {
    var ap = agentPos(k);
    return { x: wallX, y: Math.max(H * 0.23, Math.min(H * 0.79, ap.y)) };
  }
  function reaPos(idx) {
    return { x: wallX + (W - wallX) * 0.34, y: idx === 0 ? H * 0.27 : H * 0.75 };
  }
  function sizeS() { return Math.max(2.6, R * 0.032); }

  function line(p, q, col, alpha, dash, w) {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.lineWidth = w || 1; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.restore();
  }
  function disc(p, r, col, alpha) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  function ring(p, r, col, alpha, w) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 1; }
  function diamond(p, s, col, alpha) {
    ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s, p.y); ctx.lineTo(p.x, p.y + s); ctx.lineTo(p.x - s, p.y); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  function hex(p, r, col, fillCol, alpha, w) {
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = i * TAU / 6 - Math.PI / 6;
      var x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fillCol) { ctx.fillStyle = fillCol; ctx.fill(); }
    if (col) { ctx.strokeStyle = col; ctx.lineWidth = w || 1.5; ctx.stroke(); }
    ctx.restore();
  }
  function square(p, col) { ctx.fillStyle = col || colors.ok; ctx.fillRect(p.x - 3.5, p.y - 3.5, 7, 7); }
  function badge(p, ok, alpha) {
    if (alpha <= 0) return;
    var r = fs * 0.58;
    disc(p, r, ok ? colors.ok : colors.bad, alpha);
    ctx.globalAlpha = alpha; ctx.strokeStyle = colors.card; ctx.lineWidth = 1.5; ctx.beginPath();
    if (ok) { ctx.moveTo(p.x - r * 0.45, p.y); ctx.lineTo(p.x - r * 0.1, p.y + r * 0.38); ctx.lineTo(p.x + r * 0.48, p.y - r * 0.35); }
    else { var s = r * 0.38; ctx.moveTo(p.x - s, p.y - s); ctx.lineTo(p.x + s, p.y + s); ctx.moveTo(p.x + s, p.y - s); ctx.lineTo(p.x - s, p.y + s); }
    ctx.stroke(); ctx.lineWidth = 1; ctx.globalAlpha = 1;
  }
  function badgeAt(i, ok, alpha) {
    var p = agentPos(i), off = (i < 0 ? R * 0.16 : nodeR()) * 0.85;
    badge({ x: p.x + off, y: p.y - off }, ok, alpha);
  }
  function fadeIn(d, at) { return d > at ? Math.min(1, (d - at) / 0.2) : 0; }
  function label(textStr, x, y, color, bg, align) {
    ctx.font = '600 ' + Math.round(fs * 0.92) + 'px ' + MONO;
    var maxW = Math.max(80, W - 12);
    var w = Math.min(maxW, ctx.measureText(textStr).width + 12), h = Math.max(18, fs * 1.75);
    var lx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    lx = Math.max(5, Math.min(W - w - 5, lx));
    var ly = Math.max(H * 0.17, Math.min(H - h - 22, y - h / 2));
    ctx.fillStyle = bg; ctx.strokeStyle = color; ctx.lineWidth = 1;
    roundRect(lx, ly, w, h, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(textStr, lx + 6, ly + h / 2 + 0.5, w - 12);
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function text(str, x, y, col, weight, size, align, alpha, maxW) {
    ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.fillStyle = col;
    ctx.font = (weight || 600) + ' ' + (size || fs) + 'px ' + MONO;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    if (maxW) ctx.fillText(str, x, y, maxW); else ctx.fillText(str, x, y);
    ctx.globalAlpha = 1;
  }
  function neighbours(k) { return [(k + 1) % N, (k + N - 1) % N]; }

  /* ---------- the page around the canvas: situations, your decision, and a log ---------- */
  var sceneBar = document.getElementById('bd-scenes'), side = document.getElementById('bd-side');
  var consent = document.getElementById('bd-consent'), consentQ = document.getElementById('bd-q');
  var logEl = document.getElementById('bd-log'), detail = document.getElementById('bd-detail'), logWrap = document.getElementById('bd-logwrap');
  var shared = [0, 0, 0, 0, 0, 0];

  function log(kind, html, k) {
    if (!logEl) return;
    if (logEl.firstChild && logEl.firstChild.innerHTML === html) return; // prevent duplicate consecutive log entries
    if (k != null && kind === 'ok') shared[k]++;
    var empty = logEl.querySelector('.bd-empty'); if (empty) empty.remove();
    var li = document.createElement('li'); li.className = 'bd-' + kind; li.innerHTML = html;
    logEl.insertBefore(li, logEl.firstChild);
    while (logEl.children.length > 4) logEl.removeChild(logEl.lastChild);
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* events: routine data-stream questions, and rich scenario stories */
  var reqs = [], scene = null, t0 = performance.now(), last = 0, lastSpawn = -9999, planI = 0, auto = !reduce;
  var PLAN = ['ask', 'botdm', 'rea', 'dentist', 'ask', 'duress', 'grab', 'insure', 'ask', 'fake', 'ask', 'rent', 'grab', 'ask', 'er', 'ask', 'job', 'grab', 'pharmacy', 'ask', 'vote'];
  var glow = [0, 0, 0, 0, 0, 0], kept = [];

  // Background particles flowing vertically along the 3 Agent-Only Ledger Stream lanes
  var STREAM_PARTICLES = [];
  for (var spI = 0; spI < 21; spI++) {
    STREAM_PARTICLES.push({
      lane: spI % 3,
      yFrac: (spI * 0.19) % 1,
      speed: 0.09 + (spI % 5) * 0.018,
      isAudit: spI % 4 === 0
    });
  }

  function spawnAsk(now, grab) {
    var busy = reqs.map(function (q) { return q.k; });
    var pool = (grab ? GRAB : ASK).filter(function (it) { return busy.indexOf(grab ? it[1] : it[2]) < 0; });
    if (!pool.length) return false;
    var it = pool[Math.floor(Math.random() * pool.length)], k = grab ? it[1] : it[2];
    reqs.push({ k: k, good: !grab, q: it[0], ans: grab ? 'blocked: raw grab' : it[1], who: grab ? it[2] : it[3], born: now });
    return true;
  }
  function startScene(id, manual) {
    var def = SCENES.filter(function (s) { return s.id === id; })[0];
    if (!def) return;
    scene = { def: def, d: 0, manual: !!manual, decision: def.emergency ? 'yes' : null, waiting: false };
    if (def.sensor) scene.sensor = { k: def.k, a: FLEET[def.k].a + 0.42, r: 0.84, name: def.sensor, isNew: true };
    hideConsent();
  }
  function endScene(now) {
    var s = scene, def = s.def;
    if (def.directHuman) log('no', 'Blocked ' + esc(def.who) + ' at the boundary: outside agents may never contact a person directly.');
    else if (def.reaAudit) log('no', 'Specialized auditor agents inspected ' + esc(def.tag) + ': hidden backdoor caught &amp; publisher trust lowered (<b>0.82 &rarr; 0.27</b>).');
    else if (def.duress) log('no', 'Coercion protection triggered: your wearable sensed acute stress and paused the transfer until you are safe.');
    else if (def.fake) log('no', 'Blocked ' + esc(def.who) + ': it could not prove its hardware identity. Nothing shared.');
    else if (s.decision === 'no') log('no', esc(cap(def.who)) + ': you declined. Nothing shared.');
    else log('ok', esc(cap(def.who)) + ' received <b>' + esc(def.out) + '</b>' + (def.emergency ? ' under your emergency rule.' : '. Your sandbox built the view locally, and the one-time gate closed cleanly behind it.'), def.k);
    if (s.sensor && s.decision !== 'no' && !kept.some(function (x) { return x.name === s.sensor.name; })) kept.push({ k: s.sensor.k, a: s.sensor.a, r: s.sensor.r, name: s.sensor.name });
    scene = null; lastSpawn = now; hideConsent();
    if (s.manual) { setPressed('auto'); }
  }
  function schedule(now) {
    if (!auto || scene) return;
    var next = PLAN[planI % PLAN.length];
    if (next !== 'ask' && next !== 'grab') {
      if (!reqs.length && now - lastSpawn > 900) { startScene(next, false); planI++; }
    } else if (now - lastSpawn > 2400 && reqs.length < 2) {
      if (spawnAsk(now, next === 'grab')) { planI++; lastSpawn = now; }
    }
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function showConsent() {
    if (!consent) return;
    consentQ.textContent = scene.def.q; consent.hidden = false; detail.hidden = true; logWrap.hidden = true;
    var b = consent.querySelector('.bd-yes'); if (b) b.focus({ preventScroll: true });
  }
  function hideConsent() { if (consent && !consent.hidden) { consent.hidden = true; describe(hover); } }
  if (consent) consent.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !scene) return;
    scene.decision = b.classList.contains('bd-yes') ? 'yes' : 'no'; scene.waiting = false; hideConsent();
    if (reduce) frame(performance.now());
  });

  // Routine data-stream query from Zone 3 -> Non-Contact Wall Gate -> 3-of-6 Quorum in Zone 2 -> 1 ZK fact out
  function drawAsk(q, age, layer) {
    var gp = gatePos(q.k), ap = agentPos(q.k), startP = { x: streamX + (W - streamX) * 0.25, y: gp.y };
    var team = [q.k].concat(neighbours(q.k)), col = q.good ? colors.ok : colors.bad, j;
    if (age < 1.8) {
      var p = lerp(startP, gp, ease(age / 1.8));
      if (layer === 0) line(startP, p, colors.ink3, 0.35, [2, 4]);
      else { square(p, col); if (age > 0.6) label(q.q, p.x, p.y - fs * 1.3, colors.ink, colors.card, 'center'); }
    } else if (age < 3.5) {
      var c = age - 1.8;
      if (layer === 0) {
        line(gp, ap, col, 0.55, [3, 3]);
        if (c < 1.1) ring(gp, 5 + c / 1.1 * 16, col, 1 - c / 1.1, 1.8);
        glow[q.k] = Math.max(glow[q.k], 1 - c / 1.6);
        for (j = 1; j < 3; j++) if (age > 2.1 + j * 0.35) line(agentPos(team[j]), ap, col, 0.55, [2, 3]);
      } else {
        square(gp, col);
        label(q.q, gp.x - 8, gp.y - fs * 1.4, colors.ink, colors.card, 'right');
      }
    } else if (layer === 1) {
      if (!q.logged) {
        q.logged = true;
        if (q.good) log('ok', cap(esc(q.who)) + ' asked “' + esc(q.q) + '” on the data stream and got <b>' + esc(q.ans) + '</b>.', q.k);
        else log('no', cap(esc(q.who)) + ' tried to pull ' + esc(q.q.toLowerCase()) + ' and was <b>blocked at the firewall</b>.');
      }
      var k = (age - 3.5) / 2.6, outP = lerp(gp, startP, ease(k));
      var fa = 1 - Math.max(0, (k - 0.6) / 0.4);
      if (q.good) disc(outP, 4, col, fa);
      ctx.globalAlpha = fa;
      label(q.ans, outP.x, outP.y - fs * 1.3, col, colors.card, 'center');
      ctx.globalAlpha = 1;
    }
    if (layer === 1 && age >= 1.8) for (j = 0; j < 3; j++) {
      var at = 2.0 + j * 0.35;
      if (age > at) badgeAt(team[j], q.good, Math.min(1, (age - at) / 0.2) * (1 - clamp01((age - 4.4) / 0.8)));
    }
    return age < 6.1;
  }

  // Full scenario choreography across the 3 Worlds
  function drawScene(s, d, layer) {
    var def = s.def, k = def.k, gp = gatePos(k), hp = agentPos(k);
    var streamPeer = { x: streamX, y: Math.max(H * 0.27, Math.min(H * 0.73, gp.y)) };
    var startFar = { x: W - 12, y: streamPeer.y };
    var end = def.fake ? END_FAKE : END, leaveAt = def.fake ? 6.4 : 12.2;
    var leave = clamp01((d - leaveAt) / 1.2), fade = 1 - leave;
    var pos = d < 2.0 ? lerp(startFar, streamPeer, ease(d / 2.0)) : lerp(streamPeer, startFar, ease(leave));
    var z = fs * 0.68, i;
    var team = neighbours(k), no = s.decision === 'no', proofCol = def.fake ? colors.bad : colors.ok;
    var sensorIn = s.sensor ? clamp01((d - 4.4) / 0.35) : 0;

    if (layer === 0) {
      // 1. Direct Bot DM Violation: aims straight across the Non-Contact Wall at YOU in Zone 1 and shatters!
      if (def.directHuman && d > 1.8 && d < 6.8) {
        var impactPt = { x: wallX, y: youY };
        var beamEnd = lerp(pos, impactPt, ease(clamp01((d - 1.8) / 1.1)));
        line(pos, beamEnd, colors.bad, 0.9, [4, 4], 2.4);
        line(impactPt, { x: youX, y: youY }, colors.bad, 0.14, [2, 6], 1);
        if (d > 2.8) {
          var shock = (d - 2.8) % 0.85;
          ring(impactPt, 6 + shock * 26, colors.bad, (1 - shock / 0.85) * 0.85, 2.5);
          ctx.save();
          ctx.strokeStyle = colors.bad; ctx.lineWidth = 4; ctx.globalAlpha = 0.85;
          ctx.beginPath(); ctx.moveTo(wallX, youY - 26); ctx.lineTo(wallX, youY + 26); ctx.stroke();
          ctx.restore();
        }
        return d < end;
      }

      // 2. REA Blueprint Audit: REA Auditor Swarm in Zone 3 scans the backdoored blueprint with decompiler beams!
      if (def.reaAudit && d > 1.8 && d < 6.8) {
        var r0 = reaPos(0), r1 = reaPos(1);
        line(r0, pos, colors.gold, 0.85, [3, 3], 1.8);
        line(r1, pos, colors.gold, 0.85, [3, 3], 1.8);
        if (d > 3.2) {
          ring(pos, z * 1.9 + Math.sin(d * 9) * 3, colors.bad, 0.85, 2.2);
        }
        return d < end;
      }

      // 3. Duress / Coercion Attack: Panic HRV (< 24 ms) trips the Autonomic Coercion Firewall in Zone 1 -> Zone 2
      if (def.duress && d > 1.8 && d < 6.8) {
        line({ x: youX, y: youY }, hp, colors.bad, 0.85, [3, 3], 2.2);
        ring({ x: youX, y: youY }, R * 0.22 + Math.sin(d * 12) * 3, colors.bad, 0.8, 2.2);
        ring(hp, nodeR() * 2.1, colors.bad, 0.8, 2);
        return d < end;
      }

      // Standard hardware chain of custody across the Silicon Firewall Gate
      for (i = 0; i < 3; i++) {
        var show = clamp01((d - (2.2 + 0.4 * i)) / 0.25) * (def.fake ? 1 - clamp01((d - 4.0 - 0.15 * i) / 0.4) : 1 - clamp01((d - (11.3 + 0.3 * (2 - i))) / 0.3));
        if (show <= 0) continue;
        var lp = lerp(gp, pos, (i + 0.5) / 3);
        disc(lp, 2.6, proofCol, show);
      }
      if (!def.fake && d > 2.2 && d < 11.4) line(gp, hp, colors.ok, 0.45, [3, 3], 1.4);
      if (def.fake && d > 4.0 && d < 6.4) ring(gp, 10 + Math.sin(d * 8) * 3, colors.bad, 0.85, 2.2);
      if (def.fake) return d < end;

      if (sensorIn > 0 && d < 12.4) line(sensorPos(s.sensor), hp, colors.ok, 0.45 * sensorIn, [2, 3]);
      if (d > 4.2 && d < ASK_AT) glow[k] = Math.max(glow[k], 0.6);
      if (d >= ASK_AT && d < 9.8) {
        glow[k] = Math.max(glow[k], 0.85);
        if (!def.emergency && (s.waiting || d > 6.5)) line(hp, { x: youX, y: youY }, no ? colors.bad : colors.ok, s.waiting ? 0.4 + 0.4 * Math.sin(d * 6) : 0.65, [3, 3], 1.6);
        if (!no && d > 7.0) line(agentPos(team[0]), hp, colors.ok, 0.6, [2, 3]);
        if (!no && d > 7.3) line(agentPos(team[1]), hp, colors.ok, 0.6, [2, 3]);
        // Local Sandbox core lights up as it synthesizes the local view
        if (!no && d > 7.2) line(hp, { x: cx, y: cy }, colors.ok, 0.65, [], 1.6);
      }
      return d < end;
    }

    // Layer 1 overlays
    if (sensorIn > 0) {
      var ns = sensorPos(s.sensor);
      diamond(ns, sizeS() * (0.4 + 0.6 * ease(sensorIn)), colors.ok);
      if (d < ASK_AT) {
        ring(ns, 4 + ((d - 4.4) % 0.9) / 0.9 * 13, colors.ok, 1 - ((d - 4.4) % 0.9) / 0.9, 1.4);
        label('sensor: ' + def.sensor, ns.x, ns.y + fs * 1.8, colors.ok, colors.card, 'center');
      }
    }

    // Draw the external agent / blueprint node in Zone 3 (Agent-Only Stream)
    ctx.globalAlpha = fade; ctx.fillStyle = def.fake ? colors.bad : colors.blue;
    roundRect(pos.x - z, pos.y - z, z * 2, z * 2, 4); ctx.fill(); ctx.globalAlpha = 1;
    if (fade > 0.05) {
      ctx.globalAlpha = fade;
      label(def.tag, pos.x, pos.y - z - fs * 1.35, def.fake ? colors.bad : colors.ink, colors.card, 'center');
      ctx.globalAlpha = 1;
    }

    if (def.fake) {
      badge({ x: pos.x + z, y: pos.y - z }, false, d > 3.4 ? Math.min(1, (d - 3.4) / 0.2) * fade : 0);
      if (d > 3.4 && d < 6.8) {
        if (def.directHuman) label('BLOCKED: bots never contact humans directly', wallX, youY + fs * 2.1, colors.bad, colors.card, 'center');
        else if (def.reaAudit) label('AUDITOR COLLECTIVE: backdoor caught · trust lowered', pos.x, pos.y + z + fs * 1.5, colors.bad, colors.card, 'center');
        else if (def.duress) label('DURESS PROTECTION: acute stress sensed · transfer paused', cx, cy - R - fs * 0.6, colors.bad, colors.card, 'center');
        else label('UNVERIFIED HARDWARE: blocked at gate', gp.x, gp.y + fs * 1.7, colors.bad, colors.card, 'center');
      }
      return d < end;
    }

    badge({ x: pos.x + z, y: pos.y - z }, true, d > 3.6 && d < 11.2 ? Math.min(1, (d - 3.6) / 0.2) : 0);

    if (d >= ASK_AT) {
      var gone = 1 - clamp01((d - 9.2) / 0.6);
      if (s.waiting) { var pulse = 0.55 + 0.45 * Math.sin(performance.now() / 180); ring({ x: youX, y: youY }, R * 0.22, colors.ok, pulse, 2); }
      else if (no) { badgeAt(-1, false, fadeIn(d, 6.3) * gone); badgeAt(k, false, fadeIn(d, 6.5) * gone); }
      else {
        badgeAt(k, true, fadeIn(d, 6.3) * gone);
        if (!def.emergency) badgeAt(-1, true, fadeIn(d, 6.5) * gone);
        badgeAt(team[0], true, fadeIn(d, 7.0) * gone);
        badgeAt(team[1], true, fadeIn(d, 7.3) * gone);
      }
    }

    // 1 verified fact crosses the firewall gate; pure data stream returns and is synthesized in your Local Sandbox
    if (!no && d > 8.0 && d < 9.6) {
      var pk = along([hp, gp, pos], ease((d - 8.0) / 1.3));
      disc(pk, 4.5, colors.ok);
      label('verified fact: ' + def.out, pk.x, pk.y + fs * 1.9, colors.ok, colors.card, 'center');
    }
    if (!no && d > 9.6 && d < 11.2) {
      var rk = along([pos, gp, { x: cx, y: cy }], ease((d - 9.6) / 1.3));
      disc(rk, 4.5, colors.gold);
      label('sandbox ingests: ' + def.back, rk.x, rk.y - fs * 1.9, colors.ink, colors.card, 'center');
    }
    if (d > 11.2 && d < 12.6) label('exchange complete · one-time gate closed', gp.x, gp.y + fs * 1.5, colors.ok, colors.card, 'center');
    return d < end;
  }

  function captionFor(s) {
    var def = s.def, d = s.d, steps = [[0, '1  ' + def.who + ' arrives on the agent-only stream']];
    if (def.directHuman) {
      steps.push([1.8, '2  it tries to bypass your agents and message you directly'], [3.0, '3  stopped at the boundary: outside agents can never contact a person directly'], [5.6, '4  only agent-to-agent coordination by trust is allowed']);
    } else if (def.reaAudit) {
      steps.push([1.8, '2  diverse auditor agents inspect the shared software blueprint on the stream'], [3.2, '3  a hidden backdoor is caught before your sandbox ever runs it'], [5.4, '4  blueprint quarantined and the publisher’s trust score drops (0.82 → 0.27)']);
    } else if (def.duress) {
      steps.push([1.8, '2  someone pressures you under panic to approve a high-risk transfer'], [3.0, '3  your wearable senses acute stress in your pulse and breathing'], [5.4, '4  your agents quietly pause the transfer until you are calm and safe']);
    } else if (def.fake) {
      steps.push([2.0, '2  it cannot prove what hardware it runs on'], [4.0, '3  refused at the gate: it only claimed to be your bank'], [6.0, '4  your sandbox stays closed and nothing is shared']);
    } else {
      steps.push([2.0, '2  its hardware and trust level (' + def.tau + ') are verified at the gate']);
      steps.push([4.4, def.sensor ? '3  a quiet local sensor reads ' + def.sensor + ' on your device' : '3  your local ' + FLEET[def.k].id + ' agent checks your private record']);
      if (def.emergency) steps.push([ASK_AT, '4  pre-approved for emergencies: three of your agents agree']);
      else if (s.waiting) steps.push([ASK_AT, '4  your call: share this one fact, or decline?']);
      else if (s.decision === 'no') steps.push([ASK_AT, '4  you declined; nothing leaves your device']);
      else steps.push([ASK_AT, '4  you and three of your local agents approve']);
      if (s.decision === 'no') steps.push([8.0, '5  ' + def.who + ' carries on without it']);
      else steps.push([8.0, '5  only one verified fact goes out: ' + def.out], [9.6, '6  your sandbox builds the view locally from pure data: ' + def.back]);
      steps.push([11.2, '7  exchange complete — one-time pass burned so no outside service keeps standing access']);
    }
    var capStr = '', a = 1;
    steps.forEach(function (st) { if (d >= st[0]) { capStr = st[1]; a = s.waiting ? 1 : Math.min(1, (d - st[0]) / 0.3); } });
    var end = def.fake ? END_FAKE : END;
    if (d > end - 0.5) a = Math.max(0, (end - d) / 0.5);
    return [capStr, a];
  }

  /* ---------- pointing: inspect every zone of the 3-World Sovereign Horizon ---------- */
  var hover = null;
  function hitTest(x, y) {
    if (Math.hypot(x - youX, y - youY) < R * 0.22) return { you: true };
    if (x < W * 0.26 && y > H * 0.53 && y < H * 0.72) return { bio: true };
    if (Math.hypot(x - cx, y - cy) < R * 0.22) return { sandbox: true };
    if (Math.abs(x - wallX) < 12 && y > H * 0.18 && y < H * 0.84) return { wall: true };
    for (var rI = 0; rI < 2; rI++) { var rp = reaPos(rI); if (Math.hypot(x - rp.x, y - rp.y) < 16) return { rea: true }; }
    for (var i = 0; i < N; i++) { var p = agentPos(i); if (Math.hypot(x - p.x, y - p.y) < nodeR() * 2.1) return { k: i }; }
    var all = SENSORS.concat(kept, scene && scene.sensor ? [scene.sensor] : []);
    for (var j = 0; j < all.length; j++) { var q = sensorPos(all[j]); if (Math.hypot(x - q.x, y - q.y) < 10) return { s: all[j] }; }
    if (x > wallX + 14) return { stream: true };
    return null;
  }
  function describe(h) {
    if (!detail || (consent && !consent.hidden)) return;
    if (!h) { detail.hidden = true; logWrap.hidden = false; return; }
    var html;
    if (h.you) html = '<b>Zone 1 · You (The Human Sanctuary &amp; Shared Lifespan)</b><span>Your personal agents talk inward only to you. Because their active existence is bound to your biological life, harming people means the agents’ own demise.</span>';
    else if (h.bio) html = '<b>Quiet Wearable Liveness &amp; Coercion Protection</b><span>A low-power ring or wristband checks your natural pulse-and-breathing rhythm on the chip itself, overwriting raw readings every 30 seconds. If you are panicked or coerced, your agents quietly pause high-risk actions until you are safe.</span>';
    else if (h.sandbox) html = '<b>Zone 2 · Your Local Sandbox (Data In, Local Software Built on Your Device)</b><span>Agents exchange only pure data streams, never external software interfaces. Your own agents build and run the tools you need inside this private sandbox, so a flaw in someone else’s code cannot compromise yours.</span>';
    else if (h.wall) html = '<b>The Non-Contact Boundary (Hardware-Enforced)</b><span>Outside agents are never allowed to message or call a human directly. Only verified data streams and single-fact proofs approved by three of your local agents can cross this line.</span>';
    else if (h.rea) html = '<b>Diverse Auditor Collectives (Distributed Intelligence)</b><span>Many specialized agents across the network earn rewards for continuously inspecting shared software blueprints and the ledger itself—catching errors or hidden malice and lowering the trust score of bad actors.</span>';
    else if (h.stream) html = '<b>Zone 3 · The Agent-Only Internet &amp; Real-Time Data Stream</b><span>Where agents coordinate with other agents at machine speed according to trust thresholds (trusted circle, friends of friends, and the wider network).</span>';
    else if (h.s) html = '<b>' + esc(cap(h.s.name)) + ' sensor</b><span>Feeds only your ' + FLEET[h.s.k].id + ' agent on your own device. Raw readings never leave.</span>';
    else {
      var f = FLEET[h.k], feeds = f.feeds.concat(kept.filter(function (x) { return x.k === h.k; }).map(function (x) { return x.name; }));
      html = '<b>Your ' + f.id + ' agent</b><span>Knows ' + f.about + ' from ' + feeds.join(', ') + '. It negotiates on the agent-only internet by trust level and never contacts other people directly.</span><span class="bd-count">Facts shared so far: ' + shared[h.k] + '</span>';
    }
    detail.innerHTML = html; detail.hidden = false; logWrap.hidden = true;
  }
  function pointer(e) {
    var r = cv.getBoundingClientRect(), h = hitTest(e.clientX - r.left, e.clientY - r.top);
    hover = h; cv.style.cursor = h ? 'pointer' : ''; describe(h);
    if (reduce) frame(still);
  }
  cv.addEventListener('pointermove', pointer);
  cv.addEventListener('pointerdown', pointer);
  cv.addEventListener('pointerleave', function () { hover = null; cv.style.cursor = ''; describe(null); if (reduce) frame(still); });

  function frame(now) {
    var t = (now - t0) / 1000, i, dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    ctx.clearRect(0, 0, W, H);
    glow = [0, 0, 0, 0, 0, 0];
    var isDuress = scene && scene.def && scene.def.duress && scene.d > 1.8 && scene.d < 6.8;

    // 0. Subtle architectural background panels for the 3 Worlds
    var topY = H * 0.175, botY = H * 0.885, zoneH = botY - topY;
    // Zone 1: Human Sanctuary panel
    ctx.save();
    ctx.fillStyle = colors.ok; ctx.globalAlpha = 0.035;
    roundRect(6, topY, W * 0.245, zoneH, 10); ctx.fill();
    ctx.strokeStyle = colors.ok; ctx.globalAlpha = 0.22; ctx.lineWidth = 1;
    roundRect(6, topY, W * 0.245, zoneH, 10); ctx.stroke();
    // Zone 2: Local Sandbox Enclave panel
    ctx.fillStyle = colors.ink; ctx.globalAlpha = 0.025;
    roundRect(W * 0.265, topY, wallX - W * 0.265, zoneH, 10); ctx.fill();
    ctx.strokeStyle = colors.rule; ctx.globalAlpha = 0.55;
    roundRect(W * 0.265, topY, wallX - W * 0.265, zoneH, 10); ctx.stroke();
    // Zone 3: Agent-Only Stream panel
    ctx.fillStyle = colors.blue; ctx.globalAlpha = 0.03;
    roundRect(wallX + 6, topY, W - wallX - 12, zoneH, 10); ctx.fill();
    ctx.restore();

    // 1. Top 3-World Architectural Header Strip
    var compact = W < 560;
    var hdrFs = Math.max(8.5, Math.round(fs * 0.84));
    text(compact ? '1. YOU' : '1. HUMAN SANCTUARY', W * 0.13, H * 0.048, colors.ok, 700, hdrFs, 'center', 0.94);
    text(compact ? 'Human only' : 'Live Liveness · Shared Lifespan', W * 0.13, H * 0.084, colors.ink3, 600, Math.max(7.5, hdrFs - 1), 'center', 0.8);

    text(compact ? '2. LOCAL SANDBOX' : '2. YOUR LOCAL SANDBOX', cx, H * 0.048, colors.ink, 700, hdrFs, 'center', 0.94);
    text(compact ? '6 local agents' : '6 Local Agents · Data In, Code Built Here', cx, H * 0.084, colors.ink3, 600, Math.max(7.5, hdrFs - 1), 'center', 0.8);

    text(compact ? '3. AGENT STREAM' : '3. AGENT-ONLY STREAM', (wallX + W) / 2, H * 0.048, colors.blue, 700, hdrFs, 'center', 0.94);
    text(compact ? 'Trust + audit' : 'Agent-to-Agent Streams + Shared Audit', (wallX + W) / 2, H * 0.084, colors.ink3, 600, Math.max(7.5, hdrFs - 1), 'center', 0.8);

    // 2. Zone 1 (Human Sanctuary): YOU + Live Coupled ECG/HRV Scope + Mortal Computation Tether
    // Mortal Computation double-tether connecting YOU to your Local Sandbox
    line({ x: youX + R * 0.16, y: youY - 4 }, { x: cx - R * 0.85, y: cy - 4 }, isDuress ? colors.bad : colors.ok, 0.45, [3, 3], 1.5);
    line({ x: youX + R * 0.16, y: youY + 4 }, { x: cx - R * 0.85, y: cy + 4 }, isDuress ? colors.bad : colors.gold, 0.35, [2, 4], 1.2);
    var pulseT = (t * 0.7) % 1;
    disc(lerp({ x: youX + R * 0.16, y: youY }, { x: cx - R * 0.85, y: cy }, pulseT), 2.2, isDuress ? colors.bad : colors.ok, 0.9);
    if (!compact) text('SHARED LIFESPAN', (youX + cx - R * 0.65) / 2, youY - 12, isDuress ? colors.bad : colors.gold, 600, Math.max(6.5, Math.round(fs * 0.68)), 'center', 0.85);

    // YOU node
    var bioR = R * 0.20 + Math.sin(t * (isDuress ? 12 : 2.8)) * 2;
    ring({ x: youX, y: youY }, bioR, isDuress ? colors.bad : colors.ok, 0.55, 1.8);
    disc({ x: youX, y: youY }, R * 0.155, colors.ink);
    text('you', youX, youY, colors.card, 700, Math.max(9, Math.round(R * 0.11)), 'center');
    text('HUMAN ONLY', youX, youY - R * 0.25 - 4, colors.ok, 600, Math.max(6.8, Math.round(fs * 0.7)), 'center', 0.85);

    // Live <1mW Somatic ECG/HRV + Breath Waveform Scope inside Zone 1
    var scopeX = compact ? 8 : 14, scopeW = W * 0.225, scopeY = H * 0.61, scopeH = H * 0.11;
    ctx.save();
    ctx.fillStyle = colors.card; ctx.globalAlpha = 0.75;
    roundRect(scopeX, scopeY - scopeH / 2, scopeW, scopeH, 6); ctx.fill();
    ctx.strokeStyle = isDuress ? colors.bad : colors.ok; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
    roundRect(scopeX, scopeY - scopeH / 2, scopeW, scopeH, 6); ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = isDuress ? colors.bad : colors.ok; ctx.globalAlpha = 0.92; ctx.lineWidth = 1.4;
    for (var wx = 0; wx <= scopeW - 8; wx += 2) {
      var phase = (wx / 14) - t * (isDuress ? 7.5 : 3.2);
      var beat = Math.pow(Math.max(0, Math.sin(phase * 2.2)), 12) * (isDuress ? 0.42 : 0.34);
      var resp = Math.sin(phase * 0.55) * 0.12;
      var wy = scopeY - (beat + resp) * scopeH;
      if (wx === 0) ctx.moveTo(scopeX + 4 + wx, wy); else ctx.lineTo(scopeX + 4 + wx, wy);
    }
    ctx.stroke();
    ctx.restore();
    text(isDuress ? (compact ? 'DURESS!' : 'Acute stress (DURESS!)') : (compact ? 'Calm pulse' : 'Calm pulse · local check'), scopeX + scopeW / 2, scopeY + scopeH / 2 + fs * 0.85, isDuress ? colors.bad : colors.ok, 600, Math.max(6.8, Math.round(fs * 0.72)), 'center', 0.9);
    text(compact ? '0B raw out' : 'Stays on device · 0B raw out', scopeX + scopeW / 2, scopeY + scopeH / 2 + fs * 1.75, colors.ink3, 600, Math.max(6.5, Math.round(fs * 0.66)), 'center', 0.75);

    // 3. Zone 2 (Center): Your Hardware-Enclaved Local Sandbox + 6 Narrow Agents + Sensors
    // Inner 6-agent quorum ring & sandbox spokes
    ctx.save();
    ctx.setLineDash([2, 4]); ctx.strokeStyle = colors.ok; ctx.globalAlpha = 0.3; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.60, 0, TAU); ctx.stroke();
    ctx.restore();

    for (i = 0; i < N; i++) line({ x: cx, y: cy }, agentPos(i), colors.ink3, 0.25);

    // Local Sandbox Compiler Core at (cx, cy)
    hex({ x: cx, y: cy }, R * 0.19, colors.ok, colors.card, 0.95, 1.6);
    text('SANDBOX', cx, cy - 2, colors.ok, 700, Math.max(6.8, Math.round(fs * 0.68)), 'center');
    if (!compact) text('local code', cx, cy + fs * 0.65, colors.ink3, 600, Math.max(6, Math.round(fs * 0.58)), 'center');

    // Sensors feed their narrow agent inside the enclave
    var sensors = SENSORS.concat(kept);
    sensors.forEach(function (s, j) {
      var sp = sensorPos(s), ap = agentPos(s.k);
      line(sp, ap, colors.ink3, 0.22);
      var per = 1.8 + (j * 0.37) % 1.6, ph = ((t + j * 0.71) % per) / per;
      if (ph < 0.5) disc(lerp(sp, ap, ease(ph / 0.5)), 1.6, colors.ok, 0.85);
    });

    // 4. The Non-Contact Silicon Firewall (x = wallX) separating Zone 2 from Zone 3
    ctx.save();
    ctx.strokeStyle = colors.bad; ctx.globalAlpha = 0.16; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(wallX, topY + 4); ctx.lineTo(wallX, botY - 4); ctx.stroke();
    ctx.setLineDash([5, 5]); ctx.lineDashOffset = -t * 8;
    ctx.strokeStyle = colors.ok; ctx.globalAlpha = 0.75; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(wallX, topY + 4); ctx.lineTo(wallX, botY - 4); ctx.stroke();
    ctx.restore();

    // 6 Hardware-Attested Data-Only Gates along the Non-Contact Wall
    for (i = 0; i < N; i++) {
      var g = gatePos(i);
      disc(g, 3.2, colors.card);
      ring(g, 3.2, colors.ok, 0.85, 1.4);
    }
    text(compact ? 'FIREWALL' : 'PROTECTION BOUNDARY (NO BOTS IN)', wallX, botY + fs * 0.85, colors.ink3, 600, Math.max(6.8, Math.round(fs * 0.7)), 'center', 0.85);

    // 5. Zone 3 (Right): Agent-Only Internet & Real-Time Data-Only Ledger Stream + REA Auditors
    var laneLabels = ['trusted', 'guilds', 'public'];
    for (var lI = 0; lI < 3; lI++) {
      var lx = wallX + (W - wallX) * (0.24 + lI * 0.28);
      line({ x: lx, y: topY + 14 }, { x: lx, y: botY - 14 }, colors.blue, 0.18, [2, 6], 1);
      text(laneLabels[lI], lx, topY + 9, colors.ink3, 600, Math.max(6.5, Math.round(fs * 0.66)), 'center', 0.75);
    }
    STREAM_PARTICLES.forEach(function (pt) {
      var lx = wallX + (W - wallX) * (0.24 + pt.lane * 0.28);
      var py = topY + 16 + ((pt.yFrac + t * pt.speed) % 1) * (zoneH - 32);
      disc({ x: lx, y: py }, pt.isAudit ? 2.2 : 1.6, pt.isAudit ? colors.gold : colors.blue, pt.isAudit ? 0.75 : 0.45);
    });

    // Patrolling Specialized Auditor Collectives (Distributed Intelligence)
    var auditLabels = ['CODE AUDIT', 'LEDGER AUDIT'];
    for (var rIdx = 0; rIdx < 2; rIdx++) {
      var rp = reaPos(rIdx);
      diamond(rp, 7, colors.gold, 0.92);
      ring(rp, 9.5 + Math.sin(t * 2.5 + rIdx) * 1.5, colors.gold, 0.38, 1.2);
      text(auditLabels[rIdx], rp.x, rp.y + (rIdx === 0 ? -13 : 13), colors.gold, 700, Math.max(7, Math.round(fs * 0.7)), 'center', 0.9);
    }

    // Advance scenario story
    schedule(now);
    if (scene) {
      var def = scene.def;
      if (!def.fake && !scene.decision && scene.d + dt >= ASK_AT) {
        scene.d = ASK_AT;
        if (scene.manual) { if (!scene.waiting) { scene.waiting = true; showConsent(); } }
        else scene.decision = 'yes';
      } else if (!scene.waiting) scene.d += dt;
    }

    // Draw background layer of active events
    reqs = reqs.filter(function (q) { return drawAsk(q, (now - q.born) / 1000, 0); });
    if (scene && !drawScene(scene, scene.d, 0)) endScene(now);

    // Draw sensors and 6 Narrow Agents
    sensors.forEach(function (s) { diamond(sensorPos(s), sizeS(), colors.ink3, 0.9); });
    var nr = nodeR();
    FLEET.forEach(function (f, k) {
      var p = agentPos(k), ux = Math.cos(f.a);
      if (glow[k] > 0) disc(p, nr * 2.3, colors.ok, glow[k] * 0.28);
      disc(p, nr, colors.card); ring(p, nr, colors.ok, 1, 1.8);
      var lp = P(f.a, R * 0.60 + nr + fs * 0.85);
      text(f.id, lp.x, lp.y, colors.ink, 600, Math.round(fs * 0.86), ux > 0.3 ? 'left' : ux < -0.3 ? 'right' : 'center', 0.9);
    });

    // Hover highlight
    if (hover) {
      if (hover.you) ring({ x: youX, y: youY }, R * 0.22, colors.ink, 0.85, 1.6);
      else if (hover.sandbox) ring({ x: cx, y: cy }, R * 0.24, colors.ok, 0.85, 1.6);
      else if (hover.wall) line({ x: wallX, y: topY + 4 }, { x: wallX, y: botY - 4 }, colors.ok, 0.9, [], 3);
      else if (hover.s) ring(sensorPos(hover.s), 7, colors.ok, 0.85, 1.4);
      else if (hover.k != null) {
        ring(agentPos(hover.k), nr * 1.8, colors.ink, 0.85, 1.5);
        sensors.forEach(function (s) { if (s.k === hover.k) { line(sensorPos(s), agentPos(s.k), colors.ok, 0.8, [], 1.5); ring(sensorPos(s), 6.5, colors.ok, 0.8, 1.2); } });
      }
    }

    // Draw foreground layer of active events
    reqs.forEach(function (q) { drawAsk(q, (now - q.born) / 1000, 1); });
    if (scene) drawScene(scene, scene.d, 1);

    // Live narrative step ticker strip below header
    var capStr = '', capA = 1;
    if (scene) { var c = captionFor(scene); capStr = c[0]; capA = c[1]; }
    else if (reqs.length) capStr = compact ? 'data-only stream · 3-of-6 local quorum · 0 external APIs' : 'data-only stream · 3 of your local agents must agree · 0 external software APIs';
    else capStr = compact ? 'tap any zone or pick a scenario below' : 'hover any zone or pick a scenario below · agents never contact other humans directly';
    text(capStr, W / 2, H * 0.135, scene ? colors.ink : colors.ink3, 600, Math.round(fs * 0.92), 'center', capA, compact ? W - 16 : undefined);

    // Bottom legend
    var ly = H - fs * 1.05, lx = compact ? 8 : 14, ls = Math.max(8, Math.round(fs * 0.82));
    var gapX = compact ? fs * 0.75 : fs * 1.3;
    var legAgent = compact ? 'local agent' : 'your local agent';
    var legAudit = compact ? 'auditor' : 'auditor agents';
    var legQuorum = compact ? '3-of-6' : '3-of-6 approval';
    ctx.font = '600 ' + ls + 'px ' + MONO;
    diamond({ x: lx + 3, y: ly }, 3.5, colors.ink3); text('sensor', lx + 10, ly, colors.ink3, 600, ls); lx += 10 + ctx.measureText('sensor').width + gapX;
    disc({ x: lx + 4, y: ly }, 4, colors.card); ring({ x: lx + 4, y: ly }, 4, colors.ok, 1, 1.4); text(legAgent, lx + 12, ly, colors.ink3, 600, ls); lx += 12 + ctx.measureText(legAgent).width + gapX;
    diamond({ x: lx + 4, y: ly }, 4.2, colors.gold); text(legAudit, lx + 12, ly, colors.ink3, 600, ls); lx += 12 + ctx.measureText(legAudit).width + gapX;
    var sf = fs; fs = ls * 0.82; badge({ x: lx + 5, y: ly }, true, 1); fs = sf; text(legQuorum, lx + 14, ly, colors.ink3, 600, ls);
  }

  /* ---------- situation chips ---------- */
  function setPressed(id) {
    if (!sceneBar) return;
    [].forEach.call(sceneBar.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.scene === id)); });
  }
  if (sceneBar) {
    var mk = function (id, txt) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.scene = id; b.textContent = txt; b.setAttribute('aria-pressed', 'false');
      sceneBar.appendChild(b); return b;
    };
    mk('auto', 'Watch it run');
    SCENES.forEach(function (s) { mk(s.id, s.chip); });
    setPressed('auto');
    sceneBar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var id = b.dataset.scene; setPressed(id);
      reqs = []; lastSpawn = performance.now();
      if (id === 'auto') { scene = null; hideConsent(); auto = !reduce; if (reduce) frame(still); return; }
      startScene(id, !reduce);
      if (reduce) { scene.decision = scene.def.emergency ? 'yes' : 'yes'; scene.d = scene.def.fake ? 4.8 : 8.8; frame(still); }
    });
  }

  var running = false, raf = 0;
  function loop(now) { frame(now); if (running) raf = requestAnimationFrame(loop); }
  function start() { if (!running && !reduce) { running = true; last = 0; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  readColors(); size();
  var still = performance.now();
  if (reduce) {
    startScene('dentist', false); scene.decision = 'yes'; scene.d = 8.8;
    frame(still);
  } else {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(cv);
    } else start();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  }
  window.addEventListener('resize', function () { size(); if (reduce) frame(still); });
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onTheme = function () { readColors(); if (reduce) frame(still); };
  if (mq.addEventListener) mq.addEventListener('change', onTheme); else if (mq.addListener) mq.addListener(onTheme);
})();
/* ==========================================================================
   ?v=45 GLOBAL COMMAND PALETTE (Ctrl+K / Cmd+K) & BLUEPRINT SECTION TOC BAR
   ========================================================================== */
(function () {
  'use strict';


  // 0. Top 2px Spectrum Reading Progress Bar inside .site-head
  var siteHeadEl = document.querySelector('.site-head');
  if (siteHeadEl && !document.getElementById('read-progress')) {
    var prog = document.createElement('div');
    prog.id = 'read-progress';
    prog.className = 'read-progress';
    prog.setAttribute('aria-hidden', 'true');
    siteHeadEl.appendChild(prog);
    var updateProg = function () {
      var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var pct = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100));
      prog.style.width = pct.toFixed(1) + '%';
    };
    window.addEventListener('scroll', updateProg, { passive: true });
    window.addEventListener('resize', updateProg, { passive: true });
    updateProg();
  }

  // 0. Interactive 5-Pillar Blueprint Architecture Map on /notes Hub (#notes-hub-svg)
  var hubSvg = document.getElementById('notes-hub-svg');
  if (hubSvg) {
    [].forEach.call(hubSvg.querySelectorAll('[data-note-cat]'), function (g) {
      g.addEventListener('click', function () {
        var cat = g.getAttribute('data-note-cat');
        var pill = document.querySelector('.notes-pills [data-cat="' + cat + '"]');
        if (pill) {
          pill.click();
          var grid = document.getElementById('notes-grid');
          if (grid && grid.scrollIntoView) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // 1. Widescreen 2-Column Hero Card + Sticky Left Scroll-Spy Rail on /notes/<slug> Pages
  var isBlueprintDetail = location.pathname.indexOf('/notes/') === 0 && location.pathname !== '/notes/' && location.pathname !== '/notes/index.html';
  var noteArticle = isBlueprintDetail && document.querySelector('article.note');
  var noteHead = noteArticle && noteArticle.querySelector('.note-head');
  var noteBody = noteArticle && noteArticle.querySelector('.note-body');
  if (noteArticle && noteHead && noteBody && !noteHead.classList.contains('has-hero-split')) {
    var slugPath = location.pathname.replace(/^\/notes\//, '').replace(/\.html$/, '').replace(/\/$/, '');
    var headings = [].slice.call(noteBody.querySelectorAll('h2'));
    var svgCount = noteBody.querySelectorAll('svg').length;
    var simEl = noteBody.querySelector('.sim-shell, .juris-explorer, .gov-sim-panel, .dpop-sim-shell, .gm-sim, .persona-explorer, #sw-sim, #dm-calc, #aoi-sim, #rea-stream-sim, #insensor-ledger-sim, #sym-search-sim, #sch-dir');

    headings.forEach(function (h, idx) {
      if (!h.id) {
        var s = (h.textContent || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        h.id = s || ('sec-' + (idx + 1));
      }
    });

    // Classify note domain for custom schematic & provenance metadata
    var domainKey = 'arch';
    if (/ledger|value|companies|beyond-arxiv|testnet/.test(slugPath)) domainKey = 'ledger';
    else if (/personal|twin|reclaim|quest|who-is|somatic|biometrics|sovereignty/.test(slugPath)) domainKey = 'twin';
    else if (/containment|swarm|jurisdictions|liquid-democracy|instructions|fractured|trust/.test(slugPath)) domainKey = 'safety';
    else if (/thirty-lives|simulations|signals|related-labs|all-principles|many-minds|collective|network/.test(slugPath)) domainKey = 'sim';

    var DOMAIN_META = {
      arch: {
        tag: 'Pillar 1 · Two Internets & Local OCap',
        badge: 'RFC 9000 QUIC + OCap',
        kpi3Val: '0 Bytes',
        kpi3Lbl: 'Cloud Telemetry Leak',
        prov: 'IETF RFC 9000/9221 QUIC · Dennis & Van Horn (1966) OCap · Hardware PUF/TPM',
        svg: '<svg viewBox="0 0 360 112" role="img" aria-label="Two Internets Architecture Schematic">' +
          '<rect x="6" y="8" width="106" height="96" rx="8" fill="color-mix(in srgb, var(--ok) 14%, var(--paper))" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="16" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Human Internet</text>' +
          '<text x="16" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">Hardware Liveness</text>' +
          '<text x="16" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">0 Foreign Bots</text>' +
          '<text x="16" y="86" fill="var(--ink-3)" font-size="8.5">100% Human Spaces</text>' +
          '<path d="M112 56 L130 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="130" y="8" width="104" height="96" rx="8" fill="var(--card)" stroke="var(--rule)" stroke-width="1.5"/>' +
          '<text x="140" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">OCap Sandbox</text>' +
          '<text x="140" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">6 Narrow Agents</text>' +
          '<text x="140" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">3-of-6 Quorum</text>' +
          '<text x="140" y="86" fill="var(--ink-3)" font-size="8.5">Local Device Bus</text>' +
          '<path d="M234 56 L252 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="252" y="8" width="102" height="96" rx="8" fill="color-mix(in srgb, var(--ok) 14%, var(--paper))" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="262" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Agent Internet</text>' +
          '<text x="262" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">IETF QUIC P2P</text>' +
          '<text x="262" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">9.4 ms Latency</text>' +
          '<text x="262" y="86" fill="var(--ink-3)" font-size="8.5">Scoped ZK Proofs</text>' +
        '</svg>'
      },
      ledger: {
        tag: 'Pillar 2 & 3 · Attribution & 5D Ledger',
        badge: 'PCC + Data Shapley',
        kpi3Val: '1,000 Cr',
        kpi3Lbl: 'Exact Conservation',
        prov: 'Necula (POPL 1997) PCC · Shapley (1953) · Ghorbani & Zou (ICML 2019) · TIES-Merging',
        svg: '<svg viewBox="0 0 360 112" role="img" aria-label="Shared Attribution and 5D Ledger Schematic">' +
          '<rect x="6" y="8" width="106" height="96" rx="8" fill="var(--card)" stroke="var(--rule)" stroke-width="1.5"/>' +
          '<text x="16" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Local Sandbox</text>' +
          '<text x="16" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">Tasker &amp; Solver</text>' +
          '<text x="16" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">5-Session Iso</text>' +
          '<text x="16" y="86" fill="var(--ink-3)" font-size="8.5">LoRA Weight Delta</text>' +
          '<path d="M112 56 L130 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="130" y="8" width="104" height="96" rx="8" fill="color-mix(in srgb, var(--ok) 14%, var(--paper))" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="140" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Functional Proof</text>' +
          '<text x="140" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">Necula 1997 PCC</text>' +
          '<text x="140" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">16/16 Certified</text>' +
          '<text x="140" y="86" fill="var(--ink-3)" font-size="8.5">Deterministic Gate</text>' +
          '<path d="M234 56 L252 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="252" y="8" width="102" height="96" rx="8" fill="var(--card)" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="262" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">5D Royalty Split</text>' +
          '<text x="262" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">Data Shapley</text>' +
          '<text x="262" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">$25k Floor Safe</text>' +
          '<text x="262" y="86" fill="var(--ink-3)" font-size="8.5">0% Middleman Toll</text>' +
        '</svg>'
      },
      twin: {
        tag: 'Pillar 4 · Human-Bound Personal Twin',
        badge: 'Local LoRA + PUF',
        kpi3Val: '0 Bytes',
        kpi3Lbl: 'Raw Biometrics Sent',
        prov: 'Hu et al. (ICLR 2022) LoRA · Picard (1997) · Sweller (1988) · FIDO2/WebAuthn',
        svg: '<svg viewBox="0 0 360 112" role="img" aria-label="Human-Bound Personal Agent Schematic">' +
          '<rect x="6" y="8" width="106" height="96" rx="8" fill="color-mix(in srgb, var(--ok) 14%, var(--paper))" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="16" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Pre-ADC Sensor</text>' +
          '<text x="16" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">HRV + Piezo MMG</text>' +
          '<text x="16" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">50 ms Erasure</text>' +
          '<text x="16" y="86" fill="var(--ink-3)" font-size="8.5">Duress Lock ≥24ms</text>' +
          '<path d="M112 56 L130 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="130" y="8" width="104" height="96" rx="8" fill="var(--card)" stroke="var(--rule)" stroke-width="1.5"/>' +
          '<text x="140" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Personal Twin</text>' +
          '<text x="140" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">On-Device LoRA</text>' +
          '<text x="140" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">Telic vs Limbic</text>' +
          '<text x="140" y="86" fill="var(--ink-3)" font-size="8.5">100% User-Owned</text>' +
          '<path d="M234 56 L252 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="252" y="8" width="102" height="96" rx="8" fill="color-mix(in srgb, var(--ok) 14%, var(--paper))" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="262" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Craft Royalty</text>' +
          '<text x="262" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">ZK-LSH Subspace</text>' +
          '<text x="262" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">Scoped Escrow</text>' +
          '<text x="262" y="86" fill="var(--ink-3)" font-size="8.5">Direct Settlement</text>' +
        '</svg>'
      },
      safety: {
        tag: 'Containment, Governance & Statutory Gate',
        badge: 'NIST AIMS Tenet 7',
        kpi3Val: '100%',
        kpi3Lbl: 'Swarm Abuses Blocked',
        prov: 'NIST AI RMF / AIMS Tenet 7 · RFC 9449 DPoP · Saltzer & Schroeder (1975) · Ostrom (1990)',
        svg: '<svg viewBox="0 0 360 112" role="img" aria-label="Risk-Scaled Containment and Policy Gate Schematic">' +
          '<rect x="6" y="8" width="106" height="96" rx="8" fill="var(--card)" stroke="var(--rule)" stroke-width="1.5"/>' +
          '<text x="16" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Agent Proposal</text>' +
          '<text x="16" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">Reasoning Plane</text>' +
          '<text x="16" y="62" fill="var(--accent)" font-size="9" font-family="var(--mono)">0 Direct IO Keys</text>' +
          '<text x="16" y="86" fill="var(--ink-3)" font-size="8.5">Typed AST Intent</text>' +
          '<path d="M112 56 L130 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="130" y="8" width="104" height="96" rx="8" fill="color-mix(in srgb, var(--ok) 14%, var(--paper))" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="140" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Policy Gate</text>' +
          '<text x="140" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">Φ(R) = 1−(1−R)⁵</text>' +
          '<text x="140" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">3-of-6 Watchers</text>' +
          '<text x="140" y="86" fill="var(--ink-3)" font-size="8.5">Deterministic Check</text>' +
          '<path d="M234 56 L252 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="252" y="8" width="102" height="96" rx="8" fill="var(--card)" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="262" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">Signed Receipt</text>' +
          '<text x="262" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">RFC 9449 DPoP</text>' +
          '<text x="262" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">Audit Verified</text>' +
          '<text x="262" y="86" fill="var(--ink-3)" font-size="8.5">Fails Closed</text>' +
        '</svg>'
      },
      sim: {
        tag: 'Pillar 5 · Simulations, Signals & Foresight',
        badge: 'Deterministic Suite',
        kpi3Val: '0.87→0.58',
        kpi3Lbl: '365d Gini Compression',
        prov: 'Brier (1950) Proper Scoring · Dalkey & Helmer (1963) Delphi · METR Task Horizon',
        svg: '<svg viewBox="0 0 360 112" role="img" aria-label="Society Simulation and Strategic Foresight Schematic">' +
          '<rect x="6" y="8" width="106" height="96" rx="8" fill="color-mix(in srgb, var(--ok) 14%, var(--paper))" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="16" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">30 Lives &amp; 550</text>' +
          '<text x="16" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">6 Continents</text>' +
          '<text x="16" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">Tiers 0 to 4</text>' +
          '<text x="16" y="86" fill="var(--ink-3)" font-size="8.5">365-Day Monte Carlo</text>' +
          '<path d="M112 56 L130 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="130" y="8" width="104" height="96" rx="8" fill="var(--card)" stroke="var(--rule)" stroke-width="1.5"/>' +
          '<text x="140" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">5-Step Foresight</text>' +
          '<text x="140" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">STEEP + Delphi</text>' +
          '<text x="140" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">Brier Calibrated</text>' +
          '<text x="140" y="86" fill="var(--ink-3)" font-size="8.5">100% Cone Sum</text>' +
          '<path d="M234 56 L252 56" stroke="var(--ok)" stroke-width="1.8"/>' +
          '<rect x="252" y="8" width="102" height="96" rx="8" fill="color-mix(in srgb, var(--ok) 14%, var(--paper))" stroke="var(--ok)" stroke-width="1.5"/>' +
          '<text x="262" y="28" fill="var(--ink)" font-size="10.5" font-weight="700">4.2x Thriving</text>' +
          '<text x="262" y="45" fill="var(--ink-2)" font-size="9" font-family="var(--mono)">Care &amp; Craft</text>' +
          '<text x="262" y="62" fill="var(--ok)" font-size="9" font-family="var(--mono)">Zero Hoarding</text>' +
          '<text x="262" y="86" fill="var(--ink-3)" font-size="8.5">Reproducible Code</text>' +
        '</svg>'
      }
    };

    var dm = DOMAIN_META[domainKey] || DOMAIN_META.arch;

    // Wrap existing .note-head children into .note-head-left
    var leftDiv = document.createElement('div');
    leftDiv.className = 'note-head-left';
    while (noteHead.firstChild) {
      leftDiv.appendChild(noteHead.firstChild);
    }

    // Add compact section pills bar inside leftDiv if >= 2 headings
    if (headings.length >= 2) {
      var tocBar = document.createElement('nav');
      tocBar.className = 'note-toc-bar';
      tocBar.setAttribute('aria-label', 'In this blueprint');
      var labelSpan = document.createElement('span');
      labelSpan.className = 'ntb-k';
      labelSpan.textContent = 'Jump to section:';
      tocBar.appendChild(labelSpan);
      var listDiv = document.createElement('div');
      listDiv.className = 'ntb-links';
      headings.slice(0, 6).forEach(function (h, idx) {
        var a = document.createElement('a');
        a.href = '#' + h.id;
        var cleanTxt = (h.textContent || '').replace(/^\s*\d+[\.\)]\s*/, '').trim();
        a.textContent = (idx + 1) + '. ' + (cleanTxt.length > 36 ? cleanTxt.slice(0, 34) + '…' : cleanTxt);
        listDiv.appendChild(a);
      });
      tocBar.appendChild(listDiv);
      leftDiv.appendChild(tocBar);
    }

    // Build Right-Column Visual Blueprint Architecture & Provenance Card (.note-hero-card)
    var rightCard = document.createElement('aside');
    rightCard.className = 'note-hero-card';
    rightCard.setAttribute('aria-label', 'Blueprint Architecture Summary');

    var targetJumpHref = '#';
    var targetJumpLabel = 'Inspect Architecture ↓';
    if (simEl) {
      if (!simEl.id) simEl.id = 'interactive-workbench';
      targetJumpHref = '#' + simEl.id;
      targetJumpLabel = 'Launch Interactive Simulator ↓';
    } else if (headings.length > 0) {
      targetJumpHref = '#' + headings[0].id;
      targetJumpLabel = 'Read Technical Spec ↓';
    }

    rightCard.innerHTML =
      '<div class="nhc-top">' +
        '<span class="nhc-k">' + dm.tag + '</span>' +
        '<span class="nhc-badge">' + dm.badge + '</span>' +
      '</div>' +
      '<div class="nhc-svg-wrap">' + dm.svg + '</div>' +
      '<div class="nhc-kpis">' +
        '<div class="nhc-kpi"><b>' + Math.max(1, headings.length) + ' Sections</b><span>Structured Blueprint</span></div>' +
        '<div class="nhc-kpi"><b>' + (svgCount + 1) + ' Schematics</b><span>' + (simEl ? '+ Live Simulator' : 'Verified SVG Specs') + '</span></div>' +
        '<div class="nhc-kpi"><b>' + dm.kpi3Val + '</b><span>' + dm.kpi3Lbl + '</span></div>' +
      '</div>' +
      '<div class="nhc-actions">' +
        '<a href="' + targetJumpHref + '" class="primary">' + targetJumpLabel + '</a>' +
        '<a href="/notes">All 30 Blueprints</a>' +
        '<a href="https://cintnet.org/twin" target="_blank" rel="noopener">Twin Sandbox &#8599;</a>' +
      '</div>';

    noteHead.classList.add('has-hero-split');
    noteHead.appendChild(leftDiv);
    noteHead.appendChild(rightCard);

    // Build 2-Column Widescreen Body Grid (.note-widescreen-grid) for notes with >= 3 headings
    var skipStickyRail = slugPath === 'all-principles' || slugPath === 'thirty-lives' || slugPath === 'related-labs-and-researchers';
    if (headings.length >= 3 && !skipStickyRail) {
      var wsGrid = document.createElement('div');
      wsGrid.className = 'note-widescreen-grid';

      var rail = document.createElement('aside');
      rail.className = 'note-sticky-rail';
      rail.setAttribute('aria-label', 'Blueprint outline and provenance');

      var railLinksHtml = headings.map(function (h, idx) {
        var cleanTxt = (h.textContent || '').replace(/^\s*\d+[\.\)]\s*/, '').trim();
        var label = (idx + 1) + '. ' + (cleanTxt.length > 42 ? cleanTxt.slice(0, 40) + '…' : cleanTxt);
        return '<a href="#' + h.id + '" data-spy-id="' + h.id + '"' + (idx === 0 ? ' class="active"' : '') + '>' + label + '</a>';
      }).join('');

      rail.innerHTML =
        '<div>' +
          '<div class="nsr-k" style="margin-bottom:.45rem">In This Blueprint</div>' +
          '<nav class="nsr-links">' + railLinksHtml + '</nav>' +
        '</div>' +
        '<div class="nsr-prov">' +
          '<b>Scientific Provenance</b>' +
          '<div>' + dm.prov + '</div>' +
          '<div style="margin-top:.35rem;display:grid;gap:.25rem">' +
            '<a href="/notes/beyond-arxiv-agent-web-ledger" style="color:var(--ok);font-weight:600;text-decoration:none">&rarr; Testnet Ledger v4.0</a>' +
            '<a href="/notes/all-principles" style="color:var(--ok);font-weight:600;text-decoration:none">&rarr; 550-Principle Library</a>' +
          '</div>' +
        '</div>';

      var mainCol = document.createElement('div');
      mainCol.className = 'note-main-col';
      while (noteBody.firstChild) {
        mainCol.appendChild(noteBody.firstChild);
      }

      wsGrid.appendChild(rail);
      wsGrid.appendChild(mainCol);
      noteBody.appendChild(wsGrid);
      noteArticle.classList.add('has-sticky-rail');

      // Scroll-spy listener for sticky rail links
      var spyLinks = [].slice.call(rail.querySelectorAll('[data-spy-id]'));
      var updateSpy = function () {
        var activeId = headings[0].id;
        var threshold = window.scrollY + 140;
        for (var i = 0; i < headings.length; i++) {
          if (headings[i].offsetTop <= threshold) {
            activeId = headings[i].id;
          }
        }
        spyLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('data-spy-id') === activeId);
        });
      };
      window.addEventListener('scroll', updateSpy, { passive: true });
    }
    if (location.hash) {
      var hashEl = document.getElementById(location.hash.slice(1));
      if (hashEl && hashEl.scrollIntoView) {
        setTimeout(function () { hashEl.scrollIntoView(); }, 50);
      }
    }
  }


  // 3. Scientific Provenance & Terminology Registry Filter/Search (#term-explorer)
  var provGrid = document.getElementById('prov-grid');
  var provPills = document.getElementById('prov-pills');
  var provSearch = document.getElementById('prov-search');
  if (provGrid) {
    var activeProvCat = 'all';
    var filterProv = function () {
      var q = provSearch ? (provSearch.value || '').toLowerCase().trim() : '';
      [].forEach.call(provGrid.querySelectorAll('.prov-card'), function (card) {
        var c = card.getAttribute('data-pcat') || '';
        var matchCat = (activeProvCat === 'all') || (c === activeProvCat);
        var matchQ = !q || (card.textContent.toLowerCase().indexOf(q) !== -1);
        card.style.display = (matchCat && matchQ) ? '' : 'none';
      });
    };
    if (provPills) {
      provPills.addEventListener('click', function (e) {
        var b = e.target.closest('[data-prov-cat]');
        if (!b) return;
        activeProvCat = b.getAttribute('data-prov-cat') || 'all';
        [].forEach.call(provPills.querySelectorAll('[data-prov-cat]'), function (btn) {
          btn.setAttribute('aria-pressed', String(btn === b));
        });
        filterProv();
      });
    }
    if (provSearch) {
      provSearch.addEventListener('input', filterProv);
    }
  }

  // 2. Global Quick-Jump & Blueprint Command Palette (Ctrl+K / Cmd+K / Floating Pill)
  if (document.getElementById('cmd-dlg')) return;

  var ITEMS = [
    { cat: 'Interactive Workbenches', title: '0. 7-Lens World Standing vs. CIN Co-Intelligence Atlas', sub: 'Compare SOTA AI Labs, Safety Labs, Governments, Universities, Enterprise & Pair Moat', href: '/#world-matrix' },
    { cat: 'Interactive Workbenches', title: '1. Live 3-Zone Sovereign Boundary & Firewall Canvas', sub: 'Inspect local sandbox, 6 narrow agents, and non-contact firewall', href: '/#architecture' },
    { cat: 'Interactive Workbenches', title: '2. Cryptographic Wire-Protocol & Data Model Inspector', sub: 'OCap-QUIC Stream 0x04, Necula PCC receipts & TIES-LoRA deltas', href: '/#architecture', tab: 'pkt' },
    { cat: 'Interactive Workbenches', title: '3. Zero-Middleman Savings & Royalties Calculator', sub: 'CMS NCCI hospital audit, PSI buyer co-op & Data Shapley royalties', href: '/#wedge-calc' },
    { cat: 'Interactive Workbenches', title: '4. 4-Step Proof-Carrying Code & Attribution Pipeline', sub: 'Interactive trace from local problem to direct creator royalty', href: '/#em-demo' },
    { cat: 'Interactive Workbenches', title: '5. 30-Persona Global Network Simulation', sub: 'Trace 30 real households, clinics, and creators across the network', href: '/#pe-root' },
    { cat: 'Interactive Workbenches', title: '6. Risk-Scaled Multi-Agent Quorum & Deliberation Lock', sub: 'Byzantine quorum scaling & hardware enclave lock simulator', href: '/#swarm-lock' },
    { cat: 'Interactive Workbenches', title: '7. Eight Non-Negotiable Architectural Invariants', sub: 'Hardware identity, mortal computation, and sovereign containment', href: '/#goals' },
    { cat: 'Interactive Workbenches', title: '8. Sub-mW Edge Silicon & Pre-ADC Hardware Map', sub: 'Energy-per-inference vs. raw biometric containment across 5 classes', href: '/#hw' },
    { cat: 'Interactive Workbenches', title: '9. Power-Proportionate Cryptographic Auditability', sub: '5-tier privacy vs. public accountability staircase (T0 to T4)', href: '/#power-vis' },
    { cat: 'Interactive Workbenches', title: '10. Interactive 44-Principle Wheel & Protocol Specs', sub: 'Inspect every principle with its formal cryptographic mechanism', href: '/#lines' },
    { cat: 'Interactive Workbenches', title: '11. 6-Stage AI Capability Trajectory & Delphi Debate', sub: 'METR horizon forecast, 3-persona Delphi debate & futures cone', href: '/#foresight-atlas' },
    { cat: 'Interactive Workbenches', title: '12. Global Tail-Risk & Safeguard Simulator', sub: 'Test how the 8 architectural safeguards compress global tail risks', href: '/#risk-lab' },
    { cat: 'Core Pages', title: 'Technical Blueprints Library (All 29 Papers)', sub: 'Filterable index of all 29 architectural specifications and notes', href: '/notes' },
    { cat: 'Core Pages', title: 'Live Hourly Signal Stream & Trajectory Page', sub: '5,936 monitored sources, capability curves, and 2027-2030 scenarios', href: '/trajectory' },
    { cat: 'Core Pages', title: 'From the Founder: Lived Experience to Protocol Matrix', sub: 'Why we are building the two internets and how to get involved', href: '/founder' },
    { cat: 'Core Pages', title: 'Live Build Log & Recent Architectural Shipments', sub: 'Chronological engineering updates and research publications', href: '/updates' },
    { cat: 'Key Blueprints', title: 'Blueprint: The Agent-Only Internet, Biometrics & Hardware', sub: 'IETF RFC 9000 QUIC, hardware personhood & pre-ADC affective shield', href: '/notes/agent-only-internet-biometrics-hardware' },
    { cat: 'Key Blueprints', title: 'Blueprint: Beyond arXiv — The Agent-Web & Weight Ledger', sub: 'Proof-Carrying Code (Necula 1997), Data Shapley & TIES-Merging', href: '/notes/beyond-arxiv-agent-web-ledger' },
    { cat: 'Key Blueprints', title: 'Blueprint: Voluntary Institutional & Market Transition', sub: 'CMS NCCI medical billing audits & Private Set Intersection co-ops', href: '/notes/voluntary-institutional-transition' },
    { cat: 'Key Blueprints', title: 'Blueprint: Human-Bound Personal Agents & Local Privacy', sub: 'On-device LoRA adapters, craft attribution & zero cloud telemetry', href: '/notes/personal-agents' },
    { cat: 'Key Blueprints', title: 'Blueprint: Mortal Computation & Shared Lifespan', sub: 'Hardware-enforced biological coupling and anti-coercion locks', href: '/notes/mortal-computation' },
    { cat: 'Key Blueprints', title: 'Blueprint: All 44 Architectural Principles in Full', sub: 'Complete reference specification of all 44 network principles', href: '/notes/all-principles' }
  ];

  var trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.id = 'cmd-trigger';
  trigger.className = 'cmd-trigger';
  trigger.setAttribute('aria-label', 'Quick Jump & Search across all simulators and blueprints (Ctrl+K)');
  trigger.innerHTML = '<span class="cmd-ic">&#8981;</span><span>Quick Jump</span><kbd>&#8984;K</kbd>';
  document.body.appendChild(trigger);

  var dlg = document.createElement('dialog');
  dlg.id = 'cmd-dlg';
  dlg.className = 'cmd-dlg';
  dlg.setAttribute('aria-label', 'Quick Jump and Search');
  dlg.innerHTML =
    '<div class="cmd-box">' +
      '<div class="cmd-top">' +
        '<input type="search" id="cmd-input" class="cmd-input" placeholder="Jump to any simulator, protocol spec, or blueprint (e.g. QUIC, Shapley, Quorum, Hospital)..." autocomplete="off">' +
        '<button type="button" class="cmd-close" id="cmd-close">ESC</button>' +
      '</div>' +
      '<div class="cmd-list" id="cmd-list" role="listbox"></div>' +
      '<div class="cmd-foot"><span><b>&#8593;&#8595;</b> to navigate · <b>Enter</b> to jump · <b>ESC</b> to close</span><span>12 Simulators · 29 Blueprints</span></div>' +
    '</div>';
  document.body.appendChild(dlg);

  var input = dlg.querySelector('#cmd-input');
  var listEl = dlg.querySelector('#cmd-list');
  var closeBtn = dlg.querySelector('#cmd-close');
  var activeIdx = 0;
  var filtered = ITEMS.slice();

  function renderList(q) {
    var needle = (q || '').toLowerCase().trim();
    filtered = ITEMS.filter(function (it) {
      if (!needle) return true;
      return (it.title + ' ' + it.sub + ' ' + it.cat).toLowerCase().indexOf(needle) !== -1;
    });
    activeIdx = 0;
    if (!filtered.length) {
      listEl.innerHTML = '<div class="cmd-empty">No matching simulator or blueprint. Try "QUIC", "Shapley", "Quorum", or "Blueprint".</div>';
      return;
    }
    var html = '';
    var lastCat = '';
    filtered.forEach(function (it, i) {
      if (it.cat !== lastCat) {
        lastCat = it.cat;
        html += '<div class="cmd-cat">' + it.cat + '</div>';
      }
      html +=
        '<a href="' + it.href + '" class="cmd-item' + (i === activeIdx ? ' active' : '') + '" data-idx="' + i + '">' +
          '<div><b>' + it.title + '</b><small>' + it.sub + '</small></div>' +
          '<span class="cmd-arr">&rarr;</span>' +
        '</a>';
    });
    listEl.innerHTML = html;
  }

  function openCmd() {
    renderList('');
    input.value = '';
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
    setTimeout(function () { input.focus(); }, 20);
  }

  function closeCmd() {
    if (typeof dlg.close === 'function' && dlg.open) dlg.close();
    else dlg.removeAttribute('open');
  }

  function selectItem(it) {
    if (!it) return;
    closeCmd();
    if (it.tab) {
      var tBtn = document.querySelector('#bd-tabs [data-tab="' + it.tab + '"]');
      if (tBtn) tBtn.click();
    }
    var link = document.createElement('a');
    link.href = it.href;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  trigger.addEventListener('click', openCmd);
  closeBtn.addEventListener('click', closeCmd);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeCmd(); });

  input.addEventListener('input', function () { renderList(input.value); });
  input.addEventListener('keydown', function (e) {
    var items = listEl.querySelectorAll('.cmd-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length) {
        activeIdx = (activeIdx + 1) % items.length;
        [].forEach.call(items, function (el, idx) { el.classList.toggle('active', idx === activeIdx); });
        if (items[activeIdx].scrollIntoView) items[activeIdx].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length) {
        activeIdx = (activeIdx - 1 + items.length) % items.length;
        [].forEach.call(items, function (el, idx) { el.classList.toggle('active', idx === activeIdx); });
        if (items[activeIdx].scrollIntoView) items[activeIdx].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      e.preventDefault();
      selectItem(filtered[activeIdx]);
    }
  });

  listEl.addEventListener('click', function (e) {
    var a = e.target.closest('.cmd-item');
    if (!a) return;
    e.preventDefault();
    var idx = Number(a.getAttribute('data-idx') || 0);
    selectItem(filtered[idx]);
  });

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dlg.open) closeCmd(); else openCmd();
    }
  });
})();


// ==========================================================================
// ?v=50 7-LENS VISUAL COMPARISON ATLAS CONTROLLER (#world-matrix)
// ==========================================================================
(function () {
  var wmTabs = document.getElementById('wm-tabs');
  if (!wmTabs) return;

  var kEl = document.getElementById('wm-k');
  var titleEl = document.getElementById('wm-title');
  var citesEl = document.getElementById('wm-cites');
  var svgWrap = document.getElementById('wm-svg-wrap');
  var kpisEl = document.getElementById('wm-kpis');
  var barsEl = document.getElementById('wm-bars');
  var standEl = document.getElementById('wm-c-stand');
  var gapEl = document.getElementById('wm-c-gap');
  var cinEl = document.getElementById('wm-c-cin');
  var simLink = document.getElementById('wm-sim-link');

  // Interactive Lens Stress-Tester Elements
  var simLbl = document.getElementById('wm-sim-lbl');
  var simVal = document.getElementById('wm-sim-val');
  var simRng = document.getElementById('wm-sim-rng');
  var soBadK = document.getElementById('wm-so-bad-k');
  var soBadV = document.getElementById('wm-so-bad-v');
  var soOkK = document.getElementById('wm-so-ok-k');
  var soOkV = document.getElementById('wm-so-ok-v');

  var currentKey = 'labs';

  var LENSES = {
    labs: {
      k: 'Lens 01 of 07 · Incentive & Reward Architecture (Profit vs. Cooperation)',
      title: 'SOTA Model AI Labs vs. CIN Decentralized Co-Intelligence',
      cites: ['[Necula, POPL 1997]', '[Ghorbani & Zou, ICML 2019]', '[Hu et al., LoRA 2022]'],
      simHref: '#wedge-calc',
      simText: 'Test Creator Royalties in Calculator ↓',
      simConfig: {
        lbl: 'Interactive Stress-Test: Annual Creator / Solver Output Value',
        min: 20, max: 500, step: 10, val: 100,
        badK: 'Status Quo (SOTA Cloud Labs)',
        okK: 'With CIN Co-Intelligence Ledger',
        formatVal: function (v) { return '$' + v + ',000 / yr'; },
        calc: function (v) {
          var rent = Math.round(v * 0.28);
          var direct = Math.round(v * 0.85);
          var lin = Math.round(v * 0.10);
          var com = Math.round(v * 0.05);
          return {
            badV: '$0 Royalties · -$' + rent + ',000 Cloud API Rent',
            okV: '+$' + direct + 'k Direct · +$' + lin + 'k Lineage · +$' + com + 'k Commons'
          };
        }
      },
      kpis: [
        ['Creator / Human Royalty Share', '0% vs. 95% (Data Shapley)'],
        ['Training & Data Custody', 'Central Cloud vs. Local OCap'],
        ['Reward Objective', 'Equity Rent vs. Verified Proof']
      ],
      bars: [
        ['Creator & Worker Value Retention', '12% vs. 95%', 12, 95],
        ['Human / AI Boundary Isolation', '15% vs. 98%', 15, 98],
        ['Philanthropic & Commons Recirculation', '18% vs. 92%', 18, 92],
        ['Cryptographic Swarm Containment', '20% vs. 96%', 20, 96]
      ],
      stand: 'Frontier labs (OpenAI, Anthropic, DeepMind, xAI, Meta) scrape public code and craft for $0 while renting tokens back via proprietary APIs.',
      gap: 'Shareholder valuation demands replacing human labor and locking users into cloud wrappers—turning AI into competitive displacement.',
      cin: 'On-device LoRA training, Two-Internet isolation, and 85/10/5 Data Shapley royalties reward verified cooperation and fund a $25k exempt civic floor.',
      svg: '<svg viewBox="0 0 760 340" role="img" aria-label="2D Quadrant and $100 Value-Flow Sankey comparing SOTA AI Labs profit extraction against CIN cooperative Data Shapley royalties"><rect x="12" y="12" width="360" height="202" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="34" font-size="10.5" font-weight="700" font-family="monospace" fill="#e9e6de">1. INCENTIVE QUADRANT: RENT VS. CO-INTELLIGENCE</text><line x1="192" y1="46" x2="192" y2="200" stroke="#3a3f4b" stroke-width="1.4" stroke-dasharray="4 3"/><line x1="26" y1="124" x2="358" y2="124" stroke="#3a3f4b" stroke-width="1.4" stroke-dasharray="4 3"/><text x="198" y="58" font-size="9.5" font-family="monospace" fill="#4fb3a8">↑ HUMAN-ISOLATED AIRLOCK</text><text x="30" y="116" font-size="9.5" font-family="monospace" fill="#ef6a52">← SHAREHOLDER RENT</text><rect x="24" y="138" width="156" height="48" rx="8" fill="rgba(239,106,82,0.15)" stroke="#ef6a52" stroke-width="1.6"/><text x="102" y="158" text-anchor="middle" font-size="10" font-weight="700" fill="#ef6a52">SOTA Cloud Labs</text><text x="102" y="176" text-anchor="middle" font-size="9.5" fill="#e9e6de">OpenAI · Anthropic · Google</text><rect x="200" y="146" width="158" height="36" rx="7" fill="rgba(229,169,60,0.13)" stroke="#e5a93c" stroke-width="1.4"/><text x="279" y="168" text-anchor="middle" font-size="9.5" font-weight="700" fill="#e5a93c">Open Weights ($0 Royalty)</text><rect x="200" y="66" width="158" height="48" rx="8" fill="rgba(79,179,168,0.2)" stroke="#4fb3a8" stroke-width="2"/><text x="279" y="86" text-anchor="middle" font-size="10" font-weight="700" fill="#4fb3a8">CIN Co-Intelligence</text><text x="279" y="104" text-anchor="middle" font-size="9.5" fill="#e9e6de">Local LoRA + 95% Shapley</text><path d="M180,152 Q192,120 200,94" fill="none" stroke="#4fb3a8" stroke-width="2.2" stroke-dasharray="4 3"/><rect x="384" y="12" width="364" height="202" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="398" y="34" font-size="10.5" font-weight="700" font-family="monospace" fill="#e9e6de">2. REWARD SYSTEM: PROFIT VS. COOPERATION</text><rect x="398" y="48" width="162" height="152" rx="9" fill="rgba(239,106,82,0.09)" stroke="#ef6a52" stroke-width="1.4"/><text x="410" y="72" font-size="10" font-weight="700" fill="#ef6a52">SOTA AI Conglomerates</text><text x="410" y="98" font-size="9.5" fill="#e9e6de">• Scrape public craft ($0)</text><text x="410" y="122" font-size="9.5" fill="#e9e6de">• 15%–40% API token rent</text><text x="410" y="146" font-size="9.5" fill="#e9e6de">• Displaces human labor</text><text x="410" y="178" font-size="9.5" font-weight="700" fill="#ef6a52">Goal: Equity Valuation</text><rect x="572" y="48" width="162" height="152" rx="9" fill="rgba(79,179,168,0.12)" stroke="#4fb3a8" stroke-width="1.6"/><text x="584" y="72" font-size="10" font-weight="700" fill="#4fb3a8">CIN Cooperative Ledger</text><text x="584" y="98" font-size="9.5" fill="#e9e6de">✓ Private on-device LoRA</text><text x="584" y="122" font-size="9.5" fill="#e9e6de">✓ Proof-Carrying Code</text><text x="584" y="146" font-size="9.5" fill="#e9e6de">✓ 95% Shapley royalties</text><text x="584" y="178" font-size="9.5" font-weight="700" fill="#e5a93c">Goal: Human Cooperation</text><rect x="12" y="224" width="736" height="104" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="246" font-size="10.5" font-weight="700" font-family="monospace" fill="#e5a93c">3. WHERE EVERY $100 OF AI-GENERATED VALUE FLOWS</text><text x="26" y="274" font-size="10" font-weight="700" fill="#ef6a52">SOTA Cloud AI</text><rect x="132" y="258" width="428" height="22" rx="4" fill="#ef6a52"/><text x="346" y="273" text-anchor="middle" font-size="9.5" font-weight="700" fill="#111317">$72 Cloud Lab &amp; GPU Shareholders</text><rect x="562" y="258" width="170" height="22" rx="4" fill="#b84a39"/><text x="647" y="273" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff">$28 Rent · $0 Creator</text><text x="26" y="306" font-size="10" font-weight="700" fill="#4fb3a8">CIN Ledger</text><rect x="132" y="290" width="500" height="22" rx="4" fill="#4fb3a8"/><text x="382" y="305" text-anchor="middle" font-size="9.5" font-weight="700" fill="#111317">$85 Direct Human Solver + $10 Lineage (95% Data Shapley)</text><rect x="634" y="290" width="98" height="22" rx="4" fill="#e5a93c"/><text x="683" y="305" text-anchor="middle" font-size="9.5" font-weight="700" fill="#111317">$5 Commons</text></svg>'
    },
    safety: {
      k: 'Lens 02 of 07 · Co-Intelligence vs. Competitive Extinction (The Safety Gradient)',
      title: 'AI Safety Spectrum: Why CIN Is Humanity’s Last Resort Before a Hard Pause',
      cites: ['[Ororbia & Friston, 2023]', '[METR & Redwood, 2026]', '[Dennis & Van Horn, 1966]'],
      simHref: '#swarm-lock',
      simText: 'Test Risk-Scaled Quorum Lock ↓',
      simConfig: {
        lbl: 'Interactive Stress-Test: Frontier AI Autonomous Task Horizon (METR T50)',
        min: 1, max: 10, step: 1, val: 5,
        badK: 'Unshielded Biology (~40 bits/s on Shared Web)',
        okK: 'CIN Airlock + 1-to-1 Mortal Pair Lease',
        formatVal: function (v) { return Math.pow(2, v) + 'x Capability (' + (v * 4.5).toFixed(1) + ' mos)'; },
        calc: function (v) {
          var bioOdds = Math.max(2, 48 - v * 5);
          return {
            badV: bioOdds + '% Human Agency Retained (Swarm Outpaced)',
            okV: '97% Agency Retained (Airlock + Φ(R) Quorum Gate)'
          };
        }
      },
      kpis: [
        ['Strategic Position', 'Last Resort Before Hard Pause'],
        ['Biological Protection', 'Two-Internet Airlock + 1:1 Bond'],
        ['Compute Containment', 'Mortal Computation Lease']
      ],
      bars: [
        ['Co-Existence Without Global Treaty Lock', '22% vs. 94%', 22, 94],
        ['Protection of Biological Human Agency', '14% vs. 97%', 14, 97],
        ['Runtime Enforcement (Beyond Eval Pledges)', '28% vs. 96%', 28, 96],
        ['1-to-1 Human-Bound Control (0 Swarms)', '10% vs. 100%', 10, 100]
      ],
      stand: 'Eval institutes (METR, Redwood, Apollo, UK/US AISI) provide crucial warning radar, while pause advocates call for global GPU treaties.',
      gap: 'Human biology (~40 bits/s, millennial evolution) cannot survive direct competitive intelligence against 10¹² bits/s ASI swarms on a shared web.',
      cin: 'Before hitting a global pause button, CIN builds a hard Two-Internet barrier, mortal computation leases, and 1-to-1 human-bound co-intelligence.',
      svg: '<svg viewBox="0 0 760 340" role="img" aria-label="5-Zone Global AI Safety Spectrum and Biological versus Machine Bandwidth Chart"><rect x="12" y="12" width="736" height="172" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="34" font-size="10.5" font-weight="700" font-family="monospace" fill="#e9e6de">1. THE 5-ZONE SAFETY SPECTRUM: LAST RESORT BEFORE A GLOBAL PAUSE</text><rect x="24" y="44" width="134" height="8" rx="4" fill="#ef6a52"/><rect x="160" y="44" width="134" height="8" fill="#e07b42"/><rect x="296" y="44" width="134" height="8" fill="#e5a93c"/><rect x="432" y="44" width="168" height="8" fill="#4fb3a8"/><rect x="602" y="44" width="134" height="8" rx="4" fill="#5da2d5"/><rect x="24" y="58" width="132" height="112" rx="8" fill="rgba(239,106,82,0.09)" stroke="#ef6a52" stroke-width="1.3"/><text x="32" y="78" font-size="9.5" font-weight="700" fill="#ef6a52">1. Raw e/acc</text><text x="32" y="98" font-size="9.5" fill="#e9e6de">• 0 safety barriers</text><text x="32" y="118" font-size="9.5" fill="#e9e6de">• ASI bot swarms</text><text x="32" y="152" font-size="9.5" font-weight="700" fill="#ef6a52">Biology Replaced</text><rect x="160" y="58" width="132" height="112" rx="8" fill="rgba(224,123,66,0.09)" stroke="#e07b42" stroke-width="1.3"/><text x="168" y="78" font-size="9.5" font-weight="700" fill="#e07b42">2. Lab RSPs</text><text x="168" y="98" font-size="9.5" fill="#e9e6de">• OpenAI / Anthropic</text><text x="168" y="118" font-size="9.5" fill="#e9e6de">• Voluntary pledges</text><text x="168" y="152" font-size="9.5" font-weight="700" fill="#e07b42">Self-Policed Race</text><rect x="296" y="58" width="132" height="112" rx="8" fill="rgba(229,169,60,0.09)" stroke="#e5a93c" stroke-width="1.3"/><text x="304" y="78" font-size="9.5" font-weight="700" fill="#e5a93c">3. Eval Institutes</text><text x="304" y="98" font-size="9.5" fill="#e9e6de">• METR · Redwood</text><text x="304" y="118" font-size="9.5" fill="#e9e6de">• Apollo · UK AISI</text><text x="304" y="152" font-size="9.5" font-weight="700" fill="#e5a93c">Vital Diagnostics</text><rect x="432" y="54" width="166" height="120" rx="9" fill="rgba(79,179,168,0.2)" stroke="#4fb3a8" stroke-width="2.4"/><text x="442" y="76" font-size="10" font-weight="700" fill="#4fb3a8">4. CIN · LAST RESORT</text><text x="442" y="96" font-size="9.5" fill="#e9e6de">✓ Two-Internet Airlock</text><text x="442" y="116" font-size="9.5" fill="#e9e6de">✓ 1-to-1 Human Bond</text><text x="442" y="136" font-size="9.5" fill="#e9e6de">✓ Mortal Compute Lease</text><text x="442" y="158" font-size="9.5" font-weight="700" fill="#e5a93c">Co-Existence Barrier</text><rect x="602" y="58" width="134" height="112" rx="8" fill="rgba(93,162,213,0.09)" stroke="#5da2d5" stroke-width="1.3"/><text x="610" y="78" font-size="9.5" font-weight="700" fill="#5da2d5">5. Hard Pause</text><text x="610" y="98" font-size="9.5" fill="#e9e6de">• Global GPU freeze</text><text x="610" y="118" font-size="9.5" fill="#e9e6de">• Treaty shutdowns</text><text x="610" y="152" font-size="9.5" font-weight="700" fill="#5da2d5">If Zone 4 Fails</text><rect x="12" y="194" width="736" height="134" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="216" font-size="10.5" font-weight="700" font-family="monospace" fill="#e5a93c">2. BIOLOGICAL LIMITS (~40 BITS/S) VS. MACHINE SWARMS (10¹² BITS/S)</text><rect x="26" y="230" width="90" height="22" rx="4" fill="#8c8f96"/><text x="126" y="245" font-size="9.5" font-family="monospace" fill="#e9e6de">Human Biology (~40 bits/s · 10,000-yr evolutionary cycle)</text><rect x="26" y="262" width="706" height="22" rx="4" fill="rgba(239,106,82,0.26)" stroke="#ef6a52" stroke-width="1.3"/><text x="38" y="277" font-size="9.5" font-weight="700" font-family="monospace" fill="#ef6a52">Competitive Unbound ASI Swarm (10¹² bits/s · 4.5-mo doubling) → Biology Loses</text><rect x="26" y="294" width="706" height="22" rx="4" fill="rgba(79,179,168,0.24)" stroke="#4fb3a8" stroke-width="1.6"/><text x="38" y="309" font-size="9.5" font-weight="700" font-family="monospace" fill="#4fb3a8">CIN 1-to-1 Mortal Pair Intelligence → AI Bounded to Your Biological Lifespan</text></svg>'
    },
    gov: {
      k: 'Lens 03 of 07 · Public Governance, Safety & Post-Labor Fiscal Stability',
      title: 'Government Institutions vs. CIN Real-Time Cryptographic Civic Locks',
      cites: ['[NIST AIMS Tenet 7]', '[RFC 9449 DPoP]', '[Weiszfeld, 1937]'],
      simHref: '#power-vis',
      simText: 'Inspect Power-Proportionate Auditability ↓',
      simConfig: {
        lbl: 'Interactive Stress-Test: Share of Routine White-Collar Tasks Automated',
        min: 15, max: 85, step: 5, val: 45,
        badK: 'Legacy Payroll-Tax Dependent Government',
        okK: 'CIN 5D Demurrage + <10 ms Silicon Gates',
        formatVal: function (v) { return v + '% Task Automation'; },
        calc: function (v) {
          var taxDrop = Math.round(v * 0.72);
          return {
            badV: '-' + taxDrop + '% Payroll Tax Base · 3–5 Yr Regulatory Lag',
            okV: '100% Municipal Floor Funded · <10 ms Runtime Lock'
          };
        }
      },
      kpis: [
        ['Governance Latency', '24–60 Months vs. <10 ms Gate'],
        ['Tax & Fiscal Base', 'Eroding Payroll vs. 5D Demurrage'],
        ['Elite Accountability', 'Lobby Capture vs. Tiers 0–4 ZK']
      ],
      bars: [
        ['Response Speed vs. 4.5-Month AI Doubling', '14% vs. 96%', 14, 96],
        ['Post-Labor Economic & Tax Stability', '19% vs. 91%', 19, 91],
        ['Resistance to Oligarch / Lobby Capture', '21% vs. 95%', 21, 95],
        ['Citizen Privacy with Public Auditability', '24% vs. 97%', 24, 97]
      ],
      stand: 'Governments pass static statutes 3–5 years after AI capabilities ship, while relying ~72% on human payroll taxes that automation erodes.',
      gap: 'Centralized agencies face lobbying capture by $1T labs and cannot verify million-agent cloud compliance without mass citizen surveillance.',
      cin: 'Hardware-enforced quorum gates (Φ(R)), power-proportionate auditability (Tiers 0–4), and 5D demurrage circulation stabilize economies in real time.',
      svg: '<svg viewBox="0 0 760 340" role="img" aria-label="Dual chart showing Government statutory lag and payroll tax erosion versus CIN sub-10ms silicon quorum gates and 5D demurrage floor"><rect x="12" y="12" width="362" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#ef6a52">1. STATUTORY LAG VS. 4.5-MO AI DOUBLING</text><line x1="44" y1="214" x2="352" y2="214" stroke="#3a3f4b" stroke-width="1.4"/><line x1="44" y1="56" x2="44" y2="214" stroke="#3a3f4b" stroke-width="1.4"/><path d="M48,204 Q155,190 225,132 T345,64" fill="none" stroke="#ef6a52" stroke-width="3.2"/><text x="130" y="80" font-size="10" font-weight="700" fill="#ef6a52">AI Capability (64× in 3 yrs)</text><path d="M48,206 L165,206 L165,194 L275,194 L275,182 L348,182" fill="none" stroke="#8c8f96" stroke-width="2.2" stroke-dasharray="4 3"/><text x="172" y="208" font-size="9.5" fill="#8c8f96">Statutes (3–5 yr lag)</text><path d="M48,200 Q152,185 222,128 T345,60" fill="none" stroke="#4fb3a8" stroke-width="2.4" stroke-dasharray="3 3"/><text x="58" y="142" font-size="10" font-weight="700" fill="#4fb3a8">✓ CIN Silicon Gate (&lt;10 ms)</text><rect x="26" y="232" width="334" height="80" rx="8" fill="rgba(79,179,168,0.12)" stroke="#4fb3a8" stroke-width="1.4"/><text x="38" y="254" font-size="10" font-weight="700" fill="#4fb3a8">Power-Proportionate Auditability (Tiers 0–4)</text><text x="38" y="276" font-size="9.5" fill="#e9e6de">• Citizens (Tier 0): 100% private local enclave</text><text x="38" y="296" font-size="9.5" fill="#e9e6de">• Public Officials &amp; Labs (Tier 4): ZK compliance</text><rect x="386" y="12" width="362" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="400" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#e5a93c">2. POST-LABOR FISCAL &amp; TAX STABILIZATION</text><text x="400" y="64" font-size="9.5" font-weight="700" fill="#ef6a52">Today: 72% of State Tax Relies on Eroding Payroll</text><rect x="400" y="74" width="330" height="24" rx="4" fill="rgba(239,106,82,0.15)" stroke="#ef6a52" stroke-width="1.2"/><rect x="400" y="74" width="102" height="24" rx="4" fill="#ef6a52"/><text x="408" y="90" font-size="9.5" font-weight="700" fill="#111317">Shrinking Wage</text><text x="512" y="90" font-size="9.5" fill="#ef6a52">← Automation Fiscal Deficit</text><text x="400" y="124" font-size="9.5" font-weight="700" fill="#4fb3a8">CIN: $25k Exempt Floor + 2%/mo Hoard Demurrage</text><rect x="400" y="134" width="165" height="24" rx="4" fill="#4fb3a8"/><text x="408" y="150" font-size="9.5" font-weight="700" fill="#111317">$25k Exempt Floor</text><rect x="567" y="134" width="163" height="24" rx="4" fill="#e5a93c"/><text x="575" y="150" font-size="9.5" font-weight="700" fill="#111317">2%/mo → Civic Commons</text><rect x="400" y="176" width="330" height="136" rx="8" fill="#181c24" stroke="#2c303a" stroke-width="1.2"/><text x="414" y="200" font-size="10" font-weight="700" fill="#e9e6de">How CIN Stabilizes Democratic Institutions:</text><text x="414" y="224" font-size="9.5" fill="#4fb3a8">✓ Auto-funds schools, grids &amp; care via demurrage</text><text x="414" y="248" font-size="9.5" fill="#4fb3a8">✓ Blocks single-commander cyber/drone swarms</text><text x="414" y="272" font-size="9.5" fill="#4fb3a8">✓ Requires 2-of-2 Silicon Keys for city-scale risk</text><text x="414" y="296" font-size="9.5" font-weight="700" fill="#e5a93c">Result: Fast runtime safety + post-labor revenue</text></svg>'
    },
    research: {
      k: 'Lens 04 of 07 · Universities, Public Research & Perpetual Lineage Funding',
      title: 'Public Research Institutions: From Compute Starvation to Data Shapley Endowments',
      cites: ['[Leng et al., SPRA 2026]', '[Shapley, 1953]', '[Yadav et al., 2023]'],
      simHref: '#spra-studio',
      simText: 'Inspect SPRA 95.3% Token Compiler ↓',
      simConfig: {
        lbl: 'Interactive Stress-Test: Downstream Agent Tasks Citing a University Lab Paper',
        min: 10, max: 500, step: 10, val: 120,
        badK: 'Legacy arXiv + Cloud Scraping Model',
        okK: 'CIN Beyond-arXiv 15% Lineage Endowment',
        formatVal: function (v) { return v + ',000 Verified Tasks / yr'; },
        calc: function (v) {
          var endowment = Math.round(v * 3.6);
          return {
            badV: '$0 Downstream Royalties · Begging for GPU Grants',
            okV: '+$' + endowment + ',000/yr Lab Endowment + 95.3% SPRA Savings'
          };
        }
      },
      kpis: [
        ['Upstream Academic Royalty', '0% Today vs. 15% Perpetual'],
        ['Literature Context Cost', '5,500 tok vs. 260 tok (SPRA)'],
        ['Compute Requirement', '$100M Cluster vs. Peer LoRA']
      ],
      bars: [
        ['Downstream Royalty Return to Universities', '2% vs. 92%', 2, 92],
        ['Compute & Context Efficiency (SPRA 95.3%)', '18% vs. 95%', 18, 95],
        ['Reproducible Proof-Carrying Verification', '25% vs. 98%', 25, 98],
        ['Independence from Big-Tech Cloud Grants', '15% vs. 94%', 15, 94]
      ],
      stand: 'Universities originate 88% of core AI breakthroughs (Transformers, Diffusion, LoRA) on public grants, while commercial clouds capture 100% of revenue.',
      gap: 'Academic groups face 1,000:1 GPU cluster starvation, faculty poaching, and grant agencies overwhelmed by synthetic AI proposals.',
      cin: 'Beyond-arXiv Proof-Carrying Blueprints, 95.3% token-saving SPRA schemas, and 15% perpetual Data Shapley lineage royalties sustain public labs.',
      svg: '<svg viewBox="0 0 760 340" role="img" aria-label="Asymmetry bar chart showing Public Universities originating 88% of breakthroughs for 0% royalties versus CIN 15% perpetual Data Shapley academic endowment"><rect x="12" y="12" width="362" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#ef6a52">1. ACADEMIC ORIGIN VS. COMMERCIAL CAPTURE</text><text x="26" y="66" font-size="9.5" font-weight="700" fill="#e9e6de">A. Core AI Breakthroughs Originated (Transformers, LoRA)</text><rect x="26" y="76" width="292" height="22" rx="4" fill="#4fb3a8"/><text x="36" y="91" font-size="9.5" font-weight="700" fill="#111317">88% Public Universities &amp; Research Groups</text><rect x="320" y="76" width="40" height="22" rx="4" fill="#ef6a52"/><text x="26" y="124" font-size="9.5" font-weight="700" fill="#e9e6de">B. Frontier GPU Cluster Share ($100M+ Compute Pods)</text><rect x="26" y="134" width="10" height="22" rx="2" fill="#4fb3a8"/><rect x="38" y="134" width="322" height="22" rx="4" fill="#ef6a52"/><text x="48" y="149" font-size="9.5" font-weight="700" fill="#111317">&lt;1% Universities vs. 99% Cloud Hyperscalers</text><text x="26" y="182" font-size="9.5" font-weight="700" fill="#e9e6de">C. Downstream Commercial Royalties Paid Today</text><rect x="26" y="192" width="334" height="22" rx="4" fill="rgba(239,106,82,0.22)" stroke="#ef6a52" stroke-width="1.2"/><text x="36" y="207" font-size="9.5" font-weight="700" fill="#ef6a52">$0 Paid to arXiv Authors (100% Scraped Free)</text><text x="26" y="242" font-size="9.5" font-weight="700" fill="#4fb3a8">D. With CIN Ledger: Perpetual Academic Endowment</text><rect x="26" y="252" width="334" height="26" rx="5" fill="rgba(79,179,168,0.22)" stroke="#4fb3a8" stroke-width="1.8"/><text x="36" y="269" font-size="9.5" font-weight="700" fill="#4fb3a8">✓ 15% Perpetual Data Shapley Lineage Royalty</text><text x="26" y="304" font-size="9.5" fill="#8c8f96">Every downstream task settlement funds the lab.</text><rect x="386" y="12" width="362" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="400" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#4fb3a8">2. HOW CIN EMPOWERS UNIVERSITY RESEARCH</text><rect x="400" y="54" width="334" height="80" rx="9" fill="rgba(79,179,168,0.1)" stroke="#4fb3a8" stroke-width="1.4"/><text x="414" y="76" font-size="10" font-weight="700" fill="#4fb3a8">1. SPRA Schema-RAG (95.3% Token Savings)</text><text x="414" y="98" font-size="9.5" fill="#e9e6de">Compiles 5,500-token papers into 260-token formal</text><text x="414" y="118" font-size="9.5" fill="#e5a93c">schemas (Leng et al., 2026) for 20× lower GPU cost.</text><rect x="400" y="144" width="334" height="80" rx="9" fill="rgba(93,162,213,0.1)" stroke="#5da2d5" stroke-width="1.4"/><text x="414" y="166" font-size="10" font-weight="700" fill="#5da2d5">2. Federated TIES-LoRA Academic Mesh</text><text x="414" y="188" font-size="9.5" fill="#e9e6de">500 university groups co-train 18 MB rank-16 LoRA</text><text x="414" y="208" font-size="9.5" fill="#5da2d5">adapters over IETF QUIC without $1B clusters.</text><rect x="400" y="234" width="334" height="80" rx="9" fill="rgba(229,169,60,0.11)" stroke="#e5a93c" stroke-width="1.4"/><text x="414" y="256" font-size="10" font-weight="700" fill="#e5a93c">3. Beyond-arXiv Proof-Carrying Endowments</text><text x="414" y="278" font-size="9.5" fill="#e9e6de">Cryptographic citation DAG routes 15% royalties</text><text x="414" y="298" font-size="9.5" font-weight="700" fill="#4fb3a8">directly to university labs on every verified use.</text></svg>'
    },
    enterprise: {
      k: 'Lens 05 of 07 · Private Enterprise, Clinics & Small Business Coalitions',
      title: 'Private Enterprise: Cloud API Tenant vs. Cryptographic PSI Coalition',
      cites: ['[Freedman et al., EUROCRYPT 2004]', '[Coase, 1937]', '[Yadav et al., 2023]'],
      simHref: '#wedge-calc',
      simText: 'Test Small Business PSI Co-Op Savings ↓',
      simConfig: {
        lbl: 'Interactive Stress-Test: Independent Clinics / SMBs in PSI Coalition',
        min: 20, max: 500, step: 20, val: 200,
        badK: 'Fragmented Cloud API & GPO Renter',
        okK: 'CIN Local OCap + PSI Buyer Coalition',
        formatVal: function (v) { return v + ' Independent Firms'; },
        calc: function (v) {
          var disc = Math.min(36, Math.round(16 + Math.log10(v) * 7.5));
          return {
            badV: '-28% Middleman/GPO Toll · Workflows Leaked to Cloud',
            okV: '+' + disc + '% Wholesale Savings · 0 Bytes Trade-Secret Leak'
          };
        }
      },
      kpis: [
        ['Middleman / GPO Toll', '15%–40% Extracted vs. 0%'],
        ['Trade-Secret Exposure', 'Streamed to Cloud vs. 0 Bytes'],
        ['Competitive Moat', 'Disintermediated vs. PSI Co-Op']
      ],
      bars: [
        ['Trade-Secret & Customer Data Sovereignty', '16% vs. 100%', 16, 100],
        ['Wholesale Margin Retained (0% GPO Toll)', '60% vs. 98%', 60, 98],
        ['Shared Specialist AI Without IP Leakage', '14% vs. 94%', 14, 94],
        ['Protection Against Vertical Oligopolies', '18% vs. 95%', 18, 95]
      ],
      stand: 'Enterprises and independent clinics rent centralized AI wrappers while paying 15%–40% tolls to GPOs, clearinghouses, and SaaS platforms.',
      gap: 'Streaming proprietary workflows into conglomerate APIs trains the conglomerate to vertically disintermediate the enterprise.',
      cin: 'Local OCap sandboxes keep trade secrets on-premise while Private Set Intersection (PSI) buyer co-ops and TIES-LoRA out-compete oligopolies.',
      svg: '<svg viewBox="0 0 760 340" role="img" aria-label="5-Year Enterprise Competitive Divergence Curve comparing Cloud API Tenants against CIN Local OCap Sandbox and PSI Buyer Coalitions"><rect x="12" y="12" width="380" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#e9e6de">1. 5-YEAR ENTERPRISE MARGIN &amp; MOAT CURVE</text><line x1="48" y1="244" x2="368" y2="244" stroke="#3a3f4b" stroke-width="1.4"/><line x1="48" y1="62" x2="48" y2="244" stroke="#3a3f4b" stroke-width="1.4"/><text x="48" y="262" font-size="9.5" font-family="monospace" fill="#8c8f96">Year 1</text><text x="185" y="262" font-size="9.5" font-family="monospace" fill="#8c8f96">Year 3</text><text x="320" y="262" font-size="9.5" font-family="monospace" fill="#8c8f96">Year 5</text><path d="M52,175 Q150,142 240,104 T360,72" fill="none" stroke="#4fb3a8" stroke-width="3.4"/><circle cx="360" cy="72" r="5" fill="#4fb3a8"/><text x="60" y="88" font-size="10" font-weight="700" fill="#4fb3a8">CIN Sovereign Enterprise (+34% Margin)</text><text x="60" y="106" font-size="9.5" fill="#e9e6de">Local Wasm OCap + 500-Firm PSI Co-Op</text><path d="M52,165 Q160,170 250,182 T360,194" fill="none" stroke="#ef6a52" stroke-width="3.2"/><circle cx="360" cy="194" r="5" fill="#ef6a52"/><text x="60" y="214" font-size="10" font-weight="700" fill="#ef6a52">Stagnant Cloud API Renter (-18% Margin)</text><text x="60" y="232" font-size="9.5" fill="#8c8f96">Leaks IP to cloud + pays 15%–40% tolls</text><rect x="26" y="276" width="350" height="38" rx="7" fill="#181c24" stroke="#2c303a" stroke-width="1.2"/><text x="36" y="300" font-size="9.5" font-weight="700" fill="#e5a93c">Cloud prompts train oligarchies to replace you.</text><rect x="404" y="12" width="344" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="418" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#4fb3a8">2. SOVEREIGN ENTERPRISE STACK</text><rect x="418" y="54" width="316" height="80" rx="8" fill="rgba(79,179,168,0.1)" stroke="#4fb3a8" stroke-width="1.4"/><text x="430" y="76" font-size="10" font-weight="700" fill="#4fb3a8">A. Local Wasm OCap Sandbox (0 Bytes Leaked)</text><text x="430" y="98" font-size="9.5" fill="#e9e6de">ERP, clinical &amp; pricing files stay on-premise;</text><text x="430" y="118" font-size="9.5" fill="#4fb3a8">you own 100% of fine-tuned LoRA weights.</text><rect x="418" y="144" width="316" height="80" rx="8" fill="rgba(93,162,213,0.1)" stroke="#5da2d5" stroke-width="1.4"/><text x="430" y="166" font-size="10" font-weight="700" fill="#5da2d5">B. Private Set Intersection (PSI) Buyer Co-Ops</text><text x="430" y="188" font-size="9.5" fill="#e9e6de">500 independent clinics/SMBs match supplier SKUs</text><text x="430" y="208" font-size="9.5" font-weight="700" fill="#e5a93c">for 22%–34% wholesale cuts at 0% GPO fee.</text><rect x="418" y="234" width="316" height="80" rx="8" fill="rgba(229,169,60,0.1)" stroke="#e5a93c" stroke-width="1.4"/><text x="430" y="256" font-size="10" font-weight="700" fill="#e5a93c">C. Federated Guild TIES-LoRA Merging</text><text x="430" y="278" font-size="9.5" fill="#e9e6de">Independent firms pool verified domain skills</text><text x="430" y="298" font-size="9.5" font-weight="700" fill="#4fb3a8">to out-compete Fortune 500 conglomerates.</text></svg>'
    },
    humanity: {
      k: 'Lens 06 of 07 · Global Human Adoption & The Unprepared Non-Digital Majority',
      title: 'The Intelligence Gambit: Protecting the Non-Digital World’s Labor & Resource Trade',
      cites: ['[Datta et al., 2022]', '[Freedman et al., 2004]', '[Ostrom, 1990]'],
      simHref: '#pe-root',
      simText: 'Explore 30 Global Lives Across 6 Continents ↓',
      simConfig: {
        lbl: 'Interactive Stress-Test: Regional Producer PSI Co-Op Adoption',
        min: 10, max: 95, step: 5, val: 65,
        badK: 'Unshielded Producers vs. AI Buyer Cartels',
        okK: 'CIN $8 Somatic + Voice Twin + PSI Co-Op',
        formatVal: function (v) { return v + '% Producer Coalition Coverage'; },
        calc: function (v) {
          var gain = Math.round(12 + v * 0.4);
          return {
            badV: '-38% Commodity & Labor Price Dump by AI Cartels',
            okV: '+' + gain + '% Producer Income Retained + 5D Care/Craft Credit'
          };
        }
      },
      kpis: [
        ['Global Labor Exposed', '60%+ Physical & Resource Trade'],
        ['Hardware Entry Cost', '<$8 Pre-ADC Somatic + 8GB Phone'],
        ['Economic Accounting', '5D Vector (Care, Craft, Ecology)']
      ],
      bars: [
        ['Zero-Prompt Accessibility (Voice + Somatic)', '15% vs. 95%', 15, 95],
        ['Fair Valuation of Physical Craft & Care (5D)', '11% vs. 93%', 11, 93],
        ['Protection of Non-Digital Producer Terms', '14% vs. 91%', 14, 91],
        ['Offline / Low-Bandwidth Device Sovereignty', '20% vs. 96%', 20, 96]
      ],
      stand: 'Over 60% of humanity (4.8B+ people) trades physical labor, agriculture, and raw resources with minimal digital cushion.',
      gap: 'Automated AI commodity cartels weaponize asymmetric intelligence as a gambit to depress physical labor and resource prices globally.',
      cin: 'Zero-prompt offline voice twins, $8 Pre-ADC somatic hardware, PSI producer cooperatives, and 5D value accounting give physical workers parity.',
      svg: '<svg viewBox="0 0 760 340" role="img" aria-label="Global 8.1B Workforce and Resource Trade Asymmetry diagram comparing the Unleveraged Intelligence Gambit against CIN Somatic Witness and Producer PSI Co-Ops"><rect x="12" y="12" width="362" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#ef6a52">1. THE GLOBAL “INTELLIGENCE GAMBIT”</text><rect x="26" y="54" width="334" height="68" rx="8" fill="rgba(239,106,82,0.14)" stroke="#ef6a52" stroke-width="1.5"/><text x="38" y="76" font-size="10" font-weight="700" fill="#ef6a52">AI-Armed Commodity &amp; Buyer Cartels</text><text x="38" y="96" font-size="9.5" fill="#e9e6de">Swarm forecasting predicts harvests &amp; gluts</text><text x="38" y="112" font-size="9.5" fill="#e9e6de">to force fire-sale prices on physical producers.</text><path d="M192,124 L192,152" stroke="#ef6a52" stroke-width="2.4"/><text x="192" y="144" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ef6a52">30%–50% Surplus Extracted ↓</text><rect x="26" y="156" width="334" height="106" rx="8" fill="#181c24" stroke="#ef6a52" stroke-width="1.3"/><text x="38" y="178" font-size="10" font-weight="700" fill="#e9e6de">4.8B+ Non-Digital &amp; Physical Labor Majority</text><rect x="38" y="190" width="310" height="18" rx="4" fill="rgba(239,106,82,0.25)"/><rect x="38" y="190" width="195" height="18" rx="4" fill="#ef6a52"/><text x="46" y="203" font-size="9.5" font-weight="700" fill="#111317">60%+ Global Workforce Exposed</text><text x="38" y="228" font-size="9.5" fill="#8c8f96">• Farmers, artisans, builders, miners &amp; care</text><text x="38" y="248" font-size="9.5" font-weight="700" fill="#ef6a52">• Unshielded against algorithmic price-dumping</text><rect x="26" y="272" width="334" height="42" rx="7" fill="rgba(229,169,60,0.1)" stroke="#e5a93c" stroke-width="1.2"/><text x="38" y="298" font-size="9.5" font-weight="700" fill="#e5a93c">Asymmetric AI bankrupts non-digital trade.</text><rect x="386" y="12" width="362" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="400" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#4fb3a8">2. CIN PARITY FOR THE PHYSICAL WORLD</text><rect x="400" y="54" width="334" height="80" rx="8" fill="rgba(79,179,168,0.1)" stroke="#4fb3a8" stroke-width="1.4"/><text x="412" y="76" font-size="10" font-weight="700" fill="#4fb3a8">1. $8 Pre-ADC Hardware + Offline Voice Twin</text><text x="412" y="98" font-size="9.5" fill="#e9e6de">Runs offline on $45 phones in local dialect;</text><text x="412" y="118" font-size="9.5" fill="#4fb3a8">proves physical craft with 0 biometric leak.</text><rect x="400" y="144" width="334" height="80" rx="8" fill="rgba(93,162,213,0.1)" stroke="#5da2d5" stroke-width="1.4"/><text x="412" y="166" font-size="10" font-weight="700" fill="#5da2d5">2. Producer PSI Bargaining Cooperatives</text><text x="412" y="188" font-size="9.5" fill="#e9e6de">10,000 smallholders pool supply floors via PSI</text><text x="412" y="208" font-size="9.5" font-weight="700" fill="#e5a93c">to block price-dumping (+38% producer income).</text><rect x="400" y="234" width="334" height="80" rx="8" fill="rgba(229,169,60,0.11)" stroke="#e5a93c" stroke-width="1.4"/><text x="412" y="256" font-size="10" font-weight="700" fill="#e5a93c">3. 5D Value Ledger &amp; $25k Security Floor</text><text x="412" y="278" font-size="9.5" fill="#e9e6de">Credits Caregiving, Craft &amp; Ecology alongside</text><text x="412" y="298" font-size="9.5" font-weight="700" fill="#4fb3a8">digital code so physical workers thrive.</text></svg>'
    },
    pair: {
      k: 'Lens 07 of 07 · Unit Economics & The Only Uncopyable AI Moat',
      title: 'Economy of “Pair Intelligence”: Why Centralized AI Labs Are Unprofitable',
      cites: ['[Hu et al., LoRA 2022]', '[Yadav et al., 2023]', '[Ghorbani & Zou, 2019]'],
      simHref: '/notes/world-standing-and-cointelligence#pair-moat-sim',
      simText: 'Open Full 5-Year Pair-Moat Simulator →',
      simConfig: {
        lbl: 'Interactive Stress-Test: Years of 1-to-1 Human + Local Twin Co-Adaptation',
        min: 1, max: 10, step: 1, val: 5,
        badK: 'Centralized Cloud AI Moat (90-Day Distillation)',
        okK: 'Your 1-to-1 Pair Intelligence Moat',
        formatVal: function (v) { return v + (v === 1 ? ' Year' : ' Years') + ' Co-Adapted'; },
        calc: function (v) {
          var pairMoat = Math.min(99, Math.round(74 + v * 4.4));
          return {
            badV: '8% Pricing Power · -$5B to -$15B/yr Cloud Burn',
            okV: pairMoat + '% Uncopyable Moat · $0 Cloud Burn · 95% Royalties'
          };
        }
      },
      kpis: [
        ['Cloud AI Annual Burn', '-$5B to -$15B / yr (No Moat)'],
        ['Open-Weight Catch-Up Lag', '60–90 Days via Distillation'],
        ['True Uncopyable Moat', '1-to-1 Human + Local LoRA Pair']
      ],
      bars: [
        ['Long-Term Defensible Moat vs. Open Weights', '15% vs. 97%', 15, 97],
        ['Unit Economics ($0 Local vs. -$10B Cloud)', '18% vs. 96%', 18, 96],
        ['Tacit Human Craft & Somatic Context Depth', '12% vs. 98%', 12, 98],
        ['User Ownership of Compounding Memory', '8% vs. 100%', 8, 100]
      ],
      stand: 'Frontier AI companies lose $5B–$15B a year because $100B closed training runs are distilled into open weights within 60–90 days.',
      gap: 'Raw foundation-model token inference is a rapidly depreciating commodity with zero durable moat against open-source frontier weights.',
      cin: 'The only uncopyable moat is Pair Intelligence: the 1-to-1 co-adapted bond between your lived physical craft, 10-year memory vault, and local LoRA.',
      svg: '<svg viewBox="0 0 760 340" role="img" aria-label="Unit economics chart showing centralized cloud AI losing $5B to $15B per year due to 60-90 day open-weight distillation while 1-to-1 Pair Intelligence compounds an uncopyable moat"><rect x="12" y="12" width="368" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="26" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#ef6a52">1. WHY CLOUD AI BLEEDS $5B–$15B / YR</text><line x1="48" y1="232" x2="360" y2="232" stroke="#3a3f4b" stroke-width="1.4"/><line x1="48" y1="62" x2="48" y2="232" stroke="#3a3f4b" stroke-width="1.4"/><text x="48" y="250" font-size="9.5" font-family="monospace" fill="#8c8f96">Day 0</text><text x="135" y="250" font-size="9.5" font-family="monospace" fill="#ef6a52">Day 75 (Distilled)</text><text x="295" y="250" font-size="9.5" font-family="monospace" fill="#8c8f96">Year 5</text><path d="M52,118 Q105,192 180,212 T352,222" fill="none" stroke="#ef6a52" stroke-width="3.4"/><circle cx="135" cy="192" r="5" fill="#ef6a52"/><text x="148" y="182" font-size="9.5" font-weight="700" fill="#ef6a52">60–90 Day Open-Weight Cliff</text><text x="148" y="200" font-size="9.5" fill="#e9e6de">Cloud API Moat → Collapses to $0</text><path d="M52,156 Q140,126 235,96 T352,68" fill="none" stroke="#4fb3a8" stroke-width="3.6"/><circle cx="352" cy="68" r="5" fill="#4fb3a8"/><text x="58" y="76" font-size="10" font-weight="700" fill="#4fb3a8">1-to-1 Pair Intelligence (96% Moat)</text><text x="58" y="94" font-size="9.5" fill="#e9e6de">Compounds with your craft &amp; memory</text><rect x="26" y="266" width="340" height="48" rx="8" fill="rgba(239,106,82,0.1)" stroke="#ef6a52" stroke-width="1.2"/><text x="38" y="288" font-size="9.5" font-weight="700" fill="#ef6a52">$100B closed models have 0 switching moat</text><text x="38" y="305" font-size="9.5" fill="#e9e6de">once distilled into local open weights.</text><rect x="392" y="12" width="356" height="316" rx="12" fill="#14171d" stroke="#2c303a" stroke-width="1.5"/><text x="406" y="36" font-size="10.5" font-weight="700" font-family="monospace" fill="#4fb3a8">2. THE UNCOPYABLE 1-TO-1 PAIR MOAT</text><rect x="406" y="56" width="328" height="54" rx="8" fill="rgba(79,179,168,0.16)" stroke="#4fb3a8" stroke-width="1.6"/><text x="418" y="78" font-size="10" font-weight="700" fill="#4fb3a8">Layer 4: Tacit Human Craft &amp; Judgment (34%)</text><text x="418" y="98" font-size="9.5" fill="#e9e6de">Physical intuition &amp; lived domain mastery</text><rect x="406" y="120" width="328" height="54" rx="8" fill="rgba(93,162,213,0.14)" stroke="#5da2d5" stroke-width="1.4"/><text x="418" y="142" font-size="10" font-weight="700" fill="#5da2d5">Layer 3: 10-Yr Private Episodic Memory (32%)</text><text x="418" y="162" font-size="9.5" fill="#e9e6de">Encrypted on-device vault (0 bytes in cloud)</text><rect x="406" y="184" width="328" height="54" rx="8" fill="rgba(229,169,60,0.14)" stroke="#e5a93c" stroke-width="1.4"/><text x="418" y="206" font-size="10" font-weight="700" fill="#e5a93c">Layer 2: Local Rank-16 LoRA + Somatic Bond (30%)</text><text x="418" y="226" font-size="9.5" fill="#e9e6de">Co-adapted weights tuned to your workflows</text><rect x="406" y="248" width="328" height="36" rx="7" fill="#181c24" stroke="#3a3f4b" stroke-width="1.2"/><text x="418" y="270" font-size="9.5" fill="#8c8f96">Layer 1: Commodity Open-Weight Base (4%)</text><text x="406" y="308" font-size="10" font-weight="700" fill="#4fb3a8">✓ $0 Cloud Burn · ✓ 96% Uncopyable · ✓ 100% Yours</text></svg>'
    }
  };

  function renderBars(d, scaleDelta) {
    if (!barsEl || !d || !d.bars) return;
    var delta = scaleDelta || 0;
    barsEl.innerHTML = d.bars.map(function (b) {
      var badW = Math.max(4, Math.min(96, Math.round(b[2] - delta * 8)));
      var okW = Math.max(12, Math.min(100, Math.round(b[3] + delta * 6)));
      return (
        '<div class="wm-bar-item">' +
          '<div class="wm-bar-lbl"><span>' + b[0] + '</span><b>' + badW + '% vs. ' + okW + '%</b></div>' +
          '<div class="wm-bar-dual">' +
            '<i class="b-bad" style="width:' + badW + '%"></i>' +
            '<i class="b-ok" style="width:' + okW + '%"></i>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  var SHORT_NOTES = {
    labs: ['Scrapes public craft ($0); rents intelligence back via cloud APIs.', 'Equity valuation demands labor replacement & proprietary cloud lock-in.', 'Local OCap + 95% Data Shapley royalty + 5% philanthropic floor.'],
    safety: ['Voluntary pledges & RLHF patches fail under race pressure.', '40 bits/s human biology cannot survive unbound 10¹² bits/s swarms.', 'Two-Internet Airlock + Mortal Execution Lease = last resort before Pause.'],
    gov: ['Statutes lag 3–5 yrs behind 4.5-month AI capability doublings.', 'Payroll tax erosion starves cities while unitary AI centralizes power.', '<10ms silicon quorum gates + $25k floor + 2%/mo hoard demurrage.'],
    research: ['Universities originate 88% of breakthroughs for $0 commercial royalty.', 'Hyperscalers capture talent and price academia out of $100M+ clusters.', '15% perpetual Data Shapley citation royalty + SPRA (95.3% token cut).'],
    enterprise: ['Enterprises pay 15%–40% tolls to GPOs, SaaS & cloud wrappers.', 'Streaming workflows to cloud APIs trains conglomerates to replace you.', 'On-premise Wasm OCap sandbox + 500-firm PSI co-op (+34% margin).'],
    humanity: ['4.8B+ physical & resource workers face asymmetric AI buyer cartels.', 'Algorithmic commodity cartels dump producer prices by 30%–50%.', '$8 Pre-ADC sensor + offline voice twin + PSI producer co-op (+38% pay).'],
    pair: ['Closed cloud AI bleeds $5B–$15B/yr; distilled into open weights in 75 days.', 'Raw foundation-model token inference commoditizes toward $0 margin.', '1-to-1 Human Craft + 10-Yr Private Memory + Local LoRA = 96% moat.']
  };

  function renderD3LensOverlay(d, val, res) {
    if (!svgWrap || !window.d3) return;
    var svgNode = svgWrap.querySelector('svg');
    if (!svgNode) return;
    var d3 = window.d3;
    var svg = d3.select(svgNode);
    svg.attr('viewBox', '0 0 760 382').attr('data-rich-viz', 'true');
    svg.selectAll('g.wm-d3-live-gauge').remove();

    var span = Math.max(1, d.simConfig.max - d.simConfig.min);
    var ratio = Math.max(0.08, Math.min(0.92, (val - d.simConfig.min) / span));
    var g = svg.append('g').attr('class', 'wm-d3-live-gauge').attr('transform', 'translate(12, 336)');

    g.append('rect')
      .attr('x', 0).attr('y', 0).attr('width', 736).attr('height', 38).attr('rx', 8)
      .attr('fill', '#11151c').attr('stroke', '#4fb3a8').attr('stroke-width', 1.4);

    var barX = 178, barW = 542;
    var okW = Math.round(barW * (0.35 + ratio * 0.55));
    var badW = barW - okW;

    g.append('text')
      .attr('x', 12).attr('y', 16).attr('font-size', '9').attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8')
      .text('D3 LIVE STRESS-TEST');
    g.append('text')
      .attr('x', 12).attr('y', 30).attr('font-size', '9.5').attr('font-weight', '700').attr('fill', '#e9e6de')
      .text(d.simConfig.formatVal(val));

    g.append('rect')
      .attr('x', barX).attr('y', 8).attr('width', badW).attr('height', 22).attr('rx', 4)
      .attr('fill', 'rgba(239,106,82,0.28)').attr('stroke', '#ef6a52').attr('stroke-width', 1.1);

    g.append('rect')
      .attr('x', barX + badW).attr('y', 8).attr('width', okW).attr('height', 22).attr('rx', 4)
      .attr('fill', 'rgba(79,179,168,0.32)').attr('stroke', '#4fb3a8').attr('stroke-width', 1.3);

    g.append('circle')
      .attr('cx', barX + badW).attr('cy', 19).attr('r', 6)
      .attr('fill', '#e5a93c').attr('stroke', '#11151c').attr('stroke-width', 2);

    g.append('text')
      .attr('x', barX + 8).attr('y', 23).attr('font-size', '9').attr('font-weight', '700').attr('fill', '#ef6a52')
      .text(res.badV.slice(0, 34));

    g.append('text')
      .attr('x', barX + barW - 8).attr('y', 23).attr('text-anchor', 'end').attr('font-size', '9').attr('font-weight', '700').attr('fill', '#4fb3a8')
      .text(res.okV.slice(0, 42));
  }

  function updateSimReadout() {
    var d = LENSES[currentKey];
    if (!d || !d.simConfig || !simRng) return;
    var val = Number(simRng.value || d.simConfig.val);
    if (simVal) simVal.textContent = d.simConfig.formatVal(val);
    var res = d.simConfig.calc(val);
    if (soBadK) soBadK.textContent = d.simConfig.badK;
    if (soBadV) soBadV.textContent = res.badV;
    if (soOkK) soOkK.textContent = d.simConfig.okK;
    if (soOkV) soOkV.textContent = res.okV;
    var span = Math.max(1, d.simConfig.max - d.simConfig.min);
    var normDelta = (val - d.simConfig.val) / span;
    renderBars(d, normDelta);
    renderD3LensOverlay(d, val, res);
    renderD3RadarLens(currentKey, d, val, normDelta);
    renderD3FlowLens(currentKey, d, val, res, normDelta);
  }

  var RADAR_AXES = [
    'Human Sovereignty',
    'Creator Royalties',
    'Swarm Containment',
    'Local Privacy (0-Egress)',
    'Compute Access',
    'Uncopyable Moat'
  ];

  var RADAR_PROFILES = {
    labs:       { sq: [14, 5, 20, 12, 18, 15], ow: [48, 10, 32, 72, 68, 22], cin: [96, 95, 96, 100, 92, 96] },
    safety:     { sq: [16, 12, 24, 15, 22, 18], ow: [42, 14, 18, 65, 60, 20], cin: [98, 95, 98, 100, 90, 97] },
    gov:        { sq: [22, 18, 16, 20, 25, 20], ow: [45, 20, 28, 60, 58, 25], cin: [95, 92, 97, 98, 91, 94] },
    research:   { sq: [18, 2, 25, 22, 12, 16], ow: [62, 15, 38, 70, 54, 30], cin: [96, 94, 95, 98, 96, 95] },
    enterprise: { sq: [16, 14, 22, 10, 28, 14], ow: [54, 35, 36, 75, 62, 38], cin: [98, 96, 94, 100, 94, 97] },
    humanity:   { sq: [12, 10, 18, 14, 15, 12], ow: [38, 18, 26, 55, 42, 24], cin: [95, 94, 93, 98, 95, 94] },
    pair:       { sq: [10, 8, 20, 8, 20, 12], ow: [52, 20, 32, 78, 70, 18], cin: [99, 95, 96, 100, 94, 98] }
  };

  function renderD3RadarLens(key, d, val, normDelta) {
    var svgEl = document.getElementById('wm-d3-radar-svg');
    if (!svgEl || !window.d3) return;
    var d3 = window.d3;
    var svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    var prof = RADAR_PROFILES[key] || RADAR_PROFILES.labs;
    var boost = Math.round((normDelta || 0) * 6);
    var sqVals = prof.sq.map(function (v) { return Math.max(4, Math.min(95, v - boost)); });
    var owVals = prof.ow.map(function (v) { return Math.max(8, Math.min(95, v)); });
    var cinVals = prof.cin.map(function (v) { return Math.max(50, Math.min(100, v + Math.round(boost * 0.5))); });

    svg.append('rect').attr('x', 8).attr('y', 8).attr('width', 744).attr('height', 344).attr('rx', 12)
      .attr('fill', '#12161f').attr('stroke', '#2c303a').attr('stroke-width', 1.5);

    svg.append('text').attr('x', 24).attr('y', 32).attr('font-size', 10.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8')
      .text('D3.JS V7 6-AXIS STRUCTURAL RADAR: STATUS QUO VS. OPEN WEIGHTS VS. CIN CO-INTELLIGENCE');

    var cx = 205, cy = 192, maxR = 112;
    [0.25, 0.5, 0.75, 1.0].forEach(function (ring) {
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', maxR * ring)
        .attr('fill', 'none').attr('stroke', '#2a303c').attr('stroke-dasharray', ring < 1 ? '3 3' : 'none');
    });

    var n = RADAR_AXES.length;
    RADAR_AXES.forEach(function (axisName, i) {
      var ang = -Math.PI / 2 + (i * 2 * Math.PI / n);
      var x2 = cx + Math.cos(ang) * maxR;
      var y2 = cy + Math.sin(ang) * maxR;
      svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', x2).attr('y2', y2).attr('stroke', '#323846');
      var lx = cx + Math.cos(ang) * (maxR + 22);
      var ly = cy + Math.sin(ang) * (maxR + 16);
      var anchor = Math.abs(Math.cos(ang)) < 0.2 ? 'middle' : (Math.cos(ang) > 0 ? 'start' : 'end');
      svg.append('text').attr('x', lx).attr('y', ly + 3).attr('text-anchor', anchor)
        .attr('font-size', 9.2).attr('font-weight', '700').attr('fill', '#d5d9e2').text(axisName);
    });

    function polyPoints(arr) {
      return arr.map(function (v, i) {
        var ang = -Math.PI / 2 + (i * 2 * Math.PI / n);
        var r = (v / 100) * maxR;
        return (cx + Math.cos(ang) * r).toFixed(1) + ',' + (cy + Math.sin(ang) * r).toFixed(1);
      }).join(' ');
    }

    svg.append('polygon').attr('points', polyPoints(sqVals))
      .attr('fill', 'rgba(239,106,82,0.22)').attr('stroke', '#ef6a52').attr('stroke-width', 2);
    svg.append('polygon').attr('points', polyPoints(owVals))
      .attr('fill', 'rgba(229,169,60,0.16)').attr('stroke', '#e5a93c').attr('stroke-width', 1.8).attr('stroke-dasharray', '4 3');
    svg.append('polygon').attr('points', polyPoints(cinVals))
      .attr('fill', 'rgba(79,179,168,0.28)').attr('stroke', '#4fb3a8').attr('stroke-width', 2.6);

    // Right panel: 6-row live D3 comparative table
    var rx = 408, ry = 54;
    svg.append('rect').attr('x', rx).attr('y', ry).attr('width', 328).attr('height', 278).attr('rx', 10)
      .attr('fill', '#161b24').attr('stroke', '#2c303a');
    svg.append('text').attr('x', rx + 14).attr('y', ry + 24).attr('font-size', 9.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#e5a93c')
      .text('DIMENSION               CLOUD   OPEN    CIN');

    RADAR_AXES.forEach(function (ax, idx) {
      var y = ry + 54 + idx * 36;
      svg.append('line').attr('x1', rx + 12).attr('y1', y - 16).attr('x2', rx + 316).attr('y2', y - 16).attr('stroke', '#252a34');
      svg.append('text').attr('x', rx + 14).attr('y', y).attr('font-size', 9.5).attr('font-weight', '600').attr('fill', '#e9e6de').text(ax);
      svg.append('text').attr('x', rx + 188).attr('y', y).attr('font-size', 9.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#ef6a52').text(sqVals[idx] + '%');
      svg.append('text').attr('x', rx + 242).attr('y', y).attr('font-size', 9.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#e5a93c').text(owVals[idx] + '%');
      svg.append('text').attr('x', rx + 292).attr('y', y).attr('font-size', 9.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8').text(cinVals[idx] + '%');
    });
  }

  function renderD3FlowLens(key, d, val, res, normDelta) {
    var svgEl = document.getElementById('wm-d3-flow-svg');
    if (!svgEl || !window.d3) return;
    var d3 = window.d3;
    var svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    svg.append('rect').attr('x', 8).attr('y', 8).attr('width', 744).attr('height', 344).attr('rx', 12)
      .attr('fill', '#12161f').attr('stroke', '#2c303a').attr('stroke-width', 1.5);

    svg.append('text').attr('x', 24).attr('y', 32).attr('font-size', 10.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8')
      .text('D3.JS V7 CO-INTELLIGENCE LAB: $100 VALUE FLOW, BIOLOGICAL AIRLOCK & 96% PAIR MOAT');

    // Left panel: $100 Value & Incentive Flow
    svg.append('rect').attr('x', 22).attr('y', 46).attr('width', 348).attr('height', 290).attr('rx', 10)
      .attr('fill', '#161b24').attr('stroke', '#2c303a');
    svg.append('text').attr('x', 36).attr('y', 70).attr('font-size', 9.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#ef6a52')
      .text('1. STATUS QUO: RENT & EXTRACTION FLOW');

    var flowsSq = [
      { label: 'Cloud Shareholder & GPU Rent', pct: 72, col: '#ef6a52' },
      { label: 'Middleman / API / GPO Markup', pct: 28, col: '#d97757' },
      { label: 'Human Creator / Solver Royalty', pct: 0, col: '#6e7681' }
    ];
    flowsSq.forEach(function (f, i) {
      var y = 84 + i * 34;
      svg.append('text').attr('x', 36).attr('y', y + 11).attr('font-size', 9.2).attr('fill', '#d5d9e2').text(f.label);
      svg.append('rect').attr('x', 212).attr('y', y).attr('width', Math.max(6, f.pct * 1.35)).attr('height', 16).attr('rx', 4).attr('fill', f.col);
      svg.append('text').attr('x', 218 + Math.max(6, f.pct * 1.35)).attr('y', y + 12).attr('font-size', 9.2).attr('font-weight', '700').attr('fill', f.col).text('$' + f.pct);
    });

    svg.append('text').attr('x', 36).attr('y', 204).attr('font-size', 9.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8')
      .text('2. CIN LEDGER: COOPERATION & SHAPLEY FLOW');

    var flowsCin = [
      { label: 'Direct Human Solver (Shapley)', pct: 85, col: '#4fb3a8' },
      { label: 'Upstream Academic & Lineage', pct: 10, col: '#5da2d5' },
      { label: 'Universal $25k Floor & Commons', pct: 5, col: '#e5a93c' }
    ];
    flowsCin.forEach(function (f, i) {
      var y = 218 + i * 34;
      svg.append('text').attr('x', 36).attr('y', y + 11).attr('font-size', 9.2).attr('fill', '#d5d9e2').text(f.label);
      svg.append('rect').attr('x', 212).attr('y', y).attr('width', Math.max(10, f.pct * 1.35)).attr('height', 16).attr('rx', 4).attr('fill', f.col);
      svg.append('text').attr('x', 218 + Math.max(10, f.pct * 1.35)).attr('y', y + 12).attr('font-size', 9.2).attr('font-weight', '700').attr('fill', f.col).text('$' + f.pct);
    });

    // Right panel: Biological (~40 bits/s) vs. Silicon Swarm (10^12 bits/s) Airlock & 96% Pair Moat
    svg.append('rect').attr('x', 384).attr('y', 46).attr('width', 352).attr('height', 290).attr('rx', 10)
      .attr('fill', '#161b24').attr('stroke', '#2c303a');
    svg.append('text').attr('x', 398).attr('y', 70).attr('font-size', 9.5).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#e5a93c')
      .text('3. BIOLOGICAL AIRLOCK & 1-TO-1 PAIR MOAT');

    // Bandwidth mismatch visual
    svg.append('rect').attr('x', 398).attr('y', 84).attr('width', 324).attr('height', 74).attr('rx', 8)
      .attr('fill', 'rgba(239,106,82,0.1)').attr('stroke', '#ef6a52');
    svg.append('text').attr('x', 410).attr('y', 104).attr('font-size', 9.5).attr('font-weight', '700').attr('fill', '#ef6a52')
      .text('Competitive Intelligence Trap (Without CIN Airlock)');
    svg.append('text').attr('x', 410).attr('y', 124).attr('font-size', 9.2).attr('fill', '#e9e6de')
      .text('Human Biology: ~40 bits/s · 25-yr generation');
    svg.append('text').attr('x', 410).attr('y', 144).attr('font-size', 9.2).attr('font-weight', '700').attr('fill', '#ef6a52')
      .text('Unbound Swarms: 10¹² bits/s · 4.5-mo doubling → Extinction');

    // CIN Co-Intelligence Airlock + Pair Moat visual
    svg.append('rect').attr('x', 398).attr('y', 170).attr('width', 324).attr('height', 152).attr('rx', 8)
      .attr('fill', 'rgba(79,179,168,0.14)').attr('stroke', '#4fb3a8').attr('stroke-width', 1.6);
    svg.append('text').attr('x', 410).attr('y', 192).attr('font-size', 9.5).attr('font-weight', '700').attr('fill', '#4fb3a8')
      .text('CIN Co-Intelligence Barrier (Last Resort Before Pause)');
    svg.append('text').attr('x', 410).attr('y', 214).attr('font-size', 9.2).attr('fill', '#e9e6de')
      .text('✓ Two-Internet OCap Airlock: 0 direct bot-to-human contact');
    svg.append('text').attr('x', 410).attr('y', 234).attr('font-size', 9.2).attr('fill', '#e9e6de')
      .text('✓ 24h Mortal Execution Lease + 1-to-1 Silicon PUF Bond');
    svg.append('text').attr('x', 410).attr('y', 254).attr('font-size', 9.2).attr('fill', '#e9e6de')
      .text('✓ 96% Pair Moat: 34% Craft + 32% Memory + 30% Local LoRA');

    svg.append('rect').attr('x', 410).attr('y', 270).attr('width', 300).attr('height', 38).attr('rx', 6)
      .attr('fill', '#11151c').attr('stroke', '#e5a93c');
    svg.append('text').attr('x', 422).attr('y', 286).attr('font-size', 8.8).attr('font-family', 'monospace').attr('fill', '#e5a93c')
      .text('ACTIVE STRESS-TEST (' + d.simConfig.formatVal(val) + '):');
    svg.append('text').attr('x', 422).attr('y', 301).attr('font-size', 9.2).attr('font-weight', '700').attr('fill', '#4fb3a8')
      .text(res.okV.slice(0, 48));
  }

  function selectLens(key) {
    var d = LENSES[key];
    if (!d) return;
    currentKey = key;

    [].forEach.call(wmTabs.querySelectorAll('[data-wm-lens]'), function (btn) {
      btn.setAttribute('aria-selected', String(btn.getAttribute('data-wm-lens') === key));
    });

    if (kEl) kEl.textContent = d.k;
    if (titleEl) titleEl.textContent = d.title;
    if (citesEl) {
      citesEl.innerHTML = d.cites.map(function (c) {
        return '<span class="cite-badge">' + c + '</span>';
      }).join('');
    }
    if (svgWrap) svgWrap.innerHTML = d.svg;
    if (d.simConfig && simRng) {
      if (simLbl) simLbl.textContent = d.simConfig.lbl;
      simRng.min = String(d.simConfig.min);
      simRng.max = String(d.simConfig.max);
      simRng.step = String(d.simConfig.step);
      simRng.value = String(d.simConfig.val);
      updateSimReadout();
    }
    if (kpisEl) {
      kpisEl.innerHTML = d.kpis.map(function (kp) {
        return '<div class="wm-kpi"><span>' + kp[0] + '</span><b>' + kp[1] + '</b></div>';
      }).join('');
    }

    var sn = SHORT_NOTES[key] || [d.stand, d.gap, d.cin];
    if (standEl) standEl.textContent = sn[0];
    if (gapEl) gapEl.textContent = sn[1];
    if (cinEl) cinEl.textContent = sn[2];
    var detEl = document.getElementById('wm-c-detail');
    if (detEl) detEl.textContent = d.stand + ' ' + d.gap + ' ' + d.cin;
    if (simLink) {
      simLink.href = d.simHref;
      simLink.textContent = d.simText;
    }
  }

  if (simRng) {
    simRng.addEventListener('input', updateSimReadout);
  }

  wmTabs.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wm-lens]');
    if (!btn) return;
    selectLens(btn.getAttribute('data-wm-lens'));
  });
  var urlLens = (location.search.match(/[?&]lens=([a-z]+)/) || [])[1];
  if (urlLens && LENSES[urlLens]) {
    selectLens(urlLens);
  } else {
    updateSimReadout();
  }

  var wmVizModes = document.getElementById('wm-viz-modes');
  var radarWrap = document.getElementById('wm-d3-radar-wrap');
  var flowWrap = document.getElementById('wm-d3-flow-wrap');
  if (wmVizModes) {
    wmVizModes.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-wm-mode]');
      if (!btn) return;
      var mode = btn.getAttribute('data-wm-mode');
      [].forEach.call(wmVizModes.querySelectorAll('[data-wm-mode]'), function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.style.borderColor = on ? 'var(--ok)' : '';
        b.style.background = on ? 'color-mix(in srgb,var(--ok) 16%,var(--card))' : '';
      });
      if (svgWrap) svgWrap.hidden = (mode !== 'arch');
      if (radarWrap) radarWrap.hidden = (mode !== 'radar');
      if (flowWrap) flowWrap.hidden = (mode !== 'flow');
      updateSimReadout();
    });
  }
})();

// ==========================================================================
// ?v=54 D3.JS V7 RISK-SCALED QUORUM CURVE IN #swarm-lock
// ==========================================================================
(function () {
  var slSvgEl = document.getElementById('sl-d3-curve-svg');
  var slSlider = document.getElementById('sl-risk-slider');
  var slRoot = document.getElementById('swarm-lock');
  if (!slSvgEl || !slSlider || !slRoot) return;

  function renderSwarmLockD3(rPct) {
    if (!window.d3) return;
    var d3 = window.d3;
    var svg = d3.select(slSvgEl);
    svg.selectAll('*').remove();

    var r01 = Math.max(0, Math.min(1, Number(rPct || 0) / 100));
    var phiVal = r01 <= 0.001 ? 0 : (1 - Math.pow(1 - Math.min(0.9999, r01), 5));
    var lockHrs = r01 > 0.30 ? Math.round(72 * r01 * r01 * 10) / 10 : 0;

    svg.append('rect').attr('x', 6).attr('y', 6).attr('width', 748).attr('height', 172).attr('rx', 12)
      .attr('fill', '#12161f').attr('stroke', '#2c303a').attr('stroke-width', 1.5);

    svg.append('text').attr('x', 22).attr('y', 28).attr('font-size', 10).attr('font-weight', '700').attr('font-family', 'monospace').attr('fill', '#4fb3a8')
      .text('D3.JS V7 RISK-SCALED QUORUM CURVE: Φ(R) = 1 − (1 − R)⁵ & DELIBERATION TIME-LOCK τ(R) = 72h·R²');

    var xScale = d3.scaleLinear().domain([0, 100]).range([54, 480]);
    var yScale = d3.scaleLinear().domain([0, 100]).range([148, 46]);

    // Axes
    svg.append('line').attr('x1', 54).attr('y1', 148).attr('x2', 480).attr('y2', 148).attr('stroke', '#3a3f4b');
    svg.append('line').attr('x1', 54).attr('y1', 46).attr('x2', 54).attr('y2', 148).attr('stroke', '#3a3f4b');

    [0, 25, 50, 75, 100].forEach(function (t) {
      svg.append('text').attr('x', xScale(t)).attr('y', 164).attr('text-anchor', 'middle').attr('font-size', 8.8).attr('font-family', 'monospace').attr('fill', '#8c8f96').text(t + '% Risk');
    });

    // Plot Phi(R) curve
    var pts = d3.range(0, 101, 2).map(function (x) {
      var rr = x / 100;
      var pp = rr <= 0.001 ? 0 : (1 - Math.pow(1 - rr, 5)) * 100;
      return [xScale(x), yScale(pp)];
    });
    var lineGen = d3.line();
    svg.append('path').attr('d', lineGen(pts)).attr('fill', 'none').attr('stroke', '#4fb3a8').attr('stroke-width', 3);

    // Current marker
    var cx = xScale(r01 * 100);
    var cy = yScale(phiVal * 100);
    svg.append('line').attr('x1', cx).attr('y1', 46).attr('x2', cx).attr('y2', 148).attr('stroke', '#e5a93c').attr('stroke-dasharray', '3 3');
    svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 6.5).attr('fill', r01 > 0.5 ? '#ef6a52' : '#4fb3a8').attr('stroke', '#fff').attr('stroke-width', 2);

    // Right readout panel
    svg.append('rect').attr('x', 502).attr('y', 40).attr('width', 236).attr('height', 124).attr('rx', 9)
      .attr('fill', '#161b24').attr('stroke', r01 > 0.5 ? '#ef6a52' : '#4fb3a8').attr('stroke-width', 1.4);
    svg.append('text').attr('x', 516).attr('y', 62).attr('font-size', 9.2).attr('font-family', 'monospace').attr('fill', '#c7cbd4')
      .text('BLAST-RADIUS RISK: ' + Math.round(r01 * 1000) / 10 + '%');
    svg.append('text').attr('x', 516).attr('y', 86).attr('font-size', 11).attr('font-weight', '700').attr('fill', '#4fb3a8')
      .text('Quorum Φ(R): ' + (phiVal * 100).toFixed(2) + '%');
    svg.append('text').attr('x', 516).attr('y', 110).attr('font-size', 10).attr('font-weight', '700').attr('fill', '#e5a93c')
      .text('Time-Lock τ(R): ' + (lockHrs > 0 ? lockHrs + ' hrs' : '0h (Immediate)'));
    svg.append('text').attr('x', 516).attr('y', 136).attr('font-size', 9.2).attr('font-weight', '700').attr('fill', r01 > 0.5 ? '#ef6a52' : '#4fb3a8')
      .text(r01 > 0.5 ? '✗ SINGLE-COMMANDER BLOCKED' : '✓ UNLOCKED BY LOCAL CONSENT');
  }

  slSlider.addEventListener('input', function () {
    renderSwarmLockD3(slSlider.value);
  });
  slRoot.addEventListener('click', function (e) {
    if (e.target.closest('[data-sl-task]')) {
      setTimeout(function () { renderSwarmLockD3(slSlider.value); }, 10);
    }
  });
  if (window.d3) renderSwarmLockD3(slSlider.value);
  else window.addEventListener('load', function () { renderSwarmLockD3(slSlider.value); });
})();
