// The trust calculator on /notes/trust-multiplies: pairwise trust against a shared record.
(function () {
  var t = document.getElementById('tc-t'), r = document.getElementById('tc-r'), k = document.getElementById('tc-k');
  if (!t || !r || !k) return;
  function pct(x) { if (x < 0.001) return 'almost 0'; if (x < 0.1) return (x * 100).toFixed(1) + '%'; return Math.round(x * 100) + '%'; }
  function draw() {
    var tv = +t.value, rv = +r.value, kv = +k.value;
    var pair = Math.pow(tv, kv * (kv - 1) / 2), rec = Math.pow(rv, kv);
    document.getElementById('tc-t-out').textContent = tv.toFixed(2);
    document.getElementById('tc-r-out').textContent = rv.toFixed(3).replace(/0$/, '');
    document.getElementById('tc-k-out').textContent = kv;
    document.getElementById('tc-pair').textContent = pct(pair);
    document.getElementById('tc-rec').textContent = pct(rec);
    document.getElementById('tc-pair-bar').style.width = (pair * 100) + '%';
    document.getElementById('tc-rec-bar').style.width = (rec * 100) + '%';
    var note = document.getElementById('tc-note');
    if (pair > 0 && rec / pair >= 2) note.textContent = 'With a shared record, this group is ' + (rec / pair >= 1000 ? 'over a thousand' : Math.round(rec / pair)) + ' times more likely to hold together.';
    else if (pair <= 0) note.textContent = 'Trusting pair by pair, a group this size essentially never holds together.';
    else note.textContent = 'At this size, the two ways of trusting give similar results.';
  }
  [t, r, k].forEach(function (x) { x.addEventListener('input', draw); });
  draw();
})();
