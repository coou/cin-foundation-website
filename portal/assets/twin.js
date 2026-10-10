// Twin prototype: everything stays in this browser (localStorage). Nothing is sent anywhere.
import { mountAuth, el, getJSON } from './portal.js';

mountAuth(() => {});
const KEY = 'cin-twin-v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { topics: [], grants: [] }; } catch (e) { return { topics: [], grants: [] }; } };
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage unavailable: the twin forgets on reload */ } };
let state = load();

function words(text) { return (text || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2); }

function renderGrants() {
  const ul = document.getElementById('grants'); ul.textContent = '';
  if (!state.grants.length) ul.appendChild(el('li', 'muted', 'Nobody yet. Your twin refuses everyone you have not listed.'));
  state.grants.forEach((g, i) => {
    const li = el('li'); li.append(el('b', null, g.who), document.createTextNode(' may see ' + g.what + ' '));
    const x = el('button', 'btn', 'Revoke'); x.onclick = () => { state.grants.splice(i, 1); save(state); renderGrants(); };
    li.appendChild(x); ul.appendChild(li);
  });
}

function renderQuest() {
  const ul = document.getElementById('quest');
  if (!state.topics.length) return;
  getJSON('/data/signals.json').then((sigs) => {
    const mine = new Set(state.topics.flatMap(words));
    const scored = sigs.map((s) => ({ s, n: words(s.title + ' ' + s.summary).filter((w) => mine.has(w)).length })).filter((x) => x.n).sort((a, b) => b.n - a.n).slice(0, 3);
    ul.textContent = '';
    if (!scored.length) { ul.appendChild(el('li', 'muted', 'Nothing today touches your topics.')); return; }
    scored.forEach(({ s }) => { const li = el('li'); const a = el('a', null, s.title); a.href = /^https?:/.test(s.url) ? s.url : '#'; a.rel = 'noopener noreferrer'; li.append(a, el('div', 'muted', s.summary)); ul.appendChild(li); });
  }).catch(() => { ul.textContent = ''; ul.appendChild(el('li', 'muted', 'Today’s sources could not be loaded.')); });
}

const f = document.getElementById('interests');
f.elements.topics.value = state.topics.join(', ');
f.onsubmit = (e) => { e.preventDefault(); state.topics = f.elements.topics.value.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 20); save(state); document.getElementById('saved').textContent = 'Saved on this device only.'; renderQuest(); };
const g = document.getElementById('grant');
g.onsubmit = (e) => { e.preventDefault(); const who = g.elements.who.value.trim(), what = g.elements.what.value.trim(); if (!who || !what) return; state.grants.push({ who, what, at: new Date().toISOString() }); save(state); g.reset(); renderGrants(); };
document.getElementById('wipe').onclick = () => { try { localStorage.removeItem(KEY); } catch (e) { /* nothing stored */ } state = { topics: [], grants: [] }; f.reset(); renderGrants(); document.getElementById('quest').textContent = ''; };
renderGrants(); renderQuest();
