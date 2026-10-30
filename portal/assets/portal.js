// CIN network site: shared sign-in, SVG visualization helpers, and database access.
// Firebase's web config comes from the hosting platform itself (/__/firebase/init.json), so no keys live in this code.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

if (typeof window !== 'undefined' && (window.location.hostname === 'cintnet.web.app' || window.location.hostname === 'cintnet.firebaseapp.com')) {
  window.location.replace('https://cintnet.org' + window.location.pathname + window.location.search + window.location.hash);
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

export const svgEl = (tag, attrs = {}, text = null) => {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null) n.setAttribute(k, String(v));
  }
  if (text != null) n.textContent = text;
  return n;
};

export const getJSON = (url) => fetch(url, { cache: 'no-cache' }).then((r) => {
  if (!r.ok) throw new Error(url);
  return r.json();
});

export const ago = (iso) => {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (!(s >= 0)) return '';
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago';
  if (s < 86400) return Math.round(s / 3600) + ' h ago';
  return Math.round(s / 86400) + ' d ago';
};

let app = null, auth = null, db = null;
const ready = getJSON('/__/firebase/init.json').then((cfg) => {
  app = initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);
  return { app, auth, db };
}).catch(() => null);

export function backend() { return ready; }

// Start Google sign-in from anywhere on a page (for example a form's own button). Resolves to an error message or ''.
export function signIn() {
  return ready.then((b) => {
    if (!b) return 'Sign-in is unavailable in local offline mode.';
    return signInWithPopup(b.auth, new GoogleAuthProvider()).then(() => '').catch((e) => signInProblem(e && e.code));
  });
}

export function mountAuth(onUser) {
  const box = document.getElementById('auth');
  ready.then((b) => {
    if (!b) {
      if (box) {
        box.textContent = '';
        box.appendChild(el('span', 'tag', 'Local browser mode'));
      }
      onUser(null);
      return;
    }
    onAuthStateChanged(b.auth, (user) => {
      if (box) {
        box.textContent = '';
        if (user) {
          box.appendChild(el('span', 'muted', user.displayName || 'Signed in'));
          const out = el('button', 'btn sm', 'Sign out');
          out.onclick = () => signOut(b.auth);
          box.appendChild(out);
        } else {
          const inn = el('button', 'btn sm primary', 'Sign in with Google');
          const msg = el('span', 'muted');
          msg.setAttribute('role', 'status');
          inn.onclick = () => {
            msg.textContent = '';
            signInWithPopup(b.auth, new GoogleAuthProvider()).catch((e) => {
              msg.textContent = signInProblem(e && e.code);
            });
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
    const row = el('div', 'bar');
    const idx = Number.isFinite(c.index) ? c.index : 50;
    const isUp = idx >= 50;
    const spanPct = Math.min(Math.abs(idx - 50), 50); // 0..50
    const widthUnits = Math.max(2, Math.round(spanPct * 2)); // 0..100 out of 200 viewBox
    const xUnits = isUp ? 100 : (100 - widthUnits);

    const svg = svgEl('svg', {
      viewBox: '0 0 200 10',
      class: 'svg-bar',
      'aria-hidden': 'true'
    });
    svg.appendChild(svgEl('rect', { x: 0, y: 0, width: 200, height: 10, rx: 5, fill: '#1a1e28' }));
    svg.appendChild(svgEl('rect', {
      x: xUnits,
      y: 0,
      width: widthUnits,
      height: 10,
      rx: 4,
      fill: isUp ? '#4fb3a8' : '#ef6a52'
    }));
    svg.appendChild(svgEl('rect', { x: 99, y: 0, width: 2, height: 10, fill: '#8c8a82' }));

    row.append(
      el('span', null, c.name),
      svg,
      el('b', isUp ? 'status-pass' : 'status-err', c.signals ? String(Math.round(idx)) : '–')
    );
    list.appendChild(row);
  });
  host.appendChild(list);
}
