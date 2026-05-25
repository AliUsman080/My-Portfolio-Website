let projectsData = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadProjects();
  initFilters();
});

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="skeleton"></div>'.repeat(3);

  try {
    // Fetch from GitHub API
    const response = await fetch('https://api.github.com/users/AliUsman080/repos?sort=updated&direction=desc');
    if (!response.ok) throw new Error('GitHub API failed');
    const repos = await response.json();
    
    // Map GitHub repos to our project format
    projectsData = repos
      .filter(repo => !repo.fork && !repo.name.toLowerCase().includes('calculator'))
      .map((repo, idx) => {
        let liveUrl = repo.homepage;
        let liveBtnText = 'Live Demo';
        let imageUrl = null;
        
        // Manual Overrides
        if (repo.name.toLowerCase().includes('al-makkah')) {
          liveUrl = 'https://al-makkah-resturant-qgna.vercel.app/#menu';
          imageUrl = 'images/al-makkah-preview.png';
        }
        
        if (repo.name.toLowerCase().includes('univrsity-faculty-hub')) {
          imageUrl = 'https://jaamiah.com/wp-content/uploads/2019/05/51121410_712836555777130_4951612235861458944_n.jpg';
        }

        if (repo.name.toLowerCase().includes('pakbazzar')) {
          imageUrl = 'https://bsscommerce.com/shopify/wp-content/uploads/2024/11/Telemart-ecommerce-websites-in-pakistan-1200x443.jpg';
        }

        if (repo.name.toLowerCase().includes('web-lab')) {
          imageUrl = 'https://blog.openreplay.com/images/four-useful-built-in-javascript-web-apis/images/hero.png';
        }

        if (repo.name.toLowerCase().includes('dogar')) {
          imageUrl = 'https://th.bing.com/th/id/R.5f9009598801c599bfa2206f77190219?rik=SAOgGZ2qPOfpiw&riu=http%3a%2f%2fwww.doctorlab.lk%2fimg%2fdoctor-lab2.jpg&ehk=POBX1ETNnZdaNms6jYMDMg2E91yyvbBXoEwmKIQxFf4%3d&risl=&pid=ImgRaw&r=0';
        }

        return {
          title: repo.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          description: repo.description || 'No description provided.',
          tech_stack: repo.language || 'Software',
          github_url: repo.html_url,
          live_url: liveUrl,
          live_btn_text: liveBtnText,
          image_url: imageUrl,
          featured: repo.stargazers_count > 0,
          image_emoji: getEmojiForLang(repo.language),
          theme_idx: idx % 6
        };
      });

    renderProjects(projectsData);
  } catch (err) {
    console.error('Failed to load GitHub projects:', err);
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <div class="emoji">⚠️</div>
        <p>Unable to load projects from GitHub. Please try again later.</p>
      </div>`;
  }
}

function getEmojiForLang(lang) {
  const emojis = {
    'JavaScript': 'JS',
    'TypeScript': 'TS',
    'HTML': '🌐',
    'CSS': '🎨',
    'Python': '🐍',
    'Java': '☕',
    'C#': '🎯',
    'C++': '💎',
    'PHP': '🐘'
  };
  return emojis[lang] || '📁';
}

function getThemeGradient(idx) {
  const gradients = [
    'linear-gradient(135deg, #0c2340, #1e5a8a)', // Navy Blue
    'linear-gradient(135deg, #1a3a5c, #b8860b)', // Navy Gold
    'linear-gradient(135deg, #2d4a6a, #1a7f4b)', // Deep Green
    'linear-gradient(135deg, #1e5a8a, #8e44ad)', // Blue Purple
    'linear-gradient(135deg, #2c3e50, #2980b9)', // Midnight Blue
    'linear-gradient(135deg, #b8860b, #d4a017)'  // Gold Amber
  ];
  return gradients[idx] || gradients[0];
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <div class="emoji">📭</div>
        <p>No projects found in this category.</p>
      </div>`;
    return;
  }

  grid.innerHTML = projects.map((p, i) => {
    const tags = p.tech_stack.split(',').map((t) => t.trim());
    const initials = p.title.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const gradient = getThemeGradient(p.theme_idx);
    
    return `
      <article class="card project-card reveal" style="transition-delay: ${i * 0.1}s">
        ${p.featured ? '<span class="featured-badge">Featured</span>' : ''}
        <div class="project-thumb-wrapper">
          ${p.image_url 
            ? `<img src="${p.image_url}" alt="${escapeHtml(p.title)}" class="project-thumb">`
            : `<div class="project-thumb-placeholder" style="background: ${gradient}">${initials}</div>`
          }
          <div class="project-thumb-overlay"></div>
        </div>
        <div class="project-body">
          <div class="project-emoji" style="font-size: 1.5rem; margin-bottom: 8px;">${p.image_emoji}</div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <div class="project-tags">
            ${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>
          <div class="project-links">
            ${p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">GitHub</a>` : ''}
            ${p.live_url 
              ? `<a href="${p.live_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Live Demo</a>` 
              : `<button class="btn btn-ghost btn-sm" disabled>${p.live_btn_text || 'Coming Soon'}</button>`}
          </div>
        </div>
      </article>`;
  }).join('');

  initScrollReveal();
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      if (filter === 'all') {
        renderProjects(projectsData);
      } else if (filter === 'featured') {
        renderProjects(projectsData.filter((p) => p.featured));
      } else {
        renderProjects(projectsData.filter((p) =>
          p.tech_stack.toLowerCase().includes(filter.toLowerCase())
        ));
      }
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
