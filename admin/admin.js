/**
 * SG Solutions — Executive CMS Master Control System
 * Real-time SQLite CRUD, Dynamic Media Asset Pipeline & Inquiries Hub
 */

const API_BASE = '../backend/api.php';
const UPLOAD_BASE = '../backend/upload.php';

// App State
let currentTab = 'overview';
let editingItemId = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  initModals();
  initUploadTriggers();
  initFormHandlers();
  loadAllDashboardData();
});

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-sm">${type === 'error' ? 'error' : 'check_circle'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   Tab Navigation System
   ========================================================================== */
function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn[data-tab]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Switch buttons inside overview cards
  document.querySelectorAll('[data-switch-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-switch-tab');
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.admin-tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });

  // Load data for active tab
  if (tabId === 'overview') loadAllDashboardData();
  else if (tabId === 'projects') loadProjects();
  else if (tabId === 'gallery') loadGallery();
  else if (tabId === 'testimonials') loadTestimonials();
  else if (tabId === 'consultations') loadConsultations();
}

/* ==========================================================================
   Data Loaders & Renderers
   ========================================================================== */
async function loadAllDashboardData() {
  loadDashboardStats();
  loadOverviewProjects();
  loadOverviewInquiries();
}

async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}?action=get_dashboard_stats`);
    const data = await res.json();
    if (data.success && data.stats) {
      const s = data.stats;
      setElText('stat-total-projects', s.projects || 0);
      setElText('stat-total-gallery', s.gallery || 0);
      setElText('stat-total-testimonials', s.testimonials || 0);
      setElText('stat-total-leads', s.leads || 0);

      setElText('count-projects', s.projects || 0);
      setElText('count-gallery', s.gallery || 0);
      setElText('count-testimonials', s.testimonials || 0);
      setElText('count-inquiries', s.new_leads || s.leads || 0);
    }
  } catch (err) {
    console.warn('Could not load stats:', err);
  }
}

async function loadOverviewProjects() {
  const tbody = document.getElementById('overview-recent-projects');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}?action=get_projects`);
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No projects found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.slice(0, 5).map(p => `
        <tr>
          <td><strong>${escapeHtml(p.title)}</strong></td>
          <td><span class="badge-tag">${escapeHtml(p.category)}</span></td>
          <td>${escapeHtml(p.client || 'SG Enterprise')}</td>
          <td>${escapeHtml(p.year || '2025')}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Failed to load projects.</td></tr>';
  }
}

async function loadOverviewInquiries() {
  const tbody = document.getElementById('overview-recent-inquiries');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}?action=get_consultations`);
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">No consultation inquiries yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.slice(0, 5).map(c => `
        <tr>
          <td><strong>${escapeHtml(c.name)}</strong><br><small class="text-muted">${escapeHtml(c.email)}</small></td>
          <td><span class="badge-tag">${escapeHtml(c.service)}</span></td>
          <td><span class="status-pill ${c.status === 'New' ? 'alert' : ''}">${escapeHtml(c.status)}</span></td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-danger">Failed to load inquiries.</td></tr>';
  }
}

