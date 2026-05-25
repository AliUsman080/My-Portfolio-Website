const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  attachment_url: { type: String },
  attachment_name: { type: String },
  status: { type: String, default: 'new' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
