const API_BASE = (() => {
  const host = window.location.hostname;
  const port = window.location.port;
  if ((host === 'localhost' || host === '127.0.0.1') && port && port !== '5000') {
    return 'http://localhost:5000/api';
  }
  return '/api';
})();