/* --- Projects Full Manager --- */
async function loadProjects() {
  const tbody = document.getElementById('projects-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6">Loading projects...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}?action=get_projects`);
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">No projects found in database. Click "Add New Project" to get started.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map(p => {
        const hasLiveLink = p.live_link && p.live_link !== '#' && p.live_link !== '';
        return `
        <tr>
          <td>
            <img src="${formatAdminImageUrl(p.image_url) || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200'}" class="table-thumb" alt="${escapeHtml(p.title)}" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200'">
          </td>
          <td>
            <strong>${escapeHtml(p.title)}</strong>
            <p class="text-xs text-muted" style="max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.description)}</p>
          </td>
          <td><span class="badge-tag">${escapeHtml(p.category)}</span></td>
          <td>
            ${escapeHtml(p.client || 'Enterprise')}
            ${hasLiveLink ? `<br><a href="${escapeHtml(p.live_link)}" target="_blank" rel="noopener noreferrer" class="text-xs text-gold" style="display: inline-flex; align-items: center; gap: 3px; text-decoration: none; margin-top: 2px;"><span>Live Site</span><span class="material-symbols-outlined" style="font-size: 13px;">open_in_new</span></a>` : ''}
          </td>
          <td><small class="text-muted">${escapeHtml(p.tech_stack || '-')}</small></td>
          <td style="text-align: right;">
            <div class="row-actions">
              ${hasLiveLink ? `
                <a href="${escapeHtml(p.live_link)}" target="_blank" rel="noopener noreferrer" class="btn-icon" title="View Live Website in New Tab">
                  <span class="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              ` : ''}
              <button class="btn-icon" title="Edit" onclick="editProject(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <span class="material-symbols-outlined text-sm">edit</span>
              </button>
              <button class="btn-icon danger" title="Delete" onclick="deleteRecord('project', ${p.id})">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      }).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-danger">Failed to load projects.</td></tr>';
  }
}

/* --- Gallery Full Manager --- */
async function loadGallery() {
  const grid = document.getElementById('gallery-admin-grid');
  if (!grid) return;
  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">Loading gallery assets...</div>';

  try {
    const res = await fetch(`${API_BASE}?action=get_gallery`);
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-muted);">No images in gallery yet. Click "Upload New Image" above.</div>';
        return;
      }
      grid.innerHTML = data.data.map(g => `
        <div class="gallery-card-admin">
          <div class="gallery-img-box">
            <img src="${formatAdminImageUrl(g.image_url)}" alt="${escapeHtml(g.title)}" class="gallery-img">
            <span class="gallery-badge">${escapeHtml(g.category)}</span>
          </div>
          <div class="gallery-info-box">
            <h4 class="gallery-title">${escapeHtml(g.title)}</h4>
            <p class="gallery-caption">${escapeHtml(g.caption || 'Enterprise visual asset.')}</p>
            <div class="gallery-card-footer">
              <button class="btn-outline-xs" onclick="editGalleryItem(${JSON.stringify(g).replace(/"/g, '&quot;')})">Edit</button>
              <button class="btn-outline-xs text-danger" onclick="deleteRecord('gallery', ${g.id})">Delete</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--danger);">Failed to load gallery assets.</div>';
  }
}

/* --- Testimonials Full Manager --- */
async function loadTestimonials() {
  const tbody = document.getElementById('testimonials-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6">Loading testimonials...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}?action=get_testimonials`);
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">No testimonials found. Click "Add Testimonial" to add one.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map(t => `
        <tr>
          <td>
            <img src="${t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="table-thumb avatar" alt="${escapeHtml(t.client_name)}">
          </td>
          <td><strong>${escapeHtml(t.client_name)}</strong></td>
          <td>${escapeHtml(t.client_title)}<br><small class="text-muted">${escapeHtml(t.company)}</small></td>
          <td><p class="text-xs quote-cell">"${escapeHtml(t.quote)}"</p></td>
          <td><span class="text-gold">${'★'.repeat(t.rating || 5)}</span></td>
          <td style="text-align: right;">
            <div class="row-actions">
              <button class="btn-icon" title="Edit" onclick="editTestimonial(${JSON.stringify(t).replace(/"/g, '&quot;')})">
                <span class="material-symbols-outlined text-sm">edit</span>
              </button>
              <button class="btn-icon danger" title="Delete" onclick="deleteRecord('testimonial', ${t.id})">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-danger">Failed to load testimonials.</td></tr>';
  }
}

