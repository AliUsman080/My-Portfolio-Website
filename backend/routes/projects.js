const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../db/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY featured DESC, created_at DESC').all();
    res.json({ success: true, projects });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
});

router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }
  res.json({ success: true, project });
});

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('title').trim().isLength({ min: 2 }).withMessage('Title required'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('tech_stack').trim().notEmpty().withMessage('Tech stack required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, tech_stack, github_url, live_url, image_emoji, featured } = req.body;

    try {
      const result = db.prepare(`
        INSERT INTO projects (title, description, tech_stack, github_url, live_url, image_emoji, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(title, description, tech_stack, github_url || null, live_url || null, image_emoji || '🚀', featured ? 1 : 0);

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json({ success: true, message: 'Project created.', project });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create project.' });
    }
  }
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    body('title').trim().isLength({ min: 2 }).withMessage('Title required'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('tech_stack').trim().notEmpty().withMessage('Tech stack required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const { title, description, tech_stack, github_url, live_url, image_emoji, featured } = req.body;

    try {
      db.prepare(`
        UPDATE projects SET title = ?, description = ?, tech_stack = ?, github_url = ?, live_url = ?,
        image_emoji = ?, featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(title, description, tech_stack, github_url || null, live_url || null, image_emoji || '🚀', featured ? 1 : 0, req.params.id);

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
      res.json({ success: true, message: 'Project updated.', project });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to update project.' });
    }
  }
);

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  try {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Project deleted.' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
});

module.exports = router;
