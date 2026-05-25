const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');

async function initDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
  
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Seed Projects if none exist
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const seedProjects = [
        { title: 'Al Makkah Restaurant', description: 'Full-featured restaurant website with menu, ordering flow, and modern UI built for a real client.', tech_stack: 'TypeScript, React, Vercel', github_url: 'https://github.com/AliUsman080/al-makkah-resturant', live_url: 'https://al-makkah-resturant-qgna.vercel.app/#menu', image_emoji: '🍽️', image_url: '/images/al-makkah-preview.png', featured: true },
        { title: 'PakBazzar E-Commerce', description: 'Complete e-commerce platform with product catalog, cart functionality, and responsive shopping experience.', tech_stack: 'TypeScript, Node.js, Express', github_url: 'https://github.com/AliUsman080/E-Commerece-Website-PakBazzar', image_emoji: '🛒', image_url: 'https://bsscommerce.com/shopify/wp-content/uploads/2024/11/Telemart-ecommerce-websites-in-pakistan-1200x443.jpg', featured: true },
        { title: 'University Faculty Hub', description: 'Academic portal connecting students and faculty with course management and resource sharing.', tech_stack: 'TypeScript, Full Stack', github_url: 'https://github.com/AliUsman080/Univrsity-Faculty-Hub', image_emoji: '🎓', image_url: 'https://jaamiah.com/wp-content/uploads/2019/05/51121410_712836555777130_4951612235861458944_n.jpg', featured: true },
        { title: 'Dogar Lab Center', description: 'Professional laboratory center website with service listings and appointment information.', tech_stack: 'HTML, CSS, JavaScript', github_url: 'https://github.com/AliUsman080/Dogar_lab_center', image_emoji: '🔬', image_url: 'https://th.bing.com/th/id/R.5f9009598801c599bfa2206f77190219?rik=SAOgGZ2qPOfpiw&riu=http%3a%2f%2fwww.doctorlab.lk%2fimg%2fdoctor-lab2.jpg&ehk=POBX1ETNnZdaNms6jYMDMg2E91yyvbBXoEwmKIQxFf4%3d&risl=&pid=ImgRaw&r=0', featured: false },
        { title: 'Web Lab Project', description: 'Advanced web development lab exercises covering modern JavaScript patterns and DOM manipulation.', tech_stack: 'JavaScript, HTML, CSS', github_url: 'https://github.com/AliUsman080/Web-lab', image_emoji: '💻', image_url: 'https://blog.openreplay.com/images/four-useful-built-in-javascript-web-apis/images/hero.png', featured: false },
      ];
      await Project.insertMany(seedProjects);
      console.log('Seeded projects to MongoDB');
    }

    // Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@aliusman.dev';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashed = bcrypt.hashSync(adminPassword, 10);
      await User.create({
        name: 'Ali Usman',
        email: adminEmail,
        password: hashed,
        role: 'admin'
      });
      console.log('Admin user created in MongoDB');
    }

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = { initDatabase };