/* --- Consultations Full Inbox --- */
async function loadConsultations() {
  const tbody = document.getElementById('consultations-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6">Loading inquiries...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}?action=get_consultations`);
    const data = await res.json();
    if (data.success && data.data) {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-muted">No consultations received yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map(c => `
        <tr class="lead-table-row">
          <td><span class="text-xs text-muted font-mono">${c.created_at ? c.created_at.split(' ')[0] : 'Today'}</span></td>
          <td>
            <strong class="lead-client-name">${escapeHtml(c.name)}</strong>
            <div class="lead-meta-line">
              <span class="text-muted">${escapeHtml(c.company || 'Enterprise')}</span>
              <span class="sep-dot">•</span>
              <a href="mailto:${escapeHtml(c.email)}" class="text-emerald email-link" onclick="event.stopPropagation()">${escapeHtml(c.email)}</a>
            </div>
          </td>
          <td>
            <span class="badge-tag">${escapeHtml(c.service || 'Architecture')}</span>
            <div class="text-xs text-muted" style="margin-top: 4px;">Tier: ${escapeHtml(c.budget || 'Enterprise')}</div>
          </td>
          <td>
            <div class="lead-message-box" onclick="viewLeadDetails(${JSON.stringify(c).replace(/"/g, '&quot;')})" title="Click to view full inquiry">
              <p class="lead-message-text">${escapeHtml(c.message || 'No specific requirements submitted.')}</p>
              <span class="expand-hint">Expand &rarr;</span>
            </div>
          </td>
          <td>
            <select class="form-select-sm status-select" onchange="updateLeadStatus(${c.id}, this.value)" onclick="event.stopPropagation()">
              <option value="New" ${c.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${c.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="In Review" ${c.status === 'In Review' ? 'selected' : ''}>In Review</option>
              <option value="Closed" ${c.status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </td>
          <td style="text-align: right;">
            <div class="row-actions">
              <button class="btn-icon" title="View Full Details" onclick="viewLeadDetails(${JSON.stringify(c).replace(/"/g, '&quot;')})">
                <span class="material-symbols-outlined text-sm">visibility</span>
              </button>
              <button class="btn-icon danger" title="Delete Inquiry" onclick="deleteRecord('consultation', ${c.id})">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-danger">Failed to load consultations.</td></tr>';
  }
}

