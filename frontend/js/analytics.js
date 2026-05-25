function getVisitorId() {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('visitor_id', id);
  }
  return id;
}

function trackPageVisit() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const payload = {
    visitor_id: getVisitorId(),
    page_path: page,
    page_title: document.title,
    referrer: document.referrer || null,
    screen_size: `${window.screen.width}x${window.screen.height}`,
  };

  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

document.addEventListener('DOMContentLoaded', trackPageVisit);
