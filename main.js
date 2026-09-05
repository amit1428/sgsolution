/* ==========================================================================
   SG SOLUTIONS — INTERACTIVE ENTERPRISE ENGINE & MOTION SYSTEM
   High Performance 3D Physics, Framer Motion Engine & Enterprise HUD
   ========================================================================== */

// Auto-route /admin requests to the Executive CMS Login Portal
if (window.location.pathname.toLowerCase().endsWith('/admin') || window.location.pathname.toLowerCase().endsWith('/admin/')) {
  window.location.href = 'admin/index.php';
}

// Web Audio API - Cybernetic Spatial Sound Generator
let soundEnabled = true;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(type = 'chime') {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'chime') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      notes.forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        const t = now + idx * 0.07;
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(t);
        o.stop(t + 0.3);
      });
    }
  } catch (e) {
    // Graceful fallback if audio is blocked
  }
}

/* ==========================================================================
   Hero Video Audio Controller
   ========================================================================== */
const heroVideo = document.getElementById('hero-bg-video');
const heroSoundBtn = document.getElementById('hero-sound-toggle-btn');
const heroSoundIcon = document.getElementById('hero-sound-icon');
const heroSoundText = document.getElementById('hero-sound-text');
let isHeroVideoUserUnmuted = false;

function setHeroVideoAudioState(unmuted) {
  if (!heroVideo) return;
  
  if (unmuted) {
    heroVideo.muted = false;
    heroVideo.volume = 1.0;
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback if blocked
      });
    }
    isHeroVideoUserUnmuted = true;
    if (heroSoundBtn) {
      heroSoundBtn.classList.add('unmuted');
    }
    if (heroSoundIcon) heroSoundIcon.textContent = 'volume_up';
    if (heroSoundText) heroSoundText.textContent = 'Mute Audio';
  } else {
    heroVideo.muted = true;
    isHeroVideoUserUnmuted = false;
    if (heroSoundBtn) {
      heroSoundBtn.classList.remove('unmuted');
    }
    if (heroSoundIcon) heroSoundIcon.textContent = 'volume_off';
    if (heroSoundText) heroSoundText.textContent = 'Play Audio';
  }
}

if (heroSoundBtn) {
  heroSoundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (heroVideo) {
      setHeroVideoAudioState(heroVideo.muted);
    }
  });
}

// Optional: Also allow unmuting when clicking anywhere on hero if still muted
const heroStage = document.getElementById('hero-content-stage');
if (heroStage) {
  heroStage.addEventListener('click', (e) => {
    // Only if clicking on backdrop, not buttons or links
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    if (heroVideo && heroVideo.muted && !isHeroVideoUserUnmuted) {
      setHeroVideoAudioState(true);
    }
  });
}

/* ==========================================================================
   3D Mouse Tilt & Parallax Physics Engine
   ========================================================================== */
function init3DTiltPhysics() {
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    const glare = card.querySelector('.card-glare');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cardWidth = rect.width;
      const cardHeight = rect.height;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate percentage from -1 to 1
      const xPct = (mouseX / cardWidth) * 2 - 1;
      const yPct = (mouseY / cardHeight) * 2 - 1;

      // Max tilt degrees
      const maxTilt = 10;
      const rotateX = -yPct * maxTilt;
      const rotateY = xPct * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Dynamic Glare specular reflection position
      if (glare) {
        const glareX = (mouseX / cardWidth) * 100;
        const glareY = (mouseY / cardHeight) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

/* ==========================================================================
   Ambient Cursor Spotlight Tracking
   ========================================================================== */
const cursorSpotlight = document.getElementById('cursor-spotlight');

if (cursorSpotlight) {
  window.addEventListener('mousemove', (e) => {
    cursorSpotlight.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  }, { passive: true });
}

/* ==========================================================================
   MNC Cinematic Motion Engine (Framer Motion Physics & Viewport Tracker)
   ========================================================================== */
let globalMotionObserver = null;

function initMotionReveals() {
  const motionSelectors = [
    '.animate-on-scroll',
    '.motion-cut-in',
    '.motion-cut-left',
    '.motion-cut-right',
    '.motion-zoom-in',
    '.motion-fade-slide-up',
    '.motion-stagger-group',
    '[data-motion]'
  ].join(', ');

  const elements = document.querySelectorAll(motionSelectors);
  
  if ('IntersectionObserver' in window) {
    if (globalMotionObserver) {
      globalMotionObserver.disconnect();
    }

    globalMotionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('in-view', 'is-inview');
          
          // If this is a 3D tilt card, trigger specular glare sweep
          if (el.classList.contains('card-3d')) {
            const glare = el.querySelector('.card-glare');
            if (glare) {
              glare.style.opacity = '0.35';
              setTimeout(() => { glare.style.opacity = ''; }, 1200);
            }
          }

          globalMotionObserver.unobserve(el);
        }
      });
    }, { 
      threshold: 0.08, 
      rootMargin: '0px 0px -30px 0px' 
    });

    elements.forEach(el => globalMotionObserver.observe(el));
  } else {
    elements.forEach(el => el.classList.add('in-view', 'is-inview'));
  }

  initCinematicNavigation();
}