window.viewLeadDetails = function(c) {
  const content = document.getElementById('lead-modal-content');
  if (!content) return;

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 10px; border: 1px solid var(--border-dim);">
      <div>
        <span class="text-xs text-muted" style="display: block; text-transform: uppercase;">Client Name</span>
        <strong style="font-size: 15px; color: #fff;">${escapeHtml(c.name)}</strong>
      </div>
      <div>
        <span class="text-xs text-muted" style="display: block; text-transform: uppercase;">Corporate Email</span>
        <a href="mailto:${escapeHtml(c.email)}" class="text-emerald" style="font-weight: 600;">${escapeHtml(c.email)}</a>
      </div>
      <div>
        <span class="text-xs text-muted" style="display: block; text-transform: uppercase;">Company / Enterprise</span>
        <span style="color: #fff;">${escapeHtml(c.company || 'Not Specified')}</span>
      </div>
      <div>
        <span class="text-xs text-muted" style="display: block; text-transform: uppercase;">Date Received</span>
        <span style="color: #fff;">${escapeHtml(c.created_at || 'Today')}</span>
      </div>
      <div>
        <span class="text-xs text-muted" style="display: block; text-transform: uppercase;">Engagement Area</span>
        <span class="badge-tag">${escapeHtml(c.service || 'General Inquiry')}</span>
      </div>
      <div>
        <span class="text-xs text-muted" style="display: block; text-transform: uppercase;">Budget Tier</span>
        <span style="color: var(--accent-gold); font-weight: 600;">${escapeHtml(c.budget || 'Enterprise Tier')}</span>
      </div>
    </div>

    <div>
      <span class="text-xs text-muted" style="display: block; text-transform: uppercase; margin-bottom: 6px;">Strategic Objectives &amp; Project Scope</span>
      <div style="background: rgba(0, 20, 13, 0.7); border: 1px solid var(--border-dim); border-radius: 8px; padding: 16px; color: #e2e8f0; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${escapeHtml(c.message || 'No additional details provided.')}</div>
    </div>
  `;

  openModal('lead-details-modal');
};

async function updateLeadStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}?action=update_consultation_status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Lead status updated.');
      loadDashboardStats();
    } else {
      showToast(data.error || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Network error updating status', 'error');
  }
}

function formatAdminImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('./uploads/')) return '../' + url.slice(2);
  if (url.startsWith('uploads/')) return '../' + url;
  return url;
}

/* ==========================================================================
   Modals & Image Upload Handlers
   ========================================================================== */
function initModals() {
  // Modal Triggers
  const openProjBtn = document.getElementById('open-new-project-modal-btn') || document.getElementById('quick-add-project-btn');
  if (openProjBtn) {
    openProjBtn.addEventListener('click', () => {
      editingItemId = null;
      document.getElementById('project-form').reset();
      document.getElementById('proj-id').value = '';
      if (document.getElementById('proj-live-link')) {
        document.getElementById('proj-live-link').value = '';
      }
      document.getElementById('project-modal-title').textContent = 'Add New Project';
      setImgPreview('proj-preview-img', '');
      openModal('project-modal');
    });
  }

  const openGalBtn = document.getElementById('open-new-gallery-modal-btn') || document.getElementById('quick-add-gallery-btn');
  if (openGalBtn) {
    openGalBtn.addEventListener('click', () => {
      editingItemId = null;
      document.getElementById('gallery-form').reset();
      document.getElementById('gal-id').value = '';
      document.getElementById('gallery-modal-title').textContent = 'Upload Gallery Image';
      setImgPreview('gal-preview-img', '');
      openModal('gallery-modal');
    });
  }

  const openTestBtn = document.getElementById('open-new-testimonial-modal-btn');
  if (openTestBtn) {
    openTestBtn.addEventListener('click', () => {
      editingItemId = null;
      document.getElementById('testimonial-form').reset();
      document.getElementById('test-id').value = '';
      document.getElementById('testimonial-modal-title').textContent = 'Add Client Testimonial';
      setImgPreview('test-preview-img', '');
      openModal('testimonial-modal');
    });
  }

  // Close buttons with data-close-modal
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  document.querySelectorAll('.admin-modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* Edit Functions (Global scope for onclick attributes) */
window.editProject = function(p) {
  editingItemId = p.id;
  document.getElementById('project-modal-title').textContent = 'Edit Project';
  document.getElementById('proj-id').value = p.id;
  document.getElementById('proj-title').value = p.title || '';

  const catSelect = document.getElementById('proj-category');
  if (catSelect && p.category) {
    let found = false;
    for (let i = 0; i < catSelect.options.length; i++) {
      if (catSelect.options[i].value.toLowerCase() === p.category.toLowerCase()) {
        catSelect.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = p.category;
      opt.textContent = p.category;
      catSelect.appendChild(opt);
      catSelect.value = p.category;
    }
  }

  document.getElementById('proj-client').value = p.client || '';
  document.getElementById('proj-year').value = p.year || '2025';
  document.getElementById('proj-tech').value = p.tech_stack || p.technologies || '';
  
  const liveLinkInput = document.getElementById('proj-live-link');
  if (liveLinkInput) {
    liveLinkInput.value = (p.live_link && p.live_link !== '#') ? p.live_link : '';
  }

  document.getElementById('proj-desc').value = p.description || '';
  document.getElementById('proj-image-url').value = p.image_url || '';
  setImgPreview('proj-preview-img', p.image_url || '');
  openModal('project-modal');
};

window.editGalleryItem = function(g) {
  editingItemId = g.id;
  document.getElementById('gallery-modal-title').textContent = 'Edit Gallery Item';
  document.getElementById('gal-id').value = g.id;
  document.getElementById('gal-title').value = g.title || '';

  const catSelect = document.getElementById('gal-category');
  if (catSelect && g.category) {
    let found = false;
    for (let i = 0; i < catSelect.options.length; i++) {
      if (catSelect.options[i].value.toLowerCase() === g.category.toLowerCase()) {
        catSelect.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = g.category;
      opt.textContent = g.category;
      catSelect.appendChild(opt);
      catSelect.value = g.category;
    }
  }

  document.getElementById('gal-caption').value = g.caption || g.description || '';
  document.getElementById('gal-image-url').value = g.image_url || '';
  setImgPreview('gal-preview-img', g.image_url || '');
  openModal('gallery-modal');
};

window.editTestimonial = function(t) {
  editingItemId = t.id;
  document.getElementById('testimonial-modal-title').textContent = 'Edit Testimonial';
  document.getElementById('test-id').value = t.id;
  document.getElementById('test-name').value = t.client_name || '';
  document.getElementById('test-title').value = t.client_title || t.role || '';
  document.getElementById('test-company').value = t.company || '';
  document.getElementById('test-rating').value = t.rating || 5;
  document.getElementById('test-quote').value = t.quote || t.content || '';
  document.getElementById('test-avatar-url').value = t.avatar_url || '';
  setImgPreview('test-preview-img', t.avatar_url || '');
  openModal('testimonial-modal');
};

/* Delete Function */
window.deleteRecord = async function(type, id) {
  if (!confirm(`Are you sure you want to permanently delete this ${type}?`)) {
    return;
  }

  let action = '';
  switch (type) {
    case 'project': action = 'delete_project'; break;
    case 'gallery': action = 'delete_gallery'; break;
    case 'testimonial': action = 'delete_testimonial'; break;
    case 'consultation': action = 'delete_consultation'; break;
  }

  try {
    const res = await fetch(`${API_BASE}?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
      if (type === 'project') loadProjects();
      else if (type === 'gallery') loadGallery();
      else if (type === 'testimonial') loadTestimonials();
      else if (type === 'consultation') loadConsultations();
      loadDashboardStats();
    } else {
      showToast(data.error || 'Deletion failed', 'error');
    }
  } catch (err) {
    showToast('Network error during deletion', 'error');
  }
};

