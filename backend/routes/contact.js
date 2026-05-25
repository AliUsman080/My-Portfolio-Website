const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../db/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('subject').trim().isLength({ min: 3 }).withMessage('Subject must be at least 3 characters'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, subject, message, phone, attachment, attachmentName } = req.body;

    try {
      const result = db.prepare(
        'INSERT INTO contact_messages (name, email, phone, subject, message, attachment_url, attachment_name) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(name, email, phone || null, subject, message, attachment || null, attachmentName || null);

      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been sent successfully.',
        id: result.lastInsertRowid,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
    }
  }
);

router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    res.json({ success: true, messages });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  const message = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);
  if (!message) {
    return res.status(404).json({ success: false, message: 'Message not found.' });
  }
  res.json({ success: true, message });
});

router.patch('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['new', 'read', 'replied', 'archived'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  const existing = db.prepare('SELECT id FROM contact_messages WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Message not found.' });
  }

  try {
    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, req.params.id);
    const message = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'Status updated.', data: message });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT id FROM contact_messages WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Message not found.' });
  }

  try {
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Message deleted.' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
});

module.exports = router;
