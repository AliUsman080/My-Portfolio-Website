const express = require('express');
const { body, validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, subject, message, phone, attachment, attachmentName } = req.body;

    try {
      const contactMessage = await ContactMessage.create({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        attachment_url: attachment || null,
        attachment_name: attachmentName || null
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been sent successfully.',
        id: contactMessage._id,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
    }
  }
);

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ created_at: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching message.' });
  }
});

router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['new', 'read', 'replied', 'archived'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    res.json({ success: true, message: 'Status updated.', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
});

module.exports = router;
