const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ featured: -1, created_at: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching project.' });
  }
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, tech_stack, github_url, live_url, image_emoji, featured } = req.body;

    try {
      const project = await Project.create({
        title,
        description,
        tech_stack,
        github_url: github_url || null,
        live_url: live_url || null,
        image_emoji: image_emoji || '🚀',
        featured: !!featured
      });

      res.status(201).json({ success: true, message: 'Project created.', project });
    } catch (error) {
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updated_at: Date.now() },
        { new: true }
      );

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      res.json({ success: true, message: 'Project updated.', project });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update project.' });
    }
  }
);

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, message: 'Project deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
});

module.exports = router;
