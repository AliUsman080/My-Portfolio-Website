const express = require('express');
const { db } = require('../db/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function parseDevice(ua = '') {
  let device = 'Desktop';
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) device = /tablet|ipad/i.test(ua) ? 'Tablet' : 'Mobile';

  let browser = 'Other';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return { device, browser };
}

router.post('/track', (req, res) => {
  const { visitor_id, page_path, page_title, referrer, screen_size } = req.body;

  if (!visitor_id || !page_path) {
    return res.status(400).json({ success: false, message: 'visitor_id and page_path required.' });
  }

  const ua = req.headers['user-agent'] || '';
  const { device, browser } = parseDevice(ua);

  try {
    const existing = db.prepare('SELECT visitor_id FROM visitors WHERE visitor_id = ?').get(visitor_id);

    if (existing) {
      db.prepare(`
        UPDATE visitors SET last_seen = CURRENT_TIMESTAMP, visit_count = visit_count + 1,
        pages_viewed = pages_viewed + 1, last_page = ?, device_type = ?, browser = ?, referrer = ?
        WHERE visitor_id = ?
      `).run(page_path, device, browser, referrer || null, visitor_id);
    } else {
      db.prepare(`
        INSERT INTO visitors (visitor_id, last_page, device_type, browser, referrer)
        VALUES (?, ?, ?, ?, ?)
      `).run(visitor_id, page_path, device, browser, referrer || null);
    }

    db.prepare(`
      INSERT INTO site_visits (visitor_id, page_path, page_title, referrer, user_agent, device_type, browser, screen_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(visitor_id, page_path, page_title || null, referrer || null, ua, device, browser, screen_size || null);

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to track visit.' });
  }
});

router.get('/overview', authenticateToken, requireAdmin, (req, res) => {
  try {
    const stats = {
      totalVisits: db.prepare('SELECT COUNT(*) as c FROM site_visits').get().c,
      uniqueVisitors: db.prepare('SELECT COUNT(*) as c FROM visitors').get().c,
      totalMessages: db.prepare('SELECT COUNT(*) as c FROM contact_messages').get().c,
      newMessages: db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status = 'new'").get().c,
      totalProjects: db.prepare('SELECT COUNT(*) as c FROM projects').get().c,
      totalUsers: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
      todayVisits: db.prepare("SELECT COUNT(*) as c FROM site_visits WHERE date(visited_at) = date('now')").get().c,
    };

    const topPages = db.prepare(`
      SELECT page_path, COUNT(*) as views FROM site_visits
      GROUP BY page_path ORDER BY views DESC LIMIT 5
    `).all();

    const recentVisits = db.prepare(`
      SELECT sv.*, v.visit_count FROM site_visits sv
      LEFT JOIN visitors v ON sv.visitor_id = v.visitor_id
      ORDER BY sv.visited_at DESC LIMIT 10
    `).all();

    res.json({ success: true, stats, topPages, recentVisits });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to load overview.' });
  }
});

router.get('/visitors', authenticateToken, requireAdmin, (req, res) => {
  try {
    const visitors = db.prepare(`
      SELECT v.*,
        (SELECT COUNT(*) FROM site_visits WHERE visitor_id = v.visitor_id) as total_pageviews,
        (SELECT GROUP_CONCAT(DISTINCT page_path) FROM site_visits WHERE visitor_id = v.visitor_id) as pages_visited
      FROM visitors v ORDER BY v.last_seen DESC
    `).all();
    res.json({ success: true, visitors });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to load visitors.' });
  }
});

router.get('/visits', authenticateToken, requireAdmin, (req, res) => {
  try {
    const visits = db.prepare(`
      SELECT sv.*, v.visit_count as visitor_total_visits
      FROM site_visits sv
      LEFT JOIN visitors v ON sv.visitor_id = v.visitor_id
      ORDER BY sv.visited_at DESC LIMIT 200
    `).all();
    res.json({ success: true, visits });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to load visits.' });
  }
});

router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to load users.' });
  }
});

module.exports = router;
