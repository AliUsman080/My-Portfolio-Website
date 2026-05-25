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
    const data = await apiRequest('/projects');
    projectsData = data.projects;
    renderProjects(projectsData);
  } catch {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <div class="emoji">⚠️</div>
        <p>Unable to load projects. Please try again later.</p>
      </div>`;
  }
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
    return `
      <article class="card project-card reveal" style="transition-delay: ${i * 0.1}s">
        ${p.featured ? '<span class="featured-badge">Featured</span>' : ''}
        <div class="project-emoji">${p.image_emoji}</div>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description)}</p>
        <div class="project-tags">
          ${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="project-links">
          ${p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">GitHub ↗</a>` : ''}
          ${p.live_url ? `<a href="${p.live_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Live Demo ↗</a>` : ''}
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