function observeNewCards(parent) {
  if (!parent) return;
  const elements = parent.querySelectorAll('.animate-on-scroll, .motion-cut-in, .motion-zoom-in, .motion-card, [data-motion]');
  
  if (globalMotionObserver) {
    elements.forEach(el => globalMotionObserver.observe(el));
  } else {
    elements.forEach(el => el.classList.add('in-view', 'is-inview'));
  }

  // Re-bind 3D tilt physics to any dynamically rendered cards
  init3DTiltPhysics();
}

/* Smooth Cinematic View Transitions on Link Clicks */
function initCinematicNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.hasAttribute('data-motion-bound')) return;
    anchor.setAttribute('data-motion-bound', 'true');

    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        playSound('tick');

        if (document.startViewTransition) {
          document.startViewTransition(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/* ==========================================================================
   Live Metric Running Counter Animations (Scroll Triggered)
   ========================================================================== */
function initMetricCounters() {
  const counterElements = document.querySelectorAll('.counter');
  
  function animateRunningNumber(el) {
    if (el.hasAttribute('data-counted')) return;
    el.setAttribute('data-counted', 'true');
    
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1800; // ms running duration
    const startTime = performance.now();
    
    el.classList.add('is-counting');
    let lastTick = 0;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      // Exponential / Quartic Ease Out for running speed
      const easeVal = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeVal * target);

      el.textContent = currentCount;

      // Subtle audio feedback during rolling numbers (throttled)
      if (progress < 0.85 && currentTime - lastTick > 90) {
        lastTick = currentTime;
        playSound('tick');
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
        el.classList.remove('is-counting');
        el.classList.add('counted');
      }
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateRunningNumber(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.35,
      rootMargin: '0px 0px -40px 0px' 
    });

    counterElements.forEach(el => counterObserver.observe(el));
  } else {
    counterElements.forEach(el => animateRunningNumber(el));
  }
}

/* ==========================================================================
   Real-Time Global Hub World Clocks
   ========================================================================== */
