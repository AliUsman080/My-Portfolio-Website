from pathlib import Path

D = "motion"
ROOT = Path(r"c:\Users\Tech Mehal\OneDrive\Documents\Desktop\Website\frontend")

def tag(name, cls="", content="", close=True):
    c = f' class="{cls}"' if cls else ""
    if close and content:
        return f"<{D}{c}>{content}</{D}>"
    if close:
        return f"<{D}{c}></{D}>"
    return f"<{D}{c}>"

def fix(s):
    return s.replace("motion", "div")

NAV = fix("""
  <nav class="navbar">
    <motion class="container nav-inner">
      <a href="index.html" class="logo">
        <img src="images/ali-usman.png" alt="Ali Usman" class="logo-img">
        <motion class="logo-text">Ali Usman<span>Full Stack Developer</span></motion>
      </a>
      <motion class="nav-links">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="services.html">Services</a>
        <a href="projects.html">Projects</a>
        <a href="contact.html">Contact</a>
        <motion class="nav-cta"><a href="login.html" id="auth-nav-link" class="btn btn-primary btn-sm">Login</a></motion>
      </motion>
      <button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </motion>
  </nav>
""")

FOOT = fix("""
  <footer class="footer">
    <motion class="container">
      <motion class="footer-grid">
        <motion class="footer-brand">
          <a href="index.html" class="logo"><img src="images/ali-usman.png" alt="" class="logo-img"><motion class="logo-text">Ali Usman<span>Developer</span></motion></a>
          <p>Professional Full Stack Developer building modern web solutions.</p>
        </motion>
        <motion class="footer-col"><h4>Pages</h4><a href="index.html">Home</a><a href="about.html">About</a><a href="services.html">Services</a><a href="projects.html">Projects</a></motion>
        <motion class="footer-col"><h4>Connect</h4><a href="contact.html">Contact</a><a href="https://github.com/AliUsman080" target="_blank" rel="noopener">GitHub</a><a href="login.html">Admin</a></motion>
      </motion>
      <motion class="footer-bottom"><span>© 2026 Ali Usman. All rights reserved.</span></motion>
    </motion>
  </footer>
  <script src="js/config.js"></script>
  <script src="js/main.js"></script>
  <script src="js/analytics.js"></script>
""")