/* File Upload Handlers */
function initUploadTriggers() {
  setupFileUpload('proj-upload-trigger', 'proj-file-input', 'proj-image-url', 'proj-preview-img');
  setupFileUpload('gal-upload-trigger', 'gal-file-input', 'gal-image-url', 'gal-preview-img');
  setupFileUpload('test-upload-trigger', 'test-file-input', 'test-avatar-url', 'test-preview-img');
}

function setupFileUpload(triggerId, fileInputId, urlInputId, previewImgId) {
  const trigger = document.getElementById(triggerId);
  const fileInput = document.getElementById(fileInputId);
  const urlInput = document.getElementById(urlInputId);

  if (trigger && fileInput) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });

    fileInput.addEventListener('change', async () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image', file);

      trigger.disabled = true;
      const originalHtml = trigger.innerHTML;
      trigger.innerHTML = '<span class="material-symbols-outlined text-sm fa-spin">progress_activity</span><span>Uploading...</span>';

      try {
        const res = await fetch(UPLOAD_BASE, {
          method: 'POST',
          credentials: 'same-origin',
          body: formData
        });
        const data = await res.json();
        if (data.status === 'success' || data.success) {
          const uploadedUrl = data.url || data.image_url;
          if (urlInput) urlInput.value = uploadedUrl;
          setImgPreview(previewImgId, data.admin_preview_url || uploadedUrl);
          showToast('Image uploaded successfully from device.');
        } else {
          showToast(data.message || data.error || 'Upload failed', 'error');
        }
      } catch (err) {
        showToast('Network error uploading image. Check connection.', 'error');
      } finally {
        trigger.disabled = false;
        trigger.innerHTML = originalHtml;
        fileInput.value = '';
      }
    });
  }

  // Live URL input preview
  if (urlInput) {
    urlInput.addEventListener('input', () => {
      setImgPreview(previewImgId, urlInput.value.trim());
    });
  }
}

