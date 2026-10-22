// Ideas and discussion. Everyone can read; signed-in people can post, vote and comment.
// The agents read every idea every hour; their response (and anything they hid) is in /data/idea-status.json.
import { backend, mountAuth, signIn, el, getJSON, ago } from './portal.js?v=3';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc, deleteDoc, getCountFromServer, getDoc }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { IDEA_CATEGORIES, IDEA_STATUSES, filterIdeas, calculateCategoryCounts, validateIdeaSubmission } from './ideas-logic.js?v=1';

let user = null, db = null, status = {};
let allIdeas = [];
let activeCategory = 'all';

const list = document.getElementById('ideas');
const form = document.getElementById('idea-form');
const note = document.getElementById('form-note');
const filterHost = document.getElementById('category-filters');

function when(ts) { return ts && ts.toDate ? ago(ts.toDate().toISOString()) : ''; }

function renderFilterBar(counts) {
  if (!filterHost) return;
  filterHost.textContent = '';
  const filterKeys = [
    ['all', 'All'],
    ['safety', 'Safe AI'],
    ['collective', 'Deciding together'],
    ['value', 'Value'],
    ['simulation', 'Simulations'],
    ['forecast', 'Forecasting'],
    ['interface', 'Your agent'],
    ['other', 'Other'],
  ];

  for (const [key, label] of filterKeys) {
    const btn = el('button', 'filter-pill');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', String(activeCategory === key));
    btn.append(
      document.createTextNode(label + ' '),
      el('span', 'pill-count', String(counts[key] || 0))
    );
    btn.onclick = () => {
      if (activeCategory === key) return;
      activeCategory = key;
      renderFilterBar(counts);
      renderIdeaList();
    };
    filterHost.appendChild(btn);
  }
}

async function renderIdeaList() {
  list.textContent = '';
  const filtered = filterIdeas(allIdeas, activeCategory);
  if (!filtered.length) {
    const emptyMsg = activeCategory === 'all'
      ? 'No ideas yet. Be the first.'
      : 'No ideas in this category yet. Be the first to post one.';
    list.appendChild(el('p', 'muted', emptyMsg));
    return;
  }
  for (const item of filtered) {
    list.appendChild(await card(item.id, item.data, item.status));
  }
}

async function load() {
  status = await getJSON('/data/idea-status.json').catch(() => ({}));
  const b = await backend();
  if (!b) { list.textContent = 'Discussion is opening shortly.'; return; }
  db = b.db;
  let snap;
  try { snap = await getDocs(query(collection(db, 'ideas'), orderBy('createdAt', 'desc'), limit(100))); }
  catch (e) { list.textContent = 'Discussion is opening shortly.'; form.querySelector('button').disabled = true; return; }

  allIdeas = snap.docs.map((d) => ({
    id: d.id,
    data: d.data(),
    status: status[d.id] || {},
  }));

  const counts = calculateCategoryCounts(allIdeas);
  renderFilterBar(counts);
  await renderIdeaList();
}

async function card(id, it, s) {
  const c = el('article', 'card idea');
  const meta = el('div', 'meta');
  meta.appendChild(el('span', 'tag', IDEA_CATEGORIES[it.category] || it.category));
  if (IDEA_STATUSES[s.status]) meta.appendChild(el('span', 'tag ' + IDEA_STATUSES[s.status][1], IDEA_STATUSES[s.status][0]));
  meta.appendChild(el('span', 'muted', (it.authorName || 'Someone') + ' · ' + when(it.createdAt)));
  c.append(meta, el('h3', null, it.title), el('p', 'body', it.body));
  if (s.note) c.appendChild(el('p', 'notice', 'Our agents: ' + s.note));
  const row = el('div', 'meta');
  const votes = await getCountFromServer(collection(db, 'ideas', id, 'votes')).then((r) => r.data().count).catch(() => 0);
  const vote = el('button', 'btn vote', '▲ ' + votes);
  let mine = false;
  if (user) mine = (await getDoc(doc(db, 'ideas', id, 'votes', user.uid)).catch(() => null))?.exists() || false;
  vote.setAttribute('aria-pressed', String(mine));
  vote.onclick = async () => {
    if (!user) { vote.title = 'Sign in to vote'; return; }
    const ref = doc(db, 'ideas', id, 'votes', user.uid);
    if (mine) await deleteDoc(ref); else await setDoc(ref, { createdAt: serverTimestamp() });
    mine = !mine; const n = parseInt(vote.textContent.slice(2), 10) + (mine ? 1 : -1);
    vote.textContent = '▲ ' + n; vote.setAttribute('aria-pressed', String(mine));
  };
  const talk = el('button', 'btn', 'Discussion');
  row.append(vote, talk);
  c.appendChild(row);
  const thread = el('div', 'comments'); thread.hidden = true; c.appendChild(thread);
  talk.onclick = () => { thread.hidden = !thread.hidden; if (!thread.hidden && !thread.dataset.loaded) comments(id, thread); };
  return c;
}

