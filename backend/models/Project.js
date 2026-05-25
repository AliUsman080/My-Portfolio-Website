const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tech_stack: { type: String, required: true },
  github_url: { type: String },
  live_url: { type: String },
  image_emoji: { type: String, default: '🚀' },
  image_url: { type: String },
  featured: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
