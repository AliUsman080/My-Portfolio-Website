const express = require('express');
const Visitor = require('../models/Visitor');
const SiteVisit = require('../models/SiteVisit');
const ContactMessage = require('../models/ContactMessage');
const Project = require('../models/Project');
const User = require('../models/User');
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

router.post('/track', async (req, res) => {
  const { visitor_id, page_path, page_title, referrer, screen_size } = req.body;

  if (!visitor_id || !page_path) {
    return res.status(400).json({ success: false, message: 'visitor_id and page_path required.' });
  }

  const ua = req.headers['user-agent'] || '';
  const { device, browser } = parseDevice(ua);

  try {
    let visitor = await Visitor.findOne({ visitor_id });

    if (visitor) {
      visitor.last_seen = Date.now();
      visitor.visit_count += 1;
      visitor.pages_viewed += 1;
      visitor.last_page = page_path;
      visitor.device_type = device;
      visitor.browser = browser;
      visitor.referrer = referrer || visitor.referrer;
      await visitor.save();
    } else {
      await Visitor.create({
        visitor_id,
        last_page: page_path,
        device_type: device,
        browser,
        referrer: referrer || null
      });
    }

    await SiteVisit.create({
      visitor_id,
      page_path,
      page_title: page_title || null,
      referrer: referrer || null,
      user_agent: ua,
      device_type: device,
      browser,
      screen_size: screen_size || null
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to track visit.' });
  }
});

router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalVisits,
      uniqueVisitors,
      totalMessages,
      newMessages,
      totalProjects,
      totalUsers,
      todayVisits
    ] = await Promise.all([
      SiteVisit.countDocuments(),
      Visitor.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'new' }),
      Project.countDocuments(),
      User.countDocuments(),
      SiteVisit.countDocuments({ visited_at: { $gte: today } })
    ]);

    const stats = {
      totalVisits,
      uniqueVisitors,
      totalMessages,
      newMessages,
      totalProjects,
      totalUsers,
      todayVisits
    };

    const topPages = await SiteVisit.aggregate([
      { $group: { _id: '$page_path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $project: { page_path: '$_id', views: 1, _id: 0 } }
    ]);

    const recentVisits = await SiteVisit.find().sort({ visited_at: -1 }).limit(10).lean();
    
    // Add visit_count to recent visits
    const enrichedRecentVisits = await Promise.all(recentVisits.map(async (visit) => {
      const v = await Visitor.findOne({ visitor_id: visit.visitor_id });
      return { ...visit, visit_count: v ? v.visit_count : 0 };
    }));

    res.json({ success: true, stats, topPages, recentVisits: enrichedRecentVisits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load overview.' });
  }
});

router.get('/visitors', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ last_seen: -1 }).lean();
    
    const enrichedVisitors = await Promise.all(visitors.map(async (v) => {
      const views = await SiteVisit.countDocuments({ visitor_id: v.visitor_id });
      const pages = await SiteVisit.distinct('page_path', { visitor_id: v.visitor_id });
      return {
        ...v,
        total_pageviews: views,
        pages_visited: pages.join(', ')
      };
    }));

    res.json({ success: true, visitors: enrichedVisitors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load visitors.' });
  }
});

router.get('/visits', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const visits = await SiteVisit.find().sort({ visited_at: -1 }).limit(200).lean();
    
    const enrichedVisits = await Promise.all(visits.map(async (visit) => {
      const v = await Visitor.findOne({ visitor_id: visit.visitor_id });
      return { ...visit, visitor_total_visits: v ? v.visit_count : 0 };
    }));

    res.json({ success: true, visits: enrichedVisits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load visits.' });
  }
});

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load users.' });
  }
});

module.exports = router;
