const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }

      const hashed = bcrypt.hashSync(password, 10);
      const user = await User.create({ name, email, password: hashed });

      const token = jwt.sign(
        { id: user._id, email, role: 'user' },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: { id: user._id, name, email, role: 'user' },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Registration failed.' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Login failed.' });
    }
  }
);

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user data.' });
  }
});

module.exports = router;
