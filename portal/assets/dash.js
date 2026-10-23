// Redirect legacy /dashboard visits to the network home page.
if (window.location.pathname.indexOf('/dashboard') === 0) {
  window.location.replace('/');
}
