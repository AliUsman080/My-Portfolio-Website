require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/init');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');

initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: [FRONTEND_URL, 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend API is running.', timestamp: new Date().toISOString() });
});

if (process.env.SERVE_FRONTEND === 'true') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
    }
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n  Backend API  → http://localhost:${PORT}`);
  console.log(`  Frontend URL → ${FRONTEND_URL}`);
  console.log(`  Admin login  → ${process.env.ADMIN_EMAIL || 'admin@aliusman.dev'}\n`);
});
