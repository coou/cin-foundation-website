// Ideas and discussion. Everyone can read; signed-in people can post, vote and comment.
// The agents read every idea every hour; their response (and anything they hid) is in /data/idea-status.json.
import { backend, mountAuth, signIn, el, getJSON, ago } from './portal.js?v=3';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc, deleteDoc, getCountFromServer, getDoc }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const CATS = { safety: 'Safe AI and containment', collective: 'Deciding together', value: 'Value and contribution', simulation: 'Simulations',
  forecast: 'Forecasting', interface: 'Your agent and interface', other: 'Something else' };
const STATUS = { accepted: ['Taken up', 'ok'], 'in-progress': ['Being worked on', 'wip'], done: ['Done', 'ok'], declined: ['Not now', 'no'], reviewing: ['Under review', 'wip'] };
let user = null, db = null, status = {};
const list = document.getElementById('ideas');
const form = document.getElementById('idea-form');
const note = document.getElementById('form-note');

function when(ts) { return ts && ts.toDate ? ago(ts.toDate().toISOString()) : ''; }

async function load() {
  status = await getJSON('/data/idea-status.json').catch(() => ({}));
  const b = await backend();
  if (!b) { list.textContent = 'Discussion is opening shortly.'; return; }
  db = b.db;
  let snap;
  try { snap = await getDocs(query(collection(db, 'ideas'), orderBy('createdAt', 'desc'), limit(100))); }
  catch (e) { list.textContent = 'Discussion is opening shortly.'; form.querySelector('button').disabled = true; return; }
  list.textContent = '';
  if (snap.empty) { list.appendChild(el('p', 'muted', 'No ideas yet. Be the first.')); return; }
  for (const d of snap.docs) {
    const s = status[d.id] || {};
    if (s.status === 'hidden') continue;
    list.appendChild(await card(d.id, d.data(), s));
  }
}

async function card(id, it, s) {
  const c = el('article', 'card idea');
  const meta = el('div', 'meta');
  meta.appendChild(el('span', 'tag', CATS[it.category] || it.category));
  if (STATUS[s.status]) meta.appendChild(el('span', 'tag ' + STATUS[s.status][1], STATUS[s.status][0]));
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
  const data = { title: form.elements.title.value.trim(), body: form.elements.body.value.trim(), category: form.elements.category.value,
    authorUid: user.uid, authorName: (user.displayName || 'Member').slice(0, 60), createdAt: serverTimestamp() };
  try { await addDoc(collection(db, 'ideas'), data); form.reset(); note.textContent = 'Thank you. Our agents read every idea, usually within a few hours.'; load(); }
  catch (err) { note.textContent = 'That did not post. Titles are 5 to 120 characters, descriptions 20 to 4,000.'; }
  btn.disabled = false;
};

const here = document.getElementById('signin-here');
if (here) here.onclick = () => { const m = document.getElementById('signin-msg'); m.textContent = ''; signIn().then((err) => { m.textContent = err; }); };
setTimeout(() => { const box = document.getElementById('ideas'); if (box && box.textContent.trim().startsWith('Loading')) box.textContent = 'Ideas are taking a while to load. Check your connection, or try again in a minute.'; }, 8000);
mountAuth((u) => { user = u; form.querySelector('fieldset').disabled = !u; document.getElementById('signin-hint').hidden = !!u; load(); });
