// CIN network site: shared sign-in and database access. Firebase's web config comes from the hosting
// platform itself (/__/firebase/init.json), so no keys live in this code.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
export const getJSON = (url) => fetch(url, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(url); return r.json(); });
export const ago = (iso) => { const s = (Date.now() - Date.parse(iso)) / 1000; if (!(s >= 0)) return ''; if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' d ago'; };

let app = null, auth = null, db = null;
const ready = getJSON('/__/firebase/init.json').then((cfg) => {
  app = initializeApp(cfg); auth = getAuth(app); db = getFirestore(app);
  return { app, auth, db };
}).catch(() => null);

export function backend() { return ready; }

// Start Google sign-in from anywhere on a page (for example a form's own button). Resolves to an error message or ''.
export function signIn() {
  return ready.then((b) => {
    if (!b) return 'Sign-in is unavailable right now.';
    return signInWithPopup(b.auth, new GoogleAuthProvider()).then(() => '').catch((e) => signInProblem(e && e.code));
  });
}

export function mountAuth(onUser) {
  const box = document.getElementById('auth');
  ready.then((b) => {
    if (!b) { if (box) box.textContent = 'Sign-in unavailable'; onUser(null); return; }
    onAuthStateChanged(b.auth, (user) => {
      if (box) {
        box.textContent = '';
        if (user) {
          box.appendChild(el('span', 'muted', user.displayName || 'Signed in'));
          const out = el('button', 'btn', 'Sign out'); out.onclick = () => signOut(b.auth); box.appendChild(out);
        } else {
          const inn = el('button', 'btn primary', 'Sign in with Google');
          const msg = el('span', 'muted');                 // one message, replaced on every attempt
          msg.setAttribute('role', 'status');
          inn.onclick = () => {
            msg.textContent = '';
            signInWithPopup(b.auth, new GoogleAuthProvider()).catch((e) => { msg.textContent = signInProblem(e && e.code); });
          };
          box.append(inn, msg);
        }
      }
      onUser(user);
    });
  });
}

function signInProblem(code) {
  const known = {
    'auth/configuration-not-found': 'Sign-in is not switched on for this site yet.',
    'auth/operation-not-allowed': 'Google sign-in is not switched on for this site yet.',
    'auth/unauthorized-domain': 'Sign-in is not allowed from this address yet.',
    'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
    'auth/popup-closed-by-user': 'The sign-in window was closed before finishing.',
    'auth/cancelled-popup-request': 'Another sign-in window is already open.',
    'auth/network-request-failed': 'Sign-in could not reach Google. Check your connection.',
  };
  return known[code] || 'Sign-in did not complete' + (code ? ' (' + code.replace('auth/', '') + ').' : '.');
}

export function bars(host, cats) {
  const list = el('div', 'bars');
  Object.values(cats).forEach((c) => {
    const row = el('div', 'bar'); const tr = el('span', 'track'); const f = el('span', 'fill ' + (c.index >= 50 ? 'up' : 'down'));
    f.style.width = Math.min(Math.abs(c.index - 50), 50) + '%'; f.style[c.index >= 50 ? 'left' : 'right'] = '50%';
    tr.append(f, el('span', 'mid'));
    row.append(el('span', null, c.name), tr, el('b', null, c.signals ? String(Math.round(c.index)) : '–'));
    list.appendChild(row);
  });
  host.appendChild(list);
}