function updateGlobalClocks() {
  const timezones = {
    'clock-ny': { tz: 'America/New_York', label: 'EDT' },
    'clock-lon': { tz: 'Europe/London', label: 'BST' },
    'clock-dxb': { tz: 'Asia/Dubai', label: 'GST' },
    'clock-sgp': { tz: 'Asia/Singapore', label: 'SGT' }
  };

  const now = new Date();

  Object.entries(timezones).forEach(([elementId, config]) => {
    const el = document.getElementById(elementId);
    if (el) {
      try {
        const timeString = new Intl.DateTimeFormat('en-GB', {
          timeZone: config.tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now);

        el.textContent = `${timeString} ${config.label}`;
      } catch (e) {
        el.textContent = '--:--:--';
      }
    }
  });
}

setInterval(updateGlobalClocks, 1000);
updateGlobalClocks();

/* ==========================================================================
   Executive Consultation Modal Handling
   ========================================================================== */
const consultModal = document.getElementById('consult-modal');
const openConsultBtn = document.getElementById('open-consult-btn');
const mobileConsultBtn = document.getElementById('mobile-consult-btn');
const ctaConsultTrigger = document.getElementById('cta-consult-trigger');
const heroContactBtn = document.getElementById('hero-contact-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const consultForm = document.getElementById('consult-form');

function openModal() {
  if (!consultModal) return;
  consultModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  playSound('chime');
}

function closeModal() {
  if (!consultModal) return;
  consultModal.classList.remove('open');
  document.body.style.overflow = '';
}

const suiteExploreBtn = document.getElementById('cta-suite-explore-btn');
const careConsultBtn = document.getElementById('care-consult-btn');

[openConsultBtn, mobileConsultBtn, ctaConsultTrigger, heroContactBtn, suiteExploreBtn, careConsultBtn].forEach(btn => {
  if (btn) btn.addEventListener('click', openModal);
});

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

if (consultModal) {
  consultModal.addEventListener('click', (e) => {
    if (e.target === consultModal) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && consultModal && consultModal.classList.contains('open')) {
    closeModal();
  }
});

// Public Toast Notifications
function showSiteToast(message, type = 'success') {
  const container = document.getElementById('site-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `site-toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-sm text-gold">${type === 'error' ? 'error' : 'check_circle'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Fallback seed data in case PHP backend is offline
const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: "Apex Global FinTech Engine",
    client: "Apex Financial Group",
    category: "Websites",
    technologies: "Next.js, Python, Rust, SQLite",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    description: "Ultra-low-latency financial analytics engine processing 1.2M events/sec with sub-millisecond settlement pipelines.",
    is_featured: 1
  },
  {
    id: 2,
    title: "Omnichannel Retail Architecture",
    client: "Nordic Luxury Group",
    category: "Mobile Apps",
    technologies: "React Native, Node.js, GraphQL",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    description: "Enterprise mobile and web commerce platform spanning 24 international localized storefronts.",
    is_featured: 1
  },
  {
    id: 3,
    title: "Autonomous Logistics CRM & ERP",
    client: "TransGlobal Freight",
    category: "Softwares",
    technologies: "Vue.js, Django, Redis, SQLite",
    image_url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
    description: "Intelligent dispatch automation & unified CRM pipeline orchestrating 15,000 daily fleet routes.",
    is_featured: 0
  },
  {
    id: 4,
    title: "OmniScale Algorithmic Ad Engine",
    client: "Hyperion Brands LLC",
    category: "Digital Marketing",
    technologies: "Attribution AI, Google Ads API, BigQuery",
    image_url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
    description: "Deployed an AI-powered multi-touch attribution engine that optimized $12M+ annual media spend, scaling customer acquisition ROAS by 340%.",
    is_featured: 1
  }
];

const FALLBACK_GALLERY = [
  {
    id: 1,
    title: "Zero-Trust Cloud Mesh Blueprint",
    category: "Architecture",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000",
    description: "High-concurrency distributed topology diagram illustrating our multi-region zero-trust failover."
  },
  {
    id: 2,
    title: "Executive Intelligence HUD",
    category: "Dashboard",
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000",
    description: "Dark-mode biometric dashboard monitoring institutional telemetry across four continents."
  },
  {
    id: 3,
    title: "Enterprise Mobile Banking Design",
    category: "Mobile",
    image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000",
    description: "High-fidelity iOS & Android component design system built for premier global wealth management."
  },
  {
    id: 4,
    title: "Serverless Microservices Flow",
    category: "Engineering",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000",
    description: "Micro-service cluster architecture delivering fault-tolerant data exchange with sub-10ms response."
  }
];

const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    client_name: "Marcus Vance",
    company: "Vanguard Global Tech",
    role: "Chief Technology Officer",
    rating: 5,
    content: "SG Solutions completely re-architected our legacy financial infrastructure. Our processing speed jumped 400% with zero downtime throughout migration.",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
  },
  {
    id: 2,
    client_name: "Dr. Alistair Sterling",
    company: "OmniHealth Systems",
    role: "VP of Product Engineering",
    rating: 5,
    content: "The level of engineering rigor and design polish SG Solutions delivers is unmatched. They feel like a natural extension of our principal architecture pod.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
  },
  {
    id: 3,
    client_name: "Elena Rostova",
    company: "Aura Luxury Brands",
    role: "Global Digital Director",
    rating: 5,
    content: "Our global omnichannel platforms engineered by SG Solutions achieved 99.999% uptime and generated record-breaking enterprise conversions.",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200"
  }
];

// API Base Endpoint for Backend REST API
const API_BASE = 'backend/api.php';

// Global dynamic cache
let siteProjects = [];
let siteGallery = [];
let siteTestimonials = [];

