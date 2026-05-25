const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitor_id: { type: String, required: true, unique: true },
  first_seen: { type: Date, default: Date.now },
  last_seen: { type: Date, default: Date.now },
  visit_count: { type: Number, default: 1 },
  pages_viewed: { type: Number, default: 1 },
  last_page: { type: String },
  device_type: { type: String },
  browser: { type: String },
  referrer: { type: String }
});

module.exports = mongoose.model('Visitor', visitorSchema);
