const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      github_url TEXT,
      live_url TEXT,
      image_emoji TEXT DEFAULT '🚀',
      image_url TEXT,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      attachment_url TEXT,
      attachment_name TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS visitors (
      visitor_id TEXT PRIMARY KEY,
      first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      visit_count INTEGER DEFAULT 1,
      pages_viewed INTEGER DEFAULT 1,
      last_page TEXT,
      device_type TEXT,
      browser TEXT,
      referrer TEXT
    );

    CREATE TABLE IF NOT EXISTS site_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      page_path TEXT NOT NULL,
      page_title TEXT,
      referrer TEXT,
      user_agent TEXT,
      device_type TEXT,
      browser TEXT,
      screen_size TEXT,
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
    );
  `);

  try { db.exec('ALTER TABLE projects ADD COLUMN image_url TEXT'); } catch { /* exists */ }
  try { db.exec('ALTER TABLE contact_messages ADD COLUMN phone TEXT'); } catch { /* exists */ }
  try { db.exec('ALTER TABLE contact_messages ADD COLUMN attachment_url TEXT'); } catch { /* exists */ }
  try { db.exec('ALTER TABLE contact_messages ADD COLUMN attachment_name TEXT'); } catch { /* exists */ }

  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (projectCount.count === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (title, description, tech_stack, github_url, live_url, image_emoji, image_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedProjects = [
      ['Al Makkah Restaurant', 'Full-featured restaurant website with menu, ordering flow, and modern UI built for a real client.', 'TypeScript, React, Vercel', 'https://github.com/AliUsman080/al-makkah-resturant', 'https://al-makkah-resturant-qgna.vercel.app/#menu', '🍽️', '/images/al-makkah-preview.png', 1],
      ['PakBazzar E-Commerce', 'Complete e-commerce platform with product catalog, cart functionality, and responsive shopping experience.', 'TypeScript, Node.js, Express', 'https://github.com/AliUsman080/E-Commerece-Website-PakBazzar', null, '🛒', 'https://bsscommerce.com/shopify/wp-content/uploads/2024/11/Telemart-ecommerce-websites-in-pakistan-1200x443.jpg', 1],
      ['University Faculty Hub', 'Academic portal connecting students and faculty with course management and resource sharing.', 'TypeScript, Full Stack', 'https://github.com/AliUsman080/Univrsity-Faculty-Hub', null, '🎓', 'https://jaamiah.com/wp-content/uploads/2019/05/51121410_712836555777130_4951612235861458944_n.jpg', 1],
      ['Dogar Lab Center', 'Professional laboratory center website with service listings and appointment information.', 'HTML, CSS, JavaScript', 'https://github.com/AliUsman080/Dogar_lab_center', null, '🔬', 'https://th.bing.com/th/id/R.5f9009598801c599bfa2206f77190219?rik=SAOgGZ2qPOfpiw&riu=http%3a%2f%2fwww.doctorlab.lk%2fimg%2fdoctor-lab2.jpg&ehk=POBX1ETNnZdaNms6jYMDMg2E91yyvbBXoEwmKIQxFf4%3d&risl=&pid=ImgRaw&r=0', 0],
      ['Web Lab Project', 'Advanced web development lab exercises covering modern JavaScript patterns and DOM manipulation.', 'JavaScript, HTML, CSS', 'https://github.com/AliUsman080/Web-lab', null, '💻', 'https://blog.openreplay.com/images/four-useful-built-in-javascript-web-apis/images/hero.png', 0],
    ];

    seedProjects.forEach((p) => insertProject.run(...p));
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@aliusman.dev';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

  if (!existingAdmin) {
    const hashed = bcrypt.hashSync(adminPassword, 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Ali Usman',
      adminEmail,
      hashed,
      'admin'
    );
  }
}

module.exports = { db, initDatabase };