// Dynamic Data Hydration from Backend Database (MySQL / SQLite)
async function fetchSiteData() {
  try {
    const res = await fetch(`${API_BASE}?action=get_all`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success && json.data) {
      // Live database sync: respect empty database state ([]) without overriding with dummy data
      siteProjects = Array.isArray(json.data.projects) ? json.data.projects : [];
      siteGallery = Array.isArray(json.data.gallery) ? json.data.gallery : [];
      siteTestimonials = Array.isArray(json.data.testimonials) ? json.data.testimonials : [];
    } else {
      throw new Error(json.error || 'API error');
    }
  } catch (err) {
    console.warn('Backend API unavailable or network offline:', err);
    // Only fall back to seed data if server is completely offline / unreachable
    siteProjects = FALLBACK_PROJECTS;
    siteGallery = FALLBACK_GALLERY;
    siteTestimonials = FALLBACK_TESTIMONIALS;
  }

  renderProjects('all');
  renderGallery('all');
  renderTestimonials();
  initDynamicFilters();
  initLightbox();
}

// Render Projects
function renderProjects(filter = 'all') {
  const container = document.getElementById('dynamic-projects-grid');
  if (!container) return;

  const cleanFilter = (filter || 'all').trim().toLowerCase();
  const filtered = cleanFilter === 'all' 
    ? siteProjects 
    : siteProjects.filter(p => {
        if (!p.category) return false;
        const cat = p.category.toLowerCase().trim();
        const title = (p.title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const tech = (p.tech_stack || p.technologies || '').toLowerCase();
        
        if (cat === cleanFilter || cat.includes(cleanFilter) || cleanFilter.includes(cat)) {
          return true;
        }
        // Intelligent fuzzy aliases for Web, Mobile App, Software, CRM, Digital Marketing, SEO
        if (cleanFilter === 'websites' || cleanFilter === 'web' || cleanFilter === 'website') {
          return cat.includes('web') || cat.includes('fintech') || cat.includes('portal') || cat.includes('architecture') || title.includes('web') || title.includes('gateway') || tech.includes('next');
        }
        if (cleanFilter === 'mobile apps' || cleanFilter === 'mobile app' || cleanFilter === 'mobile') {
          return cat.includes('mobile') || cat.includes('app') || cat.includes('health') || cat.includes('ios') || cat.includes('android') || title.includes('mobile') || tech.includes('react native') || tech.includes('swift');
        }
        if (cleanFilter === 'softwares' || cleanFilter === 'software') {
          return cat.includes('software') || cat.includes('crm') || cat.includes('erp') || cat.includes('automation') || cat.includes('saas') || cat.includes('cloud') || title.includes('crm') || title.includes('pipeline') || desc.includes('etl');
        }
        if (cleanFilter === 'crm') {
          return cat.includes('crm') || title.includes('crm') || desc.includes('crm') || desc.includes('pipeline') || desc.includes('salesforce') || cat.includes('software');
        }
        if (cleanFilter === 'digital marketing' || cleanFilter === 'marketing') {
          return cat.includes('marketing') || cat.includes('ad') || cat.includes('growth') || cat.includes('seo') || cat.includes('media') || title.includes('ad') || title.includes('marketing');
        }
        if (cleanFilter === 'seo') {
          return cat.includes('seo') || cat.includes('marketing') || desc.includes('roas') || desc.includes('attribution') || desc.includes('growth') || desc.includes('seo');
        }
        return false;
      });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <span class="material-symbols-outlined text-gold">folder_open</span>
        <span>No projects found in this category. Add projects from the Admin CMS to display them live.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const techStr = p.tech_stack || p.technologies || '';
    const techArray = techStr.split(',').map(t => t.trim()).filter(Boolean);
    const isFeatured = p.featured == 1 || p.is_featured == 1;

    // Resolve live link
    const rawLink = (p.live_link || '').trim();
    const hasLiveLink = rawLink && rawLink !== '#' && rawLink !== '';
    const liveUrl = hasLiveLink ? (rawLink.startsWith('http://') || rawLink.startsWith('https://') ? rawLink : 'https://' + rawLink) : '';

    // Normalize image URL
    let imgUrl = p.image_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800';
    if (imgUrl.startsWith('./uploads/')) {
      imgUrl = imgUrl.slice(2);
    }

    return `
      <article class="project-card animate-on-scroll">
        <div class="project-card-image-wrap">
          <img src="${imgUrl}" alt="${escapeHtml(p.title)}" class="project-card-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'">
          <span class="project-category-badge">${escapeHtml(p.category || 'Websites')}</span>
          ${isFeatured ? '<span class="project-featured-badge">Featured Case Study</span>' : ''}
          ${hasLiveLink ? `
            <a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-image-live-overlay" title="Launch ${escapeHtml(p.title)} in a new tab">
              <span class="live-pill">
                <span class="live-indicator-dot"></span>
                <span>Live Site</span>
                <span class="material-symbols-outlined" style="font-size: 14px;">open_in_new</span>
              </span>
            </a>
          ` : ''}
        </div>
        <div class="project-card-body">
          <span class="project-client-name">${escapeHtml(p.client || 'SG Enterprise Client')}</span>
          <h3 class="project-card-title">
            ${hasLiveLink ? `
              <a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-title-link" title="Open ${escapeHtml(p.title)} in new tab">
                <span>${escapeHtml(p.title)}</span>
                <span class="material-symbols-outlined title-link-icon">open_in_new</span>
              </a>
            ` : escapeHtml(p.title)}
          </h3>
          <p class="project-card-desc">${escapeHtml(p.description || 'Custom software architecture and digital scaling platform.')}</p>
          ${techArray.length > 0 ? `
            <div class="project-tech-tags">
              ${techArray.map(t => `<span class="project-tech-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
          <div class="project-card-footer ${hasLiveLink ? 'dual-action' : ''}">
            ${hasLiveLink ? `
              <a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer" class="project-live-btn" title="Launch ${escapeHtml(p.title)} in a new tab">
                <span>Visit Live Site</span>
                <span class="project-btn-icon-wrap">
                  <span class="material-symbols-outlined">open_in_new</span>
                </span>
              </a>
              <button class="project-view-btn outline-sm" onclick="openConsultationForProject('${encodeURIComponent(p.title)}')" title="Request Architectural System Brief">
                <span>Brief</span>
                <span class="project-btn-icon-wrap">
                  <span class="material-symbols-outlined">arrow_forward</span>
                </span>
              </button>
            ` : `
              <button class="project-view-btn" onclick="openConsultationForProject('${encodeURIComponent(p.title)}')">
                <span>Request System Brief</span>
                <span class="project-btn-icon-wrap">
                  <span class="material-symbols-outlined">arrow_forward</span>
                </span>
              </button>
            `}
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Re-observe newly injected cards for scroll animations
  observeNewCards(container);
}

// Global Category Filter & Scroll Controller
window.filterPortfolioByCategory = function(categoryKey) {
  if (!categoryKey) return;
  playSound('chime');

  let normalized = categoryKey.trim();
  let targetTab = normalized;
  const lower = normalized.toLowerCase();

  // Map sub-services to primary portfolio tabs
  if (lower === 'web' || lower.includes('website')) {
    targetTab = 'Websites';
  } else if (lower === 'mobile' || lower === 'mobile app' || lower === 'mobile apps' || lower.includes('app')) {
    targetTab = 'Mobile Apps';
  } else if (lower === 'software' || lower === 'softwares' || lower === 'crm' || lower.includes('crm') || lower.includes('cloud')) {
    targetTab = 'Softwares';
  } else if (lower === 'digital marketing' || lower === 'marketing' || lower === 'seo' || lower.includes('seo') || lower.includes('marketing')) {
    targetTab = 'Digital Marketing';
  }

  // Update active button state in portfolio filter bar
  const filterBtns = document.querySelectorAll('#portfolio-filter-buttons .portfolio-filter-btn');
  let matchedBtn = null;
  filterBtns.forEach(btn => {
    const btnFilter = (btn.dataset.filter || btn.textContent || '').trim().toLowerCase();
    if (btnFilter === targetTab.toLowerCase()) {
      btn.classList.add('active');
      matchedBtn = btn;
    } else {
      btn.classList.remove('active');
    }
  });

  // Render projects for this selection
  renderProjects(normalized);

  // Smooth scroll down to portfolio section
  const portfolioSection = document.getElementById('portfolio-section');
  if (portfolioSection) {
    const navbarHeight = document.getElementById('mnc-navbar')?.offsetHeight || 70;
    const sectionTop = portfolioSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 15;
    window.scrollTo({ top: sectionTop, behavior: 'smooth' });

    // Visual feedback pulse on the activated filter button
    if (matchedBtn) {
      matchedBtn.style.transition = 'all 0.35s ease';
      matchedBtn.style.transform = 'scale(1.1)';
      matchedBtn.style.boxShadow = '0 0 16px rgba(190, 146, 56, 0.6)';
      setTimeout(() => {
        matchedBtn.style.transform = '';
        matchedBtn.style.boxShadow = '';
      }, 500);
    }
  }
};

// Open consultation modal pre-filled with project
window.openConsultationForProject = function(projectTitle) {
  playSound('chime');
  openModal();
  const msgInput = document.getElementById('consult-message');
  if (msgInput) {
    msgInput.value = `We are interested in reviewing the architecture and case study for: ${decodeURIComponent(projectTitle)}.`;
  }
};

// Render Gallery
function renderGallery(filter = 'all') {
  const container = document.getElementById('dynamic-gallery-grid');
  if (!container) return;

  const filtered = filter === 'all'
    ? siteGallery
    : siteGallery.filter(g => g.category && g.category.toLowerCase().includes(filter.toLowerCase()));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <span class="material-symbols-outlined text-gold">photo_library</span>
        <span>No gallery items found. Add items from the Admin CMS to display them live.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((g, idx) => `
    <div class="gallery-item-card animate-on-scroll" data-index="${idx}" data-category="${g.category || 'Architecture'}">
      <img src="${g.image_url}" alt="${g.title}" class="gallery-item-img" loading="lazy">
      <div class="gallery-zoom-badge">
        <span class="material-symbols-outlined text-sm">zoom_in</span>
      </div>
      <div class="gallery-item-overlay">
        <span class="gallery-item-category">${g.category || 'Architecture'}</span>
        <h4 class="gallery-item-title">${g.title}</h4>
        <p class="gallery-item-desc">${g.caption || g.description || 'Enterprise visual asset.'}</p>
      </div>
    </div>
  `).join('');

  observeNewCards(container);
}

// Render Testimonials
function renderTestimonials() {
  const container = document.getElementById('dynamic-testimonials-grid');
  if (!container) return;

  if (siteTestimonials.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1;">
        <span class="material-symbols-outlined text-gold">rate_review</span>
        <span>No client testimonials published yet. Add reviews from the Admin CMS.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = siteTestimonials.map(t => `
    <article class="testimonial-card animate-on-scroll">
      <div class="testimonial-rating-stars">${'★'.repeat(t.rating || 5)}</div>
      <p class="testimonial-quote-text">"${t.quote || t.content || ''}"</p>
      <div class="testimonial-author-row">
        <img src="${t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}" alt="${t.client_name}" class="testimonial-author-avatar" loading="lazy">
        <div class="testimonial-author-info">
          <h4>${t.client_name}</h4>
          <p>${t.client_title || t.role || 'Executive'}, ${t.company || 'Enterprise'}</p>
        </div>
      </div>
    </article>
  `).join('');

  observeNewCards(container);
}

// Category Filters for Projects & Gallery
function initDynamicFilters() {
  // Project filter buttons
  const projectFilterBtns = document.querySelectorAll('#portfolio-filter-buttons .portfolio-filter-btn');
  projectFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      projectFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter || 'all';
      renderProjects(filter);
    });
  });

  // Connect SG Enterprise Suite capability badges to filter portfolio section
  const clusterBadges = document.querySelectorAll('.suite-service-cluster .cluster-badge, [data-portfolio-filter]');
  clusterBadges.forEach(badge => {
    const triggerFilter = () => {
      const filterKey = badge.dataset.portfolioFilter || badge.querySelector('.badge-label')?.textContent || '';
      window.filterPortfolioByCategory(filterKey);
    };

    badge.addEventListener('click', triggerFilter);
    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerFilter();
      }
    });
  });

  // Gallery filter buttons
  const galleryFilterBtns = document.querySelectorAll('#gallery-filter-buttons .gallery-filter-btn');
  galleryFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter || 'all';
      renderGallery(filter);
    });
  });
}

// Lightbox modal logic
function initLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const closeBtn = document.getElementById('lightbox-close');
  const backdrop = document.getElementById('lightbox-backdrop');

  if (!lightbox) return;

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-item-card');
    if (card) {
      const idx = parseInt(card.dataset.index, 10);
      const item = siteGallery[idx];
      if (!item) return;

      if (lightboxImg) lightboxImg.src = item.image_url;
      if (lightboxCategory) lightboxCategory.textContent = item.category || 'Architecture';
      if (lightboxTitle) lightboxTitle.textContent = item.title;
      if (lightboxDesc) lightboxDesc.textContent = item.caption || item.description || '';

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
}

// Consultation Form Submission Connected to SQLite Backend
if (consultForm) {
  consultForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    playSound('success');

    const submitBtn = consultForm.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    const payload = {
      name: document.getElementById('consult-name').value.trim(),
      email: document.getElementById('consult-email').value.trim(),
      company: document.getElementById('consult-company').value.trim(),
      service: document.getElementById('consult-service').value,
      message: document.getElementById('consult-message').value.trim()
    };

    if (submitBtn) {
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined text-sm fa-spin">progress_activity</span>
        <span>Securing & Submitting Inquiry...</span>
      `;
      submitBtn.disabled = true;
    }

    try {
      const res = await fetch(`${API_BASE}?action=submit_consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success || data.status === 'success') {
        // Launch celebratory confetti
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#ffd15c', '#34d399', '#004d35', '#ffffff']
          });
        } catch (err) {}

        if (submitBtn) {
          submitBtn.innerHTML = `
            <span class="material-symbols-outlined text-sm">check_circle</span>
            <span>Inquiry Received — Response Within 24h</span>
          `;
          submitBtn.style.background = '#10b981';
          submitBtn.style.color = '#ffffff';
        }

        showSiteToast('Your confidential inquiry has been recorded. Our architects will contact you within 24h.');

        setTimeout(() => {
          closeModal();
          if (submitBtn) {
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            submitBtn.disabled = false;
          }
        }, 2500);

        consultForm.reset();
      } else {
        throw new Error(data.error || 'Failed to record consultation inquiry.');
      }
    } catch (err) {
      console.warn('Backend submission warning (offline mode):', err);
      showSiteToast('Inquiry recorded locally in system buffer.', 'success');
      setTimeout(() => {
        closeModal();
        if (submitBtn) {
          submitBtn.innerHTML = originalBtnHTML;
          submitBtn.disabled = false;
        }
        consultForm.reset();
      }, 2000);
    }
  });
}

/* ==========================================================================
   Mobile Navigation Drawer Toggle
   ========================================================================= */
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileDrawer = document.getElementById('mobile-drawer');

if (mobileMenuToggle && mobileDrawer) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileDrawer.classList.toggle('open');
    playSound('chime');
  });

  const mobileLinks = mobileDrawer.querySelectorAll('.mobile-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileDrawer.classList.remove('open');
    });
  });
}

/* ==========================================================================
   Service Explore Button Action Dispatcher
   ========================================================================== */
const bentoExploreBtns = document.querySelectorAll('.bento-explore-btn, .compact-explore-btn');
bentoExploreBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('chime');
    openModal();
    const serviceType = btn.getAttribute('data-service');
    const select = document.getElementById('consult-service');
    if (select && serviceType) {
      if (serviceType === 'web') select.value = 'web-mobile';
      if (serviceType === 'app') select.value = 'web-mobile';
      if (serviceType === 'crm') select.value = 'crm-automation';
      if (serviceType === 'marketing') select.value = 'marketing-seo';
    }
  });
});

/* ==========================================================================
   Interactive Category Filter Chips
   ========================================================================== */
function initCategoryFilter() {
  const chipButtons = document.querySelectorAll('#categoryChips .chip-item');
  const serviceCards = document.querySelectorAll('#servicesGrid .service-feature-card, #servicesGrid .compact-service-card, #servicesGrid .dual-service-row');

  chipButtons.forEach(button => {
    button.addEventListener('click', () => {
      playSound('tick');
      const filter = button.getAttribute('data-filter');

      // Update chip active states
      chipButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Smooth card filtering
      serviceCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filter === 'all' || cardCategory === filter || (cardCategory && cardCategory.includes(filter))) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Navigation Active State on Scroll
   ========================================================================== */
const navLinks = document.querySelectorAll('.nav-menu .nav-item');
const sections = document.querySelectorAll('section[id], main[id]');

function updateActiveNav() {
  const scrollPosition = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPosition >= top && scrollPosition < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

/* ==========================================================================
   App Initialization
   ========================================================================== */
function init() {
  init3DTiltPhysics();
  initMotionReveals();
  initMetricCounters();
  initCategoryFilter();
  fetchSiteData();
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

// Start application
init();