async function comments(id, host) {
  host.dataset.loaded = '1'; host.textContent = '';
  const snap = await getDocs(query(collection(db, 'ideas', id, 'comments'), orderBy('createdAt', 'asc'), limit(200))).catch(() => null);
  (snap ? snap.docs : []).forEach((d) => { const x = d.data(); const p = el('div', 'comment'); p.append(el('b', null, (x.authorName || 'Someone') + ' · ' + when(x.createdAt)), el('div', null, x.body)); host.appendChild(p); });
  if (user) {
    const f = el('form', 'stack'); const t = el('textarea'); t.required = true; t.minLength = 2; t.maxLength = 2000; t.placeholder = 'Add to the discussion';
    const go = el('button', 'btn', 'Post'); f.append(t, go);
    f.onsubmit = async (e) => { e.preventDefault(); go.disabled = true;
      await addDoc(collection(db, 'ideas', id, 'comments'), { body: t.value.trim(), authorUid: user.uid, authorName: (user.displayName || 'Member').slice(0, 60), createdAt: serverTimestamp() })
        .then(() => comments(id, host)).catch(() => { go.disabled = false; f.appendChild(el('p', 'muted', 'That did not post. Comments are 2 to 2,000 characters.')); }); };
    host.appendChild(f);
  } else host.appendChild(el('p', 'muted', 'Sign in to join the discussion.'));
}

form.onsubmit = async (e) => {
  e.preventDefault();
  if (!user || !db) { note.textContent = 'Sign in first.'; return; }
  const btn = form.querySelector('button'); btn.disabled = true; note.textContent = '';
  const title = form.elements.title.value.trim();
  const body = form.elements.body.value.trim();
  const category = form.elements.category.value;

  const val = validateIdeaSubmission(title, body, category);
  if (!val.ok) {
    note.textContent = val.error;
    btn.disabled = false;
    return;
  }

  const data = { title, body, category, authorUid: user.uid, authorName: (user.displayName || 'Member').slice(0, 60), createdAt: serverTimestamp() };
  try { await addDoc(collection(db, 'ideas'), data); form.reset(); note.textContent = 'Thank you. Our agents read every idea, usually within a few hours.'; load(); }
  catch (err) { note.textContent = 'That did not post. Titles are 5 to 120 characters, descriptions 20 to 4,000.'; }
  btn.disabled = false;
};

const here = document.getElementById('signin-here');
if (here) here.onclick = () => { const m = document.getElementById('signin-msg'); m.textContent = ''; signIn().then((err) => { m.textContent = err; }); };

const loadTimeout = setTimeout(() => {
  const box = document.getElementById('ideas');
  if (box && box.textContent.trim().startsWith('Loading')) {
    box.textContent = 'Ideas are taking a while to load. Check your connection, or check back shortly.';
  }
}, 3500);

load().finally(() => clearTimeout(loadTimeout));

mountAuth((u) => {
  const prevUser = user;
  user = u;
  form.querySelector('fieldset').disabled = !u;
  document.getElementById('signin-hint').hidden = !!u;
  if (u || (prevUser && !u)) {
    load();
  }
});
