const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema({
  visitor_id: { type: String, required: true },
  page_path: { type: String, required: true },
  page_title: { type: String },
  referrer: { type: String },
  user_agent: { type: String },
  device_type: { type: String },
  browser: { type: String },
  screen_size: { type: String },
  visited_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteVisit', siteVisitSchema);
