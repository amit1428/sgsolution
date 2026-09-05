<?php
/**
 * SG Solutions — Executive CMS Master Control Panel
 */
require_once dirname(__DIR__) . '/backend/auth.php';

if (!isLoggedIn()) {
    header('Location: login.php');
    exit;
}

$adminName = $_SESSION['sg_admin_name'] ?? 'Administrator';
$adminUser = $_SESSION['sg_admin_username'] ?? 'admin';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Control Center | SG Solutions CMS</title>
  
  <!-- Modern Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  
  <link rel="stylesheet" href="./admin.css">
</head>
<body class="admin-body">
  <!-- Top Navigation Header -->
  <header class="admin-topbar">
    <div class="topbar-left">
      <a href="../index.html" target="_blank" class="brand-link" title="Open Public Website">
        <img src="../logo.png" alt="SG Solutions" class="admin-logo">
      </a>
      <div class="topbar-divider"></div>
      <span class="topbar-badge">
        <span class="badge-pulse"></span>
        SQLite Connected &bull; Real-Time
      </span>
    </div>

    <div class="topbar-right">
      <a href="../index.html" target="_blank" class="btn-outline-sm">
        <span class="material-symbols-outlined text-sm">open_in_new</span>
        <span>View Live Website</span>
      </a>
      <div class="admin-user-pill">
        <div class="user-avatar">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="user-info">
          <span class="user-name"><?= htmlspecialchars($adminName) ?></span>
          <span class="user-role">Super Admin</span>
        </div>
      </div>
      <a href="logout.php" class="btn-logout" title="Sign Out">
        <span class="material-symbols-outlined">logout</span>
      </a>
    </div>
  </header>

  <div class="admin-layout">
    <!-- Sidebar Navigation -->
    <aside class="admin-sidebar">
      <div class="sidebar-menu">
        <button class="nav-tab-btn active" data-tab="overview">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Overview</span>
        </button>
        <button class="nav-tab-btn" data-tab="projects">
          <span class="material-symbols-outlined">work</span>
          <span>Projects &amp; Work</span>
          <span class="tab-count-badge" id="count-projects">0</span>
        </button>
        <button class="nav-tab-btn" data-tab="gallery">
          <span class="material-symbols-outlined">photo_library</span>
          <span>Image Gallery</span>
          <span class="tab-count-badge" id="count-gallery">0</span>
        </button>
        <button class="nav-tab-btn" data-tab="testimonials">
          <span class="material-symbols-outlined">reviews</span>
          <span>Testimonials</span>
          <span class="tab-count-badge" id="count-testimonials">0</span>
        </button>
        <button class="nav-tab-btn" data-tab="consultations">
          <span class="material-symbols-outlined">mail</span>
          <span>Leads &amp; Inquiries</span>
          <span class="tab-count-badge alert" id="count-inquiries">0</span>
        </button>
      </div>

      <div class="sidebar-footer">
        <div class="system-health-card">
          <div class="health-top">
            <span class="material-symbols-outlined text-emerald">database</span>
            <span class="health-title">SQLite Database</span>
          </div>
          <span class="health-status">Healthy • Fast I/O</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Stage -->
    <main class="admin-main">
      <!-- Alert Banner -->
      <div id="toast-container" class="toast-container"></div>

      <!-- ===================================================================
           TAB 1: OVERVIEW TELEMETRY
           =================================================================== -->
      <section id="tab-overview" class="admin-tab-pane active">
        <div class="pane-header">
          <div>
            <h1 class="pane-title">Executive Dashboard</h1>
            <p class="pane-subtitle">Real-time status of portfolio content, media assets, and incoming enterprise client inquiries.</p>
          </div>
          <div class="header-actions">
            <button class="cta-gold-btn" id="quick-add-project-btn">
              <span class="material-symbols-outlined text-sm">add</span>
              <span>New Project</span>
            </button>
            <button class="btn-secondary" id="quick-add-gallery-btn">
              <span class="material-symbols-outlined text-sm">upload</span>
              <span>Upload Gallery Image</span>
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="overview-stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap bg-emerald-dim">
              <span class="material-symbols-outlined text-emerald">work</span>
            </div>
            <div>
              <span class="stat-value" id="stat-total-projects">0</span>
              <span class="stat-label">Published Projects</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap bg-gold-dim">
              <span class="material-symbols-outlined text-gold">photo_library</span>
            </div>
            <div>
              <span class="stat-value" id="stat-total-gallery">0</span>
              <span class="stat-label">Gallery Media Assets</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap bg-indigo-dim">
              <span class="material-symbols-outlined text-indigo">reviews</span>
            </div>
            <div>
              <span class="stat-value" id="stat-total-testimonials">0</span>
              <span class="stat-label">Client Endorsements</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrap bg-rose-dim">
              <span class="material-symbols-outlined text-rose">contact_mail</span>
            </div>
            <div>
              <span class="stat-value" id="stat-total-leads">0</span>
              <span class="stat-label">Consultation Inquiries</span>
            </div>
          </div>
        </div>

        <!-- Quick Activity Feeds -->
        <div class="overview-split-grid">
          <div class="overview-card">
            <div class="overview-card-header">
              <div class="card-header-title">
                <span class="material-symbols-outlined text-emerald">work</span>
                <h3>Recent Portfolio Deployments</h3>
              </div>
              <button class="text-btn" data-switch-tab="projects">Manage All &rarr;</button>
            </div>
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Category</th>
                    <th>Client</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody id="overview-recent-projects">
                  <tr><td colspan="4" class="text-center py-4">Loading projects...</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="overview-card">
            <div class="overview-card-header">
              <div class="card-header-title">
                <span class="material-symbols-outlined text-rose">inbox</span>
                <h3>Latest Consultation Inquiries</h3>
              </div>
              <button class="text-btn" data-switch-tab="consultations">View Inbox &rarr;</button>
            </div>
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="overview-recent-inquiries">
                  <tr><td colspan="3" class="text-center py-4">Loading inquiries...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================================================================
           TAB 2: PROJECTS & PORTFOLIO MANAGER
           =================================================================== -->
      <section id="tab-projects" class="admin-tab-pane">
        <div class="pane-header">
          <div>
            <h1 class="pane-title">Projects &amp; Portfolio Manager</h1>
            <p class="pane-subtitle">Add, edit, and curate featured enterprise projects rendered on the public website.</p>
          </div>
          <button class="cta-gold-btn" id="open-new-project-modal-btn">
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Add New Project</span>
          </button>
        </div>

        <div class="admin-card-container">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 80px;">Preview</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Client</th>
                  <th>Tech Stack</th>
                  <th style="width: 130px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="projects-table-body">
                <!-- Dynamically Hydrated via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ===================================================================
           TAB 3: IMAGE GALLERY MANAGER
           =================================================================== -->
      <section id="tab-gallery" class="admin-tab-pane">
        <div class="pane-header">
          <div>
            <h1 class="pane-title">Enterprise Image Gallery</h1>
            <p class="pane-subtitle">Upload high-resolution photography, corporate lab stills, and digital innovation snapshots.</p>
          </div>
          <button class="cta-gold-btn" id="open-new-gallery-modal-btn">
            <span class="material-symbols-outlined text-sm">upload</span>
            <span>Upload New Image</span>
          </button>
        </div>

        <div class="admin-card-container">
          <div class="gallery-admin-grid" id="gallery-admin-grid">
            <!-- Dynamically Hydrated via JS -->
          </div>
        </div>
      </section>

      <!-- ===================================================================
           TAB 4: TESTIMONIALS MANAGER
           =================================================================== -->
      <section id="tab-testimonials" class="admin-tab-pane">
        <div class="pane-header">
          <div>
            <h1 class="pane-title">Client Testimonials &amp; Endorsements</h1>
            <p class="pane-subtitle">Manage client reviews, executive quotes, company titles, and author avatars.</p>
          </div>
          <button class="cta-gold-btn" id="open-new-testimonial-modal-btn">
            <span class="material-symbols-outlined text-sm">add</span>
            <span>Add Testimonial</span>
          </button>
        </div>

        <div class="admin-card-container">
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th style="width: 70px;">Avatar</th>
                  <th>Client Name</th>
                  <th>Title &amp; Company</th>
                  <th>Quote</th>
                  <th>Rating</th>
                  <th style="width: 130px; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="testimonials-table-body">
                <!-- Dynamically Hydrated via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ===================================================================
           TAB 5: CONSULTATION LEADS INBOX
           =================================================================== -->
      <section id="tab-consultations" class="admin-tab-pane">
        <div class="pane-header">
          <div>
            <h1 class="pane-title">Consultation Inquiries &amp; Leads</h1>
            <p class="pane-subtitle">Review incoming inquiries from the frontend schedule consultation modal.</p>
          </div>
        </div>

        <div class="admin-card-container">
          <div class="table-responsive">
            <table class="admin-table leads-table">
              <thead>
                <tr>
                  <th style="width: 100px;">Date</th>
                  <th style="width: 26%;">Client &amp; Contact</th>
                  <th style="width: 20%;">Engagement Area</th>
                  <th>Message / Scope</th>
                  <th style="width: 130px;">Status</th>
                  <th style="width: 80px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="consultations-table-body">
                <!-- Dynamically Hydrated via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>

  <!-- =====================================================================
       MODAL 1: Project Editor Modal
       ===================================================================== -->
  <div id="project-modal" class="admin-modal-backdrop">
    <div class="admin-modal-dialog">
      <div class="modal-header">
        <h3 id="project-modal-title" class="modal-heading">Add New Project</h3>
        <button type="button" class="modal-close-icon-btn" data-close-modal="project-modal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form id="project-form" class="modal-form">
        <input type="hidden" id="proj-id" name="id">

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="proj-title">Project Title *</label>
            <input type="text" id="proj-title" class="form-input" required placeholder="e.g. Nexus Global Wealth Gateway">
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-category">Category *</label>
            <select id="proj-category" class="form-select">
              <option value="FinTech & Web">FinTech &amp; Web</option>
              <option value="Mobile & Health">Mobile &amp; Health</option>
              <option value="Enterprise CRM">Enterprise CRM</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Cloud Architecture">Cloud Architecture</option>
            </select>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="proj-client">Client / Organization *</label>
            <input type="text" id="proj-client" class="form-input" required placeholder="e.g. Aether Financial AG">
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-year">Year</label>
            <input type="text" id="proj-year" class="form-input" value="2025" placeholder="2025">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="proj-tech">Tech Stack (Comma Separated)</label>
          <input type="text" id="proj-tech" class="form-input" placeholder="e.g. Next.js, TypeScript, WebGL, Docker">
        </div>

        <div class="form-group">
          <label class="form-label" for="proj-desc">Executive Summary / Description *</label>
          <textarea id="proj-desc" class="form-textarea" rows="3" required placeholder="Describe the mission-critical challenges and engineering results achieved..."></textarea>
        </div>

        <!-- Image Uploader or URL -->
        <div class="form-group">
          <label class="form-label">Project Cover Image *</label>
          <div class="image-uploader-box">
            <div class="uploader-preview-wrap" id="proj-preview-wrap">
              <img id="proj-preview-img" src="" alt="Preview" class="uploader-preview-img">
              <span class="preview-placeholder-text">No image selected</span>
            </div>
            <div class="uploader-controls">
              <input type="file" id="proj-file-input" class="hidden-file-input" accept="image/*">
              <button type="button" class="btn-secondary sm" id="proj-upload-trigger">
                <span class="material-symbols-outlined text-sm">upload</span>
                <span>Upload From Device</span>
              </button>
              <span class="text-xs text-muted">Or enter external image URL below:</span>
              <input type="text" id="proj-image-url" class="form-input text-xs" placeholder="https://...">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-close-modal="project-modal">Cancel</button>
          <button type="submit" class="cta-gold-btn">
            <span class="material-symbols-outlined text-sm">save</span>
            <span>Save Project</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- =====================================================================
       MODAL 2: Gallery Item Modal
       ===================================================================== -->
  <div id="gallery-modal" class="admin-modal-backdrop">
    <div class="admin-modal-dialog">
      <div class="modal-header">
        <h3 id="gallery-modal-title" class="modal-heading">Upload Gallery Image</h3>
        <button type="button" class="modal-close-icon-btn" data-close-modal="gallery-modal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form id="gallery-form" class="modal-form">
        <input type="hidden" id="gal-id" name="id">

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="gal-title">Image Title *</label>
            <input type="text" id="gal-title" class="form-input" required placeholder="e.g. Global Strategy Briefing">
          </div>
          <div class="form-group">
            <label class="form-label" for="gal-category">Category *</label>
            <select id="gal-category" class="form-select">
              <option value="Corporate Hubs">Corporate Hubs</option>
              <option value="Engineering">Engineering</option>
              <option value="Design & UI">Design &amp; UI</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Growth & AI">Growth &amp; AI</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="gal-caption">Caption / Context</label>
          <input type="text" id="gal-caption" class="form-input" placeholder="e.g. SG Solutions Global Architecture Center...">
        </div>

        <!-- Image Uploader or URL -->
        <div class="form-group">
          <label class="form-label">High-Resolution Image Asset *</label>
          <div class="image-uploader-box">
            <div class="uploader-preview-wrap" id="gal-preview-wrap">
              <img id="gal-preview-img" src="" alt="Preview" class="uploader-preview-img">
              <span class="preview-placeholder-text">No image selected</span>
            </div>
            <div class="uploader-controls">
              <input type="file" id="gal-file-input" class="hidden-file-input" accept="image/*">
              <button type="button" class="btn-secondary sm" id="gal-upload-trigger">
                <span class="material-symbols-outlined text-sm">upload</span>
                <span>Upload From Device</span>
              </button>
              <span class="text-xs text-muted">Or enter direct image URL:</span>
              <input type="text" id="gal-image-url" class="form-input text-xs" required placeholder="https://...">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-close-modal="gallery-modal">Cancel</button>
          <button type="submit" class="cta-gold-btn">
            <span class="material-symbols-outlined text-sm">save</span>
            <span>Save to Gallery</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- =====================================================================
       MODAL 3: Testimonial Modal
       ===================================================================== -->
  <div id="testimonial-modal" class="admin-modal-backdrop">
    <div class="admin-modal-dialog">
      <div class="modal-header">
        <h3 id="testimonial-modal-title" class="modal-heading">Add Client Testimonial</h3>
        <button type="button" class="modal-close-icon-btn" data-close-modal="testimonial-modal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form id="testimonial-form" class="modal-form">
        <input type="hidden" id="test-id" name="id">

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="test-name">Client Name *</label>
            <input type="text" id="test-name" class="form-input" required placeholder="e.g. Dr. Aris Thorne">
          </div>
          <div class="form-group">
            <label class="form-label" for="test-title">Executive Title *</label>
            <input type="text" id="test-title" class="form-input" required placeholder="e.g. Chief Information Officer">
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label" for="test-company">Company &amp; Location *</label>
            <input type="text" id="test-company" class="form-input" required placeholder="e.g. Aether Financial AG (Zurich)">
          </div>
          <div class="form-group">
            <label class="form-label" for="test-rating">Star Rating (1-5)</label>
            <select id="test-rating" class="form-select">
              <option value="5">★★★★★ (5 Stars)</option>
              <option value="4">★★★★☆ (4 Stars)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="test-quote">Endorsement Quote *</label>
          <textarea id="test-quote" class="form-textarea" rows="3" required placeholder="SG Solutions completely transformed our global portal..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Client Avatar Photo *</label>
          <div class="image-uploader-box">
            <div class="uploader-preview-wrap avatar-preview" id="test-preview-wrap">
              <img id="test-preview-img" src="" alt="Avatar" class="uploader-preview-img avatar-img">
              <span class="preview-placeholder-text">No photo</span>
            </div>
            <div class="uploader-controls">
              <input type="file" id="test-file-input" class="hidden-file-input" accept="image/*">
              <button type="button" class="btn-secondary sm" id="test-upload-trigger">
                <span class="material-symbols-outlined text-sm">upload</span>
                <span>Upload Avatar</span>
              </button>
              <input type="text" id="test-avatar-url" class="form-input text-xs" required placeholder="Avatar URL https://...">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-close-modal="testimonial-modal">Cancel</button>
          <button type="submit" class="cta-gold-btn">
            <span class="material-symbols-outlined text-sm">save</span>
            <span>Save Testimonial</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- =====================================================================
       MODAL 4: Lead Details Modal
       ===================================================================== -->
  <div id="lead-details-modal" class="admin-modal-backdrop">
    <div class="admin-modal-dialog">
      <div class="modal-header">
        <h3 id="lead-modal-title" class="modal-heading">Consultation Details</h3>
        <button type="button" class="modal-close-icon-btn" data-close-modal="lead-details-modal">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="modal-body-content" id="lead-modal-content" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
        <!-- Hydrated dynamically -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-secondary" data-close-modal="lead-details-modal">Close</button>
      </div>
    </div>
  </div>

  <script src="./admin.js"></script>
</body>
</html>