def page(title, desc, body, extra=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{desc}">
  <title>{title}</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
{NAV}
{body}
{FOOT}
{extra}
</body>
</html>"""

INDEX = fix("""
  <header class="hero">
    <motion class="container hero-content">
      <motion class="hero-text">
        <motion class="hero-badge"><span class="dot"></span> Available for Projects</motion>
        <h1>Hi, I'm <em>Ali Usman</em> — Professional Web Developer</h1>
        <p class="hero-subtitle">Full Stack Developer building responsive business websites, e-commerce platforms, and custom web applications.</p>
        <motion class="hero-actions">
          <a href="projects.html" class="btn btn-primary btn-lg">View Portfolio</a>
          <a href="contact.html" class="btn btn-outline btn-lg">Hire Me</a>
        </motion>
        <motion class="hero-stats">
          <motion class="stat-item"><motion class="stat-num" data-count="7">0</motion><motion class="stat-label">Projects</motion></motion>
          <motion class="stat-item"><motion class="stat-num" data-count="6">0</motion><motion class="stat-label">Technologies</motion></motion>
          <motion class="stat-item"><motion class="stat-num" data-count="3">0</motion><motion class="stat-label">Live Demos</motion></motion>
        </motion>
      </motion>
      <motion class="hero-photo-wrap">
        <motion class="hero-photo-frame">
          <img src="images/ali-usman.png" alt="Ali Usman" class="hero-photo">
          <motion class="hero-photo-accent"></motion>
          <motion class="hero-photo-badge"><strong>Ali Usman</strong><span>Full Stack Developer</span></motion>
        </motion>
      </motion>
    </motion>
  </header>
  <section class="trust-bar"><motion class="container trust-grid">
    <motion class="trust-item"><motion class="num">7+</motion><motion class="label">GitHub Projects</motion></motion>
    <motion class="trust-item"><motion class="num">100%</motion><motion class="label">Client Focused</motion></motion>
    <motion class="trust-item"><motion class="num">Full</motion><motion class="label">Stack Expertise</motion></motion>
    <motion class="trust-item"><motion class="num">24h</motion><motion class="label">Response Time</motion></motion>
  </motion></section>
  <section class="bg-white"><motion class="container">
    <motion class="section-header center reveal"><span class="section-label">Services</span><h2 class="section-title">What I Offer</h2><p class="section-desc">Professional web development services.</p></motion>
    <motion class="card-grid">
      <motion class="card service-card reveal"><span class="service-number">01</span><motion class="card-icon">🌐</motion><h3>Business Websites</h3><p>Multi-page responsive websites with professional design.</p></motion>
      <motion class="card service-card reveal"><span class="service-number">02</span><motion class="card-icon">🛒</motion><h3>E-Commerce</h3><p>Online stores with product catalogs and checkout.</p></motion>
      <motion class="card service-card reveal"><span class="service-number">03</span><motion class="card-icon">⚙️</motion><h3>Full Stack Apps</h3><p>Complete apps with API, database, and authentication.</p></motion>
    </motion>
    <motion style="text-align:center;margin-top:40px" class="reveal"><a href="services.html" class="btn btn-outline">All Services →</a></motion>
  </motion></section>
  <section class="bg-gray"><motion class="container">
    <motion class="section-header center reveal"><span class="section-label">Portfolio</span><h2 class="section-title">Featured Work</h2></motion>
    <motion class="card-grid">
      <article class="card project-card reveal"><motion class="project-thumb-placeholder" style="background:linear-gradient(135deg,#0c2340,#1e5a8a)">AM</motion><motion class="project-body"><h3>Al Makkah Restaurant</h3><p>Restaurant website on Vercel.</p><motion class="project-links"><a href="https://github.com/AliUsman080/al-makkah-resturant" target="_blank" class="btn btn-outline btn-sm">GitHub</a><a href="https://al-makkah-resturant.vercel.app" target="_blank" class="btn btn-primary btn-sm">Live Demo</a></motion></motion></article>
      <article class="card project-card reveal"><motion class="project-thumb-placeholder" style="background:linear-gradient(135deg,#1a3a5c,#b8860b)">PB</motion><motion class="project-body"><h3>PakBazzar E-Commerce</h3><p>Full e-commerce platform.</p><motion class="project-links"><a href="https://github.com/AliUsman080/E-Commerece-Website-PakBazzar" target="_blank" class="btn btn-outline btn-sm">GitHub</a></motion></motion></article>
      <article class="card project-card reveal"><motion class="project-thumb-placeholder" style="background:linear-gradient(135deg,#2d4a6a,#1a7f4b)">UF</motion><motion class="project-body"><h3>University Faculty Hub</h3><p>Academic portal.</p><motion class="project-links"><a href="https://github.com/AliUsman080/Univrsity-Faculty-Hub" target="_blank" class="btn btn-outline btn-sm">GitHub</a></motion></motion></article>
    </motion>
    <motion style="text-align:center;margin-top:40px"><a href="projects.html" class="btn btn-primary">View All Projects →</a></motion>
  </motion></section>
  <section class="bg-white"><motion class="container"><motion class="cta-banner reveal"><h2>Ready to Build Your Website?</h2><p>Let's discuss your project.</p><a href="contact.html" class="btn btn-gold btn-lg">Start a Conversation</a></motion></motion></section>
""")

ABOUT = fix("""
  <section class="page-hero center"><motion class="container"><span class="section-label">About Me</span><h1>Meet <em>Ali Usman</em></h1><p class="section-desc">Full Stack Developer passionate about real-world web solutions.</p></motion></section>
  <section class="bg-white"><motion class="container about-grid">
    <motion class="about-photo-wrap reveal">
      <img src="images/ali-usman.png" alt="Ali Usman" class="about-photo-main">
      <img src="images/ali-usman-formal.png" alt="Ali Usman formal" class="about-photo-secondary">
    </motion>
    <motion class="reveal">
      <span class="section-label">Who I Am</span>
      <h2 class="section-title">Ali Usman</h2>
      <p style="color:var(--text-muted);margin-bottom:16px">Dedicated Full Stack Developer building responsive web applications for restaurants, e-commerce, laboratories, and academic institutions.</p>
      <p style="color:var(--text-muted);margin-bottom:16px">Expertise in TypeScript, React, Node.js, Express, SQLite, and modern CSS.</p>
      <p style="color:var(--text-muted);margin-bottom:24px">Work on <a href="https://github.com/AliUsman080" target="_blank" style="color:var(--accent)">GitHub</a>.</p>
      <motion class="skills-grid">
        <motion class="skill-item"><span>⚛️</span> React & TypeScript</motion>
        <motion class="skill-item"><span>🟢</span> Node.js & Express</motion>
        <motion class="skill-item"><span>🗄️</span> SQL & Databases</motion>
        <motion class="skill-item"><span>🎨</span> UI/UX Design</motion>
        <motion class="skill-item"><span>📱</span> Responsive Design</motion>
        <motion class="skill-item"><span>🔐</span> Auth & APIs</motion>
      </motion>
      <motion class="about-experience"><motion class="years">3+</motion><motion><strong>Years Experience</strong><br><span style="font-size:0.85rem;opacity:0.8">Web Development</span></motion></motion>
    </motion>
  </motion></section>
  <section class="bg-gray"><motion class="container">
    <motion class="section-header center reveal"><span class="section-label">Journey</span><h2 class="section-title">Experience</h2></motion>
    <motion class="timeline reveal" style="max-width:700px;margin:0 auto">
      <motion class="timeline-item"><motion class="timeline-date">2025 — Present</motion><h4>Full Stack Web Developer</h4><p>Production-ready apps for e-commerce, restaurants, and academic portals.</p></motion>
      <motion class="timeline-item"><motion class="timeline-date">2025 — 2026</motion><h4>7+ GitHub Projects</h4><p>TypeScript, JavaScript, HTML/CSS with auth and CRUD.</p></motion>
      <motion class="timeline-item"><motion class="timeline-date">Ongoing</motion><h4>Continuous Learning</h4><p>Modern frameworks and professional UI/UX.</p></motion>
    </motion>
  </motion></section>
  <section class="bg-white"><motion class="container"><motion class="cta-banner reveal"><h2>Let's Work Together</h2><p>Have a project in mind?</p><a href="contact.html" class="btn btn-gold btn-lg">Get In Touch</a></motion></motion></section>
""")

(ROOT / "index.html").write_text(page("Ali Usman | Full Stack Developer", "Ali Usman portfolio", INDEX), encoding="utf-8")
(ROOT / "about.html").write_text(page("About | Ali Usman", "About Ali Usman", ABOUT), encoding="utf-8")
print("Generated index.html and about.html")
