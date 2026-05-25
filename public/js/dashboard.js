let allProjects = [];
let editingProjectId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!getToken()) {
    window.location.href = 'login.html';
    return;
  }

  const user = getUser();
  if (user?.role !== 'admin') {
    showToast('Admin access required.', 'error');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    return;
  }

  document.getElementById('user-greeting').textContent = `Welcome, ${user.name}`;
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearAuth();
    window.location.href = 'login.html';
  });

  initTabs();
  await loadDashboard();
});

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

async function loadDashboard() {
  await Promise.all([loadProjects(), loadMessages()]);
}

async function loadProjects() {
  try {
    const data = await apiRequest('/projects');
    allProjects = data.projects;
    document.getElementById('stat-projects').textContent = allProjects.length;
    renderProjectsTable();
  } catch {
    showToast('Failed to load projects.', 'error');
  }
}

function renderProjectsTable() {
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;

  if (allProjects.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No projects yet</td></tr>';
    return;
  }

  tbody.innerHTML = allProjects.map((p) => `
    <tr>
      <td>${p.image_emoji} ${escapeHtml(p.title)}</td>
      <td>${escapeHtml(p.tech_stack)}</td>
      <td>${p.featured ? '⭐ Yes' : 'No'}</td>
      <td>${new Date(p.created_at).toLocaleDateString()}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-ghost btn-sm" onclick="editProject(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject(${p.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function loadMessages() {
  try {
    const data = await apiRequest('/contact');
    const messages = data.messages;
    document.getElementById('stat-messages').textContent = messages.length;
    document.getElementById('stat-new').textContent = messages.filter((m) => m.status === 'new').length;

    const tbody = document.getElementById('messages-tbody');
    if (messages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No messages yet</td></tr>';
      return;
    }

    tbody.innerHTML = messages.map((m) => `
      <tr>
        <td>${escapeHtml(m.name)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td>${escapeHtml(m.subject)}</td>
        <td><span class="status-badge status-${m.status}">${m.status}</span></td>
        <td>${new Date(m.created_at).toLocaleDateString()}</td>
        <td>
          <div class="action-btns">
            <select class="form-control" style="padding:6px 10px;font-size:0.8rem;width:auto" onchange="updateMessageStatus(${m.id}, this.value)">
              <option value="new" ${m.status === 'new' ? 'selected' : ''}>New</option>
              <option value="read" ${m.status === 'read' ? 'selected' : ''}>Read</option>
              <option value="replied" ${m.status === 'replied' ? 'selected' : ''}>Replied</option>
              <option value="archived" ${m.status === 'archived' ? 'selected' : ''}>Archived</option>
            </select>
            <button class="btn btn-danger btn-sm" onclick="deleteMessage(${m.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch {
    showToast('Failed to load messages.', 'error');
  }
}

function openProjectModal(project = null) {
  editingProjectId = project?.id || null;
  document.getElementById('modal-title').textContent = project ? 'Edit Project' : 'Add Project';
  document.getElementById('project-title').value = project?.title || '';
  document.getElementById('project-desc').value = project?.description || '';
  document.getElementById('project-tech').value = project?.tech_stack || '';
  document.getElementById('project-github').value = project?.github_url || '';
  document.getElementById('project-live').value = project?.live_url || '';
  document.getElementById('project-emoji').value = project?.image_emoji || '🚀';
  document.getElementById('project-featured').checked = project?.featured === 1;
  document.getElementById('project-modal').classList.add('show');
}

function closeProjectModal() {
  document.getElementById('project-modal').classList.remove('show');
  editingProjectId = null;
}

function editProject(id) {
  const project = allProjects.find((p) => p.id === id);
  if (project) openProjectModal(project);
}

async function saveProject(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('project-title').value.trim(),
    description: document.getElementById('project-desc').value.trim(),
    tech_stack: document.getElementById('project-tech').value.trim(),
    github_url: document.getElementById('project-github').value.trim(),
    live_url: document.getElementById('project-live').value.trim(),
    image_emoji: document.getElementById('project-emoji').value.trim() || '🚀',
    featured: document.getElementById('project-featured').checked,
  };

  try {
    if (editingProjectId) {
      await apiRequest(`/projects/${editingProjectId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Project updated successfully.', 'success');
    } else {
      await apiRequest('/projects', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Project created successfully.', 'success');
    }
    closeProjectModal();
    await loadProjects();
  } catch (err) {
    showToast(err.message || err.errors?.[0]?.msg || 'Failed to save project.', 'error');
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    await apiRequest(`/projects/${id}`, { method: 'DELETE' });
    showToast('Project deleted.', 'success');
    await loadProjects();
  } catch {
    showToast('Failed to delete project.', 'error');
  }
}

async function updateMessageStatus(id, status) {
  try {
    await apiRequest(`/contact/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    showToast('Status updated.', 'success');
    await loadMessages();
  } catch {
    showToast('Failed to update status.', 'error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await apiRequest(`/contact/${id}`, { method: 'DELETE' });
    showToast('Message deleted.', 'success');
    await loadMessages();
  } catch {
    showToast('Failed to delete message.', 'error');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('add-project-btn')?.addEventListener('click', () => openProjectModal());
document.getElementById('project-form')?.addEventListener('submit', saveProject);