function setImgPreview(previewId, url) {
  const img = document.getElementById(previewId);
  if (!img) return;
  if (url) {
    img.src = formatAdminImageUrl(url);
    img.style.display = 'block';
    const placeholder = img.nextElementSibling;
    if (placeholder && placeholder.classList.contains('preview-placeholder-text')) {
      placeholder.style.display = 'none';
    }
  } else {
    img.src = '';
    img.style.display = 'none';
    const placeholder = img.nextElementSibling;
    if (placeholder && placeholder.classList.contains('preview-placeholder-text')) {
      placeholder.style.display = 'block';
    }
  }
}

/* Form Submissions */
function initFormHandlers() {
  // Project Form
  const projForm = document.getElementById('project-form');
  if (projForm) {
    projForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('proj-id').value;
      const rawLive = (document.getElementById('proj-live-link')?.value || '').trim();
      let liveUrl = rawLive;
      if (liveUrl && !liveUrl.startsWith('http://') && !liveUrl.startsWith('https://') && liveUrl !== '#') {
        liveUrl = 'https://' + liveUrl;
      }

      const payload = {
        id: id ? parseInt(id) : null,
        title: document.getElementById('proj-title').value.trim(),
        category: document.getElementById('proj-category').value,
        client: document.getElementById('proj-client').value.trim(),
        year: document.getElementById('proj-year').value.trim() || '2025',
        tech_stack: document.getElementById('proj-tech').value.trim(),
        live_link: liveUrl || '#',
        description: document.getElementById('proj-desc').value.trim(),
        image_url: document.getElementById('proj-image-url').value.trim() || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        featured: 1,
        sort_order: 0
      };

      const action = id ? 'update_project' : 'create_project';
      await sendPost(action, payload, 'project-modal', () => {
        loadProjects();
        loadDashboardStats();
      }, 'Project saved successfully.');
    });
  }

  // Gallery Form
  const galForm = document.getElementById('gallery-form');
  if (galForm) {
    galForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('gal-id').value;
      const payload = {
        id: id ? parseInt(id) : null,
        title: document.getElementById('gal-title').value.trim(),
        category: document.getElementById('gal-category').value,
        caption: document.getElementById('gal-caption').value.trim(),
        image_url: document.getElementById('gal-image-url').value.trim(),
        sort_order: 0
      };

      const action = id ? 'update_gallery' : 'create_gallery';
      await sendPost(action, payload, 'gallery-modal', () => {
        loadGallery();
        loadDashboardStats();
      }, 'Gallery image saved successfully.');
    });
  }

  // Testimonial Form
  const testForm = document.getElementById('testimonial-form');
  if (testForm) {
    testForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('test-id').value;
      const payload = {
        id: id ? parseInt(id) : null,
        client_name: document.getElementById('test-name').value.trim(),
        client_title: document.getElementById('test-title').value.trim(),
        company: document.getElementById('test-company').value.trim(),
        rating: parseInt(document.getElementById('test-rating').value) || 5,
        quote: document.getElementById('test-quote').value.trim(),
        avatar_url: document.getElementById('test-avatar-url').value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        sort_order: 0
      };

      const action = id ? 'update_testimonial' : 'create_testimonial';
      await sendPost(action, payload, 'testimonial-modal', () => {
        loadTestimonials();
        loadDashboardStats();
      }, 'Testimonial saved successfully.');
    });
  }
}

async function sendPost(action, payload, modalId, callback, successMessage) {
  try {
    const res = await fetch(`${API_BASE}?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(successMessage);
      closeModal(modalId);
      if (callback) callback();
    } else {
      showToast(data.error || 'Failed to save record', 'error');
    }
  } catch (err) {
    showToast('Network error saving record', 'error');
  }
}

// Helpers
function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
